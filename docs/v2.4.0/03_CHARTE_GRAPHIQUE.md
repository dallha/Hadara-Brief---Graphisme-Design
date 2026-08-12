# Hadara Design System & Charte Graphique — v2.4.0

Le Design System d'Hadara assure la cohérence visuelle entre le site vitrine (public), le portail client (privé), et l'espace administrateur Django (Manager).

## 1. Couleurs Officielles (Design Tokens)

- **Dark Navy (Fond Principal)** : `#070B18`
- **Gold (Couleur d'Action / Marque)** : `#D0A21C`
- **Steel Blue (Bordures / Éléments Secondaires)** : `#335A79`
- **Light Slate (Texte Secondaire)** : `#94A3B8`
- **White (Texte Principal)** : `#FFFFFF` / `#F5F5F5`

### 1.1 Couleurs Sémantiques (Statuts et Facturation)
Pour les badges, statuts de briefs et de paiements :
- **Succès / Payé / Terminé** : Vert Émeraude (`#10B981` ou classe `success`)
- **Alerte / En Retard** : Rouge Corail (`#EF4444` ou classe `danger`)
- **Action Requise / En Attente / Nouveau** : Orange Ambre (`#F59E0B` ou classe `warning`)
- **Neutre / Proforma / Annulé** : Gris Ardoise (`#64748B` ou classe `secondary`)

## 2. Typographie

La plateforme utilise la police **Outfit** (Google Fonts) pour l'ensemble de l'interface, offrant un look moderne, géométrique et lisible.

- **Titres (H1, H2, H3)** : Outfit Bold (700)
- **Corps de texte (p, span, labels)** : Outfit Light (300) ou Regular (400)
- **Éléments interactifs (boutons, badges)** : Outfit SemiBold (600)

## 3. Composants UI Clés

### 3.1 Hadara Chips (Tags)
Utilisés pour remplacer les listes complexes (ex: Audiences, Options).
- Style : Fond transparent avec bordure de couleur, texte coloré, bordures très arrondies (`border-radius: 9999px`).

### 3.2 Champs de Formulaire (Inputs ultra-épurés)
- Fond transparent ou extrêmement sombre (`#0f1629`).
- Bordure simple en bas (Underline) ou contour complet avec focus lumineux.
- Pas d'encombrement visuel.

### 3.3 Dashboard Cockpit (Django Admin)
Le thème de l'administration repose sur **Jazzmin (Darkly)**, surchargé par un fichier CSS personnalisé (`hadara_admin.css`).
Les montants financiers utilisent la fonction native `format_html` combinée à une typographie grasse (`<strong>`) avec espace insécable pour les milliers, de manière à empêcher les erreurs de rendu (Bug de la v2.3 corrigé dans la v2.4.0).
