import { useState, useMemo } from 'react';
import { Zap, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Users, Clock, Flag, ArrowRight, Check, X, AlertTriangle } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

/* ================================================================
   WHAT-IF — 시나리오 시뮬레이터
   ================================================================ */
const DEFAULT_SCENARIOS = [
  {
    id: 's1',
    title: '깃발 추가',
    description: '배민 울트라콜 깃발 1개 추가',
    icon: 'flag',
    monthlyCost: 88000,
    orderChangePct: 15,
    avgPriceChange: 0,
    duration: 6,
    active: true,
  },
  {
    id: 's2',
    title: '야간 영업 시작',
    description: '21-01시 영업 확장',
    icon: 'clock',
    monthlyCost: 300000,
    orderChangePct: 25,
    avgPriceChange: 0,
    duration: 6,
    active: true,
  },
  {
    id: 's3',
    title: '배달팁 0원 이벤트',
    description: '2주간 배달팁 무료',
    icon: 'zap',
    monthlyCost: 210000,
    orderChangePct: 35,
    avgPriceChange: 0,
    duration: 1,
    active: true,
  },
  {
    id: 's4',
    title: '메뉴 가격 500원 인상',
    description: '전 메뉴 일괄 가격 인상',
    icon: 'dollar',
    monthlyCost: 0,
    orderChangePct: -5,
    avgPriceChange: 500,
    duration: 12,
    active: true,
  },
  {
    id: 's5',
    title: '직원 1명 채용',
    description: '파트타이머 추가 채용',
    icon: 'users',
    monthlyCost: 1500000,
    orderChangePct: 20,
    avgPriceChange: 0,
    duration: 12,
    active: true,
  },
];

const ICON_MAP = {
  flag: Flag,
  clock: Clock,
  zap: Zap,
  dollar: DollarSign,
  users: Users,
  custom: Plus,
};

