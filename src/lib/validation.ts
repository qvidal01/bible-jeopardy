// Input validation utilities for Bible Jeopardy

/**
 * Validation constants
 */
export const VALIDATION = {
  PLAYER_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
  },
  TEAM_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
  },
  ROOM_CODE: {
    LENGTH: 6,
    PATTERN: /^[A-Z0-9]{6}$/,
  },
} as const;

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate player name
 */
export function validatePlayerName(name: string): {
  valid: boolean;
  error?: string;
} {
  const sanitized = sanitizeInput(name);

  if (!sanitized) {
    return { valid: false, error: 'Please enter your name' };
  }

  if (sanitized.length < VALIDATION.PLAYER_NAME.MIN_LENGTH) {
    return { valid: false, error: 'Name is too short' };
  }

  if (sanitized.length > VALIDATION.PLAYER_NAME.MAX_LENGTH) {
    return {
      valid: false,
      error: `Name must be ${VALIDATION.PLAYER_NAME.MAX_LENGTH} characters or less`,
    };
  }

  return { valid: true };
}

/**
 * Validate team name
 */
export function validateTeamName(name: string): {
  valid: boolean;
  error?: string;
} {
  const sanitized = sanitizeInput(name);

  if (!sanitized) {
    return { valid: false, error: 'Please enter a team name' };
  }

  if (sanitized.length > VALIDATION.TEAM_NAME.MAX_LENGTH) {
    return {
      valid: false,
      error: `Team name must be ${VALIDATION.TEAM_NAME.MAX_LENGTH} characters or less`,
    };
  }

  return { valid: true };
}

/**
 * Validate room code
 */
export function validateRoomCode(code: string): {
  valid: boolean;
  error?: string;
} {
  const normalized = code.toUpperCase().trim();

  if (!normalized) {
    return { valid: false, error: 'Please enter the room code' };
  }

  if (normalized.length !== VALIDATION.ROOM_CODE.LENGTH) {
    return { valid: false, error: 'Room code must be 6 characters' };
  }

  if (!VALIDATION.ROOM_CODE.PATTERN.test(normalized)) {
    return { valid: false, error: 'Room code can only contain letters and numbers' };
  }

  return { valid: true };
}

/**
 * Normalize room code to uppercase
 */
export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch {
    return false;
  }
}
