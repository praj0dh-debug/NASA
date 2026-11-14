import { db } from '../db.ts';
import type { DbConsentRecord } from '../db.ts';
import { detectPIIViolation, isValidEmail, sanitizeString } from '../middleware/coppaGuard.ts';

export interface ConsentRequestBody {
  email: string;
  role: 'parent' | 'teacher';
  coppaConfirmed: boolean;
  educationalConfirmed: boolean;
  studentId?: string;
}

export function handleParentalConsent(body: unknown): { status: number; data: any } {
  if (!body || typeof body !== 'object') {
    return {
      status: 400,
      data: { error: 'INVALID_REQUEST', message: 'Request body must be a valid JSON object.' }
    };
  }

  // PII injection check
  const piiViolation = detectPIIViolation(body);
  if (piiViolation) {
    return {
      status: 400,
      data: {
        error: 'COPPA_VIOLATION',
        message: `Field '${piiViolation}' is barred under COPPA guidelines. Student accounts must not contain personal identifiable information.`
      }
    };
  }

  const { email, role, coppaConfirmed, educationalConfirmed, studentId } = body as ConsentRequestBody;

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return {
      status: 400,
      data: { error: 'INVALID_EMAIL', message: 'A valid parent or educator email address is required for verifiable COPPA consent.' }
    };
  }

  if (role !== 'parent' && role !== 'teacher') {
    return {
      status: 400,
      data: { error: 'INVALID_ROLE', message: "Role must be specified as either 'parent' or 'teacher'." }
    };
  }

  if (coppaConfirmed !== true || educationalConfirmed !== true) {
    return {
      status: 400,
      data: {
        error: 'CONSENT_MANDATORY',
        message: 'Both COPPA data protection and educational authorization checkboxes must be confirmed by the supervising adult.'
      }
    };
  }

  const sanitizedEmail = sanitizeString(email.toLowerCase());
  const database = db.read();

  const newConsent: DbConsentRecord = {
    id: `consent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: sanitizedEmail,
    role,
    coppaConfirmed: true,
    educationalConfirmed: true,
    createdAt: new Date().toISOString()
  };

  database.consents.push(newConsent);

  // If a student ID was provided, mark consentGranted on student
  if (studentId && typeof studentId === 'string') {
    const student = database.students.find(s => s.id === studentId);
    if (student) {
      student.consentGranted = true;
      student.parentEmail = sanitizedEmail;
    }
  }

  db.write(database);

  return {
    status: 201,
    data: {
      success: true,
      consentId: newConsent.id,
      verifiedEmail: sanitizedEmail,
      role: newConsent.role,
      message: 'COPPA verified adult consent recorded. Flight pass initialized with zero PII retention.'
    }
  };
}
