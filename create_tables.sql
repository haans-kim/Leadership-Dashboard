USE `leadership`;

-- 기존 테이블 제거 (존재하는 경우)
DROP TABLE IF EXISTS `survey_answers`;
DROP TABLE IF EXISTS `survey_responses`;
DROP TABLE IF EXISTS `survey_questions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `companies`;

-- Companies 테이블
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users 테이블
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `employee_id` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(50),
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `title` VARCHAR(255),
  `user_type` ENUM('관리자','사용자','기타') NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  INDEX (`company_id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SurveyQuestions 테이블
CREATE TABLE IF NOT EXISTS `survey_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `question_no` INT NOT NULL,
  `question_text` TEXT,
  UNIQUE KEY `uq_company_question` (`company_id`,`question_no`),
  INDEX (`company_id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SurveyResponses 테이블
CREATE TABLE IF NOT EXISTS `survey_responses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `respondent_id` INT NOT NULL,
  `target_id` INT NOT NULL,
  `survey_year` INT NOT NULL,
  `survey_quarter` INT NOT NULL,
  `survey_month` INT NOT NULL,
  `evaluation_type` ENUM('본인','상사','동료','부하') NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `raw_data` JSON NOT NULL,
  INDEX (`company_id`),
  INDEX (`respondent_id`),
  INDEX (`target_id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`respondent_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`target_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 