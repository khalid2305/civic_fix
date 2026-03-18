import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, Users, Target, Award, Heart } from 'lucide-react';

const team = [
  { name: 'Priya Sharma', role: 'Lead Developer', avatar: 'PS', color: 'var(--text-primary)' },
  { name: 'Arjun Kumar', role: 'UX Designer', avatar: 'AK', color: 'var(--text-secondary)' },
  { name: 'Ravi Selvam', role: 'Backend Engineer', avatar: 'RS', color: 'var(--text-muted)' },
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
        background: 'var(--bg-glass)',
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '99px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
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
                { icon: <Users size={20} />, title: 'Citizen-First', desc: 'Built for everyday citizens to make their voices heard', color: 'var(--text-primary)' },
                { icon: <Target size={20} />, title: 'Transparent', desc: 'Every issue is tracked publicly with real-time status updates', color: 'var(--text-primary)' },
                { icon: <Award size={20} />, title: 'Accountable', desc: 'Departments are held responsible for timely resolutions', color: 'var(--text-primary)' },
                { icon: <Heart size={20} />, title: 'Community-Driven', desc: 'Issues supported by more citizens get prioritized faster', color: 'var(--text-primary)' },
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
                  background: 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 900, color: 'var(--bg-primary)',
                  boxShadow: 'var(--shadow-md)',
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
      {/* Contact Info ONLY */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">{t('contact_title')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 40px' }}>
            Have questions or feedback? We'd love to hear from you. Our team typically responds within 24 hours.
          </p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: <Mail size={20} />, label: 'Email', value: 'hello@civicfix.in' },
              { icon: <Phone size={20} />, label: 'Phone', value: '+91 98765 43210' },
              { icon: <MapPin size={20} />, label: 'Office', value: 'Chennai, Tamil Nadu 600001' },
            ].map((c, i) => (
              <div key={i} className="glass-card" style={{ padding: '24px', minWidth: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', flexShrink: 0 }}>
                  {c.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
