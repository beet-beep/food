import React, { useState, useMemo } from 'react';
import { ShoppingCart, Users, Plus, Minus, Star, Search, Tag, Edit3, Trash2, Calendar, Award, Check } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const today = () => new Date().toISOString().split('T')[0];

const COMMON_TAGS = ['양많이', '맵게', '안맵게', '젓가락X', '숟가락만'];

export default function MenuSales({ menus, menuSalesData, setMenuSalesData }) {
  const [tab, setTab] = useState('sales');
  const data = menuSalesData || { dailySales: [], customers: [] };
  const dailySales = data.dailySales || [];
  const customers = data.customers || [];

  const save = (updates) => setMenuSalesData(prev => ({ ...prev, ...updates }));

  const tabs = [
    { id: 'sales', label: '메뉴별 판매 추적', icon: ShoppingCart },
    { id: 'customers', label: '고객 메모 (단골 관리)', icon: Users },
  ];

  return (
    <div className="ms">
      <div className="page-header">
        <h1>메뉴별 판매 & 고객 관리</h1>
        <p>메뉴별 판매량 추적과 단골 고객 메모를 관리하세요</p>
      </div>

      <div className="ms-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`ms-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'sales' && (
        <SalesTab menus={menus} dailySales={dailySales} save={save} />
      )}
      {tab === 'customers' && (
        <CustomersTab menus={menus} customers={customers} save={save} />
      )}

      <style>{menuSalesCSS}</style>
    </div>
  );
}

