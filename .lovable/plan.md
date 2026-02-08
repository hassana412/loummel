
# Plan d'implémentation : Wallets Mobile Money + Dashboard Refactorisé + Corrections Sécurité

## Vue d'ensemble

Ce plan couvre trois axes majeurs :
1. **Système de Wallets Mobile Money** (MTN MoMo + Orange Money)
2. **Dashboard Admin refactorisé** avec nouvelle sidebar et module Wanda Services
3. **Corrections de sécurité** identifiées dans l'audit

---

## Phase 1 : Base de données - Tables Wallets et Transactions

### 1.1 Nouvelles tables à créer

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MOBILE MONEY WALLETS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Table: mobile_wallets                                                       │
│ ─────────────────────                                                       │
│ id              UUID PRIMARY KEY                                            │
│ operator        TEXT ('mtn_momo' | 'orange_money')                         │
│ balance         NUMERIC DEFAULT 0                                           │
│ pending_balance NUMERIC DEFAULT 0 (non encore validé)                       │
│ total_received  NUMERIC DEFAULT 0                                           │
│ total_withdrawn NUMERIC DEFAULT 0                                           │
│ last_sync_at    TIMESTAMPTZ                                                │
│ created_at      TIMESTAMPTZ                                                │
│ updated_at      TIMESTAMPTZ                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Table: wallet_transactions                                                  │
│ ──────────────────────────                                                  │
│ id              UUID PRIMARY KEY                                            │
│ wallet_id       UUID REFERENCES mobile_wallets(id)                         │
│ type            TEXT ('deposit' | 'withdrawal' | 'payment' | 'refund')     │
│ amount          NUMERIC NOT NULL                                            │
│ fee             NUMERIC DEFAULT 0                                           │
│ reference       TEXT (ID transaction opérateur)                            │
│ phone_number    TEXT                                                        │
│ status          TEXT ('pending' | 'completed' | 'failed' | 'cancelled')    │
│ description     TEXT                                                        │
│ related_id      UUID (shop_id, order_id...)                                │
│ related_type    TEXT ('subscription' | 'order' | 'commission')             │
│ metadata        JSONB                                                       │
│ created_at      TIMESTAMPTZ                                                │
│ completed_at    TIMESTAMPTZ                                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           WANDA SERVICES (Logistique)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Table: shipments                                                            │
│ ────────────────                                                            │
│ id              UUID PRIMARY KEY                                            │
│ tracking_number TEXT UNIQUE                                                 │
│ shop_id         UUID REFERENCES shops(id)                                  │
│ type            TEXT ('local' | 'international')                           │
│ status          TEXT ('picked_up' | 'in_transit' | 'delivered' | 'damaged')│
│ origin_city     TEXT                                                        │
│ destination_city TEXT                                                       │
│ weight_kg       NUMERIC                                                     │
│ delivery_cost   NUMERIC                                                     │
│ delivery_fee    NUMERIC (marge Loummel)                                    │
│ is_damaged      BOOLEAN DEFAULT false                                       │
│ is_returned     BOOLEAN DEFAULT false                                       │
│ damage_notes    TEXT                                                        │
│ customer_rating INTEGER (1-5)                                              │
│ picked_at       TIMESTAMPTZ                                                │
│ delivered_at    TIMESTAMPTZ                                                │
│ created_at      TIMESTAMPTZ                                                │
│ updated_at      TIMESTAMPTZ                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Politiques RLS

- **mobile_wallets** : Super admins uniquement (lecture/écriture)
- **wallet_transactions** : Super admins (tout), Shop owners (lecture de leurs transactions via related_id)
- **shipments** : Super admins (tout), Shop owners (lecture de leurs expéditions)

### 1.3 Données Mock initiales

Insertion de données fictives pour affichage immédiat :
- 2 wallets (MTN MoMo et Orange Money) avec soldes
- ~20 transactions variées sur les 30 derniers jours
- ~15 expéditions avec différents statuts

---

## Phase 2 : Dashboard Admin Refactorisé

### 2.1 Nouvelle architecture des composants

```text
src/
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx        (Navigation latérale)
│       ├── AdminHeader.tsx         (Header avec notifications)
│       ├── DashboardOverview.tsx   (Vue d'ensemble + Wallets)
│       ├── WalletCard.tsx          (Carte individuelle wallet)
│       ├── ShopsManagement.tsx     (Gestion boutiques - existant refactorisé)
│       ├── WandaServicesTab.tsx    (Module logistique complet)
│       └── ShipmentTable.tsx       (Tableau des expéditions)
└── pages/dashboard/
    └── AdminDashboard.tsx          (Container principal refactorisé)
```

### 2.2 Identité visuelle

| Élément | Couleur |
|---------|---------|
| Boutons primaires | `#966442` (Brun cuivré) |
| Sidebar active | `#966442` avec fond `#966442/10` |
| Icônes stats | `#966442` |
| En-têtes sections | `#966442` |
| Accents secondaires | Variants plus clairs (`#966442/20`) |

### 2.3 Structure Sidebar

