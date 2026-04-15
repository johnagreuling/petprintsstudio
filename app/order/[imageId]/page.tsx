'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PRODUCTS } from '@/lib/config'

const R2_BASE = 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev'

export default function QuickOrderPage() {
  const params = useParams()
  const imageId = params.imageId as string
  
  // Parse the imageId - could be full path or just filename
  // Expected format: sessionId_styleName or full URL path
  const imageUrl = imageId.includes('http') 
    ? decodeURIComponent(imageId)
    : `${R2_BASE}/sessions/${imageId}`
  
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState(false)
  const [petName, setPetName] = useState('')
  const [styleName, setStyleName] = useState('Portrait')
  
  // Popular products for quick selection
  const quickProducts = PRODUCTS.filter(p => 
    ['canvas_16x20', 'canvas_11x14', 'print_16x20', 'print_11x14', 'blanket'].includes(p.id)
  )
  
  const allCanvases = PRODUCTS.filter(p => p.category === 'Canvas')
  const allPrints = PRODUCTS.filter(p => p.category === 'Prints')
  const allHome = PRODUCTS.filter(p => p.category === 'Home')

  const handleCheckout = async () => {
    if (!selectedProduct) return
    setLoading(true)
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          primaryProduct: selectedProduct,
          primarySize: selectedSize,
          extras: [],
          wantBundle: false,
          styleName: styleName || 'Portrait',
          petName: petName || '',
          isMemory: false,
          sessionFolder: '',
        }),
      })
      
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      alert('Checkout failed — please try again')
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#0A0A0A',
      color: '#F5F0E8',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .serif { font-family: 'Cormorant Garamond', serif; }
        .product-card {
          background: #141414;
          border: 1px solid rgba(245,240,232,.08);
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .product-card:hover {
          border-color: rgba(201,168,76,.3);
        }
        .product-card.selected {
          border-color: #C9A84C;
          background: rgba(201,168,76,.08);
        }
        .btn-gold {
          background: #C9A84C;
          color: #0A0A0A;
          border: none;
          padding: 18px 36px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          cursor: pointer;
          width: 100%;
        }
        .btn-gold:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(245,240,232,.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🐾</span>
          <span style={{ fontSize: 18 }}>Pet Prints Studio</span>
        </Link>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 12 }}>
            Quick Order
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 400, marginBottom: 12 }}>
            Your Portrait is Ready
          </h1>
          <p style={{ color: 'rgba(245,240,232,.5)', fontSize: 15 }}>
            Select a product and checkout in seconds
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
          {/* Image Preview */}
          <div>
            <div style={{
              position: 'relative',
              background: '#141414',
              border: '1px solid rgba(245,240,232,.08)',
              padding: 16,
            }}>
              <img 
                src={imageUrl} 
                alt="Your portrait"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png'
                }}
              />
            </div>
            
            {/* Pet name input */}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: 8 }}>
                Pet's Name (optional)
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g., Mason"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#141414',
                  border: '1px solid rgba(245,240,232,.15)',
                  color: '#F5F0E8',
                  fontSize: 15,
                }}
              />
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16 }}>
              Popular Choices
            </div>
            
            <div style={{ display: 'grid', gap: 8, marginBottom: 32 }}>
              {quickProducts.map(p => (
                <div
                  key={p.id}
                  className={`product-card ${selectedProduct?.id === p.id ? 'selected' : ''}`}
                  onClick={() => setSelectedProduct(p)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                        {p.emoji} {p.name} — {p.size}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(245,240,232,.4)' }}>
                        {p.description}
                      </div>
                    </div>
                    <div className="serif" style={{ fontSize: 22, color: '#C9A84C' }}>
                      ${p.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* More options accordion */}
            <details style={{ marginBottom: 32 }}>
              <summary style={{ 
                fontSize: 11, 
                letterSpacing: '.15em', 
                textTransform: 'uppercase', 
                color: 'rgba(245,240,232,.5)',
                cursor: 'pointer',
                padding: '12px 0',
              }}>
                + View All Sizes & Products
              </summary>
              
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: '.15em', color: '#C9A84C', marginBottom: 12 }}>CANVAS PRINTS</div>
                <div style={{ display: 'grid', gap: 6, marginBottom: 24 }}>
                  {allCanvases.map(p => (
                    <div
                      key={p.id}
                      className={`product-card ${selectedProduct?.id === p.id ? 'selected' : ''}`}
                      onClick={() => setSelectedProduct(p)}
                      style={{ padding: 12 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{p.size}</span>
                        <span style={{ color: '#C9A84C' }}>${p.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 10, letterSpacing: '.15em', color: '#C9A84C', marginBottom: 12 }}>FINE ART PRINTS</div>
                <div style={{ display: 'grid', gap: 6, marginBottom: 24 }}>
                  {allPrints.map(p => (
                    <div
                      key={p.id}
                      className={`product-card ${selectedProduct?.id === p.id ? 'selected' : ''}`}
                      onClick={() => setSelectedProduct(p)}
                      style={{ padding: 12 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{p.size}</span>
                        <span style={{ color: '#C9A84C' }}>${p.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 10, letterSpacing: '.15em', color: '#C9A84C', marginBottom: 12 }}>HOME GOODS</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {allHome.map(p => (
                    <div
                      key={p.id}
                      className={`product-card ${selectedProduct?.id === p.id ? 'selected' : ''}`}
                      onClick={() => setSelectedProduct(p)}
                      style={{ padding: 12 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{p.emoji} {p.name} {p.size}</span>
                        <span style={{ color: '#C9A84C' }}>${p.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            {/* Selected product summary */}
            {selectedProduct && (
              <div style={{
                background: 'rgba(201,168,76,.08)',
                border: '1px solid rgba(201,168,76,.2)',
                padding: 20,
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#C9A84C', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      Your Selection
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 500 }}>
                      {selectedProduct.emoji} {selectedProduct.name} — {selectedProduct.size}
                    </div>
                  </div>
                  <div className="serif" style={{ fontSize: 28, color: '#C9A84C' }}>
                    ${selectedProduct.price}
                  </div>
                </div>
              </div>
            )}

            {/* Checkout button */}
            <button
              className="btn-gold"
              onClick={handleCheckout}
              disabled={!selectedProduct || loading}
            >
              {loading ? '⏳ Redirecting to Checkout...' : `Checkout — $${selectedProduct?.price || 0}`}
            </button>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 20, 
              marginTop: 16,
              fontSize: 11,
              color: 'rgba(245,240,232,.4)',
            }}>
              <span>🔒 Secure Checkout</span>
              <span>📦 Ships in 5–7 days</span>
              <span>✓ Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