/* ========== Tab 1: 메뉴별 판매 추적 ========== */
function SalesTab({ menus, dailySales, save }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [quantities, setQuantities] = useState({});
  const [saved, setSaved] = useState(false);

  const mainMenus = menus.filter(m => m.category === 'main');

  // Load quantities for selected date
  const existingEntry = dailySales.find(d => d.date === selectedDate);

  const getQty = (menuId) => {
    if (quantities[menuId] !== undefined) return quantities[menuId];
    if (existingEntry) {
      const item = existingEntry.items.find(i => i.menuId === menuId);
      return item ? item.quantity : 0;
    }
    return 0;
  };

  const setQty = (menuId, val) => {
    const current = getQty(menuId);
    const next = Math.max(0, current + val);
    setQuantities(prev => ({ ...prev, [menuId]: next }));
    setSaved(false);
  };

  const totalToday = mainMenus.reduce((s, m) => s + getQty(m.id), 0);

  const handleSave = () => {
    const items = mainMenus
      .map(m => ({ menuId: m.id, quantity: getQty(m.id) }))
      .filter(i => i.quantity > 0);
    const entry = { id: 'ms_' + selectedDate, date: selectedDate, items };

    save({
      dailySales: (() => {
        const idx = dailySales.findIndex(d => d.date === selectedDate);
        if (idx >= 0) {
          const next = [...dailySales];
          next[idx] = entry;
          return next;
        }
        return [...dailySales, entry].sort((a, b) => b.date.localeCompare(a.date));
      })()
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setQuantities({});
    setSaved(false);
  };

  // Last 7 days history
  const last7 = useMemo(() => {
    return [...dailySales]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
  }, [dailySales]);

  // This week's data (Mon-Sun)
  const thisWeekSales = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const monStr = monday.toISOString().split('T')[0];

    return dailySales.filter(d => d.date >= monStr && d.date <= today());
  }, [dailySales]);

  // Rankings
  const menuTotals = useMemo(() => {
    const totals = {};
    mainMenus.forEach(m => { totals[m.id] = 0; });
    thisWeekSales.forEach(day => {
      day.items.forEach(item => {
        if (totals[item.menuId] !== undefined) {
          totals[item.menuId] += item.quantity;
        }
      });
    });
    return totals;
  }, [thisWeekSales, mainMenus]);

  const top5 = useMemo(() => {
    return mainMenus
      .map(m => ({ ...m, total: menuTotals[m.id] || 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .filter(m => m.total > 0);
  }, [mainMenus, menuTotals]);

  const unsold = useMemo(() => {
    return mainMenus.filter(m => (menuTotals[m.id] || 0) === 0);
  }, [mainMenus, menuTotals]);

  return (
    <div className="ms-section">
      {/* Date Picker */}
      <div className="ms-date-row">
        <Calendar size={18} />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
        />
        <span className="ms-today-total">오늘 총 {fmt(totalToday)}개 판매</span>
      </div>

      {/* Menu Grid */}
      <div className="ms-menu-grid">
        {mainMenus.map(m => {
          const qty = getQty(m.id);
          return (
            <div key={m.id} className={`ms-menu-card ${qty > 0 ? 'has-qty' : ''}`}>
              <div className="ms-menu-top">
                <span className="ms-menu-emoji">{m.emoji}</span>
                <span className="ms-menu-name">{m.name}</span>
              </div>
              <div className="ms-qty-controls">
                <button className="ms-qty-btn minus" onClick={() => setQty(m.id, -1)} disabled={qty === 0}>
                  <Minus size={20} />
                </button>
                <span className="ms-qty-value">{qty}</span>
                <button className="ms-qty-btn plus" onClick={() => setQty(m.id, 1)}>
                  <Plus size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <button className="ms-save-btn" onClick={handleSave}>
        {saved ? <><Check size={18} /> 저장 완료!</> : <><ShoppingCart size={18} /> 저장</>}
      </button>

      {/* History Table */}
      {last7.length > 0 && (
        <div className="ms-history">
          <h3 className="ms-section-title"><Calendar size={16} /> 최근 7일 판매 내역</h3>
          <div className="ms-table-wrap">
            <table className="ms-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  {mainMenus.map(m => <th key={m.id}>{m.emoji}</th>)}
                  <th>합계</th>
                </tr>
              </thead>
              <tbody>
                {last7.map(day => {
                  const dayTotal = day.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <tr key={day.date}>
                      <td className="ms-date-cell">{day.date.slice(5)}</td>
                      {mainMenus.map(m => {
                        const item = day.items.find(i => i.menuId === m.id);
                        const q = item ? item.quantity : 0;
                        return <td key={m.id} className={q > 0 ? 'has-val' : ''}>{q || '-'}</td>;
                      })}
                      <td className="ms-total-cell">{dayTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="ms-rankings">
        {top5.length > 0 && (
          <div className="ms-rank-card">
            <h3 className="ms-section-title"><Award size={16} /> 이번 주 인기 메뉴 TOP 5</h3>
            <div className="ms-rank-list">
              {top5.map((m, i) => (
                <div key={m.id} className="ms-rank-item">
                  <span className={`ms-rank-badge rank-${i + 1}`}>{i + 1}</span>
                  <span className="ms-rank-emoji">{m.emoji}</span>
                  <span className="ms-rank-name">{m.name}</span>
                  <span className="ms-rank-count">{m.total}개</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {unsold.length > 0 && (
          <div className="ms-unsold-card">
            <h3 className="ms-section-title" style={{ color: '#ef4444' }}>
              <Star size={16} /> 이번 주 안 팔린 메뉴
            </h3>
            <div className="ms-unsold-list">
              {unsold.map(m => (
                <span key={m.id} className="ms-unsold-tag">{m.emoji} {m.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== Tab 2: 고객 메모 (단골 관리) ========== */
function CustomersTab({ menus, customers, save }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ identifier: '', notes: '', preferences: '' });
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPrefs, setEditPrefs] = useState('');

  const mainMenus = menus.filter(m => m.category === 'main');

  const addCustomer = () => {
    if (!newCustomer.identifier.trim()) return;
    const customer = {
      id: 'cust_' + Date.now(),
      identifier: newCustomer.identifier.trim(),
      notes: newCustomer.notes.trim(),
      preferences: newCustomer.preferences.trim(),
      orderCount: 0,
      lastOrder: null,
      favoriteMenu: null,
    };
    save({ customers: [...customers, customer] });
    setNewCustomer({ identifier: '', notes: '', preferences: '' });
    setShowForm(false);
  };

  const deleteCustomer = (id) => {
    save({ customers: customers.filter(c => c.id !== id) });
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditNotes(c.notes || '');
    setEditPrefs(c.preferences || '');
  };

  const saveEdit = (id) => {
    save({
      customers: customers.map(c =>
        c.id === id ? { ...c, notes: editNotes, preferences: editPrefs } : c
      )
    });
    setEditingId(null);
  };

  const addTag = (id, tag) => {
    save({
      customers: customers.map(c => {
        if (c.id !== id) return c;
        const currentPrefs = c.preferences || '';
        if (currentPrefs.includes(tag)) return c;
        return { ...c, preferences: currentPrefs ? `${currentPrefs}, ${tag}` : tag };
      })
    });
  };

  const incrementOrder = (id, menuId) => {
    save({
      customers: customers.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          orderCount: (c.orderCount || 0) + 1,
          lastOrder: today(),
          favoriteMenu: menuId || c.favoriteMenu,
        };
      })
    });
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.trim().toLowerCase();
    return customers.filter(c =>
      c.identifier.toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q) ||
      (c.preferences || '').toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  // Stats
  const totalCustomers = customers.length;
  const dangorCount = customers.filter(c => (c.orderCount || 0) >= 5).length;
  const avgOrders = totalCustomers > 0
    ? (customers.reduce((s, c) => s + (c.orderCount || 0), 0) / totalCustomers).toFixed(1)
    : '0';

  return (
    <div className="ms-section">
      {/* Stats */}
      <div className="ms-cust-stats">
        <div className="ms-cust-stat">
          <span className="ms-cstat-label">총 고객</span>
          <span className="ms-cstat-value">{totalCustomers}명</span>
        </div>
        <div className="ms-cust-stat">
          <span className="ms-cstat-label">단골 고객</span>
          <span className="ms-cstat-value accent">{dangorCount}명</span>
        </div>
        <div className="ms-cust-stat">
          <span className="ms-cstat-label">평균 주문</span>
          <span className="ms-cstat-value">{avgOrders}회</span>
        </div>
      </div>

      {/* Search + Add */}
      <div className="ms-cust-toolbar">
        <div className="ms-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="고객 검색 (번호 뒷자리, 닉네임)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="ms-add-btn" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> 고객 추가
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="ms-add-form">
          <h4>새 고객 추가</h4>
          <div className="ms-form-row">
            <label>식별 정보 (전화 뒷 4자리 or 배민 닉네임)</label>
            <input
              type="text"
              placeholder="예: 1234 또는 배민닉네임"
              value={newCustomer.identifier}
              onChange={(e) => setNewCustomer(p => ({ ...p, identifier: e.target.value }))}
            />
          </div>
          <div className="ms-form-row">
            <label>메모</label>
            <input
              type="text"
              placeholder="특이사항, 요청사항 등"
              value={newCustomer.notes}
              onChange={(e) => setNewCustomer(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <div className="ms-form-row">
            <label>선호사항</label>
            <input
              type="text"
              placeholder="양 많이, 매운맛 X 등"
              value={newCustomer.preferences}
              onChange={(e) => setNewCustomer(p => ({ ...p, preferences: e.target.value }))}
            />
          </div>
          <div className="ms-form-tags">
            {COMMON_TAGS.map(tag => (
              <button
                key={tag}
                className="ms-tag-btn"
                onClick={() => setNewCustomer(p => ({
                  ...p,
                  preferences: p.preferences ? `${p.preferences}, ${tag}` : tag
                }))}
              >
                <Tag size={12} /> {tag}
              </button>
            ))}
          </div>
          <button className="ms-save-btn small" onClick={addCustomer}>
            <Check size={16} /> 추가
          </button>
        </div>
      )}

      {/* Customer Cards */}
      <div className="ms-cust-list">
        {filtered.map(c => {
          const isDangor = (c.orderCount || 0) >= 5;
          const favMenu = mainMenus.find(m => m.id === c.favoriteMenu);
          const isEditing = editingId === c.id;

          return (
            <div key={c.id} className={`ms-cust-card ${isDangor ? 'dangor' : ''}`}>
              <div className="ms-cust-header">
                <div className="ms-cust-id">
                  <Users size={16} />
                  <span>{c.identifier}</span>
                  {isDangor && <span className="ms-dangor-badge"><Star size={12} /> 단골</span>}
                </div>
                <div className="ms-cust-actions">
                  {!isEditing && (
                    <button className="ms-icon-btn" onClick={() => startEdit(c)} title="수정">
                      <Edit3 size={14} />
                    </button>
                  )}
                  <button className="ms-icon-btn danger" onClick={() => deleteCustomer(c.id)} title="삭제">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="ms-cust-meta">
                <span>주문 {c.orderCount || 0}회</span>
                {c.lastOrder && <span>최근: {c.lastOrder.slice(5)}</span>}
                {favMenu && <span>단골메뉴: {favMenu.emoji} {favMenu.name}</span>}
              </div>

              {isEditing ? (
                <div className="ms-cust-edit">
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="메모"
                  />
                  <input
                    type="text"
                    value={editPrefs}
                    onChange={(e) => setEditPrefs(e.target.value)}
                    placeholder="선호사항"
                  />
                  <button className="ms-save-btn small" onClick={() => saveEdit(c.id)}>
                    <Check size={14} /> 저장
                  </button>
                </div>
              ) : (
                <>
                  {c.notes && <div className="ms-cust-notes">{c.notes}</div>}
                  {c.preferences && (
                    <div className="ms-cust-prefs">
                      {c.preferences.split(',').map((p, i) => (
                        <span key={i} className="ms-pref-tag">{p.trim()}</span>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="ms-cust-quick-tags">
                {COMMON_TAGS.map(tag => (
                  <button
                    key={tag}
                    className="ms-quick-tag"
                    onClick={() => addTag(c.id, tag)}
                    title={`"${tag}" 태그 추가`}
                  >
                    <Tag size={10} /> {tag}
                  </button>
                ))}
              </div>

              <div className="ms-cust-order-row">
                <select
                  className="ms-order-select"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      incrementOrder(c.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="" disabled>주문 기록 추가...</option>
                  {mainMenus.map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="ms-empty">
            {searchQuery ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다. "고객 추가" 버튼을 눌러 시작하세요.'}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== CSS ========== */
const menuSalesCSS = `
  .ms { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
  .ms .page-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
  .ms .page-header p { font-size: 14px; color: var(--text-light); margin: 0 0 24px; }

  .ms-tab-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .ms-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 18px; border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg-card); color: var(--text); font-size: 14px; font-weight: 500; cursor: pointer;
  }
  .ms-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

  .ms-section { margin-bottom: 24px; }
  .ms-section-title {
    font-size: 17px; font-weight: 600; margin: 0 0 14px; display: flex; align-items: center; gap: 8px;
    color: var(--text-dark);
  }

  /* Sales Tab */
  .ms-date-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
  }
  .ms-date-row input[type="date"] {
    padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius);
    font-size: 15px; background: var(--bg-card); color: var(--text);
  }
  .ms-today-total {
    font-size: 15px; font-weight: 600; color: var(--primary);
    background: var(--bg-card); padding: 8px 16px; border-radius: var(--radius);
    border: 1px solid var(--border);
  }

  .ms-menu-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 12px; margin-bottom: 20px;
  }
  .ms-menu-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; text-align: center; box-shadow: var(--shadow-sm); transition: border-color 0.2s;
  }
  .ms-menu-card.has-qty { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 5%, var(--bg-card)); }
  .ms-menu-top { margin-bottom: 10px; }
  .ms-menu-emoji { font-size: 24px; display: block; margin-bottom: 4px; }
  .ms-menu-name { font-size: 13px; font-weight: 600; color: var(--text-dark); }
  .ms-qty-controls { display: flex; align-items: center; justify-content: center; gap: 12px; }
  .ms-qty-btn {
    width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--border);
    background: var(--bg-card); color: var(--text); cursor: pointer; display: flex;
    align-items: center; justify-content: center; font-size: 18px; transition: all 0.15s;
  }
  .ms-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .ms-qty-btn.plus { border-color: var(--primary); color: var(--primary); }
  .ms-qty-btn.plus:hover { background: var(--primary); color: #fff; }
  .ms-qty-btn.minus:hover { border-color: #ef4444; color: #ef4444; }
  .ms-qty-value { font-size: 22px; font-weight: 700; color: var(--text-dark); min-width: 36px; }

  .ms-save-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px;
    background: var(--primary); color: #fff; border: none; border-radius: var(--radius);
    font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 28px;
  }
  .ms-save-btn:hover { opacity: 0.9; }
  .ms-save-btn.small { padding: 8px 18px; font-size: 13px; margin-bottom: 0; }

  /* History Table */
  .ms-history { margin-bottom: 28px; }
  .ms-table-wrap { overflow-x: auto; }
  .ms-table {
    width: 100%; border-collapse: collapse; background: var(--bg-card);
    border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border);
    font-size: 13px;
  }
  .ms-table th {
    padding: 10px 8px; font-size: 12px; font-weight: 600; color: var(--text-light);
    background: var(--bg); text-align: center; border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .ms-table td {
    padding: 8px; text-align: center; color: var(--text-light);
    border-bottom: 1px solid var(--border-light);
  }
  .ms-table td.has-val { color: var(--text-dark); font-weight: 600; }
  .ms-table .ms-date-cell { text-align: left; font-weight: 500; color: var(--text); }
  .ms-table .ms-total-cell { font-weight: 700; color: var(--primary); }

  /* Rankings */
  .ms-rankings { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .ms-rank-card, .ms-unsold-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 18px; box-shadow: var(--shadow-sm);
  }
  .ms-rank-list { display: flex; flex-direction: column; gap: 10px; }
  .ms-rank-item {
    display: flex; align-items: center; gap: 10px; padding: 8px 10px;
    background: var(--bg); border-radius: var(--radius);
  }
  .ms-rank-badge {
    width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-size: 13px; font-weight: 700; color: #fff;
    background: var(--text-light);
  }
  .ms-rank-badge.rank-1 { background: #f59e0b; }
  .ms-rank-badge.rank-2 { background: #94a3b8; }
  .ms-rank-badge.rank-3 { background: #b45309; }
  .ms-rank-emoji { font-size: 20px; }
  .ms-rank-name { flex: 1; font-size: 14px; font-weight: 500; color: var(--text-dark); }
  .ms-rank-count { font-size: 14px; font-weight: 700; color: var(--primary); }

  .ms-unsold-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .ms-unsold-tag {
    padding: 6px 12px; background: #fef2f2; color: #dc2626; border-radius: var(--radius);
    font-size: 13px; border: 1px solid #fecaca;
  }

  /* Customers Tab */
  .ms-cust-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px;
  }
  .ms-cust-stat {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 16px; text-align: center; box-shadow: var(--shadow-sm);
  }
  .ms-cstat-label { font-size: 12px; color: var(--text-light); display: block; margin-bottom: 4px; }
  .ms-cstat-value { font-size: 22px; font-weight: 700; color: var(--text-dark); }
  .ms-cstat-value.accent { color: var(--primary); }

  .ms-cust-toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .ms-search-box {
    flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg-card);
  }
  .ms-search-box input {
    flex: 1; border: none; outline: none; font-size: 14px; background: transparent;
    color: var(--text);
  }
  .ms-add-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px;
    background: var(--primary); color: #fff; border: none; border-radius: var(--radius);
    font-size: 14px; font-weight: 500; cursor: pointer;
  }
  .ms-add-btn:hover { opacity: 0.9; }

  /* Add Form */
  .ms-add-form {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow-sm);
  }
  .ms-add-form h4 { margin: 0 0 14px; font-size: 16px; color: var(--text-dark); }
  .ms-form-row { margin-bottom: 12px; }
  .ms-form-row label { display: block; font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
  .ms-form-row input {
    width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius);
    font-size: 14px; background: var(--bg); color: var(--text); box-sizing: border-box;
  }
  .ms-form-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .ms-tag-btn {
    display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px;
    border: 1px solid var(--border); border-radius: 20px; background: var(--bg);
    color: var(--text); font-size: 12px; cursor: pointer;
  }
  .ms-tag-btn:hover { border-color: var(--primary); color: var(--primary); }

  /* Customer Cards */
  .ms-cust-list { display: flex; flex-direction: column; gap: 14px; }
  .ms-cust-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 16px; box-shadow: var(--shadow-sm); transition: border-color 0.2s;
  }
  .ms-cust-card.dangor { border-left: 4px solid #f59e0b; }
  .ms-cust-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .ms-cust-id { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: var(--text-dark); }
  .ms-dangor-badge {
    display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px;
    background: #fef3c7; color: #92400e; border-radius: 12px; font-size: 11px; font-weight: 600;
  }
  .ms-cust-actions { display: flex; gap: 6px; }
  .ms-icon-btn {
    width: 30px; height: 30px; border-radius: var(--radius); border: 1px solid var(--border);
    background: var(--bg); color: var(--text-light); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
  }
  .ms-icon-btn:hover { border-color: var(--primary); color: var(--primary); }
  .ms-icon-btn.danger:hover { border-color: #ef4444; color: #ef4444; }

  .ms-cust-meta {
    display: flex; gap: 14px; font-size: 12px; color: var(--text-light); margin-bottom: 8px; flex-wrap: wrap;
  }
  .ms-cust-notes {
    font-size: 13px; color: var(--text); background: var(--bg); padding: 8px 12px;
    border-radius: var(--radius); margin-bottom: 8px;
  }
  .ms-cust-prefs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .ms-pref-tag {
    padding: 4px 10px; background: color-mix(in srgb, var(--primary) 10%, var(--bg));
    color: var(--primary); border-radius: 12px; font-size: 12px; font-weight: 500;
  }
  .ms-cust-edit {
    display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;
  }
  .ms-cust-edit input {
    padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius);
    font-size: 13px; background: var(--bg); color: var(--text);
  }
  .ms-cust-quick-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
  .ms-quick-tag {
    display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px;
    border: 1px solid var(--border-light); border-radius: 12px; background: transparent;
    color: var(--text-light); font-size: 11px; cursor: pointer;
  }
  .ms-quick-tag:hover { border-color: var(--primary); color: var(--primary); }

  .ms-cust-order-row { margin-top: 4px; }
  .ms-order-select {
    width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius);
    font-size: 13px; background: var(--bg); color: var(--text); cursor: pointer;
  }

  .ms-empty {
    text-align: center; padding: 40px 20px; color: var(--text-light); font-size: 14px;
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  }

  @media (max-width: 600px) {
    .ms-menu-grid { grid-template-columns: repeat(2, 1fr); }
    .ms-rankings { grid-template-columns: 1fr; }
    .ms-cust-stats { grid-template-columns: 1fr; }
    .ms-cust-toolbar { flex-direction: column; }
  }
`;
