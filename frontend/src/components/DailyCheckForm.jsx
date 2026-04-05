import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  equipment_id: '',
  check_date: today(),
  voltage: '',
  current: '',
  temperature: '',
  memo: '',
  checker: '',
};

/**
 * 일상점검 입력 폼
 * - editTarget: 수정 대상 점검 기록 (null이면 신규 입력 모드)
 * - onSaved: 저장 완료 콜백
 * - onCancel: 취소 콜백
 */
export default function DailyCheckForm({ editTarget, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [equipments, setEquipments] = useState([]);  // 설비 선택 목록
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 설비 목록 로드 (폼 마운트 시)
  useEffect(() => {
    axios.get('/api/equipments').then((res) => setEquipments(res.data.data));
  }, []);

  // 수정 모드 진입 시 기존 데이터 채우기
  useEffect(() => {
    if (editTarget) {
      setForm({
        equipment_id: String(editTarget.equipment_id),
        check_date:   editTarget.check_date   ?? today(),
        voltage:      editTarget.voltage      ?? '',
        current:      editTarget.current      ?? '',
        temperature:  editTarget.temperature  ?? '',
        memo:         editTarget.memo         ?? '',
        checker:      editTarget.checker      ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [editTarget]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.equipment_id) {
      setError('설비를 선택해주세요.');
      return;
    }
    if (!form.check_date) {
      setError('점검일을 입력해주세요.');
      return;
    }
    // 숫자 필드 유효성 검사
    for (const [label, key] of [['전압', 'voltage'], ['전류', 'current'], ['온도', 'temperature']]) {
      if (form[key] !== '' && isNaN(Number(form[key]))) {
        setError(`${label} 값은 숫자여야 합니다.`);
        return;
      }
    }

    setLoading(true);
    try {
      if (editTarget) {
        await axios.put(`/api/daily-checks/${editTarget.id}`, form);
      } else {
        await axios.post('/api/daily-checks', form);
      }
      setForm({ ...EMPTY_FORM, check_date: today() });
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
        {isEdit ? '✏️ 점검 기록 수정' : '📋 일상점검 입력'}
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
              disabled={isEdit}  // 수정 시 설비 변경 불가
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

          {/* 점검일 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              점검일 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="check_date"
              value={form.check_date}
              onChange={handleChange}
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 점검자 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">점검자</label>
            <input
              type="text"
              name="checker"
              value={form.checker}
              onChange={handleChange}
              placeholder="이름 입력"
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 전압 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              전압 <span className="text-slate-500 text-xs">(V)</span>
            </label>
            <input
              type="number"
              name="voltage"
              value={form.voltage}
              onChange={handleChange}
              placeholder="예) 380"
              step="any"
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 전류 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              전류 <span className="text-slate-500 text-xs">(A)</span>
            </label>
            <input
              type="number"
              name="current"
              value={form.current}
              onChange={handleChange}
              placeholder="예) 120.5"
              step="any"
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 온도 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              온도 <span className="text-slate-500 text-xs">(℃)</span>
            </label>
            <input
              type="number"
              name="temperature"
              value={form.temperature}
              onChange={handleChange}
              placeholder="예) 42"
              step="any"
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 특이사항 */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">특이사항</label>
            <textarea
              name="memo"
              value={form.memo}
              onChange={handleChange}
              placeholder="이상 발생 내용, 조치사항 등을 입력하세요"
              rows={3}
              className="w-full px-3 py-3 text-base resize-none"
            />
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
            {loading ? '저장 중...' : isEdit ? '수정 저장' : '점검 기록 저장'}
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
