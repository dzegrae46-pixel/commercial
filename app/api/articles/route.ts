import {
  createArticle,
  deleteArticle,
  getNextArticleSku,
  listArticles,
  listCategoryTree,
  SqliteValidationError,
  updateArticle,
} from "@/lib/sqlite";
import { AccountAuthenticationError, withAccountDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  const status = error instanceof AccountAuthenticationError ? error.status : error instanceof SqliteValidationError ? 400 : 500;
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    return withAccountDatabase(request, () => {
      const url = new URL(request.url);
      const query = url.searchParams.get("q") ?? url.searchParams.get("query") ?? "";
      return Response.json(
        { articles: listArticles(query), categories: listCategoryTree(), next_sku: getNextArticleSku() },
        { headers: { "Cache-Control": "no-store" } },
      );
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    return await withAccountDatabase(request, async () => Response.json({ article: createArticle(await request.json()) }, { status: 201 }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    return await withAccountDatabase(request, async () => Response.json({ article: updateArticle(await request.json()) }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    return await withAccountDatabase(request, async () => {
      const input = await request.json() as { id?: unknown };
      return Response.json({ article: deleteArticle(input.id) });
    });
  } catch (error) {
    return errorResponse(error);
  }
}
