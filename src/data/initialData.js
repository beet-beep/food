export const OPEN_DATE = '2026-04-27';
export const START_DATE = '2026-03-27';

export const weeklyTasks = [
  {
    week: 1,
    title: 'WEEK 1 — 행정 + 메뉴 확정',
    dateRange: '3/27 ~ 4/2',
    days: [
      {
        date: '2026-03-27',
        label: '3/27 (금)',
        owner: { text: '사장님: 보건증 발급 예약 (인천 중구보건소) / 위생교육 온라인 신청' },
        chef: { text: '셰프: 메뉴 후보 브레인스토밍 (10종 → 5종 압축)' },
        tasks: [
          { id: 'w1d1t1', text: '보건증 발급 예약 (인천 중구보건소)', role: 'owner', done: false },
          { id: 'w1d1t2', text: '위생교육 온라인 신청', role: 'owner', done: false },
          { id: 'w1d1t3', text: '메뉴 후보 브레인스토밍 (10종 → 5종 압축)', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-03-28',
        label: '3/28 (토)',
        tasks: [
          { id: 'w1d2t1', text: '경쟁사 분석 시작 (배민/쿠팡이츠 앱 리서치)', role: 'owner', done: false },
          { id: 'w1d2t2', text: '시장 식재료 답사 (영종도 인근 + 인천 농산물시장)', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-03-29',
        label: '3/29 (일)',
        tasks: [
          { id: 'w1d3t1', text: '경쟁사 분석표 완성, 가격대 벤치마크', role: 'owner', done: false },
          { id: 'w1d3t2', text: '메뉴 시식 테스트 1차 (5종 → 3+2 확정 방향)', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-03-30',
        label: '3/30 (월)',
        tasks: [
          { id: 'w1d4t1', text: '보건증 발급 (사장님+셰프 동행)', role: 'both', done: false },
          { id: 'w1d4t2', text: '위생교육 온라인 수강 완료', role: 'owner', done: false },
          { id: 'w1d4t3', text: '시식 테스트 2차, 정량 측정 시작', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-03-31',
        label: '3/31 (화)',
        tasks: [
          { id: 'w1d5t1', text: '영업신고증 신청 (인천 중구청)', role: 'owner', done: false },
          { id: 'w1d5t2', text: '인테리어·설비 체크', role: 'owner', done: false },
          { id: 'w1d5t3', text: '소스 레시피 확정, 레시피 카드 작성 시작', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-01',
        label: '4/1 (수)',
        tasks: [
          { id: 'w1d6t1', text: '사업자등록 신청 (홈택스 or 세무서)', role: 'owner', done: false },
          { id: 'w1d6t2', text: '포장 용기 샘플 주문', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-02',
        label: '4/2 (목)',
        tasks: [
          { id: 'w1d7t1', text: '카드단말기 신청', role: 'owner', done: false },
          { id: 'w1d7t2', text: '사업자 통장 개설', role: 'owner', done: false },
          { id: 'w1d7t3', text: '배달대행업체 계약', role: 'owner', done: false },
          { id: 'w1d7t4', text: '최종 메뉴 3+2 확정, 레시피 카드 완성', role: 'chef', done: false },
        ],
      },
    ],
  },
  {
    week: 2,
    title: 'WEEK 2 — 주방 세팅 + 플랫폼 입점',
    dateRange: '4/3 ~ 4/9',
    days: [
      {
        date: '2026-04-03',
        label: '4/3 (금)',
        tasks: [
          { id: 'w2d1t1', text: '배민 입점 신청 (사업자등록증 수령 후)', role: 'owner', done: false },
          { id: 'w2d1t2', text: '주방 장비 최종 리스트업 & 발주', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-04',
        label: '4/4 (토)',
        tasks: [
          { id: 'w2d2t1', text: '쿠팡이츠 입점 신청', role: 'owner', done: false },
          { id: 'w2d2t2', text: '포스기 설치 예약', role: 'owner', done: false },
          { id: 'w2d2t3', text: '식재료 공급업체 계약 (정기 배송)', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-05',
        label: '4/5 (일)',
        tasks: [
          { id: 'w2d3t1', text: '가게 상호·로고 확정', role: 'owner', done: false },
          { id: 'w2d3t2', text: '주방 동선 설계 (조리→포장→전달)', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-06',
        label: '4/6 (월)',
        tasks: [
          { id: 'w2d4t1', text: '메뉴 사진 촬영 (자체 or 전문가)', role: 'owner', done: false },
          { id: 'w2d4t2', text: '사진 촬영용 메뉴 조리', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-07',
        label: '4/7 (화)',
        tasks: [
          { id: 'w2d5t1', text: '배민/쿠팡 메뉴 등록 & 사진 업로드', role: 'owner', done: false },
          { id: 'w2d5t2', text: '주방 장비 입고 & 설치', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-08',
        label: '4/8 (수)',
        tasks: [
          { id: 'w2d6t1', text: '배달 포장재 대량 발주', role: 'owner', done: false },
          { id: 'w2d6t2', text: '간판·현수막 제작 발주', role: 'owner', done: false },
          { id: 'w2d6t3', text: '주방 세팅 완료, 동선 테스트', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-09',
        label: '4/9 (목)',
        tasks: [
          { id: 'w2d7t1', text: '배민 울트라콜 깃발 설정', role: 'owner', done: false },
          { id: 'w2d7t2', text: '가게 정보 100% 완성', role: 'owner', done: false },
          { id: 'w2d7t3', text: '전 메뉴 모의 조리 1차 (타이머 측정)', role: 'chef', done: false },
        ],
      },
    ],
  },
  {
    week: 3,
    title: 'WEEK 3 — 시뮬레이션 + 프리오픈',
    dateRange: '4/10 ~ 4/16',
    days: [
      {
        date: '2026-04-10',
        label: '4/10 (금)',
        tasks: [
          { id: 'w3d1t1', text: '요기요 입점 신청', role: 'owner', done: false },
          { id: 'w3d1t2', text: '네이버 플레이스 등록', role: 'owner', done: false },
          { id: 'w3d1t3', text: '모의 조리 2차 — 동시 5건 주문 시뮬레이션', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-11',
        label: '4/11 (토)',
        tasks: [
          { id: 'w3d2t1', text: '배달 동선 테스트 (배달대행 실제 호출)', role: 'owner', done: false },
          { id: 'w3d2t2', text: '포장 품질 테스트 (30분 후 개봉 확인)', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-12',
        label: '4/12 (일)',
        tasks: [
          { id: 'w3d3t1', text: '오픈 이벤트 기획 (할인/리뷰/찜 이벤트 설계)', role: 'owner', done: false },
          { id: 'w3d3t2', text: '소스 대량 제조 테스트, 보관 방법 확정', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-13',
        label: '4/13 (월)',
        tasks: [
          { id: 'w3d4t1', text: '프리오픈 1일차 — 지인 20명 대상 시범 배달', role: 'both', done: false },
          { id: 'w3d4t2', text: '실전 조리 + 피드백 수집', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-14',
        label: '4/14 (화)',
        tasks: [
          { id: 'w3d5t1', text: '프리오픈 2일차 — 피드백 반영, 배달 시간 체크', role: 'owner', done: false },
          { id: 'w3d5t2', text: '피드백 기반 레시피 미세 조정', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-15',
        label: '4/15 (수)',
        tasks: [
          { id: 'w3d6t1', text: '프리오픈 3일차 — 포장·배달 프로세스 최적화', role: 'owner', done: false },
          { id: 'w3d6t2', text: '조리 속도 최적화 (목표: 1건 5분 이내)', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-16',
        label: '4/16 (목)',
        tasks: [
          { id: 'w3d7t1', text: '프리오픈 총평 & 최종 조정 사항 정리', role: 'owner', done: false },
          { id: 'w3d7t2', text: '식재료 발주 사이클 확정', role: 'chef', done: false },
        ],
      },
    ],
  },
  {
    week: 4,
    title: 'WEEK 4 — 마케팅 + 그랜드 오픈',
    dateRange: '4/17 ~ 4/27',
    days: [
      {
        date: '2026-04-17',
        label: '4/17 (금)',
        tasks: [
          { id: 'w4d1t1', text: '오픈 이벤트 배너 등록 (배민/쿠팡)', role: 'owner', done: false },
          { id: 'w4d1t2', text: '오픈일 식재료 대량 발주', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-18',
        label: '4/18 (토)',
        tasks: [
          { id: 'w4d2t1', text: '영종도 지역 맘카페·커뮤니티 홍보글 작성', role: 'owner', done: false },
          { id: 'w4d2t2', text: '소스 사전 제조 & 냉장 보관', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-19',
        label: '4/19 (일)',
        tasks: [
          { id: 'w4d3t1', text: '네이버 블로그 오픈 포스팅', role: 'owner', done: false },
          { id: 'w4d3t2', text: '비품 최종 점검', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-20',
        label: '4/20 (월)',
        tasks: [
          { id: 'w4d4t1', text: '배민 오픈 할인 쿠폰 설정 (첫 주문 2,000원 할인)', role: 'owner', done: false },
          { id: 'w4d4t2', text: '위생 최종 점검, 청소', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-21',
        label: '4/21 (월)',
        tasks: [
          { id: 'w4d5t1', text: 'SNS 카운트다운 홍보 시작', role: 'owner', done: false },
          { id: 'w4d5t2', text: '전 메뉴 조리 연습', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-22',
        label: '4/22 (화)',
        tasks: [
          { id: 'w4d6t1', text: '홍보 콘텐츠 제작 (메뉴 사진/영상)', role: 'owner', done: false },
          { id: 'w4d6t2', text: '전 메뉴 조리 연습', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-23',
        label: '4/23 (수)',
        tasks: [
          { id: 'w4d7t1', text: '최종 점검 — 플랫폼 메뉴/가격/사진 확인', role: 'owner', done: false },
          { id: 'w4d7t2', text: '조리 리허설', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-24',
        label: '4/24 (목)',
        tasks: [
          { id: 'w4d8t1', text: '오픈 전 비상 연락망 정리 (배달대행, 식재료업체)', role: 'owner', done: false },
          { id: 'w4d8t2', text: '주방 최종 정리', role: 'chef', done: false },
        ],
      },
      {
        date: '2026-04-25',
        label: '4/25 (금)',
        tasks: [
          { id: 'w4d9t1', text: '오픈 2일 전 — 모든 시스템 최종 테스트', role: 'both', done: false },
        ],
      },
      {
        date: '2026-04-26',
        label: '4/26 (토)',
        tasks: [
          { id: 'w4d10t1', text: '오픈 전일 — 식재료 입고, 사전 준비', role: 'both', done: false },
        ],
      },
      {
        date: '2026-04-27',
        label: '4/27 (일) 🎉',
        tasks: [
          { id: 'w4d11t1', text: '그랜드 오픈! 플랫폼 영업 시작 확인', role: 'owner', done: false },
          { id: 'w4d11t2', text: '그랜드 오픈! 조리 시작', role: 'chef', done: false },
        ],
      },
    ],
  },
];

export const adminSteps = [
  { id: 'a1', title: '보건증 발급', desc: '인천 중구보건소 또는 지정병원. 비용 약 3,000원. 사장님+셰프 둘 다 필요', status: 'pending', role: 'both', dueDate: '2026-03-30' },
  { id: 'a2', title: '위생교육 수료', desc: '한국외식업중앙회 온라인 3시간 또는 집합 6시간', status: 'pending', role: 'owner', dueDate: '2026-03-30' },
  { id: 'a3', title: '영업신고증 발급', desc: '인천 중구청 위생과. 임대차계약서, 보건증, 위생교육수료증, 신분증 필요', status: 'pending', role: 'owner', dueDate: '2026-03-31' },
  { id: 'a4', title: '사업자등록', desc: '인천 중구세무서 또는 홈택스 온라인. 간이과세자 추천', status: 'pending', role: 'owner', dueDate: '2026-04-01' },
  { id: 'a5', title: '카드단말기 설치', desc: '사업자등록증 발급 후 신청. 3~5일 소요', status: 'pending', role: 'owner', dueDate: '2026-04-02' },
  { id: 'a6', title: '사업자 통장 개설', desc: '사업자등록증 지참하여 은행 방문', status: 'pending', role: 'owner', dueDate: '2026-04-02' },
  { id: 'a7', title: '청년창업 세액감면 준비', desc: '종합소득세 신고 시(2027년 5월) 감면 신청서 첨부. 사전 서류 준비', status: 'pending', role: 'owner', dueDate: '2027-05-01' },
];

export const platformSteps = [
  { id: 'p1', name: '배달의민족', status: 'pending', fee: '울트라콜 월 88,000원 or 오픈리스트 6.8%', priority: 1, note: '국내 점유율 1위. 반드시 입점' },
  { id: 'p2', name: '쿠팡이츠', status: 'pending', fee: '중개 수수료 ~9.8%', priority: 1, note: '단건 배달. 영종도 커버리지 확인 필요' },
  { id: 'p3', name: '요기요', status: 'pending', fee: '중개 수수료 ~12.5%', priority: 2, note: '오픈 2주 후 입점 추천' },
  { id: 'p4', name: '네이버 플레이스', status: 'pending', fee: '무료', priority: 2, note: '검색 노출용. 가게 정보 등록' },
];

export const menuItems = [
  // ─── 볶음밥 카테고리 ───
  {
    id: 'm1', name: '김치볶음밥', category: 'main', tag: '볶음밥', badge: 'BEST', emoji: '🍳',
    desc: '잘 익은 묵은지와 고소한 참기름의 국민 볶음밥', price: 9000, targetCostRate: 22, popular: true, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '묵은지 80g', cost: 400 }, { name: '돼지고기 다짐육 50g', cost: 400 },
      { name: '양파·대파 30g', cost: 90 }, { name: '참기름·김가루', cost: 100 }, { name: '계란 1개', cost: 200 },
      { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm2', name: '짜장볶음밥', category: 'main', tag: '볶음밥', badge: '', emoji: '🟤',
    desc: '춘장의 깊은 맛이 밥알마다 배어든 짜장볶음밥', price: 9000, targetCostRate: 22, popular: false, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '춘장 소스 60g', cost: 300 }, { name: '돼지고기 다짐육 50g', cost: 400 },
      { name: '양파·감자·호박 60g', cost: 200 }, { name: '식용유', cost: 50 }, { name: '계란 1개', cost: 200 },
      { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm3', name: '새우볶음밥', category: 'main', tag: '볶음밥', badge: 'HOT', emoji: '🦐',
    desc: '탱글한 새우와 야채가 가득, 특제 소스 볶음밥', price: 9000, targetCostRate: 31, popular: true, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '냉동 새우 80g (6~7마리)', cost: 1200 }, { name: '양파·당근·대파 50g', cost: 150 },
      { name: '계란 1개', cost: 200 }, { name: '굴소스·참기름', cost: 150 }, { name: '식용유', cost: 50 },
      { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm4', name: '게살볶음밥', category: 'main', tag: '볶음밥', badge: '', emoji: '🦀',
    desc: '게살의 감칠맛과 야채의 아삭함이 어우러진 볶음밥', price: 9000, targetCostRate: 24, popular: false, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '게맛살 80g', cost: 480 }, { name: '양파·당근·대파·옥수수 60g', cost: 200 },
      { name: '계란 1개', cost: 200 }, { name: '굴소스·참기름', cost: 150 }, { name: '식용유', cost: 50 },
      { name: '포장 용기 세트', cost: 250 },
    ],
  },
  // ─── 덮밥 (한식) ───
  {
    id: 'm5', name: '제육덮밥', category: 'main', tag: '덮밥', badge: 'BEST', emoji: '🌶️',
    desc: '칼칼한 고추장 양념에 볶아낸 돼지고기, 밥 한 그릇 뚝딱', price: 9500, targetCostRate: 26, popular: true, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '돼지 앞다리살 150g', cost: 1200 }, { name: '양파·대파·고추 60g', cost: 180 },
      { name: '고추장 양념 50ml', cost: 200 }, { name: '참기름·깨', cost: 60 }, { name: '식용유', cost: 50 },
      { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm6', name: '오징어덮밥', category: 'main', tag: '덮밥', badge: '', emoji: '🦑',
    desc: '쫄깃한 오징어와 매콤한 양념의 바다향 덮밥', price: 9000, targetCostRate: 28, popular: false, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '오징어 (손질) 120g', cost: 960 }, { name: '양파·당근·대파·호박 60g', cost: 200 },
      { name: '고추장 양념 50ml', cost: 200 }, { name: '참기름·깨', cost: 60 }, { name: '식용유', cost: 50 },
      { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm7', name: '쭈꾸미덮밥', category: 'main', tag: '덮밥', badge: 'HOT', emoji: '🐙',
    desc: '불맛 가득 매콤 쭈꾸미, 밥도둑 보장', price: 10500, targetCostRate: 35, popular: true, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '쭈꾸미 (손질) 130g', cost: 1950 }, { name: '양파·대파·고추·깻잎 50g', cost: 180 },
      { name: '매콤 양념장 50ml', cost: 250 }, { name: '참기름·깨', cost: 60 }, { name: '식용유', cost: 50 },
      { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm8', name: '낙지덮밥', category: 'main', tag: '덮밥', badge: '', emoji: '🐙',
    desc: '부드러운 낙지와 매콤 양념의 프리미엄 덮밥', price: 11000, targetCostRate: 32, popular: false, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '낙지 (손질) 120g', cost: 2040 },
      { name: '양파·대파·고추·당근 50g', cost: 180 }, { name: '매콤 양념장 50ml', cost: 250 },
      { name: '참기름·깨', cost: 60 }, { name: '식용유', cost: 50 }, { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm9', name: '해물덮밥', category: 'main', tag: '덮밥', badge: 'NEW', emoji: '🦐',
    desc: '새우·오징어·홍합 해물 3종의 푸짐한 바다 한 그릇', price: 11000, targetCostRate: 35, popular: false, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '냉동 새우 50g', cost: 750 }, { name: '오징어 60g', cost: 480 },
      { name: '홍합 50g', cost: 400 }, { name: '양파·대파·고추 50g', cost: 150 },
      { name: '매콤 해물 소스 50ml', cost: 250 }, { name: '식용유', cost: 50 }, { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm10', name: '마파두부밥', category: 'main', tag: '덮밥', badge: '', emoji: '🟥',
    desc: '얼얼한 마파 소스와 부드러운 두부의 중화풍 덮밥', price: 9000, targetCostRate: 23, popular: false, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '두부 150g', cost: 300 }, { name: '돼지고기 다짐육 50g', cost: 400 },
      { name: '두반장·마파 소스 50ml', cost: 350 }, { name: '대파·생강·마늘', cost: 100 },
      { name: '전분물·식용유', cost: 80 }, { name: '포장 용기 세트', cost: 250 },
    ],
  },
  // ─── 덮밥 (중화풍) ───
  {
    id: 'm11', name: '깐쇼덮밥', category: 'main', tag: '중화덮밥', badge: 'HOT', emoji: '🍤',
    desc: '바삭한 새우에 달콤 매콤 깐쇼 소스를 듬뿍', price: 10500, targetCostRate: 31, popular: true, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '냉동 새우 100g', cost: 1500 }, { name: '튀김가루·전분', cost: 200 },
      { name: '깐쇼 소스 60ml', cost: 300 }, { name: '양파·피망·건고추 40g', cost: 150 },
      { name: '식용유 (튀김)', cost: 200 }, { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm12', name: '깐풍기덮밥', category: 'main', tag: '중화덮밥', badge: '', emoji: '🍗',
    desc: '겉바속촉 닭다리살에 매콤 깐풍 소스, 인기 No.1', price: 10000, targetCostRate: 26, popular: true, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '닭다리살 (순살) 130g', cost: 780 }, { name: '튀김가루·전분', cost: 200 },
      { name: '깐풍 소스 60ml', cost: 300 }, { name: '양파·피망·건고추 40g', cost: 150 },
      { name: '식용유 (튀김)', cost: 200 }, { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm13', name: '라조기덮밥', category: 'main', tag: '중화덮밥', badge: '', emoji: '🔥',
    desc: '고추기름에 볶아낸 바삭한 닭고기, 얼얼한 매운맛', price: 10000, targetCostRate: 27, popular: false, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '닭다리살 (순살) 130g', cost: 780 }, { name: '튀김가루·전분', cost: 200 },
      { name: '라조 소스 (두반장·고추기름) 60ml', cost: 350 }, { name: '양파·피망·건고추 40g', cost: 150 },
      { name: '식용유 (튀김)', cost: 200 }, { name: '포장 용기 세트', cost: 250 },
    ],
  },
  {
    id: 'm14', name: '유린기덮밥', category: 'main', tag: '중화덮밥', badge: '', emoji: '🥢',
    desc: '바삭한 닭튀김에 새콤달콤 유린 소스를 끼얹어', price: 10000, targetCostRate: 26, popular: false, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '닭다리살 (순살) 130g', cost: 780 }, { name: '튀김가루·전분', cost: 200 },
      { name: '유린 소스 (간장·식초·설탕) 60ml', cost: 250 }, { name: '양파·대파채 40g', cost: 100 },
      { name: '식용유 (튀김)', cost: 200 }, { name: '포장 용기 세트', cost: 250 },
    ],
  },
  // ─── 오므라이스 ───
  {
    id: 'm15', name: '오므라이스', category: 'main', tag: '볶음밥', badge: 'NEW', emoji: '🥚',
    desc: '부드러운 계란옷에 감싼 케첩 볶음밥, 남녀노소 인기', price: 9500, targetCostRate: 22, popular: true, reviewCount: 0,
    ingredients: [
      { name: '쌀 (밥 280g)', cost: 560 }, { name: '계란 3개', cost: 600 }, { name: '양파·당근·피망 50g', cost: 150 },
      { name: '햄/소시지 40g', cost: 250 }, { name: '케첩·데미글라스 소스 50ml', cost: 200 },
      { name: '버터·식용유', cost: 100 }, { name: '포장 용기 세트', cost: 250 },
    ],
  },
  // ─── 사이드 ───
  {
    id: 's1', name: '미니 우동', category: 'side', tag: '사이드', badge: '', emoji: '🍜',
    desc: '가쓰오부시로 우려낸 따뜻한 우동', price: 2500, targetCostRate: 25, popular: false, reviewCount: 0,
    ingredients: [
      { name: '우동면 1인분', cost: 300 }, { name: '우동 국물', cost: 150 }, { name: '파·어묵', cost: 100 }, { name: '포장 용기', cost: 80 },
    ],
  },
  {
    id: 's2', name: '교자만두 (5개)', category: 'side', tag: '사이드', badge: '', emoji: '🥟',
    desc: '바삭하게 구운 한입 크기 교자', price: 3500, targetCostRate: 20, popular: false, reviewCount: 0,
    ingredients: [
      { name: '냉동 교자 5개', cost: 400 }, { name: '간장 소스', cost: 50 }, { name: '포장 용기', cost: 80 },
    ],
  },
  {
    id: 's3', name: '계란국', category: 'side', tag: '사이드', badge: '', emoji: '🥣',
    desc: '부드러운 계란국 한 그릇', price: 2000, targetCostRate: 22, popular: false, reviewCount: 0,
    ingredients: [
      { name: '계란 1개', cost: 200 }, { name: '다시마 국물', cost: 100 }, { name: '대파·소금', cost: 50 }, { name: '포장 용기', cost: 80 },
    ],
  },
  // ─── 추가 ───
  {
    id: 'e1', name: '밥 추가', category: 'extra', tag: '추가', badge: '', emoji: '🍚',
    desc: '공기밥 추가', price: 1000, targetCostRate: 40, popular: false, reviewCount: 0,
    ingredients: [{ name: '쌀 (밥 200g)', cost: 400 }],
  },
  {
    id: 'e2', name: '계란후라이 추가', category: 'extra', tag: '추가', badge: '', emoji: '🍳',
    desc: '반숙 계란후라이 1개', price: 1500, targetCostRate: 15, popular: false, reviewCount: 0,
    ingredients: [{ name: '계란 1개', cost: 200 }, { name: '식용유', cost: 30 }],
  },
  {
    id: 'e3', name: '음료 (콜라/사이다)', category: 'extra', tag: '추가', badge: '', emoji: '🥤',
    desc: '시원한 캔음료 355ml', price: 2000, targetCostRate: 25, popular: false, reviewCount: 0,
    ingredients: [{ name: '캔음료 1개', cost: 500 }],
  },
];

export const financialData = {
  initialCosts: [
    { id: 'ic1', name: '보증금', amount: 10000000, category: 'deposit', note: '계약조건 1000/70' },
    { id: 'ic2', name: '주방 장비 (중고 활용)', amount: 4000000, category: 'equipment', note: '업소용 냉장고, 가스레인지, 튀김기 등' },
    { id: 'ic3', name: '초기 식재료', amount: 1250000, category: 'material', note: '오픈 첫 주 분량' },
    { id: 'ic4', name: '포장재 (1개월분)', amount: 400000, category: 'material', note: 'PP용기, 소스컵, 비닐, 테이프' },
    { id: 'ic5', name: '간판·현수막', amount: 400000, category: 'marketing', note: '' },
    { id: 'ic6', name: '메뉴 사진 촬영', amount: 200000, category: 'marketing', note: '전문 촬영 or 자체' },
    { id: 'ic7', name: '카드단말기·포스기', amount: 200000, category: 'equipment', note: '' },
  ],
  monthlyFixed: [
    { id: 'mf1', name: '월세', amount: 700000, category: 'rent', editable: true },
    { id: 'mf2', name: '관리비', amount: 110000, category: 'rent', editable: true },
    { id: 'mf3', name: '배민 울트라콜 (1깃발)', amount: 88000, category: 'platform', editable: true },
    { id: 'mf4', name: '배달대행 기본료', amount: 100000, category: 'delivery', editable: true },
    { id: 'mf5', name: '공과금 (전기·가스·수도)', amount: 300000, category: 'utility', editable: true },
    { id: 'mf6', name: '인터넷·통신', amount: 50000, category: 'utility', editable: true },
  ],
  assumptions: {
    avgOrderPrice: 12000,
    dailyOrders: 30,
    avgCostRate: 0.32,
    platformFeeRate: 0.10,
    deliveryFeePerOrder: 3500,
  },
  contractInfo: {
    deposit: 10000000,
    monthlyRent: 700000,
    maintenance: 110000,
    contractYears: 2,
    startDate: '2026-04-27',
    endDate: '2028-04-26',
    location: '영종도 운서역 인근',
  },
};

function createEmptyMonth(yearMonth) {
  return {
    yearMonth,
    revenue: {
      baemin: 0,
      coupang: 0,
      yogiyo: 0,
      takeout: 0,
      other: 0,
    },
    expense: {
      rent: 700000,
      maintenance: 110000,
      ingredients: 0,
      packaging: 0,
      platformFee: 0,
      deliveryFee: 0,
      labor: 0,
      utility: 300000,
      internet: 50000,
      advertising: 88000,
      equipment: 0,
      other: 0,
    },
    orders: {
      baemin: 0,
      coupang: 0,
      yogiyo: 0,
      takeout: 0,
    },
    memo: '',
  };
}

export const defaultLedger = [
  {
    yearMonth: '2026-04',
    revenue: { baemin: 210000, coupang: 82000, yogiyo: 29500, takeout: 59000, other: 0 },
    expense: { rent: 700000, maintenance: 110000, ingredients: 115000, packaging: 12000, platformFee: 25000, deliveryFee: 56000, labor: 0, utility: 30000, internet: 50000, advertising: 88000, equipment: 0, other: 0 },
    orders: { baemin: 20, coupang: 8, yogiyo: 3, takeout: 6 },
    memo: '4/27~4/30 오픈 4일간 데이터. 지인 주문 포함. 초기 안정화 기간.',
  },
  {
    yearMonth: '2026-05',
    revenue: { baemin: 4588000, coupang: 1892500, yogiyo: 685000, takeout: 1130500, other: 0 },
    expense: { rent: 700000, maintenance: 110000, ingredients: 2620000, packaging: 240000, platformFee: 580000, deliveryFee: 850000, labor: 0, utility: 320000, internet: 50000, advertising: 88000, equipment: 0, other: 50000 },
    orders: { baemin: 444, coupang: 182, yogiyo: 70, takeout: 117 },
    memo: '5/1~5/26 26일 운영. 총 813건, 일평균 31.3건. 근로자의날+어린이날 연휴 효과. 후반부 40건대 진입. 제육·깐풍기 양대 인기. 비오는 날 +25% 확인.',
  },
  createEmptyMonth('2026-06'),
  createEmptyMonth('2026-07'),
  createEmptyMonth('2026-08'),
  createEmptyMonth('2026-09'),
  createEmptyMonth('2026-10'),
  createEmptyMonth('2026-11'),
  createEmptyMonth('2026-12'),
  createEmptyMonth('2027-01'),
  createEmptyMonth('2027-02'),
  createEmptyMonth('2027-03'),
];

export const revenueCategories = [
  { key: 'baemin', label: '배달의민족', color: '#2AC1BC' },
  { key: 'coupang', label: '쿠팡이츠', color: '#E0115F' },
  { key: 'yogiyo', label: '요기요', color: '#FA0050' },
  { key: 'takeout', label: '포장 주문', color: '#f59e0b' },
  { key: 'other', label: '기타', color: '#6b7280' },
];

export const expenseCategories = [
  { key: 'rent', label: '월세', color: '#ef4444' },
  { key: 'maintenance', label: '관리비', color: '#f97316' },
  { key: 'ingredients', label: '식재료비', color: '#eab308' },
  { key: 'packaging', label: '포장재', color: '#84cc16' },
  { key: 'platformFee', label: '플랫폼 수수료', color: '#22c55e' },
  { key: 'deliveryFee', label: '배달대행비', color: '#14b8a6' },
  { key: 'labor', label: '인건비', color: '#06b6d4' },
  { key: 'utility', label: '공과금', color: '#3b82f6' },
  { key: 'internet', label: '인터넷/통신', color: '#6366f1' },
  { key: 'advertising', label: '광고/마케팅', color: '#8b5cf6' },
  { key: 'equipment', label: '장비/비품', color: '#a855f7' },
  { key: 'other', label: '기타', color: '#6b7280' },
];

export const taxBenefitInfo = {
  title: '청년창업 세액감면',
  rate: 75,
  duration: 5,
  law: '조세특례제한법 제6조',
  region: '인천 중구 영종도 (성장관리권역)',
  ageRange: '만 15~34세 (병역 이행 시 최대 만 39세)',
  target: '소득세 (개인사업자)',
  excludedNote: '음식점업(KSIC 56)은 감면 대상 포함',
  steps: [
    '사업자등록 시 — 창업중소기업 세액감면 사전 체크',
    '최초 종합소득세 신고 시 (2027년 5월) — 감면 신청서 첨부',
    '필요 서류: 사업자등록증, 영업신고증, 주민등록등본, 병역증명서(해당 시)',
  ],
  warnings: [
    '기존 사업 승계/인수 시 창업 불인정 → 신규 사업자등록 필수',
    '반드시 본인(청년) 명의로 사업자등록',
    '동일 업종 폐업 후 재창업은 감면 불가',
    '수도권과밀억제권역이 아닌 성장관리권역이므로 75% 적용',
  ],
};

// ─── 30일 시뮬레이션 데이터 (4/27 ~ 5/26) ───

export const simDailyLogs = [
  // ── WEEK 1: 오픈 + 적응 (4/27~5/3) ──
  { date:'2026-04-27', orders:{baemin:11,coupang:4,yogiyo:1,takeout:4}, revenue:{baemin:112000,coupang:44000,yogiyo:10500,takeout:34000}, memo:'그랜드 오픈! 지인 주문 다수. 조리 동선 혼란, 첫 주문 할인 쿠폰 효과 좋음.' },
  { date:'2026-04-28', orders:{baemin:10,coupang:4,yogiyo:1,takeout:3}, revenue:{baemin:98000,coupang:38000,yogiyo:9000,takeout:25500}, memo:'첫 평일. 점심 11:30~13:00 집중. 제육덮밥·김치볶음밥 인기. 배달 평균 35분.' },
  { date:'2026-04-29', orders:{baemin:13,coupang:5,yogiyo:2,takeout:3}, revenue:{baemin:130000,coupang:52000,yogiyo:19000,takeout:27000}, memo:'첫 리뷰 3건! 평균 4.5점. 깐풍기덮밥 반응 좋음. 소스 별도 포장 확인.' },
  { date:'2026-04-30', orders:{baemin:14,coupang:6,yogiyo:2,takeout:3}, revenue:{baemin:142000,coupang:63000,yogiyo:21000,takeout:28500}, memo:'점심+저녁 피크 분리 성공. 양파 소진 빨라 추가 발주.' },
  { date:'2026-05-01', orders:{baemin:17,coupang:7,yogiyo:3,takeout:5}, revenue:{baemin:178500,coupang:73500,yogiyo:31500,takeout:47500}, memo:'근로자의 날! 주문 폭증. 쭈꾸미덮밥 인기 1위. 조리시간 평균 12분 안정.' },
  { date:'2026-05-02', orders:{baemin:16,coupang:6,yogiyo:2,takeout:4}, revenue:{baemin:163000,coupang:61000,yogiyo:20000,takeout:38000}, memo:'금요일 야간 주문 급증 (21시 이후 7건). 깐쇼+새우 세트 다수.' },
  { date:'2026-05-03', orders:{baemin:19,coupang:8,yogiyo:3,takeout:5}, revenue:{baemin:199500,coupang:84000,yogiyo:31500,takeout:47500}, memo:'토요일 최고 매출! 프리미엄 메뉴 비중 증가. 리뷰 이벤트 효과.' },
  // ── WEEK 2: 안정화 (5/4~5/10) ──
  { date:'2026-05-04', orders:{baemin:20,coupang:9,yogiyo:3,takeout:6}, revenue:{baemin:210000,coupang:94500,yogiyo:31500,takeout:54000}, memo:'어린이날 연휴! 역대 최고 38건. 오므라이스 어린이 주문 다수.' },
  { date:'2026-05-05', orders:{baemin:18,coupang:7,yogiyo:3,takeout:5}, revenue:{baemin:189000,coupang:73500,yogiyo:31500,takeout:47500}, memo:'어린이날. 가족 세트 비율 40%. 오후 비수기 여전.' },
  { date:'2026-05-06', orders:{baemin:15,coupang:6,yogiyo:2,takeout:4}, revenue:{baemin:153000,coupang:63000,yogiyo:21000,takeout:38000}, memo:'연휴 끝, 평일 복귀. 제육+깐풍기가 양대 인기 메뉴.' },
  { date:'2026-05-07', orders:{baemin:13,coupang:5,yogiyo:2,takeout:4}, revenue:{baemin:130000,coupang:52000,yogiyo:20000,takeout:36000}, memo:'수요일 소강. 점심 16건, 저녁 8건. 마파두부밥 첫 5건 돌파.' },
  { date:'2026-05-08', orders:{baemin:14,coupang:6,yogiyo:2,takeout:4}, revenue:{baemin:143000,coupang:62000,yogiyo:21000,takeout:38000}, memo:'목요일 안정적. 게살볶음밥 주문 증가 추세. 포장 비율 15%.' },
  { date:'2026-05-09', orders:{baemin:17,coupang:7,yogiyo:2,takeout:4}, revenue:{baemin:175000,coupang:72000,yogiyo:20500,takeout:39000}, memo:'금요일 저녁 피크. 깐쇼덮밥+유린기 세트 인기. 야간 5건.' },
  { date:'2026-05-10', orders:{baemin:20,coupang:8,yogiyo:3,takeout:5}, revenue:{baemin:208000,coupang:84000,yogiyo:31000,takeout:48000}, memo:'토요일. 점심~저녁 꾸준. 낙지덮밥 재주문 2건. 찜 수 50개 돌파.' },
  // ── WEEK 3: 성장 (5/11~5/17) ──
  { date:'2026-05-11', orders:{baemin:18,coupang:8,yogiyo:3,takeout:4}, revenue:{baemin:187000,coupang:83000,yogiyo:31000,takeout:38000}, memo:'일요일. 맘카페 홍보 효과 시작? 신규 고객 체감 증가.' },
  { date:'2026-05-12', orders:{baemin:15,coupang:5,yogiyo:2,takeout:4}, revenue:{baemin:153000,coupang:52000,yogiyo:20000,takeout:38000}, memo:'월요일. 공항 직원 점심 주문 패턴 발견 (11:30 집중).' },
  { date:'2026-05-13', orders:{baemin:16,coupang:6,yogiyo:2,takeout:4}, revenue:{baemin:164000,coupang:62000,yogiyo:21000,takeout:39000}, memo:'화요일. 제육+김치볶음밥 "가성비 세트" 자체 기획, 반응 좋음.' },
  { date:'2026-05-14', orders:{baemin:17,coupang:6,yogiyo:3,takeout:4}, revenue:{baemin:175000,coupang:63000,yogiyo:31000,takeout:39000}, memo:'수요일. 쿠팡이츠 포장 주문 증가 추세 (수수료 0% 유도 효과).' },
  { date:'2026-05-15', orders:{baemin:16,coupang:6,yogiyo:3,takeout:4}, revenue:{baemin:165000,coupang:62000,yogiyo:31000,takeout:38000}, memo:'목요일. 안정적. 조리시간 평균 10분대 정착. 오징어덮밥 3위.' },
  { date:'2026-05-16', orders:{baemin:21,coupang:8,yogiyo:3,takeout:5}, revenue:{baemin:218000,coupang:84000,yogiyo:31000,takeout:48000}, memo:'금요일 비! 배달 주문 급증. 일 37건 신기록. 식재료 저녁에 부족.' },
  { date:'2026-05-17', orders:{baemin:22,coupang:9,yogiyo:4,takeout:5}, revenue:{baemin:231000,coupang:94000,yogiyo:42000,takeout:49000}, memo:'토요일 최고 매출 갱신! 40건. 해물덮밥 6건. 리뷰 20건 돌파.' },
  // ── WEEK 4: 자리잡기 (5/18~5/24) ──
  { date:'2026-05-18', orders:{baemin:20,coupang:8,yogiyo:3,takeout:5}, revenue:{baemin:208000,coupang:84000,yogiyo:31000,takeout:48000}, memo:'일요일. 안정적 36건. 재주문 고객 체감 증가.' },
  { date:'2026-05-19', orders:{baemin:16,coupang:6,yogiyo:2,takeout:4}, revenue:{baemin:164000,coupang:62000,yogiyo:20000,takeout:38000}, memo:'월요일. 점심 집중. 깐풍기덮밥 누적 1위 등극. 네이버 플레이스 유입 시작.' },
  { date:'2026-05-20', orders:{baemin:20,coupang:7,yogiyo:3,takeout:5}, revenue:{baemin:208000,coupang:73000,yogiyo:31000,takeout:49000}, memo:'화요일 비. 35건. 비 오는 날 평균 +25% 확인. 김치볶음밥 1위 탈환.' },
  { date:'2026-05-21', orders:{baemin:17,coupang:6,yogiyo:3,takeout:4}, revenue:{baemin:175000,coupang:63000,yogiyo:31000,takeout:39000}, memo:'수요일. 30건 안정. 라조기덮밥 단골 형성 중 (재주문 5회 고객 발견).' },
  { date:'2026-05-22', orders:{baemin:17,coupang:7,yogiyo:3,takeout:4}, revenue:{baemin:176000,coupang:73000,yogiyo:31000,takeout:38000}, memo:'목요일. 31건. 중화덮밥 카테고리 전체 비중 30% 도달.' },
  { date:'2026-05-23', orders:{baemin:20,coupang:8,yogiyo:3,takeout:5}, revenue:{baemin:208000,coupang:84000,yogiyo:31000,takeout:49000}, memo:'금요일. 36건. 야간 매출 비중 20% 돌파. 공항 교대 근무자 패턴.' },
  { date:'2026-05-24', orders:{baemin:23,coupang:10,yogiyo:4,takeout:5}, revenue:{baemin:241000,coupang:105000,yogiyo:42000,takeout:49000}, memo:'토요일 역대 최고! 42건. 배민 깃발 추가 검토 시작. 월 900건 돌파 임박.' },
  // ── 마무리 (5/25~5/26) ──
  { date:'2026-05-25', orders:{baemin:21,coupang:9,yogiyo:3,takeout:5}, revenue:{baemin:218000,coupang:94000,yogiyo:31000,takeout:49000}, memo:'일요일 38건. 이번 달 총 리뷰 30건 달성! 별점 4.2 유지.' },
  { date:'2026-05-26', orders:{baemin:16,coupang:6,yogiyo:3,takeout:4}, revenue:{baemin:165000,coupang:63000,yogiyo:31000,takeout:39000}, memo:'월요일. 첫 달 마무리. 29건. 다음 달 목표: 일평균 35건, 별점 4.5.' },
];

export const simReviews = [
  // Week 1
  { id:'r1', date:'2026-04-29', platform:'baemin', rating:5, customerComment:'새로 오픈한 집인데 양도 많고 맛있어요! 제육덮밥 소스가 찐이에요.', menuName:'제육덮밥', keywords:['양 많다','소스 맛있다'], sentiment:'positive', replied:true, replyText:'소중한 첫 리뷰 감사합니다! 😊', createdAt:'2026-04-29' },
  { id:'r2', date:'2026-04-29', platform:'baemin', rating:4, customerComment:'깐풍기덮밥 닭이 바삭하고 소스가 달콤매콤. 밥이 좀 적은 느낌?', menuName:'깐풍기덮밥', keywords:['바삭하다','밥 적다'], sentiment:'positive', replied:true, replyText:'감사합니다! 다음엔 밥 추가 서비스 드릴게요!', createdAt:'2026-04-29' },
  { id:'r3', date:'2026-04-30', platform:'coupang', rating:5, customerComment:'김치볶음밥 가성비 최고! 이 가격에 이 양이면 매일 시켜먹겠습니다', menuName:'김치볶음밥', keywords:['가성비','양 많다'], sentiment:'positive', replied:true, replyText:'매일 기다리겠습니다! 🙏', createdAt:'2026-04-30' },
  { id:'r4', date:'2026-05-01', platform:'baemin', rating:3, customerComment:'맛은 괜찮은데 배달이 좀 늦었어요. 45분 걸렸습니다.', menuName:'새우볶음밥', keywords:['배달 느리다'], sentiment:'negative', replied:true, replyText:'죄송합니다. 배달대행사와 협의하겠습니다.', createdAt:'2026-05-01' },
  { id:'r5', date:'2026-05-01', platform:'baemin', rating:5, customerComment:'쭈꾸미덮밥 매콤하니 진짜 맛있네요!! 소스 별도 포장 센스 좋아요', menuName:'쭈꾸미덮밥', keywords:['매콤','양 많다','소스 별도'], sentiment:'positive', replied:true, replyText:'소스 별도 포장 알아봐 주셔서 감사합니다! 😊', createdAt:'2026-05-01' },
  { id:'r6', date:'2026-05-02', platform:'coupang', rating:5, customerComment:'유린기덮밥 새콤달콤 소스에 바삭한 닭고기 조합이 미쳤어요', menuName:'유린기덮밥', keywords:['새콤달콤','바삭하다'], sentiment:'positive', replied:false, replyText:'', createdAt:'2026-05-02' },
  { id:'r7', date:'2026-05-03', platform:'baemin', rating:4, customerComment:'해물덮밥 새우, 오징어, 홍합 다 들어있어서 좋았어요. 가격대비 괜찮음', menuName:'해물덮밥', keywords:['해물 푸짐','가성비'], sentiment:'positive', replied:true, replyText:'푸짐하게 드셨다니 기쁩니다! 😊', createdAt:'2026-05-03' },
  { id:'r8', date:'2026-05-03', platform:'baemin', rating:5, customerComment:'라조기덮밥 얼얼한 매운맛이 중독성 있어요. 재주문 3번째입니다 ㅋㅋ', menuName:'라조기덮밥', keywords:['매운맛','중독성','재주문'], sentiment:'positive', replied:true, replyText:'3번째 주문이라니 감동입니다! 🔥', createdAt:'2026-05-03' },
  // Week 2
  { id:'r9', date:'2026-05-04', platform:'yogiyo', rating:4, customerComment:'오므라이스 아이가 좋아해요. 어린이날 잘 먹었습니다!', menuName:'오므라이스', keywords:['아이 좋아함'], sentiment:'positive', replied:true, replyText:'어린이날 맛있게 드셨다니 감사합니다!', createdAt:'2026-05-04' },
  { id:'r10', date:'2026-05-04', platform:'baemin', rating:2, customerComment:'짜장볶음밥 좀 짜고 양이 생각보다 적었어요', menuName:'짜장볶음밥', keywords:['짜다','양 적다'], sentiment:'negative', replied:true, replyText:'간 조절과 양에 더 신경 쓰겠습니다!', createdAt:'2026-05-04' },
  { id:'r11', date:'2026-05-05', platform:'baemin', rating:5, customerComment:'낙지덮밥 낙지가 부드럽고 양념이 끝내줍니다. 영종도에 이런 곳이 생겨서 다행', menuName:'낙지덮밥', keywords:['부드럽다','양념 맛있다','영종도'], sentiment:'positive', replied:true, replyText:'영종도 주민분께 사랑받겠습니다! 🙏', createdAt:'2026-05-05' },
  { id:'r12', date:'2026-05-06', platform:'coupang', rating:4, customerComment:'게살볶음밥 깔끔하고 맛있어요. 포장도 깔끔합니다.', menuName:'게살볶음밥', keywords:['깔끔','포장 좋다'], sentiment:'positive', replied:false, replyText:'', createdAt:'2026-05-06' },
  { id:'r13', date:'2026-05-07', platform:'baemin', rating:5, customerComment:'마파두부밥 처음 시켰는데 두부가 부드럽고 소스가 매콤 고소해요!', menuName:'마파두부밥', keywords:['부드럽다','매콤 고소'], sentiment:'positive', replied:true, replyText:'마파두부밥도 좋아해 주셔서 감사합니다!', createdAt:'2026-05-07' },
  { id:'r14', date:'2026-05-09', platform:'baemin', rating:3, customerComment:'깐쇼덮밥 새우 크기가 좀 작았어요. 맛은 괜찮습니다.', menuName:'깐쇼덮밥', keywords:['새우 작다'], sentiment:'neutral', replied:true, replyText:'더 큰 새우로 개선하겠습니다. 감사합니다!', createdAt:'2026-05-09' },
  { id:'r15', date:'2026-05-10', platform:'coupang', rating:5, customerComment:'제육덮밥 3번째 주문! 양도 많고 맛 변함없이 최고입니다', menuName:'제육덮밥', keywords:['재주문','양 많다','맛 일정'], sentiment:'positive', replied:true, replyText:'3번째 주문 감사합니다! 항상 같은 맛으로 보답할게요!', createdAt:'2026-05-10' },
  // Week 3
  { id:'r16', date:'2026-05-11', platform:'baemin', rating:4, customerComment:'오징어덮밥 오징어가 쫄깃하고 양념이 밥이랑 잘 어울려요', menuName:'오징어덮밥', keywords:['쫄깃','양념 맛있다'], sentiment:'positive', replied:true, replyText:'오징어 매일 신선하게 손질합니다! 감사합니다!', createdAt:'2026-05-11' },
  { id:'r17', date:'2026-05-12', platform:'baemin', rating:1, customerComment:'배달 와서 열어보니 국물이 다 새서 밥이 다 젖었어요. 너무 실망.', menuName:'해물덮밥', keywords:['국물 샘','포장 불량'], sentiment:'negative', replied:true, replyText:'정말 죄송합니다. 즉시 재배달 도와드리겠습니다. 포장을 보강하겠습니다.', createdAt:'2026-05-12' },
  { id:'r18', date:'2026-05-13', platform:'coupang', rating:5, customerComment:'김치볶음밥+교자만두 세트로 시켰는데 완벽한 조합이에요', menuName:'김치볶음밥', keywords:['세트 좋다','완벽한 조합'], sentiment:'positive', replied:true, replyText:'세트 조합 추천 감사합니다! 다음엔 서비스 드릴게요!', createdAt:'2026-05-13' },
  { id:'r19', date:'2026-05-14', platform:'baemin', rating:5, customerComment:'새우볶음밥 새우가 탱탱하고 양이 많아서 좋아요. 단골 될 것 같습니다', menuName:'새우볶음밥', keywords:['새우 탱탱','양 많다','단골'], sentiment:'positive', replied:true, replyText:'단골이 되어 주신다니 감사합니다! 💪', createdAt:'2026-05-14' },
  { id:'r20', date:'2026-05-16', platform:'baemin', rating:4, customerComment:'비 오는 날 깐풍기덮밥 배달시켰는데 따뜻하게 잘 왔어요. 맛있습니다!', menuName:'깐풍기덮밥', keywords:['따뜻하게 배달','맛있다'], sentiment:'positive', replied:true, replyText:'비 오는 날도 찾아주셔서 감사합니다! ☔', createdAt:'2026-05-16' },
  { id:'r21', date:'2026-05-17', platform:'yogiyo', rating:5, customerComment:'쭈꾸미덮밥 양이 진짜 많아요. 소스도 맛있고 가격도 적당해요', menuName:'쭈꾸미덮밥', keywords:['양 많다','소스 맛있다','가격 적당'], sentiment:'positive', replied:true, replyText:'푸짐하게 드셨다니 기쁩니다! 😊', createdAt:'2026-05-17' },
  // Week 4
  { id:'r22', date:'2026-05-18', platform:'baemin', rating:5, customerComment:'라조기덮밥 5번째 주문입니다. 매운맛이 일정하고 중독됩니다', menuName:'라조기덮밥', keywords:['재주문','매운맛','맛 일정'], sentiment:'positive', replied:true, replyText:'5번째! 최고의 단골이세요! 🔥', createdAt:'2026-05-18' },
  { id:'r23', date:'2026-05-19', platform:'coupang', rating:4, customerComment:'마파두부밥 양은 적당한데 좀 더 매웠으면 좋겠어요', menuName:'마파두부밥', keywords:['매운맛 부족'], sentiment:'positive', replied:true, replyText:'매운맛 요청 주시면 맞춰드리겠습니다! 감사합니다!', createdAt:'2026-05-19' },
  { id:'r24', date:'2026-05-20', platform:'baemin', rating:3, customerComment:'비 와서 시켰는데 배달 50분 걸렸어요. 음식은 맛있는데 배달이...', menuName:'제육덮밥', keywords:['배달 느리다','맛있다'], sentiment:'neutral', replied:true, replyText:'비 오는 날 배달 지연 죄송합니다. 개선하겠습니다!', createdAt:'2026-05-20' },
  { id:'r25', date:'2026-05-21', platform:'baemin', rating:5, customerComment:'유린기덮밥 소스가 정말 맛있어요. 치킨보다 이게 낫다', menuName:'유린기덮밥', keywords:['소스 맛있다','치킨보다 낫다'], sentiment:'positive', replied:true, replyText:'치킨보다 낫다니 최고의 칭찬이에요! 😊', createdAt:'2026-05-21' },
  { id:'r26', date:'2026-05-22', platform:'baemin', rating:4, customerComment:'낙지덮밥 매콤한 게 술안주로도 좋아요. 밤에 시켜먹기 딱', menuName:'낙지덮밥', keywords:['매콤','야식','술안주'], sentiment:'positive', replied:true, replyText:'야간 메뉴로 인기! 감사합니다 🌙', createdAt:'2026-05-22' },
  { id:'r27', date:'2026-05-23', platform:'coupang', rating:5, customerComment:'깐쇼덮밥 진짜 중국집 수준이에요. 소스가 달콤하고 새우가 바삭', menuName:'깐쇼덮밥', keywords:['중국집 수준','달콤','바삭'], sentiment:'positive', replied:false, replyText:'', createdAt:'2026-05-23' },
  { id:'r28', date:'2026-05-24', platform:'baemin', rating:2, customerComment:'오므라이스 계란이 좀 타있었어요. 속상합니다.', menuName:'오므라이스', keywords:['계란 탐','조리 실수'], sentiment:'negative', replied:true, replyText:'정말 죄송합니다. 조리 과정을 점검하여 재발 방지하겠습니다. 서비스 드릴게요!', createdAt:'2026-05-24' },
  { id:'r29', date:'2026-05-25', platform:'baemin', rating:5, customerComment:'한 달째 단골입니다. 제육+깐풍기 번갈아 시키는데 둘 다 맛 변함없어요', menuName:'제육덮밥', keywords:['단골','맛 일정','재주문'], sentiment:'positive', replied:true, replyText:'한 달 단골 감사합니다! 앞으로도 변함없는 맛 약속드려요! 🙏', createdAt:'2026-05-25' },
  { id:'r30', date:'2026-05-26', platform:'yogiyo', rating:4, customerComment:'게살볶음밥 가볍게 먹기 좋아요. 계란후라이 추가하니 완벽', menuName:'게살볶음밥', keywords:['가볍다','계란후라이 추가'], sentiment:'positive', replied:false, replyText:'', createdAt:'2026-05-26' },
];

export const simWeatherLogs = [
  // Week 1
  { id:'w1', date:'2026-04-27', weather:'sunny', temperature:18, orders:20, revenue:200500 },
  { id:'w2', date:'2026-04-28', weather:'sunny', temperature:19, orders:18, revenue:170500 },
  { id:'w3', date:'2026-04-29', weather:'cloudy', temperature:17, orders:23, revenue:228000 },
  { id:'w4', date:'2026-04-30', weather:'sunny', temperature:20, orders:25, revenue:254500 },
  { id:'w5', date:'2026-05-01', weather:'rainy', temperature:15, orders:32, revenue:331000 },
  { id:'w6', date:'2026-05-02', weather:'cloudy', temperature:17, orders:28, revenue:282000 },
  { id:'w7', date:'2026-05-03', weather:'sunny', temperature:21, orders:35, revenue:362500 },
  // Week 2
  { id:'w8', date:'2026-05-04', weather:'sunny', temperature:22, orders:38, revenue:390000 },
  { id:'w9', date:'2026-05-05', weather:'cloudy', temperature:19, orders:33, revenue:341500 },
  { id:'w10', date:'2026-05-06', weather:'sunny', temperature:20, orders:27, revenue:275000 },
  { id:'w11', date:'2026-05-07', weather:'sunny', temperature:21, orders:24, revenue:238000 },
  { id:'w12', date:'2026-05-08', weather:'cloudy', temperature:19, orders:26, revenue:264000 },
  { id:'w13', date:'2026-05-09', weather:'sunny', temperature:22, orders:30, revenue:306500 },
  { id:'w14', date:'2026-05-10', weather:'sunny', temperature:23, orders:36, revenue:371000 },
  // Week 3
  { id:'w15', date:'2026-05-11', weather:'cloudy', temperature:20, orders:33, revenue:339000 },
  { id:'w16', date:'2026-05-12', weather:'sunny', temperature:21, orders:26, revenue:263000 },
  { id:'w17', date:'2026-05-13', weather:'sunny', temperature:22, orders:28, revenue:286000 },
  { id:'w18', date:'2026-05-14', weather:'sunny', temperature:23, orders:30, revenue:308000 },
  { id:'w19', date:'2026-05-15', weather:'cloudy', temperature:20, orders:29, revenue:296000 },
  { id:'w20', date:'2026-05-16', weather:'rainy', temperature:16, orders:37, revenue:381000 },
  { id:'w21', date:'2026-05-17', weather:'sunny', temperature:22, orders:40, revenue:416000 },
  // Week 4
  { id:'w22', date:'2026-05-18', weather:'sunny', temperature:23, orders:36, revenue:371000 },
  { id:'w23', date:'2026-05-19', weather:'sunny', temperature:24, orders:28, revenue:284000 },
  { id:'w24', date:'2026-05-20', weather:'rainy', temperature:17, orders:35, revenue:361000 },
  { id:'w25', date:'2026-05-21', weather:'cloudy', temperature:19, orders:30, revenue:308000 },
  { id:'w26', date:'2026-05-22', weather:'sunny', temperature:22, orders:31, revenue:318000 },
  { id:'w27', date:'2026-05-23', weather:'sunny', temperature:24, orders:36, revenue:372000 },
  { id:'w28', date:'2026-05-24', weather:'sunny', temperature:25, orders:42, revenue:437000 },
  // Day 29-30
  { id:'w29', date:'2026-05-25', weather:'cloudy', temperature:22, orders:38, revenue:392000 },
  { id:'w30', date:'2026-05-26', weather:'sunny', temperature:23, orders:29, revenue:298000 },
];
