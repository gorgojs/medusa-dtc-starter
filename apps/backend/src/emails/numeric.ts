/**
 * Money and quantity fields reach the email templates as Medusa `BigNumber`
 * instances rather than plain numbers, because the subscribers read them
 * through `query.graph` with `items.*`.
 *
 * Arithmetic and `Intl.NumberFormat` both coerce a `BigNumber` through its
 * `valueOf`, so they work by accident. React does not, and rendering one as a
 * child throws "Objects are not valid as a React child (found: object with keys
 * {numeric_, raw_, bignumber_})", which takes the whole notification down.
 *
 * Every numeric order field a template prints or formats goes through
 * `toNumber` first.
 */
export type NumericValue = number | { valueOf(): number };

export function toNumber(value: NumericValue | null | undefined): number;
export function toNumber(
  value: NumericValue | null | undefined,
  fallback: number,
): number;
export function toNumber(
  value: NumericValue | null | undefined,
  fallback = 0,
): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
