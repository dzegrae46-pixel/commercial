"use client";

import {
  ArrowLeft,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Banknote,
  Bell,
  Boxes,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Coffee,
  ContactRound,
  Copy,
  Eye,
  FileCheck2,
  FileImage,
  FileText,
  Files,
  Folder,
  Grid2X2,
  Hotel,
  Home,
  ImageIcon,
  List,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Printer,
  ReceiptText,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShoppingBag,
  ShoppingBasket,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Upload,
  Users,
  WalletCards,
  Wheat,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type PageKey = "dashboard" | "clients" | "suppliers" | "articles" | "purchases" | "sales" | "finance" | "documents" | "settings";
type BusinessPage = "clients" | "suppliers" | "purchases" | "sales";
type DocType = "all" | "quotes" | "orders" | "delivery" | "invoices" | "returns";
type LibraryCategory = DocType;
type LibraryFormat = "all" | "pdf" | "images";
type LibraryDirection = "all" | "purchases" | "sales";
type ViewMode = "list" | "grid";

type CompanySettings = {
  name: string;
  logoDataUrl: string;
  defaultTaxRate: number;
};

type ClientRecord = {
  id: number;
  name: string;
  initials: string;
  color: string;
  contact: string;
  email: string;
  billed: string;
  paid: string;
  credit: string;
  balance: string;
  status: string;
  activity: string;
  contactName?: string;
  address?: string;
  city?: string;
  headOffice?: string;
  category?: string;
  nif?: string;
  nis?: string;
  rc?: string;
};

type SupplierRecord = {
  id: number;
  name: string;
  initials: string;
  color: string;
  contact: string;
  category: string;
  purchases: string;
  paid: string;
  credit: string;
  balance: string;
  status: string;
  contactName?: string;
  email?: string;
  address?: string;
  city?: string;
  headOffice?: string;
  nif?: string;
  nis?: string;
  rc?: string;
};

type DocumentRecord = {
  number: string;
  party: string;
  type: string;
  date: string;
  amount: string;
  status: string;
  tone: string;
  summary?: string;
  id?: number;
  articleId?: number;
  articleName?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  discountPercent?: number;
  taxRate?: number;
  description?: string;
  sourceDocument?: string;
  showFullDescription?: boolean;
  returnedQuantity?: number;
  sourceDocumentId?: number;
  partyId?: number;
  rawDate?: string;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  total?: number;
  lines?: ApiDocumentLine[];
};

type DocumentContext = {
  direction: "purchases" | "sales";
  document: DocumentRecord;
  partyAddress?: string;
};

type ApiDocumentLine = {
  id?: number;
  document_id?: number;
  article_id: number;
  designation: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  line_total: number;
  image_url?: string;
};

type ApiDocumentRecord = {
  id: number;
  number: string;
  direction: "purchases" | "sales";
  type: "quote" | "order" | "delivery" | "invoice" | "return";
  type_label: string;
  party_id?: number | null;
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
  lines?: ApiDocumentLine[];
};

type ApiPartyRecord = {
  id: number;
  kind: "client" | "supplier";
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
  billed: number;
  paid?: number;
  credit?: number;
  balance: number;
  status: string;
};

type PaymentRecord = {
  id: number;
  party_id: number;
  direction: "incoming" | "outgoing";
  amount: number;
  payment_date: string;
  method: string;
  note: string;
  created_at: string;
};

type FinanceEntry = {
  id: number;
  kind: "expense" | "charge";
  label: string;
  category: string;
  amount: number;
  entry_date: string;
  status: string;
  note: string;
};

type TreasuryLedgerRow = {
  id: string;
  source: "manual" | "payment" | "finance";
  source_id: number;
  direction: "in" | "out";
  label: string;
  category: string;
  amount: number;
  entry_date: string;
  note: string;
  party_id: number | null;
  editable: boolean;
};

type TreasuryEntry = Omit<TreasuryLedgerRow, "id" | "source" | "source_id" | "party_id" | "editable"> & {
  id: number;
};

type LibraryRecord = Omit<DocumentRecord, "id"> & {
  id: string;
  source: "Achats" | "Ventes";
  direction: "purchases" | "sales";
  format: "PDF" | "JPG" | "PNG";
  fileName: string;
  size: string;
};

type ArticleRecord = {
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

type CategoryTree = {
  name: string;
  subcategories: {
    name: string;
    subcategories: string[];
  }[];
};

type CategoryEditTarget = {
  key: string;
  level: 1 | 2 | 3;
  category: string;
  subcategory: string;
  currentName: string;
};

type CreatePayload = {
  target: BusinessPage;
  name: string;
  detail: string;
  documentType: string;
  contactName?: string;
  email?: string;
  address?: string;
  city?: string;
  headOffice?: string;
  nif?: string;
  nis?: string;
  rc?: string;
  articleName?: string;
  articleId?: number;
  articleDescription?: string;
  unit?: string;
  showFullDescription?: boolean;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  taxRate?: number;
  documentDate?: string;
  total?: number;
  partyId?: number;
  documentId?: number;
  lines?: DocumentDraftLine[];
};

type DocumentDraftLine = {
  key: string;
  articleId: number | null;
  articleQuery: string;
  designation: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  stock: number | null;
};

const pageMeta: Record<PageKey, { label: string; subtitle: string; icon: LucideIcon }> = {
  dashboard: { label: "Tableau de bord", subtitle: "Vue synthétique de votre activité", icon: Home },
  clients: { label: "Clients", subtitle: "Relations et soldes clients", icon: Users },
  suppliers: { label: "Fournisseurs", subtitle: "Partenaires et achats", icon: Truck },
  articles: { label: "Articles", subtitle: "Catalogue et niveaux de stock", icon: Boxes },
  purchases: { label: "Achats", subtitle: "Documents, réceptions et retours", icon: ShoppingBag },
  sales: { label: "Ventes", subtitle: "Devis, commandes et factures", icon: Store },
  finance: { label: "Finance", subtitle: "Dépenses, charges et règlements", icon: WalletCards },
  documents: { label: "Documents", subtitle: "Tous vos fichiers commerciaux", icon: Files },
  settings: { label: "Paramètres", subtitle: "Identité de votre entreprise", icon: Settings2 },
};

const navGroups: { label: string; items: { label: string; icon: LucideIcon; key?: PageKey }[] }[] = [
  {
    label: "Menu",
    items: [
      { key: "dashboard", label: "Tableau de bord", icon: Home },
      { key: "clients", label: "Clients", icon: Users },
      { key: "suppliers", label: "Fournisseurs", icon: Truck },
      { key: "articles", label: "Articles", icon: Boxes },
      { key: "purchases", label: "Achats", icon: ShoppingBag },
      { key: "sales", label: "Ventes", icon: Store },
      { key: "finance", label: "Finance", icon: WalletCards },
    ],
  },
  {
    label: "Espace de travail",
    items: [
      { key: "documents", label: "Documents", icon: Folder },
    ],
  },
  {
    label: "Privé",
    items: [{ key: "settings", label: "Paramètres", icon: Settings2 }],
  },
];

const topStats: Record<PageKey, { label: string; value: string; trend: string; icon: LucideIcon }[]> = {
  dashboard: [
    { label: "Catalogue", value: "6 articles", trend: "SQLite local", icon: BarChart3 },
    { label: "Ventes", value: "2 tests", trend: "Google + Amazon", icon: Store },
    { label: "Achats", value: "2 tests", trend: "Google + Amazon", icon: ShoppingBag },
  ],
  clients: [
    { label: "Clients", value: "2", trend: "Google + Amazon", icon: Users },
    { label: "Factures", value: "1", trend: "Test", icon: FileText },
    { label: "À recevoir", value: "8 900 DA", trend: "1 ouvert", icon: WalletCards },
  ],
  suppliers: [
    { label: "Fournisseurs", value: "2", trend: "Google + Amazon", icon: Truck },
    { label: "Total achats", value: "107 400 DA", trend: "Tests", icon: ShoppingBag },
    { label: "Reste à payer", value: "6 200 DA", trend: "1 facture", icon: WalletCards },
  ],
  articles: [
    { label: "Articles", value: "2", trend: "SQLite local", icon: Boxes },
    { label: "Valeur du stock", value: "2,21 M DA", trend: "25 unités", icon: Package },
    { label: "Stock faible", value: "1", trend: "À surveiller", icon: ShoppingBag },
  ],
  purchases: [
    { label: "Achats", value: "2 docs", trend: "Tests", icon: ShoppingBag },
    { label: "Factures", value: "1", trend: "Amazon", icon: FileCheck2 },
    { label: "Réceptions", value: "1", trend: "Google", icon: ClipboardList },
  ],
  sales: [
    { label: "Ventes", value: "2 docs", trend: "Tests", icon: Store },
    { label: "Factures", value: "1", trend: "Amazon", icon: FileCheck2 },
    { label: "Livraisons", value: "1", trend: "Google", icon: WalletCards },
  ],
  finance: [
    { label: "Dépenses", value: "0 DA", trend: "Ce mois", icon: ReceiptText },
    { label: "Charges", value: "0 DA", trend: "À comptabiliser", icon: WalletCards },
    { label: "Règlements", value: "À jour", trend: "Clients et fournisseurs", icon: Check },
  ],
  documents: [
    { label: "Documents", value: "4", trend: "Achats + ventes", icon: Files },
    { label: "Fichiers PDF", value: "2", trend: "Factures", icon: FileText },
    { label: "Images", value: "2", trend: "BL / réception", icon: FileImage },
  ],
  settings: [
    { label: "Profil", value: "Entreprise", trend: "Actif", icon: Store },
    { label: "Logo", value: "Personnalisable", trend: "PNG / JPG", icon: ImageIcon },
    { label: "Sauvegarde", value: "Locale", trend: "Privée", icon: Settings2 },
  ],
};

// All displayed records are loaded from the offline SQLite API.  The database
// itself starts with the requested Google/Amazon examples; no front-end mock
// rows are kept here.
const initialClients: ClientRecord[] = [];
const initialSuppliers: SupplierRecord[] = [];
const initialPurchases: DocumentRecord[] = [];
const initialSales: DocumentRecord[] = [];

const docTabs: { value: DocType; label: string; icon: LucideIcon }[] = [
  { value: "all", label: "Tous", icon: List },
  { value: "quotes", label: "Devis", icon: FileText },
  { value: "orders", label: "Commandes", icon: ClipboardList },
  { value: "delivery", label: "BL / Réception", icon: Truck },
  { value: "invoices", label: "Factures", icon: FileCheck2 },
  { value: "returns", label: "Bons de retour", icon: ArrowDownRight },
];

const documentTabsFor = (page: "purchases" | "sales") =>
  docTabs.map((tab) =>
    tab.value === "delivery"
      ? { ...tab, label: page === "purchases" ? "Réceptions" : "Bons de livraison" }
      : tab,
  );

const documentTypeForTab = (tab: DocType, page: "purchases" | "sales") => {
  if (tab === "quotes") return "Devis";
  if (tab === "orders") return "Bon de commande";
  if (tab === "delivery") return page === "purchases" ? "Bon de réception" : "Bon de livraison";
  if (tab === "invoices") return "Facture";
  return "";
};

const libraryTabs: { value: LibraryCategory; label: string; icon: LucideIcon }[] = [
  { value: "all", label: "Tous", icon: Files },
  { value: "invoices", label: "Factures", icon: ReceiptText },
  { value: "quotes", label: "Devis", icon: FileText },
  { value: "orders", label: "Commandes", icon: ClipboardList },
  { value: "delivery", label: "BL / Réceptions", icon: Truck },
  { value: "returns", label: "Retours", icon: ArrowDownRight },
];

const DEFAULT_COMPANY: CompanySettings = { name: "Axxam", logoDataUrl: "", defaultTaxRate: 0 };
const COMPANY_STORAGE_KEY = "axxam-company-settings";
const COMPANY_CHANGE_EVENT = "axxam-company-settings-change";

let companyCacheRaw: string | null | undefined;
let companyCache: CompanySettings = DEFAULT_COMPANY;

const readCompanySettings = (): CompanySettings => {
  if (typeof window === "undefined") return DEFAULT_COMPANY;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(COMPANY_STORAGE_KEY);
  } catch {
    return DEFAULT_COMPANY;
  }
  if (raw === companyCacheRaw) return companyCache;
  companyCacheRaw = raw;

  if (!raw) {
    companyCache = DEFAULT_COMPANY;
    return companyCache;
  }

  try {
    const stored = JSON.parse(raw) as Partial<CompanySettings>;
    companyCache = {
      name: typeof stored.name === "string" && stored.name.trim()
        ? stored.name.trim().slice(0, 40)
        : DEFAULT_COMPANY.name,
      logoDataUrl: typeof stored.logoDataUrl === "string" && stored.logoDataUrl.startsWith("data:image/")
        ? stored.logoDataUrl
        : "",
      defaultTaxRate: typeof stored.defaultTaxRate === "number" && Number.isFinite(stored.defaultTaxRate)
        ? Math.min(100, Math.max(0, stored.defaultTaxRate))
        : DEFAULT_COMPANY.defaultTaxRate,
    };
  } catch {
    companyCache = DEFAULT_COMPANY;
  }

  return companyCache;
};

const subscribeToCompany = (onChange: () => void) => {
  window.addEventListener(COMPANY_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COMPANY_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const persistCompanySettings = (nextSettings: CompanySettings) => {
  const cleaned: CompanySettings = {
    name: nextSettings.name.trim().slice(0, 40) || DEFAULT_COMPANY.name,
    logoDataUrl: nextSettings.logoDataUrl.startsWith("data:image/") ? nextSettings.logoDataUrl : "",
    defaultTaxRate: Math.min(100, Math.max(0, Number(nextSettings.defaultTaxRate) || 0)),
  };
  const serialized = JSON.stringify(cleaned);

  try {
    window.localStorage.setItem(COMPANY_STORAGE_KEY, serialized);
    companyCacheRaw = serialized;
    companyCache = cleaned;
    window.dispatchEvent(new Event(COMPANY_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
};

const readPageFromUrl = (): PageKey => {
  if (typeof window === "undefined") return "dashboard";
  const candidate = window.location.hash.slice(1);
  return candidate in pageMeta ? candidate as PageKey : "dashboard";
};

const subscribeToPage = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
};

const normalizeLabel = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const categoryTreeForArticles = (articles: ArticleRecord[]): CategoryTree[] => {
  const categories = new Map<string, Map<string, Set<string>>>();
  for (const article of articles) {
    const category = article.category.trim() || "Non classée";
    const subcategory = article.subcategory.trim();
    const thirdLevel = article.subsubcategory.trim();
    const subcategories = categories.get(category) ?? new Map<string, Set<string>>();
    if (subcategory) {
      const thirdLevels = subcategories.get(subcategory) ?? new Set<string>();
      if (thirdLevel) thirdLevels.add(thirdLevel);
      subcategories.set(subcategory, thirdLevels);
    }
    categories.set(category, subcategories);
  }
  return [...categories.entries()]
    .map(([name, subcategories]) => ({
      name,
      subcategories: [...subcategories.entries()]
        .map(([subcategory, thirdLevels]) => ({
          name: subcategory,
          subcategories: [...thirdLevels].sort((left, right) => left.localeCompare(right, "fr")),
        }))
        .sort((left, right) => left.name.localeCompare(right.name, "fr")),
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "fr"));
};

const formatDa = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)} DA`;

const formatDocumentDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const documentTone = (document: ApiDocumentRecord): string => {
  if (document.type === "return") return "pink";
  if (document.type === "quote") return "gray";
  if (document.type === "delivery") return document.direction === "purchases" ? "blue" : "green";
  if (document.type === "invoice") return "green";
  return "blue";
};

const displayDocumentType = (document: ApiDocumentRecord) =>
  document.type === "delivery" && document.direction === "purchases"
    ? "Bon de réception"
    : document.type_label;

const toDocumentRecord = (document: ApiDocumentRecord): DocumentRecord => {
  const lines = document.lines ?? [];
  const line = lines[0];
  const type = displayDocumentType(document);
  const summary = line
    ? lines.length > 1
      ? `${lines.length} articles · ${line.designation} + ${lines.length - 1}`
      : `${line.quantity} ${line.unit || "unité"} × ${line.designation}${document.show_description && line.description ? ` · ${line.description}` : ""}`
    : undefined;

  return {
    id: document.id,
    partyId: document.party_id ?? undefined,
    number: document.number,
    party: document.party_name,
    type,
    rawDate: document.document_date,
    date: formatDocumentDate(document.document_date),
    amount: `${document.type === "return" ? "-" : ""}${formatDa(document.total)}`,
    status: document.type === "return" ? "Traité" : document.status,
    tone: documentTone(document),
    summary,
    articleId: line?.article_id,
    articleName: line?.designation,
    quantity: line?.quantity,
    unit: line?.unit,
    unitPrice: line?.unit_price,
    discountPercent: line?.discount_percent,
    taxRate: line?.tax_rate,
    description: line?.description,
    sourceDocument: document.source_document_number || undefined,
    sourceDocumentId: document.source_document_id ?? undefined,
    showFullDescription: Boolean(document.show_description),
    subtotal: document.subtotal,
    discountAmount: document.discount_amount,
    taxAmount: document.tax_amount,
    total: document.total,
    lines,
  };
};

const withReturnedQuantities = (rows: DocumentRecord[]) => {
  const quantities = new Map<number, number>();
  for (const row of rows) {
    if (row.type !== "Bon de retour" || !row.sourceDocumentId) continue;
    quantities.set(row.sourceDocumentId, (quantities.get(row.sourceDocumentId) ?? 0) + (row.quantity ?? 0));
  }
  return rows.map((row) => row.id
    ? { ...row, returnedQuantity: quantities.get(row.id) ?? row.returnedQuantity }
    : row);
};

const toClientRecord = (party: ApiPartyRecord): ClientRecord => ({
  id: party.id,
  name: party.name,
  initials: initials(party.name),
  color: normalizeLabel(party.name).includes("amazon") ? "sun" : "blue",
  contact: party.contact_phone || "—",
  email: party.email || "E-mail non renseigné",
  contactName: party.contact_name || undefined,
  address: party.address || undefined,
  city: party.city || undefined,
  headOffice: party.head_office || undefined,
  category: party.category || undefined,
  nif: party.nif || undefined,
  nis: party.nis || undefined,
  rc: party.rc || undefined,
  billed: formatDa(party.billed ?? 0),
  paid: formatDa(party.paid ?? 0),
  credit: formatDa(party.credit ?? 0),
  balance: formatDa(party.balance ?? 0),
  status: party.status ?? "À jour",
  activity: party.balance > 0 ? "Règlement attendu" : "À jour",
});

const toSupplierRecord = (party: ApiPartyRecord): SupplierRecord => ({
  id: party.id,
  name: party.name,
  initials: initials(party.name),
  color: normalizeLabel(party.name).includes("amazon") ? "sun" : "blue",
  contact: party.contact_phone || "—",
  contactName: party.contact_name || undefined,
  email: party.email || undefined,
  address: party.address || undefined,
  city: party.city || undefined,
  headOffice: party.head_office || undefined,
  nif: party.nif || undefined,
  nis: party.nis || undefined,
  rc: party.rc || undefined,
  category: party.category || "Général",
  purchases: formatDa(party.billed ?? 0),
  paid: formatDa(party.paid ?? 0),
  credit: formatDa(party.credit ?? 0),
  balance: formatDa(party.balance ?? 0),
  status: party.status ?? "À jour",
});

function EntityLogo({
  name,
  tone,
  kind,
}: {
  name: string;
  tone: string;
  kind: "client" | "supplier";
}) {
  const normalized = normalizeLabel(name);
  let Icon: LucideIcon = kind === "client" ? Building2 : Boxes;

  if (normalized.includes("google")) return <ArticleBrandLogo brand="Google" logo="/brands/google.png" />;
  if (normalized.includes("amazon")) return <ArticleBrandLogo brand="Amazon" logo="/brands/amazon.svg" />;

  if (normalized.includes("cafe")) Icon = Coffee;
  else if (normalized.includes("hotel")) Icon = Hotel;
  else if (normalized.includes("patisserie") || normalized.includes("boulangerie") || normalized.includes("matiere") || normalized.includes("ingredient")) Icon = Wheat;
  else if (normalized.includes("marche") || normalized.includes("comptoir")) Icon = ShoppingBasket;
  else if (normalized.includes("emballage") || normalized.includes("carton")) Icon = Package;
  else if (normalized.includes("clean") || normalized.includes("entretien") || normalized.includes("maison")) Icon = Sparkles;
  else if (normalized.includes("froid")) Icon = Snowflake;

  return (
    <span className={`entity-logo entity-${tone}`} role="img" aria-label={`Icône de ${name}`}>
      <Icon size={16} strokeWidth={2} />
    </span>
  );
}

function DocumentLogo({
  type,
  tone = "gray",
  format,
}: {
  type: string;
  tone?: string;
  format?: "PDF" | "JPG" | "PNG";
}) {
  const normalized = normalizeLabel(type);
  let Icon: LucideIcon = FileText;

  if (format && format !== "PDF") Icon = FileImage;
  else if (normalized.includes("facture")) Icon = ReceiptText;
  else if (normalized.includes("commande")) Icon = ClipboardList;
  else if (normalized.includes("livraison") || normalized.includes("reception")) Icon = Truck;
  else if (normalized.includes("retour")) Icon = ArrowDownRight;

  return (
    <span className={`document-logo document-${tone}`} role="img" aria-label={`${type}${format ? ` ${format}` : ""}`}>
      <Icon size={16} strokeWidth={2} />
    </span>
  );
}

function ArticleBrandLogo({
  brand,
  logo,
}: {
  brand: string;
  logo: string;
}) {
  const safeLogo = logo.startsWith("/brands/") ? logo : "";

  return (
    <span
      className="article-brand-logo"
      style={safeLogo ? { backgroundImage: `url("${safeLogo}")` } : undefined}
      role="img"
      aria-label={`Logo ${brand}`}
    >
      {!safeLogo && <Package size={16} />}
    </span>
  );
}

function ProductVisual({ article, className = "" }: { article: ArticleRecord; className?: string }) {
  const safeImage = article.image_url && (article.image_url.startsWith("/products/") || article.image_url.startsWith("/brands/"))
    ? article.image_url
    : "";

  return safeImage ? (
    <img className={`product-visual ${className}`.trim()} src={safeImage} alt={article.name} loading="lazy" />
  ) : (
    <span className={`product-visual product-visual-fallback ${className}`.trim()}><ArticleBrandLogo brand={article.brand} logo={article.brand_logo} /></span>
  );
}

function CompanyLogo({
  company,
  className = "",
}: {
  company: CompanySettings;
  className?: string;
}) {
  const hasImage = Boolean(company.logoDataUrl);

  return (
    <span
      className={`company-logo ${hasImage ? "has-image" : ""} ${className}`.trim()}
      style={hasImage ? { backgroundImage: `url("${company.logoDataUrl}")` } : undefined}
      role="img"
      aria-label={`Logo de ${company.name}`}
    >
      {!hasImage && (initials(company.name) || "AX")}
    </span>
  );
}

function StatusBadge({ label, tone = "gray" }: { label: string; tone?: string }) {
  return <span className={`status-badge status-${tone}`}>{label}</span>;
}

function RowActions({
  label,
  notify,
  onDelete,
  onOpen,
  onEdit,
  onDuplicate,
  extraActions = [],
}: {
  label: string;
  notify: (message: string) => void;
  onDelete?: () => void;
  onOpen?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  extraActions?: { label: string; icon: LucideIcon; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  void notify;

  useEffect(() => {
    if (!open) return;

    const placeMenu = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menuWidth = menuRef.current?.offsetWidth ?? 145;
      const menuHeight = menuRef.current?.offsetHeight ?? 180;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow >= menuHeight + 12
        ? rect.bottom + 4
        : Math.max(8, rect.top - menuHeight - 4);
      const left = Math.min(
        window.innerWidth - menuWidth - 8,
        Math.max(8, rect.right - menuWidth),
      );
      setPosition({ left, top });
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    placeMenu();
    const frame = window.requestAnimationFrame(placeMenu);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open]);

  return (
    <div className="row-actions">
      <button
        ref={triggerRef}
        type="button"
        className="row-more"
        aria-label={`Actions pour ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && createPortal(
        <div ref={menuRef} className="row-menu" role="menu" style={position}>
          {onOpen && <button onClick={() => { setOpen(false); onOpen(); }}><Eye size={15} /> Ouvrir</button>}
          {onEdit && <button onClick={() => { setOpen(false); onEdit(); }}><Pencil size={15} /> Modifier</button>}
          {onDuplicate && <button onClick={() => { setOpen(false); onDuplicate(); }}><Copy size={15} /> Dupliquer</button>}
          {extraActions.map(({ label: actionLabel, icon: Icon, onClick }) => <button key={actionLabel} onClick={() => { setOpen(false); onClick(); }}><Icon size={15} /> {actionLabel}</button>)}
          {onDelete && <button className="danger-action" onClick={() => { setOpen(false); onDelete(); }}><Trash2 size={15} /> Supprimer</button>}
        </div>,
        document.body,
      )}
    </div>
  );
}

function TableCard({
  title,
  count,
  children,
  tabs,
  activeTab,
  setActiveTab,
  search,
  setSearch,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode,
}: {
  title: string;
  count: string;
  children: React.ReactNode;
  tabs?: typeof docTabs;
  activeTab?: DocType;
  setActiveTab?: (value: DocType) => void;
  search: string;
  setSearch: (value: string) => void;
  filterActive: boolean;
  setFilterActive: (value: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
}) {
  return (
    <section className={`table-card view-${viewMode}`}>
      <div className="table-header">
        <div className="table-title">
          <h1>{title}</h1>
          <span>{count}</span>
        </div>
        <div className="table-actions">
          <label className="search-control">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" aria-label={`Rechercher dans ${title}`} />
            {search && <button type="button" aria-label="Effacer la recherche" onClick={() => setSearch("")}><X size={14} /></button>}
          </label>
          <button className={`filter-button ${filterActive ? "active" : ""}`} onClick={() => setFilterActive(!filterActive)} aria-pressed={filterActive}>
            <SlidersHorizontal size={16} />
            <span>{filterActive ? "Filtré" : "Filtrer"}</span>
          </button>
          <div className="view-toggle" aria-label="Mode d’affichage">
            <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} aria-pressed={viewMode === "grid"}><Grid2X2 size={15} /> Grille</button>
            <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}><List size={15} /> Liste</button>
          </div>
        </div>
      </div>
      {tabs && activeTab && setActiveTab && (
        <div className="document-tabs">
          {tabs.map(({ value, label, icon: Icon }) => (
            <button key={value} className={activeTab === value ? "active" : ""} onClick={() => setActiveTab(value)}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>
      )}
      <div className="table-scroll">{children}</div>
    </section>
  );
}

function EmptyRow({ columns }: { columns: number }) {
  return <tr><td className="empty-row" colSpan={columns}>Aucun résultat pour ces critères.</td></tr>;
}

function ClientsTable({
  rows,
  search,
  setSearch,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode,
  notify,
  onDelete,
  onOpen,
  onEdit,
  onDuplicate,
  onSettle,
}: {
  rows: ClientRecord[];
  search: string;
  setSearch: (value: string) => void;
  filterActive: boolean;
  setFilterActive: (value: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  notify: (message: string) => void;
  onDelete: (name: string) => void;
  onOpen: (client: ClientRecord) => void;
  onEdit: (client: ClientRecord) => void;
  onDuplicate: (client: ClientRecord) => void;
  onSettle: (client: ClientRecord) => void;
}) {
  const filtered = rows.filter((client) => {
    const matchesSearch = `${client.name} ${client.contact} ${client.email} ${client.contactName ?? ""} ${client.nif ?? ""} ${client.nis ?? ""} ${client.rc ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!filterActive || client.balance !== "0 DA");
  });

  return (
    <TableCard title="Tous les clients" count={`${filtered.length} clients`} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode}>
      <table>
        <thead><tr><th>Client</th><th>Contact</th><th>Total facturé</th><th>Solde</th><th>Statut</th><th>Dernière activité</th><th /></tr></thead>
        <tbody>
          {filtered.map((client) => (
            <tr key={client.name}>
              <td><div className="identity-cell"><EntityLogo name={client.name} tone={client.color} kind="client" /><div><strong>{client.name}</strong><small>{client.email}</small></div></div></td>
              <td>{client.contactName ? <><strong>{client.contactName}</strong><small>{client.contact}{client.city ? ` · ${client.city}` : ""}</small></> : <><span>{client.contact}</span>{client.city && <small>{client.city}</small>}</>}</td>
              <td className="number">{client.billed}</td>
              <td className="number">{client.balance}</td>
              <td><StatusBadge label={client.status} tone={client.balance === "0 DA" ? "green" : "orange"} /></td>
              <td>{client.activity}</td>
              <td className="party-row-actions">
                <button
                  className="cash-action"
                  type="button"
                  onClick={() => onSettle(client)}
                  title={client.balance === "0 DA" ? `Enregistrer une avance pour ${client.name}` : `Encaisser un paiement de ${client.name}`}
                >
                  <Banknote size={16} /><span>Encaisser</span>
                </button>
                <RowActions label={client.name} notify={notify} onOpen={() => onOpen(client)} onEdit={() => onEdit(client)} onDuplicate={() => onDuplicate(client)} onDelete={() => onDelete(client.name)} />
              </td>
            </tr>
          ))}
          {!filtered.length && <EmptyRow columns={7} />}
        </tbody>
      </table>
    </TableCard>
  );
}

function SuppliersTable({
  rows,
  search,
  setSearch,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode,
  notify,
  onDelete,
  onOpen,
  onEdit,
  onDuplicate,
  onSettle,
}: {
  rows: SupplierRecord[];
  search: string;
  setSearch: (value: string) => void;
  filterActive: boolean;
  setFilterActive: (value: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  notify: (message: string) => void;
  onDelete: (name: string) => void;
  onOpen: (supplier: SupplierRecord) => void;
  onEdit: (supplier: SupplierRecord) => void;
  onDuplicate: (supplier: SupplierRecord) => void;
  onSettle: (supplier: SupplierRecord) => void;
}) {
  const filtered = rows.filter((supplier) => {
    const matchesSearch = `${supplier.name} ${supplier.contact} ${supplier.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!filterActive || supplier.balance !== "0 DA");
  });

  return (
    <TableCard title="Tous les fournisseurs" count={`${filtered.length} fournisseurs`} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode}>
      <table>
        <thead><tr><th>Fournisseur</th><th>Contact</th><th>Catégorie</th><th>Total achats</th><th>Solde</th><th>Statut</th><th /></tr></thead>
        <tbody>
          {filtered.map((supplier) => (
            <tr key={supplier.name}>
              <td><div className="identity-cell"><EntityLogo name={supplier.name} tone={supplier.color} kind="supplier" /><strong>{supplier.name}</strong></div></td>
              <td>{supplier.contactName ? <><strong>{supplier.contactName}</strong><small>{supplier.contact}{supplier.city ? ` · ${supplier.city}` : ""}</small></> : <><span>{supplier.contact}</span>{supplier.city && <small>{supplier.city}</small>}</>}</td>
              <td><span className="soft-label">{supplier.category}</span></td>
              <td className="number">{supplier.purchases}</td>
              <td className="number">{supplier.balance}</td>
              <td><StatusBadge label={supplier.status} tone={supplier.balance === "0 DA" ? "green" : "orange"} /></td>
              <td className="party-row-actions">
                <button
                  className="cash-action"
                  type="button"
                  onClick={() => onSettle(supplier)}
                  title={supplier.balance === "0 DA" ? `Enregistrer une avance pour ${supplier.name}` : `Payer ${supplier.name}`}
                >
                  <Banknote size={16} /><span>Payer</span>
                </button>
                <RowActions label={supplier.name} notify={notify} onOpen={() => onOpen(supplier)} onEdit={() => onEdit(supplier)} onDuplicate={() => onDuplicate(supplier)} onDelete={() => onDelete(supplier.name)} />
              </td>
            </tr>
          ))}
          {!filtered.length && <EmptyRow columns={7} />}
        </tbody>
      </table>
    </TableCard>
  );
}

type PartyRow = ClientRecord | SupplierRecord;

const numberFromDa = (value: string) => Number(value.replace(/[^0-9,.-]/g, "").replace(",", ".")) || 0;

const documentLinesFor = (document: DocumentRecord): ApiDocumentLine[] => {
  if (document.lines?.length) return document.lines;
  if (!document.articleId) return [];
  const quantity = document.quantity ?? 1;
  const unitPrice = document.unitPrice ?? 0;
  const discountPercent = document.discountPercent ?? 0;
  const taxRate = document.taxRate ?? 0;
  return [{
    article_id: document.articleId,
    designation: document.articleName || "Article",
    description: document.description || "",
    unit: document.unit || "Unité",
    quantity,
    unit_price: unitPrice,
    discount_percent: discountPercent,
    tax_rate: taxRate,
    line_total: quantity * unitPrice * (1 - discountPercent / 100) * (1 + taxRate / 100),
  }];
};

function PrintableDocument({
  company,
  context,
  onClose,
}: {
  company: CompanySettings;
  context: DocumentContext;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  const { direction, document: record, partyAddress } = context;
  const lines = documentLinesFor(record);
  const subtotal = record.subtotal ?? lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);
  const discountAmount = record.discountAmount ?? lines.reduce(
    (sum, line) => sum + line.quantity * line.unit_price * line.discount_percent / 100,
    0,
  );
  const taxAmount = record.taxAmount ?? lines.reduce((sum, line) => {
    const net = line.quantity * line.unit_price * (1 - line.discount_percent / 100);
    return sum + net * line.tax_rate / 100;
  }, 0);
  const total = record.total ?? subtotal - discountAmount + taxAmount;
  const displayedDate = record.rawDate ? formatDocumentDate(record.rawDate) : record.date;
  const partyLabel = direction === "purchases" ? "Fournisseur" : "Client";
  const partyCode = record.partyId
    ? `${direction === "purchases" ? "FR" : "CL"}${String(record.partyId).padStart(4, "0")}`
    : "—";
  const printableType = record.type === "Bon de livraison"
    ? "Bon DE Livraison"
    : record.type === "Bon de réception"
      ? "Bon DE Réception"
      : record.type === "Bon de commande"
        ? "Bon De Commande"
        : record.type === "Bon de retour"
          ? "Bon De Retour"
          : record.type;
  const formatPrintAmount = (value: number) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value);

  return createPortal(
    <div className="print-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Aperçu de ${record.number}`}>
      <div className="print-preview-toolbar">
        <div><strong>Aperçu avant impression</strong><span>{record.type} · {record.number}</span></div>
        <div>
          <button className="secondary-button" type="button" onClick={onClose}><X size={16} /> Fermer</button>
          <button className="primary-button" type="button" onClick={() => window.print()}><Printer size={16} /> Imprimer</button>
        </div>
      </div>
      <article className="print-document-sheet">
      <header className="print-company-header">
        {company.logoDataUrl
          ? (
            // A raw image keeps the locally stored data URL intact in the browser print engine.
            // eslint-disable-next-line @next/next/no-img-element
            <img className="print-company-logo" src={company.logoDataUrl} alt={`Logo ${company.name}`} />
          )
          : <span className="print-company-logo print-company-logo-fallback">{initials(company.name) || "AX"}</span>}
        <div className="print-company-identity">
          <h1>{company.name}</h1>
          <p>Vente matériel informatique, bureautiques &amp; consommable</p>
          <p>Installation réseau informatique &amp; téléphonique conception logiciel &amp; site Web</p>
          <div className="print-company-registration">
            <span>RC N° : 15/00-524188A/16</span>
            <span>Art. Imp : 15018236031</span>
            <span>NIF : 198306340045040</span>
          </div>
          <div className="print-company-registration">
            <span>RIB : 00500152400242521092</span>
            <span>BDL. AGENCE BEJAIA PLAINE 152 CITE TOBBAI</span>
          </div>
          <p className="print-company-address">Adresse : Cité route Azib Ahmed, Izi Ouzou</p>
          <strong className="print-company-phone">0772 023 970 / 0559 030 467</strong>
        </div>
      </header>

      <div className="print-decorative-rule"><span /></div>

      <section className="print-document-heading">
        <div className="print-document-title">
          <h2>{printableType}</h2>
          <dl>
            <div><dt>N° :</dt><dd>{record.number}</dd></div>
            <div><dt>Date :</dt><dd>{displayedDate}</dd></div>
          </dl>
        </div>
        <strong className="print-due-label">Doit :</strong>
        <dl className="print-party-card">
          <div><dt>Code {partyLabel.toLowerCase()} :</dt><dd>{partyCode}</dd></div>
          <div><dt>{partyLabel} :</dt><dd>{record.party}</dd></div>
          <div><dt>Adresse :</dt><dd>{partyAddress || "—"}</dd></div>
        </dl>
      </section>

      <table className="print-lines-table">
        <colgroup>
          <col className="print-col-code" />
          <col className="print-col-label" />
          <col className="print-col-quantity" />
          <col className="print-col-price" />
          <col className="print-col-total" />
        </colgroup>
        <thead>
          <tr>
            <th>N° Article</th>
            <th>Libellé article</th>
            <th className="print-number-cell">Qté</th>
            <th className="print-number-cell">Prix_HT</th>
            <th className="print-number-cell">Sous_Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => {
            const lineSubtotal = line.quantity * line.unit_price * (1 - line.discount_percent / 100);
            return (
              <tr key={line.id ?? `${line.article_id}-${index}`}>
                <td>{String(line.article_id || index + 1).padStart(5, "0")}</td>
                <td><strong>{line.designation}</strong></td>
                <td className="print-number-cell">{line.quantity}</td>
                <td className="print-number-cell">{formatPrintAmount(line.unit_price)}</td>
                <td className="print-number-cell"><strong>{formatPrintAmount(lineSubtotal)}</strong></td>
              </tr>
            );
          })}
          {!lines.length && (
            <tr>
              <td>00001</td>
              <td><strong>{record.summary || record.type}</strong></td>
              <td className="print-number-cell">1</td>
              <td className="print-number-cell">{formatPrintAmount(subtotal)}</td>
              <td className="print-number-cell"><strong>{formatPrintAmount(subtotal)}</strong></td>
            </tr>
          )}
        </tbody>
      </table>

      <section className="print-document-bottom">
        <div className="print-document-note">
          <strong>Arrêté le présent document à la somme de :</strong>
          <span>{formatDa(total)}</span>
          <p>Merci pour votre confiance.</p>
        </div>
        <dl className="print-totals-card">
          <div><dt>Sous-total HT</dt><dd>{formatDa(subtotal)}</dd></div>
          <div><dt>Remise</dt><dd>- {formatDa(discountAmount)}</dd></div>
          <div><dt>TVA</dt><dd>{formatDa(taxAmount)}</dd></div>
          <div className="print-grand-total"><dt>Total TTC</dt><dd>{formatDa(total)}</dd></div>
        </dl>
      </section>

      <section className="print-signatures">
        <div><span>Le {partyLabel.toLowerCase()}</span><i /></div>
        <div><span>{company.name}</span><i /></div>
      </section>

        <footer className="print-document-footer">
          <span>{company.name}</span>
          <span>{record.number}</span>
          <span>Page 1</span>
        </footer>
      </article>
    </div>,
    document.body,
  );
}

