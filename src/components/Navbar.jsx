import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPin, Bell, User, LogOut, LayoutDashboard,
  Shield, Menu, X, Globe, ChevronDown, AlertCircle, Plus
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const toggleLang = (lang) => {
    i18n.changeLanguage(lang);
    setLangMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav_home') },
    { path: '/issues', label: t('nav_issues') },
    ...(!isAdmin ? [{ path: '/about', label: t('nav_about') }] : []),
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(7,11,20,0.95)' : 'rgba(7,11,20,0.6)',
      backdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      height: '70px',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
          }}>
            <MapPin size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            Civic<span style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fix</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              padding: '8px 14px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
              color: isActive(link.path) ? 'var(--color-primary-light)' : 'var(--text-secondary)',
              background: isActive(link.path) ? 'rgba(59,130,246,0.15)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none',
            }}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{
              padding: '8px 14px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
              color: isActive('/admin') ? '#a78bfa' : 'var(--text-secondary)',
              background: isActive('/admin') ? 'rgba(139,92,246,0.15)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Shield size={14} /> {t('nav_admin')}
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} ref={userMenuRef}>
          {/* Report Button */}
          {user && (
            <Link to="/report" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> {t('nav_report')}
            </Link>
          )}

          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setLangMenuOpen(!langMenuOpen); setUserMenuOpen(false); }}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Globe size={14} />
              {i18n.language === 'ta' ? 'தமிழ்' : 'EN'}
              <ChevronDown size={12} />
            </button>
            {langMenuOpen && (
              <div className="dropdown">
                <button className="dropdown-item" onClick={() => toggleLang('en')}>🇬🇧 English</button>
                <button className="dropdown-item" onClick={() => toggleLang('ta')}>🇮🇳 தமிழ்</button>
              </div>
            )}
          </div>

          {/* User Menu / Auth */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setLangMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                  borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: 'white'
                }}>
                  {user.avatar || user.name?.[0]}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>
                <ChevronDown size={12} color="var(--text-muted)" />
              </button>
              {userMenuOpen && (
                <div className="dropdown">
                  <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</div>
                    {isAdmin && <span className="badge badge-purple" style={{ marginTop: '4px' }}>Admin</span>}
                  </div>
                  <button className="dropdown-item" onClick={() => { navigate('/dashboard'); setUserMenuOpen(false); }}>
                    <LayoutDashboard size={14} /> {t('nav_dashboard')}
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={14} color="#ef4444" /> <span style={{ color: '#ef4444' }}>{t('nav_logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">{t('nav_login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t('nav_register')}</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', padding: '8px', color: 'var(--text-primary)', background: 'none', border: 'none' }}
            className="mobile-menu-toggle"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(7,11,20,0.98)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-glass)', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 16px', borderRadius: '8px', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/report" onClick={() => setMenuOpen(false)}
                style={{ padding: '12px 16px', borderRadius: '8px', color: 'var(--color-primary-light)', textDecoration: 'none' }}>
                + {t('nav_report')}
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}
                  style={{ padding: '12px 16px', borderRadius: '8px', color: '#a78bfa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={14} /> {t('nav_admin')}
                </Link>
              )}
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                style={{ padding: '12px 16px', borderRadius: '8px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {t('nav_dashboard')}
              </Link>
              <button onClick={handleLogout} style={{ padding: '12px 16px', borderRadius: '8px', color: '#ef4444', textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                {t('nav_logout')}
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
