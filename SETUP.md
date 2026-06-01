# 개발 환경 세팅 가이드 (SETUP.md)

---

## 사전 준비

- Node.js 18 이상
- Python 3.11 이상
- Git
- [Supabase](https://supabase.com) 계정
- OpenAI 또는 Anthropic API 키

---

## 1. 레포지토리 클론

```bash
git clone https://github.com/your-org/ssaport.git
cd ssaport
```

### 브랜치 전략

```
main        → 배포용 (건드리지 않기)
develop     → 공통 개발 브랜치 (PR 대상)
feat/*      → 기능별 브랜치
```

```bash
git checkout develop
git checkout -b feat/your-feature
```

---

## 2. 프론트엔드 세팅

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` 파일 작성:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

개발 서버 실행 (포트 5173):
```bash
npm run dev
```

---

## 3. 백엔드 세팅

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

`.env` 파일 작성:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
OPENAI_API_KEY=sk-...
# 또는
ANTHROPIC_API_KEY=sk-ant-...
```

개발 서버 실행 (포트 8000):
```bash
uvicorn main:app --reload
```

API 문서 확인: `http://localhost:8000/docs`

---

## 4. Supabase 세팅

1. [supabase.com](https://supabase.com) → New Project 생성
2. 프로젝트 이름: `ssaport`
3. **Authentication** → Providers → Email 활성화
4. **SQL Editor** → `DATA.md`의 테이블 생성 쿼리 실행
5. **Project Settings** → API → URL, anon key, service_role key 복사

---

## 5. Git 커밋 규칙

```
feat:     새 기능
fix:      버그 수정
style:    UI/스타일 변경
refactor: 리팩토링
docs:     문서 수정
chore:    설정, 패키지 등
```

예시:
```
feat: 대시보드 진행률 바 컴포넌트 추가
fix: 온보딩 날짜 선택 오류 수정
```

---

## 6. 폴더 구조

```
ssaport/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Checklist.jsx
│   │   │   └── Chat.jsx
│   │   ├── components/
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── CategoryCard.jsx
│   │   │   ├── ChecklistItem.jsx
│   │   │   └── ChatBubble.jsx
│   │   ├── lib/
│   │   │   └── supabaseClient.js
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── routers/
│   │   ├── checklist.py
│   │   ├── chat.py
│   │   └── packing.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
└── docs/
    ├── README.md
    ├── PAGES.md
    ├── API.md
    ├── AI.md
    ├── DATA.md
    └── SETUP.md
```
