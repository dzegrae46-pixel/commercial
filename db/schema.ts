/**
 * SQLite schema shared by the offline API.  The column defaults are deliberate:
 * an Axxam database created by an older version can be upgraded in place without
 * losing any article already entered by the user.
 */
export const CREATE_ARTICLES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL DEFAULT '',
    brand_logo TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Non classée',
    subcategory TEXT NOT NULL DEFAULT '',
    subsubcategory TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    unit TEXT NOT NULL DEFAULT 'Unité',
    image_url TEXT NOT NULL DEFAULT '',
    purchase_price REAL NOT NULL DEFAULT 0,
    sale_price REAL NOT NULL DEFAULT 0,
    stock REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'En stock',
    is_deleted INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_ARTICLES_SKU_INDEX_SQL =
  "CREATE UNIQUE INDEX IF NOT EXISTS articles_sku_idx ON articles (sku)";

export const CREATE_ARTICLES_CATEGORY_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS articles_category_idx ON articles (category, subcategory, subsubcategory)";

/**
 * Shared third-parties for the Clients and Suppliers views.  `kind` is kept on
 * the record (instead of separate tables) so a business can legitimately be
 * both a customer and a supplier, with independent contact and fiscal data.
 */
export const CREATE_PARTIES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS parties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK(kind IN ('client', 'supplier')),
    name TEXT NOT NULL,
    contact_phone TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    head_office TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    nif TEXT NOT NULL DEFAULT '',
    nis TEXT NOT NULL DEFAULT '',
    rc TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_PARTIES_KIND_NAME_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS parties_kind_name_idx ON parties (kind, name COLLATE NOCASE)";

export const CREATE_DOCUMENTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT NOT NULL UNIQUE,
    direction TEXT NOT NULL CHECK(direction IN ('purchases', 'sales')),
    type TEXT NOT NULL CHECK(type IN ('quote', 'order', 'delivery', 'invoice', 'return')),
    party_name TEXT NOT NULL,
    source_document_id INTEGER REFERENCES documents(id),
    source_document_number TEXT NOT NULL DEFAULT '',
    document_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Brouillon',
    show_description INTEGER NOT NULL DEFAULT 0,
    subtotal REAL NOT NULL DEFAULT 0,
    discount_amount REAL NOT NULL DEFAULT 0,
    tax_rate REAL NOT NULL DEFAULT 0,
    tax_amount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    stock_applied INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_DOCUMENT_LINES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS document_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    designation TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    unit TEXT NOT NULL DEFAULT 'Unité',
    quantity REAL NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL DEFAULT 0,
    discount_percent REAL NOT NULL DEFAULT 0,
    tax_rate REAL NOT NULL DEFAULT 0,
    line_total REAL NOT NULL DEFAULT 0
  )
