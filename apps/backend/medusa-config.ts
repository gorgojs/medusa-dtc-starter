import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const redisUrl = process.env.REDIS_URL;
const isProd = process.env.NODE_ENV === "production";

const modules: Record<string, any> = {
  [Modules.NOTIFICATION]: {
    resolve: "@medusajs/medusa/notification",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/notification-local",
          id: "local",
          options: {
            name: "Local Notification Provider",
            channels: ["feed"],
          },
        },
        {
          resolve: "./src/modules/smtp-notification",
          id: "smtp",
          options: {
            channels: ["email"],
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
            secure: process.env.SMTP_SECURE === "true",
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            from: process.env.SMTP_FROM,
            reply_to: process.env.SMTP_REPLY_TO,
          },
        },
      ],
    },
  },
};

if (redisUrl) {
  modules[Modules.CACHE] = {
    resolve: "@medusajs/medusa/cache-redis",
    options: { redisUrl: process.env.CACHE_REDIS_URL || redisUrl },
  };
  modules[Modules.EVENT_BUS] = {
    resolve: "@medusajs/medusa/event-bus-redis",
    options: { redisUrl },
  };
  modules[Modules.WORKFLOW_ENGINE] = {
    resolve: "@medusajs/medusa/workflow-engine-redis",
    options: {
      redis: { url: redisUrl },
    },
  };
}

if (isProd && process.env.S3_BUCKET) {
  modules[Modules.FILE] = {
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/file-s3",
          id: "s3",
          options: {
            file_url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`,
            access_key_id: process.env.S3_ACCESS_KEY,
            secret_access_key: process.env.S3_SECRET_KEY,
            region: process.env.S3_REGION,
            bucket: process.env.S3_BUCKET,
            endpoint: process.env.S3_ENDPOINT,
            additional_client_config: { forcePathStyle: true },
          },
        },
      ],
    },
  };
}

modules[Modules.TRANSLATION] = {
  resolve: "@medusajs/medusa/translation"
}


module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      connection: { ssl: false },
    },
    redisUrl: redisUrl,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    cookieOptions: {
      sameSite: "lax" as const,
      secure: process.env.COOKIE_SECURE === "true",
    },
  },
  plugins: [
    {
      resolve: "@gorgo/medusa-integration",
      options: {
        encryptionKey: process.env.INTEGRATION_ENCRYPTION_KEY,
        providers: [],
      },
    },
  ],
  modules,
  featureFlags: {
    translation: true
  },
});
