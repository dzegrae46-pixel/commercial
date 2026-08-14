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
    "Feedback",
    "Paramètres",
  ]) {
    assert.match(page, new RegExp(view));
  }

  for (const documentType of [
    "Devis",
    "Commandes",
    "BL / Bons d’achat",
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
  assert.match(page, /document-editor-page/);
  assert.match(page, /pure-document-table/);
  assert.match(page, /pure-add-line-button/);
  assert.match(page, /pure-delete-line/);
  assert.match(page, /Le document est vide/);
  assert.match(page, /setLines\(\(rows\) => rows\.filter\(\(line\) => line\.key !== key\)\)/);
  assert.doesNotMatch(page, /rows\.length === 1\s*\?\s*\[emptyDocumentLine/);
  assert.match(page, /list="pure-party-options"/);
  assert.match(page, /list="pure-article-options"/);
  assert.match(page, /DocumentDraftLine/);
  assert.match(page, /lines\.map/);
  assert.match(page, /SettingsPage/);
  assert.match(page, /DocumentsLibrary/);
  assert.match(page, /FeedbackPage/);
  assert.match(page, /Nouveau feedback/);
  assert.match(page, /feedbackEnabled/);
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
  assert.match(page, /PrintableDocument/);
  assert.match(page, /Printer/);
  assert.match(page, /window\.print\(\)/);
  assert.match(page, /document-row-actions/);
  assert.match(page, /company\.logoDataUrl/);
  assert.match(page, /Aperçu avant impression/);
  assert.match(page, /Bon De Livraison/);
  assert.match(page, /print-col-label/);
  assert.match(page, /amountInFrenchWords/);
  assert.match(page, /print-manager-signature/);
  assert.match(page, /Total Net à payé/);
  assert.match(page, /article_sku/);
  assert.match(page, /readUploadedImage/);
  assert.match(page, /entity-photo-upload/);
  assert.match(page, /article-photo-upload/);
  assert.match(page, /image_url: imageUrl/);
  assert.match(page, /Ancien solde/);
  assert.match(page, /previous_balance/);
  assert.match(page, /activityLine1/);
  assert.match(page, /taxArticle/);
  assert.match(page, /example-gsr-logo\.svg/);
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

  assert.match(layout, /Commercial/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /og\.png/);
  assert.match(layout, /lang="fr"/);
  assert.match(css, /grid-template-columns:\s*220px/);
  assert.match(css, /\.topbar\s*\{[^}]*height:\s*56px/);
  assert.match(css, /\.top-stat/);
  assert.match(css, /\.table-card/);
  assert.match(css, /\.company-logo/);
  assert.match(css, /\.settings-card/);
  assert.match(css, /\.feedback-table-card/);
  assert.match(css, /\.settings-toggle-row/);
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
  assert.match(css, /\.pure-empty-lines-row/);
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
  assert.match(css, /\.print-document-sheet/);
  assert.match(css, /\.print-lines-table/);
  assert.match(css, /\.document-print-button/);
  assert.match(css, /\.print-preview-backdrop/);
  assert.match(css, /\.entity-photo-upload/);
  assert.match(css, /\.article-photo-upload/);
  assert.match(css, /\.settlement-balance-preview/);
  assert.match(css, /grid-template-columns:\s*35%\s+9%\s+56%/);
  assert.match(css, /\.print-company-logo[^}]*\{[^}]*height:\s*36mm/s);
  assert.match(css, /\.print-preview-backdrop \.print-company-header[^}]*position:\s*relative/s);
  assert.match(css, /\.print-preview-backdrop \.print-company-logo[^}]*position:\s*absolute/s);
  assert.match(css, /\.print-preview-backdrop \.print-company-identity[^}]*margin:\s*0 auto/s);
  assert.match(css, /font-family:\s*"Segoe UI",\s*Calibri,\s*Arial,\s*sans-serif/);
  assert.match(css, /\.print-company-identity h1[^}]*font-size:\s*22pt/s);
  assert.match(css, /\.print-lines-table td[^}]*font-size:\s*9pt/s);
  assert.match(css, /\.documents-modern-table \.document-print-button:hover[^}]*color:\s*#fff/s);
  assert.match(css, /@media print/);
  assert.match(css, /size:\s*A4 portrait/);
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
    access(new URL("public/example-gsr-logo.svg", root)),
  ]);
});

