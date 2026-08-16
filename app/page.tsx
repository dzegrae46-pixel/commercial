"use client";

// The workspace is session-backed and must never be prerendered. Keeping the
// route dynamic also avoids spawning a static-page worker on constrained
// Passenger accounts.
export const dynamic = "force-dynamic";

import {
  ArrowLeft,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Banknote,
  Ban,
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
  LogOut,
  Mail,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Package,
  Phone,
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
  Bug,
  Lightbulb,
  Trash2,
  Truck,
  Upload,
  UserPlus,
  Users,
  WalletCards,
  Wheat,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createTimeline } from "animejs";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type PageKey = "dashboard" | "clients" | "suppliers" | "articles" | "purchases" | "sales" | "finance" | "documents" | "feedback" | "settings";
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
  activityLine1: string;
  activityLine2: string;
  rc: string;
  taxArticle: string;
  nif: string;
  rib: string;
  bank: string;
  address: string;
  city: string;
  phone: string;
  feedbackEnabled: boolean;
};

type FeedbackType = "bug" | "suggestion";
type FeedbackStatus = "open" | "in_progress" | "resolved" | "closed";
type FeedbackPriority = "low" | "normal" | "high" | "urgent";

type FeedbackRecord = {
  id: number;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  reporter: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

type ClientRecord = {
  id: number;
  name: string;
  initials: string;
  color: string;
  phone: string;
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
  clientCategory?: string;
  nif?: string;
  nis?: string;
  rc?: string;
  taxArticle?: string;
  rib?: string;
  bank?: string;
  note?: string;
  imageUrl?: string;
  contactStatus?: string;
  isBlocked?: boolean;
};

type SupplierRecord = {
  id: number;
  name: string;
  initials: string;
  color: string;
  phone: string;
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
  taxArticle?: string;
  rib?: string;
  bank?: string;
  note?: string;
  imageUrl?: string;
  contactStatus?: string;
  isBlocked?: boolean;
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
  partyBalance?: string;
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
  article_sku?: string;
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
  phone: string;
  contact_phone: string;
  contact_name: string;
  email: string;
  address: string;
  city: string;
  head_office: string;
  category: string;
  client_category: string;
  nif: string;
  nis: string;
  rc: string;
  tax_article: string;
  rib: string;
  bank: string;
  note: string;
  billed: number;
  paid?: number;
  credit?: number;
  balance: number;
  status: string;
  image_url: string;
  contact_status: string;
  is_blocked: number;
};

type PartyBalanceHistoryRecord = {
  id: string;
  event_date: string;
  created_at: string;
  kind: "document" | "payment";
  label: string;
  reference: string;
  delta: number;
  balance: number;
  credit: number;
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
  previous_balance: number | null;
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
  source?: "manual" | "salary";
  salary_payment_id?: number | null;
};

type EmployeeRecord = {
  id: number;
  name: string;
  job_title: string;
  phone: string;
  base_salary: number;
  hire_date: string;
  status: "Actif" | "Inactif";
};

type EmployeeAttendanceRecord = {
  id: number;
  employee_id: number;
  work_date: string;
  status: "Présent" | "Absent" | "Congé";
  check_in: string;
  check_out: string;
  hours: number;
  note: string;
};

type SalaryPaymentRecord = {
  id: number;
  employee_id: number;
  employee_name: string;
  finance_entry_id: number;
  payroll_month: string;
  base_amount: number;
  bonus: number;
  deduction: number;
  amount: number;
  payment_date: string;
  method: string;
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
  subsubsubcategory: string;
  description: string;
  unit: string;
  image_url: string;
  purchase_price: number;
  purchase_prices: { client_category: string; purchase_price: number }[];
  sale_price: number;
  sale_prices: { label: string; client_category: string; margin_percent: number; sale_price: number }[];
  stock: number;
  status: string;
  updated_at: string;
};

type CategoryTree = {
  name: string;
  subcategories: {
    name: string;
    subcategories: {
      name: string;
      subcategories: string[];
    }[];
  }[];
};

type ClientCategoryRecord = { id: number; name: string; created_at?: string; updated_at?: string };

type CategoryEditTarget = {
  key: string;
  level: 1 | 2 | 3 | 4;
  category: string;
  subcategory: string;
  subsubcategory?: string;
  currentName: string;
};

type CreatePayload = {
  target: BusinessPage;
  name: string;
  detail: string;
  documentType: string;
  contactName?: string;
  contactPhone?: string;
  category?: string;
  clientCategory?: string;
  email?: string;
  address?: string;
  city?: string;
  headOffice?: string;
  nif?: string;
  nis?: string;
  rc?: string;
  taxArticle?: string;
  rib?: string;
  bank?: string;
  note?: string;
  imageUrl?: string;
  contactStatus?: string;
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
  purchases: { label: "Achats", subtitle: "Commandes, bons d’achat et factures", icon: ShoppingBag },
  sales: { label: "Ventes", subtitle: "Devis, commandes et factures", icon: Store },
  finance: { label: "Finance", subtitle: "Dépenses, charges et règlements", icon: WalletCards },
  documents: { label: "Documents", subtitle: "Tous vos fichiers commerciaux", icon: Files },
  feedback: { label: "Feedback", subtitle: "Erreurs signalées et propositions", icon: MessageSquareText },
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
      { key: "feedback", label: "Feedback", icon: MessageSquareText },
    ],
  },
  {
    label: "Privé",
    items: [{ key: "settings", label: "Paramètres", icon: Settings2 }],
  },
];

const topStats: Record<PageKey, { label: string; value: string; trend: string; icon: LucideIcon }[]> = {
  dashboard: [
    { label: "Catalogue", value: "1 article", trend: "SQLite local", icon: BarChart3 },
    { label: "Ventes", value: "0 document", trend: "Base réinitialisée", icon: Store },
    { label: "Achats", value: "0 document", trend: "Base réinitialisée", icon: ShoppingBag },
  ],
  clients: [
    { label: "Clients", value: "1", trend: "Base locale", icon: Users },
    { label: "Factures", value: "0", trend: "Aucun document", icon: FileText },
    { label: "À recevoir", value: "0 DA", trend: "À jour", icon: WalletCards },
  ],
  suppliers: [
    { label: "Fournisseurs", value: "1", trend: "Base locale", icon: Truck },
    { label: "Total achats", value: "0 DA", trend: "Aucun document", icon: ShoppingBag },
    { label: "Reste à payer", value: "0 DA", trend: "À jour", icon: WalletCards },
  ],
  articles: [
    { label: "Articles", value: "1", trend: "SQLite local", icon: Boxes },
    { label: "Valeur du stock", value: "6 000 DA", trend: "6 unités", icon: Package },
    { label: "Stock faible", value: "1", trend: "À surveiller", icon: ShoppingBag },
  ],
  purchases: [
    { label: "Achats", value: "2 docs", trend: "Tests", icon: ShoppingBag },
    { label: "Factures", value: "1", trend: "Amazon", icon: FileCheck2 },
    { label: "Bons d’achat", value: "1", trend: "Google", icon: ClipboardList },
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
    { label: "Images", value: "2", trend: "BL / bon d’achat", icon: FileImage },
  ],
  feedback: [
    { label: "Ouverts", value: "À traiter", trend: "Signalements actifs", icon: Bug },
    { label: "Propositions", value: "Idées", trend: "Améliorations", icon: Lightbulb },
    { label: "Résolus", value: "Suivis", trend: "Historique conservé", icon: Check },
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
      ? { ...tab, label: page === "purchases" ? "Bons d’achat" : "Bons de livraison" }
      : tab,
  );

const documentTypeForTab = (tab: DocType, page: "purchases" | "sales") => {
  if (tab === "quotes") return "Devis";
  if (tab === "orders") return "Bon de commande";
  if (tab === "delivery") return page === "purchases" ? "Bon d’achat" : "Bon de livraison";
  if (tab === "invoices") return "Facture";
  return "";
};

const libraryTabs: { value: LibraryCategory; label: string; icon: LucideIcon }[] = [
  { value: "all", label: "Tous", icon: Files },
  { value: "invoices", label: "Factures", icon: ReceiptText },
  { value: "quotes", label: "Devis", icon: FileText },
  { value: "orders", label: "Commandes", icon: ClipboardList },
  { value: "delivery", label: "BL / Bons d’achat", icon: Truck },
  { value: "returns", label: "Retours", icon: ArrowDownRight },
];

const DEFAULT_COMPANY: CompanySettings = {
  name: "Génie Système Réseau",
  logoDataUrl: "/example-gsr-logo.svg",
  defaultTaxRate: 0,
  activityLine1: "Vente matériel informatique, bureautiques & consommable",
  activityLine2: "Installation réseau informatique & téléphonique, conception logiciel & site Web",
  rc: "15/00-5214185/A/16",
  taxArticle: "15018236031",
  nif: "198306340045040",
  rib: "00500152400242521092",
  bank: "BDL AGENCE BEJAIA PLAINE 152 CITE TOBBAI",
  address: "Cité route Azib Ahmed, Izi Ouzou",
  city: "Béjaïa",
  phone: "0772 023 970 / 0559 030 467",
  feedbackEnabled: true,
};
const COMPANY_STORAGE_KEY = "axxam-company-settings-v2";
const COMPANY_CHANGE_EVENT = "axxam-company-settings-change";
const isSafeImageSource = (value: string) => value.startsWith("data:image/") || /^\/[a-zA-Z0-9]/.test(value);
const cleanCompanyValue = (value: unknown, fallback: string, maximum = 160) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, maximum) : fallback;
const readUploadedImage = (file: File, maximumMegabytes = 1.5) => new Promise<string>((resolve, reject) => {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    reject(new Error("Choisissez une image PNG, JPG ou WebP."));
    return;
  }
  if (file.size > maximumMegabytes * 1024 * 1024) {
    reject(new Error(`L’image doit peser moins de ${maximumMegabytes} Mo.`));
    return;
  }
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === "string"
    ? resolve(reader.result)
    : reject(new Error("Impossible de lire cette image."));
  reader.onerror = () => reject(new Error("Impossible de lire cette image."));
  reader.readAsDataURL(file);
});

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
      logoDataUrl: stored.logoDataUrl === ""
        ? ""
        : typeof stored.logoDataUrl === "string" && isSafeImageSource(stored.logoDataUrl)
          ? stored.logoDataUrl
          : DEFAULT_COMPANY.logoDataUrl,
      defaultTaxRate: typeof stored.defaultTaxRate === "number" && Number.isFinite(stored.defaultTaxRate)
        ? Math.min(100, Math.max(0, stored.defaultTaxRate))
        : DEFAULT_COMPANY.defaultTaxRate,
      activityLine1: cleanCompanyValue(stored.activityLine1, DEFAULT_COMPANY.activityLine1),
      activityLine2: cleanCompanyValue(stored.activityLine2, DEFAULT_COMPANY.activityLine2),
      rc: cleanCompanyValue(stored.rc, DEFAULT_COMPANY.rc, 60),
      taxArticle: cleanCompanyValue(stored.taxArticle, DEFAULT_COMPANY.taxArticle, 60),
      nif: cleanCompanyValue(stored.nif, DEFAULT_COMPANY.nif, 60),
      rib: cleanCompanyValue(stored.rib, DEFAULT_COMPANY.rib, 80),
      bank: cleanCompanyValue(stored.bank, DEFAULT_COMPANY.bank),
      address: cleanCompanyValue(stored.address, DEFAULT_COMPANY.address),
      city: cleanCompanyValue(stored.city, DEFAULT_COMPANY.city, 80),
      phone: cleanCompanyValue(stored.phone, DEFAULT_COMPANY.phone, 80),
      feedbackEnabled: stored.feedbackEnabled !== false,
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
    logoDataUrl: nextSettings.logoDataUrl === "" || isSafeImageSource(nextSettings.logoDataUrl) ? nextSettings.logoDataUrl : DEFAULT_COMPANY.logoDataUrl,
    defaultTaxRate: Math.min(100, Math.max(0, Number(nextSettings.defaultTaxRate) || 0)),
    activityLine1: cleanCompanyValue(nextSettings.activityLine1, DEFAULT_COMPANY.activityLine1),
    activityLine2: cleanCompanyValue(nextSettings.activityLine2, DEFAULT_COMPANY.activityLine2),
    rc: cleanCompanyValue(nextSettings.rc, DEFAULT_COMPANY.rc, 60),
    taxArticle: cleanCompanyValue(nextSettings.taxArticle, DEFAULT_COMPANY.taxArticle, 60),
    nif: cleanCompanyValue(nextSettings.nif, DEFAULT_COMPANY.nif, 60),
    rib: cleanCompanyValue(nextSettings.rib, DEFAULT_COMPANY.rib, 80),
    bank: cleanCompanyValue(nextSettings.bank, DEFAULT_COMPANY.bank),
    address: cleanCompanyValue(nextSettings.address, DEFAULT_COMPANY.address),
    city: cleanCompanyValue(nextSettings.city, DEFAULT_COMPANY.city, 80),
    phone: cleanCompanyValue(nextSettings.phone, DEFAULT_COMPANY.phone, 80),
    feedbackEnabled: nextSettings.feedbackEnabled !== false,
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

const legacyCategoryTreeForArticles = (articles: ArticleRecord[]): unknown[] => {
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

const categoryTreeForArticles = (articles: ArticleRecord[]): CategoryTree[] => {
  type FourthLevels = Set<string>;
  type ThirdLevels = Map<string, FourthLevels>;
  type Subcategories = Map<string, ThirdLevels>;
  const categories = new Map<string, Subcategories>();
  const ensureCategory = (name: string) => {
    const value = categories.get(name) ?? new Map<string, ThirdLevels>();
    categories.set(name, value);
    return value;
  };
  const ensureSubcategory = (category: string, name: string) => {
    const children = ensureCategory(category);
    const value = children.get(name) ?? new Map<string, FourthLevels>();
    children.set(name, value);
    return value;
  };
  const ensureThirdLevel = (category: string, subcategory: string, name: string) => {
    const children = ensureSubcategory(category, subcategory);
    const value = children.get(name) ?? new Set<string>();
    children.set(name, value);
    return value;
  };
  for (const article of articles) {
    const category = article.category.trim() || "Non classée";
    const subcategory = article.subcategory.trim() || "Sans sous-catégorie";
    const thirdLevel = article.subsubcategory.trim() || "Sans sous-sous-catégorie";
    const fourthLevels = ensureThirdLevel(category, subcategory, thirdLevel);
    if (article.subsubsubcategory.trim()) fourthLevels.add(article.subsubsubcategory.trim());
  }
  return [...categories.entries()].map(([name, subcategories]) => ({
    name,
    subcategories: [...subcategories.entries()].map(([subcategory, thirdLevels]) => ({
      name: subcategory,
      subcategories: [...thirdLevels.entries()].map(([thirdLevel, fourthLevels]) => ({
        name: thirdLevel,
        subcategories: [...fourthLevels].sort((left, right) => left.localeCompare(right, "fr")),
      })).sort((left, right) => left.name.localeCompare(right.name, "fr")),
    })).sort((left, right) => left.name.localeCompare(right.name, "fr")),
  })).sort((left, right) => left.name.localeCompare(right.name, "fr"));
};

const formatDa = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)} DA`;

const formatDocumentDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const formatPrintDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

const frenchUnderHundred = (value: number): string => {
  const small = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
  if (value <= 16) return small[value];
  if (value < 20) return `dix-${small[value - 10]}`;
  if (value < 70) {
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
    const ten = Math.floor(value / 10);
    const unit = value % 10;
    return unit === 0 ? tens[ten] : unit === 1 ? `${tens[ten]} et un` : `${tens[ten]}-${small[unit]}`;
  }
  if (value < 80) return value === 71 ? "soixante et onze" : `soixante-${frenchUnderHundred(value - 60)}`;
  if (value === 80) return "quatre-vingts";
  return `quatre-vingt-${frenchUnderHundred(value - 80)}`;
};

const frenchUnderThousand = (value: number, followedByScale = false): string => {
  if (value < 100) return frenchUnderHundred(value);
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  const prefix = hundreds === 1 ? "cent" : `${frenchUnderHundred(hundreds)} cent`;
  if (remainder) return `${prefix} ${frenchUnderHundred(remainder)}`;
  return hundreds > 1 && !followedByScale ? `${prefix}s` : prefix;
};

const amountInFrenchWords = (amount: number) => {
  let value = Math.max(0, Math.round(amount));
  if (!value) return "Zéro dinar";
  const groups: string[] = [];
  const scales = [
    { value: 1_000_000_000, singular: "milliard", plural: "milliards" },
    { value: 1_000_000, singular: "million", plural: "millions" },
    { value: 1_000, singular: "mille", plural: "mille" },
  ];
  for (const scale of scales) {
    const count = Math.floor(value / scale.value);
    if (!count) continue;
    value %= scale.value;
    const countText = scale.value === 1_000 && count === 1 ? "" : frenchUnderThousand(count, true);
    groups.push(`${countText}${countText ? " " : ""}${count > 1 ? scale.plural : scale.singular}`);
  }
  if (value) groups.push(frenchUnderThousand(value));
  const words = groups.join(" ");
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} dinars`;
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
    ? "Bon d’achat"
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
  phone: party.phone || "—",
  contact: party.contact_phone || "—",
  email: party.email || "E-mail non renseigné",
  contactName: party.contact_name || undefined,
  address: party.address || undefined,
  city: party.city || undefined,
  headOffice: party.head_office || undefined,
  category: party.category || undefined,
  clientCategory: party.client_category || "",
  nif: party.nif || undefined,
  nis: party.nis || undefined,
  rc: party.rc || undefined,
  taxArticle: party.tax_article || undefined,
  rib: party.rib || undefined,
  bank: party.bank || undefined,
  note: party.note || undefined,
  imageUrl: party.image_url || undefined,
  contactStatus: party.contact_status || "Divers",
  isBlocked: Boolean(party.is_blocked),
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
  phone: party.phone || "—",
  contact: party.contact_phone || "—",
  contactName: party.contact_name || undefined,
  email: party.email || undefined,
  address: party.address || undefined,
  city: party.city || undefined,
  headOffice: party.head_office || undefined,
  nif: party.nif || undefined,
  nis: party.nis || undefined,
  rc: party.rc || undefined,
  taxArticle: party.tax_article || undefined,
  rib: party.rib || undefined,
  bank: party.bank || undefined,
  note: party.note || undefined,
  imageUrl: party.image_url || undefined,
  contactStatus: party.contact_status || "Divers",
  isBlocked: Boolean(party.is_blocked),
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
  imageUrl = "",
}: {
  name: string;
  tone: string;
  kind: "client" | "supplier";
  imageUrl?: string;
}) {
  const normalized = normalizeLabel(name);
  let Icon: LucideIcon = kind === "client" ? Building2 : Boxes;

  if (imageUrl && isSafeImageSource(imageUrl)) {
    // Locally uploaded data URLs must remain untouched by an external image loader.
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="entity-logo entity-photo" src={imageUrl} alt={name} loading="lazy" />;
  }

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
  else if (normalized.includes("livraison") || normalized.includes("reception") || normalized.includes("achat")) Icon = Truck;
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
  const safeImage = article.image_url && isSafeImageSource(article.image_url)
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

/* Legacy browser-only access gate.
function AccessGateLegacy({ company, onUnlocked }: { company: CompanySettings; onUnlocked: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <main className="access-gate">
      <form
        className="access-gate-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (password !== company.accessPassword) {
            setError("Mot de passe incorrect. Réessayez.");
            setPassword("");
            return;
          }
          setError("");
          onUnlocked();
        }}
      >
        <div className="access-gate-brand">
          <CompanyLogo company={company} className="access-gate-logo" />
          <span>{company.name}</span>
        </div>
        <div className="access-gate-heading">
          <span className="access-gate-icon"><Settings2 size={22} /></span>
          <h1>Accès à Commercial</h1>
          <p>Saisissez le mot de passe de l’entreprise pour ouvrir l’application.</p>
        </div>
        <label className="access-gate-field" htmlFor="app-access-password">
          Mot de passe
          <input
            id="app-access-password"
            autoFocus
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => { setPassword(event.target.value); setError(""); }}
            placeholder="Votre mot de passe"
            aria-describedby={error ? "app-access-error" : undefined}
          />
        </label>
        {error && <p className="access-gate-error" id="app-access-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button access-gate-submit">Ouvrir l’application</button>
        <small>Le mot de passe peut être modifié dans Paramètres après connexion.</small>
      </form>
    </main>
  );
}

*/

function AccessGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const creating = mode === "sign-up";
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, password }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de vous connecter.");
      setPassword("");
      onUnlocked();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de vous connecter.");
    } finally { setSubmitting(false); }
  };
  return <main className="access-gate"><form className="access-gate-card" onSubmit={submit}>
    <div className="access-gate-brand"><span className="brand-mark"><span /></span><span>Commercial</span></div>
    <div className="access-gate-heading"><span className="access-gate-icon"><Settings2 size={22} /></span><h1>{creating ? "Créer un compte" : "Connexion"}</h1><p>{creating ? "Choisissez un mot de passe : une nouvelle base vide sera créée pour ce compte." : "Saisissez le mot de passe de votre compte pour ouvrir sa base."}</p></div>
    <label className="access-gate-field" htmlFor="app-access-password">Mot de passe<input id="app-access-password" autoFocus required minLength={8} maxLength={256} autoComplete={creating ? "new-password" : "current-password"} type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="8 caractères minimum" aria-describedby={error ? "app-access-error" : undefined} /></label>
    {error && <p className="access-gate-error" id="app-access-error" role="alert">{error}</p>}
    <button type="submit" className="primary-button access-gate-submit" disabled={submitting}>{submitting ? "Patientez…" : creating ? "Créer le compte" : "Se connecter"}</button>
    <button type="button" className="text-button" onClick={() => { setMode(creating ? "sign-in" : "sign-up"); setPassword(""); setError(""); }} disabled={submitting}>{creating ? "J’ai déjà un compte" : "Créer un compte"}</button>
  </form></main>;
}

function StatusBadge({ label, tone = "gray" }: { label: string; tone?: string }) {
  return <span className={`status-badge status-${tone}`}>{label}</span>;
}

function DocumentTypePickerModal({
  direction,
  onClose,
  onSelect,
}: {
  direction: "purchases" | "sales";
  onClose: () => void;
  onSelect: (documentType: string) => void;
}) {
  const options = direction === "purchases"
    ? [
        { type: "Bon de commande", code: "BC-A", description: "Commander auprès du fournisseur" },
        { type: "Bon d’achat", code: "BA", description: "Enregistrer les articles achetés" },
        { type: "Facture", code: "FAC-A", description: "Comptabiliser la facture d’achat" },
      ]
    : [
        { type: "Devis", code: "DEV-V", description: "Préparer une proposition commerciale" },
        { type: "Bon de commande", code: "BC-V", description: "Confirmer la commande du client" },
        { type: "Bon de livraison", code: "BL", description: "Sortir et livrer les articles" },
        { type: "Facture", code: "FAC-V", description: "Facturer la vente" },
      ];
  const [selected, setSelected] = useState(options[0].type);
  return (
    <div className="modal-backdrop premium-picker-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card document-type-picker-modal" role="dialog" aria-modal="true" aria-labelledby="document-type-picker-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><h2 id="document-type-picker-title">Nouveau document {direction === "purchases" ? "d’achat" : "de vente"}</h2><p>Choisissez le flux à créer avant de renseigner les lignes.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
        <section className="document-type-available"><span>Disponible <b>{options.length}</b> types de documents</span><div>{options.map((option) => <button type="button" key={option.type} className={selected === option.type ? "active" : ""} onClick={() => setSelected(option.type)} aria-pressed={selected === option.type}><DocumentLogo type={option.type} tone={selected === option.type ? "blue" : "gray"} /><strong>{option.code}</strong><span>{option.type}</span>{selected === option.type && <Check size={14} />}</button>)}</div></section>
        <div className="document-type-selection"><small>Type sélectionné</small><strong>{selected}</strong><p>{options.find((option) => option.type === selected)?.description}</p></div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button type="button" className="primary-button" onClick={() => onSelect(selected)}>Continuer <ArrowRight size={16} /></button></div>
      </div>
    </div>
  );
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
  className = "",
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
  className?: string;
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
    <section className={`table-card view-${viewMode} ${className}`.trim()}>
      <div className={`table-header ${tabs ? "table-header-with-tabs" : ""}`.trim()}>
        <div className="table-title">
          <h1>{title}</h1>
          <span>{count}</span>
        </div>
        {tabs && activeTab && setActiveTab && (
          <div className="document-tabs" aria-label="Types de documents">
            {tabs.map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" className={activeTab === value ? "active" : ""} onClick={() => setActiveTab(value)}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
        )}
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
      <div className="table-scroll">{children}</div>
    </section>
  );
}

function EmptyRow({ columns }: { columns: number }) {
  return <tr><td className="empty-row" colSpan={columns}>Aucun résultat pour ces critères.</td></tr>;
}

function LegacyClientProfileCard({
  client,
  notify,
  onOpen,
  onEdit,
  onBlock,
  onSettle,
  onDelete,
}: {
  client: ClientRecord;
  notify: (message: string) => void;
  onOpen: (client: ClientRecord) => void;
  onEdit: (client: ClientRecord) => void;
  onBlock: (client: ClientRecord) => void;
  onSettle: (client: ClientRecord) => void;
  onDelete: (name: string) => void;
}) {
  return <article className="client-profile-card">
    <div className="client-profile-card-photo"><EntityLogo name={client.name} tone={client.color} kind="client" imageUrl={client.imageUrl} /></div>
    <div className="client-profile-card-content">
      <div className="client-profile-card-name"><h2>{client.name}</h2><BadgeCheck size={20} aria-label="Client vérifié" /></div>
      <p>{client.clientCategory || client.email || "Client enregistré"}</p>
      <div className="client-profile-card-actions">
        <span><Users size={19} /><strong>{client.billed}</strong></span>
        <span><WalletCards size={19} /><strong>{client.balance}</strong></span>
        <button type="button" onClick={() => onOpen(client)} aria-label={`Ouvrir ${client.name}`}>Ouvrir <Eye size={18} /></button>
      </div>
    </div>
    <div className="client-profile-card-menu"><RowActions label={client.name} notify={notify} onOpen={() => onOpen(client)} onEdit={() => onEdit(client)} extraActions={[{ label: client.balance === "0 DA" ? "Enregistrer une avance" : "Encaisser", icon: Banknote, onClick: () => onSettle(client) }, { label: client.isBlocked ? "Débloquer le client" : "Bloquer le client", icon: Ban, onClick: () => onBlock(client) }]} onDelete={() => onDelete(client.name)} /></div>
  </article>;
}

