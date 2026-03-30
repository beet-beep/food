import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Edit3, Trash2, AlertTriangle, Filter, ArrowUp, ArrowDown, Minus, Package, Search } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('ko-KR');

const categoryMap = {
  meat: { label: '육류', color: '#ef4444', bg: '#fef2f2' },
  vegetable: { label: '채소', color: '#16a34a', bg: '#dcfce7' },
  grain: { label: '곡류', color: '#ea580c', bg: '#fff7ed' },
  sauce: { label: '소스', color: '#7c3aed', bg: '#ede9fe' },
  other: { label: '기타', color: '#6b7280', bg: '#f3f4f6' },
};

const sourceOptions = ['마트', '시장', '온라인', '도매'];

const defaultIngredients = [
  { id: 'ing_1', name: '소고기(불고기용)', unit: 'kg', currentPrice: 15000, lastUpdated: '2026-03-27', category: 'meat', alertThreshold: 18000 },
  { id: 'ing_2', name: '돼지 앞다리살', unit: 'kg', currentPrice: 8000, lastUpdated: '2026-03-27', category: 'meat', alertThreshold: 10000 },
  { id: 'ing_3', name: '차슈용 삼겹살', unit: 'kg', currentPrice: 12000, lastUpdated: '2026-03-27', category: 'meat', alertThreshold: 15000 },
  { id: 'ing_4', name: '쌀(20kg)', unit: '포', currentPrice: 40000, lastUpdated: '2026-03-27', category: 'grain', alertThreshold: 48000 },
  { id: 'ing_5', name: '양파', unit: 'kg', currentPrice: 1500, lastUpdated: '2026-03-27', category: 'vegetable', alertThreshold: 2500 },
  { id: 'ing_6', name: '대파', unit: 'kg', currentPrice: 3000, lastUpdated: '2026-03-27', category: 'vegetable', alertThreshold: 5000 },
  { id: 'ing_7', name: '당근', unit: 'kg', currentPrice: 2000, lastUpdated: '2026-03-27', category: 'vegetable', alertThreshold: 3500 },
  { id: 'ing_8', name: '고추장', unit: 'kg', currentPrice: 8000, lastUpdated: '2026-03-27', category: 'sauce', alertThreshold: 10000 },
  { id: 'ing_9', name: '간장', unit: 'L', currentPrice: 4000, lastUpdated: '2026-03-27', category: 'sauce', alertThreshold: 5500 },
  { id: 'ing_10', name: '식용유', unit: 'L', currentPrice: 3000, lastUpdated: '2026-03-27', category: 'sauce', alertThreshold: 4500 },
];

const defaultPriceHistory = [
  { id: 'ph_1', ingredientId: 'ing_1', date: '2026-01-05', price: 13500, source: '시장', memo: '연초 가격' },
  { id: 'ph_2', ingredientId: 'ing_1', date: '2026-01-20', price: 14000, source: '마트', memo: '' },
  { id: 'ph_3', ingredientId: 'ing_1', date: '2026-02-10', price: 14200, source: '시장', memo: '설 이후 상승' },
  { id: 'ph_4', ingredientId: 'ing_1', date: '2026-02-25', price: 14800, source: '도매', memo: '' },
  { id: 'ph_5', ingredientId: 'ing_1', date: '2026-03-10', price: 15000, source: '시장', memo: '봄철 가격 유지' },
  { id: 'ph_6', ingredientId: 'ing_2', date: '2026-01-10', price: 7200, source: '도매', memo: '' },
  { id: 'ph_7', ingredientId: 'ing_2', date: '2026-02-15', price: 7500, source: '시장', memo: '' },
  { id: 'ph_8', ingredientId: 'ing_2', date: '2026-03-15', price: 8000, source: '마트', memo: '' },
  { id: 'ph_9', ingredientId: 'ing_5', date: '2026-01-08', price: 1200, source: '시장', memo: '겨울 양파 저가' },
  { id: 'ph_10', ingredientId: 'ing_5', date: '2026-02-20', price: 1400, source: '마트', memo: '' },
  { id: 'ph_11', ingredientId: 'ing_5', date: '2026-03-20', price: 1500, source: '시장', memo: '' },
  { id: 'ph_12', ingredientId: 'ing_6', date: '2026-01-15', price: 2200, source: '시장', memo: '' },
  { id: 'ph_13', ingredientId: 'ing_6', date: '2026-02-28', price: 2800, source: '마트', memo: '가격 상승' },
  { id: 'ph_14', ingredientId: 'ing_6', date: '2026-03-25', price: 3000, source: '시장', memo: '' },
];