export default function WhatIf({ menus, finance, dailyLogs, costData }) {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [showAdd, setShowAdd] = useState(false);
  const [newScenario, setNewScenario] = useState({
    title: '',
    description: '',
    icon: 'custom',
    monthlyCost: 0,
    orderChangePct: 0,
    avgPriceChange: 0,
    duration: 6,
  });

  /* Calculate current monthly baseline from dailyLogs + finance */
  const baseline = useMemo(() => {
    const logs = dailyLogs || [];
    const recent = logs.slice(-30);

    let avgDailyOrders = 0;
    let avgDailyRevenue = 0;
    if (recent.length > 0) {
      avgDailyOrders = recent.reduce((s, d) => {
        return s + Object.values(d.orders || {}).reduce((a, b) => a + Number(b || 0), 0);
      }, 0) / recent.length;
      avgDailyRevenue = recent.reduce((s, d) => {
        return s + Object.values(d.revenue || {}).reduce((a, b) => a + Number(b || 0), 0);
      }, 0) / recent.length;
    } else {
      const assumptions = finance?.assumptions || {};
      avgDailyOrders = assumptions.dailyOrders || 30;
      avgDailyRevenue = avgDailyOrders * (assumptions.avgOrderPrice || 12000);
    }

    const avgOrderPrice = avgDailyOrders > 0 ? avgDailyRevenue / avgDailyOrders : (finance?.assumptions?.avgOrderPrice || 12000);
    const monthlyOrders = Math.round(avgDailyOrders * 30);
    const monthlyRevenue = Math.round(avgDailyRevenue * 30);

    /* Cost estimation */
    const costRate = finance?.assumptions?.avgCostRate || 0.32;
    const platformFeeRate = finance?.assumptions?.platformFeeRate || 0.10;
    const deliveryFee = finance?.assumptions?.deliveryFeePerOrder || 3500;
    const monthlyFixed = (finance?.monthlyFixed || []).reduce((s, f) => s + (f.amount || 0), 0);

    const variableCosts = monthlyRevenue * costRate + monthlyRevenue * platformFeeRate + monthlyOrders * deliveryFee;
    const monthlyProfit = monthlyRevenue - variableCosts - monthlyFixed;

    return {
      avgDailyOrders,
      avgOrderPrice,
      monthlyOrders,
      monthlyRevenue,
      monthlyFixed,
      costRate,
      platformFeeRate,
      deliveryFee,
      variableCosts,
      monthlyProfit,
    };
  }, [dailyLogs, finance]);

  /* Calculate projected numbers for each scenario */
  const scenarioResults = useMemo(() => {
    return scenarios.map(s => {
      const newDailyOrders = baseline.avgDailyOrders * (1 + s.orderChangePct / 100);
      const newAvgPrice = baseline.avgOrderPrice + s.avgPriceChange;
      const newMonthlyOrders = Math.round(newDailyOrders * 30);
      const newMonthlyRevenue = Math.round(newDailyOrders * 30 * newAvgPrice);
      const newVariableCosts = newMonthlyRevenue * baseline.costRate
        + newMonthlyRevenue * baseline.platformFeeRate
        + newMonthlyOrders * baseline.deliveryFee;
      const newMonthlyFixed = baseline.monthlyFixed + s.monthlyCost;
      const newMonthlyProfit = newMonthlyRevenue - newVariableCosts - newMonthlyFixed;
      const profitChange = newMonthlyProfit - baseline.monthlyProfit;

      /* ROI */
      const investment = s.monthlyCost * s.duration;
      const totalProfitGain = profitChange * s.duration;
      const roi = investment > 0 ? (totalProfitGain / investment) * 100 : (profitChange > 0 ? Infinity : 0);

      /* Payback */
      const paybackMonths = profitChange > 0 && s.monthlyCost > 0
        ? Math.ceil(s.monthlyCost / profitChange)
        : profitChange > 0 ? 0 : Infinity;

      return {
        ...s,
        newMonthlyOrders,
        newMonthlyRevenue,
        newMonthlyProfit,
        profitChange,
        roi,
        paybackMonths,
        isPositive: profitChange >= 0,
      };
    });
  }, [scenarios, baseline]);

  /* Best scenario */
  const activeResults = scenarioResults.filter(s => s.active);
  const bestScenario = activeResults.length > 0
    ? activeResults.reduce((best, cur) => cur.profitChange > best.profitChange ? cur : best, activeResults[0])
    : null;

  const updateScenario = (id, field, value) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleActive = (id) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const removeScenario = (id) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  const addCustomScenario = () => {
    if (!newScenario.title.trim()) return;
    const id = `custom_${Date.now()}`;
    setScenarios(prev => [...prev, { ...newScenario, id, active: true }]);
    setNewScenario({
      title: '', description: '', icon: 'custom',
      monthlyCost: 0, orderChangePct: 0, avgPriceChange: 0, duration: 6,
    });
    setShowAdd(false);
  };

  return (
    <div className="wi">
      <div className="wi-page-header">
        <h1>What-If 시뮬레이터</h1>
        <p>다양한 경영 시나리오를 시뮬레이션하고 최적의 결정을 내리세요</p>
      </div>

      {/* Baseline Summary */}
      <div className="wi-card wi-baseline">
        <h3 className="wi-card-title"><DollarSign size={16} /> 현재 기준 (Baseline)</h3>
        <div className="wi-baseline-stats">
          <div className="wi-bstat">
            <span className="wi-bstat-label">일 평균 주문</span>
            <span className="wi-bstat-val">{baseline.avgDailyOrders.toFixed(1)}건</span>
          </div>
          <div className="wi-bstat">
            <span className="wi-bstat-label">평균 객단가</span>
            <span className="wi-bstat-val">{fmt(Math.round(baseline.avgOrderPrice))}원</span>
          </div>
          <div className="wi-bstat">
            <span className="wi-bstat-label">월 매출</span>
            <span className="wi-bstat-val">{fmt(baseline.monthlyRevenue)}원</span>
          </div>
          <div className="wi-bstat">
            <span className="wi-bstat-label">월 고정비</span>
            <span className="wi-bstat-val">{fmt(baseline.monthlyFixed)}원</span>
          </div>
          <div className={`wi-bstat ${baseline.monthlyProfit >= 0 ? 'positive' : 'negative'}`}>
            <span className="wi-bstat-label">월 순이익</span>
            <span className="wi-bstat-val">{fmt(Math.round(baseline.monthlyProfit))}원</span>
          </div>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="wi-scenarios-header">
        <h3>시나리오 목록</h3>
        <button className="wi-add-btn" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} /> 커스텀 시나리오 추가
        </button>
      </div>

      {/* Add Custom Form */}
      {showAdd && (
        <div className="wi-card wi-add-form">
          <h3 className="wi-card-title"><Plus size={16} /> 커스텀 시나리오</h3>
          <div className="wi-form-grid">
            <div className="wi-form-group">
              <label>시나리오 이름</label>
              <input
                type="text"
                value={newScenario.title}
                onChange={e => setNewScenario(p => ({ ...p, title: e.target.value }))}
                placeholder="예: 2호점 오픈"
                className="wi-input"
              />
            </div>
            <div className="wi-form-group">
              <label>설명</label>
              <input
                type="text"
                value={newScenario.description}
                onChange={e => setNewScenario(p => ({ ...p, description: e.target.value }))}
                placeholder="간단한 설명"
                className="wi-input"
              />
            </div>
            <div className="wi-form-group">
              <label>추가 월 비용</label>
              <input
                type="number"
                value={newScenario.monthlyCost}
                onChange={e => setNewScenario(p => ({ ...p, monthlyCost: Number(e.target.value) || 0 }))}
                className="wi-input"
              />
            </div>
            <div className="wi-form-group">
              <label>예상 주문 변화 (%)</label>
              <input
                type="number"
                value={newScenario.orderChangePct}
                onChange={e => setNewScenario(p => ({ ...p, orderChangePct: Number(e.target.value) || 0 }))}
                className="wi-input"
              />
            </div>
            <div className="wi-form-group">
              <label>평균 객단가 변화 (원)</label>
              <input
                type="number"
                value={newScenario.avgPriceChange}
                onChange={e => setNewScenario(p => ({ ...p, avgPriceChange: Number(e.target.value) || 0 }))}
                className="wi-input"
              />
            </div>
            <div className="wi-form-group">
              <label>기간 (개월)</label>
              <input
                type="number"
                value={newScenario.duration}
                onChange={e => setNewScenario(p => ({ ...p, duration: Number(e.target.value) || 1 }))}
                className="wi-input"
              />
            </div>
          </div>
          <div className="wi-form-actions">
            <button className="wi-btn primary" onClick={addCustomScenario}><Check size={14} /> 추가</button>
            <button className="wi-btn secondary" onClick={() => setShowAdd(false)}><X size={14} /> 취소</button>
          </div>
        </div>
      )}

      {/* Scenario Cards Grid */}
      <div className="wi-scenario-grid">
        {scenarioResults.map(s => {
          const IconComp = ICON_MAP[s.icon] || Zap;
          const maxProfit = Math.max(Math.abs(baseline.monthlyProfit), Math.abs(s.newMonthlyProfit), 1);
          const currentBarW = Math.max(5, (Math.abs(baseline.monthlyProfit) / maxProfit) * 100);
          const projectedBarW = Math.max(5, (Math.max(0, s.newMonthlyProfit) / maxProfit) * 100);

          return (
            <div key={s.id} className={`wi-scenario-card ${!s.active ? 'inactive' : ''}`}>
              <div className="wi-sc-header">
                <div className="wi-sc-icon-wrap" style={{ color: s.isPositive ? 'var(--success)' : 'var(--danger)' }}>
                  <IconComp size={20} />
                </div>
                <div className="wi-sc-title-area">
                  <h4 className="wi-sc-title">{s.title}</h4>
                  <p className="wi-sc-desc">{s.description}</p>
                </div>
                <div className="wi-sc-actions">
                  <button
                    className={`wi-sc-toggle ${s.active ? 'on' : 'off'}`}
                    onClick={() => toggleActive(s.id)}
                    title={s.active ? '비활성화' : '활성화'}
                  >
                    {s.active ? <Check size={12} /> : <X size={12} />}
                  </button>
                  {s.id.startsWith('custom') && (
                    <button className="wi-sc-delete" onClick={() => removeScenario(s.id)}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Badge */}
              <div className={`wi-sc-badge ${s.isPositive ? 'positive' : 'negative'}`}>
                {s.isPositive ? <Check size={12} /> : <X size={12} />}
                {s.isPositive ? '추천' : '비추천'}
              </div>

              {/* Editable assumptions */}
              <div className="wi-sc-inputs">
                <div className="wi-sc-input-row">
                  <label>추가 월 비용</label>
                  <div className="wi-sc-input-wrap">
                    <input
                      type="number"
                      value={s.monthlyCost}
                      onChange={e => updateScenario(s.id, 'monthlyCost', Number(e.target.value) || 0)}
                      className="wi-input sm"
                    />
                    <span className="wi-unit">원</span>
                  </div>
                </div>
                <div className="wi-sc-input-row">
                  <label>주문 변화</label>
                  <div className="wi-sc-slider-wrap">
                    <input
                      type="range"
                      min={-30}
                      max={50}
                      step={1}
                      value={s.orderChangePct}
                      onChange={e => updateScenario(s.id, 'orderChangePct', Number(e.target.value))}
                      className="wi-slider"
                    />
                    <span className={`wi-sc-pct ${s.orderChangePct >= 0 ? 'up' : 'down'}`}>
                      {s.orderChangePct > 0 ? '+' : ''}{s.orderChangePct}%
                    </span>
                  </div>
                </div>
                <div className="wi-sc-input-row">
                  <label>객단가 변화</label>
                  <div className="wi-sc-input-wrap">
                    <input
                      type="number"
                      value={s.avgPriceChange}
                      onChange={e => updateScenario(s.id, 'avgPriceChange', Number(e.target.value) || 0)}
                      className="wi-input sm"
                    />
                    <span className="wi-unit">원</span>
                  </div>
                </div>
                <div className="wi-sc-input-row">
                  <label>기간</label>
                  <div className="wi-sc-input-wrap">
                    <input
                      type="number"
                      min={1}
                      max={36}
                      value={s.duration}
                      onChange={e => updateScenario(s.id, 'duration', Number(e.target.value) || 1)}
                      className="wi-input sm"
                    />
                    <span className="wi-unit">개월</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="wi-sc-results">
                <div className="wi-sc-result-row">
                  <span>현재 월 순이익</span>
                  <strong>{fmt(Math.round(baseline.monthlyProfit))}원</strong>
                </div>
                <div className="wi-sc-result-row">
                  <span>예상 월 순이익</span>
                  <strong style={{ color: s.isPositive ? 'var(--success)' : 'var(--danger)' }}>
                    {fmt(Math.round(s.newMonthlyProfit))}원
                  </strong>
                </div>
                <div className={`wi-sc-result-row highlight ${s.isPositive ? 'positive' : 'negative'}`}>
                  <span>월 수익 변화</span>
                  <strong>
                    {s.isPositive ? <ArrowRight size={12} style={{ transform: 'rotate(-45deg)' }} /> : <ArrowRight size={12} style={{ transform: 'rotate(45deg)' }} />}
                    {s.profitChange > 0 ? '+' : ''}{fmt(Math.round(s.profitChange))}원
                  </strong>
                </div>
                {s.monthlyCost > 0 && (
                  <>
                    <div className="wi-sc-result-row">
                      <span>ROI</span>
                      <strong style={{ color: s.roi > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {s.roi === Infinity ? '---' : `${s.roi.toFixed(0)}%`}
                      </strong>
                    </div>
                    <div className="wi-sc-result-row">
                      <span>투자 회수 기간</span>
                      <strong>
                        {s.paybackMonths === Infinity || s.paybackMonths === 0 ? '---' : `${s.paybackMonths}개월`}
                      </strong>
                    </div>
                  </>
                )}
              </div>

              {/* Visual Bar */}
              <div className="wi-sc-bar-section">
                <div className="wi-sc-bar-row">
                  <span className="wi-sc-bar-tag">현재</span>
                  <div className="wi-sc-bar-track">
                    <div className="wi-sc-bar-fill current" style={{ width: `${currentBarW}%` }} />
                  </div>
                </div>
                <div className="wi-sc-bar-row">
                  <span className="wi-sc-bar-tag">예상</span>
                  <div className="wi-sc-bar-track">
                    <div
                      className={`wi-sc-bar-fill ${s.isPositive ? 'positive' : 'negative'}`}
                      style={{ width: `${projectedBarW}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      {activeResults.length > 0 && (
        <div className="wi-card wi-compare-section">
          <h3 className="wi-card-title"><TrendingUp size={16} /> 시나리오 비교</h3>
          <div className="wi-compare-table-wrap">
            <table className="wi-compare-table">
              <thead>
                <tr>
                  <th>시나리오</th>
                  <th>추가 비용</th>
                  <th>주문 변화</th>
                  <th>월 매출</th>
                  <th>월 순이익</th>
                  <th>수익 변화</th>
                  <th>ROI</th>
                  <th>회수 기간</th>
                  <th>판정</th>
                </tr>
              </thead>
              <tbody>
                {activeResults.map(s => (
                  <tr key={s.id} className={s.id === bestScenario?.id ? 'best-row' : ''}>
                    <td className="wi-ct-name">
                      {s.title}
                      {s.id === bestScenario?.id && <span className="wi-best-tag">BEST</span>}
                    </td>
                    <td>{fmt(s.monthlyCost)}원/월</td>
                    <td style={{ color: s.orderChangePct >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {s.orderChangePct > 0 ? '+' : ''}{s.orderChangePct}%
                    </td>
                    <td>{fmt(s.newMonthlyRevenue)}원</td>
                    <td style={{ color: s.newMonthlyProfit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      {fmt(Math.round(s.newMonthlyProfit))}원
                    </td>
                    <td style={{ color: s.isPositive ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      {s.profitChange > 0 ? '+' : ''}{fmt(Math.round(s.profitChange))}원
                    </td>
                    <td>{s.roi === Infinity ? '-' : `${s.roi.toFixed(0)}%`}</td>
                    <td>{s.paybackMonths === Infinity || s.paybackMonths === 0 ? '-' : `${s.paybackMonths}개월`}</td>
                    <td>
                      <span className={`wi-verdict ${s.isPositive ? 'positive' : 'negative'}`}>
                        {s.isPositive ? '추천' : '비추천'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bestScenario && (
            <div className="wi-best-banner">
              <Zap size={18} />
              <span>최고의 시나리오: <strong>{bestScenario.title}</strong> (월 수익 {bestScenario.profitChange > 0 ? '+' : ''}{fmt(Math.round(bestScenario.profitChange))}원)</span>
            </div>
          )}
        </div>
      )}

      <style>{whatIfCSS}</style>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const whatIfCSS = `
  .wi { max-width: 1200px; }
  .wi-page-header { margin-bottom: 28px; }
  .wi-page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
  .wi-page-header p { color: var(--text-light); font-size: 14px; }

  /* Card */
  .wi-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm);
    margin-bottom: 20px;
  }
  .wi-card-title {
    font-size: 15px; font-weight: 600; color: var(--text-dark);
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }

  /* Baseline */
  .wi-baseline { border-left: 4px solid var(--primary); }
  .wi-baseline-stats { display: flex; gap: 16px; flex-wrap: wrap; }
  .wi-bstat {
    flex: 1; min-width: 140px; padding: 12px 16px;
    background: var(--bg); border-radius: var(--radius-sm);
    display: flex; flex-direction: column; gap: 4px;
  }
  .wi-bstat.positive { border-left: 3px solid var(--success); }
  .wi-bstat.negative { border-left: 3px solid var(--danger); }
  .wi-bstat-label { font-size: 11px; color: var(--text-light); font-weight: 500; }
  .wi-bstat-val { font-size: 16px; font-weight: 700; color: var(--text-dark); }

  /* Scenarios Header */
  .wi-scenarios-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 16px;
  }
  .wi-scenarios-header h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); }
  .wi-add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius-sm);
    background: var(--primary); color: #fff; font-size: 13px; font-weight: 500;
    transition: opacity 0.2s;
  }
  .wi-add-btn:hover { opacity: 0.9; }

  /* Add Form */
  .wi-add-form { border: 2px dashed var(--primary); }
  .wi-form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px; }
  .wi-form-group { display: flex; flex-direction: column; gap: 4px; }
  .wi-form-group label { font-size: 12px; font-weight: 500; color: var(--text-light); }
  .wi-input {
    padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text-dark); background: var(--bg); transition: border-color 0.2s;
  }
  .wi-input:focus { border-color: var(--primary); }
  .wi-input.sm { max-width: 120px; }
  .wi-unit { font-size: 12px; color: var(--text-light); margin-left: 4px; }
  .wi-form-actions { display: flex; gap: 8px; }
  .wi-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; transition: opacity 0.2s;
  }
  .wi-btn.primary { background: var(--primary); color: #fff; }
  .wi-btn.secondary { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
  .wi-btn:hover { opacity: 0.9; }

  /* Scenario Grid */
  .wi-scenario-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;
    margin-bottom: 24px;
  }
  .wi-scenario-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm);
    display: flex; flex-direction: column; gap: 14px; transition: all 0.2s;
    position: relative;
  }
  .wi-scenario-card.inactive { opacity: 0.5; }
  .wi-scenario-card:hover { box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1)); }

  .wi-sc-header { display: flex; align-items: flex-start; gap: 12px; }
  .wi-sc-icon-wrap {
    width: 40px; height: 40px; border-radius: var(--radius-sm);
    background: var(--bg); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .wi-sc-title-area { flex: 1; }
  .wi-sc-title { font-size: 14px; font-weight: 600; color: var(--text-dark); margin: 0; }
  .wi-sc-desc { font-size: 12px; color: var(--text-light); margin: 2px 0 0; }
  .wi-sc-actions { display: flex; gap: 6px; }
  .wi-sc-toggle {
    width: 26px; height: 26px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; transition: all 0.2s;
  }
  .wi-sc-toggle.on { background: var(--success); color: #fff; }
  .wi-sc-toggle.off { background: var(--border); color: var(--text-light); }
  .wi-sc-delete {
    width: 26px; height: 26px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center;
    background: var(--danger-light, #fef2f2); color: var(--danger);
  }

  /* Badge */
  .wi-sc-badge {
    display: inline-flex; align-items: center; gap: 4px; align-self: flex-start;
    padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;
  }
  .wi-sc-badge.positive { background: var(--success-light, #dcfce7); color: var(--success); }
  .wi-sc-badge.negative { background: var(--danger-light, #fef2f2); color: var(--danger); }

  /* Inputs */
  .wi-sc-inputs { display: flex; flex-direction: column; gap: 8px; }
  .wi-sc-input-row {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    font-size: 12px; color: var(--text);
  }
  .wi-sc-input-row label { font-weight: 500; min-width: 80px; }
  .wi-sc-input-wrap { display: flex; align-items: center; gap: 4px; }
  .wi-sc-slider-wrap { display: flex; align-items: center; gap: 8px; flex: 1; max-width: 180px; }
  .wi-slider {
    flex: 1; height: 4px; -webkit-appearance: none; appearance: none;
    background: var(--border); border-radius: 2px; outline: none;
  }
  .wi-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 16px; height: 16px;
    border-radius: 50%; background: var(--primary); cursor: pointer;
  }
  .wi-sc-pct { font-size: 13px; font-weight: 600; min-width: 40px; text-align: right; }
  .wi-sc-pct.up { color: var(--success); }
  .wi-sc-pct.down { color: var(--danger); }

  /* Results */
  .wi-sc-results {
    display: flex; flex-direction: column; gap: 6px;
    padding: 12px; background: var(--bg); border-radius: var(--radius-sm);
  }
  .wi-sc-result-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--text); padding: 4px 0;
  }
  .wi-sc-result-row strong { font-size: 13px; color: var(--text-dark); display: flex; align-items: center; gap: 4px; }
  .wi-sc-result-row.highlight { padding: 8px; border-radius: var(--radius-sm); margin-top: 4px; }
  .wi-sc-result-row.highlight.positive { background: var(--success-light, #dcfce7); }
  .wi-sc-result-row.highlight.negative { background: var(--danger-light, #fef2f2); }

  /* Bar */
  .wi-sc-bar-section { display: flex; flex-direction: column; gap: 6px; }
  .wi-sc-bar-row { display: flex; align-items: center; gap: 8px; }
  .wi-sc-bar-tag { font-size: 11px; color: var(--text-light); min-width: 30px; }
  .wi-sc-bar-track { flex: 1; height: 16px; background: var(--bg); border-radius: 4px; overflow: hidden; }
  .wi-sc-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
  .wi-sc-bar-fill.current { background: var(--border); }
  .wi-sc-bar-fill.positive { background: var(--success); }
  .wi-sc-bar-fill.negative { background: var(--danger); }

  /* Compare Table */
  .wi-compare-section { margin-top: 8px; }
  .wi-compare-table-wrap { overflow-x: auto; }
  .wi-compare-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .wi-compare-table th {
    text-align: left; padding: 10px 12px; font-weight: 600; color: var(--text-dark);
    border-bottom: 2px solid var(--border); font-size: 11px; white-space: nowrap;
  }
  .wi-compare-table td {
    padding: 10px 12px; border-bottom: 1px solid var(--border-light); color: var(--text);
    white-space: nowrap;
  }
  .wi-compare-table tr:hover td { background: var(--bg); }
  .wi-compare-table tr.best-row td { background: var(--primary-light); }
  .wi-ct-name { font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 6px; }
  .wi-best-tag {
    display: inline-block; padding: 1px 6px; border-radius: 4px;
    background: var(--primary); color: #fff; font-size: 9px; font-weight: 700;
  }
  .wi-verdict {
    padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 600;
  }
  .wi-verdict.positive { background: var(--success-light, #dcfce7); color: var(--success); }
  .wi-verdict.negative { background: var(--danger-light, #fef2f2); color: var(--danger); }

  /* Best Banner */
  .wi-best-banner {
    display: flex; align-items: center; gap: 10px; margin-top: 16px;
    padding: 14px 20px; border-radius: var(--radius-sm);
    background: var(--purple-light); color: var(--purple);
    font-size: 14px; font-weight: 500;
  }

  @media (max-width: 768px) {
    .wi-baseline-stats { flex-direction: column; }
    .wi-scenario-grid { grid-template-columns: 1fr; }
    .wi-form-grid { grid-template-columns: 1fr; }
    .wi-scenarios-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  }
`;
