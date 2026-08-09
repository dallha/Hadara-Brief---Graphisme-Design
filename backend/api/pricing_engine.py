"""
HadaraPricingEngine — Moteur de calcul métier pur.

Philosophie :
- Ce module ne fait JAMAIS appel à l'IA.
- Il prend les données d'un Brief Django et produit une estimation chiffrée,
  traçable, basée sur des règles métier explicites.
- L'IA (Groq) recevra ensuite ces résultats pour les interpréter, jamais pour
  les modifier ou les remplacer.

Architecture conçue pour P1 :
  Les constantes TARIFS_BASE, MULTIPLICATEURS etc. peuvent être déplacées vers
  un modèle Django (PricingRule) sans modifier la logique des méthodes.
"""

import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# TARIFS DE BASE
# Clé = project_type Django (champ Brief.project_type)
# min/max en FCFA, heures = (min_h, max_h)
# ─────────────────────────────────────────────────────────────────────────────
TARIFS_BASE = {
    # Identité de marque
    "logo":                  {"min": 35_000,  "max": 90_000,   "h": (3,  10), "complexite_base": 5},
    "identite_marque":       {"min": 90_000,  "max": 250_000,  "h": (15, 35), "complexite_base": 8},
    "charte_graphique":      {"min": 60_000,  "max": 150_000,  "h": (10, 25), "complexite_base": 7},

    # Supports publicitaires
    "affiche":               {"min": 18_000,  "max": 55_000,   "h": (2,  6),  "complexite_base": 4},
    "bache":                 {"min": 15_000,  "max": 45_000,   "h": (2,  5),  "complexite_base": 3},
    "flyer":                 {"min": 10_000,  "max": 28_000,   "h": (1,  4),  "complexite_base": 3},
    "brochure":              {"min": 30_000,  "max": 90_000,   "h": (5,  14), "complexite_base": 6},
    "catalogue":             {"min": 60_000,  "max": 200_000,  "h": (10, 30), "complexite_base": 7},

    # Réseaux sociaux & digital
    "reseaux_sociaux":       {"min": 20_000,  "max": 70_000,   "h": (3,  9),  "complexite_base": 4},
    "pack_reseaux_sociaux":  {"min": 50_000,  "max": 150_000,  "h": (8,  20), "complexite_base": 6},
    "banniere_web":          {"min": 15_000,  "max": 40_000,   "h": (2,  5),  "complexite_base": 3},

    # Documents professionnels
    "carte_visite":          {"min": 15_000,  "max": 38_000,   "h": (1,  4),  "complexite_base": 3},
    "rapport":               {"min": 50_000,  "max": 160_000,  "h": (8,  22), "complexite_base": 6},
    "presentation":          {"min": 40_000,  "max": 120_000,  "h": (6,  18), "complexite_base": 6},
    "menu":                  {"min": 20_000,  "max": 60_000,   "h": (3,  8),  "complexite_base": 4},

    # Numérique avancé
    "site_web_ui":           {"min": 150_000, "max": 500_000,  "h": (20, 70), "complexite_base": 9},
    "mockup_ui":             {"min": 60_000,  "max": 180_000,  "h": (8,  25), "complexite_base": 7},

    # Autre / non défini
    "autre":                 {"min": 20_000,  "max": 80_000,   "h": (3,  12), "complexite_base": 5},
}

# Tarif par défaut si le type n'est pas reconnu
_TARIF_DEFAULT = {"min": 25_000, "max": 75_000, "h": (4, 12), "complexite_base": 5}

# Délai de base en jours ouvrables par catégorie (jours min, jours max)
DELAIS_BASE = {
    "logo":                  (3,  7),
    "identite_marque":       (7, 15),
    "charte_graphique":      (5, 12),
    "affiche":               (2,  5),
    "bache":                 (2,  4),
    "flyer":                 (1,  4),
    "brochure":              (4, 10),
    "catalogue":             (7, 20),
    "reseaux_sociaux":       (2,  6),
    "pack_reseaux_sociaux":  (5, 12),
    "banniere_web":          (1,  4),
    "carte_visite":          (1,  4),
    "rapport":               (5, 15),
    "presentation":          (4, 12),
    "menu":                  (2,  6),
    "site_web_ui":           (14, 45),
    "mockup_ui":             (5,  18),
    "autre":                 (3,  10),
}

