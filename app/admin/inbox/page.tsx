'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Email {
  id: string;
  type: string;
  to: string;
  subject: string;
  createdAt: string;
  status: string;
  customerName?: string | null;
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
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
  },
  subtitle: {
    color: '#71717a',
    fontSize: '14px',
    marginTop: '4px',
  },
  button: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '8px 16px',
    color: '#F5F0E8',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
  card: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #27272a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px 20px',
    color: '#71717a',
    fontSize: '13px',
    fontWeight: 500,
    borderBottom: '1px solid #27272a',
    background: '#111',
  },
  td: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(39,39,42,0.5)',
    fontSize: '14px',
  },
  emailRow: {
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  from: {
    fontWeight: 500,
    color: '#F5F0E8',
  },
  to: {
    color: '#a1a1aa',
    fontSize: '13px',
  },
  subject: {
    color: '#F5F0E8',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 500,
  },
  statusDelivered: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
  },
  statusSent: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
  },
  statusOpened: {
    background: 'rgba(168, 85, 247, 0.15)',
    color: '#a855f7',
  },
  statusClicked: {
    background: 'rgba(212, 175, 55, 0.15)',
    color: '#D4AF37',
  },
  statusBounced: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
  date: {
    color: '#71717a',
    fontSize: '13px',
    whiteSpace: 'nowrap' as const,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#71717a',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  loadingState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#71717a',
  },
  errorState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#ef4444',
  },
  statsRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
  },
  statCard: {
    flex: 1,
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
  },
  statLabel: {
    fontSize: '13px',
    color: '#71717a',
  },
  externalLink: {
    color: '#D4AF37',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStatusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === 'delivered') return styles.statusDelivered;
  if (s === 'opened') return styles.statusOpened;
  if (s === 'clicked') return styles.statusClicked;
  if (s === 'bounced' || s === 'failed') return styles.statusBounced;
  return styles.statusSent;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/emails?password=mason2024');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch emails');
      }
      
      setEmails(data.emails || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmails();
  }, []);
  
  // Calculate stats from emails
  const stats = {
    total: emails.length,
    orders: emails.filter(e => e.type === 'order').length,
    directOrders: emails.filter(e => e.type === 'direct_order').length,
    delivered: emails.filter(e => e.status === 'delivered' || e.status === 'shipped').length,
  };
  
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
          <a 
            href="https://resend.com/emails" 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.externalLink}
          >
            Open Resend Dashboard ↗
          </a>
        </div>
      </header>
      
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <Link href="/admin" style={styles.navLink}>Dashboard</Link>
          <Link href="/admin/sessions" style={styles.navLink}>Sessions</Link>
          <Link href="/admin/orders" style={styles.navLink}>Orders</Link>
          <Link href="/admin/direct-order" style={styles.navLink}>📧 Direct Order</Link>
          <Link href="/admin/inbox" style={styles.navLinkActive}>📬 Inbox</Link>
          <Link href="/admin/styles" style={styles.navLink}>🎨 Styles</Link>
        </div>
      </nav>
      
      <main style={styles.main}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>📬 Email Inbox</h1>
            <p style={styles.subtitle}>
              View all emails sent from orders@petprintsstudio.com
            </p>
          </div>
          <button onClick={fetchEmails} style={styles.button}>
            ↻ Refresh
          </button>
        </div>
        
        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)' }}>📤</div>
            <div>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Emails</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: 'rgba(34, 197, 94, 0.15)' }}>📦</div>
            <div>
              <div style={styles.statValue}>{stats.orders}</div>
              <div style={styles.statLabel}>Order Confirmations</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: 'rgba(168, 85, 247, 0.15)' }}>🎨</div>
            <div>
              <div style={styles.statValue}>{stats.directOrders}</div>
              <div style={styles.statLabel}>Direct Orders</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: 'rgba(212, 175, 55, 0.15)' }}>✅</div>
            <div>
              <div style={styles.statValue}>{stats.delivered}</div>
              <div style={styles.statLabel}>Delivered</div>
            </div>
          </div>
        </div>
        
        {/* Email List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <span>📧</span> Recent Emails
            </div>
            <span style={{ color: '#71717a', fontSize: '13px' }}>
              {emails.length} emails
            </span>
          </div>
          
          {loading ? (
            <div style={styles.loadingState}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
              <p>Loading emails...</p>
            </div>
          ) : error ? (
            <div style={styles.errorState}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
              <p>{error}</p>
              <p style={{ fontSize: '13px', marginTop: '8px', color: '#71717a' }}>
                Make sure your domain is verified in Resend
              </p>
              <button 
                onClick={fetchEmails} 
                style={{ ...styles.button, marginTop: '16px', display: 'inline-flex' }}
              >
                Try Again
              </button>
            </div>
          ) : emails.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p>No emails sent yet</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>
                Send your first email using Direct Order
              </p>
              <Link 
                href="/admin/direct-order" 
                style={{ ...styles.buttonPrimary, display: 'inline-block', marginTop: '16px' }}
              >
                Send Direct Order →
              </Link>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>To</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Sent</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr 
                    key={email.id} 
                    style={styles.emailRow}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={styles.td}>
                      <div style={styles.to}>{email.to}</div>
                      {email.customerName && (
                        <div style={{ fontSize: '12px', color: '#71717a' }}>{email.customerName}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.subject}>{email.subject || '(no subject)'}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ 
                        ...styles.statusBadge, 
                        background: email.type === 'order' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        color: email.type === 'order' ? '#3b82f6' : '#a855f7',
                      }}>
                        {email.type === 'order' ? '📦 Order' : '🎨 Direct'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, ...getStatusStyle(email.status) }}>
                        {email.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.date}>{formatDate(email.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
