import { createReturnFromDocument, SqliteValidationError } from "@/lib/sqlite";
import { AccountAuthenticationError, withAccountDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  const status = error instanceof AccountAuthenticationError ? error.status : error instanceof SqliteValidationError ? 400 : 500;
  return Response.json({ error: message }, { status });
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    return await withAccountDatabase(request, async () => {
      const { id } = await context.params;
      const contentType = request.headers.get("content-type") ?? "";
      const payload: unknown = contentType.includes("application/json") ? await request.json() : {};
      return Response.json({ document: createReturnFromDocument(Number(id), payload) }, { status: 201 });
    });
  } catch (error) { return errorResponse(error); }
}
