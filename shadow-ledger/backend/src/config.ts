// src/config.ts
import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  port:        parseInt(process.env.PORT || '4000', 10),
  jwtSecret:   required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin:  process.env.CORS_ORIGIN || 'http://localhost:3000',
  nodeEnv:     process.env.NODE_ENV || 'development',
};
