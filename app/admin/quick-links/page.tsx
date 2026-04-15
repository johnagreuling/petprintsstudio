'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function QuickLinksPage() {
  const [imageUrl, setImageUrl] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)

  const generateLink = () => {
    if (!imageUrl.trim()) return
    
    // Extract the path after the R2 base URL
    const r2Base = 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/'
    let path = imageUrl.trim()
    
    if (path.startsWith(r2Base)) {
      path = path.replace(r2Base, '')
    }
    
    // URL encode the path
    const encoded = encodeURIComponent(path)
    const link = `https://petprintsstudio.com/order/${encoded}`
    setGeneratedLink(link)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          font-size: 14px;
          font-family: monospace;
        }
        .btn {
          background: #C9A84C;
          color: #0A0A0A;
          border: none;
          padding: 14px 28px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid rgba(245,240,232,.2);
          color: #F5F0E8;
          padding: 14px 28px;
          font-size: 12px;
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
        }
      `}</style>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
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
          🔗 Quick Checkout Links
        </h1>
        <p style={{ color: 'rgba(245,240,232,.5)', marginBottom: 40 }}>
          Generate shareable links for customers to quickly order a specific portrait
        </p>

        <div style={{ marginBottom: 32 }}>
          <label style={{ 
            fontSize: 11, 
            letterSpacing: '.15em', 
            textTransform: 'uppercase', 
            color: '#C9A84C',
            display: 'block',
            marginBottom: 12,
          }}>
            Image URL (from R2 or full URL)
          </label>
          <textarea
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/abc123/image.png"
            rows={3}
            style={{ marginBottom: 16 }}
          />
          <button className="btn" onClick={generateLink}>
            Generate Quick Link
          </button>
        </div>

        {generatedLink && (
          <div style={{
            background: '#141414',
            border: '1px solid rgba(34,197,94,.3)',
            padding: 24,
          }}>
            <div style={{ 
              fontSize: 11, 
              letterSpacing: '.15em', 
              textTransform: 'uppercase', 
              color: '#22c55e',
              marginBottom: 12,
            }}>
              ✓ Quick Link Generated
            </div>
            
            <div style={{
              background: '#0A0A0A',
              padding: 16,
              marginBottom: 16,
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: 13,
            }}>
              {generatedLink}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" onClick={copyToClipboard}>
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
              <a 
                href={generatedLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                🔗 Test Link
              </a>
            </div>

            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(245,240,232,.08)' }}>
              <div style={{ fontSize: 12, color: 'rgba(245,240,232,.5)', marginBottom: 12 }}>
                Copy & paste for customer:
              </div>
              <div style={{
                background: '#0A0A0A',
                padding: 16,
                fontSize: 14,
                lineHeight: 1.7,
              }}>
                Hi! Your portrait is ready. Click here to select your print size and checkout:<br/>
                <span style={{ color: '#C9A84C' }}>{generatedLink}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 48, padding: 24, background: '#141414', border: '1px solid rgba(245,240,232,.08)' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>How it works:</div>
          <ol style={{ color: 'rgba(245,240,232,.6)', fontSize: 14, lineHeight: 2, paddingLeft: 20 }}>
            <li>Copy the R2 image URL from the admin sessions page</li>
            <li>Paste it above and click Generate</li>
            <li>Send the link to your customer via email or text</li>
            <li>They select a product and checkout directly — no upload needed</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
