import { createParty, deleteParty, listPartyBalanceHistory, listParties, SqliteValidationError, type PartyKind, updateParty } from "@/lib/sqlite";
import { AccountAuthenticationError, withAccountDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  const status = error instanceof AccountAuthenticationError ? error.status : error instanceof SqliteValidationError || error instanceof SyntaxError ? 400 : 500;
  return Response.json({ error: message }, { status });
}
function queryKind(value: string | null): PartyKind | undefined {
  if (value === null || value === "") return undefined;
  if (value === "client" || value === "supplier") return value;
  throw new SqliteValidationError("Le paramètre kind doit être client ou supplier.");
}
export async function GET(request: Request) {
  try { return withAccountDatabase(request, () => { const parameters = new URL(request.url).searchParams; if (parameters.get("history") === "balance") return Response.json({ history: listPartyBalanceHistory(parameters.get("party_id")) }, { headers: { "Cache-Control": "no-store" } }); const kind = queryKind(parameters.get("kind")); return Response.json({ parties: listParties(kind) }, { headers: { "Cache-Control": "no-store" } }); }); } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json({ party: createParty(await request.json()) }, { status: 201 })); } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json({ party: updateParty(await request.json()) })); } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request) {
  try { return await withAccountDatabase(request, async () => { const input = await request.json() as { id?: unknown }; return Response.json({ party: deleteParty(input.id) }); }); } catch (error) { return errorResponse(error); }
}
