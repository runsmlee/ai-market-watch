# Google Apps Script CORS 설정 가이드

## 문제 상황
브라우저에서 Google Apps Script로 직접 요청을 보낼 때 CORS (Cross-Origin Resource Sharing) 오류가 발생합니다.

## 해결 방법

### 1. Apps Script 코드 수정
Apps Script 파일에 다음 코드를 추가하세요:

```javascript
function doGet(e) {
  // CORS 헤더 설정
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    // 기존 로직 실행
    const result = getStartupData(e.parameter);
    
    return output.setContent(JSON.stringify({
      success: true,
      data: result,
      lastUpdated: new Date().toISOString()
    }));
    
  } catch (error) {
    return output.setContent(JSON.stringify({
      error: true,
      message: error.toString(),
      timestamp: new Date().toISOString()
    }));
  }
}

// CORS 처리를 위한 OPTIONS 메서드 핸들러
function doOptions(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.TEXT);
  
  // CORS 헤더 설정 (하지만 Apps Script에서는 실제로 효과가 제한적)
  return output;
}
```

### 2. 웹 앱 배포 설정
1. Apps Script 편집기에서 **배포 > 새 배포** 클릭
2. **유형** 선택: 웹 앱
3. **액세스 권한**:
   - 실행 대상: 본인
   - 액세스 권한: **모든 사용자**
4. **배포** 클릭

### 3. 현재 프로젝트의 해결책

#### Option A: API Proxy 사용 (권장)
현재 프로젝트에서는 Next.js API Route를 프록시로 사용합니다:
- 클라이언트 → Next.js API (`/api/startups`) → Google Apps Script
- CORS 문제 완전 해결

#### Option B: 개발 시 브라우저 CORS 비활성화
**주의: 보안상 개발 용도로만 사용**

Chrome을 CORS 비활성화 모드로 실행:
```bash
# Windows
chrome.exe --user-data-dir=/tmp/chrome_dev_session --disable-web-security --disable-features=VizDisplayCompositor

# macOS
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_session" --disable-web-security

# Linux
google-chrome --user-data-dir="/tmp/chrome_dev_session" --disable-web-security
```

### 4. 프로덕션 환경
프로덕션에서는 다음 중 하나를 선택:

1. **Next.js API Route 유지** (현재 구현됨)
   - 장점: 완전한 CORS 해결, 서버사이드 캐싱 가능
   - 단점: 추가 서버 요청

2. **Google Apps Script Library 사용**
   - Apps Script를 라이브러리로 만들어서 다른 Apps Script에서 호출
   - 같은 도메인 내에서 동작

3. **Google Sheets API 직접 사용**
   - Google Sheets API v4 사용
   - API 키 또는 OAuth 2.0 인증 필요

## 현재 상태
- ✅ Next.js API Route 프록시 구현됨
- ✅ 개발/프로덕션 환경 자동 감지
- ✅ 캐싱 및 오류 처리 구현
- ✅ 폴백 데이터 메커니즘 구현
- ✅ 환경 변수를 통한 보안 관리 구현

## 필수 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하세요:

```env
# Google Apps Script Configuration (REQUIRED)
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec

# Optional: API Base URL  
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

⚠️ **보안 중요사항**:
- 실제 Script ID로 교체 필요
- `.env.local` 파일은 Git에 커밋되지 않음 (.gitignore에 포함됨)
- 절대 코드에 실제 URL을 하드코딩하지 마세요

## 테스트 방법
1. 개발 서버 시작: `npm run dev`
2. 브라우저에서 `http://localhost:3000` 접속
3. 네트워크 탭에서 `/api/startups` 요청 확인
4. 콘솔에서 "Proxying request to Apps Script" 메시지 확인 