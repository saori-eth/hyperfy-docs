/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for Vercel deployment
  // Vercel will handle static optimization automatically
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig