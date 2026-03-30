import { useState } from 'react';
import { Calculator, ShoppingCart, Plus, Trash2, X, Check, ChevronDown, ChevronRight, Package, TrendingDown, AlertTriangle, Download, DollarSign, Percent, Truck, User, Box } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('ko-KR');

const defaultOverhead = {
  baeminFeeRate: 6.8,
  coupangFeeRate: 9.8,
  yogiyoFeeRate: 12.5,
  deliveryFee: 3500,
  packagingCost: 250,
  laborCostPerOrder: 1500,
  cardFeeRate: 1.5,
  rentPerOrder: 0,
};

export default function CostCalculator({ menus, costData, setCostData }) {
  const [tab, setTab] = useState('margin');
  const [selectedMenu, setSelectedMenu] = useState(menus?.[0]?.id || '');
  const [selectedPlatform, setSelectedPlatform] = useState('baemin');
  const [editingItemId, setEditingItemId] = useState(null);

  // --- 데이터 ---
  const inventory = costData?.inventory || [];
  const groceryLogs = costData?.groceryLogs || [];
  const overhead = costData?.overhead || defaultOverhead;

  const save = (updates) => setCostData(prev => ({ ...prev, ...updates }));

  // --- 재고 관리 ---
  const [newItem, setNewItem] = useState({ name: '', totalAmount: '', unit: 'g', totalCost: '', perServing: '' });

  const addInventoryItem = () => {
    if (!newItem.name || !newItem.totalCost) return;
    const item = {
      id: 'inv_' + Date.now(),
      name: newItem.name,
      totalAmount: Number(newItem.totalAmount) || 0,
      unit: newItem.unit,
      totalCost: Number(newItem.totalCost) || 0,
      perServing: Number(newItem.perServing) || 0,
      unitCost: (Number(newItem.totalAmount) > 0) ? Math.round(Number(newItem.totalCost) / Number(newItem.totalAmount)) : 0,
      costPerServing: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    item.costPerServing = item.perServing > 0 && item.totalAmount > 0
      ? Math.round((item.perServing / item.totalAmount) * item.totalCost)
      : 0;
    save({ inventory: [...inventory, item] });
    setNewItem({ name: '', totalAmount: '', unit: 'g', totalCost: '', perServing: '' });
  };

  const removeInventoryItem = (id) => {
    save({ inventory: inventory.filter(i => i.id !== id) });
  };

  const updateInventoryItem = (id, field, value) => {
    save({
      inventory: inventory.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: field === 'name' || field === 'unit' ? value : Number(value) || 0 };
        updated.unitCost = updated.totalAmount > 0 ? Math.round(updated.totalCost / updated.totalAmount) : 0;
        updated.costPerServing = updated.perServing > 0 && updated.totalAmount > 0
          ? Math.round((updated.perServing / updated.totalAmount) * updated.totalCost)
          : 0;
        return updated;
      })
    });
  };

  // --- 장보기 기록 ---
  const [newGrocery, setNewGrocery] = useState({ date: new Date().toISOString().split('T')[0], items: '', totalSpent: '', memo: '' });

  const addGroceryLog = () => {
    if (!newGrocery.totalSpent) return;
    const log = {
      id: 'gr_' + Date.now(),
      date: newGrocery.date,
      items: newGrocery.items,
      totalSpent: Number(newGrocery.totalSpent) || 0,
      memo: newGrocery.memo,
    };
    save({ groceryLogs: [log, ...groceryLogs] });
    setNewGrocery({ date: new Date().toISOString().split('T')[0], items: '', totalSpent: '', memo: '' });
  };

  const removeGroceryLog = (id) => {
    save({ groceryLogs: groceryLogs.filter(g => g.id !== id) });
  };

  // --- 오버헤드 수정 ---
  const updateOverhead = (key, value) => {
    save({ overhead: { ...overhead, [key]: Number(value) || 0 } });
  };

  // --- 마진 계산 ---
  const menu = menus?.find(m => m.id === selectedMenu);
  const ingredientCost = menu ? menu.ingredients.reduce((s, i) => s + i.cost, 0) : 0;

  const platformFeeRate = {
    baemin: overhead.baeminFeeRate,
    coupang: overhead.coupangFeeRate,
    yogiyo: overhead.yogiyoFeeRate,
    takeout: 0,
  }[selectedPlatform] || 0;

  const price = menu?.price || 0;
  const platformFee = Math.round(price * platformFeeRate / 100);
  const cardFee = Math.round(price * overhead.cardFeeRate / 100);
  const deliveryFee = selectedPlatform === 'takeout' ? 0 : overhead.deliveryFee;
  const packagingCost = overhead.packagingCost;
  const laborCost = overhead.laborCostPerOrder;
  const rentPerOrder = overhead.rentPerOrder;

  const totalCostPerBowl = ingredientCost + platformFee + cardFee + deliveryFee + packagingCost + laborCost + rentPerOrder;
  const netMargin = price - totalCostPerBowl;
  const marginRate = price > 0 ? ((netMargin / price) * 100) : 0;

  // 일 30건 기준 월 계산
  const dailyOrders = 30;
  const monthlyRevenue = price * dailyOrders * 30;
  const monthlyProfit = netMargin * dailyOrders * 30;

  const costBreakdown = [
    { label: '식재료비', amount: ingredientCost, color: '#ef4444', icon: '🥬' },
    { label: `플랫폼 수수료 (${platformFeeRate}%)`, amount: platformFee, color: '#f97316', icon: '📱' },
    { label: '배달대행비', amount: deliveryFee, color: '#eab308', icon: '🏍️' },
    { label: '포장 용기', amount: packagingCost, color: '#22c55e', icon: '📦' },
    { label: '인건비 (1건당)', amount: laborCost, color: '#3b82f6', icon: '👤' },
    { label: `카드 수수료 (${overhead.cardFeeRate}%)`, amount: cardFee, color: '#8b5cf6', icon: '💳' },
    { label: '임대료 배분', amount: rentPerOrder, color: '#6b7280', icon: '🏠' },
  ];

  const tabs = [
    { id: 'margin', label: '순마진 계산기', icon: Calculator },
    { id: 'inventory', label: '식재료 재고', icon: Package },
    { id: 'grocery', label: '장보기 기록', icon: ShoppingCart },
    { id: 'overhead', label: '비용 설정', icon: DollarSign },
  ];

  // CSV 내보내기
  const exportCSV = () => {
    let csv = '메뉴,판매가,식재료비,플랫폼수수료,배달대행비,포장비,인건비,카드수수료,총비용,순마진,마진율\n';
    (menus || []).filter(m => m.category === 'main' || m.category === 'side').forEach(m => {
      const ic = m.ingredients.reduce((s, i) => s + i.cost, 0);
      const pf = Math.round(m.price * platformFeeRate / 100);
      const cf = Math.round(m.price * overhead.cardFeeRate / 100);
      const df = selectedPlatform === 'takeout' ? 0 : overhead.deliveryFee;
      const total = ic + pf + cf + df + overhead.packagingCost + overhead.laborCostPerOrder;
      const margin = m.price - total;
      csv += `"${m.name}",${m.price},${ic},${pf},${df},${overhead.packagingCost},${overhead.laborCostPerOrder},${cf},${total},${margin},${(margin / m.price * 100).toFixed(1)}%\n`;
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = '메뉴별_원가분석.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cc">
      <div className="cc-header">
        <div>
          <h1>코스트 계산기</h1>
          <p>한 그릇의 진짜 수익을 계산하세요 — 재료비부터 배달 수수료까지</p>
        </div>
        <button className="cc-export" onClick={exportCSV}><Download size={14} /> CSV 내보내기</button>
      </div>

      <div className="cc-tabs">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`cc-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* =============== 순마진 계산기 =============== */}
      {tab === 'margin' && (
        <div className="cc-margin">
          {/* 메뉴 & 플랫폼 선택 */}
          <div className="cc-selectors">
            <div className="cc-select-group">
              <label>메뉴 선택</label>
              <select value={selectedMenu} onChange={e => setSelectedMenu(e.target.value)}>
                {(menus || []).filter(m => m.category !== 'extra').map(m => (
                  <option key={m.id} value={m.id}>{m.emoji} {m.name} ({fmt(m.price)}원)</option>
                ))}
              </select>
            </div>
            <div className="cc-select-group">
              <label>판매 채널</label>
              <div className="cc-platform-btns">
                {[
                  { id: 'baemin', label: '배민', color: '#2AC1BC' },
                  { id: 'coupang', label: '쿠팡이츠', color: '#E0115F' },
                  { id: 'yogiyo', label: '요기요', color: '#FA0050' },
                  { id: 'takeout', label: '포장', color: '#f59e0b' },
                ].map(p => (
                  <button key={p.id}
                    className={`cc-plat-btn ${selectedPlatform === p.id ? 'active' : ''}`}
                    style={selectedPlatform === p.id ? { background: p.color, borderColor: p.color, color: '#fff' } : {}}
                    onClick={() => setSelectedPlatform(p.id)}
                  >{p.label}</button>
                ))}
              </div>
            </div>
          </div>

          {menu && (
            <>
              {/* 결과 요약 카드 */}
              <div className="cc-result-cards">
                <div className="cc-rcard price-card">
                  <span className="cc-rc-label">판매가</span>
                  <span className="cc-rc-val">{fmt(price)}원</span>
                </div>
                <div className="cc-rcard cost-card">
                  <span className="cc-rc-label">총 비용</span>
                  <span className="cc-rc-val">{fmt(totalCostPerBowl)}원</span>
                </div>
                <div className={`cc-rcard margin-card ${netMargin >= 0 ? 'pos' : 'neg'}`}>
                  <span className="cc-rc-label">순마진</span>
                  <span className="cc-rc-val">{netMargin >= 0 ? '+' : ''}{fmt(netMargin)}원</span>
                  <span className="cc-rc-sub">{marginRate.toFixed(1)}%</span>
                </div>
                <div className="cc-rcard monthly-card">
                  <span className="cc-rc-label">월 예상 (일{dailyOrders}건)</span>
                  <span className="cc-rc-val">{fmt(monthlyProfit)}원</span>
                  <span className="cc-rc-sub">매출 {fmt(monthlyRevenue)}원</span>
                </div>
              </div>

              {/* 워터폴 비용 분해 */}
              <div className="cc-waterfall-card">
                <h3><Calculator size={16} /> 1그릇 비용 분해 — {menu.emoji} {menu.name}</h3>

                <div className="cc-wf-visual">
                  <div className="cc-wf-bar-container">
                    <div className="cc-wf-price-bar">
                      <span>판매가 {fmt(price)}원</span>
                    </div>
                    <div className="cc-wf-cost-bar">
                      {costBreakdown.map((c, i) => {
                        const w = price > 0 ? (c.amount / price * 100) : 0;
                        if (w <= 0) return null;
                        return (
                          <div key={i} className="cc-wf-seg" style={{ width: `${w}%`, background: c.color }}
                            title={`${c.label}: ${fmt(c.amount)}원 (${w.toFixed(1)}%)`}>
                          </div>
                        );
                      })}
                      {marginRate > 0 && (
                        <div className="cc-wf-seg cc-wf-margin-seg" style={{ width: `${marginRate}%` }}
                          title={`순마진: ${fmt(netMargin)}원`}>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <table className="cc-breakdown-table">
                  <thead>
                    <tr><th></th><th>항목</th><th className="r">금액</th><th className="r">비중</th></tr>
                  </thead>
                  <tbody>
                    {costBreakdown.map((c, i) => (
                      <tr key={i}>
                        <td className="cc-icon-cell">{c.icon}</td>
                        <td>{c.label}</td>
                        <td className="r">{fmt(c.amount)}원</td>
                        <td className="r cc-pct">{price > 0 ? (c.amount / price * 100).toFixed(1) : 0}%</td>
                      </tr>
                    ))}
                    <tr className="cc-total-row">
                      <td></td>
                      <td><strong>총 비용</strong></td>
                      <td className="r"><strong>{fmt(totalCostPerBowl)}원</strong></td>
                      <td className="r"><strong>{price > 0 ? (totalCostPerBowl / price * 100).toFixed(1) : 0}%</strong></td>
                    </tr>
                    <tr className={`cc-margin-row ${netMargin >= 0 ? 'pos' : 'neg'}`}>
                      <td>💰</td>
                      <td><strong>순마진</strong></td>
                      <td className="r"><strong>{netMargin >= 0 ? '+' : ''}{fmt(netMargin)}원</strong></td>
                      <td className="r"><strong>{marginRate.toFixed(1)}%</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 식재료 내역 */}
              <div className="cc-card">
                <h3>🥬 식재료 원가 내역 — {menu.name}</h3>
                <table className="cc-ing-table">
                  <thead><tr><th>재료</th><th className="r">원가</th><th className="r">비중</th></tr></thead>
                  <tbody>
                    {menu.ingredients.map((ing, i) => (
                      <tr key={i}>
                        <td>{ing.name}</td>
                        <td className="r">{fmt(ing.cost)}원</td>
                        <td className="r cc-pct">{ingredientCost > 0 ? (ing.cost / ingredientCost * 100).toFixed(1) : 0}%</td>
                      </tr>
                    ))}
                    <tr className="cc-total-row">
                      <td><strong>합계</strong></td>
                      <td className="r"><strong>{fmt(ingredientCost)}원</strong></td>
                      <td className="r"><strong>100%</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 전 메뉴 비교표 */}
              <div className="cc-card">
                <h3><TrendingDown size={16} /> 전체 메뉴 순마진 비교 ({selectedPlatform === 'takeout' ? '포장' : ['배민','쿠팡','요기요'][['baemin','coupang','yogiyo'].indexOf(selectedPlatform)]} 기준)</h3>
                <div className="cc-compare-table-wrap">
                  <table className="cc-compare-table">
                    <thead>
                      <tr>
                        <th>메뉴</th>
                        <th className="r">판매가</th>
                        <th className="r">재료비</th>
                        <th className="r">수수료</th>
                        <th className="r">배달비</th>
                        <th className="r">포장+인건비</th>
                        <th className="r">총비용</th>
                        <th className="r">순마진</th>
                        <th className="r">마진율</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(menus || []).filter(m => m.category !== 'extra').map(m => {
                        const ic = m.ingredients.reduce((s, i) => s + i.cost, 0);
                        const pf = Math.round(m.price * platformFeeRate / 100);
                        const cf = Math.round(m.price * overhead.cardFeeRate / 100);
                        const df = selectedPlatform === 'takeout' ? 0 : overhead.deliveryFee;
                        const total = ic + pf + cf + df + packagingCost + laborCost + rentPerOrder;
                        const margin = m.price - total;
                        const mRate = m.price > 0 ? (margin / m.price * 100) : 0;
                        const status = mRate >= 20 ? 'good' : mRate >= 10 ? 'warning' : 'danger';
                        return (
                          <tr key={m.id} className={m.id === selectedMenu ? 'cc-selected-row' : ''} onClick={() => setSelectedMenu(m.id)}>
                            <td className="cc-menu-name">{m.emoji} {m.name}</td>
                            <td className="r">{fmt(m.price)}</td>
                            <td className="r">{fmt(ic)}</td>
                            <td className="r">{fmt(pf + cf)}</td>
                            <td className="r">{fmt(df)}</td>
                            <td className="r">{fmt(packagingCost + laborCost)}</td>
                            <td className="r"><strong>{fmt(total)}</strong></td>
                            <td className={`r cc-margin-val ${margin >= 0 ? 'pos' : 'neg'}`}><strong>{margin >= 0 ? '+' : ''}{fmt(margin)}</strong></td>
                            <td className={`r cc-margin-val ${status}`}><strong>{mRate.toFixed(1)}%</strong></td>
                            <td><span className={`cc-status ${status}`}>{status === 'good' ? '양호' : status === 'warning' ? '주의' : '위험'}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {marginRate < 15 && (
                  <div className="cc-alert">
                    <AlertTriangle size={16} />
                    <span>순마진율이 15% 미만입니다. 가격 인상 또는 원가 절감을 검토하세요.</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* =============== 식재료 재고 관리 =============== */}
      {tab === 'inventory' && (
        <div className="cc-inventory">
          <div className="cc-card">
            <h3><Package size={16} /> 식재료 재고 — 구매 단가 & 1인분 원가 계산</h3>
            <p className="cc-desc">장을 볼 때 구매한 재료의 총량과 가격을 입력하면 1인분당 원가를 자동으로 계산합니다.</p>

            {/* 입력 폼 */}
            <div className="cc-inv-form">
              <input placeholder="재료명 (예: 소고기)" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
              <div className="cc-inv-amount-group">
                <input type="number" placeholder="총량" value={newItem.totalAmount} onChange={e => setNewItem({ ...newItem, totalAmount: e.target.value })} />
                <select value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="개">개</option>
                  <option value="팩">팩</option>
                  <option value="봉">봉</option>
                </select>
              </div>
              <input type="number" placeholder="구매가 (원)" value={newItem.totalCost} onChange={e => setNewItem({ ...newItem, totalCost: e.target.value })} />
              <input type="number" placeholder={`1인분 사용량 (${newItem.unit})`} value={newItem.perServing} onChange={e => setNewItem({ ...newItem, perServing: e.target.value })} />
              <button className="cc-add-btn" onClick={addInventoryItem}><Plus size={14} /> 추가</button>
            </div>

            {/* 재고 테이블 */}
            {inventory.length > 0 ? (
              <div className="cc-inv-table-wrap">
                <table className="cc-inv-table">
                  <thead>
                    <tr>
                      <th>재료명</th>
                      <th className="r">총량</th>
                      <th className="r">구매가</th>
                      <th className="r">단가 (1{newItem.unit || 'g'}당)</th>
                      <th className="r">1인분 사용량</th>
                      <th className="r">1인분 원가</th>
                      <th>등록일</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id}>
                        <td className="cc-inv-name">
                          {editingItemId === item.id ? (
                            <input value={item.name} onChange={e => updateInventoryItem(item.id, 'name', e.target.value)} className="cc-inline-input" />
                          ) : (
                            <span onClick={() => setEditingItemId(item.id)}>{item.name}</span>
                          )}
                        </td>
                        <td className="r">
                          {editingItemId === item.id ? (
                            <input type="number" value={item.totalAmount} onChange={e => updateInventoryItem(item.id, 'totalAmount', e.target.value)} className="cc-inline-input sm" />
                          ) : (
                            <span onClick={() => setEditingItemId(item.id)}>{fmt(item.totalAmount)}{item.unit}</span>
                          )}
                        </td>
                        <td className="r">
                          {editingItemId === item.id ? (
                            <input type="number" value={item.totalCost} onChange={e => updateInventoryItem(item.id, 'totalCost', e.target.value)} className="cc-inline-input sm" />
                          ) : (
                            <span onClick={() => setEditingItemId(item.id)}>{fmt(item.totalCost)}원</span>
                          )}
                        </td>
                        <td className="r cc-computed">{fmt(item.unitCost)}원/{item.unit}</td>
                        <td className="r">
                          {editingItemId === item.id ? (
                            <input type="number" value={item.perServing} onChange={e => updateInventoryItem(item.id, 'perServing', e.target.value)} className="cc-inline-input sm" />
                          ) : (
                            <span onClick={() => setEditingItemId(item.id)}>{fmt(item.perServing)}{item.unit}</span>
                          )}
                        </td>
                        <td className="r cc-highlight">{fmt(item.costPerServing)}원</td>
                        <td className="cc-date">{item.createdAt}</td>
                        <td>
                          <div className="cc-inv-actions">
                            {editingItemId === item.id && (
                              <button className="cc-icon-btn check" onClick={() => setEditingItemId(null)}><Check size={14} /></button>
                            )}
                            <button className="cc-icon-btn del" onClick={() => removeInventoryItem(item.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cc-empty">아직 등록된 재료가 없습니다. 위에서 장 본 재료를 추가해 보세요.</div>
            )}

            {inventory.length > 0 && (
              <div className="cc-inv-summary">
                <span>총 {inventory.length}개 재료</span>
                <span>총 구매액: <strong>{fmt(inventory.reduce((s, i) => s + i.totalCost, 0))}원</strong></span>
                <span>1인분 총 원가: <strong>{fmt(inventory.reduce((s, i) => s + i.costPerServing, 0))}원</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============== 장보기 기록 =============== */}
      {tab === 'grocery' && (
        <div className="cc-grocery">
          <div className="cc-card">
            <h3><ShoppingCart size={16} /> 장보기 기록</h3>
            <p className="cc-desc">매일 장을 본 내역과 금액을 기록하여 식재료비 추이를 관리하세요.</p>

            <div className="cc-gr-form">
              <input type="date" value={newGrocery.date} onChange={e => setNewGrocery({ ...newGrocery, date: e.target.value })} />
              <input placeholder="구매 품목 (예: 소고기 2kg, 양파 3kg, 대파)" value={newGrocery.items} onChange={e => setNewGrocery({ ...newGrocery, items: e.target.value })} className="cc-gr-items" />
              <input type="number" placeholder="총 지출 (원)" value={newGrocery.totalSpent} onChange={e => setNewGrocery({ ...newGrocery, totalSpent: e.target.value })} />
              <input placeholder="메모" value={newGrocery.memo} onChange={e => setNewGrocery({ ...newGrocery, memo: e.target.value })} />
              <button className="cc-add-btn" onClick={addGroceryLog}><Plus size={14} /> 기록</button>
            </div>

            {groceryLogs.length > 0 ? (
              <>
                {/* 요약 */}
                <div className="cc-gr-summary">
                  <div className="cc-gr-stat">
                    <span className="cc-gr-stat-label">총 장보기 횟수</span>
                    <span className="cc-gr-stat-val">{groceryLogs.length}회</span>
                  </div>
                  <div className="cc-gr-stat">
                    <span className="cc-gr-stat-label">총 지출</span>
                    <span className="cc-gr-stat-val">{fmt(groceryLogs.reduce((s, g) => s + g.totalSpent, 0))}원</span>
                  </div>
                  <div className="cc-gr-stat">
                    <span className="cc-gr-stat-label">평균 1회 지출</span>
                    <span className="cc-gr-stat-val">{fmt(Math.round(groceryLogs.reduce((s, g) => s + g.totalSpent, 0) / groceryLogs.length))}원</span>
                  </div>
                </div>

                <table className="cc-gr-table">
                  <thead><tr><th>날짜</th><th>구매 품목</th><th className="r">지출</th><th>메모</th><th></th></tr></thead>
                  <tbody>
                    {groceryLogs.map(log => (
                      <tr key={log.id}>
                        <td className="cc-date">{log.date}</td>
                        <td className="cc-gr-items-cell">{log.items || '-'}</td>
                        <td className="r"><strong>{fmt(log.totalSpent)}원</strong></td>
                        <td className="cc-gr-memo">{log.memo || '-'}</td>
                        <td><button className="cc-icon-btn del" onClick={() => removeGroceryLog(log.id)}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="cc-empty">아직 장보기 기록이 없습니다. 위에서 오늘 장 본 내역을 기록해 보세요.</div>
            )}
          </div>
        </div>
      )}

      {/* =============== 비용 설정 =============== */}
      {tab === 'overhead' && (
        <div className="cc-overhead">
          <div className="cc-card">
            <h3><DollarSign size={16} /> 비용 항목 설정</h3>
            <p className="cc-desc">순마진 계산에 사용되는 비용 항목들을 설정하세요. 여기서 바꾸면 마진 계산에 바로 반영됩니다.</p>

            <div className="cc-oh-grid">
              <div className="cc-oh-section">
                <h4><Percent size={14} /> 플랫폼 수수료율 (%)</h4>
                <div className="cc-oh-item">
                  <label>배달의민족</label>
                  <div className="cc-oh-input-wrap">
                    <input type="number" value={overhead.baeminFeeRate} onChange={e => updateOverhead('baeminFeeRate', e.target.value)} step="0.1" />
                    <span>%</span>
                  </div>
                </div>
                <div className="cc-oh-item">
                  <label>쿠팡이츠</label>
                  <div className="cc-oh-input-wrap">
                    <input type="number" value={overhead.coupangFeeRate} onChange={e => updateOverhead('coupangFeeRate', e.target.value)} step="0.1" />
                    <span>%</span>
                  </div>
                </div>
                <div className="cc-oh-item">
                  <label>요기요</label>
                  <div className="cc-oh-input-wrap">
                    <input type="number" value={overhead.yogiyoFeeRate} onChange={e => updateOverhead('yogiyoFeeRate', e.target.value)} step="0.1" />
                    <span>%</span>
                  </div>
                </div>
                <div className="cc-oh-item">
                  <label>카드 수수료</label>
                  <div className="cc-oh-input-wrap">
                    <input type="number" value={overhead.cardFeeRate} onChange={e => updateOverhead('cardFeeRate', e.target.value)} step="0.1" />
                    <span>%</span>
                  </div>
                </div>
              </div>

              <div className="cc-oh-section">
                <h4><Truck size={14} /> 건당 비용 (원)</h4>
                <div className="cc-oh-item">
                  <label>배달대행비 (1건)</label>
                  <div className="cc-oh-input-wrap">
                    <input type="number" value={overhead.deliveryFee} onChange={e => updateOverhead('deliveryFee', e.target.value)} />
                    <span>원</span>
                  </div>
                </div>
                <div className="cc-oh-item">
                  <label>포장 용기 (1건)</label>
                  <div className="cc-oh-input-wrap">
                    <input type="number" value={overhead.packagingCost} onChange={e => updateOverhead('packagingCost', e.target.value)} />
                    <span>원</span>
                  </div>
                </div>
                <div className="cc-oh-item">
                  <label>인건비 배분 (1건)</label>
                  <div className="cc-oh-input-wrap">
                    <input type="number" value={overhead.laborCostPerOrder} onChange={e => updateOverhead('laborCostPerOrder', e.target.value)} />
                    <span>원</span>
                  </div>
                  <p className="cc-oh-hint">월 인건비 ÷ 월 주문 수로 계산 (예: 0원 = 2인 자가노동)</p>
                </div>
                <div className="cc-oh-item">
                  <label>임대료 배분 (1건)</label>
                  <div className="cc-oh-input-wrap">
                    <input type="number" value={overhead.rentPerOrder} onChange={e => updateOverhead('rentPerOrder', e.target.value)} />
                    <span>원</span>
                  </div>
                  <p className="cc-oh-hint">월세 810,000 ÷ 월 900건 = 약 900원 (선택사항)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cc { max-width: 1200px; }
        .cc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
        .cc-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .cc-header p { color: var(--text-light); font-size: 14px; }
        .cc-export { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--text); background: var(--bg-card); border: 1px solid var(--border); white-space: nowrap; }
        .cc-export:hover { border-color: var(--primary); color: var(--primary); }

        .cc-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px; overflow-x: auto; }
        .cc-tab { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; color: var(--text); white-space: nowrap; transition: all 0.15s; }
        .cc-tab:hover { background: var(--bg); color: var(--text-dark); }
        .cc-tab.active { background: var(--primary); color: white; }

        .cc-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
        .cc-card h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .cc-desc { font-size: 13px; color: var(--text-light); margin-bottom: 16px; line-height: 1.5; }

        /* 마진 계산기 */
        .cc-selectors { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .cc-select-group label { font-size: 12px; font-weight: 600; color: var(--text-light); display: block; margin-bottom: 6px; }
        .cc-select-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: var(--bg-card); cursor: pointer; }
        .cc-select-group select:focus { border-color: var(--primary); }
        .cc-platform-btns { display: flex; gap: 6px; }
        .cc-plat-btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; border: 2px solid var(--border); color: var(--text); transition: all 0.15s; }
        .cc-plat-btn:hover { border-color: var(--text-light); }
        .cc-plat-btn.active { border-color: currentColor; }

        .cc-result-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .cc-rcard { padding: 18px; border-radius: var(--radius); text-align: center; }
        .cc-rc-label { font-size: 12px; display: block; margin-bottom: 4px; }
        .cc-rc-val { font-size: 22px; font-weight: 800; display: block; }
        .cc-rc-sub { font-size: 12px; display: block; margin-top: 2px; opacity: 0.8; }
        .price-card { background: #eff6ff; color: #2563eb; }
        .cost-card { background: #fff7ed; color: #ea580c; }
        .margin-card.pos { background: #f0fdf4; color: #16a34a; }
        .margin-card.neg { background: #fef2f2; color: #ef4444; }
        .monthly-card { background: #faf5ff; color: #7c3aed; }

        .cc-waterfall-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
        .cc-waterfall-card h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .cc-wf-visual { margin-bottom: 20px; }
        .cc-wf-bar-container { display: flex; flex-direction: column; gap: 6px; }
        .cc-wf-price-bar { height: 32px; background: linear-gradient(90deg, #2563eb, #60a5fa); border-radius: 6px; display: flex; align-items: center; padding: 0 12px; font-size: 13px; font-weight: 700; color: white; }
        .cc-wf-cost-bar { height: 32px; display: flex; border-radius: 6px; overflow: hidden; }
        .cc-wf-seg { height: 100%; min-width: 2px; transition: width 0.3s; }
        .cc-wf-margin-seg { background: repeating-linear-gradient(45deg, #16a34a, #16a34a 4px, #22c55e 4px, #22c55e 8px); }

        .cc-breakdown-table { width: 100%; border-collapse: collapse; }
        .cc-breakdown-table th { font-size: 11px; font-weight: 600; color: var(--text-light); padding: 8px; border-bottom: 2px solid var(--border); text-align: left; }
        .cc-breakdown-table th.r { text-align: right; }
        .cc-breakdown-table td { padding: 10px 8px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .cc-breakdown-table .r { text-align: right; font-variant-numeric: tabular-nums; }
        .cc-icon-cell { font-size: 16px; width: 30px; }
        .cc-pct { color: var(--text-light); font-size: 12px; }
        .cc-total-row td { border-top: 2px solid var(--border); }
        .cc-margin-row td { border-top: 2px solid var(--border); font-size: 15px; }
        .cc-margin-row.pos td { color: #16a34a; }
        .cc-margin-row.neg td { color: #ef4444; }

        .cc-ing-table { width: 100%; border-collapse: collapse; }
        .cc-ing-table th { font-size: 11px; font-weight: 600; color: var(--text-light); padding: 8px; border-bottom: 2px solid var(--border); text-align: left; }
        .cc-ing-table th.r { text-align: right; }
        .cc-ing-table td { padding: 8px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .cc-ing-table .r { text-align: right; }

        .cc-compare-table-wrap { overflow-x: auto; }
        .cc-compare-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
        .cc-compare-table th { font-size: 11px; font-weight: 600; color: var(--text-light); padding: 8px 6px; border-bottom: 2px solid var(--border); text-align: left; }
        .cc-compare-table th.r { text-align: right; }
        .cc-compare-table td { padding: 10px 6px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .cc-compare-table .r { text-align: right; font-variant-numeric: tabular-nums; }
        .cc-compare-table tr:hover { background: var(--border-light); cursor: pointer; }
        .cc-selected-row { background: #eff6ff !important; }
        .cc-menu-name { font-weight: 600; color: var(--text-dark); }
        .cc-margin-val.pos { color: #16a34a; }
        .cc-margin-val.neg { color: #ef4444; }
        .cc-margin-val.good { color: #16a34a; }
        .cc-margin-val.warning { color: #f97316; }
        .cc-margin-val.danger { color: #ef4444; }
        .cc-status { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
        .cc-status.good { background: #dcfce7; color: #16a34a; }
        .cc-status.warning { background: #fff7ed; color: #f97316; }
        .cc-status.danger { background: #fef2f2; color: #ef4444; }

        .cc-alert { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 14px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; font-size: 13px; color: #92400e; }

        /* 재고 관리 */
        .cc-inv-form { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: flex-end; }
        .cc-inv-form input, .cc-inv-form select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
        .cc-inv-form input { flex: 1; min-width: 100px; }
        .cc-inv-form input:focus, .cc-inv-form select:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }
        .cc-inv-amount-group { display: flex; gap: 4px; flex: 1; min-width: 140px; }
        .cc-inv-amount-group input { flex: 1; }
        .cc-inv-amount-group select { width: 60px; flex-shrink: 0; }
        .cc-add-btn { display: flex; align-items: center; gap: 4px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; background: var(--primary); color: white; white-space: nowrap; }
        .cc-add-btn:hover { background: var(--primary-dark); }

        .cc-inv-table-wrap { overflow-x: auto; }
        .cc-inv-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
        .cc-inv-table th { font-size: 11px; font-weight: 600; color: var(--text-light); padding: 8px 6px; border-bottom: 2px solid var(--border); text-align: left; }
        .cc-inv-table th.r { text-align: right; }
        .cc-inv-table td { padding: 8px 6px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .cc-inv-table .r { text-align: right; }
        .cc-inv-name { font-weight: 500; color: var(--text-dark); cursor: pointer; }
        .cc-computed { color: var(--text-light); }
        .cc-highlight { font-weight: 700; color: var(--primary); }
        .cc-date { font-size: 12px; color: var(--text-light); }
        .cc-inline-input { padding: 4px 8px; border: 2px solid var(--primary); border-radius: 4px; font-size: 13px; width: 100%; }
        .cc-inline-input.sm { max-width: 80px; text-align: right; }
        .cc-inv-actions { display: flex; gap: 4px; }
        .cc-icon-btn { padding: 4px; border-radius: 4px; color: var(--text-light); transition: all 0.1s; }
        .cc-icon-btn.del:hover { color: #ef4444; background: #fef2f2; }
        .cc-icon-btn.check { color: #16a34a; }
        .cc-icon-btn.check:hover { background: #dcfce7; }

        .cc-inv-summary { display: flex; gap: 24px; padding: 12px 0; margin-top: 12px; border-top: 1px solid var(--border-light); font-size: 13px; color: var(--text); flex-wrap: wrap; }
        .cc-inv-summary strong { color: var(--text-dark); }

        .cc-empty { text-align: center; padding: 32px; color: var(--text-light); font-size: 14px; }

        /* 장보기 */
        .cc-gr-form { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: flex-end; }
        .cc-gr-form input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; flex: 1; min-width: 100px; }
        .cc-gr-form input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }
        .cc-gr-items { flex: 3 !important; min-width: 200px !important; }
        .cc-gr-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
        .cc-gr-stat { background: var(--bg); border-radius: var(--radius-sm); padding: 14px; }
        .cc-gr-stat-label { font-size: 12px; color: var(--text-light); display: block; margin-bottom: 2px; }
        .cc-gr-stat-val { font-size: 18px; font-weight: 700; color: var(--text-dark); }
        .cc-gr-table { width: 100%; border-collapse: collapse; }
        .cc-gr-table th { font-size: 11px; font-weight: 600; color: var(--text-light); padding: 8px; border-bottom: 2px solid var(--border); text-align: left; }
        .cc-gr-table th.r { text-align: right; }
        .cc-gr-table td { padding: 10px 8px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .cc-gr-table .r { text-align: right; }
        .cc-gr-items-cell { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cc-gr-memo { font-size: 12px; color: var(--text-light); max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* 비용 설정 */
        .cc-oh-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .cc-oh-section h4 { font-size: 14px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 6px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border-light); }
        .cc-oh-item { margin-bottom: 14px; }
        .cc-oh-item label { font-size: 13px; font-weight: 500; color: var(--text); display: block; margin-bottom: 4px; }
        .cc-oh-input-wrap { display: flex; align-items: center; gap: 6px; }
        .cc-oh-input-wrap input { width: 120px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; font-weight: 600; text-align: right; }
        .cc-oh-input-wrap input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }
        .cc-oh-input-wrap span { font-size: 13px; color: var(--text-light); min-width: 20px; }
        .cc-oh-hint { font-size: 11px; color: var(--text-light); margin-top: 3px; }

        @media (max-width: 1024px) {
          .cc-selectors { grid-template-columns: 1fr; }
          .cc-result-cards { grid-template-columns: repeat(2, 1fr); }
          .cc-oh-grid { grid-template-columns: 1fr; }
          .cc-gr-summary { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .cc-result-cards { grid-template-columns: 1fr; }
          .cc-platform-btns { flex-wrap: wrap; }
          .cc-inv-form { flex-direction: column; }
          .cc-gr-form { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
