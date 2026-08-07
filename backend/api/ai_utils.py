import json
import os
import requests
import logging

logger = logging.getLogger(__name__)

# Placeholder pour l'API Key Groq
# Vous pourrez obtenir une clé gratuite sur https://console.groq.com
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "gsk_placeholder_key_remplacez_moi")

def analyze_brief_with_ai(brief):
    """
    Analyse un brief en utilisant une API LLM gratuite (Groq - Llama 3)
    Retourne un dictionnaire (JSON) structuré avec l'analyse.
    """
    if GROQ_API_KEY == "gsk_placeholder_key_remplacez_moi":
        # Mode Simulation si la clé n'est pas encore configurée
        # Cela permet d'éviter que l'admin ne plante lors du test
        return {
            "resume": f"Simulation d'analyse pour le projet de {brief.client_name}.",
            "charge_travail": "Moyenne",
            "suggestion_prix": "À estimer (clé API manquante)",
            "points_attention": ["Veuillez configurer GROQ_API_KEY dans votre environnement backend."],
            "mode": "Simulation (Clé API non configurée)"
        }

    # Préparation des données du brief pour le prompt
    brief_data = {
        "client": brief.client_name,
        "type_projet": brief.project_type or brief.project_type_custom,
        "contexte": brief.context_description,
        "objectifs": brief.primary_objective,
        "format": brief.technical_format,
        "budget_client": brief.budget_range,
        "delai": brief.desired_delivery_date
    }

    # Construction du prompt système
    system_prompt = (
        "Tu es une IA d'analyse ultra-minimaliste (style 'Caveman'). "
        "Zéro blabla. Utilise des mots-clés, sois hyper direct. "
        "Tu dois TOUJOURS répondre uniquement avec un objet JSON valide, sans aucun texte autour. "
        "Format JSON attendu : \n"
        "{\n"
        "  \"resume\": \"3 mots-clés max décrivant le besoin\",\n"
        "  \"charge_travail\": \"Facile/Moyenne/Complexe\",\n"
        "  \"suggestion_prix\": \"Ex: 50000 FCFA\",\n"
        "  \"points_attention\": [\"Risque 1 très court\", \"Action urgente 2\"],\n"
        "  \"brouillon_whatsapp\": \"Bonjour, bien reçu le brief pour [Projet]. Budget estimé : [Prix]. Dispo pour un appel ?\"\n"
        "}"
    )

    user_prompt = f"Voici les données du brief à analyser :\n{json.dumps(brief_data, ensure_ascii=False, indent=2)}"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",  # Modèle gratuit et très rapide chez Groq
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15
        )
        response.raise_for_status()
        
        data = response.json()
        ai_message = data["choices"][0]["message"]["content"]
        
        # Le contenu est censé être un JSON valide
        parsed_json = json.loads(ai_message)
        return parsed_json

    except requests.exceptions.RequestException as e:
        logger.error(f"Erreur lors de l'appel à l'API IA : {e}")
        return {
            "erreur": "Erreur de connexion à l'API IA.",
            "details": str(e)
        }
    except json.JSONDecodeError as e:
        logger.error(f"Erreur de parsing JSON depuis l'IA : {e}")
        return {
            "erreur": "L'IA a retourné un format invalide.",
            "brut": ai_message if 'ai_message' in locals() else "N/A"
        }
    except Exception as e:
        logger.error(f"Erreur inattendue IA : {e}")
        return {
            "erreur": "Une erreur inattendue est survenue.",
            "details": str(e)
        }