function PartyDetailsModal({
  party,
  kind,
  paymentVersion,
  onClose,
  onEdit,
  onSettle,
}: {
  party: PartyRow;
  kind: "client" | "supplier";
  paymentVersion: number;
  onClose: () => void;
  onEdit: () => void;
  onSettle: () => void;
}) {
  const [paymentRequest, setPaymentRequest] = useState<{ rows: PaymentRecord[]; loading: boolean; error: string }>({
    rows: [],
    loading: true,
    error: "",
  });
  const total = numberFromDa("billed" in party ? party.billed : party.purchases);
  const paid = numberFromDa(party.paid);
  const credit = numberFromDa(party.credit);
  const remaining = numberFromDa(party.balance);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetch(`/api/payments?party_id=${party.id}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { payments?: PaymentRecord[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Impossible de charger les paiements.");
        if (active) setPaymentRequest({ rows: payload.payments ?? [], loading: false, error: "" });
      })
      .catch((error: Error) => {
        if (active && error.name !== "AbortError") {
          setPaymentRequest({ rows: [], loading: false, error: error.message });
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [party.id, paymentVersion]);

  return (
    <div className="modal-backdrop party-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card party-detail-panel" role="dialog" aria-modal="true" aria-labelledby="party-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header party-detail-header">
          <div className="party-detail-identity">
            <EntityLogo name={party.name} tone={party.color} kind={kind} />
            <div><h2 id="party-detail-title">{party.name}</h2><p>{kind === "client" ? "Fiche client complète" : "Fiche fournisseur complète"}</p></div>
            <StatusBadge label={party.status} tone={remaining > 0 ? "orange" : "green"} />
          </div>
          <div className="party-detail-actions">
            <button type="button" className="secondary-button" onClick={onEdit}><Pencil size={16} /> Modifier</button>
            <button type="button" className="cash-action cash-action-large" onClick={onSettle}>
              <Banknote size={18} />{kind === "client" ? "Encaisser" : "Payer"}
            </button>
            <button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
          </div>
        </div>

        <div className="party-summary-grid">
          <article><span>{kind === "client" ? "Total facturé" : "Total achats"}</span><strong>{formatDa(total)}</strong></article>
          <article><span>Total réglé</span><strong>{formatDa(paid)}</strong></article>
          <article className={remaining > 0 ? "balance-due" : ""}><span>Solde restant</span><strong>{formatDa(remaining)}</strong></article>
          <article className={credit > 0 ? "credit-available" : ""}><span>Crédit disponible</span><strong>{formatDa(credit)}</strong></article>
        </div>

        <div className="party-detail-body">
          <section className="party-information-card">
            <div className="party-section-title"><ContactRound size={17} /><div><h3>Informations générales</h3><p>Coordonnées, adresse et données fiscales</p></div></div>
            <dl className="party-info-grid">
              <div><dt>Contact principal</dt><dd>{party.contactName || "—"}</dd></div>
              <div><dt>Téléphone</dt><dd>{party.contact || "—"}</dd></div>
              <div><dt>E-mail</dt><dd>{party.email === "E-mail non renseigné" ? "—" : party.email || "—"}</dd></div>
              <div><dt>Catégorie</dt><dd>{party.category || "—"}</dd></div>
              <div className="party-info-wide"><dt>Adresse</dt><dd>{party.address || "—"}</dd></div>
              <div><dt>Ville</dt><dd>{party.city || "—"}</dd></div>
              <div><dt>Siège social</dt><dd>{party.headOffice || "—"}</dd></div>
              <div><dt>NIF</dt><dd>{party.nif || "—"}</dd></div>
              <div><dt>NIS</dt><dd>{party.nis || "—"}</dd></div>
              <div><dt>RC</dt><dd>{party.rc || "—"}</dd></div>
            </dl>
          </section>

          <section className="payment-history-card">
            <div className="party-section-title"><Banknote size={17} /><div><h3>Historique des paiements</h3><p>{paymentRequest.rows.length} règlement{paymentRequest.rows.length === 1 ? "" : "s"} enregistré{paymentRequest.rows.length === 1 ? "" : "s"}</p></div></div>
            <div className="payment-history-scroll" aria-live="polite">
              {paymentRequest.loading && <p className="party-history-message">Chargement de l’historique…</p>}
              {!paymentRequest.loading && paymentRequest.error && <p className="party-history-message error">{paymentRequest.error}</p>}
              {!paymentRequest.loading && !paymentRequest.error && !paymentRequest.rows.length && <p className="party-history-message">Aucun paiement enregistré pour ce tiers.</p>}
              {!paymentRequest.loading && !paymentRequest.error && paymentRequest.rows.length > 0 && (
                <table className="payment-history-table">
                  <thead><tr><th>Date</th><th>Type</th><th>Mode</th><th>Note</th><th>Montant</th></tr></thead>
                  <tbody>{paymentRequest.rows.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDocumentDate(payment.payment_date)}</td>
                      <td><span className={`payment-direction payment-${payment.direction}`}>{payment.direction === "incoming" ? "Encaissement" : "Décaissement"}</span></td>
                      <td>{payment.method}</td>
                      <td>{payment.note || "—"}</td>
                      <td className="number">{formatDa(payment.amount)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PartyEditorModal({ party, kind, onClose, onSaved }: { party: PartyRow; kind: "client" | "supplier"; onClose: () => void; onSaved: (party: ApiPartyRecord) => void }) {
  const [name, setName] = useState(party.name);
  const [contact, setContact] = useState(party.contact === "—" ? "" : party.contact);
  const [contactName, setContactName] = useState(party.contactName || "");
  const [email, setEmail] = useState(party.email === "E-mail non renseigné" ? "" : party.email || "");
  const [city, setCity] = useState(party.city || "");
  const [address, setAddress] = useState(party.address || "");
  const [headOffice, setHeadOffice] = useState(party.headOffice || "");
  const [category, setCategory] = useState(party.category || "");
  const [nif, setNif] = useState(party.nif || "");
  const [nis, setNis] = useState(party.nis || "");
  const [rc, setRc] = useState(party.rc || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/parties", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: party.id, name, contact_phone: contact, contact_name: contactName, email, city, address, head_office: headOffice, category, nif, nis, rc }) });
      const payload = await response.json() as { party?: ApiPartyRecord; error?: string };
      if (!response.ok || !payload.party) throw new Error(payload.error || "Impossible de modifier le tiers.");
      onSaved(payload.party);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de modifier le tiers."); } finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card expanded-modal party-editor-modal" role="dialog" aria-modal="true" aria-labelledby="party-edit-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
    <div className="modal-header"><div><h2 id="party-edit-title">Modifier {kind === "client" ? "le client" : "le fournisseur"}</h2><p>Coordonnées et informations fiscales complètes.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <div className="party-editor-sections">
      <section><div className="form-section-label"><ContactRound size={15} /><span>Identité et contact</span></div><div className="form-grid"><label className="field-label">Nom<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label className="field-label">Contact<input value={contactName} onChange={(event) => setContactName(event.target.value)} /></label><label className="field-label">Téléphone<input value={contact} onChange={(event) => setContact(event.target.value)} /></label><label className="field-label">E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label></div></section>
      <section><div className="form-section-label"><MapPin size={15} /><span>Adresse et organisation</span></div><div className="form-grid"><label className="field-label">Adresse<input value={address} onChange={(event) => setAddress(event.target.value)} /></label><label className="field-label">Ville<input value={city} onChange={(event) => setCity(event.target.value)} /></label><label className="field-label">Siège social<input value={headOffice} onChange={(event) => setHeadOffice(event.target.value)} /></label><label className="field-label">Catégorie<input value={category} onChange={(event) => setCategory(event.target.value)} /></label></div></section>
      <section><div className="form-section-label"><ReceiptText size={15} /><span>Informations fiscales</span></div><div className="form-grid form-grid-three"><label className="field-label">NIF<input value={nif} onChange={(event) => setNif(event.target.value)} /></label><label className="field-label">NIS<input value={nis} onChange={(event) => setNis(event.target.value)} /></label><label className="field-label">RC<input value={rc} onChange={(event) => setRc(event.target.value)} /></label></div></section>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
  </form></div>;
}

function SettlementModal({ party, kind, onClose, onSaved }: { party: PartyRow; kind: "client" | "supplier"; onClose: () => void; onSaved: (payment: PaymentRecord) => void }) {
  const remaining = numberFromDa(party.balance);
  const credit = numberFromDa(party.credit);
  const [amount, setAmount] = useState(remaining > 0 ? remaining : 0);
  const [method, setMethod] = useState("Espèces");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partyId: party.id, amount, method, note, paymentDate }) });
      const payload = await response.json() as { payment?: PaymentRecord; error?: string };
      if (!response.ok || !payload.payment) throw new Error(payload.error || "Impossible d’enregistrer le règlement.");
      onSaved(payload.payment);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer le règlement."); } finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card compact-modal" role="dialog" aria-modal="true" aria-labelledby="settlement-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
    <div className="modal-header"><div><h2 id="settlement-title">{remaining > 0 ? "Régler" : "Enregistrer une avance"} {party.name}</h2><p>{kind === "client" ? "Encaissement client" : "Paiement fournisseur"} · solde {party.balance} · crédit {formatDa(credit)}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <div className="form-grid"><label className="field-label">Montant (DA)<input type="number" min="0.01" step="0.01" value={amount || ""} onChange={(event) => setAmount(Number(event.target.value))} required /></label><label className="field-label">Date<input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} required /></label></div><label className="field-label">Mode<select value={method} onChange={(event) => setMethod(event.target.value)}><option>Espèces</option><option>Virement</option><option>Chèque</option><option>Carte</option></select></label><label className="field-label">Note (facultatif)<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <p className="settlement-advance-note"><Banknote size={15} /> Un montant supérieur au solde devient automatiquement un crédit disponible pour ce tiers.</p>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Banknote size={16} />{saving ? "Enregistrement…" : "Valider le règlement"}</button></div>
  </form></div>;
}

function FinancePage({ entries, search, setSearch, onDelete, onNew }: { entries: FinanceEntry[]; search: string; setSearch: (value: string) => void; onDelete: (entry: FinanceEntry) => void; onNew: () => void }) {
  const filtered = entries.filter((entry) => `${entry.label} ${entry.category} ${entry.kind}`.toLowerCase().includes(search.toLowerCase()));
  const expenses = entries.filter((entry) => entry.kind === "expense").reduce((total, entry) => total + entry.amount, 0);
  const charges = entries.filter((entry) => entry.kind === "charge").reduce((total, entry) => total + entry.amount, 0);
  return <section className="table-card finance-page"><div className="table-header"><div className="table-title"><h1>Finance</h1><span>Dépenses et charges de l’entreprise</span></div><div className="table-actions"><label className="search-control"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Libellé, catégorie…" aria-label="Rechercher dans la finance" /></label><button className="primary-button" onClick={onNew}><Plus size={16} /> Nouvelle dépense</button></div></div><div className="finance-summary"><div><small>Dépenses</small><strong>{formatDa(expenses)}</strong></div><div><small>Charges</small><strong>{formatDa(charges)}</strong></div><div><small>Total engagé</small><strong>{formatDa(expenses + charges)}</strong></div></div><div className="table-scroll"><table><thead><tr><th>Libellé</th><th>Type</th><th>Catégorie</th><th>Date</th><th>Montant</th><th>Statut</th><th /></tr></thead><tbody>{filtered.map((entry) => <tr key={entry.id}><td><strong>{entry.label}</strong>{entry.note && <small>{entry.note}</small>}</td><td><span className="soft-label">{entry.kind === "expense" ? "Dépense" : "Charge"}</span></td><td>{entry.category || "—"}</td><td>{formatDocumentDate(entry.entry_date)}</td><td className="number negative-number">-{formatDa(entry.amount)}</td><td><StatusBadge label={entry.status} tone="green" /></td><td><RowActions label={entry.label} notify={() => undefined} onOpen={() => undefined} onDelete={() => onDelete(entry)} /></td></tr>)}{!filtered.length && <EmptyRow columns={7} />}</tbody></table></div></section>;
}

function FinanceEntryModal({ onClose, onSaved }: { onClose: () => void; onSaved: (entry: FinanceEntry) => void }) {
  const [kind, setKind] = useState<FinanceEntry["kind"]>("expense"); const [label, setLabel] = useState(""); const [category, setCategory] = useState(""); const [amount, setAmount] = useState(0); const [note, setNote] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setError(""); try { const response = await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, label, category, amount, note, entryDate: new Date().toISOString().slice(0, 10) }) }); const payload = await response.json() as { entry?: FinanceEntry; error?: string }; if (!response.ok || !payload.entry) throw new Error(payload.error || "Impossible d’enregistrer la dépense."); onSaved(payload.entry); } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer la dépense."); } finally { setSaving(false); } };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card compact-modal" role="dialog" aria-modal="true" aria-labelledby="finance-entry-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-header"><div><h2 id="finance-entry-title">Nouvelle opération</h2><p>Une dépense ou une charge est enregistrée dans SQLite.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div><label className="field-label">Type<select value={kind} onChange={(event) => setKind(event.target.value as FinanceEntry["kind"])}><option value="expense">Dépense</option><option value="charge">Charge</option></select></label><label className="field-label">Libellé<input value={label} onChange={(event) => setLabel(event.target.value)} required placeholder="Loyer, transport, publicité…" /></label><div className="form-grid"><label className="field-label">Catégorie<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Exploitation" /></label><label className="field-label">Montant (DA)<input type="number" min="0.01" step="0.01" value={amount || ""} onChange={(event) => setAmount(Number(event.target.value))} required /></label></div><label className="field-label">Note (facultatif)<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div></form></div>;
}

function FinanceWorkspacePage({
  entries,
  parties,
  treasuryLedger,
  search,
  setSearch,
  onNewCharge,
  onViewCharge,
  onEditCharge,
  onDeleteCharge,
  onViewParty,
  onSettleParty,
  onNewTreasury,
  onEditTreasury,
  onDeleteTreasury,
}: {
  entries: FinanceEntry[];
  parties: PartyRow[];
  treasuryLedger: TreasuryLedgerRow[];
  search: string;
  setSearch: (value: string) => void;
  onNewCharge: () => void;
  onViewCharge: (entry: FinanceEntry) => void;
  onEditCharge: (entry: FinanceEntry) => void;
  onDeleteCharge: (entry: FinanceEntry) => void;
  onViewParty: (party: PartyRow, kind: "client" | "supplier") => void;
  onSettleParty: (party: PartyRow, kind: "client" | "supplier") => void;
  onNewTreasury: () => void;
  onEditTreasury: (entry: TreasuryEntry) => void;
  onDeleteTreasury: (entry: TreasuryEntry) => void;
}) {
  const [section, setSection] = useState<"overview" | "charges" | "settlements" | "treasury">("overview");
  const filtered = entries.filter((entry) => `${entry.label} ${entry.category} ${entry.kind} ${entry.note}`.toLowerCase().includes(search.toLowerCase()));
  const expenses = entries.filter((entry) => entry.kind === "expense").reduce((total, entry) => total + entry.amount, 0);
  const charges = entries.filter((entry) => entry.kind === "charge").reduce((total, entry) => total + entry.amount, 0);
  const incoming = treasuryLedger.filter((row) => row.direction === "in").reduce((total, row) => total + row.amount, 0);
  const outgoing = treasuryLedger.filter((row) => row.direction === "out").reduce((total, row) => total + row.amount, 0);
  const settlementRows = parties.filter((party) => ("billed" in party ? party.billed : party.purchases) !== "0 DA" || party.paid !== "0 DA" || party.credit !== "0 DA");
  const settlementTotal = parties.reduce((sum, party) => sum + numberFromDa("billed" in party ? party.billed : party.purchases), 0);
  const settlementPaid = parties.reduce((sum, party) => sum + numberFromDa(party.paid), 0);
  const settlementDue = parties.reduce((sum, party) => sum + numberFromDa(party.balance), 0);
  const settlementCredits = parties.reduce((sum, party) => sum + numberFromDa(party.credit), 0);
  const openSection = (nextSection: "charges" | "settlements" | "treasury") => {
    setSearch("");
    setSection(nextSection);
  };
  const sectionLabel = section === "charges"
    ? "Charges et dépenses"
    : section === "settlements"
      ? "États des règlements"
      : section === "treasury"
        ? "Trésorerie"
        : "Vue d’ensemble";

  return (
    <section className={`table-card finance-workspace ${section === "overview" ? "finance-overview" : "finance-detail"}`}>
      <div className="table-header">
        <div className="table-title"><h1>Finance</h1><span>{section === "overview" ? "Vos chiffres essentiels en un coup d’œil" : sectionLabel}</span></div>
        <div className="table-actions">
          {section === "charges" && <button className="primary-button" onClick={onNewCharge}><Plus size={16} /> Nouvelle charge</button>}
          {section === "treasury" && <button className="primary-button" onClick={onNewTreasury}><Plus size={16} /> Nouvelle entrée / sortie</button>}
        </div>
      </div>

      {section === "overview" && (
        <div className="finance-hub">
          <div className="finance-hub-heading">
            <span>Centre financier</span>
            <h2>Où souhaitez-vous aller&nbsp;?</h2>
            <p>Chaque carte affiche l’indicateur le plus important. Cliquez dessus pour ouvrir son tableau détaillé et ses statistiques.</p>
          </div>
          <div className="finance-hub-grid">
            <button type="button" className="finance-hub-card finance-card-charges" onClick={() => openSection("charges")}>
              <span className="finance-card-top"><span className="finance-card-icon"><ReceiptText size={24} /></span><span className="finance-card-count">{entries.length} opération{entries.length === 1 ? "" : "s"}</span></span>
              <span className="finance-card-copy"><small>Charges &amp; dépenses</small><strong>{formatDa(expenses + charges)}</strong><span>Total engagé</span></span>
              <span className="finance-card-footer">Ouvrir le tableau <ArrowRight size={17} /></span>
            </button>
            <button type="button" className="finance-hub-card finance-card-treasury" onClick={() => openSection("treasury")}>
              <span className="finance-card-top"><span className="finance-card-icon"><WalletCards size={24} /></span><span className="finance-card-count">{treasuryLedger.length} mouvement{treasuryLedger.length === 1 ? "" : "s"}</span></span>
              <span className="finance-card-copy"><small>Trésorerie</small><strong>{formatDa(incoming - outgoing)}</strong><span>Solde disponible</span></span>
              <span className="finance-card-footer">Ouvrir le journal <ArrowRight size={17} /></span>
            </button>
            <button type="button" className="finance-hub-card finance-card-settlements" onClick={() => openSection("settlements")}>
              <span className="finance-card-top"><span className="finance-card-icon"><Banknote size={24} /></span><span className="finance-card-count">{settlementRows.length} compte{settlementRows.length === 1 ? "" : "s"}</span></span>
              <span className="finance-card-copy"><small>Règlements</small><strong>{formatDa(settlementDue)}</strong><span>Reste à régler</span></span>
              <span className="finance-card-footer">Voir les états <ArrowRight size={17} /></span>
            </button>
          </div>
          <div className="finance-hub-footnote">
            <span><i className="finance-dot finance-dot-in" /> Entrées {formatDa(incoming)}</span>
            <span><i className="finance-dot finance-dot-out" /> Sorties {formatDa(outgoing)}</span>
            <span><i className="finance-dot finance-dot-paid" /> Réglé {formatDa(settlementPaid)}</span>
          </div>
        </div>
      )}

      {section !== "overview" && (
        <div className="finance-section-nav">
          <button type="button" className="finance-back-button" onClick={() => { setSearch(""); setSection("overview"); }}><ArrowLeft size={16} /> Vue d’ensemble</button>
          <div className="finance-section-tabs" role="tablist" aria-label="Sections finance">
            <button className={section === "charges" ? "active" : ""} onClick={() => openSection("charges")} role="tab" aria-selected={section === "charges"}><ReceiptText size={16} /> Charges</button>
            <button className={section === "treasury" ? "active" : ""} onClick={() => openSection("treasury")} role="tab" aria-selected={section === "treasury"}><WalletCards size={16} /> Trésorerie</button>
            <button className={section === "settlements" ? "active" : ""} onClick={() => openSection("settlements")} role="tab" aria-selected={section === "settlements"}><Banknote size={16} /> Règlements</button>
          </div>
        </div>
      )}

      {section === "charges" && (
        <>
          <div className="finance-summary"><div><small>Dépenses</small><strong>{formatDa(expenses)}</strong></div><div><small>Charges</small><strong>{formatDa(charges)}</strong></div><div><small>Total engagé</small><strong>{formatDa(expenses + charges)}</strong></div></div>
          <div className="table-header finance-subheader"><div className="table-title"><h2>Tableau des charges</h2><span>{filtered.length} opération{filtered.length === 1 ? "" : "s"}</span></div><label className="search-control"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Libellé, catégorie…" aria-label="Rechercher dans les charges" /></label></div>
          <div className="table-scroll"><table><thead><tr><th>Libellé</th><th>Type</th><th>Catégorie</th><th>Date</th><th>Montant</th><th>Statut</th><th /></tr></thead><tbody>{filtered.map((entry) => <tr key={entry.id}><td><strong>{entry.label}</strong>{entry.note && <small>{entry.note}</small>}</td><td><span className="soft-label">{entry.kind === "expense" ? "Dépense" : "Charge"}</span></td><td>{entry.category || "—"}</td><td>{formatDocumentDate(entry.entry_date)}</td><td className="number negative-number">-{formatDa(entry.amount)}</td><td><StatusBadge label={entry.status} tone="green" /></td><td><RowActions label={entry.label} notify={() => undefined} onOpen={() => onViewCharge(entry)} onEdit={() => onEditCharge(entry)} onDelete={() => onDeleteCharge(entry)} /></td></tr>)}{!filtered.length && <EmptyRow columns={7} />}</tbody></table></div>
        </>
      )}

      {section === "settlements" && (
        <>
          <div className="finance-summary settlement-stats"><div><small>Total facturé / acheté</small><strong>{formatDa(settlementTotal)}</strong></div><div><small>Total réglé</small><strong>{formatDa(settlementPaid)}</strong></div><div><small>À régler</small><strong>{formatDa(settlementDue)}</strong></div><div><small>Crédits</small><strong>{formatDa(settlementCredits)}</strong></div></div>
          <div className="table-header finance-subheader"><div className="table-title"><h2>États des règlements</h2><span>Clients et fournisseurs</span></div></div>
          <div className="table-scroll"><table><thead><tr><th>Tiers</th><th>Type</th><th>Total</th><th>Réglé</th><th>À régler</th><th>Crédit</th><th>Statut</th><th /></tr></thead><tbody>{settlementRows.map((party) => { const kind = "billed" in party ? "client" : "supplier"; const total = numberFromDa("billed" in party ? party.billed : party.purchases); return <tr key={`${kind}-${party.id}`}><td><strong>{party.name}</strong></td><td>{kind === "client" ? "Client" : "Fournisseur"}</td><td className="number">{formatDa(total)}</td><td className="number">{party.paid}</td><td className="number">{party.balance}</td><td className="number positive-number">{party.credit}</td><td><StatusBadge label={party.status} tone={party.balance !== "0 DA" ? "orange" : "green"} /></td><td><div className="settlement-row-actions"><button type="button" className="icon-button" onClick={() => onViewParty(party, kind)} aria-label={`Voir la fiche de ${party.name}`}><Eye size={16} /></button><button type="button" className="cash-action" onClick={() => onSettleParty(party, kind)}><Banknote size={16} /><span>{party.balance === "0 DA" ? "Avance" : kind === "client" ? "Encaisser" : "Payer"}</span></button></div></td></tr>; })}{!settlementRows.length && <EmptyRow columns={8} />}</tbody></table></div>
        </>
      )}

      {section === "treasury" && (
        <>
          <div className="finance-summary treasury-stats"><div><small>Total entrées</small><strong className="positive-number">{formatDa(incoming)}</strong></div><div><small>Total sorties</small><strong className="negative-number">-{formatDa(outgoing)}</strong></div><div><small>Solde de trésorerie</small><strong>{formatDa(incoming - outgoing)}</strong></div></div>
          <div className="table-header finance-subheader"><div className="table-title"><h2>Journal de trésorerie</h2><span>Paiements, charges et mouvements manuels</span></div></div>
          <div className="table-scroll"><table><thead><tr><th>Date</th><th>Libellé</th><th>Catégorie</th><th>Entrée</th><th>Sortie</th><th>Note</th><th /></tr></thead><tbody>{treasuryLedger.map((row) => { const manual = row.source === "manual"; const manualEntry: TreasuryEntry = { id: row.source_id, direction: row.direction, label: row.label, category: row.category, amount: row.amount, entry_date: row.entry_date, note: row.note }; return <tr key={row.id}><td>{formatDocumentDate(row.entry_date)}</td><td><strong>{row.label}</strong><small>{row.source === "payment" ? "Règlement" : row.source === "finance" ? "Charge" : "Mouvement manuel"}</small></td><td>{row.category || "—"}</td><td className="number positive-number">{row.direction === "in" ? formatDa(row.amount) : "—"}</td><td className="number negative-number">{row.direction === "out" ? `- ${formatDa(row.amount)}` : "—"}</td><td>{row.note || "—"}</td><td>{manual && <RowActions label={row.label} notify={() => undefined} onEdit={() => onEditTreasury(manualEntry)} onDelete={() => onDeleteTreasury(manualEntry)} />}</td></tr>; })}{!treasuryLedger.length && <EmptyRow columns={7} />}</tbody></table></div>
        </>
      )}
    </section>
  );
}

function FinanceEntryFormModal({ entry, onClose, onSaved }: { entry: FinanceEntry | null; onClose: () => void; onSaved: (entry: FinanceEntry) => void }) {
  const [kind, setKind] = useState<FinanceEntry["kind"]>(entry?.kind ?? "expense");
  const [label, setLabel] = useState(entry?.label ?? "");
  const [category, setCategory] = useState(entry?.category ?? "");
  const [amount, setAmount] = useState(entry?.amount ?? 0);
  const [entryDate, setEntryDate] = useState(entry?.entry_date ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState(entry?.status ?? "Payée");
  const [note, setNote] = useState(entry?.note ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/finance", { method: entry ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(entry ? { id: entry.id } : {}), kind, label, category, amount, entryDate, status, note }) });
      const payload = await response.json() as { entry?: FinanceEntry; error?: string };
      if (!response.ok || !payload.entry) throw new Error(payload.error || "Impossible d’enregistrer la charge.");
      onSaved(payload.entry);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer la charge."); } finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card compact-modal finance-form-modal" role="dialog" aria-modal="true" aria-labelledby="finance-form-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-header"><div><h2 id="finance-form-title">{entry ? "Modifier la charge" : "Nouvelle charge"}</h2><p>Cette opération sera intégrée automatiquement à la trésorerie.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div><label className="field-label">Type<select value={kind} onChange={(event) => setKind(event.target.value as FinanceEntry["kind"])}><option value="expense">Dépense</option><option value="charge">Charge</option></select></label><label className="field-label">Libellé<input value={label} onChange={(event) => setLabel(event.target.value)} required placeholder="Loyer, transport, publicité…" /></label><div className="form-grid"><label className="field-label">Catégorie<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Exploitation" /></label><label className="field-label">Montant (DA)<input type="number" min="0.01" step="0.01" value={amount || ""} onChange={(event) => setAmount(Number(event.target.value))} required /></label></div><div className="form-grid"><label className="field-label">Date<input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required /></label><label className="field-label">Statut<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Payée</option><option>À payer</option><option>Prévue</option></select></label></div><label className="field-label">Note (facultatif)<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div></form></div>;
}

function FinanceEntryDetailsModal({ entry, onClose }: { entry: FinanceEntry; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal-card compact-modal" role="dialog" aria-modal="true" aria-labelledby="finance-details-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><h2 id="finance-details-title">{entry.label}</h2><p>{entry.kind === "charge" ? "Charge" : "Dépense"} · {formatDocumentDate(entry.entry_date)}</p></div><button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div><dl className="document-detail-grid"><div><dt>Montant</dt><dd>{formatDa(entry.amount)}</dd></div><div><dt>Catégorie</dt><dd>{entry.category || "—"}</dd></div><div><dt>Statut</dt><dd>{entry.status}</dd></div><div><dt>Note</dt><dd>{entry.note || "—"}</dd></div></dl><div className="modal-actions"><button className="primary-button" onClick={onClose}>Terminé</button></div></div></div>;
}

function TreasuryEntryFormModal({ entry, onClose, onSaved }: { entry: TreasuryEntry | null; onClose: () => void; onSaved: (entry: TreasuryEntry) => void }) {
  const [direction, setDirection] = useState<TreasuryEntry["direction"]>(entry?.direction ?? "in");
  const [label, setLabel] = useState(entry?.label ?? "");
  const [category, setCategory] = useState(entry?.category ?? "");
  const [amount, setAmount] = useState(entry?.amount ?? 0);
  const [entryDate, setEntryDate] = useState(entry?.entry_date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(entry?.note ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/treasury", { method: entry ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(entry ? { id: entry.id } : {}), direction, label, category, amount, entryDate, note }) });
      const payload = await response.json() as { entry?: TreasuryEntry; error?: string };
      if (!response.ok || !payload.entry) throw new Error(payload.error || "Impossible d’enregistrer le mouvement.");
      onSaved(payload.entry);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer le mouvement."); } finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card compact-modal finance-form-modal" role="dialog" aria-modal="true" aria-labelledby="treasury-form-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-header"><div><h2 id="treasury-form-title">{entry ? "Modifier le mouvement" : "Nouvelle entrée / sortie"}</h2><p>Ajoutez de l’argent ou enregistrez une sortie de trésorerie.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div><label className="field-label">Sens<select value={direction} onChange={(event) => setDirection(event.target.value as TreasuryEntry["direction"])}><option value="in">Entrée d’argent</option><option value="out">Sortie d’argent</option></select></label><label className="field-label">Libellé<input value={label} onChange={(event) => setLabel(event.target.value)} required placeholder="Apport, retrait, banque…" /></label><div className="form-grid"><label className="field-label">Catégorie<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Caisse, banque…" /></label><label className="field-label">Montant (DA)<input type="number" min="0.01" step="0.01" value={amount || ""} onChange={(event) => setAmount(Number(event.target.value))} required /></label></div><label className="field-label">Date<input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required /></label><label className="field-label">Note (facultatif)<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div></form></div>;
}

function DocumentDetailsModal({
  document,
  onClose,
  onPrint,
}: {
  document: DocumentRecord;
  onClose: () => void;
  onPrint: () => void;
}) {
  const lines = documentLinesFor(document);
  const subtotal = document.subtotal ?? lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);
  const discountAmount = document.discountAmount ?? lines.reduce((sum, line) => sum + line.quantity * line.unit_price * line.discount_percent / 100, 0);
  const taxAmount = document.taxAmount ?? lines.reduce((sum, line) => {
    const net = line.quantity * line.unit_price * (1 - line.discount_percent / 100);
    return sum + net * line.tax_rate / 100;
  }, 0);
  const total = document.total ?? subtotal - discountAmount + taxAmount;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card document-detail-modal document-detail-wide" role="dialog" aria-modal="true" aria-labelledby="table-document-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><h2 id="table-document-title">{document.number}</h2><p>{document.type} · {lines.length} ligne{lines.length === 1 ? "" : "s"}</p></div>
          <div className="document-detail-header-actions">
            <button className="secondary-button" type="button" onClick={onPrint}><Printer size={16} /> Imprimer</button>
            <button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
          </div>
        </div>
        <div className="document-preview-tile"><DocumentLogo type={document.type} tone={document.tone} /><div><strong>{document.party}</strong><span>{document.summary || "Document commercial"}</span></div><StatusBadge label={document.status} tone={document.tone} /></div>
        <dl className="document-detail-grid document-detail-summary">
          <div><dt>Date</dt><dd>{document.date}</dd></div>
          <div><dt>Total TTC</dt><dd>{formatDa(total)}</dd></div>
          <div><dt>Sous-total</dt><dd>{formatDa(subtotal)}</dd></div>
          <div><dt>Remise</dt><dd>- {formatDa(discountAmount)}</dd></div>
          <div><dt>TVA</dt><dd>{formatDa(taxAmount)}</dd></div>
          {document.sourceDocument && <div><dt>Document source</dt><dd>{document.sourceDocument}</dd></div>}
        </dl>
        <div className="document-detail-lines">
          <table>
            <thead><tr><th>#</th><th>Désignation</th><th>Unité</th><th>Quantité</th><th>Prix unitaire</th><th>Remise</th><th>TVA</th><th>Total</th></tr></thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={line.id ?? `${line.article_id}-${index}`}>
                  <td>{index + 1}</td>
                  <td><strong>{line.designation}</strong>{document.showFullDescription && line.description && <small>{line.description}</small>}</td>
                  <td>{line.unit || "Unité"}</td>
                  <td className="number">{line.quantity}</td>
                  <td className="number">{formatDa(line.unit_price)}</td>
                  <td className="number">{line.discount_percent}%</td>
                  <td className="number">{line.tax_rate}%</td>
                  <td className="number"><strong>{formatDa(line.line_total)}</strong></td>
                </tr>
              ))}
              {!lines.length && <EmptyRow columns={8} />}
            </tbody>
          </table>
        </div>
        <div className="modal-actions"><button className="primary-button" onClick={onClose}>Terminé</button></div>
      </div>
    </div>
  );
}

function CategoryManagerModal({
  initialArticles,
  onClose,
  onChanged,
  notify,
}: {
  initialArticles: ArticleRecord[];
  onClose: () => void;
  onChanged: () => void;
  notify: (message: string) => void;
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [editing, setEditing] = useState<CategoryEditTarget | null>(null);
  const [draftName, setDraftName] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(() => new Set());
  const tree = categoryTreeForArticles(articles);
  const levelTwoCount = tree.reduce((total, category) => total + category.subcategories.length, 0);
  const levelThreeCount = tree.reduce(
    (total, category) => total + category.subcategories.reduce((subtotal, subcategory) => subtotal + subcategory.subcategories.length, 0),
    0,
  );
  const branchKeys = tree.flatMap((category) => [
    `1:${category.name}`,
    ...category.subcategories
      .filter((subcategory) => subcategory.subcategories.length > 0)
      .map((subcategory) => `2:${category.name}:${subcategory.name}`),
  ]);

  const toggleBranch = (key: string) => {
    setCollapsedBranches((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const articleCountFor = (target: CategoryEditTarget) => articles.filter((article) => {
    if (article.category !== target.category) return false;
    if (target.level >= 2 && article.subcategory !== target.currentName && target.level === 2) return false;
    if (target.level === 3 && (article.subcategory !== target.subcategory || article.subsubcategory !== target.currentName)) return false;
    return true;
  }).length;

  const refreshArticles = async () => {
    const response = await fetch("/api/articles", { cache: "no-store" });
    const payload = await response.json() as { articles?: ArticleRecord[]; error?: string };
    if (!response.ok) throw new Error(payload.error || "Impossible de recharger les catégories.");
    setArticles(payload.articles ?? []);
    onChanged();
  };

  const startEditing = (target: CategoryEditTarget) => {
    setEditing(target);
    setDraftName(target.currentName);
    setError("");
  };

  const saveRename = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const nextName = draftName.trim();
    if (!nextName) {
      setError("Le nom de la catégorie est obligatoire.");
      return;
    }
    setBusyKey(editing.key);
    setError("");
    try {
      const response = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, nextName }),
      });
      const payload = await response.json() as { updated?: number; error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de renommer la catégorie.");
      const previousName = editing.currentName;
      setEditing(null);
      await refreshArticles();
      notify(`« ${previousName} » renommée en « ${nextName} » sur ${payload.updated ?? 0} article${payload.updated === 1 ? "" : "s"}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de renommer la catégorie.");
    } finally {
      setBusyKey("");
    }
  };

  const deleteCategory = async (target: CategoryEditTarget) => {
    const count = articleCountFor(target);
    const consequence = target.level === 1
      ? "Les articles concernés passeront dans « Non classée »."
      : target.level === 2
        ? "La sous-catégorie et le niveau 3 seront retirés des articles concernés."
        : "Le niveau 3 sera retiré des articles concernés.";
    if (!window.confirm(`Supprimer « ${target.currentName} » ?\n\n${consequence}\n${count} article${count === 1 ? "" : "s"} concerné${count === 1 ? "" : "s"}.`)) return;
    setBusyKey(target.key);
    setError("");
    try {
      const response = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
      const payload = await response.json() as { updated?: number; error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de supprimer la catégorie.");
      await refreshArticles();
      notify(`« ${target.currentName} » supprimée · ${payload.updated ?? 0} article${payload.updated === 1 ? "" : "s"} reclassé${payload.updated === 1 ? "" : "s"}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer la catégorie.");
    } finally {
      setBusyKey("");
    }
  };

  const renderNode = (
    target: CategoryEditTarget,
    count: number,
    options?: { hasChildren: boolean; expanded: boolean; onToggle: () => void },
  ) => {
    const isEditing = editing?.key === target.key;
    const isSystem = target.level === 1 && normalizeLabel(target.currentName) === normalizeLabel("Non classée");
    const NodeIcon = target.level === 1 ? Folder : target.level === 2 ? Boxes : Grid2X2;
    return (
      <div
        className={`category-manager-node category-level-${target.level}`}
        key={target.key}
        role="treeitem"
        aria-level={target.level}
        aria-expanded={options?.hasChildren ? options.expanded : undefined}
        aria-selected={isEditing}
      >
        {options?.hasChildren ? (
          <button type="button" className={`category-tree-toggle ${options.expanded ? "expanded" : ""}`} onClick={options.onToggle} aria-label={`${options.expanded ? "Replier" : "Déplier"} ${target.currentName}`}><ChevronDown size={15} /></button>
        ) : (
          <span className="category-tree-leaf" aria-hidden="true" />
        )}
        <span className="category-manager-node-icon"><NodeIcon size={16} /></span>
        {isEditing ? (
          <form className="category-rename-form" onSubmit={saveRename}>
            <label>
              <span>Renommer</span>
              <input autoFocus value={draftName} onChange={(event) => setDraftName(event.target.value)} aria-label={`Nouveau nom pour ${target.currentName}`} />
            </label>
            <button type="submit" className="icon-button category-save-button" disabled={busyKey === target.key} aria-label="Enregistrer le nouveau nom"><Save size={16} /></button>
            <button type="button" className="icon-button" onClick={() => setEditing(null)} disabled={busyKey === target.key} aria-label="Annuler le renommage"><X size={16} /></button>
          </form>
        ) : (
          <>
            <span className="category-manager-node-copy"><small>Niveau {target.level}</small><strong>{target.currentName}</strong></span>
            <span className="category-usage-count">{count} article{count === 1 ? "" : "s"}</span>
            {isSystem ? (
              <span className="category-system-label">Catégorie système</span>
            ) : (
              <span className="category-manager-actions">
                <button type="button" className="icon-button" onClick={() => startEditing(target)} disabled={Boolean(busyKey)} aria-label={`Modifier ${target.currentName}`} title="Modifier"><Pencil size={15} /></button>
                <button type="button" className="icon-button danger-text" onClick={() => void deleteCategory(target)} disabled={Boolean(busyKey)} aria-label={`Supprimer ${target.currentName}`} title="Supprimer"><Trash2 size={15} /></button>
              </span>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="modal-backdrop category-manager-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card expanded-modal category-manager-modal" role="dialog" aria-modal="true" aria-labelledby="category-manager-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><h2 id="category-manager-title">Catégories disponibles</h2><p>Consultez, renommez ou supprimez les trois niveaux du catalogue.</p></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="category-manager-summary">
          <div><small>Niveau 1</small><strong>{tree.length}</strong><span>catégories</span></div>
          <div><small>Niveau 2</small><strong>{levelTwoCount}</strong><span>sous-catégories</span></div>
          <div><small>Niveau 3</small><strong>{levelThreeCount}</strong><span>familles</span></div>
        </div>
        <p className="category-manager-note"><CircleHelp size={15} /> Un renommage s’applique à tous les articles concernés. Une suppression conserve les articles mais retire leur classement à ce niveau.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="category-tree-toolbar">
          <div><strong>Arborescence du catalogue</strong><span>Catégorie → Sous-catégorie → Niveau 3</span></div>
          <div>
            <button type="button" onClick={() => setCollapsedBranches(new Set())}>Tout déplier</button>
            <button type="button" onClick={() => setCollapsedBranches(new Set(branchKeys))}>Tout replier</button>
          </div>
        </div>
        <div className="category-manager-tree" role="tree" aria-label="Arborescence des catégories">
          {tree.map((category) => {
            const categoryTarget: CategoryEditTarget = { key: `1:${category.name}`, level: 1, category: category.name, subcategory: "", currentName: category.name };
            const categoryCount = articles.filter((article) => article.category === category.name).length;
            const categoryExpanded = !collapsedBranches.has(categoryTarget.key);
            return (
              <section className="category-manager-branch" key={category.name}>
                {renderNode(categoryTarget, categoryCount, { hasChildren: category.subcategories.length > 0, expanded: categoryExpanded, onToggle: () => toggleBranch(categoryTarget.key) })}
                {categoryExpanded && category.subcategories.length > 0 && (
                  <div className="category-manager-children" role="group">
                    {category.subcategories.map((subcategory) => {
                      const subcategoryTarget: CategoryEditTarget = { key: `2:${category.name}:${subcategory.name}`, level: 2, category: category.name, subcategory: "", currentName: subcategory.name };
                      const subcategoryCount = articles.filter((article) => article.category === category.name && article.subcategory === subcategory.name).length;
                      const subcategoryExpanded = !collapsedBranches.has(subcategoryTarget.key);
                      return (
                        <div className="category-manager-subbranch" key={subcategory.name}>
                          {renderNode(subcategoryTarget, subcategoryCount, { hasChildren: subcategory.subcategories.length > 0, expanded: subcategoryExpanded, onToggle: () => toggleBranch(subcategoryTarget.key) })}
                          {subcategoryExpanded && subcategory.subcategories.length > 0 && (
                            <div className="category-manager-grandchildren" role="group">
                              {subcategory.subcategories.map((thirdLevel) => {
                                const thirdTarget: CategoryEditTarget = { key: `3:${category.name}:${subcategory.name}:${thirdLevel}`, level: 3, category: category.name, subcategory: subcategory.name, currentName: thirdLevel };
                                const thirdCount = articles.filter((article) => article.category === category.name && article.subcategory === subcategory.name && article.subsubcategory === thirdLevel).length;
                                return renderNode(thirdTarget, thirdCount, { hasChildren: false, expanded: false, onToggle: () => undefined });
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
          {!tree.length && <div className="category-manager-empty"><Folder size={22} /><span>Aucune catégorie disponible.</span></div>}
        </div>
        <div className="modal-actions"><button type="button" className="primary-button" onClick={onClose}>Terminé</button></div>
      </div>
    </div>
  );
}

function ArticlesTable({
  search,
  setSearch,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode,
  notify,
  onEdit,
  refreshKey,
}: {
  search: string;
  setSearch: (value: string) => void;
  filterActive: boolean;
  setFilterActive: (value: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  notify: (message: string) => void;
  onEdit: (article: ArticleRecord) => void;
  refreshKey: number;
}) {
  const [request, setRequest] = useState<{ rows: ArticleRecord[]; error: string; loadedKey: number }>({
    rows: [],
    error: "",
    loadedKey: -1,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const loading = request.loadedKey !== reloadKey;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch("/api/articles", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Base indisponible");
        return response.json() as Promise<{ articles: ArticleRecord[] }>;
      })
      .then(({ articles }) => {
        if (active) setRequest({ rows: articles, error: "", loadedKey: reloadKey });
      })
      .catch((requestError: Error) => {
        if (active && requestError.name !== "AbortError") {
          setRequest({ rows: [], error: "Impossible de charger la base SQLite locale.", loadedKey: reloadKey });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey, refreshKey]);

  const deleteArticle = async (article: ArticleRecord) => {
    if (!window.confirm(`Supprimer « ${article.name} » du catalogue ?`)) return;
    try {
      const response = await fetch("/api/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: article.id }),
      });
      const payload = await response.json() as { article?: ArticleRecord; error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de supprimer l’article.");
      setReloadKey((value) => value + 1);
      notify(`${article.name} supprimé`);
    } catch (requestError) {
      notify(requestError instanceof Error ? requestError.message : "Impossible de supprimer l’article.");
    }
  };

  const filtered = request.rows.filter((article) => {
    const matchesSearch = `${article.name} ${article.sku} ${article.brand} ${article.category} ${article.subcategory ?? ""} ${article.subsubcategory ?? ""} ${article.description ?? ""} ${article.unit ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesCategory && (!filterActive || article.stock <= 10);
  });
  const categories = Array.from(new Set(request.rows.map((article) => article.category).filter(Boolean))).sort();
  const money = (value: number) => `${new Intl.NumberFormat("fr-FR").format(value)} DA`;

  return (
    <section className={`table-card articles-catalog view-${viewMode}`}>
      <div className="table-header">
        <div className="table-title"><h1>Catalogue articles</h1><span>{loading ? "Connexion à SQLite…" : `${filtered.length} articles`}</span></div>
        <div className="table-actions">
          <label className="search-control"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, référence, catégorie…" aria-label="Rechercher dans le catalogue" />{search && <button type="button" aria-label="Effacer la recherche" onClick={() => setSearch("")}><X size={14} /></button>}</label>
          <label className="compact-select article-category-select"><span>Catégorie</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filtrer par catégorie"><option value="all">Toutes</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <button type="button" className="secondary-button category-manager-button" onClick={() => setCategoryManagerOpen(true)} disabled={loading || Boolean(request.error)}><Folder size={16} /> Catégories</button>
          <button className={`filter-button ${filterActive ? "active" : ""}`} onClick={() => setFilterActive(!filterActive)} aria-pressed={filterActive}><SlidersHorizontal size={16} /><span>{filterActive ? "Stock faible" : "Filtrer"}</span></button>
          <div className="view-toggle" aria-label="Mode d’affichage"><button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} aria-pressed={viewMode === "grid"}><Grid2X2 size={15} /> Grille</button><button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}><List size={15} /> Liste</button></div>
        </div>
      </div>
      {loading && <div className="article-catalog-message">Chargement de SQLite…</div>}
      {!loading && request.error && <div className="article-catalog-message"><span>{request.error}</span><button className="text-button" onClick={() => setReloadKey((value) => value + 1)}>Réessayer</button></div>}
      {!loading && !request.error && viewMode === "grid" && (
        <div className="article-grid">
          {filtered.map((article) => (
            <article className="article-product-card" key={article.id}>
              <div className="article-card-top"><input type="checkbox" aria-label={`Sélectionner ${article.name}`} /><span className="article-card-brand"><ArticleBrandLogo brand={article.brand} logo={article.brand_logo} />{article.brand}</span><RowActions label={article.name} notify={notify} onEdit={() => onEdit(article)} onDelete={() => void deleteArticle(article)} /></div>
              <div className="article-card-image"><ProductVisual article={article} /></div>
              <div className="article-card-body">
                <div className="article-card-title"><span className="sku-code">{article.sku}</span><h2>{article.name}</h2></div>
                <p>{article.description || "Description non renseignée."}</p>
                <div className="article-hierarchy"><span>{article.category || "Sans catégorie"}</span>{article.subcategory && <><i>›</i><span>{article.subcategory}</span></>}{article.subsubcategory && <><i>›</i><span>{article.subsubcategory}</span></>}</div>
                <div className="article-card-prices"><div><small>Prix achat</small><strong>{money(article.purchase_price)}</strong></div><div><small>Prix vente</small><strong>{money(article.sale_price)}</strong></div></div>
              </div>
              <footer><span className={`stock-value ${article.stock <= 10 ? "low" : ""}`}>{article.stock} {article.unit || "unité"}{article.stock > 1 && article.unit === "unité" ? "s" : ""}</span><button type="button" className="secondary-button" onClick={() => onEdit(article)}><Pencil size={14} /> Organiser</button></footer>
            </article>
          ))}
          {!filtered.length && <div className="article-catalog-message">Aucun article pour ces critères.</div>}
        </div>
      )}
      {!loading && !request.error && viewMode === "list" && (
        <div className="table-scroll"><table><thead><tr><th>Article</th><th>Catégorisation</th><th>Unité</th><th>Prix d’achat</th><th>Prix de vente</th><th>Stock</th><th>Statut</th><th /></tr></thead><tbody>
          {filtered.map((article) => <tr key={article.id}><td><div className="identity-cell"><ProductVisual article={article} className="table-product-visual" /><div><strong>{article.name}</strong><small>{article.description || article.brand}</small></div></div></td><td><div className="article-hierarchy"><span>{article.category || "Sans catégorie"}</span>{article.subcategory && <><i>›</i><span>{article.subcategory}</span></>}{article.subsubcategory && <><i>›</i><span>{article.subsubcategory}</span></>}</div></td><td><span className="soft-label">{article.unit || "unité"}</span></td><td className="number">{money(article.purchase_price)}</td><td className="number">{money(article.sale_price)}</td><td><span className={`stock-value ${article.stock <= 10 ? "low" : ""}`}>{article.stock}</span></td><td><StatusBadge label={article.status} tone={article.stock <= 10 ? "orange" : "green"} /></td><td><RowActions label={article.name} notify={notify} onEdit={() => onEdit(article)} onDelete={() => void deleteArticle(article)} /></td></tr>)}
          {!filtered.length && <EmptyRow columns={8} />}
        </tbody></table></div>
      )}
      {categoryManagerOpen && <CategoryManagerModal initialArticles={request.rows} onClose={() => setCategoryManagerOpen(false)} onChanged={() => { setCategoryFilter("all"); setReloadKey((value) => value + 1); }} notify={notify} />}
    </section>
  );
}

