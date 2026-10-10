import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_SECONDS = 8 * 60 * 60;

interface EmployeeSession {
  employeeCode: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', getSecret())
    .update(value)
    .digest('base64url');
}

export function createEmployeeSession(employeeCode: string): string {
  const payload: EmployeeSession = {
    employeeCode,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifyEmployeeSession(token: string): EmployeeSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encoded, signature] = parts;
    const expected = Buffer.from(sign(encoded), 'base64url');
    const actual = Buffer.from(signature, 'base64url');

    if (
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8'),
    ) as EmployeeSession;

    if (
      typeof payload.employeeCode !== 'string' ||
      !payload.employeeCode ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
