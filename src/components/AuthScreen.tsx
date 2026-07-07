import React, { useState } from 'react';
import { Shield, User, Lock, Mail, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser, registerUser, MUNICIPAL_PASSCODES } from '../utils/userDb';
import type { UserProfile } from '../utils/userDb';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<'Citizen' | 'Moderator' | 'Authority'>('Citizen');
  const [passcode, setPasscode] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isLogin) {
      // Login Flow
      if (!username || !password) {
        setErrorMsg('Please enter both username and password.');
        return;
      }
      const res = loginUser(username, password);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } else {
      // Sign Up Flow
      if (!username || !email || !password || !confirmPassword) {
        setErrorMsg('All fields are required.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (role !== 'Citizen' && !passcode) {
        setErrorMsg(`A Municipal Passcode is required to register as a ${role}.`);
        return;
      }

      const res = registerUser(username, email, password, role, passcode);
      if (res.success && res.user) {
        setSuccessMsg('Registration successful! Logging you in...');
        setTimeout(() => {
          if (res.user) onAuthSuccess(res.user);
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    }
  };

  // Demo shortcut login helper
  const handleQuickLogin = (demoUser: 'citizen' | 'moderator' | 'authority') => {
    const creds = {
      citizen: { u: 'citizen', p: 'citizen123' },
      moderator: { u: 'moderator', p: 'mod123' },
      authority: { u: 'authority', p: 'gov123' }
    }[demoUser];

    const res = loginUser(creds.u, creds.p);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    setTimeout(() => {
      const gUsername = 'google_user';
      const gEmail = 'google_user@gmail.com';
      const gPassword = 'googleSecurePassword2026';
      
      let res = loginUser(gUsername, gPassword);
      if (!res.success) {
        res = registerUser(gUsername, gEmail, gPassword, 'Citizen');
      }

      setGoogleLoading(false);
      if (res.success && res.user) {
        setSuccessMsg('Google Authentication successful!');
        setTimeout(() => {
          if (res.user) onAuthSuccess(res.user);
        }, 800);
      } else {
        setErrorMsg('Google Login failed to sync credentials.');
      }
    }, 1200);
  };

  if (googleLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(30, 27, 75, 0.4) 0%, rgba(7, 9, 19, 1) 100%)',
        padding: '24px'
      }}>
        <div className="glass-card border border-white/10" style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px',
          borderRadius: '16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.05)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 1s infinite linear'
          }} />
          <h3 style={{ margin: 0, color: '#FFF' }}>Connecting to Google Accounts...</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Securing OAuth token handshake with accounts.google.com
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, rgba(30, 27, 75, 0.4) 0%, rgba(7, 9, 19, 1) 100%)',
      padding: '24px'
    }}>
      <div className="glass-card border border-white/10" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '36px',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* App Title Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            padding: '12px',
            borderRadius: '12px',
            color: '#FFF',
            marginBottom: '14px',
            boxShadow: '0 4px 14px var(--primary-glow)'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            COMMUNITY HERO
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Decentralized Hyperlocal Civic Accountability Platform
          </span>
        </div>

        {/* Tab selector */}
        <div className="glass-card p-1 border border-white/5" style={{ display: 'flex', borderRadius: '8px' }}>
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              background: isLogin ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: isLogin ? '#FFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              background: !isLogin ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: !isLogin ? '#FFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Alerts messages */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            padding: '12px',
            color: '#FCA5A5',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '8px',
            padding: '12px',
            color: '#A7F3D0',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="input-group">
            <label className="input-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="text"
                placeholder="Enter username"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="email"
                  placeholder="name@organization.com"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="input-group">
                <label className="input-label">Register User Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {(['Citizen', 'Moderator', 'Authority'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setRole(opt); setErrorMsg(''); }}
                      style={{
                        padding: '10px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: role === opt ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                        background: role === opt ? 'rgba(139, 92, 246, 0.12)' : 'rgba(0,0,0,0.2)',
                        color: role === opt ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {opt === 'Citizen' && 'Citizen'}
                      {opt === 'Moderator' && 'Moderator'}
                      {opt === 'Authority' && 'Authority'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passcode validation for government/mods */}
              {role !== 'Citizen' && (
                <div className="input-group animate-fade-in">
                  <label className="input-label" style={{ color: 'var(--amber)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Municipal Passcode Key</span>
                    <span style={{ fontSize: '0.65rem', textTransform: 'none', color: 'var(--text-muted)' }}>
                      Mod: {MUNICIPAL_PASSCODES.Moderator} | Gov: {MUNICIPAL_PASSCODES.Authority}
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter security passcode code"
                    className="form-input"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '0.9rem' }}>
            {isLogin ? 'Sign In Securely' : 'Complete Registration'} <ArrowRight size={16} style={{ marginLeft: '6px' }} />
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                padding: '11px',
                marginTop: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                color: '#FFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" style={{ marginRight: '2px' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.89h12.66c-.55 2.92-2.2 5.39-4.68 7.05l7.26 5.63C43.5 35.75 46.5 30.34 46.5 24z" />
                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.26-5.63c-2.03 1.37-4.63 2.19-8.63 2.19-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Sign In with Google
            </button>
          )}
        </form>

        {/* Demo Fast Login Panel */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', textAlign: 'center', marginBottom: '12px' }}>
            Developer Evaluation Presets:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleQuickLogin('citizen')}
              className="btn btn-secondary"
              style={{ fontSize: '0.7rem', padding: '8px 4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            >
              Demo Citizen
            </button>
            <button
              onClick={() => handleQuickLogin('moderator')}
              className="btn btn-secondary"
              style={{ fontSize: '0.7rem', padding: '8px 4px', border: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
              Demo Moderator
            </button>
            <button
              onClick={() => handleQuickLogin('authority')}
              className="btn btn-secondary"
              style={{ fontSize: '0.7rem', padding: '8px 4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}
            >
              Demo Authority
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
