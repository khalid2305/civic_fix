import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Smartphone, Chrome, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const { login, loginWithGoogle, loginWithOTP, sendOTP } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('email');
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' });
  const [showPass, setShowPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      const role = data.role || data.user?.role;
      toast.success(`Welcome back, ${data.name || data.user?.name || 'User'}!`);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) { toast.error(err.message || 'Login failed'); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Logged in with Google!');
      navigate('/');
    } catch { toast.error('Google login failed'); }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!form.phone) { toast.error('Enter phone number'); return; }
    setLoading(true);
    try {
      await sendOTP(form.phone);
      setOtpSent(true);
      toast.success('OTP sent to ' + form.phone);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    // Real OTP login logic is in AuthContext
    setLoading(true);
    try {
      await loginWithOTP(form.phone, form.otp);
      toast.success('Phone verified!');
      navigate('/dashboard');
    } catch { toast.error('OTP verification failed'); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '90px 24px 40px',
      background: 'linear-gradient(135deg, #070b14 0%, #0b1628 100%)',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: '15%', right: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '10%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeInUp 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(59,130,246,0.4)',
          }}>
            <span style={{ fontSize: '1.4rem' }}>📍</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>{t('login_title')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('login_subtitle')}</p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: '24px' }}>
            <button className={`tab-btn ${tab === 'email' ? 'active' : ''}`} onClick={() => setTab('email')}>
              <Mail size={13} style={{ display: 'inline', marginRight: '4px' }} />{t('login_email')}
            </button>
            <button className={`tab-btn ${tab === 'google' ? 'active' : ''}`} onClick={() => setTab('google')}>
              <Chrome size={13} style={{ display: 'inline', marginRight: '4px' }} />{t('login_google')}
            </button>
            <button className={`tab-btn ${tab === 'otp' ? 'active' : ''}`} onClick={() => setTab('otp')}>
              <Smartphone size={13} style={{ display: 'inline', marginRight: '4px' }} />{t('login_otp')}
            </button>
          </div>

          {/* Email/Password Form */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">{t('email_label')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" className="form-input" placeholder={t('email_placeholder')} value={form.email} onChange={e => set('email', e.target.value)} style={{ paddingLeft: '38px' }} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('password_label')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={showPass ? 'text' : 'password'} className="form-input" placeholder={t('password_placeholder')} value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingLeft: '38px', paddingRight: '38px' }} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '4px' }} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Signing in...</> : t('btn_login')}
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Secure Login Managed by CivicFix
              </div>
            </form>
          )}

          {/* Google */}
          {tab === 'google' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '20px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Sign in quickly with your Google account. No password needed.
              </div>
              <button onClick={handleGoogle} disabled={loading} className="btn btn-ghost btn-lg" style={{ width: '100%', justifyContent: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🔵</span>
                {loading ? 'Signing in...' : t('btn_google')}
              </button>
            </div>
          )}

          {/* OTP */}
          {tab === 'otp' && (
            <form onSubmit={handleOtpLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">{t('mobile_label')}</label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="tel" className="form-input" placeholder={t('mobile_placeholder')} value={form.phone} onChange={e => set('phone', e.target.value)} style={{ paddingLeft: '38px' }} required />
                </div>
              </div>
              {!otpSent ? (
                <button type="button" className="btn btn-accent btn-lg" onClick={handleSendOtp} disabled={loading}>
                  {loading ? 'Sending...' : t('send_otp')}
                </button>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('otp_label')}</label>
                    <input type="text" className="form-input" placeholder="Enter 6-digit OTP" maxLength={6} value={form.otp} onChange={e => set('otp', e.target.value)} required style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.3em' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Verifying...' : t('verify_otp')}
                  </button>
                
                {/* Dev Tip */}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', padding: '10px', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px dashed rgba(59,130,246,0.2)' }}>
                  💡 {t('login_otp_tip') || 'Development Mode: Use code 123456 to test without actual SMS.'}
                </p>
                </>
              )}
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {t('no_account')}{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>
            {t('register_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
