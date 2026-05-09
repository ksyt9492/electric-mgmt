import React from 'react';

// 오늘 기준 D-day 계산 (양수: 남은 날, 음수: 초과)
function calcDday(dueDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

// D-day에 따른 배지 스타일 및 라벨
function getDdayBadge(dday) {
  if (dday < 0)   return { cls: 'bg-red-900 text-red-300 border-red-700',       label: `D+${Math.abs(dday)} 만료` };
  if (dday === 0) return { cls: 'bg-red-800 text-red-200 border-red-600',       label: 'D-Day' };
  if (dday <= 7)  return { cls: 'bg-orange-900 text-orange-300 border-orange-700', label: `D-${dday}` };
  if (dday <= 30) return { cls: 'bg-yellow-900 text-yellow-300 border-yellow-700', label: `D-${dday}` };
  return           { cls: 'bg-green-900 text-green-300 border-green-700',       label: `D-${dday}` };
}

// 검사결과 배지 색상
function getResultBadge(result) {
  if (result === '합격')      return 'bg-green-900 text-green-300 border-green-700';
  if (result === '불합격')    return 'bg-red-900 text-red-300 border-red-700';
  if (result === '조건부합격') return 'bg-yellow-900 text-yellow-300 border-yellow-700';
  return 'bg-navy-700 text-slate-400 border-navy-500';
}

export default function LegalInspectionList({ items, onEdit }) {
  if (!items.length) {
    return (
      <div className="card p-8 text-center text-slate-400 text-sm">
        등록된 법정검사 일정이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const dday  = calcDday(item.due_date);
        const badge = getDdayBadge(dday);

        return (
          <div
            key={item.id}
            className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-navy-700 transition-colors"
            onClick={() => onEdit(item)}
          >
            {/* D-day 배지 (왼쪽 강조) */}
            <div className={`text-center px-3 py-2 rounded-lg border font-bold text-sm min-w-[72px] ${badge.cls}`}>
              {badge.label}
            </div>

            {/* 검사 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-100 font-semibold text-sm">{item.inspection_type}</span>
                {item.result && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getResultBadge(item.result)}`}>
                    {item.result}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1 space-x-3">
                <span>만료일: {item.due_date}</span>
                {item.last_date && <span>최종검사: {item.last_date}</span>}
                {item.agency    && <span>기관: {item.agency}</span>}
              </div>
            </div>

            {/* 수정 버튼 */}
            <button
              className="btn-secondary text-xs px-3 py-1.5 shrink-0"
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            >
              수정
            </button>
          </div>
        );
      })}
    </div>
  );
}
