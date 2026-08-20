'use client'

import { useState, useEffect } from 'react'
import BrandMark from '@/components/BrandMark'

export type UserRole = 'employee' | 'admin' | 'super_admin'
export interface AuthUser { name: string; email: string; role: UserRole; avatar: string; company: string }

const DEMO_ACCOUNTS: (AuthUser & { password: string })[] = [
  { name: 'Super Admin',    email: 'super@hadir.id',  password: 'super123',    role: 'super_admin', avatar: 'SA', company: 'Platform' },
  { name: 'Fajar Nugroho',  email: 'admin@hadir.id',  password: 'admin123',    role: 'admin',       avatar: 'FN', company: 'PayrollIn Demo' },
  { name: 'Rina Setiawati', email: 'rina@hadir.id',   password: 'employee123', role: 'employee',    avatar: 'RS', company: 'PayrollIn Demo' },
]

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string; border: string; route: string }> = {
  super_admin: { label: 'SUPER ADMIN', color: '#d97706', bg: '#fef3c7', border: '#fde68a', route: '/control-center' },
  admin:       { label: 'HR ADMIN',    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', route: '/hr'             },
  employee:    { label: 'EMPLOYEE',    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', route: '/app'            },
}

/**
 * Hero art with a real alpha-transparent background (chroma-keyed) — floats
 * directly over the page, no card / no box / no solid edge behind it.
 */
function Illustration({ dark }: { dark: boolean }) {
  return (
    <div className="ill-scene" style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '0 auto 0 -12px' }}>
      {dark && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            top: '8%',
            bottom: '10%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(96,165,250,0.16), transparent 70%)',
            filter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        />
      )}
      <div className="ill-float-slow" style={{ position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/hr-login-hero.png"
          alt="Ilustrasi absensi, payroll, dan manajemen HR HadiR"
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            userSelect: 'none',
            pointerEvents: 'none',
            filter: dark ? 'brightness(1.08) drop-shadow(0 18px 32px rgba(0,0,0,0.35))' : 'drop-shadow(0 18px 32px rgba(30,64,175,0.12))',
          }}
        />
      </div>
    </div>
  )
}

