import { loadEnv, defineConfig } from '@medusajs/framework/utils';
import { Client } from 'pg';
import Redis from 'ioredis';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

if (process.env.NODE_ENV !== 'production') {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('REDIS_URL:', process.env.REDIS_URL);

  // Test PostgreSQL
  (async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('sslmode=require') 
        ? { rejectUnauthorized: true } 
        : undefined,
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
      tls: process.env.REDIS_URL.startsWith('rediss://') 
        ? { rejectUnauthorized: true } 
        : undefined,
    });
    try {
      const pong = await redis.ping();
      console.log('Redis connected successfully! Response:', pong);
      redis.disconnect();
    } catch (error) {
      console.error('Redis connection failed:', error.message);
    }
  })();
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:8000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:7001',
      authCors: process.env.AUTH_CORS || 'http://localhost:8000',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
});