function ClientProfileCard({
  client,
  notify,
  onOpen,
  onEdit,
  onBlock,
  onSettle,
  onDelete,
}: {
  client: ClientRecord;
  notify: (message: string) => void;
  onOpen: (client: ClientRecord) => void;
  onEdit: (client: ClientRecord) => void;
  onBlock: (client: ClientRecord) => void;
  onSettle: (client: ClientRecord) => void;
  onDelete: (name: string) => void;
}) {
  const contact = client.contactName || client.contact || "Non renseigne";
  const address = client.address || client.city || client.headOffice || "Adresse non renseignee";
  const category = client.clientCategory || client.category || "Sans categorie";
  const bank = client.bank || "Banque non renseignee";
  return <article className="client-profile-card">
    <div className="client-profile-card-menu"><RowActions label={client.name} notify={notify} onOpen={() => onOpen(client)} onEdit={() => onEdit(client)} extraActions={[{ label: client.balance === "0 DA" ? "Enregistrer une avance" : "Encaisser", icon: Banknote, onClick: () => onSettle(client) }, { label: client.isBlocked ? "Debloquer le client" : "Bloquer le client", icon: Ban, onClick: () => onBlock(client) }]} onDelete={() => onDelete(client.name)} /></div>
    <div className="client-profile-card-header">
      <div className="client-profile-card-photo"><EntityLogo name={client.name} tone={client.color} kind="client" imageUrl={client.imageUrl} /></div>
      <div className="client-profile-card-identity">
        <span className="client-profile-card-eyebrow">Client</span>
        <div className="client-profile-card-name"><h2>{client.name}</h2><BadgeCheck size={17} aria-label="Client verifie" /></div>
        <span className={`client-profile-card-status ${client.isBlocked ? "blocked" : ""}`}>{client.isBlocked ? "Bloque" : client.status || "Actif"}</span>
      </div>
    </div>
    <div className="client-profile-card-summary" aria-label={`Montants de ${client.name}`}>
      <div><small>Total facture</small><strong>{client.billed}</strong></div>
      <div><small>Regle</small><strong>{client.paid}</strong></div>
      <div><small>Credit</small><strong>{client.credit}</strong></div>
      <div className="client-profile-card-balance"><small>Solde</small><strong>{client.balance}</strong></div>
    </div>
    <div className="client-profile-card-details">
      <div><Phone size={14} /><span><small>Telephone</small><strong>{client.phone || "Non renseigne"}</strong></span></div>
      <div><ContactRound size={14} /><span><small>Contact</small><strong>{contact}</strong></span></div>
      <div><Mail size={14} /><span><small>E-mail</small><strong>{client.email || "Non renseigne"}</strong></span></div>
      <div><MapPin size={14} /><span><small>Adresse</small><strong>{address}</strong></span></div>
      <div><Building2 size={14} /><span><small>Categorie</small><strong>{category}</strong></span></div>
      <div><WalletCards size={14} /><span><small>Banque</small><strong>{bank}</strong></span></div>
    </div>
    <div className="client-profile-card-footer"><span>{client.activity || "Aucune activite recente"}</span><button type="button" onClick={() => onOpen(client)} aria-label={`Ouvrir ${client.name}`}>Ouvrir <Eye size={16} /></button></div>
  </article>;
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
  onBlock,
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
  onBlock: (client: ClientRecord) => void;
  onSettle: (client: ClientRecord) => void;
}) {
  const filtered = rows.filter((client) => {
    const matchesSearch = `${client.name} ${client.phone} ${client.contact} ${client.email} ${client.contactName ?? ""} ${client.contactStatus ?? ""} ${client.nif ?? ""} ${client.nis ?? ""} ${client.rc ?? ""} ${client.taxArticle ?? ""} ${client.rib ?? ""} ${client.bank ?? ""} ${client.note ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!filterActive || client.balance !== "0 DA");
  });

  return (
    <TableCard title="Tous les clients" count={`${filtered.length} clients`} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode}>
      {viewMode === "grid" ? <div className="client-profile-grid">{filtered.map((client) => <ClientProfileCard key={client.name} client={client} notify={notify} onOpen={onOpen} onEdit={onEdit} onBlock={onBlock} onSettle={onSettle} onDelete={onDelete} />)}{!filtered.length && <p className="client-profile-empty">Aucun résultat pour ces critères.</p>}</div> : <table className="parties-table clients-table">
        <thead><tr><th>Client</th><th>Contact</th><th>Statut du contact</th><th>Total facturé</th><th>Solde</th><th>Compte</th><th>Dernière activité</th><th /></tr></thead>
        <tbody>
          {filtered.map((client) => (
            <tr key={client.name}>
              <td><div className="identity-cell"><EntityLogo name={client.name} tone={client.color} kind="client" imageUrl={client.imageUrl} /><div><strong>{client.name}</strong><small>{client.email}</small><small>{client.clientCategory ? `Catégorie : ${client.clientCategory}` : "Sans catégorie client"}</small></div></div></td>
              <td>{client.contactName ? <><strong>{client.contactName}</strong><small>{client.contact} · {client.phone}</small></> : <><span>{client.phone}</span><small>Contact : {client.contact}</small></>}</td>
              <td><StatusBadge label={client.contactStatus || "Divers"} tone={client.contactStatus === "Directeur" ? "blue" : client.contactStatus === "Administration" ? "green" : "gray"} /></td>
              <td className="number">{client.billed}</td>
              <td className="number">{client.balance}</td>
              <td><StatusBadge label={client.isBlocked ? "Bloqué" : client.status} tone={client.isBlocked ? "red" : client.balance === "0 DA" ? "green" : "orange"} /></td>
              <td>{client.activity}</td>
              <td className="party-row-cell">
                <div className="party-row-actions">
                  <button
                    className="cash-action"
                    type="button"
                    onClick={() => onSettle(client)}
                    title={client.balance === "0 DA" ? `Enregistrer une avance pour ${client.name}` : `Encaisser un paiement de ${client.name}`}
                  >
                    <Banknote size={16} /><span>Encaisser</span>
                  </button>
                  <RowActions label={client.name} notify={notify} onOpen={() => onOpen(client)} onEdit={() => onEdit(client)} extraActions={[{ label: client.isBlocked ? "Débloquer le client" : "Bloquer le client", icon: Ban, onClick: () => onBlock(client) }]} onDelete={() => onDelete(client.name)} />
                </div>
              </td>
            </tr>
          ))}
          {!filtered.length && <EmptyRow columns={8} />}
        </tbody>
      </table>}
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
  onBlock,
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
  onBlock: (supplier: SupplierRecord) => void;
  onSettle: (supplier: SupplierRecord) => void;
}) {
  const filtered = rows.filter((supplier) => {
    const matchesSearch = `${supplier.name} ${supplier.phone} ${supplier.contact} ${supplier.email ?? ""} ${supplier.category} ${supplier.contactStatus ?? ""} ${supplier.nif ?? ""} ${supplier.nis ?? ""} ${supplier.rc ?? ""} ${supplier.taxArticle ?? ""} ${supplier.rib ?? ""} ${supplier.bank ?? ""} ${supplier.note ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!filterActive || supplier.balance !== "0 DA");
  });

  return (
    <TableCard title="Tous les fournisseurs" count={`${filtered.length} fournisseurs`} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode}>
      <table className="parties-table suppliers-table">
        <thead><tr><th>Fournisseur</th><th>Contact</th><th>Statut du contact</th><th>Catégorie</th><th>Total achats</th><th>Solde</th><th>Compte</th><th /></tr></thead>
        <tbody>
          {filtered.map((supplier) => (
            <tr key={supplier.name}>
              <td><div className="identity-cell"><EntityLogo name={supplier.name} tone={supplier.color} kind="supplier" imageUrl={supplier.imageUrl} /><div><strong>{supplier.name}</strong><small>{supplier.email || "E-mail non renseigné"}</small></div></div></td>
              <td>{supplier.contactName ? <><strong>{supplier.contactName}</strong><small>{supplier.contact} · {supplier.phone}</small></> : <><span>{supplier.phone}</span><small>Contact : {supplier.contact}</small></>}</td>
              <td><StatusBadge label={supplier.contactStatus || "Divers"} tone={supplier.contactStatus === "Directeur" ? "blue" : supplier.contactStatus === "Administration" ? "green" : "gray"} /></td>
              <td><span className="soft-label">{supplier.category}</span></td>
              <td className="number">{supplier.purchases}</td>
              <td className="number">{supplier.balance}</td>
              <td><StatusBadge label={supplier.isBlocked ? "Bloqué" : supplier.status} tone={supplier.isBlocked ? "red" : supplier.balance === "0 DA" ? "green" : "orange"} /></td>
              <td className="party-row-cell">
                <div className="party-row-actions">
                  <button
                    className="cash-action"
                    type="button"
                    onClick={() => onSettle(supplier)}
                    title={supplier.balance === "0 DA" ? `Enregistrer une avance pour ${supplier.name}` : `Payer ${supplier.name}`}
                  >
                    <Banknote size={16} /><span>Payer</span>
                  </button>
                  <RowActions label={supplier.name} notify={notify} onOpen={() => onOpen(supplier)} onEdit={() => onEdit(supplier)} extraActions={[{ label: supplier.isBlocked ? "Débloquer le fournisseur" : "Bloquer le fournisseur", icon: Ban, onClick: () => onBlock(supplier) }]} onDelete={() => onDelete(supplier.name)} />
                </div>
              </td>
            </tr>
          ))}
          {!filtered.length && <EmptyRow columns={8} />}
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

const openDeliveryNotePdf = async (company: CompanySettings, context: DocumentContext) => {
  const outputWindow = window.open("", "_blank");
  if (!outputWindow) throw new Error("Autorisez l’ouverture de la fenêtre PDF puis réessayez.");

  try {
    const response = await fetch("/print-templates/bon-livraison-gsr.pdf");
    if (!response.ok) throw new Error("Le modèle du bon de livraison est introuvable.");

    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const pdf = await PDFDocument.load(await response.arrayBuffer());
    const page = pdf.getPages()[0];
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const white = rgb(1, 1, 1);
    const ink = rgb(0.1, 0.1, 0.1);
    const grid = rgb(0.74, 0.74, 0.74);
    const { document: record, direction, partyAddress = "" } = context;
    const lines = documentLinesFor(record);
    const printableLines = lines.length ? lines : [{
      article_id: 0,
      designation: record.summary || record.type,
      description: "",
      unit: "",
      quantity: 1,
      unit_price: record.subtotal ?? numberFromDa(record.amount),
      discount_percent: 0,
      tax_rate: 0,
      line_total: record.subtotal ?? numberFromDa(record.amount),
    }];
    const subtotal = record.subtotal ?? printableLines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);
    const discountAmount = record.discountAmount ?? printableLines.reduce((sum, line) => sum + line.quantity * line.unit_price * line.discount_percent / 100, 0);
    const taxAmount = record.taxAmount ?? printableLines.reduce((sum, line) => {
      const net = line.quantity * line.unit_price * (1 - line.discount_percent / 100);
      return sum + net * line.tax_rate / 100;
    }, 0);
    const total = record.total ?? subtotal - discountAmount + taxAmount;
    const amount = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const reference = record.number;
    const partyCode = record.partyId
      ? `${direction === "purchases" ? "FR" : "CL"}${String(record.partyId).padStart(4, "0")}`
      : "—";
    const lineHeight = 18.3;
    const tableTop = 338;
    const rowCount = Math.max(1, printableLines.length);
    const tableBottom = tableTop - rowCount * lineHeight;
    const contentBottom = Math.max(34, tableBottom - 90);
    const text = (value: string) => value
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\u2026/g, "...")
      .replace(/\u2019/g, "'")
      .replace(/[\u00a0\u202f]/g, " ")
      .replace(/\u0153/g, "oe")
      .replace(/\u0152/g, "OE");
    const fit = (value: string, x: number, y: number, maxWidth: number, size: number, font = regular, align: "left" | "right" = "left") => {
      const valueToDraw = text(value || "-");
      let fontSize = size;
      while (fontSize > 5.5 && font.widthOfTextAtSize(valueToDraw, fontSize) > maxWidth) fontSize -= 0.25;
      const width = font.widthOfTextAtSize(valueToDraw, fontSize);
      page.drawText(valueToDraw, { x: align === "right" ? x - width : x, y, size: fontSize, font, color: ink });
    };
    const clear = (x: number, y: number, width: number, height: number) => page.drawRectangle({ x, y, width, height, color: white });

    // The customer provided PDF remains the visual template. Only dynamic fields are masked and redrawn.
    clear(234, 388, 147, 54);
    fit(partyCode, 237, 434, 137, 9.5, regular);
    fit(record.party, 237, 415, 137, 9.5, regular);
    fit(partyAddress, 237, 396, 137, 9.2, regular);
    clear(10, 357, 135, 13);
    fit(reference, 11, 360, 130, 7.8, bold);
    clear(10, 400, 130, 30);
    fit("BON DE LIVRAISON", 12, 414, 138, 9.8, bold);
    clear(9, contentBottom, 402, tableTop - contentBottom);

    const columns = [9, 61, 182, 265, 330, 411];
    page.drawRectangle({ x: 9, y: tableBottom, width: 402, height: tableTop - tableBottom, color: white, borderColor: grid, borderWidth: 0.45 });
    for (let index = 1; index < columns.length - 1; index += 1) {
      page.drawLine({ start: { x: columns[index], y: tableBottom }, end: { x: columns[index], y: tableTop }, thickness: 0.35, color: grid });
    }
    for (let row = 1; row < rowCount; row += 1) {
      const y = tableTop - row * lineHeight;
      page.drawLine({ start: { x: 9, y }, end: { x: 411, y }, thickness: 0.35, color: grid });
    }
    printableLines.forEach((line, index) => {
      const baseline = tableTop - index * lineHeight - 12.2;
      const lineSubtotal = line.quantity * line.unit_price * (1 - line.discount_percent / 100);
      fit(line.article_sku || `ART${String(line.article_id || index + 1).padStart(4, "0")}`, 12, baseline, 46, 7.8, regular);
      fit(line.designation, 64, baseline, 114, 8.3, regular);
      fit(String(line.quantity), 260, baseline, 75, 8.3, bold, "right");
      fit(amount.format(line.unit_price), 326, baseline, 58, 8.3, bold, "right");
      fit(amount.format(lineSubtotal), 407, baseline, 74, 8.3, bold, "right");
    });

    const totalY = tableBottom - 20;
    // Efface la signature imprimée du gabarit historique avant de redessiner
    // la ligne dynamique, notamment quand le document ne contient qu'une ligne.
    clear(220, 210, 190, 55);
    fit("Total Net à payer", 252, totalY - 1, 88, 8.1, bold);
    fit(`${amount.format(total)} DA`, 402, totalY - 1, 84, 8.1, regular, "right");
    const signatureY = totalY - 42;
    fit("Le Gérant :", 115, signatureY, 70, 8, bold);
    fit("Bejaia le ................", 302, signatureY, 105, 8, regular);

    const bytes = await pdf.save();
    const pdfBytes = new Uint8Array(bytes.byteLength);
    pdfBytes.set(bytes);
    const url = URL.createObjectURL(new Blob([pdfBytes.buffer], { type: "application/pdf" }));
    outputWindow.location.replace(url);
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    outputWindow.close();
    throw error;
  }
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
  const [preparingTemplate, setPreparingTemplate] = useState(false);
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
  const displayedDate = record.rawDate ? formatPrintDate(record.rawDate) : record.date;
  const partyLabel = direction === "purchases" ? "Fournisseur" : "Client";
  const partyCode = record.partyId
    ? `${direction === "purchases" ? "FR" : "CL"}${String(record.partyId).padStart(4, "0")}`
    : "—";
  const printableType = record.type === "Bon de livraison"
    ? "Bon De Livraison"
    : record.type === "Bon d’achat"
      ? "Bon De Réception"
      : record.type === "Bon de commande"
        ? "Bon De Commande"
        : record.type === "Bon de retour"
          ? "Bon De Retour"
          : record.type;
  const formatPrintAmount = (value: number) =>
    new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const printDocument = async () => {
    if (record.type !== "Bon de livraison") {
      window.print();
      return;
    }
    setPreparingTemplate(true);
    try {
      await openDeliveryNotePdf(company, context);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Impossible de préparer le bon de livraison.");
    } finally {
      setPreparingTemplate(false);
    }
  };

  return createPortal(
    <div className="print-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Aperçu de ${record.number}`}>
      <div className="print-preview-toolbar">
        <div><strong>Aperçu avant impression</strong><span>{record.type} · {record.number}</span></div>
        <div>
          <button className="secondary-button" type="button" onClick={onClose}><X size={16} /> Fermer</button>
          <button className="primary-button" type="button" onClick={() => { void printDocument(); }} disabled={preparingTemplate}><Printer size={16} /> {preparingTemplate ? "Préparation PDF…" : "Imprimer"}</button>
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
          <p>{company.activityLine1}</p>
          <p>{company.activityLine2}</p>
          <div className="print-company-registration">
            <span>RC N° : {company.rc}</span>
            <span>Art. Imp : {company.taxArticle}</span>
            <span>NIF : {company.nif}</span>
          </div>
          <div className="print-company-registration">
            <span>RIB : {company.rib}</span>
            <span>{company.bank}</span>
          </div>
          <p className="print-company-address">Adresse : {company.address}</p>
          <strong className="print-company-phone">{company.phone}</strong>
        </div>
      </header>

      <div className="print-decorative-rule"><span /></div>

      <section className="print-document-heading">
        <div className="print-document-title">
          <h2>{printableType}</h2>
        </div>
        <strong className="print-due-label">Doit :</strong>
        <dl className="print-party-card">
          <div><dt>Code {partyLabel.toLowerCase()} :</dt><dd>{partyCode}</dd></div>
          <div><dt>{partyLabel} :</dt><dd>{record.party}</dd></div>
          <div><dt>Adresse :</dt><dd>{partyAddress || "—"}</dd></div>
        </dl>
      </section>

      <div className="print-document-number">{record.number}</div>

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
                <td>{line.article_sku || `ART${String(line.article_id || index + 1).padStart(4, "0")}`}</td>
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
          <strong>Le présent {printableType} est arrêté à la somme de :</strong>
          <p>{amountInFrenchWords(total)}</p>
        </div>
        <dl className="print-totals-card">
          <div className="print-grand-total"><dt>Total Net à payé</dt><dd>{formatPrintAmount(total)} DA</dd></div>
        </dl>
      </section>

      <section className="print-manager-signature">
        <div><span>Imprimé à {company.city} le :</span><strong>{displayedDate}</strong></div>
        <div><span>Le Gérant :</span><i /></div>
      </section>
      </article>
    </div>,
    document.body,
  );
}

