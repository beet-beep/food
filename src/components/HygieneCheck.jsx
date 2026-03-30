import { useState, useMemo } from 'react';
import {
  Shield, Thermometer, CheckCircle2, AlertTriangle, Calendar,
  ClipboardList, Bug, Flame, FileText, Clock, X, Plus,
  ChevronDown, ChevronRight, Heart,
} from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];
const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

const DAILY_ITEMS = [
  { id: 'd1', label: '냉장고 온도 확인 (0~5°C)', hasTemp: true, tempLabel: '냉장고 온도 (°C)' },
  { id: 'd2', label: '냉동고 온도 확인 (-18°C 이하)', hasTemp: true, tempLabel: '냉동고 온도 (°C)' },
  { id: 'd3', label: '식재료 상태 확인 (변색/이취 없음)' },
  { id: 'd4', label: '조리도구 세척·소독 완료' },
  { id: 'd5', label: '행주/수건 교체 및 소독' },
  { id: 'd6', label: '주방 바닥 청소' },
  { id: 'd7', label: '손 세척 비누/소독제 비치 확인' },
  { id: 'd8', label: '조리 시 위생 장갑 착용' },
  { id: 'd9', label: '음식물 쓰레기 처리' },
  { id: 'd10', label: '배달 용기 청결 상태 확인' },
];

const WEEKLY_ITEMS = [
  { id: 'w1', label: '해충 방제 점검 (바퀴벌레, 쥐)' },
  { id: 'w2', label: '기름때 제거 (후드, 가스레인지)' },
  { id: 'w3', label: '배수구 청소' },
  { id: 'w4', label: '식재료 보관 상태 전수 점검' },
  { id: 'w5', label: '칼·도마 소독 (열탕 소독)' },
];

const MONTHLY_ITEMS = [
  { id: 'm1', label: '소방 설비 점검 (소화기 압력, 위치)' },
  { id: 'm2', label: '가스 배관 누출 점검' },
  { id: 'm3', label: '그리스트랩 청소' },
  { id: 'm4', label: '방역 업체 방문 확인' },
  { id: 'm5', label: '환기 시설 점검' },
];

const HEALTH_CATEGORIES = [
  {
    title: '영업자 준수사항',
    items: [
      { id: 'h1', label: '보건증 소지 및 유효기간 확인' },
      { id: 'h2', label: '위생교육 이수증 보관' },
      { id: 'h3', label: '영업신고증 게시' },
    ],
  },
  {
    title: '시설 기준',
    items: [
      { id: 'h4', label: '조리장 구획 분리 (조리/세척/보관)' },
      { id: 'h5', label: '세척시설 구비 (온수, 세제)' },
      { id: 'h6', label: '환기시설 작동 상태' },
      { id: 'h7', label: '방충·방서 시설 (방충망, 트랩)' },
      { id: 'h8', label: '화장실 전용 세면대 구비' },
    ],
  },
  {
    title: '식품 취급',
    items: [
      { id: 'h9', label: '원료 입고 검수 기록' },
      { id: 'h10', label: '유통기한 경과 식품 없음' },
      { id: 'h11', label: '냉장·냉동 보관온도 준수' },
      { id: 'h12', label: '교차오염 방지 (생/익힘 분리)' },
    ],
  },
  {
    title: '위생관리',
    items: [
      { id: 'h13', label: '종업원 개인위생 (위생복, 위생모)' },
      { id: 'h14', label: '조리기구 소독 관리' },
      { id: 'h15', label: '행주 소독 관리' },
      { id: 'h16', label: '손 세척·소독 실시' },
    ],
  },
  {
    title: '표시사항',
    items: [
      { id: 'h17', label: '원산지 표시 (메뉴판, 배달앱)' },
      { id: 'h18', label: '알레르기 유발 성분 표시' },
    ],
  },
];

const INSURANCE_ITEMS = [
  { id: 'ins1', label: '화재보험 (의무)', required: true },
  { id: 'ins2', label: '영업배상책임보험', required: false },
  { id: 'ins3', label: '근로자재해보험', required: false, note: '직원 고용 시' },
];

