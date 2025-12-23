import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

export const auth = betterAuth({
    // Explicitly initializing the database connection pool
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    }),

    rateLimit: {
        enabled: false,
    },

    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy"
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "dummy",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy"
        }
    },
    
    secret: process.env.BETTER_AUTH_SECRET || "a-very-long-and-secure-random-secret-for-development",
    
    baseURL: process.env.BETTER_AUTH_URL || 
             (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) || 
             process.env.NEXT_PUBLIC_APP_URL || 
             "http://localhost:3000",

    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL!,
        process.env.BETTER_AUTH_URL!,
        `https://${process.env.VERCEL_URL}`,
        "https://jeffrey-alpha.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001"
    ].filter(Boolean),
});
