import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateReport } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const body = await req.json();
    const {
      topic,
      verifiedSubtopics,
      introductionHeading,
      conclusionHeading,
      suggestedReferences,
      pageCount,
      academicLevel,
      tone,
      language,
      reportType,
    } = body;

    if (!topic || !verifiedSubtopics || verifiedSubtopics.length === 0) {
      return NextResponse.json(
        { error: "Topic and at least one subtopic are required" },
        { status: 400 }
      );
    }

    const markdown = await generateReport({
      topic,
      verifiedSubtopics: verifiedSubtopics.map(
        (s: { heading: string; description?: string }) => ({
          heading: s.heading,
          description: s.description,
        })
      ),
      academicLevel: academicLevel || "college",
      pageCount: pageCount || 5,
      tone: tone || "formal",
      language: language || "English",
      introductionHeading: introductionHeading || "Introduction",
      conclusionHeading: conclusionHeading || "Conclusion",
      suggestedReferences: suggestedReferences || [],
    });

    const lines = markdown.split("\n");
    let title = topic;
    if (lines[0]?.startsWith("# ")) {
      title = lines[0].replace(/^#\s+/, "").trim();
    }

    const sections: { heading: string; content: string; order: number }[] = [];
    const sectionRegex = /^##\s+(.+)$/gm;
    let match;
    const headingPositions: { heading: string; index: number }[] = [];

    while ((match = sectionRegex.exec(markdown)) !== null) {
      headingPositions.push({ heading: match[1].trim(), index: match.index });
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

      sections.push({
        heading,
        content: sectionContent,
        order: i + 1,
      });
    }

    const report = await prisma.report.create({
      data: {
        userId,
        title,
        topic,
        content: markdown,
        reportType: reportType || "TOPIC_BASED",
        language: language || "English",
        tone: tone || "formal",
        academicLevel: academicLevel || "college",
        pageCount: pageCount || 5,
        length: pageCount ? String(pageCount) : "medium",
        status: "GENERATED",
        sections: {
          create: sections.map((s) => ({
            heading: s.heading,
            content: s.content,
            order: s.order,
          })),
        },
      },
    });

    return NextResponse.json({ reportId: report.id });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
