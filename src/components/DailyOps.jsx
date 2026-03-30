import { useState, useMemo } from 'react';
import {
  ClipboardList, Trash2, Truck, Package, Plus, Check, X,
  AlertTriangle, Calendar, Clock, ChevronDown, TrendingDown, Filter,
} from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const today = () => new Date().toISOString().split('T')[0];

const PLATFORMS = [
  { key: 'baemin', name: '배달의민족', color: '#2AC1BC' },
  { key: 'coupang', name: '쿠팡이츠', color: '#E0115F' },
  { key: 'yogiyo', name: '요기요', color: '#FA0050' },
  { key: 'takeout', name: '포장', color: '#f59e0b' },
];

const TASK_TYPES = ['밥 취사', '재료 손질', '소스 제조', '기타'];
const ROLES = ['사장님', '셰프'];
const WASTE_REASONS = ['유통기한 만료', '과다 발주', '조리 실패', '기타'];
const ISSUE_TYPES = ['none', 'late', 'wrong', 'damaged', 'lost'];
const ISSUE_LABELS = { none: '없음', late: '지연', wrong: '오배송', damaged: '파손', lost: '분실' };
const DEFAULT_PACKAGING = [
  { name: 'PP용기(800ml)', stock: 0, dailyUsage: 0, unitCost: 180, reorderPoint: 3 },
  { name: '소스컵(50ml)', stock: 0, dailyUsage: 0, unitCost: 35, reorderPoint: 3 },
  { name: '비닐백', stock: 0, dailyUsage: 0, unitCost: 50, reorderPoint: 3 },
  { name: '젓가락', stock: 0, dailyUsage: 0, unitCost: 15, reorderPoint: 3 },
  { name: '냅킨', stock: 0, dailyUsage: 0, unitCost: 8, reorderPoint: 3 },
  { name: '테이프', stock: 0, dailyUsage: 0, unitCost: 2500, reorderPoint: 3 },
];

/* ================================================================
   DAILY OPS — 일일 운영 관리
   ================================================================ */
export default function DailyOps({ menus, dailyLogs, opsData, setOpsData }) {
  const [tab, setTab] = useState('prep');

  const tabs = [
    { id: 'prep', label: '오늘의 준비 리스트', icon: ClipboardList },
    { id: 'waste', label: '폐기/로스 추적', icon: Trash2 },
    { id: 'delivery', label: '배달 품질 추적', icon: Truck },
    { id: 'packaging', label: '포장 재고 관리', icon: Package },
  ];

  return (
    <div className="dops">
      <div className="page-header">
        <h1>일일 운영 관리</h1>
        <p>배달 전문점 매일 운영 — 준비, 폐기, 배달, 포장 통합 관리</p>
      </div>

      <div className="dops-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`dops-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'prep' && (
        <PrepListTab menus={menus} dailyLogs={dailyLogs} opsData={opsData} setOpsData={setOpsData} />
      )}
      {tab === 'waste' && (
        <WasteTrackerTab menus={menus} opsData={opsData} setOpsData={setOpsData} />
      )}
      {tab === 'delivery' && (
        <DeliveryQualityTab opsData={opsData} setOpsData={setOpsData} />
      )}
      {tab === 'packaging' && (
        <PackagingStockTab dailyLogs={dailyLogs} opsData={opsData} setOpsData={setOpsData} />
      )}

      <style>{dailyOpsCSS}</style>
    </div>
  );
}

/* ================================================================
   TAB 1: 오늘의 준비 리스트 (Prep List)
   ================================================================ */
