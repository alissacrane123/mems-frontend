const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://3.20.231.158:8080/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;