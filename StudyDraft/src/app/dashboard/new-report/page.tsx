"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Sparkles, Minus, Plus } from "lucide-react";

export default function NewReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [pageCount, setPageCount] = useState(5);
  const [academicLevel, setAcademicLevel] = useState("college");
  const [tone, setTone] = useState("formal");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ remaining: number; usageCount: number } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/usage")
        .then((res) => res.json())
        .then((data) => { if (data.remaining !== undefined) setUsageInfo(data); })
        .catch(() => {});
    }
  }, [status]);

  function adjustPageCount(delta: number) {
    setPageCount((prev) => Math.min(50, Math.max(1, prev + delta)));
  }

  async function handleGenerateSubtopics() {
    if (!topic.trim()) {
      toast({ title: "Topic is required", description: "Please enter a topic for your report.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subtopics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), pageCount, academicLevel, tone, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to generate subtopics.", variant: "destructive" });
        return;
      }
      sessionStorage.setItem("generatedSubtopics", JSON.stringify(data));
      sessionStorage.setItem("reportFormData", JSON.stringify({ topic: topic.trim(), pageCount, academicLevel, tone, language }));
      router.push("/dashboard/subtopics");
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-[640px] mx-auto px-4 py-[40px]">
      <div className="mb-[20px]">
        <h1 className="font-polysans text-[32px] font-normal leading-[1.19] tracking-[-0.64px] text-carbon">Create New Report</h1>
        <p className="font-inter text-[16px] text-graphite mt-[4px]">Fill in the details below to generate subtopics for your report.</p>
      </div>

      <Card className="p-[8px]">
        <CardHeader>
          <CardTitle className="font-polysans text-[24px] font-normal tracking-[-0.02em]">Report Details</CardTitle>
          <CardDescription className="font-inter text-[14px] text-slate">Configure the topic and preferences for your AI-generated report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-[16px]">
          {usageInfo !== null && (
            <div className="flex items-center gap-2 rounded-inputs bg-fog px-4 py-3 font-inter text-[14px]">
              <AlertCircle className="h-4 w-4 text-signal-orange" />
              <span className="text-graphite">{usageInfo.remaining} generations remaining today</span>
            </div>
          )}

          <div className="space-y-[8px]">
            <Label htmlFor="topic" className="font-inter text-[14px] font-medium text-carbon">Topic</Label>
            <Input id="topic" placeholder="Enter your report topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>

          <div className="space-y-[8px]">
            <Label className="font-inter text-[14px] font-medium text-carbon">Number of Pages</Label>
            <div className="flex items-center gap-[12px]">
              <button
                onClick={() => adjustPageCount(-1)}
                disabled={pageCount <= 1}
                className="h-[36px] w-[36px] rounded-full border border-chalk flex items-center justify-center hover:bg-fog transition-colors disabled:opacity-30"
              >
                <Minus className="h-[14px] w-[14px] text-carbon" />
              </button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={pageCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) setPageCount(Math.min(50, Math.max(1, v)));
                  }}
                  className="w-[60px] text-center font-polysans text-[32px] font-normal leading-[1.19] text-carbon bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="font-inter text-[13px] text-slate">pages</div>
              </div>
              <button
                onClick={() => adjustPageCount(1)}
                disabled={pageCount >= 50}
                className="h-[36px] w-[36px] rounded-full border border-chalk flex items-center justify-center hover:bg-fog transition-colors disabled:opacity-30"
              >
                <Plus className="h-[14px] w-[14px] text-carbon" />
              </button>
            </div>
            <div className="w-full h-[4px] bg-fog rounded-full mt-[8px]">
              <div
                className="h-full bg-signal-orange rounded-full transition-all"
                style={{ width: `${(pageCount / 50) * 100}%` }}
              />
            </div>
            <div className="flex justify-between font-inter text-[11px] text-slate">
              <span>1 page</span>
              <span>25 pages</span>
              <span>50 pages</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[12px]">
            <div className="space-y-[8px]">
              <Label htmlFor="academicLevel" className="font-inter text-[14px] font-medium text-carbon">Academic Level</Label>
              <Select value={academicLevel} onValueChange={setAcademicLevel}>
                <SelectTrigger id="academicLevel"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-[8px]">
              <Label htmlFor="tone" className="font-inter text-[14px] font-medium text-carbon">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-[8px]">
              <Label htmlFor="language" className="font-inter text-[14px] font-medium text-carbon">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hinglish">Hinglish</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateSubtopics} disabled={loading || !topic.trim()} className="w-full gap-2">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Subtopics</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
