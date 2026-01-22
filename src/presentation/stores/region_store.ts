import { create } from 'zustand';

// 1. 상태(State) 정의
interface RegionState {
  isSheetOpen: boolean;          // 바텀 시트 열림 여부
  isDrawerOpen: boolean;         // 사이드바 메뉴 열림 여부
  isRegistrationModalOpen: boolean; // 인플루언서 등록 모달 열림 여부
  selectedProvince: string | null;      // 광역 (예: 'seoul', 'gyeonggi')
  selectedDistrict: string | null; // 기초 (예: 'gangnam', 'bundang')
}

// 2. 액션(Action) 정의
interface RegionActions {
  openSheet: () => void;
  closeSheet: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openRegistrationModal: () => void;
  closeRegistrationModal: () => void;
  selectProvince: (province: string | null) => void;
  selectDistrict: (district: string | null) => void;
}

// 3. 스토어 생성
export const useRegionStore = create<RegionState & RegionActions>((set) => ({
  // ... (초기값)
  isSheetOpen: false,
  isDrawerOpen: false,
  isRegistrationModalOpen: false,
  selectedProvince: null,
  selectedDistrict: null,

  // 액션 구현
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  openRegistrationModal: () => set({ isRegistrationModalOpen: true, isDrawerOpen: false }), // 모달 열면 드로어는 닫음
  closeRegistrationModal: () => set({ isRegistrationModalOpen: false }),

  selectProvince: (province) => set({
    selectedProvince: province,
    selectedDistrict: null, // 광역 바뀌면 기초 초기화
  }),

  selectDistrict: (district) => set({
    selectedDistrict: district,
    isSheetOpen: false
  }),
}));
