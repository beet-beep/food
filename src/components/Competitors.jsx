import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Star, Tag, Lightbulb, X, Store } from 'lucide-react';

const PLATFORM_BADGES = {
  baemin: { label: '배민', color: '#2AC1BC' },
  coupang: { label: '쿠팡', color: '#E0115F' },
  yogiyo: { label: '요기요', color: '#FA0050' },
};

const emptyCompetitor = () => ({
  id: Date.now(),
  name: '',
  platform: 'baemin',
  rating: 0,
  reviewCount: 0,
  priceRange: '',
  minOrder: 0,
  deliveryFee: 0,
  menuCount: 0,
  positiveKeywords: [],
  negativeKeywords: [],
  memo: '',
  lastUpdated: new Date().toISOString().slice(0, 10),
});

export default function Competitors({ competitors, setCompetitors }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComp, setNewComp] = useState(emptyCompetitor());
  const [searchTerm, setSearchTerm] = useState('');
  const [kwInputs, setKwInputs] = useState({});

  // Summary stats
  const totalTracked = competitors.length;
  const avgRating =
    totalTracked > 0
      ? (competitors.reduce((s, c) => s + Number(c.rating || 0), 0) / totalTracked).toFixed(1)
      : 0;
  const avgReviews =
    totalTracked > 0
      ? Math.round(competitors.reduce((s, c) => s + Number(c.reviewCount || 0), 0) / totalTracked)
      : 0;

  const filtered = useMemo(
    () =>
      searchTerm
        ? competitors.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : competitors,
    [competitors, searchTerm]
  );

  const handleAdd = () => {
    if (!newComp.name.trim()) return;
    setCompetitors((prev) => [...prev, { ...newComp, id: Date.now(), lastUpdated: new Date().toISOString().slice(0, 10) }]);
    setNewComp(emptyCompetitor());
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCompetitor = (id, field, value) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value, lastUpdated: new Date().toISOString().slice(0, 10) } : c))
    );
  };

  const addKeyword = (id, type) => {
    const inputKey = `${id}-${type}`;
    const word = (kwInputs[inputKey] || '').trim();
    if (!word) return;
    setCompetitors((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const field = type === 'positive' ? 'positiveKeywords' : 'negativeKeywords';
        if (c[field].includes(word)) return c;
        return { ...c, [field]: [...c[field], word], lastUpdated: new Date().toISOString().slice(0, 10) };
      })
    );
    setKwInputs((prev) => ({ ...prev, [inputKey]: '' }));
  };

  const removeKeyword = (id, type, word) => {
    const field = type === 'positive' ? 'positiveKeywords' : 'negativeKeywords';
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: c[field].filter((k) => k !== word), lastUpdated: new Date().toISOString().slice(0, 10) } : c))
    );
  };

  // Insights
  const allNegative = useMemo(
    () => [...new Set(competitors.flatMap((c) => c.negativeKeywords || []))],
    [competitors]
  );
  const allPositive = useMemo(
    () => [...new Set(competitors.flatMap((c) => c.positiveKeywords || []))],
    [competitors]
  );

  const fmt = (n) => Number(n || 0).toLocaleString();

  return (
    <>
      <style>{`
        .comp-page { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
        .comp-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
        .comp-header p { font-size: 14px; color: var(--text-light); margin: 0 0 24px; }
        .comp-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .comp-stat {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 16px; text-align: center; box-shadow: var(--shadow-sm);
        }
        .comp-stat .cs-label { font-size: 13px; color: var(--text-light); margin-bottom: 6px; }
        .comp-stat .cs-value { font-size: 22px; font-weight: 700; color: var(--text-dark); }
        .comp-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .comp-search {
          flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius);
          background: var(--bg-card);
        }
        .comp-search input {
          border: none; outline: none; background: transparent; font-size: 14px; color: var(--text); flex: 1;
        }
        .comp-add-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
          background: var(--primary); color: #fff; border: none; border-radius: var(--radius);
          font-size: 14px; font-weight: 600; cursor: pointer;
        }
        .comp-add-btn:hover { opacity: 0.9; }
        .comp-add-form {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm);
        }
        .comp-add-form .caf-title { font-size: 16px; font-weight: 600; margin-bottom: 14px; color: var(--text-dark); }
        .comp-add-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 14px; }
        .comp-add-grid label { font-size: 12px; color: var(--text-light); display: block; margin-bottom: 4px; }
        .comp-add-grid input, .comp-add-grid select {
          width: 100%; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--radius);
          font-size: 13px; background: var(--bg); color: var(--text); box-sizing: border-box;
        }
        .comp-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
        .comp-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; box-shadow: var(--shadow-sm); position: relative;
        }
        .comp-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .comp-card-name { font-size: 16px; font-weight: 600; color: var(--text-dark); }
        .comp-badge {
          display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px;
          font-weight: 600; color: #fff; margin-left: 8px;
        }
        .comp-rating { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 600; color: #f59e0b; margin-bottom: 10px; }
        .comp-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 16px; font-size: 13px; color: var(--text); margin-bottom: 14px; }
        .comp-meta span { color: var(--text-light); }
        .comp-kw-section { margin-bottom: 10px; }
        .comp-kw-label { font-size: 12px; font-weight: 600; color: var(--text-light); margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
        .comp-kw-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
        .comp-kw-tag {
          display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
          border-radius: 12px; font-size: 12px; font-weight: 500;
        }
        .comp-kw-tag.positive { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
        .comp-kw-tag.negative { background: color-mix(in srgb, var(--danger) 15%, transparent); color: var(--danger); }
        .comp-kw-tag button { background: none; border: none; cursor: pointer; padding: 0; display: flex; color: inherit; }
        .comp-kw-input { display: flex; gap: 6px; }
        .comp-kw-input input {
          flex: 1; padding: 5px 8px; border: 1px solid var(--border-light); border-radius: var(--radius);
          font-size: 12px; background: var(--bg); color: var(--text);
        }
        .comp-kw-input button {
          padding: 5px 10px; background: var(--bg); border: 1px solid var(--border-light);
          border-radius: var(--radius); font-size: 12px; cursor: pointer; color: var(--text);
        }
        .comp-card-memo textarea {
          width: 100%; min-height: 50px; padding: 8px 10px; border: 1px solid var(--border-light);
          border-radius: var(--radius); font-size: 12px; background: var(--bg); color: var(--text);
          resize: vertical; box-sizing: border-box; margin-bottom: 8px;
        }
        .comp-card-footer { display: flex; justify-content: space-between; align-items: center; }
        .comp-card-date { font-size: 11px; color: var(--text-light); }
        .comp-delete-btn {
          display: inline-flex; align-items: center; gap: 4px; padding: 6px 14px;
          background: none; border: 1px solid var(--danger); color: var(--danger);
          border-radius: var(--radius); font-size: 12px; cursor: pointer;
        }
        .comp-delete-btn:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }
        .comp-insight {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 24px;
        }
        .comp-insight-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--text-dark); }
        .comp-insight-item { margin-bottom: 14px; }
        .comp-insight-item .ci-label { font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
        .comp-insight-item .ci-text { font-size: 13px; color: var(--text); line-height: 1.6; }
        .comp-insight-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        @media (max-width: 700px) {
          .comp-cards { grid-template-columns: 1fr; }
          .comp-summary { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="comp-page">
        <div className="comp-header">
          <h1><Store size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} />경쟁사 분석</h1>
          <p>주변 경쟁 매장의 정보를 수집하고 인사이트를 얻으세요.</p>
        </div>

        {/* Summary */}
        <div className="comp-summary">
          <div className="comp-stat">
            <div className="cs-label">추적 중인 경쟁사</div>
            <div className="cs-value">{totalTracked}개</div>
          </div>
          <div className="comp-stat">
            <div className="cs-label">평균 별점</div>
            <div className="cs-value" style={{ color: '#f59e0b' }}>
              <Star size={18} style={{ verticalAlign: 'middle', marginRight: 4, fill: '#f59e0b', stroke: '#f59e0b' }} />
              {avgRating}
            </div>
          </div>
          <div className="comp-stat">
            <div className="cs-label">평균 리뷰 수</div>
            <div className="cs-value">{fmt(avgReviews)}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="comp-toolbar">
          <div className="comp-search">
            <Search size={16} style={{ color: 'var(--text-light)' }} />
            <input
              placeholder="경쟁사 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="comp-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} /> 추가
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="comp-add-form">
            <div className="caf-title">새 경쟁사 추가</div>
            <div className="comp-add-grid">
              <div>
                <label>매장명</label>
                <input value={newComp.name} onChange={(e) => setNewComp((p) => ({ ...p, name: e.target.value }))} placeholder="매장명" />
              </div>
              <div>
                <label>플랫폼</label>
                <select value={newComp.platform} onChange={(e) => setNewComp((p) => ({ ...p, platform: e.target.value }))}>
                  <option value="baemin">배민</option>
                  <option value="coupang">쿠팡</option>
                  <option value="yogiyo">요기요</option>
                </select>
              </div>
              <div>
                <label>별점</label>
                <input type="number" min="0" max="5" step="0.1" value={newComp.rating} onChange={(e) => setNewComp((p) => ({ ...p, rating: Number(e.target.value) }))} />
              </div>
              <div>
                <label>리뷰 수</label>
                <input type="number" min="0" value={newComp.reviewCount} onChange={(e) => setNewComp((p) => ({ ...p, reviewCount: Number(e.target.value) }))} />
              </div>
              <div>
                <label>가격대</label>
                <input value={newComp.priceRange} onChange={(e) => setNewComp((p) => ({ ...p, priceRange: e.target.value }))} placeholder="예: 8,000~12,000" />
              </div>
              <div>
                <label>최소 주문</label>
                <input type="number" min="0" step="1000" value={newComp.minOrder} onChange={(e) => setNewComp((p) => ({ ...p, minOrder: Number(e.target.value) }))} />
              </div>
              <div>
                <label>배달비</label>
                <input type="number" min="0" step="500" value={newComp.deliveryFee} onChange={(e) => setNewComp((p) => ({ ...p, deliveryFee: Number(e.target.value) }))} />
              </div>
              <div>
                <label>메뉴 수</label>
                <input type="number" min="0" value={newComp.menuCount} onChange={(e) => setNewComp((p) => ({ ...p, menuCount: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="comp-add-btn" onClick={handleAdd}>저장</button>
              <button
                style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer', fontSize: 14 }}
                onClick={() => { setShowAddForm(false); setNewComp(emptyCompetitor()); }}
              >취소</button>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="comp-cards">
          {filtered.map((c) => {
            const badge = PLATFORM_BADGES[c.platform] || PLATFORM_BADGES.baemin;
            return (
              <div className="comp-card" key={c.id}>
                <div className="comp-card-top">
                  <div>
                    <span className="comp-card-name">{c.name}</span>
                    <span className="comp-badge" style={{ background: badge.color }}>{badge.label}</span>
                  </div>
                </div>
                <div className="comp-rating">
                  <Star size={16} style={{ fill: '#f59e0b', stroke: '#f59e0b' }} /> {Number(c.rating).toFixed(1)}
                  <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 400, marginLeft: 4 }}>({fmt(c.reviewCount)}개 리뷰)</span>
                </div>
                <div className="comp-meta">
                  <div><span>가격대:</span> {c.priceRange || '-'}</div>
                  <div><span>최소 주문:</span> {fmt(c.minOrder)}원</div>
                  <div><span>배달비:</span> {fmt(c.deliveryFee)}원</div>
                  <div><span>메뉴 수:</span> {c.menuCount}개</div>
                </div>

                {/* Positive keywords */}
                <div className="comp-kw-section">
                  <div className="comp-kw-label"><Tag size={12} /> 긍정 키워드</div>
                  <div className="comp-kw-tags">
                    {(c.positiveKeywords || []).map((kw) => (
                      <span key={kw} className="comp-kw-tag positive">
                        {kw}
                        <button onClick={() => removeKeyword(c.id, 'positive', kw)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="comp-kw-input">
                    <input
                      placeholder="키워드 추가..."
                      value={kwInputs[`${c.id}-positive`] || ''}
                      onChange={(e) => setKwInputs((p) => ({ ...p, [`${c.id}-positive`]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addKeyword(c.id, 'positive')}
                    />
                    <button onClick={() => addKeyword(c.id, 'positive')}>+</button>
                  </div>
                </div>

                {/* Negative keywords */}
                <div className="comp-kw-section">
                  <div className="comp-kw-label"><Tag size={12} /> 부정 키워드</div>
                  <div className="comp-kw-tags">
                    {(c.negativeKeywords || []).map((kw) => (
                      <span key={kw} className="comp-kw-tag negative">
                        {kw}
                        <button onClick={() => removeKeyword(c.id, 'negative', kw)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="comp-kw-input">
                    <input
                      placeholder="키워드 추가..."
                      value={kwInputs[`${c.id}-negative`] || ''}
                      onChange={(e) => setKwInputs((p) => ({ ...p, [`${c.id}-negative`]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addKeyword(c.id, 'negative')}
                    />
                    <button onClick={() => addKeyword(c.id, 'negative')}>+</button>
                  </div>
                </div>

                {/* Memo */}
                <div className="comp-card-memo">
                  <textarea
                    placeholder="메모..."
                    value={c.memo || ''}
                    onChange={(e) => updateCompetitor(c.id, 'memo', e.target.value)}
                  />
                </div>

                <div className="comp-card-footer">
                  <span className="comp-card-date">최종 업데이트: {c.lastUpdated || '-'}</span>
                  <button className="comp-delete-btn" onClick={() => handleDelete(c.id)}>
                    <Trash2 size={13} /> 삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights */}
        {competitors.length > 0 && (
          <div className="comp-insight">
            <div className="comp-insight-title"><Lightbulb size={20} /> 인사이트</div>

            {Number(avgRating) > 4.5 && (
              <div className="comp-insight-item">
                <div className="ci-label">⚠️ 높은 경쟁사 별점</div>
                <div className="ci-text">경쟁사 평균 별점이 높습니다. 리뷰 관리에 집중하세요.</div>
              </div>
            )}

            {allNegative.length > 0 && (
              <div className="comp-insight-item">
                <div className="ci-label">💡 차별화 기회</div>
                <div className="ci-text">경쟁사의 부정적 피드백을 우리의 강점으로 만드세요:</div>
                <div className="comp-insight-tags" style={{ marginTop: 6 }}>
                  {allNegative.map((kw) => (
                    <span key={kw} className="comp-kw-tag negative">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {allPositive.length > 0 && (
              <div className="comp-insight-item">
                <div className="ci-label">📌 벤치마킹 포인트</div>
                <div className="ci-text">경쟁사가 잘하고 있는 부분을 참고하세요:</div>
                <div className="comp-insight-tags" style={{ marginTop: 6 }}>
                  {allPositive.map((kw) => (
                    <span key={kw} className="comp-kw-tag positive">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {allNegative.length === 0 && allPositive.length === 0 && Number(avgRating) <= 4.5 && (
              <div className="comp-insight-item">
                <div className="ci-text">경쟁사에 키워드를 추가하면 인사이트가 자동으로 생성됩니다.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
