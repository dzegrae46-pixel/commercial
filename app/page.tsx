"use client";

import {
  ArrowDownRight,
  BarChart3,
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

type PageKey = "dashboard" | "clients" | "suppliers" | "articles" | "purchases" | "sales" | "documents" | "settings";
type BusinessPage = "clients" | "suppliers" | "purchases" | "sales";
type DocType = "all" | "quotes" | "orders" | "delivery" | "invoices" | "returns";
type LibraryCategory = DocType;
type LibraryFormat = "all" | "pdf" | "images";
type LibraryDirection = "all" | "purchases" | "sales";
type ViewMode = "list" | "grid";

type CompanySettings = {
  name: string;
  logoDataUrl: string;
};

type ClientRecord = {
  name: string;
  initials: string;
  color: string;
  contact: string;
  email: string;
  billed: string;
  balance: string;
  status: string;
  activity: string;
  contactName?: string;
  address?: string;
  city?: string;
  nif?: string;
  nis?: string;
  rc?: string;
};

type SupplierRecord = {
  name: string;
  initials: string;
  color: string;
  contact: string;
  category: string;
  purchases: string;
  balance: string;
  status: string;
  contactName?: string;
  email?: string;
  address?: string;
  city?: string;
  headOffice?: string;
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
};

type ApiDocumentLine = {
  article_id: number;
  designation: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  line_total: number;
};

type ApiDocumentRecord = {
  id: number;
  number: string;
  direction: "purchases" | "sales";
  type: "quote" | "order" | "delivery" | "invoice" | "return";
  type_label: string;
  party_name: string;
  source_document_id: number | null;
  source_document_number: string;
  document_date: string;
  status: string;
  show_description: number;
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
};

const pageMeta: Record<PageKey, { label: string; subtitle: string; icon: LucideIcon }> = {
  dashboard: { label: "Tableau de bord", subtitle: "Vue synthétique de votre activité", icon: Home },
  clients: { label: "Clients", subtitle: "Relations et soldes clients", icon: Users },
  suppliers: { label: "Fournisseurs", subtitle: "Partenaires et achats", icon: Truck },
  articles: { label: "Articles", subtitle: "Catalogue et niveaux de stock", icon: Boxes },
  purchases: { label: "Achats", subtitle: "Documents, réceptions et retours", icon: ShoppingBag },
  sales: { label: "Ventes", subtitle: "Devis, commandes et factures", icon: Store },
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

const DEFAULT_COMPANY: CompanySettings = { name: "Axxam", logoDataUrl: "" };
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
  const line = document.lines?.[0];
  const type = displayDocumentType(document);
  const summary = line
    ? `${line.quantity} ${line.unit || "unité"} × ${line.designation}${document.show_description && line.description ? ` · ${line.description}` : ""}`
    : undefined;

  return {
    id: document.id,
    number: document.number,
    party: document.party_name,
    type,
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
  name: party.name,
  initials: initials(party.name),
  color: normalizeLabel(party.name).includes("amazon") ? "sun" : "blue",
  contact: party.contact_phone || "—",
  email: party.email || "E-mail non renseigné",
  contactName: party.contact_name || undefined,
  address: party.address || undefined,
  city: party.city || undefined,
  nif: party.nif || undefined,
  nis: party.nis || undefined,
  rc: party.rc || undefined,
  billed: "0 DA",
  balance: "0 DA",
  status: "À jour",
  activity: "Dans SQLite",
});

const toSupplierRecord = (party: ApiPartyRecord): SupplierRecord => ({
  name: party.name,
  initials: initials(party.name),
  color: normalizeLabel(party.name).includes("amazon") ? "sun" : "blue",
  contact: party.contact_phone || "—",
  contactName: party.contact_name || undefined,
  email: party.email || undefined,
  address: party.address || undefined,
  city: party.city || undefined,
  headOffice: party.head_office || undefined,
  category: party.category || "Général",
  purchases: "0 DA",
  balance: "0 DA",
  status: "À jour",
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
  onEdit,
  extraActions = [],
}: {
  label: string;
  notify: (message: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  extraActions?: { label: string; icon: LucideIcon; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const action = (message: string) => {
    setOpen(false);
    notify(message);
  };

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
          <button onClick={() => action(`Ouverture de ${label}`)}><Eye size={15} /> Ouvrir</button>
          <button onClick={() => { setOpen(false); if (onEdit) onEdit(); else action(`Modification de ${label}`); }}><Pencil size={15} /> Modifier</button>
          <button onClick={() => action(`${label} dupliqué`)}><Copy size={15} /> Dupliquer</button>
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
              <td><RowActions label={client.name} notify={notify} onDelete={() => onDelete(client.name)} /></td>
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
              <td><RowActions label={supplier.name} notify={notify} onDelete={() => onDelete(supplier.name)} /></td>
            </tr>
          ))}
          {!filtered.length && <EmptyRow columns={7} />}
        </tbody>
      </table>
    </TableCard>
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
  onReturn,
  onConvertQuote,
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
  onReturn: (row: DocumentRecord) => void;
  onConvertQuote: (row: DocumentRecord) => Promise<void> | void;
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
              <td><RowActions label={row.number} notify={notify} onDelete={() => onDelete(row.number)} extraActions={[
                ...(row.type === "Devis" ? [{ label: "Créer la facture", icon: FileCheck2, onClick: () => { void Promise.resolve(onConvertQuote(row)).catch((error) => notify(error instanceof Error ? error.message : "Impossible de créer la facture.")); } }] : []),
                ...((row.type === "Bon de livraison" || row.type === "Bon de réception" || row.type === "Facture") && row.articleId && (row.quantity ?? 1) > (row.returnedQuantity ?? 0) ? [{ label: "Créer un retour", icon: RotateCcw, onClick: () => onReturn(row) }] : []),
              ]} /></td>
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
  let productCursor = 0;
  const productDonutSegments = productRanking.map(({ value }, index) => {
    const start = productCursor;
    productCursor += productTotalAmount > 0 ? value / productTotalAmount * 100 : 0;
    return `${productColors[index]} ${start}% ${productCursor}%`;
  });
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
  const logoInput = useRef<HTMLInputElement | null>(null);
  const previewCompany = {
    name: name.trim() || "Nom de l’entreprise",
    logoDataUrl,
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
            const saved = onSave({ name, logoDataUrl });
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
  const [taxRate, setTaxRate] = useState(19);
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
          <p className="category-editor-hint"><Plus size={13} />Sélectionnez une valeur proposée ou saisissez un nouveau niveau.</p>
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
  const [createOpen, setCreateOpen] = useState(false);
  const [articleEditor, setArticleEditor] = useState<ArticleRecord | "new" | null>(null);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [returnContext, setReturnContext] = useState<{ direction: "purchases" | "sales"; document: DocumentRecord } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);
  const meta = pageMeta[page];

  useEffect(() => {
    if (page === "articles") setViewMode("grid");
  }, [page]);

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
  }, []);

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
    if (quote.id && quote.articleId) {
      const invoice = await postDocument({
        direction,
        type: "Facture",
        partyName: quote.party,
        sourceDocumentId: quote.id,
        documentDate: new Date().toISOString().slice(0, 10),
        showDescription: quote.showFullDescription,
        lines: [{
          articleId: quote.articleId,
          designation: quote.articleName,
          description: quote.description,
          unit: quote.unit,
          quantity: quote.quantity ?? 1,
          unitPrice: quote.unitPrice,
          discountPercent: quote.discountPercent,
          taxRate: quote.taxRate,
        }],
      });
      if (direction === "sales") setSales((rows) => [invoice, ...rows]);
      else setPurchases((rows) => [invoice, ...rows]);
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

  const createItem = async ({ target, name, detail, documentType, contactName, email, address, city, headOffice, nif, nis, rc, articleId, articleName, articleDescription, unit, showFullDescription, quantity, unitPrice, discount, taxRate, documentDate }: CreatePayload) => {
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
      });
      setSuppliers((rows) => [toSupplierRecord(party), ...rows]);
    } else {
      if (!articleId) throw new Error("Sélectionnez un article existant.");
      const record = await postDocument({
        direction: target,
        type: documentType,
        partyName: cleanName,
        documentDate,
        discount,
        taxRate,
        showDescription: showFullDescription,
        lines: [{
          articleId,
          designation: articleName,
          description: articleDescription,
          unit,
          quantity,
          unitPrice,
          discountPercent: discount,
          taxRate,
        }],
      });
      if (target === "purchases") setPurchases((rows) => [record, ...rows]);
      else setSales((rows) => [record, ...rows]);
      setCatalogVersion((value) => value + 1);
    }
    setCreateOpen(false);
    notify("Élément ajouté avec succès");
  };

  const createTarget: BusinessPage | null = ["clients", "suppliers", "purchases", "sales"].includes(page)
    ? page as BusinessPage
    : null;
  const createParties = createTarget === "purchases"
    ? suppliers.map((supplier) => supplier.name)
    : createTarget === "sales"
      ? clients.map((client) => client.name)
      : [];
  const createDocumentType = createTarget === "purchases" || createTarget === "sales"
    ? documentTypeForTab(activeTab, createTarget)
    : "";

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
          {page === "clients" && <ClientsTable rows={clients} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onDelete={(name) => { setClients((rows) => rows.filter((row) => row.name !== name)); notify(`${name} supprimé`); }} />}
          {page === "suppliers" && <SuppliersTable rows={suppliers} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onDelete={(name) => { setSuppliers((rows) => rows.filter((row) => row.name !== name)); notify(`${name} supprimé`); }} />}
          {page === "articles" && <ArticlesTable search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} refreshKey={catalogVersion} onEdit={(article) => setArticleEditor(article)} />}
          {page === "purchases" && <DocumentsTable page="purchases" rows={purchases} search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onDelete={(number) => { setPurchases((rows) => rows.filter((row) => row.number !== number)); notify(`${number} supprimé`); }} onReturn={(document) => setReturnContext({ direction: "purchases", document })} onConvertQuote={(quote) => convertQuoteToInvoice("purchases", quote)} />}
          {page === "sales" && <DocumentsTable page="sales" rows={sales} search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onDelete={(number) => { setSales((rows) => rows.filter((row) => row.number !== number)); notify(`${number} supprimé`); }} onReturn={(document) => setReturnContext({ direction: "sales", document })} onConvertQuote={(quote) => convertQuoteToInvoice("sales", quote)} />}
          {page === "documents" && <DocumentsLibrary purchases={purchases} sales={sales} search={search} setSearch={setSearch} viewMode={viewMode} setViewMode={setViewMode} />}
          {page === "settings" && <SettingsPage company={company} onSave={persistCompanySettings} notify={notify} />}
        </main>
      </div>

      {createOpen && createTarget && <CreateModal initialTarget={createTarget} initialDocumentType={createDocumentType} parties={createParties} onClose={() => setCreateOpen(false)} onSubmit={createItem} />}
      {articleEditor && <ArticleFormModal article={articleEditor === "new" ? null : articleEditor} onClose={() => setArticleEditor(null)} onSaved={(article) => { setArticleEditor(null); setCatalogVersion((value) => value + 1); notify(`${article.name} enregistré dans le catalogue`); }} />}
      {returnContext && <ReturnModal document={returnContext.document} direction={returnContext.direction} onClose={() => setReturnContext(null)} onConfirm={confirmReturn} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="Fermer"><X size={14} /></button></div>}
    </div>
  );
}
