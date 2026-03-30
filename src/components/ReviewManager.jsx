import { useState, useMemo } from 'react';
import { Star, MessageSquare, Filter, Plus, Trash2, X, Check, TrendingUp, AlertTriangle, Copy, Tag, ThumbsUp, ThumbsDown } from 'lucide-react';

const PLATFORM_MAP = {
  baemin: { label: '배민', color: '#2AC1BC' },
  coupang: { label: '쿠팡', color: '#E0115F' },
  yogiyo: { label: '요기요', color: '#FA0050' },
};

const DEFAULT_TEMPLATES = [
  { id: 't1', name: '긍정 리뷰', text: '소중한 리뷰 감사합니다! 더 맛있는 음식으로 보답하겠습니다 😊' },
  { id: 't2', name: '부정 리뷰 (배달)', text: '불편을 드려 죄송합니다. 배달 품질 개선을 위해 배달대행사와 협의하겠습니다.' },
  { id: 't3', name: '부정 리뷰 (음식)', text: '소중한 의견 감사합니다. 조리 과정을 점검하여 더 좋은 맛을 드리겠습니다.' },
  { id: 't4', name: '재방문 유도', text: '다음에도 맛있게 드실 수 있도록 최선을 다하겠습니다! 재주문 시 서비스 드릴게요 🎁' },
];

