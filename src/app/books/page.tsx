'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Hash,
} from 'lucide-react';
import BookModal from '@/components/BookModal';
import BookDetailModal from '@/components/BookDetailModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<any | null>(null);
  const [bookToView, setBookToView] = useState<any | null>(null);
  const [bookToDelete, setBookToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch Categories for dropdown
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Fetch books
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        category,
        availability,
        sort: sortBy,
        order: sortOrder,
        page: page.toString(),
        limit: '10',
      });

      const res = await fetch(`/api/books?${params.toString()}`);
      const data = await res.json();

      if (data.books) {
        setBooks(data.books);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, availability, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/books/${bookToDelete.book_id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete book');
      }
      setFeedback({ type: 'success', message: `Book "${bookToDelete.title}" deleted successfully.` });
      setBookToDelete(null);
      fetchBooks();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setBookToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-[3px] border-black p-5 rounded-lg shadow-[5px_5px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFE566] border-2 border-black rounded-md flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <BookOpen className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-black">
                Book Inventory
              </h1>
              <span className="font-mono text-xs font-black bg-[#FFE566] border-2 border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                {totalCount} Total
              </span>
            </div>
            <p className="text-xs font-semibold text-black/60">
              Manage library catalog, ISBN records, author junctions, and copy availability
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setBookToEdit(null);
            setIsBookModalOpen(true);
          }}
          className="btn-brutal btn-yellow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
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

      {/* Filter and Search Controls */}
      <div className="bg-[#FFFDF5] border-[2.5px] border-black rounded-lg p-4 shadow-[4px_4px_0px_#000] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Title, ISBN, Author..."
              className="input-brutal pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-black/50 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="select-brutal text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id.toString()}>
                {c.category_name}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value);
              setPage(1);
            }}
            className="select-brutal text-xs"
          >
            <option value="all">All Availability Status</option>
            <option value="available">Available in Stock</option>
            <option value="unavailable">Fully Issued / Out of Stock</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-brutal text-xs flex-1"
            >
              <option value="title">Sort by Title</option>
              <option value="publication_year">Sort by Year</option>
              <option value="available_copies">Sort by Available Copies</option>
              <option value="book_id">Sort by Book ID</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))}
              title="Toggle Sort Order"
              className="p-2.5 bg-white border-2 border-black rounded-md hover:bg-[#FFE566] transition-colors cursor-pointer shrink-0 shadow-[2px_2px_0px_#000]"
            >
              <ArrowUpDown className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white border-[3px] border-black rounded-lg shadow-[5px_5px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FFE566] border-b-[2.5px] border-black font-mono font-bold uppercase text-black">
              <tr>
                <th className="p-3 border-r-2 border-black">ID</th>
                <th className="p-3 border-r-2 border-black">ISBN</th>
                <th className="p-3 border-r-2 border-black">Title & Author</th>
                <th className="p-3 border-r-2 border-black">Category</th>
                <th className="p-3 border-r-2 border-black">Publisher</th>
                <th className="p-3 border-r-2 border-black text-center">Year</th>
                <th className="p-3 border-r-2 border-black text-center">Copies</th>
                <th className="p-3 border-r-2 border-black text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center font-mono font-bold text-black/50">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Querying books table with relational aggregates...
                  </td>
                </tr>
              ) : books.length > 0 ? (
                books.map((book) => {
                  const isAvail = Number(book.available_copies) > 0;
                  return (
                    <tr key={book.book_id} className="hover:bg-[#FFFDF5] transition-colors">
                      <td className="p-3 font-mono font-bold border-r border-black/20 text-black">
                        #{book.book_id}
                      </td>
                      <td className="p-3 font-mono text-[11px] font-bold border-r border-black/20 text-black whitespace-nowrap">
                        {book.isbn}
                      </td>
                      <td className="p-3 border-r border-black/20 max-w-xs">
                        <div className="font-extrabold text-sm text-black leading-tight">
                          {book.title}
                        </div>
                        <div className="text-[11px] text-black font-semibold truncate">
                          {book.authors || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-3 border-r border-black/20 whitespace-nowrap">
                        <span className="badge badge-yellow font-bold text-black">{book.category_name}</span>
                      </td>
                      <td className="p-3 border-r border-black/20 text-black font-bold whitespace-nowrap">
                        {book.publisher_name}
                      </td>
                      <td className="p-3 font-mono font-bold text-black text-center border-r border-black/20">
                        {book.publication_year ? (book.publication_year < 0 ? `${Math.abs(book.publication_year)} BC` : book.publication_year) : '—'}
                      </td>
                      <td className="p-3 font-mono text-center border-r border-black/20 whitespace-nowrap">
                        <span className="font-black text-black">{book.available_copies}</span>
                        <span className="text-black font-bold"> / {book.total_copies}</span>
                      </td>
                      <td className="p-3 text-center border-r border-black/20">
                        {isAvail ? (
                          <span className="badge badge-green">In Stock</span>
                        ) : (
                          <span className="badge badge-coral">Issued Out</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setBookToView(book)}
                            title="View Book Details"
                            className="p-1.5 bg-white border border-black rounded hover:bg-[#FFE566] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-black" />
                          </button>
                          <button
                            onClick={() => {
                              setBookToEdit(book);
                              setIsBookModalOpen(true);
                            }}
                            title="Edit Book"
                            className="p-1.5 bg-white border border-black rounded hover:bg-[#4169FF] hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setBookToDelete(book)}
                            title="Delete Book"
                            className="p-1.5 bg-white border border-black rounded hover:bg-[#FF7B72] hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center font-mono text-sm font-bold text-black/50">
                    No books found matching the current search & filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-[#FFFDF5] border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-bold">
          <div className="text-black/70">
            Showing Page <span className="text-black font-extrabold">{page}</span> of{' '}
            <span className="text-black font-extrabold">{totalPages}</span> ({totalCount} total books)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border-2 border-black rounded bg-white hover:bg-[#FFE566] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border-2 border-black rounded bg-white hover:bg-[#FFE566] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookToEdit(null);
        }}
        onSuccess={fetchBooks}
        bookToEdit={bookToEdit}
      />

      <BookDetailModal
        isOpen={Boolean(bookToView)}
        onClose={() => setBookToView(null)}
        book={bookToView}
      />

      <ConfirmDialog
        isOpen={Boolean(bookToDelete)}
        title="Delete Book Record?"
        message={`Are you sure you want to delete "${bookToDelete?.title}" (ISBN: ${bookToDelete?.isbn})? Books with active loans cannot be removed.`}
        confirmLabel="Yes, Delete Book"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBookToDelete(null)}
        isLoading={isDeleting}
        danger={true}
      />
    </div>
  );
}
