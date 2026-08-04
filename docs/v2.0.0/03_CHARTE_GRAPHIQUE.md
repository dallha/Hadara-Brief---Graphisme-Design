# Charte Graphique & Design System

Cette charte graphique documente l'identité visuelle officielle de **Hadara Suite**. Elle doit être strictement respectée par tout développeur ou designer intervenant sur le produit afin de maintenir la cohérence de l'interface SaaS.

---

## 1. Philosophie Visuelle (Dark Aesthetic)

La Hadara Suite est conçue pour dégager un aspect premium, technologique et exclusif. Plutôt que d'utiliser des fonds blancs classiques, l'application utilise une esthétique globale "Dark Mode" native. Elle allie la sobriété du mode sombre à des touches lumineuses rappelant le luxe (Or) et la confiance (Bleu/Émeraude).

---

## 2. Palette de Couleurs

### A. Couleurs Identitaires de Marque
Ces couleurs sont le socle de l'identité Hadara :
*   **Bleu Profond (Confiance & Sérieux)** : `#335A79`
*   **Or Olive (Prestige & Qualité)** : `#816C07`

### B. Couleurs d'Interface (Variables Tailwind)
*   **Fond Principal** : `slate-950` (`#020617`) - Utilisé pour le body.
*   **Fonds Secondaires (Cartes, Panneaux, Modals)** : `slate-900` (`#0f172a`)
*   **Texte Principal** : `slate-100` (`#f1f5f9`) - Blanc cassé pour éviter la fatigue visuelle (jamais `#FFFFFF` pur).
*   **Texte Secondaire** : `slate-400` (`#94a3b8`) - Pour les paragraphes, placeholders et labels.
*   **Couleurs d'Accent (Hadara Gold UX)** : `amber-400` (`#fbbf24`) et `amber-500` (`#f59e0b`). Utilisé pour attirer l'attention (Titres actifs, étoiles, liens importants).

### C. Couleurs d'État (Sémantiques)
*   **Succès / En ligne / Acompte Payé** : `emerald-400` (`#34d399`)
*   **Erreur / Alerte / Corbeille** : `rose-500` (`#f43f5e`)

---

## 3. Typographie

*   **Titres (H1, H2, Logos)** : `font-serif` (Playfair Display ou l'équivalent système). Donne un aspect classique, luxueux et rassurant (Le côté "Tradition").
*   **Corps de texte (Body, Paragraphes)** : `font-sans` (Inter, Roboto ou police système sans-serif). Privilégie la lisibilité maximale (Le côté "Modernité").
*   **Chiffres, Prix et Codes** : `font-mono` (Fira Code ou équivalent). Utilisé pour afficher clairement des prix FCFA (`15 000 FCFA`), des dates ou des identifiants (`HAD-0001`).

---

## 4. Logo

### Règle d'usage
*   Le logo texte doit toujours être affiché en police **Serif** (`font-serif`) et en gras (`font-bold`).
*   **Format standard** : "HADARA" en majuscules.
*   **Variations acceptées** : 
    - Blanc (`text-slate-100`) sur fond sombre.
    - Doré (`text-amber-400` ou `#816C07`) pour les signatures ou devis.

---

## 5. Boutons (Boutonnerie)

Les appels à l'action (CTA) suivent une hiérarchie stricte :

### A. CTA Principal (Primary Button)
*   **Style** : `bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl`
*   **Usage** : Actions cruciales (Créer un brief, Payer, Sauvegarder).
*   **Interaction** : Hover avec augmentation de l'ombre `hover:shadow-lg hover:shadow-amber-500/20`.

### B. CTA Secondaire (Secondary Button)
*   **Style** : `bg-slate-800 text-slate-200 border border-slate-700 rounded-xl`
*   **Usage** : Actions alternatives (Annuler, Retour, Fermer).
*   **Interaction** : Hover vers `bg-slate-700`.

### C. CTA Destructeur (Danger Button)
*   **Style** : `bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl`
*   **Usage** : Suppression (Placer dans la corbeille).

---

## 6. Badges et Étiquettes

Les badges sont utilisés pour les statuts (Kanban, Boutique). Ils doivent toujours avoir un fond semi-transparent (Opacité 10% à 20%) et un texte coloré vif pour un effet néon chic.

*   **Badge Actif/Nouveau** : `bg-amber-400/10 text-amber-400 border border-amber-400/20`
*   **Badge Succès/Terminé** : `bg-emerald-400/10 text-emerald-400 border border-emerald-400/20`
*   **Badge Neutre/En attente** : `bg-slate-800 text-slate-300 border border-slate-700`
*   **Border-radius** : Toujours `rounded-full` (capsule).

---

## 7. Espacements & Structure (Grids)

*   **Padding interne des Cartes** : Toujours `p-6` ou `p-8` sur desktop, réduit à `p-4` sur mobile.
*   **Arrondis des Cartes** : Utilisation intensive de composants très arrondis pour un aspect moderne : `rounded-2xl` ou `rounded-3xl` pour les conteneurs principaux.
*   **Effets de Verre (Glassmorphism)** : Les modals et barres de navigation figées (`sticky`/`fixed`) doivent utiliser un flou arrière-plan : `backdrop-blur-md bg-slate-950/80` pour laisser deviner la page en dessous.

---

## 8. Icônes

*   **Librairie officielle** : **Lucide React** (ex: `<Briefcase />`, `<CheckCircle2 />`).
*   **Taille standard** : `w-5 h-5` pour les listes, `w-6 h-6` pour la navigation.
*   **Épaisseur (Stroke)** : Standard (2px). Les icônes ne doivent jamais être remplies (solid), toujours en contour (outline) pour garder la légèreté de l'interface.
