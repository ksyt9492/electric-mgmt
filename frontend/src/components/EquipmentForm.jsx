import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EQUIPMENT_TYPES, EQUIPMENT_STATUSES } from '../utils/equipment';

// 빈 폼 초기값
const EMPTY_FORM = {
  name: '',
  type: '',
  capacity: '',
  manufacturer: '',
  install_date: '',
  location: '',
  status: '정상',
};

/**
 * 설비 등록 / 수정 폼
 * - editTarget: 수정 대상 설비 객체 (null이면 신규 등록 모드)
 * - onSaved: 저장 완료 콜백
 * - onCancel: 취소 콜백 (수정 모드에서만 사용)
 */
export default function EquipmentForm({ editTarget, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 수정 모드 진입 시 폼에 기존 데이터 채우기
  useEffect(() => {
    if (editTarget) {
      setForm({
        name: editTarget.name ?? '',
        type: editTarget.type ?? '',
        capacity: editTarget.capacity ?? '',
        manufacturer: editTarget.manufacturer ?? '',
        install_date: editTarget.install_date ?? '',
        location: editTarget.location ?? '',
        status: editTarget.status ?? '정상',
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

    if (!form.name.trim()) {
      setError('설비명을 입력해주세요.');
      return;
    }
    if (!form.type) {
      setError('설비종류를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (editTarget) {
        await axios.put(`/api/equipments/${editTarget.id}`, form);
      } else {
        await axios.post('/api/equipments', form);
      }
      setForm(EMPTY_FORM);
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
        {isEdit ? '✏️ 설비 정보 수정' : '➕ 신규 설비 등록'}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 설비명 */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">
              설비명 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="예) 1호 변압기, 메인 ACB"
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 설비종류 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              설비종류 <span className="text-red-400">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-3 py-3 text-base"
            >
              <option value="">-- 선택 --</option>
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">상태</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-3 text-base"
            >
              {EQUIPMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 용량 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">용량</label>
            <input
              type="text"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="예) 500kVA, 800A"
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 제조사 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">제조사</label>
            <input
              type="text"
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              placeholder="예) 현대일렉트릭, LS산전"
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 설치일 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">설치일</label>
            <input
              type="date"
              name="install_date"
              value={form.install_date}
              onChange={handleChange}
              className="w-full px-3 py-3 text-base"
            />
          </div>

          {/* 설치위치 */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">설치위치</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="예) 지하 1층 전기실"
              className="w-full px-3 py-3 text-base"
            />
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <p className="mt-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* 버튼 영역 */}
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 sm:flex-none">
            {loading ? '저장 중...' : isEdit ? '수정 저장' : '등록'}
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
