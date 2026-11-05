/**
 * Safety switch for specs that create, approve or disburse records.
 * They only run when ALLOW_WRITES=1 is set, so a plain `npm test` never
 * changes data. Use on TEST systems only.
 */
export const writesAllowed = () => process.env.ALLOW_WRITES === '1';

export const WRITES_SKIP_MESSAGE =
  'Write flow skipped: set ALLOW_WRITES=1 to run it (test systems only).';
