import {
  createFinanceEntry,
  deleteFinanceEntry,
  listFinanceEntries,
  SqliteValidationError,
} from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json({ error: message }, { status: error instanceof SqliteValidationError ? 400 : 500 });
}

export function GET() {
  return Response.json({ entries: listFinanceEntries() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const entry = createFinanceEntry(await request.json());
    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = await request.json() as { id?: unknown };
    const entry = deleteFinanceEntry(input.id);
    return Response.json({ entry });
  } catch (error) {
    return errorResponse(error);
  }
}
