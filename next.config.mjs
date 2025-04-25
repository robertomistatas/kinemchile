/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: 'undici'
    }
    return config
  }
}

export default nextConfig
