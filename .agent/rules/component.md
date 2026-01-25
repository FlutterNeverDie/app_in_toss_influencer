---
trigger: always_on
---

5. # React 컴포넌트 생성 규칙

## 파일 구조 및 명명 규칙

### 컴포넌트 파일 위치
- **위젯 (Widgets)**: 유저 인터랙션이나 데이터 로직을 포함하는 큰 단위는 `src/presentation/widgets/`에 위치합니다.
- **공통 컴포넌트 (Common)**: 재사용 가능한 작은 UI 조각은 `src/presentation/components/`에 위치합니다.

### 파일 명명 규칙
- 모든 컴포넌트 파일명은 파스칼 케이스(PascalCase)와 `w_` 또는 `c_` 접두사를 상황에 맞게 사용합니다. (예: `w_drawer_menu.tsx`, `w_registration_modal.tsx`)
- 파일 확장자는 TypeScript 컴포넌트 필수이므로 `.tsx`를 사용합니다.

## 컴포넌트 작성 패턴 (TDS v2 기반)

### TDS v2 서브 컴포넌트 구조 준수
토스 디자인 시스템 v2를 사용할 때는 반드시 공식 서브 컴포넌트 패턴을 따릅니다.
- **Top**: `Top.TitleParagraph`, `Top.RightButton`, `Top.UpperAssetContent` 등.
- **BottomSheet**: `BottomSheet.Header`, `BottomSheet.HeaderDescription` 등.
- **ListRow**: `ListRow.Texts` (type: `1RowTypeA`, `2RowTypeA` 등) 활용.

### 스타일링 규칙 (Tailwind CSS)
- **CSS 변수 사용**: 다크모드 대응을 위해 하드코딩된 색상 대신 CSS 변수를 사용합니다.
  - 텍스트: `var(--text-color)`
  - 배경: `var(--bg-color)`
  - 유리 질감: `.liquid-glass` 클래스 활용
- **TDS 컴포넌트 색상**: `color="var(--text-color)"`를 명시하여 테마 호환성을 확보합니다.

### 타입스크립트 사용
- 모든 Props는 인터페이스로 정의하며, `I` 접두사는 생략하거나 일관성 있게 사용합니다. (최근 프로젝트는 생략하는 추세)

## 기본 컴포넌트 템플릿 (TDS v2 예시)

```tsx
import React from 'react';
import { Top } from '@toss/tds-mobile';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

interface ComponentProps {
  title: string;
  onClose: () => void;
}

/**
 * 인플루언서 맵 표준 헤더 컴포넌트 예시
 */
const StandardHeader: React.FC<ComponentProps> = ({ title, onClose }) => {
  const handleClose = () => {
    if (typeof generateHapticFeedback === 'function') {
      generateHapticFeedback({ type: 'tickWeak' });
    }
    onClose();
  };

  return (
    <Top
      title={<Top.TitleParagraph color="var(--text-color)">{title}</Top.TitleParagraph>}
      right={
        <Top.RightButton onClick={handleClose}>
          닫기
        </Top.RightButton>
      }
    />
  );
};

export default StandardHeader;
```

## 접근성 및 성능 고려사항
- **Haptic Feedback**: 모든 유저 인터랙션에는 `triggerHaptic` 유틸리티를 적용합니다.
- **Dark Mode**: `index.css`에 정의된 테마 변수들이 컴포넌트 내부에서 올바르게 적용되는지 상시 확인합니다.