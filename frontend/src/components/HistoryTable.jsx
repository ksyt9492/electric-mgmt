import React, { useState, useMemo } from 'react';

// 정렬 가능한 컬럼 목록
const SORT_COLS = ['check_date', 'equipment_name', 'voltage', 'current', 'temperature', 'checker'];

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <span className="ml-1 text-navy-600">↕</span>;
  return <span className="ml-1 text-accent-400">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

/**
 * 점검 이력 조회 테이블
 * - checks: 점검 기록 배열
 * - onEditRequest: 수정 요청 핸들러 (record 전달, 일상점검 탭으로 이동)
 */
export default function HistoryTable({ checks, onEditRequest }) {
  const [sortKey, setSortKey] = useState('check_date');
  const [sortDir, setSortDir] = useState('desc');

  function toggleSort(col) {
    if (sortKey === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col);
      setSortDir('asc');
    }
  }

  // 클라이언트 사이드 정렬
  const sorted = useMemo(() => {
    return [...checks].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = typeof av === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), 'ko');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [checks, sortKey, sortDir]);

  if (checks.length === 0) {
    return (
      <div className="card text-center text-slate-500 py-16 text-sm">
        조건에 맞는 점검 기록이 없습니다.
      </div>
    );
  }

  const headers = [
    { key: 'check_date',     label: '점검일',    align: 'left' },
    { key: 'equipment_name', label: '설비명',    align: 'left' },
    { key: 'equipment_type', label: '종류',      align: 'left',  noSort: true },
    { key: 'voltage',        label: '전압(V)',   align: 'right' },
    { key: 'current',        label: '전류(A)',   align: 'right' },
    { key: 'temperature',    label: '온도(℃)',  align: 'right' },
    { key: 'checker',        label: '점검자',    align: 'left' },
    { key: 'memo',           label: '특이사항',  align: 'left',  noSort: true },
  ];

  return (
    <div className="card">
      {/* 데스크톱 테이블 */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-600 text-slate-400 text-left">
              {headers.map((h) => (
                <th
                  key={h.key}
                  className={`pb-2 pr-3 font-medium whitespace-nowrap select-none
                    ${!h.noSort ? 'cursor-pointer hover:text-slate-200' : ''}
                    ${h.align === 'right' ? 'text-right' : ''}`}
                  onClick={() => !h.noSort && toggleSort(h.key)}
                >
                  {h.label}
                  {!h.noSort && <SortIcon col={h.key} sortKey={sortKey} sortDir={sortDir} />}
                </th>
              ))}
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.id}
                className="border-b border-navy-700 hover:bg-navy-700/40 transition-colors cursor-pointer"
                onClick={() => onEditRequest(c)}
              >
                <td className="py-3 pr-3 text-slate-300 whitespace-nowrap">{c.check_date}</td>
                <td className="py-3 pr-3 font-medium text-slate-100 whitespace-nowrap">{c.equipment_name}</td>
                <td className="py-3 pr-3 text-slate-400 text-xs whitespace-nowrap">{c.equipment_type}</td>
                <td className="py-3 pr-3 text-right text-slate-300">{c.voltage  != null ? c.voltage  : <span className="text-slate-600">-</span>}</td>
                <td className="py-3 pr-3 text-right text-slate-300">{c.current  != null ? c.current  : <span className="text-slate-600">-</span>}</td>
                <td className="py-3 pr-3 text-right text-slate-300">{c.temperature != null ? c.temperature : <span className="text-slate-600">-</span>}</td>
                <td className="py-3 pr-3 text-slate-300 whitespace-nowrap">{c.checker || <span className="text-slate-600">-</span>}</td>
                <td className="py-3 pr-3 max-w-xs">
                  {c.memo
                    ? <span className="text-yellow-400/90 text-xs leading-snug line-clamp-2">{c.memo}</span>
                    : <span className="text-slate-600">-</span>}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditRequest(c); }}
                    className="text-xs text-accent-400 hover:text-accent-500 font-medium"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 */}
      <div className="sm:hidden flex flex-col gap-3">
        {sorted.map((c) => (
          <div
            key={c.id}
            className="bg-navy-700/50 rounded-lg px-4 py-3 border border-navy-600 active:bg-navy-700 transition-colors"
            onClick={() => onEditRequest(c)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-bold text-slate-100">{c.equipment_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {c.equipment_type} · {c.check_date}
                  {c.checker && ` · ${c.checker}`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {c.voltage     != null && <span className="bg-navy-600 text-slate-300 px-2 py-1 rounded">전압 {c.voltage}V</span>}
              {c.current     != null && <span className="bg-navy-600 text-slate-300 px-2 py-1 rounded">전류 {c.current}A</span>}
              {c.temperature != null && <span className="bg-navy-600 text-slate-300 px-2 py-1 rounded">온도 {c.temperature}℃</span>}
            </div>
            {c.memo && <p className="mt-2 text-xs text-yellow-400/80 leading-snug">{c.memo}</p>}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 text-right">총 {sorted.length}건 · 헤더 클릭으로 정렬</p>
    </div>
  );
}
