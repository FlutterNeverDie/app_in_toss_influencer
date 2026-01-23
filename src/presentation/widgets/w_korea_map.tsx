import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Plus, Minus } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { PROVINCE_DISPLAY_NAMES, REGION_DATA } from '../../data/constants/regions';
import { MAP_COLORS } from '../../data/constants/map_paths';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

/**
 * 햅틱 피드백 유틸리티
 */
const triggerHaptic = (type: "tickWeak" | "tap" | "tickMedium" | "success" = "tickWeak") => {
  if (typeof generateHapticFeedback === 'function') {
    generateHapticFeedback({ type }).catch(() => { });
  }
};

/**
 * 대한민국 지도 위젯 (Premium SVG Version)
 */
interface KoreaMapWidgetProps {
  onDistrictClick?: (provinceId: string, districtId: string) => void;
  hasResults?: boolean;
  isSearching?: boolean;
}

export const KoreaMapWidget = ({ onDistrictClick, hasResults = false, isSearching = false }: KoreaMapWidgetProps) => {
  const {
    selectedProvince,
    selectedDistrict,
    selectProvince,
    selectDistrict,
    isLoadingData
  } = useRegionStore();
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // 1. 상세 지역 진입/이탈 시 줌 상태 초기화
  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  }, [selectedProvince]);

  const handleDistrictClick = (districtId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("tap");
    if (onDistrictClick && selectedProvince) {
      onDistrictClick(selectedProvince, districtId);
    } else {
      selectDistrict(districtId);
    }
  };

  const provinces = Object.keys(PROVINCE_DISPLAY_NAMES);

  // SVG 내에서 각 지역의 초기 위치 (대한민국 형상 유지용)
  const getProvincePosition = (key: string) => {
    const layout: Record<string, { x: number; y: number }> = {
      seoul: { x: 80, y: 65 },
      gyeonggi_north: { x: 80, y: 25 },
      gyeonggi_south: { x: 80, y: 100 },
      incheon: { x: 20, y: 70 },
      gangwon: { x: 155, y: 60 },
      chungbuk: { x: 135, y: 135 },
      chungnam: { x: 50, y: 165 },
      daejeon: { x: 100, y: 185 },
      sejong: { x: 70, y: 132 },
      jeonbuk: { x: 80, y: 220 },
      jeonnam: { x: 75, y: 310 },
      gwangju: { x: 35, y: 265 },
      gyeongbuk: { x: 185, y: 165 },
      gyeongnam: { x: 165, y: 245 },
      daegu: { x: 195, y: 205 },
      ulsan: { x: 225, y: 245 },
      busan: { x: 215, y: 285 },
      jeju: { x: 80, y: 365 },
      ulleung: { x: 260, y: 135 },
    };
    return layout[key] || { x: 0, y: 0 };
  };

  // 구/군 데이터의 실제 중심점 계산 (상세 뷰 진입 시 정확한 센터링을 위해)
  const getDistrictCentroid = (provKey: string) => {
    const districts = REGION_DATA[provKey];
    if (!districts || districts.length === 0) return getProvincePosition(provKey);

    const coords = districts.filter(d => d.x !== undefined && d.y !== undefined);
    if (coords.length === 0) return getProvincePosition(provKey);

    const xs = coords.map(d => d.x!);
    const ys = coords.map(d => d.y!);

    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2
    };
  };

  // 지역 이름 변환
  const formatProvinceName = (name: string) => {
    return name
      .replace('특별자치도', '')
      .replace('특별자치시', '')
      .replace('특별시', '')
      .replace('광역시', '')
      .replace('남도', '남')
      .replace('북도', '북')
      .replace('전라', '전')
      .replace('경상', '경')
      .replace('충청', '충')
      .replace('경기도', '경기')
      .replace('강원도', '강원')
      .replace('제주도', '제주')
      .replace('도', '');
  };

  const handleProvinceClick = (provKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProvince === provKey) return;
    triggerHaptic("tickMedium");
    selectProvince(provKey);
  };

  const handleBackgroundClick = (resetTransform: () => void) => {
    if (selectedProvince) {
      selectProvince(null);
      resetTransform();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-[var(--bg-color)] overflow-hidden relative">
      <div className="relative w-full h-full flex items-center justify-center flex-1">
        <TransformWrapper
          initialScale={1}
          minScale={0.8}
          maxScale={8}
          centerOnInit={true}
          limitToBounds={false}
          smooth={true}
          wheel={{ step: 0.1 }}
          zoomAnimation={{ animationType: "easeOut" }}
          doubleClick={{ disabled: true }}
          ref={transformRef}
        >
          {({ resetTransform }) => {
            // 2. 현재 활성화된 중심점 계산 (기초 지자체 우선, 없으면 광역 지자체 중심)
            const activeCentroid = (() => {
              if (!selectedProvince) return null;
              if (selectedDistrict) {
                const districts = REGION_DATA[selectedProvince];
                const target = districts?.find(d => d.id === selectedDistrict);
                if (target && target.x !== undefined && target.y !== undefined) {
                  return { x: target.x, y: target.y };
                }
              }
              return getDistrictCentroid(selectedProvince);
            })();

            return (
              <div
                className="w-full h-full flex items-center justify-center cursor-move"
                onClick={() => handleBackgroundClick(resetTransform)}
              >
                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full !h-full flex items-center justify-center p-6"
                >
                  <div className="relative w-[300px] h-[400px]">
                    {/* 1. 확대/이동하는 지도 레이어 (SVG + 핀 버튼) */}
                    <motion.div
                      className="w-full h-full relative"
                      animate={{
                        scale: selectedProvince ? 1.2 : 1,
                        x: selectedProvince && activeCentroid ? 110 - activeCentroid.x * 1.2 : 0,
                        y: selectedProvince && activeCentroid ? 110 - activeCentroid.y * 1.2 : -40,
                        opacity: 1 // 딤처리 제거 (항상 1)
                      }}
                      transition={{ type: "spring", damping: 25, stiffness: 180 }}
                      style={{ transformOrigin: "0 0" }}
                    >
                      <svg
                        viewBox="0 0 300 400"
                        className="w-full h-full overflow-visible"
                        style={{ filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.04))' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <g>
                          {provinces.map((provKey) => {
                            const pos = getProvincePosition(provKey);
                            const isSelected = selectedProvince === provKey;

                            return (
                              <motion.g
                                key={provKey}
                                initial={false}
                                whileHover={{ scale: isSelected ? 1 : 1.05 }}
                                onClick={(e: React.MouseEvent) => handleProvinceClick(provKey, e)}
                                className="cursor-pointer"
                              >
                                <motion.rect
                                  x={pos.x - 24}
                                  y={pos.y - 14}
                                  width={48}
                                  height={28}
                                  rx={8}
                                  fill={isSelected ? MAP_COLORS.selected : 'var(--map-fill)'}
                                  stroke={isSelected ? MAP_COLORS.selected : 'var(--glass-border)'}
                                  strokeWidth={isSelected ? 0 : 1}
                                  animate={{
                                    fill: isSelected ? MAP_COLORS.selected : 'var(--map-fill)',
                                    opacity: selectedProvince ? 0 : 1
                                  }}
                                  transition={{ duration: 0.2 }}
                                />

                                <motion.text
                                  x={pos.x}
                                  y={pos.y + 5}
                                  textAnchor="middle"
                                  className="select-none pointer-events-none"
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: isSelected ? '700' : '600',
                                    fill: isSelected ? MAP_COLORS.selectedText : 'var(--text-color)',
                                    fontFamily: 'Pretendard, -apple-system, sans-serif'
                                  }}
                                  animate={{
                                    opacity: selectedProvince ? 0 : 1
                                  }}
                                >
                                  {formatProvinceName(PROVINCE_DISPLAY_NAMES[provKey])}
                                </motion.text>
                              </motion.g>
                            );
                          })}
                        </g>
                      </svg>

                      {/* 좌표 기반 버튼 (지도가 배경과 함께 움직임) */}
                      {selectedProvince && REGION_DATA[selectedProvince]?.some(d => d.x !== undefined) && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="relative w-full h-full pointer-events-auto">
                            {REGION_DATA[selectedProvince].map((dist) => {
                              const left = dist.x ? (dist.x / 300) * 100 : 50;
                              const top = dist.y ? (dist.y / 400) * 100 : 50;
                              const isSelected = selectedDistrict === dist.id;

                              return (
                                <motion.button
                                  key={dist.id}
                                  onClick={(e: React.MouseEvent) => handleDistrictClick(dist.id, e)}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{
                                    scale: isSelected ? 0.75 : 0.65, // 1.2배 확대에서 버튼 겹침 방지를 위해 축소
                                    opacity: 1
                                  }}
                                  whileTap={{ scale: 0.4 }}
                                  style={{ left: `${left}%`, top: `${top}%` }}
                                  className={`absolute -translate-x-1/2 -translate-y-1/2 text-[14px] font-bold z-10 whitespace-nowrap px-4 py-2 rounded-full
                                    ${isSelected
                                      ? 'liquid-glass-active text-white'
                                      : 'liquid-glass text-[var(--text-color)] dark:text-white'
                                    }`}
                                >
                                  {dist.name}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* 2. 고정된 그리드 레이어 (좌표 없는 지역을 위한 폴백, 확대 안함) */}
                    {selectedProvince && REGION_DATA[selectedProvince]?.every(d => d.x === undefined) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 z-30 flex items-center justify-center p-8 pointer-events-none"
                      >
                        <div className="flex flex-wrap justify-center gap-2 max-h-[300px] overflow-y-auto pointer-events-auto p-4 rounded-xl no-scrollbar liquid-glass">
                          {REGION_DATA[selectedProvince].map((dist) => (
                            <motion.button
                              key={dist.id}
                              onClick={(e: React.MouseEvent) => handleDistrictClick(dist.id, e)}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2.5 rounded-xl text-[14px] font-bold transition-colors
                                ${selectedDistrict === dist.id
                                  ? 'bg-[#3182F6] text-white'
                                  : 'text-white dark:text-[#ADB5BD] hover:text-[#3182F6]'
                                }`}
                            >
                              {dist.name}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </TransformComponent>

                {/* 수동 줌 컨트롤 (우측 하단 Edge 스타일) - 바텀 시트 유무에 따라 위치 동적 조정 */}
                <motion.div
                  animate={{
                    y: (isSearching || isLoadingData || hasResults)
                      ? -80       // 0. 검색 중 / 로딩 중 / 결과 있음: -80
                      : !selectedDistrict
                        ? 70      // 1. 기본 상태: 70
                        : -10     // 3. 결과 없음: -10
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 350 }}
                  className="absolute right-4 top-1/2 z-50 flex flex-col gap-2"
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); triggerHaptic("tickWeak"); transformRef.current?.zoomIn(); }}
                    className="w-10 h-10 flex items-center justify-center liquid-glass rounded-xl text-[var(--text-color)] active:scale-95"
                  >
                    <Plus size={20} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); triggerHaptic("tickWeak"); transformRef.current?.zoomOut(); }}
                    className="w-10 h-10 flex items-center justify-center liquid-glass rounded-xl text-[var(--text-color)] dark:text-white active:scale-95"
                  >
                    <Minus size={20} />
                  </motion.button>
                </motion.div>
              </div>
            );
          }}
        </TransformWrapper>
      </div>
    </div>
  );
};
