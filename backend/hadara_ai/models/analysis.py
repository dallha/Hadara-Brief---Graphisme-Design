from __future__ import annotations

import uuid

from django.db import models


class BriefAIAnalysis(models.Model):
    """Historique des analyses IA d'un brief.

    Chaque exécution du Brief Analyst crée un enregistrement.
    Permet l'audit, la comparaison de modèles et l'historisation.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Références
    brief_id = models.CharField(max_length=20, db_index=True)
    tenant_id = models.CharField(max_length=50, default="default", db_index=True)

    # Métadonnées agent
    agent = models.CharField(max_length=50, default="brief_analyst")
    model = models.CharField(max_length=100, default="llama-3.1-8b-instant")
    prompt_version = models.CharField(max_length=50, default="v1")

    # Résultat de l'analyse
    score_completude = models.IntegerField(default=0)
    complexite_percue = models.IntegerField(default=0)
    decision_recommandee = models.CharField(max_length=50, default="ACCEPTER SOUS RÉSERVE")
    statut_brief = models.CharField(max_length=50, default="exploitable_sous_reserve")
    niveau_priorite = models.CharField(max_length=20, default="Normal")

    # Détails
    raison_decision = models.TextField(blank=True, default="")
    informations_manquantes = models.JSONField(default=list)
    questions_client = models.JSONField(default=list)
    risques = models.JSONField(default=list)

    # Pricing (snapshot du Pricing Engine au moment de l'analyse)
    pricing_prix_min = models.IntegerField(default=0)
    pricing_prix_max = models.IntegerField(default=0)
    pricing_heures_min = models.IntegerField(default=0)
    pricing_heures_max = models.IntegerField(default=0)

    # Contexte client (snapshot)
    client_fidelite = models.CharField(max_length=20, default="nouveau")
    client_nb_projets = models.IntegerField(default=0)
    client_solde_du = models.IntegerField(default=0)

    # Coût IA
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    duration_ms = models.IntegerField(default=0)

    # Réponse complète (pour audit)
    full_response = models.JSONField(default=dict)

    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Analyse IA de brief"
        verbose_name_plural = "Analyses IA de briefs"
        indexes = [
            models.Index(fields=["brief_id", "-created_at"]),
            models.Index(fields=["tenant_id", "-created_at"]),
            models.Index(fields=["agent", "-created_at"]),
        ]

    def __str__(self):
        return (
            f"Analysis {self.brief_id} — {self.decision_recommandee} "
            f"({self.score_completude}%) — {self.created_at:%Y-%m-%d %H:%M}"
        )
