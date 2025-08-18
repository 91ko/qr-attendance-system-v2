-- 수퍼베이스 연결 테스트 SQL
-- 이 파일을 수퍼베이스 SQL Editor에서 실행해보세요

-- 1. PostgreSQL 버전 확인
SELECT version();

-- 2. 현재 데이터베이스 확인
SELECT current_database();

-- 3. 현재 사용자 확인
SELECT current_user;

-- 4. 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 5. 간단한 계산 테스트
SELECT 1 + 1 as test_result;

-- 6. 현재 시간 확인
SELECT NOW();

-- 7. 스키마 정보 확인
SELECT schema_name 
FROM information_schema.schemata;
