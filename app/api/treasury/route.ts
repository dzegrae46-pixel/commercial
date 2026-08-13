import { createTreasuryEntry, deleteTreasuryEntry, listTreasuryEntries, listTreasuryLedger, SqliteValidationError, updateTreasuryEntry } from "@/lib/sqlite";
import { AccountAuthenticationError, withAccountDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  const status = error instanceof AccountAuthenticationError ? error.status : error instanceof SqliteValidationError ? 400 : 500;
  return Response.json({ error: message }, { status });
}
export async function GET(request: Request) {
  try { return withAccountDatabase(request, () => Response.json({ entries: listTreasuryEntries(), ledger: listTreasuryLedger() }, { headers: { "Cache-Control": "no-store" } })); } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json({ entry: createTreasuryEntry(await request.json()) }, { status: 201 })); } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json({ entry: updateTreasuryEntry(await request.json()) })); } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request) {
  try { return await withAccountDatabase(request, async () => { const input = await request.json() as { id?: unknown }; return Response.json({ entry: deleteTreasuryEntry(input.id) }); }); } catch (error) { return errorResponse(error); }
}
