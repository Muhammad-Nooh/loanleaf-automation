import type { Page, Request, Response, TestInfo } from '@playwright/test';

type JsonShape = string | JsonShape[] | { [key: string]: JsonShape };

export interface ApiObservation {
  application: 'loanleaf' | 'ciihive';
  module: string;
  trafficType: 'application-api' | 'external-browser-api';
  action: string;
  host: string;
  method: string;
  path: string;
  queryKeys: string[];
  requestHeaderNames: string[];
  requestPayloadShape?: JsonShape;
  status?: number;
  durationMs?: number;
  responseHeaderNames?: string[];
  responsePayloadShape?: JsonShape;
  errorResponseShape?: JsonShape;
  authenticationBehavior: 'refresh' | 'rejected' | 'session-request' | 'unknown';
  failed?: boolean;
  failureCode?: string;
}

export interface NetworkObserverContext {
  application: 'loanleaf' | 'ciihive';
  module: string;
}

const MAX_OBSERVATIONS = 500;
const MAX_SHAPE_DEPTH = 6;
const MAX_OBJECT_KEYS = 100;
const SENSITIVE_HEADER = /authorization|cookie|token|secret|api[-_]?key/i;
const KNOWN_BROWSER_DEPENDENCIES = new Set(['maps.googleapis.com']);

function safeHeaderNames(headers: Record<string, string>): string[] {
  return Object.keys(headers).filter((name) => !SENSITIVE_HEADER.test(name)).sort();
}

function safePath(pathname: string): string {
  return pathname
    .replace(/\/\d+(?=\/|$)/g, '/{id}')
    .replace(/\/[0-9a-f]{24}(?=\/|$)/gi, '/{id}')
    .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}(?=\/|$)/gi, '/{id}');
}

function endpointModule(application: 'loanleaf' | 'ciihive', pathname: string, contextModule: string): string {
  const prefix = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  const modules: Record<string, string> = {
    crm: 'Customer Registration',
    deposit: 'Deposit Operations',
    generalledger: 'General Ledger',
    loan: application === 'loanleaf' ? 'Loan Management' : 'Loan Origination',
    report: 'Workflow Inquiry',
    security: 'Security / Authentication',
    configuration: 'Configuration',
    notification: 'Notification',
    creditscoring: 'Credit Scoring',
  };
  return modules[prefix ?? ''] ?? contextModule;
}

function payloadShape(value: unknown, depth = 0): JsonShape {
  if (depth >= MAX_SHAPE_DEPTH) return '<max-depth>';
  if (value === null) return '<null>';
  if (Array.isArray(value)) {
    return value.length ? [payloadShape(value[0], depth + 1)] : [];
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .slice(0, MAX_OBJECT_KEYS)
      .map(([key, child]) => [key, payloadShape(child, depth + 1)] as const);
    const result = Object.fromEntries(entries) as { [key: string]: JsonShape };
    if (Object.keys(value).length > MAX_OBJECT_KEYS) result['<truncated>'] = '<more-keys>';
    return result;
  }
  return `<${typeof value}>`;
}

function requestPayloadShape(request: Request): JsonShape | undefined {
  const body = request.postData();
  if (!body) return undefined;
  const contentType = request.headers()['content-type'] ?? '';
  if (contentType.includes('application/json')) {
    try {
      return payloadShape(JSON.parse(body));
    } catch {
      return '<invalid-json>';
    }
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const fields = [...new URLSearchParams(body).keys()];
    return Object.fromEntries(fields.map((key) => [key, '<string>']));
  }
  return `<${contentType ? 'non-json-body' : 'untyped-body'}>`;
}

async function responsePayloadShape(response: Response): Promise<JsonShape | undefined> {
  const contentType = response.headers()['content-type'] ?? '';
  if (!contentType.includes('json')) return undefined;
  try {
    return payloadShape(await response.json());
  } catch {
    return '<unavailable-json>';
  }
}

function isApiRequest(request: Request): boolean {
  const type = request.resourceType();
  return (type === 'xhr' || type === 'fetch')
    && !new URL(request.url()).pathname.startsWith('/assets/');
}

