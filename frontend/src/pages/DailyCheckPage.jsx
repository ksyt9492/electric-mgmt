import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DailyCheckForm from '../components/DailyCheckForm';
import DailyCheckList from '../components/DailyCheckList';

/**
 * - initialEditTarget: 이력 탭에서 수정 요청 시 외부에서 전달되는 초기 편집 대상
 * - onEditConsumed: initialEditTarget을 소비했음을 App에 알리는 콜백
 */
export default function DailyCheckPage({ initialEditTarget, onEditConsumed }) {
  const [checks, setChecks] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [filters, setFilters] = useState({ equipment_id: '', date_from: '', date_to: '' });
  const [loadError, setLoadError] = useState('');

  // 설비 목록 (필터 드롭다운용)
  useEffect(() => {
    axios.get('/api/equipments').then((res) => setEquipments(res.data.data));
  }, []);

  // 이력 탭에서 전달된 수정 대상 적용
  useEffect(() => {
    if (initialEditTarget) {
      setEditTarget(initialEditTarget);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onEditConsumed?.();
    }
  }, [initialEditTarget]);

  // 점검 이력 조회
  const fetchChecks = useCallback(async () => {
    setLoadError('');
    try {
      const params = {};
      if (filters.equipment_id) params.equipment_id = filters.equipment_id;
      if (filters.date_from)    params.date_from    = filters.date_from;
      if (filters.date_to)      params.date_to      = filters.date_to;
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

  function handleSaved() {
    setEditTarget(null);
    fetchChecks();
  }

  function handleEdit(check) {
    setEditTarget(check);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">일상점검</h2>
        <p className="text-sm text-slate-400 mt-1">전압·전류·온도 등 일상 점검 결과를 기록합니다.</p>
      </div>

      {/* 입력 폼 */}
      <DailyCheckForm
        editTarget={editTarget}
        onSaved={handleSaved}
        onCancel={() => setEditTarget(null)}
      />

      {/* 로드 오류 */}
      {loadError && (
        <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
          {loadError}
        </p>
      )}

      {/* 점검 이력 목록 */}
      <DailyCheckList
        checks={checks}
        equipments={equipments}
        filters={filters}
        onFilterChange={handleFilterChange}
        onEdit={handleEdit}
      />
    </div>
  );
}
