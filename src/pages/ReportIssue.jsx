import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useIssues } from '../contexts/IssueContext';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import MapView from '../components/MapView';
import { categories, categoryDeptMap, getDepartmentById } from '../data/mockData';
import { MapPin, Navigation, AlertCircle, Search } from 'lucide-react';

export default function ReportIssue() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addIssue } = useIssues();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: '', image: null, imageUrl: null,
    location: null,
  });
  const [gettingLoc, setGettingLoc] = useState(false);
  const [searchingLoc, setSearchingLoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchingLoc(true);
    setSuggestions([]);
    setShowSuggestions(false);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        set('location', { lat: parseFloat(lat), lng: parseFloat(lon), address: display_name });
        toast.success('Location found!');
      } else {
        toast.error('Location not found');
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearchingLoc(false);
    }
  };

  const handleSearchInput = async (val) => {
    setSearchQuery(val);
    if (val.trim().length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch { /* ignore autocomplete errors */ }
  };

  const selectSuggestion = (s) => {
    set('location', { lat: parseFloat(s.lat), lng: parseFloat(s.lon), address: s.display_name });
    setSearchQuery(s.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    toast.success('Location selected!');
  };

  const handleImageChange = (file, url) => set('image', file) || set('imageUrl', url);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setGettingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('location', { lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Current Location' });
        toast.success(t('location_set'));
        setGettingLoc(false);
      },
      () => {
        // Fallback to Chennai center if GPS denied
        set('location', { lat: 13.0827, lng: 80.2707, address: 'Chennai, Tamil Nadu' });
        toast('Using default location (GPS denied)', { icon: '📍' });
        setGettingLoc(false);
      },
      { timeout: 8000 }
    );
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.imageUrl) e.image = t('form_error_image');
    if (!form.location) e.location = t('form_error_location');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('latitude', form.location.lat);
      formData.append('longitude', form.location.lng);
      formData.append('address', form.location.address || '');
      
      if (form.image) {
        formData.append('image', form.image);
      }

      await addIssue(formData);
      toast.success(t('form_success'));
      navigate('/issues');
    } catch (err) {
      toast.error(err.message || 'Failed to report issue');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="page-container" style={{ padding: '90px 0 60px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 className="section-title">{t('report_title')}</h1>
          <p className="section-subtitle">{t('report_subtitle')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '28px', alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-secondary)' }}>📝 Issue Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">{t('issue_title_label')} *</label>
                  <input
                    type="text" className="form-input" placeholder={t('issue_title_placeholder')}
                    value={form.title} onChange={e => set('title', e.target.value)}
                  />
                  {errors.title && <span style={{ color: 'var(--color-danger)', fontSize: '0.78rem' }}>{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">{t('description_label')} *</label>
                  <textarea
                    className="form-input" placeholder={t('description_placeholder')} rows={4}
                    value={form.description} onChange={e => set('description', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.description && <span style={{ color: 'var(--color-danger)', fontSize: '0.78rem' }}>{errors.description}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">{t('category_label')} *</label>
                  <select
                    className="form-input" value={form.category}
                    onChange={e => set('category', e.target.value)}
                  >
                    <option value="">{t('category_placeholder')}</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <span style={{ color: 'var(--color-danger)', fontSize: '0.78rem' }}>{errors.category}</span>}
                </div>

                {/* Department auto-detected by backend */}
              </div>
            </div>

            {/* Image Upload */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-secondary)' }}>📷 Photo Evidence</h3>
              <ImageUpload onImageChange={handleImageChange} required />
              {errors.image && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--color-danger)', fontSize: '0.82rem' }}>
                  <AlertCircle size={14} /> {errors.image}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-secondary)' }}>📍 Location</h3>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text" className="form-input" placeholder="Search for an address or place..."
                    value={searchQuery}
                    onChange={e => handleSearchInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(); } if (e.key === 'Escape') setShowSuggestions(false); }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    style={{ paddingRight: '40px' }}
                  />
                  {searchingLoc && <div className="spinner" style={{ position: 'absolute', right: '12px', top: '12px', width: '16px', height: '16px' }} />}
                  {/* Autocomplete Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
                      background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                      marginTop: '4px',
                    }}>
                      {suggestions.map((s, i) => (
                        <button
                          key={i} type="button"
                          onClick={() => selectSuggestion(s)}
                          style={{
                            width: '100%', textAlign: 'left', background: 'none', border: 'none',
                            padding: '10px 14px', cursor: 'pointer', color: 'var(--text-secondary)',
                            fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '8px',
                            borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px', color: '#3b82f6' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => handleSearchLocation()} className="btn btn-primary" style={{ padding: '0 15px', flexShrink: 0 }}>
                  <Search size={16} />
                </button>
              </div>

              <button
                type="button" onClick={handleGetLocation} disabled={gettingLoc}
                className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
              >
                <Navigation size={15} />
                {gettingLoc ? t('getting_location') : form.location ? t('location_set') : t('get_location')}
              </button>
              {form.location && (
                <div style={{ marginBottom: '12px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.82rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} /> {form.location.address} ({form.location.lat.toFixed(4)}, {form.location.lng.toFixed(4)})
                </div>
              )}
              <MapView lat={form.location?.lat} lng={form.location?.lng} onLocationChange={(loc) => set('location', loc)} draggable height="250px" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Click on map or drag marker to set exact location</p>
              {errors.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--color-danger)', fontSize: '0.82rem' }}>
                  <AlertCircle size={14} /> {errors.location}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={submitting}>
              {submitting ? (
                <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Submitting...</>
              ) : (
                <><MapPin size={16} /> {t('btn_submit')}</>
              )}
            </button>
          </form>

          {/* Right: Tips Panel */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>💡 Tips for a Good Report</h3>
              {[
                { icon: '📸', tip: 'Upload a clear photo of the issue' },
                { icon: '📝', tip: 'Be specific in your description' },
                { icon: '📍', tip: 'Accurate location helps faster response' },
                { icon: '✅', tip: 'Choose the right category for faster routing' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <span>{t.icon}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t.tip}</span>
                </div>
              ))}
            </div>
            <div style={{
              padding: '20px', borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.15))',
              border: '1px solid rgba(59,130,246,0.25)',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔔</div>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>Get Updates</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>You'll receive notifications as your issue is reviewed and resolved.</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 968px) {
          .report-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
