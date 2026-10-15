'use client';

import React, { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create Category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setIsSubmitting(true);
      setFeedback(null);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');

      setFeedback({ type: 'success', message: `Category "${newCategoryName}" created successfully!` });
      setNewCategoryName('');
      fetchCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    try {
      setIsSubmitting(true);
      setFeedback(null);
      const res = await fetch(`/api/categories/${editingCategory.category_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update category');

      setFeedback({ type: 'success', message: 'Category renamed successfully!' });
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      setFeedback(null);
      const res = await fetch(`/api/categories/${categoryToDelete.category_id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category');

      setFeedback({ type: 'success', message: `Category "${categoryToDelete.category_name}" removed.` });
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setCategoryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-[3px] border-black p-5 rounded-lg shadow-[5px_5px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFE566] border-2 border-black rounded-md flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Tags className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-black">
                Categories & Genres
              </h1>
              <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                {categories.length} Categories
              </span>
            </div>
            <p className="text-xs font-semibold text-black/60">
              Manage relational book taxonomy with MySQL foreign key cascading and restrict checks
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 border-2 border-black rounded-md flex items-center justify-between shadow-[3px_3px_0px_#000] animate-slide-up ${
            feedback.type === 'success' ? 'bg-[#B8F28B]' : 'bg-[#FF7B72] text-white'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-mono font-bold uppercase underline cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add New Category Box */}
      <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[5px_5px_0px_#000]">
        <h2 className="font-extrabold text-sm uppercase tracking-wider text-black mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#4169FF]" />
          Create New Category
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Science Fiction, Cybernetics, Classical Antiquity..."
            className="input-brutal flex-1 text-xs"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCategoryName.trim()}
            className="btn-brutal btn-yellow shrink-0 text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black/60">
          Existing Catalog Genres ({categories.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center font-mono font-bold text-black/50 bg-white border-2 border-black rounded-lg">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            Loading category index...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const isEditing = editingCategory?.category_id === cat.category_id;
              return (
                <div
                  key={cat.category_id}
                  className="card-brutal p-4 bg-white flex flex-col justify-between"
                >
                  {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-brutal text-xs"
                        autoFocus
                        required
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-[#FFE566] border-2 border-black rounded text-xs font-bold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1 bg-white border-2 border-black rounded text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-[#FFE566] border border-black px-1.5 py-0.5 rounded text-black mb-1.5 inline-block">
                            ID #{cat.category_id}
                          </span>
                          <h3 className="font-black text-base text-black tracking-tight leading-tight">
                            {cat.category_name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditName(cat.category_name);
                            }}
                            title="Edit Category Name"
                            className="p-1 bg-white border border-black rounded hover:bg-[#4169FF] hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(cat)}
                            title="Delete Category"
                            className="p-1 bg-white border border-black rounded hover:bg-[#FF7B72] hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-mono font-bold text-black/70">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-black" />
                          <span>{cat.book_count || 0} Books</span>
                        </span>
                        <span className="text-[11px] bg-[#FFFDF5] border border-black px-1.5 py-0.5 rounded">
                          {cat.total_copies || 0} Total Copies
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category Record?"
        message={`Are you sure you want to delete category "${categoryToDelete?.category_name}"? If any books are classified under this category, the deletion will be rejected to protect relational integrity.`}
        confirmLabel="Delete Category"
        onConfirm={handleDelete}
        onCancel={() => setCategoryToDelete(null)}
        isLoading={isDeleting}
        danger={true}
      />
    </div>
  );
}
