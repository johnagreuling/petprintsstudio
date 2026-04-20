'use client';
import { useState, useEffect, useCallback } from 'react';

interface SessionImage {
  style_id: string;
  style_name: string;
  url: string;
  variant_index: number;
}

interface Session {
  id: number;
  session_id: string;
  created_at: string;
  customer_email: string;
  customer_last_name: string;
  pet_name: string;
  pet_type: string;
  images: SessionImage[];
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedImage, setSelectedImage] = useState<SessionImage | null>(null);
  const [orderImage, setOrderImage] = useState<SessionImage | null>(null);
  const [orderEmail, setOrderEmail] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderPetName, setOrderPetName] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [orderSending, setOrderSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderCheckoutLink, setOrderCheckoutLink] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [total, setTotal] = useState(0);

  const fetchSessions = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100');
      
      const res = await fetch(`/api/admin/sessions?${params}`);
      const data = await res.json();
      setSessions(data.sessions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions(search);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const groupImagesByStyle = (images: SessionImage[]) => {
    const grouped: Record<string, SessionImage[]> = {};
    images.forEach(img => {
      const key = img.style_name || img.style_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(img);
    });
    return grouped;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openOrderModal = (img: SessionImage) => {
    setOrderImage(img);
    setOrderEmail(selectedSession?.customer_email || '');
    setOrderPhone('');
    setOrderPetName(selectedSession?.pet_name || '');
    setOrderMessage('');
    setOrderSent(false);
    setOrderError('');
    setOrderCheckoutLink(`https://petprintsstudio.com/order/${encodeURIComponent(img.url)}`);
    setSelectedImage(null);
  };

  const sendOrderEmail = async () => {
    if (!orderImage) return;
    if (!orderEmail.trim() && !orderPhone.trim()) {
      setOrderError('Enter an email or phone number');
      return;
    }
    setOrderSending(true);
    setOrderError('');
    try {
      const res = await fetch('/api/admin/send-direct-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: orderImage.url,
          checkoutLink: orderCheckoutLink,
          customerEmail: orderEmail.trim(),
          customerPhone: orderPhone.trim(),
          petName: orderPetName.trim(),
          personalMessage: orderMessage.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Send failed');
      }
      setOrderSent(true);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setOrderSending(false);
    }
  };

  return (
    <div style={{ 
      background: '#1a1a1a', 
      color: '#f5f0e8', 
      minHeight: '100vh',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #2a2a2a; }
        ::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #777; }
        .session-card { 
          background: #242424; 
          border: 1px solid #333; 
          border-radius: 8px; 
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }
        .session-card:hover { 
          border-color: #c9a84c; 
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .session-card.selected {
          border-color: #c9a84c;
          box-shadow: 0 0 0 2px rgba(201,168,76,0.3);
        }
        .image-thumb {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .image-thumb:hover {
          transform: scale(1.05);
        }
        .btn {
          background: #333;
          border: 1px solid #444;
          color: #f5f0e8;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .btn:hover { background: #444; border-color: #555; }
        .btn-gold { background: #c9a84c; color: #1a1a1a; border-color: #c9a84c; font-weight: 600; }
        .btn-gold:hover { background: #d4b65c; }
        .search-input {
          background: #242424;
          border: 1px solid #333;
          color: #f5f0e8;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 15px;
          width: 100%;
          outline: none;
        }
        .search-input:focus { border-color: #c9a84c; }
        .search-input::placeholder { color: #666; }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 40px;
        }
        .modal-content {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          max-width: 95vw;
          max-height: 95vh;
          overflow: auto;
        }
        .tag {
          display: inline-block;
          background: #333;
          color: #c9a84c;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>

      {/* Header */}
      <header style={{ 
        background: '#141414', 
        borderBottom: '1px solid #333',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🐾</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Session Browser</div>
              <div style={{ fontSize: 12, color: '#666' }}>{total} total sessions</div>
            </div>
          </div>

          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 500 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search by pet name, last name, email, or session ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingRight: 100 }}
              />
              <button 
                type="submit" 
                className="btn btn-gold"
                style={{ position: 'absolute', right: 4, top: 4, bottom: 4 }}
              >
                Search
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className={`btn ${viewMode === 'grid' ? 'btn-gold' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </button>
            <button 
              className={`btn ${viewMode === 'list' ? 'btn-gold' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰ List
            </button>
          </div>

          <button className="btn" onClick={() => fetchSessions(search)}>
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>No sessions found</div>
            <div style={{ fontSize: 14 }}>Sessions will appear here after customers generate portraits</div>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20 
          }}>
            {sessions.map(session => (
              <div 
                key={session.session_id}
                className={`session-card ${selectedSession?.session_id === session.session_id ? 'selected' : ''}`}
                onClick={() => setSelectedSession(session)}
              >
                {/* Thumbnail Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 2,
                  background: '#333',
                  padding: 2
                }}>
                  {(session.images || []).slice(0, 8).map((img, i) => (
                    <img 
                      key={i}
                      src={img.url} 
                      alt={img.style_name}
                      style={{ 
                        width: '100%', 
                        aspectRatio: '1', 
                        objectFit: 'cover',
                        background: '#222'
                      }}
                      loading="lazy"
                    />
                  ))}
                  {(session.images || []).length > 8 && (
                    <div style={{ 
                      width: '100%', 
                      aspectRatio: '1', 
                      background: '#222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: '#888'
                    }}>
                      +{session.images.length - 7}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                      {session.pet_name || 'Unnamed Pet'}
                    </div>
                    <span className="tag">{session.pet_type || 'dog'}</span>
                  </div>
                  
                  {session.customer_last_name && (
                    <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>
                      {session.customer_last_name}
                    </div>
                  )}
                  
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                    {formatDate(session.created_at)}
                  </div>
                  
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>
                    {session.session_id.substring(0, 8)}...
                  </div>
                  
                  <div style={{ fontSize: 12, color: '#c9a84c', marginTop: 8 }}>
                    {(session.images || []).length} images
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div style={{ background: '#242424', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '60px 1fr 150px 120px 180px 100px',
              padding: '12px 16px',
              background: '#1a1a1a',
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#888'
            }}>
              <div></div>
              <div>Pet / Customer</div>
              <div>Session ID</div>
              <div>Images</div>
              <div>Date</div>
              <div>Actions</div>
            </div>
            {sessions.map(session => (
              <div 
                key={session.session_id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '60px 1fr 150px 120px 180px 100px',
                  padding: '12px 16px',
                  borderTop: '1px solid #333',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => setSelectedSession(session)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  {session.images?.[0] && (
                    <img 
                      src={session.images[0].url} 
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{session.pet_name || 'Unnamed'}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{session.customer_last_name || session.customer_email || '—'}</div>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#666' }}>
                  {session.session_id.substring(0, 12)}...
                </div>
                <div style={{ color: '#c9a84c' }}>
                  {(session.images || []).length} images
                </div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  {formatDate(session.created_at)}
                </div>
                <div>
                  <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }}>
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '90vw', maxWidth: 1200 }}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: '#1a1a1a',
              zIndex: 10
            }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
                  {selectedSession.pet_name || 'Unnamed Pet'}
                  <span className="tag" style={{ marginLeft: 12, verticalAlign: 'middle' }}>
                    {selectedSession.pet_type || 'dog'}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: '#888' }}>
                  {selectedSession.customer_last_name && `${selectedSession.customer_last_name} · `}
                  {formatDate(selectedSession.created_at)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button 
                  className="btn"
                  onClick={() => copyToClipboard(selectedSession.session_id)}
                >
                  📋 Copy Session ID
                </button>
                <button 
                  className="btn"
                  onClick={() => setSelectedSession(null)}
                  style={{ fontSize: 18, padding: '4px 12px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body - Images by Style */}
            <div style={{ padding: 24 }}>
              <div style={{ 
                fontSize: 12, 
                color: '#666', 
                marginBottom: 16,
                fontFamily: 'monospace',
                background: '#242424',
                padding: '8px 12px',
                borderRadius: 4,
                display: 'inline-block'
              }}>
                Session: {selectedSession.session_id}
              </div>

              {Object.entries(groupImagesByStyle(selectedSession.images || [])).map(([styleName, images]) => (
                <div key={styleName} style={{ marginBottom: 32 }}>
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    marginBottom: 12,
                    color: '#c9a84c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    {styleName} ({images.length})
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 12
                  }}>
                    {images.map((img, i) => (
                      <div 
                        key={i}
                        style={{ 
                          background: '#242424', 
                          borderRadius: 8, 
                          overflow: 'hidden',
                          border: '1px solid #333',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={img.url} 
                          alt={img.style_name}
                          className="image-thumb"
                          loading="lazy"
                        />
                        <div style={{ padding: '8px 10px', fontSize: 11, color: '#888' }}>
                          Variant {img.variant_index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {(!selectedSession.images || selectedSession.images.length === 0) && (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                  No images in this session
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Image Modal */}
      {selectedImage && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedImage(null)}
          style={{ background: 'rgba(0,0,0,0.95)' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <img 
              src={selectedImage.url} 
              alt={selectedImage.style_name}
              style={{ 
                maxWidth: '90vw', 
                maxHeight: '80vh', 
                borderRadius: 8,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            />
            <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                className="btn btn-gold"
                onClick={() => openOrderModal(selectedImage)}
              >
                📧 Send Order Email
              </button>
              <button 
                className="btn"
                onClick={() => window.open(selectedImage.url, '_blank')}
              >
                Open Full Size ↗
              </button>
              <button 
                className="btn"
                onClick={() => copyToClipboard(selectedImage.url)}
              >
                📋 Copy URL
              </button>
              <button 
                className="btn"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = selectedImage.url;
                  a.download = `${selectedImage.style_name}-${Date.now()}.png`;
                  a.click();
                }}
              >
                ⬇ Download
              </button>
              <button 
                className="btn"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </button>
            </div>
            <div style={{ marginTop: 16, color: '#888', fontSize: 14 }}>
              {selectedImage.style_name}
            </div>
          </div>
        </div>
      )}

      {/* Send Order Email Modal */}
      {orderImage && (
        <div
          className="modal-overlay"
          onClick={() => !orderSending && setOrderImage(null)}
          style={{ background: 'rgba(0,0,0,0.9)' }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '90vw', maxWidth: 720 }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>📧 Send Order Email</div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                  Direct-order link for this portrait · {orderImage.style_name}
                </div>
              </div>
              <button className="btn" onClick={() => setOrderImage(null)} disabled={orderSending} style={{ fontSize: 18, padding: '4px 12px' }}>✕</button>
            </div>

            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20 }}>
              <div>
                <img src={orderImage.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, border: '1px solid #333' }} />
                <div style={{ marginTop: 8, fontSize: 11, color: '#666' }}>Variant {orderImage.variant_index + 1}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer email</label>
                  <input type="email" value={orderEmail} onChange={(e) => setOrderEmail(e.target.value)} placeholder="customer@example.com" className="search-input" disabled={orderSending} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone (optional, for SMS)</label>
                  <input type="tel" value={orderPhone} onChange={(e) => setOrderPhone(e.target.value)} placeholder="+1 555 555 5555" className="search-input" disabled={orderSending} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pet name</label>
                  <input type="text" value={orderPetName} onChange={(e) => setOrderPetName(e.target.value)} placeholder="Mason" className="search-input" disabled={orderSending} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal message (optional)</label>
                  <textarea value={orderMessage} onChange={(e) => setOrderMessage(e.target.value)} placeholder="Hey Sarah — here's the portrait we talked about..." rows={3} className="search-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} disabled={orderSending} />
                </div>
                <div style={{ background: '#242424', border: '1px solid #333', borderRadius: 6, padding: '10px 12px', fontSize: 11, color: '#888', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  <div style={{ color: '#c9a84c', marginBottom: 4 }}>CHECKOUT LINK</div>
                  {orderCheckoutLink}
                </div>
                {orderError && (<div style={{ color: '#ff6b6b', fontSize: 13 }}>{orderError}</div>)}
                {orderSent && (<div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid #c9a84c', color: '#c9a84c', padding: '10px 12px', borderRadius: 6, fontSize: 13 }}>✓ Sent successfully</div>)}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="btn btn-gold" onClick={sendOrderEmail} disabled={orderSending || orderSent} style={{ flex: 1 }}>
                    {orderSending ? 'Sending…' : orderSent ? '✓ Sent' : 'Send Email'}
                  </button>
                  <button className="btn" onClick={() => copyToClipboard(orderCheckoutLink)} disabled={orderSending}>📋 Copy Link</button>
                  <button className="btn" onClick={() => setOrderImage(null)} disabled={orderSending}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
