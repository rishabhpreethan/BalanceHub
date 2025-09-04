import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

// Provide a safe no-op client if REDIS_URL is not configured
function createSafeRedis() {
  let warned = false
  const warn = () => {
    if (!warned && process.env.NODE_ENV !== 'test') {
      warned = true
      console.warn('[redis] REDIS_URL not set - Redis features disabled (using no-op client)')
    }
  }
  return {
    publish: async (_channel: string, _message: string) => {
      warn()
      return 0
    },
    get: async (_key: string) => {
      warn()
      return null as string | null
    },
    set: async (_key: string, _value: string) => {
      warn()
      return 'OK'
    }
  } as unknown as Redis
}

const client: Redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : createSafeRedis()

export const redis = globalForRedis.redis ?? client

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
