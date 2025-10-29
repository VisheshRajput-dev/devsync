// Rate limiting for backend
class RateLimiter {
  constructor(config) {
    this.config = config;
    this.store = {};
  }

  isAllowed(key) {
    const now = Date.now();
    const record = this.store[key];

    // Clean expired entries
    this.cleanup();

    if (!record || now > record.resetTime) {
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

  cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }
}

// Create rate limiters
export const codeChangeRateLimiter = new RateLimiter({
  maxRequests: 50, // 50 code changes
  windowMs: 1000, // per second
});

export const chatMessageRateLimiter = new RateLimiter({
  maxRequests: 20, // 20 messages
  windowMs: 60000, // per minute
});

export const fileOperationRateLimiter = new RateLimiter({
  maxRequests: 30, // 30 operations
  windowMs: 60000, // per minute
});