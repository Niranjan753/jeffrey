"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, Suspense } from "react";
import { Loader2, ChevronLeft, PlayCircle } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDemoLogin = async () => {
    if (demoLoading) return;
    setDemoLoading(true);
    const demoEmail = "demo@wordmagic.com";
    const demoPassword = "password123";

    try {
      // Try to sign up first (in case it's a fresh database/memory)
      await signUp.email({
        email: demoEmail,
        password: demoPassword,
        name: "Demo Explorer",
        callbackURL: "/dashboard",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Welcome to the demo!");
            router.push("/dashboard");
          },
          onError: async (ctx) => {
            // If user already exists, just sign in
            if (ctx.error.message.includes("already exists") || ctx.error.status === 400 || ctx.error.status === 422) {
              await signIn.email({
                email: demoEmail,
                password: demoPassword,
                callbackURL: "/dashboard",
              }, {
                onSuccess: () => {
                  toast.success("Logged in as Demo User");
                  router.push("/dashboard");
                },
                onError: (ctx) => {
                  toast.error("Demo login failed: " + ctx.error.message);
                  setDemoLoading(false);
                }
              });
            } else {
              toast.error("Error: " + ctx.error.message);
              setDemoLoading(false);
            }
          }
        }
      });
    } catch (e) {
      setDemoLoading(false);
    }
  };

  // Auto-trigger demo login if ?demo=true is in URL
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      handleDemoLogin();
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 relative">
      <Link href="/" className="absolute top-8 left-8 p-4 rounded-full bg-white text-gray-400 hover:text-gray-600 transition-all z-50 shadow-sm border border-gray-100">
        <ChevronLeft size={32} />
      </Link>
      
      <Card className="max-w-md w-full shadow-2xl border-none ring-1 ring-gray-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back!</CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Login to save your progress and unlock rewards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Demo User Button */}
            <Button 
              variant="outline" 
              className="w-full h-14 border-2 border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-200 font-black text-lg gap-3 rounded-2xl transition-all group"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
            >
              {demoLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <PlayCircle className="group-hover:scale-110 transition-transform" size={24} />
                  TRY DEMO VERSION
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Or login with email</span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:ring-blue-500"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-bold text-gray-700">Password</Label>
                  <Link href="#" className="ml-auto inline-block text-sm font-bold text-blue-500 hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-gray-200 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  className="rounded-md border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <Label htmlFor="remember" className="text-sm font-bold text-gray-500 cursor-pointer">Remember me</Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-black rounded-xl transition-all active:scale-[0.98]"
                disabled={loading || demoLoading}
                onClick={async () => {
                  await signIn.email(
                    { email, password },
                    {
                     
                      onRequest: () => setLoading(true),
                      onResponse: () => setLoading(false),
                       //@ts-ignore
                      onError: (ctx) => toast.error(ctx.error.message),
                      onSuccess: () => {
                        toast.success("Successfully logged in!");
                        router.push("/dashboard");
                      }
                    }
                  );
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "LOGIN"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SocialButton 
                provider="google" 
                onClick={async () => {
                  await signIn.social({ provider: "google", callbackURL: "/dashboard" }, {
                    onRequest: () => setLoading(true),
                    onResponse: () => setLoading(false)
                  });
                }}
                disabled={loading || demoLoading}
              />
              <SocialButton 
                provider="github" 
                onClick={async () => {
                  await signIn.social({ provider: "github", callbackURL: "/dashboard" }, {
                    onRequest: () => setLoading(true),
                    onResponse: () => setLoading(false)
                  });
                }}
                disabled={loading || demoLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-gray-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-blue-500 font-bold hover:underline transition-all">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
      <SignInContent />
    </Suspense>
  );
}

function SocialButton({ provider, onClick, disabled }: { provider: "google" | "github", onClick: () => void, disabled: boolean }) {
  return (
    <Button 
      variant="outline" 
      className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 gap-2 font-bold" 
      onClick={onClick} 
      disabled={disabled}
    >
      {provider === "google" ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 262">
          <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
          <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
          <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
          <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"></path>
        </svg>
      )}
      {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </Button>
  );
}
