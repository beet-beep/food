import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, Minus, Target, Clock, TrendingUp, TrendingDown,
  Save, Calendar, ShoppingCart, Zap,
} from 'lucide-react';

/* ─── constants ─── */

const PLATFORMS = [
  { key: 'baemin', name: '배민', full: '배달의민족', color: '#2AC1BC', emoji: '\uD83D\uDFE2' },
  { key: 'coupang', name: '쿠팡', full: '쿠팡이츠', color: '#E0115F', emoji: '\uD83D\uDD34' },
  { key: 'yogiyo', name: '요기요', full: '요기요', color: '#FA0050', emoji: '\uD83D\uDFE0' },
  { key: 'takeout', name: '포장', full: '포장/방문', color: '#f59e0b', emoji: '\uD83D\uDCE6' },
];

const TIME_SLOTS = [
  { label: '11-12시', start: 11 },
  { label: '12-13시', start: 12 },
  { label: '13-14시', start: 13 },
  { label: '14-15시', start: 14 },
  { label: '15-16시', start: 15 },
  { label: '16-17시', start: 16 },
  { label: '17-18시', start: 17 },
  { label: '18-19시', start: 18 },
  { label: '19-20시', start: 19 },
  { label: '20-21시', start: 20 },
  { label: '21-22시', start: 21 },
  { label: '22시+', start: 22 },
];

const emptyOrders = () => ({ baemin: 0, coupang: 0, yogiyo: 0, takeout: 0 });
const emptyRevenue = () => ({ baemin: 0, coupang: 0, yogiyo: 0, takeout: 0 });
const emptySlots = () => TIME_SLOTS.map(() => 0);
const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const todayStr = () => new Date().toISOString().slice(0, 10);
const currentHour = () => new Date().getHours();

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
function formatDateKR(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayName = DAY_NAMES[d.getDay()];
  return `${month}월 ${day}일 (${dayName})`;
}

/* ─── main component ─── */

