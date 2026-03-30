import React, { useState, useMemo } from 'react';
import { MessageSquare, Bell, Package, Plus, Copy, Trash2, AlertTriangle, Check, Clock, ShoppingCart, ExternalLink, ChevronDown } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const today = () => new Date().toISOString().split('T')[0];

const DEFAULT_PACKAGING = [
  { name: 'PP용기(800ml)', stock: 0, dailyUsage: 0, unitCost: 180 },
  { name: '소스컵(50ml)', stock: 0, dailyUsage: 0, unitCost: 35 },
  { name: '비닐백', stock: 0, dailyUsage: 0, unitCost: 50 },
  { name: '젓가락', stock: 0, dailyUsage: 0, unitCost: 15 },
  { name: '냅킨', stock: 0, dailyUsage: 0, unitCost: 8 },
  { name: '테이프', stock: 0, dailyUsage: 0, unitCost: 2500 },
];

const ORDER_PRESETS = {
  normal: { label: '일반 발주', items: [
    { name: '소고기(불고기용)', amount: '3', unit: 'kg' },
    { name: '돼지 앞다리살', amount: '5', unit: 'kg' },
    { name: '양파', amount: '3', unit: 'kg' },
    { name: '대파', amount: '2', unit: 'kg' },
  ]},
  urgent: { label: '긴급 발주', items: [
    { name: '쌀', amount: '10', unit: 'kg' },
    { name: '식용유', amount: '2', unit: 'L' },
    { name: '계란', amount: '2', unit: '판' },
  ]},
  weekend: { label: '주말 대비 대량', items: [
    { name: '소고기(불고기용)', amount: '5', unit: 'kg' },
    { name: '돼지 앞다리살', amount: '8', unit: 'kg' },
    { name: '닭다리살', amount: '5', unit: 'kg' },
    { name: '양파', amount: '5', unit: 'kg' },
    { name: '대파', amount: '3', unit: 'kg' },
    { name: '쌀', amount: '20', unit: 'kg' },
    { name: '계란', amount: '3', unit: '판' },
  ]},
};

export default function QuickTools({ menus, costData, opsData, dailyLogs, reviews }) {
  const [tab, setTab] = useState('order');

  const tabs = [
    { id: 'order', label: '카톡 발주 템플릿', icon: MessageSquare },
    { id: 'alerts', label: '알림 배지 모아보기', icon: Bell },
    { id: 'packaging', label: '포장 발주 알림', icon: Package },
  ];

  return (
    <div className="qt">
      <div className="page-header">
        <h1>빠른 도구</h1>
        <p>발주 템플릿, 알림, 포장 재고를 한곳에서 관리하세요</p>
      </div>

      <div className="qt-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`qt-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'order' && (
        <OrderTemplateTab costData={costData} />
      )}
      {tab === 'alerts' && (
        <AlertsTab opsData={opsData} costData={costData} reviews={reviews} dailyLogs={dailyLogs} />
      )}
      {tab === 'packaging' && (
        <PackagingTab opsData={opsData} />
      )}

      <style>{quickToolsCSS}</style>
    </div>
  );
}

