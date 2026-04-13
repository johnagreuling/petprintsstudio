'use client';
import { useState, useEffect } from 'react';

interface StyleData {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gptPrompt: string;
  sampleImageUrl: string | null;
}

export default function AdminStyles() {
  const [styles, setStyles] = useState<StyleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<StyleData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetch('/api/admin/styles')
      .then(res => res.json())
      .then(data => {
        setStyles(data.styles || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load styles:', err);
        setLoading(false);
      });
  }, []);

  const copyToClipboard = (text: string, styleId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(styleId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStyles = styles.filter(s => 
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#f5f0e8',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #666; }
        .style-card {
          background: #141414;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }
        .style-card:hover {
          border-color: #c9a84c;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .style-card.selected {
          border-color: #c9a84c;
          box-shadow: 0 0 0 2px rgba(201,168,76,0.3);
        }
        .btn {
          background: #222;
          border: 1px solid #333;
          color: #f5f0e8;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn:hover { background: #333; border-color: #444; }
        .btn-gold { background: #c9a84c; color: #0a0a0a; border-color: #c9a84c; font-weight: 600; }
        .btn-gold:hover { background: #d4b85c; }
        .btn-success { background: #22c55e; color: #fff; border-color: #22c55e; }
        .search-input {
          background: #141414;
          border: 1px solid #2a2a2a;
          color: #f5f0e8;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 15px;
          width: 100%;
          outline: none;
        }
        .search-input:focus { border-color: #c9a84c; }
        .search-input::placeholder { color: #555; }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 1000;
          padding: 40px;
          overflow-y: auto;
        }
        .prompt-box {
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 16px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 12px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
          color: #a0a0a0;
          max-height: 400px;
          overflow-y: auto;
          position: relative;
        }
        .prompt-box .section-header {
          color: #c9a84c;
          font-weight: 600;
        }
        .tag {
          display: inline-block;
          background: #1a1a1a;
          color: #c9a84c;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        a { color: #c9a84c; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* Header */}
      <header style={{
        background: '#111',
        borderBottom: '1px solid #222',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🎨</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>Style Manager</div>
              <div style={{ fontSize: 12, color: '#666' }}>{styles.length} styles configured</div>
            </div>
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Filter styles..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ maxWidth: 300 }}
          />

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <a href="/admin" className="btn">← Dashboard</a>
            <a href="/admin/sessions" className="btn">Sessions</a>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#666' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            Loading styles...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {filteredStyles.map(style => (
              <div
                key={style.id}
                className={`style-card ${selectedStyle?.id === style.id ? 'selected' : ''}`}
                onClick={() => setSelectedStyle(style)}
              >
                {/* Sample Image */}
                <div style={{
                  aspectRatio: '1',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {style.sampleImageUrl ? (
                    <img
                      src={style.sampleImageUrl}
                      alt={style.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#444' }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>{style.emoji}</div>
                      <div style={{ fontSize: 12 }}>No sample yet</div>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(0,0,0,0.7)',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 20,
                  }}>
                    {style.emoji}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{style.name}</h3>
                    <span className="tag">{style.id}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5, margin: 0 }}>
                    {style.description}
                  </p>
                </div>

                {/* Quick Actions */}
                <div style={{
                  padding: '12px 18px',
                  borderTop: '1px solid #222',
                  display: 'flex',
                  gap: 8,
                }}>
                  <button
                    className={`btn ${copiedId === style.id ? 'btn-success' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(style.gptPrompt, style.id);
                    }}
                    style={{ flex: 1 }}
                  >
                    {copiedId === style.id ? '✓ Copied!' : '📋 Copy Prompt'}
                  </button>
                  <button
                    className="btn btn-gold"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStyle(style);
                    }}
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredStyles.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div>No styles match "{searchFilter}"</div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedStyle && (
        <div className="modal-overlay" onClick={() => setSelectedStyle(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: 16,
              maxWidth: 900,
              width: '100%',
              marginTop: 20,
              marginBottom: 40,
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #222',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{selectedStyle.emoji}</span>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{selectedStyle.name}</h2>
                  <span className="tag" style={{ marginTop: 6 }}>{selectedStyle.id}</span>
                </div>
              </div>
              <button
                className="btn"
                onClick={() => setSelectedStyle(null)}
                style={{ fontSize: 18, padding: '8px 14px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0 }}>
              {/* Left: Image */}
              <div style={{
                borderRight: '1px solid #222',
                padding: 20,
              }}>
                <div style={{
                  aspectRatio: '1',
                  background: '#0a0a0a',
                  borderRadius: 8,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedStyle.sampleImageUrl ? (
                    <img
                      src={selectedStyle.sampleImageUrl}
                      alt={selectedStyle.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#444' }}>
                      <div style={{ fontSize: 64 }}>{selectedStyle.emoji}</div>
                      <div style={{ fontSize: 13, marginTop: 12 }}>No sample image</div>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginTop: 16 }}>
                  {selectedStyle.description}
                </p>
                {selectedStyle.sampleImageUrl && (
                  <a
                    href={selectedStyle.sampleImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                  >
                    Open Full Image ↗
                  </a>
                )}
              </div>

              {/* Right: Prompt */}
              <div style={{ padding: 20 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#c9a84c', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    GPT Image Prompt
                  </h4>
                  <button
                    className={`btn ${copiedId === selectedStyle.id + '-modal' ? 'btn-success' : 'btn-gold'}`}
                    onClick={() => copyToClipboard(selectedStyle.gptPrompt, selectedStyle.id + '-modal')}
                  >
                    {copiedId === selectedStyle.id + '-modal' ? '✓ Copied!' : '📋 Copy Full Prompt'}
                  </button>
                </div>

                <div className="prompt-box">
                  {selectedStyle.gptPrompt.split('\n').map((line, i) => {
                    // Highlight section headers
                    if (line.match(/^[A-Z][A-Z\s]+$/) || line.match(/^(STYLE|COMPOSITION|BACKGROUND|PAINT SURFACE|SETTING|COLOR PALETTE|CONSTRAINTS|SUBJECT IDENTITY|PROFESSIONAL PORTRAIT FRAMING)/)) {
                      return <div key={i} className="section-header">{line}</div>;
                    }
                    // Highlight constraint bullets
                    if (line.startsWith('- ')) {
                      return <div key={i} style={{ color: '#ef4444' }}>{line}</div>;
                    }
                    return <div key={i}>{line || '\n'}</div>;
                  })}
                </div>

                <div style={{
                  marginTop: 16,
                  padding: 12,
                  background: '#0a0a0a',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#666',
                }}>
                  <strong style={{ color: '#888' }}>Prompt length:</strong> {selectedStyle.gptPrompt.length.toLocaleString()} characters
                  &nbsp;&nbsp;|&nbsp;&nbsp;
                  <strong style={{ color: '#888' }}>~Tokens:</strong> {Math.round(selectedStyle.gptPrompt.length / 4).toLocaleString()}
                </div>

                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: 8,
                }}>
                  <h5 style={{ fontSize: 12, fontWeight: 600, color: '#c9a84c', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    💡 To Refine This Prompt
                  </h5>
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#888', lineHeight: 1.7 }}>
                    <li>Click "Copy Full Prompt" above</li>
                    <li>Paste into ChatGPT or Claude to iterate</li>
                    <li>Test in OpenAI Playground with an image</li>
                    <li>Update in <code style={{ background: '#222', padding: '2px 6px', borderRadius: 3 }}>/api/generate/route.ts</code></li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
