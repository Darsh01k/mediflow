import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sameTopicRewrite, differentTopicSameFormat } from "@/lib/ai";

interface DetectedStructure {
  detectedTopic?: string;
  titleStyle?: string;
  headingStructure?: string;
  sectionOrder?: string[];
  paragraphStyle?: string;
  formattingNotes?: string;
  referenceStyle?: string;
  suggestedReusableFormat?: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const {
      mode,
      referenceDocId,
      detectedStructure,
      newTopic,
      academicLevel = "college",
      tone = "formal",
      language = "English",
      pageCount = 5,
    } = body;

    if (!mode || !detectedStructure) {
      return NextResponse.json(
        { error: "Mode and detectedStructure are required" },
        { status: 400 }
      );
    }

    const structure = detectedStructure as DetectedStructure;
    let markdown = "";

    if (mode === "same-topic") {
      if (!referenceDocId) {
        return NextResponse.json(
          { error: "referenceDocId is required for same-topic mode" },
          { status: 400 }
        );
      }

      const refDoc = await prisma.referenceDocument.findUnique({
        where: { id: referenceDocId },
      });

      if (!refDoc || refDoc.userId !== userId) {
        return NextResponse.json(
          { error: "Reference document not found" },
          { status: 404 }
        );
      }

      markdown = await sameTopicRewrite({
        referenceText: refDoc.extractedText,
        detectedStructure: JSON.stringify(structure),
        academicLevel,
        pageCount,
        tone,
        language,
      });
    } else if (mode === "different-topic") {
      if (!newTopic?.trim()) {
        return NextResponse.json(
          { error: "newTopic is required for different-topic mode" },
          { status: 400 }
        );
      }

      markdown = await differentTopicSameFormat({
        newTopic: newTopic.trim(),
        referenceStructure: JSON.stringify(structure),
        academicLevel,
        pageCount,
        tone,
        language,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid mode. Use 'same-topic' or 'different-topic'." },
        { status: 400 }
      );
    }

    const lines = markdown.split("\n");
    let title = structure.detectedTopic || "Untitled Report";
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

    const reportType =
      mode === "same-topic"
        ? "SAME_TOPIC_REWRITE"
        : "DIFFERENT_TOPIC_REFERENCE_FORMAT";

    const report = await prisma.report.create({
      data: {
        userId,
        title,
        topic: mode === "same-topic"
          ? (structure.detectedTopic || "Reference Report")
          : newTopic.trim(),
        content: markdown,
        reportType,
        language,
        tone,
        academicLevel,
        pageCount,
        length: String(pageCount),
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
    console.error("Reference generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report from reference" },
      { status: 500 }
    );
  }
}
