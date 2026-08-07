import { NextRequest, NextResponse } from "next/server";

import { handleApiError, jsonError } from "@/lib/api-utils";
import { serializeProject } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { projectIdSchema, updateProjectSchema } from "@/lib/validation";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const id = projectIdSchema.parse(params.id);

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return jsonError("Project not found", 404);
    }

    return NextResponse.json(serializeProject(project));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const id = projectIdSchema.parse(params.id);
    const body = await request.json();
    const data = updateProjectSchema.parse(body);

    const project = await prisma.project.update({
      where: { id },
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

    return NextResponse.json(serializeProject(project));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError("Invalid JSON body", 400);
    }
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const id = projectIdSchema.parse(params.id);

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
