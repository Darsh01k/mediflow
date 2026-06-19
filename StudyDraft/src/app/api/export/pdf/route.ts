import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateReportHtml(
  title: string,
  sections: { heading: string; content: string }[],
  date: string
): string {
  const sectionsHtml = sections
    .map(
      (s) => `
      <div class="section">
        <h2>${escapeHtml(s.heading)}</h2>
        ${s.content
          .split("\n")
          .filter((p) => p.trim())
          .map((p) => `<p>${escapeHtml(p)}</p>`)
          .join("\n")}
      </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      margin: 2.54cm 3.18cm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 2;
      color: #000;
    }
    .container {
      max-width: 100%;
      padding: 0;
    }
    h1 {
      font-size: 18pt;
      text-align: center;
      font-weight: bold;
      margin-bottom: 6pt;
      line-height: 1.4;
    }
    .meta {
      text-align: center;
      font-size: 12pt;
      margin-bottom: 36pt;
    }
    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 18pt;
      margin-bottom: 6pt;
      line-height: 1.4;
    }
    p {
      text-align: justify;
      margin-bottom: 0;
      text-indent: 1.27cm;
    }
    .section {
      margin-bottom: 12pt;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">Generated on ${date}</div>
    ${sectionsHtml}
  </div>
</body>
</html>`;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId query parameter is required" },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { sections: { orderBy: { order: "asc" } } },
    });

    if (!report || report.userId !== userId) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = generateReportHtml(
      report.title,
      report.sections,
      date
    );

    await prisma.exportHistory.create({
      data: {
        reportId: report.id,
        exportType: "PDF",
      },
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(report.title)}.html"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to export report as PDF" },
      { status: 500 }
    );
  }
}
