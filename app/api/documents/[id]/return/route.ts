import { createReturnFromDocument, SqliteValidationError } from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json(
    { error: message },
    { status: error instanceof SqliteValidationError ? 400 : 500 },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    let payload: unknown = {};
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) payload = await request.json();
    const document = createReturnFromDocument(Number(id), payload);
    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
