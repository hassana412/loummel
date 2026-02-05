

## Plan : Créer une page `/creer-ma-boutique` ultra-simplifiée

### Diagnostic du problème actuel

**Point de blocage principal :** La table `user_roles` n'a pas de politique RLS permettant aux utilisateurs d'insérer leur propre rôle. Actuellement :
- Seuls les `super_admin` peuvent INSERT dans `user_roles`
- Quand le formulaire essaie d'attribuer le rôle `shop_owner`, cela échoue silencieusement

**Solution :** Créer une Edge Function (backend) qui attribue le rôle de manière sécurisée avec le `service_role_key`.

---

### Architecture de la solution

```text
┌─────────────────────────────────────────────────────────────────┐
│                   /creer-ma-boutique                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Vérifie si l'utilisateur est connecté                       │
│     └── Non → Redirige vers /auth/vendeur                       │
│                                                                  │
│  2. Formulaire simplifié (4 champs)                              │
│     • Nom de la boutique                                         │
│     • Secteur d'activité (Select)                                │
│     • Ville                                                      │
│     • Numéro WhatsApp                                            │
│                                                                  │
│  3. Soumission                                                   │
│     ├── INSERT dans shops (RLS OK : user_id = auth.uid())        │
│     └── Appel Edge Function → INSERT user_roles (service_role)  │
│                                                                  │
│  4. Succès → Redirige vers /dashboard/boutique                   │
│     Erreur → Affiche message clair                               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Fichiers à créer/modifier

#### 1. Edge Function : `assign-shop-owner-role`

**Fichier :** `supabase/functions/assign-shop-owner-role/index.ts`

Cette fonction backend va :
- Vérifier que l'utilisateur est authentifié
- Vérifier qu'il a bien une boutique créée
- Insérer le rôle `shop_owner` dans `user_roles` avec le `service_role_key`

```typescript
// Logique simplifiée
const { user_id } = await req.json()

// Vérifier que l'utilisateur a une boutique
const { data: shop } = await supabaseAdmin
  .from('shops')
  .select('id')
  .eq('user_id', user_id)
  .single()

if (!shop) throw new Error('Aucune boutique trouvée')

// Attribuer le rôle
await supabaseAdmin
  .from('user_roles')
  .upsert({ user_id, role: 'shop_owner' }, { onConflict: 'user_id,role' })
```

#### 2. Nouvelle page simplifiée

**Fichier :** `src/pages/CreerMaBoutique.tsx`

Structure du composant :
- Vérification de connexion au montage
- Formulaire avec 4 champs obligatoires
- Validation avec Zod
- Gestion d'erreurs détaillée
- Redirection automatique après succès

```tsx
// Structure simplifiée
const CreerMaBoutique = () => {
  const { user, loading } = useAuth()
  
  // Rediriger si non connecté
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/vendeur?redirect=/creer-ma-boutique')
    }
  }, [user, loading])
  
  const handleSubmit = async () => {
    try {
      // 1. Insérer la boutique
      const { data: shop, error } = await supabase
        .from('shops')
        .insert({
          user_id: user.id,
          name: formData.shopName,
          slug: generateSlug(formData.shopName),
          category: formData.category,
          city: formData.city,
          contact_whatsapp: formData.whatsapp,
          status: 'pending'
        })
        .select()
        .single()
      
      if (error) throw error
      
      // 2. Appeler l'Edge Function pour attribuer le rôle
      await supabase.functions.invoke('assign-shop-owner-role')
      
      // 3. Rediriger vers le dashboard
      navigate('/dashboard/boutique')
      
    } catch (error) {
      // Afficher message d'erreur clair
      toast({
        title: "Erreur",
        description: getDetailedErrorMessage(error),
        variant: "destructive"
      })
    }
  }
}
```

#### 3. Ajouter la route

**Fichier :** `src/App.tsx`

```tsx
import CreerMaBoutique from "./pages/CreerMaBoutique";

// Dans les routes publiques
<Route path="/creer-ma-boutique" element={<CreerMaBoutique />} />
```

---

### Design du formulaire

```text
┌────────────────────────────────────────────────────────┐
│                                                        │
│   🏪  Créer ma boutique en 2 minutes                    │
│                                                        │
│   ┌──────────────────────────────────────────────┐    │
│   │  Nom de la boutique *                        │    │
│   │  [ Artisanat du Sahel                     ]  │    │
│   └──────────────────────────────────────────────┘    │
│                                                        │
│   ┌──────────────────────────────────────────────┐    │
│   │  Secteur d'activité *                        │    │
│   │  [ ▼ Sélectionnez une catégorie          ]  │    │
│   └──────────────────────────────────────────────┘    │
│                                                        │
│   ┌──────────────────────────────────────────────┐    │
│   │  Ville *                                      │    │
│   │  [ Maroua                                 ]  │    │
│   └──────────────────────────────────────────────┘    │
│                                                        │
│   ┌──────────────────────────────────────────────┐    │
│   │  Numéro WhatsApp *                            │    │
│   │  [ +237 6XX XXX XXX                       ]  │    │
│   └──────────────────────────────────────────────┘    │
│                                                        │
│   ┌──────────────────────────────────────────────┐    │
│   │         🚀 Créer ma boutique                  │    │
│   └──────────────────────────────────────────────┘    │
│                                                        │
│   ⚠️ Votre boutique sera visible après validation     │
│      par notre équipe (24-48h)                         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### Gestion des erreurs détaillée

Messages d'erreur clairs selon le type :

| Code erreur | Message affiché |
|-------------|-----------------|
| `23505` (duplicate) | "Vous avez déjà une boutique. Accédez à votre dashboard." |
| `42501` (RLS violation) | "Erreur de permission. Veuillez vous reconnecter." |
| `23503` (foreign key) | "Erreur de référence. Contactez le support." |
| Autre | Message technique + suggestion de contact support |

---

### Catégories disponibles (Select)

Basé sur les catégories existantes dans le code :
- Artisanat
- Électronique
- Téléphones
- Meubles
- Restaurant
- Textiles
- Bijoux
- Cuir
- Poterie
- Autre

---

### Séquence complète du flux

```text
Utilisateur                    Frontend                      Backend
    │                              │                              │
    │──── Accède /creer-ma-boutique ───►│                              │
    │                              │                              │
    │                        ┌─────┴─────┐                         │
    │                        │ Connecté? │                         │
    │                        └─────┬─────┘                         │
    │                              │                              │
    │                         Non  │  Oui                         │
    │◄───── Redirige /auth/vendeur │                              │
    │                              │                              │
    │──── Remplit formulaire ──────►│                              │
    │                              │                              │
    │                              │─── INSERT shops ─────────────►│
    │                              │                              │
    │                              │◄─── Shop créé (id) ──────────│
    │                              │                              │
    │                              │─── invoke Edge Function ─────►│
    │                              │    (assign-shop-owner-role)   │
    │                              │                              │
    │                              │◄─── Rôle attribué ───────────│
    │                              │                              │
    │◄─── Redirige /dashboard/boutique                             │
    │                              │                              │
```

---

### Résumé des fichiers

| Fichier | Action | Description |
|---------|--------|-------------|
| `supabase/functions/assign-shop-owner-role/index.ts` | Créer | Edge Function pour attribuer le rôle shop_owner |
| `src/pages/CreerMaBoutique.tsx` | Créer | Page simplifiée avec formulaire 4 champs |
| `src/App.tsx` | Modifier | Ajouter la route `/creer-ma-boutique` |

