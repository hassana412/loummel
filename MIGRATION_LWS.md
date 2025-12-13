# Guide de Migration Loummel vers Hébergement LWS

Ce document détaille les étapes pour migrer la plateforme Loummel depuis Lovable Cloud vers un hébergement LWS avec base de données PostgreSQL.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Export du Code Source](#export-du-code-source)
3. [Préparation de l'Hébergement LWS](#préparation-de-lhébergement-lws)
4. [Migration de la Base de Données](#migration-de-la-base-de-données)
5. [Configuration des Variables d'Environnement](#configuration-des-variables-denvironnement)
6. [Déploiement](#déploiement)
7. [Configuration du Domaine et SSL](#configuration-du-domaine-et-ssl)
8. [Tests Post-Migration](#tests-post-migration)
9. [Maintenance](#maintenance)

---

## 1. Prérequis

### Côté LWS
- **Offre d'hébergement** : LWS Panel (cPanel) ou LWS Cloud
- **Base de données** : PostgreSQL 14+ (ou continuer avec Supabase externe)
- **Node.js** : Version 18+ (si hébergement Node.js)
- **Espace disque** : Minimum 500 Mo
- **Certificat SSL** : Let's Encrypt (gratuit) ou certificat personnalisé

### Outils Nécessaires
- Git installé localement
- Node.js 18+ et npm/bun
- Client PostgreSQL (psql, pgAdmin, ou DBeaver)
- Accès FTP/SFTP ou SSH à LWS

### Comptes et Accès
- Compte GitHub connecté à Lovable
- Accès au panneau de contrôle LWS
- Accès à la base de données Supabase actuelle (pour export)

---

## 2. Export du Code Source

### Option A : Via GitHub (Recommandé)

1. **Connecter GitHub à Lovable** :
   - Dans Lovable, aller dans **Settings → GitHub**
   - Cliquer sur **Connect to GitHub**
   - Autoriser l'application Lovable GitHub
   - Créer un nouveau repository

2. **Cloner le repository** :
   ```bash
   git clone https://github.com/VOTRE_USERNAME/loummel.git
   cd loummel
   ```

3. **Installer les dépendances** :
   ```bash
   npm install
   # ou avec bun
   bun install
   ```

4. **Build de production** :
   ```bash
   npm run build
   # ou
   bun run build
   ```
   
   Les fichiers de production seront dans le dossier `dist/`.

### Option B : Export Manuel

1. Dans Lovable, accéder à **Settings → Export**
2. Télécharger le ZIP du projet
3. Extraire et suivre les étapes de build ci-dessus

---

## 3. Préparation de l'Hébergement LWS

### 3.1 Hébergement Statique (Simple)

Si vous utilisez Supabase en externe, le frontend est une **application statique** (HTML/CSS/JS).

1. **Accéder au panneau LWS**
2. **Créer un nouveau site** ou utiliser un domaine existant
3. **Configurer le dossier racine** vers le répertoire où vous uploaderez les fichiers

### 3.2 Hébergement Node.js (Avancé)

Si vous avez des Edge Functions ou backend personnalisé :

1. **Choisir une offre LWS avec Node.js** (LWS Cloud ou VPS)
2. **Configurer l'environnement Node.js** :
   ```bash
   # Via SSH
   nvm install 18
   nvm use 18
   ```

---

## 4. Migration de la Base de Données

### Option A : Continuer avec Supabase (Recommandé)

Vous pouvez garder Supabase comme backend même avec un hébergement LWS :

1. **Créer un projet Supabase externe** sur [supabase.com](https://supabase.com)
2. **Exporter les données actuelles** (voir section 4.1)
3. **Importer dans le nouveau projet** (voir section 4.2)
4. **Mettre à jour les variables d'environnement**

### Option B : Migration vers PostgreSQL LWS

#### 4.1 Export des Données Supabase

```bash
# Via Supabase CLI
supabase db dump --project-ref teahyhjstvkwzzgjunwg > backup.sql

# Ou via pg_dump avec les credentials Supabase
pg_dump -h db.teahyhjstvkwzzgjunwg.supabase.co \
        -U postgres \
        -d postgres \
        -F p \
        -f backup.sql
```

#### 4.2 Structure des Tables à Migrer

```sql
-- Tables principales
- profiles (utilisateurs)
- user_roles (rôles)
- shops (boutiques)
- products (produits)
- services (services)
- partners (partenaires)
- notifications (notifications)

-- Types ENUM
- app_role ('super_admin', 'partner', 'shop_owner')
- entity_status ('pending', 'approved', 'active', 'suspended')
- partnership_type ('commission', 'forfait')
```

#### 4.3 Import dans PostgreSQL LWS

1. **Créer la base de données** via phpPgAdmin ou cPanel
2. **Se connecter et importer** :
   ```bash
   psql -h HOST_LWS -U UTILISATEUR -d NOM_BDD < backup.sql
   ```

### 4.4 Migration du Storage (Images)

1. **Télécharger les images** depuis le bucket Supabase `shop-images`
2. **Options de stockage sur LWS** :
   - Upload direct sur le serveur LWS (`/public/uploads/`)
   - Utiliser un CDN externe (Cloudflare, AWS S3)
   - Garder Supabase Storage

---

## 5. Configuration des Variables d'Environnement

### Créer le fichier `.env.production`

```env
# Si vous gardez Supabase
VITE_SUPABASE_URL=https://VOTRE_PROJET.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Si vous migrez vers PostgreSQL LWS
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# Configuration de l'application
VITE_APP_URL=https://votre-domaine.com
```

### Variables selon le mode d'hébergement

| Variable | Supabase Externe | PostgreSQL LWS |
|----------|------------------|----------------|
| `VITE_SUPABASE_URL` | ✅ Requis | ❌ Non utilisé |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ Requis | ❌ Non utilisé |
| `DATABASE_URL` | ❌ Non utilisé | ✅ Requis |

---

## 6. Déploiement

### 6.1 Via FTP/SFTP

1. **Se connecter** avec FileZilla ou client FTP LWS
2. **Uploader le contenu du dossier `dist/`** vers le dossier racine web
3. **Vérifier les permissions** : fichiers 644, dossiers 755

### 6.2 Via SSH (Recommandé)

```bash
# Se connecter au serveur LWS
ssh utilisateur@votre-serveur.lws.fr

# Cloner le repo
git clone https://github.com/VOTRE_USERNAME/loummel.git
cd loummel

# Installer et build
npm install
npm run build

# Déplacer vers le dossier web public
cp -r dist/* /var/www/html/
# ou selon votre configuration LWS
cp -r dist/* ~/public_html/
```

### 6.3 Configuration du Serveur Web

#### Pour Apache (fichier `.htaccess`)

Créer à la racine du site :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Ne pas réécrire les fichiers existants
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rediriger toutes les routes vers index.html (SPA)
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Cache des assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

#### Pour Nginx

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/html;
    index index.html;

    # Gestion SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

---

## 7. Configuration du Domaine et SSL

### 7.1 Configuration DNS

Chez votre registrar (ou LWS si domaine acheté là) :

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | IP_SERVEUR_LWS |
| A | www | IP_SERVEUR_LWS |
| CNAME | www | votre-domaine.com |

### 7.2 Certificat SSL

**Via Let's Encrypt (recommandé)** :

```bash
# Si Certbot est disponible
sudo certbot --apache -d votre-domaine.com -d www.votre-domaine.com
# ou pour Nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

**Via cPanel LWS** :
1. Aller dans **SSL/TLS**
2. Cliquer sur **Let's Encrypt SSL**
3. Sélectionner votre domaine et valider

---

## 8. Tests Post-Migration

### 8.1 Checklist Fonctionnelle

- [ ] **Page d'accueil** : Chargement correct, images visibles
- [ ] **Navigation** : Toutes les pages accessibles
- [ ] **Authentification** :
  - [ ] Inscription fonctionne
  - [ ] Connexion fonctionne
  - [ ] Déconnexion fonctionne
- [ ] **Boutiques** :
  - [ ] Liste des boutiques visible
  - [ ] Pages boutique (produits, services, contact)
  - [ ] Boutique VIP "Artisanat Rhumsiki" accessible
- [ ] **Dashboards** :
  - [ ] Dashboard vendeur accessible
  - [ ] Dashboard partenaire accessible
  - [ ] Dashboard admin accessible
- [ ] **Formulaires** :
  - [ ] Inscription vendeur
  - [ ] Inscription partenaire
  - [ ] Contact boutique
- [ ] **Recherche** : Fonctionne correctement
- [ ] **Images** : Toutes les images chargent

### 8.2 Tests Techniques

```bash
# Vérifier le SSL
curl -I https://votre-domaine.com

# Tester les redirections
curl -I http://votre-domaine.com  # Doit rediriger vers HTTPS

# Vérifier la compression
curl -H "Accept-Encoding: gzip" -I https://votre-domaine.com
```

### 8.3 Comptes de Test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| rhumsiki@loummel.com | Shop123! | shop_owner |
| admin@loummel.com | Admin123! | super_admin |
| partenaire@loummel.com | Partner123! | partner |
| client@loummel.com | Client123! | (client) |

---

## 9. Maintenance

### 9.1 Mises à Jour

```bash
# Mettre à jour le code
cd /chemin/vers/loummel
git pull origin main
npm install
npm run build
cp -r dist/* /var/www/html/
```

### 9.2 Sauvegardes

**Base de données** :
```bash
# Sauvegarde quotidienne (cron)
0 2 * * * pg_dump -U user -d database > /backups/db_$(date +\%Y\%m\%d).sql
```

**Fichiers** :
```bash
# Sauvegarde hebdomadaire
0 3 * * 0 tar -czf /backups/files_$(date +\%Y\%m\%d).tar.gz /var/www/html/
```

### 9.3 Monitoring

- Configurer des alertes email pour les erreurs 500
- Utiliser des outils comme UptimeRobot pour surveiller la disponibilité
- Vérifier régulièrement les logs d'erreur Apache/Nginx

---

## 📞 Support

- **Documentation Lovable** : https://docs.lovable.dev
- **Documentation Supabase** : https://supabase.com/docs
- **Support LWS** : https://www.lws.fr/contact.php

---

## ⚠️ Notes Importantes

1. **Edge Functions** : Si vous utilisez des Edge Functions Supabase, elles resteront sur Supabase même avec un hébergement LWS pour le frontend.

2. **Authentification** : L'authentification Supabase continuera de fonctionner si vous gardez Supabase comme backend.

3. **Coûts** :
   - Supabase gratuit jusqu'à 50,000 utilisateurs actifs/mois
   - LWS hébergement à partir de ~3€/mois

4. **Performance** : Pour de meilleures performances, considérez un CDN (Cloudflare gratuit) devant votre site.

---

*Document créé le 13 décembre 2025 - Loummel v1.0*