function DocumentsTable({
  page,
  rows,
  search,
  setSearch,
  activeTab,
  setActiveTab,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode,
  notify,
  onDelete,
  onOpen,
  onEdit,
  onDuplicate,
  onReturn,
  onConvertQuote,
  onPrint,
}: {
  page: "purchases" | "sales";
  rows: DocumentRecord[];
  search: string;
  setSearch: (value: string) => void;
  activeTab: DocType;
  setActiveTab: (value: DocType) => void;
  filterActive: boolean;
  setFilterActive: (value: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  notify: (message: string) => void;
  onDelete: (number: string) => void;
  onOpen: (row: DocumentRecord) => void;
  onEdit: (row: DocumentRecord) => void;
  onDuplicate: (row: DocumentRecord) => void;
  onReturn: (row: DocumentRecord) => void;
  onConvertQuote: (row: DocumentRecord) => Promise<void> | void;
  onPrint: (row: DocumentRecord) => void;
}) {
  const closedStatuses = ["Payée", "Livré", "Reçu", "Traité", "Validé"];
  const filtered = rows.filter((row) => {
    const matchesSearch = `${row.number} ${row.party} ${row.type}`.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all"
      || (activeTab === "quotes" && row.type === "Devis")
      || (activeTab === "orders" && row.type.includes("commande"))
      || (activeTab === "delivery" && (row.type.includes("livraison") || row.type.includes("réception")))
      || (activeTab === "invoices" && row.type === "Facture")
      || (activeTab === "returns" && row.type === "Bon de retour");
    return matchesSearch && matchesTab && (!filterActive || !closedStatuses.includes(row.status));
  });

  return (
    <TableCard title={page === "purchases" ? "Documents d’achat" : "Documents de vente"} count={`${filtered.length} documents`} tabs={documentTabsFor(page)} activeTab={activeTab} setActiveTab={setActiveTab} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode}>
      <table>
        <thead><tr><th>Document</th><th>{page === "purchases" ? "Fournisseur" : "Client"}</th><th>Type</th><th>Date</th><th>Montant</th><th>Statut</th><th /></tr></thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.number}>
              <td><div className="document-cell"><DocumentLogo type={row.type} tone={row.tone} /><strong>{row.number}</strong></div></td>
              <td><div className="identity-cell"><EntityLogo name={row.party} tone={row.tone} kind={page === "purchases" ? "supplier" : "client"} /><div><strong>{row.party}</strong>{row.summary && <small>{row.summary}</small>}</div></div></td>
              <td><span className="soft-label">{row.type}</span></td>
              <td>{row.date}</td>
              <td className={`number ${row.amount.startsWith("-") ? "negative-number" : ""}`}>{row.amount}</td>
              <td><StatusBadge label={row.status} tone={row.tone} /></td>
              <td>
                <div className="document-row-actions">
                  <button
                    className="icon-button document-print-button"
                    type="button"
                    onClick={() => onPrint(row)}
                    aria-label={`Imprimer ${row.number}`}
                    title={`Imprimer ${row.number}`}
                  >
                    <Printer size={16} />
                  </button>
                  <RowActions label={row.number} notify={notify} onOpen={() => onOpen(row)} onEdit={() => onEdit(row)} onDuplicate={() => onDuplicate(row)} onDelete={() => onDelete(row.number)} extraActions={[
                    ...(row.type === "Devis" ? [{ label: "Créer la facture", icon: FileCheck2, onClick: () => { void Promise.resolve(onConvertQuote(row)).catch((error) => notify(error instanceof Error ? error.message : "Impossible de créer la facture.")); } }] : []),
                    ...((row.type === "Bon de livraison" || row.type === "Bon de réception" || row.type === "Facture") && row.articleId && (row.quantity ?? 1) > (row.returnedQuantity ?? 0) ? [{ label: "Créer un retour", icon: RotateCcw, onClick: () => onReturn(row) }] : []),
                  ]} />
                </div>
              </td>
            </tr>
          ))}
          {!filtered.length && <EmptyRow columns={7} />}
        </tbody>
      </table>
    </TableCard>
  );
}

