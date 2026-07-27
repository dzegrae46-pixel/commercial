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

type PageKey = "dashboard" | "clients" | "suppliers" | "purchases" | "sales" | "documents" | "settings";
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
};

type DocumentRecord = {
  number: string;
  party: string;
  type: string;
  date: string;
  amount: string;
  status: string;
  tone: string;
};

type LibraryRecord = DocumentRecord & {
  id: string;
  source: "Achats" | "Ventes";
  direction: "purchases" | "sales";
  format: "PDF" | "JPG" | "PNG";
  fileName: string;
  size: string;
};

type CreatePayload = {
  target: BusinessPage;
  name: string;
  detail: string;
  documentType: string;
  contactName?: string;
  email?: string;
  address?: string;
  nif?: string;
  nis?: string;
  rc?: string;
};

const pageMeta: Record<PageKey, { label: string; subtitle: string; icon: LucideIcon }> = {
  dashboard: { label: "Tableau de bord", subtitle: "Vue synthétique de votre activité", icon: Home },
  clients: { label: "Clients", subtitle: "Relations et soldes clients", icon: Users },
  suppliers: { label: "Fournisseurs", subtitle: "Partenaires et achats", icon: Truck },
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
      { key: "purchases", label: "Achats", icon: ShoppingBag },
      { key: "sales", label: "Ventes", icon: Store },
    ],
  },
  {
    label: "Espace de travail",
    items: [
      { key: "dashboard", label: "Vue d’ensemble", icon: Grid2X2 },
      { key: "documents", label: "Documents", icon: Folder },
      { label: "Rapports", icon: BarChart3 },
    ],
  },
  {
    label: "Privé",
    items: [{ key: "settings", label: "Paramètres", icon: Settings2 }],
  },
];

const topStats: Record<PageKey, { label: string; value: string; trend: string; icon: LucideIcon }[]> = {
  dashboard: [
    { label: "Chiffre d’affaires", value: "1,24 M DA", trend: "+12,6%", icon: BarChart3 },
    { label: "Ventes", value: "248,9 k DA", trend: "+14,8%", icon: Store },
    { label: "Achats", value: "184,6 k DA", trend: "+11,6%", icon: ShoppingBag },
  ],
  clients: [
    { label: "Clients", value: "128", trend: "+12", icon: Users },
    { label: "Total facturé", value: "1,24 M DA", trend: "+8,4%", icon: FileText },
    { label: "À recevoir", value: "184,2 k DA", trend: "24 ouverts", icon: WalletCards },
  ],
  suppliers: [
    { label: "Fournisseurs", value: "42", trend: "+4", icon: Truck },
    { label: "Total achats", value: "824,3 k DA", trend: "+5,2%", icon: ShoppingBag },
    { label: "Reste à payer", value: "96,4 k DA", trend: "12 factures", icon: WalletCards },
  ],
  purchases: [
    { label: "Achats du mois", value: "184,6 k DA", trend: "+11,6%", icon: ShoppingBag },
    { label: "Factures", value: "24", trend: "18 payées", icon: FileCheck2 },
    { label: "Commandes", value: "8", trend: "3 à recevoir", icon: ClipboardList },
  ],
  sales: [
    { label: "Ventes du mois", value: "248,9 k DA", trend: "+14,8%", icon: Store },
    { label: "Factures", value: "46", trend: "38 payées", icon: FileCheck2 },
    { label: "À encaisser", value: "52,6 k DA", trend: "8 clients", icon: WalletCards },
  ],
  documents: [
    { label: "Documents", value: "14", trend: "Achats + ventes", icon: Files },
    { label: "Fichiers PDF", value: "9", trend: "Classés", icon: FileText },
    { label: "Images", value: "5", trend: "JPG / PNG", icon: FileImage },
  ],
  settings: [
    { label: "Profil", value: "Entreprise", trend: "Actif", icon: Store },
    { label: "Logo", value: "Personnalisable", trend: "PNG / JPG", icon: ImageIcon },
    { label: "Sauvegarde", value: "Locale", trend: "Privée", icon: Settings2 },
  ],
};

