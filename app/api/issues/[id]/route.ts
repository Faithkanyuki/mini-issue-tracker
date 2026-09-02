import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";

const updateIssueSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
});

// A simple guard against malformed IDs before hitting the database
const uuidSchema = z.string().uuid();

// GET /api/issues/:id — view a single issue, only if owned by the requester
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idCheck = uuidSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "Invalid issue ID" }, { status: 400 });
    }

    const issue = await prisma.issue.findUnique({
      where: { id: params.id },
    });

    // Same response whether the issue doesn't exist OR belongs to someone
    // else — this avoids leaking which issue IDs exist to other users
    if (!issue || issue.userId !== userId) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ issue }, { status: 200 });
  } catch (error) {
    console.error("Get issue error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// PATCH /api/issues/:id — update an issue, only if owned by the requester
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idCheck = uuidSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "Invalid issue ID" }, { status: 400 });
    }

    const existingIssue = await prisma.issue.findUnique({
      where: { id: params.id },
    });

    if (!existingIssue || existingIssue.userId !== userId) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateIssueSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ issue: updatedIssue }, { status: 200 });
  } catch (error) {
    console.error("Update issue error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE /api/issues/:id — delete an issue, only if owned by the requester
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idCheck = uuidSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "Invalid issue ID" }, { status: 400 });
    }

    const existingIssue = await prisma.issue.findUnique({
      where: { id: params.id },
    });

    if (!existingIssue || existingIssue.userId !== userId) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    await prisma.issue.delete({ where: { id: params.id } });

    return NextResponse.json(
      { message: "Issue deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete issue error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}