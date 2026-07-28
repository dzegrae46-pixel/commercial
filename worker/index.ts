/** Cloudflare Worker entry point for Axxam Workspace. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import {
  ARTICLE_SEEDS,
  CREATE_ARTICLES_SKU_INDEX_SQL,
  CREATE_ARTICLES_TABLE_SQL,
} from "../db/schema";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

async function getArticles(db: D1Database): Promise<Response> {
  await db.batch([
    db.prepare(CREATE_ARTICLES_TABLE_SQL),
    db.prepare(CREATE_ARTICLES_SKU_INDEX_SQL),
  ]);

  const seedSql = `
    INSERT INTO articles (
      name, sku, brand, brand_logo, category,
      purchase_price, sale_price, stock, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sku) DO UPDATE SET
      name = excluded.name,
      brand = excluded.brand,
      brand_logo = excluded.brand_logo,
      category = excluded.category,
      purchase_price = excluded.purchase_price,
      sale_price = excluded.sale_price,
      stock = excluded.stock,
      status = excluded.status
  `;

  await db.batch(ARTICLE_SEEDS.map((article) =>
    db.prepare(seedSql).bind(
      article.name,
      article.sku,
      article.brand,
      article.brandLogo,
      article.category,
      article.purchasePrice,
      article.salePrice,
      article.stock,
      article.status,
    ),
  ));

  const { results } = await db.prepare(`
    SELECT
      id, name, sku, brand, brand_logo, category,
      purchase_price, sale_price, stock, status, updated_at
    FROM articles
    ORDER BY id ASC
  `).all();

  return Response.json({ articles: results }, {
    headers: { "Cache-Control": "no-store" },
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/articles") {
      if (request.method !== "GET") {
        return Response.json({ error: "Méthode non autorisée" }, { status: 405 });
      }
      return getArticles(env.DB);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
