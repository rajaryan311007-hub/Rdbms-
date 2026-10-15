'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Pencil,
  History,
  PowerOff,
  Power,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
} from 'lucide-react';
import MemberModal from '@/components/MemberModal';
import MemberDetailModal from '@/components/MemberDetailModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<any | null>(null);
  const [memberHistoryId, setMemberHistoryId] = useState<number | null>(null);
  const [memberToToggle, setMemberToToggle] = useState<any | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        status,
        page: page.toString(),
        limit: '10',
      });

      const res = await fetch(`/api/members?${params.toString()}`);
      const data = await res.json();

      if (data.members) {
        setMembers(data.members);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleToggleStatus = async () => {
    if (!memberToToggle) return;
    try {
      setIsToggling(true);
      const res = await fetch(`/api/members/${memberToToggle.member_id}`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      const nextStatus = memberToToggle.membership_status === 'active' ? 'inactive' : 'active';
      setFeedback({
        type: 'success',
        message: `Member ${memberToToggle.full_name} is now ${nextStatus}. Historical loans preserved.`,
      });
      setMemberToToggle(null);
      fetchMembers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setMemberToToggle(null);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-[3px] border-black p-5 rounded-lg shadow-[5px_5px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#4169FF] text-white border-2 border-black rounded-md flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-black">
                Member Directory
              </h1>
              <span className="font-mono text-xs font-black bg-[#4169FF] text-white border-2 border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                {totalCount} Members
              </span>
            </div>
            <p className="text-xs font-semibold text-black/60">
              Patron registration, circulation privileges, and historical borrowing records
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMemberToEdit(null);
            setIsMemberModalOpen(true);
          }}
          className="btn-brutal btn-blue cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Member</span>
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

      {/* Search & Filter Bar */}
      <div className="bg-[#FFFDF5] border-[2.5px] border-black rounded-lg p-4 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search patron by name, email, or phone..."
            className="input-brutal pl-9 text-xs"
          />
          <Search className="w-4 h-4 text-black/50 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="select-brutal text-xs w-full"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Patrons</option>
            <option value="inactive">Inactive Patrons</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border-[3px] border-black rounded-lg shadow-[5px_5px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FFE566] border-b-[2.5px] border-black font-mono font-bold uppercase text-black">
              <tr>
                <th className="p-3 border-r-2 border-black">ID</th>
                <th className="p-3 border-r-2 border-black">Full Name</th>
                <th className="p-3 border-r-2 border-black">Email Address</th>
                <th className="p-3 border-r-2 border-black">Phone</th>
                <th className="p-3 border-r-2 border-black text-center">Registration</th>
                <th className="p-3 border-r-2 border-black text-center">Active Loans</th>
                <th className="p-3 border-r-2 border-black text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center font-mono font-bold text-black/50">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading members...
                  </td>
                </tr>
              ) : members.length > 0 ? (
                members.map((member) => {
                  const isActive = member.membership_status === 'active';
                  return (
                    <tr key={member.member_id} className="hover:bg-[#FFFDF5] transition-colors">
                      <td className="p-3 font-mono font-bold border-r border-black/20 text-black">
                        #{member.member_id}
                      </td>
                      <td className="p-3 border-r border-black/20 font-extrabold text-sm text-black">
                        {member.full_name}
                      </td>
                      <td className="p-3 border-r border-black/20 font-mono font-bold text-black">
                        {member.email}
                      </td>
                      <td className="p-3 border-r border-black/20 font-mono font-bold text-black">
                        {member.phone || '—'}
                      </td>
                      <td className="p-3 font-mono font-bold text-black text-center border-r border-black/20">
                        {member.registration_date}
                      </td>
                      <td className="p-3 font-mono text-center border-r border-black/20">
                        <span
                          className={`font-black px-2 py-0.5 rounded border border-black ${
                            member.active_loans > 0
                              ? 'bg-[#FFE566] text-black'
                              : 'bg-white text-black font-bold'
                          }`}
                        >
                          {member.active_loans}
                        </span>
                      </td>
                      <td className="p-3 text-center border-r border-black/20">
                        <span className={`badge ${isActive ? 'badge-green' : 'badge-gray'}`}>
                          {member.membership_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setMemberHistoryId(member.member_id)}
                            title="View Borrowing History"
                            className="p-1.5 bg-white border border-black rounded hover:bg-[#FFE566] transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-black" />
                          </button>
                          <button
                            onClick={() => {
                              setMemberToEdit(member);
                              setIsMemberModalOpen(true);
                            }}
                            title="Edit Profile"
                            className="p-1.5 bg-white border border-black rounded hover:bg-[#4169FF] hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setMemberToToggle(member)}
                            title={isActive ? 'Deactivate Member' : 'Activate Member'}
                            className={`p-1.5 border border-black rounded transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-white hover:bg-[#FF7B72] hover:text-white'
                                : 'bg-[#B8F28B] hover:bg-[#99db6b]'
                            }`}
                          >
                            {isActive ? (
                              <PowerOff className="w-3.5 h-3.5" />
                            ) : (
                              <Power className="w-3.5 h-3.5 text-black" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center font-mono text-sm font-bold text-black/50">
                    No patrons found matching search criteria.
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
            <span className="text-black font-extrabold">{totalPages}</span> ({totalCount} patrons)
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
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        onSuccess={fetchMembers}
        memberToEdit={memberToEdit}
      />

      <MemberDetailModal
        isOpen={Boolean(memberHistoryId)}
        onClose={() => setMemberHistoryId(null)}
        memberId={memberHistoryId}
      />

      <ConfirmDialog
        isOpen={Boolean(memberToToggle)}
        title={
          memberToToggle?.membership_status === 'active'
            ? 'Deactivate Member Account?'
            : 'Reactivate Member Account?'
        }
        message={
          memberToToggle?.membership_status === 'active'
            ? `Deactivating ${memberToToggle?.full_name} will suspend borrowing privileges. All historical loan records remain permanently intact in accordance with RDBMS non-destructive archiving principles.`
            : `Reactivate circulation privileges for ${memberToToggle?.full_name}?`
        }
        confirmLabel={
          memberToToggle?.membership_status === 'active' ? 'Deactivate' : 'Reactivate'
        }
        onConfirm={handleToggleStatus}
        onCancel={() => setMemberToToggle(null)}
        isLoading={isToggling}
        danger={memberToToggle?.membership_status === 'active'}
      />
    </div>
  );
}
