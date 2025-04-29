use leadership;

DROP TABLE IF EXISTS Companies;

-- Company 테이블 생성
CREATE TABLE Companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
);

-- 그 다음 DataSet 테이블 생성
DROP TABLE IF EXISTS DataSet;

CREATE TABLE DataSet (
    id SERIAL PRIMARY KEY,
    company_id BIGINT UNSIGNED NOT NULL,  -- SERIAL 타입과 맞추기 위해 BIGINT UNSIGNED 사용
    name VARCHAR(100) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    row_count INTEGER NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    period VARCHAR(7) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',companies
    version INTEGER NOT NULL DEFAULT 1,
    processed_date TIMESTAMP NULL,
    last_modified_date TIMESTAMP NULL,
    metadata JSON,
    FOREIGN KEY (company_id) REFERENCES Companies(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);