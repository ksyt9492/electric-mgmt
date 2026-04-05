import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EquipmentForm from '../components/EquipmentForm';
import EquipmentList from '../components/EquipmentList';

export default function EquipmentPage() {
  const [equipments, setEquipments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [editTarget, setEditTarget] = useState(null);  // null = 신규 등록 모드
  const [loadError, setLoadError] = useState('');

  // 설비 목록 불러오기
  const fetchEquipments = useCallback(async () => {
    setLoadError('');
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const res = await axios.get('/api/equipments', { params });
      setEquipments(res.data.data);
    } catch {
      setLoadError('목록을 불러오는 중 오류가 발생했습니다. 서버 상태를 확인해주세요.');
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  // 저장 완료 → 목록 갱신, 수정 모드 초기화
  function handleSaved() {
    setEditTarget(null);
    fetchEquipments();
  }

  // 수정 버튼 클릭 → 폼을 수정 모드로 전환하고 화면 위로 스크롤
  function handleEdit(equipment) {
    setEditTarget(equipment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 타이틀 */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">설비 관리</h2>
        <p className="text-sm text-slate-400 mt-1">수변전설비를 등록하고 현황을 관리합니다.</p>
      </div>

      {/* 등록/수정 폼 */}
      <EquipmentForm
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

      {/* 설비 목록 */}
      <EquipmentList
        equipments={equipments}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onEdit={handleEdit}
      />
    </div>
  );
}