const LEGAL_ITEMS = [
  { id: 'leg1', label: '원산지 표시 (메뉴판 + 배달앱)' },
  { id: 'leg2', label: '알레르기 유발 성분 표시' },
  { id: 'leg3', label: '영양성분 표시 (해당 시)' },
  { id: 'leg4', label: '음식물 폐기물 처리 신고' },
  { id: 'leg5', label: '위생교육 연간 이수 (매년)' },
];

/* ================================================================
   Tab 1: 일일 점검
   ================================================================ */
function DailyTab({ hygieneData, setHygieneData }) {
  const [date, setDate] = useState(today());
  const existingLog = hygieneData.dailyLogs.find(l => l.date === date);
  const [checks, setChecks] = useState(
    existingLog
      ? existingLog.checks
      : DAILY_ITEMS.map(i => ({ id: i.id, checked: false, temp: '' }))
  );

  const handleDateChange = (d) => {
    setDate(d);
    const log = hygieneData.dailyLogs.find(l => l.date === d);
    setChecks(
      log
        ? log.checks
        : DAILY_ITEMS.map(i => ({ id: i.id, checked: false, temp: '' }))
    );
  };

  const toggleCheck = (id) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const setTemp = (id, val) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, temp: val } : c));
  };

  const checkedCount = checks.filter(c => c.checked).length;
  const score = Math.round((checkedCount / DAILY_ITEMS.length) * 100);

  const save = () => {
    const entry = { date, checks, score, savedAt: new Date().toISOString() };
    setHygieneData(prev => {
      const logs = prev.dailyLogs.filter(l => l.date !== date);
      return { ...prev, dailyLogs: [...logs, entry].sort((a, b) => b.date.localeCompare(a.date)) };
    });
  };

  const last7 = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates.map(d => {
      const log = hygieneData.dailyLogs.find(l => l.date === d);
      return { date: d, score: log ? log.score : null };
    });
  }, [hygieneData.dailyLogs]);

  const scoreColor = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="hyg-content">
      <div className="hyg-card">
        <div className="hyg-daily-top">
          <h3><Thermometer size={16} /> 일일 위생 점검</h3>
          <input type="date" value={date} onChange={e => handleDateChange(e.target.value)} className="hyg-input" />
        </div>

        <div className="hyg-score-bar">
          <div className="hyg-score-label">오늘의 위생 점수</div>
          <div className="hyg-score-value" style={{ color: scoreColor }}>{score}점</div>
          <div className="hyg-score-track">
            <div className="hyg-score-fill" style={{ width: `${score}%`, background: scoreColor }} />
          </div>
          <div className="hyg-score-detail">{checkedCount} / {DAILY_ITEMS.length} 완료</div>
        </div>

        <div className="hyg-checklist">
          {DAILY_ITEMS.map(item => {
            const c = checks.find(x => x.id === item.id);
            return (
              <div key={item.id} className={`hyg-check-row ${c?.checked ? 'checked' : ''}`}>
                <button className="hyg-check-btn" onClick={() => toggleCheck(item.id)}>
                  {c?.checked
                    ? <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                    : <div className="hyg-check-empty" />
                  }
                </button>
                <span className="hyg-check-label">{item.label}</span>
                {item.hasTemp && (
                  <input
                    type="number"
                    step="0.1"
                    placeholder={item.tempLabel}
                    value={c?.temp || ''}
                    onChange={e => setTemp(item.id, e.target.value)}
                    className="hyg-temp-input"
                  />
                )}
              </div>
            );
          })}
        </div>

        <button className="hyg-save-btn" onClick={save}>
          <CheckCircle2 size={14} /> 저장
        </button>
      </div>

      <div className="hyg-card">
        <h3><Calendar size={16} /> 최근 7일 위생 점수</h3>
        <div className="hyg-history">
          {last7.map(d => (
            <div key={d.date} className="hyg-history-item">
              <div className="hyg-hist-date">{d.date.slice(5)}</div>
              <div className="hyg-hist-bar-track">
                <div
                  className="hyg-hist-bar-fill"
                  style={{
                    width: d.score !== null ? `${d.score}%` : '0%',
                    background: d.score === null ? 'var(--border)' : d.score >= 80 ? 'var(--success)' : d.score >= 50 ? 'var(--warning)' : 'var(--danger)',
                  }}
                />
              </div>
              <div className="hyg-hist-score">{d.score !== null ? `${d.score}%` : '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Tab 2: 주간/월간 점검
   ================================================================ */
function PeriodicTab({ hygieneData, setHygieneData }) {
  const [weeklyChecks, setWeeklyChecks] = useState(
    WEEKLY_ITEMS.map(i => ({ id: i.id, checked: false }))
  );
  const [monthlyChecks, setMonthlyChecks] = useState(
    MONTHLY_ITEMS.map(i => ({ id: i.id, checked: false }))
  );
  const [weeklyDate, setWeeklyDate] = useState(today());
  const [monthlyDate, setMonthlyDate] = useState(today());

  const toggleWeekly = (id) => {
    setWeeklyChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };
  const toggleMonthly = (id) => {
    setMonthlyChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const weeklyDone = weeklyChecks.filter(c => c.checked).length;
  const monthlyDone = monthlyChecks.filter(c => c.checked).length;

  const saveWeekly = () => {
    const entry = {
      date: weeklyDate,
      checks: weeklyChecks,
      completion: Math.round((weeklyDone / WEEKLY_ITEMS.length) * 100),
      savedAt: new Date().toISOString(),
    };
    setHygieneData(prev => ({
      ...prev,
      weeklyLogs: [...prev.weeklyLogs.filter(l => l.date !== weeklyDate), entry]
        .sort((a, b) => b.date.localeCompare(a.date)),
    }));
  };

  const saveMonthly = () => {
    const entry = {
      date: monthlyDate,
      checks: monthlyChecks,
      completion: Math.round((monthlyDone / MONTHLY_ITEMS.length) * 100),
      savedAt: new Date().toISOString(),
    };
    setHygieneData(prev => ({
      ...prev,
      monthlyLogs: [...prev.monthlyLogs.filter(l => l.date !== monthlyDate), entry]
        .sort((a, b) => b.date.localeCompare(a.date)),
    }));
  };

  return (
    <div className="hyg-content">
      {/* Weekly */}
      <div className="hyg-card">
        <div className="hyg-daily-top">
          <h3><Bug size={16} /> 주간 점검</h3>
          <input type="date" value={weeklyDate} onChange={e => setWeeklyDate(e.target.value)} className="hyg-input" />
        </div>
        <div className="hyg-score-bar" style={{ marginBottom: 16 }}>
          <div className="hyg-score-detail">{weeklyDone} / {WEEKLY_ITEMS.length} 완료</div>
        </div>
        <div className="hyg-checklist">
          {WEEKLY_ITEMS.map(item => {
            const c = weeklyChecks.find(x => x.id === item.id);
            return (
              <div key={item.id} className={`hyg-check-row ${c?.checked ? 'checked' : ''}`}>
                <button className="hyg-check-btn" onClick={() => toggleWeekly(item.id)}>
                  {c?.checked
                    ? <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                    : <div className="hyg-check-empty" />
                  }
                </button>
                <span className="hyg-check-label">{item.label}</span>
              </div>
            );
          })}
        </div>
        <button className="hyg-save-btn" onClick={saveWeekly}>
          <CheckCircle2 size={14} /> 주간 점검 저장
        </button>

        {hygieneData.weeklyLogs.length > 0 && (
          <div className="hyg-log-history">
            <h4>주간 점검 이력</h4>
            {hygieneData.weeklyLogs.slice(0, 5).map(l => (
              <div key={l.date} className="hyg-log-row">
                <span>{l.date}</span>
                <span className="hyg-log-pct" style={{
                  color: l.completion >= 80 ? 'var(--success)' : l.completion >= 50 ? 'var(--warning)' : 'var(--danger)',
                }}>{l.completion}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly */}
      <div className="hyg-card">
        <div className="hyg-daily-top">
          <h3><Flame size={16} /> 월간 점검</h3>
          <input type="date" value={monthlyDate} onChange={e => setMonthlyDate(e.target.value)} className="hyg-input" />
        </div>
        <div className="hyg-score-bar" style={{ marginBottom: 16 }}>
          <div className="hyg-score-detail">{monthlyDone} / {MONTHLY_ITEMS.length} 완료</div>
        </div>
        <div className="hyg-checklist">
          {MONTHLY_ITEMS.map(item => {
            const c = monthlyChecks.find(x => x.id === item.id);
            return (
              <div key={item.id} className={`hyg-check-row ${c?.checked ? 'checked' : ''}`}>
                <button className="hyg-check-btn" onClick={() => toggleMonthly(item.id)}>
                  {c?.checked
                    ? <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                    : <div className="hyg-check-empty" />
                  }
                </button>
                <span className="hyg-check-label">{item.label}</span>
              </div>
            );
          })}
        </div>
        <button className="hyg-save-btn" onClick={saveMonthly}>
          <CheckCircle2 size={14} /> 월간 점검 저장
        </button>

        {hygieneData.monthlyLogs.length > 0 && (
          <div className="hyg-log-history">
            <h4>월간 점검 이력</h4>
            {hygieneData.monthlyLogs.slice(0, 5).map(l => (
              <div key={l.date} className="hyg-log-row">
                <span>{l.date}</span>
                <span className="hyg-log-pct" style={{
                  color: l.completion >= 80 ? 'var(--success)' : l.completion >= 50 ? 'var(--warning)' : 'var(--danger)',
                }}>{l.completion}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Tab 3: 보건소 점검 대비
   ================================================================ */
function HealthInspectionTab() {
  const [statuses, setStatuses] = useState(() => {
    const init = {};
    HEALTH_CATEGORIES.forEach(cat => cat.items.forEach(it => { init[it.id] = '미확인'; }));
    return init;
  });
  const [expanded, setExpanded] = useState(() => {
    const init = {};
    HEALTH_CATEGORIES.forEach((_, i) => { init[i] = true; });
    return init;
  });

  const toggleExpand = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
  const setStatus = (id, val) => setStatuses(prev => ({ ...prev, [id]: val }));

  const allItems = HEALTH_CATEGORIES.flatMap(c => c.items);
  const total = allItems.length;
  const pass = allItems.filter(i => statuses[i.id] === '적합').length;
  const fail = allItems.filter(i => statuses[i.id] === '부적합').length;
  const unchecked = allItems.filter(i => statuses[i.id] === '미확인').length;
  const readiness = Math.round((pass / total) * 100);

  const statusColor = (s) => {
    if (s === '적합') return 'var(--success)';
    if (s === '부적합') return 'var(--danger)';
    return 'var(--text-light)';
  };
  const statusBg = (s) => {
    if (s === '적합') return 'var(--success-light, #dcfce7)';
    if (s === '부적합') return 'var(--danger-light, #fee2e2)';
    return 'var(--bg)';
  };

  return (
    <div className="hyg-content">
      <div className="hyg-card">
        <h3><Shield size={16} /> 보건소 점검 준비도</h3>
        <div className="hyg-readiness">
          <div className="hyg-readiness-score" style={{
            color: readiness >= 80 ? 'var(--success)' : readiness >= 50 ? 'var(--warning)' : 'var(--danger)',
          }}>{readiness}%</div>
          <div className="hyg-readiness-detail">
            <span style={{ color: 'var(--success)' }}>적합 {pass}</span>
            <span style={{ color: 'var(--danger)' }}>부적합 {fail}</span>
            <span style={{ color: 'var(--text-light)' }}>미확인 {unchecked}</span>
          </div>
        </div>
      </div>

      {HEALTH_CATEGORIES.map((cat, i) => (
        <div key={i} className="hyg-card">
          <button className="hyg-expand-btn" onClick={() => toggleExpand(i)}>
            {expanded[i] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <h3 style={{ margin: 0 }}>{cat.title}</h3>
            <span className="hyg-cat-badge">
              {cat.items.filter(it => statuses[it.id] === '적합').length}/{cat.items.length}
            </span>
          </button>
          {expanded[i] && (
            <div className="hyg-health-items">
              {cat.items.map(item => (
                <div key={item.id} className="hyg-health-row">
                  <span className="hyg-health-label">{item.label}</span>
                  <div className="hyg-status-btns">
                    {['적합', '부적합', '미확인'].map(s => (
                      <button
                        key={s}
                        className={`hyg-status-btn ${statuses[item.id] === s ? 'active' : ''}`}
                        style={{
                          background: statuses[item.id] === s ? statusBg(s) : 'transparent',
                          color: statuses[item.id] === s ? statusColor(s) : 'var(--text-light)',
                          borderColor: statuses[item.id] === s ? statusColor(s) : 'var(--border)',
                        }}
                        onClick={() => setStatus(item.id, s)}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="hyg-card">
        <h3><FileText size={16} /> 보건소 점검 대비 가이드</h3>
        <div className="hyg-guide">
          <div className="hyg-guide-item">
            <strong>1. 서류 준비</strong>
            <p>영업신고증, 보건증, 위생교육 이수증, 원산지 표시 자료를 항상 비치</p>
          </div>
          <div className="hyg-guide-item">
            <strong>2. 온도 기록부</strong>
            <p>냉장/냉동고 온도를 매일 기록한 일지를 최소 1년간 보관</p>
          </div>
          <div className="hyg-guide-item">
            <strong>3. 검수 일지</strong>
            <p>식재료 입고 시 날짜, 온도, 상태를 기록하는 검수 일지 작성</p>
          </div>
          <div className="hyg-guide-item">
            <strong>4. 방역 기록</strong>
            <p>정기 방역 업체 방문 확인서 및 자체 해충 점검 기록 보관</p>
          </div>
          <div className="hyg-guide-item">
            <strong>5. CCTV (권장)</strong>
            <p>조리 과정 CCTV 설치 시 위생 분쟁에서 유리한 증거 확보 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Tab 4: 보험/법률
   ================================================================ */
function InsuranceLegalTab({ hygieneData, setHygieneData }) {
  const getInsurance = (id) => {
    const found = (hygieneData.insuranceChecks || []).find(ic => ic.id === id);
    return found || { id, active: false, expiryDate: '' };
  };

  const updateInsurance = (id, field, value) => {
    setHygieneData(prev => {
      const existing = prev.insuranceChecks || [];
      const idx = existing.findIndex(ic => ic.id === id);
      if (idx >= 0) {
        const updated = [...existing];
        updated[idx] = { ...updated[idx], [field]: value };
        return { ...prev, insuranceChecks: updated };
      }
      return { ...prev, insuranceChecks: [...existing, { id, active: false, expiryDate: '', [field]: value }] };
    });
  };

  const [legalChecks, setLegalChecks] = useState(
    LEGAL_ITEMS.map(i => ({ id: i.id, checked: false, expiryDate: '' }))
  );

  const toggleLegal = (id) => {
    setLegalChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };
  const setLegalExpiry = (id, val) => {
    setLegalChecks(prev => prev.map(c => c.id === id ? { ...c, expiryDate: val } : c));
  };

  const dDay = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const dDayLabel = (d) => {
    if (d === null) return null;
    if (d < 0) return { text: `D+${Math.abs(d)} (만료됨)`, color: 'var(--danger)' };
    if (d <= 30) return { text: `D-${d}`, color: 'var(--danger)' };
    if (d <= 90) return { text: `D-${d}`, color: 'var(--warning)' };
    return { text: `D-${d}`, color: 'var(--success)' };
  };

  return (
    <div className="hyg-content">
      {/* Insurance */}
      <div className="hyg-card">
        <h3><Heart size={16} /> 보험 관리</h3>
        <div className="hyg-ins-list">
          {INSURANCE_ITEMS.map(item => {
            const ins = getInsurance(item.id);
            const dd = dDay(ins.expiryDate);
            const ddInfo = dDayLabel(dd);
            return (
              <div key={item.id} className="hyg-ins-row">
                <div className="hyg-ins-header">
                  <button className="hyg-check-btn" onClick={() => updateInsurance(item.id, 'active', !ins.active)}>
                    {ins.active
                      ? <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                      : <div className="hyg-check-empty" />
                    }
                  </button>
                  <div className="hyg-ins-info">
                    <span className="hyg-ins-label">
                      {item.label}
                      {item.required && <span className="hyg-badge-required">의무</span>}
                      {item.note && <span className="hyg-badge-note">{item.note}</span>}
                    </span>
                  </div>
                </div>
                <div className="hyg-ins-bottom">
                  <label className="hyg-ins-expiry-label">만료일</label>
                  <input
                    type="date"
                    value={ins.expiryDate || ''}
                    onChange={e => updateInsurance(item.id, 'expiryDate', e.target.value)}
                    className="hyg-input"
                  />
                  {ddInfo && (
                    <span className="hyg-dday" style={{ color: ddInfo.color, fontWeight: 600 }}>
                      {ddInfo.text}
                    </span>
                  )}
                  {dd !== null && dd <= 30 && (
                    <span className="hyg-renewal-alert">
                      <AlertTriangle size={13} /> 갱신 필요
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legal Requirements */}
      <div className="hyg-card">
        <h3><FileText size={16} /> 법적 요구사항</h3>
        <div className="hyg-checklist">
          {LEGAL_ITEMS.map(item => {
            const c = legalChecks.find(x => x.id === item.id);
            const dd = dDay(c?.expiryDate);
            const ddInfo = dDayLabel(dd);
            return (
              <div key={item.id} className={`hyg-check-row ${c?.checked ? 'checked' : ''}`}>
                <button className="hyg-check-btn" onClick={() => toggleLegal(item.id)}>
                  {c?.checked
                    ? <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                    : <div className="hyg-check-empty" />
                  }
                </button>
                <span className="hyg-check-label" style={{ flex: 1 }}>{item.label}</span>
                <div className="hyg-legal-expiry">
                  <input
                    type="date"
                    value={c?.expiryDate || ''}
                    onChange={e => setLegalExpiry(item.id, e.target.value)}
                    className="hyg-input hyg-input-sm"
                    placeholder="기한"
                  />
                  {ddInfo && (
                    <span className="hyg-dday-sm" style={{ color: ddInfo.color }}>
                      {ddInfo.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* D-day Alerts */}
      {(() => {
        const alerts = [];
        INSURANCE_ITEMS.forEach(item => {
          const ins = getInsurance(item.id);
          const dd = dDay(ins.expiryDate);
          if (dd !== null && dd <= 30) {
            alerts.push({ label: item.label, dday: dd, type: '보험' });
          }
        });
        legalChecks.forEach(c => {
          const item = LEGAL_ITEMS.find(i => i.id === c.id);
          const dd = dDay(c.expiryDate);
          if (dd !== null && dd <= 30) {
            alerts.push({ label: item.label, dday: dd, type: '법률' });
          }
        });
        if (alerts.length === 0) return null;
        return (
          <div className="hyg-card" style={{ borderColor: 'var(--danger)', borderWidth: 2 }}>
            <h3 style={{ color: 'var(--danger)' }}>
              <AlertTriangle size={16} /> 갱신 필요 알림 ({alerts.length}건)
            </h3>
            <div className="hyg-alerts">
              {alerts.map((a, i) => (
                <div key={i} className="hyg-alert-row">
                  <span className="hyg-alert-type">{a.type}</span>
                  <span className="hyg-alert-label">{a.label}</span>
                  <span className="hyg-alert-dday" style={{ color: a.dday < 0 ? 'var(--danger)' : 'var(--warning)' }}>
                    {a.dday < 0 ? `D+${Math.abs(a.dday)} 만료됨` : `D-${a.dday}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function HygieneCheck({ hygieneData, setHygieneData }) {
  const [tab, setTab] = useState('daily');

  const tabs = [
    { id: 'daily', label: '일일 점검', icon: Thermometer },
    { id: 'periodic', label: '주간/월간 점검', icon: ClipboardList },
    { id: 'health', label: '보건소 점검 대비', icon: Shield },
    { id: 'insurance', label: '보험/법률', icon: FileText },
  ];

  return (
    <div className="hyg">
      <div className="page-header">
        <h1>위생·안전 점검</h1>
        <p>배달 전문점 위생 관리 — 일일/주간/월간 점검, 보건소 대비, 보험·법률</p>
      </div>

      <div className="hyg-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`hyg-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'daily' && <DailyTab hygieneData={hygieneData} setHygieneData={setHygieneData} />}
      {tab === 'periodic' && <PeriodicTab hygieneData={hygieneData} setHygieneData={setHygieneData} />}
      {tab === 'health' && <HealthInspectionTab />}
      {tab === 'insurance' && <InsuranceLegalTab hygieneData={hygieneData} setHygieneData={setHygieneData} />}

      <style>{hygieneCSS}</style>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const hygieneCSS = `
  .hyg {
    padding: 0;
  }
  .hyg .page-header {
    margin-bottom: 24px;
  }
  .hyg .page-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 4px;
  }
  .hyg .page-header p {
    color: var(--text-light);
    font-size: 14px;
  }

  /* ── Tab Bar ── */
  .hyg-tab-bar {
    display: flex;
    gap: 4px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 4px;
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .hyg-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    background: none;
    white-space: nowrap;
    transition: all 0.15s;
    border: none;
    cursor: pointer;
  }
  .hyg-tab:hover { background: var(--bg); }
  .hyg-tab.active {
    background: var(--primary);
    color: white;
    font-weight: 600;
  }

  /* ── Content ── */
  .hyg-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .hyg-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .hyg-card h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Daily Top ── */
  .hyg-daily-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .hyg-daily-top h3 { margin-bottom: 0; }

  /* ── Inputs ── */
  .hyg-input {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
    outline: none;
  }
  .hyg-input:focus {
    border-color: var(--primary);
  }
  .hyg-input-sm {
    padding: 4px 8px;
    font-size: 12px;
    max-width: 140px;
  }

  /* ── Score Bar ── */
  .hyg-score-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .hyg-score-label {
    font-size: 13px;
    color: var(--text);
    font-weight: 500;
  }
  .hyg-score-value {
    font-size: 28px;
    font-weight: 700;
  }
  .hyg-score-track {
    flex: 1;
    min-width: 120px;
    height: 8px;
    background: var(--bg);
    border-radius: 4px;
    overflow: hidden;
  }
  .hyg-score-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }
  .hyg-score-detail {
    font-size: 13px;
    color: var(--text-light);
  }

  /* ── Checklist ── */
  .hyg-checklist {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 16px;
  }
  .hyg-check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    transition: background 0.12s;
    flex-wrap: wrap;
  }
  .hyg-check-row:hover { background: var(--bg); }
  .hyg-check-row.checked {
    background: var(--success-light, #dcfce7);
  }
  .hyg-check-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .hyg-check-empty {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-radius: 50%;
  }
  .hyg-check-label {
    font-size: 13px;
    color: var(--text-dark);
  }
  .hyg-temp-input {
    margin-left: auto;
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 12px;
    width: 130px;
    color: var(--text);
    background: var(--bg);
    outline: none;
  }
  .hyg-temp-input:focus {
    border-color: var(--primary);
  }

  /* ── Save Button ── */
  .hyg-save-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .hyg-save-btn:hover { opacity: 0.9; }

  /* ── History ── */
  .hyg-history {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .hyg-history-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .hyg-hist-date {
    font-size: 12px;
    color: var(--text-light);
    min-width: 42px;
    text-align: right;
  }
  .hyg-hist-bar-track {
    flex: 1;
    height: 8px;
    background: var(--bg);
    border-radius: 4px;
    overflow: hidden;
  }
  .hyg-hist-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }
  .hyg-hist-score {
    font-size: 12px;
    font-weight: 600;
    min-width: 36px;
    text-align: right;
    color: var(--text-dark);
  }

  /* ── Log History ── */
  .hyg-log-history {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .hyg-log-history h4 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 8px;
  }
  .hyg-log-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;
    color: var(--text);
  }
  .hyg-log-pct { font-weight: 600; }

  /* ── Health Inspection ── */
  .hyg-expand-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 100%;
    text-align: left;
    margin-bottom: 12px;
  }
  .hyg-cat-badge {
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    color: var(--primary);
    background: var(--primary-light, #dbeafe);
    padding: 2px 8px;
    border-radius: 10px;
  }
  .hyg-health-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .hyg-health-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    flex-wrap: wrap;
  }
  .hyg-health-row:hover { background: var(--bg); }
  .hyg-health-label {
    font-size: 13px;
    color: var(--text-dark);
    flex: 1;
    min-width: 200px;
  }
  .hyg-status-btns {
    display: flex;
    gap: 4px;
  }
  .hyg-status-btn {
    padding: 4px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.12s;
    background: transparent;
  }
  .hyg-status-btn.active {
    font-weight: 600;
  }

  /* ── Readiness ── */
  .hyg-readiness {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .hyg-readiness-score {
    font-size: 42px;
    font-weight: 700;
  }
  .hyg-readiness-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
  }

  /* ── Guide ── */
  .hyg-guide {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .hyg-guide-item {
    padding: 12px;
    background: var(--bg);
    border-radius: var(--radius-sm);
  }
  .hyg-guide-item strong {
    font-size: 13px;
    color: var(--text-dark);
    display: block;
    margin-bottom: 4px;
  }
  .hyg-guide-item p {
    font-size: 12px;
    color: var(--text);
    margin: 0;
    line-height: 1.5;
  }

  /* ── Insurance ── */
  .hyg-ins-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .hyg-ins-row {
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg);
  }
  .hyg-ins-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .hyg-ins-info { flex: 1; }
  .hyg-ins-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .hyg-badge-required {
    font-size: 10px;
    font-weight: 600;
    background: var(--danger);
    color: white;
    padding: 1px 6px;
    border-radius: 8px;
  }
  .hyg-badge-note {
    font-size: 10px;
    font-weight: 500;
    background: var(--bg-card);
    color: var(--text-light);
    padding: 1px 6px;
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  .hyg-ins-bottom {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding-left: 30px;
  }
  .hyg-ins-expiry-label {
    font-size: 12px;
    color: var(--text-light);
  }
  .hyg-dday {
    font-size: 13px;
  }
  .hyg-dday-sm {
    font-size: 11px;
    font-weight: 600;
  }
  .hyg-renewal-alert {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--danger);
    background: var(--danger-light, #fee2e2);
    padding: 2px 8px;
    border-radius: 8px;
  }

  /* ── Legal Expiry ── */
  .hyg-legal-expiry {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  /* ── Alerts ── */
  .hyg-alerts {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .hyg-alert-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--bg);
    border-radius: var(--radius-sm);
    font-size: 13px;
  }
  .hyg-alert-type {
    font-size: 11px;
    font-weight: 600;
    color: var(--primary);
    background: var(--primary-light, #dbeafe);
    padding: 2px 8px;
    border-radius: 8px;
    flex-shrink: 0;
  }
  .hyg-alert-label {
    flex: 1;
    color: var(--text-dark);
  }
  .hyg-alert-dday {
    font-weight: 600;
    flex-shrink: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .hyg-tab-bar {
      flex-wrap: nowrap;
    }
    .hyg-tab {
      padding: 8px 12px;
      font-size: 12px;
    }
    .hyg-health-row {
      flex-direction: column;
      align-items: flex-start;
    }
    .hyg-status-btns { margin-top: 4px; }
    .hyg-ins-bottom { padding-left: 0; }
    .hyg-legal-expiry { margin-left: 0; margin-top: 6px; }
    .hyg-check-row { flex-wrap: wrap; }
  }
`;
