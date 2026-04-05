import React, { useState } from 'react';
import EquipmentPage from './pages/EquipmentPage';
import DailyCheckPage from './pages/DailyCheckPage';
import HistoryPage from './pages/HistoryPage';

const TABS = [
  { id: 'equipment',    label: '설비 관리',   icon: '🔧' },
  { id: 'daily-check',  label: '일상점검',    icon: '📋' },
  { id: 'history',      label: '점검 이력',   icon: '🔍' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('equipment');
  // 이력 탭에서 수정 요청 시 일상점검 탭으로 전달할 상태
  const [dailyCheckEdit, setDailyCheckEdit] = useState(null);

  // 다른 탭으로 이동 + 상태 전달
  function handleNavigate(tabId, state = {}) {
    if (tabId === 'daily-check' && state.editTarget) {
      setDailyCheckEdit(state.editTarget);
    }
    setActiveTab(tabId);
  }

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
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent-400 text-accent-400 bg-navy-800'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-navy-800/50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

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
      </main>
    </div>
  );
}
