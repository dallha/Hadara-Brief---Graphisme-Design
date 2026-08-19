"""Creative Output Quality Gate — Valide les sorties du Creative Assistant.

Vérifie que la direction artistique respecte l'ADN Hadara avant de la
présenter au graphiste. Score global + détails par critère.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from hadara_ai.brand.dna import HADARA_DNA


@dataclass
class QualityCheck:
    name: str
    passed: bool
    score: float  # 0.0 — 1.0
    detail: str


@dataclass
class QualityGateResult:
    overall_score: float  # 0.0 — 1.0
    passed: bool  # score >= 0.6
    checks: list[QualityCheck] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "overall_score": round(self.overall_score, 2),
            "passed": self.passed,
            "checks": [
                {"name": c.name, "passed": c.passed, "score": round(c.score, 2), "detail": c.detail}
                for c in self.checks
            ],
        }


HADARA_HEX = {c["hex"].upper() for c in HADARA_DNA["palette_principale"]}
FORBIDDEN_KEYWORDS = [
    "clip art", "clipart", "stock photo", "image stock",
    "gold overload", "doré massif", "excessive gold",
    "islamic pattern", "mosque", "arabesque",
    "western template", "template luxe",
]
RECOMMENDED_HEX = HADARA_HEX | {c["hex"].upper() for c in HADARA_DNA["palette_secondaire"]}


def validate_creative_output(result: dict[str, Any]) -> QualityGateResult:
    """Évalue une sortie du Creative Assistant contre le Hadara DNA."""
    checks: list[QualityCheck] = []

    checks.append(_check_required_fields(result))
    checks.append(_check_palette_has_hadara_colors(result))
    checks.append(_check_no_forbidden_patterns(result))
    checks.append(_check_palette_size(result))
    checks.append(_check_typography_diversity(result))
    checks.append(_check_concepts_count(result))
    checks.append(_check_production_advice(result))
    checks.append(_check_livrables(result))

    scores = [c.score for c in checks]
    overall = sum(scores) / len(scores) if scores else 0.0

    return QualityGateResult(
        overall_score=overall,
        passed=overall >= 0.6,
        checks=checks,
    )


def _check_required_fields(result: dict[str, Any]) -> QualityCheck:
    required = ["direction_artistique", "concepts_visuels", "conseils_production", "livrables_recommandes"]
    present = [f for f in required if f in result]
    score = len(present) / len(required)
    missing = [f for f in required if f not in present]
    detail = "Tous les champs requis sont présents" if not missing else f"Manquants: {', '.join(missing)}"
    return QualityCheck(name="Champs requis", passed=score >= 0.75, score=score, detail=detail)


def _check_palette_has_hadara_colors(result: dict[str, Any]) -> QualityCheck:
    d = result.get("direction_artistique", {})
    palette = d.get("palette", [])
    if not palette:
        return QualityCheck(name="Palette Hadara", passed=False, score=0.0, detail="Aucune couleur proposée")

    hexes = {c.get("hex", "").upper() for c in palette if c.get("hex")}
    has_hadara = bool(hexes & HADARA_HEX)
    has_recommended = bool(hexes & RECOMMENDED_HEX)

    if has_hadara:
        return QualityCheck(name="Palette Hadara", passed=True, score=1.0, detail=f"Couleurs Hadara utilisées: {hexes & HADARA_HEX}")
    elif has_recommended:
        return QualityCheck(name="Palette Hadara", passed=True, score=0.7, detail=f"Couleurs secondaires Hadara: {hexes & RECOMMENDED_HEX}")
    else:
        return QualityCheck(name="Palette Hadara", passed=False, score=0.3, detail=f"Aucune couleur Hadara dans: {hexes}")


def _check_no_forbidden_patterns(result: dict[str, Any]) -> QualityCheck:
    text = str(result).lower()
    found = [kw for kw in FORBIDDEN_KEYWORDS if kw in text]
    if not found:
        return QualityCheck(name="Patterns interdits", passed=True, score=1.0, detail="Aucun pattern interdit détecté")
    return QualityCheck(name="Patterns interdits", passed=False, score=0.2, detail=f"Interdits détectés: {', '.join(found)}")


def _check_palette_size(result: dict[str, Any]) -> QualityCheck:
    d = result.get("direction_artistique", {})
    palette = d.get("palette", [])
    count = len(palette)
    if 3 <= count <= 6:
        return QualityCheck(name="Taille palette", passed=True, score=1.0, detail=f"{count} couleurs (optimal: 3-6)")
    elif count < 3:
        return QualityCheck(name="Taille palette", passed=False, score=0.4, detail=f"Palette trop petite ({count} couleur(s))")
    else:
        return QualityCheck(name="Taille palette", passed=True, score=0.7, detail=f"Palette riche ({count} couleurs)")


def _check_typography_diversity(result: dict[str, Any]) -> QualityCheck:
    d = result.get("direction_artistique", {})
    typographies = d.get("typographies", [])
    count = len(typographies)
    if count >= 2:
        return QualityCheck(name="Typographie", passed=True, score=1.0, detail=f"{count} polices sélectionnées")
    elif count == 1:
        return QualityCheck(name="Typographie", passed=True, score=0.6, detail="1 seule police — enrichir la hiérarchie")
    else:
        return QualityCheck(name="Typographie", passed=False, score=0.0, detail="Aucune typographie proposée")


def _check_concepts_count(result: dict[str, Any]) -> QualityCheck:
    concepts = result.get("concepts_visuels", [])
    count = len(concepts)
    if count >= 2:
        return QualityCheck(name="Concepts visuels", passed=True, score=1.0, detail=f"{count} concepts proposés")
    elif count == 1:
        return QualityCheck(name="Concepts visuels", passed=True, score=0.6, detail="1 seul concept — idéal: 2-3 options")
    else:
        return QualityCheck(name="Concepts visuels", passed=False, score=0.0, detail="Aucun concept proposé")


def _check_production_advice(result: dict[str, Any]) -> QualityCheck:
    advice = result.get("conseils_production", {})
    has_software = bool(advice.get("logiciels_recommandes"))
    has_formats = bool(advice.get("formats_livraison"))
    score = (1.0 if has_software else 0.0) * 0.5 + (1.0 if has_formats else 0.0) * 0.5
    parts = []
    if has_software:
        parts.append("logiciels OK")
    if has_formats:
        parts.append("formats OK")
    detail = " · ".join(parts) if parts else "Aucun conseil de production"
    return QualityCheck(name="Conseils production", passed=score >= 0.5, score=score, detail=detail)


def _check_livrables(result: dict[str, Any]) -> QualityCheck:
    livrables = result.get("livrables_recommandes", [])
    count = len(livrables)
    if count >= 2:
        return QualityCheck(name="Livrables", passed=True, score=1.0, detail=f"{count} livrables recommandés")
    elif count == 1:
        return QualityCheck(name="Livrables", passed=True, score=0.6, detail="1 seul livrable recommandé")
    else:
        return QualityCheck(name="Livrables", passed=False, score=0.0, detail="Aucun livrable recommandé")
