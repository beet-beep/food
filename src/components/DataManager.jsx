import { useState, useMemo, useEffect } from 'react';
import {
  Download, Upload, FileText, Bell, Trash2, HardDrive, Calendar,
  AlertTriangle, Check, Info, RefreshCw, Printer, Shield, Database,
} from 'lucide-react';

const STORAGE_KEY = 'food-startup-data';
const BACKUP_DATE_KEY = 'food-last-backup-date';
const NOTIF_READ_KEY = 'food-notifications-read';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

const revenueLabels = {
  baemin: '배달의민족', coupang: '쿠팡이츠', yogiyo: '요기요',
  takeout: '포장 주문', other: '기타',
};
const expenseLabels = {
  rent: '월세', maintenance: '관리비', ingredients: '식재료비',
  packaging: '포장재', platformFee: '플랫폼 수수료', deliveryFee: '배달대행비',
  labor: '인건비', utility: '공과금', internet: '인터넷/통신',
  advertising: '광고/마케팅', equipment: '장비/비품', other: '기타',
};

/* ================================================================
   DATA MANAGER — 데이터 관리 센터
   ================================================================ */
export default function DataManager({
  onExportAll, onImportAll, ledger, dailyLogs, menus, finance, reviews, opsData,
}) {
  const [tab, setTab] = useState('backup');

  const tabs = [
    { id: 'backup',  label: '데이터 백업',   icon: HardDrive },
    { id: 'report',  label: '월간 보고서',   icon: FileText },
    { id: 'alerts',  label: '알림 센터',     icon: Bell },
    { id: 'system',  label: '시스템 정보',   icon: Database },
  ];

  return (
    <div className="dm">
      <div className="dm-page-header">
        <h1>데이터 관리</h1>
        <p>백업, 보고서, 알림, 시스템 정보를 관리합니다</p>
      </div>

      <div className="dm-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`dm-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'backup'  && <BackupTab onExportAll={onExportAll} onImportAll={onImportAll} />}
      {tab === 'report'  && <ReportTab ledger={ledger} dailyLogs={dailyLogs} menus={menus} reviews={reviews} opsData={opsData} />}
      {tab === 'alerts'  && <AlertsTab reviews={reviews} opsData={opsData} ledger={ledger} dailyLogs={dailyLogs} />}
      {tab === 'system'  && <SystemTab ledger={ledger} dailyLogs={dailyLogs} menus={menus} reviews={reviews} opsData={opsData} onImportAll={onImportAll} />}

      <style>{dmCSS}</style>
    </div>
  );
}

/* ================================================================
   TAB 1: 데이터 백업
   ================================================================ */
