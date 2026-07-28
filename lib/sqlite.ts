import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  ARTICLE_SEEDS,
  CREATE_ARTICLES_SKU_INDEX_SQL,
  CREATE_ARTICLES_TABLE_SQL,
} from "../db/schema";

export type ArticleRecord = {
  id: number;
  name: string;
  sku: string;
  brand: string;
  brand_logo: string;
  category: string;
  purchase_price: number;
  sale_price: number;
  stock: number;
  status: string;
  updated_at: string;
};

type AxxamGlobal = typeof globalThis & {
  __axxamSqlite?: DatabaseSync;
};

const globalForSqlite = globalThis as AxxamGlobal;

function openDatabase() {
  const configuredPath = process.env.AXXAM_SQLITE_PATH || "data/axxam.sqlite";
  const databasePath = resolve(process.cwd(), configuredPath);
  mkdirSync(dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA journal_mode = DELETE");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec("PRAGMA busy_timeout = 5000");
  database.exec(CREATE_ARTICLES_TABLE_SQL);
  database.exec(CREATE_ARTICLES_SKU_INDEX_SQL);

  const seed = database.prepare(`
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
  `);

  for (const article of ARTICLE_SEEDS) {
    seed.run(
      article.name,
      article.sku,
      article.brand,
      article.brandLogo,
      article.category,
      article.purchasePrice,
      article.salePrice,
      article.stock,
      article.status,
    );
  }

  return database;
}

function getDatabase() {
  if (!globalForSqlite.__axxamSqlite) {
    globalForSqlite.__axxamSqlite = openDatabase();
  }
  return globalForSqlite.__axxamSqlite;
}

export function listArticles(): ArticleRecord[] {
  const rows = getDatabase().prepare(`
    SELECT
      id, name, sku, brand, brand_logo, category,
      purchase_price, sale_price, stock, status, updated_at
    FROM articles
    ORDER BY id ASC
  `).all();

  return rows as unknown as ArticleRecord[];
}
