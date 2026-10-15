'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

export default function HistoryPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: filter,
        search,
        page: page.toString(),
        limit: '10',
      });

      const res = await fetch(`/api/history?${params.toString()}`);
      const data = await res.json();

      if (data.loans) {
        setLoans(data.loans);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!loans.length) return;

    const headers = ['Loan ID', 'Book Title', 'ISBN', 'Member Name', 'Member Email', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Days Overdue'];
    const rows = loans.map((l) => [
      l.loan_id,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      l.isbn,
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      l.email,
      l.issue_date,
      l.due_date,
      l.return_date || 'N/A',
      l.status,
      l.days_overdue || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookstack_loans_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-[3px] border-black p-5 rounded-lg shadow-[5px_5px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFE566] border-2 border-black rounded-md flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <History className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-black">
                Borrowing History
              </h1>
              <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                {totalCount} Total Records
              </span>
            </div>
            <p className="text-xs font-semibold text-black/60">
              Audit trail of all historical and active book circulation loans across the library
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!loans.length}
          className="btn-brutal btn-green cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#FFFDF5] border-[2.5px] border-black rounded-lg p-4 shadow-[4px_4px_0px_#000] space-y-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'active', label: 'Currently Active' },
            { id: 'returned', label: 'Returned Books' },
            { id: 'overdue', label: 'Overdue Books' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#FFE566] shadow-[2px_2px_0px_#000] translate-x-0.5'
                  : 'bg-white hover:bg-[#F5F3EB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by patron name, email, book title, or ISBN..."
            className="input-brutal pl-9 text-xs"
          />
          <Search className="w-4 h-4 text-black/50 absolute left-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border-[3px] border-black rounded-lg shadow-[5px_5px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FFE566] border-b-[2.5px] border-black font-mono font-bold uppercase text-black">
              <tr>
                <th className="p-3 border-r-2 border-black">Loan ID</th>
                <th className="p-3 border-r-2 border-black">Patron Name</th>
                <th className="p-3 border-r-2 border-black">Book Title & ISBN</th>
                <th className="p-3 border-r-2 border-black text-center">Issue Date</th>
                <th className="p-3 border-r-2 border-black text-center">Due Date</th>
                <th className="p-3 border-r-2 border-black text-center">Return Date</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-mono font-bold text-black/50">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Querying Loans database view...
                  </td>
                </tr>
              ) : loans.length > 0 ? (
                loans.map((loan) => (
                  <tr key={loan.loan_id} className="hover:bg-[#FFFDF5] transition-colors">
                    <td className="p-3 font-mono font-bold border-r border-black/20 text-black">
                      #{loan.loan_id}
                    </td>
                    <td className="p-3 border-r border-black/20">
                      <div className="font-extrabold text-sm text-black leading-tight">
                        {loan.full_name}
                      </div>
                      <div className="text-[11px] font-mono font-bold text-black">
                        {loan.email}
                      </div>
                    </td>
                    <td className="p-3 border-r border-black/20 max-w-xs">
                      <div className="font-extrabold text-sm text-black leading-tight">
                        {loan.title}
                      </div>
                      <div className="text-[11px] font-mono font-bold text-black">
                        ISBN: {loan.isbn}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-black text-center border-r border-black/20">
                      {loan.issue_date}
                    </td>
                    <td className="p-3 font-mono font-bold text-black text-center border-r border-black/20">
                      {loan.due_date}
                    </td>
                    <td className="p-3 font-mono text-center border-r border-black/20">
                      {loan.return_date ? (
                        <span className="font-black text-black">{loan.return_date}</span>
                      ) : (
                        <span className="text-black font-bold italic">Not Returned</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {loan.status === 'returned' && (
                        <span className="badge badge-green inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Returned
                        </span>
                      )}
                      {loan.status === 'active' && (
                        <span className="badge badge-yellow inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Active
                        </span>
                      )}
                      {loan.status === 'overdue' && (
                        <span className="badge badge-coral inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overdue (+{loan.days_overdue}d)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-mono text-sm font-bold text-black/50">
                    No circulation loans found matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-[#FFFDF5] border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-bold">
          <div className="text-black/70">
            Page <span className="text-black font-extrabold">{page}</span> of{' '}
            <span className="text-black font-extrabold">{totalPages}</span> ({totalCount} total loans)
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
    </div>
  );
}
