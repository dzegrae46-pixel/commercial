import {
  listPayments,
  settleParty,
  SqliteValidationError,
} from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json({ error: message }, { status: error instanceof SqliteValidationError ? 400 : 500 });
}

export function GET(request: Request) {
  try {
    const partyId = new URL(request.url).searchParams.get("party_id");
    if (partyId === "") throw new SqliteValidationError("Le paramètre party_id est invalide.");
    return Response.json({ payments: listPayments(partyId ?? undefined) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const settlement = settleParty(await request.json());
    return Response.json(settlement, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
