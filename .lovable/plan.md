
# Plan d'implementation : Nouveaux Menus Admin + Corrections Securite

## Resume Executif

Ce plan ajoute 5 nouveaux menus au Dashboard Admin tout en corrigeant les vulnerabilites de securite restantes. L'identite visuelle (#966442) et les fonctionnalites existantes sont preservees.

---

## Phase 1 : Base de Donnees - Nouvelles Tables

### 1.1 Table des Reclamations (Ticketing)

```text
Table: complaints
+------------------+----------------------------------+
| Colonne          | Description                      |
+------------------+----------------------------------+
| id               | UUID PRIMARY KEY                 |
| complainant_id   | UUID (user_id de celui qui reclame)|
| target_type      | TEXT ('shop' | 'product' | 'partner' | 'order')|
| target_id        | UUID (ID de l'entite concernee)  |
| subject          | TEXT (titre de la reclamation)   |
| description      | TEXT (details)                   |
| status           | TEXT ('pending' | 'in_progress' | 'resolved' | 'closed')|
| priority         | TEXT ('low' | 'medium' | 'high') |
| assigned_to      | UUID (admin assignee) NULLABLE   |
| resolution_notes | TEXT NULLABLE                    |
| created_at       | TIMESTAMPTZ                      |
| resolved_at      | TIMESTAMPTZ NULLABLE             |
| updated_at       | TIMESTAMPTZ                      |
+------------------+----------------------------------+
```

### 1.2 Table Stats Categories (Vue Agregee)

```text
Table: category_stats (Vue materialisee ou requete dynamique)
+------------------+----------------------------------+
| Colonne          | Description                      |
+------------------+----------------------------------+
| category         | TEXT (categorie de boutique)     |
| total_shops      | INTEGER                          |
| total_visits     | INTEGER                          |
| total_products   | INTEGER                          |
| total_services   | INTEGER                          |
| total_revenue    | NUMERIC                          |
| total_shipments  | INTEGER                          |
| total_complaints | INTEGER                          |
+------------------+----------------------------------+
```

### 1.3 Politiques RLS

- **complaints** : Super admins (lecture/ecriture totale), Users (lecture de leurs propres reclamations)
- Toutes les nouvelles tables auront RLS active avec has_role()

---

## Phase 2 : Nouveaux Composants Admin

### 2.1 Structure des Fichiers

```text
src/components/admin/
+-- CategoriesTab.tsx         (Vue agregee par categorie)
+-- CategoryCard.tsx          (Carte individuelle categorie)
+-- UsersManagement.tsx       (Table utilisateurs + filtres)
+-- PartnersManagement.tsx    (Gestion partenaires)
+-- NotificationCenter.tsx    (Historique notifications)
+-- ComplaintsTab.tsx         (Ticketing reclamations)
+-- ComplaintCard.tsx         (Carte reclamation individuelle)
+-- SettingsTab.tsx           (MODIFIER: ajouter connectivite)
```

### 2.2 Mise a Jour Sidebar

Ajout des nouveaux menus dans AdminSidebar.tsx :

| Menu              | Icone (lucide-react) | Tab ID       |
|-------------------|----------------------|--------------|
| Categories        | Grid3X3              | categories   |
| Utilisateurs      | Users                | users        |
| Partenaires       | Handshake            | partners     |
| Notifications     | Bell                 | notifications|
| Reclamations      | MessageSquareWarning | complaints   |
| Wanda Services    | Truck                | wanda        |
| Parametres        | Settings             | settings     |

### 2.3 Details des Composants

**CategoriesTab.tsx** :
- Grille de cartes par categorie (Artisanat, Electronique, Restaurants, etc.)
- Chaque carte affiche : CA total, nb boutiques, nb visites, produits/services, livraisons, reclamations
- Clic sur carte = filtre les boutiques par categorie

**UsersManagement.tsx** :
- Tableau paginee de tous les utilisateurs (profiles)
- Filtrage par role (Client, Partenaire, Proprietaire, Admin)
- Colonnes : Nom, Email, Role, Date inscription, Actions

**PartnersManagement.tsx** :
- Vue dediee aux partenaires commerciaux
- Affiche : Type (commission/forfait), Zone, Boutiques recrutees, Commissions
- Actions : Approuver, Suspendre, Voir details

**NotificationCenter.tsx** :
- Historique de TOUTES les notifications envoyees
- Filtres : Type, Destinataire, Date
- Export CSV possible

