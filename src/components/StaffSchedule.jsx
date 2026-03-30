import { useState, useMemo } from 'react';
import {
  Calendar, Users, Plus, Trash2, Clock, DollarSign,
  AlertTriangle, Check, Phone, Edit3, User, Briefcase,
} from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const SHIFT_TYPES = [
  { key: 'work', label: '근무', color: '#2563eb', bg: '#dbeafe', hours: 10 },
  { key: 'off', label: '휴무', color: '#94a3b8', bg: '#f1f5f9', hours: 0 },
  { key: 'am', label: '오전반', color: '#16a34a', bg: '#dcfce7', hours: 5 },
  { key: 'pm', label: '오후반', color: '#ea580c', bg: '#fff7ed', hours: 5 },
];

const ROLES_LIST = ['조리 담당', '포장/배달관리', '식재료 발주', '청소/위생'];

const DEFAULT_MEMBERS = [
  { id: 'staff_1', name: '사장님', role: '대표', hourlyWage: 0, phone: '', isFamily: true },
  { id: 'staff_2', name: '셰프', role: '아버님', hourlyWage: 0, phone: '', isFamily: true },
];

const INSURANCE = {
  pension: 0.045,
  health: 0.03545,
  longTermCare: 0.1281,
  employment: 0.009,
  employerPension: 0.045,
  employerHealth: 0.03545,
  employerLongTermCare: 0.1281,
  employerEmployment: 0.0135,
  employerIndustrial: 0.007,
};

const MIN_WAGE_2026 = 10030;

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return DAY_KEYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
}

/* ================================================================
   STAFF SCHEDULE — 인력 / 스케줄 관리
   ================================================================ */
