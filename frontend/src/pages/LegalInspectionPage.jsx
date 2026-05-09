import React, { useState, useEffect, useCallback } from 'react';
import LegalInspectionForm from '../components/LegalInspectionForm';
import LegalInspectionList from '../components/LegalInspectionList';

export default function LegalInspectionPage({ onSaved }) {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [showForm, setShowForm]   = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/legal-inspections');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function handleEdit(item) {
    setEditTarget(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSaved() {
    fetchItems();
    setEditTarget(null);
    setShowForm(false);
    onSaved?.();
  }

  function handleCancel() {
    setEditTarget(null);
    setShowForm(false);
  }

  // 만료 임박(30일 이내) 및 만료 건수 집계
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiredCount = items.filter((i) => {
    const due = new Date(i.due_date); due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
  const soonCount = items.filter((i) => {
    const due = new Date(i.due_date); due.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / 86400000);
    return diff >= 0 && diff <= 30;
  }).length;

  return (
    <div className="space-y-5">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-slate-100">{items.length}</div>
          <div className="text-xs text-slate-400 mt-1">전체 검사</div>
        </div>
        <div className={`card p-4 text-center ${soonCount > 0 ? 'border-yellow-600' : ''}`}>
          <div className={`text-2xl font-bold ${soonCount > 0 ? 'text-yellow-400' : 'text-slate-100'}`}>
            {soonCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">30일 내 만료</div>
        </div>
        <div className={`card p-4 text-center ${expiredCount > 0 ? 'border-red-600' : ''}`}>
          <div className={`text-2xl font-bold ${expiredCount > 0 ? 'text-red-400' : 'text-slate-100'}`}>
            {expiredCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">만료 초과</div>
        </div>
      </div>

      {/* 등록/수정 폼 */}
      {showForm ? (
        <LegalInspectionForm
          editTarget={editTarget}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      ) : (
        <button className="btn-primary w-full" onClick={() => setShowForm(true)}>
          + 법정검사 등록
        </button>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="text-center text-slate-400 text-sm py-8">불러오는 중...</div>
      ) : (
        <LegalInspectionList items={items} onEdit={handleEdit} />
      )}
    </div>
  );
}
