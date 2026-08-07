import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

import { formatZodErrors } from "./validation";

export function jsonError(
  message: string,
  status: number,
  errors?: Record<string, string[]>,
) {
  return NextResponse.json(
    {
      error: message,
      ...(errors ? { errors } : {}),
    },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Validation failed", 400, formatZodErrors(error));
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return jsonError("Project not found", 404);
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}
