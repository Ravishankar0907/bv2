import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button, Input, Modal } from '../../components/UI';
import { Plus, Edit2, Trash2, AlertTriangle, Save, Gamepad2, CreditCard } from 'lucide-react';
import { Product } from '../../types';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, addonSettings, updateAddonSettings } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Add-on Form State
  const [addonForm, setAddonForm] = useState({
    psPlusPriceWeek: addonSettings.psPlusPriceWeek.toString(),
    psPlusPriceMonth: addonSettings.psPlusPriceMonth.toString(),
    psPlusStock: addonSettings.psPlusStock.toString(),
    controllerPriceWeek: addonSettings.controllerPriceWeek.toString(),
    controllerPriceMonth: addonSettings.controllerPriceMonth.toString(),
    controllerStock: addonSettings.controllerStock.toString()
  });

  // Reset local addon state when global changes
  useEffect(() => {
    setAddonForm({
      psPlusPriceWeek: addonSettings.psPlusPriceWeek.toString(),
      psPlusPriceMonth: addonSettings.psPlusPriceMonth.toString(),
      psPlusStock: addonSettings.psPlusStock.toString(),
      controllerPriceWeek: addonSettings.controllerPriceWeek.toString(),
      controllerPriceMonth: addonSettings.controllerPriceMonth.toString(),
      controllerStock: addonSettings.controllerStock.toString()
    });
  }, [addonSettings]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    imageUrl: '', // New field
    pricePerWeek: '',
    pricePerMonth: '',
    stock: ''
  });

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', description: '', image: '', imageUrl: '', pricePerWeek: '', pricePerMonth: '', stock: '' });
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      imageUrl: product.imageUrl || '', // Load existing
      pricePerWeek: product.pricePerWeek.toString(),
      pricePerMonth: product.pricePerMonth.toString(),
      stock: product.stock.toString()
    });
    setShowForm(true);
  };


  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Edit Mode
      const originalProduct = products.find(p => p.id === editingId);
      if (originalProduct) {
        updateProduct({
          ...originalProduct,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          image: formData.image,
          imageUrl: formData.imageUrl, // Save
          pricePerWeek: Number(formData.pricePerWeek),
          pricePerMonth: Number(formData.pricePerMonth),
          stock: Number(formData.stock),
          totalStock: Number(formData.stock) > originalProduct.totalStock ? Number(formData.stock) : originalProduct.totalStock
        });
      }
    } else {
      // Add Mode
      addProduct({
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        category: formData.category,
        description: formData.description,
        image: formData.image, // Optional, can be empty string
        imageUrl: formData.imageUrl, // Save
        pricePerWeek: Number(formData.pricePerWeek),
        pricePerMonth: Number(formData.pricePerMonth),
        stock: Number(formData.stock),
        totalStock: Number(formData.stock)
      });
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', category: '', description: '', image: '', imageUrl: '', pricePerWeek: '', pricePerMonth: '', stock: '' });
  };

  const handleSaveAddons = () => {
    updateAddonSettings({
      psPlusPriceWeek: Number(addonForm.psPlusPriceWeek),
      psPlusPriceMonth: Number(addonForm.psPlusPriceMonth),
      psPlusStock: Number(addonForm.psPlusStock),
      controllerPriceWeek: Number(addonForm.controllerPriceWeek),
      controllerPriceMonth: Number(addonForm.controllerPriceMonth),
      controllerStock: Number(addonForm.controllerStock)
    });
    alert("Add-on settings updated!");
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Inventory</h2>
          <p className="text-slate-400">Manage rental assets, stock levels, and pricing.</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-5 h-5" /> Add Product
        </Button>
      </div>

      {showForm && (
        <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 animate-fadeIn">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Product Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Category" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
            <div className="md:col-span-2">
              <Input label="Description" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <Input
                label="High-Res Image URL (Optional)"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">Provide a direct URL for better quality. If this fails, the local upload below will comprise the fallback.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Local Fallback Image (Optional - Base64)</label>
              <div className="flex flex-col gap-3">
                {formData.image && (
                  <div className="relative w-full h-48 bg-slate-800 rounded-lg overflow-hidden">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-slate-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-brand-500/10 file:text-brand-500
                    hover:file:bg-brand-500/20
                    cursor-pointer"
                />
              </div>
            </div>
            <Input label="Available Stock" type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />

            <div className="md:col-span-2 grid grid-cols-2 gap-6 border-t border-slate-700 pt-4 mt-2">
              <div>
                <Input label="Price / Week (₹)" type="number" required value={formData.pricePerWeek} onChange={e => setFormData({ ...formData, pricePerWeek: e.target.value })} />
                <p className="text-xs text-slate-500 mt-1">Base weekly rental cost.</p>
              </div>
              <div>
                <Input label="Price / Month (₹)" type="number" required value={formData.pricePerMonth} onChange={e => setFormData({ ...formData, pricePerMonth: e.target.value })} />
                <p className="text-xs text-brand-400 mt-1">Set a discounted package price for monthly rentals.</p>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editingId ? 'Update Product' : 'Save Product'}</Button>
            </div>
          </form >
        </div >
      )}

      {/* Main Products Table */}
      <div className="bg-dark-card rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-sm">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4">Pricing (W/M)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.image || "https://placehold.co/100x100?text=No+Img"} className="w-10 h-10 rounded object-cover" alt="" />
                    <span className="font-medium">{product.name}</span>
                  </td>
                  <td className="p-4 text-slate-400">{product.category}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{product.stock} / {product.totalStock} available</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">
                    ₹{product.pricePerWeek} / ₹{product.pricePerMonth}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add-ons Configuration Section */}
      <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 space-y-6">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500/20 p-2 rounded-lg text-brand-500">
            <Save size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Add-ons Configuration</h3>
            <p className="text-slate-400 text-sm">Manage pricing and availability for optional extras.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-700">
          {/* PS Plus Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2"><CreditCard size={16} className="text-brand-400" /> PS Plus Extra</h4>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Weekly Cost (₹)"
                type="number"
                value={addonForm.psPlusPriceWeek}
                onChange={(e) => setAddonForm({ ...addonForm, psPlusPriceWeek: e.target.value })}
              />
              <Input
                label="Monthly Cost (₹)"
                type="number"
                value={addonForm.psPlusPriceMonth}
                onChange={(e) => setAddonForm({ ...addonForm, psPlusPriceMonth: e.target.value })}
              />
              <Input
                label="Stock"
                type="number"
                value={addonForm.psPlusStock}
                onChange={(e) => setAddonForm({ ...addonForm, psPlusStock: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className={`w-2 h-2 rounded-full ${addonSettings.psPlusStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              {addonSettings.psPlusStock} currently available
            </div>
          </div>

          {/* Controller Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2"><Gamepad2 size={16} className="text-brand-400" /> Extra Controller</h4>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Weekly Cost (₹)"
                type="number"
                value={addonForm.controllerPriceWeek}
                onChange={(e) => setAddonForm({ ...addonForm, controllerPriceWeek: e.target.value })}
              />
              <Input
                label="Monthly Cost (₹)"
                type="number"
                value={addonForm.controllerPriceMonth}
                onChange={(e) => setAddonForm({ ...addonForm, controllerPriceMonth: e.target.value })}
              />
              <Input
                label="Stock"
                type="number"
                value={addonForm.controllerStock}
                onChange={(e) => setAddonForm({ ...addonForm, controllerStock: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className={`w-2 h-2 rounded-full ${addonSettings.controllerStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              {addonSettings.controllerStock} currently available
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSaveAddons} className="flex items-center gap-2">
            <Save size={16} /> Update Add-ons
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-lg font-bold">Delete Product?</h4>
            <p className="text-slate-400 mt-2">
              Are you sure you want to delete <span className="text-white font-semibold">{productToDelete?.name}</span>?
              This action cannot be undone and will remove the item from the catalog.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default Inventory;