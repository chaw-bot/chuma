export const PHONE_AUTH_DOMAIN = '@phone.chuma.app';

export function sanitizeAmountInput(rawValue: string): string {
  const cleaned = rawValue.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');

  if (rest.length === 0) {
    return whole;
  }

  return `${whole}.${rest.join('').slice(0, 2)}`;
}

export function parseAmount(rawValue: string): number | null {
  if (!rawValue.trim()) {
    return null;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

export function normalizeZmPhone(rawPhone: string): string | null {
  const digitsOnly = rawPhone.replace(/\D/g, '');
  if (!digitsOnly) {
    return null;
  }

  let normalized = digitsOnly;

  if (normalized.length === 9) {
    normalized = `260${normalized}`;
  } else if (normalized.length === 10 && normalized.startsWith('0')) {
    normalized = `260${normalized.slice(1)}`;
  }

  if (normalized.length !== 12 || !normalized.startsWith('260')) {
    return null;
  }

  return normalized;
}

export function phoneToFirebaseEmail(rawPhone: string): string | null {
  const normalized = normalizeZmPhone(rawPhone);
  if (!normalized) {
    return null;
  }

  return `${normalized}${PHONE_AUTH_DOMAIN}`;
}

export function firebaseEmailToPhone(email?: string | null): string | null {
  if (!email || !email.endsWith(PHONE_AUTH_DOMAIN)) {
    return null;
  }

  const digits = email.slice(0, -PHONE_AUTH_DOMAIN.length);
  if (!/^\d+$/.test(digits)) {
    return null;
  }

  return `+${digits}`;
}

export function getUserDisplayName(
  user?: {
    displayName?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
  } | null
): string {
  const phoneFromEmail = firebaseEmailToPhone(user?.email);
  const fallback = user?.displayName ?? user?.phoneNumber ?? phoneFromEmail ?? user?.email;

  if (!fallback) {
    return 'Chuma User';
  }

  if (fallback.startsWith('+')) {
    return fallback;
  }

  return fallback.split('@')[0];
}