function PartyBalanceHistoryChart({ rows }: { rows: PartyBalanceHistoryRecord[] }) {
  if (!rows.length) return <p className="party-history-message">Aucun mouvement de solde enregistré.</p>;
  const width = 720;
  const height = 190;
  const padding = 22;
  const maximum = Math.max(...rows.map((row) => row.balance), 1);
  const points = rows.map((row, index) => {
    const x = rows.length === 1 ? width / 2 : padding + index * (width - padding * 2) / (rows.length - 1);
    const y = height - padding - row.balance / maximum * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="balance-history-panel">
      <div className="balance-chart-summary"><span>Évolution du solde</span><strong>{formatDa(rows.at(-1)?.balance ?? 0)}</strong></div>
      <svg className="balance-history-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Évolution du solde du tiers">
        <defs><linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4f46e5" stopOpacity=".25" /><stop offset="1" stopColor="#4f46e5" stopOpacity="0" /></linearGradient></defs>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="balance-chart-axis" />
        <polygon points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`} fill="url(#balance-fill)" />
        <polyline points={points} className="balance-chart-line" />
        {points.split(" ").map((point, index) => {
          const [cx, cy] = point.split(",");
          return <circle key={rows[index].id} cx={cx} cy={cy} r="4" className={rows[index].delta >= 0 ? "balance-point-up" : "balance-point-down"}><title>{rows[index].label} · {formatDa(rows[index].balance)}</title></circle>;
        })}
      </svg>
      <div className="balance-event-list">
        {rows.slice().reverse().map((row) => (
          <div key={row.id}>
            <span className={`balance-event-icon ${row.delta >= 0 ? "up" : "down"}`}>{row.delta >= 0 ? <ArrowDownRight size={15} /> : <Banknote size={15} />}</span>
            <span><strong>{row.label}</strong><small>{formatDocumentDate(row.event_date)} · {row.reference}</small></span>
            <b className={row.delta >= 0 ? "due" : "paid"}>{row.delta >= 0 ? "+" : "−"}{formatDa(Math.abs(row.delta))}</b>
            <em>Solde {formatDa(row.balance)}</em>
          </div>
        ))}
      </div>
    </div>
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
  const [balanceHistory, setBalanceHistory] = useState<{ rows: PartyBalanceHistoryRecord[]; loading: boolean; error: string }>({ rows: [], loading: true, error: "" });
  const [balanceHistoryOpen, setBalanceHistoryOpen] = useState(false);
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

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetch(`/api/parties?history=balance&party_id=${party.id}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { history?: PartyBalanceHistoryRecord[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Impossible de charger l’historique du solde.");
        if (active) setBalanceHistory({ rows: payload.history ?? [], loading: false, error: "" });
      })
      .catch((error: Error) => {
        if (active && error.name !== "AbortError") setBalanceHistory({ rows: [], loading: false, error: error.message });
      });
    return () => { active = false; controller.abort(); };
  }, [party.id, paymentVersion]);

  return (
    <div className="modal-backdrop party-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card party-detail-panel" role="dialog" aria-modal="true" aria-labelledby="party-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header party-detail-header">
          <div className="party-detail-identity">
            <EntityLogo name={party.name} tone={party.color} kind={kind} imageUrl={party.imageUrl} />
            <div><h2 id="party-detail-title">{party.name}</h2><p>{kind === "client" ? "Fiche client complète" : "Fiche fournisseur complète"}</p></div>
            <StatusBadge label={party.isBlocked ? "Bloqué" : party.status} tone={party.isBlocked ? "red" : remaining > 0 ? "orange" : "green"} />
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
          <article><span>{kind === "client" ? "Montant encaissé" : "Montant payé"}</span><strong>{formatDa(paid)}</strong></article>
          <article className={remaining > 0 ? "balance-due" : ""}><span>Solde restant</span><strong>{formatDa(remaining)}</strong></article>
          <article className={credit > 0 ? "credit-available" : ""}><span>Crédit disponible</span><strong>{formatDa(credit)}</strong></article>
        </div>

        <div className="party-detail-body">
          <section className="party-information-card">
            <div className="party-section-title"><ContactRound size={17} /><div><h3>Informations générales</h3><p>Coordonnées, adresse et données fiscales</p></div></div>
            <dl className="party-info-grid">
              <div><dt>Téléphone</dt><dd>{party.phone || "—"}</dd></div>
              <div><dt>E-mail</dt><dd>{party.email === "E-mail non renseigné" ? "—" : party.email || "—"}</dd></div>
              <div><dt>Contact principal</dt><dd>{party.contactName || "—"}</dd></div>
              <div><dt>Téléphone du contact</dt><dd>{party.contact || "—"}</dd></div>
              <div><dt>Catégorie</dt><dd>{kind === "client" && "clientCategory" in party ? party.clientCategory || "—" : party.category || "—"}</dd></div>
              <div><dt>Statut du contact</dt><dd><StatusBadge label={party.contactStatus || "Divers"} tone={party.contactStatus === "Directeur" ? "blue" : party.contactStatus === "Administration" ? "green" : "gray"} /></dd></div>
              <div className="party-info-wide"><dt>Adresse</dt><dd>{party.address || "—"}</dd></div>
              {kind === "supplier" && <div className="party-info-wide"><dt>Siège social</dt><dd>{party.headOffice || "—"}</dd></div>}
              <div><dt>NIF</dt><dd>{party.nif || "—"}</dd></div>
              <div><dt>NIS</dt><dd>{party.nis || "—"}</dd></div>
              <div><dt>RC</dt><dd>{party.rc || "—"}</dd></div>
              <div><dt>N° article</dt><dd>{party.taxArticle || "—"}</dd></div>
              <div className="party-info-wide"><dt>RIB</dt><dd>{party.rib || "—"}</dd></div>
              <div className="party-info-wide"><dt>Banque</dt><dd>{party.bank || "—"}</dd></div>
              <div className="party-info-wide"><dt>Note</dt><dd>{party.note || "—"}</dd></div>
            </dl>
          </section>

          <section className="payment-history-card">
            <div className="party-section-title payment-history-heading">
              <button className={`balance-history-toggle ${balanceHistoryOpen ? "active" : ""}`} type="button" onClick={() => setBalanceHistoryOpen((value) => !value)} title="Afficher le graphe du solde" aria-label="Afficher le graphe du solde"><BarChart3 size={18} /></button>
              <Banknote size={17} /><div><h3>Historique des paiements</h3><p>{paymentRequest.rows.length} règlement{paymentRequest.rows.length === 1 ? "" : "s"} enregistré{paymentRequest.rows.length === 1 ? "" : "s"}</p></div>
            </div>
            {balanceHistoryOpen && (
              balanceHistory.loading ? <p className="party-history-message">Chargement du solde…</p>
                : balanceHistory.error ? <p className="party-history-message error">{balanceHistory.error}</p>
                  : <PartyBalanceHistoryChart rows={balanceHistory.rows} />
            )}
            <div className="payment-history-scroll" aria-live="polite">
              {paymentRequest.loading && <p className="party-history-message">Chargement de l’historique…</p>}
              {!paymentRequest.loading && paymentRequest.error && <p className="party-history-message error">{paymentRequest.error}</p>}
              {!paymentRequest.loading && !paymentRequest.error && !paymentRequest.rows.length && <p className="party-history-message">Aucun paiement enregistré pour ce tiers.</p>}
              {!paymentRequest.loading && !paymentRequest.error && paymentRequest.rows.length > 0 && (
                <table className="payment-history-table">
                  <thead><tr><th>Date</th><th>Type</th><th>Mode</th><th>Note</th><th>Ancien solde</th><th>Montant</th></tr></thead>
                  <tbody>{paymentRequest.rows.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDocumentDate(payment.payment_date)}</td>
                      <td><span className={`payment-direction payment-${payment.direction}`}>{payment.direction === "incoming" ? "Encaissement" : "Décaissement"}</span></td>
                      <td>{payment.method}</td>
                      <td>{payment.note || "—"}</td>
                      <td className="number">{payment.previous_balance == null ? "—" : formatDa(payment.previous_balance)}</td>
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

function ClientCategoryManagerModal({ categories, onClose, onChanged }: { categories: ClientCategoryRecord[]; onClose: () => void; onChanged: () => Promise<void> }) {
  const [rows, setRows] = useState(categories.map((category) => ({ ...category })));
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async (body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE") => {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/client-categories", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json() as { category?: ClientCategoryRecord; error?: string };
      if (!response.ok || !payload.category) throw new Error(payload.error || "Impossible de modifier la catégorie.");
      setRows((current) => method === "POST" ? [...current, payload.category as ClientCategoryRecord].sort((a, b) => a.name.localeCompare(b.name)) : method === "DELETE" ? current.filter((row) => row.id !== Number(body.id)) : current.map((row) => row.id === payload.category?.id ? payload.category as ClientCategoryRecord : row));
      setNewName("");
      await onChanged();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de modifier la catégorie."); } finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal-card compact-modal client-category-manager" role="dialog" aria-modal="true" aria-labelledby="client-category-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><h2 id="client-category-title">Catégories clients</h2><p>La liste est vide au départ : ajoutez uniquement vos propres catégories pour les tarifs de vente.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div><div className="inline-create-row"><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nouvelle catégorie" /><button type="button" className="primary-button" disabled={!newName.trim() || saving} onClick={() => void save({ name: newName.trim() }, "POST")}><Plus size={15} /> Ajouter</button></div><div className="client-category-list">{rows.map((row) => <div className="client-category-row" key={row.id}><input value={row.name} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item))} /><button type="button" className="secondary-button" disabled={saving || !row.name.trim()} onClick={() => void save({ id: row.id, name: row.name.trim() }, "PATCH")}><Save size={15} /> Enregistrer</button><button type="button" className="icon-button danger-text" disabled={saving} onClick={() => void save({ id: row.id }, "DELETE")} aria-label={`Supprimer ${row.name}`}><Trash2 size={16} /></button></div>)}</div>{!rows.length && <p className="client-category-empty">Aucune catégorie client. Utilisez « Ajouter » pour créer la première.</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Terminé</button></div></div></div>;
}

const BANK_OPTIONS = [
  { name: "BADR", logo: "BADR", color: "#16794b" },
  { name: "BEA", logo: "BEA", color: "#c0362c" },
  { name: "BDL", logo: "BDL", color: "#185a9d" },
  { name: "BNA", logo: "BNA", color: "#d15e18" },
  { name: "CPA", logo: "CPA", color: "#198f8a" },
  { name: "CNEP", logo: "CNEP", color: "#3f55a7" },
  { name: "CCP", logo: "CCP", color: "#d19a12" },
  { name: "BANQUE GENERALE", logo: "BG", color: "#7650af" },
  { name: "BNP PARIBAS", logo: "BNP", color: "#16836a" },
  { name: "SOCIETE GENERALE", logo: "SG", color: "#d33b3b" },
  { name: "BUNQUE GULF", logo: "BG", color: "#136b9e" },
  { name: "AUTRE", logo: "…", color: "#64748b" },
] as const;

function BankLogo({ bank }: { bank: typeof BANK_OPTIONS[number] }) {
  return <span className="bank-logo" style={{ backgroundColor: bank.color }} aria-hidden="true">{bank.logo}</span>;
}

function BankSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  const options = BANK_OPTIONS.filter((bank) => bank.name.toLocaleLowerCase("fr").includes(normalizedQuery));
  const selected = BANK_OPTIONS.find((bank) => bank.name === value);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div className="bank-select" ref={root}>
      <button type="button" className="bank-select-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setQuery(""); }}>
        {selected ? <BankLogo bank={selected} /> : <span className="bank-logo bank-logo-empty" aria-hidden="true"><Building2 size={14} /></span>}
        <span>{selected?.name || value || "Choisir une banque"}</span>
        <ChevronDown size={16} />
      </button>
      {open && <div className="bank-select-menu" role="listbox" aria-label="Banques disponibles">
        <label className="bank-select-search"><Search size={15} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une banque" aria-label="Rechercher une banque" /></label>
        <div className="bank-select-options">
          {options.map((bank) => <button type="button" role="option" aria-selected={bank.name === value} className={bank.name === value ? "selected" : ""} key={bank.name} onClick={() => { onChange(bank.name); setOpen(false); setQuery(""); }}><BankLogo bank={bank} /><span>{bank.name}</span>{bank.name === value && <Check size={16} />}</button>)}
          {!options.length && <span className="bank-select-empty">Aucune banque trouvée.</span>}
        </div>
      </div>}
    </div>
  );
}

function PartyEditorModal({ party, kind, clientCategories = [], onClose, onSaved }: { party: PartyRow; kind: "client" | "supplier"; clientCategories?: ClientCategoryRecord[]; onClose: () => void; onSaved: (party: ApiPartyRecord) => void }) {
  const [name, setName] = useState(party.name);
  const [phone, setPhone] = useState(party.phone === "—" ? "" : party.phone);
  const [contactPhone, setContactPhone] = useState(party.contact === "—" ? "" : party.contact);
  const [contactName, setContactName] = useState(party.contactName || "");
  const [email, setEmail] = useState(party.email === "E-mail non renseigné" ? "" : party.email || "");
  const [address, setAddress] = useState(party.address || "");
  const [headOffice, setHeadOffice] = useState(party.headOffice || "");
  const [category, setCategory] = useState(party.category || "");
  const [clientCategory, setClientCategory] = useState("clientCategory" in party ? party.clientCategory || "" : "");
  const [availableClientCategories, setAvailableClientCategories] = useState(clientCategories);
  const [nif, setNif] = useState(party.nif || "");
  const [nis, setNis] = useState(party.nis || "");
  const [rc, setRc] = useState(party.rc || "");
  const [taxArticle, setTaxArticle] = useState(party.taxArticle || "");
  const [rib, setRib] = useState(party.rib || "");
  const [bank, setBank] = useState(party.bank || "");
  const [note, setNote] = useState(party.note || "");
  const [imageUrl, setImageUrl] = useState(party.imageUrl || "");
  const [contactStatus, setContactStatus] = useState(party.contactStatus || "Divers");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const photoInput = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (availableClientCategories.length) return;
    void fetch("/api/client-categories", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { categories?: ClientCategoryRecord[] };
      if (response.ok) setAvailableClientCategories(payload.categories ?? []);
    }).catch(() => undefined);
  }, [availableClientCategories.length]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/parties", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: party.id, name, phone, contact_phone: contactPhone, contact_name: contactName, email, address, head_office: kind === "supplier" ? headOffice : "", category, client_category: clientCategory, nif, nis, rc, tax_article: taxArticle, rib, bank, note, image_url: imageUrl, contact_status: contactStatus }) });
      const payload = await response.json() as { party?: ApiPartyRecord; error?: string };
      if (!response.ok || !payload.party) throw new Error(payload.error || "Impossible de modifier le tiers.");
      onSaved(payload.party);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de modifier le tiers."); } finally { setSaving(false); }
  };
  if (String(kind) === "client") return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className={`modal-card compact-field-modal party-create-modal ${detailsOpen ? "expanded-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="party-edit-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
    <div className="modal-header"><div><h2 id="party-edit-title">Modifier le client</h2><p>Le formulaire correspond uniquement à la page actuelle.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <label className="field-label">Nom<input autoFocus value={name} onChange={(event) => setName(event.target.value)} required placeholder="Nom complet" /></label>
    <div className="entity-photo-upload create-photo-upload"><EntityLogo name={name || party.name} tone={party.color} kind="client" imageUrl={imageUrl} /><div><strong>Photo du client</strong><small>PNG, JPG ou WebP · 1,5 Mo maximum</small><span><button type="button" className="secondary-button" onClick={() => photoInput.current?.click()}><Upload size={15} /> Importer</button>{imageUrl && <button type="button" className="text-button danger-text" onClick={() => setImageUrl("")}>Supprimer</button>}</span></div><input ref={photoInput} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (file) void readUploadedImage(file).then(setImageUrl).catch((reason: Error) => setError(reason.message)); }} /></div>
    <div className="form-grid"><label className="field-label">Téléphone<input inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0550 00 00 00" /></label><label className="field-label">E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contact@entreprise.dz" /></label></div>
    <section className={`expandable-form-section ${detailsOpen ? "open" : ""}`}><button type="button" className="expand-form-button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((value) => !value)}><span><ContactRound size={16} /> Contact et informations fiscales</span><ChevronDown size={16} /></button>{detailsOpen && <div className="expanded-fields party-expanded-fields">
      <div className="form-section-label"><ContactRound size={15} /><span>Contact principal</span></div>
      <div className="party-create-contact-grid"><label className="field-label">Nom du contact<span className="input-with-icon"><ContactRound size={15} /><input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nom et prénom" /></span></label><label className="field-label">Téléphone du contact<input inputMode="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="0550 00 00 00" /></label><label className="field-label">Statut<select value={contactStatus} onChange={(event) => setContactStatus(event.target.value)}><option>Directeur</option><option>Administration</option><option>Divers</option></select></label></div>
      <div className="party-create-organization-grid client-organization-grid"><label className="field-label">Adresse<span className="input-with-icon"><MapPin size={15} /><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rue, zone, bâtiment" /></span></label><label className="field-label">Catégorie client<select value={clientCategory} onChange={(event) => setClientCategory(event.target.value)}><option value="">Sans catégorie</option>{availableClientCategories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label></div>
      <div className="form-section-label fiscal-label"><ReceiptText size={15} /><span>Informations fiscales</span><small>Facultatif</small></div>
      <div className="form-grid quick-party-fiscal-grid"><label className="field-label">NIF<input value={nif} onChange={(event) => setNif(event.target.value)} placeholder="N° fiscal" /></label><label className="field-label">NIS<input value={nis} onChange={(event) => setNis(event.target.value)} placeholder="N° statistique" /></label><label className="field-label">RC<input value={rc} onChange={(event) => setRc(event.target.value)} placeholder="Registre commerce" /></label><label className="field-label">N° article<input value={taxArticle} onChange={(event) => setTaxArticle(event.target.value)} placeholder="Article fiscal" /></label><label className="field-label quick-party-rib-field">RIB<input value={rib} onChange={(event) => setRib(event.target.value)} placeholder="Relevé d’identité bancaire" /></label><label className="field-label quick-party-bank-field">Banque<BankSelect value={bank} onChange={setBank} /></label></div>
      <label className="field-label">Note<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Informations internes sur ce client…" /></label>
    </div>}</section>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
  </form></div>;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card expanded-modal party-editor-modal compact-field-modal" role="dialog" aria-modal="true" aria-labelledby="party-edit-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
    <div className="modal-header"><div><h2 id="party-edit-title">Modifier {kind === "client" ? "le client" : "le fournisseur"}</h2><p>Coordonnées et informations fiscales complètes.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <div className="party-editor-sections">
      <section>
        <div className="form-section-label"><ContactRound size={15} /><span>Identité et contact</span></div>
        <div className="entity-photo-upload"><EntityLogo name={name || party.name} tone={party.color} kind={kind} imageUrl={imageUrl} /><div><strong>Photo du {kind === "client" ? "client" : "fournisseur"}</strong><small>PNG, JPG ou WebP · 1,5 Mo maximum</small><span><button type="button" className="secondary-button" onClick={() => photoInput.current?.click()}><Upload size={15} /> Importer</button>{imageUrl && <button type="button" className="text-button danger-text" onClick={() => setImageUrl("")}>Supprimer</button>}</span></div><input ref={photoInput} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (file) void readUploadedImage(file).then(setImageUrl).catch((reason: Error) => setError(reason.message)); }} /></div>
        <div className="form-grid"><label className="field-label">Nom<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label className="field-label">Téléphone<input inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label><label className="field-label">E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label></div>
        <div className="form-section-label contact-subsection"><ContactRound size={15} /><span>Contact principal</span></div>
        <div className="form-grid form-grid-three"><label className="field-label">Nom du contact<input value={contactName} onChange={(event) => setContactName(event.target.value)} /></label><label className="field-label">Téléphone du contact<input inputMode="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} /></label><label className="field-label">Statut<select value={contactStatus} onChange={(event) => setContactStatus(event.target.value)}><option>Directeur</option><option>Administration</option><option>Divers</option></select></label></div>
      </section>
      <section><div className="form-section-label"><MapPin size={15} /><span>Adresse et organisation</span></div><div className="form-grid"><label className="field-label form-field-wide">Adresse<input value={address} onChange={(event) => setAddress(event.target.value)} /></label>{kind === "supplier" && <label className="field-label">Siège social<input value={headOffice} onChange={(event) => setHeadOffice(event.target.value)} /></label>}{kind === "client" ? <label className="field-label">Catégorie client<select value={clientCategory} onChange={(event) => setClientCategory(event.target.value)}><option value="">Sans catégorie</option>{availableClientCategories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label> : <label className="field-label">Catégorie<input value={category} onChange={(event) => setCategory(event.target.value)} /></label>}</div></section>
      <section><div className="form-section-label"><ReceiptText size={15} /><span>Informations fiscales et bancaires</span></div><div className="form-grid"><label className="field-label">NIF<input value={nif} onChange={(event) => setNif(event.target.value)} /></label><label className="field-label">NIS<input value={nis} onChange={(event) => setNis(event.target.value)} /></label><label className="field-label">RC<input value={rc} onChange={(event) => setRc(event.target.value)} /></label><label className="field-label">N° article<input value={taxArticle} onChange={(event) => setTaxArticle(event.target.value)} /></label><label className="field-label form-field-wide">RIB<input value={rib} onChange={(event) => setRib(event.target.value)} /></label><label className="field-label">Banque<BankSelect value={bank} onChange={setBank} /></label></div><label className="field-label party-note-field">Note<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Informations internes sur ce tiers…" /></label></section>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
  </form></div>;
}

function QuickPartyCreateModal({
  kind,
  onClose,
  onCreate,
  onCreated,
}: {
  kind: "client" | "supplier";
  onClose: () => void;
  onCreate: (body: Record<string, unknown>) => Promise<ApiPartyRecord>;
  onCreated: (party: ApiPartyRecord) => void;
}) {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [category, setCategory] = useState("");
  const [clientCategory, setClientCategory] = useState("");
  const [clientPriceCategories, setClientPriceCategories] = useState<ClientCategoryRecord[]>([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [headOffice, setHeadOffice] = useState("");
  const [nif, setNif] = useState("");
  const [nis, setNis] = useState("");
  const [rc, setRc] = useState("");
  const [taxArticle, setTaxArticle] = useState("");
  const [rib, setRib] = useState("");
  const [bank, setBank] = useState("");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [contactStatus, setContactStatus] = useState("Divers");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (kind !== "client") return;
    void fetch("/api/client-categories", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { categories?: ClientCategoryRecord[] };
      if (response.ok) setClientPriceCategories(payload.categories ?? []);
    }).catch(() => undefined);
  }, [kind]);
  const label = kind === "client" ? "client" : "fournisseur";
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const party = await onCreate({
        kind,
        name,
        contact_name: contactName,
        phone,
        contact_phone: contactPhone,
        email,
        address,
        head_office: headOffice,
        category,
        client_category: kind === "client" ? clientCategory : undefined,
        nif,
        nis,
        rc,
        tax_article: taxArticle,
        rib,
        bank,
        note,
        image_url: imageUrl,
        contact_status: contactStatus,
      });
      onCreated(party);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Impossible d’ajouter le ${label}.`);
      setSaving(false);
    }
  };
  return (
    <div className="modal-backdrop quick-party-backdrop" role="presentation" onMouseDown={onClose}>
      <form className={`modal-card quick-party-modal compact-field-modal ${detailsOpen ? "expanded-modal details-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="quick-party-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-header"><div><h2 id="quick-party-title">Nouveau {label}</h2><p>Créez sa fiche sans quitter le document. Il sera sélectionné automatiquement.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
        <div className="quick-party-create-layout">
          <label className="field-label quick-party-name">Nom<input autoFocus value={name} onChange={(event) => setName(event.target.value)} required placeholder="Nom complet" /></label>
          <div className="entity-photo-upload create-photo-upload"><EntityLogo name={name || label} tone="blue" kind={kind} imageUrl={imageUrl} /><div><strong>Photo du {label}</strong><small>PNG, JPG ou WebP · 1,5 Mo maximum</small><span><button type="button" className="secondary-button" onClick={() => photoInput.current?.click()}><Upload size={15} /> Importer</button>{imageUrl && <button type="button" className="text-button danger-text" onClick={() => setImageUrl("")}>Supprimer</button>}</span></div><input ref={photoInput} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (file) void readUploadedImage(file).then(setImageUrl).catch((reason: Error) => setError(reason.message)); }} /></div>
          <label className="field-label quick-party-phone">Téléphone<input inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0550 00 00 00" /></label>

          <section className={`expandable-form-section quick-party-details ${detailsOpen ? "open" : ""}`}>
            <button type="button" className="expand-form-button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((value) => !value)}>
              <span><ReceiptText size={16} /> Contact, adresse et informations fiscales</span>
              <ChevronDown size={16} />
            </button>
            {detailsOpen && (
              <div className="expanded-fields">
                <div className="form-section-label"><ContactRound size={15} /><span>Contact principal</span></div>
                <div className="quick-party-contact-grid">
                  <label className="field-label">Nom du contact<span className="input-with-icon"><ContactRound size={15} /><input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nom et prénom" /></span></label>
                  <label className="field-label">Téléphone du contact<input inputMode="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="0550 00 00 00" /></label>
                  <label className="field-label">Statut<select value={contactStatus} onChange={(event) => setContactStatus(event.target.value)}><option>Directeur</option><option>Administration</option><option>Divers</option></select></label>
                  <label className="field-label">E-mail<span className="input-with-icon"><Mail size={15} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contact@entreprise.dz" /></span></label>
                </div>
                <div className="form-section-label"><MapPin size={15} /><span>Adresse et organisation</span></div>
                <div className="quick-party-organization-grid">
                  <label className="field-label quick-party-address-field">Adresse<span className="input-with-icon"><MapPin size={15} /><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rue, zone, bâtiment" /></span></label>
                  {kind === "supplier" && <><label className="field-label">Siège social<span className="input-with-icon"><Building2 size={15} /><input value={headOffice} onChange={(event) => setHeadOffice(event.target.value)} placeholder="Adresse du siège" /></span></label><label className="field-label">Catégorie<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Informatique, transport…" /></label></>}
                  {kind === "client" && <label className="field-label">Catégorie client<select value={clientCategory} onChange={(event) => setClientCategory(event.target.value)}><option value="">Sans catégorie</option>{clientPriceCategories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>}
                </div>
                <div className="form-section-label fiscal-label"><ReceiptText size={15} /><span>Informations fiscales</span><small>Facultatif</small></div>
                <div className="form-grid quick-party-fiscal-grid">
                  <label className="field-label">NIF<input value={nif} onChange={(event) => setNif(event.target.value)} placeholder="N° fiscal" /></label>
                  <label className="field-label">NIS<input value={nis} onChange={(event) => setNis(event.target.value)} placeholder="N° statistique" /></label>
                  <label className="field-label">RC<input value={rc} onChange={(event) => setRc(event.target.value)} placeholder="Registre commerce" /></label>
                  <label className="field-label">N° article<input value={taxArticle} onChange={(event) => setTaxArticle(event.target.value)} placeholder="Article fiscal" /></label>
                  <label className="field-label quick-party-rib-field">RIB<input value={rib} onChange={(event) => setRib(event.target.value)} placeholder="Relevé d’identité bancaire" /></label>
                  <label className="field-label quick-party-bank-field">Banque<BankSelect value={bank} onChange={setBank} /></label>
                </div>
                <label className="field-label">Note<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder={`Informations internes sur ce ${label}…`} /></label>
              </div>
            )}
          </section>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Annuler</button><button className="primary-button" disabled={saving}><UserPlus size={16} />{saving ? "Création…" : `Créer et sélectionner`}</button></div>
      </form>
    </div>
  );
}

function SettlementModal({ party, kind, originDocument, onClose, onSaved }: { party: PartyRow; kind: "client" | "supplier"; originDocument?: DocumentRecord; onClose: () => void; onSaved: (payment: PaymentRecord) => void }) {
  const remaining = numberFromDa(party.balance);
  const credit = numberFromDa(party.credit);
  const [amount, setAmount] = useState(remaining > 0 ? remaining : 0);
  const [method, setMethod] = useState("Espèces");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const savedDocumentTitle = originDocument
    ? `${originDocument.type} ${originDocument.type === "Facture" ? "enregistrée" : "enregistré"}`
    : "";
  const projectedBalance = Math.max(0, remaining - amount);
  const projectedCredit = Math.max(0, credit + amount - remaining);
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
    <div className="modal-header"><div><h2 id="settlement-title">{originDocument ? savedDocumentTitle : remaining > 0 ? "Régler" : "Enregistrer une avance"} {originDocument ? "" : party.name}</h2><p>{originDocument ? `${originDocument.number} · ${party.name} · régler maintenant ou plus tard` : `${kind === "client" ? "Encaissement client" : "Paiement fournisseur"} · solde ${party.balance} · crédit ${formatDa(credit)}`}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <div className="form-grid"><label className="field-label">Montant (DA)<input type="number" min="1" step="1" value={amount || ""} onChange={(event) => setAmount(Number(event.target.value))} required /></label><label className="field-label">Date<input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} required /></label></div><label className="field-label">Mode<select value={method} onChange={(event) => setMethod(event.target.value)}><option>Espèces</option><option>Virement</option><option>Chèque</option><option>Carte</option></select></label><label className="field-label">Note (facultatif)<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <div className="settlement-balance-preview"><span><small>Ancien solde</small><strong>{formatDa(remaining)}</strong></span><span><small>Nouveau solde</small><strong>{formatDa(projectedBalance)}</strong></span><span><small>Crédit après paiement</small><strong>{formatDa(projectedCredit)}</strong></span></div>
    <p className="settlement-advance-note"><Banknote size={15} /> Un montant supérieur au solde devient automatiquement un crédit disponible pour ce tiers.</p>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>{originDocument ? "Plus tard" : "Annuler"}</button><button className="primary-button" disabled={saving}><Banknote size={16} />{saving ? "Enregistrement…" : kind === "client" ? "Encaisser maintenant" : "Payer maintenant"}</button></div>
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
  purchases,
  sales,
  treasuryLedger,
  employees,
  attendance,
  salaryPayments,
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
  onNewEmployee,
  onEditEmployee,
  onRecordAttendance,
  onPaySalary,
  onEditSalaryPayment,
}: {
  entries: FinanceEntry[];
  parties: PartyRow[];
  purchases: DocumentRecord[];
  sales: DocumentRecord[];
  treasuryLedger: TreasuryLedgerRow[];
  employees: EmployeeRecord[];
  attendance: EmployeeAttendanceRecord[];
  salaryPayments: SalaryPaymentRecord[];
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
  onNewEmployee: () => void;
  onEditEmployee: (employee: EmployeeRecord) => void;
  onRecordAttendance: (employee: EmployeeRecord) => void;
  onPaySalary: (employee: EmployeeRecord) => void;
  onEditSalaryPayment: (employee: EmployeeRecord, payment: SalaryPaymentRecord) => void;
}) {
  const [section, setSection] = useState<"overview" | "charges" | "settlements" | "treasury" | "employees">("overview");
  const workspaceRef = useRef<HTMLElement | null>(null);
  const filtered = entries.filter((entry) => `${entry.label} ${entry.category} ${entry.kind} ${entry.note}`.toLowerCase().includes(search.toLowerCase()));
  const expenses = entries.filter((entry) => entry.kind === "expense").reduce((total, entry) => total + entry.amount, 0);
  const charges = entries.filter((entry) => entry.kind === "charge").reduce((total, entry) => total + entry.amount, 0);
  const incoming = treasuryLedger.filter((row) => row.direction === "in").reduce((total, row) => total + row.amount, 0);
  const outgoing = treasuryLedger.filter((row) => row.direction === "out").reduce((total, row) => total + row.amount, 0);
  const settlementRows = parties.filter((party) => ("billed" in party ? party.billed : party.purchases) !== "0 DA" || party.paid !== "0 DA" || party.credit !== "0 DA");
  const clientPayments = parties.filter((party) => "billed" in party).reduce((sum, party) => sum + numberFromDa(party.paid), 0);
  const supplierPayments = parties.filter((party) => "purchases" in party).reduce((sum, party) => sum + numberFromDa(party.paid), 0);
  const settlementDue = parties.reduce((sum, party) => sum + numberFromDa(party.balance), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  const activeEmployees = employees.filter((employee) => employee.status === "Actif");
  const monthlyPayroll = activeEmployees.reduce((sum, employee) => sum + employee.base_salary, 0);
  const paidThisMonth = salaryPayments.filter((payment) => payment.payroll_month === currentMonth).reduce((sum, payment) => sum + payment.amount, 0);
  const salesRevenue = sales.filter((document) => document.type === "Facture" || document.type === "Bon de livraison").reduce((sum, document) => sum + Math.abs(document.total || numberFromDa(document.amount)), 0);
  const purchasesCost = purchases.filter((document) => document.type === "Facture" || document.type === "Bon d’achat").reduce((sum, document) => sum + Math.abs(document.total || numberFromDa(document.amount)), 0);
  const profit = salesRevenue - purchasesCost - expenses - charges;
  const presentToday = attendance.filter((entry) => entry.work_date === today && entry.status === "Présent").length;
  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.job_title} ${employee.phone} ${employee.status}`.toLowerCase().includes(search.toLowerCase()),
  );
  const openSection = (nextSection: "charges" | "settlements" | "treasury" | "employees") => {
    setSearch("");
    setSection(nextSection);
  };
  const sectionLabel = section === "employees"
    ? "Employés, salaires et pointage"
    : section === "charges"
    ? "Charges et dépenses"
    : section === "settlements"
      ? "États des règlements"
      : section === "treasury"
        ? "Trésorerie"
        : "Vue d’ensemble";

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (section !== "overview" || !workspace || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeline = createTimeline({ defaults: { duration: 620, ease: "outExpo" } });
    timeline.label("start")
      .add(workspace.querySelectorAll("[data-finance-heading]"), { opacity: [0, 1], y: [12, 0] }, "start")
      .add(workspace.querySelectorAll("[data-finance-card]"), { opacity: [0, 1], y: [20, 0], delay: (_, index) => index * 70 }, "start+=90")
      .add(workspace.querySelectorAll("[data-finance-stat]"), { opacity: [0, 1], y: [10, 0], delay: (_, index) => index * 70 }, "start+=260");

    return () => timeline.revert();
  }, [section]);

  return (
    <section ref={workspaceRef} className={`table-card finance-workspace ${section === "overview" ? "finance-overview" : "finance-detail"}`}>
      <div className="table-header">
        <div className="table-title"><h1>Finance</h1><span>{section === "overview" ? "Vos chiffres essentiels en un coup d’œil" : sectionLabel}</span></div>
        <div className="table-actions">
          {section === "charges" && <button className="primary-button" onClick={onNewCharge}><Plus size={16} /> Nouvelle charge</button>}
          {section === "employees" && <button className="primary-button" onClick={onNewEmployee}><Plus size={16} /> Nouvel employé</button>}
          {section === "treasury" && <button className="primary-button" onClick={onNewTreasury}><Plus size={16} /> Nouvelle entrée / sortie</button>}
        </div>
      </div>

      {section === "overview" && (
        <div className="finance-hub">
          <div className="finance-hub-heading" data-finance-heading>
            <span>Centre financier</span>
            <h2>Où souhaitez-vous aller&nbsp;?</h2>
            <p>Chaque carte affiche l’indicateur le plus important. Cliquez dessus pour ouvrir son tableau détaillé et ses statistiques.</p>
          </div>
          <div className="finance-hub-grid">
            <button type="button" className="finance-hub-card finance-card-charges" data-finance-card onClick={() => openSection("charges")}>
              <span className="finance-card-top"><span className="finance-card-icon"><ReceiptText size={24} /></span><span className="finance-card-count">{entries.length} opération{entries.length === 1 ? "" : "s"}</span></span>
              <span className="finance-card-copy"><small>Charges &amp; dépenses</small><strong>{formatDa(expenses + charges)}</strong><span>Total engagé</span></span>
              <span className="finance-card-footer">Ouvrir le tableau <ArrowRight size={17} /></span>
            </button>
            <button type="button" className="finance-hub-card finance-card-employees" data-finance-card onClick={() => openSection("employees")}>
              <span className="finance-card-top"><span className="finance-card-icon"><Users size={24} /></span><span className="finance-card-count">{activeEmployees.length} actif{activeEmployees.length === 1 ? "" : "s"}</span></span>
              <span className="finance-card-copy"><small>Employés &amp; paie</small><strong>{formatDa(paidThisMonth)}</strong><span>Total payé ce mois</span></span>
              <span className="finance-card-footer">Gérer l’équipe <ArrowRight size={17} /></span>
            </button>
            <button type="button" className="finance-hub-card finance-card-settlements" data-finance-card onClick={() => openSection("settlements")}>
              <span className="finance-card-top"><span className="finance-card-icon"><Banknote size={24} /></span><span className="finance-card-count">{settlementRows.length} compte{settlementRows.length === 1 ? "" : "s"}</span></span>
              <span className="finance-card-copy"><small>Règlements</small><strong>{formatDa(settlementDue)}</strong><span>Reste à régler</span></span>
              <span className="finance-card-footer">Voir les états <ArrowRight size={17} /></span>
            </button>
            <button type="button" className="finance-hub-card finance-card-treasury" data-finance-card onClick={() => openSection("treasury")}>
              <span className="finance-card-top"><span className="finance-card-icon"><WalletCards size={24} /></span><span className="finance-card-count">{treasuryLedger.length} mouvement{treasuryLedger.length === 1 ? "" : "s"}</span></span>
              <span className="finance-card-copy"><small>Trésorerie</small><strong>{formatDa(incoming - outgoing)}</strong><span>Solde disponible</span></span>
              <span className="finance-card-footer">Ouvrir le journal <ArrowRight size={17} /></span>
            </button>
          </div>
          <div className="finance-hub-footnote" aria-label="Résumé de trésorerie">
            <span className="finance-hub-stat finance-hub-stat-in" data-finance-stat><i className="finance-dot finance-dot-in" /><small>Entrées</small><strong>{formatDa(incoming)}</strong></span>
            <span className="finance-hub-stat finance-hub-stat-out" data-finance-stat><i className="finance-dot finance-dot-out" /><small>Sorties</small><strong>{formatDa(outgoing)}</strong></span>
            <span className="finance-hub-stat finance-hub-stat-profit" data-finance-stat><i className="finance-dot finance-dot-paid" /><small>Bénéfice</small><strong className={profit >= 0 ? "positive-number" : "negative-number"}>{formatDa(profit)}</strong></span>
          </div>
        </div>
      )}

      {section !== "overview" && (
        <div className="finance-section-nav">
          <button type="button" className="finance-back-button" onClick={() => { setSearch(""); setSection("overview"); }}><ArrowLeft size={16} /> Vue d’ensemble</button>
          <div className="finance-section-tabs" role="tablist" aria-label="Sections finance">
            <button className={section === "charges" ? "active" : ""} onClick={() => openSection("charges")} role="tab" aria-selected={section === "charges"}><ReceiptText size={16} /> Charges</button>
            <button className={section === "employees" ? "active" : ""} onClick={() => openSection("employees")} role="tab" aria-selected={section === "employees"}><Users size={16} /> Employés</button>
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

      {section === "employees" && (
        <>
          <div className="finance-summary employee-stats">
            <div><small>Employés actifs</small><strong>{activeEmployees.length}</strong></div>
            <div><small>Présents aujourd’hui</small><strong>{presentToday}</strong></div>
            <div><small>Salaires du mois</small><strong>{formatDa(monthlyPayroll)}</strong></div>
            <div><small>Déjà payé</small><strong>{formatDa(paidThisMonth)}</strong></div>
          </div>
          <div className="table-header finance-subheader">
            <div className="table-title"><h2>Équipe et paie</h2><span>Pointage, salaire de base et règlements</span></div>
            <label className="search-control"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, poste…" aria-label="Rechercher un employé" /></label>
          </div>
          <div className="table-scroll employee-table-scroll">
            <table className="employee-table">
              <thead><tr><th>Employé</th><th>Poste</th><th>Salaire mensuel</th><th>Pointage ce mois</th><th>Dernier salaire</th><th>Statut</th><th /></tr></thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const monthAttendance = attendance.filter((entry) => entry.employee_id === employee.id && entry.work_date.startsWith(currentMonth));
                  const presentDays = monthAttendance.filter((entry) => entry.status === "Présent").length;
                  const lastPayment = salaryPayments.find((payment) => payment.employee_id === employee.id);
                  return <tr key={employee.id}>
                    <td><div className="employee-identity"><span>{initials(employee.name)}</span><div><strong>{employee.name}</strong><small>{employee.phone || "Téléphone non renseigné"}</small></div></div></td>
                    <td>{employee.job_title || "—"}</td>
                    <td className="number"><strong>{formatDa(employee.base_salary)}</strong></td>
                    <td><span className="attendance-pill"><ClipboardList size={14} /> {presentDays} présent{presentDays === 1 ? "" : "s"}</span></td>
                    <td>{lastPayment ? <div className="salary-last-payment"><span><strong>{formatDa(lastPayment.amount)}</strong><small>{formatDocumentDate(lastPayment.payment_date)}</small></span><button type="button" className="icon-button salary-edit-button" onClick={() => onEditSalaryPayment(employee, lastPayment)} aria-label={`Modifier le paiement de ${employee.name}`} title="Modifier ce paiement"><Pencil size={14} /></button></div> : <span className="muted-cell">Non payé</span>}</td>
                    <td><StatusBadge label={employee.status} tone={employee.status === "Actif" ? "green" : "gray"} /></td>
                    <td><div className="employee-row-actions"><button type="button" className="secondary-button" onClick={() => onRecordAttendance(employee)}><ClipboardList size={15} /> Pointage</button><button type="button" className="cash-action" onClick={() => onPaySalary(employee)} disabled={employee.status !== "Actif"}><Banknote size={15} /> Payer</button><button type="button" className="icon-button" onClick={() => onEditEmployee(employee)} aria-label={`Modifier ${employee.name}`}><Pencil size={15} /></button></div></td>
                  </tr>;
                })}
                {!filteredEmployees.length && <EmptyRow columns={7} />}
              </tbody>
            </table>
          </div>
        </>
      )}

      {section === "settlements" && (
        <>
          <div className="finance-summary settlement-stats"><div><small>Bénéfice</small><strong className={profit >= 0 ? "positive-number" : "negative-number"}>{formatDa(profit)}</strong></div><div><small>Encaissements clients</small><strong>{formatDa(clientPayments)}</strong></div><div><small>Décaissements fournisseurs</small><strong>{formatDa(supplierPayments)}</strong></div><div><small>À régler</small><strong>{formatDa(settlementDue)}</strong></div></div>
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

function EmployeeFormModal({ employee, onClose, onSaved }: { employee: EmployeeRecord | null; onClose: () => void; onSaved: (employee: EmployeeRecord) => void }) {
  const [name, setName] = useState(employee?.name ?? "");
  const [jobTitle, setJobTitle] = useState(employee?.job_title ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [baseSalary, setBaseSalary] = useState(employee?.base_salary ?? 0);
  const [hireDate, setHireDate] = useState(employee?.hire_date ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<EmployeeRecord["status"]>(employee?.status ?? "Actif");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/employees", { method: employee ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(employee ? { id: employee.id } : {}), name, jobTitle, phone, baseSalary, hireDate, status }) });
      const payload = await response.json() as { employee?: EmployeeRecord; error?: string };
      if (!response.ok || !payload.employee) throw new Error(payload.error || "Impossible d’enregistrer l’employé.");
      onSaved(payload.employee);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer l’employé."); } finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card compact-modal employee-form-modal" role="dialog" aria-modal="true" aria-labelledby="employee-form-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
    <div className="modal-header"><div><h2 id="employee-form-title">{employee ? "Modifier l’employé" : "Nouvel employé"}</h2><p>Identité, poste et salaire mensuel de référence.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <label className="field-label">Nom complet<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom et prénom" /></label>
    <div className="form-grid"><label className="field-label">Poste<input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="Commercial, comptable…" /></label><label className="field-label">Téléphone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0550 00 00 00" /></label></div>
    <div className="form-grid"><label className="field-label">Salaire mensuel (DA)<input type="number" min="0" step="0.01" value={baseSalary || ""} onChange={(event) => setBaseSalary(Number(event.target.value))} required /></label><label className="field-label">Date d’embauche<input type="date" value={hireDate} onChange={(event) => setHireDate(event.target.value)} required /></label></div>
    <label className="field-label">Statut<select value={status} onChange={(event) => setStatus(event.target.value as EmployeeRecord["status"])}><option>Actif</option><option>Inactif</option></select></label>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
  </form></div>;
}

function AttendanceFormModal({ employee, onClose, onSaved }: { employee: EmployeeRecord; onClose: () => void; onSaved: (entry: EmployeeAttendanceRecord) => void }) {
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<EmployeeAttendanceRecord["status"]>("Présent");
  const [checkIn, setCheckIn] = useState("08:00");
  const [checkOut, setCheckOut] = useState("17:00");
  const [hours, setHours] = useState(8);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "attendance", employeeId: employee.id, workDate, status, checkIn, checkOut, hours: status === "Présent" ? hours : 0, note }) });
      const payload = await response.json() as { attendance?: EmployeeAttendanceRecord; error?: string };
      if (!response.ok || !payload.attendance) throw new Error(payload.error || "Impossible d’enregistrer le pointage.");
      onSaved(payload.attendance);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer le pointage."); } finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card compact-modal employee-form-modal" role="dialog" aria-modal="true" aria-labelledby="attendance-form-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
    <div className="modal-header"><div><h2 id="attendance-form-title">Pointage · {employee.name}</h2><p>Un pointage par jour ; une nouvelle saisie remplace celle du même jour.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <div className="form-grid"><label className="field-label">Date<input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} required /></label><label className="field-label">Présence<select value={status} onChange={(event) => setStatus(event.target.value as EmployeeAttendanceRecord["status"])}><option>Présent</option><option>Absent</option><option>Congé</option></select></label></div>
    {status === "Présent" && <><div className="form-grid"><label className="field-label">Arrivée<input type="time" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></label><label className="field-label">Départ<input type="time" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></label></div><label className="field-label">Heures travaillées<input type="number" min="0" max="24" step="0.25" value={hours} onChange={(event) => setHours(Number(event.target.value))} /></label></>}
    <label className="field-label">Note<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Facultatif" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><ClipboardList size={16} />{saving ? "Enregistrement…" : "Valider le pointage"}</button></div>
  </form></div>;
}

