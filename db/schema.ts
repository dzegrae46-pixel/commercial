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
    purchase_prices_json TEXT NOT NULL DEFAULT '[]',
    sale_price REAL NOT NULL DEFAULT 0,
    sale_prices_json TEXT NOT NULL DEFAULT '[]',
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

/** Standalone catalog nodes keep empty categories visible and editable before
 * the first article is assigned to them. */
export const CREATE_CATALOG_CATEGORIES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS catalog_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL CHECK(level IN (1, 2, 3)),
    name TEXT NOT NULL COLLATE NOCASE,
    category TEXT NOT NULL DEFAULT '' COLLATE NOCASE,
    subcategory TEXT NOT NULL DEFAULT '' COLLATE NOCASE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(level, name, category, subcategory)
  )
`;

export const CREATE_CATALOG_CATEGORIES_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS catalog_categories_tree_idx ON catalog_categories (level, category, subcategory, name COLLATE NOCASE)";

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
    client_category TEXT NOT NULL DEFAULT 'Standard',
    image_url TEXT NOT NULL DEFAULT '',
    nif TEXT NOT NULL DEFAULT '',
    nis TEXT NOT NULL DEFAULT '',
    rc TEXT NOT NULL DEFAULT '',
    tax_article TEXT NOT NULL DEFAULT '',
    rib TEXT NOT NULL DEFAULT '',
    contact_status TEXT NOT NULL DEFAULT 'Actif',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_PARTIES_KIND_NAME_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS parties_kind_name_idx ON parties (kind, name COLLATE NOCASE)";

export const CREATE_CLIENT_CATEGORIES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS client_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_CLIENT_CATEGORIES_NAME_INDEX_SQL =
  "CREATE UNIQUE INDEX IF NOT EXISTS client_categories_name_idx ON client_categories (name COLLATE NOCASE)";

export const CREATE_DOCUMENTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT NOT NULL UNIQUE,
    direction TEXT NOT NULL CHECK(direction IN ('purchases', 'sales')),
    type TEXT NOT NULL CHECK(type IN ('quote', 'order', 'delivery', 'invoice', 'return')),
    party_id INTEGER REFERENCES parties(id) ON DELETE RESTRICT,
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

export const CREATE_DOCUMENTS_PARTY_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS documents_party_idx ON documents (party_id, direction, document_date DESC)";

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

/** Payments are kept separately from commercial documents so a partial payment
 * can be recorded without mutating the invoice that justified it. */
export const CREATE_PAYMENTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE RESTRICT,
    direction TEXT NOT NULL CHECK(direction IN ('incoming', 'outgoing')),
    amount REAL NOT NULL CHECK(amount > 0),
    previous_balance REAL,
    payment_date TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'Virement',
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_PAYMENTS_PARTY_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS payments_party_idx ON payments (party_id, payment_date DESC)";

/** Nullable on legacy rows because their exact pre-payment balance cannot be
 * reconstructed reliably after later documents or payments have been added. */
export const PAYMENT_COLUMN_MIGRATIONS = [
  {
    name: "previous_balance",
    sql: "ALTER TABLE payments ADD COLUMN previous_balance REAL",
  },
] as const;

/** Independent operating expenses and charges shown in the Finance workspace. */
export const CREATE_FINANCE_ENTRIES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS finance_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK(kind IN ('expense', 'charge')),
    label TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    amount REAL NOT NULL CHECK(amount > 0),
    entry_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Payée',
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_FINANCE_ENTRIES_DATE_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS finance_entries_date_idx ON finance_entries (entry_date DESC, id DESC)";

/** Employees, attendance and payroll stay local in the same SQLite file. */
export const CREATE_EMPLOYEES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    job_title TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    base_salary REAL NOT NULL DEFAULT 0 CHECK(base_salary >= 0),
    hire_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Actif' CHECK(status IN ('Actif', 'Inactif')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_EMPLOYEES_NAME_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS employees_name_idx ON employees (name COLLATE NOCASE)";

export const CREATE_EMPLOYEE_ATTENDANCE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS employee_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Présent' CHECK(status IN ('Présent', 'Absent', 'Congé')),
    check_in TEXT NOT NULL DEFAULT '',
    check_out TEXT NOT NULL DEFAULT '',
    hours REAL NOT NULL DEFAULT 0 CHECK(hours >= 0),
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, work_date)
  )
`;

export const CREATE_EMPLOYEE_ATTENDANCE_DATE_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS employee_attendance_date_idx ON employee_attendance (work_date DESC, employee_id)";

/** A salary payment owns one generated finance charge. The treasury ledger is
 * already derived from paid finance entries, so payroll is deducted once. */
export const CREATE_SALARY_PAYMENTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS salary_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    finance_entry_id INTEGER NOT NULL UNIQUE REFERENCES finance_entries(id) ON DELETE RESTRICT,
    payroll_month TEXT NOT NULL,
    base_amount REAL NOT NULL DEFAULT 0,
    bonus REAL NOT NULL DEFAULT 0,
    deduction REAL NOT NULL DEFAULT 0,
    amount REAL NOT NULL CHECK(amount > 0),
    payment_date TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'Virement',
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, payroll_month)
  )
