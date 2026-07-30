import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("contains the compact workspace views and company settings", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");

  for (const view of [
    "Tableau de bord",
    "Clients",
    "Fournisseurs",
    "Articles",
    "Achats",
    "Ventes",
    "Documents",
    "Paramètres",
  ]) {
    assert.match(page, new RegExp(view));
  }

  for (const documentType of [
    "Devis",
    "Commandes",
    "BL / Réception",
    "Factures",
    "Bons de retour",
  ]) {
    assert.match(page, new RegExp(documentType));
  }

  assert.match(page, /topStats/);
  assert.match(page, /TableCard/);
  assert.match(page, /CreateModal/);
  assert.match(page, /DocumentEditor/);
  assert.match(page, /SimpleDocumentEditor/);
  assert.match(page, /pure-table-backdrop/);
  assert.match(page, /pure-document-table/);
  assert.match(page, /pure-add-line-button/);
  assert.match(page, /list="pure-party-options"/);
  assert.match(page, /list="pure-article-options"/);
  assert.match(page, /DocumentDraftLine/);
  assert.match(page, /lines\.map/);
  assert.match(page, /SettingsPage/);
  assert.match(page, /DocumentsLibrary/);
  assert.match(page, /EntityLogo/);
  assert.match(page, /ArticleBrandLogo/);
  assert.match(page, /ArticlesTable/);
  assert.match(page, /ArticleFormModal/);
  assert.match(page, /ProductVisual/);
  assert.match(page, /createPortal/);
  assert.match(page, /ReturnModal/);
  assert.match(page, /\/api\/articles/);
  assert.match(page, /\/api\/documents/);
  assert.match(page, /\/api\/parties/);
  assert.match(page, /SQLite local/);
  assert.match(page, /Nouveau client/);
  assert.match(page, /Nouveau fournisseur/);
  assert.match(page, /Nouveau document d’achat/);
  assert.match(page, /Article de la base SQLite/);
  assert.match(page, /Quantité/);
  assert.match(page, /Prix unitaire/);
  assert.match(page, /Remise %/);
  assert.match(page, /TVA %/);
  assert.match(page, /Total TTC/);
  assert.match(page, /toDocumentRecord/);
  assert.match(page, /withReturnedQuantities/);
  assert.doesNotMatch(page, /setTarget/);
  assert.doesNotMatch(page, /<option value="clients">Client<\/option>/);
  assert.match(page, /DocumentLogo/);
  assert.match(page, /LibraryFormat/);
  assert.match(page, /clientDetailsOpen/);
  assert.match(page, /Contact et informations fiscales/);
  assert.match(page, /NIF/);
  assert.match(page, /NIS/);
  assert.match(page, /COMPANY_STORAGE_KEY/);
  assert.match(page, /persistCompanySettings/);
  assert.match(page, /CompanyLogo/);
  assert.match(page, /filterActive/);
  assert.match(page, /viewMode/);
  assert.match(page, /lucide-react/);
  assert.doesNotMatch(page, /react-loading-skeleton|_sites-preview|codex-preview/);
});

test("keeps the visual system compact and production-ready", async () => {
  const [css, layout, packageJson] = await Promise.all([
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  assert.match(layout, /Axxam Workspace/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /og\.png/);
  assert.match(layout, /lang="fr"/);
  assert.match(css, /grid-template-columns:\s*220px/);
  assert.match(css, /\.topbar\s*\{[^}]*height:\s*56px/);
  assert.match(css, /\.top-stat/);
  assert.match(css, /\.table-card/);
  assert.match(css, /\.company-logo/);
  assert.match(css, /\.settings-card/);
  assert.match(css, /\.entity-logo/);
  assert.match(css, /\.article-brand-logo/);
  assert.match(css, /\.stock-value/);
  assert.match(css, /\.article-search-results/);
  assert.match(css, /\.selected-article/);
  assert.match(css, /\.document-total-card/);
  assert.match(css, /\.document-editor-backdrop/);
  assert.match(css, /\.document-editor-shell/);
  assert.match(css, /height:\s*100dvh/);
  assert.match(css, /\.document-lines-table/);
  assert.match(css, /\.party-detail-panel/);
  assert.match(css, /\.payment-history-table/);
  assert.match(css, /\.cash-action/);
  assert.match(css, /\.form-grid-four/);
  assert.match(css, /\.document-logo/);
  assert.match(css, /\.documents-library/);
  assert.match(css, /\.expandable-form-section/);
  assert.match(css, /\.articles-catalog/);
  assert.match(css, /\.article-grid/);
  assert.match(css, /\.article-product-card/);
  assert.match(css, /\.article-card-image/);
  assert.match(css, /\.article-category-editor/);
  assert.match(css, /\.description-toggle/);
  assert.match(css, /\.return-source/);
  assert.match(css, /\.return-stock-note/);
  assert.match(css, /font-family:\s*"Inter"/);
  assert.match(packageJson, /"lucide-react"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL(".next/BUILD_ID", root)),
    access(new URL(".next/server", root)),
    access(new URL(".openai/hosting.json", root)),
    access(new URL("public/og.png", root)),
    access(new URL("public/brands/google.png", root)),
    access(new URL("public/brands/amazon.svg", root)),
    access(new URL("public/products/macbook-pro-14.png", root)),
    access(new URL("public/products/imac-24.png", root)),
    access(new URL("public/products/macbook-air-13.png", root)),
    access(new URL("public/products/macbook-pro-16.png", root)),
  ]);
});

