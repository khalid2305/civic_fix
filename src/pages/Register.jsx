import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Smartphone, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password);
      toast.success('Account created! Welcome to CivicFix!');
      navigate('/');
    } catch { toast.error('Registration failed'); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '90px 24px 40px',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'var(--bg-glass)', filter: 'blur(80px)', pointerEvents: 'none', opacity: 0.5 }} />

      <div style={{ width: '100%', maxWidth: '460px', animation: 'fadeInUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 16px',
            background: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
          }}>
            <User size={24} color="var(--bg-primary)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>{t('register_title')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('register_subtitle')}</p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">{t('name_label')}</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" placeholder={t('name_placeholder')} value={form.name} onChange={e => set('name', e.target.value)} style={{ paddingLeft: '38px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('email_label')}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="form-input" placeholder={t('email_placeholder')} value={form.email} onChange={e => set('email', e.target.value)} style={{ paddingLeft: '38px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('mobile_label')}</label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} style={{ paddingLeft: '38px' }} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">{t('password_label')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min 6 chars" value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingLeft: '38px' }} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} style={{ paddingLeft: '38px' }} required />
                </div>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input type="checkbox" onChange={e => setShowPass(e.target.checked)} />
              Show passwords
            </label>

            <button type="submit" className="btn btn-accent btn-lg" style={{ marginTop: '4px' }} disabled={loading}>
              {loading ? 'Creating account...' : t('btn_register')}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {t('have_account')}{' '}
          <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>
            {t('login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