const initialClients: ClientRecord[] = [
  { name: "Café Gourmand", initials: "CG", color: "sun", contact: "0550 12 34 56", email: "contact@cafegourmand.dz", billed: "248 000 DA", balance: "42 000 DA", status: "À régler", activity: "Aujourd’hui, 09:24" },
  { name: "Maison Noura", initials: "MN", color: "violet", contact: "0555 45 21 90", email: "hello@maisonnoura.dz", billed: "184 500 DA", balance: "0 DA", status: "À jour", activity: "Hier, 16:10" },
  { name: "Hôtel El Bahia", initials: "EB", color: "blue", contact: "0561 20 81 12", email: "achats@elbahia.dz", billed: "156 800 DA", balance: "18 700 DA", status: "À régler", activity: "Lun., 11:42" },
  { name: "Pâtisserie Lina", initials: "PL", color: "coral", contact: "0770 06 18 44", email: "lina@patisserie.dz", billed: "96 400 DA", balance: "0 DA", status: "À jour", activity: "Ven., 13:08" },
  { name: "Le Comptoir Central", initials: "LC", color: "mint", contact: "0553 90 11 27", email: "contact@comptoir.dz", billed: "72 900 DA", balance: "12 900 DA", status: "À régler", activity: "Jeu., 10:24" },
  { name: "Boulangerie Atlas", initials: "BA", color: "pink", contact: "0662 13 41 28", email: "atlas@boulangerie.dz", billed: "64 250 DA", balance: "0 DA", status: "À jour", activity: "Mer., 17:36" },
  { name: "Marché Saint-Honoré", initials: "MS", color: "blue", contact: "0554 28 31 80", email: "contact@marche-sh.dz", billed: "52 600 DA", balance: "9 600 DA", status: "À régler", activity: "Mar., 15:18" },
  { name: "Dar Djeddi", initials: "DD", color: "mint", contact: "0772 18 09 51", email: "gestion@dardjeddi.dz", billed: "48 300 DA", balance: "0 DA", status: "À jour", activity: "Lun., 08:44" },
];

const initialSuppliers: SupplierRecord[] = [
  { name: "Emballages Gouraya", initials: "EG", color: "blue", contact: "0551 35 67 20", category: "Emballages", purchases: "312 000 DA", balance: "74 000 DA", status: "En attente" },
  { name: "Matières Premières DZ", initials: "MP", color: "sun", contact: "0660 22 19 84", category: "Ingrédients", purchases: "284 500 DA", balance: "0 DA", status: "À jour" },
  { name: "ProClean Services", initials: "PS", color: "mint", contact: "0771 04 18 32", category: "Entretien", purchases: "84 200 DA", balance: "18 200 DA", status: "En attente" },
  { name: "Cartons & Co", initials: "CC", color: "violet", contact: "0558 72 14 09", category: "Emballages", purchases: "56 800 DA", balance: "0 DA", status: "À jour" },
  { name: "Café Select", initials: "CS", color: "coral", contact: "0560 40 20 16", category: "Boissons", purchases: "41 600 DA", balance: "7 600 DA", status: "En attente" },
  { name: "Froid Express", initials: "FE", color: "pink", contact: "0661 25 47 12", category: "Logistique", purchases: "38 400 DA", balance: "0 DA", status: "À jour" },
];

const initialPurchases: DocumentRecord[] = [
  { number: "FAC-2024-012", party: "Matières Premières DZ", type: "Facture", date: "Aujourd’hui, 10:12", amount: "84 500 DA", status: "Payée", tone: "green" },
  { number: "BR-2024-031", party: "Emballages Gouraya", type: "Bon de réception", date: "Hier, 15:46", amount: "42 800 DA", status: "Reçu", tone: "blue" },
  { number: "BC-2024-044", party: "ProClean Services", type: "Bon de commande", date: "Lun., 09:18", amount: "18 200 DA", status: "En attente", tone: "yellow" },
  { number: "RET-2024-008", party: "Cartons & Co", type: "Bon de retour", date: "Ven., 14:22", amount: "-3 400 DA", status: "Traité", tone: "pink" },
  { number: "FAC-2024-011", party: "Café Select", type: "Facture", date: "Jeu., 11:05", amount: "24 600 DA", status: "Partielle", tone: "orange" },
  { number: "BC-2024-040", party: "Matières Premières DZ", type: "Bon de commande", date: "Mer., 16:30", amount: "62 900 DA", status: "En attente", tone: "yellow" },
  { number: "DEV-2024-021", party: "Froid Express", type: "Devis", date: "Mar., 09:50", amount: "31 500 DA", status: "Brouillon", tone: "gray" },
];

