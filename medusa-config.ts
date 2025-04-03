import { loadEnv, defineConfig } from '@medusajs/framework/utils';
import { Client } from 'pg';
import Redis from 'ioredis';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('REDIS_URL:', process.env.REDIS_URL);

// Test PostgreSQL
(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    console.log('Database connected successfully!');
    await client.end();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
})();

// Test Redis
(async () => {
  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL is not defined in .env');
    return;
  }
  const redis = new Redis(process.env.REDIS_URL, {
    tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined, // Support SSL
  });
  try {
    const pong = await redis.ping();
    console.log('Redis connected successfully! Response:', pong);
    redis.disconnect();
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  }
})();

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
});