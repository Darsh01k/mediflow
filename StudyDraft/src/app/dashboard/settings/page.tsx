"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Settings, Trash2, Loader2, User, Cpu, FileDown } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function handleDeleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion is not yet implemented.");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-indigo-500" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user?.name || ""} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} readOnly className="bg-muted/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cpu className="h-5 w-5 text-indigo-500" /> AI Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-model">Default AI Model</Label>
            <Select>
              <SelectTrigger id="ai-model"><SelectValue placeholder="Select a model" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Choose which AI provider to use for generating reports.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileDown className="h-5 w-5 text-indigo-500" /> Export Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-format">Default Export Format</Label>
            <Select>
              <SelectTrigger id="default-format"><SelectValue placeholder="Select format" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Set your preferred export format for downloads.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-destructive/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2 text-lg">
            <Trash2 className="h-5 w-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="destructive" className="gap-2" onClick={handleDeleteAccount}>
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
