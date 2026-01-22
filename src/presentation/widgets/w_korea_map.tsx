import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
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
}

export const KoreaMapWidget = ({ onDistrictClick }: KoreaMapWidgetProps) => {
  const { selectedProvince, selectProvince, selectDistrict } = useRegionStore();
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
    <div className="w-full h-full flex flex-col items-center bg-[#F2F4F6] overflow-hidden relative">
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
            const centroid = selectedProvince ? getDistrictCentroid(selectedProvince) : null;

            return (
              <div
                className="w-full h-full flex items-center justify-center cursor-move"
                onClick={() => handleBackgroundClick(resetTransform)}
              >
                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full !h-full flex items-center justify-center p-6"
                >
                  <svg
                    viewBox="0 0 300 400"
                    className="w-full h-full max-w-[500px] overflow-visible"
                    style={{ filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.04))' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.g
                      animate={{
                        scale: selectedProvince ? 2.3 : 1,
                        x: selectedProvince && centroid ? 150 - centroid.x * 2.3 : 0,
                        y: selectedProvince && centroid ? 140 - centroid.y * 2.3 : -40,
                      }}
                      transition={{ type: "spring", damping: 25, stiffness: 180 }}
                    >
                      {provinces.map((provKey) => {
                        const pos = getProvincePosition(provKey);
                        const isSelected = selectedProvince === provKey;

                        return (
                          <motion.g
                            key={provKey}
                            initial={false}
                            whileHover={{ scale: isSelected ? 1 : 1.05 }}
                            onClick={(e: any) => handleProvinceClick(provKey, e)}
                            className="cursor-pointer"
                          >
                            <motion.rect
                              x={pos.x - 24}
                              y={pos.y - 14}
                              width={48}
                              height={28}
                              rx={8}
                              fill={isSelected ? MAP_COLORS.selected : MAP_COLORS.fill}
                              stroke={isSelected ? MAP_COLORS.selected : '#E5E8EB'}
                              strokeWidth={isSelected ? 0 : 1}
                              animate={{
                                fill: isSelected ? MAP_COLORS.selected : MAP_COLORS.fill,
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
                                fill: isSelected ? MAP_COLORS.selectedText : '#333D4B',
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
                    </motion.g>
                  </svg>

                  {/* 상세 지역 그리드/맵 오버레이 */}
                  {selectedProvince && REGION_DATA[selectedProvince] && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 pointer-events-none"
                    >
                      {REGION_DATA[selectedProvince].some(d => d.x !== undefined) ? (
                        <div className="relative w-full h-full pointer-events-auto">
                          {REGION_DATA[selectedProvince].map((dist: any) => {
                            const left = dist.x ? (dist.x / 300) * 100 : 50;
                            const top = dist.y ? (dist.y / 400) * 100 : 50;

                            return (
                              <motion.button
                                key={dist.id}
                                onClick={(e: any) => handleDistrictClick(dist.id, e)}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 260,
                                  damping: 20,
                                  delay: Math.random() * 0.1
                                }}
                                style={{ left: `${left}%`, top: `${top}%` }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md border border-[#E5E8EB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-3 py-1.5 rounded-full text-[13px] font-bold text-[#333D4B] hover:scale-110 hover:text-[#3182F6] hover:border-[#3182F6] transition-all z-10 whitespace-nowrap"
                              >
                                {dist.name}
                              </motion.button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-8 pointer-events-none">
                          <div className="flex flex-wrap justify-center gap-2 max-h-[300px] overflow-y-auto pointer-events-auto p-4 rounded-xl no-scrollbar">
                            {REGION_DATA[selectedProvince].map((dist: any) => (
                              <motion.button
                                key={dist.id}
                                onClick={(e: any) => handleDistrictClick(dist.id, e)}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/90 backdrop-blur-md border border-white/50 shadow-sm px-4 py-2.5 rounded-xl text-[14px] font-bold text-[#333D4B] hover:bg-white hover:text-[#3182F6] transition-colors"
                              >
                                {dist.name}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </TransformComponent>
              </div>
            );
          }}
        </TransformWrapper>
      </div>
    </div>
  );
};
