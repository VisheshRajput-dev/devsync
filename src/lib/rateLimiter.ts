// Rate limiting utilities
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  // Check if request should be allowed
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.store[key];

    // Clean expired entries
    this.cleanup();

    if (!record || now > record.resetTime) {
      // Create new record
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  // Get remaining requests
  getRemaining(key: string): number {
    const record = this.store[key];
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  // Reset rate limit for a key
  reset(key: string): void {
    delete this.store[key];
  }
}

// Create rate limiter instances
export const codeChangeRateLimiter = new RateLimiter({
  maxRequests: 30, // 30 code changes
  windowMs: 1000, // per second
});

export const chatMessageRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 messages
  windowMs: 60000, // per minute
});

export const fileOperationRateLimiter = new RateLimiter({
  maxRequests: 20, // 20 operations
  windowMs: 60000, // per minute
});

// Content validation utilities
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_CODE_LENGTH = 500000; // 500k characters
export const MAX_FILE_NAME_LENGTH = 255;

// Validate file name
export const validateFileName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'File name cannot be empty' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length > MAX_FILE_NAME_LENGTH) {
    return { valid: false, error: `File name too long (max ${MAX_FILE_NAME_LENGTH} characters)` };
  }

  // Check for invalid characters (but allow forward slash for paths)
  const invalidChars = /[<>:"\\|?*\x00-\x1f]/;
  if (invalidChars.test(trimmedName)) {
    const foundInvalid = trimmedName.match(invalidChars);
    return { valid: false, error: `File name contains invalid characters: ${foundInvalid ? foundInvalid.join(', ') : 'invalid chars'}` };
  }

  // Check for dots only (like "..." or ".")
  if (/^\.+$/.test(trimmedName)) {
    return { valid: false, error: 'File name cannot be only dots' };
  }

  // Check for spaces at start/end
  if (name !== trimmedName) {
    return { valid: false, error: 'File name cannot have leading or trailing spaces' };
  }

  // Check for reserved names (Windows) - only check base name before extension
  const baseName = trimmedName.split('.')[0].toUpperCase();
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  if (reservedNames.includes(baseName)) {
    return { valid: false, error: `"${baseName}" is a reserved system name and cannot be used` };
  }

  // Check for ending with dot or space (Windows doesn't allow this)
  if (trimmedName.endsWith('.') || trimmedName.endsWith(' ')) {
    return { valid: false, error: 'File name cannot end with a dot or space' };
  }

  return { valid: true };
};

// Validate file content
export const validateFileContent = (content: string, fileName: string): { valid: boolean; error?: string } => {
  if (content.length > MAX_CODE_LENGTH) {
    return { valid: false, error: `File too large (max ${MAX_CODE_LENGTH} characters)` };
  }

  // Check for suspicious patterns (basic security)
  const suspiciousPatterns = [
    /eval\s*\(/i,
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
  ];

  // Only check for scripts in non-code files
  const isCodeFile = /\.(js|ts|jsx|tsx|py|java|cpp|c|cs|go|rs|rb|php)$/i.test(fileName);
  
  if (!isCodeFile) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        return { valid: false, error: 'File contains potentially unsafe content' };
      }
    }
  }

  return { valid: true };
};

// Validate file size
export const validateFileSize = (size: number): { valid: boolean; error?: string } => {
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds limit (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
  }
  return { valid: true };
};