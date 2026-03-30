import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Checklist from './components/Checklist';
import MenuManager from './components/MenuManager';
import AdminTracker from './components/AdminTracker';
import Finance from './components/Finance';
import DailySales from './components/DailySales';
import Competitors from './components/Competitors';
import CostCalculator from './components/CostCalculator';
import ReviewManager from './components/ReviewManager';
import OrderCalc from './components/OrderCalc';
import Analytics from './components/Analytics';
import Growth from './components/Growth';
import DailyOps from './components/DailyOps';
import MenuReport from './components/MenuReport';
import BaeminScore from './components/BaeminScore';
import WhatIf from './components/WhatIf';
import IngredientPrice from './components/IngredientPrice';
import PlatformGuide from './components/PlatformGuide';
import OrderSimulator from './components/OrderSimulator';
import StaffSchedule from './components/StaffSchedule';
import HygieneCheck from './components/HygieneCheck';
import Emergency from './components/Emergency';
import Marketing from './components/Marketing';
import DataManager from './components/DataManager';
import SmartInsights from './components/SmartInsights';
import MenuTools from './components/MenuTools';
import TodayDashboard from './components/TodayDashboard';
import MenuSales from './components/MenuSales';
import WeeklyReport from './components/WeeklyReport';
import QuickTools from './components/QuickTools';
import ProfitLoss from './components/ProfitLoss';
import { weeklyTasks, adminSteps, platformSteps, menuItems, financialData, defaultLedger, simDailyLogs, simReviews, simWeatherLogs } from './data/initialData';
import './App.css';

