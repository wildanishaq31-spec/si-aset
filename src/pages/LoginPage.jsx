// ============================================================
// LoginPage.jsx — Halaman autentikasi (Desain Split-Screen SI-ASET)
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';export default function LoginPage() {
  const [username, setUsername] = useState('admin@siaset.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // State untuk melacak posisi drag masing-masing ikon
  const [badgeOffsets, setBadgeOffsets] = useState({
    laptop: { x: 0, y: 0 },
    ambulan: { x: 0, y: 0 },
    motor: { x: 0, y: 0 },
    scanner: { x: 0, y: 0 },
    komputer: { x: 0, y: 0 },
  });

  const [activeDrag, setActiveDrag] = useState(null);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    if (activeDrag) return; // Skip parallax saat sedang ditarik/drag
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    if (!activeDrag) {
      setMousePos({ x: 0, y: 0 });
    }
  };

  // Pointer drag handlers untuk setiap badge
  const handlePointerDown = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveDrag({
      id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initX: badgeOffsets[id].x,
      initY: badgeOffsets[id].y,
    });
  };

  const handlePointerMoveBadge = (e) => {
    if (!activeDrag) return;
    const deltaX = e.clientX - activeDrag.startX;
    const deltaY = e.clientY - activeDrag.startY;
    setBadgeOffsets((prev) => ({
      ...prev,
      [activeDrag.id]: {
        x: activeDrag.initX + deltaX,
        y: activeDrag.initY + deltaY,
      },
    }));
  };

  const handlePointerUpBadge = (e) => {
    if (activeDrag) {
      try {
        e.currentTarget.releasePointerCapture(activeDrag.pointerId);
      } catch (_) {}
      setActiveDrag(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(username, password);
      navigate('/dashboard');
    } catch (err) {
      let msg = err.message || 'Login gagal. Periksa username/email & password Anda.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        msg = 'Email atau password salah. Pastikan password sesuai dengan akun Firebase Anda.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Format email tidak valid. Masukkan format seperti admin@siaset.com atau cukup ketik admin.';
      } else if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid') {
        msg = 'Konfigurasi Firebase API Key di file .env belum valid.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Koneksi internet bermasalah. Periksa jaringan Anda.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        .split-input {
          background: #edf2ff !important;
          border: 1px solid #e0e7ff !important;
          color: #1e293b !important;
          border-radius: 8px !important;
          padding: 0.75rem 1rem !important;
          font-size: 0.9rem !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
        }
        .split-input:focus {
          background: #ffffff !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
          outline: none !important;
        }
        .split-btn {
          background: #3b82f6 !important;
          border: none !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          padding: 0.8rem !important;
          font-size: 0.88rem !important;
          letter-spacing: 0.5px !important;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4) !important;
          transition: all 0.2s ease !important;
        }
        .split-btn:hover:not(:disabled) {
          background: #2563eb !important;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.5) !important;
          transform: translateY(-1px);
        }
        .split-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        /* Float Animations for Asset Icons */
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(-4deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(2deg); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }

        .floating-asset-badge {
          position: relative;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          color: #ffffff;
          cursor: grab;
          user-select: none;
          touch-action: none;
          pointer-events: auto;
          transition: box-shadow 0.2s ease, background 0.2s ease;
        }
        .floating-asset-badge:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.45);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.45);
        }
        .floating-asset-badge:active {
          cursor: grabbing !important;
          background: rgba(255, 255, 255, 0.28);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
        }

        @media (max-width: 992px) {
          .left-hero-panel {
            display: none !important;
          }
          .right-form-panel {
            width: 100% !important;
            flex: none !important;
          }
        }
      `}</style>

      {/* ================= PANELS SEBELAH KIRI (HERO BLUE) ================= */}
      <div
        className="left-hero-panel"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onPointerMove={handlePointerMoveBadge}
        onPointerUp={handlePointerUpBadge}
        style={{
          flex: 1,
          background: '#172d73',
          padding: '3rem 4rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Asset Pattern Background SVG Overlay (Computer, Laptop, Motorcycle, Ambulance, Scanner) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.16,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='240' height='240' viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- 1. Komputer / Desktop PC --%3E%3Cg transform='translate(25, 25)'%3E%3Crect x='2' y='2' width='26' height='18' rx='2'/%3E%3Cpath d='M15 20v5M9 25h12'/%3E%3Crect x='7' y='6' width='16' height='10' rx='1' opacity='0.5'/%3E%3C/g%3E%3C!-- 2. Laptop --%3E%3Cg transform='translate(145, 25)'%3E%3Crect x='4' y='3' width='22' height='15' rx='2'/%3E%3Cpath d='M1 21h28a1 1 0 0 0 1-1h-30a1 1 0 0 0 1 1z'/%3E%3Cline x1='12' y1='21' x2='18' y2='21' stroke-width='1.5'/%3E%3C/g%3E%3C!-- 3. Sepeda Motor --%3E%3Cg transform='translate(25, 145)'%3E%3Ccircle cx='6' cy='18' r='5'/%3E%3Ccircle cx='24' cy='18' r='5'/%3E%3Cpath d='M6 18h6l4-8h6l3 8M12 10l3-5h4M16 18v-4h4'/%3E%3C/g%3E%3C!-- 4. Ambulan --%3E%3Cg transform='translate(145, 145)'%3E%3Cpath d='M2 6h16l5 5h5v9h-3a3 3 0 0 1-6 0H11a3 3 0 0 1-6 0H2V6z'/%3E%3Ccircle cx='8' cy='20' r='2.5'/%3E%3Ccircle cx='21' cy='20' r='2.5'/%3E%3Cpath d='M8 10h4M10 8v4'/%3E%3C/g%3E%3C!-- 5. Scanner / Printer --%3E%3Cg transform='translate(85, 85)'%3E%3Cpath d='M4 9l22-4v5H4z'/%3E%3Crect x='4' y='10' width='22' height='12' rx='2'/%3E%3Cline x1='8' y1='15' x2='22' y2='15'/%3E%3Cline x1='8' y1='18' x2='18' y2='18'/%3E%3Ccircle cx='21' cy='13' r='1' fill='%23ffffff'/%3E%3C/g%3E%3C!-- Connecting lines and network nodes --%3E%3Cpath d='M40 55v30h45M115 100h30v45M55 145v-30h30M175 55v30h-60' stroke-dasharray='3 3' opacity='0.4'/%3E%3Ccircle cx='40' cy='85' r='2' fill='%23ffffff'/%3E%3Ccircle cx='145' cy='100' r='2' fill='%23ffffff'/%3E%3Ccircle cx='85' cy='115' r='2' fill='%23ffffff'/%3E%3Ccircle cx='115' cy='85' r='2' fill='%23ffffff'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '240px 240px',
            transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
            transition: activeDrag ? 'none' : 'transform 0.2s ease-out',
            pointerEvents: 'none',
          }}
        />

        {/* ================= FLOATING & DRAGGABLE ASSET BADGES (ICON ONLY) ================= */}
        {/* 1. Laptop Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12%',
            right: '10%',
            transform: `translate(${mousePos.x * 35 + badgeOffsets.laptop.x}px, ${mousePos.y * 35 + badgeOffsets.laptop.y}px)`,
            transition: activeDrag?.id === 'laptop' ? 'none' : 'transform 0.15s ease-out',
            zIndex: activeDrag?.id === 'laptop' ? 10 : 3,
          }}
        >
          <div
            className="floating-asset-badge"
            onPointerDown={(e) => handlePointerDown('laptop', e)}
            style={{
              animation: activeDrag?.id === 'laptop' ? 'none' : 'float1 6s ease-in-out infinite',
              transform: activeDrag?.id === 'laptop' ? 'scale(1.12)' : 'scale(1)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          </div>
        </div>

        {/* 2. Ambulance Badge */}
        <div
          style={{
            position: 'absolute',
            top: '44%',
            right: '8%',
            transform: `translate(${mousePos.x * -40 + badgeOffsets.ambulan.x}px, ${mousePos.y * -35 + badgeOffsets.ambulan.y}px)`,
            transition: activeDrag?.id === 'ambulan' ? 'none' : 'transform 0.15s ease-out',
            zIndex: activeDrag?.id === 'ambulan' ? 10 : 3,
          }}
        >
          <div
            className="floating-asset-badge"
            onPointerDown={(e) => handlePointerDown('ambulan', e)}
            style={{
              animation: activeDrag?.id === 'ambulan' ? 'none' : 'float2 7s ease-in-out infinite 1s',
              transform: activeDrag?.id === 'ambulan' ? 'scale(1.12)' : 'scale(1)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h11l4 4h3v6h-2a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H3V7z" />
              <circle cx="7" cy="17" r="1.5" />
              <circle cx="17" cy="17" r="1.5" />
              <path d="M8 10h3M9.5 8.5v3" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* 3. Motorcycle Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '18%',
            right: '22%',
            transform: `translate(${mousePos.x * 45 + badgeOffsets.motor.x}px, ${mousePos.y * 40 + badgeOffsets.motor.y}px)`,
            transition: activeDrag?.id === 'motor' ? 'none' : 'transform 0.15s ease-out',
            zIndex: activeDrag?.id === 'motor' ? 10 : 3,
          }}
        >
          <div
            className="floating-asset-badge"
            onPointerDown={(e) => handlePointerDown('motor', e)}
            style={{
              animation: activeDrag?.id === 'motor' ? 'none' : 'float3 8s ease-in-out infinite 0.5s',
              transform: activeDrag?.id === 'motor' ? 'scale(1.12)' : 'scale(1)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="16" r="3" />
              <circle cx="19" cy="16" r="3" />
              <path d="M5 16h4l3-6h4l2 6M10 10l2-4h3" />
            </svg>
          </div>
        </div>

        {/* 4. Scanner Badge */}
        <div
          style={{
            position: 'absolute',
            top: '22%',
            left: '42%',
            transform: `translate(${mousePos.x * -25 + badgeOffsets.scanner.x}px, ${mousePos.y * -30 + badgeOffsets.scanner.y}px)`,
            transition: activeDrag?.id === 'scanner' ? 'none' : 'transform 0.15s ease-out',
            zIndex: activeDrag?.id === 'scanner' ? 10 : 3,
          }}
        >
          <div
            className="floating-asset-badge"
            onPointerDown={(e) => handlePointerDown('scanner', e)}
            style={{
              animation: activeDrag?.id === 'scanner' ? 'none' : 'float4 6.5s ease-in-out infinite 2s',
              transform: activeDrag?.id === 'scanner' ? 'scale(1.12)' : 'scale(1)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7l18-3v4H3z" />
              <rect x="3" y="8" width="18" height="11" rx="2" />
              <line x1="7" y1="13" x2="17" y2="13" />
            </svg>
          </div>
        </div>

        {/* 5. Desktop PC Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '8%',
            transform: `translate(${mousePos.x * 35 + badgeOffsets.komputer.x}px, ${mousePos.y * -25 + badgeOffsets.komputer.y}px)`,
            transition: activeDrag?.id === 'komputer' ? 'none' : 'transform 0.15s ease-out',
            zIndex: activeDrag?.id === 'komputer' ? 10 : 3,
          }}
        >
          <div
            className="floating-asset-badge"
            onPointerDown={(e) => handlePointerDown('komputer', e)}
            style={{
              animation: activeDrag?.id === 'komputer' ? 'none' : 'float1 7.5s ease-in-out infinite 1.5s',
              transform: activeDrag?.id === 'komputer' ? 'scale(1.12)' : 'scale(1)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <line x1="8" y1="21" x2="16" y2="21" />
            </svg>
          </div>
        </div>

        {/* Decorative Glowing Dot */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '260px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#60a5fa',
            boxShadow: '0 0 15px #60a5fa',
            opacity: 0.8,
          }}
        />

        {/* Top Header Logo */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#172d73" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2ZM12 7C13.1 7 14 7.9 14 9C14 9.74 13.59 10.39 13 10.73V14C13 14.55 12.55 15 12 15C11.45 15 11 14.55 11 14V10.73C10.41 10.39 10 9.74 10 9C10 7.9 10.9 7 12 7Z" />
            </svg>
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.5px' }}>SI-ASET</span>
        </div>

        {/* Center Main Text */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '440px', margin: 'auto 0' }}>
          <h1
            style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            Sistem<br />
            Manajemen<br />
            Aset
          </h1>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.72)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            Kelola Aset Puskesmas Sementara & Cetak Berita Acara (BA) dengan mudah, cepat, dan terintegrasi dalam satu platform modern.
          </p>

          {/* Indicator Lines */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '4px', background: '#ffffff', borderRadius: '2px' }} />
            <div style={{ width: '20px', height: '4px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px' }} />
            <div style={{ width: '20px', height: '4px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px' }} />
            <div style={{ width: '20px', height: '4px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Bottom Social & Copyright */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Facebook Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" style={{ cursor: 'pointer' }}>
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            {/* Twitter Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" style={{ cursor: 'pointer' }}>
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
            </svg>
            {/* LinkedIn Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" style={{ cursor: 'pointer' }}>
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
            </svg>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            © 2026 SI-ASET
          </span>
        </div>
      </div>

      {/* ================= PANELS SEBELAH KANAN (WHITE FORM) ================= */}
      <div
        className="right-form-panel"
        style={{
          flex: 1,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          position: 'relative',
        }}
      >
        {/* Floating Accent Shapes */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '80px',
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            background: '#dbeafe',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.15)',
            animation: 'float1 5s ease-in-out infinite',
            opacity: 0.8,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '60px',
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: '#e0e7ff',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)',
            animation: 'float3 6s ease-in-out infinite 1s',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        />

        {/* Inner Form Card */}
        <div style={{ width: '100%', maxWidth: '400px', zIndex: 2 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2
              style={{
                color: '#3b82f6',
                fontWeight: 800,
                fontSize: '1.75rem',
                margin: '0 0 0.35rem 0',
                letterSpacing: '-0.3px',
              }}
            >
              Welcome To SI-ASET
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Silakan masuk menggunakan kredensial Anda di bawah ini
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Username / Email Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.4rem',
                }}
              >
                Email / Username
              </label>
              <input
                type="text"
                className="form-control split-input"
                placeholder="admin@siaset.com atau admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.4rem',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control split-input"
                  placeholder="Masukkan password akun Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {/* Remember Me & Lupa Password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
              }}
            >
              <label style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ borderRadius: '4px', cursor: 'pointer' }}
                />
                Remember Me
              </label>

              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Silakan hubungi administrator untuk mereset password Anda.');
                }}
                style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}
              >
                Lupa Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn w-100 split-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Memproses...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '6px' }}>🔒</span> SIGN IN
                </>
              )}
            </button>
          </form>

          {/* Session Banner Note */}
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #d1fae5',
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              marginTop: '1.5rem',
              fontSize: '0.78rem',
              color: '#047857',
              textAlign: 'center',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <span>🛡️</span>
            <span>
              Sesi Anda valid <strong>12 Jam</strong> (atau 7 Hari jika "Remember Me" dicentang).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


