// URL de base de l'API backend
// En production, utilise la variable d'environnement VITE_API_URL
// En développement local, utilise le proxy Vite (vide = relatif)
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
