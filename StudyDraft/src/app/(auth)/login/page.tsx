"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-[8px]">
        <CardHeader className="text-center">
          <Link href="/" className="font-polysans text-[22px] font-normal tracking-[-0.02em] text-carbon inline-block mb-4">
            StudyDraft
          </Link>
          <CardTitle className="font-polysans text-[32px] font-normal leading-[1.19] tracking-[-0.64px] text-carbon">Welcome back</CardTitle>
          <CardDescription className="font-inter text-[14px] text-slate">Sign in to your StudyDraft account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-[16px]">
            {error && (
              <div className="rounded-inputs bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-[8px]">
              <Label htmlFor="email" className="font-inter text-[14px] font-medium text-carbon">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-inputs"
              />
            </div>
            <div className="space-y-[8px]">
              <Label htmlFor="password" className="font-inter text-[14px] font-medium text-carbon">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-inputs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-[16px]">
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="flex items-center justify-between w-full font-inter text-[14px]">
              <Link
                href="/signup"
                className="text-slate hover:text-carbon transition-colors"
              >
                Don&apos;t have an account?
              </Link>
              <Link
                href="/forgot-password"
                className="text-slate hover:text-carbon transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