`;

export const CREATE_DOCUMENTS_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS documents_direction_type_idx ON documents (direction, type, document_date DESC)";

export const CREATE_DOCUMENT_LINES_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS document_lines_document_idx ON document_lines (document_id)";

export const CREATE_STOCK_MOVEMENTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    quantity_delta REAL NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_STOCK_MOVEMENTS_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS stock_movements_article_idx ON stock_movements (article_id, created_at DESC)";

export const CREATE_APP_META_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

/** Columns added to pre-catalog databases by lib/sqlite.ts after table creation. */
export const ARTICLE_COLUMN_MIGRATIONS = [
  {
    name: "subcategory",
    sql: "ALTER TABLE articles ADD COLUMN subcategory TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "subsubcategory",
    sql: "ALTER TABLE articles ADD COLUMN subsubcategory TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "description",
    sql: "ALTER TABLE articles ADD COLUMN description TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "unit",
    sql: "ALTER TABLE articles ADD COLUMN unit TEXT NOT NULL DEFAULT 'Unité'",
  },
  {
    name: "image_url",
    sql: "ALTER TABLE articles ADD COLUMN image_url TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "is_deleted",
    sql: "ALTER TABLE articles ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0",
  },
] as const;

/**
 * Kept additive for a local database created by an early prerelease of the
 * parties API.  The core `id`, `kind` and `name` fields are required by the
 * original table; all later contact fields can safely be added in place.
 */
export const PARTY_COLUMN_MIGRATIONS = [
  {
    name: "contact_phone",
    sql: "ALTER TABLE parties ADD COLUMN contact_phone TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "contact_name",
    sql: "ALTER TABLE parties ADD COLUMN contact_name TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "email",
    sql: "ALTER TABLE parties ADD COLUMN email TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "address",
    sql: "ALTER TABLE parties ADD COLUMN address TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "city",
    sql: "ALTER TABLE parties ADD COLUMN city TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "head_office",
    sql: "ALTER TABLE parties ADD COLUMN head_office TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "category",
    sql: "ALTER TABLE parties ADD COLUMN category TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "nif",
    sql: "ALTER TABLE parties ADD COLUMN nif TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "nis",
    sql: "ALTER TABLE parties ADD COLUMN nis TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "rc",
    sql: "ALTER TABLE parties ADD COLUMN rc TEXT NOT NULL DEFAULT ''",
  },
  // SQLite only permits a constant default in ADD COLUMN. New databases use
  // CURRENT_TIMESTAMP above; a legacy row keeps an empty historical timestamp.
  {
    name: "created_at",
    sql: "ALTER TABLE parties ADD COLUMN created_at TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "updated_at",
    sql: "ALTER TABLE parties ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''",
  },
] as const;

export type ArticleSeed = {
  name: string;
  sku: string;
  brand: string;
  brandLogo: string;
  category: string;
  subcategory: string;
  subsubcategory: string;
  description: string;
  unit: string;
  imageUrl: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  status: string;
};

export type PartySeed = {
  kind: "client" | "supplier";
  name: string;
  contactPhone: string;
  contactName: string;
  email: string;
  address: string;
  city: string;
  headOffice: string;
  category: string;
  nif: string;
  nis: string;
  rc: string;
};

/**
 * A clean offline database starts with only Google and Amazon in each list.
 * Fiscal values are intentionally blank: they must come from the user's own
 * legal records rather than being invented as demo data.
 */
export const PARTY_SEEDS: readonly PartySeed[] = [
  {
    kind: "client",
    name: "Google",
    contactPhone: "+1 650 253 0000",
    contactName: "Google Business",
    email: "contact@google.com",
    address: "1600 Amphitheatre Parkway",
    city: "Mountain View",
    headOffice: "Google LLC, Mountain View",
    category: "Technologie",
    nif: "",
    nis: "",
    rc: "",
  },
  {
    kind: "client",
    name: "Amazon",
    contactPhone: "+1 206 266 1000",
    contactName: "Amazon Business",
    email: "contact@amazon.com",
    address: "410 Terry Avenue North",
    city: "Seattle",
    headOffice: "Amazon.com, Inc., Seattle",
    category: "Commerce en ligne",
    nif: "",
    nis: "",
    rc: "",
  },
  {
    kind: "supplier",
    name: "Google",
    contactPhone: "+1 650 253 0000",
    contactName: "Google Business",
    email: "contact@google.com",
    address: "1600 Amphitheatre Parkway",
    city: "Mountain View",
    headOffice: "Google LLC, Mountain View",
    category: "Technologie",
    nif: "",
    nis: "",
    rc: "",
  },
  {
    kind: "supplier",
    name: "Amazon",
    contactPhone: "+1 206 266 1000",
    contactName: "Amazon Business",
    email: "contact@amazon.com",
    address: "410 Terry Avenue North",
    city: "Seattle",
    headOffice: "Amazon.com, Inc., Seattle",
    category: "Commerce en ligne",
    nif: "",
    nis: "",
    rc: "",
  },
];

/**
 * The seed runs once per database.  It gives a clean offline installation two
 * brand examples plus the four catalogue cards used by the Articles grid.
 */
export const ARTICLE_SEEDS: readonly ArticleSeed[] = [
  {
    name: "Google Pixel 9 Pro",
    sku: "ART-GOO-001",
    brand: "Google",
    brandLogo: "/brands/google.png",
    category: "Électronique",
    subcategory: "Smartphones",
    subsubcategory: "Android premium",
    description: "Smartphone Google Pixel 9 Pro avec écran OLED et appareil photo avancé.",
    unit: "Unité",
    imageUrl: "",
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
    subcategory: "Audio",
    subsubcategory: "Assistants vocaux",
    description: "Enceinte connectée compacte Amazon Echo Dot avec assistant vocal Alexa.",
    unit: "Unité",
    imageUrl: "",
    purchasePrice: 6_200,
    salePrice: 8_900,
    stock: 7,
    status: "Stock faible",
  },
  {
    name: "MacBook Pro M1 Pro 14\" 512GB",
    sku: "ART-APP-003",
    brand: "Apple",
    brandLogo: "",
    category: "Informatique",
    subcategory: "Ordinateurs",
    subsubcategory: "Ordinateurs portables",
    description: "MacBook Pro 14 pouces avec puce M1 Pro, 16 Go de mémoire et SSD 512 Go.",
    unit: "Unité",
    imageUrl: "/products/macbook-pro-14.png",
    purchasePrice: 218_000,
    salePrice: 249_900,
    stock: 12,
    status: "En stock",
  },
  {
    name: "iMac M1 24\" 4K",
    sku: "ART-APP-004",
    brand: "Apple",
    brandLogo: "",
    category: "Informatique",
    subcategory: "Ordinateurs",
    subsubcategory: "Ordinateurs de bureau",
    description: "iMac 24 pouces M1 avec écran Retina 4,5K et 512 Go de stockage.",
    unit: "Unité",
    imageUrl: "/products/imac-24.png",
    purchasePrice: 175_000,
    salePrice: 197_900,
    stock: 11,
    status: "En stock",
  },
  {
    name: "MacBook Air M1 13\" 256GB",
    sku: "ART-APP-005",
    brand: "Apple",
    brandLogo: "",
    category: "Informatique",
    subcategory: "Ordinateurs",
    subsubcategory: "Ordinateurs portables",
    description: "MacBook Air 13 pouces avec puce M1, format fin et SSD 256 Go.",
    unit: "Unité",
    imageUrl: "/products/macbook-air-13.png",
    purchasePrice: 145_000,
    salePrice: 169_900,
    stock: 10,
    status: "Stock faible",
  },
  {
    name: "MacBook Pro M3 Max 16\"",
    sku: "ART-APP-006",
    brand: "Apple",
    brandLogo: "",
    category: "Informatique",
    subcategory: "Ordinateurs",
    subsubcategory: "Stations de travail mobiles",
    description: "MacBook Pro 16 pouces avec puce M3 Max pour les charges de travail créatives exigeantes.",
    unit: "Unité",
    imageUrl: "/products/macbook-pro-16.png",
    purchasePrice: 312_000,
    salePrice: 359_900,
    stock: 8,
    status: "Stock faible",
  },
];
