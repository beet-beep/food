import React, { useState, useMemo, useCallback } from 'react';
import {
  Package, ShoppingCart, Calculator, ClipboardCopy, Calendar,
  AlertTriangle, Check, ChevronDown, ChevronRight, Truck, TrendingUp,
} from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('ko-KR');

/* ─────────────────────────── styles ─────────────────────────── */

const styles = `
  .oc { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
  .oc-header { margin-bottom: 24px; }
  .oc-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
  .oc-header p  { font-size: 14px; color: var(--text-light); margin: 0; }

  /* tabs */
  .oc-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px; }
  .oc-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 12px; border: none; background: transparent; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; color: var(--text-light); cursor: pointer; transition: all .2s;
  }
  .oc-tab:hover { color: var(--text); background: var(--bg-card); }
  .oc-tab.active { background: var(--bg-card); color: var(--primary); font-weight: 600; box-shadow: var(--shadow-sm); }

  /* cards */
  .oc-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm);
  }
  .oc-card h3 {
    font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }

  /* ── Tab1: 발주 계산기 ── */

  /* 예상 주문 수 */
  .oc-order-est { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; }
  .oc-avg-box {
    background: var(--primary-light); border: 1px solid var(--primary); border-radius: var(--radius-sm);
    padding: 12px 20px; text-align: center; min-width: 160px;
  }
  .oc-avg-label { font-size: 12px; color: var(--primary-dark); font-weight: 500; }
  .oc-avg-val { font-size: 28px; font-weight: 800; color: var(--primary-dark); }
  .oc-avg-unit { font-size: 13px; color: var(--primary-dark); }

  .oc-override { display: flex; flex-direction: column; gap: 4px; }
  .oc-override label { font-size: 12px; color: var(--text-light); font-weight: 500; }
  .oc-override input[type="number"] {
    width: 100px; padding: 8px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 15px; font-weight: 600; color: var(--text-dark); background: var(--bg-card);
  }

  .oc-buffer { display: flex; flex-direction: column; gap: 4px; min-width: 200px; }
  .oc-buffer label { font-size: 12px; color: var(--text-light); font-weight: 500; }
  .oc-buffer-row { display: flex; align-items: center; gap: 8px; }
  .oc-buffer input[type="range"] { flex: 1; accent-color: var(--primary); }
  .oc-buffer-pct { font-size: 14px; font-weight: 600; color: var(--primary); min-width: 40px; }

  .oc-final-orders {
    margin-top: 12px; padding: 10px 16px; background: var(--bg); border-radius: var(--radius-sm);
    font-size: 14px; color: var(--text);
  }
  .oc-final-orders strong { color: var(--text-dark); font-size: 18px; }

  /* 메뉴 믹스 */
  .oc-mix-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .oc-mix-item {
    display: flex; flex-direction: column; gap: 6px; padding: 12px;
    background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--border-light);
  }
  .oc-mix-name { font-size: 13px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 4px; }
  .oc-mix-row { display: flex; align-items: center; gap: 8px; }
  .oc-mix-row input[type="range"] { flex: 1; accent-color: var(--primary); }
  .oc-mix-pct { font-size: 13px; font-weight: 600; color: var(--primary); min-width: 40px; text-align: right; }
  .oc-mix-count { font-size: 12px; color: var(--text-light); }
  .oc-mix-warn { font-size: 12px; color: var(--danger); font-weight: 500; margin-top: 8px; display: flex; align-items: center; gap: 4px; }

  /* 필요 식재료 테이블 */
  .oc-ing-table { width: 100%; border-collapse: collapse; }
  .oc-ing-table th {
    padding: 10px 10px; font-size: 12px; font-weight: 600; color: var(--text-light);
    border-bottom: 2px solid var(--border); text-align: left;
  }
  .oc-ing-table th.r, .oc-ing-table td.r { text-align: right; }
  .oc-ing-table td {
    padding: 10px 10px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border-light);
  }
  .oc-ing-table tr:hover { background: var(--border-light); }
  .oc-ing-name { font-weight: 600; color: var(--text-dark); }
  .oc-sufficient { color: var(--success); font-weight: 600; }
  .oc-shortage { color: var(--danger); font-weight: 600; }

  .oc-total-row { font-weight: 700; background: var(--bg) !important; }
  .oc-total-row td { border-top: 2px solid var(--border); padding: 12px 10px; }

  /* 발주서 생성 버튼 */
  .oc-action-row { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
  .oc-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
    border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all .15s;
  }
  .oc-btn-primary { background: var(--primary); color: #fff; }
  .oc-btn-primary:hover { opacity: 0.9; }
  .oc-btn-secondary { background: var(--bg); border: 1px solid var(--border); color: var(--text-dark); }
  .oc-btn-secondary:hover { background: var(--border-light); }
  .oc-btn-success { background: var(--success); color: #fff; }
  .oc-btn-success:hover { opacity: 0.9; }

  .oc-copy-toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: var(--text-dark); color: #fff; padding: 10px 20px; border-radius: var(--radius-sm);
    font-size: 14px; font-weight: 500; z-index: 999; box-shadow: var(--shadow-md);
    display: flex; align-items: center; gap: 8px;
  }

  /* ── Tab2: 재고 현황 ── */
  .oc-inv-summary {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;
  }
  .oc-inv-stat {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 14px; text-align: center; box-shadow: var(--shadow-sm);
  }
  .oc-inv-stat-label { font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
  .oc-inv-stat-val { font-size: 22px; font-weight: 700; color: var(--text-dark); }

  .oc-inv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .oc-inv-card {
    background: var(--bg-card); border-radius: var(--radius-sm); padding: 16px;
    box-shadow: var(--shadow-sm); position: relative; overflow: hidden;
    border: 1px solid var(--border);
  }
  .oc-inv-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
  }
  .oc-inv-card.red::before   { background: var(--danger); }
  .oc-inv-card.yellow::before { background: #eab308; }
  .oc-inv-card.green::before  { background: var(--success); }

  .oc-inv-card-name { font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
  .oc-inv-card-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
  .oc-inv-card-row span:last-child { font-weight: 600; color: var(--text); }

  .oc-inv-days { margin-top: 8px; padding: 6px 10px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; text-align: center; }
  .oc-inv-days.red   { background: var(--danger-light); color: var(--danger); }
  .oc-inv-days.yellow { background: var(--warning-light); color: var(--warning); }
  .oc-inv-days.green  { background: var(--success-light); color: var(--success); }

  /* ── Tab3: 발주 히스토리 ── */
  .oc-hist-table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
  .oc-hist-table th {
    padding: 10px 12px; font-size: 12px; font-weight: 600; color: var(--text-light);
    border-bottom: 2px solid var(--border); text-align: left;
  }
  .oc-hist-table td {
    padding: 10px 12px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border-light);
  }
  .oc-hist-table tr.oc-hist-row { cursor: pointer; }
  .oc-hist-table tr.oc-hist-row:hover { background: var(--border-light); }
  .oc-hist-expand { background: var(--bg) !important; }
  .oc-hist-expand td { padding: 12px 20px; }
  .oc-hist-detail-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .oc-hist-detail-table th { padding: 6px 8px; font-size: 11px; color: var(--text-light); border-bottom: 1px solid var(--border); text-align: left; }
  .oc-hist-detail-table td { padding: 6px 8px; color: var(--text); border-bottom: 1px solid var(--border-light); }
  .oc-hist-empty { padding: 40px; text-align: center; color: var(--text-light); font-size: 14px; }

  @media (max-width: 640px) {
    .oc-order-est { flex-direction: column; }
    .oc-mix-grid { grid-template-columns: 1fr; }
    .oc-inv-grid { grid-template-columns: 1fr; }
    .oc-inv-summary { grid-template-columns: 1fr 1fr; }
    .oc-tabs { flex-wrap: wrap; }
    .oc-tab { font-size: 12px; padding: 8px 6px; }
  }
`;

