import {
  createFeedback,
  deleteFeedback,
  listFeedback,
  SqliteValidationError,
  updateFeedback,
} from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json({ error: message }, { status: error instanceof SqliteValidationError || error instanceof SyntaxError ? 400 : 500 });
}

export function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return Response.json({
      feedback: listFeedback(url.searchParams.get("query") ?? "", url.searchParams.get("status") ?? "all"),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    return Response.json({ feedback: createFeedback(await request.json()) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    return Response.json({ feedback: updateFeedback(await request.json()) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = await request.json() as { id?: unknown };
    return Response.json({ feedback: deleteFeedback(input.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
