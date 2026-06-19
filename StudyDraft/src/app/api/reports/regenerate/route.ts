import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateReport } from "@/lib/ai";

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseSections(markdown: string) {
  const parsed: { heading: string; content: string; order: number }[] = [];
  const headingPositions: { heading: string; index: number }[] = [];
  const sectionRegex = /^##\s+(.+)$/gm;
  let match;

  while ((match = sectionRegex.exec(markdown)) !== null) {
    headingPositions.push({
      heading: match[1].trim(),
      index: match.index,
    });
  }

  for (let i = 0; i < headingPositions.length; i++) {
    const start = headingPositions[i].index;
    const heading = headingPositions[i].heading;
    const end =
      i + 1 < headingPositions.length
        ? headingPositions[i + 1].index
        : markdown.length;

    const sectionContent = markdown
      .slice(start, end)
      .replace(/^##\s+.+$/m, "")
      .trim();

    parsed.push({
      heading,
      content: sectionContent,
      order: i + 1,
    });
  }
  return parsed;
}

async function regenerateFullAndExtract(
  report: {
    topic: string;
    sections: { heading: string }[];
    academicLevel: string;
    pageCount: number;
    tone: string;
    language: string;
  },
  targetHeading: string
) {
  const markdown = await generateReport({
    topic: report.topic,
    verifiedSubtopics: report.sections
      .filter(
        (s) =>
          s.heading !== "References" &&
          s.heading !== report.sections[0]?.heading &&
          s.heading !== report.sections[report.sections.length - 1]?.heading
      )
      .map((s) => ({ heading: s.heading })),
    academicLevel: report.academicLevel,
    pageCount: report.pageCount,
    tone: report.tone,
    language: report.language,
    introductionHeading: report.sections[0]?.heading || "Introduction",
    conclusionHeading:
      report.sections[report.sections.length - 1]?.heading || "Conclusion",
    suggestedReferences: [],
  });

  const newSections = parseSections(markdown);
  return newSections.find((s) => s.heading === targetHeading) || null;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { reportId, sectionIndex } = await req.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { sections: { orderBy: { order: "asc" } } },
    });

    if (!report || report.userId !== userId) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (sectionIndex === undefined || sectionIndex === "full") {
      const markdown = await generateReport({
        topic: report.topic,
        verifiedSubtopics: report.sections
          .filter(
            (s) =>
              s.heading !== "References" &&
              s.heading !== report.sections[0]?.heading &&
              s.heading !== report.sections[report.sections.length - 1]?.heading
          )
          .map((s) => ({ heading: s.heading })),
        academicLevel: report.academicLevel,
        pageCount: report.pageCount,
        tone: report.tone,
        language: report.language,
        introductionHeading: report.sections[0]?.heading || "Introduction",
        conclusionHeading:
          report.sections[report.sections.length - 1]?.heading || "Conclusion",
        suggestedReferences: [],
      });

      const lines = markdown.split("\n");
      let title = report.title;
      if (lines[0]?.startsWith("# ")) {
        title = lines[0].replace(/^#\s+/, "").trim();
      }

      const newSections = parseSections(markdown);

      await prisma.$transaction([
        prisma.reportSection.deleteMany({ where: { reportId } }),
        prisma.report.update({
          where: { id: reportId },
          data: { title, content: markdown, status: "GENERATED" },
        }),
        ...newSections.map((s) =>
          prisma.reportSection.create({
            data: {
              reportId,
              heading: s.heading,
              content: s.content,
              order: s.order,
            },
          })
        ),
      ]);

      const updated = await prisma.report.findUnique({
        where: { id: reportId },
        include: { sections: { orderBy: { order: "asc" } } },
      });

      return NextResponse.json({ report: updated });
    }

    if (
      sectionIndex === "introduction" ||
      sectionIndex === "conclusion" ||
      sectionIndex === "references"
    ) {
      let targetIndex = -1;
      if (sectionIndex === "introduction") targetIndex = 0;
      else if (sectionIndex === "conclusion" || sectionIndex === "references")
        targetIndex = report.sections.length - 1;

      const target = report.sections[targetIndex];
      if (!target) {
        return NextResponse.json(
          { error: `No ${sectionIndex} section found` },
          { status: 400 }
        );
      }

      const regenerated = await regenerateFullAndExtract(report, target.heading);
      if (!regenerated) {
        return NextResponse.json(
          { error: "Failed to regenerate section" },
          { status: 500 }
        );
      }

      await prisma.reportSection.update({
        where: { id: target.id },
        data: { content: regenerated.content },
      });

      const sectionBlock = `## ${regenerated.heading}\n\n${regenerated.content}`;
      const updatedContent = report.content.replace(
        new RegExp(`## ${escapeRegex(target.heading)}[\\s\\S]*?(?=\n## |$)`),
        sectionBlock.trimEnd()
      );

      await prisma.report.update({
        where: { id: reportId },
        data: { content: updatedContent },
      });

      const updated = await prisma.report.findUnique({
        where: { id: reportId },
        include: { sections: { orderBy: { order: "asc" } } },
      });

      return NextResponse.json({ report: updated });
    }

    if (typeof sectionIndex === "number") {
      const target = report.sections[sectionIndex];
      if (!target) {
        return NextResponse.json(
          { error: "Section not found" },
          { status: 404 }
        );
      }

      const regenerated = await regenerateFullAndExtract(report, target.heading);
      if (!regenerated) {
        return NextResponse.json(
          { error: "Failed to regenerate section" },
          { status: 500 }
        );
      }

      await prisma.reportSection.update({
        where: { id: target.id },
        data: { content: regenerated.content },
      });

      const sectionBlock = `## ${regenerated.heading}\n\n${regenerated.content}`;
      const updatedContent = report.content.replace(
        new RegExp(`## ${escapeRegex(target.heading)}[\\s\\S]*?(?=\n## |$)`),
        sectionBlock.trimEnd()
      );

      await prisma.report.update({
        where: { id: reportId },
        data: { content: updatedContent },
      });

      const updated = await prisma.report.findUnique({
        where: { id: reportId },
        include: { sections: { orderBy: { order: "asc" } } },
      });

      return NextResponse.json({ report: updated });
    }

    return NextResponse.json(
      { error: "Invalid sectionIndex" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Report regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate report" },
      { status: 500 }
    );
  }
}
