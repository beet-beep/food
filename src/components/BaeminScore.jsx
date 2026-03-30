import { useState, useMemo } from 'react';
import { Award, Target, Star, TrendingUp, Calendar, AlertTriangle, CheckCircle2, ArrowUp, ArrowDown, Info, Zap, Sun, Cloud, CloudRain } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

/* ================================================================
   BAEMIN SCORE — 배민 알고리즘 점수판 + 시즌 캘린더
   ================================================================ */
export default function BaeminScore({ reviews, dailyLogs, menus }) {
  const [tab, setTab] = useState('score');

  const tabs = [
    { id: 'score', label: '배민 알고리즘 점수판', icon: Award },
    { id: 'season', label: '시즌 캘린더', icon: Calendar },
  ];

  return (
    <div className="bs">
      <div className="bs-page-header">
        <h1>배민 점수판</h1>
        <p>배달의민족 노출 알고리즘 점수와 시즌별 전략 관리</p>
      </div>

      <div className="bs-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`bs-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'score' && <ScoreTab reviews={reviews} dailyLogs={dailyLogs} menus={menus} />}
      {tab === 'season' && <SeasonTab />}

      <style>{baeminScoreCSS}</style>
    </div>
  );
}

/* ================================================================
   TAB 1 — 배민 알고리즘 점수판
   ================================================================ */
