import { useState, useMemo, useCallback } from 'react';
import {
  Image, Copy, Download, FileText, Check, Palette, Type, Printer,
  Globe, ChevronDown, RefreshCw, Sparkles,
} from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');

/* ================================================================
   GRADIENT PRESETS
   ================================================================ */
const GRADIENT_PRESETS = [
  { id: 'warm', label: '웜 오렌지', colors: ['#ff6b35', '#f7931e'], textColor: '#fff', subColor: 'rgba(255,255,255,0.85)' },
  { id: 'cool', label: '쿨 블루', colors: ['#1a73e8', '#00b4d8'], textColor: '#fff', subColor: 'rgba(255,255,255,0.85)' },
  { id: 'green', label: '프레시 그린', colors: ['#2d6a4f', '#52b788'], textColor: '#fff', subColor: 'rgba(255,255,255,0.85)' },
  { id: 'dark', label: '다크 프리미엄', colors: ['#1a1a2e', '#16213e'], textColor: '#f0e68c', subColor: 'rgba(240,230,140,0.8)' },
];

/* ================================================================
   LAYOUT PRESETS
   ================================================================ */
const LAYOUT_PRESETS = [
  {
    id: 'simple', label: '심플',
    nameFont: 'Pretendard, -apple-system, sans-serif', nameWeight: 700,
    emojiSize: 120, nameSize: 32, priceSize: 28, descSize: 16,
    badgeStyle: 'rect', borderRadius: 0,
  },
  {
    id: 'premium', label: '프리미엄',
    nameFont: 'Georgia, serif', nameWeight: 700,
    emojiSize: 100, nameSize: 34, priceSize: 26, descSize: 15,
    badgeStyle: 'pill', borderRadius: 24,
  },
  {
    id: 'cute', label: '귀여운',
    nameFont: 'Pretendard, -apple-system, sans-serif', nameWeight: 800,
    emojiSize: 140, nameSize: 30, priceSize: 26, descSize: 15,
    badgeStyle: 'circle', borderRadius: 40,
  },
];

/* ================================================================
   DEFAULT ORIGIN MAP
   ================================================================ */
const ORIGIN_OPTIONS = ['국내산', '미국산', '호주산', '중국산', '러시아산', '기타'];

const DEFAULT_ORIGINS = {
  '쌀': '국내산', '묵은지': '국내산', '돼지고기': '국내산', '돼지고기 다짐육': '국내산',
  '돼지 앞다리살': '국내산', '닭다리살': '국내산', '닭다리살 (순살)': '국내산',
  '오징어': '국내산', '오징어 (손질)': '국내산', '새우': '수입산', '냉동 새우': '수입산',
  '쭈꾸미': '국내산', '쭈꾸미 (손질)': '국내산', '낙지': '국내산', '낙지 (손질)': '국내산',
  '홍합': '국내산', '게맛살': '수입산', '계란': '국내산', '두부': '국내산',
  '양파': '국내산', '대파': '국내산', '당근': '국내산', '고추': '국내산',
  '깻잎': '국내산', '피망': '국내산', '감자': '국내산', '호박': '국내산', '옥수수': '국내산',
  '우동면': '국내산', '냉동 교자': '국내산', '햄/소시지': '국내산',
};

/* ================================================================
   DESCRIPTION TEMPLATES
   ================================================================ */
function generateDescriptions(menu) {
  const ings = (menu.ingredients || []).map(i => i.name.replace(/\s*\(.*?\)/g, '').replace(/\s*\d+[gml개마리]+$/g, '').trim());
  const mainIngs = ings.filter(n => !n.includes('포장') && !n.includes('식용유') && !n.includes('전분') && !n.includes('참기름') && !n.includes('깨') && !n.includes('소금') && !n.includes('버터')).slice(0, 3);
  const priceStr = fmt(menu.price);
  const name = menu.name;

  const ingredient = mainIngs.length > 0
    ? `${mainIngs.join(', ')}${mainIngs.length > 1 ? ' 등' : ''}을 듬뿍 담아 정성껏 만든 ${name}. 한 입 먹으면 멈출 수 없는 맛!`
    : `엄선된 재료로 정성껏 만든 ${name}. 한 입 먹으면 멈출 수 없는 맛!`;

  const emotional = [
    `어머니의 손맛을 담아 하나하나 정성껏 만든 ${name}. 따뜻한 한 끼의 행복을 전해드립니다.`,
    `매일 새벽 준비하는 신선한 재료로 만드는 ${name}. 정직한 한 그릇의 감동을 느껴보세요.`,
    `첫 한 숟갈에 미소가 번지는 ${name}. 바쁜 하루, 따뜻한 위로가 되어드릴게요.`,
  ];

  const value = `이 가격에 이 양! ${priceStr}원으로 즐기는 푸짐한 ${name}. 가성비 끝판왕, 든든한 한 끼 보장!`;

  return {
    ingredient,
    emotional: emotional[Math.floor(Math.random() * emotional.length)],
    value,
  };
}

