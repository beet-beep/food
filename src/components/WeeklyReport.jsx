import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Download, Printer, FileText, BarChart3, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

function getWeekRange(weekOffset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
    label: `${monday.getFullYear()}.${String(monday.getMonth() + 1).padStart(2, '0')}.${String(monday.getDate()).padStart(2, '0')} ~ ${sunday.getFullYear()}.${String(sunday.getMonth() + 1).padStart(2, '0')}.${String(sunday.getDate()).padStart(2, '0')}`,
  };
}

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${d.getFullYear()}년 ${d.getMonth() + 1}월`,
    });
  }
  return months;
}

export default function WeeklyReport({ dailyLogs, menus, reviews, ledger, finance }) {
  const [tab, setTab] = useState('weekly');

  const tabs = [
    { id: 'weekly', label: '주간 리포트', icon: BarChart3 },
    { id: 'tax', label: '월말 세무 자료', icon: FileText },
  ];

  return (
    <div className="wr">
      <div className="page-header">
        <h1>리포트 & 세무 자료</h1>
        <p>주간 성과 리포트와 월별 세무 자료를 확인하세요</p>
      </div>

      <div className="wr-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`wr-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'weekly' && (
        <WeeklyTab dailyLogs={dailyLogs} menus={menus} reviews={reviews} />
      )}
      {tab === 'tax' && (
        <TaxTab dailyLogs={dailyLogs} ledger={ledger} finance={finance} />
      )}

      <style>{weeklyReportCSS}</style>
    </div>
  );
}

