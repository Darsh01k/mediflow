"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Loader2,
  BookOpen,
} from "lucide-react";
import { DetectedStructure } from "@/types";

export default function ReferenceAnalyzePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [data, setData] = useState<{ id: string; detectedStructure: DetectedStructure; fileName: string } | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [academicLevel, setAcademicLevel] = useState("college");
  const [tone, setTone] = useState("formal");
  const [language, setLanguage] = useState("English");
  const [pageCount, setPageCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const stored = sessionStorage.getItem("referenceAnalysis");
      if (!stored) { router.push("/dashboard/reference-upload"); return; }
      try { setData(JSON.parse(stored)); } catch { router.push("/dashboard/reference-upload"); }
    }
  }, [status, router]);

  async function handleSameTopic() {
    if (!data) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/reference/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "same-topic", referenceDocId: data.id, detectedStructure: data.detectedStructure, academicLevel, tone, language, pageCount }),
      });
      const result = await res.json();
      if (!res.ok) { toast({ title: "Error", description: result.error || "Failed to generate report.", variant: "destructive" }); return; }
      sessionStorage.removeItem("referenceAnalysis");
      router.push(`/dashboard/editor?id=${result.reportId}`);
    } catch { toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" }); }
    finally { setGenerating(false); }
  }

  async function handleDifferentTopic() {
    if (!data) return;
    if (!newTopic.trim()) { toast({ title: "Topic required", description: "Please enter a topic for the new report.", variant: "destructive" }); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/reference/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "different-topic", referenceDocId: data.id, detectedStructure: data.detectedStructure, newTopic: newTopic.trim(), academicLevel, tone, language, pageCount }),
      });
      const result = await res.json();
      if (!res.ok) { toast({ title: "Error", description: result.error || "Failed to generate report.", variant: "destructive" }); return; }
      sessionStorage.removeItem("referenceAnalysis");
      router.push(`/dashboard/editor?id=${result.reportId}`);
    } catch { toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" }); }
    finally { setGenerating(false); }
  }

  if (status === "loading" || !data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return null;

  const s = data.detectedStructure;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reference Analysis</h1>
        <p className="text-muted-foreground mt-1">Analysis of <span className="font-medium">{data.fileName}</span></p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <p>StudyDraft uses uploaded reports only as a reference for structure, formatting, spacing, and writing style. It does not directly copy content.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-teal-500" /> Detected Structure Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Detected Topic</p><p className="text-sm">{s.detectedTopic}</p></div>
          <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Title Style</p><p className="text-sm">{s.titleStyle}</p></div>
          <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Heading Structure</p><p className="text-sm">{s.headingStructure}</p></div>
          <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Paragraph Style</p><p className="text-sm">{s.paragraphStyle}</p></div>
          <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Reference Style</p><p className="text-sm">{s.referenceStyle}</p></div>
          <div className="space-y-1"><p className="text-sm font-medium text-muted-foreground">Formatting Notes</p><p className="text-sm">{s.formattingNotes}</p></div>
          <div className="space-y-1 sm:col-span-2"><p className="text-sm font-medium text-muted-foreground">Suggested Reusable Format</p><p className="text-sm">{s.suggestedReusableFormat}</p></div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Section Order</p>
            {s.sectionOrder?.length ? (
              <ol className="list-decimal list-inside text-sm space-y-0.5">
                {s.sectionOrder.map((section, i) => <li key={i}>{section}</li>)}
              </ol>
            ) : <p className="text-sm text-muted-foreground">Not detected</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Same Topic, Different Writing</CardTitle>
            <CardDescription>Generate a new report on the same topic with completely original content while preserving the structure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Detected Topic</p>
              <p className="text-sm font-medium">{s.detectedTopic}</p>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="font-inter text-[13px] text-graphite">Pages:</span>
              <button onClick={() => setPageCount(Math.max(1, pageCount - 1))} className="h-[28px] w-[28px] rounded-full border border-chalk flex items-center justify-center hover:bg-fog text-sm">−</button>
              <span className="font-inter text-[14px] font-medium text-carbon w-[24px] text-center">{pageCount}</span>
              <button onClick={() => setPageCount(Math.min(50, pageCount + 1))} className="h-[28px] w-[28px] rounded-full border border-chalk flex items-center justify-center hover:bg-fog text-sm">+</button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSameTopic} disabled={generating} className="w-full gap-2">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><RefreshCw className="h-4 w-4" /> Generate New Report</>}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Different Topic, Same Format</CardTitle>
            <CardDescription>Write a new report on a different topic, following the same structure and formatting as the reference.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newTopic">New Topic</Label>
              <Input id="newTopic" placeholder="Enter the new report topic" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="academicLevel">Academic Level</Label>
                <Select value={academicLevel} onValueChange={setAcademicLevel}>
                  <SelectTrigger id="academicLevel"><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem><SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="college">College</SelectItem><SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone"><SelectValue placeholder="Select tone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem><SelectItem value="formal">Formal</SelectItem><SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language"><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem><SelectItem value="Hinglish">Hinglish</SelectItem><SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageCount">Pages</Label>
                <div className="flex items-center gap-[8px]">
                  <button onClick={() => setPageCount(Math.max(1, pageCount - 1))} className="h-[32px] w-[32px] rounded-full border border-chalk flex items-center justify-center hover:bg-fog text-sm">−</button>
                  <span className="font-inter text-[15px] font-medium text-carbon w-[30px] text-center">{pageCount}</span>
                  <button onClick={() => setPageCount(Math.min(50, pageCount + 1))} className="h-[32px] w-[32px] rounded-full border border-chalk flex items-center justify-center hover:bg-fog text-sm">+</button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDifferentTopic} disabled={generating || !newTopic.trim()} className="w-full gap-2">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><ArrowRight className="h-4 w-4" /> Generate Report</>}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
