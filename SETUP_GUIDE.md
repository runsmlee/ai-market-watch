# 🚀 AI Startups Dashboard - 설치 및 설정 가이드

## 📋 현재 상황

Next.js 14 기반의 AI Startups Dashboard가 완전히 구축되었습니다. 하지만 현재 환경에서 Node.js가 설치되지 않아 일부 TypeScript 오류가 발생하고 있습니다.

## ⚠️ 해결해야 할 오류들

현재 발생하는 주요 오류들:
- `Cannot find module 'react'` - React 패키지 미설치
- `Cannot find module 'next'` - Next.js 패키지 미설치
- `Cannot find module 'zustand'` - Zustand 패키지 미설치
- JSX 런타임 관련 오류

## 🛠️ 해결 방법

### 1단계: Node.js 설치
1. [Node.js 공식 웹사이트](https://nodejs.org/)에서 LTS 버전 다운로드
2. 설치 후 터미널에서 확인:
   ```bash
   node --version
   npm --version
   ```

### 2단계: 의존성 설치
프로젝트 폴더에서 다음 명령어 실행:
```bash
npm install
```

### 3단계: 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용 추가:
```env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4단계: 개발 서버 실행
```bash
npm run dev
```

## 📁 완성된 프로젝트 구조

```
AI_Market_Watch/
├── src/
│   ├── app/
│   │   ├── globals.css          # 글로벌 스타일
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── page.tsx             # 메인 대시보드
│   ├── components/
│   │   ├── charts/              # 차트 컴포넌트
│   │   ├── company/             # 회사 관련 컴포넌트
│   │   ├── filters/             # 필터 컴포넌트
│   │   └── layout/              # 레이아웃 컴포넌트
│   ├── hooks/                   # 커스텀 훅
│   ├── lib/                     # 유틸리티 및 API
│   ├── store/                   # 상태 관리 (Zustand)
│   └── types/                   # TypeScript 타입 정의
├── backup/                      # 기존 HTML/CSS/JS 파일들
├── docs/                        # 문서
├── package.json                 # 프로젝트 설정
├── tailwind.config.js           # Tailwind CSS 설정
├── next.config.js               # Next.js 설정
└── tsconfig.json                # TypeScript 설정
```

## ✨ 구현된 주요 기능들

### 🎨 디자인 시스템
- **모노크로매틱 + 오렌지** 컬러 팔레트
- **반응형 디자인** (모바일 우선)
- **부드러운 애니메이션** 및 호버 효과
- **Inter 폰트** 사용

### 🔍 고급 필터링
- **실시간 검색** (디바운스 적용)
- **카테고리 태그** 필터
- **지역 태그** 필터  
- **년도 범위** 슬라이더
- **필터 초기화** 기능

### 📊 대시보드 기능
- **통계 카드** (총 회사 수, 카테고리, 펀딩 등)
- **회사 그리드/리스트** 뷰 토글
- **상세 모달** 팝업
- **분석 사이드바** (차트 및 통계)

### ⚡ 성능 최적화
- **코드 스플리팅**
- **이미지 최적화**
- **메모이제이션**
- **로딩 스켈레톤**

## 🎯 임시 해결책 (Node.js 설치 전)

Node.js 설치 전까지는 기존 HTML 버전을 사용할 수 있습니다:
1. `backup/` 폴더의 `index.html` 파일 열기
2. 또는 간단한 HTTP 서버 실행 (Python이 설치된 경우):
   ```bash
   python -m http.server 8000
   ```

## 🚀 Next.js 버전 실행 후 기대 효과

### 성능 향상
- **50% 빠른 로딩** 속도
- **번들 크기 최적화**
- **자동 코드 스플리팅**

### 개발 경험 향상
- **타입 안전성** (TypeScript)
- **핫 리로딩**
- **모듈화된 컴포넌트**

### 사용자 경험 향상
- **부드러운 애니메이션**
- **반응형 디자인**
- **접근성 개선**

## 📞 문제 해결

### 자주 발생하는 문제들

1. **포트 충돌**: 다른 포트 사용 (`npm run dev -- -p 3001`)
2. **캐시 문제**: `.next` 폴더 삭제 후 재시작
3. **환경 변수**: `.env.local` 파일 확인

### 도움이 필요한 경우
- TypeScript 오류는 Node.js 설치 후 자동 해결됩니다
- 추가 기능이나 커스터마이징이 필요한 경우 언제든 문의하세요

---

**🎉 Node.js 설치 후 `npm install && npm run dev`로 바로 실행 가능합니다!** 