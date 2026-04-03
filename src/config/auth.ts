import { createAuth } from "kroxt";
import { createMongoAdapter, createRateLimitModel } from "kroxt/adapters/mongoose";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import { User } from "../features/user/user.model.js";

// The rate limit model is optional but recommended
const authAdapter = createMongoAdapter(User, createRateLimitModel(mongoose));

export const auth = createAuth({
  adapter: authAdapter,
  secret: process.env.JWT_SECRET || "85b966a72e041248d04f2f7adeaf0104949288121d708245382dcaf8572fa9f4",
  pepper: process.env.JWT_PEPPER || "",

  // Global Security Configurations
  session: {
    expires: "15m",
    refreshExpires: "7d",
    enforceStrictRevocation: true
  },

  // Custom JWT Payload logic
  jwt: {
    payload: (user: any, type: "access" | "refresh") => {
      if (type === "access") {
        return {
          role: user.role,
          // schoolId: user.schoolId 
        };
      }
      return {};
    }
  },

  rateLimit: {
    max: 100, // Requests per minute
    windowMs: 60 * 1000
  },
  ipBlocking: {
    maxStrikes: 5,
    blockDurationMs: 15 * 60 * 1000
  },
  passwordPolicy: {
    minLength: 6,
    requireUppercase: true,
    requireSpecialCharacter: true
  }
});
