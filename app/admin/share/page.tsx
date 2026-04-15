'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ShareLinkGenerator() {
  const [imageUrl, setImageUrl] = useState('')
  const [styleName, setStyleName] = useState('')
  const [petName, setPetName] = useState('')
  const [isMemory, setIsMemory] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)

  const generateLink = () => {
    if (!imageUrl) return
    
    const sessionId = `share-${Date.now()}`
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://petprintsstudio.com'
    
    const params = new URLSearchParams()
    params.set('image', imageUrl)
    if (styleName) params.set('style', styleName)
    if (petName) params.set('pet', petName)
    if (isMemory) params.set('memory', 'true')
    
    const link = `${baseUrl}/checkout/${sessionId}?${params.toString()}`
    setGeneratedLink(link)
    setCopied(false)
  }

  const copyToClipboard = async () => {
    if (!generatedLink) return
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = generatedLink
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .serif{font-family:'Cormorant Garamond',serif}
        .input{background:#141414;border:1px solid rgba(245,240,232,.1);color:#F5F0E8;padding:14px 18px;font-size:14px;width:100%;outline:none;transition:border-color .2s}
        .input:focus{border-color:rgba(201,168,76,.5)}
        .btn-gold{background:#C9A84C;color:#0A0A0A;border:none;padding:16px 32px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .2s}
        .btn-gold:hover{background:#d4b65c}
        .btn-gold:disabled{opacity:.5;cursor:not-allowed}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--muted:rgba(245,240,232,.45)}
      `}</style>

      {/* Header */}
      <header style={{padding:'20px 32px',borderBottom:'1px solid rgba(245,240,232,.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <Link href="/admin" style={{textDecoration:'none',color:'#F5F0E8',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18}}>←</span>
          <span style={{fontSize:14}}>Back to Admin</span>
        </Link>
        <div style={{fontSize:11,color:'var(--gold)',letterSpacing:'.15em',textTransform:'uppercase'}}>
          Share Link Generator
        </div>
      </header>

      <div style={{maxWidth:700,margin:'0 auto',padding:'48px 24px'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Admin Tool</div>
          <h1 className="serif" style={{fontSize:'clamp(32px,5vw,48px)',fontWeight:400,marginBottom:12}}>
            Generate Checkout Link
          </h1>
          <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8}}>
            Create a shareable link that takes customers directly to checkout with a specific portrait image pre-loaded.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:24,marginBottom:32}}>
          <div>
            <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--cream)',display:'block',marginBottom:8}}>
              Image URL <span style={{color:'var(--gold)'}}>*</span>
            </label>
            <input 
              className="input" 
              type="url"
              placeholder="https://pub-xxx.r2.dev/sessions/xxx/image.png"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
            <div style={{fontSize:11,color:'var(--muted)',marginTop:6}}>
              Paste the full R2 URL of the portrait image
            </div>
          </div>

          <div>
            <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>
              Style Name
            </label>
            <input 
              className="input" 
              type="text"
              placeholder="e.g. Ethereal Painterly, Retro Pop, Fine Art Sketch"
              value={styleName}
              onChange={e => setStyleName(e.target.value)}
            />
          </div>

          <div>
            <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>
              Pet Name
            </label>
            <input 
              className="input" 
              type="text"
              placeholder="e.g. Mason, Luna, Biscuit"
              value={petName}
              onChange={e => setPetName(e.target.value)}
            />
          </div>

          <div>
            <label style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
              <div 
                onClick={() => setIsMemory(!isMemory)}
                style={{
                  width:24,
                  height:24,
                  border:`2px solid ${isMemory?'var(--gold)':'rgba(245,240,232,.2)'}`,
                  borderRadius:4,
                  background:isMemory?'var(--gold)':'transparent',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  color:'var(--ink)',
                  fontWeight:700,
                  fontSize:12,
                  cursor:'pointer'
                }}
              >
                {isMemory && '✓'}
              </div>
              <span style={{fontSize:14}}>This is a Memory Portrait (+$20 upgrade)</span>
            </label>
          </div>
        </div>

        <button 
          className="btn-gold" 
          onClick={generateLink}
          disabled={!imageUrl}
          style={{width:'100%',marginBottom:24}}
        >
          Generate Shareable Link
        </button>

        {generatedLink && (
          <div style={{background:'#141414',border:'1px solid rgba(201,168,76,.3)',padding:'24px',marginBottom:24}}>
            <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>
              ✓ Link Generated
            </div>
            
            <div style={{background:'#0A0A0A',border:'1px solid rgba(245,240,232,.1)',padding:'14px 18px',marginBottom:16,wordBreak:'break-all',fontSize:13,color:'var(--cream)',lineHeight:1.6}}>
              {generatedLink}
            </div>
            
            <div style={{display:'flex',gap:12}}>
              <button 
                className="btn-gold"
                onClick={copyToClipboard}
                style={{flex:1}}
              >
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
              <a 
                href={generatedLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  flex:1,
                  background:'transparent',
                  border:'1px solid rgba(245,240,232,.2)',
                  color:'var(--cream)',
                  padding:'16px 32px',
                  fontSize:12,
                  fontWeight:700,
                  letterSpacing:'.12em',
                  textTransform:'uppercase',
                  textDecoration:'none',
                  textAlign:'center',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center'
                }}
              >
                🔗 Test Link
              </a>
            </div>

            {imageUrl && (
              <div style={{marginTop:24,textAlign:'center'}}>
                <div style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',marginBottom:12}}>Preview</div>
                <img 
                  src={imageUrl} 
                  alt="Portrait preview" 
                  style={{maxWidth:200,maxHeight:300,objectFit:'contain',border:'1px solid rgba(245,240,232,.1)'}}
                  onError={(e) => {(e.target as HTMLImageElement).style.display = 'none'}}
                />
              </div>
            )}
          </div>
        )}

        <div style={{background:'#141414',border:'1px solid rgba(245,240,232,.06)',padding:'20px 24px'}}>
          <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>
            How It Works
          </div>
          <ol style={{fontSize:13,color:'var(--muted)',lineHeight:2,margin:0,paddingLeft:20}}>
            <li>Paste the R2 image URL from a generated portrait</li>
            <li>Add the style name and pet name for personalization</li>
            <li>Generate the link and send it to your customer</li>
            <li>They'll see the portrait and can choose their print size</li>
            <li>Checkout flows through Stripe → Printify as normal</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
