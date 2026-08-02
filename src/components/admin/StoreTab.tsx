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
  DollarSign 
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

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Accessoires');
  const [priceFCFA, setPriceFCFA] = useState<number>(15000);
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('🟢 En Stock');

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
    setCategory((product.category as ProductCategory) || 'Accessoires');
    setPriceFCFA(product.priceFCFA);
    setStockStatus(product.stockStatus);
    setDescription(product.description);
    setImageUrl(product.imageUrl || '');
    setBadge(product.badge || '🟢 En Stock');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        category,
        priceFCFA: Number(priceFCFA),
        stockStatus,
        description,
        imageUrl: imageUrl || undefined,
        badge: badge || undefined,
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
    setCategory('Accessoires');
    setPriceFCFA(15000);
    setStockStatus('in_stock');
    setDescription('');
    setImageUrl('');
    setBadge('🟢 En Stock');
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
          <p className="text-xs text-slate-400">Gérez le catalogue de la boutique, la disponibilité et les prix en FCFA.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Produit</span>
        </button>
      </div>

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
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-400 text-[10px] font-mono font-bold">
                  {product.category}
                </span>

                {/* Stock Selector Dropdown */}
                <select
                  value={product.stockStatus}
                  onChange={(e) => onUpdateProduct(product.id, { stockStatus: e.target.value as StockStatus })}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="in_stock">✅ En Stock</option>
                  <option value="on_order">⏳ Sur Commande</option>
                  <option value="out_of_stock">🔴 Rupture</option>
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
                <div>
                  <h4 className="text-sm font-serif font-bold text-slate-100 line-clamp-1">{product.name}</h4>
                  <p className="text-sm font-mono font-extrabold text-amber-400 mt-0.5">
                    {product.priceFCFA.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-light">{product.description}</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
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
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom du produit *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Souris Sans Fil Pro"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
                />
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
                  <label className="block text-slate-400 font-bold mb-1">Prix (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
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
                    <option value="on_order">⏳ Sur commande</option>
                    <option value="out_of_stock">🔴 Rupture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Badge (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="ex: ⭐ Recommandé"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
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
