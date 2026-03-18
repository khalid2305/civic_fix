import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useIssues } from '../contexts/IssueContext';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, MessageSquare, ThumbsUp, Plus, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';

const STATUS_CONFIG = {
  'pending':     { color: 'var(--color-warning)', icon: <Clock size={12} />, label: 'Pending' },
  'in-progress': { color: 'var(--color-accent)', icon: <TrendingUp size={12} />, label: 'In Progress' },
  'resolved':    { color: 'var(--text-primary)', icon: <CheckCircle size={12} />, label: 'Resolved' },
  'rejected':    { color: 'var(--color-danger)', icon: <XCircle size={12} />, label: 'Rejected' },
};

export default function UserDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { issues, getIssuesByUser } = useIssues();
  const [showFeedback, setShowFeedback] = useState(false);

  const userId = user?._id || user?.id;
  const myIssues = getIssuesByUser(userId);

  // Live: count issues the user has liked
  const supportedCount = issues.filter(i =>
    Array.isArray(i.supportedUsers) && i.supportedUsers.some(uid => uid === userId || uid?._id === userId)
  ).length;

  // Live: count total comments the user has made across all issues
  const commentsMadeCount = issues.reduce((total, issue) => {
    const userComments = (issue.comments || []).filter(c =>
      c.postedBy === userId || c.postedBy?._id === userId || c.author?._id === userId
    );
    return total + userComments.length;
  }, 0);

  // Build chart data from myIssues
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const m = monthLabels[d.getMonth()];
    const issCount = myIssues.filter(iss => {
      const cd = new Date(iss.createdAt);
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length;
    const resCount = myIssues.filter(iss => {
      const cd = new Date(iss.createdAt);
      return iss.status === 'resolved' && cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length;
    return { month: m, issues: issCount, resolved: resCount };
  });

  const resolvedCount = myIssues.filter(i => i.status === 'resolved').length;

  return (
    <div className="page-container" style={{ padding: '90px 0 60px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="section-title">{t('dashboard_title')}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Hello, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> 👋</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowFeedback(true)}
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Star size={16} color="#f59e0b" /> Rate This App
            </button>
            <Link to="/report" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} /> {t('nav_report')}
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { icon: <TrendingUp size={22} />, label: 'Issues Reported', value: myIssues.length, color: 'var(--text-primary)' },
            { icon: <CheckCircle size={22} />, label: 'Resolved', value: resolvedCount, color: 'var(--text-primary)' },
            { icon: <ThumbsUp size={22} />, label: 'Issues Supported', value: supportedCount, color: 'var(--text-primary)' },
            { icon: <MessageSquare size={22} />, label: 'Comments Made', value: commentsMadeCount, color: 'var(--text-primary)' },
          ].map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                background: `${s.color}18`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          {/* My Issues */}
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📋 {t('my_issues')}
              <span style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '99px', padding: '1px 10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{myIssues.length}</span>
            </h2>

            {myIssues.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>You haven't reported any issues yet</p>
                <Link to="/report" className="btn btn-primary">Report Your First Issue</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myIssues.map(issue => {
                  const sc = STATUS_CONFIG[issue.status] || STATUS_CONFIG['pending'];
                  const commentCount = (issue.comments || []).length;
                  return (
                    <Link key={issue.id || issue._id} to={`/issues/${issue.id || issue._id}`} style={{ textDecoration: 'none' }}>
                      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                      >
                        <img src={issue.imageUrl} alt="" style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.title}</div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: `${sc.color}18`, color: sc.color, border: `1px solid ${sc.color}30`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {sc.icon} {issue.status}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{issue.category}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#8b5cf6', fontWeight: 700 }}>
                            <ThumbsUp size={13} /> {issue.supportCount || 0}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#3b82f6', fontWeight: 600 }}>
                            <MessageSquare size={13} /> {commentCount}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Profile + Chart + Feedback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Profile Card */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 12px',
                background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: 900, color: 'white',
                boxShadow: '0 8px 25px rgba(59,130,246,0.4)',
              }}>
                {(user?.name?.[0] || '?').toUpperCase()}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '12px' }}>{user?.email}</div>
              <span className="badge badge-blue" style={{ marginBottom: '16px', display: 'inline-block' }}>{user?.role === 'admin' ? 'Admin' : 'Citizen'}</span>
              <button
                onClick={() => setShowFeedback(true)}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}
              >
                <Star size={14} color="#f59e0b" /> Rate This App
              </button>
            </div>

            {/* Resolution Progress */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>📊 Resolution Progress</h3>
              {myIssues.length > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resolved</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                      {resolvedCount}/{myIssues.length}
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      width: `${Math.round((resolvedCount / myIssues.length) * 100)}%`,
                      background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                    {Math.round((resolvedCount / myIssues.length) * 100)}% resolved
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No issues reported yet</p>
              )}
            </div>

            {/* Activity Chart */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>📈 {t('activity_label')}</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f4ff', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="issues" stroke="var(--text-primary)" strokeWidth={2} dot={{ fill: 'var(--text-primary)', strokeWidth: 0, r: 3 }} name="Reported" />
                  <Line type="monotone" dataKey="resolved" stroke="var(--text-secondary)" strokeWidth={2} dot={{ fill: 'var(--text-secondary)', strokeWidth: 0, r: 3 }} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 700 }}>● Reported</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>● Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      <style>{`
        @media (max-width: 900px) {
          .container > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
          .container > div:nth-child(3) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          .container > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
