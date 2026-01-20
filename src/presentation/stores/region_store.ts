import { create } from 'zustand';

// 1. 상태(State) 정의
interface RegionState {
  isSheetOpen: boolean;          // 바텀 시트 열림 여부
  selectedProvince: string;      // 광역 (예: 'seoul', 'gyeonggi')
  selectedDistrict: string | null; // 기초 (예: 'gangnam', 'bundang')
}

// 2. 액션(Action) 정의
interface RegionActions {
  openSheet: () => void;
  closeSheet: () => void;
  selectProvince: (province: string) => void;
  selectDistrict: (district: string) => void;
}

// 3. 스토어 생성
export const useRegionStore = create<RegionState & RegionActions>((set) => ({
  // 초기값: 서울 강남구를 기본으로 잡거나, 아예 선택 안 된 상태로 시작
  isSheetOpen: false,
  selectedProvince: 'seoul',
  selectedDistrict: null,

  // 액션 구현
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),

  selectProvince: (province) => set({
    selectedProvince: province,
    selectedDistrict: null, // 광역 바뀌면 기초 초기화
    isSheetOpen: true // 지도에서 광역 누르면 바로 시트 열리게
  }),

  selectDistrict: (district) => set({
    selectedDistrict: district,
    isSheetOpen: false // 구 선택 완료 시 시트 닫기
  }),
}));
