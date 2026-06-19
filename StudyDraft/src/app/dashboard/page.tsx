"use client";

import { useEffect, useState } from "react";
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
import {
  FileText,
  Upload,
  Clock,
  Plus,
  TrendingUp,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  topic: string;
  reportType: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/reports")
        .then((res) => res.json())
        .then((data) => {
          setReports(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-slate" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;

  return (
    <div className="max-w-page mx-auto px-4 py-[40px] space-y-[32px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-polysans text-[32px] font-normal leading-[1.19] tracking-[-0.64px] text-carbon">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="font-inter text-[16px] text-graphite mt-[4px]">
            Here&apos;s an overview of your reports.
          </p>
        </div>
      </div>

      <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-paper rounded-cards p-[20px] space-y-[8px]">
          <div className="flex items-center justify-between">
            <span className="font-inter text-[14px] font-medium text-slate">Total Reports</span>
            <FileText className="h-[16px] w-[16px] text-signal-orange" />
          </div>
          <div className="font-polysans text-[32px] font-normal leading-[1.19] tracking-[-0.64px] text-carbon">
            {reports.length}
          </div>
        </div>
        <div className="bg-paper rounded-cards p-[20px] space-y-[8px]">
          <div className="flex items-center justify-between">
            <span className="font-inter text-[14px] font-medium text-slate">Daily Usage</span>
            <TrendingUp className="h-[16px] w-[16px] text-signal-orange" />
          </div>
          <div className="font-polysans text-[32px] font-normal leading-[1.19] tracking-[-0.64px] text-carbon">
            {3 - reports.filter((r) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return new Date(r.createdAt) >= today;
            }).length}
          </div>
          <span className="font-inter text-[12px] text-slate">remaining today</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-[12px]">
        <Button asChild className="gap-2">
          <Link href="/dashboard/new-report">
            <Plus className="h-4 w-4" /> Create New Report
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/dashboard/reference-upload">
            <Upload className="h-4 w-4" /> Upload Reference Report
          </Link>
        </Button>
      </div>

      <div className="bg-paper rounded-cards p-[24px]">
        <h2 className="font-polysans text-[32px] font-normal leading-[1.19] tracking-[-0.64px] text-carbon mb-[16px]">
          Recent Reports
        </h2>
        {reports.length === 0 ? (
          <div className="text-center py-[40px] space-y-[12px]">
            <FileText className="h-[48px] w-[48px] text-slate mx-auto" />
            <p className="font-inter text-[14px] text-slate">
              No reports yet. Create your first report to get started.
            </p>
            <Button asChild variant="outline" className="mt-[8px] gap-2">
              <Link href="/dashboard/new-report">
                Create Report <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-[8px]">
            {reports.slice(0, 5).map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/editor?id=${report.id}`}
                className="flex items-center justify-between p-[12px] rounded-[8px] hover:bg-fog transition-colors group"
              >
                <div className="flex items-center gap-[12px] min-w-0">
                  <div className="h-[32px] w-[32px] rounded-[6px] bg-fog flex items-center justify-center shrink-0">
                    <FileText className="h-[14px] w-[14px] text-graphite" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-inter text-[14px] font-medium text-carbon truncate">{report.title}</p>
                    <div className="flex items-center gap-[8px] font-inter text-[12px] text-slate mt-[2px]">
                      <Clock className="h-[12px] w-[12px]" />
                      {formatDate(new Date(report.createdAt))}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-[20px] px-[10px] py-[2px] text-[11px] font-medium shrink-0 ${
                    report.status === "GENERATED"
                      ? "bg-signal-orange/10 text-signal-orange"
                      : report.status === "EXPORTED"
                        ? "bg-carbon/10 text-carbon"
                        : "bg-slate/10 text-slate"
                  }`}
                >
                  {report.status === "GENERATED"
                    ? "Generated"
                    : report.status === "EXPORTED"
                      ? "Exported"
                      : "Draft"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
