import React from 'react';

/**
 * 일상점검 이력 목록
 * - checks: 점검 기록 배열
 * - equipments: 설비 목록 (필터용)
 * - filters: { equipment_id, date_from, date_to }
 * - onFilterChange: 필터 변경 핸들러 (key, value)
 * - onEdit: 수정 버튼 클릭 핸들러
 */
export default function DailyCheckList({ checks, equipments, filters, onFilterChange, onEdit }) {
  return (
    <div className="card">
      {/* 헤더 + 필터 */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-slate-100 pt-1">
          점검 이력
          <span className="ml-2 text-sm text-slate-400 font-normal">({checks.length}건)</span>
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
          {/* 설비 필터 */}
          <select
            value={filters.equipment_id}
            onChange={(e) => onFilterChange('equipment_id', e.target.value)}
            className="text-sm px-3 py-2"
          >
            <option value="">전체 설비</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </select>

          {/* 기간 필터 */}
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange('date_from', e.target.value)}
            className="text-sm px-3 py-2"
            title="시작일"
          />
          <span className="text-slate-500 text-sm">~</span>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange('date_to', e.target.value)}
            className="text-sm px-3 py-2"
            title="종료일"
          />
        </div>
      </div>

      {/* 빈 상태 */}
      {checks.length === 0 && (
        <div className="text-center text-slate-500 py-12 text-sm">
          점검 기록이 없습니다.
        </div>
      )}

      {checks.length > 0 && (
        <>
          {/* 데스크톱: 테이블 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600 text-slate-400 text-left">
                  <th className="pb-2 pr-4 font-medium">점검일</th>
                  <th className="pb-2 pr-4 font-medium">설비명</th>
                  <th className="pb-2 pr-3 font-medium text-right">전압(V)</th>
                  <th className="pb-2 pr-3 font-medium text-right">전류(A)</th>
                  <th className="pb-2 pr-3 font-medium text-right">온도(℃)</th>
                  <th className="pb-2 pr-4 font-medium">점검자</th>
                  <th className="pb-2 pr-4 font-medium">특이사항</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {checks.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-navy-700 hover:bg-navy-700/40 transition-colors cursor-pointer"
                    onClick={() => onEdit(c)}
                  >
                    <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{c.check_date}</td>
                    <td className="py-3 pr-4 font-medium text-slate-100">{c.equipment_name}</td>
                    <td className="py-3 pr-3 text-right text-slate-300">
                      {c.voltage != null ? c.voltage : '-'}
                    </td>
                    <td className="py-3 pr-3 text-right text-slate-300">
                      {c.current != null ? c.current : '-'}
                    </td>
                    <td className="py-3 pr-3 text-right text-slate-300">
                      {c.temperature != null ? c.temperature : '-'}
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{c.checker || '-'}</td>
                    <td className="py-3 pr-4 text-slate-400 max-w-xs truncate">
                      {c.memo
                        ? <span className="text-yellow-400/80">{c.memo}</span>
                        : '-'}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(c); }}
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

          {/* 모바일: 카드 목록 */}
          <div className="sm:hidden flex flex-col gap-3">
            {checks.map((c) => (
              <div
                key={c.id}
                className="bg-navy-700/50 rounded-lg px-4 py-3 border border-navy-600 active:bg-navy-700 transition-colors"
                onClick={() => onEdit(c)}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-slate-100">{c.equipment_name}</p>
                    <p className="text-xs text-slate-400">{c.check_date}  {c.checker && `· ${c.checker}`}</p>
                  </div>
                </div>

                {/* 측정값 뱃지 */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {c.voltage != null && (
                    <span className="bg-navy-600 text-slate-300 px-2 py-1 rounded">
                      전압 {c.voltage}V
                    </span>
                  )}
                  {c.current != null && (
                    <span className="bg-navy-600 text-slate-300 px-2 py-1 rounded">
                      전류 {c.current}A
                    </span>
                  )}
                  {c.temperature != null && (
                    <span className="bg-navy-600 text-slate-300 px-2 py-1 rounded">
                      온도 {c.temperature}℃
                    </span>
                  )}
                </div>

                {c.memo && (
                  <p className="mt-2 text-xs text-yellow-400/80 leading-snug">{c.memo}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