// Simulated menu data linking ingredients to menu items for cost impact analysis
const menuIngredientUsage = [
  { menuName: '불고기 덮밥', price: 9500, ingredients: [{ ingredientId: 'ing_1', amountPerServing: 0.15, unit: 'kg' }, { ingredientId: 'ing_5', amountPerServing: 0.05, unit: 'kg' }, { ingredientId: 'ing_9', amountPerServing: 0.02, unit: 'L' }] },
  { menuName: '제육 덮밥', price: 8500, ingredients: [{ ingredientId: 'ing_2', amountPerServing: 0.15, unit: 'kg' }, { ingredientId: 'ing_5', amountPerServing: 0.05, unit: 'kg' }, { ingredientId: 'ing_8', amountPerServing: 0.02, unit: 'kg' }] },
  { menuName: '차슈 덮밥', price: 10000, ingredients: [{ ingredientId: 'ing_3', amountPerServing: 0.12, unit: 'kg' }, { ingredientId: 'ing_6', amountPerServing: 0.03, unit: 'kg' }, { ingredientId: 'ing_9', amountPerServing: 0.015, unit: 'L' }] },
  { menuName: '야채 비빔밥', price: 7500, ingredients: [{ ingredientId: 'ing_5', amountPerServing: 0.08, unit: 'kg' }, { ingredientId: 'ing_7', amountPerServing: 0.05, unit: 'kg' }, { ingredientId: 'ing_8', amountPerServing: 0.03, unit: 'kg' }] },
];

const alternatives = {
  meat: [
    { from: '소고기(불고기용)', to: '돼지 앞다리살', savings: '약 47% 절감' },
    { from: '차슈용 삼겹살', to: '돼지 앞다리살', savings: '약 33% 절감' },
    { from: '소고기(불고기용)', to: '닭다리살', savings: '약 60% 절감' },
  ],
  vegetable: [
    { from: '대파', to: '쪽파', savings: '계절에 따라 20~40% 절감' },
    { from: '당근', to: '호박', savings: '약 15~25% 절감' },
  ],
  sauce: [
    { from: '간장', to: '맛간장(대용량)', savings: '약 20% 절감' },
  ],
};

