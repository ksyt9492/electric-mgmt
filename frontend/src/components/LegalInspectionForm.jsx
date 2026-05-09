import React, { useState, useEffect } from 'react';

const INSPECTION_TYPES = [
  '전기안전점검',
  '정기검사',
  '절연저항 측정',
  '접지저항 측정',
  '누전차단기 작동시험',
  '비상발전기 점검',
  '수전설비 정밀점검',
  '기타',
];

const INSPECTION_RESULTS = ['합격', '조건부합격', '불합격'];

const EMPTY = {
  inspection_type: '',
  due_date: '',
  last_date: '',
  agency: '',
  result: '',
};

export default function LegalInspectionForm({ editTarget, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editTarget) {
      setForm({
        inspection_type: editTarget.inspection_type ?? '',
        due_date:        editTarget.due_date        ?? '',
        last_date:       editTarget.last_date        ?? '',
        agency:          editTarget.agency           ?? '',
        result:          editTarget.result           ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [editTarget]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.inspection_type) { setError('검사종류를 선택하세요'); return; }
    if (!form.due_date)        { setError('만료일을 입력하세요'); return; }

    setSaving(true);
    try {
      const url    = editTarget ? `/api/legal-inspections/${editTarget.id}` : '/api/legal-inspections';
      const method = editTarget ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      onSaved();
      if (!editTarget) setForm(EMPTY);
    } catch (err) {
      setError(err.message || '저장 실패');
    } finally {
      setSaving(false);
    }
  }

  const isEdit = !!editTarget;

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h2 className="text-base font-semibold text-slate-100">
        {isEdit ? '법정검사 수정' : '법정검사 등록'}
      </h2>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* 검사종류 */}
      <div>
        <label className="label">검사종류 *</label>
        <select name="inspection_type" value={form.inspection_type} onChange={handleChange} className="input">
          <option value="">선택</option>
          {INSPECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 최종검사일 */}
        <div>
          <label className="label">최종검사일</label>
          <input type="date" name="last_date" value={form.last_date} onChange={handleChange} className="input" />
        </div>
        {/* 만료일 */}
        <div>
          <label className="label">만료일 *</label>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 검사기관 */}
        <div>
          <label className="label">검사기관</label>
          <input type="text" name="agency" value={form.agency} onChange={handleChange}
            placeholder="예: 한국전기안전공사" className="input" />
        </div>
        {/* 검사결과 */}
        <div>
          <label className="label">검사결과</label>
          <select name="result" value={form.result} onChange={handleChange} className="input">
            <option value="">선택</option>
            {INSPECTION_RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? '저장 중...' : isEdit ? '수정 저장' : '등록'}
        </button>
        {isEdit && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            취소
          </button>
        )}
      </div>
    </form>
  );
}
