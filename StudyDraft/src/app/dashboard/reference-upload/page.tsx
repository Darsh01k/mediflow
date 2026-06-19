"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, AlertTriangle, Loader2 } from "lucide-react";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function ReferenceUploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function validateFile(f: File): string | null {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return "Invalid file type. Only PDF, DOCX, and TXT files are allowed.";
    if (f.size > MAX_SIZE) return "File is too large. Maximum size is 10MB.";
    return null;
  }

  async function handleUpload(selectedFile: File) {
    const error = validateFile(selectedFile);
    if (error) { toast({ title: "Invalid file", description: error, variant: "destructive" }); return; }
    setFile(selectedFile);
    setUploading(true);
    setProgress(10);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 80) + 10);
      });
      const result = await new Promise<any>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) { try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error("Invalid response")); } }
          else { try { const err = JSON.parse(xhr.responseText); reject(new Error(err.error || "Upload failed")); } catch { reject(new Error("Upload failed")); } }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("POST", "/api/reference/analyze");
        xhr.send(formData);
      });
      setProgress(100);
      sessionStorage.setItem("referenceAnalysis", JSON.stringify(result));
      router.push("/dashboard/reference-analyze");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Something went wrong.", variant: "destructive" });
      setFile(null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleUpload(droppedFile);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleUpload(selectedFile);
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Reference Report</h1>
        <p className="text-muted-foreground mt-1">Upload an existing report to analyze its structure and formatting.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Reference Document</CardTitle>
          <CardDescription>Supported formats: PDF, DOCX, TXT (Max 10MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer ${
              dragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleInputChange} disabled={uploading} />
            {uploading ? (
              <>
                <div className="h-14 w-14 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-medium mb-3">Uploading...</p>
                <Progress value={progress} className="w-full max-w-xs" />
                <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
              </>
            ) : file ? (
              <>
                <div className="h-14 w-14 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-medium mb-1">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <Upload className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">Drag & drop your file here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </>
            )}
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
            <span>StudyDraft only uses uploaded reports as a reference for structure and formatting. Your document content is not stored or reused beyond analysis.</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full gap-2">
            <Upload className="h-4 w-4" />
            {file ? "Change File" : "Select File"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
