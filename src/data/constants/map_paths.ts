/**
 * 지도 디자인 가이드 및 상수
 * 토스/배민 스타일의 미니멀한 디자인 적용
 */
export const MAP_COLORS = {
    bg: '#F2F4F6', // 토스 배경 그레이
    border: '#D1D5DB', // 경계선
    fill: '#FFFFFF', // 기본 구역 색상
    hover: '#E5E8EB', // 호버 시 색상
    selected: '#3182F6', // 토스 블루 (선택 시)
    text: '#4E5968', // 기본 텍스트
    selectedText: '#FFFFFF', // 선택 시 텍스트
};

/**
 * 전국 지도 SVG 데이터 (간소화 버전)
 * 실무에서는 상세 SVG Path를 사용하지만, 여기서는 프리머엄한 느낌을 위해 
 * 각 지역을 세련된 라운드 사각형 또는 커스텀 패스로 정의할 예정입니다.
 */
export const KOREA_MAP_PATHS = {
    seoul: "M...Z",
    busan: "M...Z",
    // ... 나머지 지역들
};
