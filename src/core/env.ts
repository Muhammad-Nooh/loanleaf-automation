import 'dotenv/config';

/** Read a required environment variable or fail with a clear message. */
export function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const loanleaf = {
  get url() { return required('LOANLEAF_URL'); },
  get orgCode() { return required('LOANLEAF_ORG_CODE'); },
  get username() { return required('LOANLEAF_USERNAME'); },
  get password() { return required('LOANLEAF_PASSWORD'); },
};

export const ciihive = {
  get url() { return required('CIIHIVE_URL'); },
  get clientId() { return required('CIIHIVE_CLIENT_ID'); },
  get username() { return required('CIIHIVE_USERNAME'); },
  get password() { return required('CIIHIVE_PASSWORD'); },
};

/** Where each app's logged-in browser session is saved. */
export const AUTH_FILE = {
  loanleaf: '.auth/loanleaf.json',
  ciihive: '.auth/ciihive.json',
};