export default function TodayDashboard({ dailyLogs, setDailyLogs, menus }) {
  const today = todayStr();

  // Load existing today data
  const existingToday = useMemo(
    () => dailyLogs.find((l) => l.date === today),
    [dailyLogs, today]
  );

  const [orders, setOrders] = useState(() =>
    existingToday ? { ...existingToday.orders } : emptyOrders()
  );
  const [revenue, setRevenue] = useState(() =>
    existingToday ? { ...existingToday.revenue } : emptyRevenue()
  );
  const [timeSlots, setTimeSlots] = useState(() =>
    existingToday?.timeSlots ? [...existingToday.timeSlots] : emptySlots()
  );
  const [memo, setMemo] = useState(() => existingToday?.memo || '');
  const [dailyGoal, setDailyGoal] = useState(() =>
    existingToday?.dailyGoal || 30
  );
  const [saved, setSaved] = useState(false);

  // Quick modal state
  const [modalPlatform, setModalPlatform] = useState(null);
  const [modalAmount, setModalAmount] = useState('');

  // Average menu price from menus data
  const avgMenuPrice = useMemo(() => {
    const mains = (menus || []).filter((m) => m.category === 'main' && m.price > 0);
    if (mains.length === 0) return 10000;
    return Math.round(mains.reduce((s, m) => s + m.price, 0) / mains.length);
  }, [menus]);

  // Totals
  const totalOrders = useMemo(
    () => Object.values(orders).reduce((s, v) => s + Number(v || 0), 0),
    [orders]
  );
  const totalRevenue = useMemo(
    () => Object.values(revenue).reduce((s, v) => s + Number(v || 0), 0),
    [revenue]
  );
  const avgPrice = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((totalOrders / dailyGoal) * 100)) : 0;

  // Yesterday data
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const yesterdayLog = useMemo(
    () => dailyLogs.find((l) => l.date === yesterday),
    [dailyLogs, yesterday]
  );

  const yesterdayTotalOrders = useMemo(() => {
    if (!yesterdayLog) return 0;
    const o = yesterdayLog.orders || {};
    return (Number(o.baemin) || 0) + (Number(o.coupang) || 0) + (Number(o.yogiyo) || 0) + (Number(o.takeout) || 0);
  }, [yesterdayLog]);

  const yesterdayTotalRevenue = useMemo(() => {
    if (!yesterdayLog) return 0;
    const r = yesterdayLog.revenue || {};
    return (Number(r.baemin) || 0) + (Number(r.coupang) || 0) + (Number(r.yogiyo) || 0) + (Number(r.takeout) || 0);
  }, [yesterdayLog]);

  const orderDiff = totalOrders - yesterdayTotalOrders;
  const orderDiffPct = yesterdayTotalOrders > 0
    ? Math.round(((totalOrders - yesterdayTotalOrders) / yesterdayTotalOrders) * 100)
    : totalOrders > 0 ? 100 : 0;
  const revenueDiff = totalRevenue - yesterdayTotalRevenue;

  // Open quick modal
  const openModal = (platformKey) => {
    setModalPlatform(platformKey);
    setModalAmount(String(avgMenuPrice));
  };

  // Add order from modal
  const handleAddOrder = () => {
    if (!modalPlatform) return;
    const amount = Number(modalAmount) || 0;
    setOrders((prev) => ({
      ...prev,
      [modalPlatform]: (prev[modalPlatform] || 0) + 1,
    }));
    setRevenue((prev) => ({
      ...prev,
      [modalPlatform]: (prev[modalPlatform] || 0) + amount,
    }));
    // Auto-assign to current time slot
    const hour = currentHour();
    const slotIdx = TIME_SLOTS.findIndex((s) => s.start === hour);
    if (slotIdx >= 0) {
      setTimeSlots((prev) => {
        const next = [...prev];
        next[slotIdx] += 1;
        return next;
      });
    } else if (hour >= 22) {
      setTimeSlots((prev) => {
        const next = [...prev];
        next[next.length - 1] += 1;
        return next;
      });
    }
    setModalPlatform(null);
    setModalAmount('');
    setSaved(false);
  };

  // Quick +1 for top stat
  const handleQuickAdd = () => {
    // Add 1 order to baemin by default with avg price
    openModal('baemin');
  };

  // Time slot +1
  const handleSlotPlus = (idx) => {
    setTimeSlots((prev) => {
      const next = [...prev];
      next[idx] += 1;
      return next;
    });
    setSaved(false);
  };

  const handleSlotMinus = (idx) => {
    setTimeSlots((prev) => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] - 1);
      return next;
    });
    setSaved(false);
  };

  // Save to dailyLogs
  const handleSave = useCallback(() => {
    const entry = {
      date: today,
      orders: { ...orders },
      revenue: { ...revenue },
      timeSlots: [...timeSlots],
      dailyGoal,
      memo,
    };
    setDailyLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === today);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...entry };
        return next;
      }
      return [...prev, entry].sort((a, b) => b.date.localeCompare(a.date));
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [today, orders, revenue, timeSlots, dailyGoal, memo, setDailyLogs]);

  // Auto-save memo on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (memo !== (existingToday?.memo || '')) {
        handleSave();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [memo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Max slot count for color scaling
  const maxSlotCount = Math.max(1, ...timeSlots);

  const hour = currentHour();

  return (
    <>
      <div className="td-page">
        {/* ═══ Header ═══ */}
        <div className="td-header">
          <div className="td-header-left">
            <h1><Zap size={28} /> 오늘 매출 현황</h1>
            <p className="td-date">
              <Calendar size={16} />
              {formatDateKR(today)}
            </p>
          </div>
          <button
            className={`td-save-btn ${saved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            <Save size={18} />
            {saved ? '저장 완료!' : '오늘 저장'}
          </button>
        </div>

        {/* ═══ Big Number Stats ═══ */}
        <div className="td-stats-grid">
          {/* Total Orders */}
          <div className="td-stat-card td-stat-orders">
            <div className="td-stat-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="td-stat-label">오늘 주문</div>
            <div className="td-stat-value">
              <span className="td-big-number">{totalOrders}</span>
              <span className="td-stat-unit">건</span>
            </div>
            <button className="td-quick-add" onClick={handleQuickAdd}>
              <Plus size={18} /> 주문 추가
            </button>
          </div>

          {/* Total Revenue */}
          <div className="td-stat-card td-stat-revenue">
            <div className="td-stat-icon td-icon-green">
              <TrendingUp size={24} />
            </div>
            <div className="td-stat-label">오늘 매출</div>
            <div className="td-stat-value">
              <span className="td-big-number">{fmt(totalRevenue)}</span>
              <span className="td-stat-unit">원</span>
            </div>
          </div>

          {/* Average Price */}
          <div className="td-stat-card td-stat-avg">
            <div className="td-stat-icon td-icon-purple">
              <Target size={24} />
            </div>
            <div className="td-stat-label">평균 객단가</div>
            <div className="td-stat-value">
              <span className="td-big-number">{fmt(avgPrice)}</span>
              <span className="td-stat-unit">원</span>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="td-stat-card td-stat-goal">
            <div className="td-stat-icon td-icon-amber">
              <Target size={24} />
            </div>
            <div className="td-stat-label">목표 달성</div>
            <div className="td-goal-row">
              <input
                type="number"
                className="td-goal-input"
                value={dailyGoal}
                onChange={(e) => {
                  setDailyGoal(Math.max(1, Number(e.target.value) || 1));
                  setSaved(false);
                }}
                min={1}
              />
              <span className="td-goal-unit">건 목표</span>
            </div>
            <div className="td-progress-bar">
              <div
                className="td-progress-fill"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <div className="td-progress-text">
              {totalOrders}/{dailyGoal}건 ({goalPct}%)
            </div>
          </div>
        </div>

        {/* ═══ Quick Input Section ═══ */}
        <div className="td-section">
          <h2 className="td-section-title">
            <Zap size={20} /> 원터치 주문 입력
          </h2>
          <div className="td-platform-buttons">
            {PLATFORMS.map((p) => {
              const orderCount = orders[p.key] || 0;
              const rev = revenue[p.key] || 0;
              return (
                <button
                  key={p.key}
                  className="td-platform-btn"
                  style={{ '--plat-color': p.color }}
                  onClick={() => openModal(p.key)}
                >
                  <span className="td-plat-emoji">{p.emoji}</span>
                  <span className="td-plat-name">{p.name}</span>
                  <span className="td-plat-count">{orderCount}건</span>
                  <span className="td-plat-rev">{fmt(rev)}원</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ Time Slot Tracker ═══ */}
        <div className="td-section">
          <h2 className="td-section-title">
            <Clock size={20} /> 시간대별 주문
          </h2>
          <div className="td-slots-grid">
            {TIME_SLOTS.map((slot, idx) => {
              const count = timeSlots[idx] || 0;
              const isCurrent = slot.start === hour || (slot.start === 22 && hour >= 22);
              const intensity = count / maxSlotCount;
              return (
                <div
                  key={slot.label}
                  className={`td-slot ${isCurrent ? 'td-slot-current' : ''}`}
                  style={{
                    '--slot-intensity': intensity,
                  }}
                >
                  <div className="td-slot-label">{slot.label}</div>
                  <div
                    className="td-slot-bar"
                    style={{
                      backgroundColor: `rgba(37, 99, 235, ${0.1 + intensity * 0.7})`,
                    }}
                  >
                    <span className="td-slot-count">{count}</span>
                  </div>
                  <div className="td-slot-actions">
                    <button
                      className="td-slot-btn"
                      onClick={() => handleSlotPlus(idx)}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="td-slot-btn td-slot-btn-minus"
                      onClick={() => handleSlotMinus(idx)}
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="td-slot-total">
            시간대 합계: <strong>{timeSlots.reduce((s, v) => s + v, 0)}건</strong>
          </div>
        </div>

        {/* ═══ vs Yesterday ═══ */}
        <div className="td-section">
          <h2 className="td-section-title">
            {orderDiff >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            어제 대비
          </h2>
          {yesterdayLog ? (
            <div className="td-compare">
              <div className="td-compare-row">
                <div className="td-compare-item">
                  <div className="td-compare-label">오늘 주문</div>
                  <div className="td-compare-value">{totalOrders}건</div>
                </div>
                <div className={`td-compare-badge ${orderDiff >= 0 ? 'td-badge-up' : 'td-badge-down'}`}>
                  {orderDiff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {orderDiff >= 0 ? '+' : ''}{orderDiffPct}%
                </div>
                <div className="td-compare-item">
                  <div className="td-compare-label">어제 주문</div>
                  <div className="td-compare-value">{yesterdayTotalOrders}건</div>
                </div>
              </div>
              <div className="td-compare-detail">
                어제 같은 시간 대비{' '}
                <span className={orderDiff >= 0 ? 'td-text-green' : 'td-text-red'}>
                  {orderDiff >= 0 ? '+' : ''}{orderDiff}건
                  ({orderDiff >= 0 ? '+' : ''}{orderDiffPct}%)
                </span>
              </div>
              <div className="td-compare-row" style={{ marginTop: 12 }}>
                <div className="td-compare-item">
                  <div className="td-compare-label">오늘 매출</div>
                  <div className="td-compare-value">{fmt(totalRevenue)}원</div>
                </div>
                <div className={`td-compare-badge ${revenueDiff >= 0 ? 'td-badge-up' : 'td-badge-down'}`}>
                  {revenueDiff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {revenueDiff >= 0 ? '+' : ''}{fmt(revenueDiff)}원
                </div>
                <div className="td-compare-item">
                  <div className="td-compare-label">어제 매출</div>
                  <div className="td-compare-value">{fmt(yesterdayTotalRevenue)}원</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="td-compare td-compare-empty">
              어제 데이터가 없습니다. 매출 입력 후 비교할 수 있습니다.
            </div>
          )}
        </div>

        {/* ═══ Today Memo ═══ */}
        <div className="td-section">
          <h2 className="td-section-title">
            <Calendar size={20} /> 오늘의 메모
          </h2>
          <textarea
            className="td-memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="오늘의 특이사항, 메모를 입력하세요... (자동 저장)"
            rows={4}
          />
        </div>
      </div>

      {/* ═══ Quick Order Modal ═══ */}
      {modalPlatform && (
        <div className="td-modal-overlay" onClick={() => setModalPlatform(null)}>
          <div className="td-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="td-modal-header"
              style={{
                borderBottomColor:
                  PLATFORMS.find((p) => p.key === modalPlatform)?.color,
              }}
            >
              <span className="td-modal-emoji">
                {PLATFORMS.find((p) => p.key === modalPlatform)?.emoji}
              </span>
              <span>
                {PLATFORMS.find((p) => p.key === modalPlatform)?.full} 주문
              </span>
            </div>
            <div className="td-modal-body">
              <label className="td-modal-label">주문 금액</label>
              <input
                type="number"
                className="td-modal-input"
                value={modalAmount}
                onChange={(e) => setModalAmount(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddOrder();
                }}
              />
              <div className="td-modal-presets">
                {[avgMenuPrice, 9000, 10000, 12000, 15000].map((p) => (
                  <button
                    key={p}
                    className={`td-preset-btn ${Number(modalAmount) === p ? 'active' : ''}`}
                    onClick={() => setModalAmount(String(p))}
                  >
                    {fmt(p)}원
                  </button>
                ))}
              </div>
              <button className="td-modal-submit" onClick={handleAddOrder}>
                <Plus size={20} /> 주문 추가
              </button>
            </div>
            <button
              className="td-modal-close"
              onClick={() => setModalPlatform(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <style>{cssText}</style>
    </>
  );
}

/* ═══════════════════════════════════════════
   CSS-in-JS
   ═══════════════════════════════════════════ */

const cssText = `
/* ─── Page ─── */
.td-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 80px;
}

/* ─── Header ─── */
.td-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.td-header-left h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.td-date {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}
.td-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  min-height: 52px;
  transition: all 0.2s;
  box-shadow: var(--shadow-md);
}
.td-save-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.td-save-btn.saved { background: #16a34a; }

/* ─── Big Stats Grid ─── */
.td-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
@media (min-width: 700px) {
  .td-stats-grid { grid-template-columns: repeat(4, 1fr); }
}
.td-stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  overflow: hidden;
}
.td-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: var(--primary);
}
.td-stat-orders::before { background: var(--primary); }
.td-stat-revenue::before { background: #16a34a; }
.td-stat-avg::before { background: #8b5cf6; }
.td-stat-goal::before { background: #f59e0b; }

.td-stat-icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.td-icon-green { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.td-icon-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.td-icon-amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.td-stat-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
  letter-spacing: 0.02em;
}
.td-stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.td-big-number {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1.1;
}
.td-stat-unit {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-light);
}
.td-quick-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 6px;
  padding: 10px 0;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  min-height: 48px;
  transition: all 0.15s;
}
.td-quick-add:hover { opacity: 0.9; }

/* Goal progress */
.td-goal-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.td-goal-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  background: var(--bg);
  text-align: center;
}
.td-goal-unit {
  font-size: 13px;
  color: var(--text-light);
  font-weight: 600;
}
.td-progress-bar {
  width: 100%;
  height: 10px;
  background: var(--border-light);
  border-radius: 5px;
  overflow: hidden;
  margin-top: 4px;
}
.td-progress-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #f59e0b, #f97316);
  transition: width 0.4s ease;
}
.td-progress-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dark);
  margin-top: 2px;
}

