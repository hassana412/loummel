# Plan : Panier global Loummel (Context + Drawer + Header)

## Objectif

Mettre en place un système de panier client persistant et accessible depuis tout le site, avec ouverture en drawer latéral depuis le bouton panier du Header.

---

## Fichiers à créer / modifier

### 1. `src/contexts/CartContext.tsx` (nouveau)

Contexte React exposant :
- `items: CartItem[]` — `{ product_id, name, price, image_url, quantity, shop_id, shop_name }`
- `addToCart(item)` — ajoute, ou incrémente la quantité si le `product_id` existe déjà
- `removeFromCart(product_id)` — supprime un article
- `updateQuantity(product_id, qty)` — met à jour ; si `qty <= 0`, supprime
- `clearCart()` — vide le panier
- `cartCount` — somme des quantités (mémorisé)
- `cartTotal` — total en FCFA (mémorisé)
- `isOpen` / `setIsOpen` — état d'ouverture du drawer

**Persistance** : `localStorage` clé `loummel_cart`. Lecture initiale depuis le storage (avec try/catch + fallback `[]`), réécriture à chaque modification via `useEffect`.

Hook `useCart()` qui throw si utilisé hors `CartProvider`.

### 2. `src/components/cart/CartDrawer.tsx` (nouveau)

`Sheet` shadcn `side="right"`, largeur `sm:max-w-md`, ouvert/fermé via `isOpen`/`setIsOpen` du contexte.

**État vide** : icône `ShoppingCart` dans un cercle, texte "Votre panier est vide" + sous-texte + bouton "Explorer les boutiques" (lien `/recherche`).

**État rempli** :
- Header : titre "Mon panier" + nombre d'articles
- Liste scrollable : pour chaque item — image (80x80), nom, nom boutique, prix unitaire, contrôle quantité (`-` / valeur / `+`), bouton supprimer (icône poubelle)
- Footer : Total formaté FCFA + 2 boutons côte à côte → "Voir mon panier" (`outline`, `/panier`) et "Commander" (variant `default` = couleur primaire #966442, `/checkout`). Les deux ferment le drawer au clic.

Format prix : `new Intl.NumberFormat("fr-FR").format(price) + " FCFA"`.

### 3. `src/components/layout/Header.tsx` (modification ciblée)

- Importer `useCart` et `CartDrawer`
- Récupérer `cartCount` et `setIsOpen` (renommé `setCartOpen`)
- Remplacer le bouton ShoppingCart actuel (lignes 107-112) :
  - `onClick={() => setCartOpen(true)}`
  - Badge `cartCount` masqué si `=== 0`, affiche `99+` si `> 99`, taille adaptative
- Ajouter `<CartDrawer />` juste avant `</header>` (ligne 211)

### 4. `src/App.tsx` (modification ciblée)

Wrapper `CartProvider` à l'intérieur de `AuthProvider`, autour de `BrowserRouter`/`Toaster`/`Sonner` :

```tsx
<AuthProvider>
  <CartProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>...</BrowserRouter>
  </CartProvider>
</AuthProvider>
```

---

## Détails techniques

- TypeScript strict : interface `CartItem` exportée depuis `CartContext`
- `useCallback` sur toutes les actions, `useMemo` pour `cartCount` et `cartTotal`
- `addToCart` accepte une quantité optionnelle (défaut 1) — utile pour évolutions futures
- Gestion d'erreur localStorage (SSR-safe avec `typeof window` check, try/catch)
- Sheet shadcn déjà disponible (`src/components/ui/sheet.tsx`)
- Pas de modification du schéma BD ni d'appel Supabase — purement client
- Routes `/panier` et `/checkout` ne sont **pas** créées dans ce plan (les liens fonctionneront mais mèneront au 404 actuel — à traiter dans une étape ultérieure)

## Hors scope

- Branchement du bouton "Ajouter au panier" sur `ProductDetail.tsx` (actuellement il affiche un toast — à connecter dans une prochaine itération si souhaité)
- Création des pages `/panier` et `/checkout`
- Synchronisation du panier avec Supabase (utilisateur connecté)
