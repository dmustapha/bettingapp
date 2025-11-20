/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Suppress warnings for expected missing modules in wallet SDKs
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/@walletconnect/ },
      { module: /node_modules\/@reown/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
