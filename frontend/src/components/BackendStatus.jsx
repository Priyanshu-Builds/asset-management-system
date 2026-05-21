import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

export default function BackendStatus({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'connected' | 'failed'
  const [attempt, setAttempt] = useState(1);
  const timerRef = useRef(null);
  const maxAttempts = 20;

  const checkBackend = async (attemptNum) => {
    try {
      await api.get('/health', { timeout: 8000 });
      setStatus('connected');
    } catch {
      if (attemptNum < maxAttempts) {
        setAttempt(attemptNum + 1);
        timerRef.current = setTimeout(() => checkBackend(attemptNum + 1), 5000);
      } else {
        setStatus('failed');
      }
    }
  };

  useEffect(() => {
    checkBackend(1);
    return () => clearTimeout(timerRef.current);
  }, []);

  if (status === 'connected') return children;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#06060a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Background gradients */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at 70% 30%, rgba(59,130,246,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(22,22,37,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '36px 40px',
        maxWidth: 480, width: '90%',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        animation: 'modalUp 0.3s ease',
      }}>
        {status === 'failed' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>✕</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                Connection Failed
              </h2>
            </div>
            <p style={{ fontSize: 14, color: '#9494b0', lineHeight: 1.6, marginBottom: 8 }}>
              Unable to reach the Vaultix backend after {maxAttempts} attempts.
            </p>
            <p style={{ fontSize: 12, color: '#3d3d5c', lineHeight: 1.5, marginBottom: 24 }}>
              The server may be experiencing issues. Please try again later or contact support.
            </p>
            <button
              onClick={() => { setStatus('checking'); setAttempt(1); checkBackend(1); }}
              style={{
                width: '100%', padding: '12px 0',
                fontSize: 14, fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                border: 'none', borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
              }}
            >
              Retry Connection
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              {/* Spinner */}
              <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
                <svg width="36" height="36" viewBox="0 0 36 36" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#8b5cf6" strokeWidth="3"
                    strokeDasharray="30 70" strokeLinecap="round" />
                </svg>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                Connecting to Vaultix backend...
              </h2>
            </div>

            <p style={{ fontSize: 14, color: '#9494b0', lineHeight: 1.6, marginBottom: 8 }}>
              Starting services (attempt {attempt}). Render free tier may need 30–60
              seconds after inactivity.
            </p>

            <p style={{ fontSize: 12, color: '#3d3d5c', lineHeight: 1.5, margin: 0 }}>
              Render free tier requires cold start after inactivity. Thanks for your patience.
            </p>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 4, marginTop: 20 }}>
              {[...Array(Math.min(attempt, 12))].map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === Math.min(attempt, 12) - 1 ? '#8b5cf6' : 'rgba(139,92,246,0.25)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