test("persists and manages user feedback in local SQLite", async () => {
  const [schema, sqlite, route] = await Promise.all([
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("lib/sqlite.ts", root), "utf8"),
    readFile(new URL("app/api/feedback/route.ts", root), "utf8"),
  ]);

  assert.match(schema, /CREATE TABLE IF NOT EXISTS feedback_items/);
  assert.match(schema, /'open', 'in_progress', 'resolved', 'closed'/);
  assert.match(schema, /'bug', 'suggestion'/);
  assert.match(sqlite, /export function listFeedback/);
  assert.match(sqlite, /export function createFeedback/);
  assert.match(sqlite, /export function updateFeedback/);
  assert.match(sqlite, /export function deleteFeedback/);
  assert.match(route, /export async function GET/);
  assert.match(route, /export async function POST/);
  assert.match(route, /export async function PATCH/);
  assert.match(route, /export async function DELETE/);
});

test("persists the four-depth catalog in isolated local SQLite databases", async () => {
  const [schema, sqlite, route, categoriesRoute, worker, hosting, gitignore] = await Promise.all([
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("lib/sqlite.ts", root), "utf8"),
    readFile(new URL("app/api/articles/route.ts", root), "utf8"),
    readFile(new URL("app/api/categories/route.ts", root), "utf8"),
    readFile(new URL("worker/index.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL(".gitignore", root), "utf8"),
  ]);

  assert.match(hosting, /"d1":\s*null/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS articles/);
  assert.match(schema, /subcategory TEXT NOT NULL/);
  assert.match(schema, /subsubcategory TEXT NOT NULL/);
  assert.match(schema, /subsubsubcategory TEXT NOT NULL/);
  assert.match(schema, /description TEXT NOT NULL/);
  assert.match(schema, /unit TEXT NOT NULL/);
  assert.match(schema, /image_url TEXT NOT NULL/);
  assert.match(schema, /is_deleted INTEGER NOT NULL/);
  assert.match(schema, /articles_category_idx/);
  assert.match(schema, /JURA SCHOOL/);
  assert.match(schema, /TECH DISTRIBUTION BÉJAÏA/);
  assert.match(schema, /Formation Fibre/);
  assert.match(schema, /ART0049/);
  assert.match(sqlite, /node:sqlite/);
  assert.match(sqlite, /data\/axxam\.sqlite/);
  assert.match(sqlite, /DatabaseSync/);
  assert.match(route, /listArticles/);
  assert.match(route, /export async function DELETE/);
  assert.match(sqlite, /deleteArticle/);
  assert.match(sqlite, /renameArticleCategory/);
  assert.match(sqlite, /deleteArticleCategory/);
  assert.match(categoriesRoute, /export async function PATCH/);
  assert.match(categoriesRoute, /export async function DELETE/);
  assert.doesNotMatch(worker, /D1Database|env\.DB/);
  assert.match(gitignore, /data\/\*\.sqlite/);
  await access(new URL("data/.gitkeep", root));

  const partySeedSource = schema.slice(
    schema.indexOf("export const PARTY_SEEDS"),
    schema.indexOf("export const ARTICLE_SEEDS"),
  );
  const partySeedNames = [...partySeedSource.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(partySeedNames, ["JURA SCHOOL", "TECH DISTRIBUTION BÉJAÏA"]);

  const articleSeedSource = schema.slice(schema.indexOf("export const ARTICLE_SEEDS"));
  const articleSeedNames = [...articleSeedSource.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(articleSeedNames, ["Formation Fibre"]);
});

test("supports detailed article organization and the dedicated product grid", async () => {
  const [page, schema, css, sqlite, categoriesRoute, articlesRoute] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("lib/sqlite.ts", root), "utf8"),
    readFile(new URL("app/api/categories/route.ts", root), "utf8"),
    readFile(new URL("app/api/articles/route.ts", root), "utf8"),
  ]);

  assert.match(page, /subcategory: string/);
  assert.match(page, /subsubcategory: string/);
  assert.match(page, /subsubsubcategory: string/);
  assert.match(page, /description: string/);
  assert.match(page, /unit: string/);
  assert.match(page, /image_url: string/);
  assert.match(page, /Arborescence catalogue/);
  assert.match(page, /Sous-catégorie/);
  assert.match(page, /Sous-sous-sous-catégorie/);
  assert.match(page, /Description complète/);
  assert.match(page, /Mètre \(M\)/);
  assert.match(page, /Bobine/);
  assert.match(page, /Choisir une photo/);
  assert.match(page, /image\/png,image\/jpeg,image\/webp/);
  assert.match(page, /article-product-card/);
  assert.match(page, /article-card-image/);
  assert.match(page, /article-hierarchy/);
  assert.match(page, /article-category-select/);
  assert.match(page, /article-hierarchy-filters/);
  assert.match(page, /Filtrer par famille/);
  assert.match(page, /Filtrer par sous-famille/);
  assert.match(page, /Filtrer par catégorie/);
  assert.match(page, /Filtrer par sous-catégorie/);
  assert.match(page, /article-category-options/);
  assert.match(page, /article-subcategory-options/);
  assert.match(page, /article-third-category-options/);
  assert.match(page, /CategoryManagerModal/);
  assert.match(page, /Catégories disponibles/);
  assert.match(page, /Ajouter une catégorie/);
  assert.match(page, /Créez une branche vide/);
  assert.match(page, /Arborescence du catalogue/);
  assert.match(page, /Tout déplier/);
  assert.match(page, /Tout replier/);
  assert.match(page, /role="tree"/);
  assert.match(page, /role="treeitem"/);
  assert.match(page, /collapsedBranches/);
  assert.match(page, /\/api\/categories/);
  assert.match(page, /viewMode=\{viewMode\}/);
  assert.doesNotMatch(page, /viewMode="grid"/);
  assert.match(page, /method: "DELETE"/);
  assert.match(categoriesRoute, /export async function POST/);
  assert.match(schema, /CREATE_CATALOG_CATEGORIES_TABLE_SQL/);
  assert.match(sqlite, /addArticleCategory/);
  assert.match(sqlite, /getNextArticleSku/);
  assert.match(articlesRoute, /next_sku/);
  assert.match(page, /Référence \/ code-barres/);
  assert.match(page, /event\.key !== "Enter"/);
  assert.match(page, /label: "Ventes"/);
  assert.match(schema, /CREATE_ARTICLES_CATEGORY_INDEX_SQL/);
  assert.match(css, /grid-template-columns:\s*repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /\.article-product-card:hover/);
  assert.match(css, /\.article-card-prices/);
  assert.match(css, /\.category-manager-tree/);
  assert.match(css, /\.category-level-3/);
  assert.match(css, /\.category-tree-toggle/);
  assert.match(css, /\.category-manager-children::before/);
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
  assert.match(schema, /tax_article TEXT NOT NULL/);
  assert.match(schema, /rib TEXT NOT NULL/);
  assert.match(partiesRoute, /createParty/);
  assert.match(partiesRoute, /listParties/);

  assert.match(page, /<option>Devis<\/option>/);
  assert.match(page, /Transférer vers/);
  assert.match(page, /Créer un retour/);
  assert.match(page, /transferDocument/);
  assert.match(page, /QuickPartyCreateModal/);
  assert.match(page, /quick-party-details/);
  assert.match(page, /detailsOpen/);
  assert.match(page, /head_office: headOffice/);
  assert.match(page, /tax_article: taxArticle/);
  assert.match(page, />N° article</);
  assert.match(page, />RIB</);
  assert.match(page, /Informations fiscales/);
  assert.match(page, />NIS</);
  assert.match(page, /offerSettlementAfterDocument/);
  assert.match(sqlite, /allowedDocumentTransfers/);
  assert.match(sqlite, /validateDocumentTransfer/);
  assert.match(sqlite, /transferred_invoice/);
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
  assert.match(page, /finance-hub-grid/);
  assert.match(page, /finance-card-charges/);
  assert.match(page, /finance-card-treasury/);
  assert.match(page, /finance-card-settlements/);
  assert.ok(page.indexOf("finance-card-treasury") > page.indexOf("finance-card-settlements"));
  assert.match(page, /Vue d’ensemble/);
  assert.match(page, /Crédit disponible/);
  assert.match(page, /PartyEditorModal/);
  assert.match(page, /DocumentDetailsModal/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS payments/);
  assert.match(schema, /previous_balance REAL/);
  assert.match(schema, /PAYMENT_COLUMN_MIGRATIONS/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS finance_entries/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS treasury_entries/);
  assert.match(sqlite, /settleParty/);
  assert.match(sqlite, /INSERT INTO payments \(party_id, direction, amount, previous_balance/);
  assert.match(sqlite, /a\.sku AS article_sku/);
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

test("manages employees, payroll, party balances and duplicate document lines", async () => {
  const [page, css, schema, sqlite, employeesRoute] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("lib/sqlite.ts", root), "utf8"),
    readFile(new URL("app/api/employees/route.ts", root), "utf8"),
  ]);

  assert.doesNotMatch(page, /aria-label="Recherche globale"/);
  assert.match(page, /Employés &amp; paie/);
  assert.match(page, /EmployeeFormModal/);
  assert.match(page, /AttendanceFormModal/);
  assert.match(page, /SalaryPaymentModal/);
  assert.match(page, /Le paiement créera automatiquement une charge/);
  assert.match(page, /duplicate-line-notice/);
  assert.match(page, /est déjà dans le tableau/);
  assert.match(page, /resolveDuplicate\("add"\)/);
  assert.doesNotMatch(page, /className="documents-portfolio-summary"/);
  assert.match(page, /documents-modern-table/);
  assert.match(page, /document-editor-page-content/);
  assert.match(page, /<section className="document-editor-page"/);
  assert.match(page, /document-fullscreen-mode/);
  assert.match(page, /document-fullscreen-editor/);
  assert.match(page, /document-screen-header/);
  assert.match(page, /document-summary-bar/);
  assert.match(page, /document-title-type/);
  assert.match(page, /document-party-input/);
  assert.doesNotMatch(page, /className="document-type-segmented"/);
  assert.match(page, /document-command-grid/);
  assert.doesNotMatch(page, /className="document-lines-toolbar"/);
  assert.match(page, /!activeDocumentEditor && <aside className="sidebar">/);
  assert.match(page, /table-header-with-tabs/);
  assert.match(page, /aria-label="Types de documents"/);
  assert.doesNotMatch(page, /pure-table-editor" role="dialog"/);
  assert.match(css, /\.finance-card-employees/);
  assert.match(css, /\.employee-table/);
  assert.match(css, /\.documents-workspace-card/);
  assert.match(css, /\.document-editor-page/);
  assert.match(css, /\.app-shell\.document-fullscreen-mode/);
  assert.match(css, /\.document-screen-content/);
  assert.match(css, /\.document-line-builder/);
  assert.match(css, /\.document-command-grid/);
  assert.match(css, /\.document-title-type/);
  assert.match(css, /\.document-transfer-menu/);
  assert.match(css, /\.document-command-bar/);
  assert.match(css, /\.document-summary-grand-total/);
  assert.match(css, /\.duplicate-line-notice/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS employees/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS employee_attendance/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS salary_payments/);
  assert.match(sqlite, /payEmployeeSalary/);
  assert.match(sqlite, /INSERT INTO finance_entries/);
  assert.match(sqlite, /mergeDocumentLines/);
  assert.match(sqlite, /WHEN d\.type = 'invoice'/);
  assert.match(sqlite, /WHEN d\.type = 'delivery' AND NOT EXISTS/);
  assert.match(employeesRoute, /action === "pay_salary"/);
  assert.match(employeesRoute, /recordEmployeeAttendance/);
});

test("supports monthly references, contact status, balance charts and margin tariffs", async () => {
  const [page, css, schema, sqlite, partiesRoute, employeesRoute] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("lib/sqlite.ts", root), "utf8"),
    readFile(new URL("app/api/parties/route.ts", root), "utf8"),
    readFile(new URL("app/api/employees/route.ts", root), "utf8"),
  ]);

  assert.match(sqlite, /return `\$\{prefix\}-\$\{yearMonth\}-\$\{String\(order\)\.padStart\(5, "0"\)\}`/);
  assert.match(sqlite, /migrateDocumentNumbers/);
  assert.match(sqlite, /document_number_direction_yyyymm_v2/);
  assert.match(schema, /sale_prices_json TEXT NOT NULL DEFAULT '\[\]'/);
  assert.match(schema, /purchase_prices_json TEXT NOT NULL DEFAULT '\[\]'/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS client_categories/);
  assert.match(sqlite, /normalizePurchasePrices/);
  assert.match(sqlite, /listClientCategories/);
  assert.match(page, /Tarifs par catégorie client/);
  assert.match(page, /Prix de vente \(DA\)/);
  assert.match(page, /marginFromSalePrice/);
  assert.match(page, /Gérer les catégories clients/);
  assert.match(schema, /contact_status TEXT NOT NULL DEFAULT 'Divers'/);
  assert.match(schema, /phone TEXT NOT NULL DEFAULT ''/);
  assert.match(schema, /client_category TEXT NOT NULL DEFAULT ''/);
  assert.match(schema, /bank TEXT NOT NULL DEFAULT ''/);
  assert.match(schema, /note TEXT NOT NULL DEFAULT ''/);
  assert.match(schema, /is_blocked INTEGER NOT NULL DEFAULT 0/);
  assert.match(sqlite, /replace\(",", "\."\)/);
  assert.match(sqlite, /toLocaleUpperCase\("fr"\)/);
  assert.match(sqlite, /Bon d’achat/);
  assert.match(page, /DocumentTypePickerModal/);
  assert.match(page, /article-premium-hero/);
  assert.match(page, /Ajout rapide/);
  assert.match(page, /Plus de détails/);
  assert.match(page, /article-quick-price-field/);
  assert.match(page, /article-logo-picker/);
  assert.match(page, /article-identity-grid/);
  assert.match(page, /article-stock-description-grid/);
  assert.match(page, /quick-party-rib-field/);
  assert.match(page, /compact-field-modal/);
  const articleModalSource = page.slice(page.indexOf("function ArticleFormModal"), page.indexOf("function ReturnModal"));
  assert.doesNotMatch(articleModalSource, /Prix d’achat/);
  assert.match(page, /Bloquer le client/);
  assert.match(page, /Téléphone du contact/);
  assert.match(sqlite, /listPartyBalanceHistory/);
  assert.match(partiesRoute, /get\("history"\) === "balance"/);
  assert.match(sqlite, /updateSalaryPayment/);
  assert.match(employeesRoute, /action === "update_salary"/);
  assert.match(page, /Période du tableau de bord/);
  assert.match(page, /Fournisseurs/);
  assert.match(page, /PartyBalanceHistoryChart/);
  assert.match(page, /Tarifs par catégorie client/);
  assert.match(page, /margin_percent/);
  assert.match(page, /Imprimé à \{company\.city\} le/);
  assert.match(page, /FINANCE_CHARGE_CATEGORIES/);
  assert.match(css, /\.balance-history-chart/);
  assert.match(css, /\.article-price-tiers/);
  assert.match(css, /scrollbar-thumb/);
  assert.match(css, /\.quick-party-contact-grid/);
});