test("persists the three-level catalog and clean seeds in offline SQLite", async () => {
  const [schema, sqlite, route, worker, hosting, gitignore] = await Promise.all([
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("lib/sqlite.ts", root), "utf8"),
    readFile(new URL("app/api/articles/route.ts", root), "utf8"),
    readFile(new URL("worker/index.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL(".gitignore", root), "utf8"),
  ]);

  assert.match(hosting, /"d1":\s*null/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS articles/);
  assert.match(schema, /subcategory TEXT NOT NULL/);
  assert.match(schema, /subsubcategory TEXT NOT NULL/);
  assert.match(schema, /description TEXT NOT NULL/);
  assert.match(schema, /unit TEXT NOT NULL/);
  assert.match(schema, /image_url TEXT NOT NULL/);
  assert.match(schema, /is_deleted INTEGER NOT NULL/);
  assert.match(schema, /articles_category_idx/);
  assert.match(schema, /Google Pixel 9 Pro/);
  assert.match(schema, /Amazon Echo Dot/);
  assert.match(schema, /MacBook Pro M1 Pro 14/);
  assert.match(schema, /iMac M1 24/);
  assert.match(schema, /MacBook Air M1 13/);
  assert.match(schema, /MacBook Pro M3 Max 16/);
  assert.match(sqlite, /node:sqlite/);
  assert.match(sqlite, /data\/axxam\.sqlite/);
  assert.match(sqlite, /DatabaseSync/);
  assert.match(route, /listArticles/);
  assert.match(route, /export async function DELETE/);
  assert.match(sqlite, /deleteArticle/);
  assert.doesNotMatch(worker, /D1Database|env\.DB/);
  assert.match(gitignore, /data\/\*\.sqlite/);
  await access(new URL("data/.gitkeep", root));

  const partySeedSource = schema.slice(
    schema.indexOf("export const PARTY_SEEDS"),
    schema.indexOf("export const ARTICLE_SEEDS"),
  );
  const partySeedNames = [...partySeedSource.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(partySeedNames, ["Google", "Amazon", "Google", "Amazon"]);

  const articleSeedSource = schema.slice(schema.indexOf("export const ARTICLE_SEEDS"));
  const articleSeedNames = [...articleSeedSource.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(articleSeedNames.length, 6);
  assert.deepEqual(articleSeedNames.slice(0, 2), ["Google Pixel 9 Pro", "Amazon Echo Dot"]);
  assert.equal(articleSeedNames.slice(2).length, 4);
});

test("supports detailed article organization and the dedicated product grid", async () => {
  const [page, schema, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(page, /subcategory: string/);
  assert.match(page, /subsubcategory: string/);
  assert.match(page, /description: string/);
  assert.match(page, /unit: string/);
  assert.match(page, /image_url: string/);
  assert.match(page, /Arborescence catalogue/);
  assert.match(page, /Sous-catégorie/);
  assert.match(page, /Niveau 3/);
  assert.match(page, /Description complète/);
  assert.match(page, /Mètre \(M\)/);
  assert.match(page, /Bobine/);
  assert.match(page, /\/products\/macbook-pro-14\.png/);
  assert.match(page, /\/products\/imac-24\.png/);
  assert.match(page, /\/products\/macbook-air-13\.png/);
  assert.match(page, /\/products\/macbook-pro-16\.png/);
  assert.match(page, /article-product-card/);
  assert.match(page, /article-card-image/);
  assert.match(page, /article-hierarchy/);
  assert.match(page, /article-category-select/);
  assert.match(page, /article-category-options/);
  assert.match(page, /article-subcategory-options/);
  assert.match(page, /article-third-category-options/);
  assert.match(page, /method: "DELETE"/);
  assert.match(schema, /CREATE_ARTICLES_CATEGORY_INDEX_SQL/);
  assert.match(css, /grid-template-columns:\s*repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /\.article-product-card:hover/);
  assert.match(css, /\.article-card-prices/);
});

test("persists party location details and documents from quotes through returns", async () => {
  const [page, schema, sqlite, documentsRoute, returnsRoute, partiesRoute] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("lib/sqlite.ts", root), "utf8"),
    readFile(new URL("app/api/documents/route.ts", root), "utf8"),
    readFile(new URL("app/api/documents/[id]/return/route.ts", root), "utf8"),
    readFile(new URL("app/api/parties/route.ts", root), "utf8"),
  ]);

  assert.match(page, /clientDetailsOpen/);
  assert.match(page, /supplierDetailsOpen/);
  assert.match(page, /Adresse/);
  assert.match(page, /Ville/);
  assert.match(page, /headOffice/);
  assert.match(page, /Siège social/);
  assert.match(page, /postParty/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS parties/);
  assert.match(schema, /address TEXT NOT NULL/);
  assert.match(schema, /city TEXT NOT NULL/);
  assert.match(schema, /head_office TEXT NOT NULL/);
  assert.match(partiesRoute, /createParty/);
  assert.match(partiesRoute, /listParties/);

  assert.match(page, /<option>Devis<\/option>/);
  assert.match(page, /Créer la facture/);
  assert.match(page, /Créer un retour/);
  assert.match(page, /convertQuoteToInvoice/);
  assert.match(page, /confirmReturn/);
  assert.match(page, /Afficher la description complète/);
  assert.match(page, /showFullDescription/);
  assert.match(page, /\/api\/documents\/\$\{document\.id\}\/return/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS documents/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS document_lines/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS stock_movements/);
  assert.match(schema, /source_document_id/);
  assert.match(schema, /party_id INTEGER REFERENCES parties/);
  assert.match(schema, /DOCUMENT_COLUMN_MIGRATIONS/);
  assert.match(schema, /show_description/);
  assert.match(sqlite, /backfillDocumentPartyIds/);
  assert.match(sqlite, /partyId/);
  assert.match(sqlite, /createDocument/);
  assert.match(sqlite, /createReturnFromDocument/);
  assert.match(sqlite, /validateReturnLines/);
  assert.match(sqlite, /returnQuantityAlreadyUsed/);
  assert.match(sqlite, /shouldApplyStock/);
  assert.match(sqlite, /updateStockInDatabase/);
  assert.match(documentsRoute, /createDocument/);
  assert.match(documentsRoute, /listDocuments/);
  assert.match(returnsRoute, /createReturnFromDocument/);
});

test("persists settlements, charges and the treasury workspace", async () => {
  const [page, schema, sqlite, partiesRoute, documentsRoute, paymentsRoute, financeRoute, treasuryRoute] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("lib/sqlite.ts", root), "utf8"),
    readFile(new URL("app/api/parties/route.ts", root), "utf8"),
    readFile(new URL("app/api/documents/route.ts", root), "utf8"),
    readFile(new URL("app/api/payments/route.ts", root), "utf8"),
    readFile(new URL("app/api/finance/route.ts", root), "utf8"),
    readFile(new URL("app/api/treasury/route.ts", root), "utf8"),
  ]);

  assert.match(page, /Finance/);
  assert.match(page, /Encaisser/);
  assert.match(page, /Payer/);
  assert.match(page, /Banknote/);
  assert.match(page, /Historique des paiements/);
  assert.match(page, /\/api\/payments\?party_id=/);
  assert.match(page, /Fiche client complète/);
  assert.match(page, /Fiche fournisseur complète/);
  assert.match(page, /SettlementModal/);
  assert.match(page, /FinanceWorkspacePage/);
  assert.match(page, /FinanceEntryFormModal/);
  assert.match(page, /TreasuryEntryFormModal/);
  assert.match(page, /États des règlements/);
  assert.match(page, /Journal de trésorerie/);
  assert.match(page, /Crédit disponible/);
  assert.match(page, /PartyEditorModal/);
  assert.match(page, /DocumentDetailsModal/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS payments/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS finance_entries/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS treasury_entries/);
  assert.match(sqlite, /settleParty/);
  assert.match(sqlite, /credit/);
  assert.match(sqlite, /createFinanceEntry/);
  assert.match(sqlite, /updateFinanceEntry/);
  assert.match(sqlite, /deleteFinanceEntry/);
  assert.match(sqlite, /listTreasuryLedger/);
  assert.match(sqlite, /createTreasuryEntry/);
  assert.match(sqlite, /updateTreasuryEntry/);
  assert.match(sqlite, /deleteTreasuryEntry/);
  assert.match(sqlite, /updateDocument/);
  assert.match(sqlite, /updateParty/);
  assert.match(sqlite, /deleteParty/);
  assert.match(sqlite, /deleteDocument/);
  assert.match(partiesRoute, /export async function PATCH/);
  assert.match(partiesRoute, /export async function DELETE/);
  assert.match(documentsRoute, /export async function DELETE/);
  assert.match(documentsRoute, /export async function PATCH/);
  assert.match(paymentsRoute, /settleParty/);
  assert.match(financeRoute, /createFinanceEntry/);
  assert.match(financeRoute, /updateFinanceEntry/);
  assert.match(treasuryRoute, /listTreasuryLedger/);
  assert.match(treasuryRoute, /createTreasuryEntry/);
});
