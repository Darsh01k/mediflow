"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { FileText, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: "Reset link sent", description: "If an account with that email exists, you will receive a password reset link." });
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-50 dark:from-indigo-950/30 dark:via-gray-950 dark:to-purple-950/30" />
      <Card className="w-full max-w-md relative bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Forgot password?</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Sending..." : "Reset Password"}
            </Button>
            <div className="flex items-center justify-between w-full text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
