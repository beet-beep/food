import { LayoutDashboard, CheckSquare, UtensilsCrossed, FileText, Wallet, Menu, X, Receipt, Search, RotateCcw, Calculator, Star, Package, BarChart3, Rocket, ClipboardList, TrendingUp, Award, Zap, DollarSign, BookOpen, Timer, Users, Shield, AlertTriangle, Megaphone, Lightbulb, Database, Image, ShoppingCart, FileSpreadsheet, Wrench, PieChart } from 'lucide-react';

const sections = [
  {
    label: '일일 관리',
    tabs: [
      { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
      { id: 'today', label: '오늘 매출', icon: Zap },
      { id: 'daily', label: '매출 기록', icon: Receipt },
      { id: 'dailyOps', label: '일일 운영', icon: ClipboardList },
      { id: 'orderSim', label: '주문 시뮬레이터', icon: Timer },
      { id: 'quickTools', label: '빠른 도구', icon: Wrench },
    ],
  },
  {
    label: '메뉴/원가',
    tabs: [
      { id: 'menu', label: '메뉴 관리', icon: UtensilsCrossed },
      { id: 'menuTools', label: '메뉴 도구', icon: Image },
      { id: 'menuSales', label: '메뉴별 판매', icon: ShoppingCart },
      { id: 'menuReport', label: '메뉴 성적표', icon: TrendingUp },
      { id: 'cost', label: '코스트 계산기', icon: Calculator },
      { id: 'orderCalc', label: '발주 계산기', icon: Package },
      { id: 'ingredientPrice', label: '식재료 시세', icon: DollarSign },
    ],
  },
  {
    label: '마케팅/고객',
    tabs: [
      { id: 'reviews', label: '리뷰 관리', icon: Star },
      { id: 'marketing', label: '마케팅 센터', icon: Megaphone },
      { id: 'competitors', label: '경쟁사 분석', icon: Search },
    ],
  },
  {
    label: '분석',
    tabs: [
      { id: 'insights', label: '스마트 인사이트', icon: Lightbulb },
      { id: 'analytics', label: '분석 센터', icon: BarChart3 },
      { id: 'baeminScore', label: '배민 점수판', icon: Award },
      { id: 'whatIf', label: 'What-If 시나리오', icon: Zap },
      { id: 'profitLoss', label: '완전 손익분석', icon: PieChart },
      { id: 'weeklyReport', label: '주간/세무 리포트', icon: FileSpreadsheet },
    ],
  },
  {
    label: '행정/재무',
    tabs: [
      { id: 'admin', label: '행정/플랫폼', icon: FileText },
      { id: 'finance', label: '재무 관리', icon: Wallet },
      { id: 'platformGuide', label: '플랫폼 가이드', icon: BookOpen },
      { id: 'checklist', label: '4주 체크리스트', icon: CheckSquare },
    ],
  },
  {
    label: '매장 관리',
    tabs: [
      { id: 'staff', label: '직원/일정', icon: Users },
      { id: 'hygiene', label: '위생 점검', icon: Shield },
      { id: 'emergency', label: '비상 매뉴얼', icon: AlertTriangle },
    ],
  },
  {
    label: '성장/시스템',
    tabs: [
      { id: 'growth', label: '성장 전략', icon: Rocket },
      { id: 'dataManager', label: '데이터 관리', icon: Database },
    ],
  },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, onToggle, stats }) {
  const {
    totalTasks = 0,
    doneTasks = 0,
    adminTotal = 0,
    adminDone = 0,
  } = stats || {};

  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const remainingTasks = totalTasks - doneTasks;

  const getBadge = (tabId) => {
    if (tabId === 'checklist' && remainingTasks > 0) {
      return <span className="sidebar-badge">{remainingTasks}</span>;
    }
    if (tabId === 'admin' && adminTotal > 0) {
      return <span className="sidebar-badge sidebar-badge-fraction">{adminDone}/{adminTotal}</span>;
    }
    return null;
  };

  const handleReset = () => {
    if (window.confirm('모든 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <>
      <button className="mobile-menu-btn" onClick={onToggle}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">🍚</span>
          <div>
            <h1 className="sidebar-title">덮밥집 창업</h1>
            <p className="sidebar-subtitle">운서역 배달 전문점</p>
          </div>
        </div>

        <div className="sidebar-progress">
          <div className="sidebar-progress-label">
            <span>전체 진행률</span>
            <span className="sidebar-progress-pct">{progressPct}%</span>
          </div>
          <div className="sidebar-progress-track">
            <div
              className="sidebar-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section, si) => (
            <div key={section.label} className="sidebar-section">
              {si > 0 && <div className="sidebar-divider" />}
              <span className="sidebar-section-label">{section.label}</span>
              {section.tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={20} />
                    <span className="sidebar-item-label">{tab.label}</span>
                    {getBadge(tab.id)}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-info">
            <p>👤 사장님 (대표)</p>
            <p>👨‍🍳 셰프 (아버님)</p>
          </div>
          <div className="sidebar-date">오늘: {dateStr}</div>
          <div className="sidebar-actions">
            <button className="sidebar-theme-btn" onClick={() => {
              const html = document.documentElement;
              const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
              html.setAttribute('data-theme', next);
              localStorage.setItem('theme', next);
            }} title="다크 모드 전환">
              🌙
            </button>
            <button className="sidebar-reset-btn" onClick={handleReset}>
              <RotateCcw size={12} />
              <span>초기화</span>
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 60;
          background: var(--bg-sidebar);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 260px;
          height: 100vh;
          background: var(--bg-sidebar);
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow-y: auto;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-logo {
          font-size: 32px;
        }
        .sidebar-title {
          color: var(--text-sidebar-active);
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }
        .sidebar-subtitle {
          color: var(--text-sidebar);
          font-size: 12px;
          margin: 2px 0 0;
        }

        /* Progress bar */
        .sidebar-progress {
          padding: 14px 20px 10px;
        }
        .sidebar-progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: var(--text-sidebar);
          margin-bottom: 6px;
        }
        .sidebar-progress-pct {
          color: var(--text-sidebar-active);
          font-weight: 600;
        }
        .sidebar-progress-track {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        .sidebar-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        /* Nav */
        .sidebar-nav {
          flex: 1;
          padding: 8px 8px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sidebar-section-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          padding: 10px 16px 4px;
          user-select: none;
        }
        .sidebar-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 6px 16px;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 8px;
          color: var(--text-sidebar);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s;
          width: 100%;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          position: relative;
        }
        .sidebar-item:hover {
          background: var(--bg-sidebar-hover);
          color: var(--text-sidebar-active);
        }
        .sidebar-item.active {
          background: var(--primary);
          color: white;
        }
        .sidebar-item-label {
          flex: 1;
        }

        /* Badges */
        .sidebar-badge {
          font-size: 11px;
          font-weight: 600;
          background: rgba(255,255,255,0.15);
          color: var(--text-sidebar-active);
          padding: 1px 7px;
          border-radius: 10px;
          line-height: 1.5;
          white-space: nowrap;
        }
        .sidebar-item.active .sidebar-badge {
          background: rgba(255,255,255,0.25);
          color: white;
        }

        /* Footer */
        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-info p {
          color: var(--text-sidebar);
          font-size: 13px;
          margin: 4px 0;
        }
        .sidebar-date {
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          margin-top: 10px;
        }
        .sidebar-actions {
          display: flex; gap: 6px; margin-top: 8px; align-items: center;
        }
        .sidebar-theme-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 14px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; transition: all 0.15s;
        }
        .sidebar-theme-btn:hover { background: rgba(255,255,255,0.1); }
        .sidebar-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .sidebar-reset-btn:hover {
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
        }

        @media (max-width: 768px) {
          .mobile-menu-btn { display: block; }
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
