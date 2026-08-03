# Charte Graphique & Design System

> [!WARNING]  
> **Clause de Stricte Réalité** : Cette charte reflète fidèlement les composants et classes Tailwind utilisés dans le code source actuel. 

---

## 1. L'Univers "Hadara" (Dark Aesthetic)

La Hadara Suite est conçue pour dégager un aspect extrêmement premium, technologique et exclusif. Plutôt que d'utiliser des fonds blancs classiques (trop génériques), l'application utilise une esthétique globale "Dark Mode" native. Le thème repose sur l'utilisation du `slate` profond combiné à des touches lumineuses d'or (Ambre) et d'émeraude (succès).

## 2. Couleurs (Variables Tailwind)

### A. Fonds & Typographie Base
*   **Fond Principal** : `bg-slate-950` (#020617)
*   **Fond Secondaire (Cartes, Panneaux)** : `bg-slate-900` (#0f172a)
*   **Texte Principal** : `text-slate-100` (#f1f5f9) - Blanc cassé pour éviter la fatigue visuelle.
*   **Texte Secondaire** : `text-slate-400` (#94a3b8) - Pour les paragraphes et détails.

### B. Couleurs d'Accent (Hadara Gold)
L'or représente le côté prestigieux de la création.
*   **Primaire / Accent** : `text-amber-400`, `text-amber-500`
*   **Gradients d'action (Boutons)** : `bg-gradient-to-r from-amber-500 to-amber-600` (Souvent avec un texte foncé `text-slate-950` pour le contraste).
*   **Ombres de surbrillance** : `shadow-amber-500/20`

### C. Couleurs d'État
*   **Succès / En ligne** : `emerald-400` / `emerald-500`
*   **Erreur / Indisponible / Alerte** : `rose-400` / `red-500`

## 3. Typographie

*   **Titres (H1, H2)** : `font-serif` (Playfair Display ou l'équivalent système). Donne un aspect classique et luxueux.
*   **Corps de texte (Body)** : `font-sans` (Inter, Roboto ou police système sans-serif). Privilégie la lisibilité.
*   **Chiffres, Prix et Codes** : `font-mono` (Fira Code ou équivalent). Utilisé pour afficher clairement des prix FCFA (`15 000 FCFA`) ou des identifiants de projet (`HAD-0001`).

## 4. Iconographie et Espacement

*   **Icônes** : Utilisation stricte de la librairie **Lucide React**. Les icônes ont toujours des contours nets (`w-5 h-5` en standard).
*   **Bordures et Arrondis** : Utilisation intensive de composants arrondis pour un aspect moderne : `rounded-2xl` (cartes principales), `rounded-full` (badges et avatars).
*   **Effets de Verre (Glassmorphism)** : Les modals et certains en-têtes utilisent `backdrop-blur-md` ou `backdrop-blur-xl` pour laisser deviner le fond avec élégance.

## 5. Mobile-First & Responsive

La disposition est garantie pour fonctionner sur un téléphone portable en priorité. 
Une barre de navigation inférieure (**Bottom Navigation Bar**) est ancrée en bas de l'écran sur iOS/Android via des classes Tailwind (`fixed bottom-0 left-0 right-0 z-50`), incluant un padding spécial pour éviter le chevauchement avec l'encoche de l'iPhone (`pb-[env(safe-area-inset-bottom)]`).
