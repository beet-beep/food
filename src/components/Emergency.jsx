import { useState, useMemo } from 'react';
import {
  AlertTriangle, Phone, Plus, Trash2, Edit3, Check, X,
  Flame, Shield, FileText, Clock, AlertCircle, ChevronDown,
  Zap, PhoneCall,
} from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

/* ================================================================
   DATA
   ================================================================ */
const SCENARIOS = [
  {
    id: 's1',
    title: '배달 사고 (음식 쏟아짐/파손)',
    icon: AlertTriangle,
    severity: '중요',
    keyPoint: '고객 응대 속도가 핵심 — 30분 이내 연락',
    steps: [
      '고객 즉시 연락',
      '사과 + 재배달 or 환불 제안',
      '배달대행사 클레임',
      '사진 증거 보존',
      '재발 방지 포장 개선',
    ],
  },
  {
    id: 's2',
    title: '이물질 클레임',
    icon: AlertCircle,
    severity: '긴급',
    keyPoint: '절대 고객 과실을 언급하지 말 것 — 즉시 사과 우선',
    steps: [
      '고객 즉시 사과',
      '해당 음식 회수 요청 (가능 시)',
      '환불 + 추가 보상',
      '원인 조사',
      '보건소 신고 대비 기록',
    ],
  },
  {
    id: 's3',
    title: '식중독 의심 신고',
    icon: Shield,
    severity: '긴급',
    keyPoint: '당일 식재료 샘플 반드시 보관 — 폐기 금지',
    steps: [
      '해당 메뉴 즉시 판매 중지',
      '당일 식재료 샘플 보관',
      '보건소 연락',
      '모든 조리·보관 기록 확보',
      '영업배상보험 확인',
    ],
  },
  {
    id: 's4',
    title: '가스 누출',
    icon: Flame,
    severity: '긴급',
    keyPoint: '전기 스위치 절대 조작 금지 — 스파크로 폭발 위험',
    steps: [
      '가스 밸브 즉시 차단',
      '환기',
      '전기 스위치 절대 조작 금지',
      '119 신고',
      '대피',
    ],
  },
  {
    id: 's5',
    title: '정전',
    icon: Zap,
    severity: '주의',
    keyPoint: '냉장/냉동고 문을 열지 않으면 약 4시간 온도 유지 가능',
    steps: [
      '냉장고/냉동고 문 닫기',
      '주문 임시 중단',
      '한전 121 전화',
      '30분 이상 시 식재료 안전 확인',
    ],
  },
  {
    id: 's6',
    title: '배달대행 파업/중단',
    icon: AlertTriangle,
    severity: '주의',
    keyPoint: '사전에 2개 이상 배달대행사 계약 권장',
    steps: [
      '자체 배달 전환',
      '배달 반경 축소',
      '포장 전환 홍보',
      '다른 배달대행사 연락',
    ],
  },
  {
    id: 's7',
    title: '화재',
    icon: Flame,
    severity: '긴급',
    keyPoint: '인명 안전 최우선 — 소화 불가 시 즉시 대피',
    steps: [
      '소화기 사용',
      '119 신고',
      '가스 차단',
      '대피',
      '소방서 도착 후 지시 따르기',
    ],
  },
];

const DEFAULT_CONTACTS = [
  { id: 'c1', name: '소방/구급', phone: '119', role: '소방/구급', memo: '화재, 응급환자', editable: false },
  { id: 'c2', name: '경찰', phone: '112', role: '경찰', memo: '범죄, 사고 신고', editable: false },
  { id: 'c3', name: '한전 정전 신고', phone: '121', role: '한전', memo: '정전 신고', editable: false },
  { id: 'c4', name: '인천 중구보건소', phone: '032-760-6000', role: '보건소', memo: '위생 점검, 식중독 신고', editable: false },
  { id: 'c5', name: '가스 안전공사', phone: '1544-4500', role: '가스안전', memo: '가스 누출 신고', editable: false },
];

