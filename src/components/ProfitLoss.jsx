import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calculator, Truck, Store, ShoppingBag, PiggyBank, Receipt, AlertTriangle, ChevronDown, ChevronUp, Info, Target, Percent, CreditCard, Flame, Snowflake, BadgeDollarSign, ArrowDownUp, Package } from 'lucide-react';

const fmt = (n) => {
  if (n === undefined || n === null) return '-';
  const abs = Math.abs(Math.round(n));
  const str = abs.toLocaleString('ko-KR');
  return n < 0 ? `-${str}` : str;
};

const fmtShort = (n) => {
  const abs = Math.abs(n);
  if (abs >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (abs >= 10000) return `${Math.round(n / 10000)}만`;
  return fmt(n);
};

const platforms = [
  {
    name: '배달의민족',
    share: '50~60%',
    commRate: 7.8, commWon: 795,
    delivFee: 3400,
    packFee: 6.8, packWon: 693,
    payFee: 2.4, payWon: 245,
    totalDel: 4440, totalPack: 938,
    note: '신규 입점 = 상위 35% 구간 적용',
    color: '#48D1CC',
  },
  {
    name: '쿠팡이츠',
    share: '30~40%',
    commRate: 7.8, commWon: 795,
    delivFee: 3400,
    packFee: 0, packWon: 0,
    payFee: 2.4, payWon: 245,
    totalDel: 4440, totalPack: 245,
    note: '포장 수수료 무료 (2027.3월까지)',
    color: '#FF6B6B',
  },
  {
    name: '요기요',
    share: '~10%',
    commRate: 9.7, commWon: 989,
    delivFee: 0,
    packFee: 7.7, packWon: 785,
    payFee: 3.0, payWon: 306,
    totalDel: 1295, totalPack: 1091,
    note: '가게배달 시 배달비 점주 미부담, 별도 광고비 없음',
    color: '#FFD93D',
  },
];

const sideMenus = [
  { name: '제로 계란찜', price: 2500, cost: 350, margin: 2150, rate: 14, time: '3분', fit: 95, desc: '달걀 2개+알룰로스+육수. 전자레인지 OK' },
  { name: '제로 미니탕수육(5p)', price: 4900, cost: 1200, margin: 3700, rate: 24.5, time: '4분', fit: 90, desc: '고단백 저당 소스. 유린기와 차별화' },
  { name: '제로 콜라/음료', price: 1500, cost: 500, margin: 1000, rate: 33, time: '0분', fit: 85, desc: '도매 구매. 조리 불필요' },
  { name: '제로 군만두(5p)', price: 3500, cost: 700, margin: 2800, rate: 20, time: '5분', fit: 80, desc: '냉동 반제품 에어프라이어' },
  { name: '제로 우동 사리', price: 2000, cost: 400, margin: 1600, rate: 20, time: '2분', fit: 70, desc: '마파두부에 우동 추가' },
];

export default function ProfitLoss() {
  const [dailyOrders, setDailyOrders] = useState(30);
  const [packRatio, setPackRatio] = useState(20);
  const [sideRate, setSideRate] = useState(25);
  const [expandedSections, setExpandedSections] = useState({
    startup: false, platform: true, perOrder: true, pnl: true, bep: true, side: false, strategy: false, summary: true,
  });

  const toggleSection = (key) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  const calc = useMemo(() => {
    const avgPrice = 10200;
    const avgSideAdd = 2500;
    const foodCostRate = 0.20;
    const daysPerMonth = 30;

    const monthlyOrders = dailyOrders * daysPerMonth;
    const delivOrders = Math.round(monthlyOrders * (1 - packRatio / 100));
    const packOrders = monthlyOrders - delivOrders;
    const sideOrders = Math.round(monthlyOrders * sideRate / 100);

    const mainRevenue = monthlyOrders * avgPrice;
    const sideRevenue = sideOrders * avgSideAdd;
    const totalRevenue = mainRevenue + sideRevenue;

    // Variable costs
    const foodCost = Math.round(totalRevenue * foodCostRate);
    const delivCommission = Math.round(delivOrders * avgPrice * 0.078);
    const packCommission = Math.round(packOrders * avgPrice * 0.068);
    const delivFeeTotal = delivOrders * 3400;
    const paymentFee = Math.round(totalRevenue * 0.024);
    const packagingCost = monthlyOrders * 400;
    const reviewEvent = monthlyOrders * 300;
    const varUtility = Math.round(monthlyOrders * 120);
    const totalVarCost = foodCost + delivCommission + packCommission + delivFeeTotal + paymentFee + packagingCost + reviewEvent + varUtility;

    // Fixed costs
    const rent = 600000;
    const mgmtFee = 110000;
    const utility = 200000;
    const internet = 50000;
    const adCost = dailyOrders >= 40 ? 150000 : dailyOrders >= 25 ? 200000 : 300000;
    const supplies = 80000;
    const taxAgent = 100000;
    const loanInterest = Math.round(50000000 * 0.025 / 12);
    const totalFixed = rent + mgmtFee + utility + internet + adCost + supplies + taxAgent + loanInterest;

    const grossProfit = totalRevenue - totalVarCost - totalFixed;

    // Taxes
    const annualProfit = grossProfit * 12;
    const vatRate = annualProfit < 48000000 ? 0 : annualProfit < 104000000 ? 0.04 : 0.06;
    const vatMonthly = Math.round(totalRevenue * vatRate / 12);

    let incomeTaxAnnual = 0;
    if (annualProfit <= 14000000) incomeTaxAnnual = annualProfit * 0.06;
    else if (annualProfit <= 50000000) incomeTaxAnnual = annualProfit * 0.15 - 1260000;
    else if (annualProfit <= 88000000) incomeTaxAnnual = annualProfit * 0.24 - 5760000;
    else incomeTaxAnnual = annualProfit * 0.35 - 15440000;
    if (incomeTaxAnnual < 0) incomeTaxAnnual = 0;
    const incomeTaxMonthly = Math.round(incomeTaxAnnual / 12);

    const healthIns = Math.round(grossProfit * 0.08);
    const pension = Math.round(grossProfit * 0.09);
    const totalInsurance = healthIns + pension;
    const netIncome = grossProfit - vatMonthly - incomeTaxMonthly - totalInsurance;
    const perPerson = Math.round(netIncome / 2);

    // Per-order delivery
    const perOrder = {
      revenue: avgPrice,
      food: Math.round(avgPrice * foodCostRate),
      comm: Math.round(avgPrice * 0.078),
      deliv: 3400,
      pay: Math.round(avgPrice * 0.024),
      pack: 400,
      review: 300,
      varUtil: 120,
    };
    perOrder.totalCost = perOrder.food + perOrder.comm + perOrder.deliv + perOrder.pay + perOrder.pack + perOrder.review + perOrder.varUtil;
    perOrder.contrib = perOrder.revenue - perOrder.totalCost;
    perOrder.contribRate = ((perOrder.contrib / perOrder.revenue) * 100).toFixed(1);

    const bepMonthly = Math.ceil(totalFixed / perOrder.contrib);
    const bepDaily = (bepMonthly / 30).toFixed(1);

    // Pack ratio comparison
    const packComparison = [0, 20, 40, 60].map(pack => {
      const dO = Math.round(30 * 30 * (1 - pack / 100));
      const pO = 30 * 30 - dO;
      const rev = 30 * 30 * 10200;
      const vc = rev * 0.20 + dO * 10200 * 0.078 + pO * 10200 * 0.068 + dO * 3400 + rev * 0.024 + 30 * 30 * 400 + 30 * 30 * 300 + 30 * 30 * 120;
      const fc = rent + mgmtFee + utility + internet + 200000 + supplies + taxAgent + loanInterest;
      return { pack, delivFee: dO * 3400, profit: rev - vc - fc };
    });

    return {
      avgPrice, monthlyOrders, delivOrders, packOrders, sideOrders,
      mainRevenue, sideRevenue, totalRevenue,
      foodCost, delivCommission, packCommission, delivFeeTotal, paymentFee, packagingCost, reviewEvent, varUtility, totalVarCost,
      rent, mgmtFee, utility, internet, adCost, supplies, taxAgent, loanInterest, totalFixed,
      grossProfit,
      vatMonthly, incomeTaxMonthly, healthIns, pension, totalInsurance,
      netIncome, perPerson,
      perOrder, bepMonthly, bepDaily,
      packComparison,
    };
  }, [dailyOrders, packRatio, sideRate]);

  const profitColor = (v) => v > 0 ? 'var(--success)' : 'var(--danger)';
  const profitClass = (v) => v > 0 ? 'pl-positive' : 'pl-negative';

  return (
    <div className="pl">
      <div className="page-header">
        <h2 className="page-title"><Calculator size={24} /> 완전 손익분석</h2>
        <p className="page-desc">배달 플랫폼 수수료 · 모든 비용 반영 · 실시간 시뮬레이션</p>
      </div>

      {/* Simulation Controls */}
      <div className="pl-controls">
        <div className="pl-controls-title"><Flame size={14} /> 시뮬레이션 조정</div>
        <div className="pl-sliders">
          <div className="pl-slider-group">
            <div className="pl-slider-header">
              <span className="pl-slider-label">일 평균 주문수</span>
              <span className="pl-slider-value" style={{ color: 'var(--primary)' }}>{dailyOrders}건</span>
            </div>
            <input type="range" min={5} max={70} value={dailyOrders} onChange={e => setDailyOrders(+e.target.value)} className="pl-range primary" />
            <div className="pl-slider-range"><span>5건</span><span>70건</span></div>
          </div>
          <div className="pl-slider-group">
            <div className="pl-slider-header">
              <span className="pl-slider-label">포장 비율</span>
              <span className="pl-slider-value" style={{ color: 'var(--teal)' }}>{packRatio}%</span>
            </div>
            <input type="range" min={0} max={60} value={packRatio} onChange={e => setPackRatio(+e.target.value)} className="pl-range teal" />
            <div className="pl-slider-range"><span>0%</span><span>60%</span></div>
          </div>
          <div className="pl-slider-group">
            <div className="pl-slider-header">
              <span className="pl-slider-label">사이드 주문 비율</span>
              <span className="pl-slider-value" style={{ color: 'var(--warning)' }}>{sideRate}%</span>
            </div>
            <input type="range" min={0} max={60} value={sideRate} onChange={e => setSideRate(+e.target.value)} className="pl-range warning" />
            <div className="pl-slider-range"><span>0%</span><span>60%</span></div>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="pl-metrics">
        <div className="pl-metric">
          <div className="pl-metric-icon blue"><Receipt size={18} /></div>
          <div className="pl-metric-body">
            <div className="pl-metric-label">월 매출</div>
            <div className="pl-metric-value">{fmtShort(calc.totalRevenue)}원</div>
            <div className="pl-metric-sub">본메뉴 {fmtShort(calc.mainRevenue)} + 사이드 {fmtShort(calc.sideRevenue)}</div>
          </div>
        </div>
        <div className="pl-metric">
          <div className={`pl-metric-icon ${calc.grossProfit > 0 ? 'green' : 'red'}`}><TrendingUp size={18} /></div>
          <div className="pl-metric-body">
            <div className="pl-metric-label">세전 영업이익</div>
            <div className="pl-metric-value" style={{ color: profitColor(calc.grossProfit) }}>{fmt(calc.grossProfit)}원</div>
            <div className="pl-metric-sub">이익률 {((calc.grossProfit / calc.totalRevenue) * 100).toFixed(1)}%</div>
          </div>
        </div>
        <div className="pl-metric">
          <div className={`pl-metric-icon ${calc.netIncome > 0 ? 'green' : 'red'}`}><PiggyBank size={18} /></div>
          <div className="pl-metric-body">
            <div className="pl-metric-label">월 실수령 (세후)</div>
            <div className="pl-metric-value" style={{ color: profitColor(calc.netIncome) }}>{fmt(calc.netIncome)}원</div>
            <div className="pl-metric-sub">1인당 {fmt(calc.perPerson)}원 (2인)</div>
          </div>
        </div>
        <div className="pl-metric">
          <div className={`pl-metric-icon ${calc.bepDaily <= dailyOrders ? 'green' : 'orange'}`}><Target size={18} /></div>
          <div className="pl-metric-body">
            <div className="pl-metric-label">손익분기</div>
            <div className="pl-metric-value">일 {calc.bepDaily}건</div>
            <div className="pl-metric-sub">{dailyOrders >= calc.bepDaily ? '✓ BEP 초과' : `${(calc.bepDaily - dailyOrders).toFixed(1)}건 부족`}</div>
          </div>
        </div>
      </div>

      {/* Revenue vs Cost Visual Bar */}
      <div className="pl-card">
        <div className="pl-card-title"><BadgeDollarSign size={16} /> 매출 vs 비용 구조</div>
        <div className="pl-waterfall">
          <div className="pl-wf-row">
            <span className="pl-wf-label">매출</span>
            <div className="pl-wf-track">
              <div className="pl-wf-bar revenue" style={{ width: '100%' }} />
            </div>
            <span className="pl-wf-val">{fmtShort(calc.totalRevenue)}</span>
          </div>
          <div className="pl-wf-row">
            <span className="pl-wf-label">변동비</span>
            <div className="pl-wf-track">
              <div className="pl-wf-bar cost" style={{ width: `${(calc.totalVarCost / calc.totalRevenue * 100).toFixed(1)}%` }} />
            </div>
            <span className="pl-wf-val">-{fmtShort(calc.totalVarCost)} ({(calc.totalVarCost / calc.totalRevenue * 100).toFixed(0)}%)</span>
          </div>
          <div className="pl-wf-row">
            <span className="pl-wf-label">고정비</span>
            <div className="pl-wf-track">
              <div className="pl-wf-bar fixed" style={{ width: `${(calc.totalFixed / calc.totalRevenue * 100).toFixed(1)}%` }} />
            </div>
            <span className="pl-wf-val">-{fmtShort(calc.totalFixed)} ({(calc.totalFixed / calc.totalRevenue * 100).toFixed(0)}%)</span>
          </div>
          <div className="pl-wf-row">
            <span className="pl-wf-label">세금/보험</span>
            <div className="pl-wf-track">
              <div className="pl-wf-bar tax" style={{ width: `${((calc.vatMonthly + calc.incomeTaxMonthly + calc.totalInsurance) / calc.totalRevenue * 100).toFixed(1)}%` }} />
            </div>
            <span className="pl-wf-val">-{fmtShort(calc.vatMonthly + calc.incomeTaxMonthly + calc.totalInsurance)}</span>
          </div>
          <div className="pl-wf-divider" />
          <div className="pl-wf-row">
            <span className="pl-wf-label" style={{ fontWeight: 700 }}>실수령</span>
            <div className="pl-wf-track">
              <div className={`pl-wf-bar ${calc.netIncome > 0 ? 'profit' : 'loss'}`} style={{ width: `${Math.max(Math.abs(calc.netIncome) / calc.totalRevenue * 100, 2).toFixed(1)}%` }} />
            </div>
            <span className="pl-wf-val" style={{ fontWeight: 700, color: profitColor(calc.netIncome) }}>{fmt(calc.netIncome)}</span>
          </div>
        </div>
      </div>

      {/* 01. Startup Capital */}
      <SectionCard num="01" title="창업 자금 구조" icon={<PiggyBank size={16} />} sectionKey="startup" expanded={expandedSections.startup} onToggle={toggleSection}>
        <div className="pl-rows">
          <PlRow label="자기자본 (현금)" val={`${fmt(10000000)}원`} color="var(--success)" border />
          <PlRow label="창업대출 (금리 2.5%)" val={`${fmt(50000000)}원`} color="var(--primary)" border />
          <PlRow label="총 창업 자금" val={`${fmt(60000000)}원`} bold border />
          <PlRow label="월 대출이자 (이자만)" val={`${fmt(calc.loanInterest)}원`} color="var(--danger)" border />
        </div>
        <div className="pl-note">
          보증금 1,000만원 + 인테리어·장비 500~800만원 + 초기 재고 80만원 + 여유자금.
          대출 5,000만원 × 연 2.5% = 월 약 {fmt(calc.loanInterest)}원 이자 부담. 3년 원금 균등상환 시 월 약 153만원(원리금).
        </div>
      </SectionCard>

      {/* 02. Platform Fees */}
      <SectionCard num="02" title="배달 플랫폼별 수수료 비교" icon={<Truck size={16} />} sectionKey="platform" expanded={expandedSections.platform} onToggle={toggleSection}>
        <div className="pl-subtitle">주문 단가 10,200원 기준</div>
        <div className="pl-platform-cards">
          {platforms.map(p => (
            <div key={p.name} className="pl-platform-card">
              <div className="pl-pf-header" style={{ borderLeftColor: p.color }}>
                <div className="pl-pf-name" style={{ color: p.color }}>{p.name}</div>
                <div className="pl-pf-share">{p.share}</div>
              </div>
              <div className="pl-pf-grid">
                <div className="pl-pf-item">
                  <span className="pl-pf-item-label">중개수수료</span>
                  <span className="pl-pf-item-val">{p.commRate}% ({fmt(p.commWon)}원)</span>
                </div>
                <div className="pl-pf-item">
                  <span className="pl-pf-item-label">점주 배달비</span>
                  <span className="pl-pf-item-val" style={{ color: p.delivFee > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {p.delivFee > 0 ? `${fmt(p.delivFee)}원` : '0원'}
                  </span>
                </div>
                <div className="pl-pf-item">
                  <span className="pl-pf-item-label">포장수수료</span>
                  <span className="pl-pf-item-val" style={{ color: p.packWon === 0 ? 'var(--success)' : '' }}>
                    {p.packFee}% ({fmt(p.packWon)}원)
                  </span>
                </div>
                <div className="pl-pf-item">
                  <span className="pl-pf-item-label">결제수수료</span>
                  <span className="pl-pf-item-val">{p.payFee}% ({fmt(p.payWon)}원)</span>
                </div>
              </div>
              <div className="pl-pf-totals">
                <div className="pl-pf-total">
                  <Truck size={12} />
                  <span>배달 1건</span>
                  <strong style={{ color: 'var(--danger)' }}>{fmt(p.totalDel)}원</strong>
                </div>
                <div className="pl-pf-total">
                  <Store size={12} />
                  <span>포장 1건</span>
                  <strong style={{ color: p.totalPack < 500 ? 'var(--success)' : 'var(--warning)' }}>{fmt(p.totalPack)}원</strong>
                </div>
              </div>
              <div className="pl-pf-note">{p.note}</div>
            </div>
          ))}
        </div>
        <div className="pl-alert warning">
          <AlertTriangle size={14} />
          <div>
            <strong>핵심:</strong> 배달 1건당 점주 총 부담은 배민·쿠팡이츠 기준 약 <strong>4,440원</strong> (매출의 43.5%).
            포장은 쿠팡이츠가 수수료 0원으로 가장 유리. <strong>포장 비율을 높일수록 수익이 급격히 개선</strong>됩니다.
          </div>
        </div>
      </SectionCard>

      {/* 03. Per-order breakdown */}
      <SectionCard num="03" title="배달 주문 1건 완전 원가 분해" icon={<ShoppingBag size={16} />} sectionKey="perOrder" expanded={expandedSections.perOrder} onToggle={toggleSection}>
        <div className="pl-per-order-visual">
          <div className="pl-po-bar-container">
            {[
              { label: '식재료', val: calc.perOrder.food, color: '#ef4444' },
              { label: '중개수수료', val: calc.perOrder.comm, color: '#f97316' },
              { label: '배달비', val: calc.perOrder.deliv, color: '#dc2626' },
              { label: '결제수수료', val: calc.perOrder.pay, color: '#a855f7' },
              { label: '포장재', val: calc.perOrder.pack, color: '#6366f1' },
              { label: '리뷰', val: calc.perOrder.review, color: '#8b5cf6' },
              { label: '공과금', val: calc.perOrder.varUtil, color: '#94a3b8' },
              { label: '공헌이익', val: calc.perOrder.contrib, color: '#22c55e' },
            ].map(item => (
              <div key={item.label} className="pl-po-segment" style={{ flex: item.val, background: item.color }} title={`${item.label}: ${fmt(item.val)}원`} />
            ))}
          </div>
          <div className="pl-po-legend">
            {[
              { label: '원가+수수료', val: calc.perOrder.totalCost, color: 'var(--danger)' },
              { label: '공헌이익', val: calc.perOrder.contrib, color: 'var(--success)' },
            ].map(item => (
              <span key={item.label} className="pl-po-legend-item">
                <span className="pl-po-dot" style={{ background: item.color }} />
                {item.label}: {fmt(item.val)}원 ({item.label === '공헌이익' ? calc.perOrder.contribRate : (100 - parseFloat(calc.perOrder.contribRate)).toFixed(1)}%)
              </span>
            ))}
          </div>
        </div>
        <div className="pl-rows">
          <PlRow label="매출 (판매가)" val={`${fmt(calc.perOrder.revenue)}원`} color="var(--success)" bold border />
          <PlRow label="식재료 원가 (20%)" val={`-${fmt(calc.perOrder.food)}원`} color="var(--danger)" indent border />
          <PlRow label="중개수수료 (7.8%)" val={`-${fmt(calc.perOrder.comm)}원`} color="var(--danger)" indent border />
          <PlRow label="점주 배달비" val={`-${fmt(calc.perOrder.deliv)}원`} color="var(--danger)" indent border />
          <PlRow label="결제수수료 (2.4%)" val={`-${fmt(calc.perOrder.pay)}원`} indent border />
          <PlRow label="포장재" val={`-${fmt(calc.perOrder.pack)}원`} indent border />
          <PlRow label="리뷰 이벤트" val={`-${fmt(calc.perOrder.review)}원`} indent border />
          <PlRow label="변동 공과금" val={`-${fmt(calc.perOrder.varUtil)}원`} indent border />
          <div className="pl-divider accent" />
          <PlRow label="= 건당 공헌이익" val={`${fmt(calc.perOrder.contrib)}원`} color={profitColor(calc.perOrder.contrib)} bold />
          <PlRow label="공헌이익률" val={`${calc.perOrder.contribRate}%`} color={profitColor(calc.perOrder.contrib)} />
        </div>
        <div className="pl-alert danger">
          <AlertTriangle size={14} />
          <div>
            점주 배달비 3,400원이 추가되면서 공헌이익이 6,167원 → <strong>{fmt(calc.perOrder.contrib)}원</strong>으로 약 55% 감소.
            BEP가 하루 8건 → <strong>{calc.bepDaily}건</strong>으로 상승. 배달비가 수익 구조를 근본적으로 바꿉니다.
          </div>
        </div>
      </SectionCard>

      {/* 04. Complete P&L */}
      <SectionCard num="04" title={`완전 손익계산서 — 하루 ${dailyOrders}건`} icon={<Receipt size={16} />} sectionKey="pnl" expanded={expandedSections.pnl} onToggle={toggleSection}>
        <div className="pl-pnl-summary">
          배달 {calc.delivOrders}건 + 포장 {calc.packOrders}건 / 사이드 {calc.sideOrders}건 포함
        </div>

        <div className="pl-rows">
          <PlRow label="■ 총 매출" val={`${fmt(calc.totalRevenue)}원`} color="var(--success)" bold border icon={<TrendingUp size={13} />} />

          <div className="pl-group-label"><Flame size={11} /> 변동비 (팔수록 늘어나는 비용)</div>
          <PlRow label="식재료 원가 (20%)" val={`-${fmt(calc.foodCost)}원`} color="var(--danger)" indent border />
          <PlRow label="배달 중개수수료 (7.8%)" val={`-${fmt(calc.delivCommission)}원`} indent border />
          <PlRow label="포장 중개수수료 (6.8%)" val={`-${fmt(calc.packCommission)}원`} indent border />
          <PlRow label="점주 배달비 (3,400원×배달건)" val={`-${fmt(calc.delivFeeTotal)}원`} color="var(--danger)" indent border />
          <PlRow label="결제수수료 (2.4%)" val={`-${fmt(calc.paymentFee)}원`} indent border />
          <PlRow label="포장재 (400원/건)" val={`-${fmt(calc.packagingCost)}원`} indent border />
          <PlRow label="리뷰 이벤트 (300원/건)" val={`-${fmt(calc.reviewEvent)}원`} indent border />
          <PlRow label="변동 공과금" val={`-${fmt(calc.varUtility)}원`} indent border />
          <PlRow label="변동비 소계" val={`-${fmt(calc.totalVarCost)}원`} color="var(--danger)" bold border />

          <div className="pl-group-label"><Snowflake size={11} /> 고정비 (안 팔아도 나가는 비용)</div>
          <PlRow label="월세" val={`-${fmt(calc.rent)}원`} indent border />
          <PlRow label="관리비" val={`-${fmt(calc.mgmtFee)}원`} indent border />
          <PlRow label="공과금 (고정분)" val={`-${fmt(calc.utility)}원`} indent border />
          <PlRow label="인터넷·전화" val={`-${fmt(calc.internet)}원`} indent border />
          <PlRow label="배달앱 광고비" val={`-${fmt(calc.adCost)}원`} indent border />
          <PlRow label="소모품·위생" val={`-${fmt(calc.supplies)}원`} indent border />
          <PlRow label="세무대리비" val={`-${fmt(calc.taxAgent)}원`} indent border />
          <PlRow label="대출이자 (5천만, 2.5%)" val={`-${fmt(calc.loanInterest)}원`} color="var(--warning)" indent border />
          <PlRow label="고정비 소계" val={`-${fmt(calc.totalFixed)}원`} color="var(--warning)" bold border />

          <div className="pl-divider accent" />
          <PlRow label="■ 세전 영업이익" val={`${fmt(calc.grossProfit)}원`} color={profitColor(calc.grossProfit)} bold border icon={calc.grossProfit > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />} />

          <div className="pl-group-label"><CreditCard size={11} /> 세금·보험</div>
          <PlRow label="부가세 (월할 추정)" val={`-${fmt(calc.vatMonthly)}원`} indent border />
          <PlRow label="종합소득세 (월할 추정)" val={`-${fmt(calc.incomeTaxMonthly)}원`} indent border />
          <PlRow label="건강보험+국민연금 (2인)" val={`-${fmt(calc.totalInsurance)}원`} indent border />

          <div className="pl-divider accent" />
          <PlRow label="■ 월 실수령 (세후)" val={`${fmt(calc.netIncome)}원`} color={profitColor(calc.netIncome)} bold border icon={<PiggyBank size={13} />} />
          <PlRow label="1인당 (2인 분배)" val={`${fmt(calc.perPerson)}원`} color={profitColor(calc.perPerson)} bold />
        </div>

        <div className="pl-note">
          ※ 청년 창업 세액감면(5년간 소득세 100% 감면) 미적용 기준. 적용 시 종합소득세 0원 → 실수령 +{fmt(calc.incomeTaxMonthly)}원 증가<br />
          ※ 인건비 미반영 (2인 = 공동사업자 또는 가족 무급 전제). 대출은 이자만 반영(원금상환 미포함)
        </div>
      </SectionCard>

      {/* 05. BEP */}
      <SectionCard num="05" title="손익분기점 (배달비 포함)" icon={<Target size={16} />} sectionKey="bep" expanded={expandedSections.bep} onToggle={toggleSection}>
        <div className="pl-bep-cards">
          <div className="pl-bep-card">
            <div className="pl-bep-label">건당 공헌이익</div>
            <div className="pl-bep-value" style={{ color: 'var(--success)' }}>{fmt(calc.perOrder.contrib)}원</div>
          </div>
          <div className="pl-bep-card">
            <div className="pl-bep-label">월 고정비</div>
            <div className="pl-bep-value" style={{ color: 'var(--danger)' }}>{fmt(calc.totalFixed)}원</div>
          </div>
          <div className="pl-bep-card">
            <div className="pl-bep-label">월 BEP</div>
            <div className="pl-bep-value" style={{ color: 'var(--warning)' }}>{calc.bepMonthly}건</div>
          </div>
          <div className="pl-bep-card highlight">
            <div className="pl-bep-label">일 BEP</div>
            <div className="pl-bep-value" style={{ color: 'var(--warning)' }}>{calc.bepDaily}건</div>
            <div className="pl-bep-sub">이 이상부터 흑자</div>
          </div>
        </div>
        {/* BEP gauge */}
        <div className="pl-bep-gauge">
          <div className="pl-bep-gauge-label">
            <span>0건</span>
            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>BEP {calc.bepDaily}건</span>
            <span>70건</span>
          </div>
          <div className="pl-bep-gauge-track">
            <div className="pl-bep-gauge-bep" style={{ left: `${(parseFloat(calc.bepDaily) / 70 * 100).toFixed(1)}%` }} />
            <div className={`pl-bep-gauge-fill ${dailyOrders >= parseFloat(calc.bepDaily) ? 'profit' : 'loss'}`}
              style={{ width: `${(dailyOrders / 70 * 100).toFixed(1)}%` }} />
          </div>
          <div className="pl-bep-gauge-current">현재: <strong>{dailyOrders}건</strong> {dailyOrders >= parseFloat(calc.bepDaily) ? '→ 흑자 구간' : '→ 적자 구간'}</div>
        </div>
        <div className="pl-alert info">
          <Info size={14} />
          <div>
            배달비 3,400원 포함 시 BEP가 <strong>하루 {calc.bepDaily}건</strong>입니다. 포장 비율을 높이면 건당 공헌이익이 올라가면서 BEP가 낮아집니다.
            슬라이더로 포장 비율을 40%로 올려보세요.
          </div>
        </div>
      </SectionCard>

      {/* 06. Side Menu */}
      <SectionCard num="06" title="사이드 메뉴 추천 — 객단가 올리기" icon={<Package size={16} />} sectionKey="side" expanded={expandedSections.side} onToggle={toggleSection}>
        <div className="pl-side-grid">
          {sideMenus.map(m => (
            <div key={m.name} className="pl-side-card">
              <div className="pl-side-header">
                <span className="pl-side-name">{m.name}</span>
                <span className={`pl-side-fit ${m.fit >= 90 ? 'high' : m.fit >= 80 ? 'mid' : 'low'}`}>{m.fit}점</span>
              </div>
              <div className="pl-side-stats">
                <div><span>판매가</span><strong>{fmt(m.price)}원</strong></div>
                <div><span>원가</span><strong>{fmt(m.cost)}원</strong></div>
                <div><span>마진</span><strong style={{ color: 'var(--success)' }}>{fmt(m.margin)}원</strong></div>
                <div><span>원가율</span><strong>{m.rate}%</strong></div>
              </div>
              <div className="pl-side-bar-track">
                <div className="pl-side-bar-fill" style={{ width: `${100 - m.rate}%` }} />
              </div>
              <div className="pl-side-meta">
                <span>⏱ {m.time}</span>
                <span>{m.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="pl-alert success">
          <TrendingUp size={14} />
          <div>
            현재 {sideRate}% 주문 시 사이드 추가 매출: 월 <strong>{fmt(calc.sideOrders * 2500)}원</strong>.
            객단가 효과: 10,200원 → 약 <strong>{fmt(Math.round(calc.totalRevenue / calc.monthlyOrders))}원</strong>
          </div>
        </div>
      </SectionCard>

      {/* 07. Pack ratio strategy */}
      <SectionCard num="07" title="포장 비율이 수익을 결정한다" icon={<ArrowDownUp size={16} />} sectionKey="strategy" expanded={expandedSections.strategy} onToggle={toggleSection}>
        <div className="pl-pack-compare">
          {calc.packComparison.map(s => (
            <div key={s.pack} className={`pl-pack-card ${s.pack === packRatio ? 'active' : ''}`}>
              <div className="pl-pack-label">포장 {s.pack}%</div>
              <div className="pl-pack-stat">
                <span>배달비 부담</span>
                <strong style={{ color: 'var(--danger)' }}>{fmtShort(s.delivFee)}원</strong>
              </div>
              <div className="pl-pack-stat">
                <span>세전 이익</span>
                <strong style={{ color: profitColor(s.profit) }}>{fmtShort(s.profit)}원</strong>
              </div>
              {s.pack > 0 && (
                <div className="pl-pack-diff">
                  배달비 -{fmtShort(calc.packComparison[0].delivFee - s.delivFee)}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="pl-note">
          <strong>포장 비율 40%</strong>이면 배달비 부담이 연간 약 <strong>2,200만원</strong> 절감됩니다.
          네이버 스마트플레이스, 당근마켓, 운서역 주변 전단지 등으로 포장 고객을 적극 확보하세요.
          쿠팡이츠 포장은 수수료 0원이라 가장 유리합니다.
        </div>
      </SectionCard>

      {/* 08. Summary */}
      <SectionCard num="08" title="최종 요약" icon={<Percent size={16} />} sectionKey="summary" expanded={expandedSections.summary} onToggle={toggleSection}>
        <div className="pl-summary">
          <div className="pl-summary-condition">
            하루 {dailyOrders}건 · 포장 {packRatio}% · 사이드 {sideRate}% 기준
          </div>
          <div className="pl-summary-label">월 실수령 (세후)</div>
          <div className="pl-summary-value" style={{ color: profitColor(calc.netIncome) }}>
            {fmt(calc.netIncome)}원
          </div>
          <div className="pl-summary-per">
            1인당 <strong style={{ color: profitColor(calc.perPerson) }}>{fmt(calc.perPerson)}원</strong>
          </div>
          <div className="pl-summary-notes">
            <div>• 대출 5천만(2.5%) 이자 월 {fmt(calc.loanInterest)}원 반영 완료</div>
            <div>• 배달 플랫폼 수수료 + 배달비 + 결제수수료 모두 반영</div>
            <div>• 부가세·종합소득세·건강보험·국민연금 반영 (청년감면 미적용)</div>
            <div>• 인건비 미포함 (2인 공동사업자 전제)</div>
            <div>• 대출 원금상환 미포함 (별도 관리 필요)</div>
          </div>
        </div>
      </SectionCard>

      <style>{`
        .pl { max-width: 960px; }
        .page-title { display:flex; align-items:center; gap:10px; font-size:22px; font-weight:800; color:var(--text-dark); margin:0 0 4px; }
        .page-desc { font-size:13px; color:var(--text-light); margin:0; }

        /* Controls */
        .pl-controls {
          background: var(--bg-card); border:1px solid var(--border); border-radius:var(--radius);
          padding:20px; margin-bottom:20px; box-shadow:var(--shadow-sm);
        }
        .pl-controls-title { font-size:13px; font-weight:700; color:var(--primary); margin-bottom:16px; display:flex; align-items:center; gap:6px; }
        .pl-sliders { display:flex; gap:24px; flex-wrap:wrap; }
        .pl-slider-group { flex:1; min-width:200px; }
        .pl-slider-header { display:flex; justify-content:space-between; margin-bottom:8px; }
        .pl-slider-label { font-size:12px; color:var(--text-light); }
        .pl-slider-value { font-size:15px; font-weight:700; }
        .pl-range { width:100%; height:6px; -webkit-appearance:none; appearance:none; border-radius:3px; outline:none; cursor:pointer; }
        .pl-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%; cursor:pointer; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.2); }
        .pl-range.primary { background:linear-gradient(90deg,var(--primary-light),var(--primary-light)); accent-color:var(--primary); }
        .pl-range.primary::-webkit-slider-thumb { background:var(--primary); }
        .pl-range.teal { background:linear-gradient(90deg,var(--teal-light),var(--teal-light)); accent-color:var(--teal); }
        .pl-range.teal::-webkit-slider-thumb { background:var(--teal); }
        .pl-range.warning { background:linear-gradient(90deg,var(--warning-light),var(--warning-light)); accent-color:var(--warning); }
        .pl-range.warning::-webkit-slider-thumb { background:var(--warning); }
        .pl-slider-range { display:flex; justify-content:space-between; font-size:10px; color:var(--text-light); margin-top:4px; }

        /* Metrics */
        .pl-metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; margin-bottom:20px; }
        .pl-metric {
          display:flex; align-items:flex-start; gap:12px; padding:16px;
          background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius);
          box-shadow:var(--shadow-sm); transition:transform 0.15s,box-shadow 0.15s;
        }
        .pl-metric:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
        .pl-metric-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .pl-metric-icon.blue { background:var(--primary-light); color:var(--primary); }
        .pl-metric-icon.green { background:var(--success-light); color:var(--success); }
        .pl-metric-icon.red { background:var(--danger-light); color:var(--danger); }
        .pl-metric-icon.orange { background:var(--warning-light); color:var(--warning); }
        .pl-metric-label { font-size:11px; color:var(--text-light); margin-bottom:2px; }
        .pl-metric-value { font-size:18px; font-weight:800; color:var(--text-dark); }
        .pl-metric-sub { font-size:10px; color:var(--text-light); margin-top:2px; }

        /* Waterfall */
        .pl-waterfall { padding:4px 0; }
        .pl-wf-row { display:flex; align-items:center; gap:10px; padding:6px 0; }
        .pl-wf-label { font-size:12px; color:var(--text); width:60px; flex-shrink:0; }
        .pl-wf-track { flex:1; height:20px; background:var(--border-light); border-radius:4px; overflow:hidden; }
        .pl-wf-bar { height:100%; border-radius:4px; transition:width 0.5s ease; min-width:2px; }
        .pl-wf-bar.revenue { background:linear-gradient(90deg,#22c55e,#4ade80); }
        .pl-wf-bar.cost { background:linear-gradient(90deg,#ef4444,#f87171); }
        .pl-wf-bar.fixed { background:linear-gradient(90deg,#f59e0b,#fbbf24); }
        .pl-wf-bar.tax { background:linear-gradient(90deg,#8b5cf6,#a78bfa); }
        .pl-wf-bar.profit { background:linear-gradient(90deg,#22c55e,#4ade80); }
        .pl-wf-bar.loss { background:linear-gradient(90deg,#ef4444,#f87171); }
        .pl-wf-val { font-size:11px; font-weight:500; color:var(--text); width:120px; text-align:right; flex-shrink:0; }
        .pl-wf-divider { height:2px; background:var(--primary); margin:4px 0; border-radius:1px; }

        /* Section Cards */
        .pl-section { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); margin-bottom:16px; box-shadow:var(--shadow-sm); overflow:hidden; }
        .pl-section-header {
          display:flex; align-items:center; gap:10px; padding:16px 20px; cursor:pointer; user-select:none;
          transition:background 0.15s;
        }
        .pl-section-header:hover { background:var(--border-light); }
        .pl-section-num { font-size:10px; font-weight:800; color:var(--primary); letter-spacing:2px; background:var(--primary-light); padding:2px 8px; border-radius:6px; }
        .pl-section-title { font-size:15px; font-weight:700; color:var(--text-dark); flex:1; display:flex; align-items:center; gap:8px; }
        .pl-section-toggle { color:var(--text-light); }
        .pl-section-body { padding:0 20px 20px; }

        /* Rows */
        .pl-rows { }
        .pl-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; }
        .pl-row.border { border-bottom:1px solid var(--border-light); }
        .pl-row.indent { padding-left:16px; }
        .pl-row-label { font-size:13px; color:var(--text); display:flex; align-items:center; gap:6px; }
        .pl-row-label.bold { font-weight:700; color:var(--text-dark); }
        .pl-row-label.indent { color:var(--text-light); }
        .pl-row-val { font-size:13px; font-weight:500; }
        .pl-row-val.bold { font-weight:800; }
        .pl-divider { height:2px; margin:8px 0; border-radius:1px; }
        .pl-divider.accent { background:var(--primary); }
        .pl-group-label { font-size:11px; color:var(--text-light); padding:12px 0 4px 4px; display:flex; align-items:center; gap:6px; }
        .pl-subtitle { font-size:12px; color:var(--text-light); margin-bottom:12px; }

        /* Platform Cards */
        .pl-platform-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; margin-bottom:12px; }
        .pl-platform-card {
          border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px;
          background:var(--bg); transition:transform 0.15s,box-shadow 0.15s;
        }
        .pl-platform-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
        .pl-pf-header { border-left:3px solid; padding-left:10px; margin-bottom:12px; }
        .pl-pf-name { font-size:14px; font-weight:700; }
        .pl-pf-share { font-size:11px; color:var(--text-light); }
        .pl-pf-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px; }
        .pl-pf-item { display:flex; justify-content:space-between; font-size:11px; padding:4px 0; }
        .pl-pf-item-label { color:var(--text-light); }
        .pl-pf-item-val { font-weight:600; color:var(--text); }
        .pl-pf-totals { display:flex; gap:8px; margin-bottom:8px; }
        .pl-pf-total {
          flex:1; display:flex; align-items:center; gap:4px; font-size:11px;
          background:var(--bg-card); padding:6px 8px; border-radius:6px; color:var(--text-light);
        }
        .pl-pf-total strong { margin-left:auto; }
        .pl-pf-note { font-size:10px; color:var(--text-light); font-style:italic; }

        /* Per-order visual */
        .pl-per-order-visual { margin-bottom:16px; }
        .pl-po-bar-container { display:flex; height:28px; border-radius:6px; overflow:hidden; gap:1px; }
        .pl-po-segment { min-width:2px; transition:flex 0.5s ease; }
        .pl-po-legend { display:flex; gap:16px; margin-top:8px; flex-wrap:wrap; }
        .pl-po-legend-item { font-size:11px; color:var(--text); display:flex; align-items:center; gap:4px; }
        .pl-po-dot { width:8px; height:8px; border-radius:50%; }

        /* BEP */
        .pl-bep-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:16px; }
        .pl-bep-card { background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; text-align:center; }
        .pl-bep-card.highlight { border-color:var(--warning); background:var(--warning-light); }
        .pl-bep-label { font-size:11px; color:var(--text-light); margin-bottom:4px; }
        .pl-bep-value { font-size:20px; font-weight:800; }
        .pl-bep-sub { font-size:10px; color:var(--text-light); margin-top:2px; }
        .pl-bep-gauge { margin-bottom:16px; }
        .pl-bep-gauge-label { display:flex; justify-content:space-between; font-size:10px; color:var(--text-light); margin-bottom:6px; }
        .pl-bep-gauge-track { position:relative; height:12px; background:var(--border-light); border-radius:6px; overflow:visible; }
        .pl-bep-gauge-fill { height:100%; border-radius:6px; transition:width 0.5s ease; }
        .pl-bep-gauge-fill.profit { background:linear-gradient(90deg,#22c55e,#4ade80); }
        .pl-bep-gauge-fill.loss { background:linear-gradient(90deg,#ef4444,#f87171); }
        .pl-bep-gauge-bep { position:absolute; top:-4px; width:2px; height:20px; background:var(--warning); border-radius:1px; transform:translateX(-1px); z-index:1; }
        .pl-bep-gauge-current { font-size:12px; color:var(--text); margin-top:6px; text-align:center; }

        /* Side menu */
        .pl-side-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:10px; margin-bottom:12px; }
        .pl-side-card { border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; background:var(--bg); }
        .pl-side-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .pl-side-name { font-size:13px; font-weight:700; color:var(--text-dark); }
        .pl-side-fit { font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; }
        .pl-side-fit.high { background:var(--success-light); color:var(--success); }
        .pl-side-fit.mid { background:var(--primary-light); color:var(--primary); }
        .pl-side-fit.low { background:var(--warning-light); color:var(--warning); }
        .pl-side-stats { display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:8px; }
        .pl-side-stats > div { display:flex; justify-content:space-between; font-size:11px; }
        .pl-side-stats span { color:var(--text-light); }
        .pl-side-stats strong { color:var(--text-dark); }
        .pl-side-bar-track { height:4px; background:var(--border-light); border-radius:2px; overflow:hidden; margin-bottom:8px; }
        .pl-side-bar-fill { height:100%; background:linear-gradient(90deg,var(--success),#4ade80); border-radius:2px; }
        .pl-side-meta { font-size:10px; color:var(--text-light); display:flex; gap:8px; }

        /* Pack comparison */
        .pl-pack-compare { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:12px; }
        .pl-pack-card { border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; text-align:center; background:var(--bg); transition:all 0.15s; }
        .pl-pack-card.active { border-color:var(--primary); background:var(--primary-light); }
        .pl-pack-label { font-size:12px; font-weight:700; color:var(--text-dark); margin-bottom:8px; }
        .pl-pack-stat { display:flex; justify-content:space-between; font-size:11px; color:var(--text-light); padding:3px 0; }
        .pl-pack-diff { font-size:10px; color:var(--success); margin-top:6px; font-weight:600; }

        /* Summary */
        .pl-summary { text-align:center; padding:16px 0; }
        .pl-summary-condition { font-size:12px; color:var(--text-light); margin-bottom:16px; }
        .pl-summary-label { font-size:12px; color:var(--text-light); }
        .pl-summary-value { font-size:36px; font-weight:900; margin:4px 0; }
        .pl-summary-per { font-size:14px; color:var(--text); margin-bottom:16px; }
        .pl-summary-notes { text-align:left; font-size:12px; color:var(--text-light); line-height:1.8; }

        /* Alerts */
        .pl-alert { display:flex; gap:10px; padding:12px 16px; border-radius:var(--radius-sm); font-size:12px; line-height:1.7; margin-top:12px; }
        .pl-alert.danger { background:var(--danger-light); color:#991b1b; border:1px solid rgba(220,38,38,0.2); }
        .pl-alert.warning { background:var(--warning-light); color:#92400e; border:1px solid rgba(234,88,12,0.2); }
        .pl-alert.info { background:var(--primary-light); color:#1e40af; border:1px solid rgba(37,99,235,0.2); }
        .pl-alert.success { background:var(--success-light); color:#166534; border:1px solid rgba(22,163,74,0.2); }
        .pl-alert strong { font-weight:700; }

        .pl-note { font-size:11px; color:var(--text-light); line-height:1.7; margin-top:12px; padding:10px 12px; background:var(--bg); border-radius:var(--radius-sm); }
        .pl-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); padding:20px; margin-bottom:16px; box-shadow:var(--shadow-sm); }
        .pl-card-title { font-size:13px; font-weight:700; color:var(--text-dark); margin-bottom:12px; display:flex; align-items:center; gap:6px; }
        .pl-pnl-summary { font-size:12px; color:var(--text-light); margin-bottom:12px; background:var(--bg); padding:8px 12px; border-radius:6px; }

        /* Dark mode adjustments */
        [data-theme="dark"] .pl-alert.danger { background:rgba(220,38,38,0.1); color:#fca5a5; border-color:rgba(220,38,38,0.3); }
        [data-theme="dark"] .pl-alert.warning { background:rgba(234,88,12,0.1); color:#fcd34d; border-color:rgba(234,88,12,0.3); }
        [data-theme="dark"] .pl-alert.info { background:rgba(37,99,235,0.1); color:#93c5fd; border-color:rgba(37,99,235,0.3); }
        [data-theme="dark"] .pl-alert.success { background:rgba(22,163,74,0.1); color:#86efac; border-color:rgba(22,163,74,0.3); }

        @media (max-width:768px) {
          .pl-sliders { flex-direction:column; gap:16px; }
          .pl-metrics { grid-template-columns:1fr 1fr; }
          .pl-platform-cards { grid-template-columns:1fr; }
          .pl-wf-val { width:80px; font-size:10px; }
        }
        @media (max-width:480px) {
          .pl-metrics { grid-template-columns:1fr; }
          .pl-pack-compare { grid-template-columns:1fr 1fr; }
        }
      `}</style>
    </div>
  );
}

/* Sub-components */
function SectionCard({ num, title, icon, sectionKey, expanded, onToggle, children }) {
  return (
    <div className="pl-section">
      <div className="pl-section-header" onClick={() => onToggle(sectionKey)}>
        <span className="pl-section-num">{num}</span>
        <span className="pl-section-title">{icon} {title}</span>
        <span className="pl-section-toggle">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </div>
      {expanded && <div className="pl-section-body">{children}</div>}
    </div>
  );
}

function PlRow({ label, val, color, indent, bold, border, icon }) {
  return (
    <div className={`pl-row${border ? ' border' : ''}${indent ? ' indent' : ''}`}>
      <span className={`pl-row-label${bold ? ' bold' : ''}${indent ? ' indent' : ''}`}>{icon}{label}</span>
      <span className={`pl-row-val${bold ? ' bold' : ''}`} style={{ color: color || 'var(--text)' }}>{val}</span>
    </div>
  );
}
