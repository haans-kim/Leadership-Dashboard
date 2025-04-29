-- Companies 테이블 생성
CREATE TABLE IF NOT EXISTS Companies (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DataSet 테이블 생성
CREATE TABLE IF NOT EXISTS DataSet (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    company_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    row_count INT UNSIGNED NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    period VARCHAR(7) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    version INT UNSIGNED NOT NULL DEFAULT 1,
    processed_date TIMESTAMP NULL,
    last_modified_date TIMESTAMP NULL,
    metadata JSON,
    PRIMARY KEY (id),
    CONSTRAINT fk_dataset_company 
        FOREIGN KEY (company_id) 
        REFERENCES Companies(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 회사 데이터 입력
INSERT INTO Companies (name) VALUES ('Default Company') ON DUPLICATE KEY UPDATE name = name; 