import { loadEnv, defineConfig } from '@medusajs/framework/utils';
import { Client } from 'pg';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Test connection
(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon uses self-signed certs
  });
  try {
    await client.connect();
    console.log('Database connected successfully!');
    await client.end();
  } catch (error) {
    console.error('Database connection failed:', error.message);
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