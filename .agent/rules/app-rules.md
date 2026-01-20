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
  - 인스타그램 ID 마스킹 및 광고 시청 후 리다이렉션 수익 모델
- **현재 단계:** MVP 초기 개발 (프로젝트 세팅 및 코어 UI 골격 완성)

## 2. 기술 스택 (Tech Stack)
- **Core:** React (Vite), TypeScript
- **State Management:** Zustand (Riverpod 대체)
- **Styling:** Tailwind CSS **v3.4.17** (v4.0 사용 금지 - 설정 충돌 방지)
- **Routing:** React Router Dom
- **Build Tool:** Vite (Node.js v20 LTS 권장)

## 3. 앱인토스(App-in-Toss) 환경 특이사항
이 서비스는 모바일 브라우저가 아닌 **토스 앱 내부**에서 실행됩니다. 다음 사항을 준수해야 합니다.
1.  **Mobile First:** PC 뷰는 고려하지 않습니다. 모든 UI는 모바일 터치 환경에 최적화되어야 합니다.
2.  **Navigation:** 브라우저 뒤로가기가 아닌, 앱 내 네비게이션 동작을 고려해야 합니다.
3.  **Safe Area:** 아이폰 노치(Notch) 및 하단 홈 바(Home Indicator) 영역을 침범하지 않도록 `padding` 처리가 필요합니다.
4.  **Toss Bridge:** 향후 토스 앱의 기능(결제, 인증 등) 호출 시 토스 브릿지 인터페이스 연동이 필요합니다.

## 4. 데이터 및 지역 구분 규칙 (Strict Rules)
지역 데이터는 `src/data/constants/regions.ts`에 정의되어 있으며, 다음 **3가지 그룹** 규칙을 절대적으로 따릅니다.
- **Group A (광역시):** `구/군` 단위로 쪼갬 (예: 부산 -> 해운대구, 기장군)
- **Group B (8도):** `시/군` 단위로 통합 (예: 경기도 성남시 - 분당구/수정구 구분 안 함)
- **Group C (예외):** 세종(단일), 제주(제주시/서귀포시 2개)

## 5. 설치 및 실행 가이드
```bash
# 1. 의존성 설치 (반드시 Tailwind v3 확인)
npm install

# 2. 로컬 서버 실행
npm run dev