# AI Market Watch Development Context Log

## Project Overview
AI Market Watch는 전 세계 AI 스타트업들의 정보를 실시간으로 추적하고 분석하는 인텔리전스 플랫폼입니다.

## Development Progress

### 2024-12-17: DNA Match 기능 구현

#### 1. 기능 개요
- **목적**: 사용자의 스타트업 정보를 입력받아 유사한 DNA를 가진 기존 스타트업들을 찾아주는 매칭 서비스
- **타겟**: 예비 창업자, 초기 스타트업 팀

#### 2. 구현 내용

##### 2.1 UI/UX 설계
- **진입점**: Floating button (우측 하단, 오렌지 그라디언트)
- **플로우**: Modal 팝업 → 정보 입력 → 분석 중 → 결과 표시
- **이메일 게이팅**: 상위 3개 결과만 무료 제공, 전체 결과는 이메일 입력 후 PDF 전송

##### 2.2 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend 준비**: 
  - n8n 웹훅 연동 준비
  - Supabase 벡터 DB (pgvector) 활용
  - OpenAI Embeddings + Gemini 2.0 Flash 분석

##### 2.3 주요 컴포넌트
```
/components/dna/
├── DNAMatchFloatingButton.tsx  # 플로팅 버튼
├── DNAMatchModal.tsx           # 모달 UI
├── DNAMatchForm.tsx            # 입력 폼
└── DNAMatchResults.tsx         # 결과 표시

/lib/
└── dna-analysis.ts             # 분석 로직

/app/api/
├── analyze-dna/                # 분석 API
└── send-dna-report/            # 이메일 전송 API
```

##### 2.4 데이터 구조
```typescript
// 사용자 입력 데이터
interface DNAFormData {
  companyName: string;
  description: string;
  category: string;
  problem: string;
  solution: string;
  targetMarket?: string;
  businessModel?: string;
  teamSize?: string;
  fundingStage?: string;
  location?: string;
  yearFounded?: string;
}

// 분석 결과
interface DNAAnalysisResult {
  userStartup: {
    id: string;
    embedding: number[];
  };
  matches: Array<{
    id: string;
    companyName: string;
    similarity: number;
    category: string;
    description: string;
    fundingRaised: string;
    yearFounded: number;
  }>;
  insights: {
    commonPatterns: string[];
    differentiators: string[];
    opportunities: string[];
    recommendations: string[];
  };
}
```

#### 3. 디자인 시스템 통일
- **색상 테마 변경**: 
  - 보라색 → 오렌지색 (브랜드 일관성)
  - 배경색: 푸른빛 회색 → 순수 검정 베이스
- **모달 스타일**: CompanyModal과 동일한 glassmorphism 효과 적용
- **CSS 변수 업데이트**:
  ```css
  --background-start-rgb: 0, 0, 0;  /* 순수 검정 */
  --background-end-rgb: 10, 10, 10;
  --surface-primary: 10, 10, 10;
  ```

#### 4. 수익화 전략
- **Freemium 모델**:
  - 무료: 상위 3개 매칭 결과 + 기본 인사이트
  - 이메일 제출: 전체 5개 매칭 + 상세 인사이트 + PDF 리포트
  - 향후 프리미엄: 무제한 분석, API 액세스, 팀 공유

#### 5. 다음 단계
1. **즉시 실행**:
   - n8n 웹훅 워크플로우 구현
   - Supabase에 user_startups 테이블 생성
   - 이메일 전송 서비스 연동 (SendGrid/Resend)

2. **단기 계획**:
   - 스타트업 간 유사도 매트릭스 구축
   - 각 회사 페이지에 "Similar Companies" 섹션 추가
   - 분석 결과 캐싱 및 성능 최적화

3. **장기 계획**:
   - 트렌드 분석 기능 ("이번 달 가장 많이 검색된 DNA 패턴")
   - 예측 모델 ("당신의 스타트업 성공 확률")
   - API 서비스 오픈

## Technical Notes

### Supabase 테이블 구조
```sql
-- 사용자 스타트업 정보 (검증되지 않은 데이터)
CREATE TABLE user_startups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_info JSONB NOT NULL,
  embedding vector(1536),
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 수집
CREATE TABLE email_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  report_sent_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_user_startups_created_at ON user_startups(created_at DESC);
CREATE INDEX idx_email_signups_email ON email_signups(email);
```

### n8n 웹훅 플로우
1. 웹훅 수신 → 2. OpenAI Embeddings → 3. Supabase 벡터 검색 → 4. Gemini 2.0 Flash 분석 → 5. 결과 반환

### 환경 변수
```bash
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-webhook-url
```

## Metrics to Track
- Floating button CTR
- 폼 완성률
- 이메일 제출률
- 동일 유저 재사용률
- 카테고리별 관심도 분포

---
*Last Updated: 2024-12-17*