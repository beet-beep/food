import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer, Plus, ChevronRight, Check, X, Clock,
  Flame, Package, RotateCcw, Trophy, AlertTriangle,
} from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

const PLATFORMS = [
  { key: 'baemin', name: '배달의민족', color: '#2AC1BC' },
  { key: 'coupang', name: '쿠팡이츠', color: '#E0115F' },
  { key: 'yogiyo', name: '요기요', color: '#FA0050' },
  { key: 'takeout', name: '포장', color: '#f59e0b' },
];

const STATUS_FLOW = ['접수', '조리중', '조리완료', '픽업완료'];
const STATUS_COLORS = {
  '접수': '#2563eb',
  '조리중': '#ea580c',
  '조리완료': '#16a34a',
  '픽업완료': '#94a3b8',
};
const STATUS_BG = {
  '접수': '#dbeafe',
  '조리중': '#fff7ed',
  '조리완료': '#dcfce7',
  '픽업완료': '#f1f5f9',
};

let orderCounter = 0;

function createOrder(menu, quantity, specialRequest, platform) {
  orderCounter += 1;
  return {
    id: 'ord_' + Date.now() + '_' + orderCounter,
    number: orderCounter,
    menuId: menu.id,
    menuName: menu.name,
    menuEmoji: menu.emoji || '🍚',
    quantity,
    specialRequest,
    platform,
    status: '접수',
    createdAt: Date.now(),
    cookingStartAt: null,
    cookingEndAt: null,
    completedAt: null,
  };
}

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function formatOrderNumber(n) {
  return '#' + String(n).padStart(3, '0');
}

/* ================================================================
   ORDER SIMULATOR — 주문 시뮬레이터
   ================================================================ */
