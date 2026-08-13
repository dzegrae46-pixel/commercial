import { createDocument, deleteDocument, listDocuments, SqliteValidationError, updateDocument } from "@/lib/sqlite";
import { AccountAuthenticationError, withAccountDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  const status = error instanceof AccountAuthenticationError ? error.status : error instanceof SqliteValidationError ? 400 : 500;
  return Response.json({ error: message }, { status });
}
export async function GET(request: Request) {
  try { return withAccountDatabase(request, () => { const params = new URL(request.url).searchParams; const direction = params.get("direction"); if (direction !== null && direction !== "purchases" && direction !== "sales") throw new SqliteValidationError("Le paramètre direction doit être purchases ou sales."); return Response.json({ documents: listDocuments(direction ?? undefined, params.get("party_id") ?? undefined) }, { headers: { "Cache-Control": "no-store" } }); }); } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json({ document: createDocument(await request.json()) }, { status: 201 })); } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json({ document: updateDocument(await request.json()) })); } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request) {
  try { return await withAccountDatabase(request, async () => { const input = await request.json() as { id?: unknown }; return Response.json({ document: deleteDocument(input.id) }); }); } catch (error) { return errorResponse(error); }
}
