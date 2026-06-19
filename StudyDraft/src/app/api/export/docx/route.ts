import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

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

    const children: Paragraph[] = [];

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: report.title,
            bold: true,
            size: 28,
            font: "Times New Roman",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on ${date}`,
            size: 24,
            font: "Times New Roman",
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    for (const section of report.sections) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.heading,
              bold: true,
              size: 26,
              font: "Times New Roman",
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      );

      const paragraphs = section.content
        .split("\n")
        .filter((p) => p.trim());

      for (const para of paragraphs) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: para,
                size: 24,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 120 },
            indent: { firstLine: 720 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1800,
                right: 1800,
              },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    await prisma.exportHistory.create({
      data: {
        reportId: report.id,
        exportType: "DOCX",
      },
    });

    const filename = encodeURIComponent(report.title.replace(/\s+/g, "_"));

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}.docx"`,
      },
    });
  } catch (error) {
    console.error("DOCX export error:", error);
    return NextResponse.json(
      { error: "Failed to export report as DOCX" },
      { status: 500 }
    );
  }
}
