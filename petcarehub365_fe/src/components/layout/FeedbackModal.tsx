import { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import feedbackApi from '../../api/feedbackApi';

export default function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const res = await feedbackApi.submitFeedback({ rating, comment }) as any;
      if (res?.success) {
        localStorage.setItem('feedback_submitted', 'true');
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptOut = () => {
    sessionStorage.setItem('feedback_opt_out_session', 'true');
    onClose();
  };

  const handleSnooze = () => {
    sessionStorage.setItem('feedback_snoozed_session', 'true');
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: 420, width: '90%', padding: '24px 20px', borderRadius: 16, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleSnooze} style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'absolute', top: 16, right: 16 }}>
          <X size={16} />
        </button>

        {!submitted ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--primary)' }}>
                <MessageSquare size={28} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Bạn cảm thấy thế nào về PetCare Hub?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ chăm sóc thú cưng tốt hơn mỗi ngày.</p>
            </div>

            {/* Star Rating */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isGold = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      transition: 'transform 0.1s ease',
                      transform: (hoverRating || rating) === star ? 'scale(1.2)' : 'none'
                    }}
                  >
                    <Star
                      size={32}
                      color={isGold ? 'var(--gold)' : 'var(--border)'}
                      fill={isGold ? 'var(--gold)' : 'none'}
                    />
                  </button>
                );
              })}
            </div>

            {/* Comment area */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Bình luận của bạn (Không bắt buộc)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Hãy chia sẻ trải nghiệm hoặc đóng góp ý kiến của bạn tại đây..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ resize: 'none', fontSize: 13, padding: '10px 12px' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 40 }}
              >
                {loading ? <div className="spinner" /> : <><Send size={14} /> Gửi đánh giá</>}
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-outline"
                  onClick={handleOptOut}
                  style={{ flex: 1, fontSize: 11, padding: '8px 4px', whiteSpace: 'nowrap' }}
                >
                  Không nhắc lại lần này
                </button>
                <button
                  className="btn btn-outline"
                  onClick={handleSnooze}
                  style={{ flex: 1, fontSize: 11, padding: '8px 4px' }}
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8F8EF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--success)' }}>
              <Star size={28} fill="var(--success)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Cảm ơn bạn đã phản hồi!</h3>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Ý kiến của bạn đã được ghi nhận thành công.</p>
          </div>
        )}
      </div>
    </div>
  );
}
