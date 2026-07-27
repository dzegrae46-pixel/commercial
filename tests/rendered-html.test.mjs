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
  assert.match(page, /SettingsPage/);
  assert.match(page, /DocumentsLibrary/);
  assert.match(page, /EntityLogo/);
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
  assert.match(css, /\.document-logo/);
  assert.match(css, /\.documents-library/);
  assert.match(css, /\.expandable-form-section/);
  assert.match(css, /font-family:\s*"Inter"/);
  assert.match(packageJson, /"lucide-react"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL(".next/BUILD_ID", root)),
    access(new URL(".next/server", root)),
    access(new URL(".openai/hosting.json", root)),
    access(new URL("public/og.png", root)),
  ]);
});
