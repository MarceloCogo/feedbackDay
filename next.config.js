/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'sqlite3': 'commonjs sqlite3'
      })
    }
    return config
  }
}

module.exports = nextConfig