export class NetworkObserver {
  private readonly observations: ApiObservation[] = [];
  private readonly requestObservations = new Map<Request, ApiObservation>();
  private readonly startedAt = new Map<Request, number>();
  private readonly pending: Promise<void>[] = [];
  private currentAction = 'page load';
  private droppedObservations = 0;
  private currentModule: string;

  constructor(
    private readonly page: Page,
    private readonly context: NetworkObserverContext,
  ) {
    this.currentModule = context.module;
  }

  start(): void {
    this.page.on('request', (request) => {
      if (!isApiRequest(request)) return;
      if (this.observations.length >= MAX_OBSERVATIONS) {
        this.droppedObservations += 1;
        return;
      }

      const url = new URL(request.url());
      const requestHeaders = request.headers();
      const isAuthRequest = /\/(auth|login|refreshtoken|token)(\/|$)/i.test(url.pathname);
      const hasSessionHeader = Object.keys(requestHeaders).some((name) => SENSITIVE_HEADER.test(name));
      const observation: ApiObservation = {
        application: this.context.application,
        module: endpointModule(this.context.application, url.pathname, this.currentModule),
        trafficType: KNOWN_BROWSER_DEPENDENCIES.has(url.hostname)
          ? 'external-browser-api'
          : 'application-api',
        action: this.currentAction,
        host: url.host,
        method: request.method(),
        path: safePath(url.pathname),
        queryKeys: [...new Set([...url.searchParams.keys()])].sort(),
        requestHeaderNames: safeHeaderNames(requestHeaders),
        requestPayloadShape: requestPayloadShape(request),
        authenticationBehavior: isAuthRequest ? 'refresh' : hasSessionHeader ? 'session-request' : 'unknown',
      };
      this.observations.push(observation);
      this.requestObservations.set(request, observation);
      this.startedAt.set(request, performance.now());
    });

    this.page.on('response', (response) => {
      const request = response.request();
      const observation = this.observationFor(request);
      if (!observation) return;
      const pending = (async () => {
        await response.finished();
        observation.status = response.status();
        observation.durationMs = Math.round(performance.now() - (this.startedAt.get(request) ?? performance.now()));
        observation.responseHeaderNames = safeHeaderNames(response.headers());
        observation.responsePayloadShape = await responsePayloadShape(response);
        if (response.status() === 401 || response.status() === 403) {
          observation.authenticationBehavior = 'rejected';
        }
        if (response.status() >= 400) {
          observation.errorResponseShape = observation.responsePayloadShape;
        }
      })();
      this.pending.push(pending);
    });

    this.page.on('requestfailed', (request) => {
      const observation = this.observationFor(request);
      if (!observation) return;
      observation.failed = true;
      const errorText = request.failure()?.errorText ?? '';
      observation.failureCode = /net::(ERR_[A-Z0-9_]+)/.exec(errorText)?.[1] ?? 'OTHER';
      observation.durationMs = Math.round(performance.now() - (this.startedAt.get(request) ?? performance.now()));
    });
  }

  async withAction<T>(label: string, operation: () => Promise<T>): Promise<T> {
    this.currentAction = label;
    return operation();
  }

  setModule(module: string): void {
    this.currentModule = module;
  }

  snapshot(): { capturedAt: string; droppedObservations: number; observations: ApiObservation[] } {
    return {
      capturedAt: new Date().toISOString(),
      droppedObservations: this.droppedObservations,
      observations: this.observations.map((observation) => ({ ...observation })),
    };
  }

  async attach(testInfo: TestInfo, name: string): Promise<void> {
    await Promise.all(this.pending);
    await testInfo.attach(name, {
      body: Buffer.from(JSON.stringify({
        ...this.snapshot(),
        redaction: 'Scalar payload values and header values are never retained.',
      }, null, 2)),
      contentType: 'application/json',
    });
  }

  private observationFor(request: Request): ApiObservation | undefined {
    return this.requestObservations.get(request);
  }
}
