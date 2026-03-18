import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config';
import { MessageSquare, Star, ArrowLeft, RefreshCw, Download, Search, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: { color: 'var(--color-warning)', bg: 'var(--bg-glass)' },
  reviewed: { color: 'var(--color-accent)', bg: 'var(--bg-glass)' },
  resolved: { color: 'var(--text-primary)', bg: 'var(--bg-glass)' },
};

function StarDisplay({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          color={i < rating ? 'var(--text-primary)' : 'var(--text-muted)'}
          fill={i < rating ? 'var(--text-primary)' : 'transparent'}
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
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
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
    { label: 'Total Submissions', value: feedback.length, color: 'var(--text-primary)', icon: <MessageSquare size={20} /> },
    { label: 'Avg Rating', value: `${avgRating} ⭐`, color: 'var(--text-primary)', icon: <Star size={20} /> },
    { label: 'Pending Review', value: feedback.filter(f => f.status === 'pending').length, color: 'var(--color-danger)', icon: <Clock size={20} /> },
    { label: 'Resolved', value: feedback.filter(f => f.status === 'resolved').length, color: 'var(--text-primary)', icon: <CheckCircle size={20} /> },
  ];

  return (
    <div className="page-container" style={{ padding: '90px 0 60px', background: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }}>
                <MessageSquare size={22} color="var(--bg-primary)" />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Citizen Feedback</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleRefresh} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw size={16} /> Refresh</button>
            <button onClick={handleExport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={16} /> Export CSV</button>
          </div>
        </div>

        <div className="grid-mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {statCards.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ color: s.color, background: `${s.color}18`, padding: '8px', borderRadius: '10px' }}>{s.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{s.value}</div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search by name or message..." className="form-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '34px', height: '38px', fontSize: '0.85rem' }} />
          </div>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ minWidth: '160px', padding: '8px 12px', height: '38px', fontSize: '0.85rem' }}>
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
          <select className="form-input" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={{ minWidth: '140px', padding: '8px 12px', height: '38px', fontSize: '0.85rem' }}>
            <option value="All">All Ratings</option>
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredFeedback.map((fb, idx) => {
            const ss = STATUS_COLORS[fb.status] || STATUS_COLORS.pending;
            return (
              <div key={idx} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: 'var(--bg-primary)', flexShrink: 0 }}>
                      {(fb.userId?.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{fb.userId?.name || 'Anonymous Citizen'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>{fb.userId?.email || 'No email'} &nbsp;·&nbsp; {new Date(fb.createdAt).toLocaleString()}</div>
                      <StarDisplay rating={fb.rating} />
                    </div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: ss.color, background: ss.bg, border: `1px solid ${ss.color}30` }}>{fb.status}</span>
                </div>
                <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', borderLeft: `3px solid var(--text-primary)`, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{fb.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
