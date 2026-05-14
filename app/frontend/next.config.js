const csp = [
    "default-src 'self'",
    // 'unsafe-eval' is required by PyGwalker, which uses eval() internally to execute its JS bundle.
    // The risk is limited because PyGwalker output runs inside a sandboxed iframe (srcDoc).
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' data:",
    "frame-src 'self' blob:",
    // PyGwalker spawns Web Workers from blob: URLs for its compute engine
    "worker-src blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
].join('; ');

module.exports = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options',  value: 'nosniff' },
                    { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
                    { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                    { key: 'Content-Security-Policy',  value: csp },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/ocbexapi/:path*',
                destination: 'http://127.0.0.1:5000/ocbexapi/:path*',
            },
        ];
    },
};
