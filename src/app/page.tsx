'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  BookCopy,
  Users,
  AlertTriangle,
  PlusCircle,
  UserPlus,
  ArrowLeftRight,
  TrendingUp,
  PieChart as PieChartIcon,
  Clock,
  ArrowRight,
  RefreshCw,
  Database,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import BookModal from '@/components/BookModal';
import MemberModal from '@/components/MemberModal';

const PIE_COLORS = ['#FFE566', '#4169FF', '#B8F28B', '#FF7B72', '#E8E5D8'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {
    totalBooks: 0,
    availableCopies: 0,
    currentlyIssued: 0,
    registeredMembers: 0,
    overdueLoans: 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-[#FFE566] border-[3px] border-black rounded-lg p-6 lg:p-8 shadow-[6px_6px_0px_#000] relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black text-[#FFE566] rounded-md font-mono text-xs font-black uppercase mb-3 tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>RDBMS Lab Project • Cloud Relational Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-black leading-none mb-3">
            Your Library, <br />
            <span className="underline decoration-black decoration-wavy decoration-2">
              Under Control.
            </span>
          </h1>
          <p className="text-sm sm:text-base font-bold text-black/80 max-w-xl leading-relaxed">
            Real-time book tracking, circulation workflows, constraint enforcement, and transactional integrity powered by normalized relational schema.
          </p>
        </div>

        {/* Database Status indicator */}
        <div className="mt-4 pt-4 border-t-2 border-black/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full border border-black ${
                data?.dbStatus?.connected ? 'bg-[#B8F28B]' : 'bg-[#FFE566]'
              }`}
            />
            <span className="text-black/80">
              {data?.dbStatus?.message || 'Database connection initialized'}
            </span>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-black rounded text-black hover:bg-black hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Quick Action Panel */}
      <div className="bg-white border-[3px] border-black rounded-lg p-4 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black/60">
            Fast Operations:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="btn-brutal btn-yellow text-xs py-2 px-3.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Book</span>
          </button>
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="btn-brutal btn-blue text-xs py-2 px-3.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Member</span>
          </button>
          <Link
            href="/circulation"
            className="btn-brutal btn-green text-xs py-2 px-3.5 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Issue / Return Book</span>
          </Link>
        </div>
      </div>

      {/* Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Books */}
        <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[4px_4px_0px_#000] border-l-[8px] border-l-[#FFE566]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-black">
              Total Books
            </span>
            <div className="p-2 bg-[#FFE566] border-2 border-black rounded-md shadow-[2px_2px_0px_#000]">
              <BookOpen className="w-4 h-4 text-black" />
            </div>
          </div>
          <div className="text-3xl font-black text-black tracking-tight font-mono">
            {loading ? '...' : stats.totalBooks}
          </div>
          <span className="text-[11px] font-bold text-black/80 block mt-1">
            Unique Catalog Entries
          </span>
        </div>

        {/* Available Copies */}
        <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[4px_4px_0px_#000] border-l-[8px] border-l-[#B8F28B]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-black">
              Available Copies
            </span>
            <div className="p-2 bg-[#B8F28B] border-2 border-black rounded-md shadow-[2px_2px_0px_#000]">
              <CheckCircle2 className="w-4 h-4 text-black" />
            </div>
          </div>
          <div className="text-3xl font-black text-black tracking-tight font-mono">
            {loading ? '...' : stats.availableCopies}
          </div>
          <span className="text-[11px] font-bold text-black/80 block mt-1">
            Ready on Shelves
          </span>
        </div>

        {/* Currently Issued */}
        <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[4px_4px_0px_#000] border-l-[8px] border-l-[#4169FF]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-black">
              Currently Issued
            </span>
            <div className="p-2 bg-[#4169FF] text-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000]">
              <BookCopy className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-3xl font-black text-black tracking-tight font-mono">
            {loading ? '...' : stats.currentlyIssued}
          </div>
          <span className="text-[11px] font-bold text-black/80 block mt-1">
            Active Member Loans
          </span>
        </div>

        {/* Registered Members */}
        <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[4px_4px_0px_#000] border-l-[8px] border-l-[#FF7B72]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-black">
              Active Members
            </span>
            <div className="p-2 bg-[#FF7B72] text-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000]">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-3xl font-black text-black tracking-tight font-mono">
            {loading ? '...' : stats.registeredMembers}
          </div>
          <span className="text-[11px] font-bold text-black/80 block mt-1">
            Registered Patrons
          </span>
        </div>

        {/* Overdue Loans */}
        <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[4px_4px_0px_#000] border-l-[8px] border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-black">
              Overdue Loans
            </span>
            <div className="p-2 bg-red-500 text-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000]">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600 tracking-tight font-mono">
            {loading ? '...' : stats.overdueLoans}
          </div>
          <span className="text-[11px] font-bold text-red-700 block mt-1">
            Requires Attention
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Borrowing Trends Bar Chart */}
        <div className="lg:col-span-2 bg-white border-[3px] border-black rounded-lg p-5 shadow-[5px_5px_0px_#000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#4169FF]" />
              <h3 className="font-extrabold text-base uppercase tracking-tight text-black">
                Monthly Borrowing Volume
              </h3>
            </div>
            <span className="text-xs font-mono font-bold bg-[#FFE566] px-2 py-0.5 border border-black rounded">
              Last 6 Months
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyTrends || []}>
                <XAxis dataKey="month" stroke="#000" fontSize={12} fontWeight={700} />
                <YAxis stroke="#000" fontSize={12} fontWeight={700} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF5',
                    border: '2px solid #000',
                    borderRadius: '4px',
                    boxShadow: '3px 3px 0px #000',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="count" fill="#4169FF" stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[5px_5px_0px_#000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#FF7B72]" />
              <h3 className="font-extrabold text-base uppercase tracking-tight text-black">
                Catalog by Genre
              </h3>
            </div>
            <Link
              href="/categories"
              className="text-xs font-mono font-bold hover:underline flex items-center gap-0.5"
            >
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={35}
                  dataKey="value"
                  nameKey="name"
                  stroke="#000"
                  strokeWidth={2}
                  label={(entry) => entry.name}
                >
                  {(data?.categoryDistribution || []).map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF5',
                    border: '2px solid #000',
                    borderRadius: '4px',
                    boxShadow: '3px 3px 0px #000',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Bottom Grid: Recent Activity & Overdue Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Borrowing Activity */}
        <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[5px_5px_0px_#000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-black" />
              <h3 className="font-extrabold text-base uppercase tracking-tight text-black">
                Recent Circulation Activity
              </h3>
            </div>
            <Link
              href="/history"
              className="text-xs font-mono font-bold hover:underline flex items-center gap-0.5"
            >
              View History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FFE566] border-b-2 border-black font-extrabold uppercase font-mono">
                <tr>
                  <th className="p-2 border-r border-black">Book</th>
                  <th className="p-2 border-r border-black">Member</th>
                  <th className="p-2 border-r border-black">Due Date</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20 font-medium">
                {data?.recentActivity && data.recentActivity.length > 0 ? (
                  data.recentActivity.map((act: any) => (
                    <tr key={act.loan_id} className="hover:bg-[#FFFDF5]">
                      <td className="p-2 font-bold text-black border-r border-black/20 max-w-[160px] truncate">
                        {act.title}
                      </td>
                      <td className="p-2 font-bold text-black border-r border-black/20">
                        {act.full_name}
                      </td>
                      <td className="p-2 font-mono font-bold text-black border-r border-black/20">
                        {act.due_date}
                      </td>
                      <td className="p-2">
                        {act.status === 'returned' && (
                          <span className="badge badge-green text-[10px]">Returned</span>
                        )}
                        {act.status === 'active' && (
                          <span className="badge badge-yellow text-[10px]">Active</span>
                        )}
                        {act.status === 'overdue' && (
                          <span className="badge badge-coral text-[10px]">Overdue</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center font-mono text-black/50">
                      No recent activity recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overdue Loans List */}
        <div className="bg-white border-[3px] border-black rounded-lg p-5 shadow-[5px_5px_0px_#000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF7B72]" />
              <h3 className="font-extrabold text-base uppercase tracking-tight text-black">
                Overdue Books Watchlist
              </h3>
            </div>
            <Link
              href="/history?status=overdue"
              className="text-xs font-mono font-bold text-[#FF7B72] hover:underline flex items-center gap-0.5"
            >
              Resolve <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.overdueList && data.overdueList.length > 0 ? (
              data.overdueList.map((item: any) => (
                <div
                  key={item.loan_id}
                  className="p-3 bg-red-50 border-2 border-red-400 rounded-md flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-black leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-black/70 font-medium">
                      Patron: <span className="font-bold">{item.full_name}</span> • Due:{' '}
                      <span className="font-mono">{item.due_date}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-black bg-red-500 text-white px-2 py-0.5 rounded border border-black inline-block">
                      +{item.days_overdue} days
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#B8F28B]/20 border-2 border-[#B8F28B] rounded-md font-mono text-xs font-bold text-black">
                🎉 Excellent! No loans are currently overdue.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
