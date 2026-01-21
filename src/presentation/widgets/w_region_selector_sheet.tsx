import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';

/**
 * 지역 선택 바텀 시트 (Advanced Premium Version)
 * 사용자 요구사항 반영: 드래그 핸들링, 검색 UI 최적화, 내비게이션 추가
 */
export const RegionSelectorSheet = () => {
  const {
    isSheetOpen,
    selectedProvince,
    selectedDistrict,
    closeSheet,
    selectProvince,
    selectDistrict
  } = useRegionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLUListElement>(null);

  // 시트가 열릴 때 상태 초기화 및 스크롤 동기화
  useEffect(() => {
    if (isSheetOpen) {
      setSearchQuery('');
      setIsSearching(false);

      // 약간의 지연 후 선택된 지역으로 스크롤 (애니메이션 완료 시점 고려)
      setTimeout(() => {
        if (sidebarRef.current) {
          const activeItem = sidebarRef.current.querySelector('[data-selected="true"]');
          if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 300);
    }
  }, [isSheetOpen]);

  // 지역 선택이 바뀔 때도 스크롤 동기화
  useEffect(() => {
    if (isSheetOpen && sidebarRef.current) {
      const activeItem = sidebarRef.current.querySelector('[data-selected="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedProvince, isSheetOpen]);

  // 전체 지역 데이터 플랫하게 변환 (검색 효율성을 위해)
  const allDistricts = useMemo(() => {
    const list: { provinceId: string; districtId: string; name: string; provinceName: string }[] = [];
    Object.keys(REGION_DATA).forEach((provKey) => {
      REGION_DATA[provKey].forEach((dist) => {
        list.push({
          provinceId: provKey,
          districtId: dist.id,
          name: dist.name,
          provinceName: PROVINCE_DISPLAY_NAMES[provKey]
        });
      });
    });
    return list;
  }, []);

  // 검색 결과 필터링
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allDistricts.filter((dist) =>
      dist.name.includes(searchQuery) || dist.provinceName.includes(searchQuery)
    );
  }, [searchQuery, allDistricts]);

  // 검색 결과 클릭 핸들러
  const handleSearchResultClick = (provinceId: string, districtId: string) => {
    selectProvince(provinceId);
    selectDistrict(districtId);
    setSearchQuery('');
    setIsSearching(false);
  };

  // 드래그 종료 시 닫기 로직
  const onDragEnd = (_: any, info: any) => {
    if (info.offset.y > 150) {
      closeSheet();
    }
  };

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          {/* 배경 (Dimmed) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSheet}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
          />

          {/* 시트 본체 */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            className="fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-[32px] flex flex-col shadow-2xl h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 시트 핸들 (Toss Style) */}
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 bg-[#E5E8EB] rounded-full" />
            </div>

            {/* 헤더 섹션 */}
            <div className="flex items-center px-6 py-4 min-h-[72px]">
              {(searchQuery || isSearching) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                  }}
                  className="mr-3 p-2 -ml-2 hover:bg-[#F2F4F6] rounded-full transition-colors"
                >
                  <ArrowLeft size={24} className="text-[#191F28]" />
                </button>
              )}

              <h3 className="text-[20px] font-bold text-[#191F28] flex-1">
                {searchQuery || isSearching ? '지역 검색' : '어디로 갈까요?'}
              </h3>

              <button
                onClick={closeSheet}
                className="w-10 h-10 flex items-center justify-center bg-[#F2F4F6] hover:bg-[#E5E8EB] rounded-full transition-colors"
              >
                <X size={20} className="text-[#4E5968]" />
              </button>
            </div>

            {/* 검색창 */}
            <div className="px-6 pb-2">
              <div className="flex items-center gap-2 bg-[#F2F4F6] px-4 py-3.5 rounded-[16px] focus-within:ring-2 focus-within:ring-[#3182F6] focus-within:bg-white transition-all shadow-sm">
                <SearchIcon size={20} className="text-[#8B95A1]" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearching(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="지역 이름을 검색해보세요"
                  className="bg-transparent border-none outline-none text-[16px] w-full placeholder:text-[#ADB5BD] text-[#191F28] font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-[#E5E8EB] rounded-full transition-colors"
                  >
                    <X size={18} className="text-[#8B95A1] bg-[#E5E8EB] rounded-full p-0.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 컨텐츠 영역 (높이 고정) */}
            <div className="flex flex-1 overflow-hidden">
              {(searchQuery || isSearching) ? (
                /* 검색 결과 레이아웃 */
                <div className="flex-1 overflow-y-auto px-5 py-3 bg-[#F9FAFB]">
                  {searchResults.length > 0 ? (
                    <ul className="space-y-3 pb-10">
                      {searchResults.map((result) => (
                        <motion.li
                          key={`${result.provinceId}-${result.districtId}`}
                          onClick={() => handleSearchResultClick(result.provinceId, result.districtId)}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-between px-6 py-4 bg-white rounded-[24px] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F2F4F6] transition-all active:bg-[#F2F4F6]"
                        >
                          <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-[#191F28]">
                              {result.name}
                            </span>
                            <span className="text-[13px] text-[#8B95A1] mt-0.5">
                              {result.provinceName}
                            </span>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  ) : searchQuery ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#8B95A1] pb-20">
                      <div className="bg-[#F2F4F6] p-4 rounded-full mb-4">
                        <SearchIcon size={32} />
                      </div>
                      <span className="text-[15px] font-medium">검색 결과가 없어요</span>
                    </div>
                  ) : (
                    /* 최근 검색어 또는 가이드 표시 가능 영역 */
                    <div className="p-6 text-[#8B95A1] text-sm">
                      검색어를 입력하여 지역을 빠르게 찾아보세요.
                    </div>
                  )}
                </div>
              ) : (
                /* 기본 2-Depth 레이아웃 */
                <>
                  {/* 왼쪽: 광역 리스트 */}
                  <ul
                    ref={sidebarRef}
                    className="w-[125px] bg-[#F9FAFB] overflow-y-auto scrollbar-hide py-2 border-r border-[#E5E8EB]"
                  >
                    {Object.keys(REGION_DATA).map((provKey) => {
                      const isSelected = selectedProvince === provKey;
                      const displayName = PROVINCE_DISPLAY_NAMES[provKey];

                      return (
                        <li
                          key={provKey}
                          data-selected={isSelected}
                          onClick={() => selectProvince(provKey)}
                          className={`
                            relative px-6 py-6 text-[16px] cursor-pointer transition-all
                            ${isSelected
                              ? 'bg-white text-[#3182F6] font-bold'
                              : 'text-[#8B95A1] hover:text-[#4E5968]'}
                          `}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="activeProvinceIndicator"
                              className="absolute left-0 inset-y-0 w-1.5 bg-[#3182F6] rounded-r-full"
                            />
                          )}
                          <span className="truncate">
                            {displayName.replace('특별자치도', '').replace('특별시', '').replace('광역시', '').replace('특별자치시', '')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* 오른쪽: 기초 리스트 */}
                  <div className="flex-1 overflow-y-auto bg-white px-5 py-2">
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-4 mb-3">
                      <span className="text-[14px] text-[#4E5968] font-bold px-1 tracking-tight">
                        {PROVINCE_DISPLAY_NAMES[selectedProvince]}
                      </span>
                    </div>

                    <ul className="space-y-0 pb-10">
                      {REGION_DATA[selectedProvince]?.map((dist) => {
                        const isSelected = selectedDistrict === dist.id;
                        return (
                          <motion.li
                            key={dist.id}
                            onClick={() => selectDistrict(dist.id)}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              flex items-center justify-between px-6 py-6 cursor-pointer transition-all
                              ${isSelected
                                ? 'text-[#3182F6]'
                                : 'text-[#333D4B] border-b border-[#F2F4F6] active:bg-[#F2F4F6]'}
                            `}
                          >
                            <span className={`text-[17px] ${isSelected ? 'font-bold' : 'font-medium'}`}>
                              {dist.name}
                            </span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                              >
                                <Check size={20} strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 shrink-0 bg-white" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
