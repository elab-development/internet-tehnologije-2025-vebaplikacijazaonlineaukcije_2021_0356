import { useEffect } from 'react';
import {
  Users,
  Gavel,
  ShoppingCart,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { useAdminStatsStore } from '../../stores/adminStatsStore';

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2);
}

const COLORS = ['#7c3aed', '#6366f1', '#8b5cf6', '#a78bfa'];

export default function OverviewTab() {
  const { stats, isLoading, error, fetchStats } = useAdminStatsStore();

  useEffect(() => {
    fetchStats(30);
    // eslint-disable-next-line
  }, []);

  if (isLoading && !stats)
    return <div className='text-sm text-slate-600'>Loading…</div>;

  if (error)
    return (
      <div className='rounded-xl bg-red-50 p-3 text-sm text-red-700'>
        {error}
      </div>
    );

  const k = stats?.kpis || {};
  const charts = stats?.charts || {};

  return (
    <div className='space-y-6'>
      {/* KPI CARDS */}
      <div className='grid gap-4 md:grid-cols-4'>
        <KpiCard icon={Users} label='Users' value={k.usersTotal} />
        <KpiCard
          icon={Gavel}
          label='Active Auctions'
          value={k.activeAuctions}
        />
        <KpiCard
          icon={ShoppingCart}
          label='Orders (30d)'
          value={k.ordersInRange}
        />
        <KpiCard
          icon={DollarSign}
          label='Revenue (30d)'
          value={`$${formatMoney(k.revenueInRange)}`}
        />
      </div>

      {/* LINE CHARTS */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <ChartCard title='Bids per day'>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={charts.bidsPerDay || []}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='label' />
              <YAxis />
              <Tooltip />
              <Line
                type='monotone'
                dataKey='value'
                stroke='#7c3aed'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title='Orders per day'>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={charts.ordersPerDay || []}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='label' />
              <YAxis />
              <Tooltip />
              <Line
                type='monotone'
                dataKey='value'
                stroke='#6366f1'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* BAR + PIE */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <ChartCard title='Users by role'>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={charts.usersByRole || []}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='label' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='value' fill='#7c3aed' />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title='Auctions by status'>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={charts.auctionsByStatus || []}
                dataKey='value'
                nameKey='label'
                outerRadius={100}
                label
              >
                {(charts.auctionsByStatus || []).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* REFRESH BUTTON */}
      <div className='flex justify-end'>
        <button
          onClick={() => fetchStats(30)}
          className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800'
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
}

/* Reusable Components */

function KpiCard({ icon: Icon, label, value }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex items-center gap-2 text-slate-600'>
        <Icon size={16} />
        <span className='text-xs font-semibold uppercase tracking-wide'>
          {label}
        </span>
      </div>
      <div className='mt-2 text-2xl font-bold text-slate-900'>{value ?? 0}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='mb-3 text-sm font-semibold text-slate-900'>{title}</div>
      {children}
    </div>
  );
}