import { useEffect, useState } from 'react';
import {
  Calendar, CheckCircle2, TrendingUp, Clock, AlertTriangle, Rocket,
  ClipboardList, PenLine, UtensilsCrossed, BookOpen, BarChart3, DollarSign,
} from 'lucide-react';
import { OPEN_DATE } from '../data/initialData';

/* ─── helpers ─── */

function getDday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const open = new Date(OPEN_DATE);
  open.setHours(0, 0, 0, 0);
  return Math.ceil((open - today) / (1000 * 60 * 60 * 24));
}

function getWeekProgress(tasks) {
  return tasks.map(week => {
    const total = week.days.reduce((s, d) => s + d.tasks.length, 0);
    const done = week.days.reduce((s, d) => s + d.tasks.filter(t => t.done).length, 0);
    return { title: week.title, total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  });
}

function getTodayTasks(tasks) {
  const today = new Date().toISOString().split('T')[0];
  const result = [];
  tasks.forEach((week, wi) => {
    week.days.forEach((day, di) => {
      if (day.date === today) {
        day.tasks.forEach(t => result.push({ ...t, weekIdx: wi, dayIdx: di }));
      }
    });
  });
  return result;
}

function getUpcomingDeadlines(admin) {
  const today = new Date();
  return admin
    .filter(a => a.status !== 'done' && new Date(a.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);
}

function getMotivation(pct) {
  if (pct >= 100) return '모든 준비 완료! 대박나세요! 🎉';
  if (pct >= 75) return '거의 다 왔어요! 마지막 스퍼트! 🚀';
  if (pct >= 50) return '반 넘었어요! 오픈이 눈앞입니다 🔥';
  if (pct >= 25) return '잘 진행되고 있어요! 이 속도면 충분합니다 👍';
  return '시작이 반! 화이팅! 💪';
}

function calcMenuCost(ingredients) {
  return (ingredients || []).reduce((s, i) => s + (i.cost || 0), 0);
}

const fmt = (n) => Number(n).toLocaleString('ko-KR');

/* ─── CircularProgress SVG ─── */

function CircularProgress({ pct }) {
  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (pct / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [pct, circumference]);

  return (
    <svg width={size} height={size} className="circular-progress">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border-light)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="circular-progress-text"
      >
        {pct}%
      </text>
    </svg>
  );
}

/* ─── Main component ─── */

export default function Dashboard({ stats, tasks, admin, platforms, ledger, menus, onNavigate }) {
  const dday = getDday();
  const weekProgress = getWeekProgress(tasks);
  const todayTasks = getTodayTasks(tasks);
  const overallPct = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;
  const deadlines = getUpcomingDeadlines(admin);
  const motivation = getMotivation(overallPct);

  /* last 6 months of ledger data */
  const ledgerSlice = (ledger || []).slice(0, 6);
  const ledgerChartData = ledgerSlice.map(m => {
    const rev = Object.values(m.revenue || {}).reduce((s, v) => s + v, 0);
    const exp = Object.values(m.expense || {}).reduce((s, v) => s + v, 0);
    const monthNum = m.yearMonth ? m.yearMonth.split('-')[1] : '';
    return { label: `${parseInt(monthNum, 10)}월`, revenue: rev, expense: exp };
  });
  const hasRevenueData = ledgerChartData.some(d => d.revenue > 0);
  const chartMax = Math.max(...ledgerChartData.map(d => Math.max(d.revenue, d.expense)), 1);

  /* menu profitability — main items only */
  const mainMenus = (menus || []).filter(m => m.category === 'main');

  const roleLabel = (role) => {
    if (role === 'owner') return '사장님';
    if (role === 'chef') return '셰프';
    return '함께';
  };

  const roleColor = (role) => {
    if (role === 'owner') return '#2563eb';
    if (role === 'chef') return '#ea580c';
    return '#7c3aed';
  };

  const quickActions = [
    { label: '체크리스트', icon: ClipboardList, tab: 'checklist', color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: '매출 입력', icon: PenLine, tab: 'daily', color: 'var(--success)', bg: 'var(--success-light)' },
    { label: '메뉴 관리', icon: UtensilsCrossed, tab: 'menu', color: 'var(--warning)', bg: 'var(--warning-light)' },
    { label: '장부 보기', icon: BookOpen, tab: 'finance', color: 'var(--purple)', bg: 'var(--purple-light)' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>대시보드</h1>
        <p>영종도 운서역 배달 덮밥집 — 1개월 창업 로드맵</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="stats-grid">
        <div className="stat-card dday">
          <div className="stat-icon-wrap dday-icon">
            <Rocket size={24} />
          </div>
          <div>
            <p className="stat-label">오픈까지</p>
            <p className="stat-value">{dday <= 0 ? '오픈 완료!' : `D-${dday}`}</p>
            <p className="stat-sub">목표: 2026.04.27</p>
          </div>
        </div>

        <div className="stat-card progress-card">
          <CircularProgress pct={overallPct} />
          <div>
            <p className="stat-label">전체 진행률</p>
            <p className="stat-sub">{stats.doneTasks}/{stats.totalTasks} 완료</p>
            <p className="motivation-msg">{motivation}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="stat-label">행정 절차</p>
            <p className="stat-value">{stats.adminDone}/{stats.adminTotal}</p>
            <p className="stat-sub">완료</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p className="stat-label">플랫폼 입점</p>
            <p className="stat-value">{stats.platformDone}/{stats.platformTotal}</p>
            <p className="stat-sub">완료</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="quick-actions-row">
        {quickActions.map(qa => {
          const Icon = qa.icon;
          return (
            <button
              key={qa.tab}
              className="quick-action-card"
              onClick={() => onNavigate && onNavigate(qa.tab)}
            >
              <div className="qa-icon" style={{ background: qa.bg, color: qa.color }}>
                <Icon size={22} />
              </div>
              <span className="qa-label">{qa.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Today Tasks + Deadlines ── */}
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title"><Clock size={18} /> 오늘 할 일</h2>
          {todayTasks.length === 0 ? (
            <p className="empty-msg">오늘 예정된 태스크가 없습니다.</p>
          ) : (
            <ul className="today-list">
              {todayTasks.map(t => (
                <li key={t.id} className={t.done ? 'done' : ''}>
                  <span className="role-badge" style={{ background: roleColor(t.role), color: '#fff' }}>{roleLabel(t.role)}</span>
                  <span>{t.text}</span>
                  {t.done && <CheckCircle2 size={16} style={{ color: 'var(--success)', marginLeft: 'auto', flexShrink: 0 }} />}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="card-title"><AlertTriangle size={18} /> 다가오는 마감</h2>
          {deadlines.length === 0 ? (
            <p className="empty-msg">모든 행정 절차가 완료되었습니다!</p>
          ) : (
            <ul className="deadline-list">
              {deadlines.map(d => {
                const due = new Date(d.dueDate);
                const diffDays = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <li key={d.id}>
                    <div>
                      <strong>{d.title}</strong>
                      <p className="deadline-desc">{d.desc}</p>
                    </div>
                    <span className={`deadline-badge ${diffDays <= 3 ? 'urgent' : ''}`}>
                      {diffDays <= 0 ? '오늘!' : `${diffDays}일 남음`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Revenue Mini Chart ── */}
      <div className="card">
        <h2 className="card-title"><BarChart3 size={18} /> 최근 매출 현황</h2>
        {!hasRevenueData ? (
          <p className="empty-msg">아직 매출 데이터가 없습니다. 오픈 후 기록하세요!</p>
        ) : (
          <div className="mini-chart-wrap">
            <div className="mini-chart-legend">
              <span className="legend-item"><span className="legend-dot revenue-dot"></span>매출</span>
              <span className="legend-item"><span className="legend-dot expense-dot"></span>지출</span>
            </div>
            <div className="mini-chart">
              {ledgerChartData.map((d, i) => (
                <div key={i} className="chart-col">
                  <div className="chart-bars">
                    <div
                      className="chart-bar revenue-bar"
                      style={{ height: `${(d.revenue / chartMax) * 100}%` }}
                      title={`매출: ${fmt(d.revenue)}원`}
                    ></div>
                    <div
                      className="chart-bar expense-bar"
                      style={{ height: `${(d.expense / chartMax) * 100}%` }}
                      title={`지출: ${fmt(d.expense)}원`}
                    ></div>
                  </div>
                  <span className="chart-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Menu Profitability ── */}
      {mainMenus.length > 0 && (
        <div className="card">
          <h2 className="card-title"><DollarSign size={18} /> 메뉴 수익성</h2>
          <div className="menu-profit-list">
            {mainMenus.map(m => {
              const cost = calcMenuCost(m.ingredients);
              const costRate = m.price > 0 ? (cost / m.price) * 100 : 0;
              const barColor = costRate > 35 ? 'var(--danger)' : costRate > 30 ? 'var(--warning)' : 'var(--success)';
              const barBg = costRate > 35 ? 'var(--danger-light)' : costRate > 30 ? 'var(--warning-light)' : 'var(--success-light)';
              return (
                <div key={m.id} className="menu-profit-item">
                  <div className="mp-header">
                    <span className="mp-name">{m.emoji} {m.name}</span>
                    <span className="mp-rate" style={{ color: barColor }}>{costRate.toFixed(1)}%</span>
                  </div>
                  <div className="mp-details">
                    <span>판매가 {fmt(m.price)}원</span>
                    <span>원가 {fmt(cost)}원</span>
                  </div>
                  <div className="mp-bar-bg" style={{ background: barBg }}>
                    <div className="mp-bar-fill" style={{ width: `${Math.min(costRate, 100)}%`, background: barColor }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Week Progress ── */}
      <div className="card">
        <h2 className="card-title"><TrendingUp size={18} /> 주차별 진행률</h2>
        <div className="week-progress-grid">
          {weekProgress.map((w, i) => (
            <div key={i} className="week-progress-item">
              <div className="week-progress-header">
                <span className="week-label">{w.title}</span>
                <span className="week-pct">{w.pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${w.pct}%` }}></div>
              </div>
              <span className="week-detail">{w.done}/{w.total} 완료</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard { max-width: 1200px; }
        .page-header { margin-bottom: 28px; }
        .page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .page-header p { color: var(--text-light); font-size: 14px; }

        /* ── Stats Grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm);
        }
        .stat-card.dday {
          background: linear-gradient(135deg, #1e3a5f, #2563eb);
          border: none;
          color: white;
        }
        .stat-card.dday .stat-label,
        .stat-card.dday .stat-sub { color: rgba(255,255,255,0.8); }
        .stat-card.dday .stat-value { color: white; }
        .stat-card.progress-card {
          gap: 20px;
        }
        .stat-icon-wrap {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dday-icon { background: rgba(255,255,255,0.2); color: white; }
        .stat-label { font-size: 13px; color: var(--text-light); margin-bottom: 4px; }
        .stat-value { font-size: 28px; font-weight: 700; color: var(--text-dark); line-height: 1.2; }
        .stat-sub { font-size: 12px; color: var(--text-light); margin-top: 2px; }

        /* ── Circular Progress ── */
        .circular-progress { flex-shrink: 0; }
        .circular-progress-text {
          font-size: 26px;
          font-weight: 700;
          fill: var(--text-dark);
        }
        .motivation-msg {
          font-size: 12px;
          color: var(--primary);
          font-weight: 500;
          margin-top: 6px;
          line-height: 1.4;
        }

        /* ── Quick Actions ── */
        .quick-actions-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .quick-action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }
        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        .qa-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qa-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
        }

        /* ── Dashboard Grid (today + deadlines) ── */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }
        .dashboard-grid .card { margin-bottom: 0; }
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .today-list, .deadline-list { list-style: none; }
        .today-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border-light);
          font-size: 14px;
        }
        .today-list li.done { text-decoration: line-through; opacity: 0.5; }
        .today-list li:last-child, .deadline-list li:last-child { border-bottom: none; }
        .role-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .deadline-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--border-light);
        }
        .deadline-desc { font-size: 12px; color: var(--text-light); margin-top: 2px; }
        .deadline-badge {
          font-size: 12px; font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          background: var(--primary-light);
          color: var(--primary);
          white-space: nowrap;
        }
        .deadline-badge.urgent {
          background: var(--danger-light);
          color: var(--danger);
        }

        .empty-msg { color: var(--text-light); font-size: 14px; text-align: center; padding: 20px; }

        /* ── Mini Bar Chart ── */
        .mini-chart-wrap { padding: 4px 0; }
        .mini-chart-legend {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          justify-content: flex-end;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-light);
        }
        .legend-dot {
          width: 10px; height: 10px;
          border-radius: 3px;
          display: inline-block;
        }
        .revenue-dot { background: var(--primary); }
        .expense-dot { background: var(--danger); }
        .mini-chart {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          height: 140px;
        }
        .chart-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        .chart-bars {
          flex: 1;
          display: flex;
          gap: 4px;
          align-items: flex-end;
          width: 100%;
          justify-content: center;
        }
        .chart-bar {
          width: 40%;
          min-height: 2px;
          border-radius: 4px 4px 0 0;
          transition: height 0.4s ease;
        }
        .revenue-bar { background: linear-gradient(180deg, var(--primary), #93c5fd); }
        .expense-bar { background: linear-gradient(180deg, var(--danger), #fca5a5); }
        .chart-label {
          font-size: 11px;
          color: var(--text-light);
          margin-top: 8px;
          font-weight: 500;
        }

        /* ── Menu Profitability ── */
        .menu-profit-list {
          display: grid;
          gap: 16px;
        }
        .menu-profit-item {
          padding: 12px 0;
          border-bottom: 1px solid var(--border-light);
        }
        .menu-profit-item:last-child { border-bottom: none; }
        .mp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .mp-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-dark);
        }
        .mp-rate {
          font-size: 14px;
          font-weight: 700;
        }
        .mp-details {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--text-light);
          margin-bottom: 8px;
        }
        .mp-bar-bg {
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }
        .mp-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }

        /* ── Week Progress ── */
        .week-progress-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .week-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .week-label { font-size: 13px; font-weight: 600; color: var(--text-dark); }
        .week-pct { font-size: 14px; font-weight: 700; color: var(--primary); }
        .progress-bar {
          height: 8px;
          background: var(--border-light);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), #60a5fa);
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        .week-detail { font-size: 12px; color: var(--text-light); margin-top: 4px; display: block; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-grid { grid-template-columns: 1fr; }
          .week-progress-grid { grid-template-columns: 1fr; }
          .quick-actions-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
          .quick-actions-row { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
