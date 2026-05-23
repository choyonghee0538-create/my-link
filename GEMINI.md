# GEMINI.md - My Link 프로젝트 가이드

이 파일은 My Link 프로젝트의 개발 및 유지보수를 위한 핵심 지침과 프로젝트 정보를 담고 있습니다.

## 1. 프로젝트 개요
**My Link**는 사용자가 자신만의 멀티 링크 페이지를 구축하고 관리할 수 있는 링크트리 클론 서비스입니다. 사용자는 하나의 프로필 페이지에 다양한 소셜 미디어 및 웹사이트 링크를 통합하여 방문자에게 제공할 수 있습니다.

### 핵심 기술 스택
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI 기반)
- **Icons**: Lucide React
- **Runtime**: Node.js (package.json 기반)

---

## 2. 프로젝트 구조 및 UI/UX 설계
### 디렉토리 구조
```text
C:\Users\USER\OneDrive\바탕 화면\my_link\
├── app\               # Next.js App Router (페이지 및 레이아웃)
├── components\        # 재사용 가능한 UI 컴포넌트 (shadcn/ui 포함)
├── docs\              # 서비스 기획 및 요구사항 문서 (PRD, Scenarios, Wireframe)
├── hooks\             # 커스텀 React Hooks
├── lib\               # 공통 유틸리티 및 함수 (utils.ts 등)
├── public\            # 정적 에셋 (이미지, 파비콘 등)
└── config files       # package.json, tsconfig.json, next.config.mjs 등
```

### UI/UX 설계 원칙 (Wireframe 기반)
1. **관리자 대시보드 (Admin Dashboard)**:
   - **2분할 레이아웃**: 좌측(설정 및 편집 패널) + 우측(고정형 실시간 모바일 프리뷰).
   - **인터랙티브 요소**: 링크 블록 드래그 앤 드롭 정렬, 노출 ON/OFF 토글, 실시간 데이터 동기화 프리뷰.
2. **퍼블릭 랜딩 페이지 (Public Page)**:
   - **모바일 퍼스트**: 모든 화면 크기(특히 스마트폰)에 최적화된 반응형 레이아웃.
   - **구성 요소**: 아바타(원형), 프로필명(중앙 정렬), 소개글, 터치 최적화 링크 버튼 블록.
   - **애니메이션**: 버튼 호버/액티브 시 미세한 크기 변형 및 투명도 변화 적용.

---

## 3. 주요 명령어
- **개발 서버 실행**: `npm run dev` (Turbopack 사용)
- **프로젝트 빌드**: `npm run build`
- **프로덕션 실행**: `npm run start`
- **린트 체크**: `npm run lint`
- **코드 포맷팅**: `npm run format` (Prettier)
- **타입 체크**: `npm run typecheck`

---

## 4. 개발 컨벤션 및 지침
### 컴포넌트 추가
- 새로운 UI 컴포넌트가 필요한 경우 `shadcn/ui`를 우선적으로 사용합니다.
- 명령어: `npx shadcn@latest add [component-name]`

### 스타일링
- Tailwind CSS v4를 사용하여 스타일을 작성합니다.
- 복잡한 조건부 클래스는 `lib/utils.ts`의 `cn` 함수를 사용하여 처리합니다.

### 문서 관리
- 프로젝트의 기능적 변경 사항이나 요구사항은 `docs/` 폴더 내의 관련 문서를 먼저 업데이트하거나 참조합니다.
- `PRD.md`: 제품 요구사항 정의서
- `scenarios.md`: 사용자 시나리오
- `wireframe.md`: UI 와이어프레임 및 목업 정보

### 폰트 및 테마
- `Geist` 및 `Geist Mono` 폰트를 사용하며, `next-themes`를 통한 테마 관리가 설정되어 있습니다.

---

## 5. 핵심 기능 구현 현황 (Phase 1 기준)
- [x] 프로젝트 초기 환경 설정 (Next.js + Tailwind + shadcn/ui)
- [ ] 사용자 인증 (Auth)
- [ ] 프로필 관리 (Profile)
- [ ] 링크 블록 관리 (Link Builder)
- [x] 퍼블릭 랜딩 페이지 (Public Page)