const toLibraryRecord = (
  row: DocumentRecord,
  direction: "purchases" | "sales",
  index: number,
): LibraryRecord => {
  const normalized = normalizeLabel(row.type);
  const format: LibraryRecord["format"] = normalized.includes("livraison") || normalized.includes("reception")
    ? "JPG"
    : normalized.includes("retour")
      ? "PNG"
      : "PDF";
  const extension = format.toLowerCase();

  return {
    ...row,
    id: `${direction}-${row.number}`,
    source: direction === "purchases" ? "Achats" : "Ventes",
    direction,
    format,
    fileName: `${row.number.toLowerCase()}.${extension}`,
    size: format === "PDF" ? `${128 + index * 17} Ko` : `${620 + index * 83} Ko`,
  };
};

function DocumentsLibrary({
  purchases,
  sales,
  search,
  setSearch,
  viewMode,
  setViewMode,
}: {
  purchases: DocumentRecord[];
  sales: DocumentRecord[];
  search: string;
  setSearch: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
}) {
  const [category, setCategory] = useState<LibraryCategory>("all");
  const [format, setFormat] = useState<LibraryFormat>("all");
  const [direction, setDirection] = useState<LibraryDirection>("all");
  const [selected, setSelected] = useState<LibraryRecord | null>(null);
  const rows = [
    ...sales.map((row, index) => toLibraryRecord(row, "sales", index)),
    ...purchases.map((row, index) => toLibraryRecord(row, "purchases", index)),
  ];
  const filtered = rows.filter((row) => {
    const normalizedType = normalizeLabel(row.type);
    const matchesSearch = `${row.number} ${row.party} ${row.type} ${row.fileName} ${row.source}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all"
      || (category === "quotes" && row.type === "Devis")
      || (category === "orders" && normalizedType.includes("commande"))
      || (category === "delivery" && (normalizedType.includes("livraison") || normalizedType.includes("reception")))
      || (category === "invoices" && row.type === "Facture")
      || (category === "returns" && normalizedType.includes("retour"));
    const matchesFormat = format === "all"
      || (format === "pdf" && row.format === "PDF")
      || (format === "images" && row.format !== "PDF");
    const matchesDirection = direction === "all" || row.direction === direction;
    return matchesSearch && matchesCategory && matchesFormat && matchesDirection;
  });

  return (
    <>
      <section className={`table-card documents-library view-${viewMode}`}>
        <div className="table-header">
          <div className="table-title"><h1>Tous les documents</h1><span>{filtered.length} sur {rows.length} documents</span></div>
          <div className="table-actions library-actions">
            <label className="search-control">
              <Search size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Document, tiers…" aria-label="Rechercher dans les documents" />
              {search && <button type="button" aria-label="Effacer la recherche" onClick={() => setSearch("")}><X size={14} /></button>}
            </label>
            <label className="compact-select">
              <span>Format</span>
              <select value={format} onChange={(event) => setFormat(event.target.value as LibraryFormat)} aria-label="Filtrer par format">
                <option value="all">Tous</option>
                <option value="pdf">PDF</option>
                <option value="images">Images</option>
              </select>
            </label>
            <label className="compact-select">
              <span>Source</span>
              <select value={direction} onChange={(event) => setDirection(event.target.value as LibraryDirection)} aria-label="Filtrer par source">
                <option value="all">Toutes</option>
                <option value="sales">Ventes</option>
                <option value="purchases">Achats</option>
              </select>
            </label>
            <div className="view-toggle" aria-label="Mode d’affichage">
              <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} aria-pressed={viewMode === "grid"}><Grid2X2 size={15} /> Grille</button>
              <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}><List size={15} /> Liste</button>
            </div>
          </div>
        </div>
        <div className="document-tabs library-tabs">
          {libraryTabs.map(({ value, label, icon: Icon }) => (
            <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Document</th><th>Tiers</th><th>Catégorie</th><th>Source</th><th>Fichier</th><th>Date</th><th>Statut</th><th /></tr></thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td><div className="document-cell"><DocumentLogo type={row.type} tone={row.tone} format={row.format} /><div><strong>{row.number}</strong><small>{row.fileName}</small></div></div></td>
                  <td>{row.party}</td>
                  <td><span className="soft-label">{row.type}</span></td>
                  <td><span className={`direction-badge direction-${row.direction}`}>{row.source}</span></td>
                  <td><div className="file-meta"><span className={`format-badge format-${row.format.toLowerCase()}`}>{row.format}</span><small>{row.size}</small></div></td>
                  <td>{row.date}</td>
                  <td><StatusBadge label={row.status} tone={row.tone} /></td>
                  <td><button className="row-more" aria-label={`Voir ${row.number}`} onClick={() => setSelected(row)}><Eye size={17} /></button></td>
                </tr>
              ))}
              {!filtered.length && <EmptyRow columns={8} />}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <div className="modal-card document-detail-modal" role="dialog" aria-modal="true" aria-labelledby="document-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><h2 id="document-detail-title">{selected.number}</h2><p>{selected.fileName}</p></div>
              <button className="icon-button" onClick={() => setSelected(null)} aria-label="Fermer"><X size={18} /></button>
            </div>
            <div className="document-preview-tile">
              <DocumentLogo type={selected.type} tone={selected.tone} format={selected.format} />
              <div><strong>{selected.type}</strong><span>{selected.format} · {selected.size}</span></div>
              <span className={`format-badge format-${selected.format.toLowerCase()}`}>{selected.format}</span>
            </div>
            <dl className="document-detail-grid">
              <div><dt>Tiers</dt><dd>{selected.party}</dd></div>
              <div><dt>Source</dt><dd>{selected.source}</dd></div>
              <div><dt>Date</dt><dd>{selected.date}</dd></div>
              <div><dt>Statut</dt><dd><StatusBadge label={selected.status} tone={selected.tone} /></dd></div>
            </dl>
            <div className="modal-actions"><button className="primary-button" onClick={() => setSelected(null)}>Terminé</button></div>
          </div>
        </div>
      )}
    </>
  );
}

function Dashboard({
  onViewSales,
  purchases,
  sales,
}: {
  onViewSales: () => void;
  purchases: DocumentRecord[];
  sales: DocumentRecord[];
}) {
  const [productDirection, setProductDirection] = useState<"sales" | "purchases">("purchases");
  const [partyDirection, setPartyDirection] = useState<"clients" | "suppliers">("clients");
  const activities = [
    ...sales.map((row) => ({ ...row, workspace: "Ventes" })),
    ...purchases.map((row) => ({ ...row, workspace: "Achats" })),
  ].slice(0, 2);
  const productDocuments = productDirection === "sales" ? sales : purchases;
  const amountOf = (row: DocumentRecord) => {
    const quantity = Math.max(Number(row.quantity) || 0, 0);
    const unitPrice = Math.max(Number(row.unitPrice) || 0, 0);
    if (quantity && unitPrice) {
      const discounted = quantity * unitPrice * (1 - Math.max(Number(row.discountPercent) || 0, 0) / 100);
      return discounted * (1 + Math.max(Number(row.taxRate) || 0, 0) / 100);
    }
    return Number(row.amount.replace(/[^0-9,.-]/g, "").replace(",", ".")) || 0;
  };
  const productTotals = new Map<string, number>();
  productDocuments.forEach((row) => {
    const product = row.articleName?.trim() || "Article non renseigné";
    productTotals.set(product, (productTotals.get(product) ?? 0) + amountOf(row));
  });
  const sortedProducts = Array.from(productTotals, ([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value);
  const otherProductsValue = sortedProducts.slice(4).reduce((total, product) => total + product.value, 0);
  const productRanking = otherProductsValue > 0
    ? [...sortedProducts.slice(0, 4), { label: "Autres produits", value: otherProductsValue }]
    : sortedProducts.slice(0, 5);
  const productTotalAmount = productRanking.reduce((total, product) => total + product.value, 0);
  const productColors = ["#4361ee", "#4cc9f0", "#f72585", "#7209b7", "#10b981"];
  const productDonutSegments = productRanking.reduce<{ cursor: number; segments: string[] }>(
    (result, { value }, index) => {
      const nextCursor = result.cursor + (productTotalAmount > 0 ? value / productTotalAmount * 100 : 0);
      return {
        cursor: nextCursor,
        segments: [...result.segments, `${productColors[index]} ${result.cursor}% ${nextCursor}%`],
      };
    },
    { cursor: 0, segments: [] },
  ).segments;
  const productDonutBackground = productDonutSegments.length
    ? `conic-gradient(${productDonutSegments.join(", ")})`
    : "conic-gradient(#eef2ff 0 100%)";
  const partyDocuments = partyDirection === "clients" ? sales : purchases;
  const partyTotals = new Map<string, number>();
  partyDocuments.forEach((row) => {
    partyTotals.set(row.party, (partyTotals.get(row.party) ?? 0) + amountOf(row));
  });
  const partyRanking = Array.from(partyTotals, ([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 5);
  const maximumPartyAmount = Math.max(...partyRanking.map(({ value }) => value), 1);
  const dashboardKpis: { value: string; label: string; trend: string; tone: string; icon: LucideIcon; direction: "up" | "down" }[] = [
    { value: "€124,850", label: "Chiffre d'Affaires", trend: "+12.5% ce mois", tone: "primary", icon: WalletCards, direction: "up" },
    { value: "347", label: "Ventes ce mois", trend: "+8.2%", tone: "success", icon: ShoppingBasket, direction: "up" },
    { value: "42", label: "Nouveaux clients", trend: "-3.1%", tone: "warning", icon: Users, direction: "down" },
    { value: "78.4%", label: "Taux de conversion", trend: "+5.3%", tone: "danger", icon: BarChart3, direction: "up" },
  ];
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div><h1>Vue d’ensemble</h1><p>Les chiffres essentiels de votre activité.</p></div>
        <StatusBadge label="Données enregistrées" tone="blue" />
      </div>
      <div className="dashboard-kpis" aria-label="Indicateurs commerciaux">
        {dashboardKpis.map(({ value, label, trend, tone, icon: Icon, direction }) => (
          <section className={`dashboard-kpi dashboard-kpi-${tone}`} key={label}>
            <span className="dashboard-kpi-icon"><Icon size={24} /></span>
            <strong>{value}</strong>
            <p>{label}</p>
            <span className={`dashboard-kpi-trend ${direction}`}>
              <ArrowDownRight size={14} />
              {trend}
            </span>
          </section>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="chart-card main-chart ranking-card product-donut-card">
          <div className="card-heading">
            <div><h2>Répartition par produits</h2><p>{productDirection === "purchases" ? "Part du total des achats par produit" : "Part du chiffre des ventes par produit"}</p></div>
            <div className="chart-segmented" aria-label="Choisir les ventes ou les achats">
              <button className={productDirection === "sales" ? "active" : ""} onClick={() => setProductDirection("sales")} aria-pressed={productDirection === "sales"}>Vendus</button>
              <button className={productDirection === "purchases" ? "active" : ""} onClick={() => setProductDirection("purchases")} aria-pressed={productDirection === "purchases"}>Achetés</button>
            </div>
          </div>
          <div className="product-donut-layout" aria-label={`Répartition du montant des produits ${productDirection === "sales" ? "vendus" : "achetés"}`}>
            <div className="product-donut" style={{ background: productDonutBackground }}>
              <div><strong>{formatDa(productTotalAmount)}</strong><span>{productDirection === "purchases" ? "total achats" : "total ventes"}</span></div>
            </div>
            <div className="product-donut-legend">
              {productRanking.map(({ label, value }, index) => (
                <div key={label}>
                  <i style={{ background: productColors[index] }} />
                  <span><strong>{label}</strong><small>{productTotalAmount > 0 ? Math.round(value / productTotalAmount * 100) : 0}% du total</small></span>
                  <b>{formatDa(value)}</b>
                </div>
              ))}
              {!productRanking.length && <div className="chart-empty">Aucun montant produit enregistré.</div>}
            </div>
          </div>
        </section>
        <section className="chart-card ranking-card">
          <div className="card-heading">
            <div><h2>Répartition par tiers</h2><p>Montants cumulés par partenaire</p></div>
            <div className="chart-segmented" aria-label="Choisir les clients ou les fournisseurs">
              <button className={partyDirection === "clients" ? "active" : ""} onClick={() => setPartyDirection("clients")} aria-pressed={partyDirection === "clients"}>Clients</button>
              <button className={partyDirection === "suppliers" ? "active" : ""} onClick={() => setPartyDirection("suppliers")} aria-pressed={partyDirection === "suppliers"}>Fournisseurs</button>
            </div>
          </div>
          <div className="ranking-chart party-ranking" aria-label={`Répartition des montants par ${partyDirection}`}>
            {partyRanking.map(({ label, value }, index) => (
              <div className="ranking-row" key={label}>
                <span className="ranking-index">{index + 1}</span>
                <div className="ranking-copy"><strong>{label}</strong><div className="ranking-track"><i style={{ width: `${value / maximumPartyAmount * 100}%` }} /></div></div>
                <b>{formatDa(value)}</b>
              </div>
            ))}
            {!partyRanking.length && <div className="chart-empty">Aucun montant enregistré pour cette sélection.</div>}
          </div>
        </section>
        <section className="table-card dashboard-table">
          <div className="table-header"><div className="table-title"><h1>Activité récente</h1><span>Dernières mises à jour</span></div><button className="text-button" onClick={onViewSales}>Tout voir</button></div>
          <div className="table-scroll"><table><thead><tr><th>Activité</th><th>Espace</th><th>Date</th><th>Statut</th></tr></thead><tbody>{activities.map((row) => <tr key={`${row.workspace}-${row.number}`}><td><strong>{row.type} · {row.articleName || row.party}</strong></td><td>{row.workspace}</td><td>{row.date}</td><td><StatusBadge label={row.status} tone={row.tone} /></td></tr>)}{!activities.length && <EmptyRow columns={4} />}</tbody></table></div>
        </section>
      </div>
    </div>
  );
}

function SettingsPage({
  company,
  onSave,
  notify,
}: {
  company: CompanySettings;
  onSave: (settings: CompanySettings) => boolean;
  notify: (message: string) => void;
}) {
  const [name, setName] = useState(company.name);
  const [logoDataUrl, setLogoDataUrl] = useState(company.logoDataUrl);
  const [defaultTaxRate, setDefaultTaxRate] = useState(String(company.defaultTaxRate));
  const logoInput = useRef<HTMLInputElement | null>(null);
  const previewCompany = {
    name: name.trim() || "Nom de l’entreprise",
    logoDataUrl,
    defaultTaxRate: Number(defaultTaxRate) || 0,
  };

  const loadLogo = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      notify("Choisissez un logo PNG, JPG ou WebP");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      notify("Le logo doit peser moins de 1,5 Mo");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoDataUrl(reader.result);
        notify("Logo chargé — enregistrez pour l’appliquer");
      }
    };
    reader.onerror = () => notify("Impossible de lire ce fichier");
    reader.readAsDataURL(file);
  };

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <h1>Paramètres de l’entreprise</h1>
          <p>Personnalisez le nom et le logo visibles dans votre espace.</p>
        </div>
      </div>

      <div className="settings-card">
        <form
          className="settings-form"
          onSubmit={(event) => {
            event.preventDefault();
            const saved = onSave({ name, logoDataUrl, defaultTaxRate: Number(defaultTaxRate) });
            notify(saved ? "Identité de l’entreprise enregistrée" : "Impossible d’enregistrer sur cet appareil");
          }}
        >
          <div className="settings-section-title">
            <span><Store size={17} /></span>
            <div><h2>Identité</h2><p>Ces informations remplacent {company.name} dans l’interface.</p></div>
          </div>

          <label className="field-label">
            Nom de l’entreprise
            <input
              required
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nom de votre entreprise"
            />
          </label>

          <label className="field-label">
            TVA par défaut (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={defaultTaxRate}
              onChange={(event) => setDefaultTaxRate(event.target.value)}
              placeholder="0"
            />
            <small>Cette valeur sera proposée sur chaque nouvelle ligne d’achat ou de vente.</small>
          </label>

          <div className="field-label">
            Logo de l’entreprise
            <div className="logo-field">
              <CompanyLogo company={previewCompany} className="settings-logo" />
              <div className="logo-field-copy">
                <div className="logo-actions">
                  <button type="button" className="secondary-button" onClick={() => logoInput.current?.click()}>
                    <Upload size={15} /> Importer un logo
                  </button>
                  {logoDataUrl && (
                    <button type="button" className="text-button danger-text" onClick={() => setLogoDataUrl("")}>
                      Supprimer
                    </button>
                  )}
                </div>
                <small>PNG, JPG ou WebP · 1,5 Mo maximum.</small>
              </div>
              <input
                ref={logoInput}
                className="hidden-file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  loadLogo(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </div>
          </div>

          <div className="settings-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setName(DEFAULT_COMPANY.name);
                setLogoDataUrl("");
                setDefaultTaxRate(String(DEFAULT_COMPANY.defaultTaxRate));
                notify("Valeurs par défaut restaurées dans le formulaire");
              }}
            >
              <RotateCcw size={15} /> Réinitialiser
            </button>
            <button type="submit" className="primary-button"><Save size={15} /> Enregistrer</button>
          </div>
        </form>

        <aside className="settings-preview">
          <div><span className="preview-kicker">Aperçu</span><h2>Sélecteur d’entreprise</h2><p>Le bloc restera compact, comme dans la référence.</p></div>
          <div className="settings-preview-frame">
            <div className="settings-preview-brand">
              <span className="brand-mark"><span /></span>
              <CompanyLogo company={previewCompany} />
              <strong>{previewCompany.name}</strong>
              <ChevronDown size={15} />
            </div>
          </div>
          <p className="storage-note"><Check size={15} /> Enregistré localement sur cet appareil.</p>
        </aside>
      </div>
    </div>
  );
}

const emptyDocumentLine = (key: string): DocumentDraftLine => ({
  key,
  articleId: null,
  articleQuery: "",
  designation: "",
  description: "",
  unit: "Unité",
  quantity: 1,
  unitPrice: 1,
  discountPercent: 0,
  taxRate: 0,
  stock: null,
});

function DocumentEditor({
  initialTarget,
  initialDocumentType,
  parties,
  onClose,
  onSubmit,
}: {
  initialTarget: "purchases" | "sales";
  initialDocumentType?: string;
  parties: PartyRow[];
  onClose: () => void;
  onSubmit: (payload: CreatePayload) => Promise<void> | void;
}) {
  const lineSequence = useRef(1);
  const [partyQuery, setPartyQuery] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [documentType, setDocumentType] = useState(initialDocumentType ?? "");
  const [documentDate, setDocumentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [lines, setLines] = useState<DocumentDraftLine[]>(() => [emptyDocumentLine("line-1")]);
  const [activeArticleLine, setActiveArticleLine] = useState<string | null>(null);
  const [articleRequest, setArticleRequest] = useState<{ rows: ArticleRecord[]; loading: boolean; error: string }>({
    rows: [],
    loading: true,
    error: "",
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const selectedParty = parties.find((party) => party.id === selectedPartyId) ?? null;
  const normalizedPartyQuery = normalizeLabel(partyQuery);
  const filteredParties = parties
    .filter((party) => normalizeLabel(`${party.name} ${party.contactName ?? ""} ${party.contact ?? ""}`).includes(normalizedPartyQuery))
    .slice(0, 6);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, saving]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/articles", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { articles?: ArticleRecord[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Impossible de lire les articles.");
        setArticleRequest({ rows: payload.articles ?? [], loading: false, error: "" });
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setArticleRequest({ rows: [], loading: false, error: error.message });
      });
    return () => controller.abort();
  }, []);

  const updateLine = (key: string, patch: Partial<DocumentDraftLine>) => {
    setLines((rows) => rows.map((line) => line.key === key ? { ...line, ...patch } : line));
  };

  const addLine = () => {
    lineSequence.current += 1;
    const key = `line-${lineSequence.current}`;
    setLines((rows) => [...rows, emptyDocumentLine(key)]);
    setActiveArticleLine(key);
  };

  const removeLine = (key: string) => {
    setLines((rows) => rows.filter((line) => line.key !== key));
    setActiveArticleLine((activeKey) => activeKey === key ? null : activeKey);
  };

  const selectArticle = (key: string, article: ArticleRecord) => {
    updateLine(key, {
      articleId: article.id,
      articleQuery: article.name,
      designation: article.name,
      description: article.description,
      unit: article.unit || "Unité",
      unitPrice: initialTarget === "purchases" ? article.purchase_price : article.sale_price,
      stock: article.stock,
    });
    setActiveArticleLine(null);
  };

  const articlesFor = (line: DocumentDraftLine) => {
    const query = normalizeLabel(line.articleQuery);
    return articleRequest.rows
      .filter((article) => normalizeLabel(`${article.name} ${article.sku} ${article.brand} ${article.category}`).includes(query))
      .slice(0, 6);
  };

  const lineTotal = (line: DocumentDraftLine) => {
    const gross = Math.max(0, line.quantity) * Math.max(0, line.unitPrice);
    const net = gross * (1 - Math.min(100, Math.max(0, line.discountPercent)) / 100);
    return net * (1 + Math.min(100, Math.max(0, line.taxRate)) / 100);
  };
  const subtotal = lines.reduce((sum, line) => sum + Math.max(0, line.quantity) * Math.max(0, line.unitPrice), 0);
  const discountAmount = lines.reduce((sum, line) => sum + Math.max(0, line.quantity) * Math.max(0, line.unitPrice) * Math.min(100, Math.max(0, line.discountPercent)) / 100, 0);
  const taxAmount = lines.reduce((sum, line) => {
    const net = Math.max(0, line.quantity) * Math.max(0, line.unitPrice) * (1 - Math.min(100, Math.max(0, line.discountPercent)) / 100);
    return sum + net * Math.min(100, Math.max(0, line.taxRate)) / 100;
  }, 0);
  const grandTotal = subtotal - discountAmount + taxAmount;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");
    if (!selectedParty) {
      setSubmitError(`Sélectionnez un ${initialTarget === "purchases" ? "fournisseur" : "client"} enregistré.`);
      return;
    }
    if (!documentType) {
      setSubmitError("Choisissez le type de document.");
      return;
    }
    const invalidLine = lines.find((line) => !line.articleId || !line.designation.trim() || line.quantity <= 0 || line.unitPrice < 0);
    if (invalidLine) {
      setSubmitError("Chaque ligne doit contenir un article, une désignation, une quantité et un prix valides.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        target: initialTarget,
        name: selectedParty.name,
        partyId: selectedParty.id,
        detail: "",
        documentType,
        documentDate,
        showFullDescription,
        lines,
        total: grandTotal,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Impossible d’enregistrer le document.");
      setSaving(false);
    }
  };

  return (
    <div className="document-editor-backdrop">
      <form className="document-editor-shell" role="dialog" aria-modal="true" aria-labelledby="document-editor-title" onSubmit={submit}>
        <header className="document-editor-header">
          <div className="document-editor-heading">
            <button type="button" className="document-editor-back" onClick={onClose} disabled={saving} aria-label="Fermer l’éditeur"><ArrowLeft size={20} /></button>
            <div><span>{initialTarget === "purchases" ? "ACHATS" : "VENTES"}</span><h2 id="document-editor-title">Nouveau document {initialTarget === "purchases" ? "d’achat" : "de vente"}</h2></div>
          </div>
          <div className="document-editor-header-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Annuler</button>
            <button type="submit" className="primary-button" disabled={saving}><Save size={17} />{saving ? "Enregistrement…" : "Enregistrer le document"}</button>
          </div>
        </header>

        <div className="document-editor-body">
          <section className="document-editor-meta">
            <div className="document-party-field">
              <span className="document-editor-label">{initialTarget === "purchases" ? "Fournisseur" : "Client"}</span>
              {selectedParty ? (
                <div className="document-selected-party">
                  <EntityLogo name={selectedParty.name} tone={selectedParty.color} kind={initialTarget === "purchases" ? "supplier" : "client"} />
                  <div><strong>{selectedParty.name}</strong><small>{selectedParty.contactName || selectedParty.contact}</small></div>
                  <button type="button" className="text-button" onClick={() => { setSelectedPartyId(null); setPartyQuery(""); }}>Changer</button>
                </div>
              ) : (
                <div className="document-party-picker">
                  <label className="article-search-control">
                    <Search size={16} />
                    <input autoFocus value={partyQuery} onChange={(event) => setPartyQuery(event.target.value)} placeholder={`Rechercher un ${initialTarget === "purchases" ? "fournisseur" : "client"}…`} />
                  </label>
                  <div className="document-party-results">
                    {filteredParties.map((party) => (
                      <button type="button" key={party.id} onClick={() => { setSelectedPartyId(party.id); setPartyQuery(party.name); }}>
                        <EntityLogo name={party.name} tone={party.color} kind={initialTarget === "purchases" ? "supplier" : "client"} />
                        <span><strong>{party.name}</strong><small>{party.contactName || party.contact}</small></span>
                        <em>{party.balance}</em>
                      </button>
                    ))}
                    {!filteredParties.length && <p>Aucun tiers enregistré ne correspond à cette recherche.</p>}
                  </div>
                </div>
              )}
            </div>
            <label className="field-label">Type de document
              <select required value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                <option value="" disabled>Choisir le document</option>
                <option>Devis</option>
                <option>Bon de commande</option>
                <option>{initialTarget === "purchases" ? "Bon de réception" : "Bon de livraison"}</option>
                <option>Facture</option>
              </select>
            </label>
            <label className="field-label">Date
              <input type="date" required value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} />
            </label>
          </section>

          <section className="document-lines-section">
            <div className="document-lines-heading">
              <div><h3>Articles du document</h3><p>Ajoutez plusieurs lignes et adaptez librement chaque désignation.</p></div>
              <button type="button" className="secondary-button add-document-line" onClick={addLine}><Plus size={16} /> Ajouter une ligne</button>
            </div>
            <div className="document-lines-scroll">
              <table className="document-lines-table">
                <thead><tr><th>#</th><th>Article</th><th>Désignation / description</th><th>Unité</th><th>Quantité</th><th>Prix unitaire</th><th>Remise %</th><th>TVA %</th><th>Total TTC</th><th /></tr></thead>
                <tbody>
                  {lines.map((line, index) => {
                    const matches = articlesFor(line);
                    return (
                      <tr key={line.key}>
                        <td className="document-line-index">{index + 1}</td>
                        <td>
                          <div className="line-article-picker">
                            <div className="line-article-input">
                              <Search size={14} />
                              <input
                                value={line.articleQuery}
                                onFocus={() => setActiveArticleLine(line.key)}
                                onChange={(event) => {
                                  updateLine(line.key, { articleQuery: event.target.value, articleId: null, stock: null });
                                  setActiveArticleLine(line.key);
                                }}
                                placeholder="Nom ou référence"
                                aria-label={`Article ligne ${index + 1}`}
                              />
                              {line.articleQuery && <button type="button" onClick={() => updateLine(line.key, { articleId: null, articleQuery: "", designation: "", description: "", stock: null })} aria-label={`Effacer l’article ligne ${index + 1}`}><X size={13} /></button>}
                            </div>
                            {activeArticleLine === line.key && !line.articleId && (
                              <div className="line-article-results">
                                {articleRequest.loading && <p>Chargement…</p>}
                                {!articleRequest.loading && articleRequest.error && <p className="error">{articleRequest.error}</p>}
                                {!articleRequest.loading && !articleRequest.error && matches.map((article) => (
                                  <button type="button" key={article.id} onClick={() => selectArticle(line.key, article)}>
                                    <ArticleBrandLogo brand={article.brand} logo={article.brand_logo} />
                                    <span><strong>{article.name}</strong><small>{article.sku} · Stock {article.stock}</small></span>
                                  </button>
                                ))}
                                {!articleRequest.loading && !articleRequest.error && !matches.length && <p>Aucun article trouvé.</p>}
                              </div>
                            )}
                            {line.articleId && <small className="line-stock-note">Stock disponible : {line.stock ?? 0} {line.unit}</small>}
                          </div>
                        </td>
                        <td>
                          <div className="line-designation-fields">
                            <input required value={line.designation} onChange={(event) => updateLine(line.key, { designation: event.target.value })} placeholder="Désignation modifiable" aria-label={`Désignation ligne ${index + 1}`} />
                            <input value={line.description} onChange={(event) => updateLine(line.key, { description: event.target.value })} placeholder="Description facultative" aria-label={`Description ligne ${index + 1}`} />
                          </div>
                        </td>
                        <td><input className="line-unit-input" value={line.unit} onChange={(event) => updateLine(line.key, { unit: event.target.value })} aria-label={`Unité ligne ${index + 1}`} /></td>
                        <td><input className="line-number-input" type="number" min="0.001" step="0.001" required value={line.quantity} onChange={(event) => updateLine(line.key, { quantity: Number(event.target.value) })} aria-label={`Quantité ligne ${index + 1}`} /></td>
                        <td><input className="line-money-input" type="number" min="0" step="0.01" required value={line.unitPrice} onChange={(event) => updateLine(line.key, { unitPrice: Number(event.target.value) })} aria-label={`Prix unitaire ligne ${index + 1}`} /></td>
                        <td><input className="line-number-input" type="number" min="0" max="100" step="0.01" value={line.discountPercent} onChange={(event) => updateLine(line.key, { discountPercent: Number(event.target.value) })} aria-label={`Remise ligne ${index + 1}`} /></td>
                        <td><input className="line-number-input" type="number" min="0" max="100" step="0.01" value={line.taxRate} onChange={(event) => updateLine(line.key, { taxRate: Number(event.target.value) })} aria-label={`TVA ligne ${index + 1}`} /></td>
                        <td className="document-line-total">{formatDa(lineTotal(line))}</td>
                        <td><button type="button" className="remove-document-line" onClick={() => removeLine(line.key)} aria-label={`Supprimer la ligne ${index + 1}`}><Trash2 size={16} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="button" className="document-add-row-button" onClick={addLine}><Plus size={16} /> Ajouter un autre article</button>
          </section>

          <section className="document-editor-bottom">
            <div>
              {documentType === "Bon de commande" && (
                <label className="description-toggle"><input type="checkbox" checked={showFullDescription} onChange={(event) => setShowFullDescription(event.target.checked)} /><span><strong>Afficher les descriptions complètes</strong><small>Les descriptions de toutes les lignes apparaîtront sur le document.</small></span></label>
              )}
              {documentType === "Facture" && (
                <p className="document-credit-note"><Banknote size={16} /> Cette facture est enregistrée à crédit et pourra être réglée plus tard depuis la fiche du tiers.</p>
              )}
              {submitError && <p className="form-error" role="alert">{submitError}</p>}
            </div>
            <div className="document-editor-totals" aria-live="polite">
              <div><span>Sous-total</span><strong>{formatDa(subtotal)}</strong></div>
              <div><span>Remise</span><strong>- {formatDa(discountAmount)}</strong></div>
              <div><span>TVA</span><strong>{formatDa(taxAmount)}</strong></div>
              <div className="grand-total"><span>Total TTC</span><strong>{formatDa(grandTotal)}</strong></div>
            </div>
          </section>
        </div>

        <footer className="document-editor-footer">
          <span>{lines.length} ligne{lines.length === 1 ? "" : "s"} · {selectedParty?.name || "Tiers à sélectionner"}</span>
          <div><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Annuler</button><button type="submit" className="primary-button" disabled={saving}><Save size={17} />{saving ? "Enregistrement…" : `Créer pour ${formatDa(grandTotal)}`}</button></div>
        </footer>
      </form>
    </div>
  );
}

function SimpleDocumentEditor({
  initialTarget,
  initialDocument,
  initialDocumentType,
  defaultTaxRate,
  parties,
  onClose,
  onSubmit,
}: {
  initialTarget: "purchases" | "sales";
  initialDocument?: DocumentRecord | null;
  initialDocumentType?: string;
  defaultTaxRate: number;
  parties: PartyRow[];
  onClose: () => void;
  onSubmit: (payload: CreatePayload) => Promise<void> | void;
}) {
  const sourceLines = initialDocument ? documentLinesFor(initialDocument) : [];
  const lineSequence = useRef(Math.max(0, sourceLines.length));
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(
    initialDocument?.partyId ?? parties.find((party) => party.name === initialDocument?.party)?.id ?? null,
  );
  const [partyQuery, setPartyQuery] = useState(initialDocument?.party ?? "");
  const [articleQuery, setArticleQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [draftQuantity, setDraftQuantity] = useState("1");
  const [draftUnitPrice, setDraftUnitPrice] = useState("1");
  const [documentType, setDocumentType] = useState(initialDocument?.type ?? initialDocumentType ?? "");
  const [documentDate, setDocumentDate] = useState(initialDocument?.rawDate ?? new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<DocumentDraftLine[]>(() => sourceLines.length
    ? sourceLines.map((line, index) => ({
        key: `line-${index + 1}`,
        articleId: line.article_id,
        articleQuery: line.designation,
        designation: line.designation,
        description: line.description,
        unit: line.unit || "Unité",
        quantity: line.quantity,
        unitPrice: line.unit_price,
        discountPercent: line.discount_percent,
        taxRate: line.tax_rate,
        stock: null,
      }))
    : []);
  const [articleRequest, setArticleRequest] = useState<{ rows: ArticleRecord[]; loading: boolean; error: string }>({
    rows: [],
    loading: true,
    error: "",
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const selectedParty = parties.find((party) => party.id === selectedPartyId) ?? null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/articles", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { articles?: ArticleRecord[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Impossible de lire les articles.");
        const articleRows = payload.articles ?? [];
        setArticleRequest({ rows: articleRows, loading: false, error: "" });
        setLines((currentLines) => currentLines.map((line) => {
          const article = line.articleId ? articleRows.find((row) => row.id === line.articleId) : null;
          return article ? { ...line, articleQuery: `${article.name} · ${article.sku}`, stock: article.stock } : line;
        }));
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setArticleRequest({ rows: [], loading: false, error: error.message });
      });
    return () => controller.abort();
  }, []);

  const updateLine = (key: string, patch: Partial<DocumentDraftLine>) => {
    setLines((rows) => rows.map((line) => line.key === key ? { ...line, ...patch } : line));
  };

  const selectDraftArticle = (query: string) => {
    const normalizedQuery = normalizeLabel(query.trim());
    const article = articleRequest.rows.find((row) =>
      normalizeLabel(row.name) === normalizedQuery
      || normalizeLabel(row.sku) === normalizedQuery
      || normalizeLabel(`${row.name} · ${row.sku}`) === normalizedQuery,
    );
    setArticleQuery(query);
    setSelectedArticleId(article?.id ?? null);
    if (article) {
      setDraftUnitPrice(String(initialTarget === "purchases" ? article.purchase_price : article.sale_price));
      setDraftQuantity((current) => current.trim() === "" ? "1" : current);
    }
    setSubmitError("");
  };

  const addLine = () => {
    const article = selectedArticleId
      ? articleRequest.rows.find((row) => row.id === selectedArticleId)
      : articleRequest.rows.find((row) => {
          const normalizedQuery = normalizeLabel(articleQuery.trim());
          return normalizeLabel(row.name) === normalizedQuery
            || normalizeLabel(row.sku) === normalizedQuery
            || normalizeLabel(`${row.name} · ${row.sku}`) === normalizedQuery;
        });
    if (!article) {
      setSubmitError("Recherchez puis sélectionnez un article avant d’ajouter la ligne.");
      return;
    }
    const quantity = draftQuantity.trim() === "" ? 1 : Number(draftQuantity);
    const unitPrice = draftUnitPrice.trim() === "" ? 1 : Number(draftUnitPrice);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      setSubmitError("La quantité et le prix doivent être valides.");
      return;
    }
    lineSequence.current += 1;
    setLines((rows) => [...rows, {
      ...emptyDocumentLine(`line-${lineSequence.current}`),
      articleId: article.id,
      articleQuery: `${article.name} · ${article.sku}`,
      designation: article.name,
      description: article.description,
      unit: article.unit || "Unité",
      quantity,
      unitPrice,
      taxRate: defaultTaxRate,
      stock: article.stock,
    }]);
    setArticleQuery("");
    setSelectedArticleId(null);
    setDraftQuantity("");
    setDraftUnitPrice("");
    setSubmitError("");
  };

  const removeLine = (key: string) => {
    setLines((rows) => rows.filter((line) => line.key !== key));
    setSubmitError("");
  };

  const lineTotal = (line: DocumentDraftLine) => {
    const gross = Math.max(0, line.quantity) * Math.max(0, line.unitPrice);
    const net = gross * (1 - Math.min(100, Math.max(0, line.discountPercent)) / 100);
    return net * (1 + Math.min(100, Math.max(0, line.taxRate)) / 100);
  };
  const subtotal = lines.reduce((sum, line) => sum + Math.max(0, line.quantity) * Math.max(0, line.unitPrice), 0);
  const discountAmount = lines.reduce((sum, line) => sum + Math.max(0, line.quantity) * Math.max(0, line.unitPrice) * Math.min(100, Math.max(0, line.discountPercent)) / 100, 0);
  const taxAmount = lines.reduce((sum, line) => {
    const net = Math.max(0, line.quantity) * Math.max(0, line.unitPrice) * (1 - Math.min(100, Math.max(0, line.discountPercent)) / 100);
    return sum + net * Math.min(100, Math.max(0, line.taxRate)) / 100;
  }, 0);
  const grandTotal = subtotal - discountAmount + taxAmount;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");
    if (!selectedParty) {
      setSubmitError(`Sélectionnez un ${initialTarget === "purchases" ? "fournisseur" : "client"}.`);
      return;
    }
    if (!documentType) {
      setSubmitError("Choisissez le type de document.");
      return;
    }
    if (!lines.length || lines.some((line) => !line.articleId || !line.designation.trim() || line.quantity <= 0 || line.unitPrice < 0)) {
      setSubmitError("Chaque ligne doit contenir un article, une désignation, une quantité et un prix valides.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        target: initialTarget,
        name: selectedParty.name,
        partyId: selectedParty.id,
        documentId: initialDocument?.id,
        detail: "",
        documentType,
        documentDate,
        lines,
        total: grandTotal,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Impossible d’enregistrer le document.");
      setSaving(false);
    }
  };

  return (
    <div className="document-editor-backdrop pure-table-backdrop">
      <form className="pure-table-editor" role="dialog" aria-modal="true" aria-labelledby="pure-document-title" onSubmit={submit}>
        <table className="pure-document-table">
          <caption id="pure-document-title">{initialDocument ? "Modifier" : "Ajouter"} {initialTarget === "purchases" ? "un achat" : "une vente"}</caption>
          <thead>
            <tr className="pure-document-controls-row">
              <th colSpan={10}>
                <div className="pure-document-controls">
                  <button type="button" className="pure-icon-button" onClick={onClose} disabled={saving} aria-label="Fermer"><ArrowLeft size={17} /></button>
                  <strong>{initialDocument?.number ?? (initialTarget === "purchases" ? "Nouvel achat" : "Nouvelle vente")}</strong>
                  <label className="pure-article-control">
                    <span>Article à ajouter</span>
                    <input
                      list="pure-article-options"
                      value={articleQuery}
                      onChange={(event) => selectDraftArticle(event.target.value)}
                      placeholder={articleRequest.loading ? "Chargement…" : "Rechercher un article"}
                      aria-label="Rechercher un article à ajouter"
                    />
                  </label>
                  <label className="pure-number-control">
                    <span>Qté</span>
                    <input type="number" min="0.001" step="0.001" value={draftQuantity} onChange={(event) => setDraftQuantity(event.target.value)} placeholder="1" aria-label="Quantité de la ligne à ajouter" />
                  </label>
                  <label className="pure-number-control pure-price-control">
                    <span>Prix unit.</span>
                    <input type="number" min="0" step="0.01" value={draftUnitPrice} onChange={(event) => setDraftUnitPrice(event.target.value)} placeholder="1" aria-label="Prix unitaire de la ligne à ajouter" />
                  </label>
                  <label>
                    <span>{initialTarget === "purchases" ? "Fournisseur" : "Client"}</span>
                    <input
                      required
                      list="pure-party-options"
                      value={partyQuery}
                      onChange={(event) => {
                        const query = event.target.value;
                        setPartyQuery(query);
                        const party = parties.find((row) => normalizeLabel(row.name) === normalizeLabel(query.trim()));
                        setSelectedPartyId(party?.id ?? null);
                      }}
                      placeholder={`Rechercher un ${initialTarget === "purchases" ? "fournisseur" : "client"}`}
                    />
                  </label>
                  <label>
                    <span>Document</span>
                    <select required value={documentType} onChange={(event) => setDocumentType(event.target.value)} disabled={Boolean(initialDocument)}>
                      <option value="" disabled>Choisir</option>
                      <option>Devis</option>
                      <option>Bon de commande</option>
                      <option>{initialTarget === "purchases" ? "Bon de réception" : "Bon de livraison"}</option>
                      <option>Facture</option>
                    </select>
                  </label>
                  <label>
                    <span>Date</span>
                    <input type="date" required value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} />
                  </label>
                  <button type="button" className="pure-add-line-button" onClick={addLine} disabled={saving}><Plus size={14} /><span>+ ligne</span></button>
                  <button type="submit" className="pure-save-button" disabled={saving}><Save size={15} />{saving ? "…" : "Enregistrer"}</button>
                </div>
              </th>
            </tr>
            <tr className="pure-column-headings"><th>#</th><th>Article</th><th>Désignation</th><th>Unité</th><th>Quantité</th><th>Prix unit.</th><th>Remise %</th><th>TVA %</th><th>Total</th><th /></tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={line.key}>
                <td className="pure-line-index">{index + 1}</td>
                <td><span className="pure-cell-text">{line.articleQuery || "—"}</span></td>
                <td><input required value={line.designation} onChange={(event) => updateLine(line.key, { designation: event.target.value })} placeholder="Désignation" aria-label={`Désignation ligne ${index + 1}`} /></td>
                <td><input value={line.unit} onChange={(event) => updateLine(line.key, { unit: event.target.value })} aria-label={`Unité ligne ${index + 1}`} /></td>
                <td><input type="number" min="0.001" step="0.001" required value={line.quantity} onChange={(event) => updateLine(line.key, { quantity: Number(event.target.value) })} aria-label={`Quantité ligne ${index + 1}`} /></td>
                <td><input type="number" min="0" step="0.01" required value={line.unitPrice} onChange={(event) => updateLine(line.key, { unitPrice: Number(event.target.value) })} aria-label={`Prix unitaire ligne ${index + 1}`} /></td>
                <td><input type="number" min="0" max="100" step="0.01" value={line.discountPercent} onChange={(event) => updateLine(line.key, { discountPercent: Number(event.target.value) })} aria-label={`Remise ligne ${index + 1}`} /></td>
                <td><input type="number" min="0" max="100" step="0.01" value={line.taxRate} onChange={(event) => updateLine(line.key, { taxRate: Number(event.target.value) })} aria-label={`TVA ligne ${index + 1}`} /></td>
                <td className="pure-line-total">{formatDa(lineTotal(line))}</td>
                <td><button type="button" className="pure-delete-line" onClick={() => removeLine(line.key)} aria-label={`Supprimer la ligne ${index + 1}`} title="Supprimer cette ligne"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {!lines.length && (
              <tr className="pure-empty-lines-row">
                <td colSpan={10}>
                  <span>Aucune ligne dans ce document.</span>
                  <small>Sélectionnez un article dans la barre du haut, puis cliquez sur « + ligne ».</small>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            {(articleRequest.error || submitError) && <tr className="pure-error-row"><td colSpan={10}>{articleRequest.error || submitError}</td></tr>}
            <tr className="pure-totals-row">
              <td colSpan={5}><span>{lines.length} ligne{lines.length === 1 ? "" : "s"} · {selectedParty?.name || "Tiers non sélectionné"}</span></td>
              <td><small>Sous-total</small><strong>{formatDa(subtotal)}</strong></td>
              <td><small>Remise</small><strong>- {formatDa(discountAmount)}</strong></td>
              <td><small>TVA</small><strong>{formatDa(taxAmount)}</strong></td>
              <td colSpan={2} className="pure-grand-total"><small>Total TTC</small><strong>{formatDa(grandTotal)}</strong></td>
            </tr>
          </tfoot>
        </table>
        <datalist id="pure-party-options">{parties.map((party) => <option key={party.id} value={party.name} />)}</datalist>
        <datalist id="pure-article-options">{articleRequest.rows.map((article) => <option key={article.id} value={`${article.name} · ${article.sku}`} />)}</datalist>
      </form>
    </div>
  );
}

function CreateModal({
  initialTarget,
  initialDocumentType,
  parties,
  onClose,
  onSubmit,
}: {
  initialTarget: BusinessPage;
  initialDocumentType?: string;
  parties: string[];
  onClose: () => void;
  onSubmit: (payload: CreatePayload) => Promise<void> | void;
}) {
  const target = initialTarget;
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [documentType, setDocumentType] = useState(initialDocumentType ?? "");
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [supplierDetailsOpen, setSupplierDetailsOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [headOffice, setHeadOffice] = useState("");
  const [nif, setNif] = useState("");
  const [nis, setNis] = useState("");
  const [rc, setRc] = useState("");
  const [articleQuery, setArticleQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<ArticleRecord | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [documentDate, setDocumentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isDocument = target === "purchases" || target === "sales";
  const isClient = target === "clients";
  const isSupplier = target === "suppliers";
  const [articleRequest, setArticleRequest] = useState<{ rows: ArticleRecord[]; loading: boolean; error: string }>({
    rows: [],
    loading: isDocument,
    error: "",
  });

  useEffect(() => {
    if (!isDocument) return;
    const controller = new AbortController();
    let active = true;

    fetch("/api/articles", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("SQLite indisponible");
        return response.json() as Promise<{ articles: ArticleRecord[] }>;
      })
      .then(({ articles }) => {
        if (active) setArticleRequest({ rows: articles, loading: false, error: "" });
      })
      .catch((requestError: Error) => {
        if (active && requestError.name !== "AbortError") {
          setArticleRequest({ rows: [], loading: false, error: "Impossible de lire les articles SQLite." });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isDocument]);

  const filteredArticles = articleRequest.rows.filter((article) =>
    `${article.name} ${article.sku} ${article.brand} ${article.category} ${article.subcategory ?? ""} ${article.subsubcategory ?? ""}`
      .toLowerCase()
      .includes(articleQuery.toLowerCase()),
  );
  const normalizedPartyQuery = normalizeLabel(name.trim());
  const selectedParty = parties.find((party) => normalizeLabel(party) === normalizedPartyQuery);
  const filteredParties = parties
    .filter((party) => normalizeLabel(party).includes(normalizedPartyQuery))
    .slice(0, 2);
  const subtotal = Math.max(0, quantity) * Math.max(0, unitPrice);
  const discountAmount = subtotal * Math.min(100, Math.max(0, discount)) / 100;
  const netBeforeTax = subtotal - discountAmount;
  const taxAmount = netBeforeTax * Math.min(100, Math.max(0, taxRate)) / 100;
  const grandTotal = netBeforeTax + taxAmount;
  const money = (value: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)} DA`;
  const modalTitle = target === "clients"
    ? "Nouveau client"
    : target === "suppliers"
      ? "Nouveau fournisseur"
      : target === "purchases"
        ? "Nouveau document d’achat"
        : "Nouveau document de vente";

  const selectArticle = (article: ArticleRecord) => {
    setSelectedArticle(article);
    setArticleQuery(article.name);
    setUnitPrice(target === "purchases" ? article.purchase_price : article.sale_price);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        className={`modal-card ${(isDocument || (isClient && clientDetailsOpen) || (isSupplier && supplierDetailsOpen)) ? "expanded-modal" : ""}`}
        autoComplete="off"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={async (event) => {
          event.preventDefault();
          if (isDocument && (!selectedArticle || !documentType)) return;
          setSaving(true);
          setSubmitError("");
          try {
            await onSubmit({
              target,
              name,
              detail,
              documentType,
              contactName,
              email,
              address,
              city,
              headOffice,
              nif,
              nis,
              rc,
              articleName: selectedArticle?.name,
              articleId: selectedArticle?.id,
              articleDescription: selectedArticle?.description,
              unit: selectedArticle?.unit,
              showFullDescription,
              quantity,
              unitPrice,
              discount,
              taxRate,
              documentDate,
              total: grandTotal,
            });
          } catch (submitError) {
            setSubmitError(submitError instanceof Error ? submitError.message : "Impossible d’enregistrer cet élément.");
            setSaving(false);
          }
        }}
      >
        <div className="modal-header"><div><h2 id="create-title">{modalTitle}</h2><p>Le formulaire correspond uniquement à la page actuelle.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
        {isDocument ? (
          <div className="field-label party-picker">
            <span>{target === "purchases" ? "Fournisseur de la base SQLite" : "Client de la base SQLite"}</span>
            <label className="article-search-control party-search-control">
              <Search size={16} />
              <input
                autoFocus
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Rechercher ou saisir le partenaire…"
                aria-label={target === "purchases" ? "Rechercher un fournisseur" : "Rechercher un client"}
              />
              {name && <button type="button" onClick={() => setName("")} aria-label="Effacer"><X size={14} /></button>}
            </label>
            {!selectedParty && (
              <div className="article-search-results party-search-results" role="listbox" aria-label={target === "purchases" ? "Fournisseurs disponibles" : "Clients disponibles"}>
                {filteredParties.map((party, index) => (
                  <button type="button" role="option" aria-selected="false" key={party} onClick={() => setName(party)}>
                    <div className="party-result-avatar"><EntityLogo name={party} tone={index === 0 ? "violet" : "blue"} kind={target === "purchases" ? "supplier" : "client"} /></div>
                    <span><strong>{party}</strong><small>{target === "purchases" ? "Fournisseur enregistré" : "Client enregistré"}</small></span>
                  </button>
                ))}
                {!filteredParties.length && <span className="article-search-message">{name.trim() ? "Nouveau partenaire — vous pouvez poursuivre la saisie." : "Aucun partenaire enregistré."}</span>}
              </div>
            )}
            {selectedParty && (
              <div className="selected-article selected-party">
                <div className="party-result-avatar"><EntityLogo name={selectedParty} tone="violet" kind={target === "purchases" ? "supplier" : "client"} /></div>
                <span><strong>{selectedParty}</strong><small>{target === "purchases" ? "Fournisseur sélectionné" : "Client sélectionné"}</small></span>
                <button type="button" className="text-button" onClick={() => setName("")}>Changer</button>
              </div>
            )}
          </div>
        ) : (
          <label className="field-label">Nom
            <input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom complet" />
          </label>
        )}
        {isDocument && (
          <>
            <div className="form-grid">
              <label className="field-label">Document
                <select required value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                  <option value="" disabled>Choisir le type de document</option>
                  <option>Devis</option><option>Bon de commande</option><option>{target === "purchases" ? "Bon de réception" : "Bon de livraison"}</option><option>Facture</option>
                </select>
              </label>
              <label className="field-label">Date
                <input type="date" required value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} />
              </label>
            </div>

            <div className="field-label article-picker">
              <span>Article de la base SQLite</span>
              <label className="article-search-control">
                <Search size={16} />
                <input
                  value={articleQuery}
                  onChange={(event) => {
                    setArticleQuery(event.target.value);
                    if (selectedArticle?.name !== event.target.value) setSelectedArticle(null);
                  }}
                  placeholder="Rechercher par nom, marque ou référence…"
                  aria-label="Rechercher un article existant"
                />
                {articleQuery && <button type="button" onClick={() => { setArticleQuery(""); setSelectedArticle(null); }} aria-label="Effacer"><X size={14} /></button>}
              </label>
              {!selectedArticle && (
                <div className="article-search-results" role="listbox" aria-label="Articles disponibles">
                  {articleRequest.loading && <span className="article-search-message">Chargement des articles…</span>}
                  {!articleRequest.loading && articleRequest.error && <span className="article-search-message error">{articleRequest.error}</span>}
                  {!articleRequest.loading && !articleRequest.error && filteredArticles.map((article) => (
                    <button type="button" role="option" aria-selected="false" key={article.id} onClick={() => selectArticle(article)}>
                      <ArticleBrandLogo brand={article.brand} logo={article.brand_logo} />
                      <span><strong>{article.name}</strong><small>{article.sku} · Stock {article.stock} {article.unit || "unité"}</small></span>
                      <b>{money(target === "purchases" ? article.purchase_price : article.sale_price)}</b>
                    </button>
                  ))}
                  {!articleRequest.loading && !articleRequest.error && !filteredArticles.length && <span className="article-search-message">Aucun article trouvé.</span>}
                </div>
              )}
            </div>

            {selectedArticle && (
              <div className="selected-article">
                <ArticleBrandLogo brand={selectedArticle.brand} logo={selectedArticle.brand_logo} />
                <span><strong>{selectedArticle.name}</strong><small>{selectedArticle.sku} · {selectedArticle.category} · {selectedArticle.unit || "unité"}{selectedArticle.description ? ` · ${selectedArticle.description}` : ""}</small></span>
                <button type="button" className="text-button" onClick={() => { setSelectedArticle(null); setArticleQuery(""); }}>Changer</button>
              </div>
            )}

            <div className="form-grid form-grid-four">
              <label className="field-label">Quantité ({selectedArticle?.unit || "unité"})
                <input type="number" min="0.001" step="0.001" required value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
              </label>
              <label className="field-label">Prix unitaire
                <input type="number" min="0" step="0.01" required value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} />
              </label>
              <label className="field-label">Remise %
                <input type="number" min="0" max="100" step="0.01" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} />
              </label>
              <label className="field-label">TVA %
                <input type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value))} />
              </label>
            </div>

            {documentType === "Bon de commande" && (
              <label className="description-toggle"><input type="checkbox" checked={showFullDescription} onChange={(event) => setShowFullDescription(event.target.checked)} /><span><strong>Afficher la description complète</strong><small>Sinon seule la désignation de l’article apparaîtra sur le bon de commande.</small></span></label>
            )}

            <section className="document-total-card" aria-live="polite">
              <div><span>Sous-total</span><strong>{money(subtotal)}</strong></div>
              <div><span>Remise</span><strong>- {money(discountAmount)}</strong></div>
              <div><span>TVA ({taxRate || 0}%)</span><strong>{money(taxAmount)}</strong></div>
              <div className="grand-total"><span>Total TTC</span><strong>{money(grandTotal)}</strong></div>
            </section>
          </>
        )}
        {!isDocument && (
          <label className="field-label">{target === "clients" ? "Téléphone" : "Catégorie"}
            <input inputMode={isClient ? "tel" : undefined} value={detail} onChange={(event) => setDetail(event.target.value)} placeholder={target === "clients" ? "0550 00 00 00" : "Catégorie"} />
          </label>
        )}
        {isClient && (
          <section className={`expandable-form-section ${clientDetailsOpen ? "open" : ""}`}>
            <button type="button" className="expand-form-button" aria-expanded={clientDetailsOpen} onClick={() => setClientDetailsOpen((value) => !value)}>
              <span><ContactRound size={16} /> Contact et informations fiscales</span>
              <ChevronDown size={16} />
            </button>
            {clientDetailsOpen && (
              <div className="expanded-fields">
                <div className="form-section-label"><ContactRound size={15} /><span>Contact principal</span></div>
                <div className="form-grid">
                  <label className="field-label">Nom du contact
                    <span className="input-with-icon"><ContactRound size={15} /><input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nom et prénom" /></span>
                  </label>
                  <label className="field-label">E-mail
                    <span className="input-with-icon"><Mail size={15} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contact@entreprise.dz" /></span>
                  </label>
                </div>
                <div className="form-grid">
                  <label className="field-label">Adresse
                    <span className="input-with-icon"><MapPin size={15} /><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rue, zone, bâtiment" /></span>
                  </label>
                  <label className="field-label">Ville
                    <span className="input-with-icon"><MapPin size={15} /><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Alger" /></span>
                  </label>
                </div>
                <div className="form-section-label fiscal-label"><ReceiptText size={15} /><span>Informations fiscales</span><small>Facultatif</small></div>
                <div className="form-grid form-grid-three">
                  <label className="field-label">NIF
                    <input value={nif} onChange={(event) => setNif(event.target.value)} placeholder="N° fiscal" />
                  </label>
                  <label className="field-label">NIS
                    <input value={nis} onChange={(event) => setNis(event.target.value)} placeholder="N° statistique" />
                  </label>
                  <label className="field-label">RC
                    <input value={rc} onChange={(event) => setRc(event.target.value)} placeholder="Registre commerce" />
                  </label>
                </div>
              </div>
            )}
          </section>
        )}
        {isSupplier && (
          <section className={`expandable-form-section ${supplierDetailsOpen ? "open" : ""}`}>
            <button type="button" className="expand-form-button" aria-expanded={supplierDetailsOpen} onClick={() => setSupplierDetailsOpen((value) => !value)}>
              <span><ContactRound size={16} /> Contact, adresse et siège</span>
              <ChevronDown size={16} />
            </button>
            {supplierDetailsOpen && (
              <div className="expanded-fields">
                <div className="form-section-label"><ContactRound size={15} /><span>Contact fournisseur</span></div>
                <div className="form-grid">
                  <label className="field-label">Nom du contact
                    <span className="input-with-icon"><ContactRound size={15} /><input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nom et prénom" /></span>
                  </label>
                  <label className="field-label">E-mail
                    <span className="input-with-icon"><Mail size={15} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contact@fournisseur.dz" /></span>
                  </label>
                </div>
                <div className="form-grid">
                  <label className="field-label">Adresse
                    <span className="input-with-icon"><MapPin size={15} /><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rue, zone, bâtiment" /></span>
                  </label>
                  <label className="field-label">Ville
                    <span className="input-with-icon"><MapPin size={15} /><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Alger" /></span>
                  </label>
                </div>
                <label className="field-label">Siège social
                  <span className="input-with-icon"><Building2 size={15} /><input value={headOffice} onChange={(event) => setHeadOffice(event.target.value)} placeholder="Ville, pays ou adresse du siège" /></span>
                </label>
              </div>
            )}
          </section>
        )}
        {submitError && <p className="form-error" role="alert">{submitError}</p>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Annuler</button><button className="primary-button" type="submit" disabled={saving || (isDocument && (!selectedArticle || !documentType))}><Plus size={16} /> {saving ? "Enregistrement…" : "Ajouter"}</button></div>
      </form>
    </div>
  );
}

