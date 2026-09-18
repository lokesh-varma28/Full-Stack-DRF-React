import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCategories } from '../../hooks/useCategories';
import { useProducts, PRODUCTS_QUERY_KEY } from '../../hooks/useProducts';
import { productsApi } from '../../api/products';
import { PRODUCT_FALLBACK_IMAGE } from '../../utils/constants';
import { getImageUrl } from '../../utils/imageUtils';
import { normalizeError } from '../../utils/error';
import { toast } from '../../stores/useToastStore';

export const AdminAddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const productId = id ? parseInt(id, 10) : null;

  const queryClient = useQueryClient();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { products, refetch } = useProducts({ size: 100 });

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing product if editing
  useEffect(() => {
    if (!isEditing || !productId) return;

    let isMounted = true;
    const fetchProduct = async () => {
      setInitialLoading(true);
      try {
        // Try local cache first
        const localProduct = products.find((p) => p.id === productId);
        if (localProduct) {
          setName(localProduct.name);
          setDescription(localProduct.description || '');
          setPrice(localProduct.price.toString());
          setStock(localProduct.stock.toString());
          setCategory(
            localProduct.category
              ? typeof localProduct.category === 'object'
                ? localProduct.category.id.toString()
                : localProduct.category.toString()
              : ''
          );
          setImagePreview(localProduct.image ? getImageUrl(localProduct.image) : null);
          setIsActive(localProduct.is_active);
          setInitialLoading(false);
          return;
        }

        // Fetch from API
        const res = await productsApi.getProduct(productId);
        if (isMounted && res.data) {
          const p = res.data;
          setName(p.name);
          setDescription(p.description || '');
          setPrice(p.price.toString());
          setStock(p.stock.toString());
          setCategory(
            p.category
              ? typeof p.category === 'object'
                ? p.category.id.toString()
                : p.category.toString()
              : ''
          );
          setImagePreview(p.image ? getImageUrl(p.image) : null);
          setIsActive(p.is_active);
        }
      } catch (err: any) {
        if (isMounted) {
          const normalized = normalizeError(err);
          setErrorMessage(normalized.message || 'Failed to load product details.');
        }
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [productId, isEditing, products]);

  // Set default category when categories load if creating new
  useEffect(() => {
    if (!isEditing && !category && categories.length > 0) {
      setCategory(categories[0].id.toString());
    }
  }, [categories, isEditing, category]);

  // Cleanup Blob URLs
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      toast.error('Invalid file format. Please select an image.');
      return;
    }

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(objectUrl);
    setErrorMessage(null);
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Product name is required.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage('Price must be a valid non-negative number.');
      return;
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setErrorMessage('Stock quantity must be a valid non-negative integer.');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('description', description.trim());
      formData.append('price', price);
      formData.append('stock', stock);
      if (category) formData.append('category', category);
      formData.append('is_active', isActive ? 'true' : 'false');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditing && productId) {
        await productsApi.updateProduct(productId, formData);
        toast.success('Product updated successfully!');
      } else {
        await productsApi.createProduct(formData);
        toast.success('Product created successfully!');
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      refetch();

      navigate('/admin/products');
    } catch (err: any) {
      const normalized = normalizeError(err);
      setErrorMessage(normalized.message || 'Failed to save product. Please check input values.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin mx-auto" />
            <p className="text-xs text-[#A7ADB7]">Loading product workspace...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Header & Workspace Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-5">
          <div>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs text-[#A7ADB7] hover:text-[#F5F7FA] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">
                PRODUCTS
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight mt-0.5">
              {isEditing ? `Edit Product #${productId}` : 'Add Product'}
            </h1>
            <p className="text-xs text-[#A7ADB7] mt-0.5">
              {isEditing
                ? 'Modify catalog details, stock availability and product pricing.'
                : 'Create a new product for your store.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="px-4 py-2 bg-[#171B20] hover:bg-[#252A31] text-[#F5F7FA] text-xs font-semibold rounded-lg border border-[#252A31] transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {isEditing ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs font-medium flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Column (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information Card */}
            <div className="bg-[#111418] border border-[#252A31] rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252A31] pb-3">
                Product Information
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#A7ADB7] mb-1.5">
                  Product Name <span className="text-[#6366F1]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full h-11 px-3.5 bg-[#171B20] text-[#F5F7FA] text-xs placeholder:text-[#747B87] border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7ADB7] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed technical specifications, features, materials, or warranty information..."
                  className="w-full p-3.5 bg-[#171B20] text-[#F5F7FA] text-xs placeholder:text-[#747B87] border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all resize-y min-h-[130px]"
                />
                <p className="text-[11px] text-[#747B87] mt-1">
                  Keep descriptions clear and informative for catalog shoppers.
                </p>
              </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className="bg-[#111418] border border-[#252A31] rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252A31] pb-3">
                Pricing & Inventory
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7ADB7] mb-1.5">
                    Price (INR ₹) <span className="text-[#6366F1]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs text-[#747B87] font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1499.00"
                      className="w-full h-11 pl-8 pr-3.5 bg-[#171B20] text-[#F5F7FA] text-xs placeholder:text-[#747B87] border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7ADB7] mb-1.5">
                    Stock Quantity <span className="text-[#6366F1]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="25"
                    className="w-full h-11 px-3.5 bg-[#171B20] text-[#F5F7FA] text-xs placeholder:text-[#747B87] border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                  />
                  <p className="text-[10px] text-[#747B87] mt-1">
                    Items with 5 or fewer units will trigger a low stock alert.
                  </p>
                </div>
              </div>
            </div>

            {/* Classification Card */}
            <div className="bg-[#111418] border border-[#252A31] rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252A31] pb-3">
                Classification
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#A7ADB7] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#171B20] text-[#F5F7FA] text-xs border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all cursor-pointer"
                >
                  <option value="">Select Store Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Secondary Column (Right 1 Col) */}
          <div className="space-y-6">
            {/* Product Media Upload Card */}
            <div className="bg-[#111418] border border-[#252A31] rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252A31] pb-3">
                Product Image
              </h2>

              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-[#252A31] bg-[#171B20] p-2 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-20 h-20 rounded-md object-cover bg-[#0B0D10] border border-[#252A31] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                      }}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-semibold text-[#F5F7FA] truncate">
                        {imageFile ? imageFile.name : name || 'Product Media'}
                      </p>
                      <p className="text-[10px] text-[#747B87]">
                        {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Stored Cloud Image'}
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                  <label className="block text-center text-xs font-semibold text-[#6366F1] hover:text-[#818cf8] cursor-pointer pt-1">
                    Choose different image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="border border-dashed border-[#252A31] hover:border-[#6366F1] rounded-lg p-6 text-center transition-colors bg-[#171B20]/50">
                  <label className="cursor-pointer space-y-2 block">
                    <Upload className="w-6 h-6 text-[#6366F1] mx-auto" />
                    <div className="text-xs font-semibold text-[#F5F7FA]">
                      Upload product image
                    </div>
                    <p className="text-[10px] text-[#747B87]">
                      PNG, JPG, WebP format
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Publishing & Visibility Card */}
            <div className="bg-[#111418] border border-[#252A31] rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252A31] pb-3">
                Publishing Status
              </h2>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-[#6366F1] rounded bg-[#171B20] border-[#252A31] accent-[#6366F1]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#F5F7FA] block">
                    Active & Visible
                  </span>
                  <span className="text-[11px] text-[#747B87]">
                    Item will appear immediately in public catalog search and store listings.
                  </span>
                </div>
              </label>
            </div>

            {/* Bottom Form Actions Card (Mobile/Sidebar fallback) */}
            <div className="bg-[#111418] border border-[#252A31] rounded-xl p-6 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Product...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {isEditing ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
              <Link
                to="/admin/products"
                className="w-full py-2 bg-[#171B20] hover:bg-[#252A31] text-[#A7ADB7] text-xs font-semibold rounded-lg border border-[#252A31] text-center block transition-colors"
              >
                Cancel & Return
              </Link>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};
