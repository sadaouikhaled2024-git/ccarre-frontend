# ccarré-front

Frontend Next.js (App Router) du projet.

## Demarrage rapide (client)

Suivre ces etapes dans l'ordre.

### 1) Prerequis

- Node.js 20+ recommande
- pnpm installe globalement

Verification:

```bash
node -v
pnpm -v
```

Si pnpm n'est pas installe:

```bash
npm install -g pnpm
```

### 2) Installation des dependances

Depuis la racine du projet:

```bash
pnpm install
```

### 3) Configuration environnement (important)

Le frontend utilise `NEXT_PUBLIC_API_URL` pour appeler l'API.

Creer un fichier `.env.local` a la racine avec:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Adapte l'URL si ton backend tourne ailleurs.

### 4) Lancer le client en developpement

```bash
pnpm dev
```

Puis ouvrir:

```text
http://localhost:3000
```

### 5) Build production (optionnel)

```bash
pnpm build
pnpm start
```

## Scripts disponibles

- `pnpm dev` : lance le frontend en mode developpement
- `pnpm build` : genere le build de production
- `pnpm start` : demarre le build de production
- `pnpm lint` : verifie le code avec ESLint

## Problemes frequents

### Le site ne charge pas

- Verifier que le port 3000 est libre
- Verifier que les dependances sont bien installees (`pnpm install`)

### Les donnees/API ne remontent pas

- Verifier que le backend tourne
- Verifier `.env.local` et la valeur de `NEXT_PUBLIC_API_URL`
- Redemarrer le serveur Next.js apres modification de `.env.local`
