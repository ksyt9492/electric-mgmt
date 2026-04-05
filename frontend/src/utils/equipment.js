// 설비종류 목록
export const EQUIPMENT_TYPES = [
  '수전설비',
  '변압기(TR)',
  '기중차단기(ACB)',
  '진공차단기(VCB)',
  '배선용차단기(MCCB)',
  '배전반',
  '콘덴서',
  '단로기(DS)',
  '피뢰기(LA)',
  'UPS',
  '기타',
];

// 설비 상태 목록
export const EQUIPMENT_STATUSES = ['정상', '주의', '불량', '교체필요'];

// 상태별 배지 색상 클래스
export function getStatusBadgeClass(status) {
  return `badge-${status} text-xs font-semibold px-2 py-0.5 rounded-full border`;
}
