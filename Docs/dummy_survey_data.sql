-- Docs/dummy_survey_data.sql
-- CJ대한통운 가상 설문 데이터 (50명 x 5분기 = 250건)
USE `leadership`;

-- CJ대한통운 회사 정보 삽입
INSERT IGNORE INTO `companies` (`name`) VALUES ('CJ대한통운');

-- 1~50번 Dummy Users 삽입
INSERT IGNORE INTO `users` (`company_id`,`name`,`employee_id`,`phone`,`email`,`title`,`user_type`,`password_hash`,`verified`)
SELECT
  c.id,
  CONCAT('사용자', LPAD(nums.n, 2, '0')) AS name,
  LPAD(nums.n, 4, '0') AS employee_id,
  '010-0000-0000' AS phone,
  CONCAT('user', nums.n, '@example.com') AS email,
  '직원' AS title,
  '사용자' AS user_type,
  'password' AS password_hash,
  1 AS verified
FROM
  (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
   UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
   UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
   UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
   UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25
   UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30
   UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL SELECT 35
   UNION ALL SELECT 36 UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL SELECT 40
   UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL SELECT 45
   UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL SELECT 49 UNION ALL SELECT 50
  ) AS nums
JOIN `companies` AS c ON c.name = 'CJ대한통운';

-- 설문 문항 삽입
INSERT IGNORE INTO `survey_questions` (`company_id`,`question_no`,`question_text`)
SELECT
  c.id,
  q.question_no,
  q.question_text
FROM
  `companies` AS c
CROSS JOIN
  (
    SELECT 1 AS question_no, '업무지시할 때 목적, 기대하는 결과물, 방향성 명확히 가이드' AS question_text
    UNION ALL SELECT 2, '형식보다 내용(본질)에 집중'
    UNION ALL SELECT 3, '전사관점에서 의사결정'
    UNION ALL SELECT 4, '공동목표를 위해 적극적으로 협업하고 실행'
    UNION ALL SELECT 5, '조직의 비전과 목표를 수시로 커뮤니케이션하고 적극 공유'
    UNION ALL SELECT 6, '자유롭게 말할 수 있는 분위기 조성, 개개인의 다양성 존중'
    UNION ALL SELECT 7, '객관적인 데이터 기반 최선의 선택'
    UNION ALL SELECT 8, '기존방식보다 새로운 시도를 통해 더 나은 결과물을 창출'
    UNION ALL SELECT 9, '비효율과 낭비를 즉시 개선'
    UNION ALL SELECT 10, '최신 트렌드에 개방과 빠른 실행력을 보인다'
    UNION ALL SELECT 11, '고객니즈에 집중하여 최적의 솔루션을 찾는다'
    UNION ALL SELECT 12, '나의 역할, 나의 상황을 고려해 의미있는 업무와 과제를 부여한다'
    UNION ALL SELECT 13, '관찰과 객관적 사실에 기반해 공정하게 평가하고 건설적인 피드백을 준다'
  ) AS q
WHERE c.name = 'CJ대한통운';

-- SurveyResponses 데이터 삽입
INSERT INTO `survey_responses` (`company_id`,`respondent_id`,`target_id`,`survey_year`,`survey_quarter`,`survey_month`,`evaluation_type`,`raw_data`)
SELECT
  c.id,
  nums.n,
  nums.n,
  q.survey_year,
  q.survey_quarter,
  q.survey_quarter * 3,
  '본인',
  JSON_OBJECT(
    '1', FLOOR(RAND()*5)+1,
    '2', FLOOR(RAND()*5)+1,
    '3', FLOOR(RAND()*5)+1,
    '4', FLOOR(RAND()*5)+1,
    '5', FLOOR(RAND()*5)+1,
    '6', FLOOR(RAND()*5)+1,
    '7', FLOOR(RAND()*5)+1,
    '8', FLOOR(RAND()*5)+1,
    '9', FLOOR(RAND()*5)+1,
    '10', FLOOR(RAND()*5)+1,
    '11', FLOOR(RAND()*5)+1,
    '12', FLOOR(RAND()*5)+1,
    '13', FLOOR(RAND()*5)+1
  ) AS raw_data
FROM
  (
    SELECT 2023 AS survey_year, 1 AS survey_quarter
    UNION ALL SELECT 2023, 2
    UNION ALL SELECT 2023, 3
    UNION ALL SELECT 2023, 4
    UNION ALL SELECT 2024, 1
  ) AS q,
  (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
  ) AS nums,
  `companies` AS c
