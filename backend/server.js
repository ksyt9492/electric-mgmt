const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSchema } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 4000;
const IS_PROD = process.env.NODE_ENV === 'production';

// 개발 중에는 Vite 개발 서버(5173)에서만 요청 허용
if (!IS_PROD) {
  app.use(cors({ origin: 'http://localhost:5173' }));
}

app.use(express.json());

// API 라우트
app.use('/api/equipments',          require('./routes/equipment'));
app.use('/api/daily-checks',        require('./routes/dailyCheck'));
app.use('/api/legal-inspections',   require('./routes/legalInspection'));
app.use('/api/fault-history',       require('./routes/faultHistory'));

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: null, message: '서버 정상 동작 중' });
});

// 프로덕션: 빌드된 프론트엔드 정적 파일 서빙
if (IS_PROD) {
  const DIST = path.join(__dirname, '../frontend/dist');
  app.use(express.static(DIST));
  // React Router를 위해 나머지 모든 경로는 index.html 반환
  app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

// DB 스키마 초기화 후 서버 시작
initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚡ 전기설비 관리 서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB 초기화 실패:', err);
    process.exit(1);
  });
