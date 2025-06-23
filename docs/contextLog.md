# Context Log

## 2024-12-28: Brand Messaging Update - "Comprehensive" to "Lively"

### Content Update
- **Brand Positioning Change**: Updated all instances of "Comprehensive insights into the global AI startup ecosystem" to "Lively insights into the global AI startup ecosystem"
- **Files Modified**: 
  - `src/components/layout/Header.tsx`: Updated hero section description
  - `src/components/charts/AnalyticsSidebar.tsx`: Updated market intelligence subtitle
  - `src/lib/statistics.ts`: Updated comment description
  - `docs/ai_market_watch_nextjs_development_spec.md`: Updated documentation metadata examples

### Impact
- More dynamic and engaging brand voice
- Consistent messaging across all user-facing content and documentation
- Better alignment with the platform's interactive and real-time nature

## 2024-12-28: Performance Optimization & Caching System

### Major Performance Improvements Implemented
- **Caching System**: Implemented comprehensive browser-based caching using localStorage with 24-hour TTL
  - Apps Script 데이터는 하루에 한번 업데이트되므로 24시간 캐시 적용
  - Automatic cache invalidation and fallback to stale data on API failures
  - Cache-aware UI indicators in header showing data freshness

- **Statistics Optimization**: Moved from client-side calculation to optimized memoized functions
  - Real funding amount parsing with K/M/B notation support
  - Memoized statistics calculation preventing redundant computations
  - Pre-computed filter metadata caching

- **Data Loading Strategy**: Enhanced API layer with smart caching and error handling
  - Force refresh capability for fresh data
  - Graceful degradation to cached data on API failures
  - Background statistics pre-computation

- **UI/UX Enhancements**: Added real-time cache status and refresh controls
  - Cache status indicators (Fresh Data vs Cached Data)
  - Manual refresh button with loading states
  - Last updated timestamp display

### Technical Implementation
- **Files Modified**: `src/lib/cache.ts`, `src/lib/statistics.ts`, `src/lib/api.ts`, `src/store/dashboardStore.ts`, `src/components/layout/Header.tsx`
- **New Dependencies**: `@tanstack/react-virtual` for future large dataset virtualization
- **Performance Impact**: Expected 3-5x faster loading on subsequent visits, reduced API calls

### Next Steps
- Monitor cache hit rates and user experience
- Consider implementing service worker for offline support
- Apps Script optimization for server-side statistics calculation

## 2024-12-28: CORS 문제 해결

### 문제 상황
- Google Apps Script와 localhost:3000 간 CORS 오류 발생
- 브라우저가 preflight OPTIONS 요청을 차단하여 데이터 로딩 실패

### 해결 방법 구현
- **Next.js API Route 프록시**: `/app/api/startups/route.ts` 생성
  - 클라이언트 → Next.js API → Google Apps Script 구조로 CORS 우회
  - 30초 타임아웃 및 상세 에러 처리 추가
  - 서버사이드 캐싱 헤더 설정 (1시간)

- **API 클라이언트 업데이트**: 직접 Apps Script 호출 대신 로컬 API 사용
  - 환경에 따른 동적 URL 생성
  - 개발 환경에서 CORS 관련 경고 메시지 추가

- **설정 가이드 생성**: `docs/GOOGLE_APPS_SCRIPT_SETUP.md`
  - Apps Script 설정 방법
  - 대안 해결책들 (브라우저 CORS 비활성화, Google Sheets API)
  - 프로덕션 환경 고려사항

### 기술적 영향
- CORS 문제 완전 해결
- 서버사이드 요청으로 더 안정적인 데이터 페칭
- 네트워크 요청 로깅 및 디버깅 개선

## 2024-12-28: 보안 강화 - 환경 변수 관리

### 보안 문제 해결
- **하드코딩된 Apps Script URL 제거**: 코드에서 실제 URL을 완전히 제거
- **환경 변수 필수화**: `APPS_SCRIPT_URL` 환경 변수 없으면 서버 시작 실패
- **문서 업데이트**: README, SETUP_GUIDE, Google Apps Script 가이드에 보안 주의사항 추가

### 구현 내용
- **강제 환경 변수 체크**: API Route에서 환경 변수 없으면 에러 발생
- **.gitignore 확인**: 환경 변수 파일들이 이미 Git에서 제외됨 확인
- **설정 가이드 개선**: 모든 문서에 보안 중요성 강조

### 보안 개선 효과
- GitHub 공개 시에도 민감한 정보 노출 방지
- 환경별 다른 설정 가능 (개발/스테이징/프로덕션)
- 설정 실수로 인한 보안 취약점 방지 