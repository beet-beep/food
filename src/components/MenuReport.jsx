import { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Target, Star, AlertTriangle, ArrowUp, ArrowDown, Zap } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const pct = (v) => (v * 100).toFixed(1);

/* ================================================================
   MENU REPORT — 메뉴 성적표 + 가격 시뮬레이터
   ================================================================ */
export default function MenuReport({ menus, dailyLogs }) {
  const [tab, setTab] = useState('abc');

  const tabs = [
    { id: 'abc', label: '메뉴 성적표', icon: Star },
    { id: 'price', label: '가격 시뮬레이터', icon: DollarSign },
  ];

  return (
    <div className="mr">
      <div className="mr-page-header">
        <h1>메뉴 리포트</h1>
        <p>메뉴별 ABC 분석과 가격 시뮬레이션</p>
      </div>

      <div className="mr-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`mr-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'abc' && <ABCTab menus={menus} dailyLogs={dailyLogs} />}
      {tab === 'price' && <PriceSimTab menus={menus} dailyLogs={dailyLogs} />}

      <style>{menuReportCSS}</style>
    </div>
  );
}

/* ================================================================
   TAB 1 — ABC Analysis (메뉴 성적표)
   ================================================================ */
function ABCTab({ menus, dailyLogs }) {
  const [salesRatios, setSalesRatios] = useState({});

  const analysisMenus = useMemo(() => {
    return (menus || []).filter(m => m.category === 'main' || m.category === 'side');
  }, [menus]);

  /* Estimate daily orders from last 30 days of dailyLogs */
  const recentLogs = useMemo(() => (dailyLogs || []).slice(-30), [dailyLogs]);
  const totalDailyOrders = useMemo(() => {
    if (recentLogs.length === 0) return 30;
    return recentLogs.reduce((s, d) => {
      const dayTotal = Object.values(d.orders || {}).reduce((a, b) => a + Number(b || 0), 0);
      return s + dayTotal;
    }, 0) / recentLogs.length;
  }, [recentLogs]);

  /* Split orders among menus using ratios (default: equal) */
  const menuData = useMemo(() => {
    const count = analysisMenus.length || 1;
    const defaultRatio = 100 / count;

    let totalRatio = 0;
    const ratios = analysisMenus.map(m => {
      const r = salesRatios[m.id] !== undefined ? salesRatios[m.id] : defaultRatio;
      totalRatio += r;
      return r;
    });

    const effectiveTotal = totalRatio || 1;

    const results = analysisMenus.map((m, i) => {
      const ingredientCost = (m.ingredients || []).reduce((s, ing) => s + (ing.cost || 0), 0);
      const margin = m.price - ingredientCost;
      const ratio = ratios[i] / effectiveTotal;
      const estimatedOrders = Math.round(totalDailyOrders * ratio);
      const revenue = m.price * estimatedOrders;
      const totalMargin = margin * estimatedOrders;

      return {
        ...m,
        ingredientCost,
        margin,
        estimatedOrders,
        revenue,
        totalMargin,
        ratio: ratios[i],
      };
    });

    const sumRevenue = results.reduce((s, r) => s + r.revenue, 0) || 1;
    const sumMargin = results.reduce((s, r) => s + r.totalMargin, 0) || 1;

    return results.map(r => ({
      ...r,
      revenueContrib: r.revenue / sumRevenue,
      marginContrib: r.totalMargin / sumMargin,
    }));
  }, [analysisMenus, salesRatios, totalDailyOrders]);

  /* Median thresholds for quadrant placement */
  const medianRevenue = useMemo(() => {
    if (menuData.length === 0) return 0.5;
    const sorted = [...menuData].sort((a, b) => a.revenueContrib - b.revenueContrib);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1].revenueContrib + sorted[mid].revenueContrib) / 2
      : sorted[mid].revenueContrib;
  }, [menuData]);

  const medianMargin = useMemo(() => {
    if (menuData.length === 0) return 0.5;
    const sorted = [...menuData].sort((a, b) => a.marginContrib - b.marginContrib);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1].marginContrib + sorted[mid].marginContrib) / 2
      : sorted[mid].marginContrib;
  }, [menuData]);

  const getQuadrant = (item) => {
    const highRev = item.revenueContrib >= medianRevenue;
    const highMar = item.marginContrib >= medianMargin;
    if (highRev && highMar) return { name: 'Star', label: '스타', emoji: '⭐', color: '#16a34a', bg: '#dcfce7', action: '유지/강화' };
    if (!highRev && highMar) return { name: 'Puzzle', label: '퍼즐', emoji: '🧩', color: '#2563eb', bg: '#dbeafe', action: '홍보 강화' };
    if (highRev && !highMar) return { name: 'Workhorse', label: '일꾼', emoji: '🐴', color: '#ea580c', bg: '#fff7ed', action: '가격 조정' };
    return { name: 'Dog', label: '독', emoji: '🐕', color: '#dc2626', bg: '#fef2f2', action: '폐지 검토' };
  };

  const quadrants = useMemo(() => {
    const q = { Star: [], Puzzle: [], Workhorse: [], Dog: [] };
    menuData.forEach(item => {
      const quad = getQuadrant(item);
      q[quad.name].push({ ...item, quadrant: quad });
    });
    return q;
  }, [menuData, medianRevenue, medianMargin]);

  const ranked = useMemo(() =>
    [...menuData]
      .map(item => ({ ...item, quadrant: getQuadrant(item) }))
      .sort((a, b) => b.totalMargin - a.totalMargin),
    [menuData]
  );

  const updateRatio = (id, value) => {
    setSalesRatios(prev => ({ ...prev, [id]: Number(value) || 0 }));
  };

  return (
    <div className="mr-tab-content">
      {/* Ratio input */}
      <div className="mr-card">
        <h3 className="mr-card-title"><Target size={16} /> 메뉴별 판매 비율 설정</h3>
        <p className="mr-card-desc">메뉴별 예상 판매 비율을 조정하세요. 기본값은 균등 배분입니다.</p>
        <div className="mr-ratio-grid">
          {analysisMenus.map(m => (
            <div key={m.id} className="mr-ratio-item">
              <span className="mr-ratio-label">{m.emoji} {m.name}</span>
              <div className="mr-ratio-input-wrap">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={salesRatios[m.id] !== undefined ? salesRatios[m.id] : Math.round(100 / (analysisMenus.length || 1))}
                  onChange={e => updateRatio(m.id, e.target.value)}
                  className="mr-input sm"
                />
                <span className="mr-unit">%</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mr-hint">일 평균 주문수 (최근 기준): <strong>{Math.round(totalDailyOrders)}건</strong></p>
      </div>

      {/* 2x2 Matrix */}
      <div className="mr-card">
        <h3 className="mr-card-title"><Zap size={16} /> BCG 매트릭스 (메뉴 포지셔닝)</h3>
        <div className="mr-matrix">
          <div className="mr-matrix-y-label">
            <span>마진 기여도</span>
            <ArrowUp size={14} />
          </div>
          <div className="mr-matrix-grid">
            {/* Top-left: Puzzle (low sales, high margin) */}
            <div className="mr-quad" style={{ background: '#dbeafe', borderColor: '#2563eb' }}>
              <div className="mr-quad-header" style={{ color: '#2563eb' }}>
                🧩 퍼즐 <span className="mr-quad-action">홍보 강화</span>
              </div>
              <div className="mr-quad-desc">매출 낮음 + 마진 높음</div>
              <div className="mr-quad-items">
                {quadrants.Puzzle.map(item => (
                  <span key={item.id} className="mr-quad-chip" style={{ background: '#2563eb', color: '#fff' }}>
                    {item.emoji} {item.name}
                  </span>
                ))}
                {quadrants.Puzzle.length === 0 && <span className="mr-quad-empty">-</span>}
              </div>
            </div>

            {/* Top-right: Star (high sales, high margin) */}
            <div className="mr-quad" style={{ background: '#dcfce7', borderColor: '#16a34a' }}>
              <div className="mr-quad-header" style={{ color: '#16a34a' }}>
                ⭐ 스타 <span className="mr-quad-action">유지/강화</span>
              </div>
              <div className="mr-quad-desc">매출 높음 + 마진 높음</div>
              <div className="mr-quad-items">
                {quadrants.Star.map(item => (
                  <span key={item.id} className="mr-quad-chip" style={{ background: '#16a34a', color: '#fff' }}>
                    {item.emoji} {item.name}
                  </span>
                ))}
                {quadrants.Star.length === 0 && <span className="mr-quad-empty">-</span>}
              </div>
            </div>

            {/* Bottom-left: Dog (low sales, low margin) */}
            <div className="mr-quad" style={{ background: '#fef2f2', borderColor: '#dc2626' }}>
              <div className="mr-quad-header" style={{ color: '#dc2626' }}>
                🐕 독 <span className="mr-quad-action">폐지 검토</span>
              </div>
              <div className="mr-quad-desc">매출 낮음 + 마진 낮음</div>
              <div className="mr-quad-items">
                {quadrants.Dog.map(item => (
                  <span key={item.id} className="mr-quad-chip" style={{ background: '#dc2626', color: '#fff' }}>
                    {item.emoji} {item.name}
                  </span>
                ))}
                {quadrants.Dog.length === 0 && <span className="mr-quad-empty">-</span>}
              </div>
            </div>

            {/* Bottom-right: Workhorse (high sales, low margin) */}
            <div className="mr-quad" style={{ background: '#fff7ed', borderColor: '#ea580c' }}>
              <div className="mr-quad-header" style={{ color: '#ea580c' }}>
                🐴 일꾼 <span className="mr-quad-action">가격 조정</span>
              </div>
              <div className="mr-quad-desc">매출 높음 + 마진 낮음</div>
              <div className="mr-quad-items">
                {quadrants.Workhorse.map(item => (
                  <span key={item.id} className="mr-quad-chip" style={{ background: '#ea580c', color: '#fff' }}>
                    {item.emoji} {item.name}
                  </span>
                ))}
                {quadrants.Workhorse.length === 0 && <span className="mr-quad-empty">-</span>}
              </div>
            </div>
          </div>
          <div className="mr-matrix-x-label">
            <span>매출 기여도</span>
            <ArrowUp size={14} style={{ transform: 'rotate(90deg)' }} />
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="mr-card">
        <h3 className="mr-card-title"><TrendingUp size={16} /> 메뉴 랭킹</h3>
        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>메뉴</th>
                <th>예상 주문</th>
                <th>예상 매출</th>
                <th>건당 마진</th>
                <th>매출 기여</th>
                <th>마진 기여</th>
                <th>등급</th>
                <th>추천</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((item, idx) => (
                <tr key={item.id}>
                  <td className="mr-rank">{idx + 1}</td>
                  <td className="mr-menu-name">{item.emoji} {item.name}</td>
                  <td>{fmt(item.estimatedOrders)}건/일</td>
                  <td>{fmt(item.revenue)}원</td>
                  <td>{fmt(item.margin)}원</td>
                  <td>{pct(item.revenueContrib)}%</td>
                  <td>{pct(item.marginContrib)}%</td>
                  <td>
                    <span className="mr-badge" style={{ background: item.quadrant.bg, color: item.quadrant.color, border: `1px solid ${item.quadrant.color}` }}>
                      {item.quadrant.emoji} {item.quadrant.label}
                    </span>
                  </td>
                  <td style={{ color: item.quadrant.color, fontWeight: 600, fontSize: 12 }}>{item.quadrant.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto Insights */}
      <div className="mr-card">
        <h3 className="mr-card-title"><AlertTriangle size={16} /> 메뉴별 인사이트</h3>
        <div className="mr-insights">
          {ranked.map(item => (
            <div key={item.id} className="mr-insight-row" style={{ borderLeftColor: item.quadrant.color }}>
              <span className="mr-insight-emoji">{item.emoji}</span>
              <span className="mr-insight-text">
                <strong>{item.name}</strong>: {item.quadrant.emoji} {item.quadrant.label} —{' '}
                {item.quadrant.name === 'Star' && '주력 메뉴로 유지하세요. 품질 관리에 집중하고 가격을 유지하세요.'}
                {item.quadrant.name === 'Puzzle' && '마진이 좋지만 판매량이 부족합니다. 배민 추천 메뉴 등록, SNS 홍보를 강화하세요.'}
                {item.quadrant.name === 'Workhorse' && '잘 팔리지만 마진이 낮습니다. 원가 절감 또는 소폭 가격 인상을 검토하세요.'}
                {item.quadrant.name === 'Dog' && '판매량과 마진 모두 낮습니다. 메뉴 개선 또는 폐지를 검토하세요.'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 2 — 가격 시뮬레이터
   ================================================================ */
function PriceSimTab({ menus, dailyLogs }) {
  const analysisMenus = useMemo(() =>
    (menus || []).filter(m => m.category === 'main' || m.category === 'side'),
    [menus]
  );

  const [selectedMenuId, setSelectedMenuId] = useState(analysisMenus[0]?.id || '');
  const [priceOffset, setPriceOffset] = useState(0);
  const [elasticity, setElasticity] = useState(7);

  const selectedMenu = analysisMenus.find(m => m.id === selectedMenuId) || analysisMenus[0];

  const recentLogs = useMemo(() => (dailyLogs || []).slice(-30), [dailyLogs]);
  const avgDailyOrders = useMemo(() => {
    if (recentLogs.length === 0) return 30;
    return recentLogs.reduce((s, d) => {
      return s + Object.values(d.orders || {}).reduce((a, b) => a + Number(b || 0), 0);
    }, 0) / recentLogs.length;
  }, [recentLogs]);

  const menuCount = analysisMenus.length || 1;
  const estimatedDailyOrders = Math.round(avgDailyOrders / menuCount);

  if (!selectedMenu) {
    return (
      <div className="mr-tab-content">
        <div className="mr-card">
          <p className="mr-empty">메뉴가 없습니다. 메뉴 관리에서 메뉴를 먼저 등록하세요.</p>
        </div>
      </div>
    );
  }

  const currentPrice = selectedMenu.price;
  const ingredientCost = (selectedMenu.ingredients || []).reduce((s, ing) => s + (ing.cost || 0), 0);
  const newPrice = currentPrice + priceOffset;
  const currentMargin = currentPrice - ingredientCost;
  const newMargin = newPrice - ingredientCost;
  const currentCostRate = currentPrice > 0 ? (ingredientCost / currentPrice) * 100 : 0;
  const newCostRate = newPrice > 0 ? (ingredientCost / newPrice) * 100 : 0;

  /* Demand elasticity: price change % * elasticity rate */
  const priceChangePercent = currentPrice > 0 ? ((newPrice - currentPrice) / currentPrice) * 100 : 0;
  const orderChangePercent = -(priceChangePercent / 10) * elasticity;
  const newDailyOrders = Math.max(0, Math.round(estimatedDailyOrders * (1 + orderChangePercent / 100)));

  const currentMonthlyRevenue = currentPrice * estimatedDailyOrders * 30;
  const newMonthlyRevenue = newPrice * newDailyOrders * 30;
  const currentMonthlyProfit = currentMargin * estimatedDailyOrders * 30;
  const newMonthlyProfit = newMargin * newDailyOrders * 30;
  const profitDiff = newMonthlyProfit - currentMonthlyProfit;
  const isPositive = profitDiff >= 0;

  /* Break-even price: where margin = 0, i.e., price = ingredientCost */
  const breakEvenPrice = ingredientCost;

  /* Optimal price: maximize (margin * estimated_orders) over the slider range */
  const optimalResult = useMemo(() => {
    let bestPrice = currentPrice;
    let bestProfit = -Infinity;
    const minP = Math.max(ingredientCost + 100, currentPrice - 2000);
    const maxP = currentPrice + 2000;
    for (let p = minP; p <= maxP; p += 100) {
      const pricePct = currentPrice > 0 ? ((p - currentPrice) / currentPrice) * 100 : 0;
      const orderPct = -(pricePct / 10) * elasticity;
      const orders = Math.max(0, estimatedDailyOrders * (1 + orderPct / 100));
      const profit = (p - ingredientCost) * orders * 30;
      if (profit > bestProfit) {
        bestProfit = profit;
        bestPrice = p;
      }
    }
    return { price: bestPrice, profit: bestProfit };
  }, [currentPrice, ingredientCost, elasticity, estimatedDailyOrders]);

  const sliderMin = currentPrice - 2000;
  const sliderMax = currentPrice + 2000;

  return (
    <div className="mr-tab-content">
      {/* Menu Selector */}
      <div className="mr-card">
        <h3 className="mr-card-title"><DollarSign size={16} /> 메뉴 선택</h3>
        <div className="mr-select-grid">
          {analysisMenus.map(m => (
            <button
              key={m.id}
              className={`mr-menu-btn ${selectedMenuId === m.id ? 'active' : ''}`}
              onClick={() => { setSelectedMenuId(m.id); setPriceOffset(0); }}
            >
              <span className="mr-menu-btn-emoji">{m.emoji}</span>
              <span className="mr-menu-btn-name">{m.name}</span>
              <span className="mr-menu-btn-price">{fmt(m.price)}원</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="mr-card">
        <h3 className="mr-card-title"><Target size={16} /> 가격 조정</h3>
        <div className="mr-price-slider-section">
          <div className="mr-price-display">
            <div className="mr-price-box">
              <span className="mr-price-label">현재 가격</span>
              <span className="mr-price-val">{fmt(currentPrice)}원</span>
            </div>
            <div className="mr-price-arrow">
              {priceOffset > 0 ? <ArrowUp size={20} style={{ color: 'var(--danger)' }} /> : priceOffset < 0 ? <ArrowDown size={20} style={{ color: 'var(--success)' }} /> : <span style={{ color: 'var(--text-light)' }}>―</span>}
            </div>
            <div className={`mr-price-box ${priceOffset !== 0 ? 'highlight' : ''}`}>
              <span className="mr-price-label">변경 가격</span>
              <span className="mr-price-val">{fmt(newPrice)}원</span>
              {priceOffset !== 0 && (
                <span className={`mr-price-diff ${priceOffset > 0 ? 'up' : 'down'}`}>
                  {priceOffset > 0 ? '+' : ''}{fmt(priceOffset)}원
                </span>
              )}
            </div>
          </div>
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={100}
            value={newPrice}
            onChange={e => setPriceOffset(Number(e.target.value) - currentPrice)}
            className="mr-slider"
          />
          <div className="mr-slider-range">
            <span>{fmt(sliderMin)}원</span>
            <span>{fmt(sliderMax)}원</span>
          </div>
        </div>

        {/* Elasticity Slider */}
        <div className="mr-elasticity-section">
          <label className="mr-elasticity-label">
            수요 탄력성: 가격 10% 인상 시 주문 <strong>{elasticity}%</strong> 감소
          </label>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={elasticity}
            onChange={e => setElasticity(Number(e.target.value))}
            className="mr-slider"
          />
          <div className="mr-slider-range">
            <span>0% (탄력 없음)</span>
            <span>30% (매우 민감)</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mr-card">
        <h3 className="mr-card-title"><TrendingUp size={16} /> 시뮬레이션 결과</h3>
        <div className="mr-result-stats">
          <div className="mr-result-stat">
            <span className="mr-result-label">원가율</span>
            <span className="mr-result-val">{currentCostRate.toFixed(1)}% → {newCostRate.toFixed(1)}%</span>
            <span className={`mr-result-diff ${newCostRate < currentCostRate ? 'good' : newCostRate > currentCostRate ? 'bad' : ''}`}>
              {(newCostRate - currentCostRate).toFixed(1)}%p
            </span>
          </div>
          <div className="mr-result-stat">
            <span className="mr-result-label">건당 마진</span>
            <span className="mr-result-val">{fmt(currentMargin)}원 → {fmt(newMargin)}원</span>
            <span className={`mr-result-diff ${newMargin > currentMargin ? 'good' : newMargin < currentMargin ? 'bad' : ''}`}>
              {newMargin - currentMargin > 0 ? '+' : ''}{fmt(newMargin - currentMargin)}원
            </span>
          </div>
          <div className="mr-result-stat">
            <span className="mr-result-label">예상 일 주문수</span>
            <span className="mr-result-val">{estimatedDailyOrders}건 → {newDailyOrders}건</span>
            <span className={`mr-result-diff ${newDailyOrders >= estimatedDailyOrders ? 'good' : 'bad'}`}>
              {newDailyOrders - estimatedDailyOrders > 0 ? '+' : ''}{newDailyOrders - estimatedDailyOrders}건
            </span>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="mr-compare">
          <div className="mr-compare-header">월간 비교</div>
          <div className="mr-compare-grid">
            <div className="mr-compare-col">
              <span className="mr-compare-title">현재</span>
              <div className="mr-compare-item">
                <span>월 매출</span>
                <strong>{fmt(currentMonthlyRevenue)}원</strong>
              </div>
              <div className="mr-compare-item">
                <span>월 수익</span>
                <strong>{fmt(currentMonthlyProfit)}원</strong>
              </div>
            </div>
            <div className="mr-compare-arrow">→</div>
            <div className="mr-compare-col projected">
              <span className="mr-compare-title">변경 후</span>
              <div className="mr-compare-item">
                <span>월 매출</span>
                <strong>{fmt(newMonthlyRevenue)}원</strong>
              </div>
              <div className="mr-compare-item">
                <span>월 수익</span>
                <strong style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}>{fmt(newMonthlyProfit)}원</strong>
              </div>
            </div>
          </div>
          <div className={`mr-profit-diff-banner ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            월 수익 {isPositive ? '증가' : '감소'}: <strong>{isPositive ? '+' : ''}{fmt(profitDiff)}원</strong>
          </div>
        </div>

        {/* Side-by-side bar chart */}
        <div className="mr-bar-compare">
          <div className="mr-bar-group">
            <span className="mr-bar-label">월 수익</span>
            <div className="mr-bars">
              <div className="mr-bar-row">
                <span className="mr-bar-tag">현재</span>
                <div className="mr-bar-track">
                  <div
                    className="mr-bar-fill current"
                    style={{ width: `${Math.min(100, (currentMonthlyProfit / Math.max(currentMonthlyProfit, newMonthlyProfit, 1)) * 100)}%` }}
                  />
                </div>
                <span className="mr-bar-val">{fmt(currentMonthlyProfit)}원</span>
              </div>
              <div className="mr-bar-row">
                <span className="mr-bar-tag">변경</span>
                <div className="mr-bar-track">
                  <div
                    className={`mr-bar-fill ${isPositive ? 'positive' : 'negative'}`}
                    style={{ width: `${Math.min(100, Math.max(0, (newMonthlyProfit / Math.max(currentMonthlyProfit, newMonthlyProfit, 1)) * 100))}%` }}
                  />
                </div>
                <span className="mr-bar-val">{fmt(newMonthlyProfit)}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* Break-even */}
        <div className="mr-breakeven-info">
          <AlertTriangle size={14} />
          <span>손익분기 가격: <strong>{fmt(breakEvenPrice)}원</strong> — 이 가격 이하로 내리면 적자입니다.</span>
        </div>

        {/* Optimal price */}
        <div className="mr-optimal-info">
          <Zap size={14} />
          <span>
            최적 가격 구간: <strong>{fmt(optimalResult.price)}원</strong>
            {' '}(예상 월 수익: {fmt(Math.round(optimalResult.profit))}원)
          </span>
        </div>

        {/* Recommendation */}
        <div className={`mr-recommendation ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <Star size={18} /> : <AlertTriangle size={18} />}
          <div>
            <strong>{isPositive ? '추천: 가격 변경 시 수익이 증가합니다' : '비추천: 가격 변경 시 수익이 감소합니다'}</strong>
            <p>
              {priceOffset === 0
                ? '가격 슬라이더를 조정하여 시뮬레이션을 시작하세요.'
                : isPositive
                  ? `${selectedMenu.name}의 가격을 ${fmt(newPrice)}원으로 변경하면 월 ${fmt(profitDiff)}원의 추가 수익이 기대됩니다.`
                  : `${selectedMenu.name}의 가격을 ${fmt(newPrice)}원으로 변경하면 월 ${fmt(Math.abs(profitDiff))}원의 수익 감소가 예상됩니다.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const menuReportCSS = `
  .mr { max-width: 1200px; }
  .mr-page-header { margin-bottom: 28px; }
  .mr-page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
  .mr-page-header p { color: var(--text-light); font-size: 14px; }

  /* Tab Bar */
  .mr-tab-bar {
    display: flex; gap: 6px; margin-bottom: 24px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding-bottom: 4px;
  }
  .mr-tab-bar::-webkit-scrollbar { display: none; }
  .mr-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; color: var(--text);
    background: var(--bg-card); border: 1px solid var(--border);
    white-space: nowrap; transition: all 0.2s; flex-shrink: 0;
  }
  .mr-tab:hover { border-color: var(--primary); color: var(--primary); }
  .mr-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

  .mr-tab-content { display: flex; flex-direction: column; gap: 20px; }

  /* Card */
  .mr-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm);
  }
  .mr-card-title {
    font-size: 15px; font-weight: 600; color: var(--text-dark);
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }
  .mr-card-desc { font-size: 13px; color: var(--text-light); margin-bottom: 16px; }

  /* Ratio Grid */
  .mr-ratio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px; }
  .mr-ratio-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; background: var(--bg); border-radius: var(--radius-sm); }
  .mr-ratio-label { font-size: 13px; font-weight: 500; color: var(--text-dark); }
  .mr-ratio-input-wrap { display: flex; align-items: center; gap: 4px; }
  .mr-input {
    padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text-dark); background: var(--bg-card); transition: border-color 0.2s;
  }
  .mr-input:focus { border-color: var(--primary); }
  .mr-input.sm { max-width: 70px; text-align: right; }
  .mr-unit { font-size: 12px; color: var(--text-light); }
  .mr-hint { font-size: 12px; color: var(--text-light); margin-top: 8px; }

  /* 2x2 Matrix */
  .mr-matrix { position: relative; padding: 24px 8px 24px 32px; }
  .mr-matrix-y-label {
    position: absolute; left: 0; top: 50%; transform: translateY(-50%) rotate(-90deg);
    font-size: 11px; color: var(--text-light); display: flex; align-items: center; gap: 4px;
    transform-origin: center center; white-space: nowrap;
  }
  .mr-matrix-x-label {
    text-align: center; font-size: 11px; color: var(--text-light);
    display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 8px;
  }
  .mr-matrix-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; }
  .mr-quad {
    border: 2px solid; border-radius: var(--radius); padding: 16px; min-height: 120px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .mr-quad-header { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
  .mr-quad-action {
    font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 10px;
    background: rgba(255,255,255,0.7); margin-left: auto;
  }
  .mr-quad-desc { font-size: 11px; color: var(--text); }
  .mr-quad-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .mr-quad-chip {
    padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; white-space: nowrap;
  }
  .mr-quad-empty { font-size: 12px; color: var(--text-light); }

  /* Table */
  .mr-table-wrap { overflow-x: auto; }
  .mr-table {
    width: 100%; border-collapse: collapse; font-size: 13px;
  }
  .mr-table th {
    text-align: left; padding: 10px 12px; font-weight: 600; color: var(--text-dark);
    border-bottom: 2px solid var(--border); font-size: 12px; white-space: nowrap;
  }
  .mr-table td {
    padding: 10px 12px; border-bottom: 1px solid var(--border-light); color: var(--text);
    white-space: nowrap;
  }
  .mr-table tr:hover td { background: var(--bg); }
  .mr-rank { font-weight: 700; color: var(--primary); text-align: center; }
  .mr-menu-name { font-weight: 600; color: var(--text-dark); }
  .mr-badge {
    display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;
  }

  /* Insights */
  .mr-insights { display: flex; flex-direction: column; gap: 10px; }
  .mr-insight-row {
    display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px;
    background: var(--bg); border-radius: var(--radius-sm);
    border-left: 4px solid var(--text-light);
  }
  .mr-insight-emoji { font-size: 18px; flex-shrink: 0; }
  .mr-insight-text { font-size: 13px; color: var(--text); line-height: 1.6; }

  /* Price Sim Tab */
  .mr-select-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
  .mr-menu-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 14px 12px; border-radius: var(--radius-sm);
    border: 2px solid var(--border); background: var(--bg-card);
    transition: all 0.2s; cursor: pointer;
  }
  .mr-menu-btn:hover { border-color: var(--primary); }
  .mr-menu-btn.active { border-color: var(--primary); background: var(--primary-light); }
  .mr-menu-btn-emoji { font-size: 24px; }
  .mr-menu-btn-name { font-size: 13px; font-weight: 600; color: var(--text-dark); }
  .mr-menu-btn-price { font-size: 12px; color: var(--text-light); }

  .mr-price-slider-section { margin-bottom: 24px; }
  .mr-price-display {
    display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;
  }
  .mr-price-box {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 16px 24px; background: var(--bg); border-radius: var(--radius-sm);
    border: 1px solid var(--border); min-width: 160px;
  }
  .mr-price-box.highlight { border-color: var(--primary); background: var(--primary-light); }
  .mr-price-label { font-size: 12px; color: var(--text-light); }
  .mr-price-val { font-size: 22px; font-weight: 700; color: var(--text-dark); }
  .mr-price-diff { font-size: 13px; font-weight: 600; }
  .mr-price-diff.up { color: var(--danger); }
  .mr-price-diff.down { color: var(--success); }
  .mr-price-arrow { font-size: 24px; color: var(--text-light); }

  .mr-slider {
    width: 100%; height: 6px; -webkit-appearance: none; appearance: none;
    background: var(--border); border-radius: 3px; outline: none;
  }
  .mr-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px;
    border-radius: 50%; background: var(--primary); cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  }
  .mr-slider-range { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-light); margin-top: 4px; }

  .mr-elasticity-section { margin-top: 24px; }
  .mr-elasticity-label { font-size: 13px; color: var(--text); display: block; margin-bottom: 10px; }

  /* Results */
  .mr-result-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .mr-result-stat {
    display: flex; flex-direction: column; gap: 4px; padding: 14px;
    background: var(--bg); border-radius: var(--radius-sm);
  }
  .mr-result-label { font-size: 11px; color: var(--text-light); font-weight: 500; }
  .mr-result-val { font-size: 13px; font-weight: 600; color: var(--text-dark); }
  .mr-result-diff { font-size: 12px; font-weight: 600; }
  .mr-result-diff.good { color: var(--success); }
  .mr-result-diff.bad { color: var(--danger); }

  /* Compare */
  .mr-compare { margin-bottom: 24px; }
  .mr-compare-header { font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 12px; }
  .mr-compare-grid { display: flex; align-items: center; gap: 16px; }
  .mr-compare-col {
    flex: 1; padding: 16px; background: var(--bg); border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  .mr-compare-col.projected { border-color: var(--primary); background: var(--primary-light); }
  .mr-compare-title { font-size: 12px; font-weight: 600; color: var(--text-light); display: block; margin-bottom: 10px; }
  .mr-compare-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 13px; color: var(--text); }
  .mr-compare-item strong { color: var(--text-dark); }
  .mr-compare-arrow { font-size: 20px; color: var(--text-light); flex-shrink: 0; }

  .mr-profit-diff-banner {
    display: flex; align-items: center; gap: 8px; padding: 12px 16px;
    border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; margin-top: 12px;
  }
  .mr-profit-diff-banner.positive { background: var(--success-light, #dcfce7); color: var(--success); }
  .mr-profit-diff-banner.negative { background: var(--danger-light, #fef2f2); color: var(--danger); }

  /* Bar Compare */
  .mr-bar-compare { margin-bottom: 24px; }
  .mr-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .mr-bar-label { font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px; }
  .mr-bars { display: flex; flex-direction: column; gap: 8px; }
  .mr-bar-row { display: flex; align-items: center; gap: 10px; }
  .mr-bar-tag { font-size: 12px; color: var(--text-light); min-width: 36px; }
  .mr-bar-track { flex: 1; height: 24px; background: var(--bg); border-radius: 6px; overflow: hidden; }
  .mr-bar-fill { height: 100%; border-radius: 6px; transition: width 0.4s ease; }
  .mr-bar-fill.current { background: var(--border); }
  .mr-bar-fill.positive { background: var(--success); }
  .mr-bar-fill.negative { background: var(--danger); }
  .mr-bar-val { font-size: 12px; font-weight: 600; color: var(--text-dark); min-width: 100px; text-align: right; }

  /* Break-even & Optimal */
  .mr-breakeven-info, .mr-optimal-info {
    display: flex; align-items: center; gap: 8px; padding: 12px 16px;
    border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 12px;
  }
  .mr-breakeven-info { background: var(--danger-light, #fef2f2); color: var(--danger); }
  .mr-optimal-info { background: var(--purple-light); color: var(--purple); }

  /* Recommendation */
  .mr-recommendation {
    display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px;
    border-radius: var(--radius); border: 2px solid;
  }
  .mr-recommendation.positive { border-color: var(--success); background: var(--success-light, #dcfce7); color: var(--success); }
  .mr-recommendation.negative { border-color: var(--danger); background: var(--danger-light, #fef2f2); color: var(--danger); }
  .mr-recommendation strong { display: block; margin-bottom: 4px; font-size: 14px; }
  .mr-recommendation p { font-size: 13px; margin: 0; opacity: 0.9; }

  .mr-empty { font-size: 14px; color: var(--text-light); text-align: center; padding: 40px 0; }

  @media (max-width: 768px) {
    .mr-result-stats { grid-template-columns: 1fr; }
    .mr-compare-grid { flex-direction: column; }
    .mr-compare-arrow { transform: rotate(90deg); }
    .mr-matrix-grid { grid-template-columns: 1fr; }
    .mr-price-display { flex-direction: column; }
    .mr-ratio-grid { grid-template-columns: 1fr; }
  }
`;
