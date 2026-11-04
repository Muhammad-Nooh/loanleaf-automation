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
