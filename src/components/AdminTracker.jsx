import { Shield, Store, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';
import { taxBenefitInfo } from '../data/initialData';

const statusConfig = {
  pending: { label: '대기', color: '#94a3b8', bg: '#f1f5f9', icon: Clock },
  inProgress: { label: '진행중', color: '#2563eb', bg: '#dbeafe', icon: AlertCircle },
  done: { label: '완료', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
};

export default function AdminTracker({ admin, platforms, updateAdminStatus, updatePlatformStatus }) {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>행정/플랫폼 관리</h1>
        <p>사업자등록부터 플랫폼 입점까지 진행 상황을 추적하세요</p>
      </div>

      {/* 청년창업 세액감면 안내 */}
      <div className="tax-card">
        <div className="tax-card-header">
          <Shield size={24} />
          <div>
            <h2>{taxBenefitInfo.title} — {taxBenefitInfo.rate}% 감면 (최대 {taxBenefitInfo.duration}년)</h2>
            <p>{taxBenefitInfo.law} | {taxBenefitInfo.region}</p>
          </div>
        </div>
        <div className="tax-grid">
          <div className="tax-info-item">
            <span className="tax-info-label">대상 연령</span>
            <span>{taxBenefitInfo.ageRange}</span>
          </div>
          <div className="tax-info-item">
            <span className="tax-info-label">감면 세목</span>
            <span>{taxBenefitInfo.target}</span>
          </div>
          <div className="tax-info-item">
            <span className="tax-info-label">업종 확인</span>
            <span>{taxBenefitInfo.excludedNote}</span>
          </div>
        </div>
        <div className="tax-steps">
          <h3>신청 절차</h3>
          <ol>
            {taxBenefitInfo.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
        <div className="tax-warnings">
          <h3><AlertCircle size={16} /> 주의사항</h3>
          <ul>
            {taxBenefitInfo.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>

      {/* 행정 절차 트래커 */}
      <div className="section-card">
        <h2 className="section-title"><Shield size={18} /> 행정 절차</h2>
        <div className="admin-list">
          {admin.map(item => {
            const sc = statusConfig[item.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={item.id} className="admin-item">
                <div className="admin-item-left">
                  <StatusIcon size={20} style={{ color: sc.color }} />
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <span className="admin-role">담당: {item.role === 'both' ? '사장님 + 셰프' : item.role === 'owner' ? '사장님' : '셰프'}</span>
                  </div>
                </div>
                <div className="admin-item-right">
                  <span className="due-date">마감: {new Date(item.dueDate).toLocaleDateString('ko-KR')}</span>
                  <select
                    className="status-select"
                    value={item.status}
                    onChange={e => updateAdminStatus(item.id, e.target.value)}
                    style={{ color: sc.color, borderColor: sc.color, background: sc.bg }}
                  >
                    <option value="pending">대기</option>
                    <option value="inProgress">진행중</option>
                    <option value="done">완료</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 플랫폼 입점 트래커 */}
      <div className="section-card">
        <h2 className="section-title"><Store size={18} /> 플랫폼 입점 현황</h2>
        <div className="platform-grid">
          {platforms.map(p => {
            const sc = statusConfig[p.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={p.id} className="platform-card">
                <div className="platform-header">
                  <h3>{p.name}</h3>
                  <span className={`priority-badge ${p.priority === 1 ? 'high' : 'normal'}`}>
                    {p.priority === 1 ? '우선' : '후순위'}
                  </span>
                </div>
                <p className="platform-fee"><Info size={14} /> {p.fee}</p>
                <p className="platform-note">{p.note}</p>
                <select
                  className="status-select full"
                  value={p.status}
                  onChange={e => updatePlatformStatus(p.id, e.target.value)}
                  style={{ color: sc.color, borderColor: sc.color, background: sc.bg }}
                >
                  <option value="pending">대기</option>
                  <option value="inProgress">진행중</option>
                  <option value="done">완료</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .admin-page { max-width: 1000px; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .page-header p { color: var(--text-light); font-size: 14px; }

        .tax-card {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 1px solid #93c5fd;
          border-radius: var(--radius);
          padding: 24px;
          margin-bottom: 24px;
        }
        .tax-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: var(--primary-dark);
        }
        .tax-card-header h2 { font-size: 18px; font-weight: 700; color: var(--primary-dark); }
        .tax-card-header p { font-size: 13px; color: #3b82f6; margin-top: 2px; }

        .tax-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        .tax-info-item {
          background: rgba(255,255,255,0.7);
          border-radius: var(--radius-sm);
          padding: 12px;
        }
        .tax-info-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 4px;
        }
        .tax-info-item span:last-child { font-size: 13px; color: var(--text-dark); }

        .tax-steps, .tax-warnings {
          background: rgba(255,255,255,0.7);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-bottom: 12px;
        }
        .tax-steps:last-child, .tax-warnings:last-child { margin-bottom: 0; }
        .tax-steps h3, .tax-warnings h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tax-steps ol { padding-left: 20px; }
        .tax-steps li, .tax-warnings li { font-size: 13px; margin-bottom: 6px; line-height: 1.5; }
        .tax-warnings ul { padding-left: 20px; }
        .tax-warnings h3 { color: var(--warning); }

        .section-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: var(--shadow-sm);
        }
        .section-title {
          font-size: 18px; font-weight: 600; color: var(--text-dark);
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 20px;
        }

        .admin-list { display: flex; flex-direction: column; gap: 12px; }
        .admin-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          transition: border-color 0.15s;
        }
        .admin-item:hover { border-color: var(--primary); }
        .admin-item-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; }
        .admin-item-left h4 { font-size: 14px; font-weight: 600; color: var(--text-dark); }
        .admin-item-left p { font-size: 12px; color: var(--text-light); margin-top: 2px; }
        .admin-role { font-size: 11px; color: var(--primary); margin-top: 4px; display: block; }
        .admin-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .due-date { font-size: 12px; color: var(--text-light); }

        .status-select {
          padding: 6px 12px;
          border: 2px solid;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          -webkit-appearance: none;
        }
        .status-select.full { width: 100%; margin-top: 12px; text-align: center; }

        .platform-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .platform-card {
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 20px;
        }
        .platform-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .platform-header h3 { font-size: 16px; font-weight: 600; color: var(--text-dark); }
        .priority-badge {
          font-size: 11px; font-weight: 600;
          padding: 2px 10px; border-radius: 20px;
        }
        .priority-badge.high { background: var(--danger-light); color: var(--danger); }
        .priority-badge.normal { background: var(--border-light); color: var(--text-light); }
        .platform-fee {
          font-size: 13px; color: var(--text);
          display: flex; align-items: center; gap: 4px;
          margin-bottom: 6px;
        }
        .platform-note { font-size: 12px; color: var(--text-light); }

        @media (max-width: 768px) {
          .tax-grid { grid-template-columns: 1fr; }
          .platform-grid { grid-template-columns: 1fr; }
          .admin-item { flex-direction: column; align-items: flex-start; gap: 12px; }
          .admin-item-right { align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
