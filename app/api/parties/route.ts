import {
  createParty,
  listParties,
  SqliteValidationError,
  type PartyKind,
} from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json(
    { error: message },
    { status: error instanceof SqliteValidationError || error instanceof SyntaxError ? 400 : 500 },
  );
}

function queryKind(value: string | null): PartyKind | undefined {
  if (value === null || value === "") return undefined;
  if (value === "client" || value === "supplier") return value;
  throw new SqliteValidationError("Le paramÃ¨tre kind doit Ãªtre client ou supplier.");
}

/**
 * GET /api/parties?kind=client|supplier
 * Omitting `kind` intentionally returns both lists, useful for document forms.
 */
export function GET(request: Request) {
  try {
    const kind = queryKind(new URL(request.url).searchParams.get("kind"));
    return Response.json(
      { parties: listParties(kind) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/parties
 * Body: { kind, name, contact_phone, contact_name, email, address, city,
 *         head_office, category, nif, nis, rc }.
 */
export async function POST(request: Request) {
  try {
    const party = createParty(await request.json());
    return Response.json({ party }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
