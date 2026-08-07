import { NextRequest, NextResponse } from "next/server";

import { handleApiError, jsonError } from "@/lib/api-utils";
import { serializeProject } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validation";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects.map(serializeProject));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        clientName: data.clientName,
        projectName: data.projectName,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate,
        dueDate: data.dueDate,
      },
    });

    return NextResponse.json(serializeProject(project), { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError("Invalid JSON body", 400);
    }
    return handleApiError(error);
  }
}
