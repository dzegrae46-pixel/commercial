import {
  addArticleCategory,
  deleteArticleCategory,
  listCategoryTree,
  renameArticleCategory,
  SqliteValidationError,
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

export function GET() {
  return Response.json(
    { categories: listCategoryTree() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  try {
    return Response.json(addArticleCategory(await request.json()), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    return Response.json(renameArticleCategory(await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    return Response.json(deleteArticleCategory(await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}
