import { listArticles } from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return Response.json(
    { articles: listArticles() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
