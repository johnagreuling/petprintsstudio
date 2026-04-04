/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'fal.media' },
      { protocol: 'https', hostname: '**.fal.run' },
      { protocol: 'https', hostname: '**.astria.ai' },
    ],
  },
  // Allow up to 25MB file uploads
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: '210mb',
    },
  },
}
