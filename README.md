# Axxam Workspace

Interface de gestion locale construite avec Next.js, React et SQLite.

## Installation sur une autre machine

Installer uniquement :

- Node.js 22.13 ou une version plus récente ;
- pnpm 11.9.0.

SQLite, Python, Docker et Cloudflare ne sont pas nécessaires. SQLite est fourni
directement par Node.js et la base locale est créée automatiquement.

Après avoir copié le dossier du projet sur la nouvelle machine :

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install
pnpm dev
```

Ouvrir ensuite `http://localhost:3000`.

Si Corepack n’est pas disponible :

```bash
npm install -g pnpm@11.9.0
```

## Base de données hors ligne

Au premier accès à la page Articles, Axxam crée automatiquement :

```text
data/axxam.sqlite
```

Ce fichier contient les données SQLite. Pour déplacer ou sauvegarder les
données, arrêter Axxam puis copier ce fichier avec le projet.

## Exécution en mode production local

```bash
pnpm install
pnpm build
pnpm start
```

## Pages

- Tableau de bord
- Clients
- Fournisseurs
- Articles
- Achats
- Ventes
- Documents
- Paramètres