/* ================================================================
   CANVAS DRAWING — draw a menu card on an offscreen canvas
   ================================================================ */
function drawCardToCanvas(menu, gradient, layout) {
  const canvas = document.createElement('canvas');
  canvas.width = 750;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grd = ctx.createLinearGradient(0, 0, 750, 750);
  grd.addColorStop(0, gradient.colors[0]);
  grd.addColorStop(1, gradient.colors[1]);
  ctx.fillStyle = grd;
  if (layout.borderRadius > 0) {
    roundRect(ctx, 0, 0, 750, 750, layout.borderRadius);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, 750, 750);
  }

  // Badge
  if (menu.badge) {
    const badgeColors = {
      BEST: { bg: '#ef4444', text: '#fff' },
      HOT: { bg: '#f97316', text: '#fff' },
      NEW: { bg: '#22c55e', text: '#fff' },
    };
    const bc = badgeColors[menu.badge] || { bg: '#6366f1', text: '#fff' };
    ctx.font = `bold 20px Pretendard, -apple-system, sans-serif`;
    const badgeText = menu.badge;
    const badgeW = ctx.measureText(badgeText).width + 32;
    const badgeH = 38;
    const badgeX = 750 - badgeW - 30;
    const badgeY = 30;
    ctx.fillStyle = bc.bg;
    if (layout.badgeStyle === 'pill') {
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 19);
      ctx.fill();
    } else if (layout.badgeStyle === 'circle') {
      const r = Math.max(badgeW, badgeH) / 2 + 4;
      ctx.beginPath();
      ctx.arc(badgeX + badgeW / 2, badgeY + badgeH / 2, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fillStyle = bc.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);
  }

  // Emoji
  ctx.font = `${layout.emojiSize}px Pretendard, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(menu.emoji || '', 375, 240);

  // Name
  ctx.font = `${layout.nameWeight} ${layout.nameSize}px ${layout.nameFont}`;
  ctx.fillStyle = gradient.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(menu.name, 375, 380);

  // Price
  ctx.font = `bold ${layout.priceSize}px Pretendard, -apple-system, sans-serif`;
  ctx.fillStyle = gradient.textColor;
  ctx.fillText(`${fmt(menu.price)}원`, 375, 440);

  // Description
  ctx.font = `${layout.descSize}px Pretendard, -apple-system, sans-serif`;
  ctx.fillStyle = gradient.subColor;
  const desc = menu.desc || '';
  const lines = wrapText(ctx, desc, 600);
  lines.forEach((line, i) => {
    ctx.fillText(line, 375, 510 + i * (layout.descSize + 8));
  });

  // Decorative line
  ctx.strokeStyle = gradient.subColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(225, 470);
  ctx.lineTo(525, 470);
  ctx.stroke();

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split('');
  const lines = [];
  let current = '';
  for (const ch of words) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function MenuTools({ menus }) {
  const [tab, setTab] = useState('image');

  const tabs = [
    { id: 'image', label: '메뉴판 이미지 생성', icon: Image },
    { id: 'origin', label: '원산지 표시 자동 생성', icon: Globe },
    { id: 'desc', label: '메뉴 설명문 작성기', icon: FileText },
  ];

  const menuList = menus || [];

  return (
    <div className="mt">
      <div className="mt-page-header">
        <h1>메뉴 도구 센터</h1>
        <p>메뉴판 이미지 생성, 원산지 표시, 메뉴 설명문 작성을 한 곳에서</p>
      </div>

      <div className="mt-tab-bar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`mt-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'image' && <ImageTab menus={menuList} />}
      {tab === 'origin' && <OriginTab menus={menuList} />}
      {tab === 'desc' && <DescTab menus={menuList} />}

      <style>{menuToolsCSS}</style>
    </div>
  );
}

/* ================================================================
   TAB 1 — 메뉴판 이미지 생성
   ================================================================ */
