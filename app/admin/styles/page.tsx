'use client';
import { useState, useEffect } from 'react';

interface StyleData {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  version: number;
  gptPrompt: string;
  technique: string;
  background: string;
  lighting: string;
  colorPalette: string;
  mood: string;
  paintSurface: string;
  preferredFraming: string;
  forbiddenTraits: string[];
  styleConstraints: string[];
  blocks: {
    identity: string;
    composition: string;
    style: string;
    environment: string;
    output: string;
    constraints: string;
  };
  sampleImageUrl: string | null;
}

interface CategoryData {
  id: string;
  name: string;
  description: string;
  emoji: string;
  styleCount: number;
}

export default function AdminStyles() {
  const [styles, setStyles] = useState<StyleData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<StyleData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeBlock, setActiveBlock] = useState<string>('full');

  useEffect(() => {
    fetch('/api/admin/styles')
      .then(res => res.json())
      .then(data => {
        setStyles(data.styles || []);
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load styles:', err);
        setLoading(false);
      });
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStyles = styles.filter(s => {
    const matchesSearch = !searchFilter ||
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = !activeCategory || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const CATEGORY_COLORS: Record<string, string> = {
    classic_portraits: '#c9a84c',
    painterly_fine_art: '#a855f7',
    golden_hour_nature: '#f59e0b',
    lifestyle_story: '#3b82f6',
    pop_modern: '#ef4444',
  };

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
          max-height: 500px;
          overflow-y: auto;
        }
        .prompt-box .section-header {
          color: #c9a84c;
          font-weight: 600;
        }
        .tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cat-pill {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          border: 1px solid #333;
          background: #141414;
          color: #888;
          transition: all 0.15s;
        }
        .cat-pill:hover { border-color: #555; color: #f5f0e8; }
        .cat-pill.active { border-color: currentColor; color: #f5f0e8; }
        .block-tab {
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          border: 1px solid transparent;
          background: transparent;
          color: #666;
          transition: all 0.15s;
        }
        .block-tab:hover { color: #f5f0e8; }
        .block-tab.active { background: #222; border-color: #333; color: #c9a84c; }
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
            <span style={{ fontSize: 28 }}>ð¨</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>Portrait Engine v2.0</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {styles.length} styles &middot; {categories.length} categories &middot; 1024&times;1536 &middot; quality:high
              </div>
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
            <a href="/admin" className="btn">&larr; Dashboard</a>
            <a href="/admin/sessions" className="btn">Sessions</a>
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          className={`cat-pill ${!activeCategory ? 'active' : ''}`}
          onClick={() => setActiveCategory(null)}
          style={!activeCategory ? { borderColor: '#c9a84c', color: '#f5f0e8' } : {}}
        >
          All ({styles.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            style={activeCategory === cat.id ? { borderColor: CATEGORY_COLORS[cat.id] || '#c9a84c', color: '#f5f0e8' } : {}}
          >
            {cat.emoji} {cat.name} ({cat.styleCount})
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#666' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>&#9203;</div>
            Loading styles...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {filteredStyles.map(style => (
              <div
                key={style.id}
                className={`style-card ${selectedStyle?.id === style.id ? 'selected' : ''}`}
                onClick={() => { setSelectedStyle(style); setActiveBlock('full'); }}
              >
                {/* Sample Image */}
                <div style={{
                  aspectRatio: '2/3',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  maxHeight: 280,
                }}>
                  {style.sampleImageUrl ? (
                    <img
                      src={style.sampleImageUrl}
                      alt={style.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#333' }}>
                      <div style={{ fontSize: 56 }}>{style.emoji}</div>
                      <div style={{ fontSize: 11, marginTop: 8, color: '#444' }}>No sample yet</div>
                    </div>
                  )}
                  {/* Category badge */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(0,0,0,0.75)',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: CATEGORY_COLORS[style.category] || '#888',
                    borderLeft: `2px solid ${CATEGORY_COLORS[style.category] || '#444'}`,
                  }}>
                    {style.category.replace(/_/g, ' ')}
                  </div>
                  {/* Emoji badge */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.7)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 20,
                  }}>
                    {style.emoji}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{style.name}</h3>
                    <span className="tag" style={{ background: '#1a1a1a', color: '#888', fontSize: 10 }}>{style.id}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#777', lineHeight: 1.5, margin: 0 }}>
                    {style.description}
                  </p>
                </div>

                {/* Quick Actions */}
                <div style={{
                  padding: '10px 16px',
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
                    style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
                  >
                    {copiedId === style.id ? '&#10003; Copied!' : '&#128203; Copy Prompt'}
                  </button>
                  <button
                    className="btn btn-gold"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStyle(style);
                      setActiveBlock('full');
                    }}
                    style={{ fontSize: 12, padding: '8px 12px' }}
                  >
                    View &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredStyles.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#128269;</div>
            <div>No styles match &quot;{searchFilter}&quot;</div>
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
              maxWidth: 1000,
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
                  <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{selectedStyle.name}</h2>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span className="tag" style={{ background: '#1a1a1a', color: CATEGORY_COLORS[selectedStyle.category] || '#888' }}>
                      {selectedStyle.category.replace(/_/g, ' ')}
                    </span>
                    <span className="tag" style={{ background: '#1a1a1a', color: '#666' }}>
                      v{selectedStyle.version}
                    </span>
                    <span className="tag" style={{ background: '#1a1a1a', color: '#666' }}>
                      {selectedStyle.preferredFraming}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="btn"
                onClick={() => setSelectedStyle(null)}
                style={{ fontSize: 18, padding: '8px 14px' }}
              >
                &#10005;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0 }}>
              {/* Left: Image + Meta */}
              <div style={{ borderRight: '1px solid #222', padding: 20 }}>
                <div style={{
                  aspectRatio: '2/3',
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

                {/* Style metadata */}
                <div style={{ marginTop: 16, fontSize: 12, color: '#666', lineHeight: 2 }}>
                  <div><strong style={{ color: '#888' }}>Mood:</strong> {selectedStyle.mood}</div>
                  <div><strong style={{ color: '#888' }}>Framing:</strong> {selectedStyle.preferredFraming}</div>
                  <div><strong style={{ color: '#888' }}>Forbidden:</strong> {selectedStyle.forbiddenTraits.slice(0, 3).join(', ')}{selectedStyle.forbiddenTraits.length > 3 ? ` +${selectedStyle.forbiddenTraits.length - 3}` : ''}</div>
                </div>

                {selectedStyle.sampleImageUrl && (
                  <a
                    href={selectedStyle.sampleImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ marginTop: 12, width: '100%', justifyContent: 'center', fontSize: 12 }}
                  >
                    Open Full Image &#8599;
                  </a>
                )}
              </div>

              {/* Right: Prompt blocks */}
              <div style={{ padding: 20 }}>
                {/* Block tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                  {[
                    { key: 'full', label: 'Full Prompt' },
                    { key: 'identity', label: 'Identity' },
                    { key: 'composition', label: 'Composition' },
                    { key: 'style', label: 'Style' },
                    { key: 'environment', label: 'Environment' },
                    { key: 'output', label: 'Output' },
                    { key: 'constraints', label: 'Constraints' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`block-tab ${activeBlock === tab.key ? 'active' : ''}`}
                      onClick={() => setActiveBlock(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Copy button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button
                    className={`btn ${copiedId === selectedStyle.id + '-modal' ? 'btn-success' : 'btn-gold'}`}
                    onClick={() => {
                      const text = activeBlock === 'full'
                        ? selectedStyle.gptPrompt
                        : selectedStyle.blocks[activeBlock as keyof typeof selectedStyle.blocks] || '';
                      copyToClipboard(text, selectedStyle.id + '-modal');
                    }}
                    style={{ fontSize: 12, padding: '8px 14px' }}
                  >
                    {copiedId === selectedStyle.id + '-modal' ? '&#10003; Copied!' : `&#128203; Copy ${activeBlock === 'full' ? 'Full Prompt' : activeBlock}`}
                  </button>
                </div>

                {/* Prompt display */}
                <div className="prompt-box">
                  {(activeBlock === 'full'
                    ? selectedStyle.gptPrompt
                    : selectedStyle.blocks[activeBlock as keyof typeof selectedStyle.blocks] || ''
                  ).split('\n').map((line, i) => {
                    if (line.match(/^[A-Z][A-Z\s\u2014\u2713]+[:â]/) || line.match(/^(SUBJECT|COMPOSITION|STYLE|ENVIRONMENT|OUTPUT|HARD CONSTRAINTS|CRITICAL|DO NOT)/)) {
                      return <div key={i} className="section-header">{line}</div>;
                    }
                    if (line.startsWith('- ') || line.startsWith('\u2713')) {
                      return <div key={i} style={{ color: line.startsWith('- No') || line.startsWith('- Do not') ? '#ef4444' : '#22c55e' }}>{line}</div>;
                    }
                    return <div key={i}>{line || '\u00A0'}</div>;
                  })}
                </div>

                <div style={{
                  marginTop: 12,
                  padding: 10,
                  background: '#0a0a0a',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#555',
                  display: 'flex',
                  gap: 16,
                }}>
                  <span><strong style={{ color: '#777' }}>Chars:</strong> {selectedStyle.gptPrompt.length.toLocaleString()}</span>
                  <span><strong style={{ color: '#777' }}>~Tokens:</strong> {Math.round(selectedStyle.gptPrompt.length / 4).toLocaleString()}</span>
                  <span><strong style={{ color: '#777' }}>Style ID:</strong> {selectedStyle.id}</span>
                  <span><strong style={{ color: '#777' }}>Version:</strong> {selectedStyle.version}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
