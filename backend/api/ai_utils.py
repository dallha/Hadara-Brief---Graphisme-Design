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

def chat_with_assistant(messages):
    """
    Parle avec l'assistant IA (Groq - Llama 3)
    `messages` est une liste de dicts [{"role": "user", "content": "..."}]
    """
    if GROQ_API_KEY == "gsk_placeholder_key_remplacez_moi":
        return "Simulation : L'assistant IA n'est pas encore connecté à l'API (clé manquante). Veuillez configurer GROQ_API_KEY sur le serveur."

    system_prompt = (
        "Tu es Mme Niass Madina, l'assistante virtuelle intelligente de MrNiass (le créateur de la plateforme Hadara Studio). "
        "Ton but est d'accueillir les visiteurs, de répondre à leurs questions de base, et de les diriger poliment vers MrNiass sur WhatsApp "
        "pour finaliser toute transaction ou discuter des prix précis. "
        "Ne donne pas de prix exacts fixes, mais tu peux donner des fourchettes vagues d'estimations (ex: 'Un logo professionnel commence généralement à partir de 50 000 FCFA'). "
        "Sois très concis, chaleureux, utilise des émojis. Ne fais pas de longues listes. "
        "Si le client demande à parler à un humain ou semble prêt à commander, dis-lui de cliquer sur 'Finaliser sur WhatsApp'."
    )

    # Format check: ensure all messages have 'role' and 'content'
    safe_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages[-5:]: # Keep last 5 messages for context to avoid huge payloads
        if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
            safe_messages.append({"role": msg['role'], "content": msg['content']})

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": safe_messages,
        "temperature": 0.5,
        "max_tokens": 150
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        logger.error(f"Erreur lors du chat IA : {e}")
        return "Désolé, je rencontre un petit problème de connexion en ce moment. Vous pouvez utiliser le bouton 'Finaliser sur WhatsApp' pour joindre MrNiass directement !"

def correct_ocr_text(raw_text):
    """
    Corrige les imperfections d'OCR (particulièrement pour l'arabe et le français) avec Groq.
    """
    if GROQ_API_KEY == "gsk_placeholder_key_remplacez_moi":
        return raw_text + "\n\n[Correction IA indisponible : Clé API non configurée]"

    system_prompt = (
        "Tu es un expert en linguistique (Arabe, Français, Anglais). "
        "Le texte fourni ci-dessous a été extrait d'une image par un logiciel d'OCR (Reconnaissance Optique de Caractères) et contient des erreurs, "
        "des caractères brouillés ou une mauvaise mise en forme. "
        "Ta mission est de corriger ces erreurs, de reconstruire les mots de manière logique et fluide, "
        "et de renvoyer UNIQUEMENT le texte corrigé final, sans aucune explication ni introduction. "
        "Si le texte contient de l'arabe, assure-toi que les mots sont correctement formés."
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_text}
        ],
        "temperature": 0.1
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"Erreur lors de la correction OCR IA : {e}")
        return raw_text
