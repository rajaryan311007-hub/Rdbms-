'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  BookCheck,
  Undo2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  BookOpen,
  Lock,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function CirculationPage() {
  // Dropdown data
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);

  // Issue Form State
  const [issueBookId, setIssueBookId] = useState('');
  const [issueMemberId, setIssueMemberId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueFeedback, setIssueFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Return Form State
  const [returnLoanId, setReturnLoanId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isReturning, setIsReturning] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Recent Session Transactions
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    setIssueDate(todayStr);
    setReturnDate(todayStr);

    const twoWeeks = new Date();
    twoWeeks.setDate(today.getDate() + 14);
    setDueDate(twoWeeks.toISOString().slice(0, 10));
  }, []);

  // Fetch dropdown data
  const loadCirculationData = async () => {
    try {
      const [membersRes, booksRes, loansRes] = await Promise.all([
        fetch('/api/members/active').then((r) => r.json()),
        fetch('/api/books/available').then((r) => r.json()),
        fetch('/api/circulation/active-loans').then((r) => r.json()),
      ]);

      if (membersRes.members) setActiveMembers(membersRes.members);
      if (booksRes.books) setAvailableBooks(booksRes.books);
      if (loansRes.activeLoans) setActiveLoans(loansRes.activeLoans);
    } catch (err) {
      console.error('Failed to load circulation options:', err);
    }
  };

  useEffect(() => {
    loadCirculationData();
  }, []);

  // Handle Book Issue
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueFeedback(null);

    if (!issueBookId || !issueMemberId || !dueDate) {
      setIssueFeedback({ type: 'error', message: 'Please select a book, member, and due date.' });
      return;
    }

    try {
      setIsIssuing(true);
      const res = await fetch('/api/circulation/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: issueBookId,
          member_id: issueMemberId,
          issue_date: issueDate,
          due_date: dueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue book');
      }

      setIssueFeedback({
        type: 'success',
        message: data.message || 'Book issued successfully!',
      });

      // Add to session log
      setSessionLogs((prev) => [
        {
          id: Date.now(),
          type: 'ISSUE',
          text: `Issued "${data.loan?.book_title}" to ${data.loan?.member_name}`,
          timestamp: new Date().toLocaleTimeString(),
          badge: 'Transaction Committed',
        },
        ...prev,
      ]);

      // Reset selection
      setIssueBookId('');
      setIssueMemberId('');
      loadCirculationData();
    } catch (err: any) {
      setIssueFeedback({ type: 'error', message: err.message });
    } finally {
      setIsIssuing(false);
    }
  };

  // Handle Book Return
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnFeedback(null);

    if (!returnLoanId) {
      setReturnFeedback({ type: 'error', message: 'Please select an active loan to return.' });
      return;
    }

    try {
      setIsReturning(true);
      const res = await fetch('/api/circulation/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_id: returnLoanId,
          return_date: returnDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process return');
      }

      setReturnFeedback({
        type: 'success',
        message: data.message || 'Book returned successfully!',
      });

      setSessionLogs((prev) => [
        {
          id: Date.now(),
          type: 'RETURN',
          text: `Returned "${data.data?.book_title}" from ${data.data?.member_name}`,
          timestamp: new Date().toLocaleTimeString(),
          badge: data.data?.is_overdue ? `Overdue (+${data.data?.days_overdue}d)` : 'On Time',
        },
        ...prev,
      ]);

      setReturnLoanId('');
      loadCirculationData();
    } catch (err: any) {
      setReturnFeedback({ type: 'error', message: err.message });
    } finally {
      setIsReturning(false);
    }
  };

  const selectedActiveLoan = activeLoans.find((l) => String(l.loan_id) === returnLoanId);
  const selectedAvailableBook = availableBooks.find((b) => String(b.book_id) === issueBookId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Heading */}
      <div className="bg-white border-[3px] border-black p-5 rounded-lg shadow-[5px_5px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#B8F28B] border-2 border-black rounded-md flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <ArrowLeftRight className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Circulation Desk
            </h1>
            <p className="text-xs font-semibold text-black/60">
              ACID Transactional Book Circulation & Stock Availability Synchronization
            </p>
          </div>
        </div>

        {/* Transactional Integrity Pill */}
        <div className="flex items-center gap-2 bg-[#FFFDF5] border-2 border-black px-3 py-1.5 rounded-md font-mono text-xs font-bold shadow-[2px_2px_0px_#000]">
          <Lock className="w-3.5 h-3.5 text-[#4169FF]" />
          <span>Row Locking (FOR UPDATE) Enabled</span>
        </div>
      </div>

      {/* Two Column Layout: Issue & Return Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PANEL 1: ISSUE BOOK */}
        <div className="bg-white border-[3px] border-black rounded-lg shadow-[6px_6px_0px_#000] overflow-hidden flex flex-col">
          {/* Panel Header */}
          <div className="p-4 bg-[#FFE566] border-b-[2.5px] border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-black" />
              <h2 className="font-extrabold text-base uppercase tracking-tight text-black">
                Issue Book
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded uppercase">
              {availableBooks.length} Books In Stock
            </span>
          </div>

          {/* Issue Form */}
          <form onSubmit={handleIssueSubmit} className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Feedback Alert */}
              {issueFeedback && (
                <div
                  className={`p-3 border-2 border-black rounded-md text-xs font-bold flex items-start gap-2 animate-slide-up ${
                    issueFeedback.type === 'success'
                      ? 'bg-[#B8F28B] text-black'
                      : 'bg-[#FF7B72] text-white'
                  }`}
                >
                  {issueFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{issueFeedback.message}</span>
                </div>
              )}

              {/* Select Member */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Select Active Patron <span className="text-[#FF7B72]">*</span>
                </label>
                <select
                  value={issueMemberId}
                  onChange={(e) => setIssueMemberId(e.target.value)}
                  className="select-brutal w-full text-xs"
                  required
                >
                  <option value="">-- Choose Active Patron --</option>
                  {activeMembers.map((m) => (
                    <option key={m.member_id} value={m.member_id}>
                      {m.full_name} ({m.email})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] font-mono text-black/50 block mt-1">
                  Only patrons with 'active' membership status can borrow.
                </span>
              </div>

              {/* Select Available Book */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Select Available Book <span className="text-[#FF7B72]">*</span>
                </label>
                <select
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  className="select-brutal w-full text-xs"
                  required
                >
                  <option value="">-- Choose Available Book --</option>
                  {availableBooks.map((b) => (
                    <option key={b.book_id} value={b.book_id}>
                      {b.title} [Available: {b.available_copies} of {b.total_copies}]
                    </option>
                  ))}
                </select>
                {selectedAvailableBook && (
                  <div className="mt-2 p-2 bg-[#FFFDF5] border border-black rounded text-[11px] font-mono flex items-center justify-between">
                    <span>ISBN: {selectedAvailableBook.isbn}</span>
                    <span className="badge badge-green">
                      {selectedAvailableBook.available_copies} copies remaining
                    </span>
                  </div>
                )}
              </div>

              {/* Issue Date & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="input-brutal font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Due Date <span className="text-[#FF7B72]">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    min={issueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-brutal font-mono text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black mt-6">
              <button
                type="submit"
                disabled={isIssuing}
                className="btn-brutal btn-yellow w-full justify-center text-sm cursor-pointer"
              >
                {isIssuing ? 'Executing Transaction...' : 'Confirm Book Issue'}
              </button>
            </div>
          </form>
        </div>

        {/* PANEL 2: RETURN BOOK */}
        <div className="bg-white border-[3px] border-black rounded-lg shadow-[6px_6px_0px_#000] overflow-hidden flex flex-col">
          {/* Panel Header */}
          <div className="p-4 bg-[#B8F28B] border-b-[2.5px] border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Undo2 className="w-5 h-5 text-black" />
              <h2 className="font-extrabold text-base uppercase tracking-tight text-black">
                Return Book
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded uppercase">
              {activeLoans.length} Currently Borrowed
            </span>
          </div>

          {/* Return Form */}
          <form onSubmit={handleReturnSubmit} className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Feedback Alert */}
              {returnFeedback && (
                <div
                  className={`p-3 border-2 border-black rounded-md text-xs font-bold flex items-start gap-2 animate-slide-up ${
                    returnFeedback.type === 'success'
                      ? 'bg-[#B8F28B] text-black'
                      : 'bg-[#FF7B72] text-white'
                  }`}
                >
                  {returnFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{returnFeedback.message}</span>
                </div>
              )}

              {/* Select Active Loan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1 flex items-center gap-1">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Select Active Borrowed Book <span className="text-[#FF7B72]">*</span>
                </label>
                <select
                  value={returnLoanId}
                  onChange={(e) => setReturnLoanId(e.target.value)}
                  className="select-brutal w-full text-xs"
                  required
                >
                  <option value="">-- Choose Active Loan --</option>
                  {activeLoans.map((l) => (
                    <option key={l.loan_id} value={l.loan_id}>
                      #{l.loan_id} — "{l.title}" by {l.full_name} (Due: {l.due_date})
                      {l.is_overdue ? ` [OVERDUE +${l.days_overdue}d]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Details Preview Card */}
              {selectedActiveLoan && (
                <div className="p-3 bg-[#FFFDF5] border-2 border-black rounded-md space-y-2 text-xs font-medium animate-slide-up">
                  <div className="flex items-center justify-between pb-1 border-b border-black/20">
                    <span className="font-extrabold text-black">{selectedActiveLoan.title}</span>
                    <span
                      className={`badge ${
                        selectedActiveLoan.is_overdue ? 'badge-coral' : 'badge-green'
                      }`}
                    >
                      {selectedActiveLoan.is_overdue
                        ? `Overdue +${selectedActiveLoan.days_overdue} days`
                        : 'On Time'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-black/70">
                    <div>Patron: {selectedActiveLoan.full_name}</div>
                    <div>ISBN: {selectedActiveLoan.isbn}</div>
                    <div>Issued: {selectedActiveLoan.issue_date}</div>
                    <div>Due: {selectedActiveLoan.due_date}</div>
                  </div>
                </div>
              )}

              {/* Return Date Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Return Date <span className="text-[#FF7B72]">*</span>
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="input-brutal font-mono text-xs"
                  required
                />
                <span className="text-[10px] font-mono text-black/50 block mt-1">
                  Stock availability will automatically increment upon database commit.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black mt-6">
              <button
                type="submit"
                disabled={isReturning}
                className="btn-brutal btn-green w-full justify-center text-sm cursor-pointer"
              >
                {isReturning ? 'Processing Return...' : 'Complete Book Return'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Session Audit Log / Recent Transactions */}
      <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[5px_5px_0px_#000]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <h3 className="font-extrabold text-base uppercase tracking-tight text-black">
              Session Circulation Log
            </h3>
          </div>
          <span className="text-xs font-mono font-bold bg-[#FFFDF5] border border-black px-2 py-0.5 rounded">
            Live Actions: {sessionLogs.length}
          </span>
        </div>

        <div className="space-y-2">
          {sessionLogs.length > 0 ? (
            sessionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#FFFDF5] border-2 border-black rounded-md flex items-center justify-between text-xs font-medium"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      log.type === 'ISSUE' ? 'badge-yellow' : 'badge-green'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="font-bold text-black">{log.text}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-black/60">{log.timestamp}</span>
                  <span className="font-mono text-[10px] font-extrabold bg-black text-white px-1.5 py-0.5 rounded">
                    {log.badge}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-black/50 font-mono text-xs font-bold bg-[#FFFDF5] border border-black/30 rounded-md">
              Perform an issue or return operation above to view real-time transaction events.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
