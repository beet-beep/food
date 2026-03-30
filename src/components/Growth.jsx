import { useState, useMemo } from 'react';
import { Rocket, Plus, Trash2, Target, Check, ChevronDown, ChevronRight, Star, TrendingUp, Store, Award, Calendar, Zap, X, Edit3 } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

const TIME_SLOTS = [
  { id: 'lunch', label: '점심' },
  { id: 'dinner', label: '저녁' },
  { id: 'night', label: '야간' },
];

const DEFAULT_MILESTONES = [
  { id: 'm1', month: 1, title: '오픈 + 안정화', description: '매장 오픈 후 운영 안정화 기간. 주문 동선, 조리 타이밍, 배달 프로세스 점검.', status: 'pending', targetDate: '', achievedDate: '' },
  { id: 'm2', month: 3, title: '일 평균 30건 달성', description: '하루 평균 주문 30건 이상 안정적으로 유지. 리뷰 관리 본격화.', status: 'pending', targetDate: '', achievedDate: '' },
  { id: 'm3', month: 6, title: '샵인샵 1개 추가', description: '기존 주방 활용하여 새로운 브랜드 런칭. 식재료 공유로 원가 절감.', status: 'pending', targetDate: '', achievedDate: '' },
  { id: 'm4', month: 9, title: '일 평균 50건 달성', description: '멀티 브랜드 합산 일 50건 이상. 인력 추가 검토.', status: 'pending', targetDate: '', achievedDate: '' },
  { id: 'm5', month: 12, title: '월 매출 3,000만원', description: '월 매출 3천만원 달성. 수익 구조 안정화 및 재투자 계획 수립.', status: 'pending', targetDate: '', achievedDate: '' },
  { id: 'm6', month: 18, title: '2호점 or 프랜차이즈 검토', description: '직영 2호점 또는 가맹사업 진출 검토. 법적 요건 및 자본금 확인.', status: 'pending', targetDate: '', achievedDate: '' },
];

const DEFAULT_CHECKLIST = [
  { id: 'fc1', title: '직영점 1년 이상 운영 (가맹사업법 요건)', description: '가맹사업거래의 공정화에 관한 법률에 따라 가맹본부는 직영점을 1년 이상 운영한 실적이 필요합니다.', checked: false },
  { id: 'fc2', title: '레시피 100% 표준화 완료', description: '모든 메뉴의 조리법, 계량, 조리 시간을 문서화하고 누구나 동일한 맛을 낼 수 있도록 표준화합니다.', checked: false },
  { id: 'fc3', title: '월 매출 3,000만원 이상 안정적', description: '최소 3개월 연속으로 월 매출 3,000만원 이상을 달성하여 사업 모델의 수익성을 증명합니다.', checked: false },
  { id: 'fc4', title: '재주문율 30% 이상 유지', description: '고객 재주문율 30% 이상을 유지하여 메뉴와 서비스의 경쟁력을 입증합니다.', checked: false },
  { id: 'fc5', title: '리뷰 별점 4.5 이상', description: '배달 플랫폼 리뷰 별점 4.5 이상을 유지하여 브랜드 신뢰도를 확보합니다.', checked: false },
  { id: 'fc6', title: '메뉴 원가율 35% 이하 유지', description: '식재료 원가를 매출의 35% 이하로 관리하여 안정적인 마진을 확보합니다.', checked: false },
  { id: 'fc7', title: '주방 동선 매뉴얼 완성', description: '효율적인 주방 동선 및 조리 프로세스를 매뉴얼로 제작하여 신규 매장에 적용 가능하게 합니다.', checked: false },
  { id: 'fc8', title: '위생 관리 매뉴얼 완성', description: 'HACCP 기준에 준하는 위생 관리 매뉴얼을 작성하고 정기 점검 체계를 수립합니다.', checked: false },
  { id: 'fc9', title: '식재료 공급처 2곳 이상 확보', description: '안정적인 식재료 공급을 위해 주요 식재료별 2곳 이상의 공급처를 확보합니다.', checked: false },
  { id: 'fc10', title: '브랜딩 (로고, 패키지 디자인) 완성', description: 'CI/BI, 로고, 패키지 디자인, 매장 인테리어 가이드를 완성합니다.', checked: false },
];

const emptyBrand = () => ({
  id: Date.now(),
  name: '',
  concept: '',
  timeSlot: 'lunch',
  dailyOrders: 15,
  avgPrice: 12000,
  menus: [],
  extraPackaging: 200,
});

const emptyBrandMenu = () => ({
  id: Date.now(),
  name: '',
  price: 0,
  ingredients: [],
});