const initialSales: DocumentRecord[] = [
  { number: "FAC-2024-109", party: "Café Gourmand", type: "Facture", date: "Aujourd’hui, 09:24", amount: "32 400 DA", status: "Payée", tone: "green" },
  { number: "DEV-2024-088", party: "Hôtel El Bahia", type: "Devis", date: "Hier, 16:10", amount: "68 000 DA", status: "Brouillon", tone: "gray" },
  { number: "BC-2024-076", party: "Maison Noura", type: "Bon de commande", date: "Lun., 11:42", amount: "41 500 DA", status: "En cours", tone: "blue" },
  { number: "BL-2024-062", party: "Pâtisserie Lina", type: "Bon de livraison", date: "Ven., 13:08", amount: "18 900 DA", status: "Livré", tone: "green" },
  { number: "RET-2024-004", party: "Le Comptoir Central", type: "Bon de retour", date: "Jeu., 10:24", amount: "-2 100 DA", status: "Traité", tone: "pink" },
  { number: "FAC-2024-108", party: "Boulangerie Atlas", type: "Facture", date: "Mer., 17:36", amount: "27 250 DA", status: "À encaisser", tone: "orange" },
  { number: "BL-2024-060", party: "Dar Djeddi", type: "Bon de livraison", date: "Mar., 14:05", amount: "14 800 DA", status: "Livré", tone: "green" },
];

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
}: {
  label: string;
  notify: (message: string) => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const action = (message: string) => {
    setOpen(false);
    notify(message);
  };

  return (
    <div className="row-actions">
      <button className="row-more" aria-label={`Actions pour ${label}`} onClick={() => setOpen((value) => !value)}>
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="row-menu" role="menu">
          <button onClick={() => action(`Ouverture de ${label}`)}><Eye size={15} /> Ouvrir</button>
          <button onClick={() => action(`Modification de ${label}`)}><Pencil size={15} /> Modifier</button>
          <button onClick={() => action(`${label} dupliqué`)}><Copy size={15} /> Dupliquer</button>
          {onDelete && <button className="danger-action" onClick={() => { setOpen(false); onDelete(); }}><Trash2 size={15} /> Supprimer</button>}
        </div>
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
              <td>{client.contactName ? <><strong>{client.contactName}</strong><small>{client.contact}</small></> : client.contact}</td>
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
              <td>{supplier.contact}</td>
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
}) {
  const closedStatuses = ["Payée", "Livré", "Reçu", "Traité"];
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
              <td>{row.party}</td>
              <td><span className="soft-label">{row.type}</span></td>
              <td>{row.date}</td>
              <td className={`number ${row.amount.startsWith("-") ? "negative-number" : ""}`}>{row.amount}</td>
              <td><StatusBadge label={row.status} tone={row.tone} /></td>
              <td><RowActions label={row.number} notify={notify} onDelete={() => onDelete(row.number)} /></td>
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

function Dashboard({ notify, onViewSales }: { notify: (message: string) => void; onViewSales: () => void }) {
  const [period, setPeriod] = useState<6 | 12>(6);
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div><h1>Vue d’ensemble</h1><p>Les chiffres essentiels de votre activité.</p></div>
        <button className="period-button" onClick={() => setPeriod((value) => value === 6 ? 12 : 6)}>
          {period} derniers mois <ChevronDown size={16} />
        </button>
      </div>
      <div className="dashboard-grid">
        <section className="chart-card main-chart">
          <div className="card-heading"><div><h2>Activité</h2><p>Revenus et coûts</p></div><StatusBadge label="+12,6%" tone="green" /></div>
          <div className="chart-legend"><span><i className="legend-dot coral" />Revenus</span><span><i className="legend-dot blue" />Coûts</span></div>
          <div className="bar-chart" aria-label="Graphique des revenus et des coûts">{[66, 51, 74, 57, 86, 68, 92, 74, 82, 63, 96, 79].map((height, index) => <div className="bar-group" key={index}><span className={index % 2 ? "bar blue" : "bar coral"} style={{ height: `${height}%` }} /><span className={index % 2 ? "bar coral faded" : "bar blue faded"} style={{ height: `${Math.max(22, height - 24)}%` }} /></div>)}</div>
          <div className="chart-axis"><span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span></div>
        </section>
        <section className="chart-card">
          <div className="card-heading"><div><h2>Ventes par canal</h2><p>Mois en cours</p></div><RowActions label="graphique des ventes" notify={notify} /></div>
          <div className="donut-wrap"><div className="donut"><div><strong>248k</strong><span>DA au total</span></div></div><div className="donut-list"><span><i className="legend-dot coral" />Comptoir <b>54%</b></span><span><i className="legend-dot blue" />Livraison <b>29%</b></span><span><i className="legend-dot mint" />B2B <b>17%</b></span></div></div>
        </section>
        <section className="table-card dashboard-table">
          <div className="table-header"><div className="table-title"><h1>Activité récente</h1><span>Dernières mises à jour</span></div><button className="text-button" onClick={onViewSales}>Tout voir</button></div>
          <div className="table-scroll"><table><thead><tr><th>Activité</th><th>Espace</th><th>Date</th><th>Statut</th></tr></thead><tbody>{[["Facture FAC-2024-109", "Ventes", "Il y a 2 min", "Terminé"], ["Commande BC-2024-044", "Achats", "Il y a 18 min", "En attente"], ["Nouveau client · Café Gourmand", "Clients", "Il y a 1 heure", "Terminé"], ["Retour RET-2024-004", "Achats", "Hier", "Vérifié"]].map(([activity, workspace, when, status]) => <tr key={activity}><td><strong>{activity}</strong></td><td>{workspace}</td><td>{when}</td><td><StatusBadge label={status} tone={status === "Terminé" ? "green" : status === "En attente" ? "yellow" : "blue"} /></td></tr>)}</tbody></table></div>
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
  onClose,
  onSubmit,
}: {
  initialTarget: PageKey;
  onClose: () => void;
  onSubmit: (payload: CreatePayload) => void;
}) {
  const initialBusinessTarget: BusinessPage = ["clients", "suppliers", "purchases", "sales"].includes(initialTarget)
    ? initialTarget as BusinessPage
    : initialTarget === "documents" ? "sales" : "clients";
  const [target, setTarget] = useState<BusinessPage>(initialBusinessTarget);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [documentType, setDocumentType] = useState("Facture");
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [nif, setNif] = useState("");
  const [nis, setNis] = useState("");
  const [rc, setRc] = useState("");
  const isDocument = target === "purchases" || target === "sales";
  const isClient = target === "clients";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className={`modal-card ${isClient && clientDetailsOpen ? "expanded-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); onSubmit({ target, name, detail, documentType, contactName, email, address, nif, nis, rc }); }}>
        <div className="modal-header"><div><h2 id="create-title">Nouvel élément</h2><p>Ajoutez rapidement un élément à votre espace.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
        <label className="field-label">Type
          <select value={target} onChange={(event) => setTarget(event.target.value as BusinessPage)}>
            <option value="clients">Client</option>
            <option value="suppliers">Fournisseur</option>
            <option value="purchases">Document d’achat</option>
            <option value="sales">Document de vente</option>
          </select>
        </label>
        <label className="field-label">{isDocument ? (target === "purchases" ? "Fournisseur" : "Client") : "Nom"}
          <input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder={isDocument ? "Nom du partenaire" : "Nom complet"} />
        </label>
        {isDocument && <label className="field-label">Document
          <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
            <option>Devis</option><option>Bon de commande</option><option>{target === "purchases" ? "Bon de réception" : "Bon de livraison"}</option><option>Facture</option><option>Bon de retour</option>
          </select>
        </label>}
        <label className="field-label">{isDocument ? "Montant" : target === "clients" ? "Téléphone" : "Catégorie"}
          <input inputMode={isClient ? "tel" : undefined} value={detail} onChange={(event) => setDetail(event.target.value)} placeholder={isDocument ? "0 DA" : target === "clients" ? "0550 00 00 00" : "Catégorie"} />
        </label>
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
                <label className="field-label">Adresse
                  <span className="input-with-icon"><MapPin size={15} /><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Adresse, ville" /></span>
                </label>
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
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" type="submit"><Plus size={16} /> Ajouter</button></div>
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

  const navigate = (nextPage: PageKey) => {
    if (nextPage !== page) window.history.pushState(null, "", `#${nextPage}`);
    window.dispatchEvent(new Event("hashchange"));
    setSearch("");
    setActiveTab("all");
    setFilterActive(false);
    setViewMode("list");
  };

  const createItem = ({ target, name, detail, documentType, contactName, email, address, nif, nis, rc }: CreatePayload) => {
    const cleanName = name.trim();
    if (target === "clients") {
      setClients((rows) => [{
        name: cleanName,
        initials: initials(cleanName),
        color: "blue",
        contact: detail.trim() || "—",
        email: email?.trim() || "E-mail non renseigné",
        contactName: contactName?.trim() || undefined,
        address: address?.trim() || undefined,
        nif: nif?.trim() || undefined,
        nis: nis?.trim() || undefined,
        rc: rc?.trim() || undefined,
        billed: "0 DA",
        balance: "0 DA",
        status: "À jour",
        activity: "À l’instant",
      }, ...rows]);
    } else if (target === "suppliers") {
      setSuppliers((rows) => [{ name: cleanName, initials: initials(cleanName), color: "mint", contact: "—", category: detail || "Général", purchases: "0 DA", balance: "0 DA", status: "À jour" }, ...rows]);
    } else {
      const prefix = documentType === "Devis" ? "DEV" : documentType === "Facture" ? "FAC" : documentType.includes("retour") ? "RET" : documentType.includes("livraison") ? "BL" : documentType.includes("réception") ? "BR" : "BC";
      const record: DocumentRecord = { number: `${prefix}-2024-${String(Date.now()).slice(-3)}`, party: cleanName, type: documentType, date: "À l’instant", amount: detail || "0 DA", status: "Brouillon", tone: "gray" };
      if (target === "purchases") setPurchases((rows) => [record, ...rows]);
      else setSales((rows) => [record, ...rows]);
    }
    setCreateOpen(false);
    navigate(target);
    notify("Élément ajouté avec succès");
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
        <header className="topbar">
          <div className="breadcrumb"><meta.icon size={18} /><strong>{meta.label}</strong></div>
          <div className="quick-stats" aria-label="Indicateurs clés">
            {topStats[page].map(({ label, value, trend, icon: Icon }, index) => (
              <div className="top-stat" key={label}><Icon size={17} /><span><small>{label}</small><strong>{value}</strong></span><em className={index === 2 && page !== "dashboard" ? "neutral" : ""}>{trend}</em></div>
            ))}
          </div>
          <div className="topbar-actions">
            <div className="notification-wrap">
              <button className={`icon-button ${notificationsOpen ? "active" : ""}`} aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} /><i /></button>
              {notificationsOpen && <div className="notification-panel"><div><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div><p><span className="notification-dot coral" />3 factures arrivent à échéance.</p><p><span className="notification-dot blue" />La commande BC-2024-076 est en cours.</p><button className="text-button" onClick={() => { setNotificationsOpen(false); notify("Notifications marquées comme lues"); }}>Tout marquer comme lu</button></div>}
            </div>
            <button className="help-button" onClick={() => setHelpOpen(true)}><CircleHelp size={17} /> Aide</button>
            <button className="top-new-button" onClick={() => setCreateOpen(true)}><Plus size={17} /> Nouveau</button>
          </div>
        </header>

        <main className="main-content">
          {page === "dashboard" && <Dashboard notify={notify} onViewSales={() => navigate("sales")} />}
          {page === "clients" && <ClientsTable rows={clients} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onDelete={(name) => { setClients((rows) => rows.filter((row) => row.name !== name)); notify(`${name} supprimé`); }} />}
          {page === "suppliers" && <SuppliersTable rows={suppliers} search={search} setSearch={setSearch} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onDelete={(name) => { setSuppliers((rows) => rows.filter((row) => row.name !== name)); notify(`${name} supprimé`); }} />}
          {page === "purchases" && <DocumentsTable page="purchases" rows={purchases} search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onDelete={(number) => { setPurchases((rows) => rows.filter((row) => row.number !== number)); notify(`${number} supprimé`); }} />}
          {page === "sales" && <DocumentsTable page="sales" rows={sales} search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} filterActive={filterActive} setFilterActive={setFilterActive} viewMode={viewMode} setViewMode={setViewMode} notify={notify} onDelete={(number) => { setSales((rows) => rows.filter((row) => row.number !== number)); notify(`${number} supprimé`); }} />}
          {page === "documents" && <DocumentsLibrary purchases={purchases} sales={sales} search={search} setSearch={setSearch} viewMode={viewMode} setViewMode={setViewMode} />}
          {page === "settings" && <SettingsPage company={company} onSave={persistCompanySettings} notify={notify} />}
        </main>
      </div>

      {createOpen && <CreateModal initialTarget={page} onClose={() => setCreateOpen(false)} onSubmit={createItem} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="Fermer"><X size={14} /></button></div>}
    </div>
  );
}
