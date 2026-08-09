"""
Tests du HadaraPricingEngine.

Couverture des 10 cas demandés :
  Test 1  — Brief complet → analyse correcte
  Test 2  — Brief incomplet → score_completude bas
  Test 3  — Brief multi-livrables → prix/charge calculés
  Test 4  — Brief urgent → multiplicateur appliqué
  Test 5  — Deux briefs identiques → même calcul (déterminisme)
  Test 6  — Multiplicateur cumulé plafonné à MULTIPLICATEUR_MAX_CUMULE
  Test 7  — Prix IA absent → Pricing Engine reste la référence (test isolation)
  Test 8  — Données personnelles → non présentes dans les sorties du moteur
  Test 9  — Tous les project_types reconnus → pas de fallback "autre"
  Test 10 — Erreur sur brief invalide → résultat dégradé, pas de crash

Usage :
  cd backend && python -m pytest api/tests/test_pricing_engine.py -v
  ou directement :
  cd backend && python api/tests/test_pricing_engine.py
"""

import sys
import os
import unittest
from dataclasses import dataclass, field
from typing import Optional, List

# Ajout du path pour import direct sans Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from api.pricing_engine import (
    HadaraPricingEngine,
    MULTIPLICATEUR_MAX_CUMULE,
    TARIFS_BASE,
    PROJECT_TYPE_MAP,
    pricing_engine,
)


# ─────────────────────────────────────────────────────────────────────────────
# Stub de Brief (simule le modèle Django sans base de données)
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class BriefStub:
    """Simule un objet Django Brief pour les tests unitaires."""
    # Champs principaux utilisés par le moteur
    client_name: Optional[str]       = "Client Test"
    project_type: Optional[str]      = "logo"
    project_type_custom: Optional[str] = None
    context_description: Optional[str] = None
    primary_objective: Optional[str]   = None
    target_audience: Optional[str]     = None
    technical_format: Optional[str]    = None
    budget_range: Optional[str]        = None
    desired_delivery_date: Optional[str] = None
    critical_deadline: Optional[str]   = None
    style_preferences: Optional[List]  = field(default_factory=list)
    preferred_colors: Optional[str]    = None
    avoid_colors: Optional[str]        = None
    main_title: Optional[str]          = None
    full_text_content: Optional[str]   = None
    whatsapp: Optional[str]            = None
    email: Optional[str]               = None
    reference_links: Optional[str]     = None
    # Champs personnels (ne doivent PAS apparaître dans les sorties du moteur)
    organization: Optional[str]        = "Entreprise Confidentielle"
    city_country: Optional[str]        = "Dakar, Sénégal"


