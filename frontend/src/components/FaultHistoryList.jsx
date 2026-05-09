import React from 'react';

// 심각도 배지 스타일
function severityClass(severity) {
  switch (severity) {
    case '경미': return 'bg-green-900/50 text-green-300 border border-green-700';
    case '보통': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
    case '심각': return 'bg-red-900/50 text-red-300 border border-red-700';
    default:     return 'bg-navy-700 text-slate-400 border border-navy-600';
  }
}

// 처리 상태 배지 스타일
function resolvedClass(resolved) {
  return resolved
    ? 'bg-teal-900/50 text-teal-300 border border-teal-700'
    : 'bg-orange-900/50 text-orange-300 border border-orange-700';
}

/**
 * 이상 이력 목록
 * - faults: 이상 이력 배열
 * - equipments: 설비 목록 (필터 드롭다운용)
 * - filters: { equipment_id, severity, resolved, date_from, date_to }
 * - onFilterChange: 필터 변경 핸들러 (key, value)
 * - onEdit: 수정 버튼 클릭 핸들러
 */
export default function FaultHistoryList({ faults, equipments, filters, onFilterChange, onEdit }) {
  return (
    <div className="card">
      {/* 헤더 + 필터 */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-slate-100 pt-1">
          이상 이력
          <span className="ml-2 text-sm text-slate-400 font-normal">({faults.length}건)</span>
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
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>

          {/* 심각도 필터 */}
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange('severity', e.target.value)}
            className="text-sm px-3 py-2"
          >
            <option value="">전체 심각도</option>
            <option value="경미">경미</option>
            <option value="보통">보통</option>
            <option value="심각">심각</option>
          </select>

          {/* 처리 상태 필터 */}
          <select
            value={filters.resolved}
            onChange={(e) => onFilterChange('resolved', e.target.value)}
            className="text-sm px-3 py-2"
          >
            <option value="">전체 상태</option>
            <option value="0">미처리</option>
            <option value="1">처리완료</option>
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
      {faults.length === 0 && (
        <div className="text-center text-slate-500 py-12 text-sm">
          등록된 이상 이력이 없습니다.
        </div>
      )}

      {faults.length > 0 && (
        <>
          {/* 데스크톱: 테이블 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600 text-slate-400 text-left">
                  <th className="pb-2 pr-4 font-medium">발생일</th>
                  <th className="pb-2 pr-4 font-medium">설비명</th>
                  <th className="pb-2 pr-4 font-medium">심각도</th>
                  <th className="pb-2 pr-4 font-medium">이상내용</th>
                  <th className="pb-2 pr-4 font-medium">조치사항</th>
                  <th className="pb-2 pr-4 font-medium">처리상태</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {faults.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-navy-700 hover:bg-navy-700/40 transition-colors cursor-pointer"
                    onClick={() => onEdit(f)}
                  >
                    <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{f.fault_date}</td>
                    <td className="py-3 pr-4 font-medium text-slate-100">
                      {f.equipment_name}
                      <span className="ml-1 text-xs text-slate-500">({f.equipment_type})</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityClass(f.severity)}`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300 max-w-xs truncate">{f.description}</td>
                    <td className="py-3 pr-4 text-slate-400 max-w-xs truncate">
                      {f.action_taken || <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${resolvedClass(f.resolved)}`}>
                        {f.resolved ? '처리완료' : '미처리'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(f); }}
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
            {faults.map((f) => (
              <div
                key={f.id}
                className="bg-navy-700/50 rounded-lg px-4 py-3 border border-navy-600 active:bg-navy-700 transition-colors"
                onClick={() => onEdit(f)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-slate-100">{f.equipment_name}</p>
                    <p className="text-xs text-slate-400">{f.fault_date} · {f.equipment_type}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityClass(f.severity)}`}>
                      {f.severity}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${resolvedClass(f.resolved)}`}>
                      {f.resolved ? '처리완료' : '미처리'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-snug mb-1">{f.description}</p>
                {f.action_taken && (
                  <p className="text-xs text-slate-400 leading-snug">
                    <span className="text-slate-500">조치: </span>{f.action_taken}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