const STORAGE_KEY = 'food-startup-data';
function loadState() { try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch {} return null; }
const defaultOverhead = { baeminFeeRate:6.8, coupangFeeRate:9.8, yogiyoFeeRate:12.5, deliveryFee:3500, packagingCost:250, laborCostPerOrder:1500, cardFeeRate:1.5, rentPerOrder:0 };

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const saved = loadState();

  const [tasks, setTasks] = useState(saved?.tasks || weeklyTasks);
  const [admin, setAdmin] = useState(saved?.admin || adminSteps);
  const [platforms, setPlatforms] = useState(saved?.platforms || platformSteps);
  const [menus, setMenus] = useState(saved?.menus || menuItems);
  const [finance, setFinance] = useState(saved?.finance || financialData);
  const [ledger, setLedger] = useState(saved?.ledger || defaultLedger);
  const [dailyLogs, setDailyLogs] = useState(saved?.dailyLogs || simDailyLogs);
  const [competitors, setCompetitors] = useState(saved?.competitors || []);
  const [costData, setCostData] = useState(saved?.costData || { inventory:[], groceryLogs:[], overhead:defaultOverhead });
  const [reviews, setReviews] = useState(saved?.reviews || simReviews);
  const [promotions, setPromotions] = useState(saved?.promotions || []);
  const [weatherLogs, setWeatherLogs] = useState(saved?.weatherLogs || simWeatherLogs);
  const [customerData, setCustomerData] = useState(saved?.customerData || []);
  const [growthData, setGrowthData] = useState(saved?.growthData || { brands:[], timeline:[], checklist:[] });
  const [opsData, setOpsData] = useState(saved?.opsData || { prepLogs:[], wasteLogs:[], deliveryLogs:[], packagingStock:[] });
  const [priceData, setPriceData] = useState(saved?.priceData || { ingredients:[], priceHistory:[] });
  const [staffData, setStaffData] = useState(saved?.staffData || { members:[], schedules:[], settings:{ hourlyWage:9860, insuranceRate:9.4 } });
  const [hygieneData, setHygieneData] = useState(saved?.hygieneData || { dailyLogs:[], weeklyLogs:[], monthlyLogs:[], insuranceChecks:[] });
  const [emergencyData, setEmergencyData] = useState(saved?.emergencyData || { contacts:[], incidentLog:[] });
  const [marketingData, setMarketingData] = useState(saved?.marketingData || { snsPlans:[], coupons:[], setMenus:[] });
  const [menuSalesData, setMenuSalesData] = useState(saved?.menuSalesData || { dailySales:[], customers:[] });

  useEffect(() => {
    const data = { tasks, admin, platforms, menus, finance, ledger, dailyLogs, competitors, costData, reviews, promotions, weatherLogs, customerData, growthData, opsData, priceData, staffData, hygieneData, emergencyData, marketingData, menuSalesData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [tasks, admin, platforms, menus, finance, ledger, dailyLogs, competitors, costData, reviews, promotions, weatherLogs, customerData, growthData, opsData, priceData, staffData, hygieneData, emergencyData, marketingData, menuSalesData]);

  const toggleTask = (wi, di, ti) => { setTasks(p => { const n = JSON.parse(JSON.stringify(p)); n[wi].days[di].tasks[ti].done = !n[wi].days[di].tasks[ti].done; return n; }); };
  const updateAdminStatus = (id, s) => setAdmin(p => p.map(a => a.id === id ? { ...a, status: s } : a));
  const updatePlatformStatus = (id, s) => setPlatforms(p => p.map(x => x.id === id ? { ...x, status: s } : x));

  const totalTasks = tasks.reduce((s, w) => s + w.days.reduce((a, d) => a + d.tasks.length, 0), 0);
  const doneTasks = tasks.reduce((s, w) => s + w.days.reduce((a, d) => a + d.tasks.filter(t => t.done).length, 0), 0);
  const stats = { totalTasks, doneTasks, adminTotal: admin.length, adminDone: admin.filter(a => a.status === 'done').length, platformTotal: platforms.length, platformDone: platforms.filter(p => p.status === 'done').length };

  const handleExportAll = () => JSON.stringify({ tasks, admin, platforms, menus, finance, ledger, dailyLogs, competitors, costData, reviews, promotions, weatherLogs, customerData, growthData, opsData, priceData, staffData, hygieneData, emergencyData, marketingData, menuSalesData });
  const handleImportAll = (json) => {
    try {
      const d = JSON.parse(json);
      if (d.tasks) setTasks(d.tasks); if (d.admin) setAdmin(d.admin); if (d.platforms) setPlatforms(d.platforms);
      if (d.menus) setMenus(d.menus); if (d.finance) setFinance(d.finance); if (d.ledger) setLedger(d.ledger);
      if (d.dailyLogs) setDailyLogs(d.dailyLogs); if (d.competitors) setCompetitors(d.competitors);
      if (d.costData) setCostData(d.costData); if (d.reviews) setReviews(d.reviews);
      if (d.promotions) setPromotions(d.promotions); if (d.weatherLogs) setWeatherLogs(d.weatherLogs);
      if (d.customerData) setCustomerData(d.customerData); if (d.growthData) setGrowthData(d.growthData);
      if (d.opsData) setOpsData(d.opsData); if (d.priceData) setPriceData(d.priceData);
      if (d.staffData) setStaffData(d.staffData); if (d.hygieneData) setHygieneData(d.hygieneData);
      if (d.emergencyData) setEmergencyData(d.emergencyData); if (d.marketingData) setMarketingData(d.marketingData);
      if (d.menuSalesData) setMenuSalesData(d.menuSalesData);
      return true;
    } catch { return false; }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard stats={stats} tasks={tasks} admin={admin} platforms={platforms} ledger={ledger} menus={menus} onNavigate={setActiveTab} />;
      case 'today': return <TodayDashboard dailyLogs={dailyLogs} setDailyLogs={setDailyLogs} menus={menus} />;
      case 'checklist': return <Checklist tasks={tasks} toggleTask={toggleTask} />;
      case 'daily': return <DailySales dailyLogs={dailyLogs} setDailyLogs={setDailyLogs} />;
      case 'dailyOps': return <DailyOps menus={menus} dailyLogs={dailyLogs} opsData={opsData} setOpsData={setOpsData} />;
      case 'orderSim': return <OrderSimulator menus={menus} />;
      case 'menu': return <MenuManager menus={menus} setMenus={setMenus} />;
      case 'menuTools': return <MenuTools menus={menus} />;
      case 'menuReport': return <MenuReport menus={menus} dailyLogs={dailyLogs} />;
      case 'menuSales': return <MenuSales menus={menus} menuSalesData={menuSalesData} setMenuSalesData={setMenuSalesData} />;
      case 'cost': return <CostCalculator menus={menus} costData={costData} setCostData={setCostData} />;
      case 'orderCalc': return <OrderCalc menus={menus} dailyLogs={dailyLogs} costData={costData} />;
      case 'ingredientPrice': return <IngredientPrice priceData={priceData} setPriceData={setPriceData} />;
      case 'quickTools': return <QuickTools menus={menus} costData={costData} opsData={opsData} dailyLogs={dailyLogs} reviews={reviews} />;
      case 'reviews': return <ReviewManager reviews={reviews} setReviews={setReviews} />;
      case 'marketing': return <Marketing menus={menus} marketingData={marketingData} setMarketingData={setMarketingData} />;
      case 'competitors': return <Competitors competitors={competitors} setCompetitors={setCompetitors} />;
      case 'insights': return <SmartInsights dailyLogs={dailyLogs} ledger={ledger} menus={menus} reviews={reviews} opsData={opsData} costData={costData} competitors={competitors} weatherLogs={weatherLogs} finance={finance} />;
      case 'analytics': return <Analytics dailyLogs={dailyLogs} ledger={ledger} finance={finance} menus={menus} costData={costData} promotions={promotions} setPromotions={setPromotions} weatherLogs={weatherLogs} setWeatherLogs={setWeatherLogs} customerData={customerData} setCustomerData={setCustomerData} />;
      case 'baeminScore': return <BaeminScore reviews={reviews} dailyLogs={dailyLogs} menus={menus} />;
      case 'whatIf': return <WhatIf menus={menus} finance={finance} dailyLogs={dailyLogs} costData={costData} />;
      case 'profitLoss': return <ProfitLoss />;
      case 'weeklyReport': return <WeeklyReport dailyLogs={dailyLogs} menus={menus} reviews={reviews} ledger={ledger} finance={finance} />;
      case 'admin': return <AdminTracker admin={admin} platforms={platforms} updateAdminStatus={updateAdminStatus} updatePlatformStatus={updatePlatformStatus} />;
      case 'finance': return <Finance finance={finance} setFinance={setFinance} menus={menus} ledger={ledger} setLedger={setLedger} />;
      case 'platformGuide': return <PlatformGuide />;
      case 'staff': return <StaffSchedule staffData={staffData} setStaffData={setStaffData} />;
      case 'hygiene': return <HygieneCheck hygieneData={hygieneData} setHygieneData={setHygieneData} />;
      case 'emergency': return <Emergency emergencyData={emergencyData} setEmergencyData={setEmergencyData} />;
      case 'dataManager': return <DataManager onExportAll={handleExportAll} onImportAll={handleImportAll} ledger={ledger} dailyLogs={dailyLogs} menus={menus} finance={finance} reviews={reviews} opsData={opsData} />;
      case 'growth': return <Growth menus={menus} finance={finance} growthData={growthData} setGrowthData={setGrowthData} />;
      default: return <Dashboard stats={stats} tasks={tasks} admin={admin} platforms={platforms} ledger={ledger} menus={menus} onNavigate={setActiveTab} />;
    }
  };

  // Dark mode init
  useEffect(() => {
    const t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  }, []);

  // Command palette
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const cmdPages = [
    { id:'dashboard', label:'대시보드', icon:'📊' }, { id:'today', label:'오늘 매출 (실시간)', icon:'⚡' },
    { id:'daily', label:'매출 입력', icon:'💰' }, { id:'dailyOps', label:'일일 운영', icon:'📋' },
    { id:'orderSim', label:'주문 시뮬레이터', icon:'⏱️' },
    { id:'menu', label:'메뉴 관리', icon:'🍽️' }, { id:'menuTools', label:'메뉴 도구', icon:'🎨' },
    { id:'menuReport', label:'메뉴 성적표', icon:'📈' }, { id:'menuSales', label:'메뉴별 판매', icon:'🛒' },
    { id:'cost', label:'코스트 계산기', icon:'🧮' }, { id:'orderCalc', label:'발주 계산기', icon:'📦' },
    { id:'ingredientPrice', label:'식재료 시세', icon:'💲' }, { id:'quickTools', label:'빠른 도구', icon:'🔧' },
    { id:'reviews', label:'리뷰 관리', icon:'⭐' }, { id:'marketing', label:'마케팅 센터', icon:'📢' },
    { id:'competitors', label:'경쟁사 분석', icon:'🔍' },
    { id:'insights', label:'스마트 인사이트', icon:'💡' }, { id:'analytics', label:'분석 센터', icon:'📉' },
    { id:'baeminScore', label:'배민 점수판', icon:'🏆' }, { id:'whatIf', label:'What-If 시나리오', icon:'⚡' },
    { id:'profitLoss', label:'완전 손익분석', icon:'📊' }, { id:'weeklyReport', label:'주간/세무 리포트', icon:'📑' },
    { id:'admin', label:'행정/플랫폼', icon:'📄' }, { id:'finance', label:'재무 관리', icon:'💳' },
    { id:'platformGuide', label:'플랫폼 가이드', icon:'📖' }, { id:'checklist', label:'4주 체크리스트', icon:'✅' },
    { id:'staff', label:'직원/일정', icon:'👥' }, { id:'hygiene', label:'위생 점검', icon:'🛡️' },
    { id:'emergency', label:'비상 매뉴얼', icon:'🚨' },
    { id:'growth', label:'성장 전략', icon:'🚀' }, { id:'dataManager', label:'데이터 관리', icon:'💾' },
  ];
  const filteredCmd = cmdQuery.trim() ? cmdPages.filter(p => p.label.toLowerCase().includes(cmdQuery.toLowerCase())) : cmdPages;

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(p => !p); setCmdQuery(''); }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} stats={stats} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="main-content">{renderContent()}</main>
      {cmdOpen && (
        <div className="cmd-overlay" onClick={() => setCmdOpen(false)}>
          <div className="cmd-box" onClick={e => e.stopPropagation()}>
            <input className="cmd-input" placeholder="페이지 검색... (Ctrl+K)" autoFocus value={cmdQuery} onChange={e => setCmdQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && filteredCmd.length > 0) { setActiveTab(filteredCmd[0].id); setCmdOpen(false); } }} />
            <div className="cmd-list">
              {filteredCmd.map(p => (
                <div key={p.id} className={`cmd-item ${p.id === activeTab ? 'active' : ''}`} onClick={() => { setActiveTab(p.id); setCmdOpen(false); }}>
                  <span>{p.icon}</span><span>{p.label}</span>
                </div>
              ))}
              {filteredCmd.length === 0 && <div className="cmd-hint">검색 결과가 없습니다</div>}
            </div>
            <div className="cmd-hint">Enter로 이동 · ESC로 닫기</div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
