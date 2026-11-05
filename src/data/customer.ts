/** Fresh, unique test data for each run. */
function digits(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

const FIRST = ['Ali', 'Ahmed', 'Bilal', 'Hamza', 'Usman', 'Zain'];
const LAST = ['Khan', 'Malik', 'Butt', 'Sheikh', 'Raza', 'Qureshi'];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export interface TestCustomer {
  firstName: string;
  lastName: string;
  cnic: string;   // 13 digits
  mobile: string; // 03XXXXXXXXX
}

export function newCustomer(): TestCustomer {
  // "Auto" prefix makes generated records easy to spot and clean up.
  return {
    firstName: `Auto${pick(FIRST)}`,
    lastName: `${pick(LAST)}${digits(3)}`,
    cnic: digits(13),
    mobile: `03${digits(9)}`,
  };
}

// ---------------------------------------------------------------------------
// LoanLeaf customer (Bahrain CPR, bilingual names). Values are fresh per run.
// ---------------------------------------------------------------------------
const letters = (n: number) =>
  Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('');
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export interface LoanLeafCustomer {
  /** 9 digits (the recording only saved with 9). */
  cpr: string;
  first: string;
  middle1: string;
  middle2: string;
  last: string;
  mother: string;
  email: string;
  phone: string;
  placeOfBirth: string;
  dob: string;
  expiry: string;
}

export function newLoanLeafCustomer(): LoanLeafCustomer {
  return {
    cpr: digits(9),
    first: `Auto${cap(letters(5))}`,
    middle1: cap(letters(5)),
    middle2: cap(letters(5)),
    last: cap(letters(6)),
    mother: cap(letters(6)),
    email: `auto.${letters(8)}@example.com`,
    phone: `06${digits(10)}`,
    placeOfBirth: 'Manama',
    dob: '2003-06-17',
    expiry: '2030-06-05',
  };
}
