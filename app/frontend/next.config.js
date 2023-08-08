module.exports = {
    async rewrites() {
      return [
            {
                source: '/ocbexapi/:path*',
                destination: 'http://127.0.0.1:5000/ocbexapi/:path*',
            },
        ];
    },
};