export default function StaffSchedule({ staffData, setStaffData }) {
  const [tab, setTab] = useState('schedule');

  // Ensure data defaults
  const members = staffData?.members?.length > 0 ? staffData.members : DEFAULT_MEMBERS;
  const schedules = staffData?.schedules || {};
  const roleAssignments = staffData?.roleAssignments || {};
  const settings = staffData?.settings || { hourlyWage: 9860, insuranceRate: 9.4 };

  const save = (updates) => setStaffData(prev => ({ ...prev, ...updates }));

  // --- New member form ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', hourlyWage: MIN_WAGE_2026, phone: '', isFamily: false });
  const [editingMemberId, setEditingMemberId] = useState(null);

  const addMember = () => {
    if (!newMember.name) return;
    const member = {
      id: 'staff_' + Date.now(),
      ...newMember,
      hourlyWage: Number(newMember.hourlyWage) || MIN_WAGE_2026,
    };
    save({ members: [...members, member] });
    setNewMember({ name: '', role: '', hourlyWage: MIN_WAGE_2026, phone: '', isFamily: false });
    setShowAddForm(false);
  };

  const removeMember = (id) => {
    save({ members: members.filter(m => m.id !== id) });
  };

  const updateMember = (id, field, value) => {
    save({
      members: members.map(m =>
        m.id === id ? { ...m, [field]: field === 'hourlyWage' ? Number(value) || 0 : value } : m
      ),
    });
  };

  // --- Schedule ---
  const getScheduleKey = (memberId, dayKey) => `${memberId}_${dayKey}`;

  const getShift = (memberId, dayKey) => {
    return schedules[getScheduleKey(memberId, dayKey)] || 'work';
  };

  const cycleShift = (memberId, dayKey) => {
    const current = getShift(memberId, dayKey);
    const idx = SHIFT_TYPES.findIndex(s => s.key === current);
    const next = SHIFT_TYPES[(idx + 1) % SHIFT_TYPES.length];
    save({
      schedules: { ...schedules, [getScheduleKey(memberId, dayKey)]: next.key },
    });
  };

  const getWeeklyHours = (memberId) => {
    return DAY_KEYS.reduce((total, dayKey) => {
      const shift = getShift(memberId, dayKey);
      const type = SHIFT_TYPES.find(s => s.key === shift);
      return total + (type?.hours || 0);
    }, 0);
  };

  // Conflict detection: both off on same day
  const conflicts = useMemo(() => {
    if (members.length < 2) return [];
    const result = [];
    DAY_KEYS.forEach((dayKey, i) => {
      const allOff = members.every(m => getShift(m.id, dayKey) === 'off');
      if (allOff) result.push({ day: DAYS[i], dayKey });
    });
    return result;
  }, [members, schedules]);

  const weekDates = useMemo(() => getWeekDates(), []);

  // --- Role assignments ---
  const getRoleAssignment = (dayKey, role) => {
    const key = `${dayKey}_${role}`;
    return roleAssignments[key] || '';
  };

  const setRoleAssignment = (dayKey, role, memberId) => {
    const key = `${dayKey}_${role}`;
    save({ roleAssignments: { ...roleAssignments, [key]: memberId } });
  };

  // Default role assignments
  const getDefaultRole = (role) => {
    const chef = members.find(m => m.role === '아버님' || m.name === '셰프');
    const owner = members.find(m => m.role === '대표' || m.name === '사장님');
    if (role === '조리 담당') return chef?.id || '';
    return owner?.id || '';
  };

  // --- Labor cost ---
  const calculateInsurance = (monthlyPay) => {
    const pension = Math.round(monthlyPay * INSURANCE.pension);
    const health = Math.round(monthlyPay * INSURANCE.health);
    const longTermCare = Math.round(health * INSURANCE.longTermCare);
    const employment = Math.round(monthlyPay * INSURANCE.employment);
    const employeeTotal = pension + health + longTermCare + employment;

    const ePension = Math.round(monthlyPay * INSURANCE.employerPension);
    const eHealth = Math.round(monthlyPay * INSURANCE.employerHealth);
    const eLongTermCare = Math.round(eHealth * INSURANCE.employerLongTermCare);
    const eEmployment = Math.round(monthlyPay * INSURANCE.employerEmployment);
    const eIndustrial = Math.round(monthlyPay * INSURANCE.employerIndustrial);
    const employerTotal = ePension + eHealth + eLongTermCare + eEmployment + eIndustrial;

    return {
      pension, health, longTermCare, employment,
      employeeTotal,
      ePension, eHealth, eLongTermCare, eEmployment, eIndustrial,
      employerTotal,
    };
  };

  // Part-timer simulator
  const [ptHours, setPtHours] = useState(20);
  const [ptWage, setPtWage] = useState(MIN_WAGE_2026);

  const tabs = [
    { id: 'schedule', label: '주간 스케줄', icon: Calendar },
    { id: 'roles', label: '역할 분담', icon: Briefcase },
    { id: 'labor', label: '인건비 계산', icon: DollarSign },
  ];

  return (
    <div className="ssch">
      <div className="ssch-header">
        <h1>인력 & 스케줄 관리</h1>
        <p>직원 스케줄링, 역할 배분 및 인건비 관리</p>
      </div>

      {/* Tab bar */}
      <div className="ssch-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`ssch-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: 주간 스케줄 ==================== */}
      {tab === 'schedule' && (
        <div className="ssch-content">
          {/* Staff member cards */}
          <div className="ssch-card" style={{ marginBottom: '16px' }}>
            <h3><Users size={16} /> 직원 목록</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              {members.map(m => (
                <div key={m.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: m.isFamily ? 'var(--primary-light)' : '#ede9fe',
                    color: m.isFamily ? 'var(--primary)' : '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '14px' }}>
                      {m.name}
                      <span style={{
                        marginLeft: '6px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--text-light)',
                        background: 'var(--border-light)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}>
                        {m.role}
                      </span>
                    </div>
                    {m.phone && (
                      <div style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={10} /> {m.phone}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      이번 주 {getWeeklyHours(m.id)}시간
                    </div>
                  </div>
                  {editingMemberId === m.id ? (
                    <button
                      onClick={() => setEditingMemberId(null)}
                      style={{ color: 'var(--primary)', background: 'none', padding: '4px' }}
                    >
                      <Check size={16} />
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => setEditingMemberId(m.id)}
                        style={{ color: 'var(--text-light)', background: 'none', padding: '4px' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      {!DEFAULT_MEMBERS.find(d => d.id === m.id) && (
                        <button
                          onClick={() => removeMember(m.id)}
                          style={{ color: '#dc2626', background: 'none', padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Edit form inline */}
            {editingMemberId && (() => {
              const m = members.find(x => x.id === editingMemberId);
              if (!m) return null;
              return (
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  marginBottom: '12px',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    <div>
                      <label className="ssch-label">이름</label>
                      <input className="ssch-input" value={m.name} onChange={e => updateMember(m.id, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="ssch-label">역할</label>
                      <input className="ssch-input" value={m.role} onChange={e => updateMember(m.id, 'role', e.target.value)} />
                    </div>
                    <div>
                      <label className="ssch-label">시급 (원)</label>
                      <input className="ssch-input" type="number" value={m.hourlyWage} onChange={e => updateMember(m.id, 'hourlyWage', e.target.value)} />
                    </div>
                    <div>
                      <label className="ssch-label">전화번호</label>
                      <input className="ssch-input" value={m.phone || ''} onChange={e => updateMember(m.id, 'phone', e.target.value)} placeholder="010-0000-0000" />
                    </div>
                    <div>
                      <label className="ssch-label">가족 여부</label>
                      <button
                        onClick={() => updateMember(m.id, 'isFamily', !m.isFamily)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: m.isFamily ? '#16a34a' : 'var(--text)',
                          background: m.isFamily ? '#dcfce7' : 'var(--bg)',
                          border: `1px solid ${m.isFamily ? '#16a34a' : 'var(--border)'}`,
                        }}
                      >
                        {m.isFamily ? '가족 (4대보험 제외)' : '직원 (4대보험 적용)'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Add new member */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                }}
              >
                <Plus size={14} /> 직원 추가
              </button>
            ) : (
              <div style={{
                padding: '16px',
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--primary)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="ssch-label">이름</label>
                    <input className="ssch-input" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="홍길동" />
                  </div>
                  <div>
                    <label className="ssch-label">역할</label>
                    <input className="ssch-input" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} placeholder="파트타이머" />
                  </div>
                  <div>
                    <label className="ssch-label">시급 (원)</label>
                    <input className="ssch-input" type="number" value={newMember.hourlyWage} onChange={e => setNewMember({ ...newMember, hourlyWage: e.target.value })} />
                  </div>
                  <div>
                    <label className="ssch-label">전화번호</label>
                    <input className="ssch-input" value={newMember.phone} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} placeholder="010-0000-0000" />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <label className="ssch-label" style={{ marginBottom: 0 }}>가족 여부:</label>
                  <button
                    onClick={() => setNewMember({ ...newMember, isFamily: !newMember.isFamily })}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: newMember.isFamily ? '#16a34a' : 'var(--text)',
                      background: newMember.isFamily ? '#dcfce7' : 'white',
                      border: `1px solid ${newMember.isFamily ? '#16a34a' : 'var(--border)'}`,
                    }}
                  >
                    {newMember.isFamily ? '가족' : '직원'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={addMember}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'white',
                      background: 'var(--primary)',
                    }}
                  >
                    <Plus size={14} /> 추가
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text)',
                      background: 'white',
                      border: '1px solid var(--border)',
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conflict warnings */}
          {conflicts.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              color: '#dc2626',
              fontSize: '13px',
              fontWeight: 500,
            }}>
              <AlertTriangle size={16} />
              <span>
                경고: {conflicts.map(c => c.day + '요일').join(', ')}에 모든 직원이 휴무입니다!
              </span>
            </div>
          )}

          {/* Weekly calendar grid */}
          <div className="ssch-card">
            <h3><Calendar size={16} /> 주간 근무표</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="ssch-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '100px' }}>직원</th>
                    {DAYS.map((day, i) => (
                      <th key={day} style={{ textAlign: 'center', minWidth: '70px' }}>
                        <div>{day}</div>
                        <div style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-light)' }}>{weekDates[i]}</div>
                      </th>
                    ))}
                    <th style={{ textAlign: 'center', minWidth: '70px' }}>주간시간</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600, fontSize: '13px' }}>
                        {m.name}
                        <div style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-light)' }}>{m.role}</div>
                      </td>
                      {DAY_KEYS.map((dayKey, i) => {
                        const shift = getShift(m.id, dayKey);
                        const type = SHIFT_TYPES.find(s => s.key === shift);
                        const isConflict = conflicts.some(c => c.dayKey === dayKey);
                        return (
                          <td key={dayKey} style={{ textAlign: 'center', padding: '6px 4px' }}>
                            <button
                              onClick={() => cycleShift(m.id, dayKey)}
                              style={{
                                width: '100%',
                                padding: '8px 4px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: type?.color,
                                background: type?.bg,
                                border: isConflict && shift === 'off'
                                  ? '2px solid #dc2626'
                                  : `1px solid ${type?.color}22`,
                                transition: 'all 0.15s',
                                cursor: 'pointer',
                              }}
                              title="클릭하여 변경"
                            >
                              {type?.label}
                            </button>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-dark)', fontSize: '14px' }}>
                        {getWeeklyHours(m.id)}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-light)' }}>
              * 각 셀을 클릭하면 근무 &rarr; 휴무 &rarr; 오전반 &rarr; 오후반 순으로 변경됩니다
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: 역할 분담 ==================== */}
      {tab === 'roles' && (
        <div className="ssch-content">
          <div className="ssch-card">
            <h3><Briefcase size={16} /> 요일별 역할 분담표</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="ssch-table ssch-roles-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '120px' }}>역할</th>
                    {DAYS.map(day => (
                      <th key={day} style={{ textAlign: 'center', minWidth: '100px' }}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROLES_LIST.map(role => (
                    <tr key={role}>
                      <td style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-dark)' }}>
                        {role}
                      </td>
                      {DAY_KEYS.map(dayKey => {
                        const assigned = getRoleAssignment(dayKey, role) || getDefaultRole(role);
                        return (
                          <td key={dayKey} style={{ padding: '6px 4px' }}>
                            <select
                              value={assigned}
                              onChange={e => setRoleAssignment(dayKey, role, e.target.value)}
                              className="ssch-input"
                              style={{ fontSize: '12px', padding: '6px 8px', textAlign: 'center' }}
                            >
                              <option value="">미정</option>
                              {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-light)' }}>
              기본 설정: 셰프 = 조리 담당 / 사장님 = 포장/배달관리, 식재료 발주, 청소/위생
            </div>
          </div>

          {/* Print-friendly summary */}
          <div className="ssch-card" style={{ marginTop: '16px' }}>
            <h3><Calendar size={16} /> 역할 분담 요약 (인쇄용)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {DAY_KEYS.map((dayKey, i) => (
                <div key={dayKey} style={{
                  padding: '14px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '10px', fontSize: '14px' }}>
                    {DAYS[i]}요일
                  </div>
                  {ROLES_LIST.map(role => {
                    const assigned = getRoleAssignment(dayKey, role) || getDefaultRole(role);
                    const person = members.find(m => m.id === assigned);
                    return (
                      <div key={role} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        padding: '3px 0',
                        borderBottom: '1px solid var(--border-light)',
                      }}>
                        <span style={{ color: 'var(--text-light)' }}>{role}</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>
                          {person?.name || '미정'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: 인건비 계산 ==================== */}
      {tab === 'labor' && (
        <div className="ssch-content">
          {/* Min wage reference */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: '#dbeafe',
            border: '1px solid #2563eb',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#2563eb',
          }}>
            <DollarSign size={16} />
            <span>2026년 최저시급: <strong>{fmt(MIN_WAGE_2026)}원</strong></span>
          </div>

          {/* Per-member labor cost */}
          {members.map(m => {
            const weeklyHours = getWeeklyHours(m.id);
            const monthlyHours = Math.round(weeklyHours * 4.345);
            const hourlyWage = m.hourlyWage || 0;
            const grossPay = monthlyHours * hourlyWage;
            const insurance = !m.isFamily && hourlyWage > 0 ? calculateInsurance(grossPay) : null;
            const netPay = insurance ? grossPay - insurance.employeeTotal : grossPay;
            const totalEmployerCost = insurance ? grossPay + insurance.employerTotal : grossPay;

            return (
              <div key={m.id} className="ssch-card" style={{ marginBottom: '12px' }}>
                <h3>
                  <User size={16} />
                  {m.name} ({m.role})
                  {m.isFamily && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: '#dcfce7',
                      color: '#16a34a',
                    }}>
                      가족
                    </span>
                  )}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>
                      <Clock size={12} style={{ verticalAlign: '-2px' }} /> 월 근무시간
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {monthlyHours}시간
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>주 {weeklyHours}h x 4.345주</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>시급</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {hourlyWage > 0 ? `${fmt(hourlyWage)}원` : '-'}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>총 급여</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                      {hourlyWage > 0 ? `${fmt(grossPay)}원` : '-'}
                    </div>
                  </div>
                </div>

                {/* Insurance detail for non-family employees */}
                {insurance && (
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '12px' }}>
                      4대보험 계산
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Employee */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                          근로자 부담분 (~9.4%)
                        </div>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>국민연금 (4.5%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.pension)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>건강보험 (3.545%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.health)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>장기요양 (건보의 12.81%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.longTermCare)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>고용보험 (0.9%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.employment)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '4px', fontWeight: 600, color: '#dc2626' }}>
                            <span>소계</span>
                            <span>{fmt(insurance.employeeTotal)}원</span>
                          </div>
                        </div>
                      </div>
                      {/* Employer */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                          사업주 부담분 (~10.1%)
                        </div>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>국민연금 (4.5%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.ePension)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>건강보험 (3.545%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.eHealth)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>장기요양 (건보의 12.81%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.eLongTermCare)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>고용보험 (1.35%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.eEmployment)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-light)' }}>산재보험 (0.7%)</span>
                            <span style={{ fontWeight: 500 }}>{fmt(insurance.eIndustrial)}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '4px', fontWeight: 600, color: '#ea580c' }}>
                            <span>소계</span>
                            <span>{fmt(insurance.employerTotal)}원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      padding: '10px 12px',
                      background: 'white',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>실수령액</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(netPay)}원</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '6px',
                      padding: '10px 12px',
                      background: '#fff7ed',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #ea580c33',
                      fontSize: '13px',
                    }}>
                      <span style={{ fontWeight: 600, color: '#ea580c' }}>사업주 총 비용</span>
                      <span style={{ fontWeight: 700, color: '#ea580c' }}>{fmt(totalEmployerCost)}원</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Monthly labor cost summary */}
          <div className="ssch-card" style={{ marginBottom: '16px' }}>
            <h3><DollarSign size={16} /> 월 인건비 총액</h3>
            {(() => {
              let totalGross = 0;
              let totalEmployerInsurance = 0;
              members.forEach(m => {
                const weeklyHours = getWeeklyHours(m.id);
                const monthlyHours = Math.round(weeklyHours * 4.345);
                const gross = monthlyHours * (m.hourlyWage || 0);
                totalGross += gross;
                if (!m.isFamily && m.hourlyWage > 0) {
                  totalEmployerInsurance += calculateInsurance(gross).employerTotal;
                }
              });
              const grandTotal = totalGross + totalEmployerInsurance;
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '16px', background: '#dbeafe', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#2563eb', marginBottom: '4px' }}>급여 합계</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>{fmt(totalGross)}원</div>
                  </div>
                  <div style={{ padding: '16px', background: '#fff7ed', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#ea580c', marginBottom: '4px' }}>사업주 보험분</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#ea580c' }}>{fmt(totalEmployerInsurance)}원</div>
                  </div>
                  <div style={{ padding: '16px', background: '#dcfce7', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>총 인건비</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>{fmt(grandTotal)}원</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Part-timer simulator */}
          <div className="ssch-card">
            <h3><Users size={16} /> 파트타이머 추가 시 시뮬레이션</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label className="ssch-label">주당 근무시간</label>
                <input
                  className="ssch-input"
                  type="number"
                  value={ptHours}
                  onChange={e => setPtHours(Number(e.target.value) || 0)}
                  min="1"
                  max="52"
                />
              </div>
              <div>
                <label className="ssch-label">시급 (원)</label>
                <input
                  className="ssch-input"
                  type="number"
                  value={ptWage}
                  onChange={e => setPtWage(Number(e.target.value) || 0)}
                />
                {ptWage < MIN_WAGE_2026 && ptWage > 0 && (
                  <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={11} /> 최저시급({fmt(MIN_WAGE_2026)}원) 미만
                  </div>
                )}
              </div>
            </div>

            {(() => {
              const monthlyHours = Math.round(ptHours * 4.345);
              const grossPay = monthlyHours * ptWage;
              const ins = calculateInsurance(grossPay);
              const totalCost = grossPay + ins.employerTotal;

              return (
                <div style={{
                  padding: '16px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>월 근무시간</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>{monthlyHours}시간</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>월 급여 (세전)</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>{fmt(grossPay)}원</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>사업주 보험분</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#ea580c' }}>{fmt(ins.employerTotal)}원</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>사업주 총 비용</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626' }}>{fmt(totalCost)}원</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-light)' }}>
                    * 주휴수당 미포함 / 4대보험 가입 기준 산출 / 산재보험 요율 0.7% 가정
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <style>{staffScheduleCSS}</style>
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const staffScheduleCSS = `
  .ssch {
    padding: 0;
  }
  .ssch-header {
    margin-bottom: 24px;
  }
  .ssch-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 4px;
  }
  .ssch-header p {
    color: var(--text-light);
    font-size: 14px;
  }

  /* Tab Bar */
  .ssch-tab-bar {
    display: flex;
    gap: 4px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 4px;
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .ssch-tab {
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
  }
  .ssch-tab:hover { background: var(--bg); }
  .ssch-tab.active {
    background: var(--primary);
    color: white;
    font-weight: 600;
  }

  /* Content */
  .ssch-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Cards */
  .ssch-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .ssch-card h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Form */
  .ssch-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
  }
  .ssch-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text-dark);
    background: white;
    transition: border-color 0.15s;
  }
  .ssch-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }

  /* Table */
  .ssch-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .ssch-table th {
    text-align: left;
    padding: 10px 8px;
    font-weight: 600;
    font-size: 12px;
    color: var(--text-light);
    border-bottom: 2px solid var(--border);
    white-space: nowrap;
  }
  .ssch-table td {
    padding: 10px 8px;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-dark);
    vertical-align: middle;
  }
  .ssch-table tr:last-child td {
    border-bottom: none;
  }

  /* Roles table */
  .ssch-roles-table td {
    padding: 8px 4px;
  }

  @media (max-width: 768px) {
    .ssch-table {
      font-size: 12px;
    }
    .ssch-table th, .ssch-table td {
      padding: 6px 4px;
    }
  }

  @media print {
    .ssch-tab-bar, .ssch-header p, button { display: none !important; }
    .ssch-card { border: 1px solid #ccc; break-inside: avoid; }
  }
`;
