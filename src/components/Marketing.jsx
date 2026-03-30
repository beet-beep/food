import { useState, useMemo } from 'react';
import { Calendar, Plus, Trash2, Check, X, Tag, Gift, Percent, TrendingUp, Target, Image, Hash, MessageSquare, Star, DollarSign, ShoppingBag } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

const PLATFORMS = ['인스타그램', '네이버블로그', '맘카페', '기타'];
const CONTENT_TYPES = ['메뉴사진', '조리영상', '리뷰감사', '이벤트공지', '일상'];
const STATUSES = ['예정', '완료'];
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const HASHTAGS = ['#영종도맛집', '#운서역배달', '#덮밥추천', '#영종하늘도시', '#인천배달', '#홈밥대신', '#점심추천'];

const TEMPLATES = [
  { title: '오늘의 추천 메뉴', desc: '메뉴 사진 + 간단 설명', type: '메뉴사진' },
  { title: '정성 가득 조리 과정', desc: 'Behind the scenes', type: '조리영상' },
  { title: '고객 리뷰 감사', desc: '리뷰 캡처 + 감사 멘트', type: '리뷰감사' },
  { title: '이벤트 공지', desc: '할인/서비스 안내', type: '이벤트공지' },
];

const COUPON_TYPES = [
  { id: 'amount', label: '금액할인 (1,000~3,000원)' },
  { id: 'percent', label: '비율할인 (5~20%)' },
  { id: 'freeDelivery', label: '배달팁무료' },
  { id: 'freeSide', label: '사이드서비스' },
  { id: 'bogo', label: '1+1' },
];
const COUPON_TARGETS = ['첫주문', '재주문', '특정메뉴', '전체'];
const DISTRIBUTION_CHANNELS = ['배민쿠폰', '자체전단', '맘카페', 'SNS'];
const CAMPAIGN_STATUSES = ['예정', '진행중', '종료'];

const emptySns = () => ({
  id: Date.now(),
  date: new Date().toISOString().slice(0, 10),
  platform: '인스타그램',
  contentType: '메뉴사진',
  title: '',
  status: '예정',
});

const emptyCoupon = () => ({
  id: Date.now(),
  type: 'amount',
  discountValue: 2000,
  target: '전체',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  channel: '배민쿠폰',
  budget: 100000,
  expectedOrders: 30,
  expectedRedemptions: 20,
  avgOrderValue: 15000,
  status: '예정',
  name: '',
});

const emptySetMenu = () => ({
  id: Date.now(),
  mainMenuId: '',
  sideMenuId: '',
  extraMenuId: '',
  discountRate: 10,
  name: '',
});

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function getMonthStr(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 7);
}

const PLATFORM_COLORS = {
  '인스타그램': '#E1306C',
  '네이버블로그': '#03C75A',
  '맘카페': '#FF9800',
  '기타': '#9E9E9E',
};

const STATUS_COLORS = {
  '예정': '#3b82f6',
  '완료': '#22c55e',
  '진행중': '#f59e0b',
  '종료': '#94a3b8',
};

