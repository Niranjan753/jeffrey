import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const getDatabase = () => {
    // Check if we have a Postgres DATABASE_URL (for production/deployment)
    if (process.env.DATABASE_URL) {
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
        });
    }
    
    // FALLBACK: Use In-Memory storage for local development.
    // This fixes the "bun:sqlite" and "better-sqlite3" errors.
    // Note: Users created locally will be lost when the server restarts.
    return undefined;
};

export const auth = betterAuth({
    database: getDatabase(),
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(data, request) {
            // Send an email to the user with a link to reset their password
        },
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
    // This is required for deployment to work correctly
    secret: process.env.BETTER_AUTH_SECRET || "a-very-long-and-secure-random-secret-for-development",
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL!,
        `https://${process.env.VERCEL_URL}`,
        "https://jeffrey-alpha.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001"
    ].filter(Boolean),
});
