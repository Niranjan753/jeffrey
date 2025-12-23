import { betterAuth } from 'better-auth';

export const auth = betterAuth({
    database: {
        provider: "postgres",
        url: process.env.DATABASE_URL || "",
    },
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
    // Production secret
    secret: process.env.BETTER_AUTH_SECRET || "a-very-long-and-secure-random-secret-for-development",
    
    // Automatically detect the current URL for Vercel Previews and Production
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
