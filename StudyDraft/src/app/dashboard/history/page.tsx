"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Trash2, Download, Clock, Loader2, ArrowRight } from "lucide-react";

interface Report {
  id: string;
  title: string;
  topic: string;
  reportType: string;
  status: string;
  createdAt: string;
}

function getTypeLabel(type: string) {
  switch (type) {
    case "TOPIC_BASED": return "Topic Based";
    case "SAME_TOPIC_REWRITE": return "Same Topic Rewrite";
    case "DIFFERENT_TOPIC_REFERENCE_FORMAT": return "Reference Format";
    default: return type;
  }
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    GENERATED: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    EXPORTED: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    DRAFT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.DRAFT}`}>
      {status === "GENERATED" ? "Generated" : status === "EXPORTED" ? "Exported" : "Draft"}
    </span>
  );
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchReports = useCallback(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => { setReports(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function handleDelete(reportId: string) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/reports?id=${reportId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast({ title: "Report deleted successfully" });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to delete", variant: "destructive" });
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report History</h1>
        <p className="text-muted-foreground mt-1">View and manage all your generated reports.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No reports found. Create your first report to see it here.</p>
              <Button asChild className="gap-2">
                <Link href="/dashboard/new-report">Create New Report <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id} className="border-0 shadow-sm card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <Link href={`/dashboard/editor?id=${report.id}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                    <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{report.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(new Date(report.createdAt))}
                        <span className="text-muted-foreground/50">|</span>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {getTypeLabel(report.reportType)}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    {getStatusBadge(report.status)}
                    <a href={`/api/export/pdf?reportId=${report.id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" title="Export as HTML">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
