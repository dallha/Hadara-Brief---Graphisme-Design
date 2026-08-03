# Volume 1 : Manuel Utilisateur & Administrateur

> [!WARNING]  
> **Clause de Stricte Réalité** : Toutes les fonctionnalités décrites ici reflètent fidèlement le comportement de l'application en production (Code base actuel). Les fonctionnalités prévues mais non implémentées sont explicitement signalées.

---

## 1. Vue d'Ensemble des Espaces (Routage)

L'application web est structurée autour de plusieurs chemins principaux (`routes`), chacun correspondant à un espace dédié :
- `/studio` (ou `/`) : Page d'accueil principale (Landing Hero).
- `/portfolio` : Vitrine des réalisations passées.
- `/brief` : Formulaire intelligent pour la création d'un nouveau brief client.
- `/boutique` (ou `/store`) : Boutique d'accessoires et outils créatifs.
- `/cv` : Curriculum Vitae interactif du graphiste.
- `/roadmap` : Feuille de route des fonctionnalités (Roadmap).
- `/espace-client` (ou `/portail-client`, `/suivi`) : Portail sécurisé pour le suivi des projets clients.
- `/admin` : Espace d'administration sécurisé (Hadara Manager).

---

## 2. Espace Client (Utilisateur Final)

Cette section couvre les parcours destinés aux visiteurs et clients du studio.

### 2.1 Navigation & Découverte
*   **Écran d'Accueil (Splash Screen)** : Lors de la première visite stricte sur `/`, un écran de chargement (SplashEntry) s'affiche avec le slogan *"L'art de donner vie à vos idées"*, avant d'entrer dans le Studio.
*   **Portfolio** : Les utilisateurs peuvent consulter les projets filtrables par catégories. Ils peuvent cliquer sur "Je veux ce style !" sur un projet spécifique pour être redirigés vers le formulaire de brief avec le style présélectionné.

![Accueil Hadara Studio](/public/images/docs/accueil.png)
*(Aperçu de la Landing Page)*

![Portfolio Hadara](/public/images/docs/portfolio.png)
*(Aperçu de la vue Portfolio)*

### 2.2 Création de Projet (Le Brief Intelligent)
Le parcours de commande s'effectue via le composant **BriefForm**.
1.  **Formulaire Multi-étapes** : L'utilisateur remplit un formulaire détaillé structurant sa demande.
2.  **Soumission** : Le backend génère un identifiant unique (ex: `HAD-0001`). Une notification Telegram est envoyée.
3.  **Confirmation** : L'utilisateur est redirigé vers la page `/confirmation`.

![Formulaire de Brief](/public/images/docs/brief.png)
*(Aperçu du Formulaire Intelligent)*

### 2.3 La Boutique (Hadara Store)
*   **Consultation** : Accès au catalogue (avec fallback de cache local hors ligne).
*   **Achat** : L'achat s'effectue via le bouton "Commander sur WhatsApp".

![Boutique Hadara](/public/images/docs/boutique.png)
*(Aperçu de la Boutique)*

### 2.4 Le Portail Client (`/espace-client`)
*   **Suivi de projet** : Le client consulte les détails de son brief (Statut, Devis, Notes) via un Code d'Accès.

![Portail Client](/public/images/docs/portail_client.png)
*(Aperçu du Portail Client)*

---

## 3. Espace Administrateur (Hadara Manager)

L'espace `/admin` est le poste de contrôle complet du graphiste.

### 3.1 Sécurité & Authentification
*   **Verrouillage (Lock Screen)** : Protection Brute-Force (Verrouillage de 15 minutes après 5 erreurs). Déconnexion automatique après 30 minutes d'inactivité.

### 3.2 Tableau de Bord (Dashboard & CRM)
L'administrateur navigue dans un tableau de bord à plusieurs onglets.

#### A. Onglet "Briefs & Commandes" (Vue Kanban)
*   Les briefs sont organisés en colonnes Kanban : **Nouveau**, **En Cours**, **En Attente**, et **Terminé**.

![Dashboard Kanban](/public/images/docs/dashboard.png)
*(Aperçu de la vue Kanban / CRM)*

#### B. Analyse IA (Bouton "Analyser avec l'IA")
*   Envoie le contenu du brief au backend (modèle **Gemini 2.5 Flash**). Le modèle génère une analyse, un brouillon WhatsApp et 3 concepts artistiques originaux.

![Analyse IA](/public/images/docs/ia.png)
*(Aperçu du résultat d'Analyse IA)*

#### C. Onglet "Boutique & Produits"
*   **Inventaire** : CRUD complet des produits. (Attention : Nécessite une connexion réseau. Aucune file d'attente hors-ligne n'est implémentée).

---

## 4. Foire Aux Questions (FAQ)

**Q : Pourquoi mon brief n'arrive pas ?**
> Assurez-vous que les champs obligatoires sont bien remplis. Si la notification Telegram n'arrive pas, vérifiez que le backend possède bien la variable d'environnement `TELEGRAM_BOT_TOKEN` correcte. Le brief reste néanmoins visible dans la vue Kanban de l'admin.

**Q : Pourquoi la boutique n'est pas synchronisée / modifiée ?**
> Actuellement, les actions de modification du catalogue (Admin) échouent si vous êtes hors-ligne. Une connexion à Internet est indispensable pour que les changements soient envoyés au serveur PostgreSQL.

**Q : Comment modifier un produit ?**
> Connectez-vous à l'espace Admin (`/admin`), allez dans l'onglet "Boutique", cliquez sur l'icône de crayon (Édition) sur le produit souhaité, modifiez les champs et cliquez sur "Mettre à jour".

**Q : Comment changer Gemini ou Telegram ?**
> L'intégration IA et Telegram est gérée exclusivement via le backend. Modifiez les variables `GEMINI_API_KEY` et `TELEGRAM_BOT_TOKEN` dans le tableau de bord de votre hébergeur (Render) et redémarrez le serveur.

**Q : Comment restaurer une sauvegarde ?**
> La base de données PostgreSQL de production gère ses propres backups (gérés par Supabase ou Render). Aucune restauration en un clic n'est disponible depuis l'interface web.
