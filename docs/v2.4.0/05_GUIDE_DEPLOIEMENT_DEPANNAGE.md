# Guide de Déploiement & Dépannage (v2.4.0)

Ce document décrit comment déployer l'application et comment résoudre les problèmes fréquents rencontrés en production.

## 1. Architecture de Déploiement

- **Serveur Web** : Render.com (Web Service) utilisant Gunicorn.
- **Base de Données** : Neon.tech (PostgreSQL Serverless)
- **Fichiers Statiques** : WhiteNoise (compression et cache intégrés)

## 2. Procédure de Déploiement (Render)

L'application est déployée automatiquement lors d'un `git push` sur la branche `main`.
Le cycle de déploiement exécute le script défini dans Render (Build Command) :
```bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

### 2.1 Variables d'Environnement Obligatoires
- `DATABASE_URL` : URL de connexion NeonDB.
- `SECRET_KEY` : Clé secrète Django.
- `DEBUG` : Doit être à `False` en production.
- `ALLOWED_HOSTS` : Les domaines autorisés (ex: `hadara-backend.onrender.com`).

## 3. Dépannage Courant

### 3.1 Erreur 500 sur le Tableau de bord Admin ou les Vues
**Symptôme** : Écran "Server Error (500)" au chargement de `/api/django-admin/` ou lors du clic sur un lien du menu.

**Causes et Solutions** :
1. **Migrations manquantes** : 
   Si le code a ajouté des modèles ou des champs (ex: la colonne `whatsapp` pour les clients), mais que la commande `python manage.py migrate` n'a pas été exécutée, la BDD crashera. 
   - *Solution* : Aller dans le Shell Render et lancer `python manage.py migrate`.
   
2. **Erreurs de Template (NoReverseMatch)** :
   Une URL définie dans un template (ex: `{% url 'admin:api_payment_changelist' %}`) pointe vers un modèle qui n'a pas été enregistré via `@admin.register(...)` dans `admin.py`.
   - *Solution* : Vérifier l'enregistrement des modèles. C'était l'origine du bug résolu dans la v2.4.0.

3. **Erreurs de formatage `format_html`** :
   Dans l'admin, un appel comme `format_html("<b>{:,}</b>", obj.montant)` provoque un crash fatal 500 sous Django en production.
   - *Solution* : Formater la variable en amont en python pur, puis la passer à `format_html`.

### 3.2 Problème de Swagger Docs (404)
**Symptôme** : L'accès à `/docs/` ou `/redoc/` renvoie une page introuvable.
**Solution** : Assurez-vous que `drf-spectacular` est installé (présent dans `requirements.txt`), déclaré dans `INSTALLED_APPS`, et que les routes sont bien incluses dans `urls.py`. C'est fonctionnel par défaut depuis la v2.4.0.

## 4. Accès d'Urgence à la Base de Données

En cas de crise majeure, vous pouvez tester la base de données de production directement depuis votre environnement local (Sandbox ou PC) en surchargeant la variable d'environnement :

```bash
DATABASE_URL="postgresql://neondb_owner:VOTRE_MOT_DE_PASSE@votre-serveur-neon.tech/neondb?sslmode=require" python manage.py check
```
Ceci permet de lancer des requêtes de diagnostic (comme `showmigrations` ou un script de test) sans impacter le code de production.
