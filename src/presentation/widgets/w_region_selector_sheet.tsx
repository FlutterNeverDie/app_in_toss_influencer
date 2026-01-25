import { useState, useMemo, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { REGION_DATA, PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';
import { BottomSheet, TextField, ListRow } from '@toss/tds-mobile';

const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
  if (typeof generateHapticFeedback === 'function') {
    generateHapticFeedback({ type }).catch(() => { });
  }
};

export const RegionSelectorSheet = () => {
  const {
    isSheetOpen,
    selectedProvince,
    selectedDistrict,
    closeSheet,
    selectRegion,
    isSearching,
    setIsSearching
  } = useRegionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('seoul');

  useEffect(() => {
    if (isSheetOpen) {
      if (selectedProvince) {
        setActiveTab(selectedProvince);
      } else {
        setActiveTab('seoul');
      }
      setSearchQuery('');
      setIsSearching(false);
    }
  }, [isSheetOpen, setIsSearching, selectedProvince]);

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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allDistricts.filter((dist) =>
      dist.name.includes(searchQuery) || dist.provinceName.includes(searchQuery)
    );
  }, [searchQuery, allDistricts]);

  const handleSearchResultClick = (provinceId: string, districtId: string) => {
    selectRegion(provinceId, districtId);
    setSearchQuery('');
    setIsSearching(false);
    closeSheet();
  };

  return (
    <BottomSheet open={isSheetOpen} onClose={closeSheet}>
      <div className="bg-white dark:bg-[#1C1E22] rounded-t-[32px] overflow-hidden flex flex-col h-[85vh]">
        <BottomSheet.Header>
          <span style={{ color: 'var(--text-color)' }}>
            {searchQuery || isSearching ? '지역 검색' : ''}
          </span>
        </BottomSheet.Header>

        <div className="px-6 pb-4">
          <TextField
            variant="box"
            value={searchQuery}
            onFocus={() => setIsSearching(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="지역 이름을 검색해보세요"
            label=""
            className="tds-search-input"
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {(searchQuery || isSearching) ? (
            <div className="flex-1 overflow-y-auto px-1 pt-2">
              {searchResults.length > 0 ? (
                <ul className="pb-10">
                  {searchResults.map((result) => (
                    <ListRow
                      key={`${result.provinceId}-${result.districtId}`}
                      onClick={() => handleSearchResultClick(result.provinceId, result.districtId)}
                      contents={
                        <ListRow.Texts
                          type="2RowTypeA"
                          top={result.name}
                          topProps={{ typography: 't5', fontWeight: 'bold', color: 'var(--text-color)' }}
                          bottom={result.provinceName}
                          bottomProps={{ typography: 't7', color: 'grey500' }}
                        />
                      }
                    />
                  ))}
                </ul>
              ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center h-full text-[#8B95A1] opacity-60">
                  <span className="text-[15px] font-medium">검색 결과가 없어요</span>
                </div>
              ) : (
                <div className="p-4 text-[#8B95A1] text-sm opacity-60">
                  지역 이름을 입력해주세요.
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="w-[120px] bg-[#F9FAFB] dark:bg-[#181A1D] overflow-y-auto py-2 border-r border-[#E5E8EB] dark:border-[#2C2E33]">
                {Object.keys(REGION_DATA).map((provKey) => {
                  const isSelected = activeTab === provKey;
                  const displayName = PROVINCE_DISPLAY_NAMES[provKey];
                  return (
                    <div
                      key={provKey}
                      onClick={() => {
                        triggerHaptic("tickWeak");
                        setActiveTab(provKey);
                      }}
                      className={`
                        px-4 py-5 text-[15px] cursor-pointer transition-all relative
                        ${isSelected ? 'bg-white dark:bg-[#1C1E22] text-[#3182F6] font-bold' : 'text-[#8B95A1] font-medium'}
                      `}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3182F6]" />}
                      <span className="truncate">
                        {displayName.replace('특별시', '').replace('광역시', '').replace('특별자치도', '').replace('특별자치시', '')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto px-1 pt-2">
                <ul className="pb-10">
                  {(activeTab ? REGION_DATA[activeTab] : []).map((dist: any) => {
                    const isSelected = selectedProvince === activeTab && selectedDistrict === dist.id;
                    return (
                      <ListRow
                        key={dist.id}
                        onClick={() => {
                          triggerHaptic("tap");
                          selectRegion(activeTab, dist.id);
                          closeSheet();
                        }}
                        right={isSelected ? <Check size={20} className="text-[#3182F6]" /> : null}
                        contents={
                          <ListRow.Texts
                            type="1RowTypeA"
                            top={dist.name}
                            topProps={{
                              typography: 't5',
                              fontWeight: isSelected ? 'bold' : 'medium',
                              color: isSelected ? 'blue500' : 'var(--text-color)'
                            }}
                          />
                        }
                      />
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>
        <div className="h-8 shrink-0 bg-white dark:bg-[#1C1E22]" />
      </div>
    </BottomSheet>
  );
};
