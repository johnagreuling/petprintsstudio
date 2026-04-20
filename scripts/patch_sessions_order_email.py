#!/usr/bin/env python3
"""Adds 'Send Order Email' button + modal to app/admin/sessions/page.tsx."""
import re, sys, pathlib

f = pathlib.Path("app/admin/sessions/page.tsx")
src = f.read_text()
orig = src

state_anchor = "  const [selectedImage, setSelectedImage] = useState<SessionImage | null>(null);"
state_addition = """  const [selectedImage, setSelectedImage] = useState<SessionImage | null>(null);
  const [orderImage, setOrderImage] = useState<SessionImage | null>(null);
  const [orderEmail, setOrderEmail] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderPetName, setOrderPetName] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [orderSending, setOrderSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderCheckoutLink, setOrderCheckoutLink] = useState('');"""
assert src.count(state_anchor) == 1, "state anchor not unique"
src = src.replace(state_anchor, state_addition)

handler_anchor = "  return (\n    <div style={{ \n      background: '#1a1a1a',"
handler_addition = """  const openOrderModal = (img: SessionImage) => {
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
      background: '#1a1a1a',"""
assert src.count(handler_anchor) == 1, "handler anchor not unique"
src = src.replace(handler_anchor, handler_addition)

btn_anchor = """              <button 
                className="btn btn-gold"
                onClick={() => window.open(selectedImage.url, '_blank')}
              >
                Open Full Size ↗
              </button>"""
btn_addition = """              <button 
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
              </button>"""
assert src.count(btn_anchor) == 1, "button anchor not unique"
src = src.replace(btn_anchor, btn_addition)

end_anchor = "      )}\n    </div>\n  );\n}\n"
end_addition = """      )}

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
"""
assert src.count(end_anchor) == 1, "end anchor not unique"
src = src.replace(end_anchor, end_addition)

if src == orig:
    print("No changes applied — anchors may have drifted"); sys.exit(1)

f.write_text(src)
print(f"Patched {f}")
print(f"Delta: +{len(src)-len(orig)} chars")

def count_tokens(s):
    return {
        'div': len(re.findall(r'<div\b', s)) - len(re.findall(r'</div>', s)),
        'button': len(re.findall(r'<button\b', s)) - len(re.findall(r'</button>', s)),
        'span': len(re.findall(r'<span\b', s)) - len(re.findall(r'</span>', s)),
    }
print(f"JSX balance (expect all 0): {count_tokens(src)}")
