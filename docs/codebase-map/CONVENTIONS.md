# Conventions de la Cartographie Hadara Suite

## Marqueurs d'État

Chaque terme du glossaire porte un marqueur indiquant son état de vérification :

| Marqueur | Signification | Critère |
|----------|---------------|---------|
| 🟢 **CONFIRMED** | Vérifié dans le code — existe et fonctionne | Trouvé dans le code source, tests passent, utilisé en prod |
| 🟡 **PARTIAL** | Implémentation partielle | Existe mais incomplet, stub, ou seulement côté backend/frontend |
| 🟠 **LEGACY** | Ancien système — maintenu pour compatibilité | Remplacé par nouvelle implémentation mais encore référencé |
| 🔴 **BROKEN** | Cassé / erreur confirmée | Endpoint 404, import failed, fallback systématique, logs d'erreur |
| ⚪ **UNKNOWN** | Impossible à confirmer | Code mort, commenté, ou non accessible en lecture seule |
| 🔵 **EXTERNAL** | Dépendance externe | Service tiers, API externe, lib non contrôlée |

## Règles de Nommage

1. **Nom technique réel** = tel qu'écrit dans le code (casse, underscore, etc.)
2. **Nom canonique documentaire** = version normalisée pour la doc (PascalCase pour classes, kebab-case pour endpoints, etc.)
3. **Alias/Legacy** = autres noms rencontrés pour la même chose

## Structure d'Entrée

```markdown
### TermeCanonique
- **Code réel** : `nom_technique_reel`
- **Type** : Model | View | Serializer | Agent | Tool | Provider | Component | Hook | Enum | Endpoint | Service
- **Emplacement** : `chemin/vers/fichier.py:ligne`
- **Usage** : Métier | IA | Auth | Facturation | Frontend | Admin
- **Canonique** : `TermeCanonique`
- **Alias/Legacy** : `autre_nom`, `ancien_nom`
- **État** : 🟢/🟡/🟠/🔴/⚪/🔵
- **Dépendances** : `AutreTerme1`, `AutreTerme2`
- **Appelé par** : `Caller1`, `Caller2`
```

## Conventions de Cross-Référence

- Utiliser le **nom canonique** dans tous les liens internes
- Préfixer par la catégorie : `Model:Brief`, `Endpoint:/api/briefs/`, `Agent:BriefAnalyst`, `Component:KanbanTab`
- Pour les enums : `Enum:BriefStatus:nouveau`

## Ordre de Tri

1. Par catégorie (Models → Views → Serializers → Agents → Tools → Providers → Components → Enums → Endpoints)
2. Puis alphabétique dans chaque catégorie