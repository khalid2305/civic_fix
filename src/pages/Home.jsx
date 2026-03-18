import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIssues } from '../contexts/IssueContext';
import IssueCard from '../components/IssueCard';
import { ArrowRight, Zap, Users, CheckCircle, Building2, TrendingUp, MapPin, ShieldCheck } from 'lucide-react';

const categoryIcons = {
  'Roads & Potholes': '🛣️',
  'Water Supply': '💧',
  'Electricity': '⚡',
  'Garbage & Sanitation': '♻️',
  'Parks & Recreation': '🌳',
  'Street Lights': '💡',
  'Drainage': '🌊',
  'Other': '📌',
};

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}</span>;
}

export default function Home() {
  const { t } = useTranslation();
  const { getTrendingIssues, issues } = useIssues();
  const trending = getTrendingIssues(6);

  const categories = Object.entries(categoryIcons);

  return (
    <div className="page-container">
      {/* ===== HERO ===== */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'var(--bg-primary)',
        paddingTop: '80px',
      }}>
        {/* Animated gradient blobs */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'var(--bg-glass)',
          filter: 'blur(80px)', animation: 'float 6s ease-in-out infinite',
          opacity: 0.3,
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '5%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'var(--bg-glass)',
          filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite reverse',
          opacity: 0.3,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '60px 24px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '99px',
            background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
            fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: '28px',
            animation: 'fadeInUp 0.5s ease',
          }}>
            <Zap size={13} fill="var(--text-primary)" /> Smart Civic Complaint System
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 900,
            lineHeight: 1.08, marginBottom: '24px', letterSpacing: '-0.03em',
            animation: 'fadeInUp 0.6s ease 0.1s both',
          }}>
            {t('hero_title')}<br />
            <span style={{
              background: 'var(--text-primary)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              opacity: 0.8,
            }}>
              {t('hero_title2')}
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'var(--text-secondary)',
            maxWidth: '580px', margin: '0 auto 40px', lineHeight: 1.7,
            animation: 'fadeInUp 0.6s ease 0.2s both',
          }}>
            {t('hero_subtitle')}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
            <Link to="/report" className="btn btn-primary btn-lg" style={{ gap: '10px' }}>
              <MapPin size={18} /> {t('hero_cta')}
            </Link>
            <Link to="/issues" className="btn btn-ghost btn-lg" style={{ gap: '10px' }}>
              {t('hero_cta2')} <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px',
            marginTop: '70px', maxWidth: '800px', margin: '70px auto 0',
            animation: 'fadeInUp 0.6s ease 0.4s both',
          }}>
            {[
              { icon: <TrendingUp size={20} />, num: issues.length, label: t('stats_issues'), color: 'var(--text-primary)' },
              { icon: <CheckCircle size={20} />, num: issues.filter(i => ['Resolved', 'resolved'].includes(i.status)).length, label: t('stats_resolved'), color: 'var(--text-primary)' },
              { icon: <Users size={20} />, num: 5420, label: t('stats_citizens'), color: 'var(--text-primary)' },
              { icon: <Building2 size={20} />, num: 6, label: t('stats_depts'), color: 'var(--text-primary)' },
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ color: s.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{
                  fontSize: '2rem', fontWeight: 900, color: s.color,
                  lineHeight: 1, marginBottom: '4px'
                }}>
                  <AnimatedCounter target={s.num} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRENDING ISSUES ===== */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 14px', borderRadius: '99px',
              background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px',
            }}>
              🔥 {t('trending_title')}
            </div>
            <h2 className="section-title">{t('trending_title')}</h2>
            <p className="section-subtitle">{t('trending_subtitle')}</p>
          </div>
          <div className="grid-3">
            {trending.map((issue, i) => (
              <div key={issue.id} style={{ animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
                <IssueCard issue={issue} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/issues" className="btn btn-ghost btn-lg">
              View All Issues <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section style={{ padding: '60px 0', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Issue Categories</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>Browse issues by department</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
            {categories.map(([cat, icon]) => (
              <Link key={cat} to={`/issues?category=${encodeURIComponent(cat)}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{cat}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">{t('how_it_works')}</h2>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '📸', title: t('step1_title'), desc: t('step1_desc'), color: 'var(--text-primary)' },
              { step: '02', icon: '📍', title: t('step2_title'), desc: t('step2_desc'), color: 'var(--text-primary)' },
              { step: '03', icon: '✅', title: t('step3_title'), desc: t('step3_desc'), color: 'var(--text-primary)' },
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: `${s.color}20`, border: `2px solid ${s.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', margin: '0 auto 16px',
                }}>
                  {s.icon}
                </div>
                <div style={{ color: s.color, fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  STEP {s.step}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            borderRadius: 'var(--radius-xl)', padding: '60px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px',
              borderRadius: '50%', background: 'var(--bg-glass)', filter: 'blur(60px)',
            }} />
            <ShieldCheck size={48} color="var(--text-primary)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '16px' }}>
              Be the Change Your City Needs
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
              Every report makes a difference. Join thousands of citizens already making their communities better.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
