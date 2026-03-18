import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIssues } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommentSection({ issue }) {
  const { t } = useTranslation();
  const { addComment } = useIssues();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!text.trim()) return;
    if (!user) { toast.error('Please login to comment'); return; }
    setPosting(true);
    try {
      await addComment(issue._id || issue.id, text.trim());
      setText('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        💬 {t('comments_title')} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({issue.comments?.length || 0})</span>
      </h3>

      {/* Add comment */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px',
        padding: '16px', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: user ? 'var(--text-primary)' : 'var(--bg-glass)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.8rem', color: 'var(--bg-primary)',
        }}>
          {(user?.name?.[0] || '?').toUpperCase()}
        </div>
        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={user ? t('add_comment') : 'Login to add a comment...'}
            disabled={!user}
            rows={2}
            className="form-input"
            style={{ flex: 1, resize: 'vertical', minHeight: '60px' }}
          />
          <button
            onClick={handlePost}
            disabled={!text.trim() || posting || !user}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', opacity: !text.trim() || !user ? 0.5 : 1 }}
          >
            {posting ? '...' : <><Send size={14} /> {t('post_comment')}</>}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {issue.comments?.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '30px', color: 'var(--text-muted)',
          background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass)',
        }}>
          No comments yet. Be the first to comment!
        </div>
      )}
      {[...(issue.comments || [])].map(comment => (
        <div key={comment._id || comment.id} className="comment-item">
          <div className="comment-avatar">{(comment.userId?.name?.[0] || comment.userName?.[0] || '?').toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div className="comment-meta">
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{comment.userId?.name || comment.userName}</strong>
              &nbsp;·&nbsp;{formatDate(comment.createdAt)}
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}