```text
┌─────────────────────┐
│  🏪 LOUMMEL ADMIN   │
├─────────────────────┤
│ 📊 Dashboard        │  → Vue d'ensemble + Wallets agrégés
│ 🏬 Boutiques        │  → Gestion boutiques (existant)
│ 🚚 Wanda Services   │  → Module logistique complet
│ ⚙️ Paramètres       │  → Config + Administration
└─────────────────────┘
```

### 2.4 Dashboard Overview avec Wallets

Les cartes wallets afficheront :

```text
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  📱 MTN Mobile Money             │  │  📱 Orange Money                 │
│  ════════════════════            │  │  ════════════════════            │
│  Solde: 2,450,000 FCFA           │  │  Solde: 1,875,000 FCFA           │
│  En attente: 125,000 FCFA        │  │  En attente: 89,000 FCFA         │
│  ──────────────────────          │  │  ──────────────────────          │
│  Ce mois:                        │  │  Ce mois:                        │
│  ↑ +850,000 reçus                │  │  ↑ +620,000 reçus                │
│  ↓ -200,000 retirés              │  │  ↓ -150,000 retirés              │
│  📈 12 transactions              │  │  📈 8 transactions               │
└──────────────────────────────────┘  └──────────────────────────────────┘
```

### 2.5 Module Wanda Services

Trois sections principales :

**Section Finance** :
- Chiffre d'affaires livraisons (total delivery_cost)
- Coûts opérationnels (estimé 70% du CA)
- Marge nette (delivery_fee total)

**Section Stats** :
- Volume colis (locaux vs internationaux) avec pie chart
- Temps moyen de livraison (jours)
- Note satisfaction moyenne (étoiles)

**Section Qualité** :
- Compteur avaries (is_damaged = true)
- Produits renvoyés (is_returned = true)
- Taux de réussite

**Tableau de suivi** :
- Liste paginée des expéditions
- Filtres par statut
- Badges dynamiques colorés

---

## Phase 3 : Corrections de Sécurité

### 3.1 Vulnérabilité CRITIQUE : reset-test-passwords

**Problème** : Secret hardcodé `loummel-admin-reset-2024` en clair

**Solution** :
1. Supprimer la fonction `reset-test-passwords` (inutile en production)
2. Ou migrer le secret vers les Supabase Secrets avec `Deno.env.get('ADMIN_RESET_SECRET')`

**Action recommandée** : Suppression complète

### 3.2 Protection Leaked Password

Activer via l'outil `configure-auth` la protection contre les mots de passe compromis.

### 3.3 Audit des RLS existantes

Toutes les tables ont des RLS correctement configurées. Vérification :

| Table | RLS | Statut |
|-------|-----|--------|
| shops | ✅ | Correct - Super admin, Owner, Partners |
| partners | ✅ | Correct |
| profiles | ✅ | Corrigé récemment pour super admin |
| notifications | ✅ | Corrigé récemment |
| products/services | ✅ | Correct |
| user_roles | ✅ | Correct |
| audit_logs | ✅ | Super admin only |
| flyers | ✅ | Correct |

---

## Phase 4 : Tests End-to-End

### 4.1 Scénarios de test automatisés

1. **Login Admin** : `/backoffice` → redirection `/dashboard/admin`
2. **Affichage Wallets** : Vérifier les montants agrégés
3. **Navigation Sidebar** : Tous les onglets fonctionnels
4. **Wanda Services** : Stats et tableau des expéditions
5. **Notifications** : Clic → détails boutique
6. **Création admin délégué** : Sans déconnexion

### 4.2 Tests manuels via Browser Tool

Utilisation du browser tool pour :
- Capturer des screenshots
- Vérifier les interactions UI
- Valider les appels API

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `supabase/migrations/xxx_wallets.sql` | Créer |
| `src/components/admin/AdminSidebar.tsx` | Créer |
| `src/components/admin/AdminHeader.tsx` | Créer |
| `src/components/admin/DashboardOverview.tsx` | Créer |
| `src/components/admin/WalletCard.tsx` | Créer |
| `src/components/admin/WandaServicesTab.tsx` | Créer |
| `src/components/admin/ShipmentTable.tsx` | Créer |
| `src/pages/dashboard/AdminDashboard.tsx` | Refactoriser |
| `src/data/admin-mock-data.ts` | Créer (données fictives) |
| `supabase/functions/reset-test-passwords/` | Supprimer |

---

## Estimation de l'effort

| Phase | Complexité | Temps estimé |
|-------|------------|--------------|
| Phase 1 (DB) | Moyenne | ~15 min |
| Phase 2 (Dashboard) | Élevée | ~45 min |
| Phase 3 (Sécurité) | Faible | ~10 min |
| Phase 4 (Tests) | Moyenne | ~15 min |
| **Total** | | **~1h30** |

---

## Résultat attendu

Après implémentation :
- Dashboard admin moderne avec sidebar latérale
- Wallets MTN MoMo et Orange Money avec soldes temps réel
- Module Wanda Services complet (finance, stats, qualité)
- Corrections sécurité appliquées
- Interface cohérente avec la couleur `#966442`
- Données mock visibles immédiatement