`;

export const CREATE_SALARY_PAYMENTS_EMPLOYEE_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS salary_payments_employee_idx ON salary_payments (employee_id, payment_date DESC)";

/** Manual treasury adjustments. Customer/supplier payments and operating
 * charges are merged into the treasury ledger at read time, so they are never
 * duplicated and every inflow/outflow stays traceable to its source. */
export const CREATE_TREASURY_ENTRIES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS treasury_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    direction TEXT NOT NULL CHECK(direction IN ('in', 'out')),
    label TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    amount REAL NOT NULL CHECK(amount > 0),
    entry_date TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

export const CREATE_TREASURY_ENTRIES_DATE_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS treasury_entries_date_idx ON treasury_entries (entry_date DESC, id DESC)";

/** User-reported errors and product proposals. Keeping this in SQLite makes
 * the feedback workspace available offline alongside the commercial data. */
export const CREATE_FEEDBACK_ITEMS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS feedback_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'bug' CHECK(type IN ('bug', 'suggestion')),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
    reporter TEXT NOT NULL DEFAULT 'Utilisateur',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT
  )
`;

export const CREATE_FEEDBACK_ITEMS_STATUS_INDEX_SQL =
  "CREATE INDEX IF NOT EXISTS feedback_items_status_idx ON feedback_items (status, created_at DESC, id DESC)";

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
    name: "sale_prices_json",
    sql: "ALTER TABLE articles ADD COLUMN sale_prices_json TEXT NOT NULL DEFAULT '[]'",
  },
  {
    name: "purchase_prices_json",
    sql: "ALTER TABLE articles ADD COLUMN purchase_prices_json TEXT NOT NULL DEFAULT '[]'",
  },
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
    name: "contact_status",
    sql: "ALTER TABLE parties ADD COLUMN contact_status TEXT NOT NULL DEFAULT 'Actif'",
  },
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
    name: "client_category",
    sql: "ALTER TABLE parties ADD COLUMN client_category TEXT NOT NULL DEFAULT 'Standard'",
  },
  {
    name: "image_url",
    sql: "ALTER TABLE parties ADD COLUMN image_url TEXT NOT NULL DEFAULT ''",
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
  {
    name: "tax_article",
    sql: "ALTER TABLE parties ADD COLUMN tax_article TEXT NOT NULL DEFAULT ''",
  },
  {
    name: "rib",
    sql: "ALTER TABLE parties ADD COLUMN rib TEXT NOT NULL DEFAULT ''",
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

/** Additive document columns for databases created before documents referenced
 * parties by their stable identifier.  The nullable column lets unmatched
 * historical snapshots remain readable while lib/sqlite.ts backfills every
 * document whose canonical party can be identified. */
export const DOCUMENT_COLUMN_MIGRATIONS = [
  {
    name: "party_id",
    sql: "ALTER TABLE documents ADD COLUMN party_id INTEGER REFERENCES parties(id) ON DELETE RESTRICT",
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
  clientCategory?: string;
  imageUrl: string;
  nif: string;
  nis: string;
  rc: string;
  taxArticle: string;
  rib: string;
};

/**
 * A clean offline database starts with exactly one customer and one supplier.
 * They remain intentionally simple and can be replaced from the UI.
 */
export const PARTY_SEEDS: readonly PartySeed[] = [
  {
    kind: "client",
    name: "JURA SCHOOL",
    contactPhone: "0770 00 00 00",
    contactName: "Administration",
    email: "contact@juraschool.dz",
    address: "Cité Edimco",
    city: "Béjaïa",
    headOffice: "Cité Edimco, Béjaïa",
    category: "Éducation",
    imageUrl: "",
    nif: "",
    nis: "",
    rc: "",
    taxArticle: "",
    rib: "",
  },
  {
    kind: "supplier",
    name: "TECH DISTRIBUTION BÉJAÏA",
    contactPhone: "0559 00 00 00",
    contactName: "Service commercial",
    email: "commercial@techdistribution.dz",
    address: "Zone industrielle",
    city: "Béjaïa",
    headOffice: "Zone industrielle, Béjaïa",
    category: "Informatique",
    imageUrl: "",
    nif: "",
    nis: "",
    rc: "",
    taxArticle: "",
    rib: "",
  },
];

/**
 * The seed runs once per database and creates exactly one starter article.
 */
export const ARTICLE_SEEDS: readonly ArticleSeed[] = [
  {
    name: "Formation Fibre",
    sku: "ART0049",
    brand: "GSR",
    brandLogo: "",
    category: "Formation",
    subcategory: "Réseaux",
    subsubcategory: "Fibre optique",
    description: "Formation pratique en installation et maintenance de réseaux fibre optique.",
    unit: "Séance",
    imageUrl: "",
    purchasePrice: 1_000,
    salePrice: 1_500,
    stock: 6,
    status: "Stock faible",
  },
];
