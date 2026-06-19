"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Check,
  Loader2,
  Sparkles,
  GripVertical,
} from "lucide-react";

interface Subtopic { heading: string; description?: string; }
interface GeneratedSubtopics { title: string; introductionHeading: string; subtopics: Subtopic[]; conclusionHeading: string; suggestedReferences: string[]; }
interface ReportFormData { topic: string; pageCount: number; academicLevel: string; tone: string; language: string; }

export default function SubtopicsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [data, setData] = useState<GeneratedSubtopics | null>(null);
  const [formData, setFormData] = useState<ReportFormData | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newSubtopic, setNewSubtopic] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const stored = sessionStorage.getItem("generatedSubtopics");
    const storedForm = sessionStorage.getItem("reportFormData");
    if (!stored) { router.push("/dashboard/new-report"); return; }
    try { setData(JSON.parse(stored)); } catch { router.push("/dashboard/new-report"); }
    if (storedForm) { try { setFormData(JSON.parse(storedForm)); } catch {} }
  }, [router]);

  if (status === "loading" || !data || !session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allChecked = data.subtopics.length > 0 && checked.size === data.subtopics.length;

  function toggleAll() {
    if (allChecked || !data) setChecked(new Set());
    else setChecked(new Set(data.subtopics.map((_, i) => i)));
  }

  function toggleCheck(index: number) {
    setChecked((prev) => { const next = new Set(prev); next.has(index) ? next.delete(index) : next.add(index); return next; });
  }

  function startEdit(index: number) { if (!data) return; setEditingIndex(index); setEditValue(data.subtopics[index].heading); }

  function saveEdit() {
    if (editingIndex === null || !editValue.trim()) return;
    setData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, subtopics: [...prev.subtopics] };
      updated.subtopics[editingIndex] = { ...updated.subtopics[editingIndex], heading: editValue.trim() };
      return updated;
    });
    setEditingIndex(null);
    setEditValue("");
  }

  function deleteSubtopic(index: number) {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, subtopics: prev.subtopics.filter((_, i) => i !== index) };
    });
    setChecked((prev) => {
      const next = new Set(prev); next.delete(index);
      const adjusted = new Set<number>();
      Array.from(next).forEach((i) => { adjusted.add(i > index ? i - 1 : i); });
      return adjusted;
    });
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, subtopics: [...prev.subtopics] };
      [updated.subtopics[index - 1], updated.subtopics[index]] = [updated.subtopics[index], updated.subtopics[index - 1]];
      return updated;
    });
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) { next.delete(index); next.add(index - 1); }
      if (next.has(index - 1)) { next.delete(index - 1); next.add(index); }
      return next;
    });
  }

  function moveDown(index: number) {
    if (!data || index >= data.subtopics.length - 1) return;
    setData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, subtopics: [...prev.subtopics] };
      [updated.subtopics[index], updated.subtopics[index + 1]] = [updated.subtopics[index + 1], updated.subtopics[index]];
      return updated;
    });
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) { next.delete(index); next.add(index + 1); }
      if (next.has(index + 1)) { next.delete(index + 1); next.add(index); }
      return next;
    });
  }

  function addSubtopic() {
    if (!newSubtopic.trim()) return;
    setData((prev) => prev ? { ...prev, subtopics: [...prev.subtopics, { heading: newSubtopic.trim() }] } : prev);
    setNewSubtopic("");
  }

  async function handleGenerateReport() {
    if (!data || !formData) return;
    const verifiedSubtopics = data.subtopics.filter((_, i) => checked.has(i)).map((s) => ({ heading: s.heading, description: s.description }));
    if (verifiedSubtopics.length === 0) {
      toast({ title: "No subtopics selected", description: "Please select at least one subtopic.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: formData.topic, verifiedSubtopics, academicLevel: formData.academicLevel, pageCount: formData.pageCount, tone: formData.tone, language: formData.language, introductionHeading: data.introductionHeading, conclusionHeading: data.conclusionHeading, suggestedReferences: data.suggestedReferences }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: result.error || "Failed to generate report.", variant: "destructive" });
        return;
      }
      sessionStorage.removeItem("generatedSubtopics");
      sessionStorage.removeItem("reportFormData");
      router.push(`/dashboard/editor?id=${result.reportId}`);
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
        <p className="text-muted-foreground mt-1">Review and customize your subtopics before generating the report.</p>
      </div>

      <Card className="mb-6 border-0 shadow-sm gradient-card">
        <CardHeader>
          <CardTitle className="text-lg">{data.introductionHeading}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This section will introduce the topic and provide background information.</p>
        </CardContent>
      </Card>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Subtopics</h2>
          <Button variant="ghost" size="sm" onClick={toggleAll} className="gap-1.5">
            <Check className="h-3.5 w-3.5" />
            {allChecked ? "Deselect All" : "Select All"}
          </Button>
        </div>

        {data.subtopics.map((subtopic, index) => (
          <Card key={index} className={`border-0 shadow-sm transition-all ${checked.has(index) ? "" : "opacity-60"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleCheck(index)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${checked.has(index) ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                  {checked.has(index) && <Check className="h-3 w-3" />}
                </button>
                <div className="flex-1 min-w-0">
                  {editingIndex === index ? (
                    <div className="flex gap-2">
                      <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingIndex(null); }} autoFocus className="h-8" />
                      <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 shrink-0"><Check className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => startEdit(index)}>{subtopic.heading}</p>
                  )}
                  {subtopic.description && editingIndex !== index && <p className="text-xs text-muted-foreground mt-0.5">{subtopic.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => moveUp(index)} disabled={index === 0} className="h-8 w-8"><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => moveDown(index)} disabled={index === data.subtopics.length - 1} className="h-8 w-8"><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteSubtopic(index)} className="h-8 w-8 text-destructive hover:text-destructive"><X className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-2 pt-2">
          <Input placeholder="Add a new subtopic..." value={newSubtopic} onChange={(e) => setNewSubtopic(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addSubtopic(); }} />
          <Button variant="outline" onClick={addSubtopic} disabled={!newSubtopic.trim()} className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <Card className="mb-6 border-0 shadow-sm gradient-card">
        <CardHeader>
          <CardTitle className="text-lg">{data.conclusionHeading}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This section will summarize the key findings and provide concluding remarks.</p>
        </CardContent>
      </Card>

      <Button onClick={handleGenerateReport} disabled={generating || checked.size === 0} className="w-full gap-2 gradient-primary hover:opacity-90 text-white shadow-lg shadow-indigo-500/25">
        {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating Report...</> : <><Sparkles className="h-4 w-4" /> Generate Report</>}
      </Button>
    </div>
  );
}
