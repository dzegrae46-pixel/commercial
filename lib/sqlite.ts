import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  ARTICLE_COLUMN_MIGRATIONS,
  ARTICLE_SEEDS,
  CREATE_APP_META_TABLE_SQL,
  CREATE_ARTICLES_CATEGORY_INDEX_SQL,
  CREATE_ARTICLES_SKU_INDEX_SQL,
  CREATE_ARTICLES_TABLE_SQL,
  CREATE_DOCUMENT_LINES_INDEX_SQL,
  CREATE_DOCUMENT_LINES_TABLE_SQL,
  CREATE_DOCUMENTS_INDEX_SQL,
  CREATE_DOCUMENTS_PARTY_INDEX_SQL,
  CREATE_DOCUMENTS_TABLE_SQL,
  CREATE_FINANCE_ENTRIES_DATE_INDEX_SQL,
  CREATE_FINANCE_ENTRIES_TABLE_SQL,
  CREATE_PARTIES_KIND_NAME_INDEX_SQL,
  CREATE_PARTIES_TABLE_SQL,
  CREATE_PAYMENTS_PARTY_INDEX_SQL,
  CREATE_PAYMENTS_TABLE_SQL,
  CREATE_STOCK_MOVEMENTS_INDEX_SQL,
  CREATE_STOCK_MOVEMENTS_TABLE_SQL,
  CREATE_TREASURY_ENTRIES_DATE_INDEX_SQL,
  CREATE_TREASURY_ENTRIES_TABLE_SQL,
  DOCUMENT_COLUMN_MIGRATIONS,
  PARTY_COLUMN_MIGRATIONS,
  PARTY_SEEDS,
} from "../db/schema";

export type ArticleRecord = {
  id: number;
  name: string;
  sku: string;
  brand: string;
  brand_logo: string;
  category: string;
  subcategory: string;
  subsubcategory: string;
  description: string;
  unit: string;
  image_url: string;
  purchase_price: number;
  sale_price: number;
  stock: number;
  status: string;
  updated_at: string;
};

export type CategoryTree = {
  name: string;
  subcategories: {
    name: string;
    subcategories: string[];
  }[];
};

export type CategoryMutationResult = {
  updated: number;
  categories: CategoryTree[];
};

export type PartyKind = "client" | "supplier";

export type PartyRecord = {
  id: number;
  kind: PartyKind;
  name: string;
  contact_phone: string;
  contact_name: string;
  email: string;
  address: string;
  city: string;
  head_office: string;
  category: string;
  nif: string;
  nis: string;
  rc: string;
  created_at: string;
  updated_at: string;
  billed: number;
  paid: number;
  balance: number;
  credit: number;
  status: string;
};

export type PaymentRecord = {
  id: number;
  party_id: number;
  direction: "incoming" | "outgoing";
  amount: number;
  payment_date: string;
  method: string;
  note: string;
  created_at: string;
};

export type FinanceEntryKind = "expense" | "charge";

export type FinanceEntryRecord = {
  id: number;
  kind: FinanceEntryKind;
  label: string;
  category: string;
  amount: number;
  entry_date: string;
  status: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export type TreasuryDirection = "in" | "out";

export type TreasuryEntryRecord = {
  id: number;
  direction: TreasuryDirection;
  label: string;
  category: string;
  amount: number;
  entry_date: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export type TreasuryLedgerRecord = {
  id: string;
  source: "manual" | "payment" | "finance";
  source_id: number;
  direction: TreasuryDirection;
  label: string;
  category: string;
  amount: number;
  entry_date: string;
  note: string;
  party_id: number | null;
  editable: boolean;
};

export type DocumentDirection = "purchases" | "sales";
export type DocumentType = "quote" | "order" | "delivery" | "invoice" | "return";

export type DocumentRecord = {
  id: number;
  number: string;
  direction: DocumentDirection;
  type: DocumentType;
  type_label: string;
  party_id: number | null;
  party_name: string;
  source_document_id: number | null;
  source_document_number: string;
  document_date: string;
  status: string;
  show_description: number;
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  stock_applied: number;
  created_at: string;
  updated_at: string;
  lines?: DocumentLineRecord[];
};

export type DocumentLineRecord = {
  id: number;
  document_id: number;
  article_id: number;
  designation: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  line_total: number;
  image_url: string;
};

export type StockMovementRecord = {
  id: number;
  article_id: number;
  document_id: number | null;
  quantity_delta: number;
  reason: string;
  created_at: string;
};

export class SqliteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SqliteValidationError";
  }
}

type AxxamGlobal = typeof globalThis & {
  __axxamSqlite?: DatabaseSync;
  __axxamPartiesReady?: boolean;
  __axxamDocumentsReady?: boolean;
  __axxamDocumentSeedsReady?: boolean;
};

type InputObject = Record<string, unknown>;

type NormalizedLine = {
  article: ArticleRecord;
  designation: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  lineTotal: number;
};

type PartyIdentity = Pick<PartyRecord, "id" | "kind" | "name">;

export type SettlementRecord = {
  payment: PaymentRecord;
  party: PartyRecord;
};

const globalForSqlite = globalThis as AxxamGlobal;
const CATALOG_SEED_KEY = "catalog_seed_v4";
const PARTIES_SEED_KEY = "parties_seed_v1";
const DOCUMENT_SEED_KEY = "document_seed_v1";

const documentLabels: Record<DocumentType, string> = {
  quote: "Devis",
  order: "Bon de commande",
  delivery: "Bon de livraison",
  invoice: "Facture",
  return: "Bon de retour",
};

const DOCUMENT_DEMO_SEEDS: readonly {
  number: string;
  direction: DocumentDirection;
  type: DocumentType;
  partyName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  status: string;
}[] = [
  { number: "ACH-BR-TEST-GOOGLE", direction: "purchases", type: "delivery", partyName: "Google", sku: "ART-GOO-001", quantity: 1, unitPrice: 95_000, status: "Reçu" },
  { number: "ACH-FAC-TEST-AMAZON", direction: "purchases", type: "invoice", partyName: "Amazon", sku: "ART-AMZ-002", quantity: 2, unitPrice: 6_200, status: "Payée" },
  { number: "VTE-BL-TEST-GOOGLE", direction: "sales", type: "delivery", partyName: "Google", sku: "ART-GOO-001", quantity: 1, unitPrice: 119_900, status: "Livré" },
  { number: "VTE-FAC-TEST-AMAZON", direction: "sales", type: "invoice", partyName: "Amazon", sku: "ART-AMZ-002", quantity: 2, unitPrice: 8_900, status: "Payée" },
];

function documentLabel(type: DocumentType, direction?: DocumentDirection): string {
  if (type === "delivery" && direction === "purchases") return "Bon de réception";
  return documentLabels[type];
}

function asInputObject(value: unknown): InputObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SqliteValidationError("Les données envoyées sont invalides.");
  }

  return value as InputObject;
}

