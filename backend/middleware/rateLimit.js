const createRateLimiter = ({
  windowMs = 60_000,
  max = 30,
  message = "Too many requests. Please slow down and try again shortly.",
} = {}) => {
  const buckets = new Map();

  return (req, res, next) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const key = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : (forwardedFor || req.ip || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.set("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      return res.status(429).json({ error: message });
    }

    return next();
  };
};

module.exports = { createRateLimiter };