/* ========== Tab 1: 카톡 발주 템플릿 ========== */
function OrderTemplateTab({ costData }) {
  const inventory = costData?.inventory || [];
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', amount: '', unit: 'kg' });
  const [copied, setCopied] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);

  // Auto-add low stock items
  const lowStockItems = useMemo(() => {
    return inventory.filter(inv => {
      if (!inv.totalAmount || !inv.perServing) return false;
      const servingsLeft = inv.totalAmount > 0 && inv.perServing > 0
        ? Math.floor(inv.totalAmount / inv.perServing)
        : 0;
      return servingsLeft < 30;
    });
  }, [inventory]);

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.amount) return;
    setItems(prev => [...prev, { ...newItem, id: 'oi_' + Date.now() }]);
    setNewItem({ name: '', amount: '', unit: 'kg' });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const loadPreset = (presetKey) => {
    const preset = ORDER_PRESETS[presetKey];
    if (!preset) return;
    setItems(preset.items.map((it, i) => ({ ...it, id: 'pre_' + Date.now() + '_' + i })));
    setPresetOpen(false);
  };

  const loadLowStock = () => {
    const newItems = lowStockItems.map((inv, i) => ({
      id: 'low_' + Date.now() + '_' + i,
      name: inv.name,
      amount: '',
      unit: inv.unit || 'g',
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  const generateText = () => {
    const dateStr = today();
    let text = `[발주 요청] 운서동 덮밥&볶음밥\n`;
    text += `날짜: ${dateStr}\n`;
    text += `─────────\n`;
    items.forEach(it => {
      text += `${it.name} ${it.amount}${it.unit}\n`;
    });
    text += `─────────\n`;
    text += `감사합니다!\n`;
    return text;
  };

  const copyToClipboard = () => {
    if (items.length === 0) return;
    navigator.clipboard.writeText(generateText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="qt-section">
      {/* Presets */}
      <div className="qt-presets">
        <div className="qt-preset-header">
          <button className="qt-preset-toggle" onClick={() => setPresetOpen(!presetOpen)}>
            <ChevronDown size={16} style={{ transform: presetOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            빠른 프리셋
          </button>
          {lowStockItems.length > 0 && (
            <button className="qt-lowstock-btn" onClick={loadLowStock}>
              <AlertTriangle size={14} /> 부족 재고 불러오기 ({lowStockItems.length}건)
            </button>
          )}
        </div>
        {presetOpen && (
          <div className="qt-preset-list">
            {Object.entries(ORDER_PRESETS).map(([key, preset]) => (
              <button key={key} className="qt-preset-btn" onClick={() => loadPreset(key)}>
                <ShoppingCart size={14} /> {preset.label}
                <span className="qt-preset-count">{preset.items.length}개 항목</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual Add */}
      <div className="qt-add-row">
        <input
          type="text"
          placeholder="품목명"
          value={newItem.name}
          onChange={(e) => setNewItem(p => ({ ...p, name: e.target.value }))}
          className="qt-input flex-2"
        />
        <input
          type="text"
          placeholder="수량"
          value={newItem.amount}
          onChange={(e) => setNewItem(p => ({ ...p, amount: e.target.value }))}
          className="qt-input flex-1"
        />
        <select
          value={newItem.unit}
          onChange={(e) => setNewItem(p => ({ ...p, unit: e.target.value }))}
          className="qt-select"
        >
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="L">L</option>
          <option value="ml">ml</option>
          <option value="개">개</option>
          <option value="팩">팩</option>
          <option value="판">판</option>
          <option value="박스">박스</option>
          <option value="봉">봉</option>
        </select>
        <button className="qt-add-btn" onClick={addItem}>
          <Plus size={16} /> 추가
        </button>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="qt-items-list">
          {items.map(it => (
            <div key={it.id} className="qt-item-row">
              <span className="qt-item-name">{it.name}</span>
              <input
                type="text"
                value={it.amount}
                onChange={(e) => setItems(prev => prev.map(i => i.id === it.id ? { ...i, amount: e.target.value } : i))}
                className="qt-item-amount"
                placeholder="수량"
              />
              <span className="qt-item-unit">{it.unit}</span>
              <button className="qt-item-delete" onClick={() => removeItem(it.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {items.length > 0 && (
        <div className="qt-preview">
          <h4>미리보기</h4>
          <pre className="qt-preview-text">{generateText()}</pre>
          <button className="qt-copy-btn" onClick={copyToClipboard}>
            {copied ? <><Check size={16} /> 복사됨!</> : <><Copy size={16} /> 복사</>}
          </button>
        </div>
      )}

      {items.length === 0 && (
        <div className="qt-empty">
          프리셋을 선택하거나 항목을 직접 추가하세요.
        </div>
      )}
    </div>
  );
}

/* ========== Tab 2: 알림 배지 모아보기 ========== */
function AlertsTab({ opsData, costData, reviews, dailyLogs }) {
  const [dismissed, setDismissed] = useState(new Set());

  const packagingStock = opsData?.packagingStock || DEFAULT_PACKAGING;
  const inventory = costData?.inventory || [];
  const allReviews = reviews || [];
  const todayStr = today();

  const alerts = useMemo(() => {
    const result = [];

    // Packaging stock low (< 3 days)
    packagingStock.forEach(item => {
      const daysLeft = item.dailyUsage > 0 ? Math.floor(item.stock / item.dailyUsage) : item.stock > 0 ? 999 : 0;
      if (daysLeft < 3) {
        result.push({
          id: `pkg_${item.name}`,
          severity: daysLeft < 1 ? 'critical' : 'warning',
          icon: Package,
          message: `포장재 "${item.name}" 재고 부족 (${daysLeft}일분 남음)`,
          page: '포장 발주 알림',
          category: 'packaging',
        });
      }
    });

    // Unreplied reviews
    const unreplied = allReviews.filter(r => !r.reply && !r.replied);
    if (unreplied.length > 0) {
      result.push({
        id: 'reviews_unreplied',
        severity: unreplied.length >= 5 ? 'critical' : 'warning',
        icon: MessageSquare,
        message: `미답변 리뷰 ${unreplied.length}건`,
        page: '리뷰 관리',
        category: 'reviews',
      });
    }

    // Ingredients running low
    inventory.forEach(inv => {
      if (!inv.totalAmount || !inv.perServing) return;
      const servingsLeft = inv.perServing > 0 ? Math.floor(inv.totalAmount / inv.perServing) : 999;
      if (servingsLeft < 20) {
        result.push({
          id: `inv_${inv.id}`,
          severity: servingsLeft < 10 ? 'critical' : 'warning',
          icon: AlertTriangle,
          message: `식재료 "${inv.name}" 부족 (약 ${servingsLeft}인분 남음)`,
          page: '원가 계산기',
          category: 'inventory',
        });
      }
    });

    // Today's daily log check
    const todayLog = dailyLogs.find(l => l.date === todayStr);
    if (!todayLog) {
      result.push({
        id: 'daily_log_missing',
        severity: 'info',
        icon: Clock,
        message: '오늘의 매출 기록이 아직 저장되지 않았습니다',
        page: '일일 매출 기록',
        category: 'log',
      });
    }

    return result;
  }, [packagingStock, allReviews, inventory, dailyLogs, todayStr]);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));

  const dismissAll = () => {
    setDismissed(new Set(alerts.map(a => a.id)));
  };

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  const sorted = [...visibleAlerts].sort((a, b) => (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9));

  return (
    <div className="qt-section">
      <div className="qt-alerts-header">
        <span className="qt-alerts-count">
          {visibleAlerts.length > 0
            ? `${visibleAlerts.length}건의 알림`
            : '모든 알림을 확인했습니다'
          }
        </span>
        {visibleAlerts.length > 0 && (
          <button className="qt-dismiss-all" onClick={dismissAll}>
            <Check size={14} /> 모두 읽음
          </button>
        )}
      </div>

      <div className="qt-alerts-list">
        {sorted.map(alert => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} className={`qt-alert-card ${alert.severity}`}>
              <div className="qt-alert-icon">
                <Icon size={18} />
              </div>
              <div className="qt-alert-body">
                <p className="qt-alert-msg">{alert.message}</p>
                <span className="qt-alert-page">
                  <ExternalLink size={12} /> {alert.page}
                </span>
              </div>
              <button
                className="qt-alert-dismiss"
                onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
              >
                <Check size={14} />
              </button>
            </div>
          );
        })}
        {visibleAlerts.length === 0 && (
          <div className="qt-empty">
            <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>알림이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== Tab 3: 포장 발주 알림 ========== */
function PackagingTab({ opsData }) {
  const packagingStock = opsData?.packagingStock || DEFAULT_PACKAGING;
  const [copied, setCopied] = useState(false);

  const enriched = useMemo(() => {
    return packagingStock.map(item => {
      const daysRemaining = item.dailyUsage > 0
        ? Math.floor(item.stock / item.dailyUsage)
        : item.stock > 0 ? 999 : 0;
      let status = 'green';
      if (daysRemaining < 2) status = 'red';
      else if (daysRemaining < 5) status = 'yellow';
      return { ...item, daysRemaining, status };
    });
  }, [packagingStock]);

  const needsOrder = enriched.filter(i => i.daysRemaining < 3);

  const generateOrderText = () => {
    const dateStr = today();
    let text = `[포장재 발주] 운서동 덮밥&볶음밥\n`;
    text += `날짜: ${dateStr}\n`;
    text += `─────────\n`;
    needsOrder.forEach(item => {
      const orderAmount = item.dailyUsage > 0 ? item.dailyUsage * 7 : 100;
      text += `${item.name} ${orderAmount}개\n`;
    });
    text += `─────────\n`;
    text += `감사합니다!\n`;
    return text;
  };

  const copyOrder = () => {
    if (needsOrder.length === 0) return;
    navigator.clipboard.writeText(generateOrderText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="qt-section">
      {/* Stock Status */}
      <h3 className="qt-section-title"><Package size={16} /> 포장재 현황</h3>
      <div className="qt-pkg-grid">
        {enriched.map((item, i) => (
          <div key={i} className={`qt-pkg-card ${item.status}`}>
            <div className="qt-pkg-name">{item.name}</div>
            <div className="qt-pkg-stats">
              <div className="qt-pkg-row">
                <span>현재 재고</span>
                <span className="qt-pkg-val">{fmt(item.stock)}개</span>
              </div>
              <div className="qt-pkg-row">
                <span>일 사용량</span>
                <span className="qt-pkg-val">{fmt(item.dailyUsage)}개</span>
              </div>
              <div className="qt-pkg-row">
                <span>남은 일수</span>
                <span className={`qt-pkg-val qt-days-${item.status}`}>
                  {item.daysRemaining >= 999 ? '-' : `${item.daysRemaining}일`}
                </span>
              </div>
            </div>
            <div className={`qt-pkg-indicator ${item.status}`}>
              {item.status === 'red' && '긴급 발주'}
              {item.status === 'yellow' && '발주 권장'}
              {item.status === 'green' && '충분'}
            </div>
          </div>
        ))}
      </div>

      {/* Needs Order */}
      {needsOrder.length > 0 && (
        <div className="qt-needs-order">
          <h3 className="qt-section-title" style={{ color: '#ef4444' }}>
            <AlertTriangle size={16} /> 발주 필요 ({needsOrder.length}건)
          </h3>
          <div className="qt-needs-list">
            {needsOrder.map((item, i) => (
              <div key={i} className="qt-needs-item">
                <span className="qt-needs-name">{item.name}</span>
                <span className="qt-needs-days">{item.daysRemaining}일분 남음</span>
              </div>
            ))}
          </div>

          <div className="qt-preview">
            <h4>발주 메시지 미리보기</h4>
            <pre className="qt-preview-text">{generateOrderText()}</pre>
            <button className="qt-copy-btn" onClick={copyOrder}>
              {copied ? <><Check size={16} /> 복사됨!</> : <><Copy size={16} /> 복사</>}
            </button>
          </div>
        </div>
      )}

      {needsOrder.length === 0 && (
        <div className="qt-all-good">
          <Check size={24} />
          <p>모든 포장재 재고가 충분합니다.</p>
        </div>
      )}
    </div>
  );
}

/* ========== CSS ========== */
const quickToolsCSS = `
  .qt { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
  .qt .page-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
  .qt .page-header p { font-size: 14px; color: var(--text-light); margin: 0 0 24px; }

  .qt-tab-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .qt-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 18px; border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg-card); color: var(--text); font-size: 14px; font-weight: 500; cursor: pointer;
  }
  .qt-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

  .qt-section { margin-bottom: 24px; }
  .qt-section-title {
    font-size: 17px; font-weight: 600; margin: 0 0 14px; display: flex; align-items: center; gap: 8px;
    color: var(--text-dark);
  }

  /* Order Template Tab */
  .qt-presets { margin-bottom: 16px; }
  .qt-preset-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
  .qt-preset-toggle {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg-card); color: var(--text); font-size: 14px; font-weight: 500; cursor: pointer;
  }
  .qt-lowstock-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
    border: 1px solid #f59e0b; border-radius: var(--radius);
    background: #fffbeb; color: #92400e; font-size: 13px; cursor: pointer;
  }
  .qt-lowstock-btn:hover { background: #fef3c7; }
  .qt-preset-list { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .qt-preset-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg-card); color: var(--text); font-size: 13px; cursor: pointer;
    box-shadow: var(--shadow-sm);
  }
  .qt-preset-btn:hover { border-color: var(--primary); color: var(--primary); }
  .qt-preset-count { font-size: 11px; color: var(--text-light); }

  .qt-add-row {
    display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .qt-input {
    padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius);
    font-size: 14px; background: var(--bg-card); color: var(--text);
  }
  .qt-input.flex-2 { flex: 2; min-width: 140px; }
  .qt-input.flex-1 { flex: 1; min-width: 80px; }
  .qt-select {
    padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius);
    font-size: 14px; background: var(--bg-card); color: var(--text); cursor: pointer;
  }
  .qt-add-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px;
    background: var(--primary); color: #fff; border: none; border-radius: var(--radius);
    font-size: 14px; font-weight: 500; cursor: pointer;
  }
  .qt-add-btn:hover { opacity: 0.9; }

  .qt-items-list {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    overflow: hidden; margin-bottom: 16px;
  }
  .qt-item-row {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
    border-bottom: 1px solid var(--border-light);
  }
  .qt-item-row:last-child { border-bottom: none; }
  .qt-item-name { flex: 1; font-size: 14px; font-weight: 500; color: var(--text-dark); }
  .qt-item-amount {
    width: 70px; padding: 6px 8px; border: 1px solid var(--border); border-radius: var(--radius);
    font-size: 13px; text-align: center; background: var(--bg); color: var(--text);
  }
  .qt-item-unit { font-size: 13px; color: var(--text-light); min-width: 30px; }
  .qt-item-delete {
    width: 30px; height: 30px; border-radius: var(--radius); border: 1px solid var(--border);
    background: var(--bg); color: var(--text-light); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
  }
  .qt-item-delete:hover { border-color: #ef4444; color: #ef4444; }

  .qt-preview {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 16px; margin-bottom: 16px; box-shadow: var(--shadow-sm);
  }
  .qt-preview h4 { margin: 0 0 10px; font-size: 14px; color: var(--text-dark); }
  .qt-preview-text {
    font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6;
    background: var(--bg); border: 1px solid var(--border-light); border-radius: var(--radius);
    padding: 14px; white-space: pre-wrap; color: var(--text); margin: 0 0 12px;
  }
  .qt-copy-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
    background: var(--primary); color: #fff; border: none; border-radius: var(--radius);
    font-size: 14px; font-weight: 500; cursor: pointer;
  }
  .qt-copy-btn:hover { opacity: 0.9; }

  .qt-empty {
    text-align: center; padding: 40px 20px; color: var(--text-light); font-size: 14px;
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  }

  /* Alerts Tab */
  .qt-alerts-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
  }
  .qt-alerts-count { font-size: 15px; font-weight: 600; color: var(--text-dark); }
  .qt-dismiss-all {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg-card); color: var(--text); font-size: 13px; cursor: pointer;
  }
  .qt-dismiss-all:hover { border-color: var(--primary); color: var(--primary); }

  .qt-alerts-list { display: flex; flex-direction: column; gap: 10px; }
  .qt-alert-card {
    display: flex; align-items: center; gap: 14px; padding: 14px 16px;
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
  }
  .qt-alert-card.critical { border-left: 4px solid #ef4444; }
  .qt-alert-card.warning { border-left: 4px solid #f59e0b; }
  .qt-alert-card.info { border-left: 4px solid #3b82f6; }
  .qt-alert-icon { display: flex; align-items: center; justify-content: center; }
  .qt-alert-card.critical .qt-alert-icon { color: #ef4444; }
  .qt-alert-card.warning .qt-alert-icon { color: #f59e0b; }
  .qt-alert-card.info .qt-alert-icon { color: #3b82f6; }
  .qt-alert-body { flex: 1; }
  .qt-alert-msg { font-size: 14px; font-weight: 500; color: var(--text-dark); margin: 0 0 4px; }
  .qt-alert-page {
    font-size: 12px; color: var(--text-light); display: inline-flex; align-items: center; gap: 4px;
  }
  .qt-alert-dismiss {
    width: 32px; height: 32px; border-radius: var(--radius); border: 1px solid var(--border);
    background: var(--bg); color: var(--text-light); cursor: pointer; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0;
  }
  .qt-alert-dismiss:hover { border-color: #16a34a; color: #16a34a; }

  /* Packaging Tab */
  .qt-pkg-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px; margin-bottom: 24px;
  }
  .qt-pkg-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 16px; box-shadow: var(--shadow-sm);
  }
  .qt-pkg-card.red { border-top: 4px solid #ef4444; }
  .qt-pkg-card.yellow { border-top: 4px solid #f59e0b; }
  .qt-pkg-card.green { border-top: 4px solid #16a34a; }
  .qt-pkg-name { font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 10px; }
  .qt-pkg-stats { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
  .qt-pkg-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-light); }
  .qt-pkg-val { font-weight: 600; color: var(--text); }
  .qt-days-red { color: #ef4444 !important; font-weight: 700 !important; }
  .qt-days-yellow { color: #f59e0b !important; font-weight: 700 !important; }
  .qt-days-green { color: #16a34a !important; }
  .qt-pkg-indicator {
    text-align: center; padding: 6px 10px; border-radius: var(--radius);
    font-size: 12px; font-weight: 600;
  }
  .qt-pkg-indicator.red { background: #fef2f2; color: #dc2626; }
  .qt-pkg-indicator.yellow { background: #fffbeb; color: #92400e; }
  .qt-pkg-indicator.green { background: #f0fdf4; color: #16a34a; }

  .qt-needs-order { margin-bottom: 20px; }
  .qt-needs-list {
    display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;
  }
  .qt-needs-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca;
    border-radius: var(--radius);
  }
  .qt-needs-name { font-size: 14px; font-weight: 500; color: #991b1b; }
  .qt-needs-days { font-size: 13px; color: #dc2626; font-weight: 600; }

  .qt-all-good {
    text-align: center; padding: 40px 20px; color: #16a34a;
    background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius);
  }
  .qt-all-good p { margin: 8px 0 0; font-size: 15px; font-weight: 500; }

  @media (max-width: 600px) {
    .qt-add-row { flex-direction: column; }
    .qt-input.flex-2, .qt-input.flex-1 { min-width: auto; }
    .qt-pkg-grid { grid-template-columns: 1fr; }
    .qt-preset-list { flex-direction: column; }
  }
`;
