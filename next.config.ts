import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/, /dynamic-css-manifest\.json$/],
  fallbacks: {
    document: '/offline.html',
    image: "", // or provide a fallback URL
    audio: "", // or provide a fallback URL
    video: "", // or provide a fallback URL
    font: "",  // or provide a fallback URL
  }
});

export default nextConfig;