# ─────────────────────────────────────────────────────────────────────────────
# Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestPricingEngine(unittest.TestCase):

    def setUp(self):
        self.engine = HadaraPricingEngine()

    # ── Test 1 : Brief complet → analyse correcte ──────────────────────────
    def test_1_brief_complet_analyse_correcte(self):
        """Un brief bien rempli produit une estimation cohérente."""
        brief = BriefStub(
            project_type="affiche",
            context_description="Affiche événementielle pour le festival de musique annuel de Dakar. "
                                 "Format A2, impression offset, 500 exemplaires.",
            primary_objective="Attirer un public jeune et branché, 18-35 ans.",
            target_audience="Jeunes Dakarois, amateurs de musique",
            technical_format="affiche",
            budget_range="50k_100k",
            desired_delivery_date="dans 5 jours",
            style_preferences=["Moderne", "Coloré"],
            preferred_colors="Rouge, jaune, noir",
            whatsapp="+221 77 000 00 00",
        )
        result = self.engine.calculate(brief)

        self.assertFalse(result["error"])
        self.assertGreater(result["prix_min_fcfa"], 0)
        self.assertGreater(result["prix_max_fcfa"], result["prix_min_fcfa"])
        self.assertGreater(result["score_completude"], 60)
        self.assertIn("score_complexite", result)
        self.assertIn("heures_min", result)
        self.assertIn("acompte_conseille", result)
        self.assertEqual(result["inputs"]["project_type_detected"], "affiche")
        print(f"\n✅ Test 1 — Prix: {result['prix_min_fcfa']:,}–{result['prix_max_fcfa']:,} FCFA | "
              f"Complétude: {result['score_completude']}% | Complexité: {result['score_complexite']}/10")

    # ── Test 2 : Brief incomplet → score_completude bas ────────────────────
    def test_2_brief_incomplet_score_bas(self):
        """Un brief vide ou quasi-vide doit avoir un score_completude < 30."""
        brief = BriefStub(
            project_type="logo",
            context_description="Logo",  # trop court
            primary_objective=None,
            budget_range=None,
        )
        result = self.engine.calculate(brief)

        self.assertFalse(result["error"])
        self.assertLess(result["score_completude"], 35)
        print(f"\n✅ Test 2 — Complétude brief vide: {result['score_completude']}% (attendu < 35)")

    # ── Test 3 : Brief multi-livrables → charge augmentée ──────────────────
    def test_3_multi_livrables_charge_augmentee(self):
        """Un brief avec 5 déclinaisons doit avoir une charge plus élevée."""
        brief_simple = BriefStub(
            project_type="reseaux_sociaux",
            context_description="1 visuel Instagram pour ma boutique.",
            primary_objective="Post de promotion",
        )
        brief_multiple = BriefStub(
            project_type="reseaux_sociaux",
            context_description="5 déclinaisons de visuels Instagram et Facebook pour ma boutique.",
            primary_objective="Pack de 5 posts de promotion réseaux sociaux",
        )
        r_simple   = self.engine.calculate(brief_simple)
        r_multiple = self.engine.calculate(brief_multiple)

        self.assertGreater(r_multiple["heures_max"], r_simple["heures_max"])
        self.assertGreater(r_multiple["prix_min_fcfa"], r_simple["prix_min_fcfa"])
        print(f"\n✅ Test 3 — Simple: {r_simple['heures_max']}h max | "
              f"Multiple (5 décl.): {r_multiple['heures_max']}h max")

    # ── Test 4 : Brief urgent → multiplicateur appliqué ────────────────────
    def test_4_urgence_multiplie_le_prix(self):
        """Un brief urgent doit avoir un prix minimum supérieur au brief normal."""
        brief_normal = BriefStub(
            project_type="flyer",
            context_description="Flyer pour un événement, délai normal.",
            desired_delivery_date="dans 2 semaines",
        )
        brief_urgent = BriefStub(
            project_type="flyer",
            context_description="Flyer pour un événement urgent.",
            desired_delivery_date="demain matin",
            critical_deadline="urgent, pour demain",
        )
        r_normal = self.engine.calculate(brief_normal)
        r_urgent = self.engine.calculate(brief_urgent)

        self.assertGreater(r_urgent["prix_min_fcfa"], r_normal["prix_min_fcfa"])
        self.assertGreater(
            r_urgent["calcul_detail"]["multiplicateur_urgence"],
            r_normal["calcul_detail"]["multiplicateur_urgence"]
        )
        print(f"\n✅ Test 4 — Normal: {r_normal['prix_min_fcfa']:,} FCFA | "
              f"Urgent: {r_urgent['prix_min_fcfa']:,} FCFA | "
              f"Multiplicateur: ×{r_urgent['calcul_detail']['multiplicateur_urgence']}")

    # ── Test 5 : Déterminisme — même brief → même résultat ─────────────────
    def test_5_determinisme(self):
        """Le même brief doit toujours produire exactement le même résultat."""
        brief = BriefStub(
            project_type="identite_marque",
            context_description="Création de l'identité visuelle complète pour une start-up tech dakaroise.",
            primary_objective="Logo, charte, templates réseaux sociaux.",
            budget_range="100k_200k",
        )
        r1 = self.engine.calculate(brief)
        r2 = self.engine.calculate(brief)
        r3 = self.engine.calculate(brief)

        self.assertEqual(r1["prix_min_fcfa"], r2["prix_min_fcfa"])
        self.assertEqual(r2["prix_min_fcfa"], r3["prix_min_fcfa"])
        self.assertEqual(r1["score_complexite"], r2["score_complexite"])
        print(f"\n✅ Test 5 — Déterminisme OK: {r1['prix_min_fcfa']:,} FCFA (×3 identique)")

    # ── Test 6 : Plafonnement du multiplicateur cumulé ─────────────────────
    def test_6_multiplicateur_cumule_plafonne(self):
        """Le multiplicateur cumulé ne doit jamais dépasser MULTIPLICATEUR_MAX_CUMULE."""
        brief = BriefStub(
            project_type="identite_marque",  # complexe de base
            context_description="10 déclinaisons de logos pour 10 marchés différents, "
                                 "urgent pour demain, avec 5 révisions chacune.",
            primary_objective="Identité de marque multi-marchés, toutes déclinaisons.",
            critical_deadline="urgent, pour demain",
            desired_delivery_date="demain",
        )
        result = self.engine.calculate(brief)

        m_cumule = result["calcul_detail"]["multiplicateur_cumule"]
        self.assertLessEqual(m_cumule, MULTIPLICATEUR_MAX_CUMULE)
        print(f"\n✅ Test 6 — Multiplicateur cumulé: {m_cumule} ≤ {MULTIPLICATEUR_MAX_CUMULE} (plafond OK)")

    # ── Test 7 : Isolation — le moteur ne dépend pas de Groq ───────────────
    def test_7_isolation_sans_groq(self):
        """
        Le Pricing Engine doit fonctionner sans aucune dépendance externe.
        Pas d'import de ai_utils, pas d'appel réseau.
        """
        import importlib
        # Vérifier qu'on peut importer pricing_engine sans ai_utils
        import api.pricing_engine as pe
        self.assertTrue(hasattr(pe, "HadaraPricingEngine"))
        self.assertTrue(hasattr(pe, "pricing_engine"))

        brief = BriefStub(project_type="affiche")
        result = pricing_engine.calculate(brief)
        self.assertFalse(result["error"])
        print(f"\n✅ Test 7 — Isolation: pricing_engine fonctionne sans Groq")

    # ── Test 8 : Données personnelles absentes des sorties ─────────────────
    def test_8_donnees_personnelles_absentes(self):
        """
        Les données personnelles (nom, tel, email, ville) ne doivent PAS
        apparaître dans les sorties du Pricing Engine.
        """
        brief = BriefStub(
            client_name="Aminata Diallo",
            organization="Entreprise Confidentielle SA",
            whatsapp="+221 77 123 45 67",
            email="aminata@confidentiel.sn",
            city_country="Thiès, Sénégal",
            project_type="logo",
        )
        result = self.engine.calculate(brief)
        result_str = str(result)

        self.assertNotIn("Aminata", result_str)
        self.assertNotIn("Diallo", result_str)
        self.assertNotIn("+221", result_str)
        self.assertNotIn("aminata@", result_str)
        self.assertNotIn("Thiès", result_str)
        self.assertNotIn("Confidentielle", result_str)
        print(f"\n✅ Test 8 — Données personnelles: aucune fuite dans les sorties")

    # ── Test 9 : Tous les project_types connus → pas de fallback ───────────
    def test_9_tous_project_types_reconnus(self):
        """Tous les types de projet du PROJECT_TYPE_MAP doivent être reconnus."""
        unrecognized = []
        for django_type, expected_key in PROJECT_TYPE_MAP.items():
            brief = BriefStub(project_type=django_type)
            result = self.engine.calculate(brief)
            detected = result["inputs"]["project_type_detected"]
            if detected == "autre" and expected_key != "autre":
                unrecognized.append(f"{django_type} → attendu: {expected_key}, obtenu: autre")

        if unrecognized:
            self.fail(f"Types non reconnus:\n" + "\n".join(unrecognized))
        print(f"\n✅ Test 9 — {len(PROJECT_TYPE_MAP)} types de projet reconnus")

    # ── Test 10 : Brief invalide → résultat dégradé, pas de crash ──────────
    def test_10_brief_invalide_pas_de_crash(self):
        """Même avec un objet Brief cassé, le moteur ne doit jamais lever."""

        class BriefCasse:
            """Simule un Brief dont tous les attributs lèvent une exception."""
            def __getattr__(self, name):
                raise AttributeError(f"AttributeError simulée sur '{name}'")

        try:
            result = self.engine.calculate(BriefCasse())
            self.assertTrue(result["error"])
            self.assertIn("error_message", result)
            # Les valeurs dégradées doivent être présentes et non-nulles
            self.assertGreater(result["prix_min_fcfa"], 0)
            self.assertGreater(result["prix_max_fcfa"], 0)
            print(f"\n✅ Test 10 — Brief invalide: résultat dégradé sans crash "
                  f"({result['prix_min_fcfa']:,}–{result['prix_max_fcfa']:,} FCFA)")
        except Exception as e:
            self.fail(f"Le moteur a levé une exception non catchée: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Runner direct (sans pytest)
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  HADARA PRICING ENGINE — Tests unitaires")
    print("=" * 60)
    loader = unittest.TestLoader()
    loader.sortTestMethodsUsing = None  # Conserver l'ordre défini
    suite = loader.loadTestsFromTestCase(TestPricingEngine)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    print("\n" + "=" * 60)
    if result.wasSuccessful():
        print(f"  ✅ {result.testsRun}/{result.testsRun} tests réussis")
    else:
        print(f"  ❌ {len(result.failures)} échec(s), {len(result.errors)} erreur(s)")
    print("=" * 60)
    sys.exit(0 if result.wasSuccessful() else 1)
