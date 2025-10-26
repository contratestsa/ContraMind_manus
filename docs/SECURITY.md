# Security Configuration

This document describes the comprehensive security implementation in ContraMind.ai.

## Overview

The application implements multiple layers of security protection through the `server/_core/security.ts` module:

1. **Security Headers** (via Helmet)
2. **CORS Protection** with allowlist
3. **Rate Limiting** per endpoint
4. **HTTP Parameter Pollution (HPP) Protection**
5. **Request Body Size Limits**

## Security Headers

### Helmet Configuration

The application uses [Helmet](https://helmetjs.github.io/) to set secure HTTP headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS for 1 year |
| `Content-Security-Policy` | See CSP section | Prevents XSS and injection attacks |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `X-DNS-Prefetch-Control` | `off` | Disables DNS prefetching |
| `X-Download-Options` | `noopen` | Prevents IE from executing downloads |
| `X-Permitted-Cross-Domain-Policies` | `none` | Restricts Flash/PDF cross-domain |
| `X-XSS-Protection` | `0` | Disables legacy XSS filter (CSP is better) |
| `Cross-Origin-Resource-Policy` | `same-origin` | Restricts resource loading |

### Content Security Policy (CSP)

The CSP configuration restricts where resources can be loaded from:

```javascript
{
  "default-src": ["'self'"],
  "img-src": ["'self'", "data:"],
  "script-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "connect-src": ["'self'", "https://app.posthog.com", "https:", "wss:"],
  "frame-ancestors": ["'self'"],
  "upgrade-insecure-requests": []
}
```

**Directives:**
- **default-src**: Only load resources from same origin
- **img-src**: Images from same origin or data URIs
- **script-src**: Scripts only from same origin (no inline scripts)
- **style-src**: Styles from same origin + inline styles (for UI libraries)
- **connect-src**: API calls to same origin, PostHog, and HTTPS/WSS
- **frame-ancestors**: Can only be framed by same origin
- **upgrade-insecure-requests**: Automatically upgrade HTTP to HTTPS

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured with an allowlist approach:

### Environment Variable

```bash
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

### Behavior

- **Same-origin requests**: Always allowed (no `Origin` header)
- **Allowlisted origins**: Allowed if in `ALLOWED_ORIGINS`
- **Other origins**: Blocked with CORS error

### Configuration

```javascript
{
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin
    if (allowlist.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}
```

## Rate Limiting

Rate limiting protects against abuse and DDoS attacks using [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit).

### Global API Rate Limit

**Endpoint:** `/api/*`  
**Default:** 300 requests per 15 minutes  
**Environment Variable:** `RATE_LIMIT_GLOBAL`

```bash
RATE_LIMIT_GLOBAL=300
```

### Authentication Rate Limit

**Endpoint:** `/api/auth/*`  
**Default:** 5 requests per minute  
**Environment Variable:** `RATE_LIMIT_LOGIN_PER_MINUTE`

```bash
RATE_LIMIT_LOGIN_PER_MINUTE=5
```

**Purpose:** Prevents brute-force login attacks

### Upload Rate Limit

**Endpoint:** `/api/upload/*`  
**Default:** 30 requests per 15 minutes  
**Environment Variable:** `RATE_LIMIT_UPLOAD_PER_15MIN`

```bash
RATE_LIMIT_UPLOAD_PER_15MIN=30
```

**Purpose:** Prevents storage abuse

### Webhook Rate Limit

**Endpoint:** `/api/payments/webhook/*`  
**Default:** 60 requests per 15 minutes  
**Environment Variable:** `RATE_LIMIT_WEBHOOK_PER_15MIN`

```bash
RATE_LIMIT_WEBHOOK_PER_15MIN=60
```

**Purpose:** Protects webhook endpoints from spam

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "error": "Too many requests, please try again later."
}
```

**Status Code:** `429 Too Many Requests`

**Headers:**
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Timestamp when limit resets

## HTTP Parameter Pollution (HPP)

[HPP protection](https://github.com/analog-nico/hpp) prevents attacks that exploit duplicate parameter names:

### Attack Example

```
GET /api/contracts?id=123&id=456
```

Without HPP protection, this could cause unexpected behavior. HPP middleware ensures only the last value is used.

### Configuration

```javascript
app.use(hpp());
```

## Request Body Size Limits

Limits prevent memory exhaustion attacks:

### Environment Variable

```bash
REQUEST_BODY_LIMIT=1mb
```

### Default

- **JSON bodies**: 1 MB
- **URL-encoded bodies**: 1 MB

### Configuration

```javascript
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: false, limit: bodyLimit }));
```

For file uploads, increase the limit:

```bash
REQUEST_BODY_LIMIT=10mb
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | (empty) | Comma-separated list of allowed CORS origins |
| `REQUEST_BODY_LIMIT` | `1mb` | Maximum request body size |
| `RATE_LIMIT_GLOBAL` | `300` | Global API requests per 15 minutes |
| `RATE_LIMIT_LOGIN_PER_MINUTE` | `5` | Auth requests per minute |
| `RATE_LIMIT_UPLOAD_PER_15MIN` | `30` | Upload requests per 15 minutes |
| `RATE_LIMIT_WEBHOOK_PER_15MIN` | `60` | Webhook requests per 15 minutes |

## Testing Security

### 1. Test Security Headers

```bash
curl -I https://your-app.com/api/health
```

Verify headers:
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`

### 2. Test CORS

```bash
# Should succeed (same-origin)
curl -X GET https://your-app.com/api/health

# Should fail (cross-origin, not allowlisted)
curl -X GET https://your-app.com/api/health \
  -H "Origin: https://evil.com"
```

### 3. Test Rate Limiting

```bash
# Send 10 requests rapidly
for i in {1..10}; do
  curl https://your-app.com/api/health
done

# Check rate limit headers
curl -I https://your-app.com/api/health | grep RateLimit
```

### 4. Test Body Size Limit

```bash
# Should fail (body too large)
curl -X POST https://your-app.com/api/test \
  -H "Content-Type: application/json" \
  -d "$(python3 -c 'print("x" * 2000000)')"
```

## Security Best Practices

### 1. Configure ALLOWED_ORIGINS

Always set `ALLOWED_ORIGINS` in production:

```bash
# ❌ Bad: Empty (allows all origins in development)
ALLOWED_ORIGINS=

# ✅ Good: Specific origins
ALLOWED_ORIGINS=https://app.contramind.ai,https://admin.contramind.ai
```

### 2. Adjust Rate Limits

Tune rate limits based on usage patterns:

```bash
# High-traffic API
RATE_LIMIT_GLOBAL=1000

# Stricter auth protection
RATE_LIMIT_LOGIN_PER_MINUTE=3

# Allow more uploads for premium users (implement custom logic)
RATE_LIMIT_UPLOAD_PER_15MIN=100
```

### 3. Monitor Rate Limit Violations

Log rate limit violations for security monitoring:

```javascript
app.use("/api", rateLimit({
  ...config,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded: ${req.ip} - ${req.path}`);
    res.status(429).json({ error: "Too many requests" });
  }
}));
```

### 4. Use HTTPS in Production

Ensure `Strict-Transport-Security` is effective:

```bash
# Redirect HTTP to HTTPS (in reverse proxy)
server {
  listen 80;
  return 301 https://$host$request_uri;
}
```

### 5. Review CSP Violations

Monitor CSP violations to detect attacks:

```javascript
contentSecurityPolicy: {
  directives: {
    ...
    "report-uri": ["/api/csp-report"]
  }
}
```

## Common Issues

### Issue: CORS Blocking Legitimate Requests

**Symptom:** `Not allowed by CORS` error

**Solution:** Add origin to `ALLOWED_ORIGINS`:

```bash
ALLOWED_ORIGINS=https://your-frontend.com
```

### Issue: Rate Limit Too Strict

**Symptom:** `429 Too Many Requests` for normal usage

**Solution:** Increase rate limit:

```bash
RATE_LIMIT_GLOBAL=500
```

### Issue: CSP Blocking Resources

**Symptom:** Browser console shows CSP violations

**Solution:** Update CSP directives in `security.ts`:

```javascript
"img-src": ["'self'", "data:", "https://cdn.example.com"]
```

### Issue: Body Size Limit Too Small

**Symptom:** `413 Payload Too Large` for file uploads

**Solution:** Increase body limit:

```bash
REQUEST_BODY_LIMIT=10mb
```

## Security Checklist

- [ ] Set `ALLOWED_ORIGINS` for production
- [ ] Configure rate limits based on usage
- [ ] Enable HTTPS and HSTS
- [ ] Review CSP directives for your app
- [ ] Monitor rate limit violations
- [ ] Test CORS with different origins
- [ ] Verify security headers with curl
- [ ] Set appropriate body size limits
- [ ] Implement logging for security events
- [ ] Regularly update dependencies

## References

- [Helmet Documentation](https://helmetjs.github.io/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Last Updated:** October 27, 2025  
**Maintained By:** ContraMind.ai Development Team

