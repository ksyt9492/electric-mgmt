import React from 'react';

// 빠른 날짜 범위 계산
function getDateRange(preset) {
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const today = new Date();
  if (preset === 'today') {
    const t = fmt(today);
    return { date_from: t, date_to: t };
  }
  if (preset === 'week') {
    const mon = new Date(today);
    mon.setDate(today.getDate() - today.getDay() + 1);  // 이번 주 월요일
    return { date_from: fmt(mon), date_to: fmt(today) };
  }
  if (preset === 'month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    return { date_from: fmt(first), date_to: fmt(today) };
  }
  // 전체
  return { date_from: '', date_to: '' };
}

const PRESETS = [
  { id: 'today', label: '오늘' },
  { id: 'week',  label: '이번 주' },
  { id: 'month', label: '이번 달' },
  { id: 'all',   label: '전체' },
];

/**
 * 이력 조회 필터 패널
 * - filters: { equipment_id, date_from, date_to, checker, has_memo }
 * - equipments: 설비 목록
 * - onFilterChange(key, value)
 * - onReset: 전체 초기화
 */
export default function HistoryFilter({ filters, equipments, onFilterChange, onReset }) {
  // 현재 활성 프리셋 감지
  function activePreset() {
    const { date_from, date_to } = filters;
    for (const p of PRESETS.filter((p) => p.id !== 'all')) {
      const range = getDateRange(p.id);
      if (range.date_from === date_from && range.date_to === date_to) return p.id;
    }
    return date_from === '' && date_to === '' ? 'all' : null;
  }

  function applyPreset(presetId) {
    const range = getDateRange(presetId);
    onFilterChange('date_from', range.date_from);
    onFilterChange('date_to', range.date_to);
  }

  const active = activePreset();

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-100">🔍 검색 조건</h2>
        <button onClick={onReset} className="text-xs text-slate-400 hover:text-slate-200 underline">
          초기화
        </button>
      </div>

      {/* 빠른 날짜 선택 */}
      <div>
        <p className="text-xs text-slate-400 mb-2">기간</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                active === p.id
                  ? 'bg-accent-500 text-navy-900 border-accent-500 font-bold'
                  : 'bg-navy-700 text-slate-300 border-navy-600 hover:border-accent-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* 직접 입력 */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange('date_from', e.target.value)}
            className="text-sm px-3 py-2 flex-1"
          />
          <span className="text-slate-500">~</span>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange('date_to', e.target.value)}
            className="text-sm px-3 py-2 flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 설비 필터 */}
        <div>
          <p className="text-xs text-slate-400 mb-1">설비</p>
          <select
            value={filters.equipment_id}
            onChange={(e) => onFilterChange('equipment_id', e.target.value)}
            className="w-full text-sm px-3 py-2"
          >
            <option value="">전체 설비</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} ({eq.type})
              </option>
            ))}
          </select>
        </div>

        {/* 점검자 검색 */}
        <div>
          <p className="text-xs text-slate-400 mb-1">점검자</p>
          <input
            type="text"
            value={filters.checker}
            onChange={(e) => onFilterChange('checker', e.target.value)}
            placeholder="이름 검색"
            className="w-full text-sm px-3 py-2"
          />
        </div>

        {/* 특이사항 필터 */}
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.has_memo === 'true'}
              onChange={(e) => onFilterChange('has_memo', e.target.checked ? 'true' : '')}
              className="w-5 h-5 accent-yellow-400"
            />
            <span className="text-sm text-slate-300">특이사항 있는 기록만</span>
          </label>
        </div>
      </div>
    </div>
  );
}
