import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ShoppingBag, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Upload, 
  Check, 
  X, 
  Tag, 
  Target,
  Truck,
  Save,
  CheckCircle
} from 'lucide-react';
import { StoreProduct, StockStatus, ProductCategory } from '../../types';

interface StoreTabProps {
  products: StoreProduct[];
  onAddProduct: (product: Omit<StoreProduct, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateProduct: (id: string, updatedProduct: Partial<StoreProduct>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

const CATEGORY_OPTIONS: ProductCategory[] = ['Accessoires', 'Impression', 'Graphisme', 'Électronique'];

export const StoreTab: React.FC<StoreTabProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Accessoires');
  const [priceFCFA, setPriceFCFA] = useState<number>(0);
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('🟢 En Stock');
  const [isHadaraSelection, setIsHadaraSelection] = useState(false);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE_BYTES = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE_BYTES) {
        alert("L'image dépasse la taille maximale de 5 Mo.");
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

  const handleOpenAddModal = () => {
    resetForm();
    setEditingProductId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: StoreProduct) => {
    setEditingProductId(product.id);
    setName(product.name);
    setBrand(product.brand || '');
    setCategory((product.category as ProductCategory) || 'Accessoires');
    setPriceFCFA(product.priceFCFA || 0);
    setStockStatus(product.stockStatus);
    setDescription(product.description);
    setImageUrl(product.imageUrl || '');
    setBadge(product.badge || '');
    setIsHadaraSelection(!!product.isHadaraSelection);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        brand: brand.trim() || undefined,
        category,
        priceFCFA: Number(priceFCFA) || 0,
        stockStatus,
        description,
        imageUrl: imageUrl || undefined,
        badge: badge || undefined,
        isHadaraSelection,
        isActive: true,
      };

      if (editingProductId) {
        await onUpdateProduct(editingProductId, payload);
      } else {
        await onAddProduct(payload);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving store product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setBrand('');
    setCategory('Accessoires');
    setPriceFCFA(0);
    setStockStatus('in_stock');
    setDescription('');
    setImageUrl('');
    setBadge('');
    setIsHadaraSelection(false);
  };

  const filteredProducts = (products || []).filter(p => {
    if (selectedCategoryFilter === 'all') return true;
    return p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">
              Hadara Store Manager
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-100">Gestion des Produits & Stock</h3>
          <p className="text-xs text-slate-400">Gérez le catalogue de la boutique, la marque, les garanties et la disponibilité.</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => {
              try {
                localStorage.setItem('hadara_store_products', JSON.stringify(products));
              } catch {}
              setSaveSuccessMsg('✅ Catalogue et stocks sauvegardés avec succès ! En ligne immédiatement.');
              setTimeout(() => setSaveSuccessMsg(null), 4000);
            }}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-md"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Enregistrer Tout</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Produit</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategoryFilter === 'all'
              ? 'bg-amber-400 text-slate-950'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          Tous ({products.length})
        </button>
        {CATEGORY_OPTIONS.map(cat => {
          const count = products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className={`p-5 rounded-3xl bg-slate-900 border transition-all flex flex-col justify-between space-y-4 shadow-xl relative ${
              product.isActive === false ? 'opacity-50 border-slate-800/50' : 'border-slate-800'
            }`}
          >
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-400 text-[10px] font-mono font-bold">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 text-[10px] font-bold">
                      {product.brand}
                    </span>
                  )}
                </div>

                {/* Stock Selector Dropdown */}
                <select
                  value={product.stockStatus}
                  onChange={(e) => {
                    onUpdateProduct(product.id, { stockStatus: e.target.value as StockStatus });
                    setSaveSuccessMsg(`✅ Statut de "${product.name}" mis à jour avec succès !`);
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="in_stock">✅ En Stock</option>
                  <option value="available_24_48h">🚚 Dispo 24–48h</option>
                  <option value="on_order">📦 Sur Commande</option>
                  <option value="unavailable">❌ Indisponible</option>
                </select>
              </div>

              {/* Product Image & Info */}
              <div className="flex gap-3">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <h4 className="text-sm font-serif font-bold text-slate-100 line-clamp-1">{product.name}</h4>
                  <p className="text-xs font-mono font-bold text-amber-400">
                    {product.priceFCFA && product.priceFCFA > 0 ? `${product.priceFCFA.toLocaleString('fr-FR')} FCFA` : 'Sur demande'}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 font-light">{product.description}</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateProduct(product.id, { isActive: !(product.isActive !== false) })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                    product.isActive !== false
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                  title={product.isActive !== false ? 'Masquer du magasin public' : 'Afficher sur le magasin public'}
                >
                  {product.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{product.isActive !== false ? 'Actif' : 'Masqué'}</span>
                </button>

                <button
                  onClick={() => onUpdateProduct(product.id, { isHadaraSelection: !product.isHadaraSelection })}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center space-x-1 ${
                    product.isHadaraSelection
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Sélection Hadara"
                >
                  <Target className="w-3 h-3" />
                  <span>{product.isHadaraSelection ? '🎯 Sélection' : 'Normal'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEditModal(product)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                  title="Modifier"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Voulez-vous vraiment supprimer "${product.name}" ?`)) {
                      onDeleteProduct(product.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 text-slate-100 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-serif font-bold text-slate-100">
                {editingProductId ? '✏️ Modifier le Produit' : '➕ Nouveau Produit Hadara Store'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">Nom du produit *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Souris Sans Fil MX Master 3S"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Marque</label>
                  <input
                    type="text"
                    placeholder="ex: Logitech"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProductCategory)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Prix FCFA (0 = Sur demande)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="0 = Sur demande"
                    value={priceFCFA}
                    onChange={e => setPriceFCFA(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Disponibilité Stock</label>
                  <select
                    value={stockStatus}
                    onChange={e => setStockStatus(e.target.value as StockStatus)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="in_stock">✅ En stock</option>
                    <option value="available_24_48h">🚚 Dispo 24–48h</option>
                    <option value="on_order">📦 Sur commande</option>
                    <option value="unavailable">❌ Indisponible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Badge (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="ex: ⭐ Best-Seller"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isHadaraSelection"
                  checked={isHadaraSelection}
                  onChange={e => setIsHadaraSelection(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-400 focus:ring-amber-400"
                />
                <label htmlFor="isHadaraSelection" className="text-amber-400 font-bold cursor-pointer">
                  🎯 Définir comme "Sélection Hadara Studio" (Produit recommandé)
                </label>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description courte *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Spécifications et atouts du produit..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Photo du produit (URL ou Upload)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none mb-2"
                />
                <label className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer border border-slate-700">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Importer un fichier photo</span>
                  <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-md"
                >
                  {isSubmitting ? 'Enregistrement...' : editingProductId ? 'Mettre à jour' : 'Ajouter le Produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
