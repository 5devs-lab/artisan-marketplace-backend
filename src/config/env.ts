import dotenv from 'dotenv';
import path from 'path';

// Standard dotenv configuration
dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_PEPPER: string;
  CLIENT_URL: string;
  SERVER_URL: string;
  PAYSTACK_SECRET_KEY?: string;
  GMAIL_USER?: string;
  GMAIL_PASS?: string;
  TERMII_API_KEY?: string;
  TERMII_SENDER_ID?: string;
}

const getEnv = (): EnvConfig => {
  const envVars = {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_PEPPER: process.env.JWT_PEPPER || '',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    SERVER_URL: process.env.SERVER_URL || '',
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    TERMII_API_KEY: process.env.TERMII_API_KEY,
    TERMII_SENDER_ID: process.env.TERMII_SENDER_ID || 'Artisan',
  };

  const requiredVars: (keyof EnvConfig)[] = ['MONGO_URI', 'JWT_SECRET', 'JWT_PEPPER', 'SERVER_URL'];

  requiredVars.forEach((key) => {
    if (!envVars[key]) {
      // If variable is missing, first check if process.env has it but it's empty string
      const val = process.env[key];
      if (val === undefined) {
         throw new Error(`Environment variable ${key} is NOT DEFINED in process.env`);
      } else {
         throw new Error(`Environment variable ${key} is EMPTY in process.env`);
      }
    }
  });

  return envVars as EnvConfig;
};

export const config = getEnv();
export default config;
