import { listPayments, settleParty, SqliteValidationError } from "@/lib/sqlite";
import { AccountAuthenticationError, withAccountDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  const status = error instanceof AccountAuthenticationError ? error.status : error instanceof SqliteValidationError ? 400 : 500;
  return Response.json({ error: message }, { status });
}
export async function GET(request: Request) {
  try { return withAccountDatabase(request, () => { const partyId = new URL(request.url).searchParams.get("party_id"); if (partyId === "") throw new SqliteValidationError("Le paramètre party_id est invalide."); return Response.json({ payments: listPayments(partyId ?? undefined) }, { headers: { "Cache-Control": "no-store" } }); }); } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { return await withAccountDatabase(request, async () => Response.json(settleParty(await request.json()), { status: 201 })); } catch (error) { return errorResponse(error); }
}
