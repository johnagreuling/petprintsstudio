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

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  processing: 'bg-blue-500/20 text-blue-400',
  fulfilled: 'bg-emerald-500/20 text-emerald-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/admin/dashboard?section=recent-orders'
        : `/api/admin/orders?status=${filter}`;
      const res = await fetch(url);
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
  
  // Calculate stats
  const totalRevenue = orders.reduce((sum, o) => 
    ['paid', 'fulfilled', 'shipped'].includes(o.status) ? sum + o.subtotal_cents : sum, 0
  );
  const completedOrders = orders.filter(o => ['paid', 'fulfilled', 'shipped'].includes(o.status)).length;
  
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
                <p className="text-zinc-500 text-sm">Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchOrders}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm hover:bg-zinc-700"
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <Link href="/admin" className="px-4 py-3 text-zinc-400 hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/sessions" className="px-4 py-3 text-zinc-400 hover:text-white">
              Sessions
            </Link>
            <Link href="/admin/orders" className="px-4 py-3 text-amber-400 border-b-2 border-amber-400 font-medium">
              Orders
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm">Total Orders</p>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-400">{completedOrders}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm">Revenue</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'paid', 'processing', 'fulfilled', 'shipped', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize ${
                filter === status 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        {/* Orders Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">📦</p>
              <p className="text-zinc-400">No orders yet</p>
              <p className="text-zinc-500 text-sm">Orders will appear here after customers complete purchases</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Order</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Customer</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Product</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Amount</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-zinc-400">#{order.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{order.customer_name || 'Unknown'}</div>
                      <div className="text-zinc-500 text-sm">{order.customer_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{order.product_name}</div>
                      <div className="text-zinc-500 text-sm">Qty: {order.quantity}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(order.subtotal_cents)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-zinc-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-sm">
                      {formatDateTime(order.created_at)}
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