function ScoreTab({ reviews, dailyLogs }) {
  const [storeInfo, setStoreInfo] = useState({
    photo: false,
    menuDesc: false,
    hours: false,
    origin: false,
    intro: false,
  });
  const [cookTime, setCookTime] = useState(15);

  /* 1. 최근 주문량 */
  const recentLogs = useMemo(() => {
    const sorted = [...(dailyLogs || [])].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.slice(0, 7);
  }, [dailyLogs]);

  const avgDailyOrders = useMemo(() => {
    if (recentLogs.length === 0) return 0;
    return recentLogs.reduce((s, d) => {
      return s + Object.values(d.orders || {}).reduce((a, b) => a + Number(b || 0), 0);
    }, 0) / recentLogs.length;
  }, [recentLogs]);

  const orderScore = Math.min(100, Math.round((avgDailyOrders / 40) * 100));

  /* 2. 리뷰 수 */
  const reviewCount = (reviews || []).length;
  const reviewCountScore = Math.min(100, Math.round((reviewCount / 100) * 100));

  /* 3. 평균 별점 */
  const avgRating = useMemo(() => {
    if (reviewCount === 0) return 0;
    return (reviews || []).reduce((s, r) => s + (r.rating || 0), 0) / reviewCount;
  }, [reviews, reviewCount]);

  const ratingScore = useMemo(() => {
    if (avgRating < 4.0) return 20;
    if (avgRating < 4.3) return 40;
    if (avgRating < 4.5) return 60;
    if (avgRating < 4.7) return 80;
    return 100;
  }, [avgRating]);

  /* 4. 사장님 답글률 */
  const repliedCount = useMemo(() => (reviews || []).filter(r => r.replied).length, [reviews]);
  const replyRate = reviewCount > 0 ? (repliedCount / reviewCount) * 100 : 0;
  const replyScore = Math.round(replyRate);

  /* 5. 가게 정보 완성도 */
  const infoItems = [
    { key: 'photo', label: '사진 등록' },
    { key: 'menuDesc', label: '메뉴 설명 작성' },
    { key: 'hours', label: '영업시간 설정' },
    { key: 'origin', label: '원산지 표시' },
    { key: 'intro', label: '가게 소개 작성' },
  ];
  const infoScore = Object.values(storeInfo).filter(Boolean).length * 20;

  /* 6. 평균 조리시간 */
  const cookTimeScore = useMemo(() => {
    if (cookTime <= 10) return 100;
    if (cookTime <= 15) return Math.round(100 - ((cookTime - 10) / 5) * 20);
    if (cookTime <= 20) return Math.round(60 - ((cookTime - 15) / 5) * 20);
    if (cookTime <= 30) return Math.round(40 - ((cookTime - 20) / 10) * 20);
    return 10;
  }, [cookTime]);

  /* Overall weighted score */
  const overallScore = Math.round(
    orderScore * 0.30 +
    reviewCountScore * 0.15 +
    ratingScore * 0.20 +
    replyScore * 0.10 +
    infoScore * 0.10 +
    cookTimeScore * 0.15
  );

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return '#eab308';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return '우수';
    if (score >= 60) return '양호';
    if (score >= 40) return '보통';
    return '개선 필요';
  };

  const scoreItems = [
    {
      label: '최근 주문량',
      icon: TrendingUp,
      current: `${avgDailyOrders.toFixed(1)}건/일`,
      target: '40건/일',
      score: orderScore,
      weight: '30%',
      recommendation: orderScore < 60 ? '울트라콜 깃발 추가 및 오픈리스트 활용으로 노출을 늘리세요.' : null,
    },
    {
      label: '리뷰 수',
      icon: Star,
      current: `${reviewCount}개`,
      target: '100개',
      score: reviewCountScore,
      weight: '15%',
      recommendation: reviewCountScore < 60 ? '리뷰 이벤트(사이드 서비스 등)를 진행하여 리뷰 수를 늘리세요.' : null,
    },
    {
      label: '평균 별점',
      icon: Award,
      current: avgRating > 0 ? `${avgRating.toFixed(1)}점` : '-',
      target: '4.7점+',
      score: ratingScore,
      weight: '20%',
      recommendation: ratingScore < 80 ? '부정 리뷰에 빠르게 답변하고, 포장 품질과 조리 일관성을 개선하세요.' : null,
    },
    {
      label: '사장님 답글률',
      icon: CheckCircle2,
      current: `${replyRate.toFixed(0)}%`,
      target: '100%',
      score: replyScore,
      weight: '10%',
      recommendation: replyScore < 80 ? '모든 리뷰에 답글을 달아주세요. 템플릿을 활용하면 빠릅니다.' : null,
    },
    {
      label: '가게 정보 완성도',
      icon: Info,
      current: `${infoScore}점`,
      target: '100점',
      score: infoScore,
      weight: '10%',
      recommendation: infoScore < 100 ? '아래 미완성 항목을 체크하여 가게 정보를 100% 완성하세요.' : null,
    },
    {
      label: '평균 조리시간',
      icon: Zap,
      current: `${cookTime}분`,
      target: '15분 이하',
      score: cookTimeScore,
      weight: '15%',
      recommendation: cookTimeScore < 60 ? '조리 동선 최적화와 사전 준비(미장플라스)로 조리 시간을 단축하세요.' : null,
    },
  ];

  /* Weakest item for weekly goal */
  const weakest = [...scoreItems].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="bs-tab-content">
      {/* Overall Score Gauge */}
      <div className="bs-card bs-gauge-card">
        <div className="bs-gauge-wrap">
          <div className="bs-gauge">
            <svg viewBox="0 0 200 120" className="bs-gauge-svg">
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="var(--border)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Score arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={getScoreColor(overallScore)}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 251.2} 251.2`}
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <div className="bs-gauge-text">
              <span className="bs-gauge-number" style={{ color: getScoreColor(overallScore) }}>{overallScore}</span>
              <span className="bs-gauge-label">{getScoreLabel(overallScore)}</span>
            </div>
          </div>
          <div className="bs-gauge-legend">
            <span><span className="bs-dot" style={{ background: 'var(--danger)' }} /> 0-39 개선 필요</span>
            <span><span className="bs-dot" style={{ background: 'var(--warning)' }} /> 40-59 보통</span>
            <span><span className="bs-dot" style={{ background: '#eab308' }} /> 60-79 양호</span>
            <span><span className="bs-dot" style={{ background: 'var(--success)' }} /> 80-100 우수</span>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="bs-score-grid">
        {scoreItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bs-score-card">
              <div className="bs-score-card-header">
                <div className="bs-score-icon" style={{ color: getScoreColor(item.score) }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="bs-score-name">{item.label}</div>
                  <div className="bs-score-weight">가중치: {item.weight}</div>
                </div>
                <div className="bs-score-badge" style={{ background: getScoreColor(item.score) }}>
                  {item.score}점
                </div>
              </div>
              <div className="bs-score-row">
                <span>현재: <strong>{item.current}</strong></span>
                <span>목표: {item.target}</span>
              </div>
              <div className="bs-score-bar-track">
                <div
                  className="bs-score-bar-fill"
                  style={{
                    width: `${item.score}%`,
                    background: getScoreColor(item.score),
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              {item.recommendation && (
                <div className="bs-score-rec">
                  <AlertTriangle size={12} /> {item.recommendation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Store Info Checklist */}
      <div className="bs-card">
        <h3 className="bs-card-title"><Info size={16} /> 가게 정보 완성도 체크리스트</h3>
        <div className="bs-checklist">
          {infoItems.map(item => (
            <label key={item.key} className="bs-check-item">
              <input
                type="checkbox"
                checked={storeInfo[item.key]}
                onChange={e => setStoreInfo(prev => ({ ...prev, [item.key]: e.target.checked }))}
              />
              <span className={`bs-check-label ${storeInfo[item.key] ? 'done' : ''}`}>{item.label}</span>
              {storeInfo[item.key] && <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />}
            </label>
          ))}
        </div>
      </div>

      {/* Cook Time Input */}
      <div className="bs-card">
        <h3 className="bs-card-title"><Zap size={16} /> 평균 조리시간 설정</h3>
        <div className="bs-cook-section">
          <div className="bs-cook-display">
            <span className="bs-cook-val">{cookTime}분</span>
            <span className="bs-cook-target">목표: 15분 이하</span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            step={1}
            value={cookTime}
            onChange={e => setCookTime(Number(e.target.value))}
            className="bs-slider"
          />
          <div className="bs-slider-range">
            <span>5분</span>
            <span>40분</span>
          </div>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="bs-card bs-goal-card">
        <h3 className="bs-card-title"><Target size={16} /> 이번 주 목표</h3>
        <div className="bs-goal-content">
          <div className="bs-goal-icon" style={{ color: getScoreColor(weakest.score) }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="bs-goal-main">
              가장 약한 항목: <strong>{weakest.label}</strong> ({weakest.score}점)
            </p>
            <p className="bs-goal-action">
              {weakest.recommendation || '모든 항목이 양호합니다. 현재 수준을 유지하세요!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 2 — 시즌 캘린더
   ================================================================ */
const SEASON_DATA = [
  {
    month: 1, name: '1월', demand: '하', color: 'var(--danger)',
    events: ['신정 연휴 (주문↓)', '겨울방학'],
    actions: ['연휴 특별 메뉴 준비', '배달팁 할인 이벤트', '따뜻한 사이드 메뉴 추가'],
    icon: Sun,
  },
  {
    month: 2, name: '2월', demand: '하', color: 'var(--danger)',
    events: ['설 연휴 (주문↓)', '졸업시즌'],
    actions: ['설 연휴 전후 할인', '졸업 파티 세트 메뉴', '사전 휴무일 공지'],
    icon: Sun,
  },
  {
    month: 3, name: '3월', demand: '상', color: 'var(--success)',
    events: ['개학 (주문↑)', '이사시즌'],
    actions: ['학생 할인 이벤트', '오피스 단체 주문 홍보', '이사 축하 세트'],
    icon: Cloud,
  },
  {
    month: 4, name: '4월', demand: '중', color: 'var(--primary)',
    events: ['벚꽃시즌', '봄 나들이 (주문↓ 주말)'],
    actions: ['평일 집중 마케팅', '봄 한정 메뉴', '주말 할인 이벤트'],
    icon: Sun,
  },
  {
    month: 5, name: '5월', demand: '하', color: 'var(--danger)',
    events: ['어버이날', '어린이날 (주문↓)'],
    actions: ['가족 세트 메뉴', '휴일 영업 여부 사전 공지', '이벤트 쿠폰'],
    icon: Sun,
  },
  {
    month: 6, name: '6월', demand: '상', color: 'var(--success)',
    events: ['장마 시작 (배달↑↑)', '중간고사'],
    actions: ['비 오는 날 프로모션', '재고 충분히 확보', '배달 지연 대비 안내문 준비'],
    icon: CloudRain,
  },
  {
    month: 7, name: '7월', demand: '상', color: 'var(--success)',
    events: ['장마 (배달↑↑)', '여름휴가 (주문↓ 후반)'],
    actions: ['장마 기간 풀 가동', '7월 말 재고 조절', '시원한 메뉴 추가'],
    icon: CloudRain,
  },
  {
    month: 8, name: '8월', demand: '중', color: 'var(--primary)',
    events: ['폭염 (배달↑)', '여름휴가'],
    actions: ['폭염 특수 활용', '휴가 기간 인력 관리', '냉면/냉우동 사이드'],
    icon: Sun,
  },
  {
    month: 9, name: '9월', demand: '중', color: 'var(--primary)',
    events: ['추석 (주문↓)', '개학 (주문↑)'],
    actions: ['추석 전후 할인', '개학 맞이 이벤트', '가을 신메뉴 출시'],
    icon: Cloud,
  },
  {
    month: 10, name: '10월', demand: '상', color: 'var(--success)',
    events: ['가을 성수기 (주문↑)'],
    actions: ['마케팅 예산 집중 투입', '리뷰 이벤트 강화', '인력 충원 검토'],
    icon: Sun,
  },
  {
    month: 11, name: '11월', demand: '상', color: 'var(--success)',
    events: ['수능 (주문↑)', '가을'],
    actions: ['수능 응원 이벤트', '야식 시간대 강화', '겨울 메뉴 준비'],
    icon: Cloud,
  },
  {
    month: 12, name: '12월', demand: '상', color: 'var(--success)',
    events: ['연말 (주문↑)', '크리스마스', '송년회'],
    actions: ['연말 파티 세트', '크리스마스 한정 메뉴', '송년회 단체 주문 홍보'],
    icon: Cloud,
  },
];

function SeasonTab() {
  const currentMonth = new Date().getMonth() + 1;
  const currentSeason = SEASON_DATA.find(s => s.month === currentMonth) || SEASON_DATA[0];

  return (
    <div className="bs-tab-content">
      {/* Current Month Action Plan */}
      <div className="bs-card bs-action-plan">
        <h3 className="bs-card-title"><Zap size={16} /> 이번 달 액션 플랜 ({currentSeason.name})</h3>
        <div className="bs-plan-summary">
          <div className="bs-plan-demand" style={{ color: currentSeason.color }}>
            <span className="bs-plan-demand-label">예상 수요</span>
            <span className="bs-plan-demand-val">{currentSeason.demand}</span>
          </div>
          <div className="bs-plan-events">
            <strong>주요 이벤트:</strong>
            {currentSeason.events.map((e, i) => (
              <span key={i} className="bs-plan-event-tag">{e}</span>
            ))}
          </div>
        </div>
        <div className="bs-plan-actions">
          <strong>추천 액션:</strong>
          <ul>
            {currentSeason.actions.map((a, i) => (
              <li key={i}><CheckCircle2 size={13} /> {a}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 12-Month Calendar Grid */}
      <div className="bs-card">
        <h3 className="bs-card-title"><Calendar size={16} /> 연간 시즌 캘린더</h3>
        <div className="bs-calendar-grid">
          {SEASON_DATA.map(season => {
            const Icon = season.icon;
            const isCurrent = season.month === currentMonth;
            return (
              <div
                key={season.month}
                className={`bs-month-card ${isCurrent ? 'current' : ''}`}
                style={{ borderColor: isCurrent ? season.color : 'var(--border)' }}
              >
                <div className="bs-month-header">
                  <span className="bs-month-name">{season.name}</span>
                  <Icon size={14} style={{ color: 'var(--text-light)' }} />
                  <span
                    className="bs-demand-badge"
                    style={{
                      background: season.demand === '상' ? 'var(--success-light, #dcfce7)' : season.demand === '하' ? 'var(--danger-light, #fef2f2)' : 'var(--primary-light)',
                      color: season.color,
                    }}
                  >
                    {season.demand === '상' ? '주문↑' : season.demand === '하' ? '주문↓' : '보통'}
                  </span>
                </div>
                <div className="bs-month-events">
                  {season.events.map((e, i) => (
                    <span key={i} className="bs-event-line">
                      {e.includes('↑') ? <ArrowUp size={10} style={{ color: 'var(--success)' }} /> : e.includes('↓') ? <ArrowDown size={10} style={{ color: 'var(--danger)' }} /> : null}
                      {e}
                    </span>
                  ))}
                </div>
                <div className="bs-month-actions">
                  {season.actions.slice(0, 2).map((a, i) => (
                    <span key={i} className="bs-action-line">- {a}</span>
                  ))}
                  {season.actions.length > 2 && (
                    <span className="bs-action-more">+{season.actions.length - 2}개 더</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bs-card bs-legend-card">
        <div className="bs-legend-items">
          <span className="bs-legend-item">
            <span className="bs-legend-dot" style={{ background: 'var(--success)' }} />
            <span>주문 증가 예상 (상)</span>
          </span>
          <span className="bs-legend-item">
            <span className="bs-legend-dot" style={{ background: 'var(--primary)' }} />
            <span>보통 (중)</span>
          </span>
          <span className="bs-legend-item">
            <span className="bs-legend-dot" style={{ background: 'var(--danger)' }} />
            <span>주문 감소 예상 (하)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const baeminScoreCSS = `
  .bs { max-width: 1200px; }
  .bs-page-header { margin-bottom: 28px; }
  .bs-page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
  .bs-page-header p { color: var(--text-light); font-size: 14px; }

  /* Tab Bar */
  .bs-tab-bar {
    display: flex; gap: 6px; margin-bottom: 24px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding-bottom: 4px;
  }
  .bs-tab-bar::-webkit-scrollbar { display: none; }
  .bs-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; color: var(--text);
    background: var(--bg-card); border: 1px solid var(--border);
    white-space: nowrap; transition: all 0.2s; flex-shrink: 0;
  }
  .bs-tab:hover { border-color: var(--primary); color: var(--primary); }
  .bs-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

  .bs-tab-content { display: flex; flex-direction: column; gap: 20px; }

  /* Card */
  .bs-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm);
  }
  .bs-card-title {
    font-size: 15px; font-weight: 600; color: var(--text-dark);
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }

  /* Gauge */
  .bs-gauge-card { text-align: center; }
  .bs-gauge-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .bs-gauge { position: relative; width: 220px; height: 130px; }
  .bs-gauge-svg { width: 100%; height: 100%; }
  .bs-gauge-text {
    position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center;
  }
  .bs-gauge-number { font-size: 42px; font-weight: 800; line-height: 1; }
  .bs-gauge-label { font-size: 14px; font-weight: 600; color: var(--text); margin-top: 2px; }
  .bs-gauge-legend {
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
    font-size: 11px; color: var(--text-light);
  }
  .bs-dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px;
    vertical-align: middle;
  }

  /* Score Grid */
  .bs-score-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
  .bs-score-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm);
    display: flex; flex-direction: column; gap: 12px;
  }
  .bs-score-card-header { display: flex; align-items: center; gap: 12px; }
  .bs-score-icon {
    width: 40px; height: 40px; border-radius: var(--radius-sm);
    background: var(--bg); display: flex; align-items: center; justify-content: center;
  }
  .bs-score-name { font-size: 14px; font-weight: 600; color: var(--text-dark); }
  .bs-score-weight { font-size: 11px; color: var(--text-light); }
  .bs-score-badge {
    margin-left: auto; padding: 4px 12px; border-radius: 12px;
    font-size: 13px; font-weight: 700; color: #fff;
  }
  .bs-score-row {
    display: flex; justify-content: space-between; font-size: 13px; color: var(--text);
  }
  .bs-score-bar-track {
    width: 100%; height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden;
  }
  .bs-score-bar-fill { height: 100%; border-radius: 4px; }
  .bs-score-rec {
    display: flex; align-items: flex-start; gap: 6px;
    font-size: 12px; color: var(--warning); padding: 8px 10px;
    background: var(--warning-light, #fff7ed); border-radius: var(--radius-sm);
  }

  /* Checklist */
  .bs-checklist { display: flex; flex-direction: column; gap: 8px; }
  .bs-check-item {
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm);
    transition: background 0.2s;
  }
  .bs-check-item:hover { background: var(--border-light); }
  .bs-check-item input[type="checkbox"] {
    width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer;
  }
  .bs-check-label { font-size: 13px; color: var(--text-dark); flex: 1; }
  .bs-check-label.done { text-decoration: line-through; color: var(--text-light); }

  /* Cook Time */
  .bs-cook-section { display: flex; flex-direction: column; gap: 12px; }
  .bs-cook-display { display: flex; align-items: baseline; gap: 12px; }
  .bs-cook-val { font-size: 28px; font-weight: 700; color: var(--text-dark); }
  .bs-cook-target { font-size: 13px; color: var(--text-light); }
  .bs-slider {
    width: 100%; height: 6px; -webkit-appearance: none; appearance: none;
    background: var(--border); border-radius: 3px; outline: none;
  }
  .bs-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px;
    border-radius: 50%; background: var(--primary); cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  }
  .bs-slider-range { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-light); }

  /* Goal */
  .bs-goal-card { border-left: 4px solid var(--warning); }
  .bs-goal-content { display: flex; align-items: flex-start; gap: 16px; }
  .bs-goal-icon { flex-shrink: 0; }
  .bs-goal-main { font-size: 14px; color: var(--text-dark); margin-bottom: 6px; }
  .bs-goal-action { font-size: 13px; color: var(--text); }

  /* Season Calendar */
  .bs-calendar-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;
  }
  .bs-month-card {
    border: 2px solid var(--border); border-radius: var(--radius);
    padding: 14px; display: flex; flex-direction: column; gap: 8px;
    transition: all 0.2s; background: var(--bg-card);
  }
  .bs-month-card.current {
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
    border-width: 3px;
  }
  .bs-month-header {
    display: flex; align-items: center; gap: 8px;
  }
  .bs-month-name { font-size: 16px; font-weight: 700; color: var(--text-dark); }
  .bs-demand-badge {
    margin-left: auto; padding: 2px 10px; border-radius: 10px;
    font-size: 11px; font-weight: 600;
  }
  .bs-month-events { display: flex; flex-direction: column; gap: 3px; }
  .bs-event-line {
    font-size: 12px; color: var(--text); display: flex; align-items: center; gap: 4px;
  }
  .bs-month-actions {
    display: flex; flex-direction: column; gap: 2px;
    padding-top: 6px; border-top: 1px solid var(--border-light);
  }
  .bs-action-line { font-size: 11px; color: var(--text-light); }
  .bs-action-more { font-size: 11px; color: var(--primary); font-weight: 500; }

  /* Action Plan */
  .bs-action-plan { border-left: 4px solid var(--primary); }
  .bs-plan-summary { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
  .bs-plan-demand { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .bs-plan-demand-label { font-size: 11px; color: var(--text-light); }
  .bs-plan-demand-val { font-size: 32px; font-weight: 800; }
  .bs-plan-events { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 13px; color: var(--text); }
  .bs-plan-event-tag {
    padding: 3px 10px; background: var(--bg); border-radius: 10px;
    font-size: 12px; color: var(--text-dark); border: 1px solid var(--border);
  }
  .bs-plan-actions { font-size: 13px; color: var(--text); }
  .bs-plan-actions strong { display: block; margin-bottom: 8px; color: var(--text-dark); }
  .bs-plan-actions ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  .bs-plan-actions li {
    display: flex; align-items: center; gap: 8px; padding: 6px 10px;
    background: var(--bg); border-radius: var(--radius-sm); font-size: 13px;
  }
  .bs-plan-actions li svg { color: var(--success); flex-shrink: 0; }

  /* Legend */
  .bs-legend-card { padding: 16px 24px; }
  .bs-legend-items { display: flex; gap: 24px; flex-wrap: wrap; }
  .bs-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text); }
  .bs-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  @media (max-width: 768px) {
    .bs-score-grid { grid-template-columns: 1fr; }
    .bs-calendar-grid { grid-template-columns: 1fr; }
    .bs-plan-summary { flex-direction: column; align-items: flex-start; }
  }
`;
