import React from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useRegionStore } from '../stores/region_store';
import { PROVINCE_DISPLAY_NAMES, REGION_DATA } from '../../data/constants/regions';
import { MAP_COLORS } from '../../data/constants/map_paths';

/**
 * 대한민국 지도 위젯 (Premium SVG Version)
 * react-zoom-pan-pinch를 사용하여 핀치 줌 및 팬 제스처 지원
 */

interface KoreaMapWidgetProps {
  onDistrictClick?: (provinceId: string, districtId: string) => void;
}

export const KoreaMapWidget = ({ onDistrictClick }: KoreaMapWidgetProps) => {
  const { selectedProvince, selectProvince, selectDistrict } = useRegionStore();

  const handleDistrictClick = (districtId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDistrictClick && selectedProvince) {
      onDistrictClick(selectedProvince, districtId);
    } else {
      selectDistrict(districtId);
    }
  };

  const provinces = Object.keys(PROVINCE_DISPLAY_NAMES);

  // SVG 내에서 각 지역의 위치를 정의 (토스 스타일의 세련된 격자형 배치)
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
    e.stopPropagation(); // 배경 클릭 방지
    if (selectedProvince === provKey) return; // 이미 선택됨

    selectProvince(provKey);
  };

  const handleBackgroundClick = (resetTransform: () => void) => {
    if (selectedProvince) {
      selectProvince(null); // 줌 아웃 (초기화)
      resetTransform(); // 줌 상태 초기화
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-[#F2F4F6] overflow-hidden relative">
      <header className="pt-12 pb-2 text-center z-10 pointer-events-none flex-none">
        <h1 className="text-[22px] font-bold text-[#191F28] mb-1">인플루언서 맵</h1>
        <p className="text-[14px] text-[#4E5968]">
          {selectedProvince
            ? `${PROVINCE_DISPLAY_NAMES[selectedProvince]}의 상세 지역을 선택하세요`
            : '어느 지역의 인플루언서가 궁금하세요?'}
        </p>
      </header>

      <div className="relative w-full h-full flex items-center justify-center -mt-4 flex-1">
        <TransformWrapper
          initialScale={1}
          minScale={0.8}
          maxScale={8}
          centerOnInit={true}
          limitToBounds={false}
          smooth={true}
          wheel={{ step: 0.1 }}
          zoomAnimation={{ animationType: "easeOut" }}
          doubleClick={{ disabled: true }} // 더블 클릭 줌 방지 (배경 클릭과 충돌 가능성)
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
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
                  onClick={(e) => e.stopPropagation()} // SVG 내부 클릭 시 배경 클릭 트리거 방지
                >
                  <motion.g
                    animate={{
                      scale: selectedProvince ? 2.3 : 1,
                      x: selectedProvince ? 150 - getProvincePosition(selectedProvince).x * 2.3 : 0,
                      y: selectedProvince ? 200 - getProvincePosition(selectedProvince).y * 2.3 : 0,
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
                              opacity: (selectedProvince && !isSelected) ? 0 : 1 // 선택 안 된 지역 완전히 숨김
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
                              opacity: (selectedProvince && !isSelected) ? 0 : 1 // 텍스트도 완전히 숨김
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
                    {/* 좌표가 있는 경우 (서울 등)와 없는 경우를 구분하여 렌더링 */}
                    {REGION_DATA[selectedProvince].some(d => d.x !== undefined) ? (
                      // 좌표 기반 렌더링 (Map view)
                      <div className="relative w-full h-full pointer-events-auto">
                        {REGION_DATA[selectedProvince].map((dist: any) => {
                          // ViewBox 300x400 기준 좌표를 %로 변환
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
                                delay: Math.random() * 0.1 // 자연스러운 등장
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
                      // 좌표 없는 경우: 기존 격자(Grid) 폴백
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
          )}
        </TransformWrapper>
      </div>
    </div>
  );
};
