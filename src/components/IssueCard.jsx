import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, MessageSquare, MapPin, Calendar, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { getDepartmentById } from '../data/mockData';

const STATUS_CONFIG = {
  'pending':     { color: 'var(--color-warning)', icon: <Clock size={12} />, label: 'Pending' },
  'in-progress': { color: 'var(--color-accent)', icon: <TrendingUp size={12} />, label: 'In Progress' },
  'resolved':    { color: 'var(--text-primary)', icon: <CheckCircle size={12} />, label: 'Resolved' },
  'rejected':    { color: 'var(--color-danger)', icon: <XCircle size={12} />, label: 'Rejected' },
};

export default function IssueCard({ issue }) {
  const { t } = useTranslation();
  const dept = issue.department;

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const currentStatusKey = (issue.status || 'pending').toLowerCase();
  const statusInfo = STATUS_CONFIG[currentStatusKey] || { color: 'var(--text-muted)', icon: null, label: t('status_unknown') || 'Unknown' };

  return (
    <div className="glass-card issue-card" style={{ overflow: 'hidden' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
        <img
          src={issue.imageUrl}
          alt={issue.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onError={e => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/600x400/1e293b/a8b2d1?text=No+Image+Available';
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,11,20,0.8) 0%, transparent 60%)'
        }} />
        {/* Status Badge */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', borderRadius: '99px',
            background: `${statusInfo.color}20`, border: `1px solid ${statusInfo.color}40`,
            fontSize: '0.72rem', fontWeight: 700, color: statusInfo.color,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {statusInfo.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{statusInfo.icon}</span>}
            {statusInfo.label}
          </span>
        </div>
        {/* Category */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
          <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>{issue.category}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px' }}>
        {/* Department */}
        {dept && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', borderRadius: '99px', marginBottom: '10px',
            background: `${dept.color}20`, border: `1px solid ${dept.color}40`,
            fontSize: '0.72rem', fontWeight: 700, color: dept.color,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dept?.color || '#3b82f6' }} />
            {dept?.short || dept?.name}
          </div>
        )}

        <h3 style={{
          fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px',
          color: 'var(--text-primary)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {issue.title}
        </h3>

        {/* Location & Date */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <MapPin size={11} /> Chennai
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Calendar size={11} /> {formatDate(issue.createdAt)}
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>
              <ThumbsUp size={13} /> {issue.supportCount}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <MessageSquare size={13} /> {issue.comments?.length || 0}
            </span>
          </div>
          <Link
            to={`/issues/${issue.id}`}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              color: 'white', textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {t('view_details')}
          </Link>
        </div>
      </div>
    </div>
  );
}
