import { useState } from 'react';
import { Plus, Trash2, Edit3, X, Check, Star, Clock, Bike, ChevronDown, ShoppingBag, Heart, Settings } from 'lucide-react';

function calcCost(ingredients) {
  return ingredients.reduce((s, i) => s + i.cost, 0);
}

const categories = [
  { id: 'all', label: '전체메뉴' },
  { id: 'main', label: '덮밥/볶음밥' },
  { id: 'side', label: '사이드' },
  { id: 'extra', label: '추가 메뉴' },
];

export default function MenuManager({ menus, setMenus }) {
  const [mode, setMode] = useState('customer');
  const [activeCategory, setActiveCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [showAddIngredient, setShowAddIngredient] = useState(null);
  const [newIng, setNewIng] = useState({ name: '', cost: '' });

  const filtered = activeCategory === 'all' ? menus : menus.filter(m => m.category === activeCategory);

  const updateIngredientCost = (menuId, ingIdx, newCost) => {
    setMenus(prev => prev.map(m => {
      if (m.id !== menuId) return m;
      const updated = { ...m, ingredients: [...m.ingredients] };
      updated.ingredients[ingIdx] = { ...updated.ingredients[ingIdx], cost: Number(newCost) };
      return updated;
    }));
  };

  const addIngredient = (menuId) => {
    if (!newIng.name || !newIng.cost) return;
    setMenus(prev => prev.map(m => {
      if (m.id !== menuId) return m;
      return { ...m, ingredients: [...m.ingredients, { name: newIng.name, cost: Number(newIng.cost) }] };
    }));
    setNewIng({ name: '', cost: '' });
    setShowAddIngredient(null);
  };

  const removeIngredient = (menuId, ingIdx) => {
    setMenus(prev => prev.map(m => {
      if (m.id !== menuId) return m;
      return { ...m, ingredients: m.ingredients.filter((_, i) => i !== ingIdx) };
    }));
  };

  const updateMenu = (menuId, field, value) => {
    setMenus(prev => prev.map(m => m.id === menuId ? { ...m, [field]: field === 'price' ? Number(value) : value } : m));
  };

  const mains = menus.filter(m => m.category === 'main');
  const avgCostRate = mains.reduce((sum, m) => {
    const cost = calcCost(m.ingredients);
    return sum + (m.price > 0 ? (cost / m.price) * 100 : 0);
  }, 0) / Math.max(mains.length, 1);

  return (
    <div className="bm">
      {/* 모드 토글 */}
      <div className="bm-mode-toggle">
        <button className={mode === 'customer' ? 'active' : ''} onClick={() => setMode('customer')}>
          <ShoppingBag size={16} /> 고객 화면
        </button>
        <button className={mode === 'manage' ? 'active' : ''} onClick={() => setMode('manage')}>
          <Settings size={16} /> 관리 모드
        </button>
      </div>

      {/* =============== 고객 화면 (배민 스타일) =============== */}
      {mode === 'customer' && (
        <div className="bm-app">
          {/* 가게 헤더 */}
          <div className="bm-store-header">
            <div className="bm-store-top">
              <div className="bm-store-info">
                <h1 className="bm-store-name">운서동 덮밥&볶음밥</h1>
                <div className="bm-store-meta">
                  <span className="bm-rating"><Star size={14} fill="#FFD700" stroke="#FFD700" /> 신규</span>
                  <span className="bm-dot"></span>
                  <span>리뷰 0</span>
                </div>
              </div>
              <button className="bm-heart"><Heart size={20} /></button>
            </div>
            <div className="bm-store-tags">
              <div className="bm-tag-row">
                <span className="bm-info-tag"><Clock size={13} /> 30~45분</span>
                <span className="bm-info-tag"><Bike size={13} /> 배달팁 0~2,000원</span>
                <span className="bm-info-tag"><ShoppingBag size={13} /> 최소주문 12,000원</span>
              </div>
            </div>
            <div className="bm-store-notice">
              <span>사장님알림</span>
              <p>15종 덮밥·볶음밥 전문! 매일 아침 손질한 신선한 재료, 소스는 별도 포장으로 밥이 눅눅해지지 않아요!</p>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div className="bm-cat-tabs">
            {categories.map(cat => (
              <button key={cat.id} className={`bm-cat-tab ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* 메뉴 리스트 */}
          <div className="bm-menu-list">
            {activeCategory === 'all' && (
              <>
                {(() => {
                  const mainMenus = menus.filter(m => m.category === 'main');
                  const tags = [...new Set(mainMenus.map(m => m.tag))];
                  const sideMenus = menus.filter(m => m.category === 'side');
                  const extraMenus = menus.filter(m => m.category === 'extra');
                  return (
                    <>
                      {tags.map(tag => {
                        const tagMenus = mainMenus.filter(m => m.tag === tag);
                        return (
                          <div key={tag}>
                            <h2 className="bm-section-title">{tag}</h2>
                            {tagMenus.map(menu => <BaeminMenuItem key={menu.id} menu={menu} />)}
                          </div>
                        );
                      })}
                      {sideMenus.length > 0 && <><h2 className="bm-section-title">사이드</h2>{sideMenus.map(menu => <BaeminMenuItem key={menu.id} menu={menu} />)}</>}
                      {extraMenus.length > 0 && <><h2 className="bm-section-title">추가 메뉴</h2>{extraMenus.map(menu => <BaeminMenuItem key={menu.id} menu={menu} />)}</>}
                    </>
                  );
                })()}
              </>
            )}
            {activeCategory !== 'all' && filtered.map(menu => <BaeminMenuItem key={menu.id} menu={menu} />)}
          </div>

          {/* 하단 주문 버튼 */}
          <div className="bm-bottom-bar">
            <div className="bm-cart-info">
              <span className="bm-cart-count">0</span>
              <span>배달 주문하기</span>
            </div>
            <span className="bm-cart-price">0원</span>
          </div>
        </div>
      )}

      {/* =============== 관리 모드 =============== */}
      {mode === 'manage' && (
        <div className="bm-manage">
          <div className="page-header">
            <h1>메뉴 원가 관리</h1>
            <p>메뉴별 원가를 관리하고 수익성을 분석하세요</p>
          </div>

          <div className="mg-summary">
            <div className="mg-stat">
              <span className="mg-stat-label">메인</span>
              <span className="mg-stat-val">{mains.length}종</span>
            </div>
            <div className="mg-stat">
              <span className="mg-stat-label">사이드</span>
              <span className="mg-stat-val">{menus.filter(m => m.category === 'side').length}종</span>
            </div>
            <div className="mg-stat">
              <span className="mg-stat-label">추가</span>
              <span className="mg-stat-val">{menus.filter(m => m.category === 'extra').length}종</span>
            </div>
            <div className="mg-stat">
              <span className="mg-stat-label">메인 평균 원가율</span>
              <span className={`mg-stat-val ${avgCostRate > 35 ? 'red' : avgCostRate > 32 ? 'orange' : 'green'}`}>{avgCostRate.toFixed(1)}%</span>
            </div>
          </div>

          {/* 전체 메뉴 엑셀형 테이블 */}
          <div className="mg-card">
            <h3>전체 메뉴 현황</h3>
            <div className="mg-table-wrap">
              <table className="mg-table">
                <thead>
                  <tr>
                    <th>메뉴명</th>
                    <th>분류</th>
                    <th className="r">판매가</th>
                    <th className="r">원가</th>
                    <th className="r">원가율</th>
                    <th className="r">목표</th>
                    <th className="r">마진</th>
                    <th>상태</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map(menu => {
                    const cost = calcCost(menu.ingredients);
                    const rate = menu.price > 0 ? (cost / menu.price * 100) : 0;
                    const status = rate > menu.targetCostRate + 3 ? 'danger' : rate > menu.targetCostRate ? 'warning' : 'good';
                    const isEditing = editingId === menu.id;
                    return (
                      <tr key={menu.id} className={isEditing ? 'editing' : ''}>
                        <td className="mg-name">
                          <span className="mg-emoji">{menu.emoji}</span>
                          {menu.name}
                          {menu.badge && <span className={`mg-badge ${menu.badge.toLowerCase()}`}>{menu.badge}</span>}
                        </td>
                        <td><span className="mg-cat">{menu.tag}</span></td>
                        <td className="r">
                          {isEditing ? (
                            <input type="number" className="mg-input" value={menu.price} onChange={e => updateMenu(menu.id, 'price', e.target.value)} />
                          ) : (
                            <span className="mg-price">{menu.price.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="r">{cost.toLocaleString()}</td>
                        <td className={`r mg-rate ${status}`}>{rate.toFixed(1)}%</td>
                        <td className="r">{menu.targetCostRate}%</td>
                        <td className="r mg-margin">{(menu.price - cost).toLocaleString()}</td>
                        <td>
                          <span className={`mg-status-dot ${status}`}>{status === 'good' ? 'OK' : status === 'warning' ? '주의' : '초과'}</span>
                        </td>
                        <td>
                          <button className="mg-edit-btn" onClick={() => setEditingId(isEditing ? null : menu.id)}>
                            {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 선택된 메뉴 원재료 편집 */}
          {editingId && (() => {
            const menu = menus.find(m => m.id === editingId);
            if (!menu) return null;
            const cost = calcCost(menu.ingredients);
            const rate = menu.price > 0 ? (cost / menu.price * 100) : 0;
            return (
              <div className="mg-detail-card">
                <div className="mg-detail-header">
                  <div>
                    <span className="mg-emoji lg">{menu.emoji}</span>
                    <h3>{menu.name} — 원재료 구성</h3>
                  </div>
                  <div className="mg-detail-stats">
                    <span>판매가 <strong>{menu.price.toLocaleString()}원</strong></span>
                    <span>원가 <strong>{cost.toLocaleString()}원</strong></span>
                    <span>원가율 <strong className={rate > menu.targetCostRate ? 'orange' : 'green'}>{rate.toFixed(1)}%</strong></span>
                    <span>마진 <strong>{(menu.price - cost).toLocaleString()}원</strong></span>
                  </div>
                </div>

                {/* 설명 편집 */}
                <div className="mg-desc-edit">
                  <label>메뉴 설명 (배민 노출)</label>
                  <input type="text" className="mg-desc-input" value={menu.desc} onChange={e => updateMenu(menu.id, 'desc', e.target.value)} />
                </div>

                <table className="mg-ing-table">
                  <thead><tr><th>재료명</th><th className="r">원가 (원)</th><th className="r">비중</th><th></th></tr></thead>
                  <tbody>
                    {menu.ingredients.map((ing, idx) => (
                      <tr key={idx}>
                        <td>{ing.name}</td>
                        <td>
                          <input type="number" className="mg-ing-input" value={ing.cost} onChange={e => updateIngredientCost(menu.id, idx, e.target.value)} />
                        </td>
                        <td className="r pct">{cost > 0 ? ((ing.cost / cost) * 100).toFixed(1) : 0}%</td>
                        <td>
                          <button className="mg-del-btn" onClick={() => removeIngredient(menu.id, idx)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td><strong>합계</strong></td>
                      <td className="r"><strong>{cost.toLocaleString()}원</strong></td>
                      <td className="r"><strong>100%</strong></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {showAddIngredient === menu.id ? (
                  <div className="mg-add-row">
                    <input placeholder="재료명" value={newIng.name} onChange={e => setNewIng({ ...newIng, name: e.target.value })} />
                    <input placeholder="원가" type="number" value={newIng.cost} onChange={e => setNewIng({ ...newIng, cost: e.target.value })} />
                    <button className="mg-btn primary" onClick={() => addIngredient(menu.id)}><Check size={14} /> 추가</button>
                    <button className="mg-btn" onClick={() => { setShowAddIngredient(null); setNewIng({ name: '', cost: '' }); }}><X size={14} /></button>
                  </div>
                ) : (
                  <button className="mg-add-btn" onClick={() => setShowAddIngredient(menu.id)}>
                    <Plus size={14} /> 재료 추가
                  </button>
                )}

                {/* 원가 바 */}
                <div className="mg-cost-visual">
                  <div className="mg-cost-bar">
                    {menu.ingredients.map((ing, i) => {
                      const colors = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#a855f7'];
                      const w = cost > 0 ? (ing.cost / cost * 100) : 0;
                      return <div key={i} style={{ width: `${w}%`, background: colors[i % colors.length], height: '100%', minWidth: w > 0 ? 2 : 0 }} title={`${ing.name} ${ing.cost}원`}></div>;
                    })}
                  </div>
                  <div className="mg-cost-legend">
                    {menu.ingredients.map((ing, i) => {
                      const colors = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#a855f7'];
                      return <span key={i}><span className="ld" style={{ background: colors[i % colors.length] }}></span>{ing.name}</span>;
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <style>{`
        .bm { max-width: 1100px; }
        /* Mode toggle */
        .bm-mode-toggle {
          display: flex; gap: 4px; margin-bottom: 20px;
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px;
        }
        .bm-mode-toggle button {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; color: var(--text); transition: all 0.15s;
        }
        .bm-mode-toggle button.active { background: var(--primary); color: white; }
        .bm-mode-toggle button:hover:not(.active) { background: var(--bg); }

        /* ======= BAEMIN STYLE ======= */
        .bm-app {
          background: #fff; border-radius: 16px; overflow: hidden;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08); max-width: 480px; margin: 0 auto; position: relative; padding-bottom: 70px;
        }

        .bm-store-header { padding: 24px 20px 16px; }
        .bm-store-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .bm-store-name { font-size: 22px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; font-family: 'Noto Sans KR', sans-serif; }
        .bm-store-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #666; }
        .bm-rating { display: flex; align-items: center; gap: 3px; font-weight: 600; color: #1a1a1a; }
        .bm-dot { width: 3px; height: 3px; border-radius: 50%; background: #ccc; }
        .bm-heart { padding: 8px; color: #ccc; }

        .bm-store-tags { margin-top: 14px; }
        .bm-tag-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .bm-info-tag {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; color: #555; background: #f5f5f5; padding: 6px 10px; border-radius: 6px;
        }

        .bm-store-notice {
          margin-top: 14px; padding: 14px; background: #f8f9fa; border-radius: 10px;
        }
        .bm-store-notice span { font-size: 11px; font-weight: 700; color: #2AC1BC; display: block; margin-bottom: 4px; }
        .bm-store-notice p { font-size: 13px; color: #555; line-height: 1.5; margin: 0; }

        .bm-cat-tabs {
          display: flex; border-bottom: 2px solid #f0f0f0; padding: 0 20px;
          position: sticky; top: 0; background: white; z-index: 10;
        }
        .bm-cat-tab {
          padding: 14px 16px; font-size: 14px; font-weight: 600; color: #999;
          border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; white-space: nowrap;
        }
        .bm-cat-tab.active { color: #1a1a1a; border-bottom-color: #1a1a1a; }
        .bm-cat-tab:hover { color: #555; }

        .bm-menu-list { padding: 8px 0; }
        .bm-section-title { font-size: 16px; font-weight: 700; color: #1a1a1a; padding: 16px 20px 8px; }

        /* Menu Item - Baemin style */
        .bm-menu-item {
          display: flex; gap: 14px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.1s;
        }
        .bm-menu-item:hover { background: #fafafa; }
        .bm-menu-item:last-child { border-bottom: none; }

        .bm-menu-thumb {
          width: 100px; height: 100px; border-radius: 10px; background: #f5f5f5;
          display: flex; align-items: center; justify-content: center; font-size: 42px; flex-shrink: 0;
          position: relative; overflow: hidden;
        }
        .bm-menu-body { flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
        .bm-menu-badges { display: flex; gap: 4px; margin-bottom: 4px; }
        .bm-badge {
          font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 3px;
          letter-spacing: 0.5px; line-height: 1.4;
        }
        .bm-badge.best { background: #2AC1BC; color: white; }
        .bm-badge.hot { background: #FF6B35; color: white; }
        .bm-badge.new { background: #5B5FEF; color: white; }
        .bm-badge.popular { background: #FFD700; color: #1a1a1a; }

        .bm-menu-name { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
        .bm-menu-desc { font-size: 12px; color: #999; line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .bm-menu-price-row { display: flex; align-items: baseline; gap: 4px; }
        .bm-menu-price { font-size: 16px; font-weight: 800; color: #1a1a1a; }

        /* Bottom bar */
        .bm-bottom-bar {
          position: absolute; bottom: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; background: #2AC1BC; color: white;
        }
        .bm-cart-info { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; }
        .bm-cart-count {
          width: 24px; height: 24px; border-radius: 50%; background: white; color: #2AC1BC;
          display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800;
        }
        .bm-cart-price { font-size: 16px; font-weight: 700; }

        /* ======= MANAGE MODE ======= */
        .bm-manage .page-header { margin-bottom: 20px; }
        .bm-manage .page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .bm-manage .page-header p { color: var(--text-light); font-size: 14px; }

        .mg-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
        .mg-stat { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-sm); }
        .mg-stat-label { font-size: 12px; color: var(--text-light); display: block; margin-bottom: 2px; }
        .mg-stat-val { font-size: 22px; font-weight: 700; color: var(--text-dark); }
        .mg-stat-val.green { color: #16a34a; }
        .mg-stat-val.orange { color: #f97316; }
        .mg-stat-val.red { color: #ef4444; }

        .mg-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
        .mg-card h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); margin-bottom: 14px; }
        .mg-table-wrap { overflow-x: auto; }
        .mg-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
        .mg-table th { font-size: 12px; font-weight: 600; color: var(--text-light); padding: 10px 8px; border-bottom: 2px solid var(--border); text-align: left; }
        .mg-table th.r { text-align: right; }
        .mg-table td { padding: 10px 8px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .mg-table td.r { text-align: right; font-variant-numeric: tabular-nums; }
        .mg-table tr.editing { background: #eff6ff; }
        .mg-table tr:hover { background: var(--border-light); }

        .mg-name { font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 6px; }
        .mg-emoji { font-size: 18px; }
        .mg-emoji.lg { font-size: 28px; }
        .mg-badge { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 3px; }
        .mg-badge.best { background: #2AC1BC; color: white; }
        .mg-badge.hot { background: #FF6B35; color: white; }
        .mg-badge.new { background: #5B5FEF; color: white; }
        .mg-cat { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: var(--border-light); color: var(--text); }
        .mg-price { font-weight: 700; color: var(--text-dark); }
        .mg-rate { font-weight: 700; }
        .mg-rate.good { color: #16a34a; }
        .mg-rate.warning { color: #f97316; }
        .mg-rate.danger { color: #ef4444; }
        .mg-margin { font-weight: 600; color: var(--text-dark); }
        .mg-status-dot { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
        .mg-status-dot.good { background: #dcfce7; color: #16a34a; }
        .mg-status-dot.warning { background: #fff7ed; color: #f97316; }
        .mg-status-dot.danger { background: #fef2f2; color: #ef4444; }
        .mg-input { width: 80px; padding: 4px 8px; border: 2px solid var(--primary); border-radius: 4px; font-size: 13px; text-align: right; font-weight: 600; }
        .mg-edit-btn { padding: 6px; border-radius: 6px; color: var(--text-light); }
        .mg-edit-btn:hover { background: var(--bg); color: var(--text-dark); }

        /* Detail card */
        .mg-detail-card { background: var(--bg-card); border: 2px solid var(--primary); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; box-shadow: var(--shadow-md); }
        .mg-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .mg-detail-header h3 { font-size: 18px; font-weight: 600; color: var(--text-dark); display: inline; }
        .mg-detail-header > div:first-child { display: flex; align-items: center; gap: 8px; }
        .mg-detail-stats { display: flex; gap: 16px; font-size: 13px; color: var(--text); }
        .mg-detail-stats strong { color: var(--text-dark); }
        .mg-detail-stats .orange { color: #f97316; }
        .mg-detail-stats .green { color: #16a34a; }

        .mg-desc-edit { margin-bottom: 16px; }
        .mg-desc-edit label { font-size: 12px; font-weight: 600; color: var(--text-light); display: block; margin-bottom: 6px; }
        .mg-desc-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
        .mg-desc-input:focus { outline: none; border-color: var(--primary); }

        .mg-ing-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .mg-ing-table th { font-size: 11px; font-weight: 600; color: var(--text-light); padding: 8px; border-bottom: 2px solid var(--border); text-align: left; }
        .mg-ing-table th.r { text-align: right; }
        .mg-ing-table td { padding: 8px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .mg-ing-table td.r { text-align: right; }
        .mg-ing-table td.pct { color: var(--text-light); font-size: 12px; }
        .mg-ing-table .total-row td { border-top: 2px solid var(--border); }
        .mg-ing-input { width: 80px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; text-align: right; }
        .mg-del-btn { padding: 4px; border-radius: 4px; color: var(--text-light); }
        .mg-del-btn:hover { color: #ef4444; background: #fef2f2; }

        .mg-add-row { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
        .mg-add-row input { flex: 1; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; }
        .mg-btn { display: flex; align-items: center; gap: 4px; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; border: 1px solid var(--border); background: var(--bg); }
        .mg-btn.primary { background: var(--primary); color: white; border-color: var(--primary); }
        .mg-add-btn { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--primary); padding: 8px 12px; border-radius: 6px; margin-top: 8px; }
        .mg-add-btn:hover { background: var(--primary-light); }

        .mg-cost-visual { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light); }
        .mg-cost-bar { display: flex; height: 16px; border-radius: 8px; overflow: hidden; background: var(--border-light); }
        .mg-cost-legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; font-size: 11px; color: var(--text); }
        .ld { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 3px; vertical-align: middle; }

        @media (max-width: 768px) {
          .mg-summary { grid-template-columns: repeat(2, 1fr); }
          .mg-detail-header { flex-direction: column; }
          .mg-detail-stats { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}

function BaeminMenuItem({ menu }) {
  return (
    <div className="bm-menu-item">
      <div className="bm-menu-thumb">{menu.emoji}</div>
      <div className="bm-menu-body">
        <div className="bm-menu-badges">
          {menu.badge && <span className={`bm-badge ${menu.badge.toLowerCase()}`}>{menu.badge}</span>}
          {menu.popular && <span className="bm-badge popular">인기</span>}
        </div>
        <div className="bm-menu-name">{menu.name}</div>
        <div className="bm-menu-desc">{menu.desc}</div>
        <div className="bm-menu-price-row">
          <span className="bm-menu-price">{menu.price.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}