/* ─── Sections ─── */
.td-section {
  margin-bottom: 28px;
}
.td-section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ─── Platform Buttons ─── */
.td-platform-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 600px) {
  .td-platform-buttons { grid-template-columns: repeat(4, 1fr); }
}
.td-platform-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 12px;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  min-height: 120px;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}
.td-platform-btn:hover {
  border-color: var(--plat-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
.td-platform-btn:active {
  transform: translateY(0);
}
.td-plat-emoji { font-size: 28px; }
.td-plat-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
}
.td-plat-count {
  font-size: 22px;
  font-weight: 800;
  color: var(--plat-color);
}
.td-plat-rev {
  font-size: 13px;
  color: var(--text-light);
  font-weight: 600;
}

/* ─── Time Slots ─── */
.td-slots-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
@media (min-width: 700px) {
  .td-slots-grid { grid-template-columns: repeat(6, 1fr); }
}
@media (min-width: 900px) {
  .td-slots-grid { grid-template-columns: repeat(12, 1fr); }
}
.td-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.td-slot-current {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light), var(--shadow-sm);
}
.td-slot-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-light);
  white-space: nowrap;
}
.td-slot-bar {
  width: 100%;
  min-height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}
.td-slot-count {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-dark);
}
.td-slot-actions {
  display: flex;
  gap: 4px;
}
.td-slot-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s;
}
.td-slot-btn:hover { background: var(--primary-light); }
.td-slot-btn-minus { color: var(--text-light); }
.td-slot-btn-minus:hover { background: #fee2e2; color: #dc2626; }
.td-slot-total {
  text-align: right;
  font-size: 14px;
  color: var(--text-light);
  margin-top: 8px;
}
.td-slot-total strong { color: var(--text-dark); }

/* ─── Comparison ─── */
.td-compare {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.td-compare-empty {
  text-align: center;
  color: var(--text-light);
  font-size: 15px;
  padding: 32px 20px;
}
.td-compare-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.td-compare-item { flex: 1; text-align: center; }
.td-compare-label {
  font-size: 13px;
  color: var(--text-light);
  font-weight: 600;
  margin-bottom: 4px;
}
.td-compare-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-dark);
}
.td-compare-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}
.td-badge-up { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.td-badge-down { background: rgba(220, 38, 38, 0.1); color: #dc2626; }
.td-compare-detail {
  text-align: center;
  font-size: 14px;
  color: var(--text);
  margin-top: 10px;
  font-weight: 600;
}
.td-text-green { color: #16a34a; font-weight: 700; }
.td-text-red { color: #dc2626; font-weight: 700; }

/* ─── Memo ─── */
.td-memo {
  width: 100%;
  min-height: 100px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 15px;
  background: var(--bg-card);
  color: var(--text);
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.6;
}
.td-memo::placeholder { color: var(--text-light); }
.td-memo:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

/* ─── Modal ─── */
.td-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  backdrop-filter: blur(4px);
}
.td-modal {
  background: var(--bg-card);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.td-modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  border-bottom: 3px solid var(--primary);
}
.td-modal-emoji { font-size: 28px; }
.td-modal-body { padding: 24px; }
.td-modal-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 8px;
}
.td-modal-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-dark);
  background: var(--bg);
  box-sizing: border-box;
  text-align: center;
}
.td-modal-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
.td-modal-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 20px;
}
.td-preset-btn {
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.td-preset-btn:hover { border-color: var(--primary); color: var(--primary); }
.td-preset-btn.active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}
.td-modal-submit {
  width: 100%;
  padding: 16px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s;
}
.td-modal-submit:hover { opacity: 0.9; }
.td-modal-close {
  width: 100%;
  padding: 14px;
  background: none;
  border: none;
  border-top: 1px solid var(--border);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  min-height: 48px;
}
.td-modal-close:hover { background: var(--border-light); color: var(--text); }
`;
