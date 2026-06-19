import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeReferenceReport } from "@/lib/ai";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOCX, and TXT files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const tempFileName = `${randomUUID()}${ext}`;
    const tempPath = join(tmpdir(), tempFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPath, buffer);

    let extractedText = "";

    try {
      if (ext === ".pdf") {
        const pdfParse = (await import("pdf-parse-debugging-disabled")).default;
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } else if (ext === ".docx") {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else {
        extractedText = buffer.toString("utf-8");
      }
    } finally {
      await unlink(tempPath).catch(() => {});
    }

    const detectedStructure = await analyzeReferenceReport(extractedText);

    const document = await prisma.referenceDocument.create({
      data: {
        userId,
        fileName: file.name,
        fileType: ext.replace(".", ""),
        extractedText,
        detectedStructureJson: JSON.stringify(detectedStructure),
      },
    });

    return NextResponse.json({
      id: document.id,
      detectedStructure,
      fileName: document.fileName,
      extractedText: extractedText.slice(0, 500),
    });
  } catch (error) {
    console.error("Reference analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze reference document" },
      { status: 500 }
    );
  }
}
