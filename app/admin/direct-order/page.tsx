'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

export default function CustomerDirectOrderPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [petName, setPetName] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [checkoutLink, setCheckoutLink] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    setImageFile(file)
    setUploadedUrl(null)
    setSent(false)
    setError('')
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async () => {
    if (!imageFile) return
    setUploading(true)
    setError('')
    
    try {
      // Get presigned upload URL
      const urlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `direct-order-${Date.now()}.${imageFile.name.split('.').pop()}`,
          contentType: imageFile.type,
          folder: 'direct-orders',
        }),
      })
      
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, publicUrl } = await urlRes.json()
      
      // Upload to R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': imageFile.type },
        body: imageFile,
      })
      
      if (!uploadRes.ok) throw new Error('Upload failed')
      
      setUploadedUrl(publicUrl)
      
      // Generate checkout link
      const encoded = encodeURIComponent(publicUrl)
      setCheckoutLink(`https://petprintsstudio.com/order/${encoded}`)
      
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const sendToCustomer = async () => {
    if (!uploadedUrl || (!customerEmail && !customerPhone)) {
      setError('Please upload image and enter email or phone')
      return
    }
    
    setSending(true)
    setError('')
    
    try {
      const res = await fetch('/api/admin/send-direct-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          checkoutLink,
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          petName: petName.trim(),
          personalMessage: personalMessage.trim(),
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Send failed')
      }
      
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(checkoutLink)
    alert('Link copied!')
  }

  const reset = () => {
    setImageFile(null)
    setImagePreview(null)
    setUploadedUrl(null)
    setCustomerEmail('')
    setCustomerPhone('')
    setPetName('')
    setPersonalMessage('')
    setSent(false)
    setError('')
    setCheckoutLink('')
  }

  return (
    <div style={{
      background: '#0A0A0A',
      color: '#F5F0E8',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      padding: '40px 24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        input, textarea {
          width: 100%;
          padding: 14px 16px;
          background: #141414;
          border: 1px solid rgba(245,240,232,.15);
          color: #F5F0E8;
          font-size: 15px;
          font-family: inherit;
          outline: none;
        }
        input:focus, textarea:focus {
          border-color: rgba(201,168,76,.4);
        }
        input::placeholder, textarea::placeholder {
          color: rgba(245,240,232,.3);
        }
        .btn {
          background: #C9A84C;
          color: #0A0A0A;
          border: none;
          padding: 16px 32px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn:hover { opacity: 0.9; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-outline {
          background: transparent;
          border: 1px solid rgba(245,240,232,.2);
          color: #F5F0E8;
          padding: 16px 32px;
          font-size: 12px;
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .btn-outline:hover { border-color: rgba(245,240,232,.4); }
        .drop-zone {
          border: 2px dashed rgba(245,240,232,.2);
          padding: 48px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .drop-zone:hover, .drop-zone.dragover {
          border-color: rgba(201,168,76,.5);
          background: rgba(201,168,76,.05);
        }
        .label {
          font-size: 11px;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #C9A84C;
          display: block;
          margin-bottom: 10px;
        }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Link href="/admin" style={{ 
          color: 'rgba(245,240,232,.5)', 
          textDecoration: 'none', 
          fontSize: 12, 
          letterSpacing: '.1em',
          display: 'inline-block',
          marginBottom: 24,
        }}>
          ← Back to Admin
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
          📤 Customer Direct Order
        </h1>
        <p style={{ color: 'rgba(245,240,232,.5)', marginBottom: 40, lineHeight: 1.7 }}>
          Upload any image and send a checkout link directly to a customer via email or text.
        </p>

        {sent ? (
          <div style={{
            background: 'rgba(34,197,94,.1)',
            border: '1px solid rgba(34,197,94,.3)',
            padding: 32,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Sent Successfully!</h2>
            <p style={{ color: 'rgba(245,240,232,.6)', marginBottom: 24 }}>
              {customerEmail && `Email sent to ${customerEmail}`}
              {customerEmail && customerPhone && ' and '}
              {customerPhone && `SMS sent to ${customerPhone}`}
            </p>
            <div style={{ 
              background: '#0A0A0A', 
              padding: 16, 
              marginBottom: 24,
              wordBreak: 'break-all',
              fontSize: 13,
              fontFamily: 'monospace',
            }}>
              {checkoutLink}
            </div>
            <button className="btn" onClick={reset}>
              Send Another
            </button>
          </div>
        ) : (
          <>
            {/* Step 1: Upload Image */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                marginBottom: 16 
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: imagePreview ? '#22c55e' : '#C9A84C',
                  color: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                  {imagePreview ? '✓' : '1'}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500 }}>Upload Portrait Image</span>
              </div>

              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      maxHeight: 400, 
                      objectFit: 'contain',
                      background: '#141414',
                    }} 
                  />
                  <button
                    onClick={() => { setImagePreview(null); setImageFile(null); setUploadedUrl(null); }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(0,0,0,.7)',
                      border: 'none',
                      color: '#fff',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: 16,
                    }}
                  >
                    ✕
                  </button>
                  
                  {!uploadedUrl && (
                    <button 
                      className="btn" 
                      onClick={uploadImage}
                      disabled={uploading}
                      style={{ width: '100%', marginTop: 16 }}
                    >
                      {uploading ? '⏳ Uploading...' : '☁️ Upload to Cloud'}
                    </button>
                  )}
                  
                  {uploadedUrl && (
                    <div style={{
                      marginTop: 16,
                      padding: 12,
                      background: 'rgba(34,197,94,.1)',
                      border: '1px solid rgba(34,197,94,.3)',
                      fontSize: 13,
                      color: '#22c55e',
                    }}>
                      ✓ Image uploaded and ready
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover') }}
                  onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
                  onDrop={handleFileDrop}
                >
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🖼️</div>
                  <div style={{ fontSize: 15, marginBottom: 8 }}>
                    Drop image here or click to browse
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(245,240,232,.4)' }}>
                    PNG, JPG up to 10MB
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Step 2: Customer Info */}
            <div style={{ marginBottom: 32, opacity: uploadedUrl ? 1 : 0.4, pointerEvents: uploadedUrl ? 'auto' : 'none' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                marginBottom: 16 
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: (customerEmail || customerPhone) ? '#22c55e' : '#C9A84C',
                  color: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                  {(customerEmail || customerPhone) ? '✓' : '2'}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500 }}>Customer Details</span>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
                
                <div style={{ textAlign: 'center', color: 'rgba(245,240,232,.3)', fontSize: 12 }}>
                  — or —
                </div>
                
                <div>
                  <label className="label">Phone Number (for SMS)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                  />
                </div>
                
                <div>
                  <label className="label">Pet's Name (optional)</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g., Mason"
                  />
                </div>
                
                <div>
                  <label className="label">Personal Message (optional)</label>
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Add a personal note to the customer..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Checkout Link Preview */}
            {checkoutLink && (
              <div style={{
                background: '#141414',
                border: '1px solid rgba(245,240,232,.1)',
                padding: 20,
                marginBottom: 24,
              }}>
                <label className="label">Checkout Link</label>
                <div style={{
                  background: '#0A0A0A',
                  padding: 12,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  marginBottom: 12,
                }}>
                  {checkoutLink}
                </div>
                <button className="btn-outline" onClick={copyLink} style={{ padding: '10px 20px' }}>
                  📋 Copy Link
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,.1)',
                border: '1px solid rgba(239,68,68,.3)',
                padding: 16,
                marginBottom: 24,
                color: '#ef4444',
                fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {/* Step 3: Send */}
            <div style={{ opacity: (uploadedUrl && (customerEmail || customerPhone)) ? 1 : 0.4 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                marginBottom: 16 
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#C9A84C',
                  color: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                  3
                </div>
                <span style={{ fontSize: 15, fontWeight: 500 }}>Send to Customer</span>
              </div>

              <button
                className="btn"
                onClick={sendToCustomer}
                disabled={!uploadedUrl || (!customerEmail && !customerPhone) || sending}
                style={{ width: '100%' }}
              >
                {sending ? '⏳ Sending...' : `Send ${customerEmail ? 'Email' : ''}${customerEmail && customerPhone ? ' & ' : ''}${customerPhone ? 'SMS' : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
