import React, { useState, useMemo } from 'react';
import { ShoppingCart, Calendar, TrendingUp, Save, Clock, Receipt } from 'lucide-react';

const PLATFORMS = [
  { key: 'baemin', name: '배달의민족', emoji: '🟢', color: '#2AC1BC' },
  { key: 'coupang', name: '쿠팡이츠', emoji: '🔴', color: '#E0115F' },
  { key: 'yogiyo', name: '요기요', emoji: '🟠', color: '#FA0050' },
  { key: 'takeout', name: '포장', emoji: '📦', color: '#f59e0b' },
];

const emptyOrders = () => ({ baemin: 0, coupang: 0, yogiyo: 0, takeout: 0 });
const emptyRevenue = () => ({ baemin: 0, coupang: 0, yogiyo: 0, takeout: 0 });

export default function DailySales({ dailyLogs, setDailyLogs }) {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [orders, setOrders] = useState(emptyOrders());
  const [revenue, setRevenue] = useState(emptyRevenue());
  const [memo, setMemo] = useState('');

  const loadDay = (date) => {
    setSelectedDate(date);
    const existing = dailyLogs.find((l) => l.date === date);
    if (existing) {
      setOrders({ ...existing.orders });
      setRevenue({ ...existing.revenue });
      setMemo(existing.memo || '');
    } else {
      setOrders(emptyOrders());
      setRevenue(emptyRevenue());
      setMemo('');
    }
  };

  const totalOrders = useMemo(
    () => Object.values(orders).reduce((s, v) => s + Number(v || 0), 0),
    [orders]
  );
  const totalRevenue = useMemo(
    () => Object.values(revenue).reduce((s, v) => s + Number(v || 0), 0),
    [revenue]
  );
  const avgPrice = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const handleSave = () => {
    const entry = {
      date: selectedDate,
      orders: { ...orders },
      revenue: { ...revenue },
      memo,
    };
    setDailyLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === selectedDate);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry].sort((a, b) => b.date.localeCompare(a.date));
    });
  };

  const recentLogs = useMemo(
    () =>
      [...dailyLogs]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7),
    [dailyLogs]
  );

  const fmt = (n) => Number(n || 0).toLocaleString();

  return (
    <>
      <style>{`
        .ds-page { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
        .ds-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
        .ds-header p { font-size: 14px; color: var(--text-light); margin: 0 0 24px; }
        .ds-date-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .ds-date-row input[type="date"] {
          padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius);
          font-size: 15px; background: var(--bg-card); color: var(--text);
        }
        .ds-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .ds-platform-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 18px; box-shadow: var(--shadow-sm); position: relative; overflow: hidden;
        }
        .ds-platform-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
        }
        .ds-platform-card .ds-plat-name { font-size: 15px; font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
        .ds-platform-card label { display: block; font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
        .ds-platform-card input[type="number"] {
          width: 100%; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--radius);
          font-size: 14px; background: var(--bg); color: var(--text); margin-bottom: 10px; box-sizing: border-box;
        }
        .ds-platform-card .ds-avg { font-size: 13px; color: var(--text-light); text-align: right; }
        .ds-totals {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;
        }
        .ds-total-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 16px; text-align: center; box-shadow: var(--shadow-sm);
        }
        .ds-total-card .ds-total-label { font-size: 13px; color: var(--text-light); margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .ds-total-card .ds-total-value { font-size: 22px; font-weight: 700; color: var(--text-dark); }
        .ds-memo { margin-bottom: 20px; }
        .ds-memo textarea {
          width: 100%; min-height: 70px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius);
          font-size: 14px; background: var(--bg-card); color: var(--text); resize: vertical; box-sizing: border-box;
        }
        .ds-save-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px;
          background: var(--primary); color: #fff; border: none; border-radius: var(--radius);
          font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 32px;
        }
        .ds-save-btn:hover { opacity: 0.9; }
        .ds-history-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: var(--text-dark); }
        .ds-history-table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
        .ds-history-table th {
          padding: 10px 12px; font-size: 12px; font-weight: 600; color: var(--text-light);
          background: var(--bg); text-align: left; border-bottom: 1px solid var(--border);
        }
        .ds-history-table td { padding: 10px 12px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border-light); }
        .ds-history-table tr:last-child td { border-bottom: none; }
        .ds-history-table tbody tr { cursor: pointer; }
        .ds-history-table tbody tr:hover { background: var(--bg); }
        @media (max-width: 600px) {
          .ds-grid { grid-template-columns: 1fr 1fr; }
          .ds-totals { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ds-page">
        <div className="ds-header">
          <h1><Receipt size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} />일일 매출 기록</h1>
          <p>배달 플랫폼별 주문 수와 매출을 기록하세요.</p>
        </div>

        <div className="ds-date-row">
          <Calendar size={18} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => loadDay(e.target.value)}
          />
        </div>

        <div className="ds-grid">
          {PLATFORMS.map((p) => {
            const o = Number(orders[p.key] || 0);
            const r = Number(revenue[p.key] || 0);
            const a = o > 0 ? Math.round(r / o) : 0;
            return (
              <div className="ds-platform-card" key={p.key} style={{ borderTop: `4px solid ${p.color}` }}>
                <div className="ds-plat-name" style={{ color: p.color }}>
                  {p.emoji} {p.name}
                </div>
                <label>주문 수</label>
                <input
                  type="number"
                  min="0"
                  value={orders[p.key]}
                  onChange={(e) => setOrders((prev) => ({ ...prev, [p.key]: Number(e.target.value) || 0 }))}
                />
                <label>매출 (원)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={revenue[p.key]}
                  onChange={(e) => setRevenue((prev) => ({ ...prev, [p.key]: Number(e.target.value) || 0 }))}
                />
                <div className="ds-avg">평균 단가: {fmt(a)}원</div>
              </div>
            );
          })}
        </div>

        <div className="ds-totals">
          <div className="ds-total-card">
            <div className="ds-total-label"><ShoppingCart size={15} /> 총 주문</div>
            <div className="ds-total-value">{fmt(totalOrders)}건</div>
          </div>
          <div className="ds-total-card">
            <div className="ds-total-label"><TrendingUp size={15} /> 총 매출</div>
            <div className="ds-total-value">{fmt(totalRevenue)}원</div>
          </div>
          <div className="ds-total-card">
            <div className="ds-total-label"><Receipt size={15} /> 평균 단가</div>
            <div className="ds-total-value">{fmt(avgPrice)}원</div>
          </div>
        </div>

        <div className="ds-memo">
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6, display: 'block' }}>메모</label>
          <textarea
            placeholder="오늘의 특이사항, 이벤트, 날씨 등을 기록하세요..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <button className="ds-save-btn" onClick={handleSave}>
          <Save size={18} /> 저장
        </button>

        {recentLogs.length > 0 && (
          <>
            <div className="ds-history-title"><Clock size={18} /> 최근 7일 기록</div>
            <table className="ds-history-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>총 주문</th>
                  <th>총 매출</th>
                  <th>평균 단가</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => {
                  const tO = Object.values(log.orders || {}).reduce((s, v) => s + Number(v || 0), 0);
                  const tR = Object.values(log.revenue || {}).reduce((s, v) => s + Number(v || 0), 0);
                  const tA = tO > 0 ? Math.round(tR / tO) : 0;
                  return (
                    <tr key={log.date} onClick={() => loadDay(log.date)}>
                      <td>{log.date}</td>
                      <td>{fmt(tO)}건</td>
                      <td>{fmt(tR)}원</td>
                      <td>{fmt(tA)}원</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.memo || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
