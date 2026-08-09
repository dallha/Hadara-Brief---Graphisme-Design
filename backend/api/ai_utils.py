import json
import os
import requests
import logging

logger = logging.getLogger(__name__)

# Clé API Groq (llama-3.1-8b-instant est gratuit)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "gsk_placeholder_key_remplacez_moi")

def analyze_brief_with_ai(brief, pricing_result: dict) -> dict:
    """
    Analyse un brief en utilisant une API LLM gratuite (Groq - Llama 3)
    
    Règles P0.2 :
    1. Ne calcule jamais de prix (utilise pricing_result).
    2. Ne transmet aucune donnée personnelle à l'IA (AI-Safe).
    3. Exige un format JSON strict.
    4. Ne plante jamais en cas de panne de l'IA (Fallback propre).
    5. Conserve les données du Pricing Engine séparément.
    """
    
    # 1. Structure de base (le socle de P1)
    final_result = {
        "engine_version": pricing_result.get("engine_version", "pricing-v1.0"),
        "pricing": {
            "prix_min": pricing_result.get("prix_min_fcfa", 0),
            "prix_max": pricing_result.get("prix_max_fcfa", 0),
            "heures_min": pricing_result.get("heures_min", 0),
            "heures_max": pricing_result.get("heures_max", 0),
            "delai_min_jours": pricing_result.get("delai_min_jours", 0),
            "delai_max_jours": pricing_result.get("delai_max_jours", 0),
            "complexite": pricing_result.get("score_complexite", 0),
            "acompte_conseille": pricing_result.get("acompte_conseille", 0)
        },
        "ai": None
    }
    
    # 2. Construction de l'objet AI-Safe
    # On exclut volontairement: client_name, organization, whatsapp, email, city_country
    ai_safe_brief = {
        "type_projet": brief.project_type or brief.project_type_custom or "Non défini",
        "contexte_description": brief.context_description or "Non défini",
        "objectif_principal": brief.primary_objective or "Non défini",
        "cible": brief.target_audience or "Non défini",
        "format_technique": brief.technical_format or "Non défini",
        "budget_client": brief.budget_range or "Non défini",
        "delai_souhaite": brief.desired_delivery_date or "Non défini",
        "delai_critique": brief.critical_deadline or "Non défini",
        "styles_souhaites": brief.style_preferences or [],
        "titre_principal": brief.main_title or "Non défini"
    }
    
    # 3. Fallback immédiat si clé API manquante
    if not GROQ_API_KEY or GROQ_API_KEY == "gsk_placeholder_key_remplacez_moi":
        final_result["ai"] = _get_fallback_ai(pricing_result, "Clé API Groq manquante")
        return final_result

    # 4. Construction des Prompts
    system_prompt = (
        "Tu es l'assistant IA 'Hadara AI', expert en gestion de projets graphiques.\n"
        "RÈGLE ABSOLUE N°1 : Le Pricing Engine a DÉJÀ calculé les prix, heures, et délais. "
        "Tu ne dois JAMAIS inventer, modifier, ou suggérer de tarifs, d'heures ou de délais. "
        "Le Pricing Engine est la SEULE source de vérité pour les finances.\n\n"
        "RÈGLE ABSOLUE N°2 : Tu dois répondre UNIQUEMENT avec un objet JSON strict et valide. "
        "Aucun texte avant ou après, pas de balises Markdown (pas de ```json).\n\n"
        "Distingue bien un brief 'incomplet' (impossible à démarrer, manque description/objectif) "
        "d'un brief avec 'informations manquantes' (budget absent, format absent) qui reste 'exploitable_sous_reserve'.\n\n"
        "Format JSON strict attendu :\n"
        "{\n"
        "  \"statut_brief\": \"exploitable|exploitable_sous_reserve|incomplet|refuser\",\n"
        "  \"score_completude\": <entier 0-100>,\n"
        "  \"complexite_percue\": <entier 1-10>,\n"
        "  \"decision_recommandee\": \"ACCEPTER|ACCEPTER SOUS RÉSERVE|CLARIFIER|REFUSER\",\n"
        "  \"raison_decision\": \"Explication courte de la décision (max 2 phrases)\",\n"
        "  \"informations_manquantes\": [\"Format final\", \"Budget\"],\n"
        "  \"questions_client\": [\"Quel est le format final ?\"],\n"
        "  \"risques\": [\"Délai trop court pour le volume demandé\"],\n"
        "  \"niveau_priorite\": \"Normal|Urgent\",\n"
        "  \"brouillon_whatsapp\": \"Bonjour, ... (1-2 phrases courtes max)\"\n"
        "}"
    )

    user_prompt = (
        "Voici les données anonymisées (AI-safe) du brief :\n"
        f"{json.dumps(ai_safe_brief, ensure_ascii=False, indent=2)}\n\n"
        "Voici les résultats du Pricing Engine (SOURCE DE VÉRITÉ, NE PAS MODIFIER) :\n"
        f"{json.dumps(final_result['pricing'], ensure_ascii=False, indent=2)}\n\n"
        "Génère ton analyse en JSON."
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    # 5. Appel Réseau & Gestion des Erreurs
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15
        )
        response.raise_for_status()
        
        data = response.json()
        ai_content = data['choices'][0]['message']['content']
        ai_data = json.loads(ai_content)
        final_result["ai"] = ai_data
        
    except json.JSONDecodeError as e:
        logger.error(f"Erreur de parsing JSON de l'IA: {e}")
        final_result["ai"] = _get_fallback_ai(pricing_result, "Format de réponse IA invalide (non-JSON)")
    except requests.Timeout:
        logger.error("Timeout de l'API Groq")
        final_result["ai"] = _get_fallback_ai(pricing_result, "Temps de réponse IA dépassé")
    except requests.RequestException as e:
        logger.error(f"Erreur réseau Groq: {e}")
        final_result["ai"] = _get_fallback_ai(pricing_result, "Service IA indisponible")
    except Exception as e:
        logger.exception(f"Erreur inattendue IA: {e}")
        final_result["ai"] = _get_fallback_ai(pricing_result, "Erreur interne IA")

    return final_result


def _get_fallback_ai(pricing_result: dict, reason: str) -> dict:
    """Retourne une structure IA dégradée mais valide en cas d'erreur de Groq."""
    score_completude = pricing_result.get("score_completude", 50)
    complexite = pricing_result.get("score_complexite", 5)
    
    return {
        "statut_brief": "exploitable_sous_reserve",
        "score_completude": score_completude,
        "complexite_percue": complexite,
        "decision_recommandee": "ACCEPTER SOUS RÉSERVE",
        "raison_decision": f"Analyse IA indisponible ({reason}). Le moteur métier a été appliqué avec succès.",
        "informations_manquantes": ["Vérification manuelle requise (IA hors-ligne)"],
        "questions_client": [],
        "risques": ["Analyse de risques indisponible"],
        "niveau_priorite": "Normal",
        "brouillon_whatsapp": ""
    }