export default function Growth({ menus, finance, growthData, setGrowthData }) {
  const [tab, setTab] = useState('simulator');
  const [expandedBrands, setExpandedBrands] = useState({});
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ month: '', title: '', description: '' });
  const [newIngInputs, setNewIngInputs] = useState({});
  const [expandedChecklist, setExpandedChecklist] = useState({});

  // Initialize data if empty
  const brands = growthData?.brands || [];
  const timeline = growthData?.timeline?.length > 0 ? growthData.timeline : DEFAULT_MILESTONES;
  const checklist = growthData?.checklist?.length > 0 ? growthData.checklist : DEFAULT_CHECKLIST;

  const updateBrands = (newBrands) => {
    setGrowthData(prev => ({ ...prev, brands: newBrands }));
  };

  const updateTimeline = (newTimeline) => {
    setGrowthData(prev => ({ ...prev, timeline: newTimeline }));
  };

  const updateChecklist = (newChecklist) => {
    setGrowthData(prev => ({ ...prev, checklist: newChecklist }));
  };

  // Ensure timeline/checklist are saved on first render
  if (!growthData?.timeline?.length && timeline.length) {
    setTimeout(() => updateTimeline(timeline), 0);
  }
  if (!growthData?.checklist?.length && checklist.length) {
    setTimeout(() => updateChecklist(checklist), 0);
  }

  // Collect all existing ingredient names from main menus
  const existingIngredientNames = useMemo(() => {
    const names = new Set();
    (menus || []).forEach(m => {
      (m.ingredients || []).forEach(ing => {
        if (ing.name) names.add(ing.name.trim().toLowerCase());
      });
    });
    return names;
  }, [menus]);

  // ── Brand helpers ──
  const addBrand = () => {
    updateBrands([...brands, emptyBrand()]);
    setExpandedBrands(prev => ({ ...prev, [Date.now()]: true }));
  };

  const removeBrand = (id) => {
    updateBrands(brands.filter(b => b.id !== id));
  };

  const updateBrand = (id, field, value) => {
    updateBrands(brands.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const addBrandMenu = (brandId) => {
    updateBrands(brands.map(b => {
      if (b.id !== brandId) return b;
      return { ...b, menus: [...b.menus, emptyBrandMenu()] };
    }));
  };

  const removeBrandMenu = (brandId, menuId) => {
    updateBrands(brands.map(b => {
      if (b.id !== brandId) return b;
      return { ...b, menus: b.menus.filter(m => m.id !== menuId) };
    }));
  };

  const updateBrandMenu = (brandId, menuId, field, value) => {
    updateBrands(brands.map(b => {
      if (b.id !== brandId) return b;
      return {
        ...b,
        menus: b.menus.map(m => m.id === menuId ? { ...m, [field]: field === 'price' ? (Number(value) || 0) : value } : m),
      };
    }));
  };

  const addBrandMenuIngredient = (brandId, menuId) => {
    const key = `${brandId}-${menuId}`;
    const input = newIngInputs[key] || { name: '', cost: '' };
    if (!input.name.trim() || !input.cost) return;
    updateBrands(brands.map(b => {
      if (b.id !== brandId) return b;
      return {
        ...b,
        menus: b.menus.map(m => {
          if (m.id !== menuId) return m;
          return { ...m, ingredients: [...m.ingredients, { name: input.name.trim(), cost: Number(input.cost) || 0 }] };
        }),
      };
    }));
    setNewIngInputs(prev => ({ ...prev, [key]: { name: '', cost: '' } }));
  };

  const removeBrandMenuIngredient = (brandId, menuId, ingIdx) => {
    updateBrands(brands.map(b => {
      if (b.id !== brandId) return b;
      return {
        ...b,
        menus: b.menus.map(m => {
          if (m.id !== menuId) return m;
          return { ...m, ingredients: m.ingredients.filter((_, i) => i !== ingIdx) };
        }),
      };
    }));
  };

  // ── Brand financial calc ──
  const calcBrandFinancials = (brand) => {
    const monthlyRevenue = brand.dailyOrders * brand.avgPrice * 30;
    const allIngredients = brand.menus.flatMap(m => m.ingredients || []);
    const totalIngCostPerOrder = brand.menus.length > 0
      ? brand.menus.reduce((sum, m) => sum + (m.ingredients || []).reduce((s, i) => s + (i.cost || 0), 0), 0) / brand.menus.length
      : 0;
    const monthlyIngCost = totalIngCostPerOrder * brand.dailyOrders * 30;
    const baeminFlag = 88000;
    const monthlyPackaging = brand.extraPackaging * brand.dailyOrders * 30;
    const totalCost = monthlyIngCost + baeminFlag + monthlyPackaging;
    const netProfit = monthlyRevenue - totalCost;
    const additionalInvestment = baeminFlag + 500000; // flag + initial packaging/setup
    const roiMonths = netProfit > 0 ? Math.ceil(additionalInvestment / netProfit) : Infinity;

    // Ingredient sharing rate
    const uniqueIngs = new Set(allIngredients.map(i => i.name.trim().toLowerCase()));
    const sharedCount = [...uniqueIngs].filter(name => existingIngredientNames.has(name)).length;
    const shareRate = uniqueIngs.size > 0 ? Math.round((sharedCount / uniqueIngs.size) * 100) : 0;

    return { monthlyRevenue, monthlyIngCost, baeminFlag, monthlyPackaging, totalCost, netProfit, roiMonths, shareRate, sharedCount, totalIngredients: uniqueIngs.size, additionalInvestment };
  };

  // ── Total simulation ──
  const totalSim = useMemo(() => {
    let totalRev = 0;
    let totalCost = 0;
    let totalProfit = 0;
    brands.forEach(b => {
      const f = calcBrandFinancials(b);
      totalRev += f.monthlyRevenue;
      totalCost += f.totalCost;
      totalProfit += f.netProfit;
    });
    return { totalRev, totalCost, totalProfit };
  }, [brands, existingIngredientNames]);

  // Current single brand estimated monthly (from finance data)
  const currentMonthlyRevenue = useMemo(() => {
    const fixed = (finance?.monthlyFixed || []).reduce((s, f) => s + (f.amount || 0), 0);
    return fixed; // used just as reference for costs
  }, [finance]);

  // ── Milestone helpers ──
  const addMilestoneHandler = () => {
    if (!newMilestone.title.trim()) return;
    const ms = {
      id: `mc${Date.now()}`,
      month: Number(newMilestone.month) || 0,
      title: newMilestone.title,
      description: newMilestone.description,
      status: 'pending',
      targetDate: '',
      achievedDate: '',
    };
    updateTimeline([...timeline, ms].sort((a, b) => a.month - b.month));
    setNewMilestone({ month: '', title: '', description: '' });
    setShowAddMilestone(false);
  };

  const removeMilestone = (id) => {
    updateTimeline(timeline.filter(m => m.id !== id));
  };

  const updateMilestoneField = (id, field, value) => {
    updateTimeline(timeline.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // ── Checklist helpers ──
  const toggleChecklistItem = (id) => {
    updateChecklist(checklist.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const checklistProgress = useMemo(() => {
    const total = checklist.length;
    const done = checklist.filter(c => c.checked).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [checklist]);

  const tabs = [
    { id: 'simulator', label: '샵인샵 시뮬레이터', icon: Store },
    { id: 'timeline', label: '성장 타임라인', icon: Calendar },
    { id: 'checklist', label: '확장 체크리스트', icon: Award },
  ];

  return (
    <>
      <style>{`
        .growth-page { max-width: 1100px; }
        .page-header { margin-bottom: 20px; }
        .page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .page-header p { color: var(--text-light); font-size: 14px; }

        .gr-tabs {
          display: flex; gap: 4px; margin-bottom: 24px;
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 4px; overflow-x: auto;
        }
        .gr-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 500; color: var(--text);
          white-space: nowrap; transition: all 0.15s;
        }
        .gr-tab:hover { background: var(--bg); color: var(--text-dark); }
        .gr-tab.active { background: var(--primary); color: white; }

        /* ── Explanation Card ── */
        .gr-explain {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 1px solid #93c5fd; border-radius: var(--radius);
          padding: 20px 24px; margin-bottom: 24px;
          display: flex; align-items: flex-start; gap: 14px;
        }
        .gr-explain-icon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: #fff; }
        .gr-explain h3 { font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .gr-explain p { font-size: 13px; color: var(--text); line-height: 1.6; }

        /* ── Brands ── */
        .gr-add-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
          background: var(--primary); color: #fff; border: none; border-radius: var(--radius);
          font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px;
        }
        .gr-add-btn:hover { opacity: 0.9; }

        .gr-brand-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          margin-bottom: 16px; box-shadow: var(--shadow-sm); overflow: hidden;
        }
        .gr-brand-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; cursor: pointer; transition: background 0.15s;
        }
        .gr-brand-header:hover { background: var(--border-light); }
        .gr-brand-header-left { display: flex; align-items: center; gap: 10px; }
        .gr-brand-header-left h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); }
        .gr-brand-header-left .gr-slot-badge {
          display: inline-block; padding: 2px 10px; border-radius: 12px;
          font-size: 11px; font-weight: 600; background: #dbeafe; color: #2563eb;
        }
        .gr-brand-header-right { display: flex; align-items: center; gap: 8px; }
        .gr-brand-delete {
          padding: 6px 12px; border: 1px solid var(--danger); color: var(--danger);
          border-radius: var(--radius-sm); font-size: 12px; display: inline-flex;
          align-items: center; gap: 4px; cursor: pointer; background: none;
        }
        .gr-brand-delete:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }

        .gr-brand-body { padding: 0 20px 20px; }

        .gr-brand-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
        .gr-brand-grid label { font-size: 12px; color: var(--text-light); display: block; margin-bottom: 4px; font-weight: 500; }
        .gr-brand-grid input, .gr-brand-grid select, .gr-brand-grid textarea {
          width: 100%; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);
          font-size: 13px; background: var(--bg); color: var(--text); box-sizing: border-box;
        }
        .gr-brand-grid textarea { min-height: 60px; resize: vertical; }

        .gr-slider-wrap { display: flex; align-items: center; gap: 10px; }
        .gr-slider-wrap input[type="range"] {
          flex: 1; padding: 0; border: none; background: transparent; height: 6px;
          -webkit-appearance: none; appearance: none;
        }
        .gr-slider-wrap input[type="range"]::-webkit-slider-track { height: 6px; border-radius: 3px; background: var(--border); }
        .gr-slider-wrap input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--primary); cursor: pointer; margin-top: -6px; }
        .gr-slider-val { font-size: 14px; font-weight: 700; color: var(--primary); min-width: 30px; text-align: center; }

        /* ── Brand Menu Section ── */
        .gr-menu-section { margin-bottom: 16px; }
        .gr-menu-section-title { font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .gr-menu-item {
          background: var(--bg); border: 1px solid var(--border-light); border-radius: var(--radius-sm);
          padding: 14px; margin-bottom: 10px;
        }
        .gr-menu-item-top { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
        .gr-menu-item-top input {
          padding: 6px 10px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);
          font-size: 13px; background: var(--bg-card); color: var(--text);
        }
        .gr-menu-item-top input:first-child { flex: 1; min-width: 120px; }
        .gr-menu-item-top input:nth-child(2) { width: 100px; text-align: right; }
        .gr-menu-rm-btn {
          padding: 4px 8px; border: none; background: none; color: var(--danger);
          cursor: pointer; display: flex; align-items: center;
        }

        .gr-ing-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .gr-ing-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
        }
        .gr-ing-tag.shared { background: #dcfce7; color: #16a34a; }
        .gr-ing-tag.new-ing { background: #fff7ed; color: #ea580c; }
        .gr-ing-tag button { background: none; border: none; cursor: pointer; padding: 0; display: flex; color: inherit; font-size: 12px; }

        .gr-ing-add { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .gr-ing-add input {
          padding: 5px 8px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);
          font-size: 12px; background: var(--bg-card); color: var(--text);
        }
        .gr-ing-add input:first-child { flex: 1; min-width: 100px; }
        .gr-ing-add input:nth-child(2) { width: 80px; text-align: right; }
        .gr-ing-add-btn {
          padding: 5px 12px; background: var(--bg-card); border: 1px solid var(--border-light);
          border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; color: var(--text);
          display: inline-flex; align-items: center; gap: 4px;
        }
        .gr-ing-add-btn:hover { background: var(--border-light); }

        .gr-add-menu-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 6px 14px; border: 1px dashed var(--border); border-radius: var(--radius-sm);
          font-size: 12px; color: var(--text-light); cursor: pointer; background: none;
        }
        .gr-add-menu-btn:hover { border-color: var(--primary); color: var(--primary); }

        /* ── Share Rate ── */
        .gr-share-rate {
          background: var(--bg); border-radius: var(--radius-sm); padding: 14px;
          margin-bottom: 16px; display: flex; align-items: center; gap: 16px;
        }
        .gr-share-pct { font-size: 28px; font-weight: 800; min-width: 70px; text-align: center; }
        .gr-share-pct.high { color: #16a34a; }
        .gr-share-pct.mid { color: #f59e0b; }
        .gr-share-pct.low { color: #ef4444; }
        .gr-share-info { flex: 1; }
        .gr-share-info p { font-size: 13px; color: var(--text); margin-bottom: 2px; }
        .gr-share-info .gr-share-label { font-size: 12px; color: var(--text-light); }
        .gr-share-bar { height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden; margin-top: 6px; }
        .gr-share-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }

        /* ── Financial Sim ── */
        .gr-fin-sim {
          background: var(--bg); border-radius: var(--radius-sm); padding: 16px;
          margin-bottom: 16px;
        }
        .gr-fin-sim h4 { font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .gr-fin-rows { display: grid; gap: 6px; }
        .gr-fin-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }
        .gr-fin-row.total { border-top: 2px solid var(--border); padding-top: 10px; margin-top: 6px; font-weight: 700; }
        .gr-fin-row .label { color: var(--text); }
        .gr-fin-row .val { font-weight: 600; color: var(--text-dark); font-variant-numeric: tabular-nums; }
        .gr-fin-row .val.positive { color: #16a34a; }
        .gr-fin-row .val.negative { color: #ef4444; }

        .gr-roi-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 600; margin-top: 8px;
        }
        .gr-roi-badge.fast { background: #dcfce7; color: #16a34a; }
        .gr-roi-badge.moderate { background: #fef3c7; color: #d97706; }
        .gr-roi-badge.slow { background: #fef2f2; color: #ef4444; }

        /* ── Total Simulation ── */
        .gr-total-sim {
          background: var(--bg-card); border: 2px solid var(--primary); border-radius: var(--radius);
          padding: 24px; margin-top: 24px; box-shadow: var(--shadow-sm);
        }
        .gr-total-sim h3 { font-size: 18px; font-weight: 700; color: var(--text-dark); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .gr-total-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
        .gr-total-stat {
          text-align: center; padding: 16px; border-radius: var(--radius-sm);
        }
        .gr-total-stat.revenue { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
        .gr-total-stat.cost { background: linear-gradient(135deg, #fff7ed, #ffedd5); }
        .gr-total-stat.profit { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
        .gr-total-stat .ts-label { font-size: 12px; color: var(--text-light); margin-bottom: 4px; }
        .gr-total-stat .ts-val { font-size: 20px; font-weight: 800; color: var(--text-dark); }

        .gr-compare {
          display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center;
          margin-top: 16px;
        }
        .gr-compare-card {
          text-align: center; padding: 16px; border-radius: var(--radius-sm);
          background: var(--bg); border: 1px solid var(--border);
        }
        .gr-compare-card h4 { font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .gr-compare-card .cc-val { font-size: 22px; font-weight: 800; }
        .gr-compare-arrow { font-size: 24px; color: var(--primary); font-weight: 700; text-align: center; }

        /* ── No brands ── */
        .gr-empty {
          text-align: center; padding: 40px 20px; color: var(--text-light);
          background: var(--bg-card); border: 2px dashed var(--border);
          border-radius: var(--radius); margin-bottom: 20px;
        }
        .gr-empty p { font-size: 14px; margin-bottom: 4px; }

        /* ══════ Tab 2: Timeline ══════ */
        .gr-timeline-wrap { position: relative; padding-left: 40px; }
        .gr-timeline-line {
          position: absolute; left: 18px; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(to bottom, var(--primary), #93c5fd, var(--border));
          border-radius: 2px;
        }
        .gr-milestone {
          position: relative; margin-bottom: 24px;
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 18px 20px; box-shadow: var(--shadow-sm);
          transition: border-color 0.15s;
        }
        .gr-milestone.achieved { border-color: #86efac; background: linear-gradient(135deg, #ffffff, #f0fdf4); }
        .gr-milestone-dot {
          position: absolute; left: -31px; top: 20px; width: 16px; height: 16px;
          border-radius: 50%; border: 3px solid var(--primary); background: #fff;
          z-index: 1;
        }
        .gr-milestone.achieved .gr-milestone-dot { background: #16a34a; border-color: #16a34a; }
        .gr-milestone-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .gr-milestone-month {
          display: inline-block; padding: 2px 10px; border-radius: 12px;
          font-size: 11px; font-weight: 700; background: #dbeafe; color: #2563eb;
          margin-right: 8px;
        }
        .gr-milestone.achieved .gr-milestone-month { background: #dcfce7; color: #16a34a; }
        .gr-milestone h4 { font-size: 15px; font-weight: 600; color: var(--text-dark); display: inline; }
        .gr-milestone p { font-size: 13px; color: var(--text); line-height: 1.6; margin-top: 4px; }
        .gr-milestone-actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
        .gr-ms-btn {
          padding: 4px 10px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 500;
          cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
          border: 1px solid var(--border); background: var(--bg-card); color: var(--text);
        }
        .gr-ms-btn:hover { background: var(--bg); }
        .gr-ms-btn.achieve { border-color: #16a34a; color: #16a34a; }
        .gr-ms-btn.achieve:hover { background: #f0fdf4; }
        .gr-ms-btn.pending { border-color: #f59e0b; color: #f59e0b; }
        .gr-ms-btn.pending:hover { background: #fffbeb; }
        .gr-ms-btn.delete { border-color: var(--danger); color: var(--danger); }
        .gr-ms-btn.delete:hover { background: #fef2f2; }

        .gr-milestone-dates { display: flex; gap: 12px; margin-top: 10px; font-size: 12px; }
        .gr-milestone-dates label { color: var(--text-light); margin-right: 4px; }
        .gr-milestone-dates input {
          padding: 4px 8px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);
          font-size: 12px; background: var(--bg); color: var(--text);
        }

        .gr-ms-edit-row { display: grid; grid-template-columns: 60px 1fr; gap: 8px; margin-top: 8px; }
        .gr-ms-edit-row input, .gr-ms-edit-row textarea {
          padding: 6px 10px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);
          font-size: 13px; background: var(--bg); color: var(--text); width: 100%; box-sizing: border-box;
        }
        .gr-ms-edit-row textarea { min-height: 50px; resize: vertical; grid-column: 1 / -1; }
        .gr-ms-edit-actions { display: flex; gap: 6px; margin-top: 8px; }

        .gr-add-milestone-form {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow-sm);
        }
        .gr-add-milestone-form h4 { font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 12px; }
        .gr-amf-grid { display: grid; grid-template-columns: 80px 1fr; gap: 10px; margin-bottom: 12px; }
        .gr-amf-grid label { font-size: 12px; color: var(--text-light); display: flex; align-items: center; }
        .gr-amf-grid input, .gr-amf-grid textarea {
          padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);
          font-size: 13px; background: var(--bg); color: var(--text); width: 100%; box-sizing: border-box;
        }
        .gr-amf-grid textarea { min-height: 50px; resize: vertical; grid-column: 2; }

        /* ══════ Tab 3: Checklist ══════ */
        .gr-cl-progress {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow-sm); text-align: center;
        }
        .gr-cl-progress h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px; }
        .gr-cl-pct {
          font-size: 48px; font-weight: 800; margin: 12px 0 8px;
        }
        .gr-cl-pct.low { color: #ef4444; }
        .gr-cl-pct.mid { color: #f59e0b; }
        .gr-cl-pct.high { color: #16a34a; }
        .gr-cl-bar { height: 12px; background: var(--border-light); border-radius: 6px; overflow: hidden; max-width: 400px; margin: 0 auto 8px; }
        .gr-cl-bar-fill { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
        .gr-cl-bar-fill.low { background: linear-gradient(90deg, #ef4444, #f97316); }
        .gr-cl-bar-fill.mid { background: linear-gradient(90deg, #f59e0b, #eab308); }
        .gr-cl-bar-fill.high { background: linear-gradient(90deg, #22c55e, #16a34a); }
        .gr-cl-sub { font-size: 13px; color: var(--text-light); }

        .gr-cl-items { display: grid; gap: 10px; }
        .gr-cl-item {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 16px 20px; box-shadow: var(--shadow-sm); cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .gr-cl-item:hover { border-color: #93c5fd; }
        .gr-cl-item.done { border-color: #86efac; background: linear-gradient(135deg, #ffffff, #f0fdf4); }
        .gr-cl-item-top { display: flex; align-items: center; gap: 12px; }
        .gr-cl-check {
          width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: all 0.15s;
        }
        .gr-cl-item.done .gr-cl-check { background: #16a34a; border-color: #16a34a; color: #fff; }
        .gr-cl-item-title { font-size: 14px; font-weight: 600; color: var(--text-dark); flex: 1; }
        .gr-cl-item.done .gr-cl-item-title { text-decoration: line-through; color: var(--text-light); }
        .gr-cl-chevron { color: var(--text-light); transition: transform 0.15s; flex-shrink: 0; }
        .gr-cl-item-desc {
          margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-light);
          font-size: 13px; color: var(--text); line-height: 1.6;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .gr-brand-grid { grid-template-columns: 1fr; }
          .gr-total-stats { grid-template-columns: 1fr; }
          .gr-compare { grid-template-columns: 1fr; gap: 8px; }
          .gr-compare-arrow { transform: rotate(90deg); }
          .gr-milestone-dates { flex-direction: column; }
        }
        @media (max-width: 500px) {
          .gr-tabs { flex-direction: column; }
        }
      `}</style>

      <div className="growth-page">
        <div className="page-header">
          <h1><Rocket size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} />성장 전략</h1>
          <p>샵인샵, 성장 마일스톤, 프랜차이즈 준비도를 관리하세요</p>
        </div>

        {/* Tabs */}
        <div className="gr-tabs">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} className={`gr-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ════════════ Tab 1: 샵인샵 시뮬레이터 ════════════ */}
        {tab === 'simulator' && (
          <div>
            {/* Explanation */}
            <div className="gr-explain">
              <div className="gr-explain-icon"><Store size={20} /></div>
              <div>
                <h3>샵인샵이란?</h3>
                <p>같은 주방에서 다른 브랜드로 추가 매출! 기존 식재료를 공유하여 최소 투자로 매출을 2배로 늘릴 수 있습니다. 점심에는 덮밥, 저녁에는 야식 브랜드 등 시간대별로 다른 브랜드를 운영해 보세요.</p>
              </div>
            </div>

            <button className="gr-add-btn" onClick={addBrand}>
              <Plus size={16} /> 브랜드 추가
            </button>

            {brands.length === 0 && (
              <div className="gr-empty">
                <Store size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p>아직 추가된 브랜드가 없습니다</p>
                <p style={{ fontSize: 12 }}>위 버튼을 눌러 가상 브랜드를 추가해 보세요</p>
              </div>
            )}

            {brands.map(brand => {
              const isExpanded = expandedBrands[brand.id] !== false;
              const fin = calcBrandFinancials(brand);
              const slotLabel = TIME_SLOTS.find(s => s.id === brand.timeSlot)?.label || brand.timeSlot;

              return (
                <div className="gr-brand-card" key={brand.id}>
                  <div className="gr-brand-header" onClick={() => setExpandedBrands(prev => ({ ...prev, [brand.id]: !isExpanded }))}>
                    <div className="gr-brand-header-left">
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <h3>{brand.name || '새 브랜드'}</h3>
                      <span className="gr-slot-badge">{slotLabel}</span>
                      {fin.monthlyRevenue > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--text-light)' }}>
                          월 예상 +{fmt(fin.monthlyRevenue)}원
                        </span>
                      )}
                    </div>
                    <div className="gr-brand-header-right">
                      <button className="gr-brand-delete" onClick={(e) => { e.stopPropagation(); removeBrand(brand.id); }}>
                        <Trash2 size={12} /> 삭제
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="gr-brand-body">
                      {/* Brand basic info */}
                      <div className="gr-brand-grid">
                        <div>
                          <label>브랜드명</label>
                          <input value={brand.name} onChange={e => updateBrand(brand.id, 'name', e.target.value)} placeholder="예: 야식의 신" />
                        </div>
                        <div>
                          <label>타겟 시간대</label>
                          <select value={brand.timeSlot} onChange={e => updateBrand(brand.id, 'timeSlot', e.target.value)}>
                            {TIME_SLOTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label>평균 객단가 (원)</label>
                          <input type="number" value={brand.avgPrice || ''} onChange={e => updateBrand(brand.id, 'avgPrice', Number(e.target.value) || 0)} placeholder="12000" />
                        </div>
                        <div>
                          <label>추가 포장비 (원/건)</label>
                          <input type="number" value={brand.extraPackaging || ''} onChange={e => updateBrand(brand.id, 'extraPackaging', Number(e.target.value) || 0)} placeholder="200" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label>브랜드 컨셉</label>
                          <textarea value={brand.concept} onChange={e => updateBrand(brand.id, 'concept', e.target.value)} placeholder="예: 직장인 대상 든든한 야식 메뉴 (닭볶음탕, 감자탕 등)" />
                        </div>
                      </div>

                      {/* Daily orders slider */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                          예상 일일 주문 수
                        </label>
                        <div className="gr-slider-wrap">
                          <input
                            type="range" min="5" max="30" step="1"
                            value={brand.dailyOrders}
                            onChange={e => updateBrand(brand.id, 'dailyOrders', Number(e.target.value))}
                          />
                          <span className="gr-slider-val">{brand.dailyOrders}건</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-light)', marginTop: 2, padding: '0 2px' }}>
                          <span>5건</span><span>30건</span>
                        </div>
                      </div>

                      {/* Menu Section */}
                      <div className="gr-menu-section">
                        <div className="gr-menu-section-title">
                          <Zap size={14} /> 메뉴 구성
                        </div>

                        {brand.menus.map(menu => {
                          const ingKey = `${brand.id}-${menu.id}`;
                          const ingInput = newIngInputs[ingKey] || { name: '', cost: '' };
                          return (
                            <div className="gr-menu-item" key={menu.id}>
                              <div className="gr-menu-item-top">
                                <input
                                  value={menu.name}
                                  onChange={e => updateBrandMenu(brand.id, menu.id, 'name', e.target.value)}
                                  placeholder="메뉴명"
                                />
                                <input
                                  type="number"
                                  value={menu.price || ''}
                                  onChange={e => updateBrandMenu(brand.id, menu.id, 'price', e.target.value)}
                                  placeholder="가격"
                                />
                                <button className="gr-menu-rm-btn" onClick={() => removeBrandMenu(brand.id, menu.id)}>
                                  <X size={14} />
                                </button>
                              </div>

                              {/* Ingredients list */}
                              <div className="gr-ing-list">
                                {(menu.ingredients || []).map((ing, idx) => {
                                  const isShared = existingIngredientNames.has(ing.name.trim().toLowerCase());
                                  return (
                                    <span key={idx} className={`gr-ing-tag ${isShared ? 'shared' : 'new-ing'}`}>
                                      {ing.name} ({fmt(ing.cost)}원)
                                      <button onClick={() => removeBrandMenuIngredient(brand.id, menu.id, idx)}><X size={10} /></button>
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Add ingredient */}
                              <div className="gr-ing-add">
                                <input
                                  value={ingInput.name}
                                  onChange={e => setNewIngInputs(prev => ({ ...prev, [ingKey]: { ...ingInput, name: e.target.value } }))}
                                  placeholder="식재료명"
                                  onKeyDown={e => { if (e.key === 'Enter') addBrandMenuIngredient(brand.id, menu.id); }}
                                />
                                <input
                                  type="number"
                                  value={ingInput.cost}
                                  onChange={e => setNewIngInputs(prev => ({ ...prev, [ingKey]: { ...ingInput, cost: e.target.value } }))}
                                  placeholder="원가"
                                  onKeyDown={e => { if (e.key === 'Enter') addBrandMenuIngredient(brand.id, menu.id); }}
                                />
                                <button className="gr-ing-add-btn" onClick={() => addBrandMenuIngredient(brand.id, menu.id)}>
                                  <Plus size={12} /> 추가
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        <button className="gr-add-menu-btn" onClick={() => addBrandMenu(brand.id)}>
                          <Plus size={14} /> 메뉴 추가
                        </button>
                      </div>

                      {/* Share Rate */}
                      <div className="gr-share-rate">
                        <div className={`gr-share-pct ${fin.shareRate >= 60 ? 'high' : fin.shareRate >= 30 ? 'mid' : 'low'}`}>
                          {fin.shareRate}%
                        </div>
                        <div className="gr-share-info">
                          <p>식재료 공유율</p>
                          <p className="gr-share-label">
                            공유 {fin.sharedCount}개 / 전체 {fin.totalIngredients}개
                            {fin.shareRate >= 60 && ' — 매우 효율적!'}
                            {fin.shareRate >= 30 && fin.shareRate < 60 && ' — 괜찮은 수준'}
                            {fin.shareRate < 30 && fin.totalIngredients > 0 && ' — 공유 식재료를 늘려보세요'}
                          </p>
                          <div className="gr-share-bar">
                            <div
                              className="gr-share-bar-fill"
                              style={{
                                width: `${fin.shareRate}%`,
                                background: fin.shareRate >= 60 ? '#16a34a' : fin.shareRate >= 30 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financial Simulation */}
                      <div className="gr-fin-sim">
                        <h4><TrendingUp size={14} /> 재무 시뮬레이션 (월 기준)</h4>
                        <div className="gr-fin-rows">
                          <div className="gr-fin-row">
                            <span className="label">추가 매출 ({brand.dailyOrders}건 x {fmt(brand.avgPrice)}원 x 30일)</span>
                            <span className="val">{fmt(fin.monthlyRevenue)}원</span>
                          </div>
                          <div className="gr-fin-row" style={{ color: 'var(--text-light)', fontSize: 12, paddingLeft: 12 }}>
                            <span className="label">식재료 원가</span>
                            <span className="val" style={{ color: '#ef4444' }}>-{fmt(fin.monthlyIngCost)}원</span>
                          </div>
                          <div className="gr-fin-row" style={{ color: 'var(--text-light)', fontSize: 12, paddingLeft: 12 }}>
                            <span className="label">배민 울트라콜 (깃발)</span>
                            <span className="val" style={{ color: '#ef4444' }}>-{fmt(fin.baeminFlag)}원</span>
                          </div>
                          <div className="gr-fin-row" style={{ color: 'var(--text-light)', fontSize: 12, paddingLeft: 12 }}>
                            <span className="label">포장비 ({fmt(brand.extraPackaging)}원 x {brand.dailyOrders}건 x 30일)</span>
                            <span className="val" style={{ color: '#ef4444' }}>-{fmt(fin.monthlyPackaging)}원</span>
                          </div>
                          <div className="gr-fin-row total">
                            <span className="label">순 추가 이익</span>
                            <span className={`val ${fin.netProfit >= 0 ? 'positive' : 'negative'}`}>
                              {fin.netProfit >= 0 ? '+' : ''}{fmt(fin.netProfit)}원
                            </span>
                          </div>
                        </div>

                        <div className={`gr-roi-badge ${fin.roiMonths <= 1 ? 'fast' : fin.roiMonths <= 3 ? 'moderate' : 'slow'}`}>
                          <Target size={14} />
                          {fin.roiMonths === Infinity
                            ? 'ROI 산정 불가 (수익이 0 이하)'
                            : `투자 회수: 약 ${fin.roiMonths}개월 (추가 투자 ${fmt(fin.additionalInvestment)}원)`
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Total Simulation */}
            {brands.length > 0 && (
              <div className="gr-total-sim">
                <h3><Rocket size={18} /> 전체 시뮬레이션 결과</h3>

                <div className="gr-total-stats">
                  <div className="gr-total-stat revenue">
                    <div className="ts-label">추가 월 매출</div>
                    <div className="ts-val">{fmt(totalSim.totalRev)}원</div>
                  </div>
                  <div className="gr-total-stat cost">
                    <div className="ts-label">추가 월 비용</div>
                    <div className="ts-val">{fmt(totalSim.totalCost)}원</div>
                  </div>
                  <div className="gr-total-stat profit">
                    <div className="ts-label">추가 월 순이익</div>
                    <div className="ts-val" style={{ color: totalSim.totalProfit >= 0 ? '#16a34a' : '#ef4444' }}>
                      {totalSim.totalProfit >= 0 ? '+' : ''}{fmt(totalSim.totalProfit)}원
                    </div>
                  </div>
                </div>

                {/* Comparison: 1 brand vs multi */}
                <div className="gr-compare">
                  <div className="gr-compare-card">
                    <h4>현재 (1 브랜드)</h4>
                    <div className="cc-val" style={{ color: 'var(--text-dark)' }}>1개 브랜드</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>기존 매출</div>
                  </div>
                  <div className="gr-compare-arrow">
                    <TrendingUp size={28} />
                  </div>
                  <div className="gr-compare-card">
                    <h4>멀티 브랜드</h4>
                    <div className="cc-val" style={{ color: 'var(--primary)' }}>{brands.length + 1}개 브랜드</div>
                    <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                      +{fmt(totalSim.totalRev)}원/월 매출 추가
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════ Tab 2: 성장 타임라인 ════════════ */}
        {tab === 'timeline' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                  달성 {timeline.filter(m => m.status === 'achieved').length} / 전체 {timeline.length}
                </div>
              </div>
              <button className="gr-add-btn" style={{ marginBottom: 0 }} onClick={() => setShowAddMilestone(!showAddMilestone)}>
                <Plus size={16} /> 마일스톤 추가
              </button>
            </div>

            {showAddMilestone && (
              <div className="gr-add-milestone-form">
                <h4>새 마일스톤 추가</h4>
                <div className="gr-amf-grid">
                  <label>개월</label>
                  <input
                    type="number" min="0"
                    value={newMilestone.month}
                    onChange={e => setNewMilestone(prev => ({ ...prev, month: e.target.value }))}
                    placeholder="예: 6"
                  />
                  <label>제목</label>
                  <input
                    value={newMilestone.title}
                    onChange={e => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="마일스톤 제목"
                  />
                  <label>설명</label>
                  <textarea
                    value={newMilestone.description}
                    onChange={e => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="상세 설명"
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="gr-add-btn" style={{ marginBottom: 0 }} onClick={addMilestoneHandler}>저장</button>
                  <button
                    style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer', fontSize: 14 }}
                    onClick={() => { setShowAddMilestone(false); setNewMilestone({ month: '', title: '', description: '' }); }}
                  >취소</button>
                </div>
              </div>
            )}

            <div className="gr-timeline-wrap">
              <div className="gr-timeline-line" />

              {timeline.map(ms => {
                const isEditing = editingMilestone === ms.id;
                return (
                  <div className={`gr-milestone ${ms.status === 'achieved' ? 'achieved' : ''}`} key={ms.id}>
                    <div className="gr-milestone-dot" />

                    {!isEditing ? (
                      <>
                        <div className="gr-milestone-top">
                          <div>
                            <span className="gr-milestone-month">{ms.month}개월</span>
                            <h4>{ms.title}</h4>
                          </div>
                          <div className="gr-milestone-actions">
                            {ms.status === 'pending' ? (
                              <button className="gr-ms-btn achieve" onClick={() => updateMilestoneField(ms.id, 'status', 'achieved')}>
                                <Check size={12} /> 달성
                              </button>
                            ) : (
                              <button className="gr-ms-btn pending" onClick={() => updateMilestoneField(ms.id, 'status', 'pending')}>
                                <Star size={12} /> 미달성
                              </button>
                            )}
                            <button className="gr-ms-btn" onClick={() => setEditingMilestone(ms.id)}>
                              <Edit3 size={12} /> 수정
                            </button>
                            <button className="gr-ms-btn delete" onClick={() => removeMilestone(ms.id)}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p>{ms.description}</p>
                        <div className="gr-milestone-dates">
                          <span>
                            <label>목표일:</label>
                            <input
                              type="date"
                              value={ms.targetDate || ''}
                              onChange={e => updateMilestoneField(ms.id, 'targetDate', e.target.value)}
                            />
                          </span>
                          <span>
                            <label>달성일:</label>
                            <input
                              type="date"
                              value={ms.achievedDate || ''}
                              onChange={e => updateMilestoneField(ms.id, 'achievedDate', e.target.value)}
                            />
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="gr-ms-edit-row">
                          <input
                            type="number"
                            value={ms.month}
                            onChange={e => updateMilestoneField(ms.id, 'month', Number(e.target.value) || 0)}
                            placeholder="개월"
                            style={{ textAlign: 'center' }}
                          />
                          <input
                            value={ms.title}
                            onChange={e => updateMilestoneField(ms.id, 'title', e.target.value)}
                            placeholder="제목"
                          />
                          <textarea
                            value={ms.description}
                            onChange={e => updateMilestoneField(ms.id, 'description', e.target.value)}
                            placeholder="설명"
                          />
                        </div>
                        <div className="gr-ms-edit-actions">
                          <button className="gr-ms-btn achieve" onClick={() => setEditingMilestone(null)}>
                            <Check size={12} /> 완료
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════ Tab 3: 확장 체크리스트 ════════════ */}
        {tab === 'checklist' && (
          <div>
            {/* Progress */}
            <div className="gr-cl-progress">
              <h3><Award size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />프랜차이즈 준비도</h3>
              <div className={`gr-cl-pct ${checklistProgress.pct >= 70 ? 'high' : checklistProgress.pct >= 40 ? 'mid' : 'low'}`}>
                {checklistProgress.pct}%
              </div>
              <div className="gr-cl-bar">
                <div
                  className={`gr-cl-bar-fill ${checklistProgress.pct >= 70 ? 'high' : checklistProgress.pct >= 40 ? 'mid' : 'low'}`}
                  style={{ width: `${checklistProgress.pct}%` }}
                />
              </div>
              <div className="gr-cl-sub">
                {checklistProgress.done}개 완료 / {checklistProgress.total}개 항목
                {checklistProgress.pct === 100 && ' — 프랜차이즈 준비 완료!'}
                {checklistProgress.pct >= 70 && checklistProgress.pct < 100 && ' — 거의 다 왔습니다!'}
                {checklistProgress.pct >= 40 && checklistProgress.pct < 70 && ' — 꾸준히 진행 중'}
                {checklistProgress.pct < 40 && ' — 하나씩 채워나가세요'}
              </div>
            </div>

            {/* Items */}
            <div className="gr-cl-items">
              {checklist.map((item, idx) => {
                const isOpen = expandedChecklist[item.id] || false;
                return (
                  <div className={`gr-cl-item ${item.checked ? 'done' : ''}`} key={item.id}>
                    <div className="gr-cl-item-top" onClick={() => toggleChecklistItem(item.id)}>
                      <div className="gr-cl-check">
                        {item.checked && <Check size={14} />}
                      </div>
                      <span className="gr-cl-item-title">{item.title}</span>
                      <button
                        className="gr-cl-chevron"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedChecklist(prev => ({ ...prev, [item.id]: !isOpen }));
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>
                    {isOpen && (
                      <div className="gr-cl-item-desc">
                        {item.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
