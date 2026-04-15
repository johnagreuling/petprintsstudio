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

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0A0A0A',
    color: '#F5F0E8',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  header: {
    borderBottom: '1px solid #27272a',
    background: '#111',
    padding: '16px 24px',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoEmoji: {
    fontSize: '28px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 700,
  },
  logoSub: {
    fontSize: '13px',
    color: '#71717a',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  select: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#F5F0E8',
    fontSize: '14px',
  },
  button: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '8px 16px',
    color: '#F5F0E8',
    fontSize: '14px',
    cursor: 'pointer',
  },
  buttonPrimary: {
    background: '#D4AF37',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    color: '#0A0A0A',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  nav: {
    borderBottom: '1px solid #27272a',
    background: 'rgba(17,17,17,0.5)',
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    gap: '4px',
    padding: '0 24px',
  },
  navLink: {
    padding: '12px 16px',
    color: '#71717a',
    textDecoration: 'none',
    fontSize: '14px',
  },
  navLinkActive: {
    padding: '12px 16px',
    color: '#D4AF37',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    borderBottom: '2px solid #D4AF37',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  kpiCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '24px',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kpiLabel: {
    color: '#71717a',
    fontSize: '14px',
    fontWeight: 500,
  },
  kpiValue: {
    fontSize: '32px',
    fontWeight: 700,
    marginTop: '4px',
  },
  kpiSub: {
    color: '#52525b',
    fontSize: '13px',
    marginTop: '4px',
  },
  kpiIcon: {
    fontSize: '28px',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  chartCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '24px',
  },
  chartTitle: {
    color: '#71717a',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '16px',
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    height: '64px',
  },
  tableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  tableCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '24px',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  tableTitle: {
    fontWeight: 600,
    fontSize: '16px',
  },
  tableLink: {
    color: '#D4AF37',
    fontSize: '14px',
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '8px 12px',
    color: '#71717a',
    fontWeight: 500,
    borderBottom: '1px solid #27272a',
  },
  td: {
    padding: '8px 12px',
    color: '#a1a1aa',
    borderBottom: '1px solid rgba(39,39,42,0.5)',
  },
  emptyState: {
    color: '#52525b',
    fontSize: '14px',
    padding: '16px',
    textAlign: 'center' as const,
  },
  footer: {
    textAlign: 'center' as const,
    color: '#52525b',
    fontSize: '13px',
    marginTop: '32px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0A0A0A',
    color: '#F5F0E8',
  },
};

function MiniBarChart({ data, valueKey, color = '#D4AF37' }: { 
  data: Array<Record<string, string | number>>; 
  valueKey: string; 
  color?: string;
}) {
  if (!data || data.length === 0) return <div style={styles.emptyState}>No data yet</div>;
  
  const values = data.map(d => parseFloat(String(d[valueKey])) || 0);
  const max = Math.max(...values, 1);
  
  return (
    <div style={styles.chartBars}>
      {data.slice(-14).map((d, i) => (
        <div 
          key={i}
          style={{ 
            flex: 1,
            borderRadius: '3px 3px 0 0',
            height: `${Math.max((parseFloat(String(d[valueKey])) || 0) / max * 100, 3)}%`,
            backgroundColor: color,
            transition: 'all 0.2s',
          }}
          title={`${d.date}: ${d[valueKey]}`}
        />
      ))}
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
      <div style={styles.loading}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⚙️</div>
          <p style={{ color: '#71717a' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error && !data) {
    return (
      <div style={styles.loading}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: '20px', marginBottom: '16px' }}>❌ {error}</p>
          <button onClick={fetchData} style={styles.button}>Retry</button>
        </div>
      </div>
    );
  }
  
  const stats = data?.stats;
  const charts = data?.charts;
  const tables = data?.tables;
  
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoEmoji}>🐾</span>
            <div>
              <div style={styles.logoText}>Pet Prints Studio</div>
              <div style={styles.logoSub}>Admin Dashboard</div>
            </div>
          </div>
          <div style={styles.headerActions}>
            <select 
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              style={styles.select}
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button onClick={fetchData} style={styles.button}>↻ Refresh</button>
            <Link href="/" style={styles.buttonPrimary}>View Site →</Link>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <Link href="/admin" style={styles.navLinkActive}>Dashboard</Link>
          <Link href="/admin/sessions" style={styles.navLink}>Sessions</Link>
          <Link href="/admin/orders" style={styles.navLink}>Orders</Link>
          <Link href="/admin/direct-order" style={styles.navLink}>📧 Direct Order</Link>
          <Link href="/admin/styles" style={styles.navLink}>🎨 Styles</Link>
        </div>
      </nav>
      
      <main style={styles.main}>
        {/* KPI Cards */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <div>
                <p style={styles.kpiLabel}>Total Revenue</p>
                <p style={styles.kpiValue}>{formatCurrency(stats?.orders.revenueCents || 0)}</p>
                <p style={styles.kpiSub}>{stats?.orders.completed || 0} orders completed</p>
              </div>
              <span style={styles.kpiIcon}>💰</span>
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <div>
                <p style={styles.kpiLabel}>API Spend</p>
                <p style={styles.kpiValue}>{formatCurrency(stats?.api.totalSpendCents || 0)}</p>
                <p style={styles.kpiSub}>{stats?.api.totalImages || 0} images generated</p>
              </div>
              <span style={styles.kpiIcon}>🤖</span>
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <div>
                <p style={styles.kpiLabel}>Visitors</p>
                <p style={styles.kpiValue}>{stats?.traffic.visitors?.toLocaleString() || '0'}</p>
                <p style={styles.kpiSub}>{stats?.traffic.views?.toLocaleString() || '0'} page views</p>
              </div>
              <span style={styles.kpiIcon}>👥</span>
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <div>
                <p style={styles.kpiLabel}>Conversion Rate</p>
                <p style={styles.kpiValue}>{stats?.conversionRate || '0'}%</p>
                <p style={styles.kpiSub}>{stats?.sessions.total || 0} total sessions</p>
              </div>
              <span style={styles.kpiIcon}>📈</span>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div style={styles.chartGrid}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Daily Revenue</h3>
            <MiniBarChart data={charts?.dailyRevenue || []} valueKey="revenue_cents" color="#22c55e" />
          </div>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>API Spend</h3>
            <MiniBarChart data={charts?.dailyApiSpend || []} valueKey="cost_cents" color="#f59e0b" />
          </div>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Site Traffic</h3>
            <MiniBarChart data={charts?.dailyTraffic || []} valueKey="visitors" color="#3b82f6" />
          </div>
        </div>
        
        {/* Tables */}
        <div style={styles.tableGrid}>
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Recent Sessions</h3>
              <Link href="/admin/sessions" style={styles.tableLink}>View All →</Link>
            </div>
            {(!tables?.recentSessions || tables.recentSessions.length === 0) ? (
              <div style={styles.emptyState}>No sessions yet</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Pet</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Images</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.recentSessions.map((s, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{s.pet_name || 'Unknown'}</td>
                      <td style={styles.td}>{s.customer_last_name || '-'}</td>
                      <td style={styles.td}>{s.images?.length || 0}</td>
                      <td style={styles.td}>{formatDateTime(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Recent Orders</h3>
              <Link href="/admin/orders" style={styles.tableLink}>View All →</Link>
            </div>
            {(!tables?.recentOrders || tables.recentOrders.length === 0) ? (
              <div style={styles.emptyState}>No orders yet</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.recentOrders.map((o, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{o.customer_name || 'Unknown'}</td>
                      <td style={styles.td}>{o.product_name}</td>
                      <td style={styles.td}>{formatCurrency(o.subtotal_cents)}</td>
                      <td style={styles.td}>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Analytics Grid */}
        <div style={{ ...styles.tableGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div style={styles.tableCard}>
            <h3 style={{ ...styles.tableTitle, marginBottom: '16px' }}>Top Pages</h3>
            {(!tables?.topPages || tables.topPages.length === 0) ? (
              <div style={styles.emptyState}>No page views yet</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Page</th>
                    <th style={styles.th}>Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.topPages.map((p, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{p.path}</td>
                      <td style={styles.td}>{p.visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div style={styles.tableCard}>
            <h3 style={{ ...styles.tableTitle, marginBottom: '16px' }}>Traffic Sources</h3>
            {(!tables?.referrers || tables.referrers.length === 0) ? (
              <div style={styles.emptyState}>No referrer data yet</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Source</th>
                    <th style={styles.th}>Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.referrers.map((r, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{r.referrer}</td>
                      <td style={styles.td}>{r.visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div style={styles.tableCard}>
            <h3 style={{ ...styles.tableTitle, marginBottom: '16px' }}>Visitor Locations</h3>
            {(!tables?.locations || tables.locations.length === 0) ? (
              <div style={styles.emptyState}>No location data yet</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Country</th>
                    <th style={styles.th}>Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.locations.map((l, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{l.country}</td>
                      <td style={styles.td}>{l.visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <div style={styles.footer}>
          Last updated: {data?.meta.generatedAt ? formatDateTime(data.meta.generatedAt) : 'Never'}
        </div>
      </main>
    </div>
  );
}