WHERE c.name = 'CJ대한통운';

-- 상사 평가 데이터 삽입
INSERT INTO `survey_responses` (`company_id`,`respondent_id`,`target_id`,`survey_year`,`survey_quarter`,`survey_month`,`evaluation_type`,`raw_data`)
SELECT
  c.id,
  evaluator_nums.n AS respondent_id,
  target_nums.n AS target_id,
  q.survey_year,
  q.survey_quarter,
  q.survey_quarter * 3,
  '상사',
  JSON_OBJECT(
    '1', FLOOR(RAND()*5)+1,
    '2', FLOOR(RAND()*5)+1,
    '3', FLOOR(RAND()*5)+1,
    '4', FLOOR(RAND()*5)+1,
    '5', FLOOR(RAND()*5)+1,
    '6', FLOOR(RAND()*5)+1,
    '7', FLOOR(RAND()*5)+1,
    '8', FLOOR(RAND()*5)+1,
    '9', FLOOR(RAND()*5)+1,
    '10', FLOOR(RAND()*5)+1,
    '11', FLOOR(RAND()*5)+1,
    '12', FLOOR(RAND()*5)+1,
    '13', FLOOR(RAND()*5)+1
  )
FROM
  (
    SELECT 2023 AS survey_year, 1 AS survey_quarter
    UNION ALL SELECT 2023, 2
    UNION ALL SELECT 2023, 3
    UNION ALL SELECT 2023, 4
    UNION ALL SELECT 2024, 1
  ) AS q,
  (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3
  ) AS target_nums,
  (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3
  ) AS evaluator_nums,
  `companies` AS c
WHERE c.name = 'CJ대한통운'
  AND evaluator_nums.n < target_nums.n;

-- 부하 평가 데이터 삽입
INSERT INTO `survey_responses` (`company_id`,`respondent_id`,`target_id`,`survey_year`,`survey_quarter`,`survey_month`,`evaluation_type`,`raw_data`)
SELECT
  c.id,
  evaluator_nums.n AS respondent_id,
  target_nums.n AS target_id,
  q.survey_year,
  q.survey_quarter,
  q.survey_quarter * 3,
  '부하',
  JSON_OBJECT(
    '1', FLOOR(RAND()*5)+1,
    '2', FLOOR(RAND()*5)+1,
    '3', FLOOR(RAND()*5)+1,
    '4', FLOOR(RAND()*5)+1,
    '5', FLOOR(RAND()*5)+1,
    '6', FLOOR(RAND()*5)+1,
    '7', FLOOR(RAND()*5)+1,
    '8', FLOOR(RAND()*5)+1,
    '9', FLOOR(RAND()*5)+1,
    '10', FLOOR(RAND()*5)+1,
    '11', FLOOR(RAND()*5)+1,
    '12', FLOOR(RAND()*5)+1,
    '13', FLOOR(RAND()*5)+1
  )
FROM
  (
    SELECT 2023 AS survey_year, 1 AS survey_quarter
    UNION ALL SELECT 2023, 2
    UNION ALL SELECT 2023, 3
    UNION ALL SELECT 2023, 4
    UNION ALL SELECT 2024, 1
  ) AS q,
  (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
  ) AS target_nums,
  (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
  ) AS evaluator_nums,
  `companies` AS c
WHERE c.name = 'CJ대한통운'
  AND evaluator_nums.n < target_nums.n;

-- 뷰 삭제 및 생성: 문항별 설문 응답 조회
DROP VIEW IF EXISTS `survey_response_flat`;
CREATE VIEW `survey_response_flat` AS
SELECT
  sr.id AS response_id,
  sr.company_id,
  c.name AS company_name,
  sr.respondent_id,
  u1.name AS respondent_name,
  sr.target_id,
  u2.name AS target_name,
  sr.survey_year,
  sr.survey_quarter,
  sr.survey_month,
  sr.evaluation_type,
  sq.question_no,
  sq.question_text,
  JSON_UNQUOTE(JSON_EXTRACT(sr.raw_data, CONCAT('$."', sq.question_no, '"'))) AS response_value
FROM `survey_responses` AS sr
JOIN `survey_questions` AS sq ON sr.company_id = sq.company_id
JOIN `companies` AS c ON sr.company_id = c.id
JOIN `users` AS u1 ON sr.respondent_id = u1.id
JOIN `users` AS u2 ON sr.target_id = u2.id;

-- 예시 조회: 상위 20개 레코드
SELECT * FROM `survey_response_flat` LIMIT 20; 