function SalaryPaymentModal({ employee, payment, onClose, onSaved }: { employee: EmployeeRecord; payment?: SalaryPaymentRecord; onClose: () => void; onSaved: (payment: SalaryPaymentRecord) => void }) {
  const [payrollMonth, setPayrollMonth] = useState(payment?.payroll_month ?? new Date().toISOString().slice(0, 7));
  const [baseAmount, setBaseAmount] = useState(payment?.base_amount ?? employee.base_salary);
  const [bonus, setBonus] = useState(payment?.bonus ?? 0);
  const [deduction, setDeduction] = useState(payment?.deduction ?? 0);
  const [paymentDate, setPaymentDate] = useState(payment?.payment_date ?? new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState(payment?.method ?? "Virement");
  const [note, setNote] = useState(payment?.note ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const netSalary = Math.max(0, baseAmount + bonus - deduction);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/employees", { method: payment ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: payment ? "update_salary" : "pay_salary", ...(payment ? { id: payment.id } : {}), employeeId: employee.id, payrollMonth, baseAmount, bonus, deduction, paymentDate, method, note }) });
      const payload = await response.json() as { payment?: SalaryPaymentRecord; error?: string };
      if (!response.ok || !payload.payment) throw new Error(payload.error || "Impossible de payer le salaire.");
      onSaved(payload.payment);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impossible de payer le salaire."); } finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card compact-modal salary-payment-modal" role="dialog" aria-modal="true" aria-labelledby="salary-payment-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
    <div className="modal-header"><div><h2 id="salary-payment-title">{payment ? "Modifier le paiement" : "Payer"} · {employee.name}</h2><p>{payment ? "La charge et la sortie de trésorerie liées seront corrigées automatiquement." : "Le paiement créera automatiquement une charge « Salaires » et une sortie de trésorerie."}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <div className="form-grid"><label className="field-label">Mois de paie<input type="month" value={payrollMonth} onChange={(event) => setPayrollMonth(event.target.value)} required /></label><label className="field-label">Date de paiement<input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} required /></label></div>
    <div className="salary-calculation-grid"><label className="field-label">Salaire de base<input type="number" min="0" step="0.01" value={baseAmount || ""} onChange={(event) => setBaseAmount(Number(event.target.value))} required /></label><label className="field-label">Prime<input type="number" min="0" step="0.01" value={bonus || ""} onChange={(event) => setBonus(Number(event.target.value))} /></label><label className="field-label">Retenue<input type="number" min="0" step="0.01" value={deduction || ""} onChange={(event) => setDeduction(Number(event.target.value))} /></label></div>
    <div className="salary-net-card"><span>Net à payer</span><strong>{formatDa(netSalary)}</strong><small>Déduit de la trésorerie après validation</small></div>
    <label className="field-label">Mode<select value={method} onChange={(event) => setMethod(event.target.value)}><option>Virement</option><option>Espèces</option><option>Chèque</option></select></label><label className="field-label">Note<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Facultatif" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving || netSalary <= 0}><Banknote size={16} />{saving ? "Enregistrement…" : payment ? `Mettre à jour ${formatDa(netSalary)}` : `Payer ${formatDa(netSalary)}`}</button></div>
  </form></div>;
}

const FINANCE_CHARGE_CATEGORIES = [
  "Achats & approvisionnement",
  "Loyer & charges locatives",
  "Électricité, gaz & eau",
  "Téléphone & Internet",
  "Transport & carburant",
  "Salaires & cotisations",
  "Impôts & taxes",
  "Banque & assurances",
  "Maintenance & réparation",
  "Marketing & publicité",
  "Fournitures de bureau",
  "Honoraires",
  "Autres charges",
] as const;

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
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><form className="modal-card compact-modal finance-form-modal" role="dialog" aria-modal="true" aria-labelledby="finance-form-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-header"><div><h2 id="finance-form-title">{entry ? "Modifier la charge" : "Nouvelle charge"}</h2><p>Cette opération sera intégrée automatiquement à la trésorerie.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div><label className="field-label">Type<select value={kind} onChange={(event) => setKind(event.target.value as FinanceEntry["kind"])}><option value="expense">Dépense</option><option value="charge">Charge</option></select></label><label className="field-label">Libellé<input value={label} onChange={(event) => setLabel(event.target.value)} required placeholder="Loyer, transport, publicité…" /></label><div className="form-grid"><label className="field-label">Catégorie<select value={category} onChange={(event) => setCategory(event.target.value)} required><option value="" disabled>Choisir une catégorie</option>{entry?.category && !FINANCE_CHARGE_CATEGORIES.includes(entry.category as typeof FINANCE_CHARGE_CATEGORIES[number]) && <option>{entry.category}</option>}{FINANCE_CHARGE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Montant (DA)<input type="number" min="0.01" step="0.01" value={amount || ""} onChange={(event) => setAmount(Number(event.target.value))} required /></label></div><div className="form-grid"><label className="field-label">Date<input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required /></label><label className="field-label">Statut<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Payée</option><option>À payer</option><option>Prévue</option></select></label></div><label className="field-label">Note (facultatif)<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div></form></div>;
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

/* Legacy three-depth manager retained in source history only.
function LegacyCategoryManagerModal({
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
  const [catalogTree, setCatalogTree] = useState<CategoryTree[]>(() => categoryTreeForArticles(initialArticles));
  const [editing, setEditing] = useState<CategoryEditTarget | null>(null);
  const [draftName, setDraftName] = useState("");
  const [newLevel, setNewLevel] = useState<1 | 2 | 3>(1);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(() => new Set());
  const tree: any = catalogTree;
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
    const [articlesResponse, categoriesResponse] = await Promise.all([
      fetch("/api/articles", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
    ]);
    const articlesPayload = await articlesResponse.json() as { articles?: ArticleRecord[]; error?: string };
    const categoriesPayload = await categoriesResponse.json() as { categories?: CategoryTree[]; error?: string };
    if (!articlesResponse.ok) throw new Error(articlesPayload.error || "Impossible de recharger les catégories.");
    if (!categoriesResponse.ok) throw new Error(categoriesPayload.error || "Impossible de recharger l’arborescence.");
    setArticles(articlesPayload.articles ?? []);
    setCatalogTree(categoriesPayload.categories ?? []);
    onChanged();
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/categories", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { categories?: CategoryTree[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Impossible de charger l’arborescence.");
        setCatalogTree(payload.categories ?? []);
      })
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      });
    return () => controller.abort();
  }, []);

  const selectedNewCategory = tree.find((item) => item.name === newCategory);
  const availableNewSubcategories = selectedNewCategory?.subcategories ?? [];

  const addCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError("Le nom de la nouvelle catégorie est obligatoire.");
      return;
    }
    if (newLevel >= 2 && !newCategory) {
      setError("Choisissez la catégorie parente.");
      return;
    }
    if (newLevel === 3 && !newSubcategory) {
      setError("Choisissez la sous-catégorie parente.");
      return;
    }
    setBusyKey("create");
    setError("");
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel, name, category: newCategory, subcategory: newSubcategory }),
      });
      const payload = await response.json() as { created?: number; error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible d’ajouter la catégorie.");
      setNewName("");
      await refreshArticles();
      notify(`« ${name} » ajoutée au niveau ${newLevel}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible d’ajouter la catégorie.");
    } finally {
      setBusyKey("");
    }
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
          <div><h2 id="category-manager-title">Catégories disponibles</h2><p>Ajoutez, consultez, renommez ou supprimez les trois niveaux du catalogue.</p></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="category-manager-summary">
          <div><small>Niveau 1</small><strong>{tree.length}</strong><span>catégories</span></div>
          <div><small>Niveau 2</small><strong>{levelTwoCount}</strong><span>sous-catégories</span></div>
          <div><small>Niveau 3</small><strong>{levelThreeCount}</strong><span>familles</span></div>
        </div>
        <p className="category-manager-note"><CircleHelp size={15} /> Un renommage s’applique à tous les articles concernés. Une suppression conserve les articles mais retire leur classement à ce niveau.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="category-create-form" onSubmit={addCategory}>
          <div className="category-create-copy"><Plus size={16} /><span><strong>Ajouter une catégorie</strong><small>Créez une branche vide avant d’y affecter des articles.</small></span></div>
          <label><span>Niveau</span><select value={newLevel} onChange={(event) => { const level = Number(event.target.value) as 1 | 2 | 3; setNewLevel(level); setNewCategory(""); setNewSubcategory(""); }}><option value={1}>Niveau 1</option><option value={2}>Niveau 2</option><option value={3}>Niveau 3</option></select></label>
          {newLevel >= 2 && <label><span>Catégorie parente</span><select value={newCategory} onChange={(event) => { setNewCategory(event.target.value); setNewSubcategory(""); }} required><option value="">Choisir…</option>{tree.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>}
          {newLevel === 3 && <label><span>Sous-catégorie</span><select value={newSubcategory} onChange={(event) => setNewSubcategory(event.target.value)} required><option value="">Choisir…</option>{availableNewSubcategories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>}
          <label className="category-create-name"><span>Nom</span><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nouvelle catégorie" required /></label>
          <button type="submit" className="primary-button" disabled={Boolean(busyKey)}><Plus size={15} />{busyKey === "create" ? "Ajout…" : "Ajouter"}</button>
        </form>
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

*/

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
  const [catalogTree, setCatalogTree] = useState<CategoryTree[]>(() => categoryTreeForArticles(initialArticles));
  const [editing, setEditing] = useState<CategoryEditTarget | null>(null);
  const [draftName, setDraftName] = useState("");
  const [newDepth, setNewDepth] = useState<1 | 2 | 3 | 4>(1);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newSubsubcategory, setNewSubsubcategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(() => new Set());
  const tree = catalogTree;
  const selectedNewCategory = tree.find((item) => item.name === newCategory);
  const availableNewSubcategories = selectedNewCategory?.subcategories ?? [];
  const selectedNewSubcategory = availableNewSubcategories.find((item) => item.name === newSubcategory);
  const availableNewThirdLevels = selectedNewSubcategory?.subcategories ?? [];
  const categoryLabels = ["", "Famille", "Sous-famille", "Catégorie", "Sous-catégorie"];
  const counts = [
    tree.length,
    tree.reduce((total, category) => total + category.subcategories.length, 0),
    tree.reduce((total, category) => total + category.subcategories.reduce((subtotal, subcategory) => subtotal + subcategory.subcategories.length, 0), 0),
    tree.reduce((total, category) => total + category.subcategories.reduce((subtotal, subcategory) => subtotal + subcategory.subcategories.reduce((deepTotal, third) => deepTotal + third.subcategories.length, 0), 0), 0),
  ];
  const branchKeys = tree.flatMap((category) => [
    `1:${category.name}`,
    ...category.subcategories.flatMap((subcategory) => [
      `2:${category.name}:${subcategory.name}`,
      ...subcategory.subcategories.map((third) => `3:${category.name}:${subcategory.name}:${third.name}`),
    ]),
  ]);
  const normalizedSearch = normalizeLabel(categorySearch.trim());
  const visibleTree = !normalizedSearch ? tree : tree.flatMap((category) => {
    const subcategories = category.subcategories.flatMap((subcategory) => {
      const thirdLevels = subcategory.subcategories.flatMap((third) => {
        const fourthLevels = third.subcategories.filter((fourth) => normalizeLabel(`${category.name} ${subcategory.name} ${third.name} ${fourth}`).includes(normalizedSearch));
        const matchesThird = normalizeLabel(`${category.name} ${subcategory.name} ${third.name}`).includes(normalizedSearch);
        return matchesThird || fourthLevels.length ? [{ ...third, subcategories: matchesThird ? third.subcategories : fourthLevels }] : [];
      });
      const matchesSubcategory = normalizeLabel(`${category.name} ${subcategory.name}`).includes(normalizedSearch);
      return matchesSubcategory || thirdLevels.length ? [{ ...subcategory, subcategories: matchesSubcategory ? subcategory.subcategories : thirdLevels }] : [];
    });
    const matchesCategory = normalizeLabel(category.name).includes(normalizedSearch);
    return matchesCategory || subcategories.length ? [{ ...category, subcategories: matchesCategory ? category.subcategories : subcategories }] : [];
  });

  const refresh = async () => {
    const [articlesResponse, categoriesResponse] = await Promise.all([fetch("/api/articles", { cache: "no-store" }), fetch("/api/categories", { cache: "no-store" })]);
    const articlePayload = await articlesResponse.json() as { articles?: ArticleRecord[]; error?: string };
    const categoryPayload = await categoriesResponse.json() as { categories?: CategoryTree[]; error?: string };
    if (!articlesResponse.ok) throw new Error(articlePayload.error || "Impossible de recharger les catégories.");
    if (!categoriesResponse.ok) throw new Error(categoryPayload.error || "Impossible de recharger l’arborescence.");
    setArticles(articlePayload.articles ?? []);
    setCatalogTree(categoryPayload.categories ?? []);
    onChanged();
  };
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/categories", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { categories?: CategoryTree[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Impossible de charger les catégories.");
        setCatalogTree(payload.categories ?? []);
      })
      .catch((requestError: Error) => { if (requestError.name !== "AbortError") setError(requestError.message); });
    return () => controller.abort();
  }, []);
  const toggleBranch = (key: string) => setCollapsedBranches((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const countFor = (target: CategoryEditTarget) => articles.filter((article) =>
    article.category === target.category
    && (target.level < 2 || article.subcategory === target.currentName || target.level !== 2)
    && (target.level < 3 || (article.subcategory === target.subcategory && article.subsubcategory === target.currentName) || target.level !== 3)
    && (target.level < 4 || (article.subcategory === target.subcategory && article.subsubcategory === target.subsubcategory && article.subsubsubcategory === target.currentName)),
  ).length;
  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim() || (newDepth >= 2 && !newCategory) || (newDepth >= 3 && !newSubcategory) || (newDepth === 4 && !newSubsubcategory)) {
      setError("Choisissez chaque catégorie parente avant d’ajouter cette sous-catégorie.");
      return;
    }
    setBusyKey("create"); setError("");
    try {
      const response = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ level: newDepth, name: newName.trim(), category: newCategory, subcategory: newSubcategory, subsubcategory: newSubsubcategory }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible d’ajouter la catégorie.");
      const added = newName.trim(); setNewName(""); await refresh(); notify(`« ${added} » ajoutée.`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible d’ajouter la catégorie."); } finally { setBusyKey(""); }
  };
  const saveRename = async (event: React.FormEvent) => {
    event.preventDefault(); if (!editing || !draftName.trim()) return;
    setBusyKey(editing.key); setError("");
    try {
      const response = await fetch("/api/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editing, nextName: draftName.trim() }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de renommer la catégorie.");
      setEditing(null); await refresh(); notify("Catégorie renommée.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de renommer la catégorie."); } finally { setBusyKey(""); }
  };
  const remove = async (target: CategoryEditTarget) => {
    if (!window.confirm(`Supprimer « ${target.currentName} » ? Les articles concernés seront déclassés à cette profondeur.`)) return;
    setBusyKey(target.key); setError("");
    try {
      const response = await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(target) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de supprimer la catégorie.");
      await refresh(); notify("Catégorie supprimée.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Impossible de supprimer la catégorie."); } finally { setBusyKey(""); }
  };
  const node = (target: CategoryEditTarget, hasChildren: boolean) => {
    const isEditing = editing?.key === target.key;
    const isSystem = target.level === 1 && normalizeLabel(target.currentName) === normalizeLabel("Non classée");
    const expanded = !collapsedBranches.has(target.key);
    return <div className={`category-manager-node category-level-${target.level}`} key={target.key} role="treeitem" aria-level={target.level} aria-expanded={hasChildren ? expanded : undefined}>
      {hasChildren ? <button type="button" className={`category-tree-toggle ${expanded ? "expanded" : ""}`} onClick={() => toggleBranch(target.key)} aria-label={`${expanded ? "Replier" : "Déplier"} ${target.currentName}`}><ChevronDown size={15} /></button> : <span className="category-tree-leaf" aria-hidden="true" />}
      <span className="category-manager-node-icon"><Folder size={16} /></span>
      {isEditing ? <form className="category-rename-form" onSubmit={saveRename}><label><span>Renommer</span><input autoFocus value={draftName} onChange={(event) => setDraftName(event.target.value)} /></label><button type="submit" className="icon-button category-save-button" disabled={busyKey === target.key}><Save size={16} /></button><button type="button" className="icon-button" onClick={() => setEditing(null)}><X size={16} /></button></form> : <><span className="category-manager-node-copy"><small>{categoryLabels[target.level]}</small><strong>{target.currentName}</strong></span><span className="category-usage-count">{countFor(target)} article{countFor(target) === 1 ? "" : "s"}</span>{isSystem ? <span className="category-system-label">Catégorie système</span> : <span className="category-manager-actions"><button type="button" className="icon-button" onClick={() => { setEditing(target); setDraftName(target.currentName); }} disabled={Boolean(busyKey)} aria-label={`Modifier ${target.currentName}`}><Pencil size={15} /></button><button type="button" className="icon-button danger-text" onClick={() => void remove(target)} disabled={Boolean(busyKey)} aria-label={`Supprimer ${target.currentName}`}><Trash2 size={15} /></button></span>}</>}
    </div>;
  };
  /*
  return <div className="modal-backdrop category-manager-backdrop" role="presentation" onMouseDown={onClose}><div className="modal-card expanded-modal category-manager-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
    <div className="modal-header"><div><h2>Catégories disponibles</h2><p>Organisez le catalogue par catégorie et sous-catégories, jusqu’à quatre profondeurs.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    <div className="category-manager-summary">{counts.map((count, index) => <div key={categoryLabels[index + 1]}><small>{categoryLabels[index + 1]}</small><strong>{count}</strong><span>{index === 0 ? "catégories" : "éléments"}</span></div>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <form className="category-create-form" onSubmit={create}><div className="category-create-copy"><Plus size={16} /><span><strong>Ajouter</strong><small>Créez une catégorie ou une sous-catégorie vide.</small></span></div><label><span>Type</span><select value={newDepth} onChange={(event) => { setNewDepth(Number(event.target.value) as 1 | 2 | 3 | 4); setNewCategory(""); setNewSubcategory(""); setNewSubsubcategory(""); }}><option value={1}>Catégorie</option><option value={2}>Sous-catégorie</option><option value={3}>Sous-sous-catégorie</option><option value={4}>Sous-sous-sous-catégorie</option></select></label>{newDepth >= 2 && <label><span>Catégorie parente</span><select value={newCategory} onChange={(event) => { setNewCategory(event.target.value); setNewSubcategory(""); setNewSubsubcategory(""); }} required><option value="">Choisir…</option>{tree.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>}{newDepth >= 3 && <label><span>Sous-catégorie parente</span><select value={newSubcategory} onChange={(event) => { setNewSubcategory(event.target.value); setNewSubsubcategory(""); }} required><option value="">Choisir…</option>{availableNewSubcategories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>}{newDepth === 4 && <label><span>Sous-sous-catégorie parente</span><select value={newSubsubcategory} onChange={(event) => setNewSubsubcategory(event.target.value)} required><option value="">Choisir…</option>{availableNewThirdLevels.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>}<label className="category-create-name"><span>Nom</span><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nouvelle catégorie" required /></label><button type="submit" className="primary-button" disabled={Boolean(busyKey)}><Plus size={15} />Ajouter</button></form>
    <div className="category-tree-toolbar"><div><strong>Arborescence du catalogue</strong><span>Catégorie → Sous-catégorie → Sous-sous-catégorie → Sous-sous-sous-catégorie</span></div><label className="search-control"><Search size={14} /><input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Rechercher une catégorie…" aria-label="Rechercher une catégorie" /></label><div><button type="button" onClick={() => setCollapsedBranches(new Set())}>Tout déplier</button><button type="button" onClick={() => setCollapsedBranches(new Set(branchKeys))}>Tout replier</button></div></div>
    <div className="category-manager-tree" role="tree" aria-label="Arborescence des catégories">{visibleTree.map((category) => { const categoryTarget: CategoryEditTarget = { key: `1:${category.name}`, level: 1, category: category.name, subcategory: "", subsubcategory: "", currentName: category.name }; const categoryExpanded = !collapsedBranches.has(categoryTarget.key); return <section className="category-manager-branch" key={category.name}>{node(categoryTarget, category.subcategories.length > 0)}{categoryExpanded && category.subcategories.length > 0 && <div className="category-manager-children" role="group">{category.subcategories.map((subcategory) => { const subcategoryTarget: CategoryEditTarget = { key: `2:${category.name}:${subcategory.name}`, level: 2, category: category.name, subcategory: "", subsubcategory: "", currentName: subcategory.name }; const subcategoryExpanded = !collapsedBranches.has(subcategoryTarget.key); return <div className="category-manager-subbranch" key={subcategory.name}>{node(subcategoryTarget, subcategory.subcategories.length > 0)}{subcategoryExpanded && subcategory.subcategories.length > 0 && <div className="category-manager-grandchildren" role="group">{subcategory.subcategories.map((third) => { const thirdTarget: CategoryEditTarget = { key: `3:${category.name}:${subcategory.name}:${third.name}`, level: 3, category: category.name, subcategory: subcategory.name, subsubcategory: "", currentName: third.name }; const thirdExpanded = !collapsedBranches.has(thirdTarget.key); return <div className="category-manager-subbranch" key={third.name}>{node(thirdTarget, third.subcategories.length > 0)}{thirdExpanded && third.subcategories.length > 0 && <div className="category-manager-greatgrandchildren" role="group">{third.subcategories.map((fourth) => node({ key: `4:${category.name}:${subcategory.name}:${third.name}:${fourth}`, level: 4, category: category.name, subcategory: subcategory.name, subsubcategory: third.name, currentName: fourth }, false))}</div>}</div>; })}</div>}</div>; })}</div>}</section>; })}</div>
    {!visibleTree.length && <div className="category-manager-empty"><Folder size={22} /><span>{categorySearch ? "Aucune catégorie trouvée." : "Aucune catégorie disponible."}</span></div>}</div>
    <div className="modal-actions"><button type="button" className="primary-button" onClick={onClose}>Terminé</button></div>
  </div></div>;
  */

  const renderThirdLevel = (category: CategoryTree, subcategory: CategoryTree["subcategories"][number], third: CategoryTree["subcategories"][number]["subcategories"][number]) => {
    const target: CategoryEditTarget = { key: `3:${category.name}:${subcategory.name}:${third.name}`, level: 3, category: category.name, subcategory: subcategory.name, subsubcategory: "", currentName: third.name };
    const expanded = !collapsedBranches.has(target.key);
    return <div className="category-manager-subbranch" key={third.name}>
      {node(target, third.subcategories.length > 0)}
      {expanded && third.subcategories.length > 0 && <div className="category-manager-greatgrandchildren" role="group">
        {third.subcategories.map((fourth) => node({ key: `4:${category.name}:${subcategory.name}:${third.name}:${fourth}`, level: 4, category: category.name, subcategory: subcategory.name, subsubcategory: third.name, currentName: fourth }, false))}
      </div>}
    </div>;
  };
  const renderSubcategory = (category: CategoryTree, subcategory: CategoryTree["subcategories"][number]) => {
    const target: CategoryEditTarget = { key: `2:${category.name}:${subcategory.name}`, level: 2, category: category.name, subcategory: "", subsubcategory: "", currentName: subcategory.name };
    const expanded = !collapsedBranches.has(target.key);
    return <div className="category-manager-subbranch" key={subcategory.name}>
      {node(target, subcategory.subcategories.length > 0)}
      {expanded && subcategory.subcategories.length > 0 && <div className="category-manager-grandchildren" role="group">{subcategory.subcategories.map((third) => renderThirdLevel(category, subcategory, third))}</div>}
    </div>;
  };
  const renderCategory = (category: CategoryTree) => {
    const target: CategoryEditTarget = { key: `1:${category.name}`, level: 1, category: category.name, subcategory: "", subsubcategory: "", currentName: category.name };
    const expanded = !collapsedBranches.has(target.key);
    return <section className="category-manager-branch" key={category.name}>
      {node(target, category.subcategories.length > 0)}
      {expanded && category.subcategories.length > 0 && <div className="category-manager-children" role="group">{category.subcategories.map((subcategory) => renderSubcategory(category, subcategory))}</div>}
    </section>;
  };
  return <div className="modal-backdrop category-manager-backdrop" role="presentation" onMouseDown={onClose}>
    <div className="modal-card expanded-modal category-manager-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-header"><div><h2>Catégories disponibles</h2><p>Organisez le catalogue jusqu’à quatre profondeurs.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
      <div className="category-manager-summary">{counts.map((count, index) => <div key={categoryLabels[index + 1]}><small>{categoryLabels[index + 1]}</small><strong>{count}</strong><span>{index === 0 ? "catégories" : "éléments"}</span></div>)}</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="category-create-form" onSubmit={create}>
        <div className="category-create-copy"><Plus size={16} /><span><strong>Ajouter</strong><small>Créez une famille ou une sous-famille vide.</small></span></div>
        <label><span>Type</span><select value={newDepth} onChange={(event) => { setNewDepth(Number(event.target.value) as 1 | 2 | 3 | 4); setNewCategory(""); setNewSubcategory(""); setNewSubsubcategory(""); }}><option value={1}>Famille</option><option value={2}>Sous-famille</option><option value={3}>Catégorie</option><option value={4}>Sous-catégorie</option></select></label>
        {newDepth >= 2 && <label><span>Famille parente</span><select value={newCategory} onChange={(event) => { setNewCategory(event.target.value); setNewSubcategory(""); setNewSubsubcategory(""); }} required><option value="">Choisir…</option>{tree.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>}
        {newDepth >= 3 && <label><span>Sous-famille parente</span><select value={newSubcategory} onChange={(event) => { setNewSubcategory(event.target.value); setNewSubsubcategory(""); }} required><option value="">Choisir…</option>{availableNewSubcategories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>}
        {newDepth === 4 && <label><span>Catégorie parente</span><select value={newSubsubcategory} onChange={(event) => setNewSubsubcategory(event.target.value)} required><option value="">Choisir…</option>{availableNewThirdLevels.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>}
        <label className="category-create-name"><span>Nom</span><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nouvelle famille" required /></label><button type="submit" className="primary-button" disabled={Boolean(busyKey)}><Plus size={15} />Ajouter</button>
      </form>
      <div className="category-tree-toolbar"><div><strong>Arborescence du catalogue</strong><span>Famille → Sous-famille → Catégorie → Sous-catégorie</span></div><label className="search-control"><Search size={14} /><input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Rechercher une famille…" aria-label="Rechercher une famille" /></label><div><button type="button" onClick={() => setCollapsedBranches(new Set())}>Tout déplier</button><button type="button" onClick={() => setCollapsedBranches(new Set(branchKeys))}>Tout replier</button></div></div>
      <div className="category-manager-tree" role="tree" aria-label="Arborescence des catégories">{visibleTree.map(renderCategory)}{!visibleTree.length && <div className="category-manager-empty"><Folder size={22} /><span>{categorySearch ? "Aucune catégorie trouvée." : "Aucune catégorie disponible."}</span></div>}</div>
      <div className="modal-actions"><button type="button" className="primary-button" onClick={onClose}>Terminé</button></div>
    </div>
  </div>;
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
  const [request, setRequest] = useState<{ rows: ArticleRecord[]; categories: CategoryTree[]; error: string; loadedKey: number }>({
    rows: [],
    categories: [],
    error: "",
    loadedKey: -1,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [familyFilter, setFamilyFilter] = useState("");
  const [subfamilyFilter, setSubfamilyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const loading = request.loadedKey !== reloadKey;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch("/api/articles", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Base indisponible");
        return response.json() as Promise<{ articles: ArticleRecord[]; categories?: CategoryTree[] }>;
      })
      .then(({ articles, categories }) => {
        if (active) setRequest({ rows: articles, categories: categories ?? [], error: "", loadedKey: reloadKey });
      })
      .catch((requestError: Error) => {
        if (active && requestError.name !== "AbortError") {
          setRequest({ rows: [], categories: [], error: "Impossible de charger la base SQLite locale.", loadedKey: reloadKey });
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

  const selectedFamily = request.categories.find((family) => family.name === familyFilter);
  const subfamilyOptions = selectedFamily?.subcategories ?? [];
  const selectedSubfamily = subfamilyOptions.find((subfamily) => subfamily.name === subfamilyFilter);
  const categoryOptions = selectedSubfamily?.subcategories ?? [];
  const selectedCategory = categoryOptions.find((category) => category.name === categoryFilter);
  const subcategoryOptions = selectedCategory?.subcategories ?? [];
  const filtered = request.rows.filter((article) => {
    const matchesSearch = normalizeLabel(`${article.name} ${article.sku} ${article.brand} ${article.category} ${article.subcategory ?? ""} ${article.subsubcategory ?? ""} ${article.subsubsubcategory ?? ""} ${article.description ?? ""} ${article.unit ?? ""}`).includes(normalizeLabel(search));
    const matchesCategory = (!familyFilter || article.category === familyFilter)
      && (!subfamilyFilter || article.subcategory === subfamilyFilter)
      && (!categoryFilter || article.subsubcategory === categoryFilter)
      && (!subcategoryFilter || article.subsubsubcategory === subcategoryFilter);
    return matchesSearch && matchesCategory && (!filterActive || article.stock <= 10);
  });
  const money = (value: number) => `${new Intl.NumberFormat("fr-FR").format(value)} DA`;

  return (
    <section className={`table-card articles-catalog view-${viewMode}`}>
      <div className="table-header">
        <div className="table-title"><h1>Catalogue articles</h1><span>{loading ? "Connexion à SQLite…" : `${filtered.length} articles`}</span></div>
        <div className="table-actions">
          <label className="search-control"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, référence, famille, catégorie…" aria-label="Rechercher dans le catalogue et les catégories" />{search && <button type="button" aria-label="Effacer la recherche" onClick={() => setSearch("")}><X size={14} /></button>}</label>
          <div className="article-hierarchy-filters" aria-label="Filtres de l’arborescence du catalogue">
            <label className="compact-select article-category-select"><span>Famille</span><select value={familyFilter} onChange={(event) => { setFamilyFilter(event.target.value); setSubfamilyFilter(""); setCategoryFilter(""); setSubcategoryFilter(""); }} aria-label="Filtrer par famille"><option value="">Toutes</option>{request.categories.map((family) => <option key={family.name} value={family.name}>{family.name}</option>)}</select></label>
            <label className="compact-select article-category-select"><span>Sous-famille</span><select value={subfamilyFilter} onChange={(event) => { setSubfamilyFilter(event.target.value); setCategoryFilter(""); setSubcategoryFilter(""); }} aria-label="Filtrer par sous-famille" disabled={!familyFilter}><option value="">Toutes</option>{subfamilyOptions.map((subfamily) => <option key={subfamily.name} value={subfamily.name}>{subfamily.name}</option>)}</select></label>
            <label className="compact-select article-category-select"><span>Catégorie</span><select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setSubcategoryFilter(""); }} aria-label="Filtrer par catégorie" disabled={!subfamilyFilter}><option value="">Toutes</option>{categoryOptions.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}</select></label>
            <label className="compact-select article-category-select"><span>Sous-catégorie</span><select value={subcategoryFilter} onChange={(event) => setSubcategoryFilter(event.target.value)} aria-label="Filtrer par sous-catégorie" disabled={!categoryFilter}><option value="">Toutes</option>{subcategoryOptions.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}</select></label>
          </div>
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
                <div className="article-hierarchy"><span>{article.category || "Sans catégorie"}</span></div>
                <div className="article-card-prices"><div><small>Prix achat</small><strong>{money(article.purchase_price)}</strong></div><div><small>Prix vente · {article.sale_prices?.length || 1} tarif{(article.sale_prices?.length || 1) === 1 ? "" : "s"}</small><strong>{money(article.sale_price)}</strong></div></div>
              </div>
              <footer><span className={`stock-value ${article.stock <= 10 ? "low" : ""}`}>{article.stock} {article.unit || "unité"}{article.stock > 1 && article.unit === "unité" ? "s" : ""}</span><button type="button" className="secondary-button" onClick={() => onEdit(article)}><Pencil size={14} /> Organiser</button></footer>
            </article>
          ))}
          {!filtered.length && <div className="article-catalog-message">Aucun article pour ces critères.</div>}
        </div>
      )}
      {!loading && !request.error && viewMode === "list" && (
        <div className="table-scroll"><table><thead><tr><th>Article</th><th>Catégorie</th><th>Unité</th><th>Prix d’achat</th><th>Prix de vente</th><th>Stock</th><th>Statut</th><th /></tr></thead><tbody>
          {filtered.map((article) => <tr key={article.id}><td><div className="identity-cell"><ProductVisual article={article} className="table-product-visual" /><div><strong>{article.name}</strong><small>{article.description || article.brand}</small></div></div></td><td><span className="soft-label">{article.category || "Sans catégorie"}</span></td><td><span className="soft-label">{article.unit || "unité"}</span></td><td className="number">{money(article.purchase_price)}</td><td className="number"><strong>{money(article.sale_price)}</strong><small>{article.sale_prices?.length || 1} tarif{(article.sale_prices?.length || 1) === 1 ? "" : "s"}</small></td><td><span className={`stock-value ${article.stock <= 10 ? "low" : ""}`}>{article.stock}</span></td><td><StatusBadge label={article.status} tone={article.stock <= 10 ? "orange" : "green"} /></td><td><RowActions label={article.name} notify={notify} onEdit={() => onEdit(article)} onDelete={() => void deleteArticle(article)} /></td></tr>)}
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
  onTransfer,
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
  onTransfer: (row: DocumentRecord, targetType: string) => Promise<void> | void;
  onPrint: (row: DocumentRecord) => void;
}) {
  const closedStatuses = ["Payée", "Livré", "Reçu", "Traité", "Validé"];
  const filtered = rows.filter((row) => {
    const matchesSearch = `${row.number} ${row.party} ${row.type}`.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all"
      || (activeTab === "quotes" && row.type === "Devis")
      || (activeTab === "orders" && row.type.includes("commande"))
      || (activeTab === "delivery" && (row.type.includes("livraison") || row.type.includes("achat")))
      || (activeTab === "invoices" && row.type === "Facture")
      || (activeTab === "returns" && row.type === "Bon de retour");
    return matchesSearch && matchesTab && (!filterActive || !closedStatuses.includes(row.status));
  });
  const transferTargets = (row: DocumentRecord) => {
    const deliveryType = page === "purchases" ? "Bon d’achat" : "Bon de livraison";
    const orderAlreadyTransferred = row.type === "Bon de commande" && rows.some((candidate) =>
      candidate.sourceDocumentId === row.id && [deliveryType, "Facture"].includes(candidate.type),
    );
    if (orderAlreadyTransferred) return [];
    const targets = row.type === "Devis"
      ? ["Bon de commande"]
      : row.type === "Bon de commande"
        ? [deliveryType, "Facture"]
        : row.type === deliveryType
          ? ["Facture"]
          : [];
    return targets.filter((targetType) => !rows.some((candidate) =>
      candidate.sourceDocumentId === row.id && candidate.type === targetType,
    ));
  };
  return (
    <TableCard className={`documents-workspace-card documents-${page}`} title={page === "purchases" ? "Documents d’achat" : "Documents de vente"} count={`${filtered.length} documents`} tabs={documentTabsFor(page)} activeTab={activeTab} setActiveTab={setActiveTab} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode}>
      <table className="documents-modern-table">
        <thead><tr><th>Document</th><th>{page === "purchases" ? "Fournisseur" : "Client"}</th><th>Type</th><th>Date</th><th>Montant</th><th>Statut</th><th /></tr></thead>
        <tbody>
          {filtered.map((row) => {
            const availableTransfers = transferTargets(row);
            return (
            <tr key={row.number}>
              <td><div className="document-cell"><DocumentLogo type={row.type} tone={row.tone} /><strong>{row.number}</strong></div></td>
              <td><div className="identity-cell"><EntityLogo name={row.party} tone={row.tone} kind={page === "purchases" ? "supplier" : "client"} /><div><strong>{row.party}</strong>{row.summary && <small>{row.summary}</small>}</div></div></td>
              <td><span className="soft-label">{row.type}</span></td>
              <td>{row.date}</td>
              <td className={`number ${row.amount.startsWith("-") ? "negative-number" : ""}`}>{row.amount}</td>
              <td><StatusBadge label={row.status} tone={row.tone} /></td>
              <td>
                <div className="document-row-actions">
                  {availableTransfers.length > 0 && (
                    <div className="document-transfer-action">
                      <button
                        className="icon-button document-transfer-button"
                        type="button"
                        aria-label={`Transférer ${row.number}`}
                        aria-haspopup="menu"
                        title="Transférer ce document"
                      >
                        <ArrowRight size={16} />
                      </button>
                      <div className="document-transfer-menu" role="menu" aria-label={`Transferts possibles pour ${row.number}`}>
                        <span>Transférer vers</span>
                        {availableTransfers.map((targetType) => (
                          <button
                            key={targetType}
                            type="button"
                            role="menuitem"
                            onClick={() => { void Promise.resolve(onTransfer(row, targetType)).catch((error) => notify(error instanceof Error ? error.message : "Impossible de transférer le document.")); }}
                          >
                            <DocumentLogo type={targetType} tone="blue" />
                            <span><strong>{targetType}</strong><small>Reprendre le tiers et toutes les lignes</small></span>
                            <ArrowRight size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                    ...((row.type === "Bon de livraison" || row.type === "Bon d’achat" || row.type === "Facture") && row.articleId && (row.quantity ?? 1) > (row.returnedQuantity ?? 0) ? [{ label: "Créer un retour", icon: RotateCcw, onClick: () => onReturn(row) }] : []),
                  ]} />
                </div>
              </td>
            </tr>
          );})}
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
  const format: LibraryRecord["format"] = normalized.includes("livraison") || normalized.includes("reception") || normalized.includes("achat")
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
      || (category === "delivery" && (normalizedType.includes("livraison") || normalizedType.includes("reception") || normalizedType.includes("achat")))
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
  clients,
  suppliers,
}: {
  onViewSales: () => void;
  purchases: DocumentRecord[];
  sales: DocumentRecord[];
  clients: ClientRecord[];
  suppliers: SupplierRecord[];
}) {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "all">("day");
  const [productDirection, setProductDirection] = useState<"sales" | "purchases">("purchases");
  const [partyDirection, setPartyDirection] = useState<"clients" | "suppliers">("clients");
  const now = new Date();
  const localIsoDate = (date: Date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  };
  const today = localIsoDate(now);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const periodIncludes = (row: DocumentRecord) => {
    const date = row.rawDate || "";
    if (period === "all") return true;
    if (period === "day") return date === today;
    if (period === "month") return date.startsWith(today.slice(0, 7));
    return date >= localIsoDate(weekStart) && date <= today;
  };
  const filteredSales = sales.filter(periodIncludes);
  const filteredPurchases = purchases.filter(periodIncludes);
  const activities = [
    ...filteredSales.map((row) => ({ ...row, workspace: "Ventes" })),
    ...filteredPurchases.map((row) => ({ ...row, workspace: "Achats" })),
  ].slice(0, 2);
  const productDocuments = productDirection === "sales" ? filteredSales : filteredPurchases;
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
  const partyDocuments = (partyDirection === "clients" ? filteredSales : filteredPurchases).filter((row) =>
    partyDirection === "clients"
      ? row.type === "Facture" || row.type === "Bon de livraison"
      : row.type === "Facture" || row.type === "Bon d’achat",
  );
  const partyTotals = new Map<string, number>();
  partyDocuments.forEach((row) => {
    partyTotals.set(row.party, (partyTotals.get(row.party) ?? 0) + amountOf(row));
  });
  const partyRanking = Array.from(partyTotals, ([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 5);
  const maximumPartyAmount = Math.max(...partyRanking.map(({ value }) => value), 1);
  const invoicedSales = filteredSales.filter((row) => row.type === "Facture" || row.type === "Bon de livraison");
  const recordedPurchases = filteredPurchases.filter((row) => row.type === "Facture" || row.type === "Bon d’achat");
  const activeClients = new Set(filteredSales.map((row) => row.party)).size;
  const activeSuppliers = new Set(filteredPurchases.map((row) => row.party)).size;
  const dashboardKpis: { value: string; label: string; trend: string; tone: string; icon: LucideIcon; direction: "up" | "down" }[] = [
    { value: formatDa(invoicedSales.reduce((sum, row) => sum + Math.abs(row.total ?? amountOf(row)), 0)), label: "Chiffre d'Affaires", trend: `${invoicedSales.length} document${invoicedSales.length === 1 ? "" : "s"}`, tone: "primary", icon: WalletCards, direction: "up" },
    { value: formatDa(recordedPurchases.reduce((sum, row) => sum + Math.abs(row.total ?? amountOf(row)), 0)), label: "Achats enregistrés", trend: `${recordedPurchases.length} document${recordedPurchases.length === 1 ? "" : "s"}`, tone: "danger", icon: BarChart3, direction: "up" },
    { value: String(filteredSales.length), label: "Ventes", trend: `${filteredSales.length} vente${filteredSales.length === 1 ? "" : "s"} sur la période`, tone: "success", icon: ShoppingBasket, direction: "up" },
    { value: String(clients.length), label: "Clients", trend: `${activeClients} actif${activeClients === 1 ? "" : "s"}`, tone: "warning", icon: Users, direction: "up" },
    { value: String(suppliers.length), label: "Fournisseurs", trend: `${activeSuppliers} actif${activeSuppliers === 1 ? "" : "s"}`, tone: "info", icon: Truck, direction: "up" },
  ];
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div><h1>Vue d’ensemble</h1><p>Les chiffres essentiels de votre activité.</p></div>
        <div className="dashboard-period" aria-label="Période du tableau de bord">
          {([['day', 'Jour'], ['week', 'Semaine'], ['month', 'Mois'], ['all', 'Total']] as const).map(([value, label]) => (
            <button key={value} className={period === value ? "active" : ""} onClick={() => setPeriod(value)} aria-pressed={period === value}>{label}</button>
          ))}
        </div>
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

const feedbackStatusOptions: { value: FeedbackStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "open", label: "Ouverts" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolus" },
  { value: "closed", label: "Fermés" },
];

const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};

const feedbackStatusTones: Record<FeedbackStatus, string> = {
  open: "orange",
  in_progress: "blue",
  resolved: "green",
  closed: "gray",
};

const feedbackPriorityLabels: Record<FeedbackPriority, string> = {
  low: "Faible",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

function FeedbackPage({ notify }: { notify: (message: string) => void }) {
  const [rows, setRows] = useState<FeedbackRecord[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FeedbackStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ query, status });
      fetch(`/api/feedback?${params}`, { cache: "no-store", signal: controller.signal })
        .then(async (response) => {
          const payload = await response.json() as { feedback?: FeedbackRecord[]; error?: string };
          if (!response.ok) throw new Error(payload.error || "Impossible de charger les feedbacks.");
          setRows(payload.feedback ?? []);
        })
        .catch((requestError: Error) => {
          if (requestError.name !== "AbortError") setError(requestError.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, status]);

  const updateStatus = async (row: FeedbackRecord, nextStatus: FeedbackStatus) => {
    setSavingId(row.id);
    try {
      const response = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, status: nextStatus }),
      });
      const payload = await response.json() as { feedback?: FeedbackRecord; error?: string };
      if (!response.ok || !payload.feedback) throw new Error(payload.error || "Impossible de changer le statut.");
      setRows((current) => status !== "all" && status !== nextStatus
        ? current.filter((item) => item.id !== row.id)
        : current.map((item) => item.id === row.id ? payload.feedback! : item));
      notify(`Feedback marqué « ${feedbackStatusLabels[nextStatus]} »`);
    } catch (requestError) {
      notify(requestError instanceof Error ? requestError.message : "Impossible de changer le statut.");
    } finally {
      setSavingId(null);
    }
  };

  const removeFeedback = async (row: FeedbackRecord) => {
    if (!window.confirm(`Supprimer définitivement « ${row.title} » ?`)) return;
    setSavingId(row.id);
    try {
      const response = await fetch("/api/feedback", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible de supprimer ce feedback.");
      setRows((current) => current.filter((item) => item.id !== row.id));
      notify("Feedback supprimé");
    } catch (requestError) {
      notify(requestError instanceof Error ? requestError.message : "Impossible de supprimer ce feedback.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="feedback-page">
      <section className="table-card feedback-table-card">
        <div className="table-header feedback-table-header">
          <div className="table-title"><h1>Feedback des utilisateurs</h1><span>{rows.length} signalement{rows.length === 1 ? "" : "s"} affiché{rows.length === 1 ? "" : "s"}</span></div>
          <div className="table-actions">
            <label className="search-control"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un feedback…" aria-label="Rechercher un feedback" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche"><X size={14} /></button>}</label>
            <button type="button" className="primary-button" onClick={() => setCreateOpen(true)}><Plus size={16} /> Nouveau feedback</button>
          </div>
        </div>
        <div className="feedback-status-tabs" aria-label="Filtrer par statut">
          {feedbackStatusOptions.map((option) => <button key={option.value} type="button" className={status === option.value ? "active" : ""} onClick={() => setStatus(option.value)}>{option.label}</button>)}
        </div>
        <div className="table-scroll feedback-table-scroll">
          <table className="feedback-table">
            <thead><tr><th>Type</th><th>Sujet</th><th>Priorité</th><th>Statut</th><th>Signalé par</th><th>Date</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><span className={`feedback-type feedback-type-${row.type}`}>{row.type === "bug" ? <Bug size={15} /> : <Lightbulb size={15} />}{row.type === "bug" ? "Erreur" : "Proposition"}</span></td>
                  <td><div className="feedback-subject"><strong>{row.title}</strong><p>{row.description}</p></div></td>
                  <td><span className={`feedback-priority feedback-priority-${row.priority}`}>{feedbackPriorityLabels[row.priority]}</span></td>
                  <td><label className={`feedback-status-select status-${feedbackStatusTones[row.status]}`}><span>{feedbackStatusLabels[row.status]}</span><ChevronDown size={13} /><select value={row.status} disabled={savingId === row.id} onChange={(event) => void updateStatus(row, event.target.value as FeedbackStatus)} aria-label={`Statut de ${row.title}`}>{feedbackStatusOptions.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></td>
                  <td><span className="feedback-reporter">{row.reporter}</span></td>
                  <td><time dateTime={row.created_at}>{new Intl.DateTimeFormat("fr-DZ", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${row.created_at.replace(" ", "T")}Z`))}</time></td>
                  <td><button type="button" className="icon-button feedback-delete" disabled={savingId === row.id} onClick={() => void removeFeedback(row)} aria-label={`Supprimer ${row.title}`}><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {!loading && !rows.length && <tr><td colSpan={7} className="feedback-empty"><MessageSquareText size={28} /><strong>Aucun feedback dans cette vue</strong><span>Les erreurs et propositions envoyées apparaîtront ici.</span><button type="button" className="text-button" onClick={() => setCreateOpen(true)}>Créer le premier</button></td></tr>}
            </tbody>
          </table>
          {loading && <div className="feedback-loading">Chargement des feedbacks…</div>}
          {error && <div className="feedback-error" role="alert">{error}</div>}
        </div>
      </section>
      {createOpen && <FeedbackCreateModal onClose={() => setCreateOpen(false)} onCreated={(feedback) => { setCreateOpen(false); setRows((current) => status === "all" || status === "open" ? [feedback, ...current] : current); notify("Feedback envoyé et marqué ouvert"); }} />}
    </div>
  );
}

function FeedbackCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (feedback: FeedbackRecord) => void }) {
  const [type, setType] = useState<FeedbackType>("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<FeedbackPriority>("normal");
  const [reporter, setReporter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, title, description, priority, reporter }) });
      const payload = await response.json() as { feedback?: FeedbackRecord; error?: string };
      if (!response.ok || !payload.feedback) throw new Error(payload.error || "Impossible d’envoyer le feedback.");
      onCreated(payload.feedback);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible d’envoyer le feedback.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="modal-card feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-header"><div><h2 id="feedback-modal-title">Nouveau feedback</h2><p>Signalez une erreur ou proposez une amélioration.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
        <div className="feedback-type-picker">
          <button type="button" className={type === "bug" ? "active bug" : "bug"} onClick={() => setType("bug")}><Bug size={18} /><span><strong>Signaler une erreur</strong><small>Un problème empêche de travailler correctement.</small></span></button>
          <button type="button" className={type === "suggestion" ? "active suggestion" : "suggestion"} onClick={() => setType("suggestion")}><Lightbulb size={18} /><span><strong>Faire une proposition</strong><small>Une idée pour améliorer l’application.</small></span></button>
        </div>
        <label className="field-label">Sujet<input required maxLength={140} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "bug" ? "Ex. Impossible de supprimer une ligne" : "Ex. Ajouter un nouveau filtre"} /></label>
        <label className="field-label">Description<textarea required rows={5} maxLength={4000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Expliquez ce qui se passe, où et ce que vous attendiez…" /></label>
        <div className="form-grid">
          <label className="field-label">Priorité<select value={priority} onChange={(event) => setPriority(event.target.value as FeedbackPriority)}><option value="low">Faible</option><option value="normal">Normale</option><option value="high">Haute</option><option value="urgent">Urgente</option></select></label>
          <label className="field-label">Votre nom (facultatif)<input maxLength={100} value={reporter} onChange={(event) => setReporter(event.target.value)} placeholder="Utilisateur" /></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button type="submit" className="primary-button" disabled={saving}><MessageSquareText size={15} />{saving ? "Envoi…" : "Envoyer le feedback"}</button></div>
      </form>
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
  const [activityLine1, setActivityLine1] = useState(company.activityLine1);
  const [activityLine2, setActivityLine2] = useState(company.activityLine2);
  const [rc, setRc] = useState(company.rc);
  const [taxArticle, setTaxArticle] = useState(company.taxArticle);
  const [nif, setNif] = useState(company.nif);
  const [rib, setRib] = useState(company.rib);
  const [bank, setBank] = useState(company.bank);
  const [address, setAddress] = useState(company.address);
  const [city, setCity] = useState(company.city);
  const [phone, setPhone] = useState(company.phone);
  const [feedbackEnabled, setFeedbackEnabled] = useState(company.feedbackEnabled);
  const logoInput = useRef<HTMLInputElement | null>(null);
  const previewCompany = {
    name: name.trim() || "Nom de l’entreprise",
    logoDataUrl,
    defaultTaxRate: Number(defaultTaxRate) || 0,
    activityLine1,
    activityLine2,
    rc,
    taxArticle,
    nif,
    rib,
    bank,
    address,
    city,
    phone,
    feedbackEnabled,
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
            const saved = onSave({ name, logoDataUrl, defaultTaxRate: Number(defaultTaxRate), activityLine1, activityLine2, rc, taxArticle, nif, rib, bank, address, city, phone, feedbackEnabled });
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

          <div className="settings-section-title settings-print-title">
            <span><Printer size={17} /></span>
            <div><h2>Coordonnées d’impression</h2><p>En-tête repris sur les devis, factures, commandes et bons.</p></div>
          </div>

          <div className="form-grid">
            <label className="field-label">Activité — ligne 1<input value={activityLine1} onChange={(event) => setActivityLine1(event.target.value)} /></label>
            <label className="field-label">Activité — ligne 2<input value={activityLine2} onChange={(event) => setActivityLine2(event.target.value)} /></label>
          </div>
          <div className="form-grid form-grid-three">
            <label className="field-label">RC<input value={rc} onChange={(event) => setRc(event.target.value)} /></label>
            <label className="field-label">Article fiscal<input value={taxArticle} onChange={(event) => setTaxArticle(event.target.value)} /></label>
            <label className="field-label">NIF<input value={nif} onChange={(event) => setNif(event.target.value)} /></label>
          </div>
          <div className="form-grid">
            <label className="field-label">RIB<input value={rib} onChange={(event) => setRib(event.target.value)} /></label>
            <label className="field-label">Banque / agence<input value={bank} onChange={(event) => setBank(event.target.value)} /></label>
          </div>
          <div className="form-grid">
            <label className="field-label">Adresse<input value={address} onChange={(event) => setAddress(event.target.value)} /></label>
            <label className="field-label">Ville d’impression<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Béjaïa" /></label>
          </div>
          <div className="form-grid">
            <label className="field-label">Téléphone(s)<input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          </div>

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

          <div className="settings-section-title settings-feedback-title">
            <span><MessageSquareText size={17} /></span>
            <div><h2>Page Feedback</h2><p>Contrôlez sa visibilité pour tous les utilisateurs de cet appareil.</p></div>
          </div>
          <label className="settings-toggle-row">
            <span><strong>Afficher Feedback dans la navigation</strong><small>Permet de signaler des erreurs et de proposer des améliorations.</small></span>
            <input type="checkbox" checked={feedbackEnabled} onChange={(event) => setFeedbackEnabled(event.target.checked)} />
            <i aria-hidden="true" />
          </label>

          {/* Le mot de passe est désormais géré uniquement à la connexion.
          <div className="settings-section-title settings-access-title">
            <span><Settings2 size={17} /></span>
            <div><h2>Accès à l’application</h2><p>Un mot de passe est demandé à l’ouverture dans un nouvel onglet.</p></div>
          </div>
          <div className="form-grid">
            <label className="field-label">Mot de passe actuel
              <input type="password" value={currentAccessPassword} onChange={(event) => setCurrentAccessPassword(event.target.value)} autoComplete="current-password" placeholder="Mot de passe actuel" />
            </label>
            <label className="field-label">Nouveau mot de passe
              <input type="password" minLength={4} value={newAccessPassword} onChange={(event) => setNewAccessPassword(event.target.value)} autoComplete="new-password" placeholder="Laissez vide pour conserver" />
            </label>
          </div>
          <label className="field-label">Confirmer le nouveau mot de passe
            <input type="password" minLength={4} value={confirmAccessPassword} onChange={(event) => setConfirmAccessPassword(event.target.value)} autoComplete="new-password" placeholder="Confirmez le nouveau mot de passe" />
            <small>Mot de passe par défaut : genie2020.</small>
          </label>

          */}
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
                setLogoDataUrl(DEFAULT_COMPANY.logoDataUrl);
                setDefaultTaxRate(String(DEFAULT_COMPANY.defaultTaxRate));
                setActivityLine1(DEFAULT_COMPANY.activityLine1);
                setActivityLine2(DEFAULT_COMPANY.activityLine2);
                setRc(DEFAULT_COMPANY.rc);
                setTaxArticle(DEFAULT_COMPANY.taxArticle);
                setNif(DEFAULT_COMPANY.nif);
                setRib(DEFAULT_COMPANY.rib);
                setBank(DEFAULT_COMPANY.bank);
                setAddress(DEFAULT_COMPANY.address);
                setCity(DEFAULT_COMPANY.city);
                setPhone(DEFAULT_COMPANY.phone);
                setFeedbackEnabled(DEFAULT_COMPANY.feedbackEnabled);
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
          <div className="settings-print-mini">
            <CompanyLogo company={previewCompany} className="settings-print-mini-logo" />
            <div><h3>{previewCompany.name}</h3><p>{previewCompany.activityLine1}</p><p>{previewCompany.activityLine2}</p><small>RC : {previewCompany.rc} · Art. Imp : {previewCompany.taxArticle} · NIF : {previewCompany.nif}</small><small>RIB : {previewCompany.rib} · {previewCompany.bank}</small><span>Adresse : {previewCompany.address}</span><strong>{previewCompany.phone}</strong></div>
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
                  <EntityLogo name={selectedParty.name} tone={selectedParty.color} kind={initialTarget === "purchases" ? "supplier" : "client"} imageUrl={selectedParty.imageUrl} />
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
                        <EntityLogo name={party.name} tone={party.color} kind={initialTarget === "purchases" ? "supplier" : "client"} imageUrl={party.imageUrl} />
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
                <option>{initialTarget === "purchases" ? "Bon d’achat" : "Bon de livraison"}</option>
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
  onCreateParty,
}: {
  initialTarget: "purchases" | "sales";
  initialDocument?: DocumentRecord | null;
  initialDocumentType?: string;
  defaultTaxRate: number;
  parties: PartyRow[];
  onClose: () => void;
  onSubmit: (payload: CreatePayload) => Promise<void> | void;
  onCreateParty: (body: Record<string, unknown>) => Promise<ApiPartyRecord>;
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
  const [duplicateNotice, setDuplicateNotice] = useState<{
    existingKey: string;
    articleName: string;
    quantity: number;
    unitPrice: number;
  } | null>(null);
  const documentType = initialDocument?.type ?? initialDocumentType ?? "Devis";
  const [documentDate, setDocumentDate] = useState(initialDocument?.rawDate ?? new Date().toISOString().slice(0, 10));
  const [quickPartyOpen, setQuickPartyOpen] = useState(false);
  const [createdParty, setCreatedParty] = useState<PartyRow | null>(null);
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
  const selectedParty = parties.find((party) => party.id === selectedPartyId)
    ?? (createdParty?.id === selectedPartyId ? createdParty : null);
  const selectedDraftArticle = selectedArticleId ? articleRequest.rows.find((row) => row.id === selectedArticleId) : null;
  const categoryPriceForParty = (article: ArticleRecord | null | undefined, party: PartyRow | null) => {
    if (!article || initialTarget !== "sales" || !party || !("clientCategory" in party)) return undefined;
    const category = party.clientCategory || "Tarif général";
    return article.sale_prices?.find((price) => normalizeLabel(price.client_category || price.label) === normalizeLabel(category))?.sale_price;
  };
  const priceForParty = (article: ArticleRecord, party: PartyRow | null) => {
    if (initialTarget === "purchases") return article.purchase_price;
    return categoryPriceForParty(article, party) ?? article.sale_price;
  };

  const refreshPricesForParty = (party: PartyRow | null) => {
    if (initialTarget !== "sales" || !party) return;
    setDraftUnitPrice(selectedDraftArticle ? String(priceForParty(selectedDraftArticle, party)) : "1");
    setLines((rows) => rows.map((line) => {
      const article = line.articleId ? articleRequest.rows.find((row) => row.id === line.articleId) : null;
      return article ? { ...line, unitPrice: priceForParty(article, party) } : line;
    }));
  };

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
    setArticleQuery(article ? `${article.name} · ${article.sku}` : query);
    setSelectedArticleId(article?.id ?? null);
    if (article) {
      setDraftUnitPrice(String(priceForParty(article, selectedParty)));
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
    const existingLine = lines.find((line) => line.articleId === article.id);
    if (existingLine) {
      setDuplicateNotice({ existingKey: existingLine.key, articleName: article.name, quantity, unitPrice });
      setSubmitError("");
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
    setDuplicateNotice(null);
  };

  const resolveDuplicate = (mode: "replace" | "add") => {
    if (!duplicateNotice) return;
    setLines((rows) => rows.map((line) => line.key === duplicateNotice.existingKey
      ? {
          ...line,
          quantity: mode === "add" ? line.quantity + duplicateNotice.quantity : duplicateNotice.quantity,
          unitPrice: mode === "replace" ? duplicateNotice.unitPrice : line.unitPrice,
        }
      : line));
    setArticleQuery("");
    setSelectedArticleId(null);
    setDraftQuantity("");
    setDraftUnitPrice("");
    setDuplicateNotice(null);
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

  const documentTitle = documentType === "Facture"
    ? { article: "une", label: "facture" }
    : documentType === "Devis"
      ? { article: "un", label: "devis" }
      : { article: "un", label: documentType.toLowerCase() };

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
    <section className="document-editor-page" aria-labelledby="pure-document-title">
      <form className="pure-table-editor document-fullscreen-editor" aria-labelledby="pure-document-title" onSubmit={submit}>
        <header className="document-screen-header">
          <div className="document-screen-heading">
            <button type="button" className="document-back-button" onClick={onClose} disabled={saving} aria-label="Retour aux documents"><ArrowLeft size={19} /></button>
            <span className="pure-editor-symbol">{initialTarget === "purchases" ? <ShoppingBag size={20} /> : <Store size={20} />}</span>
            <span>
              <small>{initialTarget === "purchases" ? "Achats" : "Ventes"} / {documentType || "Nouveau document"}</small>
              <strong id="pure-document-title">{initialDocument ? `Modifier ${initialDocument.number}` : <>Créer {documentTitle.article} <span className="document-title-type">{documentTitle.label}</span> {initialTarget === "purchases" ? "d’achat" : "de vente"}</>}</strong>
            </span>
          </div>
          <div className="document-screen-actions">
            <button type="button" className="document-cancel-button" onClick={onClose} disabled={saving}>Annuler</button>
            <button type="submit" className="pure-save-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : "Enregistrer"}</button>
          </div>
        </header>

        <div className="document-screen-content">
          <section className="document-info-card document-command-bar" aria-label="Informations et ajout d’article">
            <div className="document-command-grid">
              <label className="document-party-field">
                <span>{initialTarget === "purchases" ? "Fournisseur" : "Client"}</span>
                <div className="document-party-input">
                  <input
                    required
                    list="pure-party-options"
                    value={partyQuery}
                    onChange={(event) => {
                      const query = event.target.value;
                      setPartyQuery(query);
                      const party = parties.find((row) => normalizeLabel(row.name) === normalizeLabel(query.trim()));
                      setSelectedPartyId(party?.id ?? null);
                      refreshPricesForParty(party ?? null);
                    }}
                    placeholder={`Rechercher un ${initialTarget === "purchases" ? "fournisseur" : "client"}`}
                  />
                  <button type="button" onClick={() => setQuickPartyOpen(true)} title={`Ajouter un ${initialTarget === "purchases" ? "fournisseur" : "client"}`} aria-label={`Ajouter un ${initialTarget === "purchases" ? "fournisseur" : "client"}`}><UserPlus size={16} /></button>
                </div>
              </label>
              <label className="pure-article-control document-command-article">
                <span>Article à ajouter</span>
                <input
                  list="pure-article-options"
                  value={articleQuery}
                  onChange={(event) => selectDraftArticle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    selectDraftArticle(event.currentTarget.value);
                  }}
                  placeholder={articleRequest.loading ? "Chargement…" : "Rechercher par nom ou référence"}
                  aria-label="Rechercher un article à ajouter"
                />
              </label>
              <label className="document-command-number">
                <span>Quantité</span>
                <input type="number" min="0.001" step="0.001" value={draftQuantity} onChange={(event) => setDraftQuantity(event.target.value)} placeholder="1" aria-label="Quantité de la ligne à ajouter" />
              </label>
              <label className="document-command-number">
                <span>Prix unitaire</span>
                <div className="document-price-picker">
                  <input type="number" min="0" step="0.01" value={draftUnitPrice} onChange={(event) => setDraftUnitPrice(event.target.value)} placeholder="0" aria-label="Prix unitaire de la ligne à ajouter" />
                  {initialTarget === "sales" && categoryPriceForParty(selectedDraftArticle, selectedParty) === undefined && (selectedDraftArticle?.sale_prices?.length ?? 0) > 1 && <select value={draftUnitPrice} onChange={(event) => setDraftUnitPrice(event.target.value)} aria-label="Choisir un tarif de vente">{selectedDraftArticle?.sale_prices.map((price) => <option key={`${price.label}-${price.sale_price}`} value={String(price.sale_price)}>{price.label}</option>)}</select>}
                </div>
              </label>
              <label className="document-date-field">
                <span>Date</span>
                <input type="date" required value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} />
              </label>
              <button type="button" className="pure-add-line-button document-command-add" onClick={addLine} disabled={saving}><Plus size={16} /><span>Ajouter</span></button>
            </div>
          </section>

          <section className="document-lines-card" aria-label="Articles du document">
            {duplicateNotice && <div className="duplicate-line-notice"><div><span className="duplicate-line-icon"><Copy size={17} /></span><span><strong>{duplicateNotice.articleName} est déjà dans le tableau</strong><small>Modifiez la ligne existante ou additionnez la nouvelle quantité.</small></span><div className="duplicate-line-actions"><button type="button" onClick={() => resolveDuplicate("replace")}>Remplacer par {duplicateNotice.quantity}</button><button type="button" className="duplicate-confirm" onClick={() => resolveDuplicate("add")}>Ajouter +{duplicateNotice.quantity}</button><button type="button" className="duplicate-cancel" onClick={() => setDuplicateNotice(null)} aria-label="Annuler"><X size={15} /></button></div></div></div>}
            <div className="document-lines-table-scroll">
              <table className="pure-document-table">
                <caption>{initialDocument ? "Modifier" : "Ajouter"} {initialTarget === "purchases" ? "un achat" : "une vente"}</caption>
                <thead><tr className="pure-column-headings"><th>#</th><th>Article</th><th>Désignation</th><th>Unité</th><th>Quantité</th><th>Prix unit.</th><th>Remise %</th><th>TVA %</th><th>Total</th><th /></tr></thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={line.key}>
                      <td className="pure-line-index">{index + 1}</td>
                      <td><span className="pure-cell-text">{line.articleQuery || "—"}</span></td>
                      <td><input required value={line.designation} onChange={(event) => updateLine(line.key, { designation: event.target.value })} placeholder="Désignation" aria-label={`Désignation ligne ${index + 1}`} /></td>
                      <td><input value={line.unit} onChange={(event) => updateLine(line.key, { unit: event.target.value })} aria-label={`Unité ligne ${index + 1}`} /></td>
                      <td><input type="number" min="1" step="1" required value={line.quantity || ""} onChange={(event) => updateLine(line.key, { quantity: Number(event.target.value) })} aria-label={`Quantité ligne ${index + 1}`} /></td>
                      <td><input type="number" min="0" step="1" required value={line.unitPrice || ""} onChange={(event) => updateLine(line.key, { unitPrice: Number(event.target.value) })} aria-label={`Prix unitaire ligne ${index + 1}`} /></td>
                      <td><input type="number" min="0" max="100" step="1" value={line.discountPercent || ""} onChange={(event) => updateLine(line.key, { discountPercent: Number(event.target.value) })} aria-label={`Remise ligne ${index + 1}`} /></td>
                      <td><input type="number" min="0" max="100" step="1" value={line.taxRate || ""} onChange={(event) => updateLine(line.key, { taxRate: Number(event.target.value) })} aria-label={`TVA ligne ${index + 1}`} /></td>
                      <td className="pure-line-total">{formatDa(lineTotal(line))}</td>
                      <td><button type="button" className="pure-delete-line" onClick={() => removeLine(line.key)} aria-label={`Supprimer la ligne ${index + 1}`} title="Supprimer cette ligne"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                  {!lines.length && <tr className="pure-empty-lines-row"><td colSpan={10}><span>Le document est vide</span><small>Sélectionnez un article dans la barre supérieure puis cliquez sur « Ajouter ».</small></td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className="document-summary-bar">
          <div className="document-summary-context">
            <span>{lines.length} ligne{lines.length === 1 ? "" : "s"}</span>
            <strong>{selectedParty?.name || `${initialTarget === "purchases" ? "Fournisseur" : "Client"} non sélectionné`}</strong>
            {(articleRequest.error || submitError) && <p>{articleRequest.error || submitError}</p>}
          </div>
          <div className="document-summary-totals">
            <span><small>Sous-total</small><strong>{formatDa(subtotal)}</strong></span>
            <span><small>Remise</small><strong>- {formatDa(discountAmount)}</strong></span>
            <span><small>TVA</small><strong>{formatDa(taxAmount)}</strong></span>
            <span className="document-summary-grand-total"><small>Total TTC</small><strong>{formatDa(grandTotal)}</strong></span>
          </div>
        </footer>
        <datalist id="pure-party-options">{parties.map((party) => <option key={party.id} value={party.name} />)}</datalist>
        <datalist id="pure-article-options">{articleRequest.rows.map((article) => <option key={article.id} value={`${article.name} · ${article.sku}`} />)}</datalist>
      </form>
      {quickPartyOpen && <QuickPartyCreateModal
        kind={initialTarget === "purchases" ? "supplier" : "client"}
        onClose={() => setQuickPartyOpen(false)}
        onCreate={onCreateParty}
        onCreated={(party) => {
          const row = party.kind === "client" ? toClientRecord(party) : toSupplierRecord(party);
          setCreatedParty(row);
          setSelectedPartyId(row.id);
          setPartyQuery(row.name);
          refreshPricesForParty(row);
          setQuickPartyOpen(false);
        }}
      />}
    </section>
  );
}

function CreateModal({
  initialTarget,
  initialDocumentType,
  parties,
  clientCategories = [],
  onClose,
  onSubmit,
}: {
  initialTarget: BusinessPage;
  initialDocumentType?: string;
  parties: string[];
  clientCategories?: ClientCategoryRecord[];
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
  const [contactPhone, setContactPhone] = useState("");
  const [category, setCategory] = useState("");
  const [clientCategory, setClientCategory] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [headOffice, setHeadOffice] = useState("");
  const [nif, setNif] = useState("");
  const [nis, setNis] = useState("");
  const [rc, setRc] = useState("");
  const [taxArticle, setTaxArticle] = useState("");
  const [rib, setRib] = useState("");
  const [bank, setBank] = useState("");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [contactStatus, setContactStatus] = useState("Divers");
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
  const partyPhotoInput = useRef<HTMLInputElement | null>(null);
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
    `${article.name} ${article.sku} ${article.brand} ${article.category} ${article.subcategory ?? ""} ${article.subsubcategory ?? ""} ${article.subsubsubcategory ?? ""}`
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
        className={`modal-card compact-field-modal ${!isDocument ? "party-create-modal" : "document-create-modal"} ${(isDocument || (isClient && clientDetailsOpen) || (isSupplier && supplierDetailsOpen)) ? "expanded-modal" : ""}`}
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
              contactPhone,
              category,
              clientCategory,
              email,
              address,
              headOffice,
              nif,
              nis,
              rc,
              taxArticle,
              rib,
              bank,
              note,
              imageUrl,
              contactStatus,
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
        {!isDocument && (
          <div className="entity-photo-upload create-photo-upload">
            <EntityLogo name={name || (isClient ? "Client" : "Fournisseur")} tone="blue" kind={isClient ? "client" : "supplier"} imageUrl={imageUrl} />
            <div><strong>Photo {isClient ? "du client" : "du fournisseur"}</strong><small>PNG, JPG ou WebP · 1,5 Mo maximum</small><span><button type="button" className="secondary-button" onClick={() => partyPhotoInput.current?.click()}><Upload size={15} /> Importer</button>{imageUrl && <button type="button" className="text-button danger-text" onClick={() => setImageUrl("")}>Supprimer</button>}</span></div>
            <input ref={partyPhotoInput} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (file) void readUploadedImage(file).then(setImageUrl).catch((reason: Error) => setSubmitError(reason.message)); }} />
          </div>
        )}
        {isDocument && (
          <>
            <div className="form-grid">
              <label className="field-label">Document
                <select required value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                  <option value="" disabled>Choisir le type de document</option>
                  <option>Devis</option><option>Bon de commande</option><option>{target === "purchases" ? "Bon d’achat" : "Bon de livraison"}</option><option>Facture</option>
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
          <div className="form-grid">
            <label className="field-label">Téléphone<input inputMode="tel" value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="0550 00 00 00" /></label>
            <label className="field-label">E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contact@entreprise.dz" /></label>
          </div>
        )}
        {isClient && (
          <section className={`expandable-form-section ${clientDetailsOpen ? "open" : ""}`}>
            <button type="button" className="expand-form-button" aria-expanded={clientDetailsOpen} onClick={() => setClientDetailsOpen((value) => !value)}>
              <span><ContactRound size={16} /> Contact et informations fiscales</span>
              <ChevronDown size={16} />
            </button>
            {clientDetailsOpen && (
              <div className="expanded-fields party-expanded-fields">
                <div className="form-section-label"><ContactRound size={15} /><span>Contact principal</span></div>
                <div className="party-create-contact-grid">
                  <label className="field-label">Nom du contact
                    <span className="input-with-icon"><ContactRound size={15} /><input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nom et prénom" /></span>
                  </label>
                  <label className="field-label">Téléphone du contact<input inputMode="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="0550 00 00 00" /></label>
                  <label className="field-label">Statut<select value={contactStatus} onChange={(event) => setContactStatus(event.target.value)}><option>Directeur</option><option>Administration</option><option>Divers</option></select></label>
                </div>
                <div className="party-create-organization-grid client-organization-grid">
                  <label className="field-label">Adresse
                    <span className="input-with-icon"><MapPin size={15} /><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rue, zone, bâtiment" /></span>
                  </label>
                  <label className="field-label">Catégorie client<select value={clientCategory} onChange={(event) => setClientCategory(event.target.value)}><option value="">Sans catégorie</option>{clientCategories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
                </div>
                <div className="form-section-label fiscal-label"><ReceiptText size={15} /><span>Informations fiscales</span><small>Facultatif</small></div>
                <div className="form-grid quick-party-fiscal-grid">
                  <label className="field-label">NIF
                    <input value={nif} onChange={(event) => setNif(event.target.value)} placeholder="N° fiscal" />
                  </label>
                  <label className="field-label">NIS
                    <input value={nis} onChange={(event) => setNis(event.target.value)} placeholder="N° statistique" />
                  </label>
                  <label className="field-label">RC
                    <input value={rc} onChange={(event) => setRc(event.target.value)} placeholder="Registre commerce" />
                  </label>
                  <label className="field-label">N° article
                    <input value={taxArticle} onChange={(event) => setTaxArticle(event.target.value)} placeholder="Article fiscal" />
                  </label>
                  <label className="field-label quick-party-rib-field">RIB
                    <input value={rib} onChange={(event) => setRib(event.target.value)} placeholder="Relevé d’identité bancaire" />
                  </label>
                  <label className="field-label quick-party-bank-field">Banque<BankSelect value={bank} onChange={setBank} /></label>
                </div>
                <label className="field-label">Note<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Informations internes sur ce client…" /></label>
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
              <div className="expanded-fields party-expanded-fields">
                <div className="form-section-label"><ContactRound size={15} /><span>Contact fournisseur</span></div>
                <div className="party-create-contact-grid">
                  <label className="field-label">Nom du contact
                    <span className="input-with-icon"><ContactRound size={15} /><input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nom et prénom" /></span>
                  </label>
                  <label className="field-label">Téléphone du contact<input inputMode="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="0550 00 00 00" /></label>
                  <label className="field-label">Statut<select value={contactStatus} onChange={(event) => setContactStatus(event.target.value)}><option>Directeur</option><option>Administration</option><option>Divers</option></select></label>
                </div>
                <div className="party-create-organization-grid">
                  <label className="field-label party-create-address-field">Adresse
                    <span className="input-with-icon"><MapPin size={15} /><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rue, zone, bâtiment" /></span>
                  </label>
                  <label className="field-label">Siège social<span className="input-with-icon"><Building2 size={15} /><input value={headOffice} onChange={(event) => setHeadOffice(event.target.value)} placeholder="Adresse du siège" /></span></label>
                  <label className="field-label">Catégorie<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Informatique, transport…" /></label>
                </div>
                <div className="form-section-label fiscal-label"><ReceiptText size={15} /><span>Informations fiscales</span><small>Facultatif</small></div>
                <div className="form-grid quick-party-fiscal-grid">
                  <label className="field-label">NIF<input value={nif} onChange={(event) => setNif(event.target.value)} placeholder="N° fiscal" /></label>
                  <label className="field-label">NIS<input value={nis} onChange={(event) => setNis(event.target.value)} placeholder="N° statistique" /></label>
                  <label className="field-label">RC<input value={rc} onChange={(event) => setRc(event.target.value)} placeholder="Registre commerce" /></label>
                  <label className="field-label">N° article<input value={taxArticle} onChange={(event) => setTaxArticle(event.target.value)} placeholder="Article fiscal" /></label>
                  <label className="field-label quick-party-rib-field">RIB<input value={rib} onChange={(event) => setRib(event.target.value)} placeholder="Relevé d’identité bancaire" /></label>
                  <label className="field-label quick-party-bank-field">Banque<BankSelect value={bank} onChange={setBank} /></label>
                </div>
                <label className="field-label">Note<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Informations internes sur ce fournisseur…" /></label>
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
  const roundArticlePrice = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const parseArticleNumber = (value: string | number) => {
    const parsed = Number(String(value).trim().replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const editableArticleNumber = (value: number) => String(roundArticlePrice(value)).replace(".", ",");
  const salePriceFromMargin = (cost: number, margin: number) => roundArticlePrice(Math.max(0, cost * (1 + margin / 100)));
  const marginFromSalePrice = (cost: number, sale: number) => cost > 0
    ? roundArticlePrice(((sale - cost) / cost) * 100)
    : 0;
  const [name, setName] = useState(article?.name ?? "");
  const [sku, setSku] = useState(article?.sku ?? "");
  const [brand, setBrand] = useState(article?.brand ?? "");
  const [brandLogo, setBrandLogo] = useState(article?.brand_logo ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [subcategory, setSubcategory] = useState(article?.subcategory ?? "");
  const [subsubcategory, setSubsubcategory] = useState(article?.subsubcategory ?? "");
  const [subsubsubcategory, setSubsubsubcategory] = useState(article?.subsubsubcategory ?? "");
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [clientPriceCategories, setClientPriceCategories] = useState<ClientCategoryRecord[]>([]);
  const [description, setDescription] = useState(article?.description ?? "");
  const [unit, setUnit] = useState(article?.unit ?? "unité");
  const [imageUrl, setImageUrl] = useState(article?.image_url ?? "");
  const [salePrices, setSalePrices] = useState<Array<{
    key: string;
    clientCategory: string;
    salePrice: string;
    marginPercent: string;
    mode: "price" | "margin";
  }>>(() => {
    if (article?.sale_prices?.length) return article.sale_prices.map((price, index) => ({
      key: `saved-${index}`,
      clientCategory: price.client_category || price.label || "Tarif général",
      salePrice: editableArticleNumber(price.sale_price),
      marginPercent: editableArticleNumber(price.margin_percent),
      mode: "price" as const,
    }));
    const marginPercent = article?.purchase_price
      ? Math.round((((article.sale_price - article.purchase_price) / article.purchase_price) * 100) * 100) / 100
      : 0;
    return [{ key: "default", clientCategory: "Tarif général", salePrice: article ? editableArticleNumber(article.sale_price) : "", marginPercent: editableArticleNumber(marginPercent), mode: "price" as const }];
  });
  const [stock, setStock] = useState(article?.stock ?? 0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const articlePhotoInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/articles", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Catégories indisponibles");
        return response.json() as Promise<{ categories?: CategoryTree[]; next_sku?: string }>;
      })
      .then((payload) => {
        setCategoryTree(payload.categories ?? []);
        if (!article && payload.next_sku) setSku((current) => current.trim() ? current : payload.next_sku || "");
      })
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") setCategoryTree([]);
      });
    return () => controller.abort();
  }, [article]);

  useEffect(() => {
    void fetch("/api/client-categories", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { categories?: ClientCategoryRecord[] };
      if (response.ok) setClientPriceCategories(payload.categories ?? []);
    }).catch(() => undefined);
  }, []);

  const normalizedCategory = category.trim().toLocaleLowerCase("fr");
  const selectedCategory = categoryTree.find((item) => item.name.toLocaleLowerCase("fr") === normalizedCategory);
  const subcategoryOptions = selectedCategory?.subcategories ?? [];
  const normalizedSubcategory = subcategory.trim().toLocaleLowerCase("fr");
  const selectedSubcategory = subcategoryOptions.find((item) => item.name.toLocaleLowerCase("fr") === normalizedSubcategory);
  const thirdLevelOptions = selectedSubcategory?.subcategories ?? [];
  const normalizedThirdLevel = subsubcategory.trim().toLocaleLowerCase("fr");
  const selectedThirdLevel = thirdLevelOptions.find((item) => item.name.toLocaleLowerCase("fr") === normalizedThirdLevel);
  const fourthLevelOptions = selectedThirdLevel?.subcategories ?? [];
  // Le prix d’achat est alimenté par les bons d’achat et reste en lecture seule ici.
  const purchaseCost = Math.max(0, Number(article?.purchase_price ?? 0));
  const computedSalePrices = salePrices.map((price) => {
    const clientCategory = price.clientCategory.trim() || "Tarif général";
    const salePrice = price.mode === "margin"
      ? salePriceFromMargin(purchaseCost, parseArticleNumber(price.marginPercent))
      : roundArticlePrice(Math.max(0, parseArticleNumber(price.salePrice)));
    const marginPercent = price.mode === "price"
      ? marginFromSalePrice(purchaseCost, salePrice)
      : roundArticlePrice(parseArticleNumber(price.marginPercent));
    return {
      label: clientCategory,
      client_category: clientCategory,
      margin_percent: marginPercent,
      sale_price: salePrice,
    };
  });

  const updateQuickSalePrice = (rawSalePrice: string) => {
    const normalizedSalePrice = Math.max(0, parseArticleNumber(rawSalePrice));
    setSalePrices((rows) => rows.map((row, index) => index === 0
      ? {
        ...row,
        salePrice: rawSalePrice,
        marginPercent: editableArticleNumber(marginFromSalePrice(purchaseCost, normalizedSalePrice)),
        mode: "price" as const,
      }
      : row));
  };

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
          subsubsubcategory: subsubsubcategory.trim(),
          description: description.trim(),
          unit,
          image_url: imageUrl,
          purchase_price: purchaseCost,
          purchase_prices: [{ client_category: "Tarif général", purchase_price: purchaseCost }],
          sale_price: computedSalePrices[0]?.sale_price ?? 0,
          sale_prices: computedSalePrices,
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
      <form className={`modal-card article-editor-modal compact-field-modal ${detailsOpen ? "expanded-modal details-open" : "quick-mode"}`} role="dialog" aria-modal="true" aria-labelledby="article-editor-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-header"><div><h2 id="article-editor-title">{article ? "Modifier l’article" : "Ajouter un article"}</h2><p>{article ? "Mettez à jour la fiche complète de l’article." : "Créez l’essentiel maintenant, complétez les détails si nécessaire."}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>

        <section className="article-quick-summary">
          <div className="article-quick-summary-heading"><span>{article ? "Fiche article" : "Ajout rapide"} <b>2</b> champs essentiels</span><small>Désignation et prix suffisent pour enregistrer.</small></div>
          <div className="article-summary-chips" aria-label="Champs de l’article"><span><Package size={14} /> Désignation <MoreHorizontal size={14} /></span><span><Banknote size={14} />{detailsOpen ? "Tarifs clients" : "Prix de vente"}<MoreHorizontal size={14} /></span></div>
          <button type="button" className={`article-details-toggle ${detailsOpen ? "active" : ""}`} aria-expanded={detailsOpen} onClick={() => setDetailsOpen((value) => !value)}><SlidersHorizontal size={15} />{detailsOpen ? "Masquer les détails" : "Plus de détails"}<ChevronDown size={15} /></button>
        </section>

        <section className="article-quick-fields">
          <label className="field-label article-designation-field">Désignation<input autoFocus required value={name} onChange={(event) => setName(event.target.value.toLocaleUpperCase("fr"))} placeholder="MACBOOK PRO 14 POUCES" /></label>
          {!detailsOpen && <label className="field-label article-quick-price-field">Prix de vente<span className="article-currency-input"><input required type="text" inputMode="decimal" value={salePrices[0]?.salePrice ?? ""} onChange={(event) => updateQuickSalePrice(event.target.value)} placeholder="0,00" /><span>DA</span></span><small>La virgule et le point sont acceptés.</small></label>}
          {detailsOpen && <section className="article-price-tiers article-price-tiers-top">
            <div className="article-price-heading"><div><span>Tarifs par catégorie client</span><small>Définissez directement les prix adaptés à chaque catégorie client.</small></div><button type="button" className="secondary-button" onClick={() => setSalePrices((rows) => [...rows, { key: `price-${Date.now()}`, clientCategory: clientPriceCategories[0]?.name ?? "Tarif général", salePrice: editableArticleNumber(purchaseCost), marginPercent: "0", mode: "margin" as const }])} disabled={salePrices.length >= 24}><Plus size={15} /> Ajouter un prix</button></div>
            <div className="article-price-list">
              {salePrices.map((price) => (
                <div className="article-price-row" key={price.key}>
                  <label className="field-label">Catégorie client<select value={price.clientCategory} onChange={(event) => setSalePrices((rows) => rows.map((row) => row.key === price.key ? { ...row, clientCategory: event.target.value } : row))} required>{["Tarif général", ...clientPriceCategories.map((item) => item.name), price.clientCategory].filter((priceName, index, values) => priceName && values.indexOf(priceName) === index).map((priceName) => <option key={priceName} value={priceName}>{priceName}</option>)}</select></label>
                  <label className="field-label">Prix de vente (DA)<input required type="text" inputMode="decimal" value={price.salePrice} onChange={(event) => { const rawSalePrice = event.target.value; const salePrice = Math.max(0, parseArticleNumber(rawSalePrice)); setSalePrices((rows) => rows.map((row) => row.key === price.key ? { ...row, salePrice: rawSalePrice, marginPercent: editableArticleNumber(marginFromSalePrice(purchaseCost, salePrice)), mode: "price" as const } : row)); }} placeholder="0,00" /></label>
                  <label className="field-label">Marge (%)<input type="text" inputMode="decimal" value={price.marginPercent} onChange={(event) => { const rawMargin = event.target.value; const marginPercent = Math.max(-100, parseArticleNumber(rawMargin)); setSalePrices((rows) => rows.map((row) => row.key === price.key ? { ...row, marginPercent: rawMargin, salePrice: editableArticleNumber(salePriceFromMargin(purchaseCost, marginPercent)), mode: "margin" as const } : row)); }} placeholder="0,00" /></label>
                  <button type="button" className="icon-button danger-text" onClick={() => setSalePrices((rows) => rows.filter((row) => row.key !== price.key))} disabled={salePrices.length === 1} aria-label={`Supprimer le prix ${price.clientCategory}`}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </section>}
        </section>

        {detailsOpen && <div className="article-details-panel">
          <div className="article-details-heading"><div><Sparkles size={16} /><span>Informations détaillées</span></div><small>Photo, référence, classement, stock et tarifs avancés.</small></div>
          <section className="article-premium-hero">
            <div className="article-photo-upload"><span className={`article-upload-preview ${imageUrl ? "has-image" : ""}`} style={imageUrl && isSafeImageSource(imageUrl) ? { backgroundImage: `url("${imageUrl}")` } : undefined}>{!imageUrl && <Package size={30} />}</span><div><strong>{imageUrl ? "Photo du produit" : "Ajouter la photo du produit"}</strong><small>PNG, JPG ou WebP · 1,5 Mo maximum</small><span><button type="button" className="secondary-button" onClick={() => articlePhotoInput.current?.click()}><Upload size={15} /> Choisir une photo</button>{imageUrl && <button type="button" className="text-button danger-text" onClick={() => setImageUrl("")}>Supprimer</button>}</span></div><input ref={articlePhotoInput} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (file) void readUploadedImage(file).then(setImageUrl).catch((reason: Error) => setError(reason.message)); }} /></div>
            <div className="article-logo-picker"><span>Logo / visuel de marque</span><div>{[
              { label: "Icône catalogue", value: "" },
              { label: "Google", value: "/brands/google.png" },
              { label: "Amazon", value: "/brands/amazon.svg" },
            ].map((option) => <button key={option.label} type="button" className={brandLogo === option.value ? "active" : ""} aria-pressed={brandLogo === option.value} onClick={() => setBrandLogo(option.value)}><ArticleBrandLogo brand={option.label} logo={option.value} /><span>{option.label}</span>{brandLogo === option.value && <Check size={14} />}</button>)}</div></div>
          </section>

          <div className="article-identity-grid">
            <label className="field-label article-reference-field">Référence / code-barres<input value={sku} onChange={(event) => setSku(event.target.value)} placeholder="Automatique · ART-00001" /></label>
            <label className="field-label">Marque<input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Apple" /></label>
            <label className="field-label">Unité<select value={unit} onChange={(event) => setUnit(event.target.value)}><option value="unité">Unité</option><option value="M">Mètre (M)</option><option value="Bobine">Bobine</option><option value="kg">Kilogramme (kg)</option><option value="L">Litre (L)</option><option value="lot">Lot</option></select></label>
          </div>
          <section className="article-category-editor">
            <div className="form-section-label"><Folder size={15} /><span>Arborescence catalogue</span></div>
            <div className="form-grid form-grid-four">
              <label className="field-label">Famille<input list="article-category-options" autoComplete="off" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Choisir ou ajouter…" /><datalist id="article-category-options">{categoryTree.map((item) => <option key={item.name} value={item.name} />)}</datalist></label>
              <label className="field-label">Sous-famille<input list="article-subcategory-options" autoComplete="off" value={subcategory} onChange={(event) => setSubcategory(event.target.value)} placeholder="Choisir ou ajouter…" /><datalist id="article-subcategory-options">{subcategoryOptions.map((item) => <option key={item.name} value={item.name} />)}</datalist></label>
              <label className="field-label">Catégorie<input list="article-third-category-options" autoComplete="off" value={subsubcategory} onChange={(event) => setSubsubcategory(event.target.value)} placeholder="Choisir ou ajouter…" /><datalist id="article-third-category-options">{thirdLevelOptions.map((item) => <option key={item.name} value={item.name} />)}</datalist></label>
              <label className="field-label">Sous-catégorie<input list="article-fourth-category-options" autoComplete="off" value={subsubsubcategory} onChange={(event) => setSubsubsubcategory(event.target.value)} placeholder="Choisir ou ajouter…" /><datalist id="article-fourth-category-options">{fourthLevelOptions.map((item) => <option key={item} value={item} />)}</datalist></label>
            </div>
            <p className="category-editor-hint"><Plus size={13} />Tous les niveaux sont facultatifs et peuvent être complétés plus tard.</p>
          </section>
          <div className="article-stock-description-grid">
            <label className="field-label">Description complète<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description affichée sur les commandes" rows={2} /></label>
            <label className="field-label">Stock initial / actuel<input type="number" min="0" step="1" value={stock || ""} onChange={(event) => setStock(Number(event.target.value))} /></label>
          </div>
        </div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button type="submit" className="primary-button" disabled={saving}><Save size={16} />{saving ? "Enregistrement…" : article ? "Enregistrer les modifications" : "Ajouter l’article"}</button></div>
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
        <div className="help-list"><span><Check size={16} /> Recherchez directement dans le tableau ouvert.</span><span><Check size={16} /> Utilisez Filtrer pour afficher les éléments ouverts.</span><span><Check size={16} /> Basculez entre les vues Liste et Grille.</span></div>
        <button className="primary-button full-button" onClick={onClose}>Compris</button>
      </div>
    </div>
  );
}

export default function WorkspaceApp() {
  const page = useSyncExternalStore(subscribeToPage, readPageFromUrl, () => "dashboard") as PageKey;
  const company = useSyncExternalStore(subscribeToCompany, readCompanySettings, () => DEFAULT_COMPANY);
  const [accessGranted, setAccessGranted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/auth", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ signedIn?: boolean }>)
      .then((payload) => { if (active && payload.signedIn) setAccessGranted(true); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  useEffect(() => {
    document.title = "Commercial";
  }, [company.name]);
  useEffect(() => {
    if (!company.feedbackEnabled && page === "feedback") window.location.hash = "dashboard";
  }, [company.feedbackEnabled, page]);
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
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [employeeAttendance, setEmployeeAttendance] = useState<EmployeeAttendanceRecord[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPaymentRecord[]>([]);
  const [catalogRows, setCatalogRows] = useState<ArticleRecord[]>([]);
  const [clientCategories, setClientCategories] = useState<ClientCategoryRecord[]>([]);
  const [clientCategoryManagerOpen, setClientCategoryManagerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [documentTypePicker, setDocumentTypePicker] = useState<"purchases" | "sales" | null>(null);
  const [newDocumentType, setNewDocumentType] = useState("");
  const [documentEditorContext, setDocumentEditorContext] = useState<{ direction: "purchases" | "sales"; document: DocumentRecord | null } | null>(null);
  const [articleEditor, setArticleEditor] = useState<ArticleRecord | "new" | null>(null);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [returnContext, setReturnContext] = useState<{ direction: "purchases" | "sales"; document: DocumentRecord } | null>(null);
  const [partyDetails, setPartyDetails] = useState<{ party: PartyRow; kind: "client" | "supplier" } | null>(null);
  const [partyEditor, setPartyEditor] = useState<{ party: PartyRow; kind: "client" | "supplier" } | null>(null);
  const [settlementContext, setSettlementContext] = useState<{ party: PartyRow; kind: "client" | "supplier"; originDocument?: DocumentRecord } | null>(null);
  const [documentDetails, setDocumentDetails] = useState<DocumentContext | null>(null);
  const [printContext, setPrintContext] = useState<DocumentContext | null>(null);
  const [financeEntryEditor, setFinanceEntryEditor] = useState<FinanceEntry | "new" | null>(null);
  const [financeEntryDetails, setFinanceEntryDetails] = useState<FinanceEntry | null>(null);
  const [treasuryEntryEditor, setTreasuryEntryEditor] = useState<TreasuryEntry | "new" | null>(null);
  const [employeeEditor, setEmployeeEditor] = useState<EmployeeRecord | "new" | null>(null);
  const [attendanceEmployee, setAttendanceEmployee] = useState<EmployeeRecord | null>(null);
  const [salaryEmployee, setSalaryEmployee] = useState<EmployeeRecord | null>(null);
  const [salaryPaymentEditor, setSalaryPaymentEditor] = useState<{ employee: EmployeeRecord; payment: SalaryPaymentRecord } | null>(null);
  const [partyVersion, setPartyVersion] = useState(0);
  const [financeVersion, setFinanceVersion] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);
  const meta = pageMeta[page];

  const refreshClientCategories = async () => {
    const response = await fetch("/api/client-categories", { cache: "no-store" });
    const payload = await response.json() as { categories?: ClientCategoryRecord[] };
    if (!response.ok) throw new Error("Catégories clients indisponibles");
    setClientCategories(payload.categories ?? []);
    setPartyVersion((value) => value + 1);
  };

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    if (!accessGranted) return;
    const controller = new AbortController();
    fetch("/api/articles", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { articles?: ArticleRecord[] };
        if (!response.ok) throw new Error("Catalogue indisponible");
        setCatalogRows(payload.articles ?? []);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") console.error("Impossible de charger les statistiques du catalogue", error);
      });
    return () => controller.abort();
  }, [accessGranted, catalogVersion]);

  useEffect(() => {
    if (!accessGranted) return;
    void fetch("/api/client-categories", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { categories?: ClientCategoryRecord[] };
      if (response.ok) setClientCategories(payload.categories ?? []);
    }).catch(() => undefined);
  }, [accessGranted]);

  useEffect(() => {
    if (!accessGranted) return;
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
  }, [accessGranted]);

  useEffect(() => {
    if (!accessGranted) return;
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
  }, [accessGranted, partyVersion]);

  useEffect(() => {
    if (!accessGranted) return;
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
      fetch("/api/employees", { signal: controller.signal, cache: "no-store" }).then(async (response) => {
        const payload = await response.json() as { employees?: EmployeeRecord[]; attendance?: EmployeeAttendanceRecord[]; salaryPayments?: SalaryPaymentRecord[] };
        if (!response.ok) throw new Error("Employés indisponibles");
        return {
          employees: payload.employees ?? [],
          attendance: payload.attendance ?? [],
          salaryPayments: payload.salaryPayments ?? [],
        };
      }),
    ])
      .then(([entries, ledger, employeeData]) => {
        setFinanceEntries(entries);
        setTreasuryLedger(ledger);
        setEmployees(employeeData.employees);
        setEmployeeAttendance(employeeData.attendance);
        setSalaryPayments(employeeData.salaryPayments);
      })
      .catch((error: Error) => { if (error.name !== "AbortError") console.error("Impossible de charger la finance SQLite", error); });
    return () => controller.abort();
  }, [accessGranted, financeVersion]);

  const navigate = (nextPage: PageKey) => {
    if (window.location.hash !== `#${nextPage}`) window.location.hash = nextPage;
    setSearch("");
    setActiveTab("all");
    setFilterActive(false);
    setViewMode(nextPage === "articles" ? "grid" : "list");
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      const response = await fetch("/api/auth", { method: "DELETE" });
      if (!response.ok) throw new Error("Impossible de vous déconnecter.");
      window.location.hash = "dashboard";
      setAccessGranted(false);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Impossible de vous déconnecter.");
    } finally {
      setSigningOut(false);
    }
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

  const togglePartyBlocked = async (party: PartyRow, kind: "client" | "supplier") => {
    const response = await fetch("/api/parties", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: party.id, is_blocked: !party.isBlocked }),
    });
    const payload = await response.json() as { party?: ApiPartyRecord; error?: string };
    if (!response.ok || !payload.party) throw new Error(payload.error || "Impossible de modifier le blocage du tiers.");
    if (kind === "client") setClients((rows) => rows.map((row) => row.id === party.id ? toClientRecord(payload.party!) : row));
    else setSuppliers((rows) => rows.map((row) => row.id === party.id ? toSupplierRecord(payload.party!) : row));
    notify(`${party.name} ${payload.party.is_blocked ? "bloqué" : "débloqué"}`);
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
        number: `RET-${new Date().toISOString().slice(0, 7).replace("-", "")}${String(Date.now()).slice(-5)}`,
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

  const offerSettlementAfterDocument = async (
    direction: "purchases" | "sales",
    document: DocumentRecord,
    fallbackParty?: PartyRow,
  ) => {
    const kind = direction === "purchases" ? "supplier" : "client";
    let selectedParty = fallbackParty ?? null;
    try {
      const response = await fetch(`/api/parties?kind=${kind}`, { cache: "no-store" });
      const payload = await response.json() as { parties?: ApiPartyRecord[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Impossible d’actualiser le solde du tiers.");
      const mapped = (payload.parties ?? []).map((party) => party.kind === "client" ? toClientRecord(party) : toSupplierRecord(party));
      if (kind === "client") setClients(mapped as ClientRecord[]);
      else setSuppliers(mapped as SupplierRecord[]);
      selectedParty = mapped.find((party) => party.id === document.partyId) ?? selectedParty;
    } catch {
      // Le document est déjà enregistré : la proposition peut utiliser le
      // dernier solde visible si l'actualisation locale échoue momentanément.
    }
    if (selectedParty) setSettlementContext({ party: selectedParty, kind, originDocument: document });
  };

  const transferDocument = async (
    direction: "purchases" | "sales",
    source: DocumentRecord,
    targetType: string,
  ) => {
    const sourceLines = documentLinesFor(source);
    if (!source.id || !sourceLines.length) throw new Error("Le document source ne contient pas de lignes transférables.");
    const transferred = await postDocument({
      direction,
      type: targetType,
      status: targetType === "Facture" ? "À régler" : "Validé",
      partyId: source.partyId,
      partyName: source.party,
      sourceDocumentId: source.id,
      documentDate: new Date().toISOString().slice(0, 10),
      showDescription: source.showFullDescription,
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
    if (direction === "sales") setSales((rows) => [transferred, ...rows]);
    else setPurchases((rows) => [transferred, ...rows]);
    setCatalogVersion((value) => value + 1);
    setPartyVersion((value) => value + 1);
    notify(`${targetType} ${targetType === "Facture" ? "créée" : "créé"} depuis ${source.number}`);
    if (targetType === "Facture" || targetType === "Bon de livraison" || targetType === "Bon d’achat") {
      const fallback = (direction === "purchases" ? suppliers : clients).find((party) => party.id === source.partyId);
      await offerSettlementAfterDocument(direction, transferred, fallback);
    }
  };

  const createItem = async ({ target, name, detail, documentType, contactName, contactPhone, category, clientCategory, email, address, headOffice, nif, nis, rc, taxArticle, rib, bank, note, imageUrl, contactStatus, articleId, articleName, articleDescription, unit, showFullDescription, quantity, unitPrice, discount, taxRate, documentDate, partyId, documentId, lines }: CreatePayload) => {
    const cleanName = name.trim();
    let documentForSettlement: DocumentRecord | null = null;
    if (target === "clients") {
      const party = await postParty({
        kind: "client",
        name: cleanName,
        phone: detail,
        contact_phone: contactPhone,
        contact_name: contactName,
        email,
        address,
        nif,
        nis,
        rc,
        tax_article: taxArticle,
        rib,
        bank,
        note,
        image_url: imageUrl,
        contact_status: contactStatus,
        client_category: clientCategory,
      });
      setClients((rows) => [toClientRecord(party), ...rows]);
    } else if (target === "suppliers") {
      const party = await postParty({
        kind: "supplier",
        name: cleanName,
        phone: detail,
        contact_phone: contactPhone,
        contact_name: contactName,
        email,
        address,
        head_office: headOffice,
        category,
        nif,
        nis,
        rc,
        tax_article: taxArticle,
        rib,
        bank,
        note,
        image_url: imageUrl,
        contact_status: contactStatus,
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
      if (!documentId && ["Facture", "Bon de livraison", "Bon d’achat"].includes(record.type)) {
        documentForSettlement = record;
      }
      setCatalogVersion((value) => value + 1);
      setPartyVersion((value) => value + 1);
    }
    setCreateOpen(false);
    setNewDocumentType("");
    setDocumentEditorContext(null);
    notify(documentId ? "Document modifié avec succès" : "Élément ajouté avec succès");
    if (documentForSettlement && (target === "purchases" || target === "sales")) {
      const fallback = (target === "purchases" ? suppliers : clients).find((party) => party.id === partyId);
      await offerSettlementAfterDocument(target, documentForSettlement, fallback);
    }
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
    ? newDocumentType || documentTypeForTab(activeTab, createTarget) || (createTarget === "purchases" ? "Bon de commande" : "Devis")
    : "";
  const activeDocumentEditor = documentEditorContext ?? (
    createOpen && (createTarget === "purchases" || createTarget === "sales")
      ? { direction: createTarget, document: null }
      : null
  );
  const documentStatsRows = page === "purchases" ? purchases : page === "sales" ? sales : null;
  const displayedTopStats = documentStatsRows
    ? [
        {
          label: page === "purchases" ? "Achats" : "Ventes",
          value: `${documentStatsRows.length} doc${documentStatsRows.length === 1 ? "" : "s"}`,
          trend: formatDa(documentStatsRows.reduce((sum, row) => sum + Math.abs(row.total ?? numberFromDa(row.amount)), 0)),
          icon: page === "purchases" ? ShoppingBag : Store,
        },
        {
          label: "Factures",
          value: String(documentStatsRows.filter((row) => row.type === "Facture").length),
          trend: "Documents validés",
          icon: FileCheck2,
        },
        {
          label: page === "purchases" ? "Bons d’achat" : "Livraisons",
          value: String(documentStatsRows.filter((row) => row.type === (page === "purchases" ? "Bon d’achat" : "Bon de livraison")).length),
          trend: "Flux enregistrés",
          icon: page === "purchases" ? ClipboardList : Truck,
        },
      ]
    : page === "clients"
      ? [
          { label: "Clients", value: String(clients.length), trend: clients.length === 1 ? clients[0].name : "Base locale", icon: Users },
          { label: "Factures", value: String(sales.filter((row) => row.type === "Facture").length), trend: "Documents de vente", icon: FileText },
          { label: "À recevoir", value: formatDa(clients.reduce((sum, row) => sum + numberFromDa(row.balance), 0)), trend: "Solde actuel", icon: WalletCards },
        ]
      : page === "suppliers"
        ? [
            { label: "Fournisseurs", value: String(suppliers.length), trend: suppliers.length === 1 ? suppliers[0].name : "Base locale", icon: Truck },
            { label: "Total achats", value: formatDa(purchases.reduce((sum, row) => sum + Math.abs(row.total ?? numberFromDa(row.amount)), 0)), trend: "Documents enregistrés", icon: ShoppingBag },
            { label: "Reste à payer", value: formatDa(suppliers.reduce((sum, row) => sum + numberFromDa(row.balance), 0)), trend: "Solde actuel", icon: WalletCards },
          ]
        : page === "articles"
          ? [
              { label: "Articles", value: String(catalogRows.length), trend: "SQLite local", icon: Boxes },
              { label: "Valeur du stock", value: formatDa(catalogRows.reduce((sum, row) => sum + row.purchase_price * row.stock, 0)), trend: `${catalogRows.reduce((sum, row) => sum + row.stock, 0)} unités`, icon: Package },
              { label: "Stock faible", value: String(catalogRows.filter((row) => row.stock > 0 && row.stock <= 10).length), trend: "À surveiller", icon: ShoppingBag },
            ]
          : topStats[page];
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
    return { direction, document, partyAddress, partyBalance: party?.balance };
  };

  if (!accessGranted) {
    return <AccessGate onUnlocked={() => setAccessGranted(true)} />;
  }

  return (
    <div className={`app-shell ${activeDocumentEditor ? "document-fullscreen-mode" : ""}`.trim()}>
      {!activeDocumentEditor && <aside className="sidebar">
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
        <nav className="side-nav">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(({ key }) => key !== "feedback" || company.feedbackEnabled);
            if (!visibleItems.length) return null;
            return (
            <div className="nav-group" key={group.label}>
              <span className="nav-label">{group.label}</span>
              {visibleItems.map(({ key, label, icon: Icon }) => (
                <button key={label} className={key && page === key ? "nav-item active" : "nav-item"} onClick={() => key ? navigate(key) : notify(`${label} ouvert`)}>
                  <Icon size={17} /><span>{label}</span>
                </button>
              ))}
            </div>
          );})}
        </nav>
        <div className="sidebar-footer">
          <button className="workspace-card" onClick={() => setWorkspaceOpen((value) => !value)}>
            <CompanyLogo company={company} className="workspace-avatar" /><span><strong>{company.name}</strong><small>Offre gratuite</small></span><MoreHorizontal size={17} />
          </button>
          <button className="logout-button" type="button" onClick={signOut} disabled={signingOut}>
            <LogOut size={17} /><span>{signingOut ? "Déconnexion…" : "Déconnexion"}</span>
          </button>
        </div>
      </aside>}

      <div className="main-shell">
        {!activeDocumentEditor && <header className={`topbar ${page === "dashboard" ? "dashboard-topbar" : ""}`}>
          <div className="breadcrumb">
            <meta.icon size={20} />
            <span><strong>{meta.label}</strong><small>{meta.subtitle}</small></span>
          </div>
          {page !== "dashboard" && (
            <div className="quick-stats" aria-label="Indicateurs clés">
              {displayedTopStats.map(({ label, value, trend, icon: Icon }, index) => (
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
            {!activeDocumentEditor && (createTarget || page === "articles") && <button className="top-new-button" onClick={() => {
              if (page === "articles") {
                setArticleEditor("new");
                return;
              }
              if ((page === "purchases" || page === "sales") && activeTab === "returns") {
                notify("Créez un retour depuis le menu d’une livraison ou d’une facture.");
                return;
              }
              if (page === "purchases" || page === "sales") {
                setDocumentTypePicker(page);
                return;
              }
              setCreateOpen(true);
            }}><Plus size={17} /> Nouveau</button>}
          </div>
        </header>}

        <main className={`main-content ${activeDocumentEditor ? "document-editor-page-content" : ""}`.trim()}>
          {activeDocumentEditor ? (
            <SimpleDocumentEditor
              key={`${activeDocumentEditor.direction}-${activeDocumentEditor.document?.id ?? "new"}`}
              initialTarget={activeDocumentEditor.direction}
              initialDocument={activeDocumentEditor.document}
              initialDocumentType={activeDocumentEditor.document ? undefined : createDocumentType}
              defaultTaxRate={company.defaultTaxRate}
              parties={activeDocumentEditor.direction === "purchases" ? suppliers : clients}
              onClose={() => { setCreateOpen(false); setNewDocumentType(""); setDocumentEditorContext(null); }}
              onSubmit={createItem}
              onCreateParty={async (body) => {
                const party = await postParty(body);
                if (party.kind === "client") setClients((rows) => [toClientRecord(party), ...rows]);
                else setSuppliers((rows) => [toSupplierRecord(party), ...rows]);
                notify(`${party.name} ajouté et sélectionné`);
                return party;
              }}
            />
          ) : <>
          {page === "dashboard" && <Dashboard onViewSales={() => navigate("sales")} purchases={purchases} sales={sales} clients={clients} suppliers={suppliers} />}
          {page === "clients" && <><div className="clients-toolbar"><button type="button" className="secondary-button" onClick={() => setClientCategoryManagerOpen(true)}><SlidersHorizontal size={15} /> Gérer les catégories clients</button></div><ClientsTable rows={clients} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onOpen={(party) => setPartyDetails({ party, kind: "client" })} onEdit={(party) => setPartyEditor({ party, kind: "client" })} onBlock={(party) => { void togglePartyBlocked(party, "client").catch((error) => notify(error instanceof Error ? error.message : "Impossible de modifier le blocage du client.")); }} onSettle={(party) => setSettlementContext({ party, kind: "client" })} onDelete={(name) => { const party = clients.find((row) => row.name === name); if (party) void deletePartyRecord(party, "client").catch((error) => notify(error instanceof Error ? error.message : "Impossible de supprimer le client.")); }} /></>}
          {page === "suppliers" && <SuppliersTable rows={suppliers} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onOpen={(party) => setPartyDetails({ party, kind: "supplier" })} onEdit={(party) => setPartyEditor({ party, kind: "supplier" })} onBlock={(party) => { void togglePartyBlocked(party, "supplier").catch((error) => notify(error instanceof Error ? error.message : "Impossible de modifier le blocage du fournisseur.")); }} onSettle={(party) => setSettlementContext({ party, kind: "supplier" })} onDelete={(name) => { const party = suppliers.find((row) => row.name === name); if (party) void deletePartyRecord(party, "supplier").catch((error) => notify(error instanceof Error ? error.message : "Impossible de supprimer le fournisseur.")); }} />}
          {page === "articles" && <ArticlesTable search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} refreshKey={catalogVersion} onEdit={(article) => setArticleEditor(article)} />}
          {page === "purchases" && <DocumentsTable page="purchases" rows={purchases} search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onOpen={(document) => setDocumentDetails(printableContextFor("purchases", document))} onPrint={(document) => setPrintContext(printableContextFor("purchases", document))} onEdit={(document) => setDocumentEditorContext({ direction: "purchases", document })} onDuplicate={(document) => { void duplicateDocumentRecord(document, "purchases").catch((error) => notify(error instanceof Error ? error.message : "Impossible de dupliquer le document.")); }} onDelete={(number) => { const document = purchases.find((row) => row.number === number); if (document) void deleteDocumentRecord(document, "purchases").catch((error) => notify(error instanceof Error ? error.message : "Impossible de supprimer le document.")); }} onReturn={(document) => setReturnContext({ direction: "purchases", document })} onTransfer={(document, targetType) => transferDocument("purchases", document, targetType)} />}
          {page === "sales" && <DocumentsTable page="sales" rows={sales} search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onOpen={(document) => setDocumentDetails(printableContextFor("sales", document))} onPrint={(document) => setPrintContext(printableContextFor("sales", document))} onEdit={(document) => setDocumentEditorContext({ direction: "sales", document })} onDuplicate={(document) => { void duplicateDocumentRecord(document, "sales").catch((error) => notify(error instanceof Error ? error.message : "Impossible de dupliquer le document.")); }} onDelete={(number) => { const document = sales.find((row) => row.number === number); if (document) void deleteDocumentRecord(document, "sales").catch((error) => notify(error instanceof Error ? error.message : "Impossible de supprimer le document.")); }} onReturn={(document) => setReturnContext({ direction: "sales", document })} onTransfer={(document, targetType) => transferDocument("sales", document, targetType)} />}
          {page === "finance" && <FinanceWorkspacePage entries={financeEntries} parties={[...clients, ...suppliers]} purchases={purchases} sales={sales} treasuryLedger={treasuryLedger} employees={employees} attendance={employeeAttendance} salaryPayments={salaryPayments} search={search} setSearch={setSearch} onNewCharge={() => setFinanceEntryEditor("new")} onViewCharge={setFinanceEntryDetails} onEditCharge={(entry) => setFinanceEntryEditor(entry)} onDeleteCharge={(entry) => { void deleteFinanceEntryRecord(entry); }} onViewParty={(party, kind) => setPartyDetails({ party, kind })} onSettleParty={(party, kind) => setSettlementContext({ party, kind })} onNewTreasury={() => setTreasuryEntryEditor("new")} onEditTreasury={(entry) => setTreasuryEntryEditor(entry)} onDeleteTreasury={(entry) => { void deleteTreasuryEntryRecord(entry); }} onNewEmployee={() => setEmployeeEditor("new")} onEditEmployee={setEmployeeEditor} onRecordAttendance={setAttendanceEmployee} onPaySalary={setSalaryEmployee} onEditSalaryPayment={(employee, payment) => setSalaryPaymentEditor({ employee, payment })} />}
          {page === "documents" && <DocumentsLibrary purchases={purchases} sales={sales} search={search} setSearch={setSearch} viewMode={viewMode} setViewMode={setViewMode} />}
          {page === "feedback" && company.feedbackEnabled && <FeedbackPage notify={notify} />}
          {page === "settings" && <SettingsPage company={company} onSave={persistCompanySettings} notify={notify} />}
          </>}
        </main>
      </div>
      {createOpen && (createTarget === "clients" || createTarget === "suppliers") && (
        <CreateModal initialTarget={createTarget} initialDocumentType={createDocumentType} parties={[]} clientCategories={clientCategories} onClose={() => setCreateOpen(false)} onSubmit={createItem} />
      )}
      {documentTypePicker && <DocumentTypePickerModal direction={documentTypePicker} onClose={() => setDocumentTypePicker(null)} onSelect={(documentType) => { setNewDocumentType(documentType); setDocumentTypePicker(null); setCreateOpen(true); }} />}
      {articleEditor && <ArticleFormModal article={articleEditor === "new" ? null : articleEditor} onClose={() => setArticleEditor(null)} onSaved={(article) => { setArticleEditor(null); setCatalogVersion((value) => value + 1); notify(`${article.name} enregistré dans le catalogue`); }} />}
      {returnContext && <ReturnModal document={returnContext.document} direction={returnContext.direction} onClose={() => setReturnContext(null)} onConfirm={confirmReturn} />}
      {clientCategoryManagerOpen && <ClientCategoryManagerModal categories={clientCategories} onClose={() => setClientCategoryManagerOpen(false)} onChanged={refreshClientCategories} />}
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
      {partyEditor && <PartyEditorModal party={partyEditor.party} kind={partyEditor.kind} clientCategories={clientCategories} onClose={() => setPartyEditor(null)} onSaved={(party) => { if (partyEditor.kind === "client") setClients((rows) => rows.map((row) => row.id === party.id ? toClientRecord(party) : row)); else setSuppliers((rows) => rows.map((row) => row.id === party.id ? toSupplierRecord(party) : row)); setPartyEditor(null); notify("Tiers mis à jour"); }} />}
      {settlementContext && currentSettlementParty && <SettlementModal key={`${settlementContext.kind}-${currentSettlementParty.id}-${currentSettlementParty.balance}-${settlementContext.originDocument?.id ?? "manual"}`} party={currentSettlementParty} kind={settlementContext.kind} originDocument={settlementContext.originDocument} onClose={() => setSettlementContext(null)} onSaved={() => { setSettlementContext(null); setPartyVersion((value) => value + 1); setFinanceVersion((value) => value + 1); notify("Règlement enregistré"); }} />}
      {documentDetails && <DocumentDetailsModal document={documentDetails.document} onClose={() => setDocumentDetails(null)} onPrint={() => setPrintContext(documentDetails)} />}
      {printContext && <PrintableDocument company={company} context={printContext} onClose={() => setPrintContext(null)} />}
      {financeEntryEditor && <FinanceEntryFormModal entry={financeEntryEditor === "new" ? null : financeEntryEditor} onClose={() => setFinanceEntryEditor(null)} onSaved={(entry) => { setFinanceEntries((rows) => financeEntryEditor === "new" ? [entry, ...rows] : rows.map((row) => row.id === entry.id ? entry : row)); setFinanceEntryEditor(null); setFinanceVersion((value) => value + 1); notify("Charge enregistrée"); }} />}
      {financeEntryDetails && <FinanceEntryDetailsModal entry={financeEntryDetails} onClose={() => setFinanceEntryDetails(null)} />}
      {treasuryEntryEditor && <TreasuryEntryFormModal entry={treasuryEntryEditor === "new" ? null : treasuryEntryEditor} onClose={() => setTreasuryEntryEditor(null)} onSaved={() => { setTreasuryEntryEditor(null); setFinanceVersion((value) => value + 1); notify("Mouvement de trésorerie enregistré"); }} />}
      {employeeEditor && <EmployeeFormModal employee={employeeEditor === "new" ? null : employeeEditor} onClose={() => setEmployeeEditor(null)} onSaved={() => { setEmployeeEditor(null); setFinanceVersion((value) => value + 1); notify("Employé enregistré"); }} />}
      {attendanceEmployee && <AttendanceFormModal employee={attendanceEmployee} onClose={() => setAttendanceEmployee(null)} onSaved={() => { setAttendanceEmployee(null); setFinanceVersion((value) => value + 1); notify("Pointage enregistré"); }} />}
      {salaryEmployee && <SalaryPaymentModal employee={salaryEmployee} onClose={() => setSalaryEmployee(null)} onSaved={(payment) => { setSalaryPayments((rows) => [payment, ...rows]); setSalaryEmployee(null); setFinanceVersion((value) => value + 1); notify("Salaire payé · charge et trésorerie mises à jour"); }} />}
      {salaryPaymentEditor && <SalaryPaymentModal employee={salaryPaymentEditor.employee} payment={salaryPaymentEditor.payment} onClose={() => setSalaryPaymentEditor(null)} onSaved={(payment) => { setSalaryPayments((rows) => rows.map((row) => row.id === payment.id ? payment : row)); setSalaryPaymentEditor(null); setFinanceVersion((value) => value + 1); notify("Paiement, charge et trésorerie mis à jour"); }} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="Fermer"><X size={14} /></button></div>}
    </div>
  );
}
