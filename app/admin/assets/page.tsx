'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface BrandAsset {
  id: number;
  filename: string;
  url: string;
  r2_key: string;
  category: string;
  tags: string[];
  file_size_bytes: number;
  content_type: string | null;
  width: number | null;
  height: number | null;
  notes: string;
  uploaded_at: string;
}

const CATEGORIES = [
  { id: 'all',               label: 'All Assets',        emoji: '📁' },
  { id: 'hero',              label: 'Hero',              emoji: '⭐' },
  { id: 'lifestyle-canvas',  label: 'Canvas Lifestyle',  emoji: '🖼️' },
  { id: 'lifestyle-print',   label: 'Print Lifestyle',   emoji: '📄' },
  { id: 'lifestyle-apparel', label: 'Apparel',           emoji: '👕' },
  { id: 'lifestyle-home',    label: 'Home Goods',        emoji: '🏠' },
  { id: 'ugc',               label: 'Customer UGC',      emoji: '💛' },
  { id: 'logo',              label: 'Logos & Brand',     emoji: '✦' },
  { id: 'stock',             label: 'Stock Photos',      emoji: '📸' },
  { id: 'campaign',          label: 'Campaign',          emoji: '📣' },
  { id: 'uncategorized',     label: 'Uncategorized',     emoji: '❓' },
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function AdminAssets() {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ total: number; done: number } | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<BrandAsset | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/assets?${params}`);
      const data = await res.json();
      setAssets(data.assets || []);
      setCounts(data.counts || {});
    } catch (e) {
      console.error('Failed to fetch assets:', e);
    }
    setLoading(false);
  }, [currentCategory, search]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const uploadFile = async (file: File, category: string): Promise<void> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', category);
    const res = await fetch('/api/admin/assets', { method: 'POST', body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Upload failed (${res.status})`);
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    const uploadCategory = currentCategory === 'all' ? 'uncategorized' : currentCategory;
    setUploading(true);
    setUploadProgress({ total: list.length, done: 0 });
    let failed = 0;
    for (let i = 0; i < list.length; i++) {
      try {
        await uploadFile(list[i], uploadCategory);
      } catch (e) {
        console.error(`Failed on ${list[i].name}:`, e);
        failed++;
      }
      setUploadProgress({ total: list.length, done: i + 1 });
    }
    setUploading(false);
    setUploadProgress(null);
    if (failed > 0) alert(`${failed} of ${list.length} uploads failed. Check console.`);
    fetchAssets();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const copyUrl = (asset: BrandAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId((c) => c === asset.id ? null : c), 1500);
  };

  const deleteAsset = async (asset: BrandAsset) => {
    if (!confirm(`Delete "${asset.filename}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/assets/${asset.id}`, { method: 'DELETE' });
      setSelected(null);
      fetchAssets();
    } catch (e) {
      alert('Delete failed.');
      console.error(e);
    }
  };

  const updateAsset = async (
    asset: BrandAsset,
    updates: { category?: string; tags?: string[]; notes?: string }
  ) => {
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.asset) setSelected(data.asset);
      fetchAssets();
    } catch (e) {
      alert('Update failed.');
      console.error(e);
    }
  };

  return (
    <div style={S.shell}>
      {/* ─── Sidebar ─── */}
      <aside style={S.sidebar}>
        <div style={S.brandBar}>
          <Link href="/admin" style={S.back}>← Admin</Link>
          <div style={S.title}>Brand Assets</div>
        </div>

        <input
          type="search"
          placeholder="Search filename, tag, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={S.search}
        />

        <div style={S.catList}>
          {CATEGORIES.map((c) => {
            const n = c.id === 'all'
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : (counts[c.id] || 0);
            const active = currentCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCurrentCategory(c.id)}
                style={{ ...S.catBtn, ...(active ? S.catBtnActive : {}) }}
              >
                <span style={{ marginRight: 10 }}>{c.emoji}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{c.label}</span>
                <span style={S.catCount}>{n}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main style={S.main}>
        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{ ...S.drop, ...(isDragging ? S.dropActive : {}) }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          {uploading && uploadProgress ? (
            <div>
              <div style={S.dropTitle}>Uploading {uploadProgress.done} of {uploadProgress.total}…</div>
              <div style={S.progressWrap}>
                <div style={{ ...S.progressBar, width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }} />
              </div>
            </div>
          ) : (
            <>
              <div style={S.dropTitle}>📎 Drag files here, or click to browse</div>
              <div style={S.dropSub}>
                Images only · PNG · JPG · WEBP · Uploaded at full resolution to R2
                {currentCategory !== 'all' && <> · will save to <b style={{ color: '#C9A84C' }}>{CATEGORIES.find(c => c.id === currentCategory)?.label}</b></>}
              </div>
            </>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={S.empty}>Loading assets…</div>
        ) : assets.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 42, marginBottom: 12, opacity: 0.4 }}>📁</div>
            <div>No assets here yet.</div>
            <div style={{ fontSize: 13, marginTop: 8, opacity: 0.5 }}>Drop files above to add your first one.</div>
          </div>
        ) : (
          <div style={S.grid}>
            {assets.map((a) => (
              <div key={a.id} style={S.tile}>
                <div style={S.thumb} onClick={() => setSelected(a)}>
                  {/* Use a regular img here so admin always works regardless of next.config remotePatterns */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt={a.filename} style={S.thumbImg} loading="lazy" />
                </div>
                <div style={S.tileFoot}>
                  <div style={S.tileName} title={a.filename}>{a.filename}</div>
                  <div style={S.tileMeta}>
                    {a.width && a.height ? `${a.width}×${a.height} · ` : ''}{formatBytes(a.file_size_bytes)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyUrl(a); }}
                      style={{ ...S.tileBtn, color: copiedId === a.id ? '#6FCF97' : '#C9A84C' }}
                    >
                      {copiedId === a.id ? '✓ Copied' : 'Copy URL'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(a); }}
                      style={S.tileBtn}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ─── Lightbox / detail panel ─── */}
      {selected && <DetailPanel
        asset={selected}
        onClose={() => setSelected(null)}
        onCopy={() => copyUrl(selected)}
        onDelete={() => deleteAsset(selected)}
        onUpdate={(u) => updateAsset(selected, u)}
        copied={copiedId === selected.id}
      />}
    </div>
  );
}

// ─── Detail / edit panel ─────────────────────────────────────────────
function DetailPanel({
  asset, onClose, onCopy, onDelete, onUpdate, copied,
}: {
  asset: BrandAsset;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onUpdate: (u: { category?: string; tags?: string[]; notes?: string }) => void;
  copied: boolean;
}) {
  const [category, setCategory] = useState(asset.category);
  const [tagsStr, setTagsStr] = useState(asset.tags.join(', '));
  const [notes, setNotes] = useState(asset.notes);

  useEffect(() => {
    setCategory(asset.category);
    setTagsStr(asset.tags.join(', '));
    setNotes(asset.notes);
  }, [asset.id]);

  const save = () => {
    const parsedTags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    onUpdate({ category, tags: parsedTags, notes });
  };

  return (
    <div style={S.lbWrap} onClick={onClose}>
      <div style={S.lbInner} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={S.lbClose}>✕</button>
        <div style={S.lbImgWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.url} alt={asset.filename} style={S.lbImg} />
        </div>
        <div style={S.lbMeta}>
          <div style={S.lbFilename}>{asset.filename}</div>
          <div style={S.lbDim}>
            {asset.width && asset.height ? `${asset.width} × ${asset.height}px · ` : ''}
            {formatBytes(asset.file_size_bytes)} · uploaded {formatDate(asset.uploaded_at)}
          </div>

          <label style={S.label}>URL</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={asset.url} readOnly style={{ ...S.input, flex: 1 }} />
            <button onClick={onCopy} style={{ ...S.btn, color: copied ? '#6FCF97' : '#C9A84C' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <label style={S.label}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={S.input}>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <label style={S.label}>Tags (comma-separated)</label>
          <input
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="chocolate lab, beach, hero shot"
            style={S.input}
          />

          <label style={S.label}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this asset..."
            rows={3}
            style={{ ...S.input, fontFamily: 'inherit', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button onClick={save} style={{ ...S.btn, ...S.btnPrimary, flex: 1 }}>Save</button>
            <a href={asset.url} download={asset.filename} target="_blank" rel="noreferrer" style={{ ...S.btn, textDecoration: 'none' }}>
              ↓ Download
            </a>
            <button onClick={onDelete} style={{ ...S.btn, ...S.btnDanger }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── styles ────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', height: '100vh', background: '#0A0A0A', color: '#F5F0E8', fontFamily: "'DM Sans', sans-serif" },
  sidebar: { width: 260, borderRight: '1px solid rgba(245,240,232,.06)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' },
  brandBar: { display: 'flex', flexDirection: 'column', gap: 6 },
  back: { color: 'rgba(245,240,232,.5)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none' },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: '#F5F0E8' },
  search: { background: 'transparent', border: '1px solid rgba(245,240,232,.12)', color: '#F5F0E8', padding: '10px 12px', fontSize: 13, fontFamily: 'inherit' },
  catList: { display: 'flex', flexDirection: 'column', gap: 2 },
  catBtn: { display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: 'rgba(245,240,232,.7)', padding: '8px 10px', fontSize: 12, cursor: 'pointer', letterSpacing: '.04em', textAlign: 'left' },
  catBtnActive: { background: 'rgba(201,168,76,.08)', color: '#C9A84C' },
  catCount: { fontSize: 10, color: 'rgba(245,240,232,.35)', marginLeft: 8, fontVariantNumeric: 'tabular-nums' },

  main: { flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
  drop: { border: '2px dashed rgba(201,168,76,.3)', padding: '30px 20px', textAlign: 'center', borderRadius: 6, cursor: 'pointer', transition: 'all .2s', background: 'rgba(201,168,76,.02)' },
  dropActive: { border: '2px dashed #C9A84C', background: 'rgba(201,168,76,.08)' },
  dropTitle: { fontSize: 15, color: '#F5F0E8', fontWeight: 500, marginBottom: 6 },
  dropSub: { fontSize: 12, color: 'rgba(245,240,232,.5)' },
  progressWrap: { marginTop: 12, height: 4, background: 'rgba(245,240,232,.1)', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', background: '#C9A84C', transition: 'width .2s' },

  empty: { padding: '80px 20px', textAlign: 'center', color: 'rgba(245,240,232,.5)', fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  tile: { background: '#141414', border: '1px solid rgba(245,240,232,.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  thumb: { aspectRatio: '1 / 1', background: '#0a0a0a', overflow: 'hidden', cursor: 'pointer' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  tileFoot: { padding: 10 },
  tileName: { fontSize: 12, color: '#F5F0E8', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tileMeta: { fontSize: 10, color: 'rgba(245,240,232,.4)', marginTop: 3, fontVariantNumeric: 'tabular-nums' },
  tileBtn: { flex: 1, background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.2)', color: 'rgba(245,240,232,.75)', padding: '5px 8px', fontSize: 10, cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase' },

  lbWrap: { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.92)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 },
  lbInner: { background: '#141414', border: '1px solid rgba(245,240,232,.1)', display: 'grid', gridTemplateColumns: '1fr 380px', maxWidth: 1400, width: '100%', maxHeight: '90vh', overflow: 'hidden', position: 'relative' },
  lbClose: { position: 'absolute', top: 12, right: 12, background: 'rgba(10,10,10,.8)', border: '1px solid rgba(245,240,232,.15)', color: '#F5F0E8', width: 32, height: 32, cursor: 'pointer', zIndex: 5, fontSize: 14 },
  lbImgWrap: { background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, overflow: 'hidden' },
  lbImg: { maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', display: 'block' },
  lbMeta: { padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, borderLeft: '1px solid rgba(245,240,232,.06)' },
  lbFilename: { fontSize: 17, fontWeight: 500, color: '#F5F0E8', marginBottom: 2, wordBreak: 'break-all' },
  lbDim: { fontSize: 11, color: 'rgba(245,240,232,.4)', marginBottom: 18, fontVariantNumeric: 'tabular-nums' },

  label: { fontSize: 10, color: '#C9A84C', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 12, marginBottom: 4, fontWeight: 600 },
  input: { background: 'rgba(10,10,10,.6)', border: '1px solid rgba(245,240,232,.12)', color: '#F5F0E8', padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', width: '100%' },
  btn: { background: 'transparent', border: '1px solid rgba(245,240,232,.15)', color: '#F5F0E8', padding: '9px 14px', fontSize: 11, cursor: 'pointer', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 500 },
  btnPrimary: { background: '#C9A84C', color: '#0A0A0A', border: '1px solid #C9A84C', fontWeight: 700 },
  btnDanger: { borderColor: 'rgba(255,80,80,.3)', color: 'rgba(255,80,80,.8)' },
};
