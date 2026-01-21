import React from 'react';
import { motion } from 'framer-motion';
import { useRegionStore } from '../stores/region_store';
import { PROVINCE_DISPLAY_NAMES } from '../../data/constants/regions';
import { MAP_COLORS } from '../../data/constants/map_paths';

/**
 * 대한민국 지도 위젯 (Premium SVG Version)
 */
export const KoreaMapWidget = () => {
  const { selectedProvince, selectProvince, openSheet } = useRegionStore();

  const provinces = Object.keys(PROVINCE_DISPLAY_NAMES);

  // SVG 내에서 각 지역의 위치를 정의 (토스 스타일의 세련된 격자형 배치)
  const getProvincePosition = (key: string) => {
    const layout: Record<string, { x: number; y: number }> = {
      seoul: { x: 80, y: 65 },
      gyeonggi_north: { x: 80, y: 25 }, // 서울 위
      gyeonggi_south: { x: 80, y: 100 }, // 서울 아래
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
    };
    return layout[key] || { x: 0, y: 0 };
  };

  // 지역 이름 변환 로직 (예: 전라남도 -> 전남, 경기도 -> 경기)
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
      .replace('도', ''); // 남은 '도' 제거
  };

  const handleProvinceClick = (provKey: string) => {
    selectProvince(provKey);
    openSheet(); // 클릭 시 바로 바텀 시트 오픈
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-[#F2F4F6] overflow-hidden relative">
      <header className="pt-12 pb-2 text-center z-10">
        <h1 className="text-[22px] font-bold text-[#191F28] mb-1">인플루언서 맵</h1>
        <p className="text-[14px] text-[#4E5968]">어느 지역의 인플루언서가 궁금하세요?</p>
      </header>

      <div className="relative w-full max-w-[400px] aspect-[1/1.2] flex items-center justify-center p-6 -mt-4">
        <svg
          viewBox="0 0 300 400"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.04))' }}
        >
          {provinces.map((provKey) => {
            const pos = getProvincePosition(provKey);
            const isSelected = selectedProvince === provKey;

            return (
              <motion.g
                key={provKey}
                initial={false}
                animate={{
                  scale: isSelected ? 1.05 : 1,
                }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleProvinceClick(provKey)}
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
                  }}
                  transition={{ duration: 0.2 }}
                />

                <text
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
                >
                  {formatProvinceName(PROVINCE_DISPLAY_NAMES[provKey])}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