export default function Marketing({ menus, marketingData, setMarketingData }) {
  const [tab, setTab] = useState('sns');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddSns, setShowAddSns] = useState(false);
  const [newSns, setNewSns] = useState(emptySns());
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState(emptyCoupon());
  const [showAddSet, setShowAddSet] = useState(false);
  const [newSet, setNewSet] = useState(emptySetMenu());
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  const snsPlans = marketingData?.snsPlans || [];
  const coupons = marketingData?.coupons || [];
  const setMenus = marketingData?.setMenus || [];

  const updateSnsPlans = (plans) => setMarketingData(prev => ({ ...prev, snsPlans: plans }));
  const updateCoupons = (c) => setMarketingData(prev => ({ ...prev, coupons: c }));
  const updateSetMenus = (s) => setMarketingData(prev => ({ ...prev, setMenus: s }));

  // ── SNS Helpers ──
  const addSnsPlan = () => {
    if (!newSns.title.trim()) return;
    updateSnsPlans([...snsPlans, { ...newSns, id: Date.now() }]);
    setNewSns(emptySns());
    setShowAddSns(false);
  };

  const removeSnsPlan = (id) => updateSnsPlans(snsPlans.filter(p => p.id !== id));

  const toggleSnsStatus = (id) => {
    updateSnsPlans(snsPlans.map(p =>
      p.id === id ? { ...p, status: p.status === '예정' ? '완료' : '예정' } : p
    ));
  };

  const applyTemplate = (tpl) => {
    setNewSns(prev => ({ ...prev, title: tpl.title, contentType: tpl.type }));
    setShowAddSns(true);
  };

  const weekDates = getWeekDates(weekOffset);

  const monthlyStats = useMemo(() => {
    const currentMonth = getMonthStr(new Date().toISOString().slice(0, 10));
    const thisMonthPlans = snsPlans.filter(p => getMonthStr(p.date) === currentMonth);
    const byPlatform = {};
    PLATFORMS.forEach(pl => { byPlatform[pl] = 0; });
    thisMonthPlans.forEach(p => { byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1; });
    return { total: thisMonthPlans.length, byPlatform };
  }, [snsPlans]);

  // ── Coupon Helpers ──
  const addCouponCampaign = () => {
    if (!newCoupon.name.trim()) return;
    updateCoupons([...coupons, { ...newCoupon, id: Date.now() }]);
    setNewCoupon(emptyCoupon());
    setShowAddCoupon(false);
  };

  const removeCoupon = (id) => updateCoupons(coupons.filter(c => c.id !== id));

  const updateCouponField = (id, field, value) => {
    updateCoupons(coupons.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calcROI = (cpn) => {
    const discountPerCoupon = cpn.type === 'amount' ? Number(cpn.discountValue)
      : cpn.type === 'percent' ? (Number(cpn.avgOrderValue) * Number(cpn.discountValue) / 100)
      : cpn.type === 'freeDelivery' ? 3000
      : cpn.type === 'freeSide' ? 2000
      : cpn.type === 'bogo' ? Number(cpn.avgOrderValue)
      : 0;
    const campaignCost = discountPerCoupon * Number(cpn.expectedRedemptions);
    const revenueFromOrders = Number(cpn.expectedOrders) * Number(cpn.avgOrderValue);
    const ltvRevenue = revenueFromOrders * 4; // initial + 3 more orders
    const roi = campaignCost > 0 ? Math.round(((ltvRevenue - campaignCost) / campaignCost) * 100) : 0;
    return { discountPerCoupon, campaignCost, revenueFromOrders, ltvRevenue, roi };
  };

  // ── Set Menu Helpers ──
  const addSetMenu = () => {
    if (!newSet.mainMenuId) return;
    updateSetMenus([...setMenus, { ...newSet, id: Date.now() }]);
    setNewSet(emptySetMenu());
    setShowAddSet(false);
  };

  const removeSetMenu = (id) => updateSetMenus(setMenus.filter(s => s.id !== id));

  const updateSetField = (id, field, value) => {
    updateSetMenus(setMenus.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const getMenu = (id) => (menus || []).find(m => String(m.id) === String(id));

  const calcSet = (set) => {
    const main = getMenu(set.mainMenuId);
    const side = getMenu(set.sideMenuId);
    const extra = getMenu(set.extraMenuId);
    const items = [main, side, extra].filter(Boolean);
    const individualTotal = items.reduce((s, m) => s + (m.price || 0), 0);
    const discountRate = Number(set.discountRate) || 0;
    const setPrice = Math.round(individualTotal * (1 - discountRate / 100));
    const setCost = items.reduce((s, m) => s + (m.ingredients || []).reduce((a, i) => a + (i.cost || 0), 0), 0);
    const setMargin = setPrice - setCost;
    const setMarginRate = setPrice > 0 ? Math.round((setMargin / setPrice) * 100) : 0;
    const individualMargin = individualTotal - setCost;
    const individualMarginRate = individualTotal > 0 ? Math.round((individualMargin / individualTotal) * 100) : 0;
    return { items, individualTotal, setPrice, setCost, setMargin, setMarginRate, individualMargin, individualMarginRate, main, side, extra };
  };

  // Auto-find best set combination
  const bestSet = useMemo(() => {
    if (!menus || menus.length < 2) return null;
    let best = null;
    let bestMargin = -Infinity;
    for (let i = 0; i < menus.length; i++) {
      for (let j = 0; j < menus.length; j++) {
        if (i === j) continue;
        const main = menus[i];
        const side = menus[j];
        const items = [main, side];
        const total = items.reduce((s, m) => s + (m.price || 0), 0);
        const cost = items.reduce((s, m) => s + (m.ingredients || []).reduce((a, ig) => a + (ig.cost || 0), 0), 0);
        const setPrice = Math.round(total * 0.9); // 10% discount
        const margin = setPrice - cost;
        if (margin > bestMargin) {
          bestMargin = margin;
          best = { main, side, margin, setPrice, cost, total };
        }
      }
    }
    return best;
  }, [menus]);

  const copyHashtags = () => {
    navigator.clipboard.writeText(HASHTAGS.join(' ')).then(() => {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 1500);
    }).catch(() => {});
  };

  const tabs = [
    { id: 'sns', label: 'SNS 콘텐츠 플래너', icon: Image },
    { id: 'coupon', label: '쿠폰/이벤트 설계기', icon: Gift },
    { id: 'setmenu', label: '세트 메뉴 최적화', icon: ShoppingBag },
  ];

  return (
    <>
      <style>{`
        .mkt-page { max-width: 1100px; }
        .page-header { margin-bottom: 20px; }
        .page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .page-header p { color: var(--text-light); font-size: 14px; }

        .mkt-tabs {
          display: flex; gap: 4px; margin-bottom: 24px;
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 4px; overflow-x: auto;
        }
        .mkt-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 500; color: var(--text);
          white-space: nowrap; transition: all 0.15s; cursor: pointer;
          border: none; background: none;
        }
        .mkt-tab:hover { background: var(--bg); color: var(--text-dark); }
        .mkt-tab.active { background: var(--primary); color: white; }

        /* ── Common Card ── */
        .mkt-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; box-shadow: var(--shadow-sm); margin-bottom: 16px;
        }
        .mkt-card-title {
          font-size: 16px; font-weight: 600; color: var(--text-dark); margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .mkt-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

        /* ── Buttons ── */
        .mkt-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
          background: var(--primary); color: #fff; border: none; border-radius: var(--radius);
          font-size: 14px; font-weight: 600; cursor: pointer;
        }
        .mkt-btn:hover { opacity: 0.9; }
        .mkt-btn-sm {
          padding: 6px 14px; font-size: 12px; border-radius: var(--radius-sm);
          border: none; cursor: pointer; font-weight: 500;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .mkt-btn-outline {
          background: none; border: 1px solid var(--border); color: var(--text);
          padding: 8px 16px; border-radius: var(--radius); font-size: 13px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
        }
        .mkt-btn-outline:hover { background: var(--bg); }
        .mkt-btn-danger {
          background: none; border: 1px solid var(--danger); color: var(--danger);
          padding: 6px 14px; border-radius: var(--radius); font-size: 12px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
        }
        .mkt-btn-danger:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }

        /* ── Form Elements ── */
        .mkt-form-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px; margin-bottom: 14px;
        }
        .mkt-label { font-size: 12px; color: var(--text-light); display: block; margin-bottom: 4px; font-weight: 500; }
        .mkt-input, .mkt-select {
          width: 100%; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--radius);
          font-size: 13px; background: var(--bg); color: var(--text); box-sizing: border-box;
        }
        .mkt-select { cursor: pointer; }

        /* ── Summary Stat ── */
        .mkt-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .mkt-stat {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 16px; text-align: center; box-shadow: var(--shadow-sm);
        }
        .mkt-stat-label { font-size: 12px; color: var(--text-light); margin-bottom: 6px; }
        .mkt-stat-value { font-size: 22px; font-weight: 700; color: var(--text-dark); }
        .mkt-stat-sub { font-size: 11px; color: var(--text-light); margin-top: 2px; }

        /* ── Badge ── */
        .mkt-badge {
          display: inline-block; padding: 2px 10px; border-radius: 12px;
          font-size: 11px; font-weight: 600; color: #fff;
        }

        /* ── Weekly Calendar ── */
        .mkt-cal { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 20px; }
        .mkt-cal-day {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 10px 8px; min-height: 100px; position: relative;
        }
        .mkt-cal-day-header {
          font-size: 12px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .mkt-cal-date { font-size: 11px; color: var(--text-light); }
        .mkt-cal-dot {
          width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin: 1px;
        }
        .mkt-cal-item {
          font-size: 11px; padding: 3px 6px; border-radius: 4px; margin-bottom: 3px;
          color: #fff; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .mkt-cal-nav {
          display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
        }
        .mkt-cal-nav button {
          padding: 6px 14px; border: 1px solid var(--border); background: var(--bg-card);
          border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; color: var(--text);
        }
        .mkt-cal-nav span { font-size: 14px; font-weight: 600; color: var(--text-dark); }

        /* ── Hashtag Section ── */
        .mkt-hashtags {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
        }
        .mkt-hashtag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;
          background: color-mix(in srgb, var(--primary) 12%, transparent);
          color: var(--primary); cursor: default;
        }

        /* ── Template ── */
        .mkt-templates { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 16px; }
        .mkt-template {
          padding: 12px; border: 1px solid var(--border); border-radius: var(--radius);
          background: var(--bg-card); cursor: pointer; transition: all 0.15s;
        }
        .mkt-template:hover { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 5%, transparent); }
        .mkt-template-title { font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px; }
        .mkt-template-desc { font-size: 11px; color: var(--text-light); }

        /* ── SNS Plan List ── */
        .mkt-plan-list { display: flex; flex-direction: column; gap: 8px; }
        .mkt-plan-item {
          display: flex; align-items: center; gap: 12px; padding: 12px 16px;
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
        }
        .mkt-plan-info { flex: 1; min-width: 0; }
        .mkt-plan-title { font-size: 14px; font-weight: 500; color: var(--text-dark); }
        .mkt-plan-meta { font-size: 12px; color: var(--text-light); display: flex; gap: 8px; flex-wrap: wrap; margin-top: 2px; }
        .mkt-plan-actions { display: flex; gap: 6px; flex-shrink: 0; }

        /* ── Monthly Stats ── */
        .mkt-monthly-row {
          display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;
        }
        .mkt-monthly-item {
          display: flex; align-items: center; gap: 8px; font-size: 13px;
        }
        .mkt-monthly-dot { width: 10px; height: 10px; border-radius: 50%; }

        /* ── Coupon Cards ── */
        .mkt-coupon-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .mkt-coupon-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; box-shadow: var(--shadow-sm); position: relative;
        }
        .mkt-coupon-name { font-size: 16px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .mkt-coupon-meta { font-size: 13px; color: var(--text); line-height: 1.8; }
        .mkt-coupon-meta span { color: var(--text-light); }
        .mkt-coupon-roi {
          margin-top: 12px; padding: 12px; border-radius: var(--radius-sm);
          background: color-mix(in srgb, var(--primary) 6%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
        }
        .mkt-roi-row {
          display: flex; justify-content: space-between; font-size: 12px; color: var(--text);
          padding: 3px 0;
        }
        .mkt-roi-row.highlight { font-weight: 700; font-size: 14px; color: var(--primary); }
        .mkt-coupon-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }

        /* ── A/B Compare ── */
        .mkt-ab-section {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; margin-bottom: 24px;
        }
        .mkt-ab-title { font-size: 16px; font-weight: 600; color: var(--text-dark); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .mkt-ab-selects { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .mkt-ab-selects select { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 13px; background: var(--bg); color: var(--text); min-width: 180px; }
        .mkt-ab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .mkt-ab-col {
          padding: 16px; border-radius: var(--radius); border: 1px solid var(--border);
          background: var(--bg);
        }
        .mkt-ab-col-title { font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 10px; }

        /* ── Set Menu ── */
        .mkt-set-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .mkt-set-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; box-shadow: var(--shadow-sm);
        }
        .mkt-set-name { font-size: 16px; font-weight: 600; color: var(--text-dark); margin-bottom: 10px; }
        .mkt-set-items { margin-bottom: 12px; }
        .mkt-set-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 6px 0; font-size: 13px; color: var(--text);
          border-bottom: 1px dashed var(--border-light);
        }
        .mkt-set-item:last-child { border-bottom: none; }
        .mkt-set-calc {
          padding: 12px; border-radius: var(--radius-sm);
          background: color-mix(in srgb, var(--success) 6%, transparent);
          border: 1px solid color-mix(in srgb, var(--success) 20%, transparent);
          margin-bottom: 12px;
        }
        .mkt-set-row {
          display: flex; justify-content: space-between; font-size: 12px; color: var(--text);
          padding: 3px 0;
        }
        .mkt-set-row.highlight { font-weight: 700; font-size: 14px; color: var(--success); }
        .mkt-set-footer { display: flex; justify-content: flex-end; }

        /* ── Set Preview ── */
        .mkt-preview {
          border: 2px solid var(--border); border-radius: 12px; padding: 16px;
          background: #fff; max-width: 260px; margin: 8px 0;
        }
        .mkt-preview-label { font-size: 10px; color: var(--text-light); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .mkt-preview-name { font-size: 15px; font-weight: 700; color: #333; margin-bottom: 4px; }
        .mkt-preview-items { font-size: 12px; color: #666; margin-bottom: 8px; line-height: 1.6; }
        .mkt-preview-prices { display: flex; align-items: center; gap: 8px; }
        .mkt-preview-original { font-size: 13px; color: #aaa; text-decoration: line-through; }
        .mkt-preview-set { font-size: 18px; font-weight: 700; color: #e53935; }

        /* ── Best Set ── */
        .mkt-best {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 1px solid #f59e0b; border-radius: var(--radius);
          padding: 20px; margin-bottom: 24px;
        }
        .mkt-best-title { font-size: 16px; font-weight: 700; color: #92400e; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .mkt-best-text { font-size: 14px; color: #78350f; line-height: 1.8; }

        /* ── Slider ── */
        .mkt-slider-row { display: flex; align-items: center; gap: 12px; }
        .mkt-slider {
          flex: 1; -webkit-appearance: none; appearance: none; height: 6px;
          border-radius: 3px; background: var(--border);
          outline: none;
        }
        .mkt-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: var(--primary); cursor: pointer;
        }
        .mkt-slider-value { font-size: 14px; font-weight: 600; color: var(--primary); min-width: 40px; text-align: right; }

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .mkt-grid-2 { grid-template-columns: 1fr; }
          .mkt-coupon-cards { grid-template-columns: 1fr; }
          .mkt-set-cards { grid-template-columns: 1fr; }
          .mkt-ab-grid { grid-template-columns: 1fr; }
          .mkt-cal { grid-template-columns: repeat(3, 1fr); }
          .mkt-tabs { flex-direction: column; }
          .mkt-stats { grid-template-columns: repeat(2, 1fr); }
          .mkt-form-grid { grid-template-columns: 1fr 1fr; }
          .mkt-ab-selects { flex-direction: column; }
        }
      `}</style>

      <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <div className="page-header">
          <h1>📢 마케팅 관리 센터</h1>
          <p>SNS 콘텐츠 계획, 쿠폰/이벤트 설계, 세트 메뉴 최적화를 한 곳에서 관리하세요</p>
        </div>

        {/* Tabs */}
        <div className="mkt-tabs">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} className={`mkt-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* TAB 1: SNS 콘텐츠 플래너 */}
        {/* ════════════════════════════════════════════════ */}
        {tab === 'sns' && (
          <div>
            {/* Monthly summary stats */}
            <div className="mkt-stats">
              <div className="mkt-stat">
                <div className="mkt-stat-label">이번 달 콘텐츠</div>
                <div className="mkt-stat-value">{monthlyStats.total}</div>
                <div className="mkt-stat-sub">계획 건수</div>
              </div>
              {PLATFORMS.map(pl => (
                <div className="mkt-stat" key={pl}>
                  <div className="mkt-stat-label">{pl}</div>
                  <div className="mkt-stat-value" style={{ color: PLATFORM_COLORS[pl] }}>
                    {monthlyStats.byPlatform[pl] || 0}
                  </div>
                  <div className="mkt-stat-sub">건</div>
                </div>
              ))}
            </div>

            {/* Weekly calendar navigation */}
            <div className="mkt-cal-nav">
              <button onClick={() => setWeekOffset(w => w - 1)}>◀ 이전 주</button>
              <span>{weekDates[0]} ~ {weekDates[6]}</span>
              <button onClick={() => setWeekOffset(w => w + 1)}>다음 주 ▶</button>
              {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)}>오늘</button>}
            </div>

            {/* Weekly Calendar */}
            <div className="mkt-cal">
              {weekDates.map((date, idx) => {
                const dayPlans = snsPlans.filter(p => p.date === date);
                return (
                  <div className="mkt-cal-day" key={date}>
                    <div className="mkt-cal-day-header">
                      <span>{DAYS[idx]}</span>
                      <span className="mkt-cal-date">{date.slice(5)}</span>
                    </div>
                    {dayPlans.map(p => (
                      <div
                        key={p.id}
                        className="mkt-cal-item"
                        style={{ background: PLATFORM_COLORS[p.platform] || '#666', opacity: p.status === '완료' ? 0.6 : 1 }}
                        title={`${p.title} (${p.platform} / ${p.contentType}) - ${p.status}`}
                        onClick={() => toggleSnsStatus(p.id)}
                      >
                        {p.status === '완료' ? '✓ ' : ''}{p.title}
                      </div>
                    ))}
                    {dayPlans.length === 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 8, textAlign: 'center' }}>-</div>
                    )}
                    {/* Dots */}
                    {dayPlans.length > 0 && (
                      <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap' }}>
                        {dayPlans.map(p => (
                          <span key={p.id} className="mkt-cal-dot" style={{ background: PLATFORM_COLORS[p.platform] }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hashtag Section */}
            <div className="mkt-card">
              <div className="mkt-card-title"><Hash size={16} /> 추천 해시태그</div>
              <div className="mkt-hashtags">
                {HASHTAGS.map(h => (
                  <span className="mkt-hashtag" key={h}>{h}</span>
                ))}
              </div>
              <button className="mkt-btn-outline" onClick={copyHashtags}>
                {copiedHash ? <><Check size={14} /> 복사됨!</> : <><Tag size={14} /> 전체 복사</>}
              </button>
            </div>

            {/* Content Templates */}
            <div className="mkt-card">
              <div className="mkt-card-title"><MessageSquare size={16} /> 콘텐츠 템플릿</div>
              <div className="mkt-templates">
                {TEMPLATES.map(tpl => (
                  <div className="mkt-template" key={tpl.title} onClick={() => applyTemplate(tpl)}>
                    <div className="mkt-template-title">{tpl.title}</div>
                    <div className="mkt-template-desc">{tpl.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add content plan */}
            <div style={{ marginBottom: 16 }}>
              {!showAddSns ? (
                <button className="mkt-btn" onClick={() => setShowAddSns(true)}><Plus size={16} /> 콘텐츠 추가</button>
              ) : (
                <div className="mkt-card">
                  <div className="mkt-card-title"><Plus size={16} /> 새 콘텐츠 계획</div>
                  <div className="mkt-form-grid">
                    <div>
                      <label className="mkt-label">날짜</label>
                      <input type="date" className="mkt-input" value={newSns.date} onChange={e => setNewSns(p => ({ ...p, date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mkt-label">플랫폼</label>
                      <select className="mkt-select" value={newSns.platform} onChange={e => setNewSns(p => ({ ...p, platform: e.target.value }))}>
                        {PLATFORMS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mkt-label">콘텐츠 유형</label>
                      <select className="mkt-select" value={newSns.contentType} onChange={e => setNewSns(p => ({ ...p, contentType: e.target.value }))}>
                        {CONTENT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mkt-label">제목</label>
                      <input className="mkt-input" value={newSns.title} onChange={e => setNewSns(p => ({ ...p, title: e.target.value }))} placeholder="콘텐츠 제목..." />
                    </div>
                    <div>
                      <label className="mkt-label">상태</label>
                      <select className="mkt-select" value={newSns.status} onChange={e => setNewSns(p => ({ ...p, status: e.target.value }))}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="mkt-btn" onClick={addSnsPlan}><Check size={14} /> 추가</button>
                    <button className="mkt-btn-outline" onClick={() => { setShowAddSns(false); setNewSns(emptySns()); }}><X size={14} /> 취소</button>
                  </div>
                </div>
              )}
            </div>

            {/* Monthly view: posts per platform */}
            <div className="mkt-card">
              <div className="mkt-card-title"><Calendar size={16} /> 이번 달 플랫폼별 게시 현황</div>
              <div className="mkt-monthly-row">
                {PLATFORMS.map(pl => (
                  <div className="mkt-monthly-item" key={pl}>
                    <span className="mkt-monthly-dot" style={{ background: PLATFORM_COLORS[pl] }} />
                    <span style={{ fontWeight: 500 }}>{pl}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{monthlyStats.byPlatform[pl] || 0}건</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                총 {monthlyStats.total}건 계획 | 완료 {snsPlans.filter(p => getMonthStr(p.date) === getMonthStr(new Date().toISOString().slice(0, 10)) && p.status === '완료').length}건
              </div>
            </div>

            {/* Plan List */}
            {snsPlans.length > 0 && (
              <div className="mkt-card">
                <div className="mkt-card-title"><Image size={16} /> 전체 콘텐츠 목록 ({snsPlans.length})</div>
                <div className="mkt-plan-list">
                  {[...snsPlans].sort((a, b) => a.date.localeCompare(b.date)).map(p => (
                    <div className="mkt-plan-item" key={p.id}>
                      <div className="mkt-plan-info">
                        <div className="mkt-plan-title">
                          {p.status === '완료' && <Check size={14} style={{ color: 'var(--success)', marginRight: 4 }} />}
                          {p.title}
                        </div>
                        <div className="mkt-plan-meta">
                          <span>{p.date}</span>
                          <span className="mkt-badge" style={{ background: PLATFORM_COLORS[p.platform] }}>{p.platform}</span>
                          <span>{p.contentType}</span>
                          <span className="mkt-badge" style={{ background: STATUS_COLORS[p.status] }}>{p.status}</span>
                        </div>
                      </div>
                      <div className="mkt-plan-actions">
                        <button
                          className="mkt-btn-sm"
                          style={{ background: p.status === '예정' ? 'var(--success)' : 'var(--warning, #f59e0b)', color: '#fff' }}
                          onClick={() => toggleSnsStatus(p.id)}
                        >
                          {p.status === '예정' ? <><Check size={12} /> 완료</> : <><X size={12} /> 예정</>}
                        </button>
                        <button className="mkt-btn-danger" onClick={() => removeSnsPlan(p.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* TAB 2: 쿠폰/이벤트 설계기 */}
        {/* ════════════════════════════════════════════════ */}
        {tab === 'coupon' && (
          <div>
            {/* Summary */}
            <div className="mkt-stats">
              <div className="mkt-stat">
                <div className="mkt-stat-label">전체 캠페인</div>
                <div className="mkt-stat-value">{coupons.length}</div>
              </div>
              <div className="mkt-stat">
                <div className="mkt-stat-label">진행중</div>
                <div className="mkt-stat-value" style={{ color: '#f59e0b' }}>
                  {coupons.filter(c => c.status === '진행중').length}
                </div>
              </div>
              <div className="mkt-stat">
                <div className="mkt-stat-label"><DollarSign size={12} style={{ verticalAlign: -1 }} /> 총 예산</div>
                <div className="mkt-stat-value">{fmt(coupons.reduce((s, c) => s + Number(c.budget || 0), 0))}</div>
                <div className="mkt-stat-sub">원</div>
              </div>
              <div className="mkt-stat">
                <div className="mkt-stat-label"><Percent size={12} style={{ verticalAlign: -1 }} /> 평균 ROI</div>
                <div className="mkt-stat-value" style={{ color: 'var(--success)' }}>
                  {coupons.length > 0 ? Math.round(coupons.reduce((s, c) => s + calcROI(c).roi, 0) / coupons.length) : 0}%
                </div>
              </div>
            </div>

            {/* Add Coupon */}
            {!showAddCoupon ? (
              <button className="mkt-btn" style={{ marginBottom: 20 }} onClick={() => setShowAddCoupon(true)}>
                <Plus size={16} /> 캠페인 추가
              </button>
            ) : (
              <div className="mkt-card" style={{ marginBottom: 20 }}>
                <div className="mkt-card-title"><Gift size={16} /> 새 쿠폰/이벤트</div>
                <div className="mkt-form-grid">
                  <div>
                    <label className="mkt-label">캠페인명</label>
                    <input className="mkt-input" value={newCoupon.name} onChange={e => setNewCoupon(p => ({ ...p, name: e.target.value }))} placeholder="캠페인 이름..." />
                  </div>
                  <div>
                    <label className="mkt-label">유형</label>
                    <select className="mkt-select" value={newCoupon.type} onChange={e => setNewCoupon(p => ({ ...p, type: e.target.value }))}>
                      {COUPON_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mkt-label">할인 값 {newCoupon.type === 'percent' ? '(%)' : '(원)'}</label>
                    <input type="number" className="mkt-input" value={newCoupon.discountValue}
                      onChange={e => setNewCoupon(p => ({ ...p, discountValue: Number(e.target.value) }))}
                      min={newCoupon.type === 'percent' ? 5 : 1000}
                      max={newCoupon.type === 'percent' ? 20 : 3000}
                      step={newCoupon.type === 'percent' ? 1 : 500}
                    />
                  </div>
                  <div>
                    <label className="mkt-label">대상</label>
                    <select className="mkt-select" value={newCoupon.target} onChange={e => setNewCoupon(p => ({ ...p, target: e.target.value }))}>
                      {COUPON_TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mkt-label">시작일</label>
                    <input type="date" className="mkt-input" value={newCoupon.startDate} onChange={e => setNewCoupon(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mkt-label">종료일</label>
                    <input type="date" className="mkt-input" value={newCoupon.endDate} onChange={e => setNewCoupon(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mkt-label">배포 채널</label>
                    <select className="mkt-select" value={newCoupon.channel} onChange={e => setNewCoupon(p => ({ ...p, channel: e.target.value }))}>
                      {DISTRIBUTION_CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mkt-label">예산 (원)</label>
                    <input type="number" className="mkt-input" value={newCoupon.budget} onChange={e => setNewCoupon(p => ({ ...p, budget: Number(e.target.value) }))} step={10000} />
                  </div>
                  <div>
                    <label className="mkt-label">예상 신규 주문</label>
                    <input type="number" className="mkt-input" value={newCoupon.expectedOrders} onChange={e => setNewCoupon(p => ({ ...p, expectedOrders: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="mkt-label">예상 쿠폰 사용</label>
                    <input type="number" className="mkt-input" value={newCoupon.expectedRedemptions} onChange={e => setNewCoupon(p => ({ ...p, expectedRedemptions: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="mkt-label">평균 주문 금액 (원)</label>
                    <input type="number" className="mkt-input" value={newCoupon.avgOrderValue} onChange={e => setNewCoupon(p => ({ ...p, avgOrderValue: Number(e.target.value) }))} step={1000} />
                  </div>
                  <div>
                    <label className="mkt-label">상태</label>
                    <select className="mkt-select" value={newCoupon.status} onChange={e => setNewCoupon(p => ({ ...p, status: e.target.value }))}>
                      {CAMPAIGN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Live ROI preview */}
                {(() => {
                  const roi = calcROI(newCoupon);
                  return (
                    <div className="mkt-coupon-roi" style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-dark)' }}>ROI 미리보기</div>
                      <div className="mkt-roi-row"><span>쿠폰당 비용</span><span>{fmt(roi.discountPerCoupon)}원</span></div>
                      <div className="mkt-roi-row"><span>캠페인 총 비용</span><span>{fmt(roi.campaignCost)}원</span></div>
                      <div className="mkt-roi-row"><span>예상 매출 (첫 주문)</span><span>{fmt(roi.revenueFromOrders)}원</span></div>
                      <div className="mkt-roi-row"><span>예상 LTV (재주문 3회 포함)</span><span>{fmt(roi.ltvRevenue)}원</span></div>
                      <div className="mkt-roi-row highlight"><span>ROI</span><span>{roi.roi}%</span></div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="mkt-btn" onClick={addCouponCampaign}><Check size={14} /> 추가</button>
                  <button className="mkt-btn-outline" onClick={() => { setShowAddCoupon(false); setNewCoupon(emptyCoupon()); }}><X size={14} /> 취소</button>
                </div>
              </div>
            )}

            {/* Campaign List */}
            {coupons.length > 0 && (
              <div className="mkt-coupon-cards">
                {coupons.map(cpn => {
                  const roi = calcROI(cpn);
                  const typeLabel = COUPON_TYPES.find(t => t.id === cpn.type)?.label || cpn.type;
                  return (
                    <div className="mkt-coupon-card" key={cpn.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="mkt-coupon-name">{cpn.name || '(이름 없음)'}</div>
                        <span className="mkt-badge" style={{ background: STATUS_COLORS[cpn.status] || '#94a3b8' }}>{cpn.status}</span>
                      </div>
                      <div className="mkt-coupon-meta">
                        <div><span>유형: </span>{typeLabel}</div>
                        <div><span>대상: </span>{cpn.target}</div>
                        <div><span>채널: </span>{cpn.channel}</div>
                        <div><span>기간: </span>{cpn.startDate} ~ {cpn.endDate || '미정'}</div>
                        <div><span>예산: </span>{fmt(cpn.budget)}원</div>
                        <div><span>예상 주문: </span>{cpn.expectedOrders}건</div>
                      </div>
                      <div className="mkt-coupon-roi">
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-dark)' }}>ROI 분석</div>
                        <div className="mkt-roi-row"><span>쿠폰당 비용</span><span>{fmt(roi.discountPerCoupon)}원</span></div>
                        <div className="mkt-roi-row"><span>캠페인 총 비용</span><span>{fmt(roi.campaignCost)}원</span></div>
                        <div className="mkt-roi-row"><span>예상 매출</span><span>{fmt(roi.revenueFromOrders)}원</span></div>
                        <div className="mkt-roi-row"><span>예상 LTV</span><span>{fmt(roi.ltvRevenue)}원</span></div>
                        <div className="mkt-roi-row highlight"><span>ROI</span><span>{roi.roi}%</span></div>
                      </div>
                      <div className="mkt-coupon-footer">
                        <select
                          className="mkt-select"
                          style={{ width: 'auto', minWidth: 100 }}
                          value={cpn.status}
                          onChange={e => updateCouponField(cpn.id, 'status', e.target.value)}
                        >
                          {CAMPAIGN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="mkt-btn-danger" onClick={() => removeCoupon(cpn.id)}>
                          <Trash2 size={12} /> 삭제
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* A/B Test Compare */}
            {coupons.length >= 2 && (
              <div className="mkt-ab-section">
                <div className="mkt-ab-title"><Target size={16} /> A/B 테스트 비교</div>
                <div className="mkt-ab-selects">
                  <div>
                    <label className="mkt-label">캠페인 A</label>
                    <select value={compareA} onChange={e => setCompareA(e.target.value)}>
                      <option value="">선택...</option>
                      {coupons.map(c => <option key={c.id} value={c.id}>{c.name || `캠페인 #${c.id}`}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mkt-label">캠페인 B</label>
                    <select value={compareB} onChange={e => setCompareB(e.target.value)}>
                      <option value="">선택...</option>
                      {coupons.map(c => <option key={c.id} value={c.id}>{c.name || `캠페인 #${c.id}`}</option>)}
                    </select>
                  </div>
                </div>
                {compareA && compareB && compareA !== compareB && (() => {
                  const a = coupons.find(c => String(c.id) === String(compareA));
                  const b = coupons.find(c => String(c.id) === String(compareB));
                  if (!a || !b) return null;
                  const roiA = calcROI(a);
                  const roiB = calcROI(b);
                  const winner = roiA.roi >= roiB.roi ? 'A' : 'B';
                  return (
                    <>
                      <div className="mkt-ab-grid">
                        <div className="mkt-ab-col" style={{ borderColor: winner === 'A' ? 'var(--success)' : 'var(--border)' }}>
                          <div className="mkt-ab-col-title">
                            {winner === 'A' && <Star size={14} style={{ color: '#f59e0b' }} />} A: {a.name}
                          </div>
                          <div className="mkt-roi-row"><span>유형</span><span>{COUPON_TYPES.find(t => t.id === a.type)?.label}</span></div>
                          <div className="mkt-roi-row"><span>캠페인 비용</span><span>{fmt(roiA.campaignCost)}원</span></div>
                          <div className="mkt-roi-row"><span>예상 매출</span><span>{fmt(roiA.revenueFromOrders)}원</span></div>
                          <div className="mkt-roi-row"><span>LTV</span><span>{fmt(roiA.ltvRevenue)}원</span></div>
                          <div className="mkt-roi-row highlight"><span>ROI</span><span>{roiA.roi}%</span></div>
                        </div>
                        <div className="mkt-ab-col" style={{ borderColor: winner === 'B' ? 'var(--success)' : 'var(--border)' }}>
                          <div className="mkt-ab-col-title">
                            {winner === 'B' && <Star size={14} style={{ color: '#f59e0b' }} />} B: {b.name}
                          </div>
                          <div className="mkt-roi-row"><span>유형</span><span>{COUPON_TYPES.find(t => t.id === b.type)?.label}</span></div>
                          <div className="mkt-roi-row"><span>캠페인 비용</span><span>{fmt(roiB.campaignCost)}원</span></div>
                          <div className="mkt-roi-row"><span>예상 매출</span><span>{fmt(roiB.revenueFromOrders)}원</span></div>
                          <div className="mkt-roi-row"><span>LTV</span><span>{fmt(roiB.ltvRevenue)}원</span></div>
                          <div className="mkt-roi-row highlight"><span>ROI</span><span>{roiB.roi}%</span></div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, padding: 12, background: 'color-mix(in srgb, var(--success) 8%, transparent)', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600, color: 'var(--success)', textAlign: 'center' }}>
                        {winner === 'A' ? a.name : b.name} 캠페인이 ROI {Math.abs(roiA.roi - roiB.roi)}%p 더 높습니다
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* TAB 3: 세트 메뉴 최적화 */}
        {/* ════════════════════════════════════════════════ */}
        {tab === 'setmenu' && (
          <div>
            {/* Summary */}
            <div className="mkt-stats">
              <div className="mkt-stat">
                <div className="mkt-stat-label">등록 세트</div>
                <div className="mkt-stat-value">{setMenus.length}</div>
              </div>
              <div className="mkt-stat">
                <div className="mkt-stat-label">등록 메뉴</div>
                <div className="mkt-stat-value">{(menus || []).length}</div>
                <div className="mkt-stat-sub">조합 가능</div>
              </div>
              {setMenus.length > 0 && (() => {
                const avgMargin = Math.round(setMenus.reduce((s, sm) => s + calcSet(sm).setMarginRate, 0) / setMenus.length);
                return (
                  <div className="mkt-stat">
                    <div className="mkt-stat-label">평균 세트 마진율</div>
                    <div className="mkt-stat-value" style={{ color: 'var(--success)' }}>{avgMargin}%</div>
                  </div>
                );
              })()}
            </div>

            {/* Best Set Recommendation */}
            {bestSet && (
              <div className="mkt-best">
                <div className="mkt-best-title"><Star size={18} /> 최적 세트 추천</div>
                <div className="mkt-best-text">
                  <strong>{bestSet.main.emoji} {bestSet.main.name}</strong> + <strong>{bestSet.side.emoji} {bestSet.side.name}</strong>
                  <br />
                  개별 합계: {fmt(bestSet.total)}원 → 세트 가격 (10% 할인): <strong>{fmt(bestSet.setPrice)}원</strong>
                  <br />
                  원가: {fmt(bestSet.cost)}원 | <strong>마진: {fmt(bestSet.margin)}원</strong> (최고 절대 마진)
                </div>
              </div>
            )}

            {/* Add Set */}
            {!showAddSet ? (
              <button className="mkt-btn" style={{ marginBottom: 20 }} onClick={() => setShowAddSet(true)}>
                <Plus size={16} /> 세트 메뉴 만들기
              </button>
            ) : (
              <div className="mkt-card" style={{ marginBottom: 20 }}>
                <div className="mkt-card-title"><ShoppingBag size={16} /> 새 세트 구성</div>
                <div className="mkt-form-grid">
                  <div>
                    <label className="mkt-label">세트 이름</label>
                    <input className="mkt-input" value={newSet.name} onChange={e => setNewSet(p => ({ ...p, name: e.target.value }))} placeholder="세트 이름..." />
                  </div>
                  <div>
                    <label className="mkt-label">메인 메뉴 *</label>
                    <select className="mkt-select" value={newSet.mainMenuId} onChange={e => setNewSet(p => ({ ...p, mainMenuId: e.target.value }))}>
                      <option value="">선택...</option>
                      {(menus || []).map(m => <option key={m.id} value={m.id}>{m.emoji} {m.name} ({fmt(m.price)}원)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mkt-label">사이드</label>
                    <select className="mkt-select" value={newSet.sideMenuId} onChange={e => setNewSet(p => ({ ...p, sideMenuId: e.target.value }))}>
                      <option value="">선택...</option>
                      {(menus || []).map(m => <option key={m.id} value={m.id}>{m.emoji} {m.name} ({fmt(m.price)}원)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mkt-label">음료/추가 (선택)</label>
                    <select className="mkt-select" value={newSet.extraMenuId} onChange={e => setNewSet(p => ({ ...p, extraMenuId: e.target.value }))}>
                      <option value="">없음</option>
                      {(menus || []).map(m => <option key={m.id} value={m.id}>{m.emoji} {m.name} ({fmt(m.price)}원)</option>)}
                    </select>
                  </div>
                </div>

                {/* Discount Slider */}
                <div style={{ marginBottom: 14 }}>
                  <label className="mkt-label">할인율</label>
                  <div className="mkt-slider-row">
                    <span style={{ fontSize: 12, color: 'var(--text-light)' }}>5%</span>
                    <input
                      type="range" className="mkt-slider"
                      min={5} max={20} step={1}
                      value={newSet.discountRate}
                      onChange={e => setNewSet(p => ({ ...p, discountRate: Number(e.target.value) }))}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-light)' }}>20%</span>
                    <span className="mkt-slider-value">{newSet.discountRate}%</span>
                  </div>
                </div>

                {/* Live calculation preview */}
                {newSet.mainMenuId && (() => {
                  const calc = calcSet(newSet);
                  return (
                    <div className="mkt-set-calc" style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-dark)' }}>실시간 계산</div>
                      <div className="mkt-set-row"><span>개별 합계</span><span>{fmt(calc.individualTotal)}원</span></div>
                      <div className="mkt-set-row"><span>세트 가격 ({newSet.discountRate}% 할인)</span><span>{fmt(calc.setPrice)}원</span></div>
                      <div className="mkt-set-row"><span>세트 원가</span><span>{fmt(calc.setCost)}원</span></div>
                      <div className="mkt-set-row highlight"><span>세트 마진</span><span>{fmt(calc.setMargin)}원 ({calc.setMarginRate}%)</span></div>
                      <div className="mkt-set-row" style={{ color: 'var(--text-light)', fontSize: 11 }}>
                        <span>개별 판매 마진</span><span>{fmt(calc.individualMargin)}원 ({calc.individualMarginRate}%)</span>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="mkt-btn" onClick={addSetMenu}><Check size={14} /> 추가</button>
                  <button className="mkt-btn-outline" onClick={() => { setShowAddSet(false); setNewSet(emptySetMenu()); }}><X size={14} /> 취소</button>
                </div>
              </div>
            )}

            {/* Set Menu Cards */}
            {setMenus.length > 0 && (
              <div className="mkt-set-cards">
                {setMenus.map(sm => {
                  const calc = calcSet(sm);
                  return (
                    <div className="mkt-set-card" key={sm.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="mkt-set-name">{sm.name || '세트 메뉴'}</div>
                        <button className="mkt-btn-danger" onClick={() => removeSetMenu(sm.id)}><Trash2 size={12} /></button>
                      </div>

                      {/* Items */}
                      <div className="mkt-set-items">
                        {calc.main && (
                          <div className="mkt-set-item">
                            <span>{calc.main.emoji} {calc.main.name} <span style={{ color: 'var(--text-light)', fontSize: 11 }}>(메인)</span></span>
                            <span>{fmt(calc.main.price)}원</span>
                          </div>
                        )}
                        {calc.side && (
                          <div className="mkt-set-item">
                            <span>{calc.side.emoji} {calc.side.name} <span style={{ color: 'var(--text-light)', fontSize: 11 }}>(사이드)</span></span>
                            <span>{fmt(calc.side.price)}원</span>
                          </div>
                        )}
                        {calc.extra && (
                          <div className="mkt-set-item">
                            <span>{calc.extra.emoji} {calc.extra.name} <span style={{ color: 'var(--text-light)', fontSize: 11 }}>(추가)</span></span>
                            <span>{fmt(calc.extra.price)}원</span>
                          </div>
                        )}
                      </div>

                      {/* Discount slider (editable) */}
                      <div style={{ marginBottom: 10 }}>
                        <label className="mkt-label">할인율</label>
                        <div className="mkt-slider-row">
                          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>5%</span>
                          <input
                            type="range" className="mkt-slider"
                            min={5} max={20} step={1}
                            value={sm.discountRate}
                            onChange={e => updateSetField(sm.id, 'discountRate', Number(e.target.value))}
                          />
                          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>20%</span>
                          <span className="mkt-slider-value">{sm.discountRate}%</span>
                        </div>
                      </div>

                      {/* Calculation */}
                      <div className="mkt-set-calc">
                        <div className="mkt-set-row"><span>개별 합계</span><span>{fmt(calc.individualTotal)}원</span></div>
                        <div className="mkt-set-row"><span>세트 가격</span><span>{fmt(calc.setPrice)}원</span></div>
                        <div className="mkt-set-row"><span>세트 원가</span><span>{fmt(calc.setCost)}원</span></div>
                        <div className="mkt-set-row highlight"><span>세트 마진</span><span>{fmt(calc.setMargin)}원 ({calc.setMarginRate}%)</span></div>
                        <div className="mkt-set-row" style={{ borderTop: '1px dashed var(--border-light)', paddingTop: 6, marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>vs 개별 마진</span>
                          <span style={{ fontSize: 11, color: calc.setMarginRate >= calc.individualMarginRate ? 'var(--success)' : 'var(--danger)' }}>
                            {fmt(calc.individualMargin)}원 ({calc.individualMarginRate}%)
                            {calc.setMarginRate >= calc.individualMarginRate ? ' ✓ 세트 유리' : ' ▼ 개별 유리'}
                          </span>
                        </div>
                      </div>

                      {/* Baemin preview card */}
                      <div className="mkt-preview">
                        <div className="mkt-preview-label">배민 메뉴 미리보기</div>
                        <div className="mkt-preview-name">{sm.name || '세트 메뉴'}</div>
                        <div className="mkt-preview-items">
                          {calc.items.map((item, idx) => (
                            <div key={idx}>{item.emoji} {item.name}</div>
                          ))}
                        </div>
                        <div className="mkt-preview-prices">
                          <span className="mkt-preview-original">{fmt(calc.individualTotal)}원</span>
                          <span className="mkt-preview-set">{fmt(calc.setPrice)}원</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comparison table if multiple sets */}
            {setMenus.length >= 2 && (
              <div className="mkt-card">
                <div className="mkt-card-title"><TrendingUp size={16} /> 세트 비교</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-light)', fontWeight: 500 }}>세트명</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-light)', fontWeight: 500 }}>개별 합계</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-light)', fontWeight: 500 }}>세트 가격</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-light)', fontWeight: 500 }}>원가</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-light)', fontWeight: 500 }}>마진</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-light)', fontWeight: 500 }}>마진율</th>
                      </tr>
                    </thead>
                    <tbody>
                      {setMenus.map(sm => {
                        const c = calcSet(sm);
                        return (
                          <tr key={sm.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--text-dark)' }}>{sm.name || '세트'}</td>
                            <td style={{ textAlign: 'right', padding: '10px 12px' }}>{fmt(c.individualTotal)}원</td>
                            <td style={{ textAlign: 'right', padding: '10px 12px' }}>{fmt(c.setPrice)}원</td>
                            <td style={{ textAlign: 'right', padding: '10px 12px' }}>{fmt(c.setCost)}원</td>
                            <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: 'var(--success)' }}>{fmt(c.setMargin)}원</td>
                            <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: 'var(--success)' }}>{c.setMarginRate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
