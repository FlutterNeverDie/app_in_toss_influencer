import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Search as SearchIcon } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';

/**
 * 지역 선택 바텀 시트 (Premium Version)
 * 토스 앱 스타일의 디자인과 부드러운 애니메이션을 적용했습니다.
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

  // 검색어 상태 관리
  const [searchQuery, setSearchQuery] = useState('');

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
    setSearchQuery(''); // 검색어 초기화
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
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-[24px] flex flex-col shadow-2xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 시트 핸들 (Toss Style) */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1.5 bg-[#E5E8EB] rounded-full" />
            </div>

            {/* 헤더 */}
            <div className="flex justify-between items-center px-6 py-4">
              <h3 className="text-[20px] font-bold text-[#191F28]">
                어디로 갈까요?
              </h3>
              <button
                onClick={closeSheet}
                className="w-10 h-10 flex items-center justify-center bg-[#F2F4F6] hover:bg-[#E5E8EB] rounded-full transition-colors"
              >
                <X size={20} className="text-[#4E5968]" />
              </button>
            </div>

            {/* 검색창 */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 bg-[#F2F4F6] px-4 py-3 rounded-[12px] focus-within:ring-2 focus-within:ring-[#3182F6] transition-all">
                <SearchIcon size={18} className="text-[#8B95A1]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="지역 이름을 검색해보세요 (예: 강남구, 부산)"
                  className="bg-transparent border-none outline-none text-[15px] w-full placeholder:text-[#ADB5BD] text-[#191F28]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X size={16} className="text-[#8B95A1] bg-[#E5E8EB] rounded-full p-0.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="flex flex-1 overflow-hidden h-[50vh]">
              {searchQuery ? (
                /* 검색 결과 레이아웃 */
                <div className="flex-1 overflow-y-auto px-4 py-2">
                  {searchResults.length > 0 ? (
                    <ul className="space-y-1">
                      {searchResults.map((result) => (
                        <li
                          key={`${result.provinceId}-${result.districtId}`}
                          onClick={() => handleSearchResultClick(result.provinceId, result.districtId)}
                          className="flex items-center justify-between px-4 py-4 rounded-[16px] cursor-pointer hover:bg-[#F2F4F6] transition-all"
                        >
                          <div className="flex flex-col">
                            <span className="text-[16px] font-semibold text-[#3182F6]">
                              {result.name}
                            </span>
                            <span className="text-[12px] text-[#8B95A1]">
                              {result.provinceName}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-[#8B95A1]">
                      <span className="text-[15px]">검색 결과가 없습니다</span>
                    </div>
                  )}
                </div>
              ) : (
                /* 기본 2-Depth 레이아웃 */
                <>
                  {/* 왼쪽: 광역 리스트 */}
                  <ul className="w-[120px] bg-[#F9FAFB] overflow-y-auto scrollbar-hide py-2">
                    {Object.keys(REGION_DATA).map((provKey) => {
                      const isSelected = selectedProvince === provKey;
                      const displayName = PROVINCE_DISPLAY_NAMES[provKey];

                      return (
                        <li
                          key={provKey}
                          onClick={() => selectProvince(provKey)}
                          className={`
                            relative px-5 py-4 text-[15px] cursor-pointer transition-all
                            ${isSelected
                              ? 'bg-white text-[#3182F6] font-bold'
                              : 'text-[#8B95A1] hover:text-[#4E5968]'}
                          `}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="activeProvince"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#3182F6] rounded-r-full"
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
                  <div className="flex-1 overflow-y-auto bg-white px-4 py-2">
                    <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2 mb-2">
                      <span className="text-[13px] text-[#8B95A1] font-semibold">
                        {PROVINCE_DISPLAY_NAMES[selectedProvince]}
                      </span>
                    </div>

                    <ul className="space-y-1">
                      {REGION_DATA[selectedProvince]?.map((dist) => {
                        const isSelected = selectedDistrict === dist.id;
                        return (
                          <li
                            key={dist.id}
                            onClick={() => selectDistrict(dist.id)}
                            className={`
                              flex items-center justify-between px-4 py-4 rounded-[16px] cursor-pointer transition-all
                              ${isSelected
                                ? 'bg-[#EBF4FF] text-[#3182F6]'
                                : 'text-[#333D4B] hover:bg-[#F2F4F6]'}
                            `}
                          >
                            <span className={`text-[16px] ${isSelected ? 'font-bold' : 'font-medium'}`}>
                              {dist.name}
                            </span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <Check size={18} strokeWidth={3} />
                              </motion.div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </div>
            <div className="h-10 shrink-0" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
