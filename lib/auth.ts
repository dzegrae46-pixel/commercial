import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { clearLegacyDatabaseKeepingCategories, withDatabasePath } from "@/lib/sqlite";

const ACCOUNTS_DATABASE_PATH = "data/accounts.sqlite";
const SESSION_COOKIE = "commercial_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

type AccountRow = { id: string; password_salt: string; password_hash: string };
type SessionRow = { account_id: string; expires_at: string };

export class AccountAuthenticationError extends Error {
  constructor(message = "Connectez-vous pour accéder à cette base.", readonly status = 401) {
    super(message);
    this.name = "AccountAuthenticationError";
  }
}

function accountRegistry() {
  const filePath = resolve(process.cwd(), ACCOUNTS_DATABASE_PATH);
  mkdirSync(dirname(filePath), { recursive: true });
  const database = new DatabaseSync(filePath);
  database.exec("PRAGMA journal_mode = DELETE");
  database.exec("PRAGMA busy_timeout = 5000");
  database.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS account_sessions (
      token_hash TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS account_sessions_account_idx ON account_sessions(account_id);
  `);
  return database;
}

function passwordFrom(value: unknown) {
  if (typeof value !== "string" || value.length < 8 || value.length > 256 || !value.trim()) {
    throw new AccountAuthenticationError("Le mot de passe doit contenir entre 8 et 256 caractères.", 400);
  }
  return value;
}

function passwordHash(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function matchingAccount(database: DatabaseSync, password: string) {
  const rows = database.prepare("SELECT id, password_salt, password_hash FROM accounts").all() as unknown as AccountRow[];
  return rows.find((account) => {
    const expected = Buffer.from(account.password_hash, "hex");
    const received = Buffer.from(passwordHash(password, account.password_salt), "hex");
    return expected.length === received.length && timingSafeEqual(expected, received);
  });
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newSession(database: DatabaseSync, accountId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1_000).toISOString().replace("T", " ").slice(0, 19);
  database.prepare("DELETE FROM account_sessions WHERE expires_at <= CURRENT_TIMESTAMP").run();
  database.prepare("INSERT INTO account_sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)")
    .run(tokenHash(token), accountId, expiresAt);
  return token;
}

function cookieHeader(token: string, maxAge = SESSION_DURATION_SECONDS) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function cookieValue(request: Request, name: string) {
  const match = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1] ?? "";
}

export function createAccount(passwordValue: unknown) {
  const password = passwordFrom(passwordValue);
  clearLegacyDatabaseKeepingCategories();
  const database = accountRegistry();
  try {
    if (matchingAccount(database, password)) {
      throw new AccountAuthenticationError("Ce mot de passe correspond déjà à un compte. Connectez-vous.", 409);
    }
    const accountId = randomBytes(16).toString("hex");
    const salt = randomBytes(16).toString("hex");
    database.prepare("INSERT INTO accounts (id, password_salt, password_hash) VALUES (?, ?, ?)")
      .run(accountId, salt, passwordHash(password, salt));
    return { token: newSession(database, accountId) };
  } finally {
    database.close();
  }
}

export function signIn(passwordValue: unknown) {
  const password = passwordFrom(passwordValue);
  const database = accountRegistry();
  try {
    const account = matchingAccount(database, password);
    if (!account) throw new AccountAuthenticationError("Mot de passe incorrect.");
    return { token: newSession(database, account.id) };
  } finally {
    database.close();
  }
}

function sessionForRequest(request: Request): SessionRow {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) throw new AccountAuthenticationError();
  const database = accountRegistry();
  try {
    const session = database.prepare(`
      SELECT account_id, expires_at FROM account_sessions
      WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP
    `).get(tokenHash(token)) as SessionRow | undefined;
    if (!session) throw new AccountAuthenticationError();
    return session;
  } finally {
    database.close();
  }
}

export function isSignedIn(request: Request) {
  try {
    sessionForRequest(request);
    return true;
  } catch {
    return false;
  }
}

export function withAccountDatabase<T>(request: Request, callback: () => T): T {
  const session = sessionForRequest(request);
  return withDatabasePath(`data/accounts/${session.account_id}.sqlite`, callback);
}

export function revokeSession(request: Request) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (token) {
    const database = accountRegistry();
    try {
      database.prepare("DELETE FROM account_sessions WHERE token_hash = ?").run(tokenHash(token));
    } finally {
      database.close();
    }
  }
  return cookieHeader("", 0);
}

export function sessionCookie(token: string) {
  return cookieHeader(token);
}