export default function LoginPage({ onLogin, dark, onToggleDark }: { onLogin: (user: AuthUser) => void; dark: boolean; onToggleDark: () => void }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const [active, setActive]     = useState<string | null>(null)
  const [ready, setReady]       = useState(false)

  useEffect(() => { setTimeout(() => setReady(true), 60) }, [])

  const D = dark
  const bg        = D ? '#0f1729'  : '#dbeafe'
  const blobLeft  = D ? 'rgba(30,64,175,.25)'  : 'rgba(147,197,253,.5)'
  const blobRight = D ? 'rgba(99,102,241,.15)' : 'rgba(191,219,254,.6)'
  const headingC  = D ? '#f1f5f9'  : '#0f172a'
  const subC      = D ? '#94a3b8'  : '#475569'
  const cardBg    = D ? '#1e293b'  : '#ffffff'
  const cardBorder= D ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)'
  const cardShadow= D ? '0 20px 60px rgba(0,0,0,.4)' : '0 20px 60px rgba(0,0,0,.08)'
  const labelC    = D ? '#94a3b8'  : '#374151'
  const inputBg   = D ? '#0f1729'  : '#f8fafc'
  const inputBorder= D? 'rgba(255,255,255,.1)' : '#e2e8f0'
  const inputC    = D ? '#f1f5f9'  : '#0f172a'
  const iconC     = D ? '#64748b'  : '#94a3b8'
  const forgotC   = '#2563eb'
  const demoCardBg   = D ? '#0f1729'  : '#f8fafc'
  const demoCardBorder = D ? 'rgba(255,255,255,.08)' : '#e2e8f0'
  const demoTextC = D ? '#e2e8f0'  : '#1e293b'
  const demoSubC  = D ? '#64748b'  : '#94a3b8'
  const dividerC  = D ? 'rgba(255,255,255,.08)' : '#e2e8f0'
  const dividerTC = D ? '#64748b'  : '#94a3b8'
  const logoC     = D ? '#818cf8'  : '#2563eb'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    setTimeout(() => {
      const acc = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password)
      if (acc) { const { password: _, ...user } = acc; onLogin(user) }
      else { setError('Email atau password tidak cocok.'); setLoading(false) }
    }, 800)
  }

  const quickLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email); setPassword(acc.password); setActive(acc.email); setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background .3s', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes ill-a { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes ill-b { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes ill-c { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ill-spark { 0%,100%{opacity:.45} 50%{opacity:1} }
        @keyframes fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes card-in  { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .ill-float-a { animation: ill-a 5s ease-in-out infinite; }
        .ill-float-b { animation: ill-b 6s ease-in-out infinite .4s; }
        .ill-float-c { animation: ill-c 4.5s ease-in-out infinite .8s; }
        .ill-float-slow { animation: ill-c 7s ease-in-out infinite; }
        .ill-spark { animation: ill-spark 2.4s ease-in-out infinite; }

        .l-input { transition:border-color .2s,box-shadow .2s,background .2s; }
        .l-input:focus { outline:none; border-color:#2563eb!important; box-shadow:0 0 0 3px rgba(37,99,235,.15); }

        .log-btn { position:relative; overflow:hidden; transition:transform .18s,box-shadow .18s,opacity .18s; }
        .log-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent); transform:translateX(-100%); transition:transform .5s; }
        .log-btn:hover:not(:disabled)::after { transform:translateX(100%); }
        .log-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(37,99,235,.45)!important; }
        .log-btn:active:not(:disabled) { transform:translateY(0); }
        .log-btn:disabled { opacity:.6; cursor:not-allowed; }

        .dcard { transition:all .15s cubic-bezier(.4,0,.2,1); cursor:pointer; }
        .dcard:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.08); }

        .toggle-pill { transition:all .2s; }
        .toggle-pill:hover { transform:scale(1.06); }

        @media(max-width:860px){
          .ill-wrap{display:none!important}
          .right-wrap{width:100%!important;padding:32px 20px!important}
          .login-grid{grid-template-columns:1fr!important;padding:0 16px!important;gap:0!important}
        }
        @media(max-width:420px){
          .right-wrap > div{padding:28px 20px 24px!important}
          .demo-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* Blobs */}
      <div style={{ position:'absolute', bottom:-120, left:-120, width:480, height:480, borderRadius:'50%', background:blobLeft, pointerEvents:'none', transition:'background .3s' }} />
      <div style={{ position:'absolute', top:-100, right:-100, width:380, height:380, borderRadius:'50%', background:blobRight, pointerEvents:'none', transition:'background .3s' }} />

      {/* Theme toggle — top right */}
      <button onClick={onToggleDark} className="toggle-pill" style={{ position:'fixed', top:20, right:20, zIndex:100, padding:'8px 16px', borderRadius:99, background: D?'rgba(255,255,255,.1)':'rgba(0,0,0,.07)', border: D?'1px solid rgba(255,255,255,.15)':'1px solid rgba(0,0,0,.1)', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:6, color: D?'#e2e8f0':'#374151', fontFamily:'Outfit', fontWeight:600 }}>
        {D ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="login-grid" style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 480px', maxWidth:1200, margin:'0 auto', padding:'0 40px', alignItems:'center', gap:60 }}>

        {/* ── LEFT: Branding + Illustration ── */}
        <div className="ill-wrap" style={{ opacity:ready?1:0, animation:ready?'fade-up .6s ease both':undefined }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
            <BrandMark size={42} />
            <span style={{ fontFamily:'Outfit', fontWeight:900, fontSize:24, color:logoC, letterSpacing:'-0.5px' }}>HadiR</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily:'Outfit', fontWeight:900, fontSize:42, color:headingC, letterSpacing:'-1.5px', lineHeight:1.1, margin:'0 0 16px', transition:'color .3s' }}>
            Kelola HR Tim Anda,<br />Lebih Mudah &amp; Cerdas.
          </h1>
          <p style={{ fontSize:16, color:subC, lineHeight:1.7, margin:'0 0 40px', maxWidth:400, transition:'color .3s' }}>
            Absensi GPS, payroll, dan manajemen karyawan dalam satu platform yang powerful.
          </p>

          {/* Illustration */}
          <Illustration dark={D} />
        </div>

        {/* ── RIGHT: Card ── */}
        <div className="right-wrap" style={{ padding:'20px 0', opacity:ready?1:0, animation:ready?'card-in .65s cubic-bezier(.34,1.1,.64,1) .1s both':undefined }}>
          <div style={{ background:cardBg, borderRadius:24, border:`1px solid ${cardBorder}`, boxShadow:cardShadow, padding:'40px 40px 36px', transition:'background .3s,box-shadow .3s' }}>

            <h2 style={{ fontFamily:'Outfit', fontWeight:900, fontSize:26, color:headingC, letterSpacing:'-0.8px', margin:'0 0 28px', lineHeight:1.2, transition:'color .3s' }}>
              Masuk ke HadiR
            </h2>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {/* Email */}
              <div>
                <label style={{ display:'block', fontSize:13.5, fontFamily:'Outfit', fontWeight:700, color:labelC, marginBottom:8, transition:'color .3s' }}>Email</label>
                <div style={{ position:'relative' }}>
                  <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconC} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input className="l-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Masukkan email Anda" required
                    style={{ width:'100%', padding:'12px 14px 12px 42px', borderRadius:12, border:`1.5px solid ${inputBorder}`, background:inputBg, color:inputC, fontFamily:'Inter', fontSize:14, boxSizing:'border-box' }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display:'block', fontSize:13.5, fontFamily:'Outfit', fontWeight:700, color:labelC, marginBottom:8, transition:'color .3s' }}>Password</label>
                <div style={{ position:'relative' }}>
                  <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconC} strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <input className="l-input" type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Masukkan password Anda" required
                    style={{ width:'100%', padding:'12px 46px 12px 42px', borderRadius:12, border:`1.5px solid ${inputBorder}`, background:inputBg, color:inputC, fontFamily:'Inter', fontSize:14, boxSizing:'border-box' }} />
                  <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:iconC, display:'flex', padding:0 }}>
                    {showPw
                      ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                <div style={{ textAlign:'right', marginTop:8 }}>
                  <span style={{ fontSize:13, color:forgotC, cursor:'pointer', fontFamily:'Inter', fontWeight:500 }}>Lupa Password?</span>
                </div>
              </div>

              {error && (
                <div style={{ padding:'11px 14px', borderRadius:10, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', fontSize:13, color:'#dc2626', display:'flex', alignItems:'center', gap:8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="log-btn"
                style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'#1d4ed8', color:'#fff', fontFamily:'Outfit', fontWeight:800, fontSize:16, cursor:loading?'not-allowed':'pointer', boxShadow:'0 6px 20px rgba(29,78,216,.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4 }}>
                {loading
                  ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin .8s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Memverifikasi...</>
                  : 'Log In'}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ flex:1, height:1, background:dividerC }} />
                <span style={{ fontSize:11, color:dividerTC, fontFamily:'Outfit', fontWeight:700, letterSpacing:'.1em', whiteSpace:'nowrap' }}>AKUN DEMO</span>
                <div style={{ flex:1, height:1, background:dividerC }} />
              </div>
              <div className="demo-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {DEMO_ACCOUNTS.map((acc, i) => {
                  const m = ROLE_META[acc.role]
                  const on = active === acc.email
                  // In dark mode use darker tints
                  const cardBgUsed   = on ? (D ? `${m.color}18` : m.bg) : demoCardBg
                  const cardBorderUsed = on ? m.color : demoCardBorder
                  const emailColor   = D && !on ? '#94a3b8' : on ? m.color : demoTextC
                  return (
                    <button key={acc.email} className="dcard" onClick={()=>quickLogin(acc)}
                      style={{ padding:'12px 14px', borderRadius:12, border:`1.5px solid ${cardBorderUsed}`, background:cardBgUsed, textAlign:'left', opacity:ready?1:0, animation:ready?`fade-up .4s ease ${.3+i*.07}s both`:undefined, transition:'background .3s,border-color .15s' }}>
                      <div style={{ fontSize:10, fontFamily:'Outfit', fontWeight:800, color: D ? (on ? m.color : '#818cf8') : m.color, letterSpacing:'.08em', marginBottom:4 }}>{m.label}</div>
                      <div style={{ fontSize:11.5, fontFamily:'Inter', fontWeight:600, color:demoTextC, marginBottom:2, wordBreak:'break-all', transition:'color .3s' }}>{acc.email}</div>
                      <div style={{ fontSize:10, color:demoSubC, fontFamily:'JetBrains Mono', transition:'color .3s' }}>→ {m.route}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
