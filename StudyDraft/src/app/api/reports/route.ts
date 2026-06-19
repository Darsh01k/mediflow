import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("id");

    if (reportId) {
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

      return NextResponse.json(report);
    }

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { id, title, content, status, sections } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.report.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    const report = await prisma.report.update({
      where: { id },
      data: updateData as never,
    });

    if (sections !== undefined) {
      await prisma.reportSection.deleteMany({ where: { reportId: id } });

      for (let i = 0; i < sections.length; i++) {
        await prisma.reportSection.create({
          data: {
            reportId: id,
            heading: sections[i].heading,
            content: sections[i].content || "",
            order: sections[i].order ?? i + 1,
          },
        });
      }
    }

    const updated = await prisma.report.findUnique({
      where: { id },
      include: { sections: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report || report.userId !== userId) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    await prisma.report.delete({ where: { id: reportId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
