import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, Users, Target, Award, Heart } from 'lucide-react';

const team = [
  { name: 'Priya Sharma', role: 'Lead Developer', avatar: 'PS', color: '#3b82f6' },
  { name: 'Arjun Kumar', role: 'UX Designer', avatar: 'AK', color: '#8b5cf6' },
  { name: 'Ravi Selvam', role: 'Backend Engineer', avatar: 'RS', color: '#10b981' },
];

export default function About() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you shortly.');
    setForm({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <div className="page-container" style={{ padding: '80px 0 60px' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏛️</div>
          <h1 className="section-title" style={{ fontSize: '2.5rem' }}>{t('about_title')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            {t('about_subtitle')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '99px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', marginBottom: '16px' }}>
                <Target size={12} /> Our Mission
              </div>
              <h2 className="section-title">{t('mission_title')}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
                {t('mission_text')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                We believe that every citizen deserves a clean, safe, and functional city. By providing a transparent platform for reporting and tracking civic issues, we create accountability and drive meaningful change.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: <Users size={20} />, title: 'Citizen-First', desc: 'Built for everyday citizens to make their voices heard', color: '#3b82f6' },
                { icon: <Target size={20} />, title: 'Transparent', desc: 'Every issue is tracked publicly with real-time status updates', color: '#8b5cf6' },
                { icon: <Award size={20} />, title: 'Accountable', desc: 'Departments are held responsible for timely resolutions', color: '#10b981' },
                { icon: <Heart size={20} />, title: 'Community-Driven', desc: 'Issues supported by more citizens get prioritized faster', color: '#f59e0b' },
              ].map((v, i) => (
                <div key={i} className="glass-card" style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${v.color}20`, border: `1px solid ${v.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: v.color, flexShrink: 0 }}>
                    {v.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '3px' }}>{v.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '60px 0', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="section-title">Meet the Team</h2>
          </div>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {team.map((m, i) => (
              <div key={i} className="glass-card" style={{ padding: '28px', textAlign: 'center', minWidth: '200px', flex: '1', maxWidth: '240px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 14px',
                  background: `linear-gradient(135deg, ${m.color}, ${m.color}80)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 900, color: 'white',
                  boxShadow: `0 8px 20px ${m.color}40`,
                }}>
                  {m.avatar}
                </div>
                <div style={{ fontWeight: 800, marginBottom: '4px' }}>{m.name}</div>
                <div style={{ fontSize: '0.8rem', color: m.color, fontWeight: 700 }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            <div>
              <h2 className="section-title">{t('contact_title')}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.7 }}>
                Have questions or feedback? We'd love to hear from you. Our team typically responds within 24 hours.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: <Mail size={18} />, label: 'Email', value: 'hello@civicfix.in', color: '#3b82f6' },
                  { icon: <Phone size={18} />, label: 'Phone', value: '+91 98765 43210', color: '#10b981' },
                  { icon: <MapPin size={18} />, label: 'Office', value: 'Chennai, Tamil Nadu 600001', color: '#8b5cf6' },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${c.color}20`, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">{t('contact_name')}</label>
                  <input type="text" className="form-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('contact_email')}</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('contact_message')}</label>
                  <textarea className="form-input" placeholder="Your message..." rows={4} value={form.message} onChange={e => set('message', e.target.value)} required style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={sending} style={{ justifyContent: 'center' }}>
                  {sending ? 'Sending...' : <><Send size={15} /> {t('contact_send')}</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
