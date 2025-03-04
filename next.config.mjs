/*
<ai_context>
Configures Next.js for the app.
</ai_context>
*/

import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }]
  }
}

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  sw: '/sw.js',
  publicExcludes: ['!icons/**/*']
})(nextConfig)

export default pwaConfig
