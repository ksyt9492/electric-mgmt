import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import FaultHistoryForm from '../components/FaultHistoryForm';
import FaultHistoryList from '../components/FaultHistoryList';

export default function FaultHistoryPage() {
  const [faults, setFaults] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    equipment_id: '',
    severity: '',
    resolved: '',
    date_from: '',
    date_to: '',
  });
  const [loadError, setLoadError] = useState('');

  // 설비 목록 (필터 드롭다운용)
  useEffect(() => {
    axios.get('/api/equipments').then((res) => setEquipments(res.data.data));
  }, []);

  // 이상 이력 조회
  const fetchFaults = useCallback(async () => {
    setLoadError('');
    try {
      const params = {};
      if (filters.equipment_id) params.equipment_id = filters.equipment_id;
      if (filters.severity)     params.severity     = filters.severity;
      if (filters.resolved !== '') params.resolved  = filters.resolved;
      if (filters.date_from)    params.date_from    = filters.date_from;
      if (filters.date_to)      params.date_to      = filters.date_to;
      const res = await axios.get('/api/fault-history', { params });
      setFaults(res.data.data);
    } catch {
      setLoadError('이상 이력을 불러오는 중 오류가 발생했습니다. 서버 상태를 확인해주세요.');
    }
  }, [filters]);

  useEffect(() => {
    fetchFaults();
  }, [fetchFaults]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSaved() {
    setEditTarget(null);
    setShowForm(false);
    fetchFaults();
  }

  function handleEdit(fault) {
    setEditTarget(fault);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancel() {
    setEditTarget(null);
    setShowForm(false);
  }

  // 요약 통계 계산
  const unresolvedCount = faults.filter((f) => !f.resolved).length;
  const severeCount     = faults.filter((f) => f.severity === '심각').length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">이상 이력</h2>
        <p className="text-sm text-slate-400 mt-1">설비 고장·이상 발생 내용과 조치사항을 기록합니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-100">{faults.length}</p>
          <p className="text-xs text-slate-400 mt-1">전체 이력</p>
        </div>
        <div className={`card text-center ${unresolvedCount > 0 ? 'border-orange-700' : ''}`}>
          <p className={`text-2xl font-bold ${unresolvedCount > 0 ? 'text-orange-400' : 'text-slate-100'}`}>
            {unresolvedCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">미처리</p>
        </div>
        <div className={`card text-center ${severeCount > 0 ? 'border-red-700' : ''}`}>
          <p className={`text-2xl font-bold ${severeCount > 0 ? 'text-red-400' : 'text-slate-100'}`}>
            {severeCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">심각</p>
        </div>
      </div>

      {/* 입력 폼 (수정 모드이거나 showForm이면 표시) */}
      {(showForm || editTarget) ? (
        <FaultHistoryForm
          editTarget={editTarget}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary w-full sm:w-auto"
        >
          + 이상 이력 등록
        </button>
      )}

      {/* 로드 오류 */}
      {loadError && (
        <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
          {loadError}
        </p>
      )}

      {/* 이상 이력 목록 */}
      <FaultHistoryList
        faults={faults}
        equipments={equipments}
        filters={filters}
        onFilterChange={handleFilterChange}
        onEdit={handleEdit}
      />
    </div>
  );
}
