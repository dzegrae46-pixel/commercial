import {
  createTreasuryEntry,
  deleteTreasuryEntry,
  listTreasuryEntries,
  listTreasuryLedger,
  SqliteValidationError,
  updateTreasuryEntry,
} from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json({ error: message }, { status: error instanceof SqliteValidationError ? 400 : 500 });
}

export function GET() {
  try {
    return Response.json(
      { entries: listTreasuryEntries(), ledger: listTreasuryLedger() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    return Response.json({ entry: createTreasuryEntry(await request.json()) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    return Response.json({ entry: updateTreasuryEntry(await request.json()) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = await request.json() as { id?: unknown };
    return Response.json({ entry: deleteTreasuryEntry(input.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
