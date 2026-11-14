// COPPA Security Middleware & Data Sanitizer

// List of forbidden PII fields strictly barred under COPPA
const FORBIDDEN_PII_KEYS = [
  'fullname',
  'full_name',
  'realname',
  'real_name',
  'firstname',
  'lastname',
  'phone',
  'phonenumber',
  'telephone',
  'address',
  'street',
  'city',
  'zipcode',
  'postalcode',
  'ssn',
  'socialsecurity',
  'birthday',
  'birthdate',
  'dob',
  'photo',
  'image_url',
  'avatar_url'
];

/**
 * Recursively scans an object for any key that matches forbidden PII.
 * Returns the forbidden key name if found, or null if clean.
 */
export function detectPIIViolation(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const violation = detectPIIViolation(item);
      if (violation) return violation;
    }
    return null;
  }

  const record = data as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    if (FORBIDDEN_PII_KEYS.includes(normalizedKey)) {
      return key;
    }

    if (typeof record[key] === 'object' && record[key] !== null) {
      const nested = detectPIIViolation(record[key]);
      if (nested) return nested;
    }
  }

  return null;
}

/**
 * Sanitizes strings against XSS and HTML injection.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validates standard email address using RFC 5322 compatible regex.
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}