const CUSTOM_CONTACT_ROLES = ['배달대행 담당자', '식재료 긴급 공급처', '건물 관리실', '세무사', '기타'];

const INCIDENT_TYPES = SCENARIOS.map(s => ({ value: s.id, label: s.title }));

const severityColor = (s) => {
  if (s === '긴급') return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
  if (s === '중요') return { bg: '#fff7ed', color: '#ea580c', border: '#fdba74' };
  return { bg: '#fefce8', color: '#ca8a04', border: '#fde047' };
};

/* ================================================================
   Tab 1: 비상 대응 매뉴얼
   ================================================================ */
function ManualTab() {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="emg-content">
      <div className="emg-card">
        <h3><AlertTriangle size={16} /> 비상 상황별 대응 매뉴얼</h3>
        <p className="emg-subtitle">각 시나리오를 클릭하면 상세 대응 절차를 확인할 수 있습니다.</p>
      </div>

      {SCENARIOS.map(sc => {
        const Icon = sc.icon;
        const sev = severityColor(sc.severity);
        const isOpen = expanded[sc.id];
        return (
          <div key={sc.id} className="emg-scenario-card" style={{ borderLeftColor: sev.color }}>
            <button className="emg-scenario-header" onClick={() => toggle(sc.id)}>
              <Icon size={20} style={{ color: sev.color, flexShrink: 0 }} />
              <div className="emg-scenario-title">{sc.title}</div>
              <span className="emg-severity-badge" style={{ background: sev.bg, color: sev.color, borderColor: sev.border }}>
                {sc.severity}
              </span>
              <ChevronDown
                size={16}
                style={{ color: 'var(--text-light)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>

            {isOpen && (
              <div className="emg-scenario-body">
                <div className="emg-steps">
                  {sc.steps.map((step, i) => (
                    <div key={i} className="emg-step">
                      <span className="emg-step-num" style={{ background: sev.bg, color: sev.color }}>{i + 1}</span>
                      <span className="emg-step-text">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="emg-keypoint" style={{ background: sev.bg, borderColor: sev.border }}>
                  <AlertCircle size={14} style={{ color: sev.color, flexShrink: 0 }} />
                  <span style={{ color: sev.color, fontWeight: 600 }}>{sc.keyPoint}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   Tab 2: 비상 연락처
   ================================================================ */
function ContactsTab({ emergencyData, setEmergencyData }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', role: CUSTOM_CONTACT_ROLES[0], memo: '' });

  const customContacts = emergencyData.contacts || [];

  const startEdit = (contact) => {
    setEditId(contact.id);
    setForm({ name: contact.name, phone: contact.phone, role: contact.role, memo: contact.memo || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', role: CUSTOM_CONTACT_ROLES[0], memo: '' });
    setEditId(null);
    setShowForm(false);
  };

  const saveContact = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    if (editId) {
      setEmergencyData(prev => ({
        ...prev,
        contacts: prev.contacts.map(c => c.id === editId ? { ...c, ...form } : c),
      }));
    } else {
      const entry = { id: `custom-${Date.now()}`, ...form, editable: true };
      setEmergencyData(prev => ({ ...prev, contacts: [...(prev.contacts || []), entry] }));
    }
    resetForm();
  };

  const deleteContact = (id) => {
    setEmergencyData(prev => ({
      ...prev,
      contacts: (prev.contacts || []).filter(c => c.id !== id),
    }));
  };

  return (
    <div className="emg-content">
      {/* Default Contacts */}
      <div className="emg-card">
        <h3><Phone size={16} /> 긴급 연락처</h3>
        <div className="emg-contact-list">
          {DEFAULT_CONTACTS.map(c => (
            <div key={c.id} className="emg-contact-row">
              <div className="emg-contact-info">
                <div className="emg-contact-name">{c.name}</div>
                <div className="emg-contact-meta">
                  <span className="emg-contact-role">{c.role}</span>
                  {c.memo && <span className="emg-contact-memo">{c.memo}</span>}
                </div>
              </div>
              <div className="emg-contact-actions">
                <a href={`tel:${c.phone}`} className="emg-phone-btn">
                  <PhoneCall size={14} />
                  <span>{c.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Contacts */}
      <div className="emg-card">
        <div className="emg-card-top">
          <h3><FileText size={16} /> 업무 연락처</h3>
          <button className="emg-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={14} /> 추가
          </button>
        </div>

        {showForm && (
          <div className="emg-form">
            <div className="emg-form-grid">
              <div className="emg-form-field">
                <label>이름/업체명</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="이름 또는 업체명"
                  className="emg-input"
                />
              </div>
              <div className="emg-form-field">
                <label>전화번호</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="010-0000-0000"
                  className="emg-input"
                />
              </div>
              <div className="emg-form-field">
                <label>역할</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="emg-input"
                >
                  {CUSTOM_CONTACT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="emg-form-field">
                <label>메모</label>
                <input
                  value={form.memo}
                  onChange={e => setForm(p => ({ ...p, memo: e.target.value }))}
                  placeholder="비고"
                  className="emg-input"
                />
              </div>
            </div>
            <div className="emg-form-actions">
              <button className="emg-save-btn" onClick={saveContact}>
                <Check size={14} /> {editId ? '수정' : '저장'}
              </button>
              <button className="emg-cancel-btn" onClick={resetForm}>
                <X size={14} /> 취소
              </button>
            </div>
          </div>
        )}

        {customContacts.length === 0 && !showForm && (
          <div className="emg-empty">등록된 업무 연락처가 없습니다.</div>
        )}

        {customContacts.length > 0 && (
          <div className="emg-contact-list">
            {customContacts.map(c => (
              <div key={c.id} className="emg-contact-row">
                <div className="emg-contact-info">
                  <div className="emg-contact-name">{c.name}</div>
                  <div className="emg-contact-meta">
                    <span className="emg-contact-role">{c.role}</span>
                    {c.memo && <span className="emg-contact-memo">{c.memo}</span>}
                  </div>
                </div>
                <div className="emg-contact-actions">
                  <a href={`tel:${c.phone}`} className="emg-phone-btn">
                    <PhoneCall size={14} />
                    <span>{c.phone}</span>
                  </a>
                  <button className="emg-icon-btn" onClick={() => startEdit(c)}>
                    <Edit3 size={14} />
                  </button>
                  <button className="emg-icon-btn emg-icon-btn-danger" onClick={() => deleteContact(c.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Tab 3: 사고 기록
   ================================================================ */
function IncidentLogTab({ emergencyData, setEmergencyData }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: today(),
    type: SCENARIOS[0].id,
    description: '',
    actionTaken: '',
    resolved: false,
    followUp: '',
  });

  const logs = emergencyData.incidentLog || [];
  const unresolvedCount = logs.filter(l => !l.resolved).length;

  const save = () => {
    if (!form.description.trim()) return;
    const entry = {
      id: `inc-${Date.now()}`,
      ...form,
      typeLabel: SCENARIOS.find(s => s.id === form.type)?.title || form.type,
      createdAt: new Date().toISOString(),
    };
    setEmergencyData(prev => ({
      ...prev,
      incidentLog: [entry, ...(prev.incidentLog || [])],
    }));
    setForm({
      date: today(),
      type: SCENARIOS[0].id,
      description: '',
      actionTaken: '',
      resolved: false,
      followUp: '',
    });
    setShowForm(false);
  };

  const toggleResolved = (id) => {
    setEmergencyData(prev => ({
      ...prev,
      incidentLog: (prev.incidentLog || []).map(l =>
        l.id === id ? { ...l, resolved: !l.resolved } : l
      ),
    }));
  };

  const deleteLog = (id) => {
    setEmergencyData(prev => ({
      ...prev,
      incidentLog: (prev.incidentLog || []).filter(l => l.id !== id),
    }));
  };

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      const month = l.date.slice(0, 7);
      if (!map[month]) map[month] = { total: 0, resolved: 0, unresolved: 0 };
      map[month].total++;
      if (l.resolved) map[month].resolved++;
      else map[month].unresolved++;
    });
    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([month, data]) => ({ month, ...data }));
  }, [logs]);

  return (
    <div className="emg-content">
      {/* Stats */}
      <div className="emg-stats-row">
        <div className="emg-stat-card">
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          <div className="emg-stat-val">{logs.length}</div>
          <div className="emg-stat-label">총 사고 기록</div>
        </div>
        <div className="emg-stat-card">
          <AlertCircle size={18} style={{ color: unresolvedCount > 0 ? 'var(--danger)' : 'var(--success)' }} />
          <div className="emg-stat-val" style={{ color: unresolvedCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {unresolvedCount}
          </div>
          <div className="emg-stat-label">미해결 사고</div>
        </div>
        <div className="emg-stat-card">
          <Check size={18} style={{ color: 'var(--success)' }} />
          <div className="emg-stat-val" style={{ color: 'var(--success)' }}>
            {logs.filter(l => l.resolved).length}
          </div>
          <div className="emg-stat-label">해결 완료</div>
        </div>
      </div>

      {/* Add Button */}
      <div className="emg-card">
        <div className="emg-card-top">
          <h3><FileText size={16} /> 사고 기록</h3>
          <button className="emg-add-btn" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> 새 사고 기록
          </button>
        </div>

        {showForm && (
          <div className="emg-form">
            <div className="emg-form-grid">
              <div className="emg-form-field">
                <label>날짜</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="emg-input"
                />
              </div>
              <div className="emg-form-field">
                <label>사고 유형</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="emg-input"
                >
                  {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="emg-form-field emg-form-full">
                <label>사고 내용</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="사고 상황을 상세히 기록하세요"
                  className="emg-input emg-textarea"
                  rows={3}
                />
              </div>
              <div className="emg-form-field emg-form-full">
                <label>조치 내용</label>
                <textarea
                  value={form.actionTaken}
                  onChange={e => setForm(p => ({ ...p, actionTaken: e.target.value }))}
                  placeholder="어떤 조치를 취했는지 기록하세요"
                  className="emg-input emg-textarea"
                  rows={2}
                />
              </div>
              <div className="emg-form-field">
                <label>해결 여부</label>
                <button
                  className={`emg-toggle-btn ${form.resolved ? 'resolved' : ''}`}
                  onClick={() => setForm(p => ({ ...p, resolved: !p.resolved }))}
                >
                  {form.resolved ? <Check size={14} /> : <X size={14} />}
                  {form.resolved ? '해결됨' : '미해결'}
                </button>
              </div>
              <div className="emg-form-field">
                <label>후속 조치 필요사항</label>
                <input
                  value={form.followUp}
                  onChange={e => setForm(p => ({ ...p, followUp: e.target.value }))}
                  placeholder="추가 조치 사항"
                  className="emg-input"
                />
              </div>
            </div>
            <div className="emg-form-actions">
              <button className="emg-save-btn" onClick={save}>
                <Check size={14} /> 저장
              </button>
              <button className="emg-cancel-btn" onClick={() => setShowForm(false)}>
                <X size={14} /> 취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident History Table */}
      {logs.length > 0 && (
        <div className="emg-card">
          <h3><Clock size={16} /> 사고 이력</h3>
          <div className="emg-table-wrap">
            <table className="emg-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>유형</th>
                  <th>내용</th>
                  <th>조치</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="emg-td-date">{l.date}</td>
                    <td className="emg-td-type">{l.typeLabel}</td>
                    <td className="emg-td-desc">{l.description}</td>
                    <td className="emg-td-action">{l.actionTaken || '-'}</td>
                    <td>
                      <button
                        className={`emg-resolve-badge ${l.resolved ? 'resolved' : 'unresolved'}`}
                        onClick={() => toggleResolved(l.id)}
                      >
                        {l.resolved ? '해결' : '미해결'}
                      </button>
                    </td>
                    <td>
                      <button className="emg-icon-btn emg-icon-btn-danger" onClick={() => deleteLog(l.id)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="emg-empty-lg">
          <Shield size={32} style={{ color: 'var(--text-light)' }} />
          <div>기록된 사고가 없습니다.</div>
          <div style={{ fontSize: 12 }}>사고 발생 시 기록을 남겨주세요.</div>
        </div>
      )}

      {/* Monthly Summary */}
      {monthlySummary.length > 0 && (
        <div className="emg-card">
          <h3><Clock size={16} /> 월별 사고 요약</h3>
          <div className="emg-monthly-list">
            {monthlySummary.map(m => (
              <div key={m.month} className="emg-monthly-row">
                <span className="emg-monthly-month">{m.month}</span>
                <span className="emg-monthly-total">총 {m.total}건</span>
                <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 500 }}>해결 {m.resolved}</span>
                <span style={{ color: m.unresolved > 0 ? 'var(--danger)' : 'var(--text-light)', fontSize: 12, fontWeight: 500 }}>
                  미해결 {m.unresolved}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function Emergency({ emergencyData, setEmergencyData }) {
  const [tab, setTab] = useState('manual');

  const unresolvedCount = (emergencyData.incidentLog || []).filter(l => !l.resolved).length;

  const tabs = [
    { id: 'manual', label: '비상 대응 매뉴얼', icon: AlertTriangle },
    { id: 'contacts', label: '비상 연락처', icon: Phone },
    { id: 'incidents', label: '사고 기록', icon: FileText, badge: unresolvedCount > 0 ? unresolvedCount : null },
  ];

  return (
    <div className="emg">
      <div className="page-header">
        <h1>비상 대응</h1>
        <p>배달 전문점 비상 상황 매뉴얼, 연락처, 사고 기록 관리</p>
      </div>

      <div className="emg-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`emg-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
              {t.badge && <span className="emg-tab-badge">{t.badge}</span>}
            </button>
          );
        })}
      </div>

      {tab === 'manual' && <ManualTab />}
      {tab === 'contacts' && <ContactsTab emergencyData={emergencyData} setEmergencyData={setEmergencyData} />}
      {tab === 'incidents' && <IncidentLogTab emergencyData={emergencyData} setEmergencyData={setEmergencyData} />}

      <style>{emergencyCSS}</style>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const emergencyCSS = `
  .emg {
    padding: 0;
  }
  .emg .page-header {
    margin-bottom: 24px;
  }
  .emg .page-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 4px;
  }
  .emg .page-header p {
    color: var(--text-light);
    font-size: 14px;
  }

  /* ── Tab Bar ── */
  .emg-tab-bar {
    display: flex;
    gap: 4px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 4px;
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .emg-tab {
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
    position: relative;
  }
  .emg-tab:hover { background: var(--bg); }
  .emg-tab.active {
    background: var(--primary);
    color: white;
    font-weight: 600;
  }
  .emg-tab-badge {
    font-size: 10px;
    font-weight: 700;
    background: var(--danger);
    color: white;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
  }
  .emg-tab.active .emg-tab-badge {
    background: white;
    color: var(--danger);
  }

  /* ── Content ── */
  .emg-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .emg-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .emg-card h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .emg-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
  }
  .emg-card-top h3 { margin-bottom: 0; }
  .emg-subtitle {
    font-size: 13px;
    color: var(--text-light);
    margin: 0;
  }

  /* ── Scenario Cards ── */
  .emg-scenario-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-left: 4px solid var(--text-light);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .emg-scenario-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }
  .emg-scenario-title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
  }
  .emg-severity-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 10px;
    border: 1px solid;
    flex-shrink: 0;
  }
  .emg-scenario-body {
    padding: 0 20px 20px;
  }
  .emg-steps {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  .emg-step {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .emg-step-num {
    width: 24px;
    height: 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .emg-step-text {
    font-size: 13px;
    color: var(--text-dark);
    line-height: 24px;
  }
  .emg-keypoint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid;
    font-size: 12px;
  }

  /* ── Contacts ── */
  .emg-contact-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .emg-contact-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    background: var(--bg);
    flex-wrap: wrap;
  }
  .emg-contact-info { flex: 1; min-width: 180px; }
  .emg-contact-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 2px;
  }
  .emg-contact-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }
  .emg-contact-role {
    color: var(--primary);
    font-weight: 500;
  }
  .emg-contact-memo {
    color: var(--text-light);
  }
  .emg-contact-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .emg-phone-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: var(--primary);
    color: white;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .emg-phone-btn:hover { opacity: 0.9; }
  .emg-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text);
    cursor: pointer;
    transition: all 0.12s;
  }
  .emg-icon-btn:hover { background: var(--bg); }
  .emg-icon-btn-danger { color: var(--danger); }
  .emg-icon-btn-danger:hover { background: #fee2e2; }

  /* ── Form ── */
  .emg-form {
    padding: 16px;
    margin-top: 16px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .emg-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
  .emg-form-full { grid-column: 1 / -1; }
  .emg-form-field label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
  }
  .emg-input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text);
    background: var(--bg-card);
    outline: none;
    box-sizing: border-box;
  }
  .emg-input:focus { border-color: var(--primary); }
  .emg-textarea {
    resize: vertical;
    font-family: inherit;
  }
  .emg-form-actions {
    display: flex;
    gap: 8px;
  }
  .emg-save-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .emg-save-btn:hover { opacity: 0.9; }
  .emg-cancel-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s;
  }
  .emg-cancel-btn:hover { background: var(--bg); }
  .emg-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .emg-add-btn:hover { opacity: 0.9; }

  /* ── Toggle ── */
  .emg-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    background: var(--bg-card);
    color: var(--text-light);
    transition: all 0.15s;
  }
  .emg-toggle-btn.resolved {
    background: var(--success-light, #dcfce7);
    color: var(--success);
    border-color: var(--success);
  }

  /* ── Stats ── */
  .emg-stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }
  .emg-stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .emg-stat-val {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-dark);
  }
  .emg-stat-label {
    font-size: 12px;
    color: var(--text-light);
    font-weight: 500;
  }

  /* ── Table ── */
  .emg-table-wrap {
    overflow-x: auto;
  }
  .emg-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .emg-table th {
    text-align: left;
    padding: 10px 12px;
    background: var(--bg);
    color: var(--text-light);
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .emg-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    vertical-align: top;
  }
  .emg-td-date { white-space: nowrap; font-size: 12px; color: var(--text-light); }
  .emg-td-type { font-weight: 500; font-size: 12px; max-width: 140px; }
  .emg-td-desc { max-width: 200px; font-size: 12px; }
  .emg-td-action { max-width: 180px; font-size: 12px; color: var(--text-light); }

  .emg-resolve-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.12s;
  }
  .emg-resolve-badge.resolved {
    background: var(--success-light, #dcfce7);
    color: var(--success);
  }
  .emg-resolve-badge.unresolved {
    background: #fee2e2;
    color: var(--danger);
  }

  /* ── Empty ── */
  .emg-empty {
    text-align: center;
    padding: 24px;
    color: var(--text-light);
    font-size: 13px;
  }
  .emg-empty-lg {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--text-light);
    gap: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
  }

  /* ── Monthly Summary ── */
  .emg-monthly-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .emg-monthly-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 14px;
    background: var(--bg);
    border-radius: var(--radius-sm);
  }
  .emg-monthly-month {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    min-width: 70px;
  }
  .emg-monthly-total {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    min-width: 60px;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .emg-tab-bar { flex-wrap: nowrap; }
    .emg-tab { padding: 8px 12px; font-size: 12px; }
    .emg-form-grid { grid-template-columns: 1fr; }
    .emg-contact-row { flex-direction: column; align-items: flex-start; }
    .emg-contact-actions { margin-top: 8px; }
    .emg-stats-row { grid-template-columns: 1fr; }
    .emg-scenario-header { padding: 12px 14px; }
    .emg-scenario-body { padding: 0 14px 14px; }
  }
`;
