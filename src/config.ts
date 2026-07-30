// Dynamic API Base depending on the environment
const API_BASE = import.meta.env.DEV 
  ? 'http://127.0.0.1:8000' 
  : 'https://hadara-backend.onrender.com';

export default API_BASE;
