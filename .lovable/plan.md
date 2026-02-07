
# Plan de correction : Redirection Admin après login

## Problème identifié
Une condition de course dans `AuthContext.tsx` provoque une redirection prématurée vers la page d'accueil avant que les rôles de l'utilisateur ne soient chargés depuis la base de données.

## Solution technique

### Fichier 1 : `src/contexts/AuthContext.tsx`

Refactoriser le `useEffect` pour séparer clairement le chargement initial des mises à jour en cours :

```text
Changements clés :
┌─────────────────────────────────────────────────────────────┐
│ 1. Ajouter un flag `isMounted` pour éviter les mises à     │
│    jour d'état après démontage                              │
│                                                             │
│ 2. Séparer l'initialisation (contrôle loading) des         │
│    changements en cours (fire-and-forget)                   │
│                                                             │
│ 3. S'assurer que `loading = false` seulement APRÈS          │
│    la récupération complète des rôles                       │
└─────────────────────────────────────────────────────────────┘
```

Structure du nouveau code :
```typescript
useEffect(() => {
  let isMounted = true;

  // Fonction centralisée pour récupérer les rôles
  const loadRoles = async (userId: string) => {
    const fetchedRoles = await fetchUserRoles(userId);
    if (isMounted) setRoles(fetchedRoles);
    return fetchedRoles;
  };

  // Listener pour les CHANGEMENTS en cours (ne contrôle PAS loading)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      // Fire-and-forget - pas de await, pas de setLoading
      if (session?.user) {
        loadRoles(session.user.id);
      } else {
        setRoles([]);
      }
    }
  );

  // INITIALISATION (contrôle loading)
  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      // Attendre les rôles AVANT de mettre loading à false
      if (session?.user) {
        await loadRoles(session.user.id);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  initializeAuth();

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []);
```

### Fichier 2 : `src/pages/Backoffice.tsx`

Ajouter une protection supplémentaire dans le `handleLogin` pour s'assurer que les rôles sont disponibles avant de compter sur l'effet de redirection automatique :

```typescript
// Dans handleLogin, après signIn réussi :
const handleLogin = async (e: React.FormEvent) => {
  // ... validation et signIn existants ...
  
  if (error) {
    // ... gestion erreur ...
    return;
  }
  
  toast({
    title: "Connexion réussie",
    description: "Vérification des droits d'accès...",
  });
  
  // La redirection sera gérée par l'effet useEffect
  // une fois que loading = false ET roles sont chargés
  setIsLoading(false);
};
```

L'effet existant à la ligne 40-54 fonctionnera correctement une fois que `AuthContext` sera corrigé.

## Séquence de correction

| Étape | Action | Fichier |
|-------|--------|---------|
| 1 | Refactoriser le useEffect avec pattern isMounted | `AuthContext.tsx` |
| 2 | Séparer initializeAuth (async/await) du listener onAuthStateChange | `AuthContext.tsx` |
| 3 | S'assurer que loading reste true jusqu'à completion | `AuthContext.tsx` |

## Résultat attendu

Après correction :
1. Admin se connecte sur `/backoffice`
2. `signIn()` réussit, `onAuthStateChange` se déclenche
3. `loading` reste `true` pendant le fetch des rôles
4. Une fois `roles` chargés avec `['super_admin']`, `loading` passe à `false`
5. L'effet dans Backoffice détecte `user + !loading + roles.includes('super_admin')`
6. Redirection vers `/dashboard/admin`

## Pour le compte de Saliou

Une fois la correction déployée, tu pourras créer le compte depuis l'onglet "Administration" du dashboard admin avec les champs nom, email et mot de passe temporaire.
