import {
  createClientCategory,
  deleteClientCategory,
  listClientCategories,
  SqliteValidationError,
  updateClientCategory,
} from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json({ error: message }, { status: error instanceof SqliteValidationError || error instanceof SyntaxError ? 400 : 500 });
}

export function GET() {
  return Response.json({ categories: listClientCategories() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try { return Response.json({ category: createClientCategory(await request.json()) }, { status: 201 }); } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: Request) {
  try { return Response.json({ category: updateClientCategory(await request.json()) }); } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const input = await request.json() as { id?: unknown };
    return Response.json({ category: deleteClientCategory(input.id) });
  } catch (error) { return errorResponse(error); }
}
