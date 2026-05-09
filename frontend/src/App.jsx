import React, { useState, useEffect } from 'react';
import EquipmentPage from './pages/EquipmentPage';
import DailyCheckPage from './pages/DailyCheckPage';
import HistoryPage from './pages/HistoryPage';
import LegalInspectionPage from './pages/LegalInspectionPage';
import FaultHistoryPage from './pages/FaultHistoryPage';

const TABS = [
  { id: 'equipment',   label: '설비 관리', icon: '🔧' },
  { id: 'daily-check', label: '일상점검',  icon: '📋' },
  { id: 'history',     label: '점검 이력', icon: '🔍' },
  { id: 'fault',       label: '이상 이력', icon: '⚠️' },
  { id: 'legal',       label: '법정검사',  icon: '📅' },
];

// 오늘 기준 D-day 계산 (양수: 남은 날, 음수: 초과)
function calcDday(dueDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

export default function App() {
  const [activeTab, setActiveTab]       = useState('equipment');
  const [dailyCheckEdit, setDailyCheckEdit] = useState(null);

  // 법정검사 알림용 상태
  const [alertItems, setAlertItems] = useState([]);

  // 법정검사 만료 알림 항목 갱신 (앱 시작 + 법정검사 저장 시 호출)
  function fetchAlerts() {
    fetch('/api/legal-inspections')
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const urgent = json.data.filter((item) => calcDday(item.due_date) <= 30);
        setAlertItems(urgent);
      })
      .catch(() => {});
  }

  useEffect(() => { fetchAlerts(); }, []);

  function handleNavigate(tabId, state = {}) {
    if (tabId === 'daily-check' && state.editTarget) {
      setDailyCheckEdit(state.editTarget);
    }
    setActiveTab(tabId);
  }

  // 알림 배너: 만료 초과는 빨간색, 30일 이내는 노란색
  const expired = alertItems.filter((i) => calcDday(i.due_date) < 0);
  const soon    = alertItems.filter((i) => { const d = calcDday(i.due_date); return d >= 0 && d <= 30; });

  return (
    <div className="min-h-screen">
      {/* 상단 헤더 */}
      <header className="bg-navy-950 border-b border-navy-700 px-4 pt-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-accent-400 text-2xl">⚡</span>
            <div>
              <h1 className="text-lg font-bold text-slate-100 leading-tight">
                전기설비 관리 시스템
              </h1>
              <p className="text-xs text-slate-400">수변전설비 점검·기록·관리</p>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavigate(tab.id)}
                className={`relative px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent-400 text-accent-400 bg-navy-800'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-navy-800/50'
                }`}
              >
                {tab.icon} {tab.label}
                {/* 법정검사 탭에 알림 뱃지 */}
                {tab.id === 'legal' && alertItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {alertItems.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 법정검사 알림 배너 */}
      {expired.length > 0 && (
        <div
          className="bg-red-900/80 border-b border-red-700 px-4 py-2 cursor-pointer"
          onClick={() => handleNavigate('legal')}
        >
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-red-200">
            <span className="font-bold">🚨 만료 초과</span>
            <span>{expired.map((i) => `${i.inspection_type}(D+${Math.abs(calcDday(i.due_date))})`).join(', ')}</span>
            <span className="ml-auto text-xs underline">확인하기 →</span>
          </div>
        </div>
      )}
      {soon.length > 0 && (
        <div
          className="bg-yellow-900/60 border-b border-yellow-700 px-4 py-2 cursor-pointer"
          onClick={() => handleNavigate('legal')}
        >
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-yellow-200">
            <span className="font-bold">⚠️ 만료 임박</span>
            <span>{soon.map((i) => `${i.inspection_type}(D-${calcDday(i.due_date)})`).join(', ')}</span>
            <span className="ml-auto text-xs underline">확인하기 →</span>
          </div>
        </div>
      )}

      {/* 본문 */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'equipment'   && <EquipmentPage />}
        {activeTab === 'daily-check' && (
          <DailyCheckPage
            initialEditTarget={dailyCheckEdit}
            onEditConsumed={() => setDailyCheckEdit(null)}
          />
        )}
        {activeTab === 'history' && <HistoryPage onNavigate={handleNavigate} />}
        {activeTab === 'fault'   && <FaultHistoryPage />}
        {activeTab === 'legal'   && <LegalInspectionPage onSaved={fetchAlerts} />}
      </main>
    </div>
  );
}