# ─────────────────────────────────────────────────────────────────────────────
# MULTIPLICATEURS
# ─────────────────────────────────────────────────────────────────────────────

# Urgence : basée sur le délai critique mentionné dans le brief
MULTIPLICATEURS_URGENCE = {
    "tres_urgent":  1.5,   # < 48h
    "urgent":       1.3,   # < 5 jours
    "rapide":       1.15,  # < 10 jours
    "normal":       1.0,
}

# Révisions (nombre de cycles de correction)
MULTIPLICATEURS_REVISIONS = {
    1:    0.9,
    2:    1.0,   # standard
    3:    1.15,
    4:    1.30,
    "5+": 1.50,
}

# Déclinaisons / variantes du même livrable
MULTIPLICATEURS_DECLINAISONS = {
    1:    1.0,
    2:    1.25,
    3:    1.5,
    4:    1.75,
    "5+": 2.0,
}

# Budget client déclaré (influence légère sur le positionnement)
AJUSTEMENT_BUDGET_CLIENT = {
    "moins_de_50k":   -0.05,
    "50k_100k":        0.0,
    "100k_200k":       0.05,
    "plus_de_200k":    0.10,
    "flexible":        0.10,
    "non_defini":      0.0,
}

# Plafond de multiplicateur cumulé (évite les prix absurdes)
MULTIPLICATEUR_MAX_CUMULE = 2.5

# Marge de sécurité (la fourchette haute = min * (1 + MARGE))
MARGE_FOURCHETTE = 0.6


# ─────────────────────────────────────────────────────────────────────────────
# MAPPING des valeurs Django → clés internes
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_TYPE_MAP = {
    # Valeurs possibles dans Brief.project_type
    "logo":              "logo",
    "identite":          "identite_marque",
    "identite_marque":   "identite_marque",
    "charte":            "charte_graphique",
    "charte_graphique":  "charte_graphique",
    "affiche":           "affiche",
    "bache":             "bache",
    "flyer":             "flyer",
    "brochure":          "brochure",
    "catalogue":         "catalogue",
    "reseaux":           "reseaux_sociaux",
    "reseaux_sociaux":   "reseaux_sociaux",
    "pack_reseaux":      "pack_reseaux_sociaux",
    "banniere":          "banniere_web",
    "carte_visite":      "carte_visite",
    "carte":             "carte_visite",
    "rapport":           "rapport",
    "presentation":      "presentation",
    "menu":              "menu",
    "site_web":          "site_web_ui",
    "site":              "site_web_ui",
    "ui":                "mockup_ui",
    "mockup":            "mockup_ui",
    "autre":             "autre",
}

BUDGET_MAP = {
    "moins_10k":    "moins_de_50k",
    "10k_25k":      "moins_de_50k",
    "25k_50k":      "moins_de_50k",
    "50k_100k":     "50k_100k",
    "100k_200k":    "100k_200k",
    "200k_500k":    "plus_de_200k",
    "500k_plus":    "plus_de_200k",
    "flexible":     "flexible",
}


# ─────────────────────────────────────────────────────────────────────────────
# MOTEUR PRINCIPAL
# ─────────────────────────────────────────────────────────────────────────────

