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
- **Build Tool:** Vite (Node.js v20 LTS 권장)
- **Database:** Supabase (Real-time data fetching)

## 3. 앱인토스(App-in-Toss) 환경 특이사항
이 서비스는 토스 앱 내부에서 실행되는 미니앱입니다.
1.  **Mobile First:** 모든 UI는 모바일 터치 환경에 최적화(TDS UI 스타일 준수).
2.  **Toss Bridge Integration**: 
    - `appLogin`: 계정 연동 및 본인 인증
    - `share`: 친구 초대 및 바이럴 기능
    - `generateHapticFeedback`: 주요 인터랙션(클릭, 스크롤 등)에 따른 물리적 피드백 제공
    - `SafeAreaInsets`: 기기별 노치 및 하단 바 영역 대응
    - `openURL`: 외부 인스타그램 링크 연동 시 사용

## 4. 데이터 및 지역 구분 규칙 (Strict Rules)
지역 데이터는 `src/data/constants/regions.ts`에 정의되어 있으며, 다음 **3가지 그룹** 규칙을 절대적으로 따릅니다.
- **Group A (광역시):** `구/군` 단위로 쪼갬 (예: 부산 -> 해운대구, 기장군)
- **Group B (8도):** `시/군` 단위로 통합 (예: 경기도 성남시 - 분당구/수정구 구분 안 함)
- **Group C (예외):** 세종(단일), 제주(제주시/서귀포시 2개)

## 5. UI/UX 디자인 규칙 (Design System)
- **Radius**: 주요 버튼 및 카드의 곡률은 `24px` 또는 `rounded-full`을 사용합니다.
- **Detailed View**: 상세 지역(자치구) 진입 시, 대분류 도시 이름과 상단 헤더를 숨겨 상세 리스트에 집중하도록 합니다.
- **Haptics**: 모든 클릭 가능한 요소에는 `triggerHaptic`을 적용하여 반응성을 높입니다.

## 6. 설치 및 실행 가이드
```bash
# 1. 의존성 설치
npm install

# 2. 로컬 서버 실행
npm run dev
```