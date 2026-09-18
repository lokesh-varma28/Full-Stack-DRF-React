import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import { Category } from '../../types/product';
import { normalizeError } from '../../utils/error';
import { toast } from '../../stores/useToastStore';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, isLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete Modal state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setIsActive(c.is_active);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage('Category name cannot be empty.');
      return;
    }

    const payload = {
      name: trimmedName,
      slug: trimmedSlug || undefined,
      description: description.trim(),
      is_active: isActive,
    };

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: payload,
        });
        toast.success('Category updated successfully!');
      } else {
        await createCategoryMutation.mutateAsync(payload);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const normalized = normalizeError(err);
      setErrorMessage(normalized.message);
    }
  };

  const handleOpenDeleteModal = (c: Category) => {
    setDeletingCategory(c);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setDeleteError(null);

    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      toast.success(`Category '${deletingCategory.name}' deleted successfully.`);
      setDeletingCategory(null);
    } catch (err: any) {
      const normalized = normalizeError(err);
      setDeleteError(normalized.message);
      toast.error('Failed to delete category.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-5">
          <div>
            <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">
              CATEGORIES
            </span>
            <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight mt-0.5">
              Category Catalog
            </h1>
            <p className="text-xs text-[#A7ADB7] mt-0.5">
              Manage store categories and product classification.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Category
          </button>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <div className="bg-[#111418] border border-[#252A31] rounded-xl p-12 text-center text-xs text-[#747B87]">
            <Loader2 className="w-6 h-6 text-[#6366F1] animate-spin mx-auto mb-2" />
            Loading category catalog...
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-[#111418] border border-[#252A31] rounded-xl p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-[#747B87] mx-auto" />
            <h3 className="text-sm font-bold text-[#F5F7FA]">No Categories Found</h3>
            <p className="text-xs text-[#A7ADB7]">Get started by creating your first category.</p>
          </div>
        ) : (
          <div className="bg-[#111418] border border-[#252A31] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#171B20] border-b border-[#252A31] text-[#A7ADB7] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-5">ID</th>
                    <th className="py-3.5 px-5">Category Name</th>
                    <th className="py-3.5 px-5">Slug</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252A31]/50 text-[#F5F7FA]">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-[#171B20]/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-[#747B87]">#{c.id}</td>
                      <td className="py-3.5 px-5 font-semibold text-[#F5F7FA]">{c.name}</td>
                      <td className="py-3.5 px-5 font-mono text-[#A7ADB7]">{c.slug}</td>
                      <td className="py-3.5 px-5">
                        {c.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-800/40">
                            <AlertCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          title="Edit category"
                          className="p-1.5 text-[#A7ADB7] hover:text-[#6366F1] hover:bg-[#171B20] rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(c)}
                          title="Delete category"
                          className="p-1.5 text-[#747B87] hover:text-rose-400 hover:bg-[#171B20] rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add / Edit Category Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#111418] rounded-xl max-w-md w-full p-6 border border-[#252A31] space-y-5 shadow-2xl">
              <h3 className="font-bold text-[#F5F7FA] text-base border-b border-[#252A31] pb-3">
                {editingCategory ? `Edit Category #${editingCategory.id}` : 'Create New Category'}
              </h3>

              {errorMessage && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#A7ADB7] mb-1">
                    Category Name <span className="text-[#6366F1]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Audio & Headphones"
                    className="w-full h-10 px-3.5 bg-[#171B20] text-[#F5F7FA] text-xs border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7ADB7] mb-1">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="audio-headphones"
                    className="w-full h-10 px-3.5 bg-[#171B20] text-[#F5F7FA] text-xs font-mono border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] transition-all"
                  />
                  <p className="text-[10px] text-[#747B87] mt-1">
                    Auto-generated from name if left empty.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7ADB7] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Category details..."
                    className="w-full p-3 bg-[#171B20] text-[#F5F7FA] text-xs border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#6366F1] bg-[#171B20] border-[#252A31] rounded accent-[#6366F1]"
                    />
                    <span className="text-xs font-semibold text-[#F5F7FA]">Active Category</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#252A31]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#171B20] hover:bg-[#252A31] text-[#F5F7FA] font-semibold rounded-lg border border-[#252A31] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#111418] rounded-xl max-w-md w-full p-6 border border-[#252A31] space-y-5 shadow-2xl">
              <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="font-bold text-[#F5F7FA] text-base">
                  Delete Category '{deletingCategory.name}'?
                </h3>
                <p className="text-xs text-[#A7ADB7] leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-[#F5F7FA]">"{deletingCategory.name}"</span>?
                  Products will remain in catalog as uncategorized.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  disabled={deleteCategoryMutation.isPending}
                  className="w-full py-2 bg-[#171B20] hover:bg-[#252A31] text-[#F5F7FA] font-semibold text-xs rounded-lg border border-[#252A31] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteCategoryMutation.isPending}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-xs disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleteCategoryMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    'Delete Category'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
