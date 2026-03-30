import { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, Calculator, Sun, Cloud, CloudRain, CloudSnow,
  Megaphone, Users, Receipt, Plus, Trash2, Target, Zap, ThermometerSun,
  CalendarDays, DollarSign, PieChart, AlertTriangle, CheckCircle2, Info,
  ArrowUpRight, ArrowDownRight, Clock, Percent,
} from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const pct = (n) => (n * 100).toFixed(1);
const today = () => new Date().toISOString().split('T')[0];

/* ================================================================
   ANALYTICS — 종합 분석 센터
   ================================================================ */
export default function Analytics({
  dailyLogs, ledger, finance, menus, costData,
  promotions, setPromotions,
  weatherLogs, setWeatherLogs,
  customerData, setCustomerData,
}) {
  const [tab, setTab] = useState('breakeven');

  /* ── local states ── */
  const [timeSlotLogs, setTimeSlotLogs] = useState([]);

  const tabs = [
    { id: 'breakeven',    label: '손익분기점',       icon: Target },
    { id: 'timeAnalysis', label: '시간대별 분석',    icon: Clock },
    { id: 'promoROI',     label: '프로모션 ROI',     icon: Megaphone },
    { id: 'weather',      label: '날씨 수요',        icon: ThermometerSun },
    { id: 'customer',     label: '고객 분석',        icon: Users },
    { id: 'tax',          label: '세금 시뮬레이터',  icon: Receipt },
  ];

  return (
    <div className="ana">
      <div className="page-header">
        <h1>분석 센터</h1>
        <p>배달 전문점 종합 경영 분석 대시보드</p>
      </div>

      {/* ── Tab Bar ── */}
      <div className="ana-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`ana-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {tab === 'breakeven'    && <BreakEvenTab finance={finance} dailyLogs={dailyLogs} />}
      {tab === 'timeAnalysis' && <TimeAnalysisTab logs={timeSlotLogs} setLogs={setTimeSlotLogs} />}
      {tab === 'promoROI'     && <PromotionROITab promotions={promotions} setPromotions={setPromotions} />}
      {tab === 'weather'      && <WeatherDemandTab weatherLogs={weatherLogs} setWeatherLogs={setWeatherLogs} />}
      {tab === 'customer'     && <CustomerAnalysisTab customerData={customerData} setCustomerData={setCustomerData} />}
      {tab === 'tax'          && <TaxSimulatorTab ledger={ledger} />}

      <style>{analyticsCSS}</style>
    </div>
  );
}

/* ================================================================
   TAB 1: 손익분기점 (BreakEven)
   ================================================================ */
