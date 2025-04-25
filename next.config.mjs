/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: require.resolve('undici')
    }
    return config
  }
}

export default nextConfig