class HadaraPricingEngine:
    """
    Calcul déterministe de l'estimation de prix, charge et délai pour un brief.

    Usage:
        engine = HadaraPricingEngine()
        result = engine.calculate(brief)

    Le résultat est un dict JSON-serializable stockable dans Brief.ai_analysis.
    """

    VERSION = "pricing-v1.0"

    def calculate(self, brief) -> dict:
        """
        Point d'entrée unique. Retourne un dict complet et traçable.
        Ne lève jamais d'exception : en cas d'erreur, retourne un résultat
        dégradé avec error_flag=True.
        """
        try:
            project_key   = self._get_project_type(brief)
            base           = self._get_base_tarif(project_key)
            urgence_key    = self._detect_urgency(brief)
            revisions      = self._detect_revisions(brief)
            declinaisons   = self._detect_declinaisons(brief)
            budget_key     = self._get_budget_key(brief)

            m_urgence      = MULTIPLICATEURS_URGENCE[urgence_key]
            m_revisions    = MULTIPLICATEURS_REVISIONS.get(revisions,
                              MULTIPLICATEURS_REVISIONS["5+"])
            m_declinaisons = MULTIPLICATEURS_DECLINAISONS.get(declinaisons,
                              MULTIPLICATEURS_DECLINAISONS["5+"])
            adj_budget     = AJUSTEMENT_BUDGET_CLIENT.get(budget_key, 0.0)

            # Multiplicateur cumulé PLAFONNÉ
            m_cumule = m_urgence * m_revisions * m_declinaisons
            m_cumule = min(m_cumule, MULTIPLICATEUR_MAX_CUMULE)

            # Prix brut
            raw_min = base["min"] * m_cumule * (1 + adj_budget)
            raw_max = base["max"] * m_cumule * (1 + adj_budget)

            # Arrondi au millier le plus proche
            final_min = self._round_to_thousands(raw_min)
            final_max = self._round_to_thousands(raw_max)

            # Acompte conseillé (50% du minimum)
            acompte = self._round_to_thousands(final_min * 0.5)

            # Heures
            h_min = base["h"][0]
            h_max = base["h"][1]
            # Ajuster les heures selon urgence et déclinaisons
            if declinaisons in (2, 3):
                h_max = int(h_max * 1.3)
            elif isinstance(declinaisons, str):  # "5+"
                h_max = int(h_max * 1.8)

            # Délai
            delai_min, delai_max = self._calculate_deadline(
                project_key, urgence_key, declinaisons
            )

            # Complexité
            score_complexite = self._calculate_complexity(
                base["complexite_base"], m_urgence, declinaisons, revisions
            )

            # Score de complétude du brief (données disponibles)
            score_completude = self._score_completude(brief)

            return {
                "engine_version":   self.VERSION,
                "calculated_at":    datetime.now().isoformat(),
                "error":            False,

                # Données d'entrée utilisées
                "inputs": {
                    "project_type_detected": project_key,
                    "urgence_detectee":      urgence_key,
                    "revisions_estimees":    revisions,
                    "declinaisons_estimees": declinaisons,
                    "budget_client":         budget_key,
                },

                # Détail du calcul (traçabilité)
                "calcul_detail": {
                    "base_min_fcfa":          base["min"],
                    "base_max_fcfa":          base["max"],
                    "multiplicateur_urgence": m_urgence,
                    "multiplicateur_revisions": m_revisions,
                    "multiplicateur_declinaisons": m_declinaisons,
                    "multiplicateur_cumule":  round(m_cumule, 3),
                    "ajustement_budget":      adj_budget,
                    "prix_brut_min":          int(raw_min),
                    "prix_brut_max":          int(raw_max),
                },

                # Résultats finaux
                "prix_min_fcfa":       final_min,
                "prix_max_fcfa":       final_max,
                "acompte_conseille":   acompte,
                "heures_min":          h_min,
                "heures_max":          h_max,
                "delai_min_jours":     delai_min,
                "delai_max_jours":     delai_max,
                "score_complexite":    score_complexite,   # /10
                "score_completude":    score_completude,   # /100
            }

        except Exception as exc:
            logger.exception(f"HadaraPricingEngine.calculate() erreur: {exc}")
            return {
                "engine_version": self.VERSION,
                "calculated_at":  datetime.now().isoformat(),
                "error":          True,
                "error_message":  str(exc),
                # Résultats dégradés mais non null
                "prix_min_fcfa":     20_000,
                "prix_max_fcfa":     80_000,
                "acompte_conseille": 10_000,
                "heures_min":        3,
                "heures_max":        10,
                "delai_min_jours":   2,
                "delai_max_jours":   7,
                "score_complexite":  5,
                "score_completude":  0,
            }

    # ── Méthodes privées ─────────────────────────────────────────────────────

    def _get_project_type(self, brief) -> str:
        """Mappe le project_type Django vers une clé interne."""
        raw = (brief.project_type or "").lower().strip()
        custom = (brief.project_type_custom or "").lower()

        # Chercher d'abord dans le champ principal
        if raw in PROJECT_TYPE_MAP:
            return PROJECT_TYPE_MAP[raw]

        # Chercher dans le custom (heuristique sur les mots-clés)
        keywords = {
            "logo": "logo",
            "identit": "identite_marque",
            "charte": "charte_graphique",
            "affiche": "affiche",
            "bâche": "bache",
            "bache": "bache",
            "flyer": "flyer",
            "brochure": "brochure",
            "catalogue": "catalogue",
            "réseau": "reseaux_sociaux",
            "reseau": "reseaux_sociaux",
            "instagram": "reseaux_sociaux",
            "facebook": "reseaux_sociaux",
            "bannière": "banniere_web",
            "banniere": "banniere_web",
            "carte visite": "carte_visite",
            "rapport": "rapport",
            "présentation": "presentation",
            "presentation": "presentation",
            "menu": "menu",
            "site": "site_web_ui",
            "web": "site_web_ui",
            "mockup": "mockup_ui",
        }
        for kw, key in keywords.items():
            if kw in custom:
                return key

        return "autre"

    def _get_base_tarif(self, project_key: str) -> dict:
        """Retourne le tarif de base pour une clé de projet."""
        return TARIFS_BASE.get(project_key, _TARIF_DEFAULT)

    def _detect_urgency(self, brief) -> str:
        """Détermine le niveau d'urgence selon les champs de délai."""
        critical = (brief.critical_deadline or "").lower()
        desired  = (brief.desired_delivery_date or "").lower()

        # Mots-clés d'urgence forte
        tres_urgent_kw = ["aujourd'hui", "demain", "urgent", "immédiat",
                          "48h", "24h", "asap", "de suite"]
        urgent_kw      = ["cette semaine", "3 jours", "4 jours", "5 jours",
                          "5 jours", "rapidement", "vite"]
        rapide_kw      = ["10 jours", "semaine prochaine", "2 semaines",
                          "bientôt", "dès que possible"]

        for text in [critical, desired]:
            for kw in tres_urgent_kw:
                if kw in text:
                    return "tres_urgent"
            for kw in urgent_kw:
                if kw in text:
                    return "urgent"
            for kw in rapide_kw:
                if kw in text:
                    return "rapide"

        # Si critical_deadline est renseigné mais non reconnu, on met "rapide"
        if critical and critical not in ["", "aucun", "non", "pas de délai"]:
            return "rapide"

        return "normal"

    def _detect_revisions(self, brief) -> int:
        """Estime le nombre de révisions selon la complexité du brief."""
        # Le champ n'existe pas encore → on déduit de la complexité
        # Logique : plus le brief est détaillé, plus les révisions seront claires
        description = brief.context_description or ""
        objective   = brief.primary_objective or ""
        style       = brief.style_preferences or []

        # Un brief court et vague → plus de révisions probables
        total_chars = len(description) + len(objective)
        if total_chars < 100:
            return 3
        if total_chars < 300:
            return 2
        return 2  # Standard par défaut

    def _detect_declinaisons(self, brief) -> int:
        """
        Détecte le nombre de déclinaisons dans la description du brief.
        Cherche des patterns comme "3 déclinaisons", "x stories", etc.
        """
        import re
        description = (brief.context_description or "") + " " + \
                      (brief.primary_objective or "") + " " + \
                      (brief.full_text_content or "")

        # Pattern : chiffre + mot-clé
        patterns = [
            r"(\d+)\s*déclinaison",
            r"(\d+)\s*version",
            r"(\d+)\s*format",
            r"(\d+)\s*affiche",
            r"(\d+)\s*template",
            r"(\d+)\s*story",
            r"(\d+)\s*post",
            r"(\d+)\s*visuel",
        ]
        max_found = 1
        for pattern in patterns:
            matches = re.findall(pattern, description.lower())
            for m in matches:
                val = int(m)
                if val > max_found:
                    max_found = val

        if max_found >= 5:
            return "5+"
        return max_found

    def _get_budget_key(self, brief) -> str:
        """Mappe le budget_range Django vers une clé interne."""
        raw = (brief.budget_range or "non_defini").lower().strip()
        return BUDGET_MAP.get(raw, "non_defini")

    def _calculate_deadline(
        self, project_key: str, urgence_key: str, declinaisons
    ) -> tuple:
        """Calcule le délai en jours ouvrables."""
        base_delais = DELAIS_BASE.get(project_key, (3, 10))
        d_min, d_max = base_delais

        # Réduction si urgent, augmentation si déclinaisons
        if urgence_key == "tres_urgent":
            d_min = max(1, int(d_min * 0.5))
            d_max = max(2, int(d_max * 0.6))
        elif urgence_key == "urgent":
            d_min = max(1, int(d_min * 0.7))
            d_max = max(2, int(d_max * 0.75))

        # Plus de déclinaisons → plus de temps
        if declinaisons == "5+" or (isinstance(declinaisons, int) and declinaisons >= 4):
            d_max = int(d_max * 1.5)
        elif isinstance(declinaisons, int) and declinaisons >= 2:
            d_max = int(d_max * 1.2)

        return d_min, d_max

    def _calculate_complexity(
        self, base_complexite: int, m_urgence: float,
        declinaisons, revisions: int
    ) -> int:
        """
        Calcule un score de complexité de 1 à 10.
        Basé sur la complexité intrinsèque du type de projet, ajustée par
        l'urgence, les déclinaisons et les révisions.
        """
        score = float(base_complexite)

        # L'urgence augmente la complexité perçue
        if m_urgence >= 1.5:
            score += 1.5
        elif m_urgence >= 1.3:
            score += 0.8

        # Déclinaisons multiples = plus complexe
        if declinaisons == "5+" or (isinstance(declinaisons, int) and declinaisons >= 4):
            score += 1.5
        elif isinstance(declinaisons, int) and declinaisons >= 2:
            score += 0.5

        # Révisions > 2 = brief probablement flou
        if revisions >= 3:
            score += 0.5

        return min(10, max(1, round(score)))

    def _score_completude(self, brief) -> int:
        """
        Calcule un score de complétude du brief de 0 à 100.
        Vérifie la présence et la qualité des champs importants.
        """
        checks = {
            # Champ                               Poids
            "client_name":          (bool(brief.client_name),          8),
            "project_type":         (bool(brief.project_type or
                                         brief.project_type_custom),   12),
            "context_description":  (len(brief.context_description or "") > 50, 12),
            "primary_objective":    (len(brief.primary_objective or "") > 20,  10),
            "target_audience":      (bool(brief.target_audience),       8),
            "technical_format":     (bool(brief.technical_format),      10),
            "budget_range":         (bool(brief.budget_range) and
                                     brief.budget_range != "non_defini", 10),
            "desired_delivery_date":(bool(brief.desired_delivery_date), 8),
            "style_preferences":    (bool(brief.style_preferences),     6),
            "preferred_colors":     (bool(brief.preferred_colors),      4),
            "main_title":           (bool(brief.main_title),            4),
            "whatsapp_or_email":    (bool(brief.whatsapp or brief.email),6),
            "reference_links":      (bool(brief.reference_links),       2),
        }

        total_score = 0
        total_weight = sum(w for _, (_, w) in checks.items())

        for field, (ok, weight) in checks.items():
            if ok:
                total_score += weight

        return round((total_score / total_weight) * 100)

    @staticmethod
    def _round_to_thousands(value: float) -> int:
        """
        Arrondit au palier le plus proche selon la magnitude du prix.
        - < 30 000 FCFA  → palier de 1 000 (prix lisibles sur petits projets)
        - < 100 000 FCFA → palier de 5 000
        - >= 100 000 FCFA → palier de 10 000
        """
        if value < 30_000:
            return int(round(value / 1_000) * 1_000)
        elif value < 100_000:
            return int(round(value / 5_000) * 5_000)
        else:
            return int(round(value / 10_000) * 10_000)


# ─────────────────────────────────────────────────────────────────────────────
# INSTANCE SINGLETON (importable directement)
# ─────────────────────────────────────────────────────────────────────────────
pricing_engine = HadaraPricingEngine()
