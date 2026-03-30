import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans KR',sans-serif; color:#1e293b; font-size:11px; line-height:1.6; padding:0; }
  .page { padding:40px 50px; page-break-after:always; min-height:100%; }
  .page:last-child { page-break-after:avoid; }

  /* Cover */
  .cover { display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:linear-gradient(160deg,#1e3a5f 0%,#2563eb 100%); color:#fff; text-align:center; }
  .cover h1 { font-size:36px; font-weight:800; margin-bottom:8px; }
  .cover h2 { font-size:20px; font-weight:400; opacity:0.9; margin-bottom:40px; }
  .cover .meta { font-size:13px; opacity:0.7; line-height:2; }
  .cover .logo { font-size:64px; margin-bottom:24px; }

  /* Headers */
  h2 { font-size:18px; font-weight:700; color:#1e293b; margin:24px 0 12px; padding-bottom:6px; border-bottom:2px solid #2563eb; }
  h3 { font-size:14px; font-weight:600; color:#334155; margin:16px 0 8px; }
  h4 { font-size:12px; font-weight:600; color:#475569; margin:12px 0 6px; }

  /* Tables */
  table { width:100%; border-collapse:collapse; margin:8px 0 16px; font-size:10.5px; }
  th { background:#f1f5f9; color:#475569; font-weight:600; padding:7px 8px; text-align:left; border-bottom:2px solid #e2e8f0; }
  td { padding:6px 8px; border-bottom:1px solid #f1f5f9; }
  .r { text-align:right; font-variant-numeric:tabular-nums; }
  .bold { font-weight:700; }
  .total-row td { border-top:2px solid #e2e8f0; font-weight:700; font-size:11px; }
  .green { color:#16a34a; }
  .red { color:#dc2626; }
  .orange { color:#ea580c; }
  .blue { color:#2563eb; }

  /* Cards */
  .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:12px 0; }
  .stat-card { border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
  .stat-card .label { font-size:10px; color:#94a3b8; margin-bottom:2px; }
  .stat-card .value { font-size:18px; font-weight:800; color:#1e293b; }
  .stat-card .sub { font-size:9px; color:#94a3b8; margin-top:2px; }
  .stat-card.highlight { background:#eff6ff; border-color:#93c5fd; }
  .stat-card.highlight .value { color:#2563eb; }
  .stat-card.green-bg { background:#f0fdf4; border-color:#86efac; }
  .stat-card.green-bg .value { color:#16a34a; }

  /* Bar charts */
  .bar-row { display:flex; align-items:center; gap:8px; margin:3px 0; }
  .bar-label { width:70px; font-size:10px; text-align:right; color:#64748b; flex-shrink:0; }
  .bar-track { flex:1; height:14px; background:#f1f5f9; border-radius:4px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:4px; }
  .bar-val { width:60px; font-size:10px; font-weight:600; color:#334155; }

  /* Badge */
  .badge { display:inline-block; font-size:9px; font-weight:600; padding:1px 8px; border-radius:10px; }
  .badge-green { background:#dcfce7; color:#16a34a; }
  .badge-red { background:#fef2f2; color:#dc2626; }
  .badge-blue { background:#dbeafe; color:#2563eb; }
  .badge-orange { background:#fff7ed; color:#ea580c; }

  /* Misc */
  p { margin:4px 0; font-size:11px; color:#475569; }
  .note { font-size:9.5px; color:#94a3b8; margin:8px 0; }
  .insight-box { background:#fffbeb; border:1px solid #fbbf24; border-radius:8px; padding:10px 14px; margin:10px 0; font-size:10.5px; color:#92400e; }
  .success-box { background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:10px 14px; margin:10px 0; font-size:10.5px; color:#166534; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .footer { text-align:center; font-size:9px; color:#94a3b8; margin-top:30px; padding-top:10px; border-top:1px solid #e2e8f0; }
</style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="cover">
  <div class="logo">🍚</div>
  <h1>운서동 덮밥&볶음밥</h1>
  <h2>1개월차 운영 보고서</h2>
  <div class="meta">
    보고 기간: 2026년 4월 27일 ~ 5월 26일 (30일)<br>
    위치: 인천 중구 영종도 운서역 인근<br>
    업종: 배달/포장 전문 덮밥·볶음밥<br>
    작성일: 2026년 5월 27일
  </div>
</div>

<!-- PAGE 2: 핵심 요약 -->
<div class="page">
  <h2>1. 핵심 성과 요약</h2>

  <div class="stat-grid">
    <div class="stat-card highlight">
      <div class="label">총 매출</div>
      <div class="value">9,509,500원</div>
      <div class="sub">일평균 316,983원</div>
    </div>
    <div class="stat-card">
      <div class="label">총 주문</div>
      <div class="value">923건</div>
      <div class="sub">일평균 30.8건</div>
    </div>
    <div class="stat-card">
      <div class="label">평균 객단가</div>
      <div class="value">10,303원</div>
      <div class="sub">목표 12,000원 대비 86%</div>
    </div>
    <div class="stat-card green-bg">
      <div class="label">예상 월 순이익</div>
      <div class="value">+2,288,000원</div>
      <div class="sub">순이익률 약 24%</div>
    </div>
  </div>

  <div class="success-box">
    <strong>✅ 1개월 차 평가:</strong> 일평균 30.8건으로 손익분기점(약 25건)을 안정적으로 초과했습니다. 후반 2주에는 일 35건 이상이 일상화되며 성장세가 뚜렷합니다.
  </div>

  <h3>주차별 성장 추이</h3>
  <table>
    <thead><tr><th>주차</th><th>기간</th><th class="r">총주문</th><th class="r">일평균</th><th class="r">총매출</th><th class="r">일평균매출</th><th>비고</th></tr></thead>
    <tbody>
      <tr><td>1주</td><td>4/27~5/3</td><td class="r">181건</td><td class="r">25.9건</td><td class="r">1,869,000원</td><td class="r">267,000원</td><td>오픈 + 학습곡선</td></tr>
      <tr><td>2주</td><td>5/4~5/10</td><td class="r">214건</td><td class="r">30.6건</td><td class="r">2,196,500원</td><td class="r">313,800원</td><td>어린이날 연휴 효과</td></tr>
      <tr><td>3주</td><td>5/11~5/17</td><td class="r">223건</td><td class="r">31.9건</td><td class="r">2,295,000원</td><td class="r">327,900원</td><td>맘카페+비 올 때 급증</td></tr>
      <tr><td>4주</td><td>5/18~5/24</td><td class="r">238건</td><td class="r bold blue">34.0건</td><td class="r">2,459,000원</td><td class="r bold blue">351,300원</td><td>40건대 첫 진입!</td></tr>
      <tr><td>5/25~26</td><td>마무리</td><td class="r">67건</td><td class="r">33.5건</td><td class="r">690,000원</td><td class="r">345,000원</td><td>안정적</td></tr>
      <tr class="total-row"><td colspan="2">합계/평균</td><td class="r">923건</td><td class="r bold">30.8건</td><td class="r">9,509,500원</td><td class="r bold">316,983원</td><td></td></tr>
    </tbody>
  </table>

  <h3>성장 시각화 (주간 일평균 주문)</h3>
  <div class="bar-row"><div class="bar-label">1주차</div><div class="bar-track"><div class="bar-fill" style="width:64%;background:#93c5fd"></div></div><div class="bar-val">25.9건</div></div>
  <div class="bar-row"><div class="bar-label">2주차</div><div class="bar-track"><div class="bar-fill" style="width:76%;background:#60a5fa"></div></div><div class="bar-val">30.6건</div></div>
  <div class="bar-row"><div class="bar-label">3주차</div><div class="bar-track"><div class="bar-fill" style="width:79%;background:#3b82f6"></div></div><div class="bar-val">31.9건</div></div>
  <div class="bar-row"><div class="bar-label">4주차</div><div class="bar-track"><div class="bar-fill" style="width:85%;background:#2563eb"></div></div><div class="bar-val bold blue">34.0건</div></div>

  <div class="footer">운서동 덮밥&볶음밥 — 1개월차 운영 보고서 | p.1</div>
</div>

<!-- PAGE 3: 매출 분석 -->
<div class="page">
  <h2>2. 매출 상세 분석</h2>

  <h3>플랫폼별 성과</h3>
  <table>
    <thead><tr><th>플랫폼</th><th class="r">주문</th><th class="r">비중</th><th class="r">매출</th><th class="r">객단가</th><th>비고</th></tr></thead>
    <tbody>
      <tr><td><span class="badge badge-blue">배달의민족</span></td><td class="r bold">507건</td><td class="r bold">55%</td><td class="r">5,244,000원</td><td class="r">10,343원</td><td>주력 채널, 시장 1위</td></tr>
      <tr><td><span class="badge badge-red">쿠팡이츠</span></td><td class="r">205건</td><td class="r">22%</td><td class="r">2,129,500원</td><td class="r">10,388원</td><td>포장 수수료 0% 유도 효과</td></tr>
      <tr><td><span class="badge badge-orange">요기요</span></td><td class="r">75건</td><td class="r">8%</td><td class="r">772,500원</td><td class="r">10,300원</td><td>보조 채널</td></tr>
      <tr><td><span class="badge badge-green">포장</span></td><td class="r">136건</td><td class="r">15%</td><td class="r">1,363,500원</td><td class="r">10,026원</td><td>수수료 최소, 마진 최대</td></tr>
      <tr class="total-row"><td>합계</td><td class="r">923건</td><td class="r">100%</td><td class="r">9,509,500원</td><td class="r">10,303원</td><td></td></tr>
    </tbody>
  </table>

  <h3>플랫폼별 매출 비중</h3>
  <div class="bar-row"><div class="bar-label">배민</div><div class="bar-track"><div class="bar-fill" style="width:55%;background:#2AC1BC"></div></div><div class="bar-val">55%</div></div>
  <div class="bar-row"><div class="bar-label">쿠팡이츠</div><div class="bar-track"><div class="bar-fill" style="width:22%;background:#E0115F"></div></div><div class="bar-val">22%</div></div>
  <div class="bar-row"><div class="bar-label">요기요</div><div class="bar-track"><div class="bar-fill" style="width:8%;background:#FA0050"></div></div><div class="bar-val">8%</div></div>
  <div class="bar-row"><div class="bar-label">포장</div><div class="bar-track"><div class="bar-fill" style="width:15%;background:#f59e0b"></div></div><div class="bar-val">15%</div></div>

  <h3>요일별 패턴</h3>
  <table>
    <thead><tr><th>요일</th><th class="r">평균 주문</th><th class="r">평균 매출</th><th>특성</th></tr></thead>
    <tbody>
      <tr><td>월요일</td><td class="r orange">24.8건</td><td class="r">253,400원</td><td>주초 최저 — 이벤트 검토</td></tr>
      <tr><td>화요일</td><td class="r">28.3건</td><td class="r">289,500원</td><td>소폭 회복</td></tr>
      <tr><td>수요일</td><td class="r">27.3건</td><td class="r">278,100원</td><td>평일 보통</td></tr>
      <tr><td>목요일</td><td class="r">28.8건</td><td class="r">294,100원</td><td>상승 시작</td></tr>
      <tr><td>금요일</td><td class="r">32.8건</td><td class="r">337,800원</td><td>야간 매출 급증</td></tr>
      <tr><td class="bold blue">토요일</td><td class="r bold blue">38.3건</td><td class="r bold blue">396,600원</td><td class="bold">최고 매출일</td></tr>
      <tr><td>일요일</td><td class="r">33.0건</td><td class="r">340,700원</td><td>가족 주문 비중 높음</td></tr>
    </tbody>
  </table>

  <div class="insight-box">
    <strong>💡 인사이트:</strong> 월요일 대비 토요일 주문이 +54% 많습니다. 월요일 한정 "월요 특가" 이벤트를 검토하면 주중 매출 균형을 잡을 수 있습니다.
  </div>

  <h3>날씨별 주문 패턴</h3>
  <table>
    <thead><tr><th>날씨</th><th class="r">일수</th><th class="r">평균 주문</th><th class="r">맑음 대비</th></tr></thead>
    <tbody>
      <tr><td>☀️ 맑음</td><td class="r">18일</td><td class="r">29.3건</td><td class="r">기준</td></tr>
      <tr><td>⛅ 흐림</td><td class="r">9일</td><td class="r">30.2건</td><td class="r green">+3%</td></tr>
      <tr><td class="bold">🌧️ 비</td><td class="r bold">3일</td><td class="r bold blue">34.7건</td><td class="r bold blue">+18%</td></tr>
    </tbody>
  </table>

  <div class="insight-box">
    <strong>💡 인사이트:</strong> 비 오는 날 주문이 18% 증가합니다. 우천 예보 시 식재료를 120% 발주하고, "비 오는 날 특별 서비스" 이벤트를 고려하세요.
  </div>

  <div class="footer">운서동 덮밥&볶음밥 — 1개월차 운영 보고서 | p.2</div>
</div>

<!-- PAGE 4: 손익 분석 -->
<div class="page">
  <h2>3. 손익 분석</h2>

  <h3>월간 손익 계산서</h3>
  <table>
    <thead><tr><th>항목</th><th class="r">금액</th><th class="r">비중</th><th>비고</th></tr></thead>
    <tbody>
      <tr><td class="bold">매출</td><td class="r bold blue">+9,509,500원</td><td class="r">100%</td><td></td></tr>
      <tr><td colspan="4" style="background:#f8fafc;font-weight:600;color:#64748b">비용</td></tr>
      <tr><td>　식재료비</td><td class="r">-2,620,000원</td><td class="r">27.6%</td><td>목표 32% 이하 ✅</td></tr>
      <tr><td>　월세</td><td class="r">-700,000원</td><td class="r">7.4%</td><td>보증금 1000/월세 70</td></tr>
      <tr><td>　관리비</td><td class="r">-110,000원</td><td class="r">1.2%</td><td></td></tr>
      <tr><td>　배달대행비</td><td class="r">-850,000원</td><td class="r">8.9%</td><td>건당 약 1,080원</td></tr>
      <tr><td>　플랫폼 수수료</td><td class="r">-580,000원</td><td class="r">6.1%</td><td>배민+쿠팡+요기요</td></tr>
      <tr><td>　공과금</td><td class="r">-320,000원</td><td class="r">3.4%</td><td>전기·가스·수도</td></tr>
      <tr><td>　포장재</td><td class="r">-240,000원</td><td class="r">2.5%</td><td>건당 약 260원</td></tr>
      <tr><td>　광고 (배민)</td><td class="r">-88,000원</td><td class="r">0.9%</td><td>오픈리스트 6.8%</td></tr>
      <tr><td>　인터넷·통신</td><td class="r">-50,000원</td><td class="r">0.5%</td><td></td></tr>
      <tr><td>　기타</td><td class="r">-50,000원</td><td class="r">0.5%</td><td>소모품 등</td></tr>
      <tr class="total-row"><td>총 비용</td><td class="r red">-5,608,000원</td><td class="r">59.0%</td><td></td></tr>
      <tr class="total-row"><td class="bold" style="font-size:13px">순이익</td><td class="r bold green" style="font-size:13px">+2,288,000원</td><td class="r bold green">24.1%</td><td></td></tr>
    </tbody>
  </table>

  <h3>비용 구조 시각화</h3>
  <div class="bar-row"><div class="bar-label">식재료비</div><div class="bar-track"><div class="bar-fill" style="width:47%;background:#ef4444"></div></div><div class="bar-val">2,620,000</div></div>
  <div class="bar-row"><div class="bar-label">배달대행</div><div class="bar-track"><div class="bar-fill" style="width:15%;background:#f97316"></div></div><div class="bar-val">850,000</div></div>
  <div class="bar-row"><div class="bar-label">월세</div><div class="bar-track"><div class="bar-fill" style="width:12%;background:#eab308"></div></div><div class="bar-val">700,000</div></div>
  <div class="bar-row"><div class="bar-label">수수료</div><div class="bar-track"><div class="bar-fill" style="width:10%;background:#22c55e"></div></div><div class="bar-val">580,000</div></div>
  <div class="bar-row"><div class="bar-label">공과금</div><div class="bar-track"><div class="bar-fill" style="width:6%;background:#3b82f6"></div></div><div class="bar-val">320,000</div></div>
  <div class="bar-row"><div class="bar-label">기타</div><div class="bar-track"><div class="bar-fill" style="width:8%;background:#6b7280"></div></div><div class="bar-val">538,000</div></div>

  <h3>손익분기 분석</h3>
  <div class="stat-grid">
    <div class="stat-card">
      <div class="label">손익분기 주문 (일)</div>
      <div class="value">~25건</div>
      <div class="sub">현재 30.8건 → 안전 마진 +23%</div>
    </div>
    <div class="stat-card">
      <div class="label">손익분기 매출 (월)</div>
      <div class="value">~7,500,000원</div>
      <div class="sub">현재 9,509,500원</div>
    </div>
    <div class="stat-card">
      <div class="label">초기 투자금 회수</div>
      <div class="value">~7.2개월</div>
      <div class="sub">투자 16,450,000원 기준</div>
    </div>
    <div class="stat-card green-bg">
      <div class="label">청년 세액 감면 (연간)</div>
      <div class="value">~1,234,000원</div>
      <div class="sub">75% 감면 적용 시</div>
    </div>
  </div>

  <div class="footer">운서동 덮밥&볶음밥 — 1개월차 운영 보고서 | p.3</div>
</div>

<!-- PAGE 5: 메뉴 & 리뷰 -->
<div class="page">
  <h2>4. 메뉴 성과 분석</h2>

  <h3>15종 메뉴 원가율</h3>
  <table>
    <thead><tr><th>메뉴</th><th class="r">판매가</th><th class="r">원가</th><th class="r">원가율</th><th class="r">마진</th><th>등급</th></tr></thead>
    <tbody>
      <tr><td>🍳 김치볶음밥</td><td class="r">7,500</td><td class="r">2,000</td><td class="r green">25%</td><td class="r">5,500</td><td><span class="badge badge-green">고마진</span></td></tr>
      <tr><td>🟤 짜장볶음밥</td><td class="r">7,500</td><td class="r">1,960</td><td class="r green">26%</td><td class="r">5,540</td><td><span class="badge badge-green">고마진</span></td></tr>
      <tr><td>🦐 새우볶음밥</td><td class="r">9,000</td><td class="r">2,560</td><td class="r">28%</td><td class="r">6,440</td><td><span class="badge badge-blue">양호</span></td></tr>
      <tr><td>🦀 게살볶음밥</td><td class="r">9,000</td><td class="r">1,890</td><td class="r green bold">21%</td><td class="r green bold">7,110</td><td><span class="badge badge-green">최고마진</span></td></tr>
      <tr><td>🌶️ 제육덮밥</td><td class="r">8,500</td><td class="r">2,500</td><td class="r">29%</td><td class="r">6,000</td><td><span class="badge badge-blue">양호</span></td></tr>
      <tr><td>🦑 오징어덮밥</td><td class="r">9,000</td><td class="r">2,280</td><td class="r">25%</td><td class="r">6,720</td><td><span class="badge badge-green">고마진</span></td></tr>
      <tr><td>🐙 쭈꾸미덮밥</td><td class="r">10,500</td><td class="r">3,300</td><td class="r orange">31%</td><td class="r">7,200</td><td><span class="badge badge-orange">주의</span></td></tr>
      <tr><td>🐙 낙지덮밥</td><td class="r">11,000</td><td class="r">3,390</td><td class="r orange">31%</td><td class="r">7,610</td><td><span class="badge badge-orange">주의</span></td></tr>
      <tr><td>🦐 해물덮밥</td><td class="r">11,000</td><td class="r">2,890</td><td class="r">26%</td><td class="r">8,110</td><td><span class="badge badge-blue">양호</span></td></tr>
      <tr><td>🟥 마파두부밥</td><td class="r">8,000</td><td class="r">2,040</td><td class="r">26%</td><td class="r">5,960</td><td><span class="badge badge-blue">양호</span></td></tr>
      <tr><td>🍤 깐쇼덮밥</td><td class="r">10,500</td><td class="r">3,160</td><td class="r orange">30%</td><td class="r">7,340</td><td><span class="badge badge-blue">양호</span></td></tr>
      <tr><td>🍗 깐풍기덮밥</td><td class="r">10,000</td><td class="r">2,440</td><td class="r green">24%</td><td class="r green bold">7,560</td><td><span class="badge badge-green">고마진</span></td></tr>
      <tr><td>🔥 라조기덮밥</td><td class="r">10,000</td><td class="r">2,490</td><td class="r green">25%</td><td class="r">7,510</td><td><span class="badge badge-green">고마진</span></td></tr>
      <tr><td>🥢 유린기덮밥</td><td class="r">10,000</td><td class="r">2,340</td><td class="r green">23%</td><td class="r green bold">7,660</td><td><span class="badge badge-green">고마진</span></td></tr>
      <tr><td>🥚 오므라이스</td><td class="r">8,500</td><td class="r">2,110</td><td class="r">25%</td><td class="r">6,390</td><td><span class="badge badge-blue">양호</span></td></tr>
    </tbody>
  </table>

  <div class="insight-box">
    <strong>💡 전략:</strong> 닭고기 기반 중화덮밥(깐풍기·유린기·라조기)이 원가율 23~25%로 최고 마진. 이 3종의 홍보를 강화하면 전체 수익성 개선 가능.
  </div>

  <h2>5. 고객 리뷰 분석</h2>
  <div class="stat-grid">
    <div class="stat-card"><div class="label">총 리뷰</div><div class="value">30건</div></div>
    <div class="stat-card"><div class="label">평균 별점</div><div class="value">⭐ 4.17</div></div>
    <div class="stat-card"><div class="label">답글 완료율</div><div class="value">80%</div><div class="sub">24/30건</div></div>
    <div class="stat-card"><div class="label">5점 비율</div><div class="value">50%</div><div class="sub">15/30건</div></div>
  </div>

  <div class="two-col">
    <div>
      <h4>✅ 긍정 키워드 TOP 5</h4>
      <table><tbody>
        <tr><td>"양 많다"</td><td class="r bold">6회</td></tr>
        <tr><td>"맛있다/소스 맛있다"</td><td class="r">5회</td></tr>
        <tr><td>"바삭하다"</td><td class="r">4회</td></tr>
        <tr><td>"가성비"</td><td class="r">3회</td></tr>
        <tr><td>"재주문"</td><td class="r">3회</td></tr>
      </tbody></table>
    </div>
    <div>
      <h4>⚠️ 부정 키워드</h4>
      <table><tbody>
        <tr><td>"배달 느리다"</td><td class="r red bold">3회</td></tr>
        <tr><td>"양 적다"</td><td class="r red">2회</td></tr>
        <tr><td>"짜다"</td><td class="r">1회</td></tr>
        <tr><td>"포장 불량"</td><td class="r">1회</td></tr>
        <tr><td>"조리 실수"</td><td class="r">1회</td></tr>
      </tbody></table>
    </div>
  </div>

  <div class="insight-box">
    <strong>⚠️ 개선 필요:</strong> "배달 느리다"가 3회로 가장 빈번한 부정 키워드. 배달대행사 변경 또는 조리시간 단축 검토. 별점 4.5+ 달성을 위해 답글률 100%를 목표로.
  </div>

  <div class="footer">운서동 덮밥&볶음밥 — 1개월차 운영 보고서 | p.4</div>
</div>

<!-- PAGE 6: 2개월차 계획 -->
<div class="page">
  <h2>6. 2개월차 (6월) 목표 및 액션 플랜</h2>

  <h3>핵심 목표</h3>
  <div class="stat-grid">
    <div class="stat-card highlight">
      <div class="label">일평균 주문 목표</div>
      <div class="value">35건</div>
      <div class="sub">현재 30.8건 → +14%</div>
    </div>
    <div class="stat-card highlight">
      <div class="label">월 매출 목표</div>
      <div class="value">11,000,000원</div>
      <div class="sub">현재 9,509,500원 → +16%</div>
    </div>
    <div class="stat-card highlight">
      <div class="label">평균 별점 목표</div>
      <div class="value">⭐ 4.5+</div>
      <div class="sub">현재 4.17</div>
    </div>
    <div class="stat-card highlight">
      <div class="label">리뷰 답글률 목표</div>
      <div class="value">100%</div>
      <div class="sub">현재 80%</div>
    </div>
  </div>

  <h3>주요 액션 항목</h3>
  <table>
    <thead><tr><th>우선순위</th><th>액션</th><th>기대 효과</th><th>담당</th></tr></thead>
    <tbody>
      <tr><td><span class="badge badge-red">긴급</span></td><td>배달대행사 성과 점검, 필요시 변경</td><td>배달 시간 30분 이내 달성, 부정 리뷰 감소</td><td>사장님</td></tr>
      <tr><td><span class="badge badge-red">긴급</span></td><td>미답변 리뷰 6건 답글 처리</td><td>답글률 100%, 배민 알고리즘 점수 향상</td><td>사장님</td></tr>
      <tr><td><span class="badge badge-orange">중요</span></td><td>"월요 특가" 이벤트 시행 (김치볶음밥 6,500원)</td><td>월요일 주문 +20% (25→30건)</td><td>사장님</td></tr>
      <tr><td><span class="badge badge-orange">중요</span></td><td>배민 깃발 1개 추가 (영종하늘도시 남측)</td><td>노출 범위 확대, 주문 +10~15%</td><td>사장님</td></tr>
      <tr><td><span class="badge badge-blue">개선</span></td><td>짜장볶음밥 간 조절 (소금 10% 감량)</td><td>"짜다" 리뷰 방지</td><td>셰프</td></tr>
      <tr><td><span class="badge badge-blue">개선</span></td><td>해물덮밥 포장 이중 밀봉</td><td>"국물 새다" 클레임 제로화</td><td>셰프</td></tr>
      <tr><td><span class="badge badge-blue">개선</span></td><td>중화덮밥 3종 (깐풍기·유린기·라조기) 홍보 강화</td><td>고마진 메뉴 비중 30%→40%, 수익성 개선</td><td>사장님</td></tr>
      <tr><td><span class="badge badge-green">성장</span></td><td>포장 주문 쿠팡이츠 유도 (수수료 0%)</td><td>포장 15%→20%, 월 수수료 약 5만원 절감</td><td>사장님</td></tr>
    </tbody>
  </table>

  <h3>6개월 로드맵 업데이트</h3>
  <table>
    <thead><tr><th>시점</th><th>목표</th><th>현재 상태</th></tr></thead>
    <tbody>
      <tr><td class="bold green">1개월 (완료)</td><td>오픈 + 일 25건 달성</td><td class="green">✅ 달성 (일 30.8건)</td></tr>
      <tr><td>2개월 (6월)</td><td>일 35건 + 별점 4.5 + 깃발 추가</td><td>진행 예정</td></tr>
      <tr><td>3개월 (7월)</td><td>일 40건 + 샵인샵 검토</td><td>-</td></tr>
      <tr><td>6개월 (10월)</td><td>일 50건 + 월매출 1,500만원</td><td>-</td></tr>
      <tr><td>12개월 (2027.4)</td><td>월매출 3,000만원 + 2호점 or 가맹 검토</td><td>-</td></tr>
    </tbody>
  </table>

  <div class="success-box">
    <strong>📋 종합 평가:</strong> 1개월차 성과가 예상을 상회합니다. 손익분기를 넘긴 상태에서 안정적으로 성장 중이며, 2개월차에 배달 품질 개선과 고마진 메뉴 홍보에 집중하면 월 1,100만원 매출 달성이 충분히 가능합니다.
  </div>

  <div class="footer">
    운서동 덮밥&볶음밥 — 1개월차 운영 보고서 | p.5<br>
    <span style="margin-top:8px;display:block">본 보고서는 2026년 5월 27일 기준으로 작성되었습니다.</span>
  </div>
</div>

</body>
</html>`;

async function generate() {
  console.log('PDF 생성 중...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  const outputPath = path.resolve('docs/운서동덮밥_1개월차_운영보고서.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await browser.close();
  console.log(`✅ PDF 생성 완료: ${outputPath}`);
}

generate().catch(e => { console.error('에러:', e); process.exit(1); });
