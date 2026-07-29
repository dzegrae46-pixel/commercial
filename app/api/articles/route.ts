import {
  createArticle,
  deleteArticle,
  listArticles,
  listCategoryTree,
  SqliteValidationError,
  updateArticle,
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
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? url.searchParams.get("query") ?? "";
  return Response.json(
    { articles: listArticles(query), categories: listCategoryTree() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  try {
    const article = createArticle(await request.json());
    return Response.json({ article }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH supports regular article edits and a compact stock operation:
 * { id, stock_delta: -2, reason: "Retour fournisseur" }.
 */
export async function PATCH(request: Request) {
  try {
    const article = updateArticle(await request.json());
    return Response.json({ article });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = await request.json() as { id?: unknown };
    const article = deleteArticle(input.id);
    return Response.json({ article });
  } catch (error) {
    return errorResponse(error);
  }
}