function cleanText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function requiredText(value: unknown, field: string): string {
  const text = cleanText(value);
  if (!text) throw new SqliteValidationError(`${field} est obligatoire.`);
  return text;
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function requiredPositiveNumber(value: unknown, field: string): number {
  const number = optionalNumber(value);
  if (number === undefined || number <= 0) {
    throw new SqliteValidationError(`${field} doit être supérieur à zéro.`);
  }
  return number;
}

function requiredId(value: unknown, field = "L’identifiant"): number {
  const id = optionalNumber(value);
  if (id === undefined || !Number.isInteger(id) || id <= 0) {
    throw new SqliteValidationError(`${field} est invalide.`);
  }
  return id;
}

function booleanFrom(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return fallback;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function statusForStock(stock: number): string {
  if (stock <= 0) return "Rupture";
  if (stock <= 10) return "Stock faible";
  return "En stock";
}

function normalizeLookup(value: unknown): string {
  // Existing local demo rows were saved by older Windows shells with a few
  // UTF-8 characters displayed as mojibake.  Normalising them here keeps both
  // those rows and normal browser input accepted by the document API.
  const text = cleanText(value)
    .replaceAll("Ã©", "é")
    .replaceAll("Ã¨", "è")
    .replaceAll("Ãª", "ê")
    .replaceAll("Ã ", "à")
    .replaceAll("Ã®", "î")
    .replaceAll("Ã´", "ô")
    .replaceAll("Ã»", "û")
    .replaceAll("Ã§", "ç");
  return text
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeDirection(value: unknown): DocumentDirection {
  const normalized = normalizeLookup(value);
  if (["purchase", "purchases", "achat", "achats"].includes(normalized)) return "purchases";
  if (["sale", "sales", "vente", "ventes"].includes(normalized)) return "sales";
  throw new SqliteValidationError("Le sens du document doit être Achats ou Ventes.");
}

function normalizeDocumentType(value: unknown): DocumentType {
  const normalized = normalizeLookup(value);
  // Be permissive for older data whose accented « réception » text was encoded
  // inconsistently.  The intent remains unambiguous because it is a delivery note.
  if (normalized.includes("livraison") || (normalized.includes("bon de r") && normalized.includes("ception"))) {
    return "delivery";
  }
  const aliases: Record<string, DocumentType> = {
    devis: "quote",
    quote: "quote",
    quotation: "quote",
    commande: "order",
    commandes: "order",
    order: "order",
    "bon de commande": "order",
    "bon de commandes": "order",
    livraison: "delivery",
    delivery: "delivery",
    "bon de livraison": "delivery",
    reception: "delivery",
    "bon de reception": "delivery",
    facture: "invoice",
    factures: "invoice",
    invoice: "invoice",
    retour: "return",
    retours: "return",
    return: "return",
    "bon de retour": "return",
  };

  const type = aliases[normalized];
  if (!type) throw new SqliteValidationError("Le type de document est invalide.");
  return type;
}

function documentPrefix(type: DocumentType): string {
  return {
    quote: "DEV",
    order: "BC",
    delivery: "BL",
    invoice: "FAC",
    return: "RET",
  }[type];
}

function rowNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function toArticleRecord(row: Record<string, unknown>): ArticleRecord {
  return row as unknown as ArticleRecord;
}

function toPartyRecord(row: Record<string, unknown>): PartyRecord {
  const party = row as unknown as Omit<PartyRecord, "billed" | "paid" | "balance" | "status"> & {
    billed?: unknown;
    paid?: unknown;
    balance?: unknown;
  };
  const billed = rowNumber(party.billed);
  const paid = rowNumber(party.paid);
  const balance = Math.max(0, rowNumber(party.balance));
  const credit = Math.max(0, rowNumber(party.credit));
  return { ...party, billed, paid, balance, credit, status: balance > 0 ? "À régler" : credit > 0 ? "Crédit" : "À jour" };
}

function toDocumentRecord(row: Record<string, unknown>): DocumentRecord {
  const document = row as unknown as DocumentRecord;
  return { ...document, type_label: documentLabel(document.type, document.direction) };
}

function toDocumentLineRecord(row: Record<string, unknown>): DocumentLineRecord {
  return row as unknown as DocumentLineRecord;
}

function openDatabase() {
  const configuredPath = process.env.AXXAM_SQLITE_PATH || "data/axxam.sqlite";
  const databasePath = configuredPath === ":memory:" ? configuredPath : resolve(process.cwd(), configuredPath);
  if (databasePath !== ":memory:") mkdirSync(dirname(databasePath), { recursive: true });

  // Keep the constructor compatible with the project's minimum Node 22.13 runtime.
  // The timeout is configured through SQLite itself just below.
  const database = new DatabaseSync(databasePath);
  // DELETE keeps the database self-contained, which is useful when it is copied to a USB drive.
  database.exec("PRAGMA journal_mode = DELETE");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec("PRAGMA busy_timeout = 5000");
  database.exec(CREATE_APP_META_TABLE_SQL);
  database.exec(CREATE_ARTICLES_TABLE_SQL);
  migrateArticleColumns(database);
  database.exec(CREATE_ARTICLES_SKU_INDEX_SQL);
  database.exec(CREATE_ARTICLES_CATEGORY_INDEX_SQL);
  seedCatalogOnce(database);
  ensurePartyStorage(database);
  ensureDocumentStorage(database);
  database.exec(CREATE_DOCUMENT_LINES_TABLE_SQL);
  database.exec(CREATE_DOCUMENT_LINES_INDEX_SQL);
  database.exec(CREATE_STOCK_MOVEMENTS_TABLE_SQL);
  database.exec(CREATE_STOCK_MOVEMENTS_INDEX_SQL);
  database.exec(CREATE_PAYMENTS_TABLE_SQL);
  database.exec(CREATE_PAYMENTS_PARTY_INDEX_SQL);
  database.exec(CREATE_FINANCE_ENTRIES_TABLE_SQL);
  database.exec(CREATE_FINANCE_ENTRIES_DATE_INDEX_SQL);
  database.exec(CREATE_TREASURY_ENTRIES_TABLE_SQL);
  database.exec(CREATE_TREASURY_ENTRIES_DATE_INDEX_SQL);

  return database;
}

function migrateArticleColumns(database: DatabaseSync) {
  const columns = database.prepare("PRAGMA table_info(articles)").all();
  const existing = new Set(columns.map((column) => String(column.name)));

  for (const migration of ARTICLE_COLUMN_MIGRATIONS) {
    if (!existing.has(migration.name)) database.exec(migration.sql);
  }
}

function migratePartyColumns(database: DatabaseSync) {
  const columns = database.prepare("PRAGMA table_info(parties)").all();
  const existing = new Set(columns.map((column) => String(column.name)));

  for (const migration of PARTY_COLUMN_MIGRATIONS) {
    if (!existing.has(migration.name)) database.exec(migration.sql);
  }
}

function migrateDocumentColumns(database: DatabaseSync) {
  const columns = database.prepare("PRAGMA table_info(documents)").all();
  const existing = new Set(columns.map((column) => String(column.name)));

  for (const migration of DOCUMENT_COLUMN_MIGRATIONS) {
    if (!existing.has(migration.name)) database.exec(migration.sql);
  }
}

function backfillDocumentPartyIds(database: DatabaseSync) {
  database.exec(`
    UPDATE documents
    SET party_id = (
      SELECT p.id
      FROM parties p
      WHERE p.kind = CASE documents.direction WHEN 'sales' THEN 'client' ELSE 'supplier' END
        AND p.name = documents.party_name COLLATE NOCASE
      ORDER BY p.id ASC
      LIMIT 1
    )
    WHERE party_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM parties p
        WHERE p.kind = CASE documents.direction WHEN 'sales' THEN 'client' ELSE 'supplier' END
          AND p.name = documents.party_name COLLATE NOCASE
      )
  `);
}

function seedCatalogOnce(database: DatabaseSync) {
  const seeded = database.prepare("SELECT value FROM app_meta WHERE key = ?").get(CATALOG_SEED_KEY);
  if (seeded) return;

  const seed = database.prepare(`
    INSERT INTO articles (
      name, sku, brand, brand_logo, category, subcategory, subsubcategory,
      description, unit, image_url, purchase_price, sale_price, stock, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sku) DO UPDATE SET
      name = excluded.name,
      brand = excluded.brand,
      brand_logo = excluded.brand_logo,
      category = excluded.category,
      subcategory = excluded.subcategory,
      subsubcategory = excluded.subsubcategory,
      description = excluded.description,
      unit = excluded.unit,
      image_url = excluded.image_url,
      purchase_price = excluded.purchase_price,
      sale_price = excluded.sale_price,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `);

  database.exec("BEGIN IMMEDIATE");
  try {
    for (const article of ARTICLE_SEEDS) {
      seed.run(
        article.name,
        article.sku,
        article.brand,
        article.brandLogo,
        article.category,
        article.subcategory,
        article.subsubcategory,
        article.description,
        article.unit,
        article.imageUrl,
        article.purchasePrice,
        article.salePrice,
        article.stock,
        article.status,
      );
    }
    database.prepare("INSERT INTO app_meta (key, value) VALUES (?, ?)").run(CATALOG_SEED_KEY, "1");
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function seedPartiesOnce(database: DatabaseSync) {
  const seeded = database.prepare("SELECT value FROM app_meta WHERE key = ?").get(PARTIES_SEED_KEY);
  if (seeded) return;

  const existingParty = database.prepare(
    "SELECT id FROM parties WHERE kind = ? AND name = ? COLLATE NOCASE",
  );
  const insertParty = database.prepare(`
    INSERT INTO parties (
      kind, name, contact_phone, contact_name, email, address, city,
      head_office, category, nif, nis, rc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  database.exec("BEGIN IMMEDIATE");
  try {
    for (const party of PARTY_SEEDS) {
      if (existingParty.get(party.kind, party.name)) continue;
      insertParty.run(
        party.kind,
        party.name,
        party.contactPhone,
        party.contactName,
        party.email,
        party.address,
        party.city,
        party.headOffice,
        party.category,
        party.nif,
        party.nis,
        party.rc,
      );
    }
    database.prepare("INSERT INTO app_meta (key, value) VALUES (?, ?)").run(PARTIES_SEED_KEY, "1");
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

/**
 * The only starter documents are the requested Google/Amazon rows.  They are
 * regular SQLite documents (with lines) so quote, invoice, return and stock
 * actions can be tested without any front-end-only fixtures.
 */
function seedDemoDocumentsOnce(database: DatabaseSync) {
  const seeded = database.prepare("SELECT value FROM app_meta WHERE key = ?").get(DOCUMENT_SEED_KEY);
  if (seeded) return;

  const findArticle = database.prepare(`
    SELECT id, name, description, unit
    FROM articles
    WHERE sku = ?
  `);
  const findParty = database.prepare(`
    SELECT id, name
    FROM parties
    WHERE kind = ? AND name = ? COLLATE NOCASE
  `);
  const exists = database.prepare("SELECT id FROM documents WHERE number = ?");
  const insertDocument = database.prepare(`
    INSERT INTO documents (
      number, direction, type, party_id, party_name, source_document_number, document_date,
      status, show_description, subtotal, discount_amount, tax_rate, tax_amount,
      total, stock_applied
    ) VALUES (?, ?, ?, ?, ?, '', ?, ?, 0, ?, 0, 0, 0, ?, 0)
  `);
  const insertLine = database.prepare(`
    INSERT INTO document_lines (
      document_id, article_id, designation, description, unit, quantity,
      unit_price, discount_percent, tax_rate, line_total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
  `);
  const documentDate = new Date().toISOString().slice(0, 10);

  database.exec("BEGIN IMMEDIATE");
  try {
    for (const seed of DOCUMENT_DEMO_SEEDS) {
      if (exists.get(seed.number)) continue;
      const article = findArticle.get(seed.sku) as Record<string, unknown> | undefined;
      if (!article) throw new SqliteValidationError(`Article de démonstration introuvable : ${seed.sku}.`);
      const party = findParty.get(
        seed.direction === "sales" ? "client" : "supplier",
        seed.partyName,
      ) as Record<string, unknown> | undefined;
      if (!party) throw new SqliteValidationError(`Tiers de démonstration introuvable : ${seed.partyName}.`);
      const total = roundMoney(seed.quantity * seed.unitPrice);
      const result = insertDocument.run(
        seed.number,
        seed.direction,
        seed.type,
        Number(party.id),
        String(party.name),
        documentDate,
        seed.status,
        total,
        total,
      );
      insertLine.run(
        Number(result.lastInsertRowid),
        Number(article.id),
        String(article.name),
        String(article.description ?? ""),
        String(article.unit || "Unité"),
        seed.quantity,
        seed.unitPrice,
        total,
      );
    }
    database.prepare("INSERT INTO app_meta (key, value) VALUES (?, ?)").run(DOCUMENT_SEED_KEY, "1");
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

/**
 * Also runs once against an existing in-memory dev-server connection.  This
 * means adding the new API during `next dev` does not require the user to
 * delete their local database or lose the already-open SQLite handle.
 */
function ensurePartyStorage(database: DatabaseSync) {
  if (globalForSqlite.__axxamPartiesReady) return;
  database.exec(CREATE_PARTIES_TABLE_SQL);
  migratePartyColumns(database);
  database.exec(CREATE_PARTIES_KIND_NAME_INDEX_SQL);
  database.exec(CREATE_APP_META_TABLE_SQL);
  seedPartiesOnce(database);
  globalForSqlite.__axxamPartiesReady = true;
}

function ensureDocumentStorage(database: DatabaseSync) {
  if (globalForSqlite.__axxamDocumentsReady) return;
  database.exec(CREATE_DOCUMENTS_TABLE_SQL);
  migrateDocumentColumns(database);
  backfillDocumentPartyIds(database);
  database.exec(CREATE_DOCUMENTS_INDEX_SQL);
  database.exec(CREATE_DOCUMENTS_PARTY_INDEX_SQL);
  globalForSqlite.__axxamDocumentsReady = true;
}

function ensureDocumentDemoSeeds(database: DatabaseSync) {
  if (globalForSqlite.__axxamDocumentSeedsReady) return;
  database.exec(CREATE_APP_META_TABLE_SQL);
  seedDemoDocumentsOnce(database);
  globalForSqlite.__axxamDocumentSeedsReady = true;
}

function getDatabase() {
  if (!globalForSqlite.__axxamSqlite) {
    globalForSqlite.__axxamPartiesReady = undefined;
    globalForSqlite.__axxamDocumentsReady = undefined;
    globalForSqlite.__axxamDocumentSeedsReady = undefined;
    globalForSqlite.__axxamSqlite = openDatabase();
  }
  const database = globalForSqlite.__axxamSqlite;
  ensurePartyStorage(database);
  ensureDocumentStorage(database);
  // These CREATE IF NOT EXISTS calls also upgrade a long-running development
  // process whose global SQLite connection predates the finance endpoints.
  database.exec(CREATE_PAYMENTS_TABLE_SQL);
  database.exec(CREATE_PAYMENTS_PARTY_INDEX_SQL);
  database.exec(CREATE_FINANCE_ENTRIES_TABLE_SQL);
  database.exec(CREATE_FINANCE_ENTRIES_DATE_INDEX_SQL);
  database.exec(CREATE_TREASURY_ENTRIES_TABLE_SQL);
  database.exec(CREATE_TREASURY_ENTRIES_DATE_INDEX_SQL);
  ensureDocumentDemoSeeds(database);
  return database;
}

function inTransaction<T>(callback: (database: DatabaseSync) => T): T {
  const database = getDatabase();
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = callback(database);
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function getArticleById(database: DatabaseSync, id: number): ArticleRecord {
  const row = database.prepare(`
    SELECT id, name, sku, brand, brand_logo, category, subcategory, subsubcategory,
      description, unit, image_url, purchase_price, sale_price, stock, status, updated_at
    FROM articles
    WHERE id = ?
  `).get(id);
  if (!row) throw new SqliteValidationError("Article introuvable.");
  return toArticleRecord(row);
}

function findArticleByName(database: DatabaseSync, name: string): ArticleRecord {
  const row = database.prepare(`
    SELECT id, name, sku, brand, brand_logo, category, subcategory, subsubcategory,
      description, unit, image_url, purchase_price, sale_price, stock, status, updated_at
    FROM articles
    WHERE LOWER(name) = LOWER(?) AND is_deleted = 0
  `).get(name);
  if (!row) throw new SqliteValidationError("Article introuvable.");
  return toArticleRecord(row);
}

function getDocumentById(database: DatabaseSync, id: number): DocumentRecord {
  const row = database.prepare(`
    SELECT id, number, direction, type, party_id, party_name, source_document_id, source_document_number,
      document_date, status, show_description, subtotal, discount_amount, tax_rate, tax_amount,
      total, stock_applied, created_at, updated_at
    FROM documents
    WHERE id = ?
  `).get(id);
  if (!row) throw new SqliteValidationError("Document source introuvable.");
  return toDocumentRecord(row);
}

function listLinesForDocument(database: DatabaseSync, documentId: number): DocumentLineRecord[] {
  return database.prepare(`
    SELECT dl.id, dl.document_id, dl.article_id, dl.designation, dl.description, dl.unit,
      dl.quantity, dl.unit_price, dl.discount_percent, dl.tax_rate, dl.line_total,
      a.image_url
    FROM document_lines dl
    INNER JOIN articles a ON a.id = dl.article_id
    WHERE dl.document_id = ?
    ORDER BY dl.id ASC
  `).all(documentId).map(toDocumentLineRecord);
}

function updateStockInDatabase(
  database: DatabaseSync,
  articleId: number,
  quantityDelta: number,
  reason: string,
  documentId: number | null,
) {
  const article = getArticleById(database, articleId);
  const nextStock = roundQuantity(article.stock + quantityDelta);
  if (nextStock < 0) {
    throw new SqliteValidationError(`Stock insuffisant pour « ${article.name} ».`);
  }

  database.prepare(`
    UPDATE articles
    SET stock = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(nextStock, statusForStock(nextStock), articleId);
  database.prepare(`
    INSERT INTO stock_movements (article_id, document_id, quantity_delta, reason)
    VALUES (?, ?, ?, ?)
  `).run(articleId, documentId, roundQuantity(quantityDelta), reason);
}

function clampPercent(value: unknown, fallback: number, field: string): number {
  const percent = optionalNumber(value);
  if (percent === undefined) return fallback;
  if (percent < 0 || percent > 100) {
    throw new SqliteValidationError(`${field} doit être compris entre 0 et 100.`);
  }
  return percent;
}

function normalizeDocumentDate(value: unknown): string {
  const date = cleanText(value);
  if (!date) return new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new SqliteValidationError("La date du document doit être au format AAAA-MM-JJ.");
  }
  return date;
}

function resolveArticle(database: DatabaseSync, input: InputObject): ArticleRecord {
  const id = optionalNumber(input.articleId ?? input.article_id);
  if (id !== undefined) return getArticleById(database, requiredId(id, "L’article"));

  const articleName = cleanText(input.articleName ?? input.article_name ?? input.designation);
  if (!articleName) throw new SqliteValidationError("Chaque ligne doit indiquer un article existant.");
  return findArticleByName(database, articleName);
}

function normalizeLine(
  database: DatabaseSync,
  value: unknown,
  direction: DocumentDirection,
  documentDiscount: number,
  documentTaxRate: number,
): NormalizedLine {
  const input = asInputObject(value);
  const article = resolveArticle(database, input);
  const quantity = requiredPositiveNumber(input.quantity, "La quantité");
  const price = optionalNumber(input.unitPrice ?? input.unit_price);
  const unitPrice = price === undefined
    ? (direction === "purchases" ? article.purchase_price : article.sale_price)
    : price;
  if (unitPrice < 0) throw new SqliteValidationError("Le prix unitaire ne peut pas être négatif.");

  const discountPercent = clampPercent(
    input.discount ?? input.discountPercent ?? input.discount_percent,
    documentDiscount,
    "La remise",
  );
  const taxRate = clampPercent(input.taxRate ?? input.tax_rate, documentTaxRate, "La TVA");
  const net = quantity * unitPrice * (1 - discountPercent / 100);
  const lineTotal = roundMoney(net * (1 + taxRate / 100));

  return {
    article,
    designation: cleanText(input.designation, article.name) || article.name,
    description: cleanText(input.description, article.description),
    unit: cleanText(input.unit, article.unit) || article.unit,
    quantity: roundQuantity(quantity),
    unitPrice: roundMoney(unitPrice),
    discountPercent,
    taxRate,
    lineTotal,
  };
}

function getSourceLinesAsInput(database: DatabaseSync, documentId: number): InputObject[] {
  return listLinesForDocument(database, documentId).map((line) => ({
    articleId: line.article_id,
    designation: line.designation,
    description: line.description,
    unit: line.unit,
    quantity: line.quantity,
    unitPrice: line.unit_price,
    discountPercent: line.discount_percent,
    taxRate: line.tax_rate,
  }));
}

function returnQuantityAlreadyUsed(database: DatabaseSync, sourceDocumentId: number, articleId: number): number {
  const row = database.prepare(`
    SELECT COALESCE(SUM(dl.quantity), 0) AS quantity
    FROM documents d
    INNER JOIN document_lines dl ON dl.document_id = d.id
    WHERE d.source_document_id = ? AND d.type = 'return' AND dl.article_id = ?
  `).get(sourceDocumentId, articleId);
  return rowNumber(row?.quantity);
}

function validateReturnLines(database: DatabaseSync, source: DocumentRecord, lines: NormalizedLine[]) {
  const sourceQuantities = new Map<number, number>();
  for (const sourceLine of listLinesForDocument(database, source.id)) {
    sourceQuantities.set(
      sourceLine.article_id,
      (sourceQuantities.get(sourceLine.article_id) ?? 0) + sourceLine.quantity,
    );
  }
  const requestedQuantities = new Map<number, number>();
  for (const line of lines) {
    requestedQuantities.set(
      line.article.id,
      (requestedQuantities.get(line.article.id) ?? 0) + line.quantity,
    );
  }

  for (const [articleId, requestedQuantity] of requestedQuantities) {
    const sourceQuantity = sourceQuantities.get(articleId);
    if (sourceQuantity === undefined) {
      throw new SqliteValidationError("Un retour ne peut contenir que les articles du document source.");
    }

    const alreadyReturned = returnQuantityAlreadyUsed(database, source.id, articleId);
    if (requestedQuantity > sourceQuantity - alreadyReturned + 0.0001) {
      const article = getArticleById(database, articleId);
      throw new SqliteValidationError(`La quantité retournée dépasse le document source pour « ${article.name} ».`);
    }
  }
}

function shouldApplyStock(type: DocumentType, source: DocumentRecord | null): boolean {
  if (type === "delivery" || type === "return") return true;
  return type === "invoice" && !source?.stock_applied;
}

function makeDocumentNumber(database: DatabaseSync, direction: DocumentDirection, type: DocumentType): string {
  const row = database.prepare(
    "SELECT COUNT(*) AS total FROM documents WHERE direction = ? AND type = ?",
  ).get(direction, type);
  const total = rowNumber(row?.total) + 1;
  const directionPrefix = direction === "purchases" ? "ACH" : "VTE";
  return `${directionPrefix}-${documentPrefix(type)}-${String(total).padStart(4, "0")}`;
}

export function listArticles(query = ""): ArticleRecord[] {
  const normalizedQuery = cleanText(query).toLocaleLowerCase("fr");
  const rows = getDatabase().prepare(`
    SELECT id, name, sku, brand, brand_logo, category, subcategory, subsubcategory,
      description, unit, image_url, purchase_price, sale_price, stock, status, updated_at
    FROM articles
    WHERE is_deleted = 0
    ORDER BY category COLLATE NOCASE, subcategory COLLATE NOCASE, name COLLATE NOCASE
  `).all().map(toArticleRecord);

  if (!normalizedQuery) return rows;
  return rows.filter((article) => [
    article.name,
    article.sku,
    article.brand,
    article.category,
    article.subcategory,
    article.subsubcategory,
    article.description,
  ].join(" ").toLocaleLowerCase("fr").includes(normalizedQuery));
}

export function listCategoryTree(): CategoryTree[] {
  const categories = new Map<string, Map<string, Set<string>>>();
  for (const article of listArticles()) {
    const category = article.category || "Non classée";
    const subcategory = article.subcategory || "Sans sous-catégorie";
    const subsubcategory = article.subsubcategory || "";
    const childCategories = categories.get(category) ?? new Map<string, Set<string>>();
    const grandchildren = childCategories.get(subcategory) ?? new Set<string>();
    if (subsubcategory) grandchildren.add(subsubcategory);
    childCategories.set(subcategory, grandchildren);
    categories.set(category, childCategories);
  }

  return [...categories.entries()].map(([name, subcategories]) => ({
    name,
    subcategories: [...subcategories.entries()].map(([subcategory, grandchildren]) => ({
      name: subcategory,
      subcategories: [...grandchildren].sort((left, right) => left.localeCompare(right, "fr")),
    })).sort((left, right) => left.name.localeCompare(right.name, "fr")),
  })).sort((left, right) => left.name.localeCompare(right.name, "fr"));
}

function categoryMutationInput(value: unknown) {
  const input = asInputObject(value);
  const level = optionalNumber(input.level);
  if (level !== 1 && level !== 2 && level !== 3) {
    throw new SqliteValidationError("Le niveau de catégorie doit être 1, 2 ou 3.");
  }
  const currentName = requiredText(input.currentName, "Le nom actuel");
  const category = level === 1 ? currentName : requiredText(input.category, "La catégorie");
  const subcategory = level === 3 ? requiredText(input.subcategory, "La sous-catégorie") : "";
  return { level, currentName, category, subcategory };
}

export function renameArticleCategory(value: unknown): CategoryMutationResult {
  const input = asInputObject(value);
  const { level, currentName, category, subcategory } = categoryMutationInput(input);
  const nextName = requiredText(input.nextName, "Le nouveau nom");
  if (normalizeLookup(currentName) === normalizeLookup(nextName)) {
    throw new SqliteValidationError("Le nouveau nom doit être différent du nom actuel.");
  }

  const database = getDatabase();
  const result = level === 1
    ? database.prepare(`
        UPDATE articles
        SET category = ?, updated_at = CURRENT_TIMESTAMP
        WHERE is_deleted = 0 AND category = ? COLLATE NOCASE
      `).run(nextName, currentName)
    : level === 2
      ? database.prepare(`
          UPDATE articles
          SET subcategory = ?, updated_at = CURRENT_TIMESTAMP
          WHERE is_deleted = 0
            AND category = ? COLLATE NOCASE
            AND subcategory = ? COLLATE NOCASE
        `).run(nextName, category, currentName)
      : database.prepare(`
          UPDATE articles
          SET subsubcategory = ?, updated_at = CURRENT_TIMESTAMP
          WHERE is_deleted = 0
            AND category = ? COLLATE NOCASE
            AND subcategory = ? COLLATE NOCASE
            AND subsubcategory = ? COLLATE NOCASE
        `).run(nextName, category, subcategory, currentName);

  if (!result.changes) throw new SqliteValidationError("Cette catégorie n’existe plus.");
  return { updated: Number(result.changes), categories: listCategoryTree() };
}

export function deleteArticleCategory(value: unknown): CategoryMutationResult {
  const { level, currentName, category, subcategory } = categoryMutationInput(value);
  if (level === 1 && normalizeLookup(currentName) === normalizeLookup("Non classée")) {
    throw new SqliteValidationError("La catégorie système « Non classée » ne peut pas être supprimée.");
  }

  const database = getDatabase();
  const result = level === 1
    ? database.prepare(`
        UPDATE articles
        SET category = 'Non classée', subcategory = '', subsubcategory = '',
          updated_at = CURRENT_TIMESTAMP
        WHERE is_deleted = 0 AND category = ? COLLATE NOCASE
      `).run(currentName)
    : level === 2
      ? database.prepare(`
          UPDATE articles
          SET subcategory = '', subsubcategory = '', updated_at = CURRENT_TIMESTAMP
          WHERE is_deleted = 0
            AND category = ? COLLATE NOCASE
            AND subcategory = ? COLLATE NOCASE
        `).run(category, currentName)
      : database.prepare(`
          UPDATE articles
          SET subsubcategory = '', updated_at = CURRENT_TIMESTAMP
          WHERE is_deleted = 0
            AND category = ? COLLATE NOCASE
            AND subcategory = ? COLLATE NOCASE
            AND subsubcategory = ? COLLATE NOCASE
        `).run(category, subcategory, currentName);

  if (!result.changes) throw new SqliteValidationError("Cette catégorie n’existe plus.");
  return { updated: Number(result.changes), categories: listCategoryTree() };
}

function normalizePartyKind(value: unknown): PartyKind {
  const kind = cleanText(value).toLocaleLowerCase("fr");
  if (kind === "client" || kind === "supplier") return kind;
  throw new SqliteValidationError("Le type de tiers doit Ãªtre client ou fournisseur.");
}

function firstDefinedValue(input: InputObject, keys: readonly string[]): unknown {
  for (const key of keys) {
    if (input[key] !== undefined) return input[key];
  }
  return undefined;
}

function optionalPartyText(
  input: InputObject,
  keys: readonly string[],
  label: string,
  maximumLength: number,
): string {
  const value = firstDefinedValue(input, keys);
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new SqliteValidationError(`${label} est invalide.`);
  }
  const text = value.trim();
  if (text.length > maximumLength) {
    throw new SqliteValidationError(`${label} ne peut pas dÃ©passer ${maximumLength} caractÃ¨res.`);
  }
  return text;
}

function requiredPartyName(input: InputObject): string {
  const name = optionalPartyText(input, ["name"], "Le nom du tiers", 160);
  if (!name) throw new SqliteValidationError("Le nom du tiers est obligatoire.");
  return name;
}

function partyKindForDirection(direction: DocumentDirection): PartyKind {
  return direction === "sales" ? "client" : "supplier";
}

function getPartyIdentityById(database: DatabaseSync, id: number): PartyIdentity {
  const row = database.prepare(`
    SELECT id, kind, name
    FROM parties
    WHERE id = ?
  `).get(id);
  if (!row) throw new SqliteValidationError("Tiers introuvable.");
  return row as unknown as PartyIdentity;
}

function findPartyIdentityByName(
  database: DatabaseSync,
  kind: PartyKind,
  name: string,
): PartyIdentity {
  const row = database.prepare(`
    SELECT id, kind, name
    FROM parties
    WHERE kind = ? AND name = ? COLLATE NOCASE
    ORDER BY id ASC
    LIMIT 1
  `).get(kind, name);
  if (!row) {
    throw new SqliteValidationError(
      kind === "client"
        ? "Sélectionnez un client enregistré."
        : "Sélectionnez un fournisseur enregistré.",
    );
  }
  return row as unknown as PartyIdentity;
}

function validatePartyDirection(party: PartyIdentity, direction: DocumentDirection): PartyIdentity {
  if (party.kind !== partyKindForDirection(direction)) {
    throw new SqliteValidationError(
      direction === "sales"
        ? "Le tiers sélectionné doit être un client."
        : "Le tiers sélectionné doit être un fournisseur.",
    );
  }
  return party;
}

function identityForDocument(
  database: DatabaseSync,
  document: Pick<DocumentRecord, "party_id" | "party_name" | "direction">,
): PartyIdentity {
  const party = document.party_id
    ? getPartyIdentityById(database, document.party_id)
    : findPartyIdentityByName(
      database,
      partyKindForDirection(document.direction),
      document.party_name,
    );
  return validatePartyDirection(party, document.direction);
}

const partyBalanceSql = `
  COALESCE((
    SELECT SUM(CASE
      WHEN d.type = 'invoice' THEN d.total
      WHEN d.type = 'return' AND EXISTS (
        SELECT 1
        FROM documents source
        WHERE source.id = d.source_document_id
          AND source.type = 'invoice'
      ) THEN -d.total
      ELSE 0
    END)
    FROM documents d
    WHERE d.direction = CASE p.kind WHEN 'client' THEN 'sales' ELSE 'purchases' END
      AND (
        d.party_id = p.id
        OR (
          d.party_id IS NULL
          AND LOWER(d.party_name) = LOWER(p.name)
        )
      )
  ), 0)
`;

const partyPaidSql = `
  COALESCE((
    SELECT SUM(payment.amount)
    FROM payments payment
    WHERE payment.party_id = p.id
      AND payment.direction = CASE p.kind WHEN 'client' THEN 'incoming' ELSE 'outgoing' END
  ), 0)
`;

const partySelectSql = `
  p.id, p.kind, p.name, p.contact_phone, p.contact_name, p.email, p.address, p.city,
  p.head_office, p.category, p.nif, p.nis, p.rc, p.created_at, p.updated_at,
  ${partyBalanceSql} AS billed,
  ${partyPaidSql} AS paid,
  MAX(0, ${partyBalanceSql} - ${partyPaidSql}) AS balance,
  MAX(0, ${partyPaidSql} - ${partyBalanceSql}) AS credit
`;

function getPartyById(database: DatabaseSync, id: number): PartyRecord {
  const row = database.prepare(`
    SELECT ${partySelectSql}
    FROM parties p
    WHERE p.id = ?
  `).get(id);
  if (!row) throw new SqliteValidationError("Tiers introuvable.");
  return toPartyRecord(row);
}

export function listParties(kind?: PartyKind): PartyRecord[] {
  const database = getDatabase();
  const statement = `
    SELECT ${partySelectSql}
    FROM parties p
    ${kind ? "WHERE p.kind = ?" : ""}
    ORDER BY p.name COLLATE NOCASE, p.id ASC
  `;
  const rows = kind
    ? database.prepare(statement).all(kind)
    : database.prepare(statement).all();
  return rows.map(toPartyRecord);
}

/** Creates one persisted customer or supplier, without inventing fiscal data. */
export function createParty(value: unknown): PartyRecord {
  const input = asInputObject(value);
  const kind = normalizePartyKind(input.kind);
  const name = requiredPartyName(input);
  const contactPhone = optionalPartyText(input, ["contact_phone", "contactPhone", "phone", "contact"], "Le tÃ©lÃ©phone", 64);
  const contactName = optionalPartyText(input, ["contact_name", "contactName"], "Le contact", 160);
  const email = optionalPartyText(input, ["email"], "Lâ€™e-mail", 254);
  const address = optionalPartyText(input, ["address"], "Lâ€™adresse", 300);
  const city = optionalPartyText(input, ["city"], "La ville", 120);
  const headOffice = optionalPartyText(input, ["head_office", "headOffice"], "Le siÃ¨ge", 300);
  const category = optionalPartyText(input, ["category"], "La catÃ©gorie", 120);
  const nif = optionalPartyText(input, ["nif"], "Le NIF", 120);
  const nis = optionalPartyText(input, ["nis"], "Le NIS", 120);
  const rc = optionalPartyText(input, ["rc"], "Le RC", 120);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SqliteValidationError("Lâ€™e-mail est invalide.");
  }

  const database = getDatabase();
  const duplicate = database.prepare(
    "SELECT id FROM parties WHERE kind = ? AND name = ? COLLATE NOCASE",
  ).get(kind, name);
  if (duplicate) {
    throw new SqliteValidationError("Ce tiers existe dÃ©jÃ  dans cette liste.");
  }

  const result = database.prepare(`
    INSERT INTO parties (
      kind, name, contact_phone, contact_name, email, address, city,
      head_office, category, nif, nis, rc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    kind,
    name,
    contactPhone,
    contactName,
    email,
    address,
    city,
    headOffice,
    category,
    nif,
    nis,
    rc,
  );
  return getPartyById(database, Number(result.lastInsertRowid));
}

export function updateParty(value: unknown): PartyRecord {
  const input = asInputObject(value);
  const id = requiredId(input.id, "Le tiers");
  const database = getDatabase();
  const existing = getPartyById(database, id);
  const name = optionalPartyText(input, ["name"], "Le nom du tiers", 160) || existing.name;
  const contactPhone = optionalPartyText(input, ["contact_phone", "contactPhone", "phone", "contact"], "Le téléphone", 64);
  const contactName = optionalPartyText(input, ["contact_name", "contactName"], "Le contact", 160);
  const email = optionalPartyText(input, ["email"], "L’e-mail", 254);
  const address = optionalPartyText(input, ["address"], "L’adresse", 300);
  const city = optionalPartyText(input, ["city"], "La ville", 120);
  const headOffice = optionalPartyText(input, ["head_office", "headOffice"], "Le siège", 300);
  const category = optionalPartyText(input, ["category"], "La catégorie", 120);
  const nif = optionalPartyText(input, ["nif"], "Le NIF", 120);
  const nis = optionalPartyText(input, ["nis"], "Le NIS", 120);
  const rc = optionalPartyText(input, ["rc"], "Le RC", 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new SqliteValidationError("L’e-mail est invalide.");

  const duplicate = database.prepare("SELECT id FROM parties WHERE kind = ? AND name = ? COLLATE NOCASE AND id <> ?")
    .get(existing.kind, name, id);
  if (duplicate) throw new SqliteValidationError("Ce tiers existe déjà dans cette liste.");

  database.prepare(`
    UPDATE parties
    SET name = ?, contact_phone = ?, contact_name = ?, email = ?, address = ?, city = ?,
      head_office = ?, category = ?, nif = ?, nis = ?, rc = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name,
    input.contact_phone === undefined && input.contactPhone === undefined && input.phone === undefined && input.contact === undefined ? existing.contact_phone : contactPhone,
    input.contact_name === undefined && input.contactName === undefined ? existing.contact_name : contactName,
    input.email === undefined ? existing.email : email,
    input.address === undefined ? existing.address : address,
    input.city === undefined ? existing.city : city,
    input.head_office === undefined && input.headOffice === undefined ? existing.head_office : headOffice,
    input.category === undefined ? existing.category : category,
    input.nif === undefined ? existing.nif : nif,
    input.nis === undefined ? existing.nis : nis,
    input.rc === undefined ? existing.rc : rc,
    id,
  );
  return getPartyById(database, id);
}

export function deleteParty(partyId: unknown): PartyRecord {
  const id = requiredId(partyId, "Le tiers");
  return inTransaction((database) => {
    const party = getPartyById(database, id);
    const document = database.prepare(`
      SELECT id
      FROM documents
      WHERE party_id = ?
        OR (
          party_id IS NULL
          AND direction = ?
          AND party_name = ? COLLATE NOCASE
        )
      LIMIT 1
    `).get(
      party.id,
      party.kind === "client" ? "sales" : "purchases",
      party.name,
    );
    if (document) {
      throw new SqliteValidationError(
        "Ce tiers possède des documents et ne peut pas être supprimé.",
      );
    }
    const payment = database.prepare(
      "SELECT id FROM payments WHERE party_id = ? LIMIT 1",
    ).get(party.id);
    if (payment) {
      throw new SqliteValidationError(
        "Ce tiers possède un historique de paiements et ne peut pas être supprimé.",
      );
    }
    database.prepare("DELETE FROM parties WHERE id = ?").run(id);
    return party;
  });
}

export function settleParty(value: unknown): SettlementRecord {
  const input = asInputObject(value);
  const partyId = requiredId(input.party_id ?? input.partyId, "Le tiers");
  const amount = roundMoney(optionalNumber(input.amount) ?? 0);
  if (amount <= 0) throw new SqliteValidationError("Le montant du règlement doit être supérieur à zéro.");
  const paymentDate = normalizeDocumentDate(input.payment_date ?? input.paymentDate ?? input.date);
  const method = cleanText(input.method, "Virement") || "Virement";
  const note = cleanText(input.note);
  return inTransaction((database) => {
    // BEGIN IMMEDIATE keeps the payment and its resulting credit/balance
    // snapshot atomic. Advances are allowed even when no invoice is open.
    const party = getPartyById(database, partyId);
    const result = database.prepare(`
      INSERT INTO payments (party_id, direction, amount, payment_date, method, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      party.id,
      party.kind === "client" ? "incoming" : "outgoing",
      amount,
      paymentDate,
      method,
      note,
    );
    const row = database.prepare(`
      SELECT id, party_id, direction, amount, payment_date, method, note, created_at
      FROM payments WHERE id = ?
    `).get(Number(result.lastInsertRowid));
    return {
      payment: row as unknown as PaymentRecord,
      party: getPartyById(database, party.id),
    };
  });
}

export function listPayments(partyId?: unknown): PaymentRecord[] {
  const database = getDatabase();
  const id = partyId === undefined ? undefined : requiredId(partyId, "Le tiers");
  const rows = id
    ? database.prepare("SELECT id, party_id, direction, amount, payment_date, method, note, created_at FROM payments WHERE party_id = ? ORDER BY payment_date DESC, id DESC").all(id)
    : database.prepare("SELECT id, party_id, direction, amount, payment_date, method, note, created_at FROM payments ORDER BY payment_date DESC, id DESC").all();
  return rows as unknown as PaymentRecord[];
}

function normalizeFinanceKind(value: unknown): FinanceEntryKind {
  if (value === "expense" || value === "charge") return value;
  throw new SqliteValidationError("Le type doit être dépense ou charge.");
}

export function listFinanceEntries(): FinanceEntryRecord[] {
  return getDatabase().prepare(`
    SELECT id, kind, label, category, amount, entry_date, status, note, created_at, updated_at
    FROM finance_entries ORDER BY entry_date DESC, id DESC
  `).all() as unknown as FinanceEntryRecord[];
}

export function createFinanceEntry(value: unknown): FinanceEntryRecord {
  const input = asInputObject(value);
  const kind = normalizeFinanceKind(input.kind);
  const label = requiredText(input.label, "Le libellé");
  const amount = roundMoney(optionalNumber(input.amount) ?? 0);
  if (amount <= 0) throw new SqliteValidationError("Le montant doit être supérieur à zéro.");
  const entryDate = normalizeDocumentDate(input.entry_date ?? input.entryDate ?? input.date);
  const result = getDatabase().prepare(`
    INSERT INTO finance_entries (kind, label, category, amount, entry_date, status, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    kind,
    label,
    cleanText(input.category),
    amount,
    entryDate,
    cleanText(input.status, "Payée") || "Payée",
    cleanText(input.note),
  );
  const row = getDatabase().prepare(`
    SELECT id, kind, label, category, amount, entry_date, status, note, created_at, updated_at
    FROM finance_entries WHERE id = ?
  `).get(Number(result.lastInsertRowid));
  return row as unknown as FinanceEntryRecord;
}

export function deleteFinanceEntry(entryId: unknown): FinanceEntryRecord {
  const id = requiredId(entryId, "La dépense");
  const database = getDatabase();
  const row = database.prepare(`
    SELECT id, kind, label, category, amount, entry_date, status, note, created_at, updated_at
    FROM finance_entries WHERE id = ?
  `).get(id);
  if (!row) throw new SqliteValidationError("Dépense introuvable.");
  database.prepare("DELETE FROM finance_entries WHERE id = ?").run(id);
  return row as unknown as FinanceEntryRecord;
}

export function updateFinanceEntry(value: unknown): FinanceEntryRecord {
  const input = asInputObject(value);
  const id = requiredId(input.id, "La charge");
  const database = getDatabase();
  const existing = database.prepare(`
    SELECT id, kind, label, category, amount, entry_date, status, note, created_at, updated_at
    FROM finance_entries WHERE id = ?
  `).get(id) as Record<string, unknown> | undefined;
  if (!existing) throw new SqliteValidationError("Charge introuvable.");
  const kind = input.kind === undefined ? String(existing.kind) : normalizeFinanceKind(input.kind);
  const label = input.label === undefined ? String(existing.label) : requiredText(input.label, "Le libellé");
  const amount = roundMoney(input.amount === undefined ? rowNumber(existing.amount) : optionalNumber(input.amount) ?? 0);
  if (amount <= 0) throw new SqliteValidationError("Le montant doit être supérieur à zéro.");
  const entryDate = normalizeDocumentDate(input.entry_date ?? input.entryDate ?? existing.entry_date);
  const category = input.category === undefined ? String(existing.category ?? "") : cleanText(input.category);
  const status = input.status === undefined ? String(existing.status ?? "Payée") : cleanText(input.status, "Payée") || "Payée";
  const note = input.note === undefined ? String(existing.note ?? "") : cleanText(input.note);
  database.prepare(`
    UPDATE finance_entries
    SET kind = ?, label = ?, category = ?, amount = ?, entry_date = ?, status = ?, note = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(kind, label, category, amount, entryDate, status, note, id);
  return database.prepare(`
    SELECT id, kind, label, category, amount, entry_date, status, note, created_at, updated_at
    FROM finance_entries WHERE id = ?
  `).get(id) as unknown as FinanceEntryRecord;
}

function readTreasuryEntry(database: DatabaseSync, id: number): TreasuryEntryRecord {
  const row = database.prepare(`
    SELECT id, direction, label, category, amount, entry_date, note, created_at, updated_at
    FROM treasury_entries WHERE id = ?
  `).get(id);
  if (!row) throw new SqliteValidationError("Mouvement de trésorerie introuvable.");
  return row as unknown as TreasuryEntryRecord;
}

function normalizeTreasuryDirection(value: unknown): TreasuryDirection {
  if (value === "in" || value === "out") return value;
  throw new SqliteValidationError("Le sens doit être une entrée ou une sortie.");
}

export function listTreasuryEntries(): TreasuryEntryRecord[] {
  return getDatabase().prepare(`
    SELECT id, direction, label, category, amount, entry_date, note, created_at, updated_at
    FROM treasury_entries ORDER BY entry_date DESC, id DESC
  `).all() as unknown as TreasuryEntryRecord[];
}

export function createTreasuryEntry(value: unknown): TreasuryEntryRecord {
  const input = asInputObject(value);
  const direction = normalizeTreasuryDirection(input.direction);
  const label = requiredText(input.label, "Le libellé");
  const amount = roundMoney(optionalNumber(input.amount) ?? 0);
  if (amount <= 0) throw new SqliteValidationError("Le montant doit être supérieur à zéro.");
  const entryDate = normalizeDocumentDate(input.entry_date ?? input.entryDate ?? input.date);
  const result = getDatabase().prepare(`
    INSERT INTO treasury_entries (direction, label, category, amount, entry_date, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(direction, label, cleanText(input.category), amount, entryDate, cleanText(input.note));
  return readTreasuryEntry(getDatabase(), Number(result.lastInsertRowid));
}

export function updateTreasuryEntry(value: unknown): TreasuryEntryRecord {
  const input = asInputObject(value);
  const id = requiredId(input.id, "Le mouvement");
  const database = getDatabase();
  const existing = readTreasuryEntry(database, id);
  const direction = input.direction === undefined ? existing.direction : normalizeTreasuryDirection(input.direction);
  const label = input.label === undefined ? existing.label : requiredText(input.label, "Le libellé");
  const amount = roundMoney(input.amount === undefined ? existing.amount : optionalNumber(input.amount) ?? 0);
  if (amount <= 0) throw new SqliteValidationError("Le montant doit être supérieur à zéro.");
  const entryDate = normalizeDocumentDate(input.entry_date ?? input.entryDate ?? existing.entry_date);
  const category = input.category === undefined ? existing.category : cleanText(input.category);
  const note = input.note === undefined ? existing.note : cleanText(input.note);
  database.prepare(`
    UPDATE treasury_entries
    SET direction = ?, label = ?, category = ?, amount = ?, entry_date = ?, note = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(direction, label, category, amount, entryDate, note, id);
  return readTreasuryEntry(database, id);
}

export function deleteTreasuryEntry(entryId: unknown): TreasuryEntryRecord {
  const id = requiredId(entryId, "Le mouvement");
  const database = getDatabase();
  const row = readTreasuryEntry(database, id);
  database.prepare("DELETE FROM treasury_entries WHERE id = ?").run(id);
  return row;
}

/**
 * The ledger is intentionally derived from the source tables: a payment or a
 * charge appears automatically in treasury without a second write to keep in
 * sync. Only manual treasury entries are editable.
 */
export function listTreasuryLedger(): TreasuryLedgerRecord[] {
  const database = getDatabase();
  const manual = database.prepare(`
    SELECT id, direction, label, category, amount, entry_date, note
    FROM treasury_entries
  `).all().map((row) => {
    const item = row as Record<string, unknown>;
    return {
      id: `manual-${rowNumber(item.id)}`,
      source: "manual" as const,
      source_id: rowNumber(item.id),
      direction: String(item.direction) as TreasuryDirection,
      label: String(item.label),
      category: String(item.category ?? ""),
      amount: rowNumber(item.amount),
      entry_date: String(item.entry_date),
      note: String(item.note ?? ""),
      party_id: null,
      editable: true,
    };
  });
  const payments = database.prepare(`
    SELECT payment.id, payment.party_id, payment.direction, payment.amount,
      payment.payment_date, payment.note, party.name AS party_name,
      party.kind AS party_kind
    FROM payments payment
    INNER JOIN parties party ON party.id = payment.party_id
  `).all().map((row) => {
    const item = row as Record<string, unknown>;
    const incoming = item.direction === "incoming";
    return {
      id: `payment-${rowNumber(item.id)}`,
      source: "payment" as const,
      source_id: rowNumber(item.id),
      direction: incoming ? "in" as const : "out" as const,
      label: `${incoming ? "Encaissement client" : "Paiement fournisseur"} · ${String(item.party_name)}`,
      category: "Règlement",
      amount: rowNumber(item.amount),
      entry_date: String(item.payment_date),
      note: String(item.note ?? ""),
      party_id: rowNumber(item.party_id),
      editable: false,
    };
  });
  const finance = database.prepare(`
    SELECT id, label, category, amount, entry_date, note
    FROM finance_entries
    WHERE status = 'Payée'
  `).all().map((row) => {
    const item = row as Record<string, unknown>;
    return {
      id: `finance-${rowNumber(item.id)}`,
      source: "finance" as const,
      source_id: rowNumber(item.id),
      direction: "out" as const,
      label: String(item.label),
      category: String(item.category ?? "Charge"),
      amount: rowNumber(item.amount),
      entry_date: String(item.entry_date),
      note: String(item.note ?? ""),
      party_id: null,
      editable: false,
    };
  });
  return [...manual, ...payments, ...finance].sort((left, right) =>
    right.entry_date.localeCompare(left.entry_date) || right.id.localeCompare(left.id),
  );
}

export function createArticle(value: unknown): ArticleRecord {
  const input = asInputObject(value);
  const name = requiredText(input.name, "Le nom de l’article");
  const sku = requiredText(input.sku, "La référence");
  const database = getDatabase();
  const duplicate = database.prepare("SELECT id FROM articles WHERE sku = ?").get(sku);
  if (duplicate) throw new SqliteValidationError("Cette référence existe déjà.");

  const stock = roundQuantity(optionalNumber(input.stock) ?? 0);
  if (stock < 0) throw new SqliteValidationError("Le stock initial ne peut pas être négatif.");
  const purchasePrice = roundMoney(optionalNumber(input.purchasePrice ?? input.purchase_price) ?? 0);
  const salePrice = roundMoney(optionalNumber(input.salePrice ?? input.sale_price) ?? 0);
  if (purchasePrice < 0 || salePrice < 0) {
    throw new SqliteValidationError("Les prix ne peuvent pas être négatifs.");
  }

  const result = database.prepare(`
    INSERT INTO articles (
      name, sku, brand, brand_logo, category, subcategory, subsubcategory,
      description, unit, image_url, purchase_price, sale_price, stock, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    sku,
    cleanText(input.brand),
    cleanText(input.brandLogo ?? input.brand_logo),
    cleanText(input.category, "Non classée") || "Non classée",
    cleanText(input.subcategory),
    cleanText(input.subsubcategory),
    cleanText(input.description),
    cleanText(input.unit, "Unité") || "Unité",
    cleanText(input.imageUrl ?? input.image_url),
    purchasePrice,
    salePrice,
    stock,
    cleanText(input.status, statusForStock(stock)) || statusForStock(stock),
  );
  return getArticleById(database, Number(result.lastInsertRowid));
}

export function updateArticle(value: unknown): ArticleRecord {
  const input = asInputObject(value);
  const id = requiredId(input.id, "L’article");
  const stockDelta = input.stock_delta ?? input.stockDelta;
  if (stockDelta !== undefined) {
    const delta = optionalNumber(stockDelta);
    if (delta === undefined) throw new SqliteValidationError("L’ajustement de stock est invalide.");
    return adjustArticleStock(id, delta, cleanText(input.reason, "Ajustement manuel"));
  }

  const database = getDatabase();
  const existing = getArticleById(database, id);
  const stock = roundQuantity(optionalNumber(input.stock) ?? existing.stock);
  if (stock < 0) throw new SqliteValidationError("Le stock ne peut pas être négatif.");
  const purchasePrice = roundMoney(optionalNumber(input.purchasePrice ?? input.purchase_price) ?? existing.purchase_price);
  const salePrice = roundMoney(optionalNumber(input.salePrice ?? input.sale_price) ?? existing.sale_price);
  if (purchasePrice < 0 || salePrice < 0) {
    throw new SqliteValidationError("Les prix ne peuvent pas être négatifs.");
  }

  database.prepare(`
    UPDATE articles
    SET name = ?, sku = ?, brand = ?, brand_logo = ?, category = ?, subcategory = ?,
      subsubcategory = ?, description = ?, unit = ?, image_url = ?, purchase_price = ?,
      sale_price = ?, stock = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    cleanText(input.name, existing.name) || existing.name,
    cleanText(input.sku, existing.sku) || existing.sku,
    cleanText(input.brand, existing.brand),
    cleanText(input.brandLogo ?? input.brand_logo, existing.brand_logo),
    cleanText(input.category, existing.category) || "Non classée",
    cleanText(input.subcategory, existing.subcategory),
    cleanText(input.subsubcategory, existing.subsubcategory),
    cleanText(input.description, existing.description),
    cleanText(input.unit, existing.unit) || "Unité",
    cleanText(input.imageUrl ?? input.image_url, existing.image_url),
    purchasePrice,
    salePrice,
    stock,
    cleanText(input.status, statusForStock(stock)) || statusForStock(stock),
    id,
  );
  return getArticleById(database, id);
}

/**
 * Removes an article from the active catalogue while retaining its historical
 * document and stock links for accounting integrity.
 */
export function deleteArticle(articleId: unknown): ArticleRecord {
  const id = requiredId(articleId, "Article");
  const database = getDatabase();
  const article = getArticleById(database, id);
  database.prepare(`
    UPDATE articles
    SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);
  return article;
}

export function adjustArticleStock(articleId: number, quantityDelta: number, reason = "Ajustement manuel"): ArticleRecord {
  if (!Number.isFinite(quantityDelta)) throw new SqliteValidationError("L’ajustement de stock est invalide.");
  inTransaction((database) => {
    updateStockInDatabase(database, articleId, quantityDelta, reason, null);
  });
  return getArticleById(getDatabase(), articleId);
}

export function listStockMovements(articleId: number): StockMovementRecord[] {
  const id = requiredId(articleId, "L’article");
  return getDatabase().prepare(`
    SELECT id, article_id, document_id, quantity_delta, reason, created_at
    FROM stock_movements
    WHERE article_id = ?
    ORDER BY id DESC
  `).all(id) as unknown as StockMovementRecord[];
}

export function listDocuments(direction?: DocumentDirection, partyId?: unknown): DocumentRecord[] {
  const database = getDatabase();
  const id = partyId === undefined ? undefined : requiredId(partyId, "Le tiers");
  const filters: string[] = [];
  const parameters: (string | number)[] = [];
  if (direction) {
    filters.push("direction = ?");
    parameters.push(direction);
  }
  if (id !== undefined) {
    filters.push("party_id = ?");
    parameters.push(id);
  }
  const rows = database.prepare(`
    SELECT id, number, direction, type, party_id, party_name, source_document_id, source_document_number,
      document_date, status, show_description, subtotal, discount_amount, tax_rate, tax_amount,
      total, stock_applied, created_at, updated_at
    FROM documents
    ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
    ORDER BY document_date DESC, id DESC
  `).all(...parameters);

  return rows.map((row) => {
    const document = toDocumentRecord(row);
    return { ...document, lines: listLinesForDocument(database, document.id) };
  });
}

/** Deletes a document only when no later return depends on it and reverses the
 * stock movement that the original delivery/return applied. */
export function deleteDocument(documentId: unknown): DocumentRecord {
  const id = requiredId(documentId, "Le document");
  return inTransaction((database) => {
    const document = getDocumentById(database, id);
    const dependent = database.prepare("SELECT id FROM documents WHERE source_document_id = ? LIMIT 1").get(id);
    if (dependent) throw new SqliteValidationError("Créez ou supprimez d’abord les retours liés à ce document.");
    const isInvoiceReturn = document.type === "return" && Boolean(database.prepare(`
      SELECT id FROM documents WHERE id = ? AND type = 'invoice'
    `).get(document.source_document_id));
    if (document.type === "invoice" || isInvoiceReturn) {
      throw new SqliteValidationError("Une facture ou un retour de facture fait partie de l'historique financier et ne peut pas être supprimé.");
    }
    const lines = listLinesForDocument(database, id);
    if (document.stock_applied) {
      const stockSign = document.type === "return" ? -1 : 1;
      const directionSign = document.direction === "purchases" ? 1 : -1;
      for (const line of lines) {
        updateStockInDatabase(
          database,
          line.article_id,
          -line.quantity * stockSign * directionSign,
          `Annulation ${document.number}`,
          null,
        );
      }
    }
    database.prepare("DELETE FROM documents WHERE id = ?").run(id);
    return { ...document, lines };
  });
}

export function createDocument(value: unknown): DocumentRecord {
  const input = asInputObject(value);
  const type = normalizeDocumentType(input.type ?? input.documentType ?? input.document_type);
  const requestedSourceId = input.sourceDocumentId ?? input.source_document_id;
  const sourceDocumentId = requestedSourceId === undefined || requestedSourceId === null
    ? null
    : requiredId(requestedSourceId, "Le document source");
  const database = getDatabase();
  const source = sourceDocumentId === null ? null : getDocumentById(database, sourceDocumentId);
  const direction = source ? source.direction : normalizeDirection(input.direction ?? input.target);
  const requestedPartyId = input.partyId ?? input.party_id;
  const requestedPartyName = cleanText(input.partyName ?? input.party_name ?? input.party ?? input.name);
  const requestedParty = requestedPartyId === undefined || requestedPartyId === null
    ? null
    : validatePartyDirection(getPartyIdentityById(database, requiredId(requestedPartyId, "Le tiers")), direction);
  const sourceParty = source ? identityForDocument(database, source) : null;
  if (sourceParty && requestedParty && sourceParty.id !== requestedParty.id) {
    throw new SqliteValidationError("Le tiers doit être identique à celui du document source.");
  }
  if (sourceParty && requestedPartyName && sourceParty.name.localeCompare(requestedPartyName, undefined, { sensitivity: "accent" }) !== 0) {
    throw new SqliteValidationError("Le tiers doit être identique à celui du document source.");
  }
  const party = sourceParty ?? requestedParty ?? findPartyIdentityByName(
    database,
    partyKindForDirection(direction),
    requiredText(requestedPartyName, "Le tiers"),
  );
  const partyName = party.name;
  const documentDiscount = clampPercent(input.discount ?? input.discountPercent ?? input.discount_percent, 0, "La remise");
  const documentTaxRate = clampPercent(input.taxRate ?? input.tax_rate, 0, "La TVA");
  const rawLines = Array.isArray(input.lines) ? input.lines : [];
  const fallbackLine = rawLines.length
    ? rawLines
    : source && type === "return"
      ? getSourceLinesAsInput(database, source.id)
      : [input];
  const lines = fallbackLine.map((line) => normalizeLine(database, line, direction, documentDiscount, documentTaxRate));
  if (!lines.length) throw new SqliteValidationError("Ajoutez au moins une ligne au document.");

  if (type === "return") {
    if (!source) throw new SqliteValidationError("Un retour doit référencer un bon de livraison ou une facture.");
    if (source.direction !== direction || !["delivery", "invoice"].includes(source.type)) {
      throw new SqliteValidationError("Un retour doit référencer un bon de livraison ou une facture du même sens.");
    }
  }

  const subtotal = roundMoney(lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0));
  const discountAmount = roundMoney(lines.reduce(
    (total, line) => total + line.quantity * line.unitPrice * line.discountPercent / 100,
    0,
  ));
  const taxAmount = roundMoney(lines.reduce(
    (total, line) => total + (line.quantity * line.unitPrice * (1 - line.discountPercent / 100)) * line.taxRate / 100,
    0,
  ));
  const total = roundMoney(subtotal - discountAmount + taxAmount);
  const requestedNumber = cleanText(input.number);
  const documentDate = normalizeDocumentDate(input.documentDate ?? input.document_date ?? input.date);
  const status = cleanText(input.status, type === "quote" ? "Brouillon" : "Validé") || "Validé";
  const showDescription = booleanFrom(input.showDescription ?? input.show_description);

  return inTransaction((transaction) => {
    if (type === "return" && source) validateReturnLines(transaction, source, lines);
    const number = requestedNumber || makeDocumentNumber(transaction, direction, type);
    const exists = transaction.prepare("SELECT id FROM documents WHERE number = ?").get(number);
    if (exists) throw new SqliteValidationError("Ce numéro de document existe déjà.");

    const stockApplied = shouldApplyStock(type, source) ? 1 : 0;
    const result = transaction.prepare(`
      INSERT INTO documents (
        number, direction, type, party_id, party_name, source_document_id, source_document_number,
        document_date, status, show_description, subtotal, discount_amount, tax_rate,
        tax_amount, total, stock_applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      number,
      direction,
      type,
      party.id,
      partyName,
      sourceDocumentId,
      source?.number ?? "",
      documentDate,
      status,
      showDescription ? 1 : 0,
      subtotal,
      discountAmount,
      documentTaxRate,
      taxAmount,
      total,
      stockApplied,
    );
    const documentId = Number(result.lastInsertRowid);
    const insertLine = transaction.prepare(`
      INSERT INTO document_lines (
        document_id, article_id, designation, description, unit, quantity,
        unit_price, discount_percent, tax_rate, line_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const line of lines) {
      insertLine.run(
        documentId,
        line.article.id,
        line.designation,
        line.description,
        line.unit,
        line.quantity,
        line.unitPrice,
        line.discountPercent,
        line.taxRate,
        line.lineTotal,
      );
    }

    if (stockApplied) {
      const stockSign = type === "return" ? -1 : 1;
      const directionSign = direction === "purchases" ? 1 : -1;
      for (const line of lines) {
        updateStockInDatabase(
          transaction,
          line.article.id,
          line.quantity * stockSign * directionSign,
          `${documentLabel(type, direction)} ${number}`,
          documentId,
        );
      }
    }

    const document = getDocumentById(transaction, documentId);
    return { ...document, lines: listLinesForDocument(transaction, documentId) };
  });
}

export function updateDocument(value: unknown): DocumentRecord {
  const input = asInputObject(value);
  const documentId = requiredId(input.id ?? input.documentId, "Le document");
  const database = getDatabase();
  const existing = getDocumentById(database, documentId);
  const source = existing.source_document_id === null
    ? null
    : getDocumentById(database, existing.source_document_id);
  if (existing.type === "return") {
    throw new SqliteValidationError("Un bon de retour se modifie depuis son document source.");
  }
  const dependent = database.prepare(
    "SELECT id FROM documents WHERE source_document_id = ? LIMIT 1",
  ).get(existing.id);
  if (dependent) {
    throw new SqliteValidationError("Ce document possède un document lié et ne peut plus être modifié.");
  }

  const type = normalizeDocumentType(input.type ?? existing.type);
  if (type !== existing.type) {
    throw new SqliteValidationError("Le type d’un document existant ne peut pas être changé.");
  }
  const direction = existing.direction;
  const party = input.partyId === undefined && input.party_id === undefined
    ? identityForDocument(database, existing)
    : validatePartyDirection(
      getPartyIdentityById(database, requiredId(input.partyId ?? input.party_id, "Le tiers")),
      direction,
    );
  const requestedPartyName = cleanText(input.partyName ?? input.party_name ?? input.party);
  if (requestedPartyName && requestedPartyName.localeCompare(party.name, undefined, { sensitivity: "accent" }) !== 0) {
    throw new SqliteValidationError("Le nom du tiers ne correspond pas à sa fiche.");
  }

  const documentDiscount = clampPercent(input.discount ?? input.discountPercent ?? input.discount_percent, 0, "La remise");
  const documentTaxRate = clampPercent(input.taxRate ?? input.tax_rate, 0, "La TVA");
  const rawLines = Array.isArray(input.lines) ? input.lines : [];
  if (!rawLines.length) throw new SqliteValidationError("Ajoutez au moins une ligne au document.");
  const lines = rawLines.map((line) => normalizeLine(database, line, direction, documentDiscount, documentTaxRate));
  const subtotal = roundMoney(lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0));
  const discountAmount = roundMoney(lines.reduce(
    (total, line) => total + line.quantity * line.unitPrice * line.discountPercent / 100,
    0,
  ));
  const taxAmount = roundMoney(lines.reduce(
    (total, line) => total + (line.quantity * line.unitPrice * (1 - line.discountPercent / 100)) * line.taxRate / 100,
    0,
  ));
  const total = roundMoney(subtotal - discountAmount + taxAmount);
  const documentDate = normalizeDocumentDate(input.documentDate ?? input.document_date ?? input.date ?? existing.document_date);
  const status = cleanText(input.status, existing.status) || existing.status;
  const showDescription = booleanFrom(input.showDescription ?? input.show_description ?? existing.show_description);

  return inTransaction((transaction) => {
    const oldLines = listLinesForDocument(transaction, existing.id);
    if (existing.stock_applied) {
      const stockSign = existing.type === "return" ? -1 : 1;
      const directionSign = existing.direction === "purchases" ? 1 : -1;
      for (const line of oldLines) {
        updateStockInDatabase(
          transaction,
          line.article_id,
          -line.quantity * stockSign * directionSign,
          `Annulation modification ${existing.number}`,
          existing.id,
        );
      }
    }

    const stockApplied = shouldApplyStock(type, source) ? 1 : 0;
    transaction.prepare(`
      UPDATE documents
      SET party_id = ?, party_name = ?, document_date = ?, status = ?, show_description = ?,
        subtotal = ?, discount_amount = ?, tax_rate = ?, tax_amount = ?, total = ?,
        stock_applied = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      party.id,
      party.name,
      documentDate,
      status,
      showDescription ? 1 : 0,
      subtotal,
      discountAmount,
      documentTaxRate,
      taxAmount,
      total,
      stockApplied,
      existing.id,
    );
    transaction.prepare("DELETE FROM document_lines WHERE document_id = ?").run(existing.id);
    const insertLine = transaction.prepare(`
      INSERT INTO document_lines (
        document_id, article_id, designation, description, unit, quantity,
        unit_price, discount_percent, tax_rate, line_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const line of lines) {
      insertLine.run(
        existing.id,
        line.article.id,
        line.designation,
        line.description,
        line.unit,
        line.quantity,
        line.unitPrice,
        line.discountPercent,
        line.taxRate,
        line.lineTotal,
      );
    }
    if (stockApplied) {
      const directionSign = direction === "purchases" ? 1 : -1;
      for (const line of lines) {
        updateStockInDatabase(
          transaction,
          line.article.id,
          line.quantity * directionSign,
          `Modification ${existing.number}`,
          existing.id,
        );
      }
    }
    const document = getDocumentById(transaction, existing.id);
    return { ...document, lines: listLinesForDocument(transaction, existing.id) };
  });
}

export function createReturnFromDocument(sourceDocumentId: number, value: unknown = {}): DocumentRecord {
  const input = value && typeof value === "object" && !Array.isArray(value)
    ? value as InputObject
    : {};
  const source = getDocumentById(getDatabase(), requiredId(sourceDocumentId, "Le document source"));
  return createDocument({
    ...input,
    type: "return",
    direction: source.direction,
    partyId: source.party_id ?? undefined,
    sourceDocumentId: source.id,
  });
}
