from __future__ import annotations

from typing import Any

from hadara_ai.tools.context import ToolContext


def brief_get(arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
    """brief.get — Lecture d'un brief (AI-safe, sans PII)."""
    from api.models import Brief

    brief_id = arguments["brief_id"]
    try:
        brief = Brief.objects.get(id=brief_id)
    except Brief.DoesNotExist:
        raise ValueError(f"Brief introuvable: {brief_id}")

    return {
        "id": brief.id,
        "client_id": brief.client_id,
        "project_type": brief.project_type or "",
        "project_type_custom": brief.project_type_custom or "",
        "status": brief.status,
        "context_description": brief.context_description or "",
        "primary_objective": brief.primary_objective or "",
        "target_audience": brief.target_audience or "",
        "main_title": brief.main_title or "",
        "full_text_content": brief.full_text_content or "",
        "style_preferences": brief.style_preferences or [],
        "preferred_colors": brief.preferred_colors or "",
        "avoid_colors": brief.avoid_colors or "",
        "technical_format": brief.technical_format or "",
        "budget_range": brief.budget_range or "",
        "desired_delivery_date": brief.desired_delivery_date or "",
        "critical_deadline": brief.critical_deadline or "",
        "deliverable_versions": brief.deliverable_versions or [],
        "ai_analysis": brief.ai_analysis,
        "quoted_price_fcfa": brief.quoted_price_fcfa,
    }


def client_get(arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
    """client.get — Informations client nécessaires au contexte."""
    from api.models import Client

    client_id = arguments["client_id"]
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        raise ValueError(f"Client introuvable: {client_id}")

    return {
        "id": client.id,
        "name": client.name,
        "organization": client.organization or "",
        "whatsapp": client.whatsapp or "",
        "email": client.email or "",
        "address": client.address or "",
    }


def client_history(arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
    """client.history — Historique des projets et factures d'un client."""
    from api.models import Client, Brief, BillingDocument

    client_id = arguments["client_id"]
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        raise ValueError(f"Client introuvable: {client_id}")

    briefs = list(
        Brief.objects.filter(client=client)
        .order_by("-created_at")
        .values("id", "project_type", "status", "quoted_price_fcfa", "created_at")
    )

    billing_docs = list(
        BillingDocument.objects.filter(client=client)
        .order_by("-issue_date")
        .values(
            "document_number",
            "doc_type",
            "total",
            "payment_status",
            "issue_date",
        )
    )

    from api.models import Payment

    total_invoiced = sum(
        d["total"]
        for d in billing_docs
        if d["doc_type"] == "facture" and d["payment_status"] != "annule"
    )

    facture_ids = [
        d["document_number"]
        for d in billing_docs
        if d["doc_type"] == "facture" and d["payment_status"] != "annule"
    ]
    total_paid = sum(
        p.amount
        for p in Payment.objects.filter(billing_document__document_number__in=facture_ids)
    )

    return {
        "client_id": client.id,
        "client_name": client.name,
        "briefs": briefs,
        "billing_documents": billing_docs,
        "summary": {
            "total_briefs": len(briefs),
            "total_invoiced_fcfa": total_invoiced,
            "total_paid_fcfa": total_paid,
            "balance_due_fcfa": total_invoiced - total_paid,
        },
    }


def pricing_calculate(
    arguments: dict[str, Any], context: ToolContext
) -> dict[str, Any]:
    """pricing.calculate — Appel direct au HadaraPricingEngine."""
    from api.models import Brief
    from api.pricing_engine import HadaraPricingEngine

    brief_id = arguments["brief_id"]
    try:
        brief = Brief.objects.get(id=brief_id)
    except Brief.DoesNotExist:
        raise ValueError(f"Brief introuvable: {brief_id}")

    engine = HadaraPricingEngine()
    result = engine.calculate(brief)

    return {
        "brief_id": brief.id,
        "pricing": result,
    }


def brief_analyze(
    arguments: dict[str, Any], context: ToolContext
) -> dict[str, Any]:
    """brief.analyze — Utilise le Prompt Engine + AIService."""
    from api.models import Brief
    from hadara_ai.services.ai_service import analyze_brief_with_ai

    brief_id = arguments["brief_id"]
    try:
        brief = Brief.objects.get(id=brief_id)
    except Brief.DoesNotExist:
        raise ValueError(f"Brief introuvable: {brief_id}")

    # Récupérer le pricing existant ou le calculer
    pricing = brief.ai_analysis
    if not pricing:
        from api.pricing_engine import HadaraPricingEngine
        engine = HadaraPricingEngine()
        pricing = engine.calculate(brief)

    # Construire le contexte AI-safe (sans PII)
    brief_context = {
        "project_type": brief.project_type or "",
        "context_description": brief.context_description or "",
        "primary_objective": brief.primary_objective or "",
        "target_audience": brief.target_audience or "",
        "style_preferences": brief.style_preferences or [],
        "budget_range": brief.budget_range or "",
    }

    result = analyze_brief_with_ai(brief_context, pricing)

    return {
        "brief_id": brief.id,
        "ai_analysis": result,
    }
