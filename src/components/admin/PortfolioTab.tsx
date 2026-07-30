import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Image as ImageIcon, Sparkles, Tag, Eye, Upload, Check, X } from 'lucide-react';
import { SamplePortfolioItem } from '../../types';

interface PortfolioTabProps {
  portfolioItems: SamplePortfolioItem[];
  onAddPortfolioItem: (item: Omit<SamplePortfolioItem, 'id'>) => Promise<void>;
  onDeletePortfolioItem: (id: string) => Promise<void>;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  portfolioItems,
  onAddPortfolioItem,
  onDeletePortfolioItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Communication Visuelle');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('Création HD');
  const [priceEstimate, setPriceEstimate] = useState('30 000 FCFA');
  const [imageUrl, setImageUrl] = useState('');
  const [accentHex, setAccentHex] = useState('#816C07');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>(['Format HD Imprimeur', 'Export PNG & PDF']);

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
      if (file.size > MAX_SIZE_BYTES) {
        alert("L'image choisie dépasse la taille maximale autorisée de 5 Mo.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddPortfolioItem({
        title,
        category,
        description,
        badge,
        priceEstimate,
        imageUrl: imageUrl || undefined,
        accentHex,
        features: features.length > 0 ? features : ['Design Haute Définition']
      });
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
    } catch (err) {
      console.error('Error adding portfolio item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = portfolioItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <span>Galerie des Réalisations & Portfolio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ajoutez, modifiez ou supprimez vos visuels et réalisations affichés sur le site public.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-2 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Création</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Toutes les créations' },
          { id: 'Identité', label: 'Logos & Branding' },
          { id: 'Communication', label: 'Affiches & Flyers' },
          { id: 'Grand Format', label: 'Bâches & Roll-up' },
          { id: 'Booster', label: 'Packages' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900/60 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Portfolio Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-xl"
          >
            <div className="relative h-48 bg-slate-950 overflow-hidden flex items-center justify-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ImageIcon className="w-10 h-10 text-amber-500/40 mx-auto" />
                  <p className="text-xs text-slate-500 font-mono">Modèle Standard (Aperçu Produit)</p>
                </div>
              )}

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {item.badge}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  {item.priceEstimate}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  <span>{item.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">ID: {item.id}</span>
                <button
                  onClick={() => onDeletePortfolioItem(item.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold transition-colors flex items-center space-x-1"
                  title="Supprimer la création"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Portfolio Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Ajouter une nouvelle création au Portfolio</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Titre du Projet / Visuel *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Affiche Officielle Ziarra Tayba 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Catégorie *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Identité Visuelle">Identité Visuelle & Logo</option>
                    <option value="Communication Visuelle">Communication (Affiche / Flyer)</option>
                    <option value="Grand Format">Grand Format (Bâche / Roll-up)</option>
                    <option value="Packages Booster">Package Booster Startup / Event</option>
                    <option value="Digital & Web IA">Digital & Site Web IA</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Prix Estimé / Indicatif</label>
                  <input
                    type="text"
                    placeholder="Ex: 30 000 FCFA ou Sur Devis"
                    value={priceEstimate}
                    onChange={(e) => setPriceEstimate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Badge (Étiquette)</label>
                  <input
                    type="text"
                    placeholder="Ex: Pack Affiche + Flyer"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Lien Image (URL direct) ou Fichier</label>
                  <input
                    type="text"
                    placeholder="https://... ou téléversez ci-dessous"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Upload file preview */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Téléverser une image de création</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs"
                />
                {imageUrl && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-800">
                    <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Décrivez votre création, l'objectif et les détails..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Publier sur le Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
