import { createFeedback, deleteFeedback, listFeedback, SqliteValidationError, updateFeedback } from "@/lib/sqlite";
import { AccountAuthenticationError, withAccountDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  const status = error instanceof AccountAuthenticationError ? error.status : error instanceof SqliteValidationError || error instanceof SyntaxError ? 400 : 500;
  return Response.json({ error: message }, { status });
}
export async function GET(request: Request) {
  try { return withAccountDatabase(request, () => { const url = new URL(request.url); return Response.json({ feedback: listFeedback(url.searchParams.get("query") ?? "", url.searchParams.get("status") ?? "all") }, { headers: { "Cache-Control": "no-store" } }); }); } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json({ feedback: createFeedback(await request.json()) }, { status: 201 })); } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json({ feedback: updateFeedback(await request.json()) })); } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request) {
  try { return await withAccountDatabase(request, async () => { const input = await request.json() as { id?: unknown }; return Response.json({ feedback: deleteFeedback(input.id) }); }); } catch (error) { return errorResponse(error); }
}
