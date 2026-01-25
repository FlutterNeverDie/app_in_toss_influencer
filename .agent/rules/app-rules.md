---
trigger: always_on
---

# [인수인계] 인플루언서 맵 (Influencer Map)

## 1. 서비스 개요
- **서비스명:** 인플루언서 맵 (Influencer Map)
- **배포 환경:** 토스 앱 내 웹뷰 (App-in-Toss)
- **핵심 기능:**
  - 행정구역(시/군/구) 기반 인플루언서 랭킹 서비스
  - 지도 선택 → 바텀 시트(Bottom Sheet) → 리스트 확인의 2-Depth 구조
 

## 2. 기술 스택 (Tech Stack)
- **Core:** React 18+ (Vite), TypeScript
- **State Management:** Zustand (Region 상태 및 Auth/Like 상태 관리)
- **Styling:** Tailwind CSS **v3.4.17** (v4.0 사용 금지)
- **Routing:** React Router Dom
- **Build Tool:** Vite (**Node.js v20 LTS 필수**) - *Granite 및 빌드 도구 호환성용*
- **App Library:** React 18 (**--legacy-peer-deps** 필수) - *TDS 라이브러리 연동용*
- **Database:** Supabase (Real-time data fetching)

## 3. 앱인토스(App-in-Toss) 환경 및 개발 도구
이 서비스는 토스 앱 내부에서 실행되는 미니앱입니다.
1.  **Node.js 버전**: 반드시 **v20 LTS**를 사용해야 합니다. (v24+ 버전은 Granite 도구와 호환되지 않음)
    - *참고: 개발을 하는 '컴퓨터'의 환경입니다.*
2.  **React 버전**: 현재 **v18**을 사용 중입니다. 토스 라이브러리와의 의존성 충돌 방지를 위해 반드시 `npm install --legacy-peer-deps`로 설치해야 합니다.
    - *참고: 실제 '앱(코드)'이 작동하는 라이브러리 버전입니다.*
3.  **Granite Sandbox**: `npm run toss` 실행 시 포트는 **8081**을 사용하며, `granite.config.ts`의 host IP를 현재 기기 IP와 일치시켜야 합니다.
3.  **Toss Bridge Integration**: 
    - `appLogin`, `share`, `generateHapticFeedback`, `SafeAreaInsets`, `openURL` 등을 활용합니다.

## 4. 데이터 및 지역 구분 규칙 (Strict Rules)
1. **지역 데이터**: `src/data/constants/regions.ts` 정의 준수.
2. **Supabase 쿼리**: 기초 자치단체(`district_id`)가 중복될 수 있으므로, 반드시 광역 자치단체(`province_id`)와 함께 쿼리해야 합니다.

## 5. 이미지 및 좋아요 처리 규칙 (Data Logic)
1. **이미지 처리**: Supabase Storage(`profiles` 버킷)을 사용하며, 모든 이미지는 `WebP` 형식으로 저장합니다.
2. **Instagram ID**: 보안을 위해 `maskInstagramId` 유틸리티를 사용하여 마스킹 노출하며, 클릭 시 `openURL` 브릿지를 통해 외부 연결합니다.
3. **좋아요/추천**: `appLogin` 인증된 사용자만 가능하며, `auth_store`를 통해 클라이언트 상태를 관리하고 DB에 반영합니다.

## 6. UI/UX 디자인 규칙 (TDS v2 준수)
- **표준 헤더**: 모든 페이지와 모달은 `Top` 컴포넌트(`Top.TitleParagraph`, `Top.RightButton`)를 사용하여 표준화합니다.
- **버텀 시트**: `BottomSheet.Header` 서브 컴포넌트를 사용하여 시트 헤더를 구성합니다.
- **다크모드**: 모든 텍스트는 `var(--text-color)`를 사용하여 다크모드 시인성을 확보합니다. 하드코딩된 `grey900` 등은 지양합니다.
- **Radius**: 주요 버튼 및 카드의 곡률은 `24px` 또는 `rounded-full`을 사용합니다.
- **Haptics**: 모든 클릭 인터랙션에는 `triggerHaptic`을 적용합니다.

## 7. 설치 및 실행 가이드
```bash
# 1. 의존성 설치 (Node v20 권장)
# React 18과 기존 TDS 라이브러리 간의 Peer Dependency 충돌 방지를 위해 --legacy-peer-deps 사용
npm install --legacy-peer-deps

# 2. 로컬 서버 실행
npm run dev

# 3. 토스 샌드박스 테스트 (8081 포트)
npm run toss
```