function BreakEvenTab({ finance, dailyLogs }) {
  const fixedItems = finance?.monthlyFixed || [];
  const defaultTotal = fixedItems.reduce((s, c) => s + c.amount, 0);

  const [editableFixed, setEditableFixed] = useState(
    fixedItems.map(f => ({ ...f }))
  );
  const [avgPrice, setAvgPrice] = useState(finance?.assumptions?.avgOrderPrice || 12000);
  const [costRate, setCostRate] = useState((finance?.assumptions?.avgCostRate || 0.32) * 100);
  const [platformFee, setPlatformFee] = useState((finance?.assumptions?.platformFeeRate || 0.10) * 100);
  const [deliveryFee, setDeliveryFee] = useState(finance?.assumptions?.deliveryFeePerOrder || 3500);

  const monthlyFixed = editableFixed.reduce((s, c) => s + c.amount, 0);

  const updateFixedItem = (id, value) => {
    setEditableFixed(prev => prev.map(f => f.id === id ? { ...f, amount: Number(value) || 0 } : f));
  };

  /* BEP calculation */
  const marginPerOrder = avgPrice * (1 - costRate / 100 - platformFee / 100) - deliveryFee;
  const bepOrdersDay = marginPerOrder > 0 ? monthlyFixed / marginPerOrder / 30 : Infinity;
  const bepOrdersMonth = bepOrdersDay * 30;
  const bepRevenueMonth = bepOrdersMonth * avgPrice;

  /* Current daily orders (from dailyLogs, last 7 days average) */
  const recentLogs = (dailyLogs || []).slice(-7);
  const currentDailyOrders = recentLogs.length > 0
    ? recentLogs.reduce((s, d) => s + Object.values(d.orders || {}).reduce((a, b) => a + Number(b || 0), 0), 0) / recentLogs.length
    : 0;

  const isAboveBep = currentDailyOrders >= bepOrdersDay;

  /* Sensitivity table */
  const prices = [avgPrice - 1000, avgPrice, avgPrice + 1000];
  const rates = [costRate - 5, costRate, costRate + 5];

  return (
    <div className="tab-content">
      <div className="ana-grid-2">
        {/* Input section */}
        <div className="ana-card">
          <h3 className="ana-card-title"><Calculator size={16} /> 고정비 항목</h3>
          <div className="fixed-list">
            {editableFixed.map(f => (
              <div key={f.id} className="fixed-row">
                <span className="fixed-name">{f.name}</span>
                <div className="fixed-input-wrap">
                  <input
                    type="number"
                    value={f.amount}
                    onChange={e => updateFixedItem(f.id, e.target.value)}
                    className="ana-input sm"
                  />
                  <span className="unit">원</span>
                </div>
              </div>
            ))}
            <div className="fixed-total">
              <span>월 고정비 합계</span>
              <strong>{fmt(monthlyFixed)}원</strong>
            </div>
          </div>

          <div className="slider-section">
            <div className="slider-group">
              <label>평균 판매가: <strong>{fmt(avgPrice)}원</strong></label>
              <input type="range" min={8000} max={20000} step={500} value={avgPrice}
                onChange={e => setAvgPrice(Number(e.target.value))} />
              <div className="slider-range"><span>8,000</span><span>20,000</span></div>
            </div>
            <div className="slider-group">
              <label>평균 원가율: <strong>{costRate}%</strong></label>
              <input type="range" min={20} max={50} step={1} value={costRate}
                onChange={e => setCostRate(Number(e.target.value))} />
              <div className="slider-range"><span>20%</span><span>50%</span></div>
            </div>
            <div className="slider-group">
              <label>플랫폼 수수료율: <strong>{platformFee}%</strong></label>
              <input type="range" min={0} max={15} step={0.5} value={platformFee}
                onChange={e => setPlatformFee(Number(e.target.value))} />
              <div className="slider-range"><span>0%</span><span>15%</span></div>
            </div>
            <div className="slider-group">
              <label>건당 배달비: <strong>{fmt(deliveryFee)}원</strong></label>
              <input type="number" value={deliveryFee}
                onChange={e => setDeliveryFee(Number(e.target.value) || 0)}
                className="ana-input" />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="ana-card">
          <h3 className="ana-card-title"><Target size={16} /> 손익분기점 결과</h3>

          {marginPerOrder <= 0 ? (
            <div className="ana-alert danger">
              <AlertTriangle size={16} />
              <span>건당 마진이 음수입니다. 가격 또는 비용 구조를 조정하세요.</span>
            </div>
          ) : (
            <>
              <div className="bep-cards">
                <div className="bep-card">
                  <p className="bep-label">BEP 일 주문수</p>
                  <p className="bep-value">{Math.ceil(bepOrdersDay)}건</p>
                  <p className="bep-sub">/ 일</p>
                </div>
                <div className="bep-card">
                  <p className="bep-label">BEP 월 매출</p>
                  <p className="bep-value">{fmt(Math.round(bepRevenueMonth))}원</p>
                  <p className="bep-sub">/ 월</p>
                </div>
                <div className="bep-card">
                  <p className="bep-label">건당 마진</p>
                  <p className="bep-value">{fmt(Math.round(marginPerOrder))}원</p>
                  <p className="bep-sub">주문 1건당 순이익</p>
                </div>
              </div>

              {/* Bar: current vs BEP */}
              <div className="bep-bar-section">
                <p className="bep-bar-label">현재 vs 손익분기점</p>
                <div className="bep-bar-wrap">
                  <div className="bep-bar-bg">
                    <div
                      className={`bep-bar-fill ${isAboveBep ? 'green' : 'red'}`}
                      style={{ width: `${Math.min((currentDailyOrders / (bepOrdersDay || 1)) * 100, 100)}%` }}
                    />
                    <div
                      className="bep-marker"
                      style={{ left: `${Math.min(100, 100)}%` }}
                      title={`BEP: ${Math.ceil(bepOrdersDay)}건`}
                    />
                  </div>
                  <div className="bep-bar-labels">
                    <span>현재 {currentDailyOrders.toFixed(1)}건/일</span>
                    <span>BEP {Math.ceil(bepOrdersDay)}건/일</span>
                  </div>
                </div>
                <div className={`bep-msg ${isAboveBep ? 'green' : 'red'}`}>
                  {isAboveBep
                    ? `일 ${Math.ceil(bepOrdersDay)}건 이상 판매하면 흑자입니다 (현재 흑자 구간)`
                    : `일 ${Math.ceil(bepOrdersDay)}건 이상 판매하면 흑자입니다 (현재 ${(bepOrdersDay - currentDailyOrders).toFixed(0)}건 부족)`
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sensitivity Table */}
      {marginPerOrder > 0 && (
        <div className="ana-card">
          <h3 className="ana-card-title"><BarChart3 size={16} /> 민감도 분석표 (일 BEP 주문수)</h3>
          <div className="ana-table-wrap">
            <table className="ana-table">
              <thead>
                <tr>
                  <th>판매가 \ 원가율</th>
                  {rates.map(r => <th key={r}>{r}%</th>)}
                </tr>
              </thead>
              <tbody>
                {prices.map(p => (
                  <tr key={p}>
                    <td className="row-header">{fmt(p)}원</td>
                    {rates.map(r => {
                      const m = p * (1 - r / 100 - platformFee / 100) - deliveryFee;
                      const bep = m > 0 ? Math.ceil(monthlyFixed / m / 30) : '-';
                      const isCurrent = p === avgPrice && r === costRate;
                      return (
                        <td key={r} className={isCurrent ? 'current-cell' : ''}>
                          {bep === '-' ? '불가' : `${bep}건`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TAB 2: 시간대별 분석 (TimeAnalysis)
   ================================================================ */
function TimeAnalysisTab({ logs, setLogs }) {
  const [form, setForm] = useState({
    date: today(),
    lunch: '', afternoon: '', dinner: '', night: '', other: '',
  });

  const slotLabels = {
    lunch: '11-13시 (점심)',
    afternoon: '13-17시 (오후)',
    dinner: '17-20시 (저녁)',
    night: '20-24시 (야간)',
    other: '0-11시 (기타)',
  };

  const slotKeys = ['lunch', 'afternoon', 'dinner', 'night', 'other'];

  const handleSave = () => {
    if (!form.date) return;
    const entry = {
      id: 'ts_' + Date.now(),
      date: form.date,
      slots: {
        lunch: Number(form.lunch) || 0,
        afternoon: Number(form.afternoon) || 0,
        dinner: Number(form.dinner) || 0,
        night: Number(form.night) || 0,
        other: Number(form.other) || 0,
      },
    };
    setLogs(prev => [...prev, entry]);
    setForm({ date: today(), lunch: '', afternoon: '', dinner: '', night: '', other: '' });
  };

  const deleteLog = (id) => setLogs(prev => prev.filter(l => l.id !== id));

  /* Analysis */
  const avgBySlot = useMemo(() => {
    if (logs.length === 0) return null;
    const sums = { lunch: 0, afternoon: 0, dinner: 0, night: 0, other: 0 };
    logs.forEach(l => {
      slotKeys.forEach(k => { sums[k] += l.slots[k]; });
    });
    const avgs = {};
    slotKeys.forEach(k => { avgs[k] = sums[k] / logs.length; });
    return avgs;
  }, [logs]);

  const peakSlot = avgBySlot
    ? slotKeys.reduce((a, b) => (avgBySlot[a] > avgBySlot[b] ? a : b))
    : null;
  const lowSlot = avgBySlot
    ? slotKeys.reduce((a, b) => (avgBySlot[a] < avgBySlot[b] ? a : b))
    : null;

  const maxAvg = avgBySlot ? Math.max(...Object.values(avgBySlot), 1) : 1;

  /* Weekday vs Weekend */
  const weekdayWeekend = useMemo(() => {
    if (logs.length < 3) return null;
    const wd = { count: 0, total: 0 };
    const we = { count: 0, total: 0 };
    logs.forEach(l => {
      const day = new Date(l.date).getDay();
      const total = Object.values(l.slots).reduce((s, v) => s + v, 0);
      if (day === 0 || day === 6) { we.count++; we.total += total; }
      else { wd.count++; wd.total += total; }
    });
    if (wd.count === 0 || we.count === 0) return null;
    return {
      weekday: Math.round(wd.total / wd.count),
      weekend: Math.round(we.total / we.count),
    };
  }, [logs]);

  return (
    <div className="tab-content">
      {/* Input form */}
      <div className="ana-card">
        <h3 className="ana-card-title"><CalendarDays size={16} /> 시간대별 주문수 입력</h3>
        <div className="time-form">
          <div className="time-form-row">
            <label>날짜</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="ana-input" />
          </div>
          {slotKeys.map(k => (
            <div key={k} className="time-form-row">
              <label>{slotLabels[k]}</label>
              <input
                type="number" placeholder="0" min={0}
                value={form[k]}
                onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                className="ana-input sm"
              />
            </div>
          ))}
          <button className="ana-btn primary" onClick={handleSave}>
            <Plus size={15} /> 저장
          </button>
        </div>
      </div>

      {/* Data log */}
      {logs.length > 0 && (
        <div className="ana-card">
          <h3 className="ana-card-title"><BarChart3 size={16} /> 입력 데이터 ({logs.length}일)</h3>
          <div className="ana-table-wrap">
            <table className="ana-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  {slotKeys.map(k => <th key={k}>{slotLabels[k].split(' ')[0]}</th>)}
                  <th>합계</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.slice().reverse().map(l => {
                  const total = Object.values(l.slots).reduce((s, v) => s + v, 0);
                  return (
                    <tr key={l.id}>
                      <td>{l.date}</td>
                      {slotKeys.map(k => <td key={k}>{l.slots[k]}</td>)}
                      <td><strong>{total}</strong></td>
                      <td>
                        <button className="ana-btn-icon danger" onClick={() => deleteLog(l.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis */}
      {avgBySlot && (
        <div className="ana-grid-2">
          <div className="ana-card">
            <h3 className="ana-card-title"><BarChart3 size={16} /> 시간대별 평균 주문수</h3>
            <div className="h-bar-chart">
              {slotKeys.map(k => (
                <div key={k} className="h-bar-row">
                  <span className="h-bar-label">{slotLabels[k]}</span>
                  <div className="h-bar-track">
                    <div
                      className={`h-bar-fill ${k === peakSlot ? 'peak' : k === lowSlot ? 'low' : ''}`}
                      style={{ width: `${(avgBySlot[k] / maxAvg) * 100}%` }}
                    />
                  </div>
                  <span className="h-bar-val">{avgBySlot[k].toFixed(1)}건</span>
                </div>
              ))}
            </div>

            <div className="time-insights">
              <div className="insight peak">
                <Zap size={15} />
                <span>피크 타임: <strong>{slotLabels[peakSlot]}</strong> (평균 {avgBySlot[peakSlot].toFixed(1)}건)</span>
              </div>
              <div className="insight low">
                <AlertTriangle size={15} />
                <span>비수기: <strong>{slotLabels[lowSlot]}</strong> — 할인 이벤트를 고려하세요</span>
              </div>
            </div>
          </div>

          {weekdayWeekend && (
            <div className="ana-card">
              <h3 className="ana-card-title"><CalendarDays size={16} /> 평일 vs 주말</h3>
              <div className="wd-we-compare">
                <div className="wd-we-card">
                  <p className="wd-we-label">평일 평균</p>
                  <p className="wd-we-val">{weekdayWeekend.weekday}건</p>
                </div>
                <div className="wd-we-card">
                  <p className="wd-we-label">주말 평균</p>
                  <p className="wd-we-val">{weekdayWeekend.weekend}건</p>
                </div>
              </div>
              <div className="wd-we-diff">
                {weekdayWeekend.weekend > weekdayWeekend.weekday
                  ? `주말이 평일 대비 ${Math.round(((weekdayWeekend.weekend - weekdayWeekend.weekday) / weekdayWeekend.weekday) * 100)}% 많습니다`
                  : weekdayWeekend.weekday > weekdayWeekend.weekend
                    ? `평일이 주말 대비 ${Math.round(((weekdayWeekend.weekday - weekdayWeekend.weekend) / weekdayWeekend.weekend) * 100)}% 많습니다`
                    : '평일과 주말이 비슷합니다'
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TAB 3: 프로모션 ROI (PromotionROI)
   ================================================================ */
function PromotionROITab({ promotions, setPromotions }) {
  const promos = promotions || [];
  const [form, setForm] = useState({
    name: '', platform: '배달의민족', type: 'coupon',
    startDate: today(), endDate: today(),
    cost: '', ordersBefore: '', ordersAfter: '',
    revenueBefore: '', revenueAfter: '', memo: '',
  });
  const [showForm, setShowForm] = useState(false);

  const typeLabels = { coupon: '쿠폰', ad: '광고', event: '이벤트' };
  const platformOptions = ['배달의민족', '쿠팡이츠', '요기요', '자체', '기타'];

  const handleAdd = () => {
    if (!form.name || !form.cost) return;
    const promo = {
      id: 'promo_' + Date.now(),
      name: form.name,
      platform: form.platform,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      cost: Number(form.cost) || 0,
      ordersBefore: Number(form.ordersBefore) || 0,
      ordersAfter: Number(form.ordersAfter) || 0,
      revenueBefore: Number(form.revenueBefore) || 0,
      revenueAfter: Number(form.revenueAfter) || 0,
      memo: form.memo,
    };
    setPromotions(prev => [...(prev || []), promo]);
    setForm({ name: '', platform: '배달의민족', type: 'coupon', startDate: today(), endDate: today(), cost: '', ordersBefore: '', ordersAfter: '', revenueBefore: '', revenueAfter: '', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setPromotions(prev => (prev || []).filter(p => p.id !== id));
  };

  /* Summary */
  const totalSpend = promos.reduce((s, p) => s + p.cost, 0);
  const totalAddRev = promos.reduce((s, p) => s + (p.revenueAfter - p.revenueBefore), 0);
  const overallROI = totalSpend > 0 ? ((totalAddRev - totalSpend) / totalSpend) * 100 : 0;

  return (
    <div className="tab-content">
      {/* Summary */}
      {promos.length > 0 && (
        <div className="ana-card">
          <h3 className="ana-card-title"><PieChart size={16} /> 프로모션 종합</h3>
          <div className="promo-summary">
            <div className="promo-sum-item">
              <p className="psi-label">총 프로모션 비용</p>
              <p className="psi-val">{fmt(totalSpend)}원</p>
            </div>
            <div className="promo-sum-item">
              <p className="psi-label">총 추가 매출</p>
              <p className="psi-val">{fmt(totalAddRev)}원</p>
            </div>
            <div className={`promo-sum-item ${overallROI >= 0 ? 'positive' : 'negative'}`}>
              <p className="psi-label">종합 ROI</p>
              <p className="psi-val">{overallROI.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <button className="ana-btn primary full-w" onClick={() => setShowForm(true)}>
          <Plus size={15} /> 프로모션 추가
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="ana-card">
          <h3 className="ana-card-title"><Plus size={16} /> 프로모션 등록</h3>
          <div className="promo-form">
            <div className="pf-row">
              <div className="pf-field">
                <label>프로모션명</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="ana-input" placeholder="예: 3000원 할인 쿠폰" />
              </div>
              <div className="pf-field">
                <label>플랫폼</label>
                <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} className="ana-input">
                  {platformOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="pf-field">
                <label>유형</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="ana-input">
                  <option value="coupon">쿠폰</option>
                  <option value="ad">광고</option>
                  <option value="event">이벤트</option>
                </select>
              </div>
            </div>
            <div className="pf-row">
              <div className="pf-field">
                <label>시작일</label>
                <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="ana-input" />
              </div>
              <div className="pf-field">
                <label>종료일</label>
                <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="ana-input" />
              </div>
              <div className="pf-field">
                <label>비용 (원)</label>
                <input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
            </div>
            <div className="pf-row">
              <div className="pf-field">
                <label>프로모션 전 일 주문수</label>
                <input type="number" value={form.ordersBefore} onChange={e => setForm(p => ({ ...p, ordersBefore: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
              <div className="pf-field">
                <label>프로모션 후 일 주문수</label>
                <input type="number" value={form.ordersAfter} onChange={e => setForm(p => ({ ...p, ordersAfter: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
            </div>
            <div className="pf-row">
              <div className="pf-field">
                <label>프로모션 전 일 매출</label>
                <input type="number" value={form.revenueBefore} onChange={e => setForm(p => ({ ...p, revenueBefore: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
              <div className="pf-field">
                <label>프로모션 후 일 매출</label>
                <input type="number" value={form.revenueAfter} onChange={e => setForm(p => ({ ...p, revenueAfter: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
            </div>
            <div className="pf-row">
              <div className="pf-field full">
                <label>메모</label>
                <input type="text" value={form.memo} onChange={e => setForm(p => ({ ...p, memo: e.target.value }))} className="ana-input" placeholder="특이사항 기록" />
              </div>
            </div>
            <div className="pf-actions">
              <button className="ana-btn primary" onClick={handleAdd}><Plus size={15} /> 등록</button>
              <button className="ana-btn ghost" onClick={() => setShowForm(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* Promo cards */}
      {promos.length === 0 ? (
        <div className="ana-empty">등록된 프로모션이 없습니다. 프로모션을 추가하세요.</div>
      ) : (
        <div className="promo-cards">
          {promos.map(p => {
            const addOrders = p.ordersAfter - p.ordersBefore;
            const addRevenue = p.revenueAfter - p.revenueBefore;
            const roi = p.cost > 0 ? ((addRevenue - p.cost) / p.cost) * 100 : 0;
            const cac = addOrders > 0 ? Math.round(p.cost / addOrders) : 0;
            const isPositive = roi >= 0;
            return (
              <div key={p.id} className={`promo-card ${isPositive ? 'positive' : 'negative'}`}>
                <div className="pc-header">
                  <div>
                    <h4 className="pc-name">{p.name}</h4>
                    <div className="pc-meta">
                      <span className="pc-badge">{p.platform}</span>
                      <span className="pc-badge type">{typeLabels[p.type]}</span>
                      <span className="pc-dates">{p.startDate} ~ {p.endDate}</span>
                    </div>
                  </div>
                  <button className="ana-btn-icon danger" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="pc-metrics">
                  <div className="pc-metric">
                    <span className="pcm-label">추가 주문</span>
                    <span className={`pcm-val ${addOrders >= 0 ? 'up' : 'down'}`}>
                      {addOrders >= 0 ? '+' : ''}{addOrders}건
                    </span>
                  </div>
                  <div className="pc-metric">
                    <span className="pcm-label">추가 매출</span>
                    <span className={`pcm-val ${addRevenue >= 0 ? 'up' : 'down'}`}>
                      {addRevenue >= 0 ? '+' : ''}{fmt(addRevenue)}원
                    </span>
                  </div>
                  <div className="pc-metric">
                    <span className="pcm-label">ROI</span>
                    <span className={`pcm-val big ${isPositive ? 'up' : 'down'}`}>
                      {roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="pc-metric">
                    <span className="pcm-label">CAC</span>
                    <span className="pcm-val">{fmt(cac)}원/건</span>
                  </div>
                </div>
                {p.memo && <p className="pc-memo">{p.memo}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TAB 4: 날씨 수요 (WeatherDemand)
   ================================================================ */
function WeatherDemandTab({ weatherLogs, setWeatherLogs }) {
  const logs = weatherLogs || [];
  const [form, setForm] = useState({
    date: today(), weather: 'sunny', temperature: '', orders: '', revenue: '',
  });

  const weatherOptions = [
    { value: 'sunny',  label: '맑음',  icon: '☀️' },
    { value: 'cloudy', label: '흐림',  icon: '⛅' },
    { value: 'rainy',  label: '비',    icon: '🌧️' },
    { value: 'snowy',  label: '눈',    icon: '🌨️' },
  ];

  const weatherLabel = (w) => weatherOptions.find(o => o.value === w)?.label || w;
  const weatherIcon = (w) => weatherOptions.find(o => o.value === w)?.icon || '';

  const handleAdd = () => {
    if (!form.orders) return;
    const entry = {
      id: 'wl_' + Date.now(),
      date: form.date,
      weather: form.weather,
      temperature: Number(form.temperature) || 0,
      orders: Number(form.orders) || 0,
      revenue: Number(form.revenue) || 0,
    };
    setWeatherLogs(prev => [...(prev || []), entry]);
    setForm({ date: today(), weather: 'sunny', temperature: '', orders: '', revenue: '' });
  };

  const handleDelete = (id) => {
    setWeatherLogs(prev => (prev || []).filter(l => l.id !== id));
  };

  /* Analysis */
  const avgByWeather = useMemo(() => {
    const groups = {};
    logs.forEach(l => {
      if (!groups[l.weather]) groups[l.weather] = { orders: 0, revenue: 0, count: 0 };
      groups[l.weather].orders += l.orders;
      groups[l.weather].revenue += l.revenue;
      groups[l.weather].count++;
    });
    const result = {};
    Object.keys(groups).forEach(w => {
      result[w] = {
        avgOrders: groups[w].orders / groups[w].count,
        avgRevenue: groups[w].revenue / groups[w].count,
        count: groups[w].count,
      };
    });
    return result;
  }, [logs]);

  const maxWeatherOrders = Math.max(...Object.values(avgByWeather).map(v => v.avgOrders), 1);

  /* Rainy vs Sunny insight */
  const rainyInsight = useMemo(() => {
    const sunny = avgByWeather['sunny'];
    const rainy = avgByWeather['rainy'];
    if (!sunny || !rainy) return null;
    const diff = ((rainy.avgOrders - sunny.avgOrders) / sunny.avgOrders) * 100;
    return { rainyAvg: rainy.avgOrders, diff };
  }, [avgByWeather]);

  /* Temperature ranges */
  const tempRanges = useMemo(() => {
    const ranges = [
      { label: '0-10도', min: -999, max: 10, orders: 0, count: 0 },
      { label: '10-20도', min: 10, max: 20, orders: 0, count: 0 },
      { label: '20-30도', min: 20, max: 30, orders: 0, count: 0 },
      { label: '30도+', min: 30, max: 999, orders: 0, count: 0 },
    ];
    logs.forEach(l => {
      const r = ranges.find(r => l.temperature >= r.min && l.temperature < r.max);
      if (r) { r.orders += l.orders; r.count++; }
    });
    return ranges.filter(r => r.count > 0).map(r => ({
      ...r, avg: r.orders / r.count,
    }));
  }, [logs]);

  const maxTempOrders = Math.max(...tempRanges.map(r => r.avg), 1);

  return (
    <div className="tab-content">
      {/* Form */}
      <div className="ana-card">
        <h3 className="ana-card-title"><ThermometerSun size={16} /> 날씨별 주문 기록</h3>
        <div className="weather-form">
          <div className="wf-row">
            <div className="wf-field">
              <label>날짜</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="ana-input" />
            </div>
            <div className="wf-field">
              <label>날씨</label>
              <select value={form.weather} onChange={e => setForm(p => ({ ...p, weather: e.target.value }))} className="ana-input">
                {weatherOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                ))}
              </select>
            </div>
            <div className="wf-field">
              <label>기온 (도)</label>
              <input type="number" value={form.temperature} onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))} className="ana-input" placeholder="25" />
            </div>
          </div>
          <div className="wf-row">
            <div className="wf-field">
              <label>주문수</label>
              <input type="number" value={form.orders} onChange={e => setForm(p => ({ ...p, orders: e.target.value }))} className="ana-input" placeholder="0" />
            </div>
            <div className="wf-field">
              <label>매출 (원)</label>
              <input type="number" value={form.revenue} onChange={e => setForm(p => ({ ...p, revenue: e.target.value }))} className="ana-input" placeholder="0" />
            </div>
            <div className="wf-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="ana-btn primary" onClick={handleAdd}><Plus size={15} /> 저장</button>
            </div>
          </div>
        </div>
      </div>

      {/* Data table */}
      {logs.length > 0 && (
        <div className="ana-card">
          <h3 className="ana-card-title"><BarChart3 size={16} /> 기록 데이터 ({logs.length}일)</h3>
          <div className="ana-table-wrap">
            <table className="ana-table">
              <thead>
                <tr>
                  <th>날짜</th><th>날씨</th><th>기온</th><th>주문</th><th>매출</th><th></th>
                </tr>
              </thead>
              <tbody>
                {logs.slice().reverse().map(l => (
                  <tr key={l.id}>
                    <td>{l.date}</td>
                    <td>{weatherIcon(l.weather)} {weatherLabel(l.weather)}</td>
                    <td>{l.temperature}도</td>
                    <td>{l.orders}건</td>
                    <td>{fmt(l.revenue)}원</td>
                    <td>
                      <button className="ana-btn-icon danger" onClick={() => handleDelete(l.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis */}
      {Object.keys(avgByWeather).length > 0 && (
        <div className="ana-grid-2">
          {/* By weather type */}
          <div className="ana-card">
            <h3 className="ana-card-title"><Cloud size={16} /> 날씨별 평균 주문수</h3>
            <div className="h-bar-chart">
              {weatherOptions.map(o => {
                const data = avgByWeather[o.value];
                if (!data) return null;
                return (
                  <div key={o.value} className="h-bar-row">
                    <span className="h-bar-label">{o.icon} {o.label}</span>
                    <div className="h-bar-track">
                      <div
                        className="h-bar-fill weather"
                        style={{ width: `${(data.avgOrders / maxWeatherOrders) * 100}%` }}
                      />
                    </div>
                    <span className="h-bar-val">{data.avgOrders.toFixed(1)}건</span>
                  </div>
                );
              })}
            </div>

            {rainyInsight && (
              <div className={`ana-insight ${rainyInsight.diff >= 0 ? 'up' : 'down'}`}>
                <Info size={15} />
                <span>
                  비 오는 날 평균 주문 {rainyInsight.rainyAvg.toFixed(1)}건
                  ({rainyInsight.diff >= 0 ? '+' : ''}{rainyInsight.diff.toFixed(1)}% vs 맑은 날)
                </span>
              </div>
            )}

            {avgByWeather['rainy'] && (
              <div className="ana-insight suggestion">
                <Zap size={15} />
                <span>내일 비 예보 시 식재료 {rainyInsight && rainyInsight.diff > 0 ? Math.round(rainyInsight.diff) : 20}% 추가 발주 권장</span>
              </div>
            )}
          </div>

          {/* By temperature */}
          {tempRanges.length > 0 && (
            <div className="ana-card">
              <h3 className="ana-card-title"><ThermometerSun size={16} /> 기온별 평균 주문수</h3>
              <div className="h-bar-chart">
                {tempRanges.map(r => (
                  <div key={r.label} className="h-bar-row">
                    <span className="h-bar-label">{r.label}</span>
                    <div className="h-bar-track">
                      <div
                        className="h-bar-fill temp"
                        style={{ width: `${(r.avg / maxTempOrders) * 100}%` }}
                      />
                    </div>
                    <span className="h-bar-val">{r.avg.toFixed(1)}건 ({r.count}일)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TAB 5: 고객 분석 (CustomerAnalysis)
   ================================================================ */
function CustomerAnalysisTab({ customerData, setCustomerData }) {
  const data = customerData || [];
  const [form, setForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    totalOrders: '', estimatedNew: '', estimatedReturning: '',
    avgOrderValue: '', topMenu: '',
  });
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!form.month || !form.totalOrders) return;
    const entry = {
      id: 'cd_' + Date.now(),
      month: form.month,
      totalOrders: Number(form.totalOrders) || 0,
      estimatedNew: Number(form.estimatedNew) || 0,
      estimatedReturning: Number(form.estimatedReturning) || 0,
      avgOrderValue: Number(form.avgOrderValue) || 0,
      topMenu: form.topMenu,
    };
    setCustomerData(prev => [...(prev || []), entry]);
    setForm({ month: new Date().toISOString().slice(0, 7), totalOrders: '', estimatedNew: '', estimatedReturning: '', avgOrderValue: '', topMenu: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setCustomerData(prev => (prev || []).filter(d => d.id !== id));
  };

  /* Sorted by month */
  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));

  /* Reorder rate max for chart */
  const reorderRates = sorted.map(d => d.totalOrders > 0 ? (d.estimatedReturning / d.totalOrders) * 100 : 0);

  /* Top menus ranking */
  const menuRanking = useMemo(() => {
    const counts = {};
    data.forEach(d => {
      if (d.topMenu) {
        counts[d.topMenu] = (counts[d.topMenu] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [data]);

  return (
    <div className="tab-content">
      {/* Add button */}
      {!showForm && (
        <button className="ana-btn primary full-w" onClick={() => setShowForm(true)}>
          <Plus size={15} /> 월별 고객 데이터 추가
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="ana-card">
          <h3 className="ana-card-title"><Plus size={16} /> 월별 고객 데이터 입력</h3>
          <div className="cust-form">
            <div className="cf-row">
              <div className="cf-field">
                <label>월</label>
                <input type="month" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} className="ana-input" />
              </div>
              <div className="cf-field">
                <label>총 주문수</label>
                <input type="number" value={form.totalOrders} onChange={e => setForm(p => ({ ...p, totalOrders: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
            </div>
            <div className="cf-row">
              <div className="cf-field">
                <label>추정 신규 고객 주문</label>
                <input type="number" value={form.estimatedNew} onChange={e => setForm(p => ({ ...p, estimatedNew: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
              <div className="cf-field">
                <label>추정 재주문 고객 주문</label>
                <input type="number" value={form.estimatedReturning} onChange={e => setForm(p => ({ ...p, estimatedReturning: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
            </div>
            <div className="cf-row">
              <div className="cf-field">
                <label>평균 주문 금액 (원)</label>
                <input type="number" value={form.avgOrderValue} onChange={e => setForm(p => ({ ...p, avgOrderValue: e.target.value }))} className="ana-input" placeholder="0" />
              </div>
              <div className="cf-field">
                <label>인기 메뉴 1위</label>
                <input type="text" value={form.topMenu} onChange={e => setForm(p => ({ ...p, topMenu: e.target.value }))} className="ana-input" placeholder="예: 소불고기 덮밥" />
              </div>
            </div>
            <div className="pf-actions">
              <button className="ana-btn primary" onClick={handleAdd}><Plus size={15} /> 등록</button>
              <button className="ana-btn ghost" onClick={() => setShowForm(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="ana-empty">월별 고객 데이터가 없습니다. 데이터를 추가하세요.</div>
      ) : (
        <>
          {/* Data table */}
          <div className="ana-card">
            <h3 className="ana-card-title"><Users size={16} /> 월별 데이터</h3>
            <div className="ana-table-wrap">
              <table className="ana-table">
                <thead>
                  <tr>
                    <th>월</th><th>총 주문</th><th>신규</th><th>재주문</th>
                    <th>재주문율</th><th>평균 금액</th><th>인기 메뉴</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(d => {
                    const rate = d.totalOrders > 0 ? (d.estimatedReturning / d.totalOrders) * 100 : 0;
                    return (
                      <tr key={d.id}>
                        <td>{d.month}</td>
                        <td>{d.totalOrders}건</td>
                        <td>{d.estimatedNew}건</td>
                        <td>{d.estimatedReturning}건</td>
                        <td className={rate >= 30 ? 'pos' : 'neg'}>{rate.toFixed(1)}%</td>
                        <td>{fmt(d.avgOrderValue)}원</td>
                        <td>{d.topMenu || '-'}</td>
                        <td>
                          <button className="ana-btn-icon danger" onClick={() => handleDelete(d.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="ana-grid-2">
            {/* Reorder rate trend */}
            <div className="ana-card">
              <h3 className="ana-card-title"><TrendingUp size={16} /> 재주문율 추이</h3>
              <div className="trend-chart">
                {sorted.map((d, i) => {
                  const rate = d.totalOrders > 0 ? (d.estimatedReturning / d.totalOrders) * 100 : 0;
                  return (
                    <div key={d.id} className="trend-col">
                      <div className="trend-bar-wrap">
                        <div
                          className={`trend-bar ${rate >= 30 ? 'good' : 'warn'}`}
                          style={{ height: `${Math.min(rate, 100)}%` }}
                        />
                        <div className="trend-target" style={{ bottom: '30%' }} title="목표: 30%" />
                      </div>
                      <span className="trend-val">{rate.toFixed(0)}%</span>
                      <span className="trend-label">{d.month.split('-')[1]}월</span>
                    </div>
                  );
                })}
              </div>
              {reorderRates.length > 0 && reorderRates[reorderRates.length - 1] >= 30 ? (
                <div className="ana-insight up">
                  <CheckCircle2 size={15} />
                  <span>재주문율 30% 이상이면 안정적 성장 구간입니다</span>
                </div>
              ) : (
                <div className="ana-insight down">
                  <AlertTriangle size={15} />
                  <span>재주문율 30% 미만 — 고객 만족도 개선이 필요합니다</span>
                </div>
              )}
            </div>

            {/* Average order value trend */}
            <div className="ana-card">
              <h3 className="ana-card-title"><DollarSign size={16} /> 평균 주문 금액 추이</h3>
              {(() => {
                const maxVal = Math.max(...sorted.map(d => d.avgOrderValue), 1);
                return (
                  <div className="trend-chart">
                    {sorted.map(d => (
                      <div key={d.id} className="trend-col">
                        <div className="trend-bar-wrap">
                          <div
                            className="trend-bar aov"
                            style={{ height: `${(d.avgOrderValue / maxVal) * 100}%` }}
                          />
                        </div>
                        <span className="trend-val">{(d.avgOrderValue / 1000).toFixed(0)}k</span>
                        <span className="trend-label">{d.month.split('-')[1]}월</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Top Menu Ranking */}
          {menuRanking.length > 0 && (
            <div className="ana-card">
              <h3 className="ana-card-title"><Target size={16} /> 인기 메뉴 랭킹</h3>
              <div className="menu-ranking">
                {menuRanking.map(([menu, count], i) => (
                  <div key={menu} className="rank-item">
                    <span className="rank-num">{i + 1}</span>
                    <span className="rank-name">{menu}</span>
                    <span className="rank-count">{count}회 1위</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================================================================
   TAB 6: 세금 시뮬레이터 (TaxSimulator)
   ================================================================ */
function TaxSimulatorTab({ ledger }) {
  const ledgerData = ledger || [];

  /* Annual totals from ledger */
  const annualRevenue = ledgerData.reduce((s, m) => {
    return s + Object.values(m.revenue || {}).reduce((a, b) => a + b, 0);
  }, 0);
  const annualExpense = ledgerData.reduce((s, m) => {
    return s + Object.values(m.expense || {}).reduce((a, b) => a + b, 0);
  }, 0);
  const taxableIncome = annualRevenue - annualExpense;

  /* Korean 2026 Income Tax Brackets */
  const brackets = [
    { limit: 14000000,   rate: 0.06, deduction: 0 },
    { limit: 50000000,   rate: 0.15, deduction: 1260000 },
    { limit: 88000000,   rate: 0.24, deduction: 5760000 },
    { limit: 150000000,  rate: 0.35, deduction: 15440000 },
    { limit: 300000000,  rate: 0.38, deduction: 19940000 },
    { limit: 500000000,  rate: 0.40, deduction: 25940000 },
    { limit: 1000000000, rate: 0.42, deduction: 35940000 },
    { limit: Infinity,   rate: 0.45, deduction: 65940000 },
  ];

  const calcTax = (income) => {
    if (income <= 0) return 0;
    const bracket = brackets.find(b => income <= b.limit);
    return Math.max(0, income * bracket.rate - bracket.deduction);
  };

  const grossTax = calcTax(taxableIncome);
  const youthReduction = grossTax * 0.75;
  const netTax = grossTax - youthReduction;
  const effectiveRate = taxableIncome > 0 ? (netTax / taxableIncome) * 100 : 0;
  const monthlyReserve = Math.ceil(netTax / 12);

  /* 간이과세 vs 일반과세 */
  const isSimpleTaxEligible = annualRevenue < 80000000; // 8000만원 미만
  const simpleVatRate = 0.015; // 간이 부가세율 (음식점 1.5%)
  const generalVatRate = 0.10;
  const simpleVat = annualRevenue * simpleVatRate;
  const generalVat = (annualRevenue - annualExpense * 0.5) * generalVatRate; // simplified

  return (
    <div className="tab-content">
      {/* Income summary */}
      <div className="ana-card">
        <h3 className="ana-card-title"><Receipt size={16} /> 연간 소득 현황 (장부 기준)</h3>
        <div className="tax-summary-grid">
          <div className="tax-sum-item blue">
            <p className="tsi-label">연간 매출</p>
            <p className="tsi-val">{fmt(annualRevenue)}원</p>
          </div>
          <div className="tax-sum-item orange">
            <p className="tsi-label">연간 비용</p>
            <p className="tsi-val">{fmt(annualExpense)}원</p>
          </div>
          <div className={`tax-sum-item ${taxableIncome >= 0 ? 'green' : 'red'}`}>
            <p className="tsi-label">과세 소득</p>
            <p className="tsi-val">{fmt(taxableIncome)}원</p>
          </div>
        </div>
      </div>

      {/* Tax calculation */}
      <div className="ana-grid-2">
        <div className="ana-card">
          <h3 className="ana-card-title"><Calculator size={16} /> 소득세 계산</h3>
          <div className="tax-calc-list">
            <div className="tax-row">
              <span>산출 세액</span>
              <strong>{fmt(Math.round(grossTax))}원</strong>
            </div>
            <div className="tax-row highlight">
              <span>청년 창업 75% 감면</span>
              <strong className="green">-{fmt(Math.round(youthReduction))}원</strong>
            </div>
            <div className="tax-row total">
              <span>납부할 세액</span>
              <strong>{fmt(Math.round(netTax))}원</strong>
            </div>
            <div className="tax-row">
              <span>실효 세율</span>
              <strong>{effectiveRate.toFixed(2)}%</strong>
            </div>
            <div className="tax-row reserve">
              <span>월별 세금 적립 권장액</span>
              <strong className="blue">{fmt(monthlyReserve)}원/월</strong>
            </div>
          </div>
        </div>

        {/* With vs Without youth reduction */}
        <div className="ana-card">
          <h3 className="ana-card-title"><Percent size={16} /> 청년 감면 비교</h3>
          <div className="compare-table-wrap">
            <table className="ana-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th className="r">감면 전</th>
                  <th className="r">감면 후 (75%)</th>
                  <th className="r">절감액</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>소득세</td>
                  <td className="r">{fmt(Math.round(grossTax))}원</td>
                  <td className="r green-text">{fmt(Math.round(netTax))}원</td>
                  <td className="r green-text">{fmt(Math.round(youthReduction))}원</td>
                </tr>
                <tr>
                  <td>실효 세율</td>
                  <td className="r">{taxableIncome > 0 ? ((grossTax / taxableIncome) * 100).toFixed(2) : '0.00'}%</td>
                  <td className="r green-text">{effectiveRate.toFixed(2)}%</td>
                  <td className="r">-</td>
                </tr>
                <tr>
                  <td>월 적립</td>
                  <td className="r">{fmt(Math.ceil(grossTax / 12))}원</td>
                  <td className="r green-text">{fmt(monthlyReserve)}원</td>
                  <td className="r green-text">{fmt(Math.ceil(grossTax / 12) - monthlyReserve)}원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 간이과세 vs 일반과세 */}
      <div className="ana-card">
        <h3 className="ana-card-title"><BarChart3 size={16} /> 간이과세 vs 일반과세 비교</h3>
        {isSimpleTaxEligible ? (
          <div className="ana-insight up" style={{ marginBottom: 16 }}>
            <CheckCircle2 size={15} />
            <span>연 매출 8,000만원 미만 — 간이과세자 자격 해당</span>
          </div>
        ) : (
          <div className="ana-insight down" style={{ marginBottom: 16 }}>
            <AlertTriangle size={15} />
            <span>연 매출 8,000만원 이상 — 일반과세자로 전환 필요</span>
          </div>
        )}
        <div className="compare-table-wrap">
          <table className="ana-table">
            <thead>
              <tr>
                <th>항목</th>
                <th className="r">간이과세</th>
                <th className="r">일반과세</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>대상</td>
                <td className="r">연 매출 8,000만원 미만</td>
                <td className="r">연 매출 8,000만원 이상</td>
              </tr>
              <tr>
                <td>부가세율</td>
                <td className="r">1.5% (음식점)</td>
                <td className="r">10%</td>
              </tr>
              <tr>
                <td>예상 부가세</td>
                <td className="r">{fmt(Math.round(simpleVat))}원</td>
                <td className="r">{fmt(Math.round(generalVat > 0 ? generalVat : 0))}원</td>
              </tr>
              <tr>
                <td>매입세액 공제</td>
                <td className="r">불가</td>
                <td className="r">가능</td>
              </tr>
              <tr>
                <td>세금계산서 발행</td>
                <td className="r">불가</td>
                <td className="r">가능</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax brackets reference */}
      <div className="ana-card">
        <h3 className="ana-card-title"><Info size={16} /> 2026 종합소득세 세율표</h3>
        <div className="ana-table-wrap">
          <table className="ana-table">
            <thead>
              <tr>
                <th>과세표준</th>
                <th className="r">세율</th>
                <th className="r">누진공제</th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: '1,400만원 이하', rate: '6%', ded: '-' },
                { range: '1,400만 ~ 5,000만원', rate: '15%', ded: '126만원' },
                { range: '5,000만 ~ 8,800만원', rate: '24%', ded: '576만원' },
                { range: '8,800만 ~ 1.5억원', rate: '35%', ded: '1,544만원' },
                { range: '1.5억 ~ 3억원', rate: '38%', ded: '1,994만원' },
                { range: '3억 ~ 5억원', rate: '40%', ded: '2,594만원' },
                { range: '5억 ~ 10억원', rate: '42%', ded: '3,594만원' },
                { range: '10억원 초과', rate: '45%', ded: '6,594만원' },
              ].map((r, i) => {
                const isActive = taxableIncome > 0 && taxableIncome <= (brackets[i]?.limit || Infinity) &&
                  (i === 0 || taxableIncome > (brackets[i - 1]?.limit || 0));
                return (
                  <tr key={i} className={isActive ? 'active-bracket' : ''}>
                    <td>{r.range}</td>
                    <td className="r">{r.rate}</td>
                    <td className="r">{r.ded}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const analyticsCSS = `
  .ana { max-width: 1200px; }
  .page-header { margin-bottom: 28px; }
  .page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
  .page-header p { color: var(--text-light); font-size: 14px; }

  /* ── Tab Bar ── */
  .ana-tab-bar {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .ana-tab-bar::-webkit-scrollbar { display: none; }
  .ana-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    background: var(--bg-card);
    border: 1px solid var(--border);
    white-space: nowrap;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .ana-tab:hover { border-color: var(--primary); color: var(--primary); }
  .ana-tab.active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }

  .tab-content { display: flex; flex-direction: column; gap: 20px; }

  /* ── Card ── */
  .ana-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow-sm);
  }
  .ana-card-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
  }

  /* ── Grid ── */
  .ana-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  /* ── Inputs ── */
  .ana-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text-dark);
    background: var(--bg);
    transition: border-color 0.2s;
  }
  .ana-input:focus { border-color: var(--primary); }
  .ana-input.sm { max-width: 140px; }

  /* ── Buttons ── */
  .ana-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    border: 1px solid transparent;
  }
  .ana-btn.primary {
    background: var(--primary);
    color: #fff;
  }
  .ana-btn.primary:hover { background: var(--primary-dark); }
  .ana-btn.ghost {
    background: none;
    color: var(--text);
    border-color: var(--border);
  }
  .ana-btn.ghost:hover { border-color: var(--text-light); }
  .ana-btn.full-w { width: 100%; justify-content: center; }
  .ana-btn-icon {
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }
  .ana-btn-icon.danger { color: var(--text-light); }
  .ana-btn-icon.danger:hover { color: var(--danger); background: var(--danger-light); }

  /* ── Table ── */
  .ana-table-wrap { overflow-x: auto; }
  .ana-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .ana-table th {
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    color: var(--text-light);
    border-bottom: 2px solid var(--border);
    font-size: 12px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .ana-table th.r { text-align: right; }
  .ana-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-dark);
    white-space: nowrap;
  }
  .ana-table td.r { text-align: right; }
  .ana-table td.pos { color: var(--success); font-weight: 600; }
  .ana-table td.neg { color: var(--danger); font-weight: 600; }
  .ana-table .row-header { font-weight: 600; }
  .ana-table .current-cell {
    background: var(--primary-light);
    font-weight: 700;
    color: var(--primary);
  }
  .ana-table .active-bracket {
    background: var(--primary-light);
  }
  .ana-table .green-text { color: var(--success); }

  /* ── Empty ── */
  .ana-empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-light);
    font-size: 14px;
    background: var(--bg-card);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
  }

  /* ── Alert ── */
  .ana-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
  }
  .ana-alert.danger {
    background: var(--danger-light);
    color: var(--danger);
  }

  /* ── Insights ── */
  .ana-insight {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    margin-top: 12px;
  }
  .ana-insight.up { background: var(--success-light); color: var(--success); }
  .ana-insight.down { background: var(--danger-light); color: var(--danger); }
  .ana-insight.suggestion { background: var(--warning-light); color: var(--warning); }

  /* ================================================================
     TAB 1: BreakEven
     ================================================================ */
  .fixed-list { margin-bottom: 20px; }
  .fixed-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
  }
  .fixed-name { font-size: 13px; color: var(--text); }
  .fixed-input-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .fixed-input-wrap .unit { font-size: 12px; color: var(--text-light); }
  .fixed-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    border-top: 2px solid var(--border);
    margin-top: 4px;
  }
  .slider-section { display: flex; flex-direction: column; gap: 18px; }
  .slider-group label {
    display: block;
    font-size: 13px;
    color: var(--text);
    margin-bottom: 6px;
  }
  .slider-group label strong { color: var(--primary); }
  .slider-group input[type="range"] {
    width: 100%;
    accent-color: var(--primary);
  }
  .slider-range {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-light);
    margin-top: 2px;
  }

  /* BEP Cards */
  .bep-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  .bep-card {
    text-align: center;
    padding: 20px 12px;
    background: var(--bg);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
  }
  .bep-label { font-size: 12px; color: var(--text-light); margin-bottom: 6px; }
  .bep-value { font-size: 22px; font-weight: 700; color: var(--text-dark); }
  .bep-sub { font-size: 11px; color: var(--text-light); margin-top: 4px; }

  /* BEP Bar */
  .bep-bar-section { margin-bottom: 16px; }
  .bep-bar-label { font-size: 13px; color: var(--text); margin-bottom: 8px; font-weight: 500; }
  .bep-bar-wrap { position: relative; }
  .bep-bar-bg {
    height: 28px;
    background: var(--border-light);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
  }
  .bep-bar-fill {
    height: 100%;
    border-radius: 14px;
    transition: width 0.6s ease;
  }
  .bep-bar-fill.green { background: linear-gradient(90deg, var(--success), #4ade80); }
  .bep-bar-fill.red { background: linear-gradient(90deg, var(--danger), #f87171); }
  .bep-marker {
    position: absolute;
    top: -4px;
    width: 3px;
    height: 36px;
    background: var(--text-dark);
    border-radius: 2px;
    transform: translateX(-50%);
  }
  .bep-bar-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-light);
    margin-top: 6px;
  }
  .bep-msg {
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    padding: 12px;
    border-radius: var(--radius-sm);
    margin-top: 12px;
  }
  .bep-msg.green { background: var(--success-light); color: var(--success); }
  .bep-msg.red { background: var(--danger-light); color: var(--danger); }

  /* ================================================================
     TAB 2: TimeAnalysis
     ================================================================ */
  .time-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .time-form-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .time-form-row label {
    min-width: 130px;
    font-size: 13px;
    color: var(--text);
    font-weight: 500;
  }

  /* Horizontal bar chart */
  .h-bar-chart { display: flex; flex-direction: column; gap: 12px; }
  .h-bar-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .h-bar-label {
    min-width: 120px;
    font-size: 12px;
    color: var(--text);
    font-weight: 500;
    flex-shrink: 0;
  }
  .h-bar-track {
    flex: 1;
    height: 22px;
    background: var(--border-light);
    border-radius: 11px;
    overflow: hidden;
  }
  .h-bar-fill {
    height: 100%;
    border-radius: 11px;
    background: linear-gradient(90deg, var(--primary), #60a5fa);
    transition: width 0.4s ease;
  }
  .h-bar-fill.peak { background: linear-gradient(90deg, var(--success), #4ade80); }
  .h-bar-fill.low { background: linear-gradient(90deg, var(--danger), #f87171); }
  .h-bar-fill.weather { background: linear-gradient(90deg, var(--teal), #5eead4); }
  .h-bar-fill.temp { background: linear-gradient(90deg, var(--warning), #fb923c); }
  .h-bar-val {
    min-width: 60px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    text-align: right;
    flex-shrink: 0;
  }

  .time-insights { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
  .insight {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
  }
  .insight.peak { background: var(--success-light); color: var(--success); }
  .insight.low { background: var(--warning-light); color: var(--warning); }

  /* Weekday / Weekend */
  .wd-we-compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .wd-we-card {
    text-align: center;
    padding: 20px;
    background: var(--bg);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
  }
  .wd-we-label { font-size: 13px; color: var(--text-light); margin-bottom: 6px; }
  .wd-we-val { font-size: 24px; font-weight: 700; color: var(--text-dark); }
  .wd-we-diff {
    text-align: center;
    font-size: 13px;
    color: var(--primary);
    font-weight: 500;
  }

  /* ================================================================
     TAB 3: PromotionROI
     ================================================================ */
  .promo-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .promo-sum-item {
    text-align: center;
    padding: 16px;
    background: var(--bg);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
  }
  .promo-sum-item.positive { border-color: var(--success); background: var(--success-light); }
  .promo-sum-item.negative { border-color: var(--danger); background: var(--danger-light); }
  .psi-label { font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
  .psi-val { font-size: 18px; font-weight: 700; color: var(--text-dark); }
  .promo-sum-item.positive .psi-val { color: var(--success); }
  .promo-sum-item.negative .psi-val { color: var(--danger); }

  .promo-form, .cust-form { display: flex; flex-direction: column; gap: 14px; }
  .pf-row, .cf-row, .wf-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .pf-field, .cf-field, .wf-field { display: flex; flex-direction: column; gap: 4px; }
  .pf-field label, .cf-field label, .wf-field label {
    font-size: 12px;
    color: var(--text-light);
    font-weight: 500;
  }
  .pf-field.full { grid-column: 1 / -1; }
  .pf-actions {
    display: flex;
    gap: 8px;
    padding-top: 4px;
  }

  .promo-cards { display: flex; flex-direction: column; gap: 16px; }
  .promo-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    border-left: 4px solid var(--border);
  }
  .promo-card.positive { border-left-color: var(--success); }
  .promo-card.negative { border-left-color: var(--danger); }
  .pc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }
  .pc-name { font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
  .pc-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .pc-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 12px;
    background: var(--primary-light);
    color: var(--primary);
  }
  .pc-badge.type { background: var(--purple-light); color: var(--purple); }
  .pc-dates { font-size: 11px; color: var(--text-light); }
  .pc-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .pc-metric {
    text-align: center;
    padding: 10px 6px;
    background: var(--bg);
    border-radius: var(--radius-sm);
  }
  .pcm-label { font-size: 11px; color: var(--text-light); margin-bottom: 4px; }
  .pcm-val { font-size: 14px; font-weight: 700; color: var(--text-dark); }
  .pcm-val.up { color: var(--success); }
  .pcm-val.down { color: var(--danger); }
  .pcm-val.big { font-size: 18px; }
  .pc-memo {
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-light);
    padding: 8px 12px;
    background: var(--border-light);
    border-radius: var(--radius-sm);
  }

  /* ================================================================
     TAB 4: Weather
     ================================================================ */
  .weather-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ================================================================
     TAB 5: Customer
     ================================================================ */
  .trend-chart {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    height: 180px;
    padding: 10px 0;
  }
  .trend-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }
  .trend-bar-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
  }
  .trend-bar {
    width: 60%;
    max-width: 40px;
    border-radius: 4px 4px 0 0;
    transition: height 0.4s ease;
  }
  .trend-bar.good { background: linear-gradient(180deg, var(--success), #86efac); }
  .trend-bar.warn { background: linear-gradient(180deg, var(--warning), #fdba74); }
  .trend-bar.aov { background: linear-gradient(180deg, var(--primary), #93c5fd); }
  .trend-target {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: var(--danger);
    opacity: 0.5;
  }
  .trend-val {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-dark);
    margin-top: 4px;
  }
  .trend-label {
    font-size: 11px;
    color: var(--text-light);
    margin-top: 2px;
  }

  .menu-ranking { display: flex; flex-direction: column; gap: 8px; }
  .rank-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--bg);
    border-radius: var(--radius-sm);
  }
  .rank-num {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--primary-light);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .rank-name { flex: 1; font-size: 14px; font-weight: 500; color: var(--text-dark); }
  .rank-count { font-size: 12px; color: var(--text-light); }

  /* ================================================================
     TAB 6: Tax
     ================================================================ */
  .tax-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .tax-sum-item {
    text-align: center;
    padding: 18px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
  }
  .tax-sum-item.blue { background: var(--primary-light); border-color: var(--primary); }
  .tax-sum-item.orange { background: var(--warning-light); border-color: var(--warning); }
  .tax-sum-item.green { background: var(--success-light); border-color: var(--success); }
  .tax-sum-item.red { background: var(--danger-light); border-color: var(--danger); }
  .tsi-label { font-size: 12px; color: var(--text-light); margin-bottom: 6px; }
  .tsi-val { font-size: 20px; font-weight: 700; color: var(--text-dark); }

  .tax-calc-list { display: flex; flex-direction: column; gap: 0; }
  .tax-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);
    font-size: 14px;
    color: var(--text);
  }
  .tax-row:last-child { border-bottom: none; }
  .tax-row strong { color: var(--text-dark); }
  .tax-row strong.green { color: var(--success); }
  .tax-row strong.blue { color: var(--primary); }
  .tax-row.highlight { background: var(--success-light); padding: 12px; border-radius: var(--radius-sm); margin: 4px 0; }
  .tax-row.total {
    border-top: 2px solid var(--border);
    border-bottom: 2px solid var(--border);
    font-size: 16px;
    font-weight: 600;
    color: var(--text-dark);
    padding: 14px 0;
    margin: 4px 0;
  }
  .tax-row.reserve { background: var(--primary-light); padding: 12px; border-radius: var(--radius-sm); margin-top: 4px; }

  .compare-table-wrap { overflow-x: auto; }

  /* ================================================================
     Responsive
     ================================================================ */
  @media (max-width: 900px) {
    .ana-grid-2 { grid-template-columns: 1fr; }
    .bep-cards { grid-template-columns: 1fr; }
    .promo-summary { grid-template-columns: 1fr; }
    .tax-summary-grid { grid-template-columns: 1fr; }
    .pc-metrics { grid-template-columns: repeat(2, 1fr); }
    .pf-row, .cf-row, .wf-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 600px) {
    .ana-tab { padding: 8px 12px; font-size: 12px; }
    .ana-card { padding: 16px; }
    .h-bar-label { min-width: 80px; font-size: 11px; }
    .h-bar-val { min-width: 50px; font-size: 12px; }
    .time-form-row { flex-direction: column; align-items: stretch; gap: 4px; }
    .time-form-row label { min-width: auto; }
    .wd-we-compare { grid-template-columns: 1fr; }
    .pc-metrics { grid-template-columns: 1fr 1fr; }
  }
`;
