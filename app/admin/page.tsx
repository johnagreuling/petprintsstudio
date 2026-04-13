'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  stats: {
    sessions: { total: number };
    api: { totalSpendCents: number; totalImages: number; totalCalls: number };
    orders: { total: number; completed: number; revenueCents: number };
    traffic: { views: number; visitors: number };
    conversionRate: string;
  };
  charts: {
    dailyApiSpend: Array<{ date: string; cost_cents: string; images: string }>;
    dailyRevenue: Array<{ date: string; revenue_cents: string; orders: string }>;
    dailyTraffic: Array<{ date: string; views: string; visitors: string }>;
  };
  tables: {
    topPages: Array<{ path: string; views: string; visitors: string }>;
    referrers: Array<{ referrer: string; visits: string; visitors: string }>;
    locations: Array<{ country: string; region: string; visitors: string }>;
    recentOrders: Array<{
      id: number;
      customer_name: string;
      product_name: string;
      subtotal_cents: number;
      status: string;
      created_at: string;
    }>;
    recentSessions: Array<{
      session_id: string;
      pet_name: string;
      customer_last_name: string;
      created_at: string;
      images: Array<unknown>;
    }>;
  };
  meta: { days: number; generatedAt: string };
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Simple bar chart component
function MiniBarChart({ data, valueKey, color = '#D4AF37' }: { 
  data: Array<Record<string, string | number>>; 
  valueKey: string; 
  color?: string;
}) {
  if (!data || data.length === 0) return <div className="text-zinc-500 text-sm">No data yet</div>;
  
  const values = data.map(d => parseFloat(String(d[valueKey])) || 0);
  const max = Math.max(...values, 1);
  
  return (
    <div className="flex items-end gap-1 h-16">
      {data.slice(-14).map((d, i) => (
        <div 
          key={i}
          className="flex-1 rounded-t transition-all hover:opacity-80"
          style={{ 
            height: `${(parseFloat(String(d[valueKey])) || 0) / max * 100}%`,
            backgroundColor: color,
            minHeight: '2px',
          }}
          title={`${d.date}: ${d[valueKey]}`}
        />
      ))}
    </div>
  );
}

// KPI Card component
function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon,
  trend,
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: string;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-sm mt-2 ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

// Table component
function DataTable({ 
  columns, 
  data,
  emptyMessage = 'No data available'
}: { 
  columns: Array<{ key: string; label: string; format?: (v: unknown) => string }>;
  data: Array<Record<string, unknown>>;
  emptyMessage?: string;
}) {
  if (!data || data.length === 0) {
    return <div className="text-zinc-500 text-sm py-4 text-center">{emptyMessage}</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            {columns.map(col => (
              <th key={col.key} className="text-left py-2 px-3 text-zinc-400 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
              {columns.map(col => (
                <td key={col.key} className="py-2 px-3 text-zinc-300">
                  {col.format ? col.format(row[col.key]) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard?days=${days}`);
      if (!res.ok) throw new Error('Failed to load dashboard');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [days]);
  
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error && !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">❌ {error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const stats = data?.stats;
  const charts = data?.charts;
  const tables = data?.tables;
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🐾</span>
              <div>
                <h1 className="text-xl font-bold">Pet Prints Studio</h1>
                <p className="text-zinc-500 text-sm">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <button 
                onClick={fetchData}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm hover:bg-zinc-700"
              >
                ↻ Refresh
              </button>
              <Link 
                href="/"
                className="px-3 py-1.5 bg-amber-600 rounded text-sm hover:bg-amber-500"
              >
                View Site →
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <Link href="/admin" className="px-4 py-3 text-amber-400 border-b-2 border-amber-400 font-medium">
              Dashboard
            </Link>
            <Link href="/admin/sessions" className="px-4 py-3 text-zinc-400 hover:text-white">
              Sessions
            </Link>
            <Link href="/admin/orders" className="px-4 py-3 text-zinc-400 hover:text-white">
              Orders
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(stats?.orders.revenueCents || 0)}
            subtitle={`${stats?.orders.completed || 0} orders completed`}
            icon="💰"
          />
          <KPICard
            title="API Spend"
            value={formatCurrency(stats?.api.totalSpendCents || 0)}
            subtitle={`${stats?.api.totalImages || 0} images generated`}
            icon="🤖"
          />
          <KPICard
            title="Visitors"
            value={stats?.traffic.visitors?.toLocaleString() || '0'}
            subtitle={`${stats?.traffic.views?.toLocaleString() || '0'} page views`}
            icon="👥"
          />
          <KPICard
            title="Conversion Rate"
            value={`${stats?.conversionRate || '0'}%`}
            subtitle={`${stats?.sessions.total || 0} total sessions`}
            icon="📈"
          />
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-zinc-400 text-sm font-medium mb-4">Daily Revenue</h3>
            <MiniBarChart data={charts?.dailyRevenue || []} valueKey="revenue_cents" color="#22c55e" />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-zinc-400 text-sm font-medium mb-4">API Spend</h3>
            <MiniBarChart data={charts?.dailyApiSpend || []} valueKey="cost_cents" color="#f59e0b" />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-zinc-400 text-sm font-medium mb-4">Site Traffic</h3>
            <MiniBarChart data={charts?.dailyTraffic || []} valueKey="visitors" color="#3b82f6" />
          </div>
        </div>
        
        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Sessions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Sessions</h3>
              <Link href="/admin/sessions" className="text-amber-400 text-sm hover:underline">
                View All →
              </Link>
            </div>
            <DataTable
              columns={[
                { key: 'pet_name', label: 'Pet' },
                { key: 'customer_last_name', label: 'Customer' },
                { key: 'images', label: 'Images', format: (v) => String((v as Array<unknown>)?.length || 0) },
                { key: 'created_at', label: 'Date', format: (v) => formatDateTime(String(v)) },
              ]}
              data={tables?.recentSessions || []}
              emptyMessage="No sessions yet"
            />
          </div>
          
          {/* Recent Orders */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Orders</h3>
              <Link href="/admin/orders" className="text-amber-400 text-sm hover:underline">
                View All →
              </Link>
            </div>
            <DataTable
              columns={[
                { key: 'customer_name', label: 'Customer' },
                { key: 'product_name', label: 'Product' },
                { key: 'subtotal_cents', label: 'Amount', format: (v) => formatCurrency(Number(v)) },
                { key: 'status', label: 'Status' },
              ]}
              data={tables?.recentOrders || []}
              emptyMessage="No orders yet"
            />
          </div>
        </div>
        
        {/* Traffic Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Top Pages</h3>
            <DataTable
              columns={[
                { key: 'path', label: 'Page' },
                { key: 'visitors', label: 'Visitors' },
              ]}
              data={tables?.topPages || []}
              emptyMessage="No page views yet"
            />
          </div>
          
          {/* Referrers */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Traffic Sources</h3>
            <DataTable
              columns={[
                { key: 'referrer', label: 'Source' },
                { key: 'visitors', label: 'Visitors' },
              ]}
              data={tables?.referrers || []}
              emptyMessage="No referrer data yet"
            />
          </div>
          
          {/* Locations */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Visitor Locations</h3>
            <DataTable
              columns={[
                { key: 'country', label: 'Country' },
                { key: 'visitors', label: 'Visitors' },
              ]}
              data={tables?.locations || []}
              emptyMessage="No location data yet"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-zinc-500 text-sm">
          Last updated: {data?.meta.generatedAt ? formatDateTime(data.meta.generatedAt) : 'Never'}
        </div>
      </main>
    </div>
  );
}
