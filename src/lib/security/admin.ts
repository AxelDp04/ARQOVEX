export function getConfiguredAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';

  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  const normalized = email?.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return getConfiguredAdminEmails().includes(normalized);
}
