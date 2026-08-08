# HADARA SUITE v2.3.0 — Hadara Design System & UI Grammar 🎨

Le **Hadara Design System** unifie l'ADN visuel, les Design Tokens et la grammaire d'interaction entre la vitrine client publique (`https://hadara-design.com/`) et le cockpit d'administration **Hadara Manager** (`/api/django-admin/`).

---

## 🎨 1. Palette Officielle des Design Tokens Hadara

| Variable CSS | Valeur Hex / RGBA | Role & Application |
|---|---|---|
| `--hadara-bg` | `#070B18` | Fond sombre profond principal |
| `--hadara-surface` | `#111827` | Cartes, conteneurs & modals |
| `--hadara-surface-2` | `#172033` | En-têtes, tables & surfaces élevées |
| `--hadara-gold` | `#D0A21C` | Signature Or Hadara (Boutons, Titres) |
| `--hadara-gold-light` | `#E7BE35` | État hover lumineux des boutons Or |
| `--hadara-blue` | `#335A79` | Bleu Hadara Institutionnel |
| `--hadara-accent` | `#00C9A7` | Vert Émeraude Succès & Confirmations |
| `--hadara-text` | `#F4F1EA` | Texte principal haute lisibilité |
| `--hadara-muted` | `#A8B0BD` | Sous-titres & placeholders |
| `--hadara-border` | `rgba(208, 162, 28, 0.25)` | Bordures fines dorées des cartes |
| `--hadara-radius-md` | `12px` | Rayon de courbure des Boutons Signatures |

---

## 📝 2. Grammaire de Saisie Unifiée (Hadara Input Grammar)

- **Même Donnée ➔ Même Logique de Saisie** :
  - **Boutons Signatures** : Fond Or `--hadara-gold` (`#D0A21C`), bordures arrondies 12px, ombre dorée au survol.
  - **Hadara Chips & Tags** : Les champs JSON `[]` sont transformés en badges/chips interactifs (`✓ Tag ×` + `+ Ajouter`) sans jamais exposer de syntaxe JSON brute.
  - **Hadara Color Picker** : Sélecteur de couleur natif HTML5 `<input type="color">` synchronisé en temps réel avec la valeur Hex.
  - **Badges Statut** : Badges colorés explicites (`🟢 En stock`, `🟡 En attente`, `🔵 En création`, `🟢 Terminé`).