**ComplaintsTab.tsx** :
- Tableau de bord ticketing
- Colonnes : Expediteur, Cible, Motif, Statut, Priorite, Date
- Actions : Assigner, Changer statut, Resoudre
- Badges colores par statut

**SettingsTab.tsx (Modifications)** :
- Nouvel onglet "Connectivite"
- Bouton "Sauvegarde JSON/CSV" pour exporter donnees
- Bouton "Test Supabase" pour verifier connexion backend

---

## Phase 3 : Corrections Securite

### 3.1 Vulnerabilites a Corriger

| Issue                    | Priorite | Action                              |
|--------------------------|----------|-------------------------------------|
| reset-test-passwords     | CRITIQUE | DEJA SUPPRIME (verifie)            |
| Leaked Password Protection| HAUTE   | Activer via configure-auth          |
| Storage INSERT policy    | MOYENNE  | Restreindre aux proprietaires       |
| Affiliate code generation| BASSE    | Utiliser crypto.getRandomValues()   |
| CORS wildcard            | INFO     | Acceptable pour plateforme publique |

### 3.2 Activation Protection Mots de Passe

Utiliser l'outil configure-auth pour activer la protection contre les mots de passe compromis.

### 3.3 Amelioration Generation Code Affilie

Remplacer Math.random() par crypto.getRandomValues() :

```typescript
export const generateAffiliateCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint8Array(8); // 8 caracteres au lieu de 6
  crypto.getRandomValues(array);
  
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(array[i] % chars.length);
  }
  return `LM-${code}`;
};
```

### 3.4 Correction Storage Policy

Migration SQL pour securiser les uploads :

```sql
DROP POLICY IF EXISTS "Authenticated users can upload shop images" 
  ON storage.objects;

CREATE POLICY "Shop owners can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Phase 4 : Mise a Jour Routing

### 4.1 AdminDashboard.tsx

Ajouter les nouveaux cas dans renderContent() :

```typescript
case "categories":
  return <CategoriesTab />;
case "users":
  return <UsersManagement />;
case "partners":
  return <PartnersManagement />;
case "notifications":
  return <NotificationCenter />;
case "complaints":
  return <ComplaintsTab />;
```

---

## Phase 5 : Tests et Validation

### 5.1 Scenarios de Test

1. Navigation sidebar : tous les onglets fonctionnels
2. Categories : agregation correcte des stats
3. Users : filtrage par role operationnel
4. Reclamations : workflow complet (creation -> resolution)
5. Parametres : export JSON/CSV + test connexion
6. Securite : verification RLS sur nouvelles tables

---

## Resume des Fichiers

| Fichier                                | Action    |
|----------------------------------------|-----------|
| `supabase/migrations/xxx_complaints.sql` | Creer    |
| `src/components/admin/AdminSidebar.tsx`| Modifier  |
| `src/components/admin/CategoriesTab.tsx`| Creer    |
| `src/components/admin/CategoryCard.tsx` | Creer    |
| `src/components/admin/UsersManagement.tsx`| Creer  |
| `src/components/admin/PartnersManagement.tsx`| Creer|
| `src/components/admin/NotificationCenter.tsx`| Creer|
| `src/components/admin/ComplaintsTab.tsx`| Creer    |
| `src/components/admin/SettingsTab.tsx` | Modifier  |
| `src/pages/dashboard/AdminDashboard.tsx`| Modifier |
| `src/lib/generateAffiliateCode.ts`     | Modifier  |

---

## Estimation

| Phase | Complexite | Temps estime |
|-------|------------|--------------|
| Phase 1 (DB) | Moyenne | 10 min |
| Phase 2 (Composants) | Elevee | 45 min |
| Phase 3 (Securite) | Faible | 10 min |
| Phase 4 (Routing) | Faible | 5 min |
| Phase 5 (Tests) | Moyenne | 15 min |
| **Total** | | **~1h25** |

---

## Resultat Attendu

Apres implementation :
- 7 onglets dans la sidebar admin (au lieu de 4)
- Vue agregee par categorie avec stats completes
- Gestion centralisee utilisateurs et partenaires
- Historique complet des notifications
- Systeme de ticketing pour reclamations
- Export donnees JSON/CSV
- Test de connexion backend
- Securite renforcee (mots de passe, storage, codes affilies)
- Interface coherente avec #966442
