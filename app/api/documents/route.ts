import {
  createDocument,
  listDocuments,
  SqliteValidationError,
  type DocumentDirection,
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
  const direction = new URL(request.url).searchParams.get("direction");
  const validDirection = direction === "purchases" || direction === "sales"
    ? direction as DocumentDirection
    : undefined;
  return Response.json(
    { documents: listDocuments(validDirection) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  try {
    const document = createDocument(await request.json());
    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
