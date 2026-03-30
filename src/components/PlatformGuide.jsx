import { useState } from 'react';
import { Info, AlertTriangle, ExternalLink, CheckCircle2, Clock, CreditCard, Truck, Percent, Store, Star, Shield } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('ko-KR');

export default function PlatformGuide() {
  const [tab, setTab] = useState('compare');

  const tabs = [
    { id: 'compare', label: '수수료 비교표', icon: Percent },
    { id: 'baemin', label: '배달의민족', icon: Store },
    { id: 'coupang', label: '쿠팡이츠', icon: Store },
    { id: 'yogiyo', label: '요기요', icon: Store },
    { id: 'signup', label: '입점 절차', icon: CheckCircle2 },
  ];

  return (
    <div className="pg">
      <div className="pg-header">
        <div>
          <h1>배달 플랫폼 가이드</h1>
          <p>배달의민족, 쿠팡이츠, 요기요 수수료 체계 및 서비스 비교</p>
        </div>
      </div>

      <div className="pg-notice">
        <AlertTriangle size={16} />
        <div>
          <strong>데이터 기준: 2025년 2분기 ~ 2026년 1분기 공개 보도 자료</strong>
          <p>배달 플랫폼 수수료는 수시로 변경됩니다. 아래 정보는 뉴스 보도 및 공식 발표를 기반으로 정리했으나, 반드시 각 플랫폼 사장님 포털에서 최신 요금을 확인하세요.</p>
        </div>
      </div>

      <div className="pg-tabs">
        {tabs.map(t => {
          const Icon = t.icon;
          return <button key={t.id} className={`pg-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}><Icon size={16} /> {t.label}</button>;
        })}
      </div>

      {/* ========== 비교표 ========== */}
      {tab === 'compare' && (
        <div>
          <div className="pg-card">
            <h3><Percent size={16} /> 3사 수수료 비교표</h3>
            <div className="pg-table-wrap">
              <table className="pg-table">
                <thead>
                  <tr>
                    <th>항목</th>
                    <th><span className="pg-badge baemin">배달의민족</span></th>
                    <th><span className="pg-badge coupang">쿠팡이츠</span></th>
                    <th><span className="pg-badge yogiyo">요기요</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pg-item-name">중개 수수료</td>
                    <td>2.0% ~ 7.8%</td>
                    <td>2.0% ~ 7.8%</td>
                    <td>4.7% ~ 9.7%</td>
                  </tr>
                  <tr>
                    <td className="pg-item-name">수수료 기준</td>
                    <td>3개월 평균 일매출 (상대 순위)</td>
                    <td>월 매출 (후불 환급형)</td>
                    <td>월 주문 건수</td>
                  </tr>
                  <tr>
                    <td className="pg-item-name">신규 입점 기본 수수료</td>
                    <td>7.8%</td>
                    <td>7.8% (후 환급)</td>
                    <td>9.7%</td>
                  </tr>
                  <tr>
                    <td className="pg-item-name">포장/픽업 수수료</td>
                    <td className="pg-warn">6.8% (2025.4~)</td>
                    <td className="pg-good">0% (무료)</td>
                    <td>2.7% ~ 7.7%</td>
                  </tr>
                  <tr>
                    <td className="pg-item-name">배달비 (업주 부담)</td>
                    <td>1,900 ~ 3,400원</td>
                    <td>1,900 ~ 3,400원</td>
                    <td>1,900 ~ 2,900원</td>
                  </tr>
                  <tr>
                    <td className="pg-item-name">결제 수수료 (PG)</td>
                    <td>1.4% ~ 3.0%</td>
                    <td>~3.0 ~ 3.3%</td>
                    <td>~3.3%</td>
                  </tr>
                  <tr>
                    <td className="pg-item-name">정산 주기</td>
                    <td>일정산, D+3 영업일</td>
                    <td>일정산, D+3 역일</td>
                    <td>일정산, D+5 영업일</td>
                  </tr>
                  <tr>
                    <td className="pg-item-name">시장 점유율 (2026 추정)</td>
                    <td><strong>~58-60%</strong></td>
                    <td>~25-27%</td>
                    <td>~12-14%</td>
                  </tr>
                  <tr>
                    <td className="pg-item-name">주문당 총 비용 (추정)</td>
                    <td>~25-30%</td>
                    <td>~25-30%</td>
                    <td>~25-30%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 수수료 구간 비교 */}
          <div className="pg-card">
            <h3><Star size={16} /> 상생요금제 수수료 구간 (배민 & 쿠팡이츠 동일)</h3>
            <p className="pg-desc">2025년 2월(배민) / 4월(쿠팡) 시행. 매출 순위 기준 차등 적용.</p>
            <div className="pg-table-wrap">
              <table className="pg-table">
                <thead>
                  <tr><th>매출 구간</th><th>중개 수수료</th><th>업주 부담 배달비</th><th>비고</th></tr>
                </thead>
                <tbody>
                  <tr className="pg-row-highlight">
                    <td>하위 20% (소규모)</td>
                    <td className="pg-good"><strong>2.0%</strong></td>
                    <td>1,900 ~ 2,900원</td>
                    <td>소상공인 우대</td>
                  </tr>
                  <tr>
                    <td>상위 50~80%</td>
                    <td><strong>6.8%</strong></td>
                    <td>1,900 ~ 2,900원</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>상위 35~50%</td>
                    <td><strong>6.8%</strong></td>
                    <td>2,100 ~ 3,100원</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>상위 35% 이내 (대형)</td>
                    <td className="pg-warn"><strong>7.8%</strong></td>
                    <td>2,400 ~ 3,400원</td>
                    <td>신규 입점 시 기본 적용</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="pg-info-box">
              <Info size={14} />
              <span>정확한 원(₩) 기준 매출 구간은 공개되지 않습니다. 전체 입점 업체 간 상대적 순위로 산정됩니다.</span>
            </div>
          </div>

          {/* 실제 비용 시뮬레이션 */}
          <div className="pg-card">
            <h3><CreditCard size={16} /> 주문 1건당 실제 비용 시뮬레이션</h3>
            <p className="pg-desc">주문금액 12,000원, 중개수수료 7.8% (신규), 배달비 2,900원 기준</p>
            <div className="pg-sim-grid">
              {[
                { name: '배달의민족', color: '#2AC1BC', commission: 7.8, pg: 2.15, delivery: 2900 },
                { name: '쿠팡이츠', color: '#E0115F', commission: 7.8, pg: 3.3, delivery: 2900 },
                { name: '요기요', color: '#FA0050', commission: 9.7, pg: 3.3, delivery: 2400 },
              ].map(p => {
                const orderPrice = 12000;
                const commissionFee = Math.round(orderPrice * p.commission / 100);
                const commissionVat = Math.round(commissionFee * 0.1);
                const pgFee = Math.round(orderPrice * p.pg / 100);
                const totalDeduct = commissionFee + commissionVat + pgFee + p.delivery;
                const net = orderPrice - totalDeduct;
                return (
                  <div key={p.name} className="pg-sim-card" style={{ borderTopColor: p.color }}>
                    <h4 style={{ color: p.color }}>{p.name}</h4>
                    <table className="pg-sim-table">
                      <tbody>
                        <tr><td>주문금액</td><td className="r">{fmt(orderPrice)}원</td></tr>
                        <tr><td>중개수수료 ({p.commission}%)</td><td className="r neg">-{fmt(commissionFee)}원</td></tr>
                        <tr><td>수수료 부가세 (10%)</td><td className="r neg">-{fmt(commissionVat)}원</td></tr>
                        <tr><td>PG수수료 ({p.pg}%)</td><td className="r neg">-{fmt(pgFee)}원</td></tr>
                        <tr><td>배달비 (업주부담)</td><td className="r neg">-{fmt(p.delivery)}원</td></tr>
                        <tr className="pg-sim-total"><td><strong>실수령액</strong></td><td className="r"><strong>{fmt(net)}원</strong></td></tr>
                        <tr><td>실수령률</td><td className="r"><strong>{(net / orderPrice * 100).toFixed(1)}%</strong></td></tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== 배달의민족 상세 ========== */}
      {tab === 'baemin' && (
        <div>
          <div className="pg-platform-header baemin-bg">
            <h2>배달의민족</h2>
            <p>우아한형제들 (Delivery Hero) | 시장점유율 약 58~60%</p>
          </div>

          <div className="pg-card">
            <h3>서비스 유형</h3>
            <div className="pg-service-grid">
              <div className="pg-service">
                <h4>배민1플러스 (배민배달)</h4>
                <p>플랫폼이 배달까지 중개하는 서비스</p>
                <ul>
                  <li>중개수수료: <strong>2.0% ~ 7.8%</strong> (상생요금제)</li>
                  <li>업주 부담 배달비: 1,900 ~ 3,400원 (거리별)</li>
                  <li>신규 입점 시 7.8% 기본 적용</li>
                  <li>3개월마다 매출 순위 기반 재산정</li>
                </ul>
              </div>
              <div className="pg-service">
                <h4>오픈리스트 (가게배달)</h4>
                <p>주문만 중개, 배달은 가게가 직접</p>
                <ul>
                  <li>중개수수료: <strong>6.8%</strong> (고정)</li>
                  <li>배달은 자체 또는 배달대행 이용</li>
                  <li>구 울트라콜 대체 상품</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pg-card">
            <h3><AlertTriangle size={16} /> 주요 변경 사항</h3>
            <div className="pg-timeline">
              <div className="pg-tl-item">
                <span className="pg-tl-date">2025.02.26</span>
                <span className="pg-tl-text">상생요금제 시행 — 수수료 9.8% → 2.0~7.8% 차등 전환</span>
              </div>
              <div className="pg-tl-item">
                <span className="pg-tl-date">2025.04.14</span>
                <span className="pg-tl-text warn">포장 주문 수수료 6.8% 유료 전환 (기존 무료)</span>
              </div>
              <div className="pg-tl-item">
                <span className="pg-tl-date">2025.07.31</span>
                <span className="pg-tl-text">울트라콜 완전 폐지 (월 88,000원/깃발 → 폐지)</span>
              </div>
            </div>
          </div>

          <div className="pg-card">
            <h3><CreditCard size={16} /> 결제 수수료 (PG)</h3>
            <div className="pg-table-wrap">
              <table className="pg-table sm">
                <thead><tr><th>연 매출</th><th>PG 수수료</th></tr></thead>
                <tbody>
                  <tr><td>3억 이하 (영세)</td><td><strong>1.4%</strong></td></tr>
                  <tr><td>3~5억</td><td><strong>2.0%</strong></td></tr>
                  <tr><td>5~10억 (중소)</td><td><strong>2.15%</strong></td></tr>
                  <tr><td>10~30억</td><td><strong>2.4%</strong></td></tr>
                  <tr><td>30억 초과 / 신규</td><td><strong>3.0%</strong></td></tr>
                </tbody>
              </table>
            </div>
            <p className="pg-note">2025.02.14 기준 0.1%p 인하 적용</p>
          </div>

          <div className="pg-card">
            <h3><Clock size={16} /> 정산</h3>
            <ul className="pg-feature-list">
              <li><strong>일정산, D+3 영업일</strong> 입금</li>
              <li>주말/공휴일 제외, 영업일 기준</li>
              <li>2022년 D+4 → D+3으로 단축</li>
            </ul>
          </div>
        </div>
      )}

      {/* ========== 쿠팡이츠 상세 ========== */}
      {tab === 'coupang' && (
        <div>
          <div className="pg-platform-header coupang-bg">
            <h2>쿠팡이츠</h2>
            <p>쿠팡 | 시장점유율 약 25~27% | 단건배달 전문</p>
          </div>

          <div className="pg-card">
            <h3>수수료 체계 (상생요금제, 2025.04~)</h3>
            <div className="pg-service-grid">
              <div className="pg-service highlight-green">
                <h4>핵심 차이점: 월별 후불 환급형</h4>
                <p>한 달간 모든 주문에 <strong>7.8%</strong>를 일괄 적용한 후, 월말에 실제 매출 기준 등급을 산정하여 <strong>차액을 익월 5영업일 이내 환급</strong></p>
                <ul>
                  <li>배민은 3개월 단위 사전 적용 ↔ 쿠팡은 매월 사후 환급</li>
                  <li>신규 입점 첫 달부터 실제 매출 기반 환급 가능</li>
                  <li>단점: 실제 비용을 다음 달에야 확인 가능</li>
                </ul>
              </div>
            </div>
            <div className="pg-table-wrap">
              <table className="pg-table sm">
                <thead><tr><th>매출 구간</th><th>수수료</th><th>배달비</th></tr></thead>
                <tbody>
                  <tr><td>하위 20%</td><td className="pg-good"><strong>2.0%</strong></td><td>1,900~2,900원</td></tr>
                  <tr><td>상위 50~80%</td><td><strong>6.8%</strong></td><td>1,900~2,900원</td></tr>
                  <tr><td>상위 35~50%</td><td><strong>6.8%</strong></td><td>2,100~3,100원</td></tr>
                  <tr><td>상위 35% 이내</td><td><strong>7.8%</strong></td><td>2,400~3,400원</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pg-card">
            <h3><Shield size={16} /> 쿠팡이츠 장점</h3>
            <ul className="pg-feature-list">
              <li className="pg-good-item"><strong>포장 주문 수수료 0% (무료)</strong> — 배민 6.8% 대비 큰 차이</li>
              <li>단건배달로 배달 품질 우수</li>
              <li>신규 입점 첫 달부터 환급 적용</li>
              <li>쿠팡 생태계 (로켓배송 고객층) 연계</li>
            </ul>
          </div>

          <div className="pg-card">
            <h3><Clock size={16} /> 정산</h3>
            <ul className="pg-feature-list">
              <li><strong>일정산, D+3 역일</strong> (영업일 아닌 달력일 기준)</li>
              <li>주말에는 입금 없음</li>
              <li>기존 D+7에서 D+3으로 단축됨</li>
            </ul>
          </div>

          <div className="pg-card">
            <h3>비용 예시 (25,000원 주문, 7.8% 구간)</h3>
            <table className="pg-table sm">
              <tbody>
                <tr><td>중개수수료 (7.8%)</td><td className="r">-1,950원</td></tr>
                <tr><td>수수료 부가세</td><td className="r">-195원</td></tr>
                <tr><td>PG수수료 (~3.3%)</td><td className="r">-825원</td></tr>
                <tr className="pg-sim-total"><td><strong>총 공제 (배달비 제외)</strong></td><td className="r"><strong>-2,970원</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== 요기요 상세 ========== */}
      {tab === 'yogiyo' && (
        <div>
          <div className="pg-platform-header yogiyo-bg">
            <h2>요기요</h2>
            <p>GS리테일 | 시장점유율 약 12~14%</p>
          </div>

          <div className="pg-card">
            <h3>수수료 체계 (차등수수료제, 2024.11~)</h3>
            <div className="pg-service highlight-blue">
              <h4>핵심 차이점: 주문 건수 기반 (매출액이 아님)</h4>
              <p>배민/쿠팡이 매출액 순위로 수수료를 매기는 것과 달리, 요기요는 <strong>월 주문 건수</strong>가 많을수록 수수료가 <strong>낮아지는</strong> 구조</p>
            </div>
            <div className="pg-table-wrap">
              <table className="pg-table sm">
                <thead><tr><th>구간 (월 주문수 기준)</th><th>배달 수수료</th><th>포장 수수료</th></tr></thead>
                <tbody>
                  <tr><td>1구간 (최소 주문)</td><td><strong>9.7%</strong></td><td><strong>7.7%</strong></td></tr>
                  <tr><td>2구간</td><td><strong>8.7%</strong></td><td>-</td></tr>
                  <tr><td>3구간</td><td><strong>7.7%</strong></td><td>-</td></tr>
                  <tr><td>4구간 (최대 주문)</td><td className="pg-good"><strong>4.7%</strong></td><td className="pg-good"><strong>2.7%</strong></td></tr>
                </tbody>
              </table>
            </div>
            <div className="pg-info-box">
              <Info size={14} />
              <span>구간별 정확한 주문 건수 기준은 공개되지 않았습니다. 주문량이 많아질수록 누진적으로 낮은 수수료가 적용됩니다.</span>
            </div>
          </div>

          <div className="pg-card">
            <h3><Shield size={16} /> 요기요 특징</h3>
            <ul className="pg-feature-list">
              <li><strong>사장님 포인트 환급:</strong> 매출 하위 40% 업체에 수수료의 20%를 포인트로 환급 (1년 한정)</li>
              <li>포인트 용도: 할인랭킹, 요타임딜, 가게쿠폰 등 광고에 사용</li>
              <li>요기배달(플랫폼배달) + 가게배달 모두 지원</li>
              <li>배달비: 요기배달 1,900~2,900원</li>
            </ul>
          </div>

          <div className="pg-card">
            <h3><Clock size={16} /> 정산</h3>
            <ul className="pg-feature-list">
              <li><strong>일정산, D+5 영업일</strong> (배민 D+3, 쿠팡 D+3 대비 가장 느림)</li>
              <li>2024.08 기준 주 1회 → 일정산 전환</li>
            </ul>
          </div>

          <div className="pg-card">
            <h3>비용 예시 (20,000원 주문, 9.7% 구간)</h3>
            <table className="pg-table sm">
              <tbody>
                <tr><td>중개수수료 (9.7%)</td><td className="r">-1,940원</td></tr>
                <tr><td>PG수수료 (~3.3%)</td><td className="r">-660원</td></tr>
                <tr><td>배달비+부가세</td><td className="r">-3,190원</td></tr>
                <tr className="pg-sim-total"><td><strong>총 공제</strong></td><td className="r"><strong>-5,790원 (~29%)</strong></td></tr>
                <tr><td><strong>실수령액</strong></td><td className="r"><strong>~14,210원 (~71%)</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== 입점 절차 ========== */}
      {tab === 'signup' && (
        <div>
          <div className="pg-card">
            <h3><CheckCircle2 size={16} /> 공통 필요 서류</h3>
            <div className="pg-docs-grid">
              {['사업자등록증', '영업신고증 (일반음식점)', '대표자 신분증', '통장 사본 (정산용)', '메뉴 사진 (최소 3장 이상)', '가게 외관/내부 사진'].map((doc, i) => (
                <div key={i} className="pg-doc-item">
                  <CheckCircle2 size={16} />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pg-card">
            <h3>플랫폼별 입점 절차</h3>
            <div className="pg-signup-grid">
              <div className="pg-signup-card baemin-border">
                <h4><span className="pg-badge baemin">배달의민족</span></h4>
                <ol className="pg-steps">
                  <li>배민사장님광장 접속</li>
                  <li>사업자등록증으로 회원가입</li>
                  <li>가게 정보 입력 (상호, 주소, 영업시간)</li>
                  <li>메뉴 등록 & 사진 업로드</li>
                  <li>정산 계좌 등록</li>
                  <li>심사 (영업일 3~7일)</li>
                  <li>승인 후 배민1플러스 또는 오픈리스트 선택</li>
                </ol>
                <p className="pg-signup-note">심사 기간: 약 3~7 영업일</p>
              </div>
              <div className="pg-signup-card coupang-border">
                <h4><span className="pg-badge coupang">쿠팡이츠</span></h4>
                <ol className="pg-steps">
                  <li>쿠팡이츠 사장님 포털 접속</li>
                  <li>입점 신청서 작성</li>
                  <li>서류 업로드 (사업자등록증, 영업신고증, 통장)</li>
                  <li>담당자 연락 (영업일 2~5일)</li>
                  <li>태블릿 수령 & 가게 세팅</li>
                  <li>메뉴 등록 & 운영 교육</li>
                  <li>영업 시작</li>
                </ol>
                <p className="pg-signup-note">심사 기간: 약 2~5 영업일</p>
              </div>
              <div className="pg-signup-card yogiyo-border">
                <h4><span className="pg-badge yogiyo">요기요</span></h4>
                <ol className="pg-steps">
                  <li>요기요 사장님 사이트 접속</li>
                  <li>가입 & 가게 정보 입력</li>
                  <li>서류 업로드</li>
                  <li>심사 (영업일 3~5일)</li>
                  <li>승인 후 메뉴 등록</li>
                  <li>가게배달 또는 요기배달 선택</li>
                  <li>영업 시작</li>
                </ol>
                <p className="pg-signup-note">심사 기간: 약 3~5 영업일</p>
              </div>
            </div>
          </div>

          <div className="pg-card">
            <h3><Star size={16} /> 입점 전략 추천</h3>
            <div className="pg-strategy">
              <div className="pg-strat-item">
                <span className="pg-strat-num">1</span>
                <div>
                  <strong>배민 + 쿠팡이츠 동시 입점 (필수)</strong>
                  <p>배민은 시장 1위(60%), 쿠팡이츠는 포장 무료 + 단건배달. 두 플랫폼이 전체 배달 주문의 85%+를 차지합니다.</p>
                </div>
              </div>
              <div className="pg-strat-item">
                <span className="pg-strat-num">2</span>
                <div>
                  <strong>요기요는 오픈 2주 후 추가</strong>
                  <p>초기 운영 안정화 후 채널 확장. 수수료가 가장 높으나 추가 고객 확보 채널로 가치 있습니다.</p>
                </div>
              </div>
              <div className="pg-strat-item">
                <span className="pg-strat-num">3</span>
                <div>
                  <strong>포장 주문은 쿠팡이츠 집중</strong>
                  <p>쿠팡이츠 포장 수수료 0% vs 배민 6.8%. 포장 고객은 쿠팡이츠로 유도하면 연간 수십만 원 절약.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pg { max-width: 1100px; }
        .pg-header { margin-bottom: 16px; }
        .pg-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .pg-header p { color: var(--text-light); font-size: 14px; }

        .pg-notice { display: flex; gap: 12px; padding: 16px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: var(--radius); margin-bottom: 20px; font-size: 13px; color: #92400e; align-items: flex-start; }
        .pg-notice strong { display: block; margin-bottom: 4px; }
        .pg-notice p { margin: 0; line-height: 1.5; }
        .pg-notice svg { flex-shrink: 0; margin-top: 2px; }

        .pg-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px; overflow-x: auto; }
        .pg-tab { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; color: var(--text); white-space: nowrap; transition: all 0.15s; }
        .pg-tab:hover { background: var(--bg); color: var(--text-dark); }
        .pg-tab.active { background: var(--primary); color: white; }

        .pg-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
        .pg-card h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .pg-desc { font-size: 13px; color: var(--text-light); margin-bottom: 14px; }
        .pg-note { font-size: 12px; color: var(--text-light); margin-top: 10px; }

        .pg-table-wrap { overflow-x: auto; }
        .pg-table { width: 100%; border-collapse: collapse; }
        .pg-table th { font-size: 12px; font-weight: 600; color: var(--text-light); padding: 10px 8px; border-bottom: 2px solid var(--border); text-align: left; }
        .pg-table td { padding: 10px 8px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .pg-table .r { text-align: right; font-variant-numeric: tabular-nums; }
        .pg-table.sm { max-width: 500px; }
        .pg-item-name { font-weight: 600; color: var(--text-dark); white-space: nowrap; }
        .pg-good { color: #16a34a; font-weight: 600; }
        .pg-warn { color: #ea580c; font-weight: 600; }
        .pg-good-item { color: #16a34a; }
        .pg-row-highlight { background: #f0fdf4; }
        .pg-table .neg { color: #ef4444; }

        .pg-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; color: white; }
        .pg-badge.baemin { background: #2AC1BC; }
        .pg-badge.coupang { background: #E0115F; }
        .pg-badge.yogiyo { background: #FA0050; }

        .pg-info-box { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 14px; background: var(--primary-light); border-radius: var(--radius-sm); font-size: 12px; color: var(--primary); }

        .pg-sim-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .pg-sim-card { border: 1px solid var(--border); border-top: 4px solid; border-radius: var(--radius-sm); padding: 16px; }
        .pg-sim-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
        .pg-sim-table { width: 100%; border-collapse: collapse; }
        .pg-sim-table td { padding: 6px 0; font-size: 13px; }
        .pg-sim-table .r { text-align: right; }
        .pg-sim-table .neg { color: #ef4444; }
        .pg-sim-total td { border-top: 2px solid var(--border); font-size: 14px; padding-top: 8px; }

        .pg-platform-header { padding: 32px 24px; border-radius: var(--radius); margin-bottom: 16px; color: white; }
        .pg-platform-header h2 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
        .pg-platform-header p { opacity: 0.9; font-size: 14px; }
        .baemin-bg { background: linear-gradient(135deg, #1a9e99, #2AC1BC); }
        .coupang-bg { background: linear-gradient(135deg, #a30d44, #E0115F); }
        .yogiyo-bg { background: linear-gradient(135deg, #c2003e, #FA0050); }

        .pg-service-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .pg-service { border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 18px; }
        .pg-service.highlight-green { border-color: #86efac; background: #f0fdf4; }
        .pg-service.highlight-blue { border-color: #93c5fd; background: #eff6ff; }
        .pg-service h4 { font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
        .pg-service p { font-size: 13px; color: var(--text-light); margin-bottom: 10px; }
        .pg-service ul { padding-left: 18px; font-size: 13px; }
        .pg-service li { margin-bottom: 4px; line-height: 1.5; }

        .pg-feature-list { list-style: none; padding: 0; }
        .pg-feature-list li { padding: 10px 0; border-bottom: 1px solid var(--border-light); font-size: 14px; line-height: 1.5; }
        .pg-feature-list li:last-child { border-bottom: none; }

        .pg-timeline { display: flex; flex-direction: column; gap: 12px; }
        .pg-tl-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px; border-radius: var(--radius-sm); background: var(--bg); }
        .pg-tl-date { font-size: 12px; font-weight: 700; color: var(--primary); white-space: nowrap; min-width: 80px; }
        .pg-tl-text { font-size: 13px; }
        .pg-tl-text.warn { color: #ea580c; font-weight: 500; }

        .pg-docs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .pg-doc-item { display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--success-light); border-radius: var(--radius-sm); font-size: 13px; color: var(--success); font-weight: 500; }

        .pg-signup-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .pg-signup-card { border: 1px solid var(--border); border-top: 4px solid; border-radius: var(--radius-sm); padding: 20px; }
        .pg-signup-card h4 { margin-bottom: 14px; }
        .baemin-border { border-top-color: #2AC1BC; }
        .coupang-border { border-top-color: #E0115F; }
        .yogiyo-border { border-top-color: #FA0050; }
        .pg-steps { padding-left: 20px; font-size: 13px; }
        .pg-steps li { margin-bottom: 8px; line-height: 1.5; }
        .pg-signup-note { font-size: 12px; color: var(--text-light); margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-light); }

        .pg-strategy { display: flex; flex-direction: column; gap: 14px; }
        .pg-strat-item { display: flex; gap: 14px; padding: 16px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); }
        .pg-strat-num { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
        .pg-strat-item strong { display: block; font-size: 14px; color: var(--text-dark); margin-bottom: 4px; }
        .pg-strat-item p { font-size: 13px; color: var(--text); margin: 0; line-height: 1.5; }

        @media (max-width: 768px) {
          .pg-sim-grid, .pg-signup-grid, .pg-service-grid { grid-template-columns: 1fr; }
          .pg-docs-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
