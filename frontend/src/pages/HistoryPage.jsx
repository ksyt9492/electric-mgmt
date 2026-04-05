import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import HistoryFilter from '../components/HistoryFilter';
import HistorySummary from '../components/HistorySummary';
import HistoryTable from '../components/HistoryTable';

const EMPTY_FILTERS = {
  equipment_id: '',
  date_from: '',
  date_to: '',
  checker: '',
  has_memo: '',
};

/**
 * 점검 이력 조회 페이지
 * - onNavigate: 다른 탭으로 이동 요청 콜백 (tabId, state)
 */
export default function HistoryPage({ onNavigate }) {
  const [checks, setChecks] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loadError, setLoadError] = useState('');

  // 설비 목록 로드
  useEffect(() => {
    axios.get('/api/equipments').then((res) => setEquipments(res.data.data));
  }, []);

  // 점검 이력 조회
  const fetchChecks = useCallback(async () => {
    setLoadError('');
    try {
      const params = {};
      if (filters.equipment_id) params.equipment_id = filters.equipment_id;
      if (filters.date_from)    params.date_from    = filters.date_from;
      if (filters.date_to)      params.date_to      = filters.date_to;
      if (filters.checker)      params.checker      = filters.checker;
      if (filters.has_memo)     params.has_memo     = filters.has_memo;
      const res = await axios.get('/api/daily-checks', { params });
      setChecks(res.data.data);
    } catch {
      setLoadError('이력을 불러오는 중 오류가 발생했습니다. 서버 상태를 확인해주세요.');
    }
  }, [filters]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  // 수정 요청 → 일상점검 탭으로 이동하며 대상 전달
  function handleEditRequest(record) {
    if (onNavigate) onNavigate('daily-check', { editTarget: record });
  }

  // 요약 통계 계산
  const summary = useMemo(() => {
    const memoCount = checks.filter((c) => c.memo && c.memo.trim()).length;
    const checkerSet = new Set(checks.map((c) => c.checker).filter(Boolean));
    return { total: checks.length, memoCount, checkerCount: checkerSet.size };
  }, [checks]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">점검 이력 조회</h2>
        <p className="text-sm text-slate-400 mt-1">
          조건별 점검 기록을 검색하고 조회합니다.
          수정이 필요하면 행을 클릭하세요.
        </p>
      </div>

      {/* 요약 카드 */}
      <HistorySummary {...summary} />

      {/* 검색 필터 */}
      <HistoryFilter
        filters={filters}
        equipments={equipments}
        onFilterChange={handleFilterChange}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      {/* 오류 메시지 */}
      {loadError && (
        <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
          {loadError}
        </p>
      )}

      {/* 이력 테이블 */}
      <HistoryTable checks={checks} onEditRequest={handleEditRequest} />
    </div>
  );
}
