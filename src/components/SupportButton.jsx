import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIssues } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SupportButton({ issue }) {
  const { t } = useTranslation();
  const { supportIssue } = useIssues();
  const { user } = useAuth();
  const [animating, setAnimating] = useState(false);

  const supported = issue.supportedUsers?.includes(user?.id || user?._id);

  const handleSupport = () => {
    if (!user) { toast.error('Please login to support issues'); return; }
    setAnimating(true);
    supportIssue(issue._id || issue.id);
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      onClick={handleSupport}
      className={`support-btn ${supported ? 'supported' : ''}`}
      style={{
        transform: animating ? 'scale(1.15)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <ThumbsUp size={18} fill={supported ? '#3b82f6' : 'none'} />
      <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{issue.supportCount}</span>
      <span>{supported ? t('supported_btn') : t('support_btn')}</span>
    </button>
  );
}