function BackupTab({ onExportAll, onImportAll }) {
  const [lastBackup, setLastBackup] = useState(() => {
    try { return localStorage.getItem(BACKUP_DATE_KEY) || null; } catch { return null; }
  });
  const [dataSize, setDataSize] = useState(0);
  const [importPreview, setImportPreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || '';
      setDataSize((new Blob([raw]).size / 1024).toFixed(1));
    } catch { setDataSize(0); }
  }, []);

  const handleExport = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || '{}';
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `food-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      localStorage.setItem(BACKUP_DATE_KEY, now);
      setLastBackup(now);
    } catch (e) {
      alert('내보내기 실패: ' + e.message);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const preview = {};
        if (parsed.menus) preview['메뉴'] = Array.isArray(parsed.menus) ? parsed.menus.length : '있음';
        if (parsed.dailyLogs) preview['일일 매출 기록'] = Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs.length : '있음';
        if (parsed.reviews) preview['리뷰'] = Array.isArray(parsed.reviews) ? parsed.reviews.length : '있음';
        if (parsed.ledger) preview['월별 장부'] = Array.isArray(parsed.ledger) ? parsed.ledger.length + '개월' : '있음';
        if (parsed.tasks) preview['체크리스트'] = '있음';
        if (parsed.admin) preview['행정 절차'] = Array.isArray(parsed.admin) ? parsed.admin.length : '있음';
        if (parsed.competitors) preview['경쟁사'] = Array.isArray(parsed.competitors) ? parsed.competitors.length : '있음';
        if (parsed.costData) preview['원가 데이터'] = '있음';
        if (parsed.opsData) preview['운영 데이터'] = '있음';
        if (parsed.finance) preview['재무 데이터'] = '있음';
        if (parsed.growthData) preview['성장 계획'] = '있음';
        if (parsed.priceData) preview['식재료 가격'] = '있음';

        setImportPreview(preview);
        setPendingData(ev.target.result);
        setShowConfirm(true);
      } catch {
        alert('유효하지 않은 JSON 파일입니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (pendingData && onImportAll) {
      onImportAll(pendingData);
      setShowConfirm(false);
      setPendingData(null);
      setImportPreview(null);
      alert('데이터를 성공적으로 가져왔습니다. 페이지가 새로고침됩니다.');
      window.location.reload();
    }
  };

  const cancelImport = () => {
    setShowConfirm(false);
    setPendingData(null);
    setImportPreview(null);
  };

  return (
    <div className="dm-tab-content">
      <div className="dm-card">
        <h3 className="dm-card-title"><Download size={16} /> 데이터 내보내기</h3>
        <p className="dm-desc">모든 앱 데이터를 JSON 파일로 다운로드합니다.</p>
        <button className="dm-btn primary" onClick={handleExport}>
          <Download size={14} /> 전체 데이터 내보내기 (JSON)
        </button>
        {lastBackup && (
          <p className="dm-meta">
            <Calendar size={12} /> 마지막 백업: {new Date(lastBackup).toLocaleString('ko-KR')}
          </p>
        )}
      </div>

      <div className="dm-card">
        <h3 className="dm-card-title"><Upload size={16} /> 데이터 가져오기</h3>
        <p className="dm-desc">이전에 백업한 JSON 파일을 선택하세요.</p>
        <label className="dm-file-label">
          <Upload size={14} /> 파일 선택
          <input type="file" accept=".json" onChange={handleFileSelect} style={{ display: 'none' }} />
        </label>

        {showConfirm && importPreview && (
          <div className="dm-import-preview">
            <h4><Info size={14} /> 가져올 데이터 미리보기</h4>
            <div className="dm-preview-grid">
              {Object.entries(importPreview).map(([key, val]) => (
                <div key={key} className="dm-preview-item">
                  <span className="dm-preview-key">{key}</span>
                  <span className="dm-preview-val">{val}</span>
                </div>
              ))}
            </div>
            <div className="dm-warn-box">
              <AlertTriangle size={14} />
              <span>가져오기를 진행하면 현재 데이터가 모두 덮어씌워집니다.</span>
            </div>
            <div className="dm-btn-row">
              <button className="dm-btn danger" onClick={confirmImport}>
                <Check size={14} /> 확인, 데이터 덮어쓰기
              </button>
              <button className="dm-btn ghost" onClick={cancelImport}>취소</button>
            </div>
          </div>
        )}
      </div>

      <div className="dm-card">
        <h3 className="dm-card-title"><HardDrive size={16} /> 저장 공간</h3>
        <div className="dm-size-display">
          <span className="dm-size-number">{dataSize} KB</span>
          <span className="dm-size-label">현재 데이터 크기</span>
        </div>
        <div className="dm-size-bar-track">
          <div
            className="dm-size-bar-fill"
            style={{ width: `${Math.min((dataSize / 5120) * 100, 100)}%` }}
          />
        </div>
        <p className="dm-meta">localStorage 제한: 약 5,120 KB (5MB)</p>
      </div>

      <div className="dm-warn-card">
        <AlertTriangle size={16} />
        <div>
          <strong>정기적으로 백업하세요.</strong>
          <p>브라우저 데이터 삭제 시 모든 데이터가 사라집니다. 최소 주 1회 백업을 권장합니다.</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 2: 월간 보고서
   ================================================================ */
function ReportTab({ ledger, dailyLogs, menus, reviews, opsData }) {
  const months = (ledger || []).map(m => m.yearMonth);
  const [selectedMonth, setSelectedMonth] = useState(months[0] || '2026-04');

  const report = useMemo(() => {
    const ml = (ledger || []).find(m => m.yearMonth === selectedMonth);
    if (!ml) return null;

    const revenue = ml.revenue || {};
    const expense = ml.expense || {};
    const orders = ml.orders || {};

    const totalRevenue = Object.values(revenue).reduce((s, v) => s + v, 0);
    const totalExpense = Object.values(expense).reduce((s, v) => s + v, 0);
    const profit = totalRevenue - totalExpense;
    const marginRate = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0.0';

    const totalOrders = Object.values(orders).reduce((s, v) => s + v, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // daily average (from daily logs in this month)
    const monthLogs = (dailyLogs || []).filter(d => d.date && d.date.startsWith(selectedMonth));
    const daysWithData = monthLogs.length || 1;
    const dailyAvgRevenue = totalRevenue > 0 ? Math.round(totalRevenue / Math.max(daysWithData, 1)) : 0;

    // revenue by platform
    const revenueByPlatform = Object.entries(revenue)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ key: k, label: revenueLabels[k] || k, amount: v }));

    // expense by category
    const expenseByCategory = Object.entries(expense)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ key: k, label: expenseLabels[k] || k, amount: v }));

    // orders by platform
    const ordersByPlatform = Object.entries(orders)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ key: k, label: revenueLabels[k] || k, count: v }));

    // menu performance (estimated)
    const menuPerf = (menus || []).map(m => {
      const estimatedOrders = totalOrders > 0 ? Math.round(totalOrders / (menus || []).length) : 0;
      const estimatedRevenue = estimatedOrders * (m.price || 0);
      return { name: m.name, estimatedOrders, estimatedRevenue, price: m.price || 0 };
    });

    // reviews this month
    const monthReviews = (reviews || []).filter(r => r.date && r.date.startsWith(selectedMonth));
    const avgRating = monthReviews.length > 0
      ? (monthReviews.reduce((s, r) => s + (r.rating || 0), 0) / monthReviews.length).toFixed(1)
      : '-';

    // hygiene (from opsData)
    const hygieneCompletion = '-';

    return {
      totalRevenue, totalExpense, profit, marginRate,
      totalOrders, avgOrderValue, dailyAvgRevenue,
      revenueByPlatform, expenseByCategory, ordersByPlatform,
      menuPerf, monthReviews, avgRating, hygieneCompletion,
    };
  }, [selectedMonth, ledger, dailyLogs, menus, reviews, opsData]);

  const [year, month] = selectedMonth.split('-');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dm-tab-content">
      <div className="dm-card">
        <div className="dm-report-header">
          <select
            className="dm-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {months.map(m => (
              <option key={m} value={m}>{m.replace('-', '년 ')}월</option>
            ))}
          </select>
          <button className="dm-btn ghost" onClick={handlePrint}>
            <Printer size={14} /> 인쇄
          </button>
        </div>
      </div>

      {report && (
        <div className="dm-report print-area">
          <div className="dm-card dm-report-section">
            <h2 className="dm-report-title">
              <FileText size={18} /> {year}년 {parseInt(month)}월 운영 보고서
            </h2>
          </div>

          {/* 매출 요약 */}
          <div className="dm-card dm-report-section">
            <h3 className="dm-card-title"><Database size={16} /> 매출 요약</h3>
            <div className="dm-stat-row">
              <div className="dm-stat-item">
                <span className="dm-stat-label">총 매출</span>
                <span className="dm-stat-value blue">{fmt(report.totalRevenue)}원</span>
              </div>
              <div className="dm-stat-item">
                <span className="dm-stat-label">일평균 매출</span>
                <span className="dm-stat-value">{fmt(report.dailyAvgRevenue)}원</span>
              </div>
            </div>
            {report.revenueByPlatform.length > 0 && (
              <div className="dm-breakdown">
                <h4>플랫폼별 매출</h4>
                {report.revenueByPlatform.map(p => (
                  <div key={p.key} className="dm-breakdown-row">
                    <span>{p.label}</span>
                    <span className="dm-breakdown-val">{fmt(p.amount)}원</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 지출 요약 */}
          <div className="dm-card dm-report-section">
            <h3 className="dm-card-title"><AlertTriangle size={16} /> 지출 요약</h3>
            <div className="dm-stat-row">
              <div className="dm-stat-item">
                <span className="dm-stat-label">총 지출</span>
                <span className="dm-stat-value red">{fmt(report.totalExpense)}원</span>
              </div>
            </div>
            {report.expenseByCategory.length > 0 && (
              <div className="dm-breakdown">
                <h4>카테고리별 지출</h4>
                {report.expenseByCategory.map(c => (
                  <div key={c.key} className="dm-breakdown-row">
                    <span>{c.label}</span>
                    <span className="dm-breakdown-val">{fmt(c.amount)}원</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 손익 */}
          <div className="dm-card dm-report-section">
            <h3 className="dm-card-title"><Shield size={16} /> 손익</h3>
            <div className="dm-stat-row">
              <div className="dm-stat-item">
                <span className="dm-stat-label">순이익</span>
                <span className={`dm-stat-value ${report.profit >= 0 ? 'blue' : 'red'}`}>
                  {report.profit >= 0 ? '+' : ''}{fmt(report.profit)}원
                </span>
              </div>
              <div className="dm-stat-item">
                <span className="dm-stat-label">이익률</span>
                <span className={`dm-stat-value ${report.profit >= 0 ? 'blue' : 'red'}`}>
                  {report.marginRate}%
                </span>
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="dm-card dm-report-section">
            <h3 className="dm-card-title"><Calendar size={16} /> 주문 요약</h3>
            <div className="dm-stat-row">
              <div className="dm-stat-item">
                <span className="dm-stat-label">총 주문</span>
                <span className="dm-stat-value">{fmt(report.totalOrders)}건</span>
              </div>
              <div className="dm-stat-item">
                <span className="dm-stat-label">평균 객단가</span>
                <span className="dm-stat-value">{fmt(report.avgOrderValue)}원</span>
              </div>
            </div>
            {report.ordersByPlatform.length > 0 && (
              <div className="dm-breakdown">
                <h4>플랫폼별 주문</h4>
                {report.ordersByPlatform.map(p => (
                  <div key={p.key} className="dm-breakdown-row">
                    <span>{p.label}</span>
                    <span className="dm-breakdown-val">{fmt(p.count)}건</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 메뉴 실적 */}
          {report.menuPerf.length > 0 && (
            <div className="dm-card dm-report-section">
              <h3 className="dm-card-title"><FileText size={16} /> 메뉴 실적 (추정)</h3>
              <div className="dm-table-wrap">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>메뉴</th><th>단가</th><th>추정 주문수</th><th>추정 매출</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.menuPerf.map(m => (
                      <tr key={m.name}>
                        <td>{m.name}</td>
                        <td className="r">{fmt(m.price)}원</td>
                        <td className="r">{fmt(m.estimatedOrders)}건</td>
                        <td className="r">{fmt(m.estimatedRevenue)}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 리뷰 요약 */}
          <div className="dm-card dm-report-section">
            <h3 className="dm-card-title"><Bell size={16} /> 리뷰 요약</h3>
            <div className="dm-stat-row">
              <div className="dm-stat-item">
                <span className="dm-stat-label">이번 달 리뷰</span>
                <span className="dm-stat-value">{report.monthReviews.length}건</span>
              </div>
              <div className="dm-stat-item">
                <span className="dm-stat-label">평균 별점</span>
                <span className="dm-stat-value">{report.avgRating}</span>
              </div>
            </div>
          </div>

          {/* 세무사용 요약 */}
          <div className="dm-card dm-report-section dm-tax-summary">
            <h3 className="dm-card-title"><FileText size={16} /> 세무사용 요약</h3>
            <div className="dm-tax-grid">
              <div className="dm-tax-row">
                <span className="dm-tax-label">매출 합계</span>
                <span className="dm-tax-val">{fmt(report.totalRevenue)}원</span>
              </div>
              <div className="dm-tax-row">
                <span className="dm-tax-label">지출 합계</span>
                <span className="dm-tax-val">{fmt(report.totalExpense)}원</span>
              </div>
              <div className="dm-tax-row dm-tax-total">
                <span className="dm-tax-label">손익</span>
                <span className={`dm-tax-val ${report.profit >= 0 ? 'blue' : 'red'}`}>
                  {report.profit >= 0 ? '+' : ''}{fmt(report.profit)}원
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TAB 3: 알림 센터
   ================================================================ */
function AlertsTab({ reviews, opsData, ledger, dailyLogs }) {
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIF_READ_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const notifications = useMemo(() => {
    const notifs = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Inventory alerts: items with < 3 days stock
    const stock = opsData?.packagingStock || [];
    stock.forEach(item => {
      if (item.daysLeft !== undefined && item.daysLeft < 3) {
        notifs.push({
          id: `stock-${item.name || item.id}`,
          icon: 'alert',
          severity: '긴급',
          message: `포장재 "${item.name}" 재고 부족 (${item.daysLeft}일분 남음)`,
          timestamp: todayStr,
          page: 'dailyOps',
        });
      }
      if (item.currentQty !== undefined && item.currentQty < 10) {
        notifs.push({
          id: `stockqty-${item.name || item.id}`,
          icon: 'alert',
          severity: '주의',
          message: `포장재 "${item.name}" 잔여 수량 ${item.currentQty}개`,
          timestamp: todayStr,
          page: 'dailyOps',
        });
      }
    });

    // Review alerts: unreplied reviews
    const unreplied = (reviews || []).filter(r => !r.replied);
    if (unreplied.length > 0) {
      notifs.push({
        id: 'unreplied-reviews',
        icon: 'info',
        severity: unreplied.length >= 5 ? '긴급' : '주의',
        message: `미답변 리뷰 ${unreplied.length}건 — 답글 작성이 필요합니다`,
        timestamp: todayStr,
        page: 'reviews',
      });
    }

    // Financial: check if current month ledger is empty
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthLedger = (ledger || []).find(m => m.yearMonth === currentYM);
    if (currentMonthLedger) {
      const rev = Object.values(currentMonthLedger.revenue || {}).reduce((s, v) => s + v, 0);
      if (rev === 0) {
        notifs.push({
          id: 'ledger-empty',
          icon: 'info',
          severity: '정보',
          message: `${currentYM.replace('-', '년 ')}월 장부가 아직 입력되지 않았습니다`,
          timestamp: todayStr,
          page: 'finance',
        });
      }
    }

    // Hygiene: daily check not done today
    const todayLogs = (dailyLogs || []).filter(d => d.date === todayStr);
    if (todayLogs.length === 0) {
      notifs.push({
        id: 'daily-not-done',
        icon: 'info',
        severity: '정보',
        message: '오늘의 일일 매출 기록이 아직 입력되지 않았습니다',
        timestamp: todayStr,
        page: 'daily',
      });
    }

    // Waste logs check
    const wasteLogs = opsData?.wasteLogs || [];
    const thisMonthWaste = wasteLogs.filter(w => w.date && w.date.startsWith(currentYM));
    if (thisMonthWaste.length > 5) {
      const totalWasteCost = thisMonthWaste.reduce((s, w) => s + (w.cost || w.amount || 0), 0);
      if (totalWasteCost > 50000) {
        notifs.push({
          id: 'waste-high',
          icon: 'alert',
          severity: '주의',
          message: `이번 달 폐기 비용 ${fmt(totalWasteCost)}원 — 식재료 관리를 점검하세요`,
          timestamp: todayStr,
          page: 'dailyOps',
        });
      }
    }

    // Low review rating alert
    const recentReviews = (reviews || []).slice(-10);
    if (recentReviews.length >= 3) {
      const recentAvg = recentReviews.reduce((s, r) => s + (r.rating || 0), 0) / recentReviews.length;
      if (recentAvg < 3.5) {
        notifs.push({
          id: 'low-rating',
          icon: 'alert',
          severity: '긴급',
          message: `최근 리뷰 평균 별점 ${recentAvg.toFixed(1)}점 — 개선이 필요합니다`,
          timestamp: todayStr,
          page: 'reviews',
        });
      }
    }

    return notifs;
  }, [reviews, opsData, ledger, dailyLogs]);

  const toggleRead = (id) => {
    setReadIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const severityConfig = {
    '긴급': { color: '#dc2626', bg: '#fef2f2' },
    '주의': { color: '#ea580c', bg: '#fff7ed' },
    '정보': { color: '#2563eb', bg: '#dbeafe' },
  };

  const iconMap = {
    alert: AlertTriangle,
    info: Info,
    check: Check,
  };

  return (
    <div className="dm-tab-content">
      <div className="dm-card">
        <div className="dm-alert-header">
          <h3 className="dm-card-title"><Bell size={16} /> 알림 센터</h3>
          <span className="dm-badge">{unreadCount}</span>
        </div>
        <p className="dm-desc">현재 데이터를 기반으로 자동 생성된 알림입니다.</p>
      </div>

      {notifications.length === 0 && (
        <div className="dm-card dm-empty">
          <Check size={24} />
          <p>모든 항목이 정상입니다. 알림이 없습니다.</p>
        </div>
      )}

      {notifications.map(n => {
        const isRead = readIds.includes(n.id);
        const sev = severityConfig[n.severity] || severityConfig['정보'];
        const IconComp = iconMap[n.icon] || Info;
        return (
          <div
            key={n.id}
            className={`dm-notif-card ${isRead ? 'read' : ''}`}
            style={{ borderLeftColor: sev.color }}
          >
            <div className="dm-notif-icon" style={{ color: sev.color, background: sev.bg }}>
              <IconComp size={16} />
            </div>
            <div className="dm-notif-body">
              <div className="dm-notif-top">
                <span className="dm-notif-severity" style={{ color: sev.color }}>{n.severity}</span>
                <span className="dm-notif-time">{n.timestamp}</span>
              </div>
              <p className="dm-notif-msg">{n.message}</p>
            </div>
            <button
              className={`dm-notif-read-btn ${isRead ? 'active' : ''}`}
              onClick={() => toggleRead(n.id)}
              title={isRead ? '읽지 않음으로 표시' : '읽음 처리'}
            >
              <Check size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   TAB 4: 시스템 정보
   ================================================================ */
function SystemTab({ ledger, dailyLogs, menus, reviews, opsData, onImportAll }) {
  const [dataSize, setDataSize] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetFinal, setShowResetFinal] = useState(false);
  const [showCleanup, setShowCleanup] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || '';
      setDataSize((new Blob([raw]).size / 1024).toFixed(1));
    } catch { setDataSize(0); }
  }, []);

  const recordCounts = useMemo(() => [
    { label: '메뉴', count: (menus || []).length },
    { label: '일일 매출 기록', count: (dailyLogs || []).length },
    { label: '리뷰', count: (reviews || []).length },
    { label: '월별 장부', count: (ledger || []).length },
    { label: '준비 로그', count: (opsData?.prepLogs || []).length },
    { label: '폐기 로그', count: (opsData?.wasteLogs || []).length },
    { label: '배달 로그', count: (opsData?.deliveryLogs || []).length },
    { label: '포장재 재고', count: (opsData?.packagingStock || []).length },
  ], [menus, dailyLogs, reviews, ledger, opsData]);

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BACKUP_DATE_KEY);
      localStorage.removeItem(NOTIF_READ_KEY);
      alert('모든 데이터가 초기화되었습니다. 페이지가 새로고침됩니다.');
      window.location.reload();
    } catch (e) {
      alert('초기화 실패: ' + e.message);
    }
  };

  const handleCleanup = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const cutoff = oneYearAgo.toISOString().split('T')[0];

      let cleaned = 0;
      if (data.dailyLogs) {
        const before = data.dailyLogs.length;
        data.dailyLogs = data.dailyLogs.filter(d => !d.date || d.date >= cutoff);
        cleaned += before - data.dailyLogs.length;
      }
      if (data.reviews) {
        const before = data.reviews.length;
        data.reviews = data.reviews.filter(r => !r.date || r.date >= cutoff);
        cleaned += before - data.reviews.length;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      alert(`${cleaned}개의 1년 이상 된 항목이 정리되었습니다.`);
      if (cleaned > 0) window.location.reload();
      setShowCleanup(false);
    } catch (e) {
      alert('정리 실패: ' + e.message);
    }
  };

  return (
    <div className="dm-tab-content">
      <div className="dm-card">
        <h3 className="dm-card-title"><Database size={16} /> 시스템 정보</h3>
        <div className="dm-info-grid">
          <div className="dm-info-row">
            <span className="dm-info-label">앱 버전</span>
            <span className="dm-info-value">v2.0</span>
          </div>
          <div className="dm-info-row">
            <span className="dm-info-label">데이터 크기</span>
            <span className="dm-info-value">{dataSize} KB</span>
          </div>
          <div className="dm-info-row">
            <span className="dm-info-label">브라우저</span>
            <span className="dm-info-value">{navigator.userAgent.split(' ').pop()}</span>
          </div>
        </div>
      </div>

      <div className="dm-card">
        <h3 className="dm-card-title"><FileText size={16} /> 데이터 현황</h3>
        <div className="dm-records-grid">
          {recordCounts.map(r => (
            <div key={r.label} className="dm-record-item">
              <span className="dm-record-label">{r.label}</span>
              <span className="dm-record-count">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dm-card">
        <h3 className="dm-card-title"><RefreshCw size={16} /> 데이터 정리</h3>
        <p className="dm-desc">1년 이상 된 일일 기록 및 리뷰를 삭제합니다.</p>
        {!showCleanup ? (
          <button className="dm-btn ghost" onClick={() => setShowCleanup(true)}>
            <RefreshCw size={14} /> 데이터 정리 시작
          </button>
        ) : (
          <div className="dm-confirm-box">
            <p>1년 이상 된 일일 매출 기록과 리뷰를 삭제합니다. 계속하시겠습니까?</p>
            <div className="dm-btn-row">
              <button className="dm-btn danger" onClick={handleCleanup}>
                <Check size={14} /> 정리 실행
              </button>
              <button className="dm-btn ghost" onClick={() => setShowCleanup(false)}>취소</button>
            </div>
          </div>
        )}
      </div>

      <div className="dm-card dm-danger-zone">
        <h3 className="dm-card-title"><Trash2 size={16} /> 데이터 초기화</h3>
        <p className="dm-desc">모든 데이터를 삭제하고 초기 상태로 되돌립니다. 이 작업은 되돌릴 수 없습니다.</p>

        {!showResetConfirm ? (
          <button className="dm-btn danger" onClick={() => setShowResetConfirm(true)}>
            <Trash2 size={14} /> 데이터 초기화
          </button>
        ) : !showResetFinal ? (
          <div className="dm-confirm-box">
            <div className="dm-warn-box">
              <AlertTriangle size={14} />
              <span>정말로 모든 데이터를 삭제하시겠습니까?</span>
            </div>
            <div className="dm-btn-row">
              <button className="dm-btn danger" onClick={() => setShowResetFinal(true)}>
                예, 계속합니다
              </button>
              <button className="dm-btn ghost" onClick={() => setShowResetConfirm(false)}>취소</button>
            </div>
          </div>
        ) : (
          <div className="dm-confirm-box">
            <div className="dm-warn-box critical">
              <AlertTriangle size={14} />
              <span>마지막 확인: 모든 메뉴, 매출 기록, 리뷰, 재무 데이터가 영구 삭제됩니다.</span>
            </div>
            <div className="dm-btn-row">
              <button className="dm-btn danger" onClick={handleReset}>
                <Trash2 size={14} /> 영구 삭제
              </button>
              <button className="dm-btn ghost" onClick={() => { setShowResetConfirm(false); setShowResetFinal(false); }}>
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="dm-card dm-compat">
        <h3 className="dm-card-title"><Shield size={16} /> 브라우저 호환성</h3>
        <p className="dm-desc">
          이 앱은 Chrome, Edge, Safari, Firefox 최신 버전에서 최적으로 동작합니다.
          localStorage를 사용하므로, 프라이빗/시크릿 모드에서는 데이터가 저장되지 않을 수 있습니다.
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const dmCSS = `
  .dm { max-width: 1200px; }
  .dm-page-header { margin-bottom: 28px; }
  .dm-page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
  .dm-page-header p { color: var(--text-light); font-size: 14px; }

  /* Tab Bar */
  .dm-tab-bar {
    display: flex; gap: 6px; margin-bottom: 24px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding-bottom: 4px;
  }
  .dm-tab-bar::-webkit-scrollbar { display: none; }
  .dm-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; color: var(--text);
    background: var(--bg-card); border: 1px solid var(--border);
    white-space: nowrap; transition: all 0.2s; flex-shrink: 0;
  }
  .dm-tab:hover { border-color: var(--primary); color: var(--primary); }
  .dm-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

  .dm-tab-content { display: flex; flex-direction: column; gap: 16px; }

  /* Card */
  .dm-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 24px;
    box-shadow: var(--shadow-sm);
  }
  .dm-card-title {
    font-size: 15px; font-weight: 600; color: var(--text-dark);
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }
  .dm-desc { color: var(--text-light); font-size: 13px; margin-bottom: 16px; line-height: 1.6; }
  .dm-meta { color: var(--text-light); font-size: 12px; margin-top: 12px; display: flex; align-items: center; gap: 6px; }

  /* Buttons */
  .dm-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; transition: all 0.2s;
    border: 1px solid transparent;
  }
  .dm-btn.primary { background: var(--primary); color: #fff; }
  .dm-btn.primary:hover { background: var(--primary-dark); }
  .dm-btn.ghost { background: var(--bg); border-color: var(--border); color: var(--text); }
  .dm-btn.ghost:hover { border-color: var(--text-light); }
  .dm-btn.danger { background: var(--danger); color: #fff; }
  .dm-btn.danger:hover { background: #b91c1c; }
  .dm-btn-row { display: flex; gap: 8px; margin-top: 12px; }

  /* File label */
  .dm-file-label {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    background: var(--bg); border: 1px dashed var(--border);
    color: var(--text); transition: all 0.2s;
  }
  .dm-file-label:hover { border-color: var(--primary); color: var(--primary); }

  /* Import preview */
  .dm-import-preview {
    margin-top: 16px; padding: 16px;
    background: var(--bg); border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  .dm-import-preview h4 { font-size: 14px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
  .dm-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .dm-preview-item { display: flex; justify-content: space-between; padding: 6px 10px; background: var(--bg-card); border-radius: 6px; font-size: 13px; }
  .dm-preview-key { color: var(--text); }
  .dm-preview-val { font-weight: 600; color: var(--text-dark); }

  /* Warning box */
  .dm-warn-box {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; border-radius: var(--radius-sm);
    background: var(--warning-light); color: var(--warning);
    font-size: 13px; font-weight: 500;
  }
  .dm-warn-box.critical { background: var(--danger-light); color: var(--danger); }
  .dm-warn-card {
    display: flex; gap: 12px; padding: 16px 20px;
    background: var(--warning-light); border: 1px solid #fed7aa;
    border-radius: var(--radius); color: var(--warning);
  }
  .dm-warn-card strong { display: block; margin-bottom: 4px; }
  .dm-warn-card p { font-size: 13px; line-height: 1.5; opacity: 0.85; }

  /* Size display */
  .dm-size-display { text-align: center; padding: 16px 0; }
  .dm-size-number { font-size: 36px; font-weight: 700; color: var(--primary); }
  .dm-size-label { display: block; font-size: 13px; color: var(--text-light); margin-top: 4px; }
  .dm-size-bar-track { height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden; margin: 8px 0; }
  .dm-size-bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary), #60a5fa); border-radius: 4px; transition: width 0.5s; }

  /* Report */
  .dm-report-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .dm-select {
    padding: 8px 12px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); font-size: 13px;
    color: var(--text-dark); background: var(--bg);
  }
  .dm-select:focus { border-color: var(--primary); }
  .dm-report-title { font-size: 20px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 10px; margin-bottom: 0; }
  .dm-report-section { }
  .dm-stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 12px; }
  .dm-stat-item { padding: 12px 16px; background: var(--bg); border-radius: var(--radius-sm); }
  .dm-stat-label { display: block; font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
  .dm-stat-value { font-size: 20px; font-weight: 700; color: var(--text-dark); }
  .dm-stat-value.blue { color: var(--primary); }
  .dm-stat-value.red { color: var(--danger); }
  .dm-breakdown { margin-top: 8px; }
  .dm-breakdown h4 { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
  .dm-breakdown-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-light); font-size: 13px; }
  .dm-breakdown-val { font-weight: 600; color: var(--text-dark); }

  /* Table */
  .dm-table-wrap { overflow-x: auto; }
  .dm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .dm-table th { text-align: left; padding: 8px 10px; color: var(--text-light); border-bottom: 2px solid var(--border); font-weight: 500; }
  .dm-table td { padding: 8px 10px; border-bottom: 1px solid var(--border-light); color: var(--text-dark); }
  .dm-table td.r { text-align: right; }

  /* Tax summary */
  .dm-tax-summary { background: var(--bg); border: 2px dashed var(--border); }
  .dm-tax-grid { display: flex; flex-direction: column; gap: 8px; }
  .dm-tax-row { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg-card); border-radius: 6px; font-size: 14px; }
  .dm-tax-label { color: var(--text); }
  .dm-tax-val { font-weight: 700; color: var(--text-dark); }
  .dm-tax-val.blue { color: var(--primary); }
  .dm-tax-val.red { color: var(--danger); }
  .dm-tax-total { border-top: 2px solid var(--border); padding-top: 12px; }

  /* Notification cards */
  .dm-alert-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .dm-alert-header .dm-card-title { margin-bottom: 0; }
  .dm-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 22px; height: 22px; border-radius: 11px;
    background: var(--danger); color: #fff; font-size: 11px; font-weight: 700;
    padding: 0 6px;
  }
  .dm-notif-card {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; background: var(--bg-card);
    border: 1px solid var(--border); border-left: 4px solid var(--primary);
    border-radius: var(--radius-sm); transition: all 0.2s;
  }
  .dm-notif-card.read { opacity: 0.55; }
  .dm-notif-icon {
    flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .dm-notif-body { flex: 1; }
  .dm-notif-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .dm-notif-severity { font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .dm-notif-time { font-size: 11px; color: var(--text-light); }
  .dm-notif-msg { font-size: 13px; color: var(--text-dark); line-height: 1.5; }
  .dm-notif-read-btn {
    flex-shrink: 0; width: 28px; height: 28px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg); border: 1px solid var(--border); color: var(--text-light);
    transition: all 0.2s;
  }
  .dm-notif-read-btn:hover { border-color: var(--success); color: var(--success); }
  .dm-notif-read-btn.active { background: var(--success-light); border-color: var(--success); color: var(--success); }

  /* Empty state */
  .dm-empty { text-align: center; padding: 40px; color: var(--success); }
  .dm-empty p { margin-top: 8px; font-size: 14px; }

  /* System info */
  .dm-info-grid { display: flex; flex-direction: column; gap: 8px; }
  .dm-info-row { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg); border-radius: 6px; font-size: 13px; }
  .dm-info-label { color: var(--text); }
  .dm-info-value { font-weight: 600; color: var(--text-dark); }

  .dm-records-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
  .dm-record-item { display: flex; justify-content: space-between; padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm); }
  .dm-record-label { font-size: 13px; color: var(--text); }
  .dm-record-count { font-size: 15px; font-weight: 700; color: var(--primary); }

  .dm-confirm-box { margin-top: 12px; padding: 16px; background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--border); }
  .dm-confirm-box p { font-size: 13px; color: var(--text); margin-bottom: 4px; }

  .dm-danger-zone { border-color: var(--danger); border-style: dashed; }
  .dm-danger-zone .dm-card-title { color: var(--danger); }

  .dm-compat { }

  /* Print */
  @media print {
    .dm-tab-bar, .dm-page-header, .dm-report-header, .dm-notif-read-btn { display: none !important; }
    .dm-card { box-shadow: none; border: 1px solid #ddd; break-inside: avoid; }
    .dm { max-width: 100%; }
    .print-area .dm-card { margin-bottom: 12px; }
  }

  @media (max-width: 768px) {
    .dm-preview-grid { grid-template-columns: 1fr; }
    .dm-stat-row { grid-template-columns: 1fr; }
    .dm-records-grid { grid-template-columns: 1fr 1fr; }
  }
`;
