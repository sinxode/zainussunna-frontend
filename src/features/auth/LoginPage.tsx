import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      error('Please enter your 10-digit mobile number.');
      return;
    }
    if (!password) {
      error('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(phoneNumber.trim(), password);
      success('Logged in successfully. Welcome to Zainussunna Calendar Manager!');
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 25%, #131E33 0%, #070B14 70%)',
      padding: '1.5rem',
    }}>
      <div style={{
        background: '#111827',
        width: '100%',
        maxWidth: 390,
        borderRadius: 10,
        padding: '2.25rem 2rem',
        border: '1px solid #1E293B',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '1.35rem',
            fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif',
            margin: '0 auto 0.85rem',
          }}>
            Z
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Zainussunna Academy
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
            Calendar Fund Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="zcm-form-group">
            <label htmlFor="phoneNumber">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}>
                <Phone size={14} />
                <span>+91</span>
              </div>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ paddingLeft: '4.5rem' }}
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div className="zcm-help-text">Enter registered 10-digit Indian phone number</div>
          </div>

          <div className="zcm-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
              }}>
                <Lock size={14} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="zcm-btn zcm-btn--primary"
            style={{ width: '100%', padding: '0.65rem', marginTop: '1.25rem', height: 38 }}
            disabled={loading}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: '#64748B',
          justifyContent: 'center',
        }}>
          <ShieldCheck size={14} style={{ color: '#10B981' }} />
          <span>Role-based access & audit-controlled system</span>
        </div>
      </div>
    </div>
  );
};
