import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Star, ArrowLeft, RefreshCw, Download, Search, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  reviewed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

function StarDisplay({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          color={i < rating ? '#f59e0b' : '#374151'}
          fill={i < rating ? '#f59e0b' : 'transparent'}
        />
      ))}
      <span style={{ marginLeft: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        {rating}/5
      </span>
    </div>
  );
}

export default function AdminFeedback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('civicfix_token') || user?.token;
      const res = await fetch('http://localhost:5000/api/feedback', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch feedback');
      const data = await res.json();
      setFeedback(data);
    } catch (e) {
      toast.error('Could not load feedback');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const handleRefresh = () => {
    toast.promise(fetchFeedback(), {
      loading: 'Refreshing...', success: 'Feedback Refreshed!', error: 'Refresh Failed'
    });
  };

  const handleExport = () => {
    if (!feedback.length) { toast.error('No feedback to export'); return; }
    const headers = ['Date', 'Name', 'Email', 'Rating', 'Message', 'Status'];
    const rows = filteredFeedback.map(fb => [
      new Date(fb.createdAt).toLocaleDateString(),
      fb.userId?.name || 'Anonymous',
      fb.userId?.email || 'N/A',
      fb.rating,
      `"${fb.message.replace(/"/g, '""')}"`,
      fb.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `civicfix_feedback_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFeedback = feedback.filter(fb => {
    const matchSearch = (fb.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || fb.status === statusFilter;
    const matchRating = ratingFilter === 'All' || fb.rating === parseInt(ratingFilter);
    return matchSearch && matchStatus && matchRating;
  });

  const avgRating = feedback.length
    ? (feedback.reduce((s, fb) => s + fb.rating, 0) / feedback.length).toFixed(1)
    : 0;

  const statCards = [
    { label: 'Total Submissions', value: feedback.length, color: '#3b82f6', icon: <MessageSquare size={20} /> },
    { label: 'Avg Rating', value: `${avgRating} ⭐`, color: '#f59e0b', icon: <Star size={20} /> },
    { label: 'Pending Review', value: feedback.filter(f => f.status === 'pending').length, color: '#ef4444', icon: <Clock size={20} /> },
    { label: 'Resolved', value: feedback.filter(f => f.status === 'resolved').length, color: '#10b981', icon: <CheckCircle size={20} /> },
  ];

  return (
    <div className="page-container" style={{ padding: '90px 0 60px', background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 50%)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <button
              onClick={() => navigate('/admin')}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 8px 20px rgba(139,92,246,0.3)' }}>
                <MessageSquare size={22} color="white" />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                Citizen Feedback
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Review, filter and manage feedback submitted by citizens.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleRefresh} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button onClick={handleExport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid-mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {statCards.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px', animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ color: s.color, background: `${s.color}18`, padding: '8px', borderRadius: '10px' }}>{s.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{s.value}</div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or message..."
              className="form-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '34px', height: '38px', fontSize: '0.85rem' }}
            />
          </div>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ minWidth: '160px', padding: '8px 12px', height: '38px', fontSize: '0.85rem' }}>
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
          <select className="form-input" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
            style={{ minWidth: '140px', padding: '8px 12px', height: '38px', fontSize: '0.85rem' }}>
            <option value="All">All Ratings</option>
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
          </select>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading citizen feedback...</p>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No feedback found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredFeedback.map((fb, idx) => {
              const ss = STATUS_COLORS[fb.status] || STATUS_COLORS.pending;
              return (
                <div
                  key={fb._id}
                  className="glass-card"
                  style={{ padding: '24px', animation: `fadeInUp 0.4s ease ${idx * 0.05}s both`, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    {/* Left: Avatar + Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', fontWeight: 800, color: 'white', flexShrink: 0
                      }}>
                        {(fb.userId?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                          {fb.userId?.name || 'Anonymous Citizen'}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
                          {fb.userId?.email || 'No email'} &nbsp;·&nbsp; {new Date(fb.createdAt).toLocaleString()}
                        </div>
                        <StarDisplay rating={fb.rating} />
                      </div>
                    </div>

                    {/* Right: Status Badge */}
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      color: ss.color, background: ss.bg, border: `1px solid ${ss.color}30`,
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {fb.status}
                    </span>
                  </div>

                  {/* Message Body */}
                  <div style={{
                    marginTop: '16px', padding: '16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${ss.color}60`,
                    color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7
                  }}>
                    {fb.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