function ImageTab({ menus }) {
  const [selectedGradients, setSelectedGradients] = useState(() => {
    const m = {};
    menus.forEach(menu => { m[menu.id] = 'warm'; });
    return m;
  });
  const [layoutPreset, setLayoutPreset] = useState('simple');
  const [downloading, setDownloading] = useState({});
  const [batchDownloading, setBatchDownloading] = useState(false);

  const layout = LAYOUT_PRESETS.find(p => p.id === layoutPreset) || LAYOUT_PRESETS[0];

  const getGradient = (menuId) => GRADIENT_PRESETS.find(g => g.id === selectedGradients[menuId]) || GRADIENT_PRESETS[0];

  const handleDownload = useCallback((menu) => {
    setDownloading(prev => ({ ...prev, [menu.id]: true }));
    const gradient = GRADIENT_PRESETS.find(g => g.id === (selectedGradients[menu.id] || 'warm')) || GRADIENT_PRESETS[0];
    const canvas = drawCardToCanvas(menu, gradient, layout);
    downloadCanvas(canvas, `${menu.name}_메뉴판.png`);
    setTimeout(() => setDownloading(prev => ({ ...prev, [menu.id]: false })), 1500);
  }, [selectedGradients, layout]);

  const handleBatchDownload = useCallback(() => {
    setBatchDownloading(true);
    menus.forEach((menu, idx) => {
      setTimeout(() => {
        const gradient = GRADIENT_PRESETS.find(g => g.id === (selectedGradients[menu.id] || 'warm')) || GRADIENT_PRESETS[0];
        const canvas = drawCardToCanvas(menu, gradient, layout);
        downloadCanvas(canvas, `${menu.name}_메뉴판.png`);
        if (idx === menus.length - 1) {
          setTimeout(() => setBatchDownloading(false), 1000);
        }
      }, idx * 300);
    });
  }, [menus, selectedGradients, layout]);

  if (menus.length === 0) {
    return (
      <div className="mt-tab-content">
        <div className="mt-card">
          <p className="mt-empty">메뉴가 없습니다. 메뉴 관리에서 먼저 등록하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-tab-content">
      {/* Layout Preset Selector */}
      <div className="mt-card">
        <h3 className="mt-card-title"><Palette size={16} /> 레이아웃 프리셋</h3>
        <div className="mt-preset-grid">
          {LAYOUT_PRESETS.map(p => (
            <button
              key={p.id}
              className={`mt-preset-btn ${layoutPreset === p.id ? 'active' : ''}`}
              onClick={() => setLayoutPreset(p.id)}
            >
              <Type size={16} />
              <span className="mt-preset-label">{p.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-batch-row">
          <button
            className="mt-btn mt-btn-primary mt-btn-lg"
            onClick={handleBatchDownload}
            disabled={batchDownloading}
          >
            <Download size={16} />
            {batchDownloading ? '다운로드 중...' : '전체 메뉴 이미지 다운로드'}
          </button>
        </div>
      </div>

      {/* Menu Cards */}
      <div className="mt-image-grid">
        {menus.map(menu => {
          const gradient = getGradient(menu.id);
          const isDown = downloading[menu.id];
          return (
            <div key={menu.id} className="mt-card mt-image-card">
              {/* Preview */}
              <div
                className="mt-preview"
                style={{
                  background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                  borderRadius: layout.borderRadius,
                }}
              >
                {menu.badge && (
                  <span
                    className="mt-preview-badge"
                    style={{
                      background: menu.badge === 'BEST' ? '#ef4444' : menu.badge === 'HOT' ? '#f97316' : '#22c55e',
                      borderRadius: layout.badgeStyle === 'pill' ? 19 : layout.badgeStyle === 'circle' ? '50%' : 4,
                      padding: layout.badgeStyle === 'circle' ? '8px 12px' : '6px 14px',
                    }}
                  >
                    {menu.badge}
                  </span>
                )}
                <span className="mt-preview-emoji" style={{ fontSize: layout.emojiSize * 0.45 }}>{menu.emoji}</span>
                <span
                  className="mt-preview-name"
                  style={{
                    color: gradient.textColor,
                    fontFamily: layout.nameFont,
                    fontWeight: layout.nameWeight,
                    fontSize: layout.nameSize * 0.5,
                  }}
                >
                  {menu.name}
                </span>
                <span className="mt-preview-price" style={{ color: gradient.textColor, fontSize: layout.priceSize * 0.45 }}>
                  {fmt(menu.price)}원
                </span>
                <span className="mt-preview-divider" style={{ background: gradient.subColor }} />
                <span className="mt-preview-desc" style={{ color: gradient.subColor, fontSize: layout.descSize * 0.5 }}>
                  {menu.desc}
                </span>
              </div>

              {/* Color Picker */}
              <div className="mt-color-row">
                {GRADIENT_PRESETS.map(g => (
                  <button
                    key={g.id}
                    className={`mt-color-btn ${selectedGradients[menu.id] === g.id ? 'active' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}
                    onClick={() => setSelectedGradients(prev => ({ ...prev, [menu.id]: g.id }))}
                    title={g.label}
                  />
                ))}
              </div>

              {/* Download Button */}
              <button
                className={`mt-btn mt-btn-download ${isDown ? 'done' : ''}`}
                onClick={() => handleDownload(menu)}
                disabled={isDown}
              >
                {isDown ? <><Check size={14} /> 완료</> : <><Download size={14} /> 다운로드 PNG</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   TAB 2 — 원산지 표시 자동 생성
   ================================================================ */
function OriginTab({ menus }) {
  const [storeName, setStoreName] = useState('우리가게');
  const [copied, setCopied] = useState(false);

  // Collect all unique ingredient names (strip quantity info)
  const allIngredients = useMemo(() => {
    const set = new Map();
    menus.forEach(menu => {
      (menu.ingredients || []).forEach(ing => {
        const raw = ing.name;
        const clean = raw.replace(/\s*\(.*?\)/g, '').replace(/\s*\d+[gml개마리]+$/g, '').trim();
        if (!clean.includes('포장') && !clean.includes('식용유') && !clean.includes('전분') && !clean.includes('참기름') &&
            !clean.includes('깨') && !clean.includes('소금') && !clean.includes('버터') && !clean.includes('소스') &&
            !clean.includes('케첩') && !clean.includes('데미') && !clean.includes('굴소스') && !clean.includes('간장') &&
            !clean.includes('김가루') && !clean.includes('두반장') && !clean.includes('고추장') && !clean.includes('고추기름') &&
            !clean.includes('국물') && !clean.includes('매콤') && !clean.includes('유린') && !clean.includes('깐쇼') &&
            !clean.includes('깐풍') && !clean.includes('라조') && !clean.includes('춘장') && !clean.includes('해물')) {
          if (!set.has(clean)) {
            set.set(clean, raw);
          }
        }
      });
    });
    return Array.from(set.entries()).map(([clean, raw]) => ({ clean, raw }));
  }, [menus]);

  const [origins, setOrigins] = useState(() => {
    const m = {};
    allIngredients.forEach(({ clean }) => {
      // Try matching known defaults
      const matched = Object.keys(DEFAULT_ORIGINS).find(k => clean.includes(k));
      m[clean] = matched ? DEFAULT_ORIGINS[matched] : '국내산';
    });
    return m;
  });

  // Per-menu ingredient-origin mapping
  const menuOriginData = useMemo(() => {
    return menus.map(menu => {
      const ings = (menu.ingredients || [])
        .map(ing => {
          const clean = ing.name.replace(/\s*\(.*?\)/g, '').replace(/\s*\d+[gml개마리]+$/g, '').trim();
          return { raw: ing.name, clean };
        })
        .filter(({ clean }) =>
          !clean.includes('포장') && !clean.includes('식용유') && !clean.includes('전분') && !clean.includes('참기름') &&
          !clean.includes('깨') && !clean.includes('소금') && !clean.includes('버터') && !clean.includes('소스') &&
          !clean.includes('케첩') && !clean.includes('데미') && !clean.includes('굴소스') && !clean.includes('간장') &&
          !clean.includes('김가루') && !clean.includes('두반장') && !clean.includes('고추장') && !clean.includes('고추기름') &&
          !clean.includes('국물') && !clean.includes('매콤') && !clean.includes('유린') && !clean.includes('깐쇼') &&
          !clean.includes('깐풍') && !clean.includes('라조') && !clean.includes('춘장') && !clean.includes('해물')
        );
      return { menu, ings };
    });
  }, [menus]);

  const originText = useMemo(() => {
    return allIngredients
      .map(({ clean }) => `${clean}: ${origins[clean] || '국내산'}`)
      .join(', ');
  }, [allIngredients, origins]);

  const handleCopy = () => {
    navigator.clipboard.writeText(originText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    const rows = allIngredients.map(({ clean }) =>
      `<tr><td style="border:1px solid #333;padding:10px 16px;font-size:15px;">${clean}</td><td style="border:1px solid #333;padding:10px 16px;font-size:15px;text-align:center;">${origins[clean] || '국내산'}</td></tr>`
    ).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>원산지 표시</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 40px; }
          h1 { text-align: center; font-size: 28px; margin-bottom: 8px; border-bottom: 3px solid #333; padding-bottom: 12px; }
          h2 { text-align: center; font-size: 18px; color: #555; margin-bottom: 32px; font-weight: 400; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          th { border: 1px solid #333; padding: 12px 16px; font-size: 15px; background: #f5f5f5; text-align: center; font-weight: 700; }
          .footer { text-align: center; font-size: 13px; color: #888; margin-top: 24px; }
          .legal { text-align: center; font-size: 12px; color: #999; margin-top: 8px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>원산지 표시</h1>
        <h2>${storeName}</h2>
        <p style="text-align:center;font-size:14px;color:#666;margin-bottom:24px;">식품위생법에 의한 원산지 표시</p>
        <table>
          <thead>
            <tr>
              <th style="width:50%;">식재료</th>
              <th style="width:50%;">원산지</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="footer">${dateStr} 기준</p>
        <p class="legal">농수산물의 원산지 표시 등에 관한 법률에 따라 표시합니다.</p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  if (menus.length === 0) {
    return (
      <div className="mt-tab-content">
        <div className="mt-card">
          <p className="mt-empty">메뉴가 없습니다. 메뉴 관리에서 먼저 등록하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-tab-content">
      {/* Store Name */}
      <div className="mt-card">
        <h3 className="mt-card-title"><Globe size={16} /> 원산지 표시 설정</h3>
        <div className="mt-origin-store-row">
          <label className="mt-label">가게 이름</label>
          <input
            type="text"
            className="mt-input"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            placeholder="가게 이름 입력"
          />
        </div>
      </div>

      {/* Ingredient Origin Mapping */}
      <div className="mt-card">
        <h3 className="mt-card-title"><FileText size={16} /> 식재료별 원산지 설정</h3>
        <p className="mt-card-desc">각 식재료의 원산지를 선택하세요. 메뉴에 사용되는 주요 식재료만 표시됩니다.</p>
        <div className="mt-origin-grid">
          {allIngredients.map(({ clean }) => (
            <div key={clean} className="mt-origin-item">
              <span className="mt-origin-name">{clean}</span>
              <div className="mt-select-wrap">
                <select
                  className="mt-select"
                  value={origins[clean] || '국내산'}
                  onChange={e => setOrigins(prev => ({ ...prev, [clean]: e.target.value }))}
                >
                  {ORIGIN_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="mt-select-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Menu Origin View */}
      <div className="mt-card">
        <h3 className="mt-card-title"><FileText size={16} /> 메뉴별 원산지 확인</h3>
        <div className="mt-menu-origin-list">
          {menuOriginData.map(({ menu, ings }) => (
            <div key={menu.id} className="mt-menu-origin-row">
              <div className="mt-menu-origin-header">
                <span className="mt-menu-origin-emoji">{menu.emoji}</span>
                <span className="mt-menu-origin-name">{menu.name}</span>
              </div>
              <div className="mt-menu-origin-ings">
                {ings.map(({ clean }, idx) => (
                  <span key={idx} className="mt-origin-chip">
                    {clean}: <strong>{origins[clean] || '국내산'}</strong>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Text */}
      <div className="mt-card">
        <h3 className="mt-card-title"><FileText size={16} /> 자동 생성 원산지 표시문</h3>
        <div className="mt-origin-text-box">
          <p className="mt-origin-text">{originText}</p>
        </div>
        <div className="mt-origin-actions">
          <button className={`mt-btn ${copied ? 'mt-btn-success' : 'mt-btn-primary'}`} onClick={handleCopy}>
            {copied ? <><Check size={14} /> 복사 완료</> : <><Copy size={14} /> 복사</>}
          </button>
          <button className="mt-btn mt-btn-secondary" onClick={handlePrint}>
            <Printer size={14} /> A4 표시판 인쇄
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 3 — 메뉴 설명문 작성기
   ================================================================ */
function DescTab({ menus }) {
  const [selectedMenuId, setSelectedMenuId] = useState(menus[0]?.id || '');
  const [descs, setDescs] = useState({});
  const [editedDescs, setEditedDescs] = useState({});
  const [copiedKey, setCopiedKey] = useState('');
  const [showBatch, setShowBatch] = useState(false);
  const [batchCopied, setBatchCopied] = useState(false);

  const selectedMenu = menus.find(m => m.id === selectedMenuId) || menus[0];

  const handleGenerate = useCallback(() => {
    if (!selectedMenu) return;
    const d = generateDescriptions(selectedMenu);
    setDescs(prev => ({ ...prev, [selectedMenu.id]: d }));
    setEditedDescs(prev => ({
      ...prev,
      [selectedMenu.id]: { ingredient: d.ingredient, emotional: d.emotional, value: d.value },
    }));
  }, [selectedMenu]);

  const handleCopyDesc = (menuId, type) => {
    const text = editedDescs[menuId]?.[type] || descs[menuId]?.[type] || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(`${menuId}-${type}`);
      setTimeout(() => setCopiedKey(''), 2000);
    });
  };

  const handleBatchGenerate = () => {
    const allDescs = {};
    const allEdited = {};
    menus.forEach(menu => {
      const d = generateDescriptions(menu);
      allDescs[menu.id] = d;
      allEdited[menu.id] = { ingredient: d.ingredient, emotional: d.emotional, value: d.value };
    });
    setDescs(allDescs);
    setEditedDescs(allEdited);
    setShowBatch(true);
  };

  const handleBatchCopy = () => {
    const lines = menus.map(menu => {
      const d = editedDescs[menu.id] || descs[menu.id];
      if (!d) return '';
      return `[${menu.emoji} ${menu.name}]\n  재료 강조: ${d.ingredient}\n  감성형: ${d.emotional}\n  가성비: ${d.value}`;
    }).filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(lines).then(() => {
      setBatchCopied(true);
      setTimeout(() => setBatchCopied(false), 2000);
    });
  };

  const currentDescs = descs[selectedMenu?.id];
  const currentEdited = editedDescs[selectedMenu?.id];

  const descTypes = [
    { key: 'ingredient', label: '재료 강조형', icon: '🥩', color: '#ea580c' },
    { key: 'emotional', label: '감성형', icon: '💕', color: '#8b5cf6' },
    { key: 'value', label: '가성비 강조형', icon: '💰', color: '#059669' },
  ];

  if (menus.length === 0) {
    return (
      <div className="mt-tab-content">
        <div className="mt-card">
          <p className="mt-empty">메뉴가 없습니다. 메뉴 관리에서 먼저 등록하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-tab-content">
      {/* Menu Selector */}
      <div className="mt-card">
        <h3 className="mt-card-title"><Sparkles size={16} /> 메뉴 선택</h3>
        <div className="mt-desc-selector-row">
          <div className="mt-select-wrap mt-select-wide">
            <select
              className="mt-select"
              value={selectedMenuId}
              onChange={e => setSelectedMenuId(e.target.value)}
            >
              {menus.map(m => (
                <option key={m.id} value={m.id}>{m.emoji} {m.name} ({fmt(m.price)}원)</option>
              ))}
            </select>
            <ChevronDown size={14} className="mt-select-icon" />
          </div>
          <button className="mt-btn mt-btn-primary" onClick={handleGenerate}>
            <RefreshCw size={14} /> 설명문 생성
          </button>
        </div>
      </div>

      {/* Generated Descriptions */}
      {currentDescs && (
        <div className="mt-card">
          <h3 className="mt-card-title"><Type size={16} /> {selectedMenu.emoji} {selectedMenu.name} 설명문</h3>
          <div className="mt-desc-list">
            {descTypes.map(({ key, label, icon, color }) => {
              const text = currentEdited?.[key] || currentDescs[key] || '';
              const charCount = text.length;
              const isGoodLength = charCount >= 40 && charCount <= 80;
              const isCopied = copiedKey === `${selectedMenu.id}-${key}`;
              return (
                <div key={key} className="mt-desc-item" style={{ borderLeftColor: color }}>
                  <div className="mt-desc-header">
                    <span className="mt-desc-type">
                      <span className="mt-desc-type-icon">{icon}</span>
                      {label}
                    </span>
                    <span className={`mt-desc-count ${isGoodLength ? 'good' : 'warn'}`}>
                      {charCount}자 {isGoodLength ? '(적정)' : charCount < 40 ? '(짧음)' : '(길음)'}
                    </span>
                  </div>
                  <textarea
                    className="mt-desc-textarea"
                    value={text}
                    onChange={e => setEditedDescs(prev => ({
                      ...prev,
                      [selectedMenu.id]: { ...(prev[selectedMenu.id] || {}), [key]: e.target.value },
                    }))}
                    rows={3}
                  />
                  <button
                    className={`mt-btn mt-btn-sm ${isCopied ? 'mt-btn-success' : 'mt-btn-outline'}`}
                    onClick={() => handleCopyDesc(selectedMenu.id, key)}
                  >
                    {isCopied ? <><Check size={12} /> 복사 완료</> : <><Copy size={12} /> 복사</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Batch Generate */}
      <div className="mt-card">
        <h3 className="mt-card-title"><Sparkles size={16} /> 일괄 생성</h3>
        <p className="mt-card-desc">모든 메뉴의 설명문을 한 번에 생성합니다.</p>
        <button className="mt-btn mt-btn-primary mt-btn-lg" onClick={handleBatchGenerate}>
          <RefreshCw size={16} /> 전체 메뉴 설명 일괄 생성
        </button>
      </div>

      {/* Batch Results */}
      {showBatch && (
        <div className="mt-card">
          <h3 className="mt-card-title"><FileText size={16} /> 전체 메뉴 설명문</h3>
          <div className="mt-batch-actions">
            <button
              className={`mt-btn ${batchCopied ? 'mt-btn-success' : 'mt-btn-primary'}`}
              onClick={handleBatchCopy}
            >
              {batchCopied ? <><Check size={14} /> 전체 복사 완료</> : <><Copy size={14} /> 전체 복사</>}
            </button>
          </div>
          <div className="mt-table-wrap">
            <table className="mt-table">
              <thead>
                <tr>
                  <th>메뉴</th>
                  <th>재료 강조형</th>
                  <th>감성형</th>
                  <th>가성비 강조형</th>
                </tr>
              </thead>
              <tbody>
                {menus.map(menu => {
                  const d = editedDescs[menu.id] || descs[menu.id];
                  if (!d) return null;
                  return (
                    <tr key={menu.id}>
                      <td className="mt-batch-menu">
                        <span>{menu.emoji}</span>
                        <strong>{menu.name}</strong>
                      </td>
                      <td className="mt-batch-desc">{d.ingredient}</td>
                      <td className="mt-batch-desc">{d.emotional}</td>
                      <td className="mt-batch-desc">{d.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   CSS
   ================================================================ */
const menuToolsCSS = `
  .mt { max-width: 1200px; }
  .mt-page-header { margin-bottom: 28px; }
  .mt-page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
  .mt-page-header p { color: var(--text-light); font-size: 14px; }

  /* Tab Bar */
  .mt-tab-bar {
    display: flex; gap: 6px; margin-bottom: 24px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding-bottom: 4px;
  }
  .mt-tab-bar::-webkit-scrollbar { display: none; }
  .mt-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; color: var(--text);
    background: var(--bg-card); border: 1px solid var(--border);
    white-space: nowrap; transition: all 0.2s; flex-shrink: 0;
    cursor: pointer;
  }
  .mt-tab:hover { border-color: var(--primary); color: var(--primary); }
  .mt-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

  .mt-tab-content { display: flex; flex-direction: column; gap: 20px; }

  /* Card */
  .mt-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm);
  }
  .mt-card-title {
    font-size: 15px; font-weight: 600; color: var(--text-dark);
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }
  .mt-card-desc { font-size: 13px; color: var(--text-light); margin-bottom: 16px; }
  .mt-empty { font-size: 14px; color: var(--text-light); text-align: center; padding: 40px 0; }

  /* Buttons */
  .mt-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: 1px solid transparent;
    white-space: nowrap;
  }
  .mt-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .mt-btn-primary { background: var(--primary); color: #fff; border-color: var(--primary); }
  .mt-btn-primary:hover:not(:disabled) { opacity: 0.9; }
  .mt-btn-secondary { background: var(--bg); color: var(--text-dark); border-color: var(--border); }
  .mt-btn-secondary:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
  .mt-btn-success { background: #22c55e; color: #fff; border-color: #22c55e; }
  .mt-btn-outline { background: transparent; color: var(--text); border-color: var(--border); }
  .mt-btn-outline:hover { border-color: var(--primary); color: var(--primary); }
  .mt-btn-sm { padding: 5px 10px; font-size: 12px; }
  .mt-btn-lg { padding: 12px 24px; font-size: 14px; }

  /* Inputs */
  .mt-input {
    padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text-dark); background: var(--bg-card);
    transition: border-color 0.2s; min-width: 200px;
  }
  .mt-input:focus { border-color: var(--primary); outline: none; }
  .mt-label { font-size: 13px; font-weight: 500; color: var(--text-dark); min-width: 80px; }

  /* Select */
  .mt-select-wrap { position: relative; display: inline-flex; align-items: center; }
  .mt-select-wide { flex: 1; }
  .mt-select-wide .mt-select { width: 100%; }
  .mt-select {
    appearance: none; -webkit-appearance: none;
    padding: 8px 32px 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text-dark); background: var(--bg-card);
    cursor: pointer; transition: border-color 0.2s;
  }
  .mt-select:focus { border-color: var(--primary); outline: none; }
  .mt-select-icon { position: absolute; right: 10px; color: var(--text-light); pointer-events: none; }

  /* ═══════════════════════════════════════
     TAB 1: Image Generation
     ═══════════════════════════════════════ */
  .mt-preset-grid {
    display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .mt-preset-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: var(--radius-sm);
    border: 2px solid var(--border); background: var(--bg-card);
    font-size: 13px; font-weight: 500; color: var(--text);
    cursor: pointer; transition: all 0.2s;
  }
  .mt-preset-btn:hover { border-color: var(--primary); }
  .mt-preset-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
  .mt-preset-label { font-weight: 600; }

  .mt-batch-row { margin-top: 12px; }

  .mt-image-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
  }
  .mt-image-card { display: flex; flex-direction: column; gap: 12px; }

  /* Preview */
  .mt-preview {
    position: relative; width: 100%; aspect-ratio: 1; border-radius: 12px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; padding: 24px; overflow: hidden; box-sizing: border-box;
  }
  .mt-preview-badge {
    position: absolute; top: 16px; right: 16px;
    color: #fff; font-size: 11px; font-weight: 700;
    letter-spacing: 0.5px;
  }
  .mt-preview-emoji { line-height: 1; }
  .mt-preview-name { font-weight: 700; text-align: center; line-height: 1.3; }
  .mt-preview-price { font-weight: 700; text-align: center; }
  .mt-preview-divider { width: 40%; height: 1px; margin: 4px 0; }
  .mt-preview-desc {
    text-align: center; line-height: 1.5; max-width: 85%;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  /* Color Row */
  .mt-color-row { display: flex; gap: 8px; justify-content: center; }
  .mt-color-btn {
    width: 32px; height: 32px; border-radius: 50%; border: 3px solid transparent;
    cursor: pointer; transition: all 0.2s;
  }
  .mt-color-btn:hover { transform: scale(1.1); }
  .mt-color-btn.active { border-color: var(--text-dark); box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px var(--text-dark); }

  /* Download Button */
  .mt-btn-download {
    width: 100%; justify-content: center; padding: 10px;
    background: var(--bg); color: var(--text-dark); border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-weight: 500;
  }
  .mt-btn-download:hover:not(:disabled) { background: var(--primary); color: #fff; border-color: var(--primary); }
  .mt-btn-download.done { background: #22c55e; color: #fff; border-color: #22c55e; }

  /* ═══════════════════════════════════════
     TAB 2: Origin
     ═══════════════════════════════════════ */
  .mt-origin-store-row {
    display: flex; align-items: center; gap: 12px;
  }
  .mt-origin-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px;
  }
  .mt-origin-item {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm);
  }
  .mt-origin-name { font-size: 13px; font-weight: 600; color: var(--text-dark); }

  .mt-menu-origin-list { display: flex; flex-direction: column; gap: 12px; }
  .mt-menu-origin-row {
    padding: 14px; background: var(--bg); border-radius: var(--radius-sm);
    border-left: 4px solid var(--primary);
  }
  .mt-menu-origin-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .mt-menu-origin-emoji { font-size: 20px; }
  .mt-menu-origin-name { font-size: 14px; font-weight: 600; color: var(--text-dark); }
  .mt-menu-origin-ings { display: flex; flex-wrap: wrap; gap: 6px; }
  .mt-origin-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; font-size: 12px; color: var(--text);
  }
  .mt-origin-chip strong { color: var(--primary); }

  .mt-origin-text-box {
    padding: 16px; background: var(--bg); border-radius: var(--radius-sm);
    border: 1px solid var(--border); margin-bottom: 16px;
  }
  .mt-origin-text { font-size: 13px; color: var(--text-dark); line-height: 1.8; margin: 0; word-break: keep-all; }

  .mt-origin-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* ═══════════════════════════════════════
     TAB 3: Description Writer
     ═══════════════════════════════════════ */
  .mt-desc-selector-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  .mt-desc-list { display: flex; flex-direction: column; gap: 16px; }
  .mt-desc-item {
    padding: 16px; background: var(--bg); border-radius: var(--radius-sm);
    border-left: 4px solid var(--text-light);
  }
  .mt-desc-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
  }
  .mt-desc-type { font-size: 14px; font-weight: 600; color: var(--text-dark); display: flex; align-items: center; gap: 6px; }
  .mt-desc-type-icon { font-size: 16px; }
  .mt-desc-count { font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 10px; }
  .mt-desc-count.good { background: #dcfce7; color: #16a34a; }
  .mt-desc-count.warn { background: #fef3c7; color: #d97706; }

  .mt-desc-textarea {
    width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text-dark); background: var(--bg-card);
    resize: vertical; font-family: inherit; line-height: 1.6;
    transition: border-color 0.2s; box-sizing: border-box; margin-bottom: 8px;
  }
  .mt-desc-textarea:focus { border-color: var(--primary); outline: none; }

  .mt-batch-actions { margin-bottom: 16px; }

  /* Table */
  .mt-table-wrap { overflow-x: auto; }
  .mt-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
  .mt-table th {
    text-align: left; padding: 10px 12px; font-weight: 600; color: var(--text-dark);
    border-bottom: 2px solid var(--border); font-size: 12px; white-space: nowrap;
  }
  .mt-table td {
    padding: 10px 12px; border-bottom: 1px solid var(--border-light); color: var(--text);
    vertical-align: top;
  }
  .mt-table tr:hover td { background: var(--bg); }
  .mt-batch-menu {
    display: flex; align-items: center; gap: 6px; white-space: nowrap;
    font-size: 13px;
  }
  .mt-batch-menu strong { color: var(--text-dark); }
  .mt-batch-desc {
    font-size: 12px; line-height: 1.6; color: var(--text); max-width: 250px;
  }

  /* ═══════════════════════════════════════
     Responsive
     ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .mt-image-grid { grid-template-columns: 1fr; }
    .mt-origin-grid { grid-template-columns: 1fr; }
    .mt-desc-selector-row { flex-direction: column; align-items: stretch; }
    .mt-origin-store-row { flex-direction: column; align-items: stretch; }
    .mt-preset-grid { flex-direction: column; }
    .mt-origin-actions { flex-direction: column; }
    .mt-batch-menu { flex-direction: column; align-items: flex-start; }
  }
`;
