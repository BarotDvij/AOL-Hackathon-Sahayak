/** Accept only canonical same-origin return paths for sign-in and OAuth consent. */
export function oauthReturnPath(value: unknown): string {
  // eslint-disable-next-line no-control-regex -- control characters are rejected on purpose
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/me";
  const origin = "https://app.invalid";
  try {
    const target = new URL(value, origin);
    if (target.origin !== origin || target.pathname.startsWith("//")) return "/me";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/me";
  }
}
