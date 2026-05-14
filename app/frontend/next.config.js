const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' data:",
    "frame-src 'self' blob:",
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
