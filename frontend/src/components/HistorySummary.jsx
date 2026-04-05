import React from 'react';

/**
 * 점검 이력 상단 요약 카드
 * - total: 전체 조회 건수
 * - memoCount: 특이사항 있는 건수
 * - checkerCount: 점검자 종류 수
 */
export default function HistorySummary({ total, memoCount, checkerCount }) {
  const cards = [
    { label: '조회된 점검 수', value: total,        unit: '건', color: 'text-accent-400' },
    { label: '특이사항',       value: memoCount,    unit: '건', color: 'text-yellow-400' },
    { label: '점검자 수',      value: checkerCount, unit: '명', color: 'text-sky-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="card py-4 text-center">
          <p className={`text-2xl font-bold ${c.color}`}>
            {c.value}
            <span className="text-sm font-normal ml-0.5">{c.unit}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
