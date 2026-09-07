/**
 * Converts an on-chain base-unit integer amount (e.g. Aave's raw `amount`
 * strings, which are always unsigned) into a human-readable decimal string
 * using exact BigInt arithmetic - large ERC-20 amounts (e.g. 18-decimal WETH)
 * exceed Number.MAX_SAFE_INTEGER, so floating point would silently corrupt them.
 */
export function normalizeBaseUnitAmount(rawAmount: string, decimals: number): string {
  const value = BigInt(rawAmount);

  if (decimals === 0) {
    return value.toString();
  }

  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = (value % divisor).toString().padStart(decimals, "0").replace(/0+$/, "");

  return fraction.length > 0 ? `${whole.toString()}.${fraction}` : whole.toString();
}

/**
 * Same as `normalizeBaseUnitAmount`, but for signed deltas (e.g. a net
 * exposure figure that can go negative) rather than the always-unsigned
 * amounts the subgraph returns.
 */
export function normalizeSignedBaseUnitAmount(rawAmount: bigint, decimals: number): string {
  const negative = rawAmount < BigInt(0);
  const magnitude = negative ? -rawAmount : rawAmount;
  const normalized = normalizeBaseUnitAmount(magnitude.toString(), decimals);

  return negative ? `-${normalized}` : normalized;
}
