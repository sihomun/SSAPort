# 데이터베이스 스키마 (DATA.md)

> Supabase (PostgreSQL) 기반 테이블 설계

---

## 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `users` | 유저 프로필 및 온보딩 정보 |
| `checklist_items` | 체크리스트 마스터 데이터 |
| `user_checklist` | 유저별 체크리스트 완료 현황 |
| `archive_posts` | 선배 후기 (Optional) |

---

## `users`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `uuid` (PK) | Supabase Auth uid와 동일 |
| `email` | `text` | KENTECH 이메일 |
| `host_university` | `text` | 호스트 대학 (예: UCLA) |
| `country` | `text` | 목적지 국가 (예: US) |
| `departure_date` | `date` | 출발일 |
| `stay_weeks` | `int` | 체류 기간 (주) |
| `is_first_time` | `bool` | SSAP 첫 참가 여부 |
| `created_at` | `timestamptz` | 가입일 |

---

## `checklist_items`

마스터 데이터 (관리자가 관리, 유저가 수정 불가)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `uuid` (PK) | |
| `category` | `text` | visa / flights / accommodation / insurance / esim / packing |
| `university` | `text` | 해당 학교 (ALL이면 공통) |
| `title` | `text` | 항목명 |
| `description` | `text` | 상세 설명 |
| `deadline_label` | `text` | D-90 / D-60 / D-30 / D-7 |
| `links` | `jsonb` | 관련 링크 배열 `[{label, url}]` |
| `order` | `int` | 카테고리 내 표시 순서 |

---

## `user_checklist`

유저별 항목 완료 현황

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` (FK → users.id) | |
| `item_id` | `uuid` (FK → checklist_items.id) | |
| `is_done` | `bool` | 완료 여부 |
| `done_at` | `timestamptz` | 완료 시각 |

---

## `archive_posts` (Optional)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` (FK → users.id) | 작성자 |
| `university` | `text` | 관련 학교 |
| `year` | `int` | 참가 연도 |
| `content` | `text` | 후기 본문 |
| `ai_summary` | `text` | AI 요약 (자동 생성) |
| `created_at` | `timestamptz` | |

---

## Supabase Row Level Security (RLS)

```sql
-- users: 본인 데이터만 읽기/쓰기
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON users
  USING (auth.uid() = id);

-- user_checklist: 본인 데이터만 읽기/쓰기
ALTER TABLE user_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_own" ON user_checklist
  USING (auth.uid() = user_id);

-- checklist_items: 모든 로그인 유저가 읽기 가능
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_read" ON checklist_items
  FOR SELECT USING (auth.role() = 'authenticated');
```
