import * as fs from 'fs';
import * as path from 'path';

/**
 * State handed from one step of the chain to the next (and between the two
 * apps). Stored in run-state/chain.json (gitignored), so a later step can be
 * re-run on its own against the last chain.
 */
export interface ChainState {
  runId: string;
  customer?: { firstName: string; lastName: string; idNumber: string; customerNo?: string };
  loan?: { product: string; amount: number; applicationNo?: string; accountNo?: string; approved?: boolean };
  disbursement?: { amount: number; reference?: string; saved?: boolean; authorized?: boolean };
}

const FILE = path.join('run-state', 'chain.json');

export function loadChain(): ChainState {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8')) as ChainState;
  } catch {
    throw new Error('No run-state/chain.json yet. Run the earlier steps of the flow first.');
  }
}

export function saveChain(state: ChainState) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}

/** Start a fresh chain (first step only). */
export function newChain(): ChainState {
  const state: ChainState = { runId: new Date().toISOString().replace(/[:.]/g, '-') };
  saveChain(state);
  return state;
}

/** Merge new facts into the current chain. */
export function updateChain(patch: Partial<ChainState>): ChainState {
  const cur = loadChain();
  const next: ChainState = { ...cur, ...patch };
  for (const k of ['customer', 'loan', 'disbursement'] as const) {
    if (patch[k]) (next as any)[k] = { ...(cur[k] as object), ...(patch[k] as object) };
  }
  saveChain(next);
  return next;
}

/** Get a value the earlier steps must have produced, or fail with a clear message. */
export function need<T>(value: T | undefined, what: string): T {
  if (value === undefined || value === null || value === ('' as unknown as T)) {
    throw new Error(`Chain is missing "${what}". Run the earlier step that produces it.`);
  }
  return value;
}
