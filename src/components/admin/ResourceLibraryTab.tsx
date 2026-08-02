import React, { useState } from 'react';
import { ResourceAssetItem } from '../../types';
import { 
  BookOpen, 
  Folder, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  ExternalLink, 
  Tag 
} from 'lucide-react';

export const ResourceLibraryTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [resources] = useState<ResourceAssetItem[]>([
    {
      id: 'res-1',
      title: 'Pack Logos Hadara Design Vectoriels (AI/SVG)',
      category: 'logo',
      description: 'Logos officiels en déclinaison Doré Or, Vert Émeraude et Blanc Pur HD.',
      tags: ['Logo', 'Branding', 'Vectoriel'],
      createdAt: '31/07/2026'
    },
    {
      id: 'res-2',
      title: 'Polices Calligraphiques Islamiques & Titres',
      category: 'police',
      description: 'Amiri, Cinzel Decorative, Cairo & Scheherazade New Google Fonts.',
      tags: ['Typo', 'Calligraphie', 'Magal', 'Gamou'],
      createdAt: '30/07/2026'
    },
    {
      id: 'res-3',
      title: 'Palette HSL Événements Islamiques Solennels',
      category: 'palette',
      description: 'Combinaisons HSL & Hex Doré Or #D4AF37, Vert Islamique #006C35, Vert Sombre #0A2E1D.',
      tags: ['Couleurs', 'Or', 'Vert'],
      createdAt: '28/07/2026'
    },
    {
      id: 'res-4',
      title: 'Mockups 3D Bâche & Roll-up Podium',
      category: 'mockup',
      description: 'Fichiers PSD Photoshop haute définition avec objets dynamiques.',
      tags: ['Mockup', 'PSD', '3D'],
      createdAt: '25/07/2026'
    },
  ]);

  const filteredResources = resources.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Bibliothèque de Ressources & Assets Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Stockage centralisé des logos, polices, palettes, mockups 3D et templates réutilisables</p>
        </div>
      </div>

      {/* Categories Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher une ressource ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'logo', label: 'Logos' },
            { id: 'police', label: 'Polices' },
            { id: 'palette', label: 'Palettes' },
            { id: 'mockup', label: 'Mockups 3D' },
            { id: 'template', label: 'Templates' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div key={res.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 transition-all shadow-xl space-y-4 group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                {res.category === 'police' ? <Type className="w-5 h-5" /> :
                 res.category === 'palette' ? <Palette className="w-5 h-5" /> :
                 res.category === 'mockup' ? <ImageIcon className="w-5 h-5" /> :
                 <Folder className="w-5 h-5" />}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 text-[10px] font-mono font-bold uppercase">
                {res.category}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug">{res.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{res.description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {res.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-400/80 border border-amber-500/20 text-[10px] font-semibold">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION B: JOURNAL DES FRICTIONS & AMÉLIORATIONS OBSERVÉES v2.0 */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-amber-400 flex items-center gap-2">
              <span>📓</span> Journal des Frictions & Améliorations Observées (v2.0.0)
            </h3>
            <p className="text-xs text-slate-400">
              Journal de bord terrain pour consigner les irritants d'usage et piloter les versions (v2.0.1, v2.1.0) par les faits.
            </p>
          </div>
          <button 
            onClick={() => alert("Formulaire d'ajout de friction : prêt à l'enregistrement !")}
            className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 hover:bg-amber-300 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Noter un irritant</span>
          </button>
        </div>

        <div className="space-y-2">
          {[
            {
              date: '02/08/2026',
              author: 'El Hadji (Designer)',
              description: 'Le bouton de téléchargement direct en Lightbox nécessitait un clic supplémentaire sur mobile.',
              frequency: 'Élevée (Chaque projet)',
              priority: 'Haute',
              status: '✅ Corrigé dans v2.0.0'
            },
            {
              date: '01/08/2026',
              author: 'Client (Société SENELEC)',
              description: 'Confusion initiale sur l’acompte de 50% vs prix total.',
              frequency: 'Moyenne (Projets > 100k)',
              priority: 'Moyenne',
              status: '✅ Corrigé (Affichage Acompte & Solde explicites)'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] text-amber-400 font-bold">{item.date}</span>
                  <span className="text-slate-400">• {item.author}</span>
                </div>
                <p className="text-slate-200 font-medium">{item.description}</p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                  Fréquence: {item.frequency}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-400 font-bold font-mono">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
