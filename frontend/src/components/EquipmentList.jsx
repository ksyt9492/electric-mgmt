import React from 'react';
import { EQUIPMENT_STATUSES, getStatusBadgeClass } from '../utils/equipment';

/**
 * 설비 목록 테이블
 * - equipments: 설비 배열
 * - filterStatus: 현재 상태 필터 값
 * - onFilterChange: 필터 변경 핸들러
 * - onEdit: 수정 버튼 클릭 핸들러 (equipment 객체 전달)
 */
export default function EquipmentList({ equipments, filterStatus, onFilterChange, onEdit }) {
  return (
    <div className="card">
      {/* 헤더 영역 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-slate-100">
          등록 설비 목록
          <span className="ml-2 text-sm text-slate-400 font-normal">
            ({equipments.length}개)
          </span>
        </h2>

        {/* 상태 필터 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterStatus === ''
                ? 'bg-accent-500 text-navy-900 border-accent-500 font-bold'
                : 'bg-navy-700 text-slate-300 border-navy-600 hover:border-accent-400'
            }`}
          >
            전체
          </button>
          {EQUIPMENT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterStatus === s
                  ? 'bg-accent-500 text-navy-900 border-accent-500 font-bold'
                  : 'bg-navy-700 text-slate-300 border-navy-600 hover:border-accent-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 빈 상태 */}
      {equipments.length === 0 && (
        <div className="text-center text-slate-500 py-12 text-sm">
          등록된 설비가 없습니다.
        </div>
      )}

      {/* 테이블 (데스크톱) */}
      {equipments.length > 0 && (
        <>
          {/* 데스크톱: 테이블 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600 text-slate-400 text-left">
                  <th className="pb-2 pr-4 font-medium">설비명</th>
                  <th className="pb-2 pr-4 font-medium">종류</th>
                  <th className="pb-2 pr-4 font-medium">용량</th>
                  <th className="pb-2 pr-4 font-medium">제조사</th>
                  <th className="pb-2 pr-4 font-medium">설치위치</th>
                  <th className="pb-2 pr-4 font-medium">설치일</th>
                  <th className="pb-2 pr-4 font-medium">상태</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {equipments.map((eq) => (
                  <tr
                    key={eq.id}
                    className="border-b border-navy-700 hover:bg-navy-700/40 transition-colors cursor-pointer"
                    onClick={() => onEdit(eq)}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-100">{eq.name}</td>
                    <td className="py-3 pr-4 text-slate-300">{eq.type}</td>
                    <td className="py-3 pr-4 text-slate-300">{eq.capacity || '-'}</td>
                    <td className="py-3 pr-4 text-slate-300">{eq.manufacturer || '-'}</td>
                    <td className="py-3 pr-4 text-slate-300">{eq.location || '-'}</td>
                    <td className="py-3 pr-4 text-slate-300">{eq.install_date || '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={getStatusBadgeClass(eq.status)}>{eq.status}</span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(eq); }}
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
            {equipments.map((eq) => (
              <div
                key={eq.id}
                className="bg-navy-700/50 rounded-lg px-4 py-3 border border-navy-600 active:bg-navy-700 transition-colors"
                onClick={() => onEdit(eq)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-100">{eq.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{eq.type}</p>
                  </div>
                  <span className={getStatusBadgeClass(eq.status)}>{eq.status}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                  {eq.capacity    && <span>용량: {eq.capacity}</span>}
                  {eq.manufacturer && <span>제조사: {eq.manufacturer}</span>}
                  {eq.location    && <span>위치: {eq.location}</span>}
                  {eq.install_date && <span>설치일: {eq.install_date}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
