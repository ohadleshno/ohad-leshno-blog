export function shouldEnableReview(nodeEnv: string | undefined, reviewParam: string | null): boolean {
  if (nodeEnv !== 'development') return false;
  if (reviewParam === 'false' || reviewParam === '0') return false;
  return true;
}
