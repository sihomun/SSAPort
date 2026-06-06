-- Run this once in Supabase SQL Editor to clean duplicated checklist rows.
-- It keeps one row per user/stage/category/title and preserves completion
-- if any duplicate row was already completed.

ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS stage int DEFAULT 0;

WITH duplicate_groups AS (
  SELECT
    uc.user_id,
    ci.stage,
    lower(coalesce(ci.category, 'common')) AS category,
    lower(trim(coalesce(ci.title, ''))) AS title,
    bool_or(uc.is_done) AS any_done
  FROM user_checklist uc
  JOIN checklist_items ci ON ci.id = uc.item_id
  GROUP BY uc.user_id, ci.stage, lower(coalesce(ci.category, 'common')), lower(trim(coalesce(ci.title, '')))
  HAVING count(*) > 1
),
ranked AS (
  SELECT
    uc.id,
    uc.user_id,
    ci.stage,
    lower(coalesce(ci.category, 'common')) AS category,
    lower(trim(coalesce(ci.title, ''))) AS title,
    row_number() OVER (
      PARTITION BY uc.user_id, ci.stage, lower(coalesce(ci.category, 'common')), lower(trim(coalesce(ci.title, '')))
      ORDER BY uc.is_done DESC, uc.id
    ) AS row_num
  FROM user_checklist uc
  JOIN checklist_items ci ON ci.id = uc.item_id
)
UPDATE user_checklist uc
SET is_done = dg.any_done
FROM ranked r
JOIN duplicate_groups dg
  ON dg.user_id = r.user_id
  AND dg.stage = r.stage
  AND dg.category = r.category
  AND dg.title = r.title
WHERE uc.id = r.id
  AND r.row_num = 1;

WITH ranked AS (
  SELECT
    uc.id,
    row_number() OVER (
      PARTITION BY uc.user_id, ci.stage, lower(coalesce(ci.category, 'common')), lower(trim(coalesce(ci.title, '')))
      ORDER BY uc.is_done DESC, uc.id
    ) AS row_num
  FROM user_checklist uc
  JOIN checklist_items ci ON ci.id = uc.item_id
)
DELETE FROM user_checklist uc
USING ranked r
WHERE uc.id = r.id
  AND r.row_num > 1;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, item_id
      ORDER BY is_done DESC, id
    ) AS row_num
  FROM user_checklist
)
DELETE FROM user_checklist uc
USING ranked r
WHERE uc.id = r.id
  AND r.row_num > 1;

CREATE UNIQUE INDEX IF NOT EXISTS user_checklist_user_item_unique
ON user_checklist(user_id, item_id);
