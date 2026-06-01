import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions estão estáveis no Next.js 15, sem necessidade de flag
  },
}

export default nextConfig
