"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Save,
  Download,
  Copy,
  RefreshCw,
  FileText,
  Eye,
  Edit3,
  Loader2,
  ArrowLeft,
  FileDown,
} from "lucide-react";
import Link from "next/link";

interface Section {
  id: string;
  heading: string;
  content: string;
  order: number;
}

interface Report {
  id: string;
  title: string;
  content: string;
  sections: Section[];
  status: string;
}

function EditorContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const reportId = searchParams.get("id");

  const [report, setReport] = useState<Report | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<number | string | null>(null);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?id=${reportId}`);
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to fetch report", variant: "destructive" });
        router.push("/dashboard");
        return;
      }
      setReport(data);
      setTitle(data.title || "");
    } catch {
      toast({ title: "Error", description: "Failed to fetch report", variant: "destructive" });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [reportId, router, toast]);

  useEffect(() => {
    if (status === "authenticated" && reportId) {
      fetchReport();
    }
  }, [status, reportId, fetchReport]);

  async function handleSave() {
    if (!report) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, title, content: report.content, sections: report.sections }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to save", variant: "destructive" });
        return;
      }
      setReport(data);
      toast({ title: "Saved", description: "Draft saved successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to save draft", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerate(target: number | string) {
    if (!report) return;
    setRegeneratingSection(target);
    try {
      const res = await fetch("/api/reports/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, sectionIndex: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to regenerate", variant: "destructive" });
        return;
      }
      setReport(data.report);
      toast({ title: "Regenerated", description: "Section regenerated successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to regenerate section", variant: "destructive" });
    } finally {
      setRegeneratingSection(null);
    }
  }

  function startEditSection(index: number) {
    if (!report) return;
    setEditingSection(index);
    setEditContent(report.sections[index]?.content || "");
  }

  function saveSectionEdit(index: number) {
    if (!report) return;
    setReport((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.sections = [...prev.sections];
      updated.sections[index] = { ...updated.sections[index], content: editContent };
      const sectionRegex = new RegExp(`## ${escapeRegex(updated.sections[index].heading)}[\\s\\S]*?(?=\n## |$)`);
      const sectionBlock = `## ${updated.sections[index].heading}\n\n${editContent}`;
      updated.content = prev.content.replace(sectionRegex, sectionBlock.trimEnd());
      return updated;
    });
    setEditingSection(null);
    setEditContent("");
  }

  async function handleCopy() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report.content);
      toast({ title: "Copied", description: "Report content copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return null;

  if (!reportId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">No report selected.</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Report not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold tracking-tight border-0 px-0 h-auto focus-visible:ring-0"
            placeholder="Report Title"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 p-3 rounded-xl bg-muted/50 border">
        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleRegenerate("full")} disabled={regeneratingSection === "full"} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${regeneratingSection === "full" ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
          <div className="h-5 w-px bg-border mx-1" />
          <Button variant="outline" size="sm" onClick={() => handleRegenerate("introduction")} disabled={regeneratingSection === "introduction"} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${regeneratingSection === "introduction" ? "animate-spin" : ""}`} />
            Introduction
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleRegenerate("conclusion")} disabled={regeneratingSection === "conclusion"} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${regeneratingSection === "conclusion" ? "animate-spin" : ""}`} />
            Conclusion
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleRegenerate("references")} disabled={regeneratingSection === "references"} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${regeneratingSection === "references" ? "animate-spin" : ""}`} />
            References
          </Button>
          <div className="h-5 w-px bg-border mx-1" />
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <a href={`/api/export/pdf?reportId=${report.id}`} target="_blank" rel="noopener noreferrer">
              <FileDown className="h-3.5 w-3.5" />
              HTML
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <a href={`/api/export/docx?reportId=${report.id}`} target="_blank" rel="noopener noreferrer">
              <FileText className="h-3.5 w-3.5" />
              DOCX
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {report.sections.map((section, index) => (
            <Card key={section.id} className="border-0 shadow-sm card-hover">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{section.heading}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleRegenerate(index)} disabled={regeneratingSection === index} className="gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${regeneratingSection === index ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {report.sections.map((section, index) => (
            <Card key={section.id} className="border-0 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{section.heading}</CardTitle>
                  <div className="flex gap-2">
                    {editingSection === index ? (
                      <Button variant="default" size="sm" onClick={() => saveSectionEdit(index)}>Save</Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => startEditSection(index)} className="gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleRegenerate(index)} disabled={regeneratingSection === index} className="gap-1.5">
                      <RefreshCw className={`h-3.5 w-3.5 ${regeneratingSection === index ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {editingSection === index ? (
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[200px] font-mono text-sm" />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
