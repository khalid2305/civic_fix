import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIssues } from '../contexts/IssueContext';
import SupportButton from '../components/SupportButton';
import CommentSection from '../components/CommentSection';
import MapView from '../components/MapView';
import { MapPin, Calendar, User, ArrowLeft, Building2, Trash2, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const statusColors = {
  'pending': { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: 'rgba(245,158,11,0.4)' },
  'in-progress': { bg: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: 'rgba(139,92,246,0.4)' },
  'resolved': { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: 'rgba(16,185,129,0.4)' },
  'rejected': { bg: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
  'Pending': { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: 'rgba(245,158,11,0.4)' },
  'Open': { bg: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: 'rgba(59,130,246,0.4)' },
  'In Progress': { bg: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: 'rgba(139,92,246,0.4)' },
  'Resolved': { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: 'rgba(16,185,129,0.4)' },
};

export default function IssueDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { issues, fetchIssueById, fetchComments, deleteIssue } = useIssues();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return;
    const success = await deleteIssue(id);
    if (success) navigate('/issues');
  };
  const issue = issues.find(i => i.id === id || i._id === id);
  const [loading, setLoading] = useState(!issue);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!issue) setLoading(true);
      try {
        await fetchIssueById(id);
        await fetchComments(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: '40px', height: '40px' }} />
    </div>
  );

  if (error || !issue) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '4rem' }}>😕</div>
      <h2>{error || 'Issue not found'}</h2>
      <button className="btn btn-primary" onClick={() => navigate('/issues')}>← Back to Issues</button>
    </div>
  );

  const dept = issue.department;
  const sc = statusColors[issue.status] || statusColors['pending'];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="page-container" style={{ padding: '80px 0 60px' }}>
      <div className="container">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid-mobile-col" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>
          {/* Left Column */}
          <div>
            {/* Issue Image */}
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
              <img src={issue.imageUrl} alt={issue.title} style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(7,11,20,0.9) 0%, transparent 50%)'
              }} />
              {/* Overlaid Status + Category */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                <span style={{
                  padding: '5px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                  background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                }}>
                  ● {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                </span>
                <span className="badge badge-gray">{issue.category}</span>
              </div>
            </div>

            {/* Title and Meta */}
            <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.3, marginBottom: '16px' }}>
                {issue.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <User size={14} color="var(--color-primary-light)" />
                  <span>{t('by')} <strong style={{ color: 'var(--text-primary)' }}>{issue.createdBy?.name || issue.reporterName}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Calendar size={14} color="var(--color-primary-light)" />
                  <span>{formatDate(issue.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '360px' }}>
                  <MapPin size={14} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.address || `${issue.latitude?.toFixed(4)}, ${issue.longitude?.toFixed(4)}`}
                  </span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '24px' }}>
                {issue.description}
              </p>

              {/* Department */}
              {dept && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 18px', borderRadius: 'var(--radius-md)',
                  background: `${dept.color}15`, border: `1px solid ${dept.color}30`, marginBottom: '20px',
                }}>
                  <Building2 size={20} color={dept.color} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Assigned Department</div>
                    <div style={{ fontWeight: 800, color: dept?.color || '#3b82f6' }}>{dept?.name}</div>
                  </div>
                </div>
              )}

              {/* Support Button */}
              <div className="flex-mobile-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <SupportButton issue={issue} />
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleShare} className="btn btn-ghost btn-sm" style={{ gap: '8px' }}>
                    <Share2 size={16} /> {t('issue_share') || 'Share'}
                  </button>

                  {(user?.id === (issue.createdBy?._id || issue.createdBy) || user?._id === (issue.createdBy?._id || issue.createdBy) || isAdmin) && (
                    <button 
                      onClick={handleDelete}
                      className="btn btn-ghost btn-sm" 
                      style={{ gap: '8px', color: '#ef4444', height: '42px', padding: '0 16px', borderRadius: '12px' }}
                    >
                      <Trash2 size={16} /> {t('delete_issue') || 'Delete Issue'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--color-primary)" /> {t('issue_location')}
              </h3>
              {issue.latitude && (
                <MapView lat={issue.latitude} lng={issue.longitude} height="280px" />
              )}
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <MapPin size={12} style={{ flexShrink: 0, marginTop: '1px', color: '#3b82f6' }} />
                <span>
                  {issue.address
                    ? issue.address.length > 120 ? issue.address.slice(0, 120) + '...' : issue.address
                    : `${issue.latitude?.toFixed(4)}, ${issue.longitude?.toFixed(4)}`
                  }
                </span>
              </p>
            </div>

            {/* Comments */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <CommentSection issue={issue} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Stats Card */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Issue Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Community Support', value: issue.supportCount, icon: '👍', color: 'var(--color-primary)' },
                  { label: 'Comments', value: issue.comments?.length || 0, icon: '💬', color: 'var(--color-accent)' },
                  { label: 'Days Open', value: Math.ceil((Date.now() - new Date(issue.createdAt)) / 86400000), icon: '📅', color: '#f59e0b' },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {s.icon} {s.label}
                    </span>
                    <span style={{ fontWeight: 900, fontSize: '1.3rem', color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Status Timeline</h3>
              {['Pending', 'In Progress', 'Resolved'].map((s, i) => {
                const stepKeys = ['pending', 'in-progress', 'resolved'];
                const legacyStepKeys = ['Pending', 'In Progress', 'Resolved'];
                const issueStatusRaw = issue.status;
                const normalizedStatus = issueStatusRaw.toLowerCase() === 'open' ? 'pending' : issueStatusRaw.toLowerCase();
                
                let currentIdx = stepKeys.indexOf(normalizedStatus);
                if (currentIdx === -1) currentIdx = legacyStepKeys.indexOf(issueStatusRaw); // fallback for legacy mock tags
                if (currentIdx === -1 && normalizedStatus === 'rejected') currentIdx = 0; // if rejected, only pending is done

                const isDone = i <= currentIdx;
                const isCurrent = currentIdx === i || (normalizedStatus === 'rejected' && i === 0);
                const col = statusColors[stepKeys[i]];
                
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 2 ? '0' : '0', paddingBottom: i < 2 ? '16px' : '0', position: 'relative' }}>
                    {i < 2 && (
                      <div style={{ position: 'absolute', left: '10px', top: '22px', width: '2px', height: '24px', background: isDone ? (col?.color || '#3b82f6') : 'var(--border-glass)' }} />
                    )}
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: isDone ? (col?.color || '#3b82f6') : 'var(--bg-glass)',
                      border: `2px solid ${isDone ? (col?.color || '#3b82f6') : 'var(--border-glass)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCurrent ? `0 0 12px ${col?.color}80` : 'none',
                    }}>
                      {isDone && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div style={{ paddingTop: '2px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 800 : 500, color: isCurrent ? col?.color : (isDone ? 'var(--text-secondary)' : 'var(--text-muted)') }}>
                        {s} {isCurrent && normalizedStatus === 'rejected' && <span style={{color: '#ef4444'}}>(Rejected)</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