export default function IngredientPrice({ priceData, setPriceData }) {
  const [tab, setTab] = useState('status');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'kg', currentPrice: '', category: 'other', alertThreshold: '' });

  // Tab 2 state
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [newEntry, setNewEntry] = useState({ date: '2026-03-27', price: '', source: '마트', memo: '' });
  const [costImpactPercent, setCostImpactPercent] = useState(10);

  const ingredients = priceData?.ingredients?.length > 0 ? priceData.ingredients : defaultIngredients;
  const priceHistory = priceData?.priceHistory?.length > 0 ? priceData.priceHistory : defaultPriceHistory;

  const save = (updates) => setPriceData(prev => ({ ...prev, ...updates }));

  // --- Helpers ---
  const getPreviousPrice = (ingredientId) => {
    const history = priceHistory
      .filter(h => h.ingredientId === ingredientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return history.length > 0 ? history[0].price : null;
  };

  const getPriceDirection = (ingredient) => {
    const prev = getPreviousPrice(ingredient.id);
    if (prev === null) return 'same';
    if (ingredient.currentPrice > prev) return 'up';
    if (ingredient.currentPrice < prev) return 'down';
    return 'same';
  };

  // --- Tab 1 actions ---
  const startEdit = (ing) => {
    setEditingId(ing.id);
    setEditPrice(String(ing.currentPrice));
  };

  const confirmEdit = (id) => {
    const price = Number(editPrice);
    if (!price || price <= 0) return;
    const now = '2026-03-27';
    const oldIng = ingredients.find(i => i.id === id);

    // Add to price history
    const historyEntry = {
      id: 'ph_' + Date.now(),
      ingredientId: id,
      date: now,
      price: oldIng.currentPrice,
      source: '직접입력',
      memo: '이전 가격 기록',
    };

    const updatedIngredients = ingredients.map(i =>
      i.id === id ? { ...i, currentPrice: price, lastUpdated: now } : i
    );

    save({
      ingredients: updatedIngredients,
      priceHistory: [...priceHistory, historyEntry],
    });
    setEditingId(null);
    setEditPrice('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPrice('');
  };

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.currentPrice) return;
    const ing = {
      id: 'ing_' + Date.now(),
      name: newIngredient.name,
      unit: newIngredient.unit,
      currentPrice: Number(newIngredient.currentPrice),
      lastUpdated: '2026-03-27',
      category: newIngredient.category,
      alertThreshold: Number(newIngredient.alertThreshold) || Number(newIngredient.currentPrice) * 1.3,
    };
    save({ ingredients: [...ingredients, ing] });
    setNewIngredient({ name: '', unit: 'kg', currentPrice: '', category: 'other', alertThreshold: '' });
    setShowAddForm(false);
  };

  const removeIngredient = (id) => {
    save({
      ingredients: ingredients.filter(i => i.id !== id),
      priceHistory: priceHistory.filter(h => h.ingredientId !== id),
    });
  };

  // --- Tab 2 actions ---
  const selectedHistory = useMemo(() => {
    if (!selectedIngredientId) return [];
    return priceHistory
      .filter(h => h.ingredientId === selectedIngredientId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [selectedIngredientId, priceHistory]);

  const last10 = selectedHistory.slice(-10);
  const maxBarPrice = last10.length > 0 ? Math.max(...last10.map(h => h.price)) : 1;

  const selectedIng = ingredients.find(i => i.id === selectedIngredientId);

  const changeRate = useMemo(() => {
    if (last10.length < 2) return null;
    const first = last10[0].price;
    const current = selectedIng?.currentPrice || last10[last10.length - 1].price;
    return ((current - first) / first * 100).toFixed(1);
  }, [last10, selectedIng]);

  const addPriceEntry = () => {
    if (!newEntry.price || !selectedIngredientId) return;
    const entry = {
      id: 'ph_' + Date.now(),
      ingredientId: selectedIngredientId,
      date: newEntry.date,
      price: Number(newEntry.price),
      source: newEntry.source,
      memo: newEntry.memo,
    };
    save({ priceHistory: [...priceHistory, entry] });
    setNewEntry({ date: '2026-03-27', price: '', source: '마트', memo: '' });
  };

  // Cost impact analysis
  const costImpactAnalysis = useMemo(() => {
    if (!selectedIngredientId) return [];
    const ing = ingredients.find(i => i.id === selectedIngredientId);
    if (!ing) return [];

    return menuIngredientUsage
      .filter(menu => menu.ingredients.some(mi => mi.ingredientId === selectedIngredientId))
      .map(menu => {
        const usage = menu.ingredients.find(mi => mi.ingredientId === selectedIngredientId);
        const currentIngCost = usage.amountPerServing * ing.currentPrice;
        const newIngCost = usage.amountPerServing * ing.currentPrice * (1 + costImpactPercent / 100);
        const totalCurrentCost = menu.ingredients.reduce((sum, mi) => {
          const ingItem = ingredients.find(i => i.id === mi.ingredientId);
          return sum + (ingItem ? mi.amountPerServing * ingItem.currentPrice : 0);
        }, 0);
        const totalNewCost = totalCurrentCost - currentIngCost + newIngCost;
        const currentCostRate = (totalCurrentCost / menu.price * 100).toFixed(1);
        const newCostRate = (totalNewCost / menu.price * 100).toFixed(1);
        return {
          menuName: menu.menuName,
          price: menu.price,
          currentCost: Math.round(totalCurrentCost),
          newCost: Math.round(totalNewCost),
          currentCostRate,
          newCostRate,
          costRateChange: (newCostRate - currentCostRate).toFixed(1),
        };
      });
  }, [selectedIngredientId, ingredients, costImpactPercent]);

  // Auto insights
  const insights = useMemo(() => {
    const result = [];
    ingredients.forEach(ing => {
      const history = priceHistory
        .filter(h => h.ingredientId === ing.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (history.length >= 2) {
        const threeMonthsAgo = new Date('2026-03-27');
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const oldEntries = history.filter(h => new Date(h.date) <= threeMonthsAgo);
        const baseline = oldEntries.length > 0 ? oldEntries[oldEntries.length - 1].price : history[0].price;
        const pctChange = ((ing.currentPrice - baseline) / baseline * 100).toFixed(1);

        if (pctChange > 10) {
          const affectedMenus = menuIngredientUsage
            .filter(m => m.ingredients.some(mi => mi.ingredientId === ing.id))
            .map(m => m.menuName);
          if (affectedMenus.length > 0) {
            result.push({
              type: 'warning',
              text: `${ing.name} 가격이 3개월간 ${pctChange}% 상승 — ${affectedMenus.join(', ')} 원가율 주의`,
            });
          }
        }
      }

      if (ing.currentPrice >= ing.alertThreshold) {
        result.push({
          type: 'alert',
          text: `${ing.name} 현재가(${fmt(ing.currentPrice)}원)가 알림 기준(${fmt(ing.alertThreshold)}원)을 초과했습니다`,
        });
      }
    });
    return result;
  }, [ingredients, priceHistory]);

  // Alternatives for the selected ingredient
  const selectedAlternatives = useMemo(() => {
    if (!selectedIng) return [];
    const cat = selectedIng.category;
    return (alternatives[cat] || []).filter(a => a.from === selectedIng.name);
  }, [selectedIng]);

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    let list = ingredients;
    if (categoryFilter !== 'all') {
      list = list.filter(i => i.category === categoryFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(term));
    }
    return list;
  }, [ingredients, categoryFilter, searchTerm]);

  const alertCount = ingredients.filter(i => i.currentPrice >= i.alertThreshold).length;

  const tabs = [
    { id: 'status', label: '시세 현황', icon: DollarSign },
    { id: 'trend', label: '가격 추이', icon: TrendingUp },
  ];

  const categoryFilters = [
    { id: 'all', label: '전체' },
    { id: 'meat', label: '육류' },
    { id: 'vegetable', label: '채소' },
    { id: 'grain', label: '곡류' },
    { id: 'sauce', label: '소스' },
    { id: 'other', label: '기타' },
  ];

  return (
    <div className="ip">
      <style>{`
        .ip { max-width: 1200px; margin: 0 auto; }
        .ip h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .ip-subtitle { font-size: 14px; color: var(--text-light); margin-bottom: 24px; }

        .ip-tabs { display: flex; gap: 4px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px; margin-bottom: 24px; }
        .ip-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; border: none; background: transparent; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; color: var(--text-light); cursor: pointer; transition: all 0.15s; }
        .ip-tab:hover { background: var(--bg); color: var(--text); }
        .ip-tab.active { background: var(--primary); color: #fff; box-shadow: var(--shadow-sm); }

        .ip-toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 20px; }
        .ip-search { position: relative; flex: 1; min-width: 200px; }
        .ip-search input { width: 100%; padding: 10px 14px 10px 38px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; background: var(--bg-card); color: var(--text); }
        .ip-search input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .ip-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-light); }
        .ip-add-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .ip-add-btn:hover { background: var(--primary-dark); }

        .ip-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .ip-filter-btn { padding: 6px 16px; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-card); color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .ip-filter-btn:hover { border-color: var(--primary); color: var(--primary); }
        .ip-filter-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }

        .ip-alert-bar { display: flex; align-items: center; gap: 10px; padding: 14px 18px; background: var(--danger-light); border: 1px solid #fecaca; border-radius: var(--radius); margin-bottom: 20px; }
        .ip-alert-bar svg { color: var(--danger); flex-shrink: 0; }
        .ip-alert-bar span { font-size: 14px; font-weight: 600; color: var(--danger); }

        .ip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .ip-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow-sm); transition: box-shadow 0.15s; position: relative; }
        .ip-card:hover { box-shadow: var(--shadow-md); }
        .ip-card.alert { border-color: #fecaca; background: #fffbfb; }
        .ip-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .ip-card-name { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .ip-card-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
        .ip-card-actions { display: flex; gap: 4px; }
        .ip-card-action { background: transparent; border: none; padding: 6px; border-radius: var(--radius-sm); cursor: pointer; color: var(--text-light); transition: all 0.15s; }
        .ip-card-action:hover { background: var(--bg); color: var(--text-dark); }
        .ip-card-action.delete:hover { background: var(--danger-light); color: var(--danger); }

        .ip-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
        .ip-card-price-value { font-size: 24px; font-weight: 800; color: var(--text-dark); }
        .ip-card-price-unit { font-size: 13px; color: var(--text-light); }
        .ip-card-change { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 12px; }
        .ip-card-change.up { background: var(--danger-light); color: var(--danger); }
        .ip-card-change.down { background: var(--success-light); color: var(--success); }
        .ip-card-change.same { background: var(--border-light); color: var(--text-light); }

        .ip-card-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light); }
        .ip-card-date { font-size: 12px; color: var(--text-light); }
        .ip-card-alert-tag { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--danger); }

        .ip-edit-inline { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light); display: flex; gap: 8px; align-items: center; }
        .ip-edit-inline input { flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; background: var(--bg); color: var(--text); }
        .ip-edit-inline input:focus { outline: none; border-color: var(--primary); }
        .ip-edit-save { padding: 8px 14px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; }
        .ip-edit-save:hover { background: var(--primary-dark); }
        .ip-edit-cancel { padding: 8px 14px; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; cursor: pointer; }

        .ip-add-form { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
        .ip-add-form h3 { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 16px; }
        .ip-form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
        .ip-form-group { display: flex; flex-direction: column; gap: 4px; }
        .ip-form-group label { font-size: 12px; font-weight: 600; color: var(--text-light); }
        .ip-form-group input, .ip-form-group select { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; background: var(--bg); color: var(--text); }
        .ip-form-group input:focus, .ip-form-group select:focus { outline: none; border-color: var(--primary); }
        .ip-form-actions { display: flex; gap: 8px; }
        .ip-form-submit { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; }
        .ip-form-submit:hover { background: var(--primary-dark); }
        .ip-form-cancel { padding: 10px 20px; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; cursor: pointer; }

        /* Tab 2 styles */
        .ip-trend-header { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; margin-bottom: 24px; }
        .ip-trend-select { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 220px; }
        .ip-trend-select label { font-size: 12px; font-weight: 600; color: var(--text-light); }
        .ip-trend-select select { padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; background: var(--bg-card); color: var(--text); }
        .ip-trend-select select:focus { outline: none; border-color: var(--primary); }
        .ip-rate-badge { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: var(--radius); font-size: 15px; font-weight: 700; }
        .ip-rate-badge.up { background: var(--danger-light); color: var(--danger); }
        .ip-rate-badge.down { background: var(--success-light); color: var(--success); }
        .ip-rate-badge.neutral { background: var(--border-light); color: var(--text); }

        .ip-chart-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
        .ip-chart-section h3 { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 20px; }
        .ip-bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 200px; padding: 0 4px; }
        .ip-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
        .ip-bar { width: 100%; min-width: 24px; max-width: 60px; border-radius: 6px 6px 0 0; background: var(--primary); transition: height 0.3s; position: relative; }
        .ip-bar:hover { background: var(--primary-dark); }
        .ip-bar-label { font-size: 10px; color: var(--text-light); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px; }
        .ip-bar-value { font-size: 11px; font-weight: 600; color: var(--text-dark); }

        .ip-table-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
        .ip-table-section h3 { font-size: 16px; font-weight: 700; color: var(--text-dark); padding: 18px 20px 0; margin-bottom: 12px; }
        .ip-table { width: 100%; border-collapse: collapse; }
        .ip-table th { font-size: 12px; font-weight: 600; color: var(--text-light); padding: 10px 16px; border-bottom: 2px solid var(--border); text-align: left; background: var(--bg); }
        .ip-table td { padding: 12px 16px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border-light); }
        .ip-table tbody tr:hover { background: var(--bg); }
        .ip-table .source-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 12px; background: var(--border-light); color: var(--text); }

        .ip-add-entry { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
        .ip-add-entry h3 { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 16px; }
        .ip-entry-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 16px; }

        .ip-impact-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
        .ip-impact-section h3 { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 6px; }
        .ip-impact-desc { font-size: 13px; color: var(--text-light); margin-bottom: 16px; }
        .ip-impact-slider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .ip-impact-slider input[type="range"] { flex: 1; accent-color: var(--primary); }
        .ip-impact-slider span { font-size: 14px; font-weight: 700; color: var(--primary); min-width: 50px; text-align: center; }
        .ip-impact-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .ip-impact-card { background: var(--bg); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 14px; }
        .ip-impact-card h4 { font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; }
        .ip-impact-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text); margin-bottom: 4px; }
        .ip-impact-change { font-weight: 700; }
        .ip-impact-change.negative { color: var(--danger); }
        .ip-impact-change.positive { color: var(--success); }

        .ip-insights { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
        .ip-insights h3 { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .ip-insight-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 8px; }
        .ip-insight-item.warning { background: var(--warning-light); }
        .ip-insight-item.alert { background: var(--danger-light); }
        .ip-insight-item svg { flex-shrink: 0; margin-top: 1px; }
        .ip-insight-item span { font-size: 13px; font-weight: 500; color: var(--text-dark); line-height: 1.5; }

        .ip-alternatives { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
        .ip-alternatives h3 { font-size: 16px; font-weight: 700; color: var(--text-dark); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .ip-alt-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--success-light); border-radius: var(--radius-sm); margin-bottom: 8px; }
        .ip-alt-arrow { color: var(--success); font-weight: 700; font-size: 16px; }
        .ip-alt-from { font-size: 13px; color: var(--text); text-decoration: line-through; }
        .ip-alt-to { font-size: 14px; font-weight: 700; color: var(--success); }
        .ip-alt-savings { font-size: 12px; color: var(--text-light); margin-left: auto; }

        .ip-empty { text-align: center; padding: 40px 20px; color: var(--text-light); font-size: 14px; }
        .ip-empty svg { margin-bottom: 12px; color: var(--border); }

        @media (max-width: 768px) {
          .ip-grid { grid-template-columns: 1fr; }
          .ip-form-grid { grid-template-columns: 1fr 1fr; }
          .ip-entry-grid { grid-template-columns: 1fr 1fr; }
          .ip-impact-grid { grid-template-columns: 1fr; }
          .ip-toolbar { flex-direction: column; }
          .ip-search { min-width: 100%; }
          .ip-trend-header { flex-direction: column; align-items: stretch; }
          .ip-bar-chart { height: 160px; }
        }

        @media (max-width: 480px) {
          .ip-form-grid { grid-template-columns: 1fr; }
          .ip-entry-grid { grid-template-columns: 1fr; }
          .ip-filters { gap: 4px; }
          .ip-filter-btn { padding: 5px 12px; font-size: 12px; }
        }
      `}</style>

      <h1>식재료 시세 관리</h1>
      <p className="ip-subtitle">배달 식당 식재료 가격 추적 및 원가 영향 분석</p>

      {/* Tabs */}
      <div className="ip-tabs">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`ip-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* =============== Tab 1: 시세 현황 =============== */}
      {tab === 'status' && (
        <div>
          {/* Alert bar */}
          {alertCount > 0 && (
            <div className="ip-alert-bar">
              <AlertTriangle size={18} />
              <span>{alertCount}개 재료가 알림 기준가를 초과했습니다</span>
            </div>
          )}

          {/* Toolbar */}
          <div className="ip-toolbar">
            <div className="ip-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="재료명 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="ip-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={16} /> 재료 추가
            </button>
          </div>

          {/* Category filter */}
          <div className="ip-filters">
            <Filter size={14} style={{ color: 'var(--text-light)', marginTop: 4 }} />
            {categoryFilters.map(f => (
              <button
                key={f.id}
                className={`ip-filter-btn ${categoryFilter === f.id ? 'active' : ''}`}
                onClick={() => setCategoryFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="ip-add-form">
              <h3>새 재료 추가</h3>
              <div className="ip-form-grid">
                <div className="ip-form-group">
                  <label>재료명</label>
                  <input
                    type="text"
                    placeholder="예: 깨소금"
                    value={newIngredient.name}
                    onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  />
                </div>
                <div className="ip-form-group">
                  <label>단위</label>
                  <select value={newIngredient.unit} onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="개">개</option>
                    <option value="포">포</option>
                  </select>
                </div>
                <div className="ip-form-group">
                  <label>현재 가격 (원)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newIngredient.currentPrice}
                    onChange={e => setNewIngredient({ ...newIngredient, currentPrice: e.target.value })}
                  />
                </div>
                <div className="ip-form-group">
                  <label>카테고리</label>
                  <select value={newIngredient.category} onChange={e => setNewIngredient({ ...newIngredient, category: e.target.value })}>
                    <option value="meat">육류</option>
                    <option value="vegetable">채소</option>
                    <option value="grain">곡류</option>
                    <option value="sauce">소스</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div className="ip-form-group">
                  <label>알림 기준가 (원)</label>
                  <input
                    type="number"
                    placeholder="자동: 현재가 x 1.3"
                    value={newIngredient.alertThreshold}
                    onChange={e => setNewIngredient({ ...newIngredient, alertThreshold: e.target.value })}
                  />
                </div>
              </div>
              <div className="ip-form-actions">
                <button className="ip-form-submit" onClick={addIngredient}>추가</button>
                <button className="ip-form-cancel" onClick={() => setShowAddForm(false)}>취소</button>
              </div>
            </div>
          )}

          {/* Ingredient cards */}
          <div className="ip-grid">
            {filteredIngredients.map(ing => {
              const cat = categoryMap[ing.category] || categoryMap.other;
              const direction = getPriceDirection(ing);
              const isAlert = ing.currentPrice >= ing.alertThreshold;
              const isEditing = editingId === ing.id;

              return (
                <div key={ing.id} className={`ip-card ${isAlert ? 'alert' : ''}`}>
                  <div className="ip-card-header">
                    <div>
                      <div className="ip-card-name">{ing.name}</div>
                      <span className="ip-card-badge" style={{ background: cat.bg, color: cat.color }}>
                        {cat.label}
                      </span>
                    </div>
                    <div className="ip-card-actions">
                      <button className="ip-card-action" title="가격 업데이트" onClick={() => startEdit(ing)}>
                        <Edit3 size={15} />
                      </button>
                      <button className="ip-card-action delete" title="삭제" onClick={() => removeIngredient(ing.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="ip-card-price">
                    <span className="ip-card-price-value">{fmt(ing.currentPrice)}원</span>
                    <span className="ip-card-price-unit">/ {ing.unit}</span>
                  </div>

                  <span className={`ip-card-change ${direction}`}>
                    {direction === 'up' && <><ArrowUp size={12} /> 상승</>}
                    {direction === 'down' && <><ArrowDown size={12} /> 하락</>}
                    {direction === 'same' && <><Minus size={12} /> 유지</>}
                  </span>

                  {isEditing && (
                    <div className="ip-edit-inline">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        placeholder="새 가격"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') confirmEdit(ing.id); if (e.key === 'Escape') cancelEdit(); }}
                      />
                      <button className="ip-edit-save" onClick={() => confirmEdit(ing.id)}>저장</button>
                      <button className="ip-edit-cancel" onClick={cancelEdit}>취소</button>
                    </div>
                  )}

                  <div className="ip-card-meta">
                    <span className="ip-card-date">업데이트: {ing.lastUpdated}</span>
                    {isAlert && (
                      <span className="ip-card-alert-tag">
                        <AlertTriangle size={12} /> 기준 초과
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredIngredients.length === 0 && (
            <div className="ip-empty">
              <Package size={40} />
              <p>해당 조건의 재료가 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* =============== Tab 2: 가격 추이 =============== */}
      {tab === 'trend' && (
        <div>
          {/* Ingredient selector */}
          <div className="ip-trend-header">
            <div className="ip-trend-select">
              <label>재료 선택</label>
              <select
                value={selectedIngredientId}
                onChange={e => setSelectedIngredientId(e.target.value)}
              >
                <option value="">재료를 선택하세요</option>
                {ingredients.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({categoryMap[i.category]?.label || '기타'})
                  </option>
                ))}
              </select>
            </div>
            {changeRate !== null && selectedIng && (
              <div className={`ip-rate-badge ${Number(changeRate) > 0 ? 'up' : Number(changeRate) < 0 ? 'down' : 'neutral'}`}>
                {Number(changeRate) > 0 ? <TrendingUp size={18} /> : Number(changeRate) < 0 ? <TrendingDown size={18} /> : <Minus size={18} />}
                가격 변동률: {changeRate > 0 ? '+' : ''}{changeRate}%
              </div>
            )}
          </div>

          {!selectedIngredientId && (
            <div className="ip-empty">
              <Package size={40} />
              <p>재료를 선택하면 가격 추이를 확인할 수 있습니다</p>
            </div>
          )}

          {selectedIngredientId && selectedIng && (
            <>
              {/* Bar chart */}
              <div className="ip-chart-section">
                <h3>가격 추이 (최근 {last10.length}건)</h3>
                {last10.length > 0 ? (
                  <div className="ip-bar-chart">
                    {last10.map((h, idx) => {
                      const heightPct = maxBarPrice > 0 ? (h.price / maxBarPrice) * 100 : 0;
                      return (
                        <div key={h.id || idx} className="ip-bar-col">
                          <span className="ip-bar-value">{fmt(h.price)}</span>
                          <div
                            className="ip-bar"
                            style={{
                              height: `${Math.max(heightPct, 4)}%`,
                              background: idx === last10.length - 1 ? 'var(--primary-dark)' : 'var(--primary)',
                              opacity: 0.6 + (idx / last10.length) * 0.4,
                            }}
                            title={`${h.date}: ${fmt(h.price)}원`}
                          />
                          <span className="ip-bar-label">{h.date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="ip-empty"><p>기록된 가격 데이터가 없습니다</p></div>
                )}
              </div>

              {/* Price history table */}
              <div className="ip-table-section">
                <h3>가격 기록</h3>
                <table className="ip-table">
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>가격</th>
                      <th>구매처</th>
                      <th>메모</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedHistory.length > 0 ? (
                      [...selectedHistory].reverse().map(h => (
                        <tr key={h.id}>
                          <td>{h.date}</td>
                          <td style={{ fontWeight: 700 }}>{fmt(h.price)}원</td>
                          <td><span className="source-badge">{h.source}</span></td>
                          <td>{h.memo || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-light)' }}>기록 없음</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add new price entry */}
              <div className="ip-add-entry">
                <h3>새 가격 기록 추가</h3>
                <div className="ip-entry-grid">
                  <div className="ip-form-group">
                    <label>날짜</label>
                    <input
                      type="date"
                      value={newEntry.date}
                      onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                  <div className="ip-form-group">
                    <label>가격 (원)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newEntry.price}
                      onChange={e => setNewEntry({ ...newEntry, price: e.target.value })}
                    />
                  </div>
                  <div className="ip-form-group">
                    <label>구매처</label>
                    <select value={newEntry.source} onChange={e => setNewEntry({ ...newEntry, source: e.target.value })}>
                      {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="ip-form-group">
                    <label>메모</label>
                    <input
                      type="text"
                      placeholder="참고 사항"
                      value={newEntry.memo}
                      onChange={e => setNewEntry({ ...newEntry, memo: e.target.value })}
                    />
                  </div>
                </div>
                <button className="ip-form-submit" onClick={addPriceEntry}>기록 추가</button>
              </div>

              {/* Cost impact analysis */}
              <div className="ip-impact-section">
                <h3>원가 영향 분석</h3>
                <p className="ip-impact-desc">
                  {selectedIng.name} 가격이 변동했을 때 각 메뉴 원가율에 미치는 영향
                </p>
                <div className="ip-impact-slider">
                  <span style={{ fontSize: 13, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>가격 변동:</span>
                  <input
                    type="range"
                    min={-30}
                    max={50}
                    value={costImpactPercent}
                    onChange={e => setCostImpactPercent(Number(e.target.value))}
                  />
                  <span style={{ color: costImpactPercent > 0 ? 'var(--danger)' : costImpactPercent < 0 ? 'var(--success)' : 'var(--text)' }}>
                    {costImpactPercent > 0 ? '+' : ''}{costImpactPercent}%
                  </span>
                </div>

                {costImpactAnalysis.length > 0 ? (
                  <div className="ip-impact-grid">
                    {costImpactAnalysis.map((item, idx) => (
                      <div key={idx} className="ip-impact-card">
                        <h4>{item.menuName}</h4>
                        <div className="ip-impact-row">
                          <span>판매가</span>
                          <span>{fmt(item.price)}원</span>
                        </div>
                        <div className="ip-impact-row">
                          <span>현재 원가</span>
                          <span>{fmt(item.currentCost)}원 ({item.currentCostRate}%)</span>
                        </div>
                        <div className="ip-impact-row">
                          <span>변동 후 원가</span>
                          <span>{fmt(item.newCost)}원 ({item.newCostRate}%)</span>
                        </div>
                        <div className="ip-impact-row" style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid var(--border-light)' }}>
                          <span style={{ fontWeight: 700 }}>원가율 변동</span>
                          <span className={`ip-impact-change ${Number(item.costRateChange) > 0 ? 'negative' : 'positive'}`}>
                            {Number(item.costRateChange) > 0 ? '+' : ''}{item.costRateChange}%p
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ip-empty"><p>이 재료를 사용하는 메뉴가 없습니다</p></div>
                )}
              </div>

              {/* Auto insights */}
              {insights.length > 0 && (
                <div className="ip-insights">
                  <h3><AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> 자동 분석 인사이트</h3>
                  {insights.map((ins, idx) => (
                    <div key={idx} className={`ip-insight-item ${ins.type}`}>
                      {ins.type === 'warning'
                        ? <TrendingUp size={16} style={{ color: 'var(--warning)' }} />
                        : <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                      }
                      <span>{ins.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Alternative suggestions */}
              {selectedAlternatives.length > 0 && (
                <div className="ip-alternatives">
                  <h3><Package size={18} style={{ color: 'var(--success)' }} /> 대체 재료 제안</h3>
                  {selectedAlternatives.map((alt, idx) => (
                    <div key={idx} className="ip-alt-item">
                      <span className="ip-alt-from">{alt.from}</span>
                      <span className="ip-alt-arrow">→</span>
                      <span className="ip-alt-to">{alt.to}</span>
                      <span className="ip-alt-savings">{alt.savings}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
