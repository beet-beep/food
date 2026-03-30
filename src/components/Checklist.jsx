import { useState } from 'react';
import { CheckSquare, Square, Filter, ChevronDown, ChevronRight, Search, Download, Trophy } from 'lucide-react';

const roleLabel = (role) => {
  if (role === 'owner') return '사장님';
  if (role === 'chef') return '셰프';
  return '함께';
};

const roleColor = (role) => {
  if (role === 'owner') return { bg: '#dbeafe', color: '#2563eb' };
  if (role === 'chef') return { bg: '#fff7ed', color: '#ea580c' };
  return { bg: '#ede9fe', color: '#7c3aed' };
};

export default function Checklist({ tasks, toggleTask }) {
  const [filter, setFilter] = useState('all');
  const [expandedWeeks, setExpandedWeeks] = useState({ 0: true, 1: true, 2: true, 3: true });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleWeek = (idx) => {
    setExpandedWeeks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filterTasks = (taskList) => {
    let result = taskList;
    if (filter === 'pending') result = result.filter(t => !t.done);
    else if (filter === 'done') result = result.filter(t => t.done);
    else if (filter !== 'all') result = result.filter(t => t.role === filter || (filter === 'both' && t.role === 'both'));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(t => t.text.toLowerCase().includes(q));
    }
    return result;
  };

  const allTotal = tasks.reduce((s, w) => s + w.days.reduce((a, d) => a + d.tasks.length, 0), 0);
  const allDone = tasks.reduce((s, w) => s + w.days.reduce((a, d) => a + d.tasks.filter(t => t.done).length, 0), 0);
  const allPct = allTotal > 0 ? Math.round((allDone / allTotal) * 100) : 0;
  const ownerTotal = tasks.reduce((s, w) => s + w.days.reduce((a, d) => a + d.tasks.filter(t => t.role === 'owner').length, 0), 0);
  const ownerDone = tasks.reduce((s, w) => s + w.days.reduce((a, d) => a + d.tasks.filter(t => t.role === 'owner' && t.done).length, 0), 0);
  const chefTotal = tasks.reduce((s, w) => s + w.days.reduce((a, d) => a + d.tasks.filter(t => t.role === 'chef').length, 0), 0);
  const chefDone = tasks.reduce((s, w) => s + w.days.reduce((a, d) => a + d.tasks.filter(t => t.role === 'chef' && t.done).length, 0), 0);

  const exportCSV = () => {
    let csv = '주차,날짜,담당,태스크,완료\n';
    tasks.forEach(w => {
      w.days.forEach(d => {
        d.tasks.forEach(t => {
          csv += `"${w.title}","${d.label}","${roleLabel(t.role)}","${t.text}","${t.done ? 'O' : 'X'}"\n`;
        });
      });
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = '체크리스트.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="checklist-page">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>4주 체크리스트</h1>
            <p>매일의 태스크를 체크하며 오픈까지 진행하세요</p>
          </div>
          <button className="export-btn" onClick={exportCSV}><Download size={14} /> CSV 내보내기</button>
        </div>
      </div>

      {/* 진행률 요약 */}
      <div className="cl-stats">
        <div className="cl-stat">
          <div className="cl-stat-ring">
            <svg width="48" height="48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - allPct / 100)}`}
                transform="rotate(-90 24 24)" style={{ transition: 'stroke-dashoffset 0.5s' }} />
            </svg>
            <span className="cl-stat-ring-text">{allPct}%</span>
          </div>
          <div><p className="cl-stat-label">전체</p><p className="cl-stat-val">{allDone}/{allTotal}</p></div>
        </div>
        <div className="cl-stat">
          <span className="cl-stat-dot" style={{ background: '#2563eb' }}></span>
          <div><p className="cl-stat-label">사장님</p><p className="cl-stat-val">{ownerDone}/{ownerTotal}</p></div>
        </div>
        <div className="cl-stat">
          <span className="cl-stat-dot" style={{ background: '#ea580c' }}></span>
          <div><p className="cl-stat-label">셰프</p><p className="cl-stat-val">{chefDone}/{chefTotal}</p></div>
        </div>
        {allPct === 100 && (
          <div className="cl-stat trophy">
            <Trophy size={24} />
            <div><p className="cl-stat-label">완료!</p><p className="cl-stat-val">모든 준비 끝!</p></div>
          </div>
        )}
      </div>

      {/* 검색 + 필터 */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} />
          <input className="search-input" placeholder="태스크 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="filter-btns">
          <Filter size={16} />
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>전체</button>
          <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>미완료</button>
          <button className={`filter-btn ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>완료</button>
          <span className="filter-divider">|</span>
          <button className={`filter-btn owner ${filter === 'owner' ? 'active' : ''}`} onClick={() => setFilter('owner')}>사장님</button>
          <button className={`filter-btn chef ${filter === 'chef' ? 'active' : ''}`} onClick={() => setFilter('chef')}>셰프</button>
        </div>
      </div>

      {tasks.map((week, weekIdx) => {
        const weekTotal = week.days.reduce((s, d) => s + d.tasks.length, 0);
        const weekDone = week.days.reduce((s, d) => s + d.tasks.filter(t => t.done).length, 0);
        const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
        const isExpanded = expandedWeeks[weekIdx];

        return (
          <div key={weekIdx} className="week-section">
            <button className="week-header" onClick={() => toggleWeek(weekIdx)}>
              <div className="week-header-left">
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <h2>{week.title}</h2>
                <span className="week-date-range">{week.dateRange}</span>
              </div>
              <div className="week-header-right">
                <span className="week-counter">{weekDone}/{weekTotal}</span>
                <div className="mini-progress">
                  <div className="mini-progress-fill" style={{ width: `${weekPct}%` }}></div>
                </div>
                <span className="week-pct-badge">{weekPct}%</span>
              </div>
            </button>

            {isExpanded && (
              <div className="week-body">
                {week.days.map((day, dayIdx) => {
                  const filtered = filterTasks(day.tasks);
                  if (filtered.length === 0) return null;
                  const dayDone = day.tasks.filter(t => t.done).length;
                  const dayTotal = day.tasks.length;
                  const isToday = day.date === new Date().toISOString().split('T')[0];

                  return (
                    <div key={dayIdx} className={`day-card ${isToday ? 'today' : ''}`}>
                      <div className="day-header">
                        <span className={`day-label ${isToday ? 'today-label' : ''}`}>
                          {isToday && <span className="today-dot"></span>}
                          {day.label}
                        </span>
                        <span className="day-counter">{dayDone}/{dayTotal}</span>
                      </div>
                      <ul className="task-list">
                        {filtered.map((task, taskIdx) => {
                          const actualIdx = day.tasks.indexOf(task);
                          const rc = roleColor(task.role);
                          return (
                            <li key={task.id} className={`task-item ${task.done ? 'done' : ''}`} onClick={() => toggleTask(weekIdx, dayIdx, actualIdx)}>
                              {task.done ? <CheckSquare size={18} className="check-icon checked" /> : <Square size={18} className="check-icon" />}
                              <span className="task-role" style={{ background: rc.bg, color: rc.color }}>{roleLabel(task.role)}</span>
                              <span className="task-text">{task.text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .checklist-page { max-width: 900px; }
        .page-header { margin-bottom: 20px; }
        .page-header-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .page-header p { color: var(--text-light); font-size: 14px; }
        .export-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: var(--text); background: var(--bg-card);
          border: 1px solid var(--border); white-space: nowrap;
        }
        .export-btn:hover { border-color: var(--primary); color: var(--primary); }

        .cl-stats {
          display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .cl-stat {
          display: flex; align-items: center; gap: 10px;
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 12px 16px; box-shadow: var(--shadow-sm);
        }
        .cl-stat.trophy { background: #fffbeb; border-color: #fbbf24; color: #f59e0b; }
        .cl-stat-ring { position: relative; width: 48px; height: 48px; }
        .cl-stat-ring-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--primary); }
        .cl-stat-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
        .cl-stat-label { font-size: 11px; color: var(--text-light); }
        .cl-stat-val { font-size: 16px; font-weight: 700; color: var(--text-dark); }

        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          margin-bottom: 24px;
        }
        .search-wrap {
          display: flex; align-items: center; gap: 8px; width: 100%;
          color: var(--text-light);
        }
        .search-input {
          flex: 1; border: none; outline: none; font-size: 14px; background: transparent;
          color: var(--text-dark); padding: 4px 0;
        }
        .search-input::placeholder { color: var(--text-light); }
        .filter-btns {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .filter-btn {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          background: var(--bg);
          border: 1px solid var(--border);
          transition: all 0.15s;
        }
        .filter-btn:hover { border-color: var(--primary); color: var(--primary); }
        .filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
        .filter-btn.owner.active { background: #2563eb; border-color: #2563eb; }
        .filter-btn.chef.active { background: #ea580c; border-color: #ea580c; }
        .filter-divider { color: var(--border); }

        .week-section {
          margin-bottom: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .week-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 16px 20px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .week-header:hover { background: var(--border-light); }
        .week-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .week-header-left h2 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dark);
        }
        .week-date-range {
          font-size: 12px;
          color: var(--text-light);
          background: var(--bg);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .week-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .week-counter { font-size: 13px; color: var(--text-light); }
        .mini-progress {
          width: 80px; height: 6px;
          background: var(--border-light);
          border-radius: 3px;
          overflow: hidden;
        }
        .mini-progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 3px;
          transition: width 0.3s;
        }
        .week-pct-badge {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
          min-width: 36px;
          text-align: right;
        }

        .week-body { padding: 0 20px 20px; }
        .day-card {
          margin-bottom: 12px;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .day-card.today { border-color: var(--primary); border-width: 2px; }
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background: var(--border-light);
        }
        .day-card.today .day-header { background: var(--primary-light); }
        .day-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .today-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--primary);
          display: inline-block;
        }
        .today-label { color: var(--primary); }
        .day-counter { font-size: 12px; color: var(--text-light); }

        .task-list { list-style: none; }
        .task-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border-light);
          cursor: pointer;
          transition: background 0.1s;
          font-size: 14px;
        }
        .task-item:hover { background: var(--bg); }
        .task-item:last-child { border-bottom: none; }
        .task-item.done { opacity: 0.5; }
        .task-item.done .task-text { text-decoration: line-through; }
        .check-icon { color: var(--text-light); flex-shrink: 0; }
        .check-icon.checked { color: var(--success); }
        .task-role {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .task-text { flex: 1; }

        @media (max-width: 768px) {
          .week-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .week-header-right { width: 100%; }
          .mini-progress { flex: 1; }
        }
      `}</style>
    </div>
  );
}
