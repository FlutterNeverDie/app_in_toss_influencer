import { create } from 'zustand';

// 1. 상태(State) 정의
interface RegionState {
  isSheetOpen: boolean;          // 바텀 시트 열림 여부
  isDrawerOpen: boolean;         // 사이드바 메뉴 열림 여부
  selectedProvince: string | null;      // 광역 (예: 'seoul', 'gyeonggi')
  selectedDistrict: string | null; // 기초 (예: 'gangnam', 'bundang')
}

// 2. 액션(Action) 정의
interface RegionActions {
  openSheet: () => void;
  closeSheet: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  selectProvince: (province: string | null) => void;
  selectDistrict: (district: string) => void;
}

// 3. 스토어 생성
export const useRegionStore = create<RegionState & RegionActions>((set) => ({
  // 초기값: 선택 안 된 상태로 시작
  isSheetOpen: false,
  isDrawerOpen: false,
  selectedProvince: null,
  selectedDistrict: null,

  // 액션 구현
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  selectProvince: (province) => set({
    selectedProvince: province,
    selectedDistrict: null, // 광역 바뀌면 기초 초기화
    // isSheetOpen: true  <-- 삭제: 이제 그리드 뷰가 대신 뜨므로 시트 자동 오픈 안함
  }),

  selectDistrict: (district) => set({
    selectedDistrict: district,
    isSheetOpen: false // 구 선택 완료 시 시트 닫기 (이건 유지 or 삭제? 메인화면 리스트 확장을 위해 false 유지)
  }),
}));