export default function OrderSimulator({ menus }) {
  const [tab, setTab] = useState('simulator');
  const [orders, setOrders] = useState([]);
  const [completedHistory, setCompletedHistory] = useState([]);
  const [now, setNow] = useState(Date.now());

  // Peak time challenge state
  const [challengeActive, setChallengeActive] = useState(false);
  const [challengeStartTime, setChallengeStartTime] = useState(null);
  const [challengeResult, setChallengeResult] = useState(null);
  const [challengeOrders, setChallengeOrders] = useState([]);

  // New order form
  const [showForm, setShowForm] = useState(false);
  const [formMenu, setFormMenu] = useState(menus?.[0]?.id || '');
  const [formQty, setFormQty] = useState(1);
  const [formRequest, setFormRequest] = useState('');
  const [formPlatform, setFormPlatform] = useState('baemin');

  // Tick every second for live timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const menuList = menus || [];

  // --- Tab 1: Order Simulator ---
  const addOrder = () => {
    const menu = menuList.find(m => m.id === formMenu);
    if (!menu) return;
    const order = createOrder(menu, formQty, formRequest, formPlatform);
    setOrders(prev => [...prev, order]);
    setShowForm(false);
    setFormQty(1);
    setFormRequest('');
  };

  const advanceStatus = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const idx = STATUS_FLOW.indexOf(o.status);
      if (idx >= STATUS_FLOW.length - 1) return o;
      const next = STATUS_FLOW[idx + 1];
      const updated = { ...o, status: next };
      if (next === '조리중') updated.cookingStartAt = Date.now();
      if (next === '조리완료') updated.cookingEndAt = Date.now();
      if (next === '픽업완료') {
        updated.completedAt = Date.now();
        setTimeout(() => {
          setOrders(p => p.filter(x => x.id !== orderId));
          setCompletedHistory(p => [...p, updated]);
        }, 1500);
      }
      return updated;
    }));
  };

  const cancelOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const activeOrders = orders.filter(o => o.status !== '픽업완료');
  const todayCompleted = completedHistory.filter(o => {
    const d = new Date(o.completedAt);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });

  const avgCookingTime = (() => {
    const cooked = completedHistory.filter(o => o.cookingStartAt && o.cookingEndAt);
    if (cooked.length === 0) return 0;
    const total = cooked.reduce((s, o) => s + (o.cookingEndAt - o.cookingStartAt), 0);
    return total / cooked.length;
  })();

  // --- Tab 2: Peak Time Challenge ---
  const startChallenge = () => {
    if (menuList.length === 0) return;
    orderCounter = 0;
    const rush = [];
    for (let i = 0; i < 5; i++) {
      const randomMenu = menuList[Math.floor(Math.random() * menuList.length)];
      const randomQty = Math.floor(Math.random() * 3) + 1;
      const randomPlatform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
      rush.push(createOrder(randomMenu, randomQty, '', randomPlatform.key));
    }
    setChallengeOrders(rush);
    setChallengeStartTime(Date.now());
    setChallengeActive(true);
    setChallengeResult(null);
  };

  const advanceChallengeStatus = (orderId) => {
    setChallengeOrders(prev => {
      const updated = prev.map(o => {
        if (o.id !== orderId) return o;
        const idx = STATUS_FLOW.indexOf(o.status);
        if (idx >= STATUS_FLOW.length - 1) return o;
        const next = STATUS_FLOW[idx + 1];
        const u = { ...o, status: next };
        if (next === '조리중') u.cookingStartAt = Date.now();
        if (next === '조리완료') u.cookingEndAt = Date.now();
        if (next === '픽업완료') u.completedAt = Date.now();
        return u;
      });

      // Check if all done
      const allDone = updated.every(o => o.status === '조리완료' || o.status === '픽업완료');
      if (allDone && !challengeResult) {
        const times = updated.filter(o => o.cookingEndAt && o.createdAt).map(o => o.cookingEndAt - o.createdAt);
        const avg = times.reduce((s, t) => s + t, 0) / times.length;
        const maxTime = Math.max(...times);
        const success = maxTime <= 15 * 60 * 1000;
        setChallengeResult({ success, avgTime: avg, maxTime });
      }
      return updated;
    });
  };

  const resetChallenge = () => {
    orderCounter = 0;
    setChallengeOrders([]);
    setChallengeStartTime(null);
    setChallengeActive(false);
    setChallengeResult(null);
  };

  // --- Tab 3: Cooking History ---
  const menuCookingStats = (() => {
    const map = {};
    completedHistory.forEach(o => {
      if (!o.cookingStartAt || !o.cookingEndAt) return;
      if (!map[o.menuName]) map[o.menuName] = { name: o.menuName, emoji: o.menuEmoji, times: [] };
      map[o.menuName].times.push(o.cookingEndAt - o.cookingStartAt);
    });
    return Object.values(map).map(m => ({
      ...m,
      avg: m.times.reduce((s, t) => s + t, 0) / m.times.length,
      count: m.times.length,
    }));
  })();

  const fastestMenu = menuCookingStats.length > 0
    ? menuCookingStats.reduce((a, b) => a.avg < b.avg ? a : b)
    : null;
  const slowestMenu = menuCookingStats.length > 0
    ? menuCookingStats.reduce((a, b) => a.avg > b.avg ? a : b)
    : null;

  const tabs = [
    { id: 'simulator', label: '주문 시뮬레이터', icon: Flame },
    { id: 'peak', label: '피크타임 연습', icon: Timer },
    { id: 'history', label: '조리 기록', icon: Clock },
  ];

  const renderOrderCard = (order, onAdvance, onCancel, showCancel = true) => {
    const platform = PLATFORMS.find(p => p.key === order.platform);
    const elapsed = now - order.createdAt;
    const statusIdx = STATUS_FLOW.indexOf(order.status);
    const isLast = statusIdx >= STATUS_FLOW.length - 1;

    return (
      <div key={order.id} style={{
        background: STATUS_BG[order.status],
        border: `2px solid ${STATUS_COLORS[order.status]}`,
        borderRadius: 'var(--radius)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>
              {formatOrderNumber(order.number)}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'white',
              background: STATUS_COLORS[order.status],
            }}>
              {order.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text)' }}>
            <Timer size={14} />
            {formatElapsed(elapsed)}
          </div>
        </div>

        {/* Menu info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>{order.menuEmoji}</span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '14px' }}>
              {order.menuName} x {order.quantity}
            </div>
            {platform && (
              <span style={{
                display: 'inline-block',
                marginTop: '2px',
                padding: '1px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'white',
                background: platform.color,
              }}>
                {platform.name}
              </span>
            )}
          </div>
        </div>

        {/* Special request */}
        {order.specialRequest && (
          <div style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            fontSize: '12px',
            color: 'var(--text)',
          }}>
            📝 {order.specialRequest}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {!isLast && (
            <button
              onClick={() => onAdvance(order.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'white',
                background: STATUS_COLORS[STATUS_FLOW[statusIdx + 1]] || 'var(--primary)',
                transition: 'opacity 0.15s',
              }}
            >
              <ChevronRight size={14} />
              {STATUS_FLOW[statusIdx + 1]}
            </button>
          )}
          {showCancel && order.status === '접수' && (
            <button
              onClick={() => onCancel(order.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid #fecaca',
              }}
            >
              <X size={14} /> 취소
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="osim">
      <div className="osim-header">
        <h1>주문 시뮬레이터</h1>
        <p>주방 주문 시뮬레이션 & 조리 타이머 — 실전 연습 도구</p>
      </div>

      {/* Tab bar */}
      <div className="osim-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`osim-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: 주문 시뮬레이터 ==================== */}
      {tab === 'simulator' && (
        <div className="osim-content">
          {/* Stats bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div className="osim-stat-card">
              <div className="osim-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <Package size={18} />
              </div>
              <div>
                <div className="osim-stat-value">{activeOrders.length}건</div>
                <div className="osim-stat-label">활성 주문</div>
              </div>
            </div>
            <div className="osim-stat-card">
              <div className="osim-stat-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Timer size={18} />
              </div>
              <div>
                <div className="osim-stat-value">
                  {avgCookingTime > 0 ? formatElapsed(avgCookingTime) : '-'}
                </div>
                <div className="osim-stat-label">평균 조리시간</div>
              </div>
            </div>
            <div className="osim-stat-card">
              <div className="osim-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Check size={18} />
              </div>
              <div>
                <div className="osim-stat-value">{todayCompleted.length}건</div>
                <div className="osim-stat-label">오늘 완료</div>
              </div>
            </div>
          </div>

          {/* Add order button */}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              background: 'var(--primary)',
              marginBottom: '16px',
              transition: 'opacity 0.15s',
            }}
          >
            <Plus size={16} /> 주문 추가
          </button>

          {/* New order form */}
          {showForm && (
            <div className="osim-card" style={{ marginBottom: '16px' }}>
              <h3><Plus size={16} /> 새 주문</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="osim-label">메뉴 선택</label>
                  <select
                    value={formMenu}
                    onChange={e => setFormMenu(e.target.value)}
                    className="osim-input"
                  >
                    {menuList.map(m => (
                      <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="osim-label">수량</label>
                  <select
                    value={formQty}
                    onChange={e => setFormQty(Number(e.target.value))}
                    className="osim-input"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label className="osim-label">플랫폼</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PLATFORMS.map(p => (
                    <button
                      key={p.key}
                      onClick={() => setFormPlatform(p.key)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: formPlatform === p.key ? 'white' : p.color,
                        background: formPlatform === p.key ? p.color : 'white',
                        border: `2px solid ${p.color}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label className="osim-label">특이사항</label>
                <input
                  type="text"
                  value={formRequest}
                  onChange={e => setFormRequest(e.target.value)}
                  placeholder="예: 소스 많이, 밥 적게 등"
                  className="osim-input"
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={addOrder}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'var(--primary)',
                  }}
                >
                  <Check size={14} /> 주문 접수
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text)',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Order queue */}
          {activeOrders.length === 0 ? (
            <div className="osim-empty">
              <Package size={40} />
              <p>대기 중인 주문이 없습니다</p>
              <p style={{ fontSize: '12px' }}>위 버튼으로 주문을 추가하세요</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}>
              {orders.map(o => renderOrderCard(o, advanceStatus, cancelOrder, true))}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: 피크타임 연습 ==================== */}
      {tab === 'peak' && (
        <div className="osim-content">
          {!challengeActive && !challengeResult && (
            <div className="osim-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Flame size={48} style={{ color: '#ea580c', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                피크타임 시뮬레이션
              </h2>
              <p style={{ color: 'var(--text)', marginBottom: '8px', lineHeight: 1.6 }}>
                5건의 주문이 동시에 들어옵니다!
              </p>
              <p style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: '#fff7ed',
                color: '#ea580c',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '24px',
              }}>
                <AlertTriangle size={14} /> 목표: 모든 주문 15분 이내 조리완료
              </p>
              <br />
              <button
                onClick={startChallenge}
                style={{
                  marginTop: '16px',
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'white',
                  background: '#ea580c',
                  transition: 'opacity 0.15s',
                }}
              >
                <Flame size={16} /> 5건 동시 주문 시작!
              </button>
            </div>
          )}

          {challengeActive && !challengeResult && (
            <>
              {/* Challenge timer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fff7ed',
                border: '2px solid #ea580c',
                borderRadius: 'var(--radius)',
                padding: '16px 20px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Flame size={20} style={{ color: '#ea580c' }} />
                  <span style={{ fontWeight: 700, color: '#ea580c', fontSize: '16px' }}>
                    피크타임 진행 중
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Timer size={18} style={{ color: '#ea580c' }} />
                  <span style={{ fontWeight: 700, fontSize: '20px', color: '#ea580c', fontVariantNumeric: 'tabular-nums' }}>
                    {formatElapsed(now - challengeStartTime)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '12px 16px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text)' }}>
                  <span>진행률</span>
                  <span style={{ fontWeight: 600 }}>
                    {challengeOrders.filter(o => o.status === '조리완료' || o.status === '픽업완료').length} / {challengeOrders.length}
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(challengeOrders.filter(o => o.status === '조리완료' || o.status === '픽업완료').length / challengeOrders.length) * 100}%`,
                    height: '100%',
                    background: '#ea580c',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>

              {/* Challenge orders */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
              }}>
                {challengeOrders.map(o => renderOrderCard(o, advanceChallengeStatus, () => {}, false))}
              </div>
            </>
          )}

          {challengeResult && (
            <div className="osim-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              {challengeResult.success ? (
                <>
                  <Trophy size={56} style={{ color: '#f59e0b', marginBottom: '16px' }} />
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a', marginBottom: '8px' }}>
                    도전 성공!
                  </h2>
                  <p style={{ color: 'var(--text)', marginBottom: '16px' }}>
                    모든 주문을 15분 이내에 완료했습니다!
                  </p>
                </>
              ) : (
                <>
                  <AlertTriangle size={56} style={{ color: '#dc2626', marginBottom: '16px' }} />
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>
                    시간 초과
                  </h2>
                  <p style={{ color: 'var(--text)', marginBottom: '16px' }}>
                    일부 주문이 15분을 넘겼습니다. 다시 도전해 보세요!
                  </p>
                </>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                maxWidth: '320px',
                margin: '0 auto 24px',
              }}>
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>평균 시간</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {formatElapsed(challengeResult.avgTime)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>최대 시간</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {formatElapsed(challengeResult.maxTime)}
                  </div>
                </div>
              </div>
              <button
                onClick={resetChallenge}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'white',
                  background: '#ea580c',
                }}
              >
                <RotateCcw size={16} /> 다시 도전
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: 조리 기록 ==================== */}
      {tab === 'history' && (
        <div className="osim-content">
          {/* Fastest / Slowest highlights */}
          {menuCookingStats.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}>
              {fastestMenu && (
                <div className="osim-card" style={{ borderLeft: '4px solid #16a34a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Trophy size={16} style={{ color: '#16a34a' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>가장 빠른 메뉴</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {fastestMenu.emoji} {fastestMenu.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                    평균 {formatElapsed(fastestMenu.avg)} ({fastestMenu.count}건)
                  </div>
                </div>
              )}
              {slowestMenu && menuCookingStats.length > 1 && (
                <div className="osim-card" style={{ borderLeft: '4px solid #dc2626' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={16} style={{ color: '#dc2626' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>가장 느린 메뉴</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {slowestMenu.emoji} {slowestMenu.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                    평균 {formatElapsed(slowestMenu.avg)} ({slowestMenu.count}건)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Average by menu */}
          {menuCookingStats.length > 0 && (
            <div className="osim-card" style={{ marginBottom: '16px' }}>
              <h3><Clock size={16} /> 메뉴별 평균 조리시간</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuCookingStats
                  .sort((a, b) => a.avg - b.avg)
                  .map((m, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{m.emoji}</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-dark)', fontSize: '13px' }}>{m.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{m.count}건</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>
                          {formatElapsed(m.avg)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Completed order history */}
          <div className="osim-card">
            <h3><Package size={16} /> 완료된 주문 기록</h3>
            {completedHistory.length === 0 ? (
              <div className="osim-empty" style={{ padding: '40px 20px' }}>
                <Clock size={36} />
                <p>아직 완료된 주문이 없습니다</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="osim-table">
                  <thead>
                    <tr>
                      <th>주문번호</th>
                      <th>메뉴</th>
                      <th>수량</th>
                      <th>플랫폼</th>
                      <th>조리시간</th>
                      <th>전체시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...completedHistory].reverse().map(o => {
                      const cookTime = o.cookingStartAt && o.cookingEndAt
                        ? o.cookingEndAt - o.cookingStartAt : 0;
                      const totalTime = o.completedAt ? o.completedAt - o.createdAt : 0;
                      const platform = PLATFORMS.find(p => p.key === o.platform);
                      return (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 600 }}>{formatOrderNumber(o.number)}</td>
                          <td>{o.menuEmoji} {o.menuName}</td>
                          <td>{o.quantity}</td>
                          <td>
                            {platform && (
                              <span style={{
                                display: 'inline-block',
                                padding: '1px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'white',
                                background: platform.color,
                              }}>
                                {platform.name}
                              </span>
                            )}
                          </td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatElapsed(cookTime)}</td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatElapsed(totalTime)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{orderSimCSS}</style>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const orderSimCSS = `
  .osim {
    padding: 0;
  }
  .osim-header {
    margin-bottom: 24px;
  }
  .osim-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 4px;
  }
  .osim-header p {
    color: var(--text-light);
    font-size: 14px;
  }

  /* Tab Bar */
  .osim-tab-bar {
    display: flex;
    gap: 4px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 4px;
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .osim-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    background: none;
    white-space: nowrap;
    transition: all 0.15s;
  }
  .osim-tab:hover { background: var(--bg); }
  .osim-tab.active {
    background: var(--primary);
    color: white;
    font-weight: 600;
  }

  /* Content */
  .osim-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Cards */
  .osim-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .osim-card h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Stat cards */
  .osim-stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }
  .osim-stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .osim-stat-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    font-variant-numeric: tabular-nums;
  }
  .osim-stat-label {
    font-size: 12px;
    color: var(--text-light);
  }

  /* Empty */
  .osim-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--text-light);
    gap: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    text-align: center;
  }

  /* Form */
  .osim-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
  }
  .osim-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text-dark);
    background: var(--bg);
    transition: border-color 0.15s;
  }
  .osim-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }

  /* Table */
  .osim-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .osim-table th {
    text-align: left;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 12px;
    color: var(--text-light);
    border-bottom: 2px solid var(--border);
    white-space: nowrap;
  }
  .osim-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-dark);
    white-space: nowrap;
  }
  .osim-table tr:last-child td {
    border-bottom: none;
  }

  @media (max-width: 640px) {
    .osim-stat-card { flex-direction: column; text-align: center; padding: 12px; }
  }
`;
