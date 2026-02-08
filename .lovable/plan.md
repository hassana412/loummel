
# Plan de Correction : Routes /admin + Thème #966442 Global

## Problemes identifies

| Probleme | Cause | Impact |
|----------|-------|--------|
| Route `/admin` inexistante | Dashboard admin sur `/dashboard/admin` seulement | Confusion utilisateur |
| Redirection vers accueil | `ProtectedRoute` redirige vers `/` si pas de role | Blocage d'acces |
| Notifications sans navigation | `handleNotificationClick` change l'onglet mais ne navigue pas | UX incomplete |
| Couleur #966442 limitee | Theme CSS utilise orange vif (25 95% 53%) | Incoherence visuelle |

---

## Phase 1 : Routage - Ajouter `/admin` comme route principale

### Fichier : `src/App.tsx`

Ajouter les routes suivantes :

```text
Routes a ajouter :
+-----------------------------------------------------------+
| /admin           → Redirige vers /dashboard/admin         |
| /admin/*         → Sous-routes admin (future-proof)       |
| /admin/boutique/:id → Page detail boutique (validation)   |
+-----------------------------------------------------------+
```

Modifications :
- Ajouter `<Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />`
- Ajouter route `/admin/boutique/:shopId` pour navigation depuis notifications
- Conserver `/dashboard/admin` pour compatibilite

### Fichier : `src/components/ProtectedRoute.tsx`

Corriger la redirection des utilisateurs non authentifies :
- Actuellement redirige vers `/auth` qui n'existe plus
- Changer vers `/backoffice` pour les routes admin

---

## Phase 2 : Notifications avec Navigation vers Boutique

### Fichier : `src/components/admin/AdminHeader.tsx`

Modifier `handleNotificationClick` :

```text
Avant :
  if (notification.type === "new_shop") {
    onTabChange("boutiques");  // Change juste l'onglet
  }

Apres :
  if (notification.type === "new_shop" && notification.related_id) {
    navigate(`/dashboard/admin?tab=boutiques&shop=${notification.related_id}`);
  }
```

### Fichier : `src/components/admin/ShopsManagement.tsx`

Ajouter logique pour :
- Lire le parametre `shop` de l'URL
- Auto-selectionner et mettre en surbrillance la boutique concernee
- Scroller vers la carte de la boutique

---

## Phase 3 : Theme Couleur #966442 Global

### Fichier : `src/index.css`

Remplacer la palette de couleurs primaires sur TOUTE la plateforme :

```text
Conversion #966442 en HSL :
  #966442 = HSL(24, 38%, 42%)

Changements CSS Variables :
+------------------------------------------------+
| Variable           | Avant         | Apres     |
+------------------------------------------------+
| --primary          | 25 95% 53%    | 24 38% 42%|
| --primary-foreground| 0 0% 100%    | 0 0% 100% |
| --ring             | 25 95% 53%    | 24 38% 42%|
| --accent           | 38 92% 50%    | 30 45% 55%|
| --sidebar-primary  | 25 95% 53%    | 24 38% 42%|
| --sidebar-ring     | 25 95% 53%    | 24 38% 42%|
+------------------------------------------------+

Nouvelles variables a ajouter :
  --loummel-brown: 24 38% 42%;
  --loummel-brown-light: 24 38% 55%;
  --loummel-brown-dark: 24 38% 32%;

Gradients a mettre a jour :
  --gradient-hero: linear-gradient(135deg, 
    hsl(24 38% 42%), hsl(30 45% 55%));
```

### Fichier : `tailwind.config.ts`

Ajouter les couleurs Loummel au theme :

```text
colors: {
  loummel: {
    DEFAULT: "#966442",
    light: "#b07b5a",
    dark: "#6d4830",
    copper: "#966442",
  }
}
```

---

## Phase 4 : Mise a jour des composants Frontend

### Composants a modifier pour utiliser la nouvelle couleur :

| Composant | Elements a changer |
|-----------|--------------------|
| `Header.tsx` | Top bar background, logo gradient |
| `Footer.tsx` | Background `bg-sahel-earth` → couleur Loummel |
| `HeroSection.tsx` | Gradient hero, boutons |
| `CTASection.tsx` | Gradient background |
| `Backoffice.tsx` | Background jaune → brun cuivre |

### Exemple Header :
```text
Avant : bg-sahel-earth
Apres : bg-[#966442] ou bg-loummel
```

---

## Resume des fichiers a modifier

| Fichier | Action |
|---------|--------|
| `src/App.tsx` | Ajouter route `/admin` |
| `src/components/ProtectedRoute.tsx` | Corriger redirection |
| `src/components/admin/AdminHeader.tsx` | Navigation notifications |
| `src/components/admin/ShopsManagement.tsx` | Surligner boutique ciblee |
| `src/index.css` | Theme couleur #966442 |
| `tailwind.config.ts` | Palette Loummel |
| `src/components/layout/Header.tsx` | Couleurs theme |
| `src/components/layout/Footer.tsx` | Couleurs theme |
| `src/components/home/HeroSection.tsx` | Gradient et boutons |
| `src/components/home/CTASection.tsx` | Gradient |
| `src/pages/Backoffice.tsx` | Background couleur |

---

## Resultat attendu

Apres implementation :
1. `/admin` → Acces direct au Dashboard Admin (plus de redirection vers l'accueil)
2. Clic sur notification "Nouvelle boutique" → Navigation vers la boutique a valider
3. Couleur #966442 (brun cuivre) appliquee sur TOUTE la plateforme :
   - Header/Footer publics
   - Hero section
   - Boutons principaux
   - Dashboard admin
   - Pages d'authentification
