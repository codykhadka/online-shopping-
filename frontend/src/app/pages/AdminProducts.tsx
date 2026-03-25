import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Pencil, Trash2, X, Check, Package,
  ToggleLeft, ToggleRight, Search, RefreshCw, Upload, Image as ImageIcon
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import "@/styles/AdminProducts.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  rating: number;
  inStock: boolean;
  features: string[];
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  image: "",        // can be a path like /images/honey.png OR a base64 data URL
  features: "",
  inStock: true,
};

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// Safe JSON fetch — shows a clear error if backend isn't running
async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    return { ok: res.ok, data: JSON.parse(text) };
  } catch {
    if (!res.ok) {
      throw new Error(
        res.status === 404
          ? "API route not found — please restart your backend server."
          : `Server error (${res.status}). Is the backend running?`
      );
    }
    throw new Error("Server returned unexpected response. Please restart the backend.");
  }
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    try {
      const { data } = await apiFetch(`${API_URL}/products`);
      setProducts(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // ── Image compression via canvas ───────────────────────────────────────────
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 800; // max width or height in px
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82)); // ~80% quality JPEG
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
      img.src = url;
    });
  };

  // ── Image drag-and-drop ──────────────────────────────────────────────────
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please drop an image file (JPG, PNG, WEBP, etc).");
      return;
    }
    try {
      toast.loading("Compressing image...", { id: "img-compress" });
      const base64 = await compressImage(file);
      setForm(f => ({ ...f, image: base64 }));
      toast.success("Image ready! It will appear on all pages.", { id: "img-compress" });
    } catch {
      toast.error("Failed to process image. Please try another file.", { id: "img-compress" });
    }
  };


  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const openAddForm = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      category: product.category,
      image: product.image,
      features: product.features.join(", "),
      inStock: product.inStock,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setShowAddConfirm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category.trim()) {
      toast.error("Name, price, and category are required.");
      return;
    }
    
    // For new products, trigger confirmation first
    if (!editingProduct && !showAddConfirm) {
      setShowAddConfirm(true);
      return;
    }

    await executeSave();
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        category: form.category.trim(),
        image: form.image.trim() || "/images/honey_jar.png",
        features: form.features,
        inStock: form.inStock,
      };
      const url = editingProduct ? `${API_URL}/products/${editingProduct.id}` : `${API_URL}/products`;
      const method = editingProduct ? "PUT" : "POST";
      const { ok, data } = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!ok) throw new Error(data.error);
      toast.success(editingProduct ? "Product updated! Changes are live everywhere." : "Product added! It's now live on the store.");
      closeForm();
      await loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
      setShowAddConfirm(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { ok, data } = await apiFetch(`${API_URL}/products/${id}`, { method: "DELETE" });
      if (!ok) throw new Error(data.error);
      toast.success("Product deleted.");
      setDeleteConfirmId(null);
      await loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product.");
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const isBase64Image = (src: string) => src.startsWith("data:");

  return (
    <div className="admin-products-container">
      {/* Header */}
      <div className="products-header">
        <div className="products-title-group">
          <h2 className="title">Product Catalog</h2>
          <p className="subtitle">
            {products.length} products · changes go live instantly everywhere
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={loadProducts}
            className="refresh-btn-products"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <Button
            onClick={openAddForm}
            className="add-product-btn"
          >
            <Plus size={16} className="mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper-products">
        <Search className="search-icon-products" size={16} />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input-products"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="loading-container-products">
          <RefreshCw size={28} className="loading-spinner-products" />
          <p className="loading-text-products">Loading Products...</p>
        </div>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="hidden sm:table-cell">Category</th>
                <th>Price</th>
                <th className="hidden md:table-cell">Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="product-row">
                  <td>
                    <div className="product-info">
                      <div className="product-image-container">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-image-table"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon size={16} className="text-zinc-700" />
                        )}
                      </div>
                      <div className="product-text">
                        <p className="product-name-table">{product.name}</p>
                        <p className="product-desc-table">{product.description}</p>
                        {isBase64Image(product.image) && (
                          <span className="custom-image-badge">Custom Image</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="category-badge-table">
                      {product.category}
                    </span>
                  </td>
                  <td>
                    {product.discountPrice ? (
                      <>
                        <p><span className="price-discounted">${product.discountPrice.toFixed(2)}</span> <span className="price-original">${product.price.toFixed(2)}</span></p>
                        <p className="price-npr">Rs {Math.round(product.discountPrice * 133).toLocaleString()}</p>
                      </>
                    ) : (
                      <>
                        <p className="price-discounted">${product.price.toFixed(2)}</p>
                        <p className="price-npr">Rs {Math.round(product.price * 133).toLocaleString()}</p>
                      </>
                    )}
                  </td>
                  <td className="hidden md:table-cell">
                    {product.inStock ? (
                      <span className="stock-indicator in-stock"><div className="stock-dot in-stock" />In Stock</span>
                    ) : (
                      <span className="stock-indicator out-of-stock"><div className="stock-dot out-of-stock" />Out of Stock</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btn-group">
                      {deleteConfirmId === product.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="confirm-delete-btn"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="cancel-delete-btn"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditForm(product)}
                            className="edit-btn"
                            title="Edit product"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="delete-btn"
                            title="Delete product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="empty-products-container">
              <Package size={32} className="icon" />
              <p className="text">
                {search ? "No products match your search" : "No products yet. Add one!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Slide-in Form Panel */}
      {showForm && (
        <div className="form-panel-overlay">
          <div className="form-panel-backdrop" onClick={closeForm} />
          <div className="form-panel">

            <div className="form-header">
              <div>
                <h3 className="form-title">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="form-subtitle">
                  {editingProduct ? "Changes appear everywhere instantly" : "Will appear on homepage & checkout instantly"}
                </p>
              </div>
              <button onClick={closeForm} className="close-form-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="product-form">

              {/* Name */}
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Pure Raw Honey"
                  required
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short product description..."
                  rows={3}
                  className="form-textarea"
                />
              </div>

              {/* Price & Discount */}
              <div className="price-grid">
                <div className="form-group">
                  <label className="form-label">Original Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    required
                    className="form-input"
                  />
                  {form.price && (
                    <p className="price-note">≈ Rs {Math.round(parseFloat(form.price || "0") * 133).toLocaleString()}</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label text-emerald-400">Discount Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discountPrice}
                    onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                    placeholder="0.00 (Optional)"
                    className="form-input focus:border-emerald-500/60"
                  />
                  {form.discountPrice && (
                    <p className="price-note discounted">≈ Rs {Math.round(parseFloat(form.discountPrice || "0") * 133).toLocaleString()} (Discounted)</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Honey"
                  required
                  list="category-suggestions"
                  className="form-input"
                />
                <datalist id="category-suggestions">
                  <option value="Honey" />
                  <option value="Ghee & Oils" />
                  <option value="Jaggery" />
                  <option value="Peanut Butter" />
                </datalist>
              </div>

              {/* ── Image Drag & Drop ────────────────────────────── */}
              <div className="form-group">
                <label className="form-label">
                  Product Image <span className="text-zinc-600 normal-case">(drag & drop or click)</span>
                </label>

                {/* Drop Zone */}
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`dropzone ${isDragging ? "dragging" : "not-dragging"}`}
                >
                  {form.image ? (
                    <div className="dropzone-preview">
                      <img
                        src={form.image}
                        alt="Product preview"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="dropzone-preview-overlay">
                        <div className="dropzone-preview-text">
                          <Upload size={24} className="icon" />
                          <p className="text">Click or drop to replace</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <div className="dropzone-placeholder-icon-wrapper">
                        <Upload size={24} />
                      </div>
                      <div className="dropzone-placeholder-text">
                        <p className="title">
                          {isDragging ? "Drop image here!" : "Drag & drop your image"}
                        </p>
                        <p className="subtitle">or click to browse · JPG, PNG, WEBP · max 5MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileInput}
                  />
                </div>

                {/* OR: Manual URL input */}
                <div className="image-url-separator">
                  <div className="line" />
                  <span className="text">or enter path</span>
                  <div className="line" />
                </div>
                <input
                  type="text"
                  value={isBase64Image(form.image) ? "" : form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="/images/honey_jar.png"
                  className="form-input image-url-input"
                />
                {form.image && isBase64Image(form.image) && (
                  <div className="custom-image-info">
                    <p className="text">✓ Custom image uploaded — will appear on all pages</p>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, image: "" }))}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {/* ─────────────────────────────────────────────────── */}

              {/* Features */}
              <div className="form-group">
                <label className="form-label">
                  Features <span className="text-zinc-600 normal-case">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.features}
                  onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                  placeholder="No added sugar, Rich in antioxidants, Organic"
                  className="form-input"
                />
              </div>

              {/* In Stock Toggle */}
              <div className="in-stock-toggle">
                <div className="text">
                  <p className="title">In Stock</p>
                  <p className="subtitle">Product is available for purchase</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))}
                  className={`toggle-btn ${form.inStock ? "on" : "off"}`}
                >
                  {form.inStock ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={closeForm}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="save-btn"
                >
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSaving ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>

            {/* Confirmation Modal */}
            {showAddConfirm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div 
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                  onClick={() => !isSaving && setShowAddConfirm(false)} 
                />
                <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 transform transition-all">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4 mx-auto">
                    <Package size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">Confirm Product Addition</h4>
                  <p className="text-gray-600 mb-6 text-center">
                    Are you sure you want to add <strong>{form.name}</strong> to the catalog? It will be instantly visible to all users.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAddConfirm(false)}
                      className="px-6 py-2.5 rounded-xl text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 transition-colors w-full"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={executeSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 w-full"
                    >
                      {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                      {isSaving ? "Saving..." : "Confirm"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
