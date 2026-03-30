import { useState, useMemo } from 'react';
import {
  Lightbulb, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
  Star, DollarSign, Users, Calendar, Zap, Target, ArrowUp, ArrowDown,
  ArrowRight, MessageSquare, ShoppingCart,
} from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const sumObj = (v) => typeof v === 'object' && v !== null ? Object.values(v).reduce((s, x) => s + Number(x || 0), 0) : Number(v || 0);
const pct = (v, total) => total > 0 ? ((v / total) * 100).toFixed(1) : '0.0';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

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
   SMART INSIGHTS — 자동 분석 대시보드
   ================================================================ */
export default function SmartInsights({
  dailyLogs, ledger, menus, reviews, opsData, costData, competitors, weatherLogs, finance,
}) {
  const logs = dailyLogs || [];
  const revs = reviews || [];
  const led = ledger || [];
  const menuList = menus || [];
  const ops = opsData || {};
  const comps = competitors || [];
  const wLogs = weatherLogs || [];

  /* ── Derived data ── */
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthYM = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayLog = logs.find(l => l.date === yesterdayStr);

  // Last 7 days
  const last7 = logs.filter(l => {
    if (!l.date) return false;
    const d = new Date(l.date);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  // Previous 7 days (8-14 days ago)
  const prev7 = logs.filter(l => {
    if (!l.date) return false;
    const d = new Date(l.date);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff > 7 && diff <= 14;
  });

  // This month's logs
  const thisMonthLogs = logs.filter(l => l.date && l.date.startsWith(currentYM));
  const lastMonthLogs = logs.filter(l => l.date && l.date.startsWith(lastMonthYM));

  // Current and last month ledger
  const thisLedger = led.find(m => m.yearMonth === currentYM);
  const lastLedger = led.find(m => m.yearMonth === lastMonthYM);

  /* ── Section 1: 오늘의 핵심 요약 ── */
  const todaySummary = useMemo(() => {
    const items = [];

    // Yesterday sales
    const sumVal = (obj) => typeof obj === 'object' && obj !== null ? Object.values(obj).reduce((s, v) => s + Number(v || 0), 0) : Number(obj || 0);
    if (yesterdayLog) {
      const yRev = sumVal(yesterdayLog.revenue);
      const yOrders = sumVal(yesterdayLog.orders);
      const prevWeekAvgRev = prev7.length > 0
        ? prev7.reduce((s, l) => s + sumVal(l.revenue), 0) / prev7.length
        : 0;
      const changeRate = prevWeekAvgRev > 0 ? (((yRev - prevWeekAvgRev) / prevWeekAvgRev) * 100).toFixed(1) : null;
      items.push({
        type: changeRate && parseFloat(changeRate) >= 0 ? 'positive' : 'warning',
        icon: DollarSign,
        text: `어제 매출 ${fmt(yRev)}원, 주문 ${fmt(yOrders)}건${changeRate ? ` (전주 대비 ${parseFloat(changeRate) >= 0 ? '+' : ''}${changeRate}%)` : ''}`,
      });
    } else if (logs.length > 0) {
      items.push({
        type: 'info',
        icon: Calendar,
        text: '어제 매출 기록이 없습니다 — 일일 매출을 기록해 주세요',
      });
    }

    // Unreplied reviews
    const unreplied = revs.filter(r => !r.replied);
    if (unreplied.length > 0) {
      items.push({
        type: unreplied.length >= 5 ? 'warning' : 'info',
        icon: MessageSquare,
        text: `미답변 리뷰 ${unreplied.length}건 — 답글 작성이 필요합니다`,
      });
    }

    // Inventory (packaging stock)
    const lowStock = (ops.packagingStock || []).filter(
      item => (item.daysLeft !== undefined && item.daysLeft < 3) || (item.currentQty !== undefined && item.currentQty < 10)
    );
    if (lowStock.length > 0) {
      items.push({
        type: 'warning',
        icon: ShoppingCart,
        text: `포장재/재고 부족 항목: ${lowStock.length}개 — 추가 발주 필요`,
      });
    }

    // Weather correlation
    if (wLogs.length >= 5) {
      const rainyLogs = wLogs.filter(w => w.weather === 'rainy' || w.weather === 'rain');
      const clearLogs = wLogs.filter(w => w.weather === 'sunny' || w.weather === 'clear');
      if (rainyLogs.length >= 2 && clearLogs.length >= 2) {
        const rainyAvgOrders = rainyLogs.reduce((s, w) => s + (w.orders || 0), 0) / rainyLogs.length;
        const clearAvgOrders = clearLogs.reduce((s, w) => s + (w.orders || 0), 0) / clearLogs.length;
        if (rainyAvgOrders > clearAvgOrders) {
          items.push({
            type: 'positive',
            icon: TrendingUp,
            text: `비 오는 날 주문이 평균 ${((rainyAvgOrders - clearAvgOrders) / clearAvgOrders * 100).toFixed(0)}% 더 많습니다`,
          });
        }
      }
    }

    // Profit trend
    if (thisMonthLogs.length >= 3) {
      const firstHalf = thisMonthLogs.slice(0, Math.floor(thisMonthLogs.length / 2));
      const secondHalf = thisMonthLogs.slice(Math.floor(thisMonthLogs.length / 2));
      const firstAvg = firstHalf.reduce((s, l) => s + (sumObj(l.revenue)), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, l) => s + (sumObj(l.revenue)), 0) / secondHalf.length;
      const trend = secondAvg > firstAvg * 1.05 ? '상승' : secondAvg < firstAvg * 0.95 ? '하락' : '유지';
      const trendIcon = trend === '상승' ? TrendingUp : trend === '하락' ? TrendingDown : Minus;
      items.push({
        type: trend === '상승' ? 'positive' : trend === '하락' ? 'warning' : 'info',
        icon: trendIcon,
        text: `이번 달 매출 추이: ${trend}`,
      });
    }

    // If no items, add a default
    if (items.length === 0) {
      items.push({
        type: 'info',
        icon: Lightbulb,
        text: '데이터가 쌓이면 자동 분석이 제공됩니다. 일일 매출, 리뷰를 기록해 보세요!',
      });
    }

    return items;
  }, [yesterdayLog, logs, revs, ops, wLogs, thisMonthLogs, prev7]);

  /* ── Section 2: 매출 인사이트 ── */
  const salesInsights = useMemo(() => {
    const insights = [];

    // Best day of week
    if (logs.length >= 7) {
      const dayTotals = {};
      const dayCounts = {};
      logs.forEach(l => {
        if (!l.date) return;
        const day = new Date(l.date).getDay();
        dayTotals[day] = (dayTotals[day] || 0) + (sumObj(l.revenue));
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      let bestDay = 0, bestAvg = 0;
      Object.entries(dayTotals).forEach(([day, total]) => {
        const avg = total / (dayCounts[day] || 1);
        if (avg > bestAvg) { bestAvg = avg; bestDay = parseInt(day); }
      });
      insights.push({
        label: '최고 매출 요일',
        value: `${DAY_NAMES[bestDay]}요일`,
        detail: `평균 ${fmt(Math.round(bestAvg))}원`,
        type: 'positive',
      });
    }

    // Best platform by revenue
    if (thisLedger) {
      const rev = thisLedger.revenue || {};
      let bestPlat = '', bestRev = 0;
      Object.entries(rev).forEach(([k, v]) => {
        if (v > bestRev) { bestRev = v; bestPlat = k; }
      });
      if (bestPlat && bestRev > 0) {
        insights.push({
          label: '최고 매출 플랫폼',
          value: revenueLabels[bestPlat] || bestPlat,
          detail: `${fmt(bestRev)}원`,
          type: 'info',
        });
      }
    }

    // Average order value trend
    if (last7.length >= 3 && prev7.length >= 3) {
      const recentAOV = last7.reduce((s, l) => {
        const rev = sumObj(l.revenue);
        const ord = sumObj(l.orders) || 1;
        return s + (rev / ord);
      }, 0) / last7.length;
      const prevAOV = prev7.reduce((s, l) => {
        const rev = sumObj(l.revenue);
        const ord = sumObj(l.orders) || 1;
        return s + (rev / ord);
      }, 0) / prev7.length;
      const aovChange = prevAOV > 0 ? ((recentAOV - prevAOV) / prevAOV * 100).toFixed(1) : 0;
      insights.push({
        label: '객단가 추이',
        value: `${fmt(Math.round(recentAOV))}원`,
        detail: `전주 대비 ${parseFloat(aovChange) >= 0 ? '+' : ''}${aovChange}%`,
        type: parseFloat(aovChange) >= 0 ? 'positive' : 'warning',
      });

      // 500 won increase calculation
      const thisMonthOrders = thisMonthLogs.reduce((s, l) => s + (sumObj(l.orders)), 0);
      const projectedMonthlyOrders = thisMonthLogs.length > 0
        ? Math.round(thisMonthOrders / thisMonthLogs.length * 30)
        : 0;
      if (projectedMonthlyOrders > 0) {
        const extraRevenue = projectedMonthlyOrders * 500;
        insights.push({
          label: '객단가 +500원 시',
          value: `월 +${fmt(extraRevenue)}원`,
          detail: `예상 월 주문 ${fmt(projectedMonthlyOrders)}건 기준`,
          type: 'info',
        });
      }
    }

    // Revenue vs last month
    if (thisLedger && lastLedger) {
      const thisRev = Object.values(thisLedger.revenue || {}).reduce((s, v) => s + v, 0);
      const lastRev = Object.values(lastLedger.revenue || {}).reduce((s, v) => s + v, 0);
      if (lastRev > 0) {
        const change = ((thisRev - lastRev) / lastRev * 100).toFixed(1);
        insights.push({
          label: '전월 대비 매출',
          value: `${parseFloat(change) >= 0 ? '+' : ''}${change}%`,
          detail: `이번 달 ${fmt(thisRev)}원 / 지난 달 ${fmt(lastRev)}원`,
          type: parseFloat(change) >= 0 ? 'positive' : 'warning',
        });
      }
    }

    return insights;
  }, [logs, last7, prev7, thisLedger, lastLedger, thisMonthLogs]);

  /* ── Section 3: 비용 인사이트 ── */
  const costInsights = useMemo(() => {
    const insights = [];

    if (thisLedger) {
      const expense = thisLedger.expense || {};
      const revenue = Object.values(thisLedger.revenue || {}).reduce((s, v) => s + v, 0);
      const totalExpense = Object.values(expense).reduce((s, v) => s + v, 0);

      // Highest cost category
      let maxCat = '', maxVal = 0;
      Object.entries(expense).forEach(([k, v]) => {
        if (v > maxVal) { maxVal = v; maxCat = k; }
      });
      if (maxCat && maxVal > 0) {
        insights.push({
          label: '최대 지출 항목',
          value: expenseLabels[maxCat] || maxCat,
          detail: `${fmt(maxVal)}원 (전체 지출의 ${pct(maxVal, totalExpense)}%)`,
          type: 'info',
        });
      }

      // Ingredient cost rate
      const ingredientCost = expense.ingredients || 0;
      if (revenue > 0 && ingredientCost > 0) {
        const rate = (ingredientCost / revenue * 100).toFixed(1);
        const target = 32;
        const status = parseFloat(rate) <= target ? '양호' : parseFloat(rate) <= 38 ? '주의' : '초과';
        insights.push({
          label: '식재료 비율',
          value: `${rate}%`,
          detail: `식재료비가 매출의 ${rate}%입니다 — 목표 ${target}% 대비 ${status}`,
          type: status === '양호' ? 'positive' : status === '주의' ? 'warning' : 'danger',
        });
      }

      // Rent rate
      const rent = expense.rent || 0;
      if (revenue > 0 && rent > 0) {
        const rentRate = (rent / revenue * 100).toFixed(1);
        const healthy = parseFloat(rentRate) <= 10;
        insights.push({
          label: '월세 비율',
          value: `${rentRate}%`,
          detail: `월세가 매출의 ${rentRate}%입니다 — 10% 이하가 건강한 수준`,
          type: healthy ? 'positive' : 'warning',
        });
      }

      // Cost rate trend
      if (lastLedger) {
        const lastExpense = Object.values(lastLedger.expense || {}).reduce((s, v) => s + v, 0);
        const lastRevenue = Object.values(lastLedger.revenue || {}).reduce((s, v) => s + v, 0);
        if (lastRevenue > 0 && revenue > 0) {
          const thisCostRate = totalExpense / revenue * 100;
          const lastCostRate = lastExpense / lastRevenue * 100;
          const diff = thisCostRate - lastCostRate;
          insights.push({
            label: '원가율 변화',
            value: `${thisCostRate.toFixed(1)}%`,
            detail: `전월 ${lastCostRate.toFixed(1)}% → 이번 달 ${thisCostRate.toFixed(1)}% (${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%p)`,
            type: diff <= 0 ? 'positive' : 'warning',
          });
        }
      }
    }

    // Waste rate
    const wasteLogs = ops.wasteLogs || [];
    const thisMonthWaste = wasteLogs.filter(w => w.date && w.date.startsWith(currentYM));
    if (thisMonthWaste.length > 0) {
      const totalWaste = thisMonthWaste.reduce((s, w) => s + (w.cost || w.amount || 0), 0);
      insights.push({
        label: '이번 달 폐기 비용',
        value: `${fmt(totalWaste)}원`,
        detail: `${thisMonthWaste.length}건 폐기 발생`,
        type: totalWaste > 100000 ? 'warning' : 'info',
      });
    }

    return insights;
  }, [thisLedger, lastLedger, ops, currentYM]);

  /* ── Section 4: 고객 인사이트 ── */
  const customerInsights = useMemo(() => {
    const insights = [];

    if (revs.length > 0) {
      // Rating trend
      const recent10 = revs.slice(-10);
      const older10 = revs.slice(-20, -10);
      const recentAvg = recent10.reduce((s, r) => s + (r.rating || 0), 0) / recent10.length;

      if (older10.length >= 5) {
        const olderAvg = older10.reduce((s, r) => s + (r.rating || 0), 0) / older10.length;
        const diff = recentAvg - olderAvg;
        insights.push({
          label: '리뷰 별점 추이',
          value: `${recentAvg.toFixed(1)}점`,
          detail: `이전 ${olderAvg.toFixed(1)}점 → 최근 ${recentAvg.toFixed(1)}점 (${diff >= 0 ? '+' : ''}${diff.toFixed(2)})`,
          type: diff >= 0 ? 'positive' : 'warning',
        });
      } else {
        insights.push({
          label: '평균 별점',
          value: `${recentAvg.toFixed(1)}점`,
          detail: `최근 ${recent10.length}건 기준`,
          type: recentAvg >= 4.0 ? 'positive' : recentAvg >= 3.0 ? 'warning' : 'danger',
        });
      }

      // Keyword analysis
      const posKeywords = {};
      const negKeywords = {};
      revs.forEach(r => {
        const words = r.keywords || r.tags || [];
        const sentiment = (r.rating || 0) >= 4 ? 'pos' : (r.rating || 0) <= 2 ? 'neg' : null;
        if (sentiment === 'pos') {
          words.forEach(w => { posKeywords[w] = (posKeywords[w] || 0) + 1; });
        } else if (sentiment === 'neg') {
          words.forEach(w => { negKeywords[w] = (negKeywords[w] || 0) + 1; });
        }
      });

      // Also check comment text for common words
      const posComments = revs.filter(r => (r.rating || 0) >= 4 && r.customerComment);
      const negComments = revs.filter(r => (r.rating || 0) <= 2 && r.customerComment);

      const positiveWords = ['맛있', '친절', '빠른', '깔끔', '신선', '양많', '추천', '최고', '좋은', '만족'];
      const negativeWords = ['늦은', '불친절', '차가운', '적은', '짠', '비싼', '느린', '별로', '실망', '미흡'];

      const posWordCounts = {};
      positiveWords.forEach(w => {
        const count = posComments.filter(r => r.customerComment.includes(w)).length;
        if (count > 0) posWordCounts[w] = count;
      });

      const negWordCounts = {};
      negativeWords.forEach(w => {
        const count = negComments.filter(r => r.customerComment.includes(w)).length;
        if (count > 0) negWordCounts[w] = count;
      });

      // Most mentioned positive
      const allPosKw = { ...posKeywords };
      Object.entries(posWordCounts).forEach(([k, v]) => { allPosKw[k] = (allPosKw[k] || 0) + v; });
      const topPos = Object.entries(allPosKw).sort((a, b) => b[1] - a[1])[0];
      if (topPos) {
        insights.push({
          label: '긍정 키워드 1위',
          value: `"${topPos[0]}"`,
          detail: `${topPos[1]}회 언급됨`,
          type: 'positive',
        });
      }

      // Most mentioned negative
      const allNegKw = { ...negKeywords };
      Object.entries(negWordCounts).forEach(([k, v]) => { allNegKw[k] = (allNegKw[k] || 0) + v; });
      const topNeg = Object.entries(allNegKw).sort((a, b) => b[1] - a[1])[0];
      if (topNeg) {
        insights.push({
          label: '부정 키워드 1위',
          value: `"${topNeg[0]}"`,
          detail: `개선 필요: ${topNeg[0]} (${topNeg[1]}회 언급)`,
          type: 'warning',
        });
      }
    }

    // Competitor comparison
    if (comps.length > 0 && revs.length > 0) {
      const compAvg = comps.reduce((s, c) => s + (c.rating || c.avgRating || 0), 0) / comps.length;
      const ourAvg = revs.reduce((s, r) => s + (r.rating || 0), 0) / revs.length;
      if (compAvg > 0) {
        insights.push({
          label: '경쟁사 비교',
          value: `${ourAvg.toFixed(1)} vs ${compAvg.toFixed(1)}`,
          detail: `경쟁사 평균 별점 ${compAvg.toFixed(1)} vs 우리 ${ourAvg.toFixed(1)}`,
          type: ourAvg >= compAvg ? 'positive' : 'warning',
        });
      }
    }

    return insights;
  }, [revs, comps]);

  /* ── Section 5: 이번 주 액션 추천 ── */
  const actions = useMemo(() => {
    const items = [];

    // Low rating → review event
    if (revs.length >= 5) {
      const recentAvg = revs.slice(-10).reduce((s, r) => s + (r.rating || 0), 0) / Math.min(revs.length, 10);
      if (recentAvg < 4.0) {
        items.push({
          title: '리뷰 이벤트 진행',
          reason: `최근 평균 별점 ${recentAvg.toFixed(1)}점으로 개선이 필요합니다`,
          impact: '별점 0.3~0.5점 상승 기대',
          difficulty: '쉬움',
        });
      }
    }

    // Unreplied reviews
    const unreplied = revs.filter(r => !r.replied);
    if (unreplied.length >= 3) {
      items.push({
        title: '미답변 리뷰 답글 작성',
        reason: `${unreplied.length}건의 리뷰에 답글이 없습니다`,
        impact: '고객 재주문율 15~20% 향상',
        difficulty: '쉬움',
      });
    }

    // Weather-based
    if (wLogs.length >= 3) {
      const rainyLogs = wLogs.filter(w => w.weather === 'rainy' || w.weather === 'rain');
      if (rainyLogs.length > 0) {
        const avgOrders = rainyLogs.reduce((s, w) => s + (w.orders || 0), 0) / rainyLogs.length;
        if (avgOrders > 0) {
          items.push({
            title: '비 오는 날 대비 식재료 추가 발주',
            reason: '비 오는 날 주문량이 증가하는 패턴이 확인됨',
            impact: '품절 방지 및 매출 극대화',
            difficulty: '쉬움',
          });
        }
      }
    }

    // Growing orders → consider adding flags
    if (last7.length >= 3 && prev7.length >= 3) {
      const recentDailyOrders = last7.reduce((s, l) => s + (sumObj(l.orders)), 0) / last7.length;
      const prevDailyOrders = prev7.reduce((s, l) => s + (sumObj(l.orders)), 0) / prev7.length;
      if (recentDailyOrders > prevDailyOrders * 1.1) {
        items.push({
          title: '배민 깃발 추가 검토',
          reason: `주문이 전주 대비 ${((recentDailyOrders - prevDailyOrders) / prevDailyOrders * 100).toFixed(0)}% 증가`,
          impact: '노출 확대로 월 10~20% 추가 주문 기대',
          difficulty: '보통',
        });
      }
    }

    // High cost rate
    if (thisLedger) {
      const rev = Object.values(thisLedger.revenue || {}).reduce((s, v) => s + v, 0);
      const exp = Object.values(thisLedger.expense || {}).reduce((s, v) => s + v, 0);
      if (rev > 0) {
        const costRate = exp / rev * 100;
        if (costRate > 70) {
          items.push({
            title: '원가 구조 재점검',
            reason: `원가율 ${costRate.toFixed(1)}%로 목표(65%) 초과`,
            impact: '5%p 개선 시 월 순이익 증가',
            difficulty: '보통',
          });
        }
      }
    }

    // Low stock
    const lowStockItems = (ops.packagingStock || []).filter(
      item => (item.daysLeft !== undefined && item.daysLeft < 3) || (item.currentQty !== undefined && item.currentQty < 10)
    );
    if (lowStockItems.length > 0) {
      items.push({
        title: '포장재 긴급 발주',
        reason: `${lowStockItems.length}개 품목의 재고가 부족합니다`,
        impact: '영업 중단 방지',
        difficulty: '쉬움',
      });
    }

    // Default if no actions
    if (items.length === 0) {
      items.push({
        title: '데이터 입력 시작하기',
        reason: '분석을 위해 일일 매출, 리뷰 등의 데이터가 필요합니다',
        impact: '데이터 기반 의사결정 가능',
        difficulty: '쉬움',
      });
    }

    return items.slice(0, 3);
  }, [revs, wLogs, last7, prev7, thisLedger, ops]);

  /* ── Section 6: 주간/월간 트렌드 ── */
  const trends = useMemo(() => {
    const items = [];

    // Daily orders
    if (last7.length >= 2 && prev7.length >= 2) {
      const recentAvg = last7.reduce((s, l) => s + (sumObj(l.orders)), 0) / last7.length;
      const prevAvg = prev7.reduce((s, l) => s + (sumObj(l.orders)), 0) / prev7.length;
      const diff = prevAvg > 0 ? ((recentAvg - prevAvg) / prevAvg * 100).toFixed(1) : '0.0';
      items.push({
        label: '일평균 주문',
        value: `${recentAvg.toFixed(0)}건`,
        change: parseFloat(diff),
        changeText: `${parseFloat(diff) >= 0 ? '+' : ''}${diff}%`,
      });
    }

    // Average order value
    if (last7.length >= 2 && prev7.length >= 2) {
      const recentAOV = last7.reduce((s, l) => {
        const rev = sumObj(l.revenue);
        const ord = sumObj(l.orders) || 1;
        return s + (rev / ord);
      }, 0) / last7.length;
      const prevAOV = prev7.reduce((s, l) => {
        const rev = sumObj(l.revenue);
        const ord = sumObj(l.orders) || 1;
        return s + (rev / ord);
      }, 0) / prev7.length;
      const diff = prevAOV > 0 ? ((recentAOV - prevAOV) / prevAOV * 100).toFixed(1) : '0.0';
      items.push({
        label: '평균 객단가',
        value: `${fmt(Math.round(recentAOV))}원`,
        change: parseFloat(diff),
        changeText: `${parseFloat(diff) >= 0 ? '+' : ''}${diff}%`,
      });
    }

    // Average rating
    if (revs.length >= 5) {
      const recent = revs.slice(-10);
      const older = revs.slice(-20, -10);
      const recentAvg = recent.reduce((s, r) => s + (r.rating || 0), 0) / recent.length;
      if (older.length >= 3) {
        const olderAvg = older.reduce((s, r) => s + (r.rating || 0), 0) / older.length;
        const diff = recentAvg - olderAvg;
        items.push({
          label: '평균 별점',
          value: `${recentAvg.toFixed(1)}점`,
          change: diff,
          changeText: `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`,
        });
      } else {
        items.push({
          label: '평균 별점',
          value: `${recentAvg.toFixed(1)}점`,
          change: 0,
          changeText: '-',
        });
      }
    }

    // Cost rate
    if (thisLedger) {
      const rev = Object.values(thisLedger.revenue || {}).reduce((s, v) => s + v, 0);
      const exp = Object.values(thisLedger.expense || {}).reduce((s, v) => s + v, 0);
      const costRate = rev > 0 ? exp / rev * 100 : 0;

      let prevCostRate = 0;
      if (lastLedger) {
        const pRev = Object.values(lastLedger.revenue || {}).reduce((s, v) => s + v, 0);
        const pExp = Object.values(lastLedger.expense || {}).reduce((s, v) => s + v, 0);
        prevCostRate = pRev > 0 ? pExp / pRev * 100 : 0;
      }
      const diff = costRate - prevCostRate;
      items.push({
        label: '원가율',
        value: `${costRate.toFixed(1)}%`,
        change: -diff, // inverted: lower cost rate is better
        changeText: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%p`,
      });
    }

    // Net profit margin
    if (thisLedger) {
      const rev = Object.values(thisLedger.revenue || {}).reduce((s, v) => s + v, 0);
      const exp = Object.values(thisLedger.expense || {}).reduce((s, v) => s + v, 0);
      const margin = rev > 0 ? ((rev - exp) / rev * 100) : 0;

      let prevMargin = 0;
      if (lastLedger) {
        const pRev = Object.values(lastLedger.revenue || {}).reduce((s, v) => s + v, 0);
        const pExp = Object.values(lastLedger.expense || {}).reduce((s, v) => s + v, 0);
        prevMargin = pRev > 0 ? ((pRev - pExp) / pRev * 100) : 0;
      }
      const diff = margin - prevMargin;
      items.push({
        label: '순이익률',
        value: `${margin.toFixed(1)}%`,
        change: diff,
        changeText: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%p`,
      });
    }

    return items;
  }, [last7, prev7, revs, thisLedger, lastLedger]);

  /* ── Render helpers ── */
  const summaryTypeConfig = {
    positive: { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
    warning: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
    danger: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    info: { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' },
  };

  const insightTypeConfig = {
    positive: { bg: '#dcfce7', color: '#16a34a', accent: '#22c55e' },
    warning: { bg: '#fff7ed', color: '#ea580c', accent: '#f97316' },
    danger: { bg: '#fef2f2', color: '#dc2626', accent: '#ef4444' },
    info: { bg: '#dbeafe', color: '#2563eb', accent: '#3b82f6' },
  };

  const difficultyColors = {
    '쉬움': { bg: '#dcfce7', color: '#16a34a' },
    '보통': { bg: '#fff7ed', color: '#ea580c' },
    '어려움': { bg: '#fef2f2', color: '#dc2626' },
  };

  return (
    <div className="si">
      <div className="si-page-header">
        <h1><Lightbulb size={28} style={{ color: 'var(--primary)' }} /> 스마트 인사이트</h1>
        <p>데이터 기반 자동 분석 및 액션 추천</p>
      </div>

      {/* Section 1: 오늘의 핵심 요약 */}
      <section className="si-section">
        <h2 className="si-section-title"><Zap size={18} /> 오늘의 핵심 요약</h2>
        <div className="si-summary-grid">
          {todaySummary.map((item, i) => {
            const cfg = summaryTypeConfig[item.type] || summaryTypeConfig.info;
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="si-summary-card"
                style={{ background: cfg.bg, borderColor: cfg.border }}
              >
                <div className="si-summary-icon" style={{ color: cfg.color }}>
                  <Icon size={20} />
                </div>
                <p className="si-summary-text" style={{ color: cfg.color }}>{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: 매출 인사이트 */}
      {salesInsights.length > 0 && (
        <section className="si-section">
          <h2 className="si-section-title"><DollarSign size={18} /> 매출 인사이트</h2>
          <div className="si-insight-grid">
            {salesInsights.map((ins, i) => {
              const cfg = insightTypeConfig[ins.type] || insightTypeConfig.info;
              return (
                <div key={i} className="si-insight-card" style={{ borderLeftColor: cfg.accent }}>
                  <div className="si-insight-label">{ins.label}</div>
                  <div className="si-insight-value" style={{ color: cfg.color }}>{ins.value}</div>
                  <div className="si-insight-detail">{ins.detail}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 3: 비용 인사이트 */}
      {costInsights.length > 0 && (
        <section className="si-section">
          <h2 className="si-section-title"><Target size={18} /> 비용 인사이트</h2>
          <div className="si-insight-grid">
            {costInsights.map((ins, i) => {
              const cfg = insightTypeConfig[ins.type] || insightTypeConfig.info;
              return (
                <div key={i} className="si-insight-card" style={{ borderLeftColor: cfg.accent }}>
                  <div className="si-insight-label">{ins.label}</div>
                  <div className="si-insight-value" style={{ color: cfg.color }}>{ins.value}</div>
                  <div className="si-insight-detail">{ins.detail}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 4: 고객 인사이트 */}
      {customerInsights.length > 0 && (
        <section className="si-section">
          <h2 className="si-section-title"><Users size={18} /> 고객 인사이트</h2>
          <div className="si-insight-grid">
            {customerInsights.map((ins, i) => {
              const cfg = insightTypeConfig[ins.type] || insightTypeConfig.info;
              return (
                <div key={i} className="si-insight-card" style={{ borderLeftColor: cfg.accent }}>
                  <div className="si-insight-label">{ins.label}</div>
                  <div className="si-insight-value" style={{ color: cfg.color }}>{ins.value}</div>
                  <div className="si-insight-detail">{ins.detail}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 5: 이번 주 액션 추천 */}
      <section className="si-section">
        <h2 className="si-section-title"><CheckCircle2 size={18} /> 이번 주 액션 추천</h2>
        <div className="si-actions-list">
          {actions.map((action, i) => {
            const dc = difficultyColors[action.difficulty] || difficultyColors['보통'];
            return (
              <div key={i} className="si-action-card">
                <div className="si-action-rank">{i + 1}</div>
                <div className="si-action-body">
                  <div className="si-action-header">
                    <h4 className="si-action-title">{action.title}</h4>
                    <span
                      className="si-action-difficulty"
                      style={{ background: dc.bg, color: dc.color }}
                    >
                      {action.difficulty}
                    </span>
                  </div>
                  <p className="si-action-reason">{action.reason}</p>
                  <p className="si-action-impact">
                    <TrendingUp size={12} /> 기대 효과: {action.impact}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 6: 주간/월간 트렌드 */}
      {trends.length > 0 && (
        <section className="si-section">
          <h2 className="si-section-title"><TrendingUp size={18} /> 주간/월간 트렌드</h2>
          <div className="si-trend-grid">
            {trends.map((t, i) => {
              const isUp = t.change > 0.01;
              const isDown = t.change < -0.01;
              const TrendIcon = isUp ? ArrowUp : isDown ? ArrowDown : ArrowRight;
              const trendColor = isUp ? '#16a34a' : isDown ? '#dc2626' : '#6b7280';
              const trendBg = isUp ? '#dcfce7' : isDown ? '#fef2f2' : '#f1f5f9';
              return (
                <div key={i} className="si-trend-card">
                  <div className="si-trend-label">{t.label}</div>
                  <div className="si-trend-value">{t.value}</div>
                  <div className="si-trend-change" style={{ color: trendColor, background: trendBg }}>
                    <TrendIcon size={14} /> {t.changeText}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <style>{siCSS}</style>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const siCSS = `
  .si { max-width: 1200px; }
  .si-page-header { margin-bottom: 28px; }
  .si-page-header h1 {
    font-size: 28px; font-weight: 700; color: var(--text-dark);
    margin-bottom: 4px; display: flex; align-items: center; gap: 10px;
  }
  .si-page-header p { color: var(--text-light); font-size: 14px; }

  /* Section */
  .si-section { margin-bottom: 28px; }
  .si-section-title {
    font-size: 17px; font-weight: 700; color: var(--text-dark);
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
    padding-bottom: 10px; border-bottom: 2px solid var(--border-light);
  }

  /* Summary cards */
  .si-summary-grid { display: flex; flex-direction: column; gap: 10px; }
  .si-summary-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; border-radius: var(--radius);
    border: 1px solid; transition: transform 0.15s;
  }
  .si-summary-card:hover { transform: translateX(4px); }
  .si-summary-icon { flex-shrink: 0; }
  .si-summary-text { font-size: 14px; font-weight: 500; line-height: 1.5; }

  /* Insight cards grid */
  .si-insight-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;
  }
  .si-insight-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-left: 4px solid var(--primary);
    border-radius: var(--radius); padding: 18px 20px;
    box-shadow: var(--shadow-sm); transition: transform 0.15s, box-shadow 0.15s;
  }
  .si-insight-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .si-insight-label { font-size: 12px; color: var(--text-light); font-weight: 500; margin-bottom: 6px; }
  .si-insight-value { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
  .si-insight-detail { font-size: 12px; color: var(--text); line-height: 1.5; }

  /* Actions */
  .si-actions-list { display: flex; flex-direction: column; gap: 12px; }
  .si-action-card {
    display: flex; gap: 16px; padding: 18px 20px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow-sm);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .si-action-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .si-action-rank {
    flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%;
    background: var(--primary); color: #fff; font-size: 16px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .si-action-body { flex: 1; }
  .si-action-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
  .si-action-title { font-size: 15px; font-weight: 600; color: var(--text-dark); }
  .si-action-difficulty {
    font-size: 11px; font-weight: 600; padding: 2px 10px;
    border-radius: 20px;
  }
  .si-action-reason { font-size: 13px; color: var(--text); margin-bottom: 6px; line-height: 1.5; }
  .si-action-impact {
    font-size: 12px; color: var(--primary); font-weight: 500;
    display: flex; align-items: center; gap: 4px;
  }

  /* Trends */
  .si-trend-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;
  }
  .si-trend-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 18px 20px; text-align: center;
    box-shadow: var(--shadow-sm); transition: transform 0.15s;
  }
  .si-trend-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .si-trend-label { font-size: 12px; color: var(--text-light); font-weight: 500; margin-bottom: 8px; }
  .si-trend-value { font-size: 22px; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; }
  .si-trend-change {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 13px; font-weight: 600; padding: 4px 12px;
    border-radius: 20px;
  }

  @media (max-width: 768px) {
    .si-insight-grid { grid-template-columns: 1fr; }
    .si-trend-grid { grid-template-columns: 1fr 1fr; }
    .si-action-card { flex-direction: column; align-items: flex-start; gap: 10px; }
  }
`;
