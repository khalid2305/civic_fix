import { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeedbackModal({ onClose }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    if (!message.trim()) { toast.error('Please write a feedback message'); return; }
    setSubmitting(true);

    try {
      const token = localStorage.getItem('civicfix_token');
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, message })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit feedback');
      }

      toast.success('Thank you for your feedback! 🙏');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '480px', padding: '32px',
        animation: 'fadeInUp 0.3s ease',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            width: '32px', height: '32px', borderRadius: '50%',
            cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💬</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '6px' }}>Rate Our App</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Help us improve CivicFix with your honest feedback!
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Star Rating */}
          <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Rating
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px', transition: 'transform 0.2s ease',
                    transform: (hovered || rating) >= n ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  <Star
                    size={36}
                    fill={(hovered || rating) >= n ? '#f59e0b' : 'transparent'}
                    color={(hovered || rating) >= n ? '#f59e0b' : '#374151'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
                {ratingLabels[hovered || rating]}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="form-group">
            <label className="form-label">Your Feedback</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Tell us what you liked or what we can improve..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {submitting ? (
              <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Submitting...</>
            ) : (
              <><Send size={16} /> Submit Feedback</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
