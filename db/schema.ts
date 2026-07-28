export const CREATE_ARTICLES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    brand_logo TEXT NOT NULL,
    category TEXT NOT NULL,
    purchase_price REAL NOT NULL DEFAULT 0,
    sale_price REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'En stock',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_ARTICLES_SKU_INDEX_SQL =
  "CREATE UNIQUE INDEX IF NOT EXISTS articles_sku_idx ON articles (sku)";

export const ARTICLE_SEEDS = [
  {
    name: "Google Pixel 9 Pro",
    sku: "ART-GOO-001",
    brand: "Google",
    brandLogo: "/brands/google.png",
    category: "Électronique",
    purchasePrice: 95_000,
    salePrice: 119_900,
    stock: 18,
    status: "En stock",
  },
  {
    name: "Amazon Echo Dot",
    sku: "ART-AMZ-002",
    brand: "Amazon",
    brandLogo: "/brands/amazon.svg",
    category: "Maison connectée",
    purchasePrice: 6_200,
    salePrice: 8_900,
    stock: 7,
    status: "Stock faible",
  },
] as const;
