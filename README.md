# GestionPro

Application de gestion interne pour un salon / point de vente : stock, réceptions, sorties, pointage des employés, commandes/livraisons, alertes et rapports automatiques (WhatsApp).

Construite avec [Next.js](https://nextjs.org) (App Router), [Prisma](https://www.prisma.io/) et PostgreSQL, pensée pour un déploiement sur [Vercel](https://vercel.com) avec une base [Neon](https://neon.tech).

- 📦 **Dépôt GitHub :** [Parfait-Yao/GestionPro](https://github.com/Parfait-Yao/GestionPro)
- 🔗 **Démo en production :** _à compléter une fois déployée sur Vercel_ (`https://gestionpro.vercel.app`)

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation en local](#installation-en-local)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données (Prisma)](#base-de-données-prisma)
- [Scripts disponibles](#scripts-disponibles)
- [Rapport quotidien automatique (cron)](#rapport-quotidien-automatique-cron)
- [Déploiement sur Vercel](#déploiement-sur-vercel)
- [Liens utiles](#liens-utiles)

## Fonctionnalités

- **Authentification** par code PIN (gérant / patronne) avec session JWT.
- **Gestion des produits** et du **stock** (réception, transformation, vente, usage interne).
- **Réceptions** avec méthode de comptage (pesée assistée ou comptage par groupe) et calcul d'écart.
- **Sorties de stock** avec annonce → confirmation → escalade en cas d'écart important.
- **Pointage** des employés (entrée / sortie).
- **Commandes & livraisons** avec suivi des livreurs.
- **Alertes** automatiques en cas d'écart de stock anormal.
- **Rapports** (PDF) et envoi automatique quotidien par **WhatsApp** (Cloud API).
- **Notifications** in-app (cloche de notifications).
- **Dashboard** avec statistiques (recharts).

## Stack technique

| Domaine | Technologie |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/docs) (App Router, Route Handlers) |
| UI | React 19, Tailwind CSS 4, Radix UI, Framer Motion, Lucide Icons |
| Données | [Prisma ORM](https://www.prisma.io/docs) + PostgreSQL ([Neon](https://neon.tech/docs)) |
| Auth | JWT ([jose](https://github.com/panva/jose) / jsonwebtoken) + PIN hashé ([bcryptjs](https://www.npmjs.com/package/bcryptjs)) |
| État / data fetching | [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query/latest) |
| Graphiques | [Recharts](https://recharts.org/) |
| PDF | [PDFKit](https://pdfkit.org/) |
| Notifications | [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) |
| Validation | [Zod](https://zod.dev/) |
| Déploiement | [Vercel](https://vercel.com/docs) |

## Structure du projet

```
front/
├── prisma/                 # schema.prisma, migrations, seed
├── public/                 # assets statiques + uploads
├── src/
│   ├── app/
│   │   ├── (auth)/login/   # page de connexion
│   │   ├── (app)/          # pages protégées : dashboard, stock, produits,
│   │   │                   # employés, livreurs, pointage, commandes,
│   │   │                   # réceptions, sorties, alertes, rapports, paramètres
│   │   └── api/            # route handlers (auth, produits, sorties, cron, ...)
│   ├── components/         # composants UI par domaine
│   ├── hooks/               # hooks React réutilisables
│   ├── lib/                 # prisma client, api client, notifications, PDF...
│   ├── store/                # stores Zustand
│   └── types/                # types partagés
└── package.json
```

## Prérequis

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) (le repo utilise `pnpm-lock.yaml`)
- Une base **PostgreSQL** (ex. [Neon](https://neon.tech/) en serverless)

## Installation en local

```bash
git clone git@github.com:Parfait-Yao/GestionPro.git
cd GestionPro/front
pnpm install
cp .env.local.example .env.local   # puis renseigner les valeurs (voir ci-dessous)
pnpm db:generate
pnpm db:push        # ou pnpm db:migrate en environnement avec migrations
pnpm db:seed         # données de démarrage (gérant, etc.)
pnpm dev
```

L'application est ensuite disponible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

À définir dans `front/.env.local` (en local) et dans les **Environment Variables** du projet Vercel (en production) :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL (ex. fournie par [Neon](https://neon.tech/docs/connect/connect-from-any-app)) |
| `GERANT_NOM` | Nom affiché du gérant unique |
| `GERANT_CODE` | Code PIN de connexion du gérant |
| `JWT_SECRET` | Secret utilisé pour signer les sessions JWT |
| `JWT_EXPIRES_IN` | Durée de validité du token (ex. `7d`) |
| `CRON_SECRET` | Jeton attendu par la route `/api/cron/rapport-quotidien` |
| `WHATSAPP_TOKEN` | Token d'accès [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) |
| `WHATSAPP_PHONE_NUMBER_ID` | ID du numéro expéditeur WhatsApp |
| `WHATSAPP_NUMERO_PATRONNE` | Numéro destinataire des rapports/alertes |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application (ex. `https://<votre-projet>.vercel.app`) |

> ⚠️ Ne jamais commiter `.env.local` ni exposer `DATABASE_URL` / `JWT_SECRET` côté client.

## Base de données (Prisma)

Le schéma se trouve dans [`prisma/schema.prisma`](prisma/schema.prisma) et couvre : utilisateurs, employés, produits, réceptions, mouvements de stock, sorties, pointages, comptages, alertes, notifications, configuration et commandes.

```bash
pnpm db:generate   # génère le client Prisma
pnpm db:push       # synchronise le schéma avec la base (dev)
pnpm db:migrate    # crée/applique une migration
pnpm db:studio     # ouvre Prisma Studio
pnpm db:seed       # exécute prisma/seed.ts
```

📚 Doc : [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference) · [Prisma + Vercel](https://www.prisma.io/docs/orm/more/deployment/deploy-to-vercel)

## Scripts disponibles

| Commande | Description |
|---|---|
| `pnpm dev` | Lance le serveur de développement |
| `pnpm build` | Build de production |
| `pnpm start` | Lance le build de production |
| `pnpm lint` | Lint ESLint |

## Rapport quotidien automatique (cron)

La route [`/api/cron/rapport-quotidien`](src/app/api/cron/rapport-quotidien/route.ts) génère et envoie le rapport du jour par WhatsApp. Elle est protégée par le header `x-cron-secret` (ou `?secret=`), comparé à `CRON_SECRET`.

Sur Vercel, le plus simple est d'utiliser [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) en ajoutant un fichier `vercel.json` :

```json
{
  "crons": [
    { "path": "/api/cron/rapport-quotidien?secret=VOTRE_CRON_SECRET", "schedule": "0 20 * * *" }
  ]
}
```

Alternative : un service externe comme [cron-job.org](https://cron-job.org/).

## Déploiement sur Vercel

1. Pousser le repo sur GitHub/GitLab/Bitbucket.
2. Sur [vercel.com/new](https://vercel.com/new), importer le repo (Root Directory : `front`).
3. Renseigner les [variables d'environnement](#variables-denvironnement) dans **Settings → Environment Variables**.
4. Provisionner une base Postgres (ex. via l'[intégration Neon sur Vercel](https://vercel.com/marketplace/neon)) et copier son `DATABASE_URL`.
5. Lancer le déploiement, puis exécuter les migrations (`pnpm db:migrate deploy` ou `pnpm db:push`) contre la base de production.
6. Une fois en ligne, ajouter l'URL de production ici et dans `NEXT_PUBLIC_APP_URL`.

📚 Doc : [Déployer Next.js sur Vercel](https://nextjs.org/docs/app/building-your-application/deploying) · [Vercel + Next.js](https://vercel.com/docs/frameworks/nextjs)

## Liens utiles

- [Next.js — Documentation](https://nextjs.org/docs)
- [React — Documentation](https://react.dev/)
- [Tailwind CSS — Documentation](https://tailwindcss.com/docs)
- [Prisma — Documentation](https://www.prisma.io/docs)
- [Neon (Postgres serverless)](https://neon.tech/docs)
- [Vercel — Documentation](https://vercel.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Recharts](https://recharts.org/en-US/)
- [Zod](https://zod.dev/)
