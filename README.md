# Axxam Workspace

Nouvelle interface de gestion compacte construite avec React, Vinext et
Lucide Icons.

## Pages

- Tableau de bord résumé avec indicateurs et deux graphiques
- Clients
- Fournisseurs
- Achats
- Ventes

Les pages métier affichent une ligne fine de statistiques puis directement le
tableau. Dans Achats et Ventes, les devis, commandes, BL/réceptions, factures
et bons de retour sont des catégories indépendantes.

## Démarrage

Prérequis : Node.js 22.13 ou plus récent et pnpm.

```bash
pnpm install
pnpm dev
```

Ouvrir ensuite `http://localhost:3000`.

## Validation

```bash
pnpm build
pnpm lint
pnpm test
```

Les données actuelles sont des données de démonstration locales, prêtes à être
remplacées par une API ou une base de données.
