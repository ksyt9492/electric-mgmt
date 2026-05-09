import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  equipment_id: '',
  fault_date: today(),
  description: '',
  action_taken: '',
  severity: '보통',
  resolved: false,
};

/**
 * 이상 이력 입력 폼
 * - editTarget: 수정 대상 이력 (null이면 신규 입력 모드)
 * - onSaved: 저장 완료 콜백
 * - onCancel: 취소 콜백
 */
export default function FaultHistoryForm({ editTarget, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 설비 목록 로드
  useEffect(() => {
    axios.get('/api/equipments').then((res) => setEquipments(res.data.data));
  }, []);

  // 수정 모드 진입 시 기존 데이터 채우기
  useEffect(() => {
    if (editTarget) {
      setForm({
        equipment_id: String(editTarget.equipment_id),
        fault_date:   editTarget.fault_date   ?? today(),
        description:  editTarget.description  ?? '',
        action_taken: editTarget.action_taken ?? '',
        severity:     editTarget.severity     ?? '보통',
        resolved:     Boolean(editTarget.resolved),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [editTarget]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.equipment_id) {
      setError('설비를 선택해주세요.');
      return;
    }
    if (!form.fault_date) {
      setError('발생일을 입력해주세요.');
      return;
    }
    if (!form.description.trim()) {
      setError('이상내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (editTarget) {
        await axios.put(`/api/fault-history/${editTarget.id}`, form);
      } else {
        await axios.post('/api/fault-history', form);
      }
      setForm({ ...EMPTY_FORM, fault_date: today() });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message ?? '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const isEdit = Boolean(editTarget);

  return (
    <div className="card">
      <h2 className="text-base font-bold text-accent-400 mb-4">
        {isEdit ? '✏️ 이상 이력 수정' : '⚠️ 이상 이력 등록'}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* 설비 선택 */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">
              설비 선택 <span className="text-red-400">*</span>
            </label>
            <select
              name="equipment_id"
              value={form.equipment_id}
              onChange={handleChange}
              disabled={isEdit}
              className="w-full px-3 py-3 text-base disabled:opacity-50"
            >
              <option value="">-- 설비를 선택하세요 --</option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.type})
                </option>
              ))}
            </select>
            {equipments.length === 0 && (
              <p className="text-xs text-slate-500 mt-1">
                먼저 '설비 관리' 탭에서 설비를 등록해주세요.
              </p>
            )}
          </div>

          {/* 발생일 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              발생일 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="fault_date"
              value={form.fault_date}
              onChange={handleChange}
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 심각도 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">심각도</label>
            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className="w-full px-3 py-3 text-base"
            >
              <option value="경미">경미</option>
              <option value="보통">보통</option>
              <option value="심각">심각</option>
            </select>
          </div>

          {/* 이상내용 */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">
              이상내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="발생한 이상 또는 고장 내용을 입력하세요"
              rows={3}
              className="w-full px-3 py-3 text-base resize-none"
            />
          </div>

          {/* 조치사항 */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">조치사항</label>
            <textarea
              name="action_taken"
              value={form.action_taken}
              onChange={handleChange}
              placeholder="취한 조치 내용을 입력하세요 (없으면 공란)"
              rows={3}
              className="w-full px-3 py-3 text-base resize-none"
            />
          </div>

          {/* 처리 완료 여부 */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="resolved"
                checked={form.resolved}
                onChange={handleChange}
                className="w-5 h-5 rounded accent-accent-400"
              />
              <span className="text-sm text-slate-300 font-medium">처리 완료</span>
              <span className="text-xs text-slate-500">(조치 완료 후 체크)</span>
            </label>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <p className="mt-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* 버튼 */}
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 sm:flex-none">
            {loading ? '저장 중...' : isEdit ? '수정 저장' : '이상 이력 등록'}
          </button>
          {isEdit && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