/* ========== Tab 1: 주간 리포트 ========== */
function WeeklyTab({ dailyLogs, menus, reviews }) {
  const weekOptions = useMemo(() => {
    const opts = [];
    for (let i = -1; i >= -8; i--) {
      const w = getWeekRange(i);
      opts.push({ offset: i, ...w });
    }
    // Include current week
    const current = getWeekRange(0);
    opts.unshift({ offset: 0, ...current, label: `이번 주: ${current.label}` });
    return opts;
  }, []);

  const [selectedWeek, setSelectedWeek] = useState(-1);
  const week = useMemo(() => getWeekRange(selectedWeek), [selectedWeek]);
  const prevWeek = useMemo(() => getWeekRange(selectedWeek - 1), [selectedWeek]);

  // Filter logs for current and previous week
  const weekLogs = useMemo(() => {
    return dailyLogs.filter(l => l.date >= week.start && l.date <= week.end)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyLogs, week]);

  const prevWeekLogs = useMemo(() => {
    return dailyLogs.filter(l => l.date >= prevWeek.start && l.date <= prevWeek.end);
  }, [dailyLogs, prevWeek]);

  // Calculate metrics
  const calcMetrics = (logs) => {
    const totalRevenue = logs.reduce((s, l) => {
      return s + Object.values(l.revenue || {}).reduce((a, v) => a + Number(v || 0), 0);
    }, 0);
    const totalOrders = logs.reduce((s, l) => {
      return s + Object.values(l.orders || {}).reduce((a, v) => a + Number(v || 0), 0);
    }, 0);
    const days = logs.length || 1;
    const avgDailyOrders = Math.round(totalOrders / days);
    const avgDailyRevenue = Math.round(totalRevenue / days);

    // Best day
    let bestDay = null;
    let bestDayRevenue = 0;
    logs.forEach(l => {
      const dayRev = Object.values(l.revenue || {}).reduce((a, v) => a + Number(v || 0), 0);
      if (dayRev > bestDayRevenue) {
        bestDayRevenue = dayRev;
        bestDay = l.date;
      }
    });

    // Best platform
    const platformTotals = {};
    logs.forEach(l => {
      Object.entries(l.revenue || {}).forEach(([key, val]) => {
        platformTotals[key] = (platformTotals[key] || 0) + Number(val || 0);
      });
    });
    const bestPlatform = Object.entries(platformTotals).sort((a, b) => b[1] - a[1])[0];

    return { totalRevenue, totalOrders, avgDailyOrders, avgDailyRevenue, bestDay, bestDayRevenue, bestPlatform, platformTotals };
  };

  const current = useMemo(() => calcMetrics(weekLogs), [weekLogs]);
  const prev = useMemo(() => calcMetrics(prevWeekLogs), [prevWeekLogs]);

  const pctChange = (cur, prv) => {
    if (!prv || prv === 0) return null;
    return ((cur - prv) / prv * 100).toFixed(1);
  };

  // Review stats for the week
  const weekReviews = useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) return { count: 0, avgRating: 0 };
    const filtered = reviews.filter(r => r.date >= week.start && r.date <= week.end);
    const avgRating = filtered.length > 0
      ? (filtered.reduce((s, r) => s + (r.rating || 0), 0) / filtered.length).toFixed(1)
      : 0;
    return { count: filtered.length, avgRating };
  }, [reviews, week]);

  // Bar chart data
  const DAYS_KO = ['월', '화', '수', '목', '금', '토', '일'];
  const barData = useMemo(() => {
    const days = [];
    const d = new Date(week.start);
    for (let i = 0; i < 7; i++) {
      const dateStr = d.toISOString().split('T')[0];
      const log = weekLogs.find(l => l.date === dateStr);
      const revenue = log ? Object.values(log.revenue || {}).reduce((a, v) => a + Number(v || 0), 0) : 0;
      days.push({ date: dateStr, label: DAYS_KO[i], revenue });
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [weekLogs, week]);

  const maxRevenue = Math.max(...barData.map(d => d.revenue), 1);

  const PLATFORM_NAMES = { baemin: '배달의민족', coupang: '쿠팡이츠', yogiyo: '요기요', takeout: '포장' };

  return (
    <div className="wr-section wr-print-area">
      {/* Week Selector */}
      <div className="wr-controls">
        <div className="wr-week-select">
          <Calendar size={16} />
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
            {weekOptions.map(w => (
              <option key={w.offset} value={w.offset}>{w.label}</option>
            ))}
          </select>
        </div>
        <button className="wr-print-btn" onClick={() => window.print()}>
          <Printer size={16} /> 인쇄
        </button>
      </div>

      {/* Period */}
      <div className="wr-period">{week.label}</div>

      {/* Key Metrics */}
      <div className="wr-metrics">
        <MetricCard
          label="총 매출"
          value={`${fmt(current.totalRevenue)}원`}
          change={pctChange(current.totalRevenue, prev.totalRevenue)}
          icon={DollarSign}
        />
        <MetricCard
          label="총 주문"
          value={`${fmt(current.totalOrders)}건`}
          change={pctChange(current.totalOrders, prev.totalOrders)}
          icon={TrendingUp}
        />
        <MetricCard
          label="일평균 주문"
          value={`${fmt(current.avgDailyOrders)}건`}
          change={pctChange(current.avgDailyOrders, prev.avgDailyOrders)}
          icon={BarChart3}
        />
        <MetricCard
          label="일평균 매출"
          value={`${fmt(current.avgDailyRevenue)}원`}
          change={pctChange(current.avgDailyRevenue, prev.avgDailyRevenue)}
          icon={DollarSign}
        />
      </div>

      {/* Details */}
      <div className="wr-details">
        <div className="wr-detail-card">
          <h4>최고 매출일</h4>
          <p className="wr-detail-val">{current.bestDay ? `${current.bestDay.slice(5)} (${fmt(current.bestDayRevenue)}원)` : '-'}</p>
        </div>
        <div className="wr-detail-card">
          <h4>최고 플랫폼</h4>
          <p className="wr-detail-val">
            {current.bestPlatform ? `${PLATFORM_NAMES[current.bestPlatform[0]] || current.bestPlatform[0]} (${fmt(current.bestPlatform[1])}원)` : '-'}
          </p>
        </div>
        <div className="wr-detail-card">
          <h4>리뷰</h4>
          <p className="wr-detail-val">
            {weekReviews.count}건 / 평균 {weekReviews.avgRating}점
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="wr-chart-card">
        <h3 className="wr-section-title"><BarChart3 size={16} /> 일별 매출</h3>
        <div className="wr-bar-chart">
          {barData.map((d, i) => (
            <div key={i} className="wr-bar-col">
              <div className="wr-bar-value">{d.revenue > 0 ? `${Math.round(d.revenue / 10000)}만` : ''}</div>
              <div className="wr-bar-track">
                <div
                  className="wr-bar-fill"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <div className="wr-bar-label">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Breakdown */}
      {Object.keys(current.platformTotals).length > 0 && (
        <div className="wr-platform-card">
          <h3 className="wr-section-title"><TrendingUp size={16} /> 플랫폼별 매출</h3>
          <div className="wr-platform-list">
            {Object.entries(current.platformTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([key, val]) => {
                const pct = current.totalRevenue > 0 ? ((val / current.totalRevenue) * 100).toFixed(1) : 0;
                return (
                  <div key={key} className="wr-platform-row">
                    <span className="wr-plat-name">{PLATFORM_NAMES[key] || key}</span>
                    <div className="wr-plat-bar-wrap">
                      <div className="wr-plat-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="wr-plat-val">{fmt(val)}원 ({pct}%)</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, change, icon: Icon }) {
  const isUp = change !== null && Number(change) > 0;
  const isDown = change !== null && Number(change) < 0;
  return (
    <div className="wr-metric">
      <div className="wr-metric-icon"><Icon size={18} /></div>
      <p className="wr-metric-label">{label}</p>
      <p className="wr-metric-value">{value}</p>
      {change !== null && (
        <p className={`wr-metric-change ${isUp ? 'up' : ''} ${isDown ? 'down' : ''}`}>
          {isUp ? <ArrowUp size={12} /> : isDown ? <ArrowDown size={12} /> : null}
          {isUp ? '+' : ''}{change}%
          <span className="wr-vs"> vs 전주</span>
        </p>
      )}
    </div>
  );
}

/* ========== Tab 2: 월말 세무 자료 ========== */
function TaxTab({ dailyLogs, ledger, finance }) {
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]?.value || '');

  // Find ledger entry for selected month
  const ledgerEntry = useMemo(() => {
    if (!ledger || !Array.isArray(ledger)) return null;
    return ledger.find(l => l.yearMonth === selectedMonth) || null;
  }, [ledger, selectedMonth]);

  // Calculate from dailyLogs if no ledger entry
  const monthLogs = useMemo(() => {
    return dailyLogs.filter(l => l.date && l.date.startsWith(selectedMonth));
  }, [dailyLogs, selectedMonth]);

  const PLATFORM_NAMES = { baemin: '배달의민족', coupang: '쿠팡이츠', yogiyo: '요기요', takeout: '포장' };

  // Revenue from ledger or dailyLogs
  const revenue = useMemo(() => {
    if (ledgerEntry && ledgerEntry.revenue) {
      return Object.entries(ledgerEntry.revenue).reduce((s, [, v]) => s + Number(v || 0), 0);
    }
    return monthLogs.reduce((s, l) => {
      return s + Object.values(l.revenue || {}).reduce((a, v) => a + Number(v || 0), 0);
    }, 0);
  }, [ledgerEntry, monthLogs]);

  const revenueByPlatform = useMemo(() => {
    const totals = {};
    if (ledgerEntry && ledgerEntry.revenue) {
      Object.entries(ledgerEntry.revenue).forEach(([k, v]) => {
        totals[k] = Number(v || 0);
      });
    } else {
      monthLogs.forEach(l => {
        Object.entries(l.revenue || {}).forEach(([k, v]) => {
          totals[k] = (totals[k] || 0) + Number(v || 0);
        });
      });
    }
    return totals;
  }, [ledgerEntry, monthLogs]);

  const expense = useMemo(() => {
    if (ledgerEntry && ledgerEntry.expense) {
      return Object.entries(ledgerEntry.expense).reduce((s, [, v]) => s + Number(v || 0), 0);
    }
    return 0;
  }, [ledgerEntry]);

  const expenseByCategory = useMemo(() => {
    if (ledgerEntry && ledgerEntry.expense) return ledgerEntry.expense;
    return {};
  }, [ledgerEntry]);

  const profit = revenue - expense;

  // 간이과세 부가세 예상: 매출 x 15% x 10%
  const vatEstimate = Math.round(revenue * 0.15 * 0.1);

  // CSV download
  const downloadCSV = () => {
    let csv = '구분,항목,금액\n';
    csv += `매출,총매출,${revenue}\n`;
    Object.entries(revenueByPlatform).forEach(([k, v]) => {
      csv += `매출,${PLATFORM_NAMES[k] || k},${v}\n`;
    });
    csv += `지출,총지출,${expense}\n`;
    Object.entries(expenseByCategory).forEach(([k, v]) => {
      csv += `지출,${k},${v}\n`;
    });
    csv += `손익,순이익,${profit}\n`;
    csv += `세금,간이과세 부가세 예상,${vatEstimate}\n`;

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `월별_매출지출_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy summary
  const [copied, setCopied] = useState(false);
  const getSummaryText = () => {
    let text = `[세무사 제출용 요약]\n`;
    text += `기간: ${selectedMonth}\n`;
    text += `────────────────\n`;
    text += `총 매출: ${fmt(revenue)}원 (카드매출)\n`;
    Object.entries(revenueByPlatform).forEach(([k, v]) => {
      text += `  - ${PLATFORM_NAMES[k] || k}: ${fmt(v)}원\n`;
    });
    text += `총 지출: ${fmt(expense)}원\n`;
    Object.entries(expenseByCategory).forEach(([k, v]) => {
      if (Number(v) > 0) text += `  - ${k}: ${fmt(v)}원\n`;
    });
    text += `────────────────\n`;
    text += `순이익: ${fmt(profit)}원\n`;
    text += `간이과세 부가세 예상: ${fmt(vatEstimate)}원\n`;
    text += `(매출 x 음식점 부가가치율 15% x 10%)\n`;
    return text;
  };

  const copySummary = () => {
    navigator.clipboard.writeText(getSummaryText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const EXPENSE_LABELS = {
    ingredients: '식재료', rent: '임대료', labor: '인건비', utilities: '공과금',
    packaging: '포장재', delivery: '배달비', platform: '플랫폼 수수료',
    marketing: '마케팅', etc: '기타',
  };

  return (
    <div className="wr-section">
      {/* Month Selector */}
      <div className="wr-controls">
        <div className="wr-week-select">
          <Calendar size={16} />
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="wr-btn-group">
          <button className="wr-action-btn" onClick={downloadCSV}>
            <Download size={16} /> CSV 다운로드
          </button>
          <button className="wr-action-btn secondary" onClick={copySummary}>
            <FileText size={16} /> {copied ? '복사됨!' : '세무사 요약 복사'}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="wr-tax-stats">
        <div className="wr-tax-stat blue">
          <p className="wr-tax-label">총 매출 (카드)</p>
          <p className="wr-tax-val">{fmt(revenue)}원</p>
        </div>
        <div className="wr-tax-stat orange">
          <p className="wr-tax-label">총 지출</p>
          <p className="wr-tax-val">{fmt(expense)}원</p>
        </div>
        <div className={`wr-tax-stat ${profit >= 0 ? 'green' : 'red'}`}>
          <p className="wr-tax-label">순이익</p>
          <p className="wr-tax-val">{fmt(profit)}원</p>
        </div>
        <div className="wr-tax-stat purple">
          <p className="wr-tax-label">부가세 예상</p>
          <p className="wr-tax-val">{fmt(vatEstimate)}원</p>
          <p className="wr-tax-sub">매출 x 15% x 10%</p>
        </div>
      </div>

      {/* Revenue by Platform */}
      <div className="wr-tax-card">
        <h3 className="wr-section-title"><DollarSign size={16} /> 플랫폼별 매출</h3>
        <div className="wr-tax-table-wrap">
          <table className="wr-tax-table">
            <thead>
              <tr><th>플랫폼</th><th className="r">매출액</th><th className="r">비율</th></tr>
            </thead>
            <tbody>
              {Object.entries(revenueByPlatform)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <tr key={k}>
                    <td>{PLATFORM_NAMES[k] || k}</td>
                    <td className="r">{fmt(v)}원</td>
                    <td className="r">{revenue > 0 ? ((v / revenue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              <tr className="wr-total-row">
                <td><strong>합계</strong></td>
                <td className="r"><strong>{fmt(revenue)}원</strong></td>
                <td className="r"><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense by Category */}
      <div className="wr-tax-card">
        <h3 className="wr-section-title"><TrendingUp size={16} /> 카테고리별 지출</h3>
        <div className="wr-tax-table-wrap">
          <table className="wr-tax-table">
            <thead>
              <tr><th>항목</th><th className="r">금액</th><th className="r">비율</th></tr>
            </thead>
            <tbody>
              {Object.entries(expenseByCategory)
                .filter(([, v]) => Number(v) > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <tr key={k}>
                    <td>{EXPENSE_LABELS[k] || k}</td>
                    <td className="r">{fmt(v)}원</td>
                    <td className="r">{expense > 0 ? ((v / expense) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              <tr className="wr-total-row">
                <td><strong>합계</strong></td>
                <td className="r"><strong>{fmt(expense)}원</strong></td>
                <td className="r"><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Summary */}
      <div className="wr-tax-card summary">
        <h3 className="wr-section-title"><FileText size={16} /> 세무사 제출용 요약</h3>
        <pre className="wr-tax-summary">{getSummaryText()}</pre>
        <button className="wr-action-btn" onClick={copySummary} style={{ marginTop: 12 }}>
          <FileText size={16} /> {copied ? '복사됨!' : '클립보드에 복사'}
        </button>
      </div>
    </div>
  );
}

/* ========== CSS ========== */
const weeklyReportCSS = `
  .wr { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
  .wr .page-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
  .wr .page-header p { font-size: 14px; color: var(--text-light); margin: 0 0 24px; }

  .wr-tab-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .wr-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 18px; border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg-card); color: var(--text); font-size: 14px; font-weight: 500; cursor: pointer;
  }
  .wr-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

  .wr-section { margin-bottom: 24px; }
  .wr-section-title {
    font-size: 17px; font-weight: 600; margin: 0 0 14px; display: flex; align-items: center; gap: 8px;
    color: var(--text-dark);
  }

  .wr-controls {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
    justify-content: space-between;
  }
  .wr-week-select {
    display: flex; align-items: center; gap: 8px;
  }
  .wr-week-select select {
    padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius);
    font-size: 14px; background: var(--bg-card); color: var(--text); cursor: pointer; min-width: 240px;
  }
  .wr-btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
  .wr-print-btn, .wr-action-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px;
    border: 1px solid var(--primary); border-radius: var(--radius);
    background: var(--primary); color: #fff; font-size: 13px; font-weight: 500; cursor: pointer;
  }
  .wr-print-btn:hover, .wr-action-btn:hover { opacity: 0.9; }
  .wr-action-btn.secondary { background: var(--bg-card); color: var(--primary); }
  .wr-action-btn.secondary:hover { background: color-mix(in srgb, var(--primary) 10%, var(--bg-card)); }

  .wr-period {
    font-size: 20px; font-weight: 700; color: var(--text-dark); margin-bottom: 20px;
    padding: 14px 20px; background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); text-align: center;
  }

  /* Metrics */
  .wr-metrics {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;
  }
  .wr-metric {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 16px; box-shadow: var(--shadow-sm); text-align: center;
  }
  .wr-metric-icon { color: var(--primary); margin-bottom: 6px; }
  .wr-metric-label { font-size: 12px; color: var(--text-light); margin: 0 0 4px; }
  .wr-metric-value { font-size: 20px; font-weight: 700; color: var(--text-dark); margin: 0 0 4px; }
  .wr-metric-change { font-size: 12px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 2px; }
  .wr-metric-change.up { color: #16a34a; }
  .wr-metric-change.down { color: #dc2626; }
  .wr-vs { color: var(--text-light); margin-left: 4px; }

  /* Details */
  .wr-details {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px;
  }
  .wr-detail-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 16px; box-shadow: var(--shadow-sm);
  }
  .wr-detail-card h4 { font-size: 13px; color: var(--text-light); margin: 0 0 6px; }
  .wr-detail-val { font-size: 16px; font-weight: 600; color: var(--text-dark); margin: 0; }

  /* Bar Chart */
  .wr-chart-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm);
  }
  .wr-bar-chart { display: flex; justify-content: space-around; align-items: flex-end; height: 180px; gap: 8px; }
  .wr-bar-col { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; }
  .wr-bar-value { font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; min-height: 16px; }
  .wr-bar-track { flex: 1; width: 100%; max-width: 50px; display: flex; align-items: flex-end; }
  .wr-bar-fill {
    width: 100%; background: var(--primary); border-radius: 4px 4px 0 0;
    min-height: 2px; transition: height 0.3s;
  }
  .wr-bar-label { font-size: 13px; font-weight: 600; color: var(--text); margin-top: 8px; }

  /* Platform Card */
  .wr-platform-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm);
  }
  .wr-platform-list { display: flex; flex-direction: column; gap: 12px; }
  .wr-platform-row { display: flex; align-items: center; gap: 12px; }
  .wr-plat-name { font-size: 14px; font-weight: 500; color: var(--text); min-width: 100px; }
  .wr-plat-bar-wrap { flex: 1; height: 20px; background: var(--bg); border-radius: 10px; overflow: hidden; }
  .wr-plat-bar { height: 100%; background: var(--primary); border-radius: 10px; transition: width 0.3s; min-width: 2px; }
  .wr-plat-val { font-size: 13px; font-weight: 500; color: var(--text-dark); min-width: 150px; text-align: right; }

  /* Tax Tab */
  .wr-tax-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .wr-tax-stat {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border-top: 4px solid var(--border);
  }
  .wr-tax-stat.blue { border-top-color: #3b82f6; }
  .wr-tax-stat.orange { border-top-color: #f59e0b; }
  .wr-tax-stat.green { border-top-color: #16a34a; }
  .wr-tax-stat.red { border-top-color: #dc2626; }
  .wr-tax-stat.purple { border-top-color: #8b5cf6; }
  .wr-tax-label { font-size: 12px; color: var(--text-light); margin: 0 0 6px; }
  .wr-tax-val { font-size: 20px; font-weight: 700; color: var(--text-dark); margin: 0; }
  .wr-tax-sub { font-size: 11px; color: var(--text-light); margin: 4px 0 0; }

  .wr-tax-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow-sm);
  }
  .wr-tax-card.summary { background: var(--bg); }
  .wr-tax-table-wrap { overflow-x: auto; }
  .wr-tax-table {
    width: 100%; border-collapse: collapse; font-size: 14px;
  }
  .wr-tax-table th {
    padding: 10px 14px; font-size: 12px; font-weight: 600; color: var(--text-light);
    background: var(--bg); text-align: left; border-bottom: 2px solid var(--border);
  }
  .wr-tax-table th.r, .wr-tax-table td.r { text-align: right; }
  .wr-tax-table td {
    padding: 10px 14px; color: var(--text); border-bottom: 1px solid var(--border-light);
  }
  .wr-total-row { background: var(--bg); }
  .wr-total-row td { border-top: 2px solid var(--border); }

  .wr-tax-summary {
    font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6;
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 16px; white-space: pre-wrap; color: var(--text); margin: 0; overflow-x: auto;
  }

  /* Print styles */
  @media print {
    body * { visibility: hidden; }
    .wr-print-area, .wr-print-area * { visibility: visible; }
    .wr-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
    .wr-controls, .wr-tab-bar, .wr-print-btn { display: none !important; }
    .wr-metric, .wr-detail-card, .wr-chart-card, .wr-platform-card {
      break-inside: avoid; border: 1px solid #ddd;
    }
  }

  @media (max-width: 768px) {
    .wr-metrics { grid-template-columns: repeat(2, 1fr); }
    .wr-details { grid-template-columns: 1fr; }
    .wr-tax-stats { grid-template-columns: repeat(2, 1fr); }
    .wr-controls { flex-direction: column; align-items: stretch; }
    .wr-week-select select { min-width: auto; width: 100%; }
    .wr-plat-val { min-width: auto; font-size: 12px; }
  }
  @media (max-width: 480px) {
    .wr-metrics { grid-template-columns: 1fr; }
    .wr-tax-stats { grid-template-columns: 1fr; }
  }
`;
