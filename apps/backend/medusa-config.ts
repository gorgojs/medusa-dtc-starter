import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL

const modules: Record<string, any> = {}

if (redisUrl) {
  modules[Modules.CACHE] = {
    resolve: '@medusajs/medusa/cache-redis',
    options: { redisUrl: process.env.CACHE_REDIS_URL || redisUrl },
  }
  modules[Modules.EVENT_BUS] = {
    resolve: '@medusajs/medusa/event-bus-redis',
    options: { redisUrl },
  }
  modules[Modules.WORKFLOW_ENGINE] = {
    resolve: '@medusajs/medusa/workflow-engine-redis',
    options: { redis: { url: redisUrl } },
  }
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: redisUrl,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules,
})
