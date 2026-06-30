/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy all /flask/* calls to the Flask backend
  async rewrites() {
    return [
      {
        source: "/flask/:path*",
        destination: `${process.env.FLASK_INTERNAL_URL ?? "http://localhost:5000"}/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  images: {
    domains: ["logo.clearbit.com"],
  },
};

export default nextConfig;
