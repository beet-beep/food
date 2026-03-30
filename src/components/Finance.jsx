import { useState } from 'react';
import { Wallet, TrendingUp, Calculator, PiggyBank, AlertTriangle, Edit3, Check, Plus, Trash2, ChevronLeft, ChevronRight, BookOpen, Home, BarChart3, Settings, FileSpreadsheet } from 'lucide-react';
import { revenueCategories, expenseCategories } from '../data/initialData';

const fmt = (n) => Number(n).toLocaleString('ko-KR');

export default function Finance({ finance, setFinance, menus, ledger, setLedger }) {
  const [tab, setTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [editingFixed, setEditingFixed] = useState(null);
  const [editingInitial, setEditingInitial] = useState(null);

  const totalInitial = finance.initialCosts.reduce((s, c) => s + c.amount, 0);
  const totalMonthlyFixed = finance.monthlyFixed.reduce((s, c) => s + c.amount, 0);

  // Monthly ledger helpers
  const currentLedger = ledger[selectedMonth] || ledger[0];
  const monthRevenue = Object.values(currentLedger.revenue || {}).reduce((s, v) => s + v, 0);
  const monthExpense = Object.values(currentLedger.expense || {}).reduce((s, v) => s + v, 0);
  const monthProfit = monthRevenue - monthExpense;
  const monthOrders = Object.values(currentLedger.orders || {}).reduce((s, v) => s + v, 0);

  const updateLedgerField = (section, key, value) => {
    setLedger(prev => prev.map((m, i) => {
      if (i !== selectedMonth) return m;
      return { ...m, [section]: { ...m[section], [key]: Number(value) || 0 } };
    }));
  };

  const updateLedgerMemo = (value) => {
    setLedger(prev => prev.map((m, i) => i === selectedMonth ? { ...m, memo: value } : m));
  };

  const updateFixedCost = (id, amount) => {
    setFinance(prev => ({
      ...prev,
      monthlyFixed: prev.monthlyFixed.map(f => f.id === id ? { ...f, amount: Number(amount) || 0 } : f)
    }));
  };

  const updateInitialCost = (id, field, value) => {
    setFinance(prev => ({
      ...prev,
      initialCosts: prev.initialCosts.map(c => c.id === id ? { ...c, [field]: field === 'amount' ? (Number(value) || 0) : value } : c)
    }));
  };

  // Cumulative calculations
  const cumulativeData = ledger.map((m, i) => {
    const rev = Object.values(m.revenue || {}).reduce((s, v) => s + v, 0);
    const exp = Object.values(m.expense || {}).reduce((s, v) => s + v, 0);
    const prevCum = i > 0 ? ledger.slice(0, i).reduce((s, pm) => {
      return s + Object.values(pm.revenue || {}).reduce((a, b) => a + b, 0) - Object.values(pm.expense || {}).reduce((a, b) => a + b, 0);
    }, 0) : 0;
    return { yearMonth: m.yearMonth, revenue: rev, expense: exp, profit: rev - exp, cumulative: prevCum + (rev - exp) };
  });

  const totalRevAll = cumulativeData.reduce((s, d) => s + d.revenue, 0);
  const totalExpAll = cumulativeData.reduce((s, d) => s + d.expense, 0);

  const tabs = [
    { id: 'overview', label: '요약', icon: BarChart3 },
    { id: 'ledger', label: '월별 장부', icon: FileSpreadsheet },
    { id: 'fixed', label: '고정비 관리', icon: Settings },
    { id: 'initial', label: '초기 투자', icon: Home },
    { id: 'contract', label: '계약 정보', icon: BookOpen },
  ];

  return (
    <div className="fin">
      <div className="page-header">
        <h1>재무 관리</h1>
        <p>매출, 지출, 수익을 월별로 관리하고 분석하세요</p>
      </div>

      <div className="fin-tabs">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`fin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ========== 요약 탭 ========== */}
      {tab === 'overview' && (
        <div className="fin-overview">
          <div className="ov-stats">
            <div className="ov-stat blue">
              <p className="ov-label">총 누적 매출</p>
              <p className="ov-val">{fmt(totalRevAll)}원</p>
            </div>
            <div className="ov-stat orange">
              <p className="ov-label">총 누적 지출</p>
              <p className="ov-val">{fmt(totalExpAll)}원</p>
            </div>
            <div className={`ov-stat ${totalRevAll - totalExpAll >= 0 ? 'green' : 'red'}`}>
              <p className="ov-label">총 누적 손익</p>
              <p className="ov-val">{fmt(totalRevAll - totalExpAll)}원</p>
            </div>
            <div className="ov-stat purple">
              <p className="ov-label">초기 투자금</p>
              <p className="ov-val">{fmt(totalInitial)}원</p>
            </div>
          </div>

          {/* 월별 추이 테이블 */}
          <div className="ov-card">
            <h3><BarChart3 size={16} /> 월별 손익 추이</h3>
            <div className="ov-table-wrap">
              <table className="ov-table">
                <thead>
                  <tr>
                    <th>월</th>
                    <th className="r">매출</th>
                    <th className="r">지출</th>
                    <th className="r">손익</th>
                    <th className="r">누적 손익</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {cumulativeData.map((d, i) => (
                    <tr key={d.yearMonth} className={i === selectedMonth ? 'selected' : ''} onClick={() => { setSelectedMonth(i); setTab('ledger'); }}>
                      <td className="month-cell">{d.yearMonth}</td>
                      <td className="r">{fmt(d.revenue)}</td>
                      <td className="r">{fmt(d.expense)}</td>
                      <td className={`r ${d.profit >= 0 ? 'pos' : 'neg'}`}>{d.profit >= 0 ? '+' : ''}{fmt(d.profit)}</td>
                      <td className={`r ${d.cumulative >= 0 ? 'pos' : 'neg'}`}>{d.cumulative >= 0 ? '+' : ''}{fmt(d.cumulative)}</td>
                      <td>
                        {d.revenue === 0 && d.expense === 0 ? (
                          <span className="status-dot empty">미입력</span>
                        ) : d.profit >= 0 ? (
                          <span className="status-dot profit">흑자</span>
                        ) : (
                          <span className="status-dot loss">적자</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>합계</strong></td>
                    <td className="r"><strong>{fmt(totalRevAll)}</strong></td>
                    <td className="r"><strong>{fmt(totalExpAll)}</strong></td>
                    <td className={`r ${totalRevAll - totalExpAll >= 0 ? 'pos' : 'neg'}`}><strong>{totalRevAll - totalExpAll >= 0 ? '+' : ''}{fmt(totalRevAll - totalExpAll)}</strong></td>
                    <td className="r">-</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="ov-hint">행을 클릭하면 해당 월 장부로 이동합니다</p>
          </div>

          {/* 월별 막대 차트 */}
          <div className="ov-card">
            <h3><TrendingUp size={16} /> 월별 매출/지출 비교</h3>
            <div className="bar-chart">
              {cumulativeData.map((d, i) => {
                const maxVal = Math.max(...cumulativeData.map(x => Math.max(x.revenue, x.expense)), 1);
                return (
                  <div key={d.yearMonth} className="bar-col" onClick={() => { setSelectedMonth(i); setTab('ledger'); }}>
                    <div className="bar-bars">
                      <div className="bar rev-bar" style={{ height: `${(d.revenue / maxVal) * 100}%` }} title={`매출 ${fmt(d.revenue)}`}></div>
                      <div className="bar exp-bar" style={{ height: `${(d.expense / maxVal) * 100}%` }} title={`지출 ${fmt(d.expense)}`}></div>
                    </div>
                    <span className="bar-label">{d.yearMonth.split('-')[1]}월</span>
                  </div>
                );
              })}
            </div>
            <div className="bar-legend">
              <span><span className="legend-dot rev"></span> 매출</span>
              <span><span className="legend-dot exp"></span> 지출</span>
            </div>
          </div>

          {/* 세액감면 */}
          <div className="tax-card">
            <PiggyBank size={20} />
            <div>
              <h3>청년창업 세액감면 예상 (75%, 5년)</h3>
              <p>연 순이익 {fmt((totalRevAll - totalExpAll))}원 기준 종합소득세 약 6% 적용 시</p>
              <p className="tax-big">연간 약 <strong>{fmt(Math.round(Math.max(totalRevAll - totalExpAll, 0) * 0.06 * 0.75))}</strong>원 절세</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== 월별 장부 탭 ========== */}
      {tab === 'ledger' && (
        <div className="fin-ledger">
          <div className="ledger-nav">
            <button onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))} disabled={selectedMonth === 0}><ChevronLeft size={20} /></button>
            <h2>{currentLedger.yearMonth.replace('-', '년 ')}월</h2>
            <button onClick={() => setSelectedMonth(Math.min(ledger.length - 1, selectedMonth + 1))} disabled={selectedMonth === ledger.length - 1}><ChevronRight size={20} /></button>
          </div>

          {/* 월 요약 카드 */}
          <div className="ledger-summary">
            <div className="ls-card blue">
              <p className="ls-label">매출</p>
              <p className="ls-val">{fmt(monthRevenue)}원</p>
              <p className="ls-sub">주문 {fmt(monthOrders)}건</p>
            </div>
            <div className="ls-card orange">
              <p className="ls-label">지출</p>
              <p className="ls-val">{fmt(monthExpense)}원</p>
            </div>
            <div className={`ls-card ${monthProfit >= 0 ? 'green' : 'red'}`}>
              <p className="ls-label">순이익</p>
              <p className="ls-val">{monthProfit >= 0 ? '+' : ''}{fmt(monthProfit)}원</p>
              <p className="ls-sub">{monthRevenue > 0 ? `이익률 ${((monthProfit / monthRevenue) * 100).toFixed(1)}%` : ''}</p>
            </div>
            <div className="ls-card gray">
              <p className="ls-label">객단가</p>
              <p className="ls-val">{monthOrders > 0 ? fmt(Math.round(monthRevenue / monthOrders)) : '-'}원</p>
              <p className="ls-sub">일평균 {monthOrders > 0 ? Math.round(monthOrders / 30) : 0}건</p>
            </div>
          </div>

          <div className="ledger-grid">
            {/* 매출 입력 */}
            <div className="ledger-card">
              <h3 className="lc-title revenue-title">매출 (수입)</h3>
              <table className="ledger-table">
                <thead><tr><th>항목</th><th>주문 수</th><th className="r">금액 (원)</th></tr></thead>
                <tbody>
                  {revenueCategories.map(cat => (
                    <tr key={cat.key}>
                      <td>
                        <span className="cat-dot" style={{ background: cat.color }}></span>
                        {cat.label}
                      </td>
                      <td>
                        {currentLedger.orders[cat.key] !== undefined ? (
                          <input type="number" className="ledger-input sm" value={currentLedger.orders[cat.key] || ''} placeholder="0"
                            onChange={e => updateLedgerField('orders', cat.key, e.target.value)} />
                        ) : <span className="text-muted">-</span>}
                      </td>
                      <td>
                        <input type="number" className="ledger-input" value={currentLedger.revenue[cat.key] || ''} placeholder="0"
                          onChange={e => updateLedgerField('revenue', cat.key, e.target.value)} />
                      </td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td><strong>합계</strong></td>
                    <td><strong>{fmt(monthOrders)}</strong></td>
                    <td className="r"><strong>{fmt(monthRevenue)}원</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* 매출 비중 바 */}
              {monthRevenue > 0 && (
                <div className="ratio-bar-section">
                  <p className="ratio-title">플랫폼별 매출 비중</p>
                  <div className="ratio-bar">
                    {revenueCategories.map(cat => {
                      const pct = (currentLedger.revenue[cat.key] / monthRevenue) * 100;
                      if (pct <= 0) return null;
                      return <div key={cat.key} className="ratio-seg" style={{ width: `${pct}%`, background: cat.color }} title={`${cat.label} ${pct.toFixed(1)}%`}></div>;
                    })}
                  </div>
                  <div className="ratio-legend">
                    {revenueCategories.map(cat => {
                      const pct = (currentLedger.revenue[cat.key] / monthRevenue) * 100;
                      if (pct <= 0) return null;
                      return <span key={cat.key}><span className="legend-dot" style={{ background: cat.color }}></span>{cat.label} {pct.toFixed(1)}%</span>;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 지출 입력 */}
            <div className="ledger-card">
              <h3 className="lc-title expense-title">지출 (비용)</h3>
              <table className="ledger-table">
                <thead><tr><th>항목</th><th className="r">금액 (원)</th><th className="r">비중</th></tr></thead>
                <tbody>
                  {expenseCategories.map(cat => (
                    <tr key={cat.key}>
                      <td>
                        <span className="cat-dot" style={{ background: cat.color }}></span>
                        {cat.label}
                      </td>
                      <td>
                        <input type="number" className="ledger-input" value={currentLedger.expense[cat.key] || ''} placeholder="0"
                          onChange={e => updateLedgerField('expense', cat.key, e.target.value)} />
                      </td>
                      <td className="r pct-cell">
                        {monthExpense > 0 ? `${((currentLedger.expense[cat.key] / monthExpense) * 100).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td><strong>합계</strong></td>
                    <td className="r"><strong>{fmt(monthExpense)}원</strong></td>
                    <td className="r"><strong>100%</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* 지출 비중 바 */}
              {monthExpense > 0 && (
                <div className="ratio-bar-section">
                  <p className="ratio-title">지출 항목별 비중</p>
                  <div className="ratio-bar">
                    {expenseCategories.map(cat => {
                      const pct = (currentLedger.expense[cat.key] / monthExpense) * 100;
                      if (pct <= 0) return null;
                      return <div key={cat.key} className="ratio-seg" style={{ width: `${pct}%`, background: cat.color }} title={`${cat.label} ${pct.toFixed(1)}%`}></div>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 수익 구조 워터폴 */}
          {monthRevenue > 0 && (
            <div className="ledger-card full">
              <h3 className="lc-title">수익 구조 분석</h3>
              <div className="waterfall">
                <div className="wf-row">
                  <span className="wf-name">매출</span>
                  <div className="wf-bar-track"><div className="wf-bar-fill wf-rev" style={{ width: '100%' }}></div></div>
                  <span className="wf-amt">+{fmt(monthRevenue)}</span>
                </div>
                {expenseCategories.filter(c => currentLedger.expense[c.key] > 0).map(cat => (
                  <div key={cat.key} className="wf-row">
                    <span className="wf-name">{cat.label}</span>
                    <div className="wf-bar-track"><div className="wf-bar-fill" style={{ width: `${(currentLedger.expense[cat.key] / monthRevenue) * 100}%`, background: cat.color }}></div></div>
                    <span className="wf-amt neg">-{fmt(currentLedger.expense[cat.key])}</span>
                  </div>
                ))}
                <div className="wf-row wf-total">
                  <span className="wf-name"><strong>순이익</strong></span>
                  <div className="wf-bar-track"><div className={`wf-bar-fill ${monthProfit >= 0 ? 'wf-profit' : 'wf-loss'}`} style={{ width: `${Math.min(Math.abs(monthProfit / monthRevenue) * 100, 100)}%` }}></div></div>
                  <span className={`wf-amt ${monthProfit >= 0 ? '' : 'neg'}`}><strong>{monthProfit >= 0 ? '+' : ''}{fmt(monthProfit)}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* 메모 */}
          <div className="ledger-card full">
            <h3 className="lc-title">메모</h3>
            <textarea className="ledger-memo" placeholder="이번 달 특이사항, 이벤트 결과, 식재료 가격 변동 등을 기록하세요..." value={currentLedger.memo} onChange={e => updateLedgerMemo(e.target.value)} />
          </div>
        </div>
      )}

      {/* ========== 고정비 관리 탭 ========== */}
      {tab === 'fixed' && (
        <div className="fin-fixed">
          <div className="fixed-card">
            <div className="fixed-header">
              <h3><Settings size={18} /> 월 고정비 항목</h3>
              <div className="fixed-total">월 합계: <strong>{fmt(totalMonthlyFixed)}원</strong></div>
            </div>
            <table className="fixed-table">
              <thead>
                <tr><th>항목</th><th>카테고리</th><th className="r">금액 (원)</th><th></th></tr>
              </thead>
              <tbody>
                {finance.monthlyFixed.map(item => {
                  const catLabel = { rent: '임대', platform: '플랫폼', delivery: '배달', utility: '공과금' }[item.category] || '기타';
                  return (
                    <tr key={item.id}>
                      <td className="fixed-name">{item.name}</td>
                      <td><span className="fixed-cat">{catLabel}</span></td>
                      <td>
                        {editingFixed === item.id ? (
                          <input type="number" className="fixed-input" value={item.amount} onChange={e => updateFixedCost(item.id, e.target.value)} autoFocus onBlur={() => setEditingFixed(null)} onKeyDown={e => e.key === 'Enter' && setEditingFixed(null)} />
                        ) : (
                          <span className="fixed-amount" onClick={() => setEditingFixed(item.id)}>{fmt(item.amount)}원 <Edit3 size={12} /></span>
                        )}
                      </td>
                      <td className="fixed-pct">{((item.amount / totalMonthlyFixed) * 100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
                <tr className="total-row">
                  <td colSpan={2}><strong>합계</strong></td>
                  <td className="r"><strong>{fmt(totalMonthlyFixed)}원</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="fixed-breakdown">
              <h4>비중 분석</h4>
              <div className="ratio-bar" style={{ height: 20 }}>
                {finance.monthlyFixed.map((item, i) => {
                  const colors = ['#ef4444','#f97316','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#6b7280'];
                  return <div key={item.id} className="ratio-seg" style={{ width: `${(item.amount / totalMonthlyFixed) * 100}%`, background: colors[i % colors.length] }} title={`${item.name} ${fmt(item.amount)}원`}></div>;
                })}
              </div>
              <div className="ratio-legend" style={{ marginTop: 8 }}>
                {finance.monthlyFixed.map((item, i) => {
                  const colors = ['#ef4444','#f97316','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#6b7280'];
                  return <span key={item.id}><span className="legend-dot" style={{ background: colors[i % colors.length] }}></span>{item.name}</span>;
                })}
              </div>
            </div>
          </div>

          <div className="fixed-info">
            <AlertTriangle size={16} />
            <p>고정비를 변경하면 장부의 기존 데이터에는 영향을 주지 않습니다. 이미 입력된 월별 장부의 지출은 별도로 수정해 주세요.</p>
          </div>
        </div>
      )}

      {/* ========== 초기 투자 탭 ========== */}
      {tab === 'initial' && (
        <div className="fin-initial">
          <div className="initial-card">
            <div className="initial-header">
              <h3><Home size={18} /> 초기 투자 비용</h3>
              <div className="initial-total">총 투자: <strong>{fmt(totalInitial)}원</strong></div>
            </div>
            <table className="initial-table">
              <thead>
                <tr><th>항목</th><th>카테고리</th><th className="r">금액 (원)</th><th>비고</th></tr>
              </thead>
              <tbody>
                {finance.initialCosts.map(item => {
                  const catLabel = { deposit: '보증금', equipment: '장비', material: '재료', marketing: '마케팅' }[item.category] || '기타';
                  const catColor = { deposit: '#ef4444', equipment: '#3b82f6', material: '#22c55e', marketing: '#f59e0b' }[item.category] || '#6b7280';
                  return (
                    <tr key={item.id}>
                      <td className="fixed-name">{item.name}</td>
                      <td><span className="fixed-cat" style={{ background: `${catColor}15`, color: catColor }}>{catLabel}</span></td>
                      <td>
                        {editingInitial === item.id ? (
                          <input type="number" className="fixed-input" value={item.amount} onChange={e => updateInitialCost(item.id, 'amount', e.target.value)} autoFocus onBlur={() => setEditingInitial(null)} onKeyDown={e => e.key === 'Enter' && setEditingInitial(null)} />
                        ) : (
                          <span className="fixed-amount" onClick={() => setEditingInitial(item.id)}>{fmt(item.amount)}원 <Edit3 size={12} /></span>
                        )}
                      </td>
                      <td className="note-cell">{item.note}</td>
                    </tr>
                  );
                })}
                <tr className="total-row">
                  <td colSpan={2}><strong>합계</strong></td>
                  <td className="r"><strong>{fmt(totalInitial)}원</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            {/* 카테고리별 비중 */}
            <div className="fixed-breakdown">
              <h4>카테고리별 비중</h4>
              {['deposit','equipment','material','marketing'].map(cat => {
                const catLabel = { deposit: '보증금', equipment: '장비', material: '재료', marketing: '마케팅' }[cat];
                const catColor = { deposit: '#ef4444', equipment: '#3b82f6', material: '#22c55e', marketing: '#f59e0b' }[cat];
                const total = finance.initialCosts.filter(c => c.category === cat).reduce((s, c) => s + c.amount, 0);
                const pct = totalInitial > 0 ? ((total / totalInitial) * 100) : 0;
                return (
                  <div key={cat} className="cat-row">
                    <span className="cat-row-label"><span className="legend-dot" style={{ background: catColor }}></span>{catLabel}</span>
                    <div className="cat-row-bar"><div style={{ width: `${pct}%`, background: catColor, height: '100%', borderRadius: 4 }}></div></div>
                    <span className="cat-row-val">{fmt(total)}원 ({pct.toFixed(1)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== 계약 정보 탭 ========== */}
      {tab === 'contract' && (
        <div className="fin-contract">
          <div className="contract-card">
            <h3><BookOpen size={18} /> 임대차 계약 정보</h3>
            <div className="contract-grid">
              <div className="cg-item">
                <span className="cg-label">위치</span>
                <span className="cg-value">{finance.contractInfo.location}</span>
              </div>
              <div className="cg-item">
                <span className="cg-label">보증금</span>
                <span className="cg-value">{fmt(finance.contractInfo.deposit)}원</span>
              </div>
              <div className="cg-item">
                <span className="cg-label">월세</span>
                <span className="cg-value">{fmt(finance.contractInfo.monthlyRent)}원</span>
              </div>
              <div className="cg-item">
                <span className="cg-label">관리비</span>
                <span className="cg-value">{fmt(finance.contractInfo.maintenance)}원</span>
              </div>
              <div className="cg-item">
                <span className="cg-label">월 임대 총비용</span>
                <span className="cg-value highlight">{fmt(finance.contractInfo.monthlyRent + finance.contractInfo.maintenance)}원</span>
              </div>
              <div className="cg-item">
                <span className="cg-label">계약 기간</span>
                <span className="cg-value">{finance.contractInfo.contractYears}년</span>
              </div>
              <div className="cg-item">
                <span className="cg-label">계약 시작일</span>
                <span className="cg-value">{finance.contractInfo.startDate}</span>
              </div>
              <div className="cg-item">
                <span className="cg-label">계약 종료일</span>
                <span className="cg-value">{finance.contractInfo.endDate}</span>
              </div>
            </div>
          </div>

          <div className="contract-card">
            <h3><Calculator size={18} /> 임대료 시뮬레이션</h3>
            <table className="contract-table">
              <thead><tr><th>항목</th><th className="r">월</th><th className="r">연간</th><th className="r">2년 (계약기간)</th></tr></thead>
              <tbody>
                <tr>
                  <td>월세</td>
                  <td className="r">{fmt(finance.contractInfo.monthlyRent)}</td>
                  <td className="r">{fmt(finance.contractInfo.monthlyRent * 12)}</td>
                  <td className="r">{fmt(finance.contractInfo.monthlyRent * 24)}</td>
                </tr>
                <tr>
                  <td>관리비</td>
                  <td className="r">{fmt(finance.contractInfo.maintenance)}</td>
                  <td className="r">{fmt(finance.contractInfo.maintenance * 12)}</td>
                  <td className="r">{fmt(finance.contractInfo.maintenance * 24)}</td>
                </tr>
                <tr className="total-row">
                  <td><strong>합계</strong></td>
                  <td className="r"><strong>{fmt(finance.contractInfo.monthlyRent + finance.contractInfo.maintenance)}</strong></td>
                  <td className="r"><strong>{fmt((finance.contractInfo.monthlyRent + finance.contractInfo.maintenance) * 12)}</strong></td>
                  <td className="r"><strong>{fmt((finance.contractInfo.monthlyRent + finance.contractInfo.maintenance) * 24)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .fin { max-width: 1200px; }
        .page-header { margin-bottom: 20px; }
        .page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .page-header p { color: var(--text-light); font-size: 14px; }

        .fin-tabs {
          display: flex; gap: 4px; margin-bottom: 24px;
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 4px; overflow-x: auto;
        }
        .fin-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 500; color: var(--text);
          white-space: nowrap; transition: all 0.15s;
        }
        .fin-tab:hover { background: var(--bg); color: var(--text-dark); }
        .fin-tab.active { background: var(--primary); color: white; }

        /* Overview */
        .ov-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
        .ov-stat { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow-sm); }
        .ov-stat.blue { border-left: 4px solid #3b82f6; }
        .ov-stat.orange { border-left: 4px solid #f97316; }
        .ov-stat.green { border-left: 4px solid #16a34a; }
        .ov-stat.red { border-left: 4px solid #ef4444; }
        .ov-stat.purple { border-left: 4px solid #8b5cf6; }
        .ov-label { font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
        .ov-val { font-size: 20px; font-weight: 700; color: var(--text-dark); }

        .ov-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 20px; box-shadow: var(--shadow-sm); }
        .ov-card h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .ov-table-wrap { overflow-x: auto; }
        .ov-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ov-table th { padding: 10px 12px; border-bottom: 2px solid var(--border); font-weight: 600; color: var(--text-light); text-align: left; font-size: 12px; }
        .ov-table td { padding: 10px 12px; border-bottom: 1px solid var(--border-light); }
        .ov-table .r { text-align: right; font-variant-numeric: tabular-nums; }
        .ov-table th.r { text-align: right; }
        .ov-table .pos { color: #16a34a; }
        .ov-table .neg { color: #ef4444; }
        .ov-table tr.selected { background: #eff6ff; }
        .ov-table tr:hover { background: var(--border-light); cursor: pointer; }
        .ov-table tfoot td { border-top: 2px solid var(--border); font-size: 14px; }
        .month-cell { font-weight: 600; color: var(--text-dark); }
        .status-dot { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
        .status-dot.empty { background: #f1f5f9; color: #94a3b8; }
        .status-dot.profit { background: #dcfce7; color: #16a34a; }
        .status-dot.loss { background: #fef2f2; color: #ef4444; }
        .ov-hint { font-size: 12px; color: var(--text-light); margin-top: 12px; text-align: center; }

        /* Bar chart */
        .bar-chart { display: flex; gap: 8px; align-items: flex-end; height: 180px; padding: 0 4px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
        .bar-bars { display: flex; gap: 3px; align-items: flex-end; height: 150px; width: 100%; }
        .bar { flex: 1; border-radius: 3px 3px 0 0; min-height: 2px; transition: height 0.3s; }
        .rev-bar { background: #3b82f6; }
        .exp-bar { background: #f97316; }
        .bar-label { font-size: 11px; color: var(--text-light); }
        .bar-legend { display: flex; gap: 16px; justify-content: center; margin-top: 12px; font-size: 12px; color: var(--text); }
        .legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; margin-right: 4px; vertical-align: middle; }
        .legend-dot.rev { background: #3b82f6; }
        .legend-dot.exp { background: #f97316; }

        .tax-card { background: linear-gradient(135deg,#f0fdf4,#dcfce7); border: 1px solid #86efac; border-radius: var(--radius); padding: 24px; display: flex; align-items: flex-start; gap: 16px; }
        .tax-card svg { color: #16a34a; flex-shrink: 0; }
        .tax-card h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
        .tax-card p { font-size: 13px; color: var(--text); margin-bottom: 4px; }
        .tax-big strong { color: #16a34a; font-size: 18px; }

        /* Ledger */
        .ledger-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 20px; }
        .ledger-nav button { padding: 8px; border-radius: 8px; color: var(--text); border: 1px solid var(--border); background: var(--bg-card); }
        .ledger-nav button:disabled { opacity: 0.3; cursor: not-allowed; }
        .ledger-nav h2 { font-size: 22px; font-weight: 700; color: var(--text-dark); min-width: 140px; text-align: center; }

        .ledger-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
        .ls-card { background: var(--bg-card); border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow-sm); }
        .ls-card.blue { border-top: 3px solid #3b82f6; }
        .ls-card.orange { border-top: 3px solid #f97316; }
        .ls-card.green { border-top: 3px solid #16a34a; }
        .ls-card.red { border-top: 3px solid #ef4444; }
        .ls-card.gray { border-top: 3px solid #6b7280; }
        .ls-label { font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
        .ls-val { font-size: 20px; font-weight: 700; color: var(--text-dark); }
        .ls-sub { font-size: 11px; color: var(--text-light); margin-top: 4px; }

        .ledger-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .ledger-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); }
        .ledger-card.full { grid-column: 1 / -1; }
        .lc-title { font-size: 15px; font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
        .revenue-title { color: #3b82f6; }
        .expense-title { color: #f97316; }

        .ledger-table { width: 100%; border-collapse: collapse; }
        .ledger-table th { font-size: 11px; font-weight: 600; color: var(--text-light); padding: 8px 6px; border-bottom: 2px solid var(--border); text-align: left; }
        .ledger-table th.r { text-align: right; }
        .ledger-table td { padding: 6px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .ledger-table td .cat-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; vertical-align: middle; }
        .ledger-table .total-row td { border-top: 2px solid var(--border); font-size: 14px; }
        .ledger-table .r { text-align: right; }
        .text-muted { color: var(--text-light); }
        .pct-cell { font-size: 12px; color: var(--text-light); min-width: 50px; }

        .ledger-input {
          width: 100%; max-width: 140px; padding: 5px 8px; border: 1px solid var(--border); border-radius: 6px;
          font-size: 13px; text-align: right; font-variant-numeric: tabular-nums;
          transition: border-color 0.15s;
        }
        .ledger-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }
        .ledger-input.sm { max-width: 80px; }

        .ratio-bar-section { margin-top: 16px; }
        .ratio-title { font-size: 12px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .ratio-bar { display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: var(--border-light); }
        .ratio-seg { height: 100%; min-width: 2px; }
        .ratio-legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; font-size: 11px; color: var(--text); }

        .ledger-memo { width: 100%; min-height: 80px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; resize: vertical; line-height: 1.6; }
        .ledger-memo:focus { outline: none; border-color: var(--primary); }

        /* Waterfall */
        .waterfall { display: flex; flex-direction: column; gap: 10px; }
        .wf-row { display: grid; grid-template-columns: 130px 1fr 130px; align-items: center; gap: 10px; }
        .wf-row.wf-total { padding-top: 10px; border-top: 2px solid var(--border); margin-top: 4px; }
        .wf-name { font-size: 13px; color: var(--text); }
        .wf-bar-track { height: 20px; background: var(--border-light); border-radius: 4px; overflow: hidden; }
        .wf-bar-fill { height: 100%; border-radius: 4px; min-width: 2px; transition: width 0.3s; }
        .wf-rev { background: #3b82f6; }
        .wf-profit { background: #16a34a; }
        .wf-loss { background: #ef4444; }
        .wf-amt { font-size: 13px; font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
        .wf-amt.neg { color: #ef4444; }

        /* Fixed costs */
        .fixed-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
        .fixed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .fixed-header h3 { font-size: 18px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 8px; }
        .fixed-total { font-size: 14px; color: var(--text-light); }
        .fixed-total strong { color: var(--text-dark); font-size: 16px; }

        .fixed-table, .initial-table, .contract-table { width: 100%; border-collapse: collapse; }
        .fixed-table th, .initial-table th, .contract-table th { font-size: 12px; font-weight: 600; color: var(--text-light); padding: 10px 8px; border-bottom: 2px solid var(--border); text-align: left; }
        .fixed-table th.r, .initial-table th.r, .contract-table th.r { text-align: right; }
        .fixed-table td, .initial-table td, .contract-table td { padding: 12px 8px; border-bottom: 1px solid var(--border-light); font-size: 14px; }
        .fixed-table .r, .initial-table .r, .contract-table .r { text-align: right; }
        .fixed-name { font-weight: 500; color: var(--text-dark); }
        .fixed-cat { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: var(--border-light); color: var(--text); }
        .fixed-amount { cursor: pointer; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--text-dark); display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
        .fixed-amount svg { color: var(--text-light); }
        .fixed-pct { font-size: 12px; color: var(--text-light); text-align: right; }
        .fixed-input { width: 120px; padding: 6px 10px; border: 2px solid var(--primary); border-radius: 6px; font-size: 14px; text-align: right; font-weight: 600; }
        .total-row td { border-top: 2px solid var(--border); }

        .fixed-breakdown { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light); }
        .fixed-breakdown h4 { font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 12px; }

        .fixed-info { display: flex; align-items: center; gap: 10px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: var(--radius-sm); font-size: 13px; color: #92400e; }

        /* Initial */
        .initial-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm); }
        .initial-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .initial-header h3 { font-size: 18px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 8px; }
        .initial-total { font-size: 14px; color: var(--text-light); }
        .initial-total strong { color: var(--text-dark); font-size: 16px; }
        .note-cell { font-size: 12px; color: var(--text-light); max-width: 200px; }

        .cat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .cat-row-label { font-size: 13px; min-width: 80px; display: flex; align-items: center; gap: 6px; }
        .cat-row-bar { flex: 1; height: 10px; background: var(--border-light); border-radius: 5px; overflow: hidden; }
        .cat-row-val { font-size: 12px; color: var(--text); min-width: 140px; text-align: right; font-variant-numeric: tabular-nums; }

        /* Contract */
        .contract-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
        .contract-card h3 { font-size: 18px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .contract-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .cg-item { padding: 14px; background: var(--bg); border-radius: var(--radius-sm); }
        .cg-label { display: block; font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; }
        .cg-value { font-size: 16px; font-weight: 600; color: var(--text-dark); }
        .cg-value.highlight { color: var(--primary); font-size: 18px; }

        @media (max-width: 1024px) {
          .ov-stats, .ledger-summary { grid-template-columns: repeat(2, 1fr); }
          .ledger-grid { grid-template-columns: 1fr; }
          .contract-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .ov-stats, .ledger-summary { grid-template-columns: 1fr; }
          .contract-grid { grid-template-columns: 1fr; }
          .wf-row { grid-template-columns: 100px 1fr 100px; }
          .fin-tabs { gap: 2px; padding: 3px; }
          .fin-tab { padding: 8px 10px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