function PrepListTab({ menus, dailyLogs, opsData, setOpsData }) {
  const [bufferPct, setBufferPct] = useState(20);
  const [manualOrders, setManualOrders] = useState(null);
  const [filterType, setFilterType] = useState('전체');
  const [showFilter, setShowFilter] = useState(false);

  const prepLogs = opsData.prepLogs || [];

  // Calculate avg orders from last 7 days
  const { avgOrders, yesterdayOrders, avgByDay } = useMemo(() => {
    const sorted = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    const last7 = sorted.slice(0, 7);
    if (last7.length === 0) return { avgOrders: 30, yesterdayOrders: 0, avgByDay: 30 };
    const totals = last7.map(d => {
      const o = d.orders || {};
      return (Number(o.baemin) || 0) + (Number(o.coupang) || 0) + (Number(o.yogiyo) || 0) + (Number(o.takeout) || 0);
    });
    const avg = Math.round(totals.reduce((s, v) => s + v, 0) / totals.length);
    const yd = totals[0] || 0;
    return { avgOrders: avg || 30, yesterdayOrders: yd, avgByDay: avg || 30 };
  }, [dailyLogs]);

  const expectedOrders = manualOrders !== null ? manualOrders : avgOrders;
  const buffered = Math.ceil(expectedOrders * (1 + bufferPct / 100));

  // Yesterday adjustment suggestion
  const yesterdayDiff = yesterdayOrders - avgOrders;
  const suggestion = yesterdayDiff !== 0
    ? `어제 ${yesterdayOrders}건 (평균 ${avgOrders}건 대비 ${yesterdayDiff > 0 ? '+' : ''}${yesterdayDiff}건) → ${
        yesterdayDiff > 5 ? '오늘 주문 상향 조정 권장' : yesterdayDiff < -5 ? '오늘 주문 하향 조정 권장' : '평균 수준 유지'
      }`
    : null;

  // Build prep items from menu ingredients
  const prepItems = useMemo(() => {
    if (!menus || menus.length === 0) return [];
    const menuCount = menus.length || 1;
    const ingredientMap = {};

    menus.forEach((menu) => {
      const mixRatio = 1 / menuCount;
      const menuOrders = Math.ceil(buffered * mixRatio);
      (menu.ingredients || []).forEach((ing) => {
        const key = ing.name;
        if (!ingredientMap[key]) {
          ingredientMap[key] = {
            name: ing.name,
            cost: ing.cost || 0,
            totalAmount: 0,
            menus: [],
            taskType: guessTaskType(ing.name),
            role: '셰프',
          };
        }
        ingredientMap[key].totalAmount += menuOrders;
        if (!ingredientMap[key].menus.includes(menu.name)) {
          ingredientMap[key].menus.push(menu.name);
        }
      });
    });

    return Object.values(ingredientMap);
  }, [menus, buffered]);

  // Merge prep items with saved checklist state
  const checklistItems = useMemo(() => {
    return prepItems.map((item) => {
      const saved = prepLogs.find(p => p.name === item.name && p.date === today());
      return {
        ...item,
        done: saved ? saved.done : false,
        role: saved?.role || item.role,
        taskType: saved?.taskType || item.taskType,
      };
    });
  }, [prepItems, prepLogs]);

  const totalItems = checklistItems.length;
  const doneItems = checklistItems.filter(i => i.done).length;
  const completionPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const toggleItem = (name) => {
    const todayStr = today();
    const item = checklistItems.find(i => i.name === name);
    if (!item) return;
    const newDone = !item.done;

    setOpsData(prev => {
      const existing = (prev.prepLogs || []).filter(p => !(p.name === name && p.date === todayStr));
      return {
        ...prev,
        prepLogs: [...existing, { name, date: todayStr, done: newDone, role: item.role, taskType: item.taskType }],
      };
    });
  };

  const updateRole = (name, role) => {
    const todayStr = today();
    setOpsData(prev => {
      const logs = [...(prev.prepLogs || [])];
      const idx = logs.findIndex(p => p.name === name && p.date === todayStr);
      if (idx >= 0) {
        logs[idx] = { ...logs[idx], role };
      } else {
        logs.push({ name, date: todayStr, done: false, role, taskType: checklistItems.find(i => i.name === name)?.taskType || '기타' });
      }
      return { ...prev, prepLogs: logs };
    });
  };

  const filteredItems = filterType === '전체'
    ? checklistItems
    : checklistItems.filter(i => i.taskType === filterType);

  const grouped = useMemo(() => {
    const groups = {};
    TASK_TYPES.forEach(t => { groups[t] = []; });
    filteredItems.forEach(item => {
      const type = item.taskType || '기타';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="dops-content">
      {/* Stats Row */}
      <div className="prep-stats">
        <div className="prep-stat-card blue">
          <div className="ps-label">예상 주문수</div>
          <div className="ps-val">{expectedOrders}건</div>
          <div className="ps-sub">최근 7일 평균</div>
        </div>
        <div className="prep-stat-card teal">
          <div className="ps-label">버퍼 적용</div>
          <div className="ps-val">{buffered}건</div>
          <div className="ps-sub">+{bufferPct}% 여유분</div>
        </div>
        <div className="prep-stat-card purple">
          <div className="ps-label">준비 항목</div>
          <div className="ps-val">{totalItems}개</div>
          <div className="ps-sub">전체 재료</div>
        </div>
        <div className="prep-stat-card" style={{ background: completionPct === 100 ? 'var(--success-light)' : 'var(--warning-light)' }}>
          <div className="ps-label">완료율</div>
          <div className="ps-val" style={{ color: completionPct === 100 ? 'var(--success)' : 'var(--warning)' }}>
            {completionPct}%
          </div>
          <div className="ps-sub">{doneItems}/{totalItems} 완료</div>
        </div>
      </div>

      {/* Yesterday suggestion */}
      {suggestion && (
        <div className="prep-suggestion">
          <AlertTriangle size={15} />
          <span><strong>어제 실적 기반 조정:</strong> {suggestion}</span>
        </div>
      )}

      {/* Controls */}
      <div className="prep-controls">
        <div className="prep-ctrl-group">
          <label>수동 주문수 설정</label>
          <input
            type="number"
            value={manualOrders !== null ? manualOrders : ''}
            placeholder={`자동: ${avgOrders}`}
            onChange={e => {
              const v = e.target.value;
              setManualOrders(v === '' ? null : Number(v));
            }}
          />
        </div>
        <div className="prep-ctrl-group">
          <label>버퍼 %: {bufferPct}%</label>
          <input
            type="range"
            min={0}
            max={50}
            value={bufferPct}
            onChange={e => setBufferPct(Number(e.target.value))}
          />
        </div>
        <div className="prep-ctrl-group" style={{ position: 'relative' }}>
          <label>필터</label>
          <button className="dops-filter-btn" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={13} /> {filterType} <ChevronDown size={13} />
          </button>
          {showFilter && (
            <div className="dops-dropdown">
              {['전체', ...TASK_TYPES].map(t => (
                <button key={t} onClick={() => { setFilterType(t); setShowFilter(false); }}
                  className={filterType === t ? 'active' : ''}>{t}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checklist Grouped */}
      {TASK_TYPES.map(type => {
        const items = grouped[type] || [];
        if (items.length === 0) return null;
        const typeDone = items.filter(i => i.done).length;
        return (
          <div key={type} className="prep-group">
            <div className="prep-group-header">
              <span className="prep-group-title">{type}</span>
              <span className="prep-group-count">{typeDone}/{items.length} 완료</span>
            </div>
            {items.map(item => (
              <div key={item.name} className={`prep-item ${item.done ? 'done' : ''}`}>
                <button className="prep-check" onClick={() => toggleItem(item.name)}>
                  {item.done ? <Check size={14} /> : <span className="prep-empty-check" />}
                </button>
                <div className="prep-item-info">
                  <div className="prep-item-name">{item.name}</div>
                  <div className="prep-item-detail">
                    {item.totalAmount}인분 | {item.menus.join(', ')}
                  </div>
                </div>
                <select
                  className="prep-role-select"
                  value={item.role}
                  onChange={e => updateRole(item.name, e.target.value)}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
        );
      })}

      {checklistItems.length === 0 && (
        <div className="dops-empty">
          <ClipboardList size={40} strokeWidth={1} />
          <p>메뉴에 재료를 등록하면 준비 리스트가 자동 생성됩니다</p>
        </div>
      )}
    </div>
  );
}

function guessTaskType(name) {
  const lower = name.toLowerCase();
  if (['쌀', '밥', '현미', '잡곡'].some(k => lower.includes(k))) return '밥 취사';
  if (['소스', '양념', '드레싱', '간장', '고추장', '된장'].some(k => lower.includes(k))) return '소스 제조';
  if (['양파', '대파', '마늘', '고추', '당근', '양배추', '파', '무', '감자', '오이',
       '소고기', '돼지', '닭', '새우', '두부', '계란', '버섯'].some(k => lower.includes(k))) return '재료 손질';
  return '기타';
}

/* ================================================================
   TAB 2: 폐기/로스 추적 (Waste Tracker)
   ================================================================ */
function WasteTrackerTab({ menus, opsData, setOpsData }) {
  const wasteLogs = opsData.wasteLogs || [];

  const [form, setForm] = useState({
    date: today(),
    ingredient: '',
    amount: '',
    unit: 'g',
    reason: '유통기한 만료',
    cost: '',
  });
  const [showForm, setShowForm] = useState(false);

  const addWaste = () => {
    if (!form.ingredient || !form.amount || !form.cost) return;
    const entry = {
      id: Date.now(),
      date: form.date,
      ingredient: form.ingredient,
      amount: Number(form.amount),
      unit: form.unit,
      reason: form.reason,
      cost: Number(form.cost),
    };
    setOpsData(prev => ({
      ...prev,
      wasteLogs: [...(prev.wasteLogs || []), entry],
    }));
    setForm({ date: today(), ingredient: '', amount: '', unit: 'g', reason: '유통기한 만료', cost: '' });
    setShowForm(false);
  };

  const removeWaste = (id) => {
    setOpsData(prev => ({
      ...prev,
      wasteLogs: (prev.wasteLogs || []).filter(w => w.id !== id),
    }));
  };

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const monthMap = {};
    wasteLogs.forEach(w => {
      const m = w.date.slice(0, 7);
      if (!monthMap[m]) monthMap[m] = { cost: 0, count: 0 };
      monthMap[m].cost += w.cost;
      monthMap[m].count += 1;
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({ month, ...data }));
  }, [wasteLogs]);

  // Total ingredient cost estimate (from menus)
  const totalIngredientCost = useMemo(() => {
    if (!menus || menus.length === 0) return 1;
    return menus.reduce((s, m) => {
      return s + (m.ingredients || []).reduce((a, i) => a + (i.cost || 0), 0);
    }, 0) * 30 || 1; // Rough monthly estimate
  }, [menus]);

  const currentMonthWaste = monthlySummary[0]?.cost || 0;
  const wasteRate = ((currentMonthWaste / totalIngredientCost) * 100).toFixed(1);

  // Insights
  const insights = useMemo(() => {
    const ingredientCount = {};
    wasteLogs.forEach(w => {
      ingredientCount[w.ingredient] = (ingredientCount[w.ingredient] || 0) + 1;
    });
    const sorted = Object.entries(ingredientCount).sort(([, a], [, b]) => b - a);
    return sorted.slice(0, 3).map(([name, count]) => ({
      text: `${name} 폐기가 가장 빈번합니다 (${count}회) → 발주량 조절 필요`,
    }));
  }, [wasteLogs]);

  // Chart: monthly bar
  const chartMax = Math.max(...monthlySummary.map(m => m.cost), 1);

  return (
    <div className="dops-content">
      {/* Summary Cards */}
      <div className="waste-stats">
        <div className="ws-card">
          <div className="ws-label">이번 달 폐기 비용</div>
          <div className="ws-val">{fmt(currentMonthWaste)}원</div>
        </div>
        <div className="ws-card">
          <div className="ws-label">폐기율</div>
          <div className="ws-val" style={{ color: Number(wasteRate) > 3 ? 'var(--danger)' : 'var(--success)' }}>
            {wasteRate}%
          </div>
          <div className="ws-sub">목표: 3% 이하</div>
        </div>
        <div className="ws-card">
          <div className="ws-label">총 폐기 건수</div>
          <div className="ws-val">{wasteLogs.length}건</div>
        </div>
      </div>

      {/* Warning */}
      {Number(wasteRate) > 3 && (
        <div className="waste-warning">
          <AlertTriangle size={15} />
          <span>폐기율이 목표(3%)를 초과했습니다! 현재 {wasteRate}% — 발주량 및 재고 관리를 점검하세요.</span>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="dops-card">
          <h3><TrendingDown size={16} /> 자동 인사이트</h3>
          <div className="waste-insights">
            {insights.map((ins, i) => (
              <div key={i} className="waste-insight-item">
                <AlertTriangle size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <span>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Chart */}
      {monthlySummary.length > 0 && (
        <div className="dops-card">
          <h3>월별 폐기 비용 추이</h3>
          <div className="waste-chart">
            {monthlySummary.slice(0, 6).reverse().map(m => (
              <div key={m.month} className="wc-col">
                <div className="wc-bar-wrap">
                  <div
                    className="wc-bar"
                    style={{ height: `${(m.cost / chartMax) * 100}%` }}
                  />
                </div>
                <div className="wc-label">{m.month.slice(5)}월</div>
                <div className="wc-val">{fmt(m.cost)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Button */}
      <button className="dops-add-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? <X size={15} /> : <Plus size={15} />}
        {showForm ? '취소' : '폐기 기록 추가'}
      </button>

      {/* Form */}
      {showForm && (
        <div className="dops-card">
          <h3>폐기 기록 추가</h3>
          <div className="dops-form-grid">
            <div className="dops-field">
              <label>날짜</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="dops-field">
              <label>재료명</label>
              <input type="text" placeholder="예: 소고기" value={form.ingredient}
                onChange={e => setForm(p => ({ ...p, ingredient: e.target.value }))} />
            </div>
            <div className="dops-field">
              <label>수량</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" placeholder="0" value={form.amount} style={{ flex: 1 }}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  style={{ width: 70 }}>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="개">개</option>
                  <option value="팩">팩</option>
                </select>
              </div>
            </div>
            <div className="dops-field">
              <label>사유</label>
              <select value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}>
                {WASTE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="dops-field">
              <label>예상 비용 (원)</label>
              <input type="number" placeholder="0" value={form.cost}
                onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
            </div>
          </div>
          <button className="dops-submit-btn" onClick={addWaste}>
            <Plus size={14} /> 기록 추가
          </button>
        </div>
      )}

      {/* Waste Log Table */}
      <div className="dops-card">
        <h3>폐기 기록</h3>
        {wasteLogs.length === 0 ? (
          <div className="dops-empty-sm">아직 폐기 기록이 없습니다</div>
        ) : (
          <div className="dops-table-wrap">
            <table className="dops-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>재료</th>
                  <th>수량</th>
                  <th>사유</th>
                  <th>비용</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...wasteLogs].sort((a, b) => b.date.localeCompare(a.date)).map(w => (
                  <tr key={w.id}>
                    <td>{w.date}</td>
                    <td className="td-bold">{w.ingredient}</td>
                    <td>{w.amount}{w.unit}</td>
                    <td>
                      <span className={`waste-reason-tag ${w.reason === '유통기한 만료' ? 'red' : w.reason === '과다 발주' ? 'orange' : w.reason === '조리 실패' ? 'purple' : 'gray'}`}>
                        {w.reason}
                      </span>
                    </td>
                    <td className="td-bold">{fmt(w.cost)}원</td>
                    <td>
                      <button className="dops-del-btn" onClick={() => removeWaste(w.id)}>
                        <X size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   TAB 3: 배달 품질 추적 (Delivery Quality)
   ================================================================ */
function DeliveryQualityTab({ opsData, setOpsData }) {
  const deliveryLogs = opsData.deliveryLogs || [];

  const [form, setForm] = useState({
    date: today(),
    platform: 'baemin',
    orderId: '',
    prepTime: '',
    deliveryTime: '',
    company: '',
    issue: 'none',
  });
  const [showForm, setShowForm] = useState(false);

  const addDelivery = () => {
    if (!form.prepTime || !form.deliveryTime) return;
    const entry = {
      id: Date.now(),
      date: form.date,
      platform: form.platform,
      orderId: form.orderId || '-',
      prepTime: Number(form.prepTime),
      deliveryTime: Number(form.deliveryTime),
      company: form.company || '-',
      issue: form.issue,
    };
    setOpsData(prev => ({
      ...prev,
      deliveryLogs: [...(prev.deliveryLogs || []), entry],
    }));
    setForm({ date: today(), platform: 'baemin', orderId: '', prepTime: '', deliveryTime: '', company: '', issue: 'none' });
    setShowForm(false);
  };

  const removeDelivery = (id) => {
    setOpsData(prev => ({
      ...prev,
      deliveryLogs: (prev.deliveryLogs || []).filter(d => d.id !== id),
    }));
  };

  // Summary stats
  const stats = useMemo(() => {
    if (deliveryLogs.length === 0) return { avgTotal: 0, avgPrep: 0, avgDelivery: 0, issueRate: 0, issueCount: {} };
    const total = deliveryLogs.length;
    const avgPrep = Math.round(deliveryLogs.reduce((s, d) => s + d.prepTime, 0) / total);
    const avgDelivery = Math.round(deliveryLogs.reduce((s, d) => s + d.deliveryTime, 0) / total);
    const avgTotal = avgPrep + avgDelivery;
    const issues = deliveryLogs.filter(d => d.issue !== 'none').length;
    const issueRate = ((issues / total) * 100).toFixed(1);

    const issueCount = {};
    ISSUE_TYPES.filter(t => t !== 'none').forEach(t => { issueCount[t] = 0; });
    deliveryLogs.forEach(d => {
      if (d.issue !== 'none') issueCount[d.issue] = (issueCount[d.issue] || 0) + 1;
    });

    return { avgTotal, avgPrep, avgDelivery, issueRate, issueCount };
  }, [deliveryLogs]);

  // Delivery company comparison
  const companyStats = useMemo(() => {
    const map = {};
    deliveryLogs.forEach(d => {
      const c = d.company || '-';
      if (c === '-') return;
      if (!map[c]) map[c] = { count: 0, totalTime: 0 };
      map[c].count += 1;
      map[c].totalTime += d.deliveryTime;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      avgTime: Math.round(data.totalTime / data.count),
    })).sort((a, b) => a.avgTime - b.avgTime);
  }, [deliveryLogs]);

  const prepColor = stats.avgPrep <= 10 ? 'var(--success)' : stats.avgPrep <= 15 ? 'var(--warning)' : 'var(--danger)';
  const totalColor = stats.avgTotal <= 30 ? 'var(--success)' : stats.avgTotal <= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="dops-content">
      {/* Summary Cards */}
      <div className="del-stats">
        <div className="del-stat-card">
          <Clock size={18} style={{ color: totalColor }} />
          <div className="ds-label">평균 총 시간</div>
          <div className="ds-val" style={{ color: totalColor }}>{stats.avgTotal}분</div>
          <div className="ds-sub">목표: 30분 이내</div>
        </div>
        <div className="del-stat-card">
          <ClipboardList size={18} style={{ color: prepColor }} />
          <div className="ds-label">평균 조리시간</div>
          <div className="ds-val" style={{ color: prepColor }}>{stats.avgPrep}분</div>
          <div className="ds-sub">목표: 10분</div>
        </div>
        <div className="del-stat-card">
          <Truck size={18} style={{ color: 'var(--primary)' }} />
          <div className="ds-label">평균 배달시간</div>
          <div className="ds-val">{stats.avgDelivery}분</div>
        </div>
        <div className="del-stat-card">
          <AlertTriangle size={18} style={{ color: Number(stats.issueRate) > 5 ? 'var(--danger)' : 'var(--success)' }} />
          <div className="ds-label">이슈 발생률</div>
          <div className="ds-val" style={{ color: Number(stats.issueRate) > 5 ? 'var(--danger)' : 'var(--success)' }}>
            {stats.issueRate}%
          </div>
        </div>
      </div>

      {/* Prep time display */}
      <div className="del-prep-display" style={{ borderLeftColor: prepColor }}>
        <span>조리시간 평균 <strong style={{ color: prepColor }}>{stats.avgPrep}분</strong> — 목표 10분</span>
        {stats.avgPrep <= 10 && <span className="del-badge green">달성</span>}
        {stats.avgPrep > 10 && stats.avgPrep <= 15 && <span className="del-badge yellow">개선 필요</span>}
        {stats.avgPrep > 15 && <span className="del-badge red">초과</span>}
      </div>

      {/* Issue Breakdown */}
      {deliveryLogs.length > 0 && (
        <div className="dops-card">
          <h3>이슈 유형별 현황</h3>
          <div className="del-issue-grid">
            {ISSUE_TYPES.filter(t => t !== 'none').map(type => (
              <div key={type} className="del-issue-item">
                <div className="dii-count">{stats.issueCount[type] || 0}</div>
                <div className="dii-label">{ISSUE_LABELS[type]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Comparison */}
      {companyStats.length > 0 && (
        <div className="dops-card">
          <h3>배달 업체별 비교</h3>
          <div className="dops-table-wrap">
            <table className="dops-table">
              <thead>
                <tr>
                  <th>배달 업체</th>
                  <th>건수</th>
                  <th>평균 배달시간</th>
                </tr>
              </thead>
              <tbody>
                {companyStats.map(c => (
                  <tr key={c.name}>
                    <td className="td-bold">{c.name}</td>
                    <td>{c.count}건</td>
                    <td>
                      <span style={{ color: c.avgTime <= 20 ? 'var(--success)' : c.avgTime <= 30 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>
                        {c.avgTime}분
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button className="dops-add-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? <X size={15} /> : <Plus size={15} />}
        {showForm ? '취소' : '배달 기록 추가'}
      </button>

      {/* Form */}
      {showForm && (
        <div className="dops-card">
          <h3>배달 기록 추가</h3>
          <div className="dops-form-grid">
            <div className="dops-field">
              <label>날짜</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="dops-field">
              <label>플랫폼</label>
              <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
                {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.name}</option>)}
              </select>
            </div>
            <div className="dops-field">
              <label>주문번호 (선택)</label>
              <input type="text" placeholder="선택 입력" value={form.orderId}
                onChange={e => setForm(p => ({ ...p, orderId: e.target.value }))} />
            </div>
            <div className="dops-field">
              <label>조리시간 (분)</label>
              <input type="number" placeholder="0" value={form.prepTime}
                onChange={e => setForm(p => ({ ...p, prepTime: e.target.value }))} />
            </div>
            <div className="dops-field">
              <label>배달시간 (분)</label>
              <input type="number" placeholder="0" value={form.deliveryTime}
                onChange={e => setForm(p => ({ ...p, deliveryTime: e.target.value }))} />
            </div>
            <div className="dops-field">
              <label>배달 업체</label>
              <input type="text" placeholder="예: 바로고, 부릉" value={form.company}
                onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="dops-field">
              <label>이슈</label>
              <select value={form.issue} onChange={e => setForm(p => ({ ...p, issue: e.target.value }))}>
                {ISSUE_TYPES.map(t => <option key={t} value={t}>{ISSUE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <button className="dops-submit-btn" onClick={addDelivery}>
            <Plus size={14} /> 기록 추가
          </button>
        </div>
      )}

      {/* Delivery Log Table */}
      <div className="dops-card">
        <h3>배달 기록</h3>
        {deliveryLogs.length === 0 ? (
          <div className="dops-empty-sm">아직 배달 기록이 없습니다</div>
        ) : (
          <div className="dops-table-wrap">
            <table className="dops-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>플랫폼</th>
                  <th>주문번호</th>
                  <th>조리</th>
                  <th>배달</th>
                  <th>총시간</th>
                  <th>업체</th>
                  <th>이슈</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...deliveryLogs].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).map(d => {
                  const total = d.prepTime + d.deliveryTime;
                  const platInfo = PLATFORMS.find(p => p.key === d.platform);
                  return (
                    <tr key={d.id}>
                      <td>{d.date}</td>
                      <td style={{ color: platInfo?.color, fontWeight: 600 }}>{platInfo?.name || d.platform}</td>
                      <td>{d.orderId}</td>
                      <td>{d.prepTime}분</td>
                      <td>{d.deliveryTime}분</td>
                      <td style={{ fontWeight: 600, color: total <= 30 ? 'var(--success)' : total <= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                        {total}분
                      </td>
                      <td>{d.company}</td>
                      <td>
                        {d.issue !== 'none' && (
                          <span className="del-issue-tag">{ISSUE_LABELS[d.issue]}</span>
                        )}
                        {d.issue === 'none' && <span style={{ color: 'var(--text-light)' }}>-</span>}
                      </td>
                      <td>
                        <button className="dops-del-btn" onClick={() => removeDelivery(d.id)}>
                          <X size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   TAB 4: 포장 재고 관리 (Packaging Stock)
   ================================================================ */
function PackagingStockTab({ dailyLogs, opsData, setOpsData }) {
  const packagingStock = opsData.packagingStock && opsData.packagingStock.length > 0
    ? opsData.packagingStock
    : DEFAULT_PACKAGING;

  // Auto daily usage from avg orders
  const avgDailyOrders = useMemo(() => {
    const sorted = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    const last7 = sorted.slice(0, 7);
    if (last7.length === 0) return 30;
    const totals = last7.map(d => {
      const o = d.orders || {};
      return (Number(o.baemin) || 0) + (Number(o.coupang) || 0) + (Number(o.yogiyo) || 0) + (Number(o.takeout) || 0);
    });
    return Math.round(totals.reduce((s, v) => s + v, 0) / totals.length) || 30;
  }, [dailyLogs]);

  const updateItem = (idx, field, value) => {
    setOpsData(prev => {
      const items = [...(prev.packagingStock && prev.packagingStock.length > 0 ? prev.packagingStock : DEFAULT_PACKAGING)];
      items[idx] = { ...items[idx], [field]: Number(value) || 0 };
      return { ...prev, packagingStock: items };
    });
  };

  const enriched = packagingStock.map(item => {
    const usage = item.dailyUsage > 0 ? item.dailyUsage : avgDailyOrders;
    const daysRemaining = usage > 0 ? (item.stock / usage) : 999;
    const status = daysRemaining < 2 ? 'red' : daysRemaining < 5 ? 'yellow' : 'green';
    const needsReorder = daysRemaining < (item.reorderPoint || 3);
    return { ...item, effectiveUsage: usage, daysRemaining: Math.round(daysRemaining * 10) / 10, status, needsReorder };
  });

  const alertItems = enriched.filter(i => i.needsReorder);
  const totalCostPerOrder = enriched.reduce((s, i) => s + (i.unitCost || 0), 0);

  return (
    <div className="dops-content">
      {/* Summary */}
      <div className="pkg-stats">
        <div className="pkg-stat-card">
          <Package size={18} style={{ color: 'var(--primary)' }} />
          <div className="pks-label">관리 품목</div>
          <div className="pks-val">{packagingStock.length}개</div>
        </div>
        <div className="pkg-stat-card">
          <AlertTriangle size={18} style={{ color: alertItems.length > 0 ? 'var(--danger)' : 'var(--success)' }} />
          <div className="pks-label">발주 필요</div>
          <div className="pks-val" style={{ color: alertItems.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {alertItems.length}개
          </div>
        </div>
        <div className="pkg-stat-card">
          <Calendar size={18} style={{ color: 'var(--teal)' }} />
          <div className="pks-label">일평균 주문</div>
          <div className="pks-val">{avgDailyOrders}건</div>
        </div>
        <div className="pkg-stat-card">
          <TrendingDown size={18} style={{ color: 'var(--purple)' }} />
          <div className="pks-label">주문당 포장비</div>
          <div className="pks-val">{fmt(totalCostPerOrder)}원</div>
        </div>
      </div>

      {/* Reorder Alerts */}
      {alertItems.length > 0 && (
        <div className="pkg-alerts">
          <div className="pkg-alert-header">
            <AlertTriangle size={15} /> 발주 필요 품목
          </div>
          {alertItems.map(item => (
            <div key={item.name} className="pkg-alert-item">
              <span className="pkg-alert-name">{item.name}</span>
              <span className="pkg-alert-days">잔여 {item.daysRemaining}일</span>
            </div>
          ))}
        </div>
      )}

      {/* Stock Table */}
      <div className="dops-card">
        <h3>포장 재고 현황</h3>
        <div className="dops-table-wrap">
          <table className="dops-table pkg-table">
            <thead>
              <tr>
                <th>품목</th>
                <th>현재 재고</th>
                <th>일 사용량</th>
                <th>단가</th>
                <th>잔여일</th>
                <th>발주점 (일)</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((item, idx) => (
                <tr key={item.name}>
                  <td className="td-bold">{item.name}</td>
                  <td>
                    <input
                      type="number"
                      className="pkg-input"
                      value={item.stock}
                      onChange={e => updateItem(idx, 'stock', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="pkg-input"
                      value={item.dailyUsage}
                      placeholder={String(avgDailyOrders)}
                      onChange={e => updateItem(idx, 'dailyUsage', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="pkg-input"
                      value={item.unitCost}
                      onChange={e => updateItem(idx, 'unitCost', e.target.value)}
                    />
                    <span className="pkg-unit">원</span>
                  </td>
                  <td>
                    <span className={`pkg-days ${item.status}`}>
                      {item.daysRemaining}일
                    </span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="pkg-input sm"
                      value={item.reorderPoint || 3}
                      onChange={e => updateItem(idx, 'reorderPoint', e.target.value)}
                    />
                  </td>
                  <td>
                    {item.status === 'red' && <span className="pkg-status red">긴급</span>}
                    {item.status === 'yellow' && <span className="pkg-status yellow">주의</span>}
                    {item.status === 'green' && <span className="pkg-status green">양호</span>}
                  </td>
                </tr>
              ))}
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
const dailyOpsCSS = `
  .dops {
    padding: 0;
  }
  .dops .page-header {
    margin-bottom: 24px;
  }
  .dops .page-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 4px;
  }
  .dops .page-header p {
    color: var(--text-light);
    font-size: 14px;
  }

  /* ── Tab Bar ── */
  .dops-tab-bar {
    display: flex;
    gap: 4px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 4px;
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .dops-tab {
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
  .dops-tab:hover { background: var(--bg); }
  .dops-tab.active {
    background: var(--primary);
    color: white;
    font-weight: 600;
  }

  /* ── Shared ── */
  .dops-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .dops-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .dops-card h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dops-empty {
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
  }
  .dops-empty-sm {
    text-align: center;
    padding: 32px;
    color: var(--text-light);
    font-size: 13px;
  }

  /* ── Forms ── */
  .dops-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  .dops-field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-light);
    margin-bottom: 4px;
  }
  .dops-field input,
  .dops-field select {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text-dark);
    background: var(--bg);
    transition: border-color 0.15s;
  }
  .dops-field input:focus,
  .dops-field select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }

  .dops-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    background: var(--primary);
    color: white;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    align-self: flex-start;
    transition: background 0.15s;
  }
  .dops-add-btn:hover { background: var(--primary-dark); }

  .dops-submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--success);
    color: white;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    transition: opacity 0.15s;
  }
  .dops-submit-btn:hover { opacity: 0.9; }

  .dops-del-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    color: var(--text-light);
    transition: all 0.15s;
  }
  .dops-del-btn:hover { background: var(--danger-light); color: var(--danger); }

  /* ── Tables ── */
  .dops-table-wrap { overflow-x: auto; }
  .dops-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .dops-table th {
    text-align: left;
    padding: 10px 12px;
    font-weight: 600;
    color: var(--text-light);
    font-size: 12px;
    border-bottom: 2px solid var(--border);
    white-space: nowrap;
  }
  .dops-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light);
    color: var(--text);
    white-space: nowrap;
  }
  .dops-table tbody tr:hover { background: var(--bg); }
  .td-bold { font-weight: 600; color: var(--text-dark); }

  /* ── Filter ── */
  .dops-filter-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 7px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text);
    background: var(--bg-card);
  }
  .dops-filter-btn:hover { border-color: var(--primary); }
  .dops-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
    z-index: 50;
    min-width: 140px;
    overflow: hidden;
  }
  .dops-dropdown button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 8px 14px;
    font-size: 13px;
    color: var(--text);
    transition: background 0.1s;
  }
  .dops-dropdown button:hover { background: var(--bg); }
  .dops-dropdown button.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }

  /* ================================================================
     TAB 1: Prep List
     ================================================================ */
  .prep-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .prep-stat-card {
    padding: 16px;
    border-radius: var(--radius);
    text-align: center;
  }
  .prep-stat-card.blue { background: var(--primary-light); }
  .prep-stat-card.teal { background: var(--teal-light); }
  .prep-stat-card.purple { background: var(--purple-light); }
  .ps-label { font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
  .ps-val { font-size: 22px; font-weight: 700; color: var(--text-dark); }
  .ps-sub { font-size: 11px; color: var(--text-light); margin-top: 2px; }

  .prep-suggestion {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: var(--warning-light);
    border: 1px solid var(--warning);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text-dark);
  }
  .prep-suggestion svg { color: var(--warning); flex-shrink: 0; }

  .prep-controls {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    flex-wrap: wrap;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }
  .prep-ctrl-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .prep-ctrl-group label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-light);
  }
  .prep-ctrl-group input[type="number"] {
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    width: 130px;
    color: var(--text-dark);
    background: var(--bg);
  }
  .prep-ctrl-group input[type="number"]:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }
  .prep-ctrl-group input[type="range"] {
    width: 160px;
    accent-color: var(--primary);
  }

  .prep-group {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .prep-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg);
    border-bottom: 1px solid var(--border-light);
  }
  .prep-group-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
  }
  .prep-group-count {
    font-size: 12px;
    color: var(--text-light);
  }

  .prep-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border-light);
    transition: background 0.1s;
  }
  .prep-item:last-child { border-bottom: none; }
  .prep-item:hover { background: #fafbfc; }
  .prep-item.done { opacity: 0.55; }
  .prep-item.done .prep-item-name { text-decoration: line-through; }

  .prep-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: var(--success);
    color: white;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .prep-item:not(.done) .prep-check {
    background: none;
    border: 2px solid var(--border);
    color: transparent;
  }
  .prep-item:not(.done) .prep-check:hover {
    border-color: var(--success);
  }
  .prep-empty-check {
    display: block;
    width: 10px;
    height: 10px;
  }

  .prep-item-info { flex: 1; min-width: 0; }
  .prep-item-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-dark);
  }
  .prep-item-detail {
    font-size: 12px;
    color: var(--text-light);
    margin-top: 1px;
  }

  .prep-role-select {
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text);
    background: var(--bg);
    cursor: pointer;
  }
  .prep-role-select:focus {
    border-color: var(--primary);
  }

  /* ================================================================
     TAB 2: Waste Tracker
     ================================================================ */
  .waste-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .ws-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    text-align: center;
  }
  .ws-label { font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
  .ws-val { font-size: 22px; font-weight: 700; color: var(--text-dark); }
  .ws-sub { font-size: 11px; color: var(--text-light); margin-top: 4px; }

  .waste-warning {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: var(--danger-light);
    border: 1px solid var(--danger);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text-dark);
  }
  .waste-warning svg { color: var(--danger); flex-shrink: 0; }

  .waste-insights {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .waste-insight-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    background: var(--bg);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text-dark);
  }

  .waste-reason-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
  .waste-reason-tag.red { background: var(--danger-light); color: var(--danger); }
  .waste-reason-tag.orange { background: var(--warning-light); color: var(--warning); }
  .waste-reason-tag.purple { background: var(--purple-light); color: var(--purple); }
  .waste-reason-tag.gray { background: var(--bg); color: var(--text-light); }

  /* Waste Chart */
  .waste-chart {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    height: 160px;
    padding-top: 10px;
  }
  .wc-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }
  .wc-bar-wrap {
    flex: 1;
    width: 100%;
    max-width: 48px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .wc-bar {
    width: 100%;
    background: var(--primary);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: height 0.3s;
  }
  .wc-label {
    font-size: 11px;
    color: var(--text-light);
    margin-top: 6px;
  }
  .wc-val {
    font-size: 10px;
    color: var(--text-light);
    margin-top: 2px;
  }

  /* ================================================================
     TAB 3: Delivery Quality
     ================================================================ */
  .del-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .del-stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .ds-label { font-size: 12px; color: var(--text-light); }
  .ds-val { font-size: 22px; font-weight: 700; color: var(--text-dark); }
  .ds-sub { font-size: 11px; color: var(--text-light); }

  .del-prep-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-left: 4px solid var(--primary);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--text-dark);
  }
  .del-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
  .del-badge.green { background: var(--success-light); color: var(--success); }
  .del-badge.yellow { background: var(--warning-light); color: var(--warning); }
  .del-badge.red { background: var(--danger-light); color: var(--danger); }

  .del-issue-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .del-issue-item {
    text-align: center;
    padding: 14px;
    background: var(--bg);
    border-radius: var(--radius-sm);
  }
  .dii-count {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-dark);
  }
  .dii-label {
    font-size: 12px;
    color: var(--text-light);
    margin-top: 2px;
  }

  .del-issue-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    background: var(--danger-light);
    color: var(--danger);
  }

  /* ================================================================
     TAB 4: Packaging Stock
     ================================================================ */
  .pkg-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .pkg-stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .pks-label { font-size: 12px; color: var(--text-light); }
  .pks-val { font-size: 22px; font-weight: 700; color: var(--text-dark); }

  .pkg-alerts {
    background: var(--danger-light);
    border: 1px solid var(--danger);
    border-radius: var(--radius-sm);
    padding: 14px 18px;
  }
  .pkg-alert-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--danger);
    margin-bottom: 10px;
  }
  .pkg-alert-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;
    color: var(--text-dark);
    border-bottom: 1px solid rgba(220, 38, 38, 0.15);
  }
  .pkg-alert-item:last-child { border-bottom: none; }
  .pkg-alert-name { font-weight: 500; }
  .pkg-alert-days { font-weight: 600; color: var(--danger); }

  .pkg-input {
    width: 80px;
    padding: 5px 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 13px;
    color: var(--text-dark);
    background: var(--bg);
    text-align: right;
  }
  .pkg-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }
  .pkg-input.sm { width: 56px; }
  .pkg-unit {
    font-size: 12px;
    color: var(--text-light);
    margin-left: 3px;
  }

  .pkg-days {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
  .pkg-days.red { background: var(--danger-light); color: var(--danger); }
  .pkg-days.yellow { background: var(--warning-light); color: var(--warning); }
  .pkg-days.green { background: var(--success-light); color: var(--success); }

  .pkg-status {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
  .pkg-status.red { background: var(--danger-light); color: var(--danger); }
  .pkg-status.yellow { background: var(--warning-light); color: var(--warning); }
  .pkg-status.green { background: var(--success-light); color: var(--success); }

  .pkg-table td { vertical-align: middle; }

  /* ================================================================
     Responsive
     ================================================================ */
  @media (max-width: 900px) {
    .prep-stats,
    .del-stats,
    .pkg-stats { grid-template-columns: repeat(2, 1fr); }
    .waste-stats { grid-template-columns: 1fr; }
    .del-issue-grid { grid-template-columns: repeat(2, 1fr); }
    .dops-form-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 600px) {
    .dops-tab { padding: 8px 12px; font-size: 12px; }
    .prep-stats,
    .del-stats,
    .pkg-stats { grid-template-columns: 1fr; }
    .del-issue-grid { grid-template-columns: repeat(2, 1fr); }
    .dops-form-grid { grid-template-columns: 1fr; }
    .prep-controls { flex-direction: column; align-items: stretch; }
  }
`;