function ArticleFormModal({
  article,
  onClose,
  onSaved,
}: {
  article: ArticleRecord | null;
  onClose: () => void;
  onSaved: (article: ArticleRecord) => void;
}) {
  const [name, setName] = useState(article?.name ?? "");
  const [sku, setSku] = useState(article?.sku ?? "");
  const [brand, setBrand] = useState(article?.brand ?? "");
  const [brandLogo, setBrandLogo] = useState(article?.brand_logo ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [subcategory, setSubcategory] = useState(article?.subcategory ?? "");
  const [subsubcategory, setSubsubcategory] = useState(article?.subsubcategory ?? "");
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [description, setDescription] = useState(article?.description ?? "");
  const [unit, setUnit] = useState(article?.unit ?? "unité");
  const [imageUrl, setImageUrl] = useState(article?.image_url ?? "/products/macbook-pro-14.png");
  const [purchasePrice, setPurchasePrice] = useState(article?.purchase_price ?? 0);
  const [salePrice, setSalePrice] = useState(article?.sale_price ?? 0);
  const [stock, setStock] = useState(article?.stock ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/articles", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Catégories indisponibles");
        return response.json() as Promise<{ categories?: CategoryTree[] }>;
      })
      .then((payload) => setCategoryTree(payload.categories ?? []))
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") setCategoryTree([]);
      });
    return () => controller.abort();
  }, []);

  const normalizedCategory = category.trim().toLocaleLowerCase("fr");
  const selectedCategory = categoryTree.find((item) => item.name.toLocaleLowerCase("fr") === normalizedCategory);
  const subcategoryOptions = selectedCategory?.subcategories ?? [];
  const normalizedSubcategory = subcategory.trim().toLocaleLowerCase("fr");
  const selectedSubcategory = subcategoryOptions.find((item) => item.name.toLocaleLowerCase("fr") === normalizedSubcategory);
  const thirdLevelOptions = selectedSubcategory?.subcategories ?? [];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/articles", {
        method: article ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article?.id,
          name: name.trim(),
          sku: sku.trim(),
          brand: brand.trim() || "Sans marque",
          brand_logo: brandLogo.trim(),
          category: category.trim(),
          subcategory: subcategory.trim(),
          subsubcategory: subsubcategory.trim(),
          description: description.trim(),
          unit,
          image_url: imageUrl,
          purchase_price: Number(purchasePrice),
          sale_price: Number(salePrice),
          stock: Number(stock),
        }),
      });
      const payload = await response.json() as { article?: ArticleRecord; error?: string };
      if (!response.ok || !payload.article) throw new Error(payload.error || "Impossible d’enregistrer l’article.");
      onSaved(payload.article);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible d’enregistrer l’article.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="modal-card expanded-modal article-editor-modal" role="dialog" aria-modal="true" aria-labelledby="article-editor-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-header"><div><h2 id="article-editor-title">{article ? "Organiser l’article" : "Nouvel article"}</h2><p>Catégorie, sous-catégories, unité, prix, stock et description.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
        <div className="form-grid">
          <label className="field-label">Désignation<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="MacBook Pro 14 pouces" /></label>
          <label className="field-label">Référence / SKU<input required value={sku} onChange={(event) => setSku(event.target.value)} placeholder="ART-INFO-001" /></label>
        </div>
        <div className="form-grid">
          <label className="field-label">Marque<input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Apple" /></label>
          <label className="field-label">Unité<select value={unit} onChange={(event) => setUnit(event.target.value)}><option value="unité">Unité</option><option value="M">Mètre (M)</option><option value="Bobine">Bobine</option><option value="kg">Kilogramme (kg)</option><option value="L">Litre (L)</option><option value="lot">Lot</option></select></label>
        </div>
        <section className="article-category-editor">
          <div className="form-section-label"><Folder size={15} /><span>Arborescence catalogue — 3 niveaux</span></div>
          <div className="form-grid form-grid-three">
            <label className="field-label">Catégorie
              <input required list="article-category-options" autoComplete="off" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Choisir ou ajouter…" />
              <datalist id="article-category-options">{categoryTree.map((item) => <option key={item.name} value={item.name} />)}</datalist>
            </label>
            <label className="field-label">Sous-catégorie
              <input required list="article-subcategory-options" autoComplete="off" value={subcategory} onChange={(event) => setSubcategory(event.target.value)} placeholder="Choisir ou ajouter…" />
              <datalist id="article-subcategory-options">{subcategoryOptions.map((item) => <option key={item.name} value={item.name} />)}</datalist>
            </label>
            <label className="field-label">Niveau 3
              <input required list="article-third-category-options" autoComplete="off" value={subsubcategory} onChange={(event) => setSubsubcategory(event.target.value)} placeholder="Choisir ou ajouter…" />
              <datalist id="article-third-category-options">{thirdLevelOptions.map((item) => <option key={item} value={item} />)}</datalist>
            </label>
          </div>
          <p className="category-editor-hint"><Plus size={13} />Les 3 familles sont libres : choisissez une valeur existante, ajoutez-en une nouvelle ou renommez-la directement sur cet article.</p>
        </section>
        <label className="field-label">Description complète<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description affichée sur les commandes lorsque l’option est activée." rows={3} /></label>
        <div className="form-grid form-grid-three">
          <label className="field-label">Prix d’achat<input type="number" min="0" step="0.01" value={purchasePrice} onChange={(event) => setPurchasePrice(Number(event.target.value))} /></label>
          <label className="field-label">Prix de vente<input type="number" min="0" step="0.01" value={salePrice} onChange={(event) => setSalePrice(Number(event.target.value))} /></label>
          <label className="field-label">Stock initial / actuel<input type="number" min="0" step="0.01" value={stock} onChange={(event) => setStock(Number(event.target.value))} /></label>
        </div>
        <div className="form-grid">
          <label className="field-label">Photo produit<select value={imageUrl} onChange={(event) => setImageUrl(event.target.value)}><option value="">Sans photo</option><option value="/products/macbook-pro-14.png">MacBook Pro 14</option><option value="/products/imac-24.png">iMac 24</option><option value="/products/macbook-air-13.png">MacBook Air 13</option><option value="/products/macbook-pro-16.png">MacBook Pro 16</option></select></label>
          <label className="field-label">Logo marque (optionnel)<select value={brandLogo} onChange={(event) => setBrandLogo(event.target.value)}><option value="">Icône catalogue</option><option value="/brands/google.png">Google</option><option value="/brands/amazon.svg">Amazon</option></select></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button type="submit" className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form>
    </div>
  );
}