/* ─────────────────────────── component ─────────────────────────── */

export default function OrderCalc({ menus, dailyLogs, costData }) {
  const [tab, setTab] = useState('calc');
  const [manualOrders, setManualOrders] = useState(null);
  const [buffer, setBuffer] = useState(20);
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(false);

  const inventory = costData?.inventory || [];
  const mainMenus = (menus || []).filter(m => m.category === 'main');

  // 초기 메뉴 믹스: 균등 분배
  const [menuMix, setMenuMix] = useState(() => {
    const n = mainMenus.length || 1;
    const base = Math.floor(100 / n);
    const obj = {};
    mainMenus.forEach((m, i) => {
      obj[m.id] = i === 0 ? 100 - base * (n - 1) : base;
    });
    return obj;
  });

  // ─── 7일 평균 주문 수 ───
  const avgOrders = useMemo(() => {
    const logs = (dailyLogs || []).slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    if (logs.length === 0) return 0;
    const total = logs.reduce((sum, l) => {
      const o = l.orders || {};
      return sum + (Number(o.baemin) || 0) + (Number(o.coupang) || 0) + (Number(o.yogiyo) || 0) + (Number(o.takeout) || 0);
    }, 0);
    return Math.round(total / logs.length);
  }, [dailyLogs]);

  const baseOrders = manualOrders !== null ? manualOrders : avgOrders;
  const totalOrders = Math.ceil(baseOrders * (1 + buffer / 100));

  // ─── 메뉴 믹스 합계 검증 ───
  const mixTotal = Object.values(menuMix).reduce((s, v) => s + v, 0);

  const updateMix = useCallback((menuId, newVal) => {
    setMenuMix(prev => ({ ...prev, [menuId]: Number(newVal) }));
  }, []);

  // ─── 메뉴별 예상 주문 ───
  const menuOrders = useMemo(() => {
    const result = {};
    mainMenus.forEach(m => {
      const pct = menuMix[m.id] || 0;
      result[m.id] = Math.round(totalOrders * pct / 100);
    });
    return result;
  }, [mainMenus, menuMix, totalOrders]);

  // ─── 필요 식재료 계산 ───
  const ingredientCalc = useMemo(() => {
    const map = {};

    mainMenus.forEach(m => {
      const qty = menuOrders[m.id] || 0;
      (m.ingredients || []).forEach(ing => {
        const invItem = inventory.find(inv => inv.name === ing.name);
        const perServing = invItem?.perServing || 0;
        const unit = invItem?.unit || 'g';
        const unitCost = invItem?.unitCost || 0;
        const stock = invItem?.totalAmount || 0;

        if (!map[ing.name]) {
          map[ing.name] = { name: ing.name, required: 0, unit, stock, unitCost };
        }
        map[ing.name].required += qty * perServing;
      });
    });

    return Object.values(map).map(item => {
      const shortfall = item.required - item.stock;
      const estimatedCost = shortfall > 0 ? Math.round(shortfall * item.unitCost) : 0;
      return { ...item, shortfall, estimatedCost };
    });
  }, [mainMenus, menuOrders, inventory]);

  const totalPurchaseCost = ingredientCalc.reduce((s, i) => s + i.estimatedCost, 0);

  // ─── 발주서 텍스트 ───
  const generateOrderText = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    const shortfallItems = ingredientCalc.filter(i => i.shortfall > 0);

    let text = `[발주서] ${dateStr}\n`;
    text += `예상 주문: ${totalOrders}건 (버퍼 ${buffer}%)\n`;
    text += '---\n';
    shortfallItems.forEach(i => {
      const amt = i.unit === 'kg' || i.unit === 'L'
        ? (i.shortfall).toFixed(1) + i.unit
        : i.unit === 'g' || i.unit === 'ml'
          ? i.shortfall >= 1000
            ? (i.shortfall / 1000).toFixed(1) + (i.unit === 'g' ? 'kg' : 'L')
            : Math.round(i.shortfall) + i.unit
          : Math.round(i.shortfall) + i.unit;
      text += `${i.name}: ${amt} (부족분)\n`;
    });
    text += '---\n';
    text += `예상 발주 금액: ${fmt(totalPurchaseCost)}원\n`;
    return text;
  }, [ingredientCalc, totalOrders, buffer, totalPurchaseCost]);

  const copyToClipboard = useCallback(() => {
    const text = generateOrderText();
    navigator.clipboard.writeText(text).then(() => {
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    });
  }, [generateOrderText]);

  // ─── 발주 확정 ───
  const confirmOrder = useCallback(() => {
    const entry = {
      id: 'ord_' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      expectedOrders: totalOrders,
      totalCost: totalPurchaseCost,
      items: ingredientCalc
        .filter(i => i.shortfall > 0)
        .map(i => ({ name: i.name, amount: Math.round(i.shortfall * 10) / 10, unit: i.unit, cost: i.estimatedCost })),
    };
    setHistory(prev => [entry, ...prev]);
    setTab('history');
  }, [totalOrders, totalPurchaseCost, ingredientCalc]);

  // ─── 재고 예상 소진일 ───
  const getDepletionDays = useCallback((invItem) => {
    // 전 메뉴에서 이 재료를 쓰는 양의 합
    let dailyUsage = 0;
    mainMenus.forEach(m => {
      const pct = (menuMix[m.id] || 0) / 100;
      const usesIng = (m.ingredients || []).find(i => i.name === invItem.name);
      if (usesIng) {
        dailyUsage += (invItem.perServing || 0) * avgOrders * pct;
      }
    });
    if (dailyUsage <= 0) return Infinity;
    return invItem.totalAmount / dailyUsage;
  }, [mainMenus, menuMix, avgOrders]);

  const tabConfig = [
    { id: 'calc', label: '발주 계산기', icon: Calculator },
    { id: 'stock', label: '재고 현황', icon: Package },
    { id: 'history', label: '발주 히스토리', icon: ShoppingCart },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="oc">
        {/* ─── Header ─── */}
        <div className="oc-header">
          <h1><Truck size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />식재료 발주 계산기</h1>
          <p>내일 필요한 재료를 자동으로 계산하고 발주서를 생성하세요</p>
        </div>

        {/* ─── Tabs ─── */}
        <div className="oc-tabs">
          {tabConfig.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} className={`oc-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ════════════════════ Tab 1: 발주 계산기 ════════════════════ */}
        {tab === 'calc' && (
          <>
            {/* 예상 주문 수 */}
            <div className="oc-card">
              <h3><TrendingUp size={16} /> 예상 주문 수</h3>
              <div className="oc-order-est">
                <div className="oc-avg-box">
                  <div className="oc-avg-label">최근 7일 평균</div>
                  <div className="oc-avg-val">{avgOrders}</div>
                  <div className="oc-avg-unit">건 / 일</div>
                </div>

                <div className="oc-override">
                  <label>수동 입력 (선택)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder={avgOrders}
                    value={manualOrders ?? ''}
                    onChange={e => {
                      const v = e.target.value;
                      setManualOrders(v === '' ? null : Number(v));
                    }}
                  />
                </div>

                <div className="oc-buffer">
                  <label>버퍼 (%)</label>
                  <div className="oc-buffer-row">
                    <input
                      type="range" min="0" max="50" value={buffer}
                      onChange={e => setBuffer(Number(e.target.value))}
                    />
                    <span className="oc-buffer-pct">{buffer}%</span>
                  </div>
                </div>
              </div>

              <div className="oc-final-orders">
                최종 발주 기준: <strong>{totalOrders}건</strong>
                {' '}({baseOrders}건 + 버퍼 {buffer}% = +{totalOrders - baseOrders}건)
              </div>
            </div>

            {/* 메뉴 믹스 비율 */}
            <div className="oc-card">
              <h3><Calculator size={16} /> 메뉴 믹스 비율</h3>
              {mixTotal !== 100 && (
                <div className="oc-mix-warn">
                  <AlertTriangle size={14} /> 합계가 {mixTotal}%입니다. 100%가 되어야 합니다.
                </div>
              )}
              <div className="oc-mix-grid">
                {mainMenus.map(m => (
                  <div key={m.id} className="oc-mix-item">
                    <div className="oc-mix-name">{m.emoji} {m.name}</div>
                    <div className="oc-mix-row">
                      <input
                        type="range" min="0" max="100"
                        value={menuMix[m.id] || 0}
                        onChange={e => updateMix(m.id, e.target.value)}
                      />
                      <span className="oc-mix-pct">{menuMix[m.id] || 0}%</span>
                    </div>
                    <div className="oc-mix-count">예상 {menuOrders[m.id] || 0}건</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 필요 식재료 계산 */}
            <div className="oc-card">
              <h3><Package size={16} /> 필요 식재료 계산</h3>
              {ingredientCalc.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)', fontSize: 14 }}>
                  메뉴에 등록된 식재료가 없습니다.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="oc-ing-table">
                    <thead>
                      <tr>
                        <th>식재료</th>
                        <th className="r">필요량</th>
                        <th>단위</th>
                        <th className="r">현재 재고</th>
                        <th className="r">부족분</th>
                        <th className="r">예상 비용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredientCalc.map((item, i) => (
                        <tr key={i}>
                          <td className="oc-ing-name">{item.name}</td>
                          <td className="r">{fmt(Math.round(item.required))}</td>
                          <td>{item.unit}</td>
                          <td className="r">{fmt(Math.round(item.stock))}</td>
                          <td className="r">
                            {item.shortfall > 0
                              ? <span className="oc-shortage">{fmt(Math.round(item.shortfall))}</span>
                              : <span className="oc-sufficient">충분</span>
                            }
                          </td>
                          <td className="r">
                            {item.estimatedCost > 0 ? fmt(item.estimatedCost) + '원' : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="oc-total-row">
                        <td colSpan={5} style={{ textAlign: 'right', fontSize: 14 }}>예상 발주 총액</td>
                        <td className="r" style={{ fontSize: 16, color: 'var(--primary)' }}>{fmt(totalPurchaseCost)}원</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="oc-action-row">
              <button className="oc-btn oc-btn-primary" onClick={copyToClipboard}>
                <ClipboardCopy size={16} /> 발주서 생성 (클립보드 복사)
              </button>
              <button className="oc-btn oc-btn-success" onClick={confirmOrder}>
                <Check size={16} /> 발주 확정
              </button>
            </div>
          </>
        )}

        {/* ════════════════════ Tab 2: 재고 현황 ════════════════════ */}
        {tab === 'stock' && (
          <>
            {/* 요약 */}
            <div className="oc-inv-summary">
              <div className="oc-inv-stat">
                <div className="oc-inv-stat-label">총 재고 품목</div>
                <div className="oc-inv-stat-val">{inventory.length}개</div>
              </div>
              <div className="oc-inv-stat">
                <div className="oc-inv-stat-label">총 재고 가치</div>
                <div className="oc-inv-stat-val">{fmt(inventory.reduce((s, i) => s + (i.totalCost || 0), 0))}원</div>
              </div>
              <div className="oc-inv-stat">
                <div className="oc-inv-stat-label" style={{ color: 'var(--danger)' }}>
                  <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> 부족 임박
                </div>
                <div className="oc-inv-stat-val" style={{ color: 'var(--danger)' }}>
                  {inventory.filter(i => {
                    const d = getDepletionDays(i);
                    return d < 2;
                  }).length}개
                </div>
              </div>
              <div className="oc-inv-stat">
                <div className="oc-inv-stat-label" style={{ color: '#eab308' }}>
                  <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> 주의
                </div>
                <div className="oc-inv-stat-val" style={{ color: '#eab308' }}>
                  {inventory.filter(i => {
                    const d = getDepletionDays(i);
                    return d >= 2 && d < 5;
                  }).length}개
                </div>
              </div>
            </div>

            {/* 재고 카드 */}
            <div className="oc-inv-grid">
              {inventory.map(item => {
                const days = getDepletionDays(item);
                const color = days < 2 ? 'red' : days < 5 ? 'yellow' : 'green';
                const daysLabel = days === Infinity ? '해당 없음' : `${Math.round(days * 10) / 10}일`;

                return (
                  <div key={item.id} className={`oc-inv-card ${color}`}>
                    <div className="oc-inv-card-name">{item.name}</div>
                    <div className="oc-inv-card-row">
                      <span>보유량</span>
                      <span>{fmt(item.totalAmount)} {item.unit}</span>
                    </div>
                    <div className="oc-inv-card-row">
                      <span>단가</span>
                      <span>{fmt(item.unitCost)}원/{item.unit}</span>
                    </div>
                    <div className="oc-inv-card-row">
                      <span>1인분</span>
                      <span>{item.perServing} {item.unit}</span>
                    </div>
                    <div className="oc-inv-card-row">
                      <span>재고 가치</span>
                      <span>{fmt(item.totalCost)}원</span>
                    </div>
                    <div className={`oc-inv-days ${color}`}>
                      {days === Infinity
                        ? '사용 메뉴 없음'
                        : <>예상 소진: {daysLabel}</>
                      }
                    </div>
                  </div>
                );
              })}

              {inventory.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-light)', fontSize: 14 }}>
                  등록된 재고가 없습니다. 코스트 계산기에서 재고를 추가하세요.
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════════════════ Tab 3: 발주 히스토리 ════════════════════ */}
        {tab === 'history' && (
          <div className="oc-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 0' }}>
              <h3 style={{ margin: 0, paddingBottom: 12 }}><Calendar size={16} /> 발주 히스토리</h3>
            </div>
            {history.length === 0 ? (
              <div className="oc-hist-empty">
                <Truck size={32} style={{ marginBottom: 8, opacity: 0.3 }} /><br />
                아직 확정된 발주가 없습니다.<br />
                <span style={{ fontSize: 12 }}>발주 계산기에서 "발주 확정"을 누르면 여기에 기록됩니다.</span>
              </div>
            ) : (
              <table className="oc-hist-table">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}></th>
                    <th>날짜</th>
                    <th className="r">예상 주문</th>
                    <th className="r">발주 금액</th>
                    <th className="r">품목 수</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => {
                    const isExpanded = expandedId === h.id;
                    return (
                      <React.Fragment key={h.id}>
                        <tr className="oc-hist-row" onClick={() => setExpandedId(isExpanded ? null : h.id)}>
                          <td>
                            {isExpanded
                              ? <ChevronDown size={14} />
                              : <ChevronRight size={14} />
                            }
                          </td>
                          <td>{h.date}</td>
                          <td className="r">{fmt(h.expectedOrders)}건</td>
                          <td className="r">{fmt(h.totalCost)}원</td>
                          <td className="r">{h.items.length}개</td>
                        </tr>
                        {isExpanded && (
                          <tr className="oc-hist-expand">
                            <td colSpan={5}>
                              <table className="oc-hist-detail-table">
                                <thead>
                                  <tr>
                                    <th>식재료</th>
                                    <th className="r">수량</th>
                                    <th>단위</th>
                                    <th className="r">비용</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {h.items.map((it, j) => (
                                    <tr key={j}>
                                      <td>{it.name}</td>
                                      <td className="r">{it.amount}</td>
                                      <td>{it.unit}</td>
                                      <td className="r">{fmt(it.cost)}원</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="oc-copy-toast">
            <Check size={16} /> 발주서가 클립보드에 복사되었습니다!
          </div>
        )}
      </div>
    </>
  );
}
