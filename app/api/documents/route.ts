import {
  createDocument,
  deleteDocument,
  listDocuments,
  SqliteValidationError,
  updateDocument,
} from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json(
    { error: message },
    { status: error instanceof SqliteValidationError ? 400 : 500 },
  );
}

export function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const direction = params.get("direction");
    if (direction !== null && direction !== "purchases" && direction !== "sales") {
      throw new SqliteValidationError("Le paramètre direction doit être purchases ou sales.");
    }
    const partyId = params.get("party_id");
    return Response.json(
      { documents: listDocuments(direction ?? undefined, partyId ?? undefined) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const document = createDocument(await request.json());
    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const document = updateDocument(await request.json());
    return Response.json({ document });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = await request.json() as { id?: unknown };
    const document = deleteDocument(input.id);
    return Response.json({ document });
  } catch (error) {
    return errorResponse(error);
  }
}
