import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Pencil, Trash2, X, Check, Package,
  ToggleLeft, ToggleRight, Search, RefreshCw, Upload, Image as ImageIcon
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category.trim()) {
      toast.error("Name, price, and category are required.");
      return;
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight">Product Catalog</h2>
          <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
            {products.length} products · changes go live instantly everywhere
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadProducts}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <Button
            onClick={openAddForm}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest px-5 rounded-xl"
          >
            <Plus size={16} className="mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-3">
          <RefreshCw size={28} className="animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-700">Loading Products...</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/60 border-b border-zinc-800">
                <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product</th>
                <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest hidden sm:table-cell">Category</th>
                <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Price</th>
                <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest hidden md:table-cell">Stock</th>
                <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="size-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon size={16} className="text-zinc-700" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-200 truncate">{product.name}</p>
                        <p className="text-[10px] text-zinc-600 truncate max-w-[180px]">{product.description}</p>
                        {isBase64Image(product.image) && (
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Custom Image</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] font-bold text-zinc-400">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4">
                    {product.discountPrice ? (
                      <>
                        <p className="text-sm font-black text-blue-400">${product.discountPrice.toFixed(2)} <span className="text-xs line-through text-zinc-500 font-normal">${product.price.toFixed(2)}</span></p>
                        <p className="text-[10px] text-zinc-600">Rs {Math.round(product.discountPrice * 133).toLocaleString()}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-black text-blue-400">${product.price.toFixed(2)}</p>
                        <p className="text-[10px] text-zinc-600">Rs {Math.round(product.price * 133).toLocaleString()}</p>
                      </>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {product.inStock ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                        <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse" /></span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] font-black text-red-400 uppercase tracking-widest">
                        <div className="size-1.5 bg-red-400 rounded-full" />Out of Stock</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      {deleteConfirmId === product.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-500 transition-colors"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
                            title="Edit product"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
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
            <div className="p-16 text-center opacity-30">
              <Package size={32} className="mx-auto mb-2 text-zinc-500" />
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                {search ? "No products match your search" : "No products yet. Add one!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Slide-in Form Panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="w-full max-w-lg bg-[#09090b] border-l border-zinc-800 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">

            <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-[#09090b] z-10">
              <div>
                <h3 className="text-base font-black text-zinc-100">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                  {editingProduct ? "Changes appear everywhere instantly" : "Will appear on homepage & checkout instantly"}
                </p>
              </div>
              <button onClick={closeForm} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* Name */}
              <div>
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Pure Raw Honey"
                  required
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short product description..."
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/60 transition-colors resize-none"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Original Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    required
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/60 transition-colors"
                  />
                  {form.price && (
                    <p className="text-[10px] text-zinc-600 mt-1 font-mono">≈ Rs {Math.round(parseFloat(form.price || "0") * 133).toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-black text-emerald-400 uppercase tracking-widest block mb-1.5">Discount Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discountPrice}
                    onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                    placeholder="0.00 (Optional)"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 transition-colors"
                  />
                  {form.discountPrice && (
                    <p className="text-[10px] text-emerald-500 mt-1 font-mono">≈ Rs {Math.round(parseFloat(form.discountPrice || "0") * 133).toLocaleString()} (Discounted)</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Category *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Honey"
                  required
                  list="category-suggestions"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/60 transition-colors"
                />
                <datalist id="category-suggestions">
                  <option value="Honey" />
                  <option value="Ghee & Oils" />
                  <option value="Jaggery" />
                  <option value="Peanut Butter" />
                </datalist>
              </div>

              {/* ── Image Drag & Drop ────────────────────────────── */}
              <div>
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Product Image <span className="text-zinc-600 normal-case">(drag & drop or click)</span>
                </label>

                {/* Drop Zone */}
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden
                    ${isDragging
                      ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                      : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900"
                    }`}
                >
                  {form.image ? (
                    <div className="relative">
                      <img
                        src={form.image}
                        alt="Product preview"
                        className="w-full h-48 object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center text-white">
                          <Upload size={24} className="mx-auto mb-1" />
                          <p className="text-xs font-bold">Click or drop to replace</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center gap-3 text-zinc-500">
                      <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-600"}`}>
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-zinc-400">
                          {isDragging ? "Drop image here!" : "Drag & drop your image"}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5">or click to browse · JPG, PNG, WEBP · max 5MB</p>
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
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">or enter path</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                <input
                  type="text"
                  value={isBase64Image(form.image) ? "" : form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="/images/honey_jar.png"
                  className="w-full mt-3 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/60 transition-colors"
                />
                {form.image && isBase64Image(form.image) && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-blue-400 font-bold">✓ Custom image uploaded — will appear on all pages</p>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, image: "" }))}
                      className="text-[10px] text-zinc-500 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {/* ─────────────────────────────────────────────────── */}

              {/* Features */}
              <div>
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Features <span className="text-zinc-600 normal-case">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.features}
                  onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                  placeholder="No added sugar, Rich in antioxidants, Organic"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-zinc-200">In Stock</p>
                  <p className="text-[11px] text-zinc-500">Product is available for purchase</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))}
                  className={`transition-colors ${form.inStock ? "text-emerald-400" : "text-zinc-600"}`}
                >
                  {form.inStock ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-wide transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSaving ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
