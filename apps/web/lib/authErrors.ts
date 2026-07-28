const MESSAGES: Record<string, string> = {
  "auth/network-request-failed": "Connection trouble — check your internet and try again.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-not-found": "No account found with that email. Try signing up instead.",
  "auth/wrong-password": "Incorrect password. Try again.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with that email already exists. Try logging in instead.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts — wait a moment and try again.",
};

export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  return err instanceof Error ? err.message : "Something went wrong";
}
