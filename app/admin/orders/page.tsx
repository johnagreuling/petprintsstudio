'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  session_id: string;
  printify_order_id: string | null;
  stripe_payment_id: string | null;
  customer_email: string;
  customer_name: string;
  product_type: string;
  product_name: string;
  quantity: number;
  subtotal_cents: number;
  status: string;
  created_at: string;
  updated_at: string;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15' },
  paid: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  processing: { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' },
  fulfilled: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
  shipped: { bg: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
};

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
  button: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '8px 16px',
    color: '#F5F0E8',
    fontSize: '14px',
    cursor: 'pointer',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '24px',
  },
  statLabel: {
    color: '#71717a',
    fontSize: '14px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    marginTop: '4px',
  },
  filters: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    textTransform: 'capitalize' as const,
  },
  tableCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px 16px',
    color: '#71717a',
    fontWeight: 500,
    fontSize: '14px',
    background: 'rgba(39,39,42,0.5)',
  },
  td: {
    padding: '12px 16px',
    borderTop: '1px solid #27272a',
    fontSize: '14px',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center' as const,
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'capitalize' as const,
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard?section=recent-orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, [filter]);
  
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);
  
  const totalRevenue = orders.reduce((sum, o) => 
    ['paid', 'fulfilled', 'shipped'].includes(o.status) ? sum + o.subtotal_cents : sum, 0
  );
  const completedOrders = orders.filter(o => ['paid', 'fulfilled', 'shipped'].includes(o.status)).length;
  
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoEmoji}>🐾</span>
            <div>
              <div style={styles.logoText}>Pet Prints Studio</div>
              <div style={styles.logoSub}>Orders</div>
            </div>
          </div>
          <button onClick={fetchOrders} style={styles.button}>↻ Refresh</button>
        </div>
      </header>
      
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <Link href="/admin" style={styles.navLink}>Dashboard</Link>
          <Link href="/admin/sessions" style={styles.navLink}>Sessions</Link>
          <Link href="/admin/orders" style={styles.navLinkActive}>Orders</Link>
        </div>
      </nav>
      
      <main style={styles.main}>
        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Orders</p>
            <p style={styles.statValue}>{orders.length}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Completed</p>
            <p style={{ ...styles.statValue, color: '#22c55e' }}>{completedOrders}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Revenue</p>
            <p style={{ ...styles.statValue, color: '#10b981' }}>{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        
        {/* Filters */}
        <div style={styles.filters}>
          {['all', 'pending', 'paid', 'processing', 'fulfilled', 'shipped', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                ...styles.filterBtn,
                background: filter === status ? '#D4AF37' : '#27272a',
                color: filter === status ? '#0A0A0A' : '#a1a1aa',
              }}
            >
              {status}
            </button>
          ))}
        </div>
        
        {/* Orders Table */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>
              <p style={{ color: '#71717a' }}>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>📦</p>
              <p style={{ color: '#a1a1aa' }}>No orders yet</p>
              <p style={{ color: '#52525b', fontSize: '14px' }}>Orders will appear here after customers complete purchases</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const statusStyle = STATUS_COLORS[order.status] || { bg: '#27272a', color: '#a1a1aa' };
                  return (
                    <tr key={order.id}>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'monospace', color: '#71717a' }}>#{order.id}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 500 }}>{order.customer_name || 'Unknown'}</div>
                        <div style={{ color: '#52525b', fontSize: '13px' }}>{order.customer_email}</div>
                      </td>
                      <td style={styles.td}>
                        <div>{order.product_name}</div>
                        <div style={{ color: '#52525b', fontSize: '13px' }}>Qty: {order.quantity}</div>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>
                        {formatCurrency(order.subtotal_cents)}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: '#71717a' }}>
                        {formatDateTime(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