function ReturnModal({
  document,
  direction,
  onClose,
  onConfirm,
}: {
  document: DocumentRecord;
  direction: "purchases" | "sales";
  onClose: () => void;
  onConfirm: (quantity: number, reason: string) => Promise<void>;
}) {
  const [quantity, setQuantity] = useState(Math.max(0.001, (document.quantity ?? 1) - (document.returnedQuantity ?? 0)));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const maximum = Math.max(0, (document.quantity ?? 1) - (document.returnedQuantity ?? 0));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (quantity <= 0 || quantity > maximum) {
      setError(`La quantité doit être comprise entre 0,001 et ${maximum}.`);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onConfirm(quantity, reason.trim());
    } catch (returnError) {
      setError(returnError instanceof Error ? returnError.message : "Impossible de créer le retour.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="modal-card compact-modal" role="dialog" aria-modal="true" aria-labelledby="return-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-header"><div><h2 id="return-title">Créer un bon de retour</h2><p>Retour depuis {document.number} · {direction === "sales" ? "vente" : "achat"}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
        <div className="return-source"><DocumentLogo type={document.type} tone={document.tone} /><div><strong>{document.articleName || document.summary || document.party}</strong><small>{document.number} · {document.quantity ?? 1} {document.unit || "unité"}</small></div></div>
        <label className="field-label">Quantité retournée ({document.unit || "unité"})<input type="number" min="0.001" max={maximum} step="0.001" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required /></label>
        <label className="field-label">Motif (facultatif)<textarea rows={2} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Produit refusé, erreur de commande…" /></label>
        <p className="return-stock-note"><RotateCcw size={15} />{direction === "sales" ? "Le stock sera réintégré automatiquement." : "Le stock sera déduit automatiquement."}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" type="submit" disabled={submitting}><RotateCcw size={15} />{submitting ? "Création…" : "Valider le retour"}</button></div>
      </form>
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card compact-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><h2 id="help-title">Aide rapide</h2><p>Tout est accessible depuis la barre latérale.</p></div><button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
        <div className="help-list"><span><Check size={16} /> Recherchez depuis la barre latérale ou le tableau.</span><span><Check size={16} /> Utilisez Filtrer pour afficher les éléments ouverts.</span><span><Check size={16} /> Basculez entre les vues Liste et Grille.</span></div>
        <button className="primary-button full-button" onClick={onClose}>Compris</button>
      </div>
    </div>
  );
}

export default function WorkspaceApp() {
  const page = useSyncExternalStore(subscribeToPage, readPageFromUrl, () => "dashboard") as PageKey;
  const company = useSyncExternalStore(subscribeToCompany, readCompanySettings, () => DEFAULT_COMPANY);
  useEffect(() => {
    document.title = `${company.name} Workspace`;
  }, [company.name]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<DocType>("all");
  const [filterActive, setFilterActive] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [clients, setClients] = useState(initialClients);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [sales, setSales] = useState(initialSales);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
  const [treasuryLedger, setTreasuryLedger] = useState<TreasuryLedgerRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [documentEditorContext, setDocumentEditorContext] = useState<{ direction: "purchases" | "sales"; document: DocumentRecord | null } | null>(null);
  const [articleEditor, setArticleEditor] = useState<ArticleRecord | "new" | null>(null);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [returnContext, setReturnContext] = useState<{ direction: "purchases" | "sales"; document: DocumentRecord } | null>(null);
  const [partyDetails, setPartyDetails] = useState<{ party: PartyRow; kind: "client" | "supplier" } | null>(null);
  const [partyEditor, setPartyEditor] = useState<{ party: PartyRow; kind: "client" | "supplier" } | null>(null);
  const [settlementContext, setSettlementContext] = useState<{ party: PartyRow; kind: "client" | "supplier" } | null>(null);
  const [documentDetails, setDocumentDetails] = useState<DocumentContext | null>(null);
  const [printContext, setPrintContext] = useState<DocumentContext | null>(null);
  const [financeEntryEditor, setFinanceEntryEditor] = useState<FinanceEntry | "new" | null>(null);
  const [financeEntryDetails, setFinanceEntryDetails] = useState<FinanceEntry | null>(null);
  const [treasuryEntryEditor, setTreasuryEntryEditor] = useState<TreasuryEntry | "new" | null>(null);
  const [partyVersion, setPartyVersion] = useState(0);
  const [financeVersion, setFinanceVersion] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);
  const meta = pageMeta[page];

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    Promise.all(["purchases", "sales"].map(async (direction) => {
      const response = await fetch(`/api/documents?direction=${direction}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("SQLite indisponible");
      return response.json() as Promise<{ documents: ApiDocumentRecord[] }>;
    }))
      .then(([purchasePayload, salesPayload]) => {
        if (!active) return;
        setPurchases(withReturnedQuantities([
          ...purchasePayload.documents.map(toDocumentRecord),
          ...initialPurchases,
        ]));
        setSales(withReturnedQuantities([
          ...salesPayload.documents.map(toDocumentRecord),
          ...initialSales,
        ]));
      })
      .catch((error: Error) => {
        if (active && error.name !== "AbortError") {
          console.error("Impossible de charger les documents SQLite", error);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    Promise.all(["client", "supplier"].map(async (kind) => {
      const response = await fetch(`/api/parties?kind=${kind}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("SQLite indisponible");
      return response.json() as Promise<{ parties: ApiPartyRecord[] }>;
    }))
      .then(([clientPayload, supplierPayload]) => {
        if (!active) return;
        setClients(clientPayload.parties.map(toClientRecord));
        setSuppliers(supplierPayload.parties.map(toSupplierRecord));
      })
      .catch((error: Error) => {
        if (active && error.name !== "AbortError") {
          console.error("Impossible de charger les tiers SQLite", error);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [partyVersion]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/finance", { signal: controller.signal, cache: "no-store" }).then(async (response) => {
        const payload = await response.json() as { entries?: FinanceEntry[] };
        if (!response.ok) throw new Error("Finance indisponible");
        return payload.entries ?? [];
      }),
      fetch("/api/treasury", { signal: controller.signal, cache: "no-store" }).then(async (response) => {
        const payload = await response.json() as { ledger?: TreasuryLedgerRow[] };
        if (!response.ok) throw new Error("Trésorerie indisponible");
        return payload.ledger ?? [];
      }),
    ])
      .then(([entries, ledger]) => {
        setFinanceEntries(entries);
        setTreasuryLedger(ledger);
      })
      .catch((error: Error) => { if (error.name !== "AbortError") console.error("Impossible de charger la finance SQLite", error); });
    return () => controller.abort();
  }, [financeVersion]);

  const navigate = (nextPage: PageKey) => {
    if (nextPage !== page) window.history.pushState(null, "", `#${nextPage}`);
    window.dispatchEvent(new Event("hashchange"));
    setSearch("");
    setActiveTab("all");
    setFilterActive(false);
    setViewMode(nextPage === "articles" ? "grid" : "list");
  };

  const adjustArticleStock = async (articleId: number, stockDelta: number, reason: string) => {
    const response = await fetch("/api/articles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: articleId, stock_delta: stockDelta, reason }),
    });
    const payload = await response.json() as { article?: ArticleRecord; error?: string };
    if (!response.ok || !payload.article) throw new Error(payload.error || "Impossible de mettre à jour le stock.");
    setCatalogVersion((value) => value + 1);
    return payload.article;
  };

  const postDocument = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json() as { document?: ApiDocumentRecord; error?: string };
    if (!response.ok || !payload.document) throw new Error(payload.error || "Impossible d’enregistrer le document.");
    return toDocumentRecord(payload.document);
  };

  const patchDocument = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json() as { document?: ApiDocumentRecord; error?: string };
    if (!response.ok || !payload.document) throw new Error(payload.error || "Impossible de modifier le document.");
    return toDocumentRecord(payload.document);
  };

  const postParty = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json() as { party?: ApiPartyRecord; error?: string };
    if (!response.ok || !payload.party) throw new Error(payload.error || "Impossible d’enregistrer le tiers.");
    return payload.party;
  };

  const deletePartyRecord = async (party: PartyRow, kind: "client" | "supplier") => {
    const response = await fetch("/api/parties", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: party.id }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) throw new Error(payload.error || "Impossible de supprimer le tiers.");
    if (kind === "client") setClients((rows) => rows.filter((row) => row.id !== party.id));
    else setSuppliers((rows) => rows.filter((row) => row.id !== party.id));
    notify(`${party.name} supprimé`);
  };

  const duplicatePartyRecord = async (party: PartyRow, kind: "client" | "supplier") => {
    const copy = await postParty({
      kind,
      name: `${party.name} (copie)`,
      contact_phone: party.contact === "—" ? "" : party.contact,
      contact_name: party.contactName,
      email: party.email === "E-mail non renseigné" ? "" : party.email,
      address: party.address,
      city: party.city,
      category: "category" in party ? party.category : "",
    });
    if (kind === "client") setClients((rows) => [toClientRecord(copy), ...rows]);
    else setSuppliers((rows) => [toSupplierRecord(copy), ...rows]);
    notify(`${party.name} dupliqué`);
  };

  const deleteDocumentRecord = async (document: DocumentRecord, direction: "purchases" | "sales") => {
    if (document.id) {
      const response = await fetch("/api/documents", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: document.id }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de supprimer le document.");
    }
    if (direction === "sales") setSales((rows) => rows.filter((row) => row.number !== document.number));
    else setPurchases((rows) => rows.filter((row) => row.number !== document.number));
    setPartyVersion((value) => value + 1);
    notify(`${document.number} supprimé`);
  };

  const duplicateDocumentRecord = async (document: DocumentRecord, direction: "purchases" | "sales") => {
    const lines = documentLinesFor(document);
    if (!lines.length) throw new Error("Le document ne contient pas de ligne à dupliquer.");
    const copy = await postDocument({
      direction,
      type: "Devis",
      partyId: document.partyId,
      partyName: document.party,
      documentDate: new Date().toISOString().slice(0, 10),
      showDescription: document.showFullDescription,
      lines: lines.map((line) => ({
        articleId: line.article_id,
        designation: line.designation,
        description: line.description,
        unit: line.unit,
        quantity: line.quantity,
        unitPrice: line.unit_price,
        discountPercent: line.discount_percent,
        taxRate: line.tax_rate,
      })),
    });
    if (direction === "sales") setSales((rows) => [copy, ...rows]); else setPurchases((rows) => [copy, ...rows]);
    notify(`Copie créée depuis ${document.number}`);
  };

  const confirmReturn = async (quantity: number, reason: string) => {
    if (!returnContext) throw new Error("Aucun document source sélectionné.");
    const { direction, document } = returnContext;
    const articleId = document.articleId;
    if (!articleId) throw new Error("Cet article n’est pas lié au document source.");

    if (document.id) {
      const response = await fetch(`/api/documents/${document.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          lines: [{
            articleId,
            designation: document.articleName,
            description: document.description,
            unit: document.unit,
            quantity,
            unitPrice: document.unitPrice,
            discountPercent: document.discountPercent,
            taxRate: document.taxRate,
          }],
        }),
      });
      const payload = await response.json() as { document?: ApiDocumentRecord; error?: string };
      if (!response.ok || !payload.document) throw new Error(payload.error || "Impossible de créer le retour.");
      const returnRecord = toDocumentRecord(payload.document);
      const updateRows = (rows: DocumentRecord[]) => withReturnedQuantities([returnRecord, ...rows]);
      if (direction === "sales") setSales(updateRows);
      else setPurchases(updateRows);
      setCatalogVersion((value) => value + 1);
      setPartyVersion((value) => value + 1);
    } else {
      // The two Google/Amazon rows remain lightweight local examples. Every new
      // document uses the transactional SQLite route above.
      const stockDelta = direction === "sales" ? quantity : -quantity;
      await adjustArticleStock(articleId, stockDelta, `Retour ${document.number}${reason ? ` · ${reason}` : ""}`);
      const rawAmount = Number(document.amount.replace(/[^0-9,.-]/g, "").replace(",", ".")) || 0;
      const proportionalAmount = rawAmount * quantity / (document.quantity || 1);
      const returnRecord: DocumentRecord = {
        number: `RET-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        party: document.party,
        type: "Bon de retour",
        date: "À l’instant",
        amount: `-${formatDa(proportionalAmount)}`,
        status: "Traité",
        tone: "pink",
        summary: `${quantity} ${document.unit || "unité"} × ${document.articleName || "Article"}${reason ? ` · ${reason}` : ""}`,
        articleId,
        articleName: document.articleName,
        quantity,
        unit: document.unit,
        unitPrice: document.unitPrice,
        sourceDocument: document.number,
      };
      const markReturned = (rows: DocumentRecord[]) => rows.map((row) => row.number === document.number ? { ...row, returnedQuantity: (row.returnedQuantity ?? 0) + quantity } : row);
      if (direction === "sales") setSales((rows) => [returnRecord, ...markReturned(rows)]);
      else setPurchases((rows) => [returnRecord, ...markReturned(rows)]);
    }

    setReturnContext(null);
    notify(`Retour créé · stock ${direction === "sales" ? "réintégré" : "déduit"}`);
  };

  const convertQuoteToInvoice = async (direction: "purchases" | "sales", quote: DocumentRecord) => {
    const sourceLines = documentLinesFor(quote);
    if (quote.id && sourceLines.length) {
      const invoice = await postDocument({
        direction,
        type: "Facture",
        status: "À régler",
        partyId: quote.partyId,
        partyName: quote.party,
        sourceDocumentId: quote.id,
        documentDate: new Date().toISOString().slice(0, 10),
        showDescription: quote.showFullDescription,
        lines: sourceLines.map((line) => ({
          articleId: line.article_id,
          designation: line.designation,
          description: line.description,
          unit: line.unit,
          quantity: line.quantity,
          unitPrice: line.unit_price,
          discountPercent: line.discount_percent,
          taxRate: line.tax_rate,
        })),
      });
      if (direction === "sales") setSales((rows) => [invoice, ...rows]);
      else setPurchases((rows) => [invoice, ...rows]);
      setPartyVersion((value) => value + 1);
    } else {
      const invoice: DocumentRecord = {
        ...quote,
        number: `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        type: "Facture",
        date: "À l’instant",
        status: "Brouillon",
        tone: "gray",
        sourceDocument: quote.number,
      };
      if (direction === "sales") setSales((rows) => [invoice, ...rows]);
      else setPurchases((rows) => [invoice, ...rows]);
    }
    notify(`Facture créée depuis ${quote.number}`);
  };

  const createItem = async ({ target, name, detail, documentType, contactName, email, address, city, headOffice, nif, nis, rc, articleId, articleName, articleDescription, unit, showFullDescription, quantity, unitPrice, discount, taxRate, documentDate, partyId, documentId, lines }: CreatePayload) => {
    const cleanName = name.trim();
    if (target === "clients") {
      const party = await postParty({
        kind: "client",
        name: cleanName,
        contact_phone: detail,
        contact_name: contactName,
        email,
        address,
        city,
        nif,
        nis,
        rc,
      });
      setClients((rows) => [toClientRecord(party), ...rows]);
    } else if (target === "suppliers") {
      const party = await postParty({
        kind: "supplier",
        name: cleanName,
        contact_name: contactName,
        email,
        address,
        city,
        head_office: headOffice,
        category: detail,
        nif,
        nis,
        rc,
      });
      setSuppliers((rows) => [toSupplierRecord(party), ...rows]);
    } else {
      const documentLines = lines?.length
        ? lines.map((line) => ({
            articleId: line.articleId,
            designation: line.designation.trim(),
            description: line.description.trim(),
            unit: line.unit.trim() || "Unité",
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountPercent: line.discountPercent,
            taxRate: line.taxRate,
          }))
        : articleId
          ? [{
              articleId,
              designation: articleName,
              description: articleDescription,
              unit,
              quantity,
              unitPrice,
              discountPercent: discount,
              taxRate,
            }]
          : [];
      if (!partyId) throw new Error(`Sélectionnez un ${target === "purchases" ? "fournisseur" : "client"} enregistré.`);
      if (!documentLines.length) throw new Error("Ajoutez au moins un article.");
      const save = documentId ? patchDocument : postDocument;
      const record = await save({
        ...(documentId ? { id: documentId } : {}),
        direction: target,
        type: documentType,
        status: documentType === "Facture" ? "À régler" : undefined,
        partyId,
        partyName: cleanName,
        documentDate,
        showDescription: showFullDescription,
        lines: documentLines,
      });
      if (target === "purchases") {
        setPurchases((rows) => documentId ? rows.map((row) => row.id === documentId ? record : row) : [record, ...rows]);
      } else {
        setSales((rows) => documentId ? rows.map((row) => row.id === documentId ? record : row) : [record, ...rows]);
      }
      setCatalogVersion((value) => value + 1);
      setPartyVersion((value) => value + 1);
    }
    setCreateOpen(false);
    setDocumentEditorContext(null);
    notify(documentId ? "Document modifié avec succès" : "Élément ajouté avec succès");
  };

  const deleteFinanceEntryRecord = async (entry: FinanceEntry) => {
    try {
      const response = await fetch("/api/finance", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry.id }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de supprimer la charge.");
      setFinanceEntries((rows) => rows.filter((row) => row.id !== entry.id));
      setFinanceVersion((value) => value + 1);
      notify(`${entry.label} supprimé`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Impossible de supprimer la charge.");
    }
  };

  const deleteTreasuryEntryRecord = async (entry: TreasuryEntry) => {
    try {
      const response = await fetch("/api/treasury", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry.id }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de supprimer le mouvement.");
      setFinanceVersion((value) => value + 1);
      notify(`${entry.label} supprimé`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Impossible de supprimer le mouvement.");
    }
  };

  const createTarget: BusinessPage | null = ["clients", "suppliers", "purchases", "sales"].includes(page)
    ? page as BusinessPage
    : null;
  const createDocumentType = createTarget === "purchases" || createTarget === "sales"
    ? documentTypeForTab(activeTab, createTarget)
    : "";
  const currentPartyDetails = partyDetails
    ? (partyDetails.kind === "client" ? clients : suppliers).find((party) => party.id === partyDetails.party.id) ?? partyDetails.party
    : null;
  const currentSettlementParty = settlementContext
    ? (settlementContext.kind === "client" ? clients : suppliers).find((party) => party.id === settlementContext.party.id) ?? settlementContext.party
    : null;
  const printableContextFor = (
    direction: DocumentContext["direction"],
    document: DocumentRecord,
  ): DocumentContext => {
    const parties = direction === "purchases" ? suppliers : clients;
    const party = parties.find((row) =>
      document.partyId ? row.id === document.partyId : row.name === document.party,
    );
    const partyAddress = [party?.address, party?.city].filter(Boolean).join(", ");
    return { direction, document, partyAddress };
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand-row"
          aria-expanded={workspaceOpen}
          aria-haspopup="menu"
          onClick={() => setWorkspaceOpen((value) => !value)}
        >
          <span className="brand-mark"><span /></span>
          <CompanyLogo company={company} />
          <span className="brand-copy"><strong>{company.name}</strong></span>
          <ChevronDown size={15} />
        </button>
        {workspaceOpen && (
          <div className="workspace-menu" role="menu">
            <button onClick={() => { setWorkspaceOpen(false); navigate("settings"); }}>Paramètres de l’entreprise</button>
            <button onClick={() => { setWorkspaceOpen(false); notify("Gestion des membres ouverte"); }}>Gérer les membres</button>
          </div>
        )}
        <label className="side-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher" aria-label="Recherche globale" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Effacer"><X size={14} /></button>}</label>
        <nav className="side-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-label">{group.label}</span>
              {group.items.map(({ key, label, icon: Icon }) => (
                <button key={label} className={key && page === key && (group.label === "Menu" || key === "documents" || key === "settings") ? "nav-item active" : "nav-item"} onClick={() => key ? navigate(key) : notify(`${label} ouvert`)}>
                  <Icon size={17} /><span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="workspace-card" onClick={() => setWorkspaceOpen((value) => !value)}>
            <CompanyLogo company={company} className="workspace-avatar" /><span><strong>{company.name}</strong><small>Offre gratuite</small></span><MoreHorizontal size={17} />
          </button>
        </div>
      </aside>

      <div className="main-shell">
        <header className={`topbar ${page === "dashboard" ? "dashboard-topbar" : ""}`}>
          <div className="breadcrumb">
            <meta.icon size={20} />
            <span><strong>{meta.label}</strong><small>{meta.subtitle}</small></span>
          </div>
          {page !== "dashboard" && (
            <div className="quick-stats" aria-label="Indicateurs clés">
              {topStats[page].map(({ label, value, trend, icon: Icon }, index) => (
                <div className="top-stat" key={label}><Icon size={17} /><span><small>{label}</small><strong>{value}</strong></span><em className={index === 2 ? "neutral" : ""}>{trend}</em></div>
              ))}
            </div>
          )}
          <div className="topbar-actions">
            <div className="notification-wrap">
              <button className={`icon-button ${notificationsOpen ? "active" : ""}`} aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} /><i /></button>
              {notificationsOpen && <div className="notification-panel"><div><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div><p><span className="notification-dot coral" />3 factures arrivent à échéance.</p><p><span className="notification-dot blue" />La commande BC-2024-076 est en cours.</p><button className="text-button" onClick={() => { setNotificationsOpen(false); notify("Notifications marquées comme lues"); }}>Tout marquer comme lu</button></div>}
            </div>
            <button className="help-button" onClick={() => setHelpOpen(true)}><CircleHelp size={17} /> Aide</button>
            {(createTarget || page === "articles") && <button className="top-new-button" onClick={() => {
              if (page === "articles") {
                setArticleEditor("new");
                return;
              }
              if ((page === "purchases" || page === "sales") && activeTab === "returns") {
                notify("Créez un retour depuis le menu d’une livraison ou d’une facture.");
                return;
              }
              setCreateOpen(true);
            }}><Plus size={17} /> Nouveau</button>}
          </div>
        </header>

        <main className="main-content">
          {page === "dashboard" && <Dashboard onViewSales={() => navigate("sales")} purchases={purchases} sales={sales} />}
          {page === "clients" && <ClientsTable rows={clients} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onOpen={(party) => setPartyDetails({ party, kind: "client" })} onEdit={(party) => setPartyEditor({ party, kind: "client" })} onDuplicate={(party) => { void duplicatePartyRecord(party, "client").catch((error) => notify(error instanceof Error ? error.message : "Impossible de dupliquer le client.")); }} onSettle={(party) => setSettlementContext({ party, kind: "client" })} onDelete={(name) => { const party = clients.find((row) => row.name === name); if (party) void deletePartyRecord(party, "client").catch((error) => notify(error instanceof Error ? error.message : "Impossible de supprimer le client.")); }} />}
          {page === "suppliers" && <SuppliersTable rows={suppliers} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onOpen={(party) => setPartyDetails({ party, kind: "supplier" })} onEdit={(party) => setPartyEditor({ party, kind: "supplier" })} onDuplicate={(party) => { void duplicatePartyRecord(party, "supplier").catch((error) => notify(error instanceof Error ? error.message : "Impossible de dupliquer le fournisseur.")); }} onSettle={(party) => setSettlementContext({ party, kind: "supplier" })} onDelete={(name) => { const party = suppliers.find((row) => row.name === name); if (party) void deletePartyRecord(party, "supplier").catch((error) => notify(error instanceof Error ? error.message : "Impossible de supprimer le fournisseur.")); }} />}
          {page === "articles" && <ArticlesTable search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} refreshKey={catalogVersion} onEdit={(article) => setArticleEditor(article)} />}
          {page === "purchases" && <DocumentsTable page="purchases" rows={purchases} search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onOpen={(document) => setDocumentDetails(printableContextFor("purchases", document))} onPrint={(document) => setPrintContext(printableContextFor("purchases", document))} onEdit={(document) => setDocumentEditorContext({ direction: "purchases", document })} onDuplicate={(document) => { void duplicateDocumentRecord(document, "purchases").catch((error) => notify(error instanceof Error ? error.message : "Impossible de dupliquer le document.")); }} onDelete={(number) => { const document = purchases.find((row) => row.number === number); if (document) void deleteDocumentRecord(document, "purchases").catch((error) => notify(error instanceof Error ? error.message : "Impossible de supprimer le document.")); }} onReturn={(document) => setReturnContext({ direction: "purchases", document })} onConvertQuote={(quote) => convertQuoteToInvoice("purchases", quote)} />}
          {page === "sales" && <DocumentsTable page="sales" rows={sales} search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onOpen={(document) => setDocumentDetails(printableContextFor("sales", document))} onPrint={(document) => setPrintContext(printableContextFor("sales", document))} onEdit={(document) => setDocumentEditorContext({ direction: "sales", document })} onDuplicate={(document) => { void duplicateDocumentRecord(document, "sales").catch((error) => notify(error instanceof Error ? error.message : "Impossible de dupliquer le document.")); }} onDelete={(number) => { const document = sales.find((row) => row.number === number); if (document) void deleteDocumentRecord(document, "sales").catch((error) => notify(error instanceof Error ? error.message : "Impossible de supprimer le document.")); }} onReturn={(document) => setReturnContext({ direction: "sales", document })} onConvertQuote={(quote) => convertQuoteToInvoice("sales", quote)} />}
          {page === "finance" && <FinanceWorkspacePage entries={financeEntries} parties={[...clients, ...suppliers]} treasuryLedger={treasuryLedger} search={search} setSearch={setSearch} onNewCharge={() => setFinanceEntryEditor("new")} onViewCharge={setFinanceEntryDetails} onEditCharge={(entry) => setFinanceEntryEditor(entry)} onDeleteCharge={(entry) => { void deleteFinanceEntryRecord(entry); }} onViewParty={(party, kind) => setPartyDetails({ party, kind })} onSettleParty={(party, kind) => setSettlementContext({ party, kind })} onNewTreasury={() => setTreasuryEntryEditor("new")} onEditTreasury={(entry) => setTreasuryEntryEditor(entry)} onDeleteTreasury={(entry) => { void deleteTreasuryEntryRecord(entry); }} />}
          {page === "documents" && <DocumentsLibrary purchases={purchases} sales={sales} search={search} setSearch={setSearch} viewMode={viewMode} setViewMode={setViewMode} />}
          {page === "settings" && <SettingsPage company={company} onSave={persistCompanySettings} notify={notify} />}
        </main>
      </div>

      {(createOpen && (createTarget === "purchases" || createTarget === "sales") || documentEditorContext) && (
        <SimpleDocumentEditor
          initialTarget={documentEditorContext?.direction ?? createTarget as "purchases" | "sales"}
          initialDocument={documentEditorContext?.document ?? null}
          initialDocumentType={documentEditorContext ? undefined : createDocumentType}
          defaultTaxRate={company.defaultTaxRate}
          parties={documentEditorContext?.direction === "purchases" || createTarget === "purchases" ? suppliers : clients}
          onClose={() => { setCreateOpen(false); setDocumentEditorContext(null); }}
          onSubmit={createItem}
        />
      )}
      {createOpen && (createTarget === "clients" || createTarget === "suppliers") && (
        <CreateModal initialTarget={createTarget} initialDocumentType={createDocumentType} parties={[]} onClose={() => setCreateOpen(false)} onSubmit={createItem} />
      )}
      {articleEditor && <ArticleFormModal article={articleEditor === "new" ? null : articleEditor} onClose={() => setArticleEditor(null)} onSaved={(article) => { setArticleEditor(null); setCatalogVersion((value) => value + 1); notify(`${article.name} enregistré dans le catalogue`); }} />}
      {returnContext && <ReturnModal document={returnContext.document} direction={returnContext.direction} onClose={() => setReturnContext(null)} onConfirm={confirmReturn} />}
      {partyDetails && currentPartyDetails && (
        <PartyDetailsModal
          key={`${currentPartyDetails.id}-${partyVersion}`}
          party={currentPartyDetails}
          kind={partyDetails.kind}
          paymentVersion={partyVersion}
          onClose={() => setPartyDetails(null)}
          onEdit={() => {
            setPartyEditor({ party: currentPartyDetails, kind: partyDetails.kind });
            setPartyDetails(null);
          }}
          onSettle={() => setSettlementContext({ party: currentPartyDetails, kind: partyDetails.kind })}
        />
      )}
      {partyEditor && <PartyEditorModal party={partyEditor.party} kind={partyEditor.kind} onClose={() => setPartyEditor(null)} onSaved={(party) => { if (partyEditor.kind === "client") setClients((rows) => rows.map((row) => row.id === party.id ? toClientRecord(party) : row)); else setSuppliers((rows) => rows.map((row) => row.id === party.id ? toSupplierRecord(party) : row)); setPartyEditor(null); notify("Tiers mis à jour"); }} />}
      {settlementContext && currentSettlementParty && <SettlementModal party={currentSettlementParty} kind={settlementContext.kind} onClose={() => setSettlementContext(null)} onSaved={() => { setSettlementContext(null); setPartyVersion((value) => value + 1); setFinanceVersion((value) => value + 1); notify("Règlement enregistré"); }} />}
      {documentDetails && <DocumentDetailsModal document={documentDetails.document} onClose={() => setDocumentDetails(null)} onPrint={() => setPrintContext(documentDetails)} />}
      {printContext && <PrintableDocument company={company} context={printContext} onClose={() => setPrintContext(null)} />}
      {financeEntryEditor && <FinanceEntryFormModal entry={financeEntryEditor === "new" ? null : financeEntryEditor} onClose={() => setFinanceEntryEditor(null)} onSaved={(entry) => { setFinanceEntries((rows) => financeEntryEditor === "new" ? [entry, ...rows] : rows.map((row) => row.id === entry.id ? entry : row)); setFinanceEntryEditor(null); setFinanceVersion((value) => value + 1); notify("Charge enregistrée"); }} />}
      {financeEntryDetails && <FinanceEntryDetailsModal entry={financeEntryDetails} onClose={() => setFinanceEntryDetails(null)} />}
      {treasuryEntryEditor && <TreasuryEntryFormModal entry={treasuryEntryEditor === "new" ? null : treasuryEntryEditor} onClose={() => setTreasuryEntryEditor(null)} onSaved={() => { setTreasuryEntryEditor(null); setFinanceVersion((value) => value + 1); notify("Mouvement de trésorerie enregistré"); }} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="Fermer"><X size={14} /></button></div>}
    </div>
  );
}