function detectSentiment(rating) {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export default function ReviewManager({ reviews, setReviews }) {
  const [activeTab, setActiveTab] = useState('manage');
  const [showAddForm, setShowAddForm] = useState(false);
  const [replyingId, setReplyingId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');

  // Filters
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterReplied, setFilterReplied] = useState('all');

  // Add form
  const [newReview, setNewReview] = useState({
    date: new Date().toISOString().split('T')[0],
    platform: 'baemin',
    rating: 5,
    customerComment: '',
    menuName: '',
    keywordsRaw: '',
  });

  // Templates
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', text: '' });

  // ── Summary stats ──
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews) : 0;
  const repliedCount = reviews.filter(r => r.replied).length;
  const replyRate = totalReviews > 0 ? ((repliedCount / totalReviews) * 100) : 0;

  // ── Filtered reviews ──
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (filterPlatform !== 'all' && r.platform !== filterPlatform) return false;
      if (filterRating !== 'all' && r.rating !== Number(filterRating)) return false;
      if (filterSentiment !== 'all' && r.sentiment !== filterSentiment) return false;
      if (filterReplied !== 'all') {
        if (filterReplied === 'replied' && !r.replied) return false;
        if (filterReplied === 'unreplied' && r.replied) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [reviews, filterPlatform, filterRating, filterSentiment, filterReplied]);

  // ── Analytics data ──
  const analytics = useMemo(() => {
    // Monthly avg rating
    const monthMap = {};
    reviews.forEach(r => {
      const mk = getMonthKey(r.date);
      if (!monthMap[mk]) monthMap[mk] = { sum: 0, count: 0 };
      monthMap[mk].sum += r.rating;
      monthMap[mk].count++;
    });
    const monthlyRatings = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, { sum, count }]) => ({ month, avg: sum / count }));

    // Platform breakdown
    const platMap = {};
    reviews.forEach(r => {
      if (!platMap[r.platform]) platMap[r.platform] = { sum: 0, count: 0 };
      platMap[r.platform].sum += r.rating;
      platMap[r.platform].count++;
    });
    const platformBreakdown = Object.entries(platMap).map(([platform, { sum, count }]) => ({
      platform,
      avg: sum / count,
      count,
    }));

    // Keywords
    const posKeywords = {};
    const negKeywords = {};
    reviews.forEach(r => {
      const bucket = r.sentiment === 'negative' ? negKeywords : r.sentiment === 'positive' ? posKeywords : null;
      if (bucket && r.keywords) {
        r.keywords.forEach(kw => {
          const k = kw.trim();
          if (k) bucket[k] = (bucket[k] || 0) + 1;
        });
      }
    });
    const topPositive = Object.entries(posKeywords).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topNegative = Object.entries(negKeywords).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // Weekly review count
    const weekMap = {};
    reviews.forEach(r => {
      const wk = getWeekKey(r.date);
      weekMap[wk] = (weekMap[wk] || 0) + 1;
    });
    const weeklyData = Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([week, count]) => ({ week, count }));

    // Insights
    const insights = [];
    if (avgRating < 4.5 && totalReviews > 0) {
      insights.push({ type: 'warning', text: '평균 별점이 4.5 미만입니다. 배민 노출에 불리할 수 있습니다.' });
    }
    if (replyRate < 80 && totalReviews > 0) {
      insights.push({ type: 'warning', text: '미답변 리뷰가 있습니다. 모든 리뷰에 답글을 달아주세요.' });
    }
    if (topNegative.length > 0) {
      insights.push({ type: 'urgent', text: `가장 시급한 개선점: ${topNegative[0][0]}` });
    }

    return { monthlyRatings, platformBreakdown, topPositive, topNegative, weeklyData, insights };
  }, [reviews, avgRating, replyRate, totalReviews]);

  // ── Handlers ──
  const handleAddReview = () => {
    if (!newReview.customerComment.trim() || !newReview.menuName.trim()) return;
    const keywords = newReview.keywordsRaw.split(',').map(k => k.trim()).filter(Boolean);
    const sentiment = detectSentiment(newReview.rating);
    const review = {
      id: Date.now(),
      date: newReview.date,
      platform: newReview.platform,
      rating: newReview.rating,
      customerComment: newReview.customerComment.trim(),
      menuName: newReview.menuName.trim(),
      keywords,
      sentiment,
      replied: false,
      replyText: '',
      createdAt: new Date().toISOString(),
    };
    setReviews(prev => [...prev, review]);
    setNewReview({
      date: new Date().toISOString().split('T')[0],
      platform: 'baemin',
      rating: 5,
      customerComment: '',
      menuName: '',
      keywordsRaw: '',
    });
    setShowAddForm(false);
  };

  const handleSubmitReply = (reviewId) => {
    if (!replyDraft.trim()) return;
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, replied: true, replyText: replyDraft.trim() } : r
    ));
    setReplyingId(null);
    setReplyDraft('');
  };

  const handleDeleteReview = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const handleAddTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.text.trim()) return;
    setTemplates(prev => [...prev, { id: `t-${Date.now()}`, name: newTemplate.name.trim(), text: newTemplate.text.trim() }]);
    setNewTemplate({ name: '', text: '' });
    setShowAddTemplate(false);
  };

  const handleDeleteTemplate = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const insertTemplate = (text) => {
    setReplyDraft(text);
  };

  // ── Render stars ──
  const renderStars = (rating, interactive = false, onChange = null) => (
    <div className="rv-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={interactive ? 24 : 14}
          fill={i <= rating ? '#FFB800' : 'transparent'}
          color={i <= rating ? '#FFB800' : '#ccc'}
          style={interactive ? { cursor: 'pointer' } : {}}
          onClick={interactive && onChange ? () => onChange(i) : undefined}
        />
      ))}
    </div>
  );

  // ── Max value for bar charts ──
  const maxWeekly = analytics.weeklyData.length > 0 ? Math.max(...analytics.weeklyData.map(d => d.count)) : 1;
  const maxMonthlyAvg = analytics.monthlyRatings.length > 0 ? 5 : 1;

  return (
    <div className="rv">
      <style>{`
        .rv { max-width: 100%; }
        .rv-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin: 0 0 4px 0; }
        .rv-header p { font-size: 14px; color: var(--text-light); margin: 0; }
        .rv-header { margin-bottom: 24px; }

        .rv-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 24px; }
        .rv-tab {
          padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer;
          border: none; background: none; color: var(--text-light);
          border-bottom: 2px solid transparent; margin-bottom: -2px;
          display: flex; align-items: center; gap: 6px; transition: all 0.2s;
        }
        .rv-tab:hover { color: var(--text-dark); }
        .rv-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

        .rv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .rv-stat-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; text-align: center; box-shadow: var(--shadow-sm);
        }
        .rv-stat-value { font-size: 28px; font-weight: 700; color: var(--text-dark); }
        .rv-stat-label { font-size: 13px; color: var(--text-light); margin-top: 4px; }
        .rv-stat-sub { font-size: 12px; color: var(--text-light); margin-top: 2px; }

        .rv-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .rv-filter-group { display: flex; align-items: center; gap: 6px; }
        .rv-filter-group label { font-size: 12px; color: var(--text-light); font-weight: 600; }
        .rv-filter-group select {
          padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 13px; background: var(--bg-card); color: var(--text); outline: none;
        }
        .rv-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
          border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer;
          border: none; transition: all 0.2s;
        }
        .rv-btn-primary { background: var(--primary); color: #fff; }
        .rv-btn-primary:hover { opacity: 0.9; }
        .rv-btn-secondary { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
        .rv-btn-secondary:hover { background: var(--border-light); }
        .rv-btn-danger { background: var(--danger); color: #fff; }
        .rv-btn-danger:hover { opacity: 0.9; }
        .rv-btn-sm { padding: 5px 10px; font-size: 12px; }
        .rv-btn-ghost { background: transparent; color: var(--text-light); padding: 4px 8px; }
        .rv-btn-ghost:hover { color: var(--danger); }

        .rv-add-form {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 24px; margin-bottom: 20px; box-shadow: var(--shadow-sm);
        }
        .rv-add-form h3 { margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: var(--text-dark); }
        .rv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rv-form-group { display: flex; flex-direction: column; gap: 5px; }
        .rv-form-group.full { grid-column: 1 / -1; }
        .rv-form-group label { font-size: 12px; font-weight: 600; color: var(--text-light); }
        .rv-form-group input, .rv-form-group select, .rv-form-group textarea {
          padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 13px; background: var(--bg); color: var(--text); outline: none; font-family: inherit;
        }
        .rv-form-group input:focus, .rv-form-group select:focus, .rv-form-group textarea:focus {
          border-color: var(--primary);
        }
        .rv-form-group textarea { resize: vertical; min-height: 60px; }
        .rv-form-actions { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }
        .rv-sentiment-badge {
          display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px;
        }
        .rv-sentiment-positive { background: var(--success-light); color: var(--success); }
        .rv-sentiment-negative { background: var(--danger-light); color: var(--danger); }
        .rv-sentiment-neutral { background: var(--warning-light); color: var(--warning); }

        .rv-review-list { display: flex; flex-direction: column; gap: 14px; }
        .rv-review-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; box-shadow: var(--shadow-sm); transition: border-color 0.2s;
        }
        .rv-review-card:hover { border-color: var(--primary); }
        .rv-review-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .rv-review-meta { display: flex; align-items: center; gap: 10px; }
        .rv-platform-badge {
          display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 12px;
          font-size: 11px; font-weight: 700; color: #fff;
        }
        .rv-review-date { font-size: 12px; color: var(--text-light); }
        .rv-stars { display: inline-flex; align-items: center; gap: 2px; }
        .rv-review-menu { font-size: 13px; color: var(--text-light); margin-bottom: 8px; font-weight: 600; }
        .rv-review-comment {
          font-size: 14px; color: var(--text); line-height: 1.6; margin-bottom: 12px;
          background: var(--bg); padding: 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--border);
        }
        .rv-keywords { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .rv-keyword-tag {
          font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 3px;
        }
        .rv-keyword-positive { background: var(--success-light); color: var(--success); }
        .rv-keyword-negative { background: var(--danger-light); color: var(--danger); }
        .rv-keyword-neutral { background: var(--warning-light); color: var(--warning); }
        .rv-review-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rv-reply-status {
          display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600;
          padding: 4px 10px; border-radius: var(--radius-sm);
        }
        .rv-reply-done { background: var(--success-light); color: var(--success); }
        .rv-reply-pending { background: var(--danger-light); color: var(--danger); }
        .rv-reply-area {
          margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border);
        }
        .rv-reply-area textarea {
          width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 13px; min-height: 70px; resize: vertical; outline: none;
          font-family: inherit; background: var(--bg); color: var(--text); box-sizing: border-box;
        }
        .rv-reply-area textarea:focus { border-color: var(--primary); }
        .rv-reply-templates { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
        .rv-template-quick {
          font-size: 11px; padding: 4px 10px; border-radius: 12px; cursor: pointer;
          border: 1px solid var(--border); background: var(--bg-card); color: var(--text);
          transition: all 0.2s;
        }
        .rv-template-quick:hover { border-color: var(--primary); color: var(--primary); }
        .rv-reply-actions { display: flex; gap: 8px; margin-top: 8px; }
        .rv-existing-reply {
          margin-top: 12px; padding: 12px; background: var(--primary-light); border-radius: var(--radius-sm);
          font-size: 13px; color: var(--text); border-left: 3px solid var(--primary);
        }
        .rv-existing-reply-label { font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 4px; }

        /* Tab 2: Templates */
        .rv-template-list { display: flex; flex-direction: column; gap: 12px; }
        .rv-template-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 18px; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
        }
        .rv-template-info { flex: 1; }
        .rv-template-name { font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 6px; }
        .rv-template-text { font-size: 13px; color: var(--text); line-height: 1.5; }
        .rv-template-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .rv-add-template-form {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm);
        }
        .rv-add-template-form h3 { margin: 0 0 14px 0; font-size: 15px; font-weight: 600; color: var(--text-dark); }

        /* Tab 3: Analytics */
        .rv-analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .rv-analytics-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; box-shadow: var(--shadow-sm);
        }
        .rv-analytics-card.full { grid-column: 1 / -1; }
        .rv-analytics-title { font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .rv-bar-chart { display: flex; flex-direction: column; gap: 8px; }
        .rv-bar-row { display: flex; align-items: center; gap: 10px; }
        .rv-bar-label { font-size: 12px; color: var(--text-light); min-width: 60px; text-align: right; font-weight: 500; }
        .rv-bar-track { flex: 1; height: 22px; background: var(--bg); border-radius: 4px; overflow: hidden; position: relative; }
        .rv-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; display: flex; align-items: center; justify-content: flex-end; padding-right: 6px; min-width: 20px; }
        .rv-bar-value { font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap; }
        .rv-bar-value-outside { font-size: 11px; font-weight: 600; color: var(--text-light); margin-left: 6px; }

        .rv-keyword-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
        .rv-keyword-item {
          font-size: 12px; padding: 4px 12px; border-radius: 14px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 4px;
        }

        .rv-insight-list { display: flex; flex-direction: column; gap: 10px; }
        .rv-insight-item {
          display: flex; align-items: flex-start; gap: 10px; padding: 14px; border-radius: var(--radius-sm);
          font-size: 13px; line-height: 1.5;
        }
        .rv-insight-warning { background: var(--warning-light); color: var(--warning); }
        .rv-insight-urgent { background: var(--danger-light); color: var(--danger); }
        .rv-insight-icon { flex-shrink: 0; margin-top: 1px; }

        .rv-platform-table { width: 100%; border-collapse: collapse; }
        .rv-platform-table th { text-align: left; font-size: 12px; color: var(--text-light); font-weight: 600; padding: 8px 10px; border-bottom: 1px solid var(--border); }
        .rv-platform-table td { font-size: 13px; color: var(--text); padding: 10px; border-bottom: 1px solid var(--border-light); }
        .rv-platform-table td:last-child { text-align: right; }

        .rv-empty { text-align: center; padding: 48px 20px; color: var(--text-light); font-size: 14px; }
        .rv-empty-icon { margin-bottom: 12px; opacity: 0.4; }

        @media (max-width: 700px) {
          .rv-stats { grid-template-columns: 1fr; }
          .rv-form-grid { grid-template-columns: 1fr; }
          .rv-analytics-grid { grid-template-columns: 1fr; }
          .rv-toolbar { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="rv-header">
        <h1>리뷰 관리 센터</h1>
        <p>배달 플랫폼 리뷰를 한곳에서 관리하고 분석하세요</p>
      </div>

      {/* Tabs */}
      <div className="rv-tabs">
        <button className={`rv-tab ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
          <MessageSquare size={15} /> 리뷰 관리
        </button>
        <button className={`rv-tab ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          <Copy size={15} /> 답글 템플릿
        </button>
        <button className={`rv-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <TrendingUp size={15} /> 리뷰 분석
        </button>
      </div>

      {/* ═══════════════ Tab 1: 리뷰 관리 ═══════════════ */}
      {activeTab === 'manage' && (
        <div>
          {/* Summary Stats */}
          <div className="rv-stats">
            <div className="rv-stat-card">
              <div className="rv-stat-value">{totalReviews}</div>
              <div className="rv-stat-label">전체 리뷰</div>
            </div>
            <div className="rv-stat-card">
              <div className="rv-stat-value" style={{ color: avgRating >= 4.5 ? 'var(--success)' : avgRating >= 3.5 ? 'var(--warning)' : 'var(--danger)' }}>
                {avgRating > 0 ? avgRating.toFixed(1) : '-'}
              </div>
              <div className="rv-stat-label">평균 별점</div>
              <div className="rv-stat-sub">{avgRating > 0 && renderStars(Math.round(avgRating))}</div>
            </div>
            <div className="rv-stat-card">
              <div className="rv-stat-value" style={{ color: replyRate >= 80 ? 'var(--success)' : 'var(--danger)' }}>
                {totalReviews > 0 ? `${replyRate.toFixed(0)}%` : '-'}
              </div>
              <div className="rv-stat-label">답글 비율</div>
              <div className="rv-stat-sub">{repliedCount}/{totalReviews} 답글 완료</div>
            </div>
          </div>

          {/* Toolbar: Add + Filters */}
          <div className="rv-toolbar">
            <button className="rv-btn rv-btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <X size={14} /> : <Plus size={14} />}
              {showAddForm ? '닫기' : '리뷰 추가'}
            </button>
            <div style={{ flex: 1 }} />
            <Filter size={14} style={{ color: 'var(--text-light)' }} />
            <div className="rv-filter-group">
              <label>플랫폼</label>
              <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
                <option value="all">전체</option>
                <option value="baemin">배민</option>
                <option value="coupang">쿠팡</option>
                <option value="yogiyo">요기요</option>
              </select>
            </div>
            <div className="rv-filter-group">
              <label>별점</label>
              <select value={filterRating} onChange={e => setFilterRating(e.target.value)}>
                <option value="all">전체</option>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}점</option>)}
              </select>
            </div>
            <div className="rv-filter-group">
              <label>감성</label>
              <select value={filterSentiment} onChange={e => setFilterSentiment(e.target.value)}>
                <option value="all">전체</option>
                <option value="positive">긍정</option>
                <option value="neutral">중립</option>
                <option value="negative">부정</option>
              </select>
            </div>
            <div className="rv-filter-group">
              <label>답글</label>
              <select value={filterReplied} onChange={e => setFilterReplied(e.target.value)}>
                <option value="all">전체</option>
                <option value="replied">답글 완료</option>
                <option value="unreplied">미답변</option>
              </select>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="rv-add-form">
              <h3>새 리뷰 추가</h3>
              <div className="rv-form-grid">
                <div className="rv-form-group">
                  <label>날짜</label>
                  <input
                    type="date"
                    value={newReview.date}
                    onChange={e => setNewReview(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="rv-form-group">
                  <label>플랫폼</label>
                  <select
                    value={newReview.platform}
                    onChange={e => setNewReview(prev => ({ ...prev, platform: e.target.value }))}
                  >
                    <option value="baemin">배민</option>
                    <option value="coupang">쿠팡</option>
                    <option value="yogiyo">요기요</option>
                  </select>
                </div>
                <div className="rv-form-group">
                  <label>별점</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {renderStars(newReview.rating, true, (r) => setNewReview(prev => ({ ...prev, rating: r })))}
                    <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{newReview.rating}점</span>
                    <span className={`rv-sentiment-badge rv-sentiment-${detectSentiment(newReview.rating)}`}>
                      {detectSentiment(newReview.rating) === 'positive' ? '긍정' : detectSentiment(newReview.rating) === 'negative' ? '부정' : '중립'}
                    </span>
                  </div>
                </div>
                <div className="rv-form-group">
                  <label>메뉴명</label>
                  <input
                    type="text"
                    placeholder="주문 메뉴"
                    value={newReview.menuName}
                    onChange={e => setNewReview(prev => ({ ...prev, menuName: e.target.value }))}
                  />
                </div>
                <div className="rv-form-group full">
                  <label>고객 리뷰 내용</label>
                  <textarea
                    placeholder="고객이 남긴 리뷰 내용을 입력하세요"
                    value={newReview.customerComment}
                    onChange={e => setNewReview(prev => ({ ...prev, customerComment: e.target.value }))}
                  />
                </div>
                <div className="rv-form-group full">
                  <label>키워드 (쉼표로 구분)</label>
                  <input
                    type="text"
                    placeholder="예: 맛있음, 양많음, 빠른배달"
                    value={newReview.keywordsRaw}
                    onChange={e => setNewReview(prev => ({ ...prev, keywordsRaw: e.target.value }))}
                  />
                </div>
              </div>
              <div className="rv-form-actions">
                <button className="rv-btn rv-btn-secondary" onClick={() => setShowAddForm(false)}>
                  <X size={14} /> 취소
                </button>
                <button className="rv-btn rv-btn-primary" onClick={handleAddReview}>
                  <Check size={14} /> 추가
                </button>
              </div>
            </div>
          )}

          {/* Review List */}
          {filteredReviews.length === 0 ? (
            <div className="rv-empty">
              <div className="rv-empty-icon"><MessageSquare size={40} /></div>
              {totalReviews === 0 ? '아직 등록된 리뷰가 없습니다. 리뷰를 추가해주세요.' : '필터 조건에 맞는 리뷰가 없습니다.'}
            </div>
          ) : (
            <div className="rv-review-list">
              {filteredReviews.map(review => (
                <div key={review.id} className="rv-review-card">
                  <div className="rv-review-top">
                    <div className="rv-review-meta">
                      <span
                        className="rv-platform-badge"
                        style={{ background: PLATFORM_MAP[review.platform]?.color || '#888' }}
                      >
                        {PLATFORM_MAP[review.platform]?.label || review.platform}
                      </span>
                      <span className="rv-review-date">{formatDate(review.date)}</span>
                      {renderStars(review.rating)}
                      <span className={`rv-sentiment-badge rv-sentiment-${review.sentiment}`}>
                        {review.sentiment === 'positive' ? '긍정' : review.sentiment === 'negative' ? '부정' : '중립'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`rv-reply-status ${review.replied ? 'rv-reply-done' : 'rv-reply-pending'}`}>
                        {review.replied ? <><Check size={12} /> 답글 완료</> : <><MessageSquare size={12} /> 미답변</>}
                      </span>
                      <button className="rv-btn rv-btn-ghost rv-btn-sm" onClick={() => handleDeleteReview(review.id)} title="삭제">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="rv-review-menu"><Tag size={12} /> {review.menuName}</div>
                  <div className="rv-review-comment">{review.customerComment}</div>

                  {review.keywords && review.keywords.length > 0 && (
                    <div className="rv-keywords">
                      {review.keywords.map((kw, idx) => (
                        <span key={idx} className={`rv-keyword-tag rv-keyword-${review.sentiment}`}>
                          {review.sentiment === 'positive' ? <ThumbsUp size={10} /> : review.sentiment === 'negative' ? <ThumbsDown size={10} /> : null}
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {review.replied && review.replyText && (
                    <div className="rv-existing-reply">
                      <div className="rv-existing-reply-label">사장님 답글</div>
                      {review.replyText}
                    </div>
                  )}

                  <div className="rv-review-actions">
                    {!review.replied && replyingId !== review.id && (
                      <button className="rv-btn rv-btn-primary rv-btn-sm" onClick={() => { setReplyingId(review.id); setReplyDraft(''); }}>
                        <MessageSquare size={12} /> 답글 작성
                      </button>
                    )}
                  </div>

                  {replyingId === review.id && (
                    <div className="rv-reply-area">
                      <textarea
                        placeholder="답글을 작성하세요..."
                        value={replyDraft}
                        onChange={e => setReplyDraft(e.target.value)}
                      />
                      <div className="rv-reply-templates">
                        {templates.map(t => (
                          <button key={t.id} className="rv-template-quick" onClick={() => insertTemplate(t.text)}>
                            {t.name}
                          </button>
                        ))}
                      </div>
                      <div className="rv-reply-actions">
                        <button className="rv-btn rv-btn-secondary rv-btn-sm" onClick={() => { setReplyingId(null); setReplyDraft(''); }}>
                          <X size={12} /> 취소
                        </button>
                        <button className="rv-btn rv-btn-primary rv-btn-sm" onClick={() => handleSubmitReply(review.id)}>
                          <Check size={12} /> 답글 등록
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ Tab 2: 답글 템플릿 ═══════════════ */}
      {activeTab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>답글 템플릿</h2>
              <p style={{ fontSize: 13, color: 'var(--text-light)', margin: '4px 0 0 0' }}>자주 사용하는 답글을 템플릿으로 저장하세요</p>
            </div>
            <button className="rv-btn rv-btn-primary" onClick={() => setShowAddTemplate(!showAddTemplate)}>
              {showAddTemplate ? <X size={14} /> : <Plus size={14} />}
              {showAddTemplate ? '닫기' : '템플릿 추가'}
            </button>
          </div>

          {showAddTemplate && (
            <div className="rv-add-template-form">
              <h3>새 템플릿 추가</h3>
              <div className="rv-form-group" style={{ marginBottom: 12 }}>
                <label>템플릿 이름</label>
                <input
                  type="text"
                  placeholder="예: 재방문 감사"
                  value={newTemplate.name}
                  onChange={e => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)' }}
                />
              </div>
              <div className="rv-form-group" style={{ marginBottom: 12 }}>
                <label>답글 내용</label>
                <textarea
                  placeholder="답글 내용을 입력하세요"
                  value={newTemplate.text}
                  onChange={e => setNewTemplate(prev => ({ ...prev, text: e.target.value }))}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', minHeight: 80, resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div className="rv-form-actions">
                <button className="rv-btn rv-btn-secondary" onClick={() => { setShowAddTemplate(false); setNewTemplate({ name: '', text: '' }); }}>
                  <X size={14} /> 취소
                </button>
                <button className="rv-btn rv-btn-primary" onClick={handleAddTemplate}>
                  <Check size={14} /> 저장
                </button>
              </div>
            </div>
          )}

          <div className="rv-template-list">
            {templates.map(t => (
              <div key={t.id} className="rv-template-card">
                <div className="rv-template-info">
                  <div className="rv-template-name">{t.name}</div>
                  <div className="rv-template-text">{t.text}</div>
                </div>
                <div className="rv-template-actions">
                  <button
                    className="rv-btn rv-btn-secondary rv-btn-sm"
                    onClick={() => navigator.clipboard?.writeText(t.text)}
                    title="복사"
                  >
                    <Copy size={12} /> 복사
                  </button>
                  <button
                    className="rv-btn rv-btn-ghost rv-btn-sm"
                    onClick={() => handleDeleteTemplate(t.id)}
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="rv-empty">
                <div className="rv-empty-icon"><Copy size={40} /></div>
                템플릿이 없습니다. 새 템플릿을 추가해주세요.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ Tab 3: 리뷰 분석 ═══════════════ */}
      {activeTab === 'analytics' && (
        <div>
          {reviews.length === 0 ? (
            <div className="rv-empty">
              <div className="rv-empty-icon"><TrendingUp size={40} /></div>
              분석할 리뷰 데이터가 없습니다. 리뷰를 먼저 추가해주세요.
            </div>
          ) : (
            <div className="rv-analytics-grid">
              {/* Monthly avg rating trend */}
              {analytics.monthlyRatings.length > 0 && (
                <div className="rv-analytics-card full">
                  <div className="rv-analytics-title"><TrendingUp size={16} /> 월별 평균 별점</div>
                  <div className="rv-bar-chart">
                    {analytics.monthlyRatings.map(({ month, avg }) => (
                      <div key={month} className="rv-bar-row">
                        <div className="rv-bar-label">{month}</div>
                        <div className="rv-bar-track">
                          <div
                            className="rv-bar-fill"
                            style={{
                              width: `${(avg / maxMonthlyAvg) * 100}%`,
                              background: avg >= 4.5 ? 'var(--success)' : avg >= 3.5 ? 'var(--warning)' : 'var(--danger)',
                            }}
                          >
                            <span className="rv-bar-value">{avg.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform breakdown */}
              <div className="rv-analytics-card">
                <div className="rv-analytics-title"><Filter size={16} /> 플랫폼별 분석</div>
                <table className="rv-platform-table">
                  <thead>
                    <tr>
                      <th>플랫폼</th>
                      <th>리뷰 수</th>
                      <th>평균 별점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.platformBreakdown.map(({ platform, avg, count }) => (
                      <tr key={platform}>
                        <td>
                          <span
                            className="rv-platform-badge"
                            style={{ background: PLATFORM_MAP[platform]?.color || '#888' }}
                          >
                            {PLATFORM_MAP[platform]?.label || platform}
                          </span>
                        </td>
                        <td>{count}건</td>
                        <td style={{ fontWeight: 700, color: avg >= 4.5 ? 'var(--success)' : avg >= 3.5 ? 'var(--warning)' : 'var(--danger)' }}>
                          {avg.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insights */}
              <div className="rv-analytics-card">
                <div className="rv-analytics-title"><AlertTriangle size={16} /> 인사이트</div>
                {analytics.insights.length > 0 ? (
                  <div className="rv-insight-list">
                    {analytics.insights.map((insight, idx) => (
                      <div key={idx} className={`rv-insight-item rv-insight-${insight.type}`}>
                        <span className="rv-insight-icon">
                          <AlertTriangle size={16} />
                        </span>
                        <span>{insight.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
                    <Check size={16} /> 모든 지표가 양호합니다!
                  </div>
                )}
              </div>

              {/* Top positive keywords */}
              <div className="rv-analytics-card">
                <div className="rv-analytics-title"><ThumbsUp size={16} style={{ color: 'var(--success)' }} /> 긍정 키워드 TOP</div>
                {analytics.topPositive.length > 0 ? (
                  <div className="rv-keyword-cloud">
                    {analytics.topPositive.map(([kw, count]) => (
                      <span key={kw} className="rv-keyword-item" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        <ThumbsUp size={10} /> {kw} ({count})
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text-light)' }}>긍정 키워드가 없습니다.</div>
                )}
              </div>

              {/* Top negative keywords */}
              <div className="rv-analytics-card">
                <div className="rv-analytics-title"><ThumbsDown size={16} style={{ color: 'var(--danger)' }} /> 부정 키워드 TOP</div>
                {analytics.topNegative.length > 0 ? (
                  <div className="rv-keyword-cloud">
                    {analytics.topNegative.map(([kw, count]) => (
                      <span key={kw} className="rv-keyword-item" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        <ThumbsDown size={10} /> {kw} ({count})
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text-light)' }}>부정 키워드가 없습니다.</div>
                )}
              </div>

              {/* Weekly review count chart */}
              {analytics.weeklyData.length > 0 && (
                <div className="rv-analytics-card full">
                  <div className="rv-analytics-title"><MessageSquare size={16} /> 주간 리뷰 건수</div>
                  <div className="rv-bar-chart">
                    {analytics.weeklyData.map(({ week, count }) => (
                      <div key={week} className="rv-bar-row">
                        <div className="rv-bar-label">{week}</div>
                        <div className="rv-bar-track">
                          <div
                            className="rv-bar-fill"
                            style={{
                              width: `${(count / maxWeekly) * 100}%`,
                              background: 'var(--primary)',
                            }}
                          >
                            <span className="rv-bar-value">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
