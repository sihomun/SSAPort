# SSAPort

> KENTECH 해외단기연수(SSAP) 참가 학생을 위한 출국 전 준비 관리 웹 서비스

## 프로젝트 소개

SSAPort는 KENTECH 재학생이 SSAP(Summer Study Abroad Program) 참가 시 필요한 모든 출국 전 준비 과정을 한 곳에서 관리할 수 있도록 돕는 플랫폼입니다. 목적지 국가와 호스트 대학에 따라 필요한 서류, 준비물, 마감일을 자동으로 큐레이션하고 AI 어시스턴트가 실시간으로 개인화된 안내를 제공합니다.

## 팀 구성

| 이름 | 학번 | 역할 |
|------|------|------|
| 김민태 | 20240199 | Frontend / UI (React + Tailwind CSS) |
| 김우재 | 20240273 | Backend / Database (FastAPI, Supabase) |
| 문시호 | 20240583 | AI / Data (LLM API, RAG 파이프라인) |
| 박소정 | 20240800 | PM / QA (자료 수집, 유저 테스트) |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database / Auth | Supabase |
| AI | OpenAI GPT 또는 Anthropic Claude Haiku |
| 배포 | Vercel (FE), Railway or Render (BE) |

## 빠른 시작

```bash
# 프론트엔드
cd frontend
npm install
npm run dev

# 백엔드
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 문서 목록

| 문서 | 설명 |
|------|------|
| [PRD](./PRD.md) | 제품 요구사항 정의서 |
| [PAGES](./PAGES.md) | 페이지별 기획 및 컴포넌트 명세 |
| [API](./API.md) | 백엔드 API 명세 |
| [AI](./AI.md) | AI 기능 및 프롬프트 설계 |
| [DATA](./DATA.md) | 데이터베이스 스키마 |
| [SETUP](./SETUP.md) | 개발 환경 세팅 가이드 |
