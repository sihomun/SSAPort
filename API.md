# API 명세서 (API.md)

> FastAPI 기반 백엔드 엔드포인트 정의. Base URL: `http://localhost:8000`

---

## 인증 (Auth)

Supabase Auth를 사용하므로 별도 구현 없이 클라이언트에서 직접 처리.  
백엔드 요청 시 `Authorization: Bearer <supabase_jwt>` 헤더 포함.

---

## 유저 (User)

### `POST /users/onboarding`
온보딩 정보 저장 (최초 1회)

**Request Body**
```json
{
  "host_university": "UCLA",
  "departure_date": "2026-06-21",
  "stay_weeks": 8,
  "is_first_time": true
}
```

**Response**
```json
{
  "user_id": "uuid",
  "checklist_generated": true
}
```

---

### `GET /users/me`
현재 유저 정보 조회

**Response**
```json
{
  "user_id": "uuid",
  "email": "student@kentech.ac.kr",
  "host_university": "UCLA",
  "departure_date": "2026-06-21",
  "stay_weeks": 8
}
```

---

## 체크리스트 (Checklist)

### `GET /checklist`
전체 체크리스트 조회 (카테고리별)

**Response**
```json
{
  "overall_progress": 67,
  "categories": [
    {
      "id": "visa",
      "name": "비자",
      "progress": 80,
      "items": [
        {
          "id": "item_001",
          "title": "DS-160 작성",
          "is_done": true,
          "deadline": "2026-03-21",
          "deadline_label": "D-90",
          "description": "미국 비이민 비자 온라인 신청서",
          "links": [{ "label": "DS-160 작성 바로가기", "url": "https://ceac.state.gov/genniv/" }]
        }
      ]
    }
  ]
}
```

---

### `PATCH /checklist/items/:item_id`
체크리스트 항목 완료 여부 업데이트

**Request Body**
```json
{ "is_done": true }
```

**Response**
```json
{ "item_id": "item_001", "is_done": true }
```

---

## AI 챗봇 (Chat)

### `POST /chat`
AI 챗봇에 메시지 전송

**Request Body**
```json
{
  "message": "DS-160이 뭐야?",
  "history": [
    { "role": "user", "content": "안녕" },
    { "role": "assistant", "content": "안녕하세요! 무엇이 궁금하신가요?" }
  ]
}
```

**Response**
```json
{
  "reply": "DS-160은 미국 비이민 비자 신청을 위한 온라인 신청서입니다..."
}
```

---

## AI 짐 목록 생성기 (Packing)

### `POST /ai/packing-list`
목적지 정보를 바탕으로 짐 목록 생성

**Request Body**
```json
{
  "destination": "UCLA",
  "stay_weeks": 8,
  "has_laundry": true,
  "season": "summer"
}
```

**Response**
```json
{
  "packing_list": {
    "의류": ["반팔 7벌", "긴팔 2벌", "얇은 외투 1벌"],
    "전자기기": ["노트북", "멀티어댑터 (110V)", "보조배터리"],
    "서류": ["여권 원본", "DS-2019", "항공권 출력본"],
    "의약품": ["상비약", "처방약 (영문 처방전 지참)"]
  }
}
```

---

## 에러 코드

| 코드 | 의미 |
|------|------|
| 400 | 잘못된 요청 (필수 필드 누락 등) |
| 401 | 인증 실패 (JWT 없거나 만료) |
| 404 | 리소스 없음 |
| 500 | 서버 내부 오류 |
