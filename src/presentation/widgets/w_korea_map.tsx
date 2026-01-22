import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Compass } from 'lucide-react';
import { useRegionStore } from '../stores/region_store';
import { PROVINCE_DISPLAY_NAMES, REGION_DATA } from '../../data/constants/regions';
import { MAP_COLORS } from '../../data/constants/map_paths';
import { generateHapticFeedback, getCurrentLocation, Accuracy } from '@apps-in-toss/web-framework';

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
 * react-zoom-pan-pinch를 사용하여 핀치 줌 및 팬 제스처 지원
 */

interface KoreaMapWidgetProps {
  onDistrictClick?: (provinceId: string, districtId: string) => void;
}

export const KoreaMapWidget = ({ onDistrictClick }: KoreaMapWidgetProps) => {
  const { selectedProvince, selectProvince, selectDistrict } = useRegionStore();
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // 1. 상세 지역 진입/이탈 시 줌 상태 초기화 (항상 화면 중앙 정렬)
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

    triggerHaptic("tickMedium");
    selectProvince(provKey);
  };

  const handleBackgroundClick = (resetTransform: () => void) => {
    if (selectedProvince) {
      selectProvince(null); // 줌 아웃 (초기화)
      resetTransform(); // 줌 상태 초기화
    }
  };

  /**
   * 내 위치 기반 지역 자동 선택
   */
  const [isLocating, setIsLocating] = React.useState(false);

  const handleMyLocation = async () => {
    if (isLocating) return;
    setIsLocating(true);
    triggerHaptic("tickMedium");

    try {
      if (typeof getCurrentLocation !== 'function') {
        alert('토스 앱 내에서만 지원되는 기능입니다.');
        return;
      }

      const location = await getCurrentLocation({ accuracy: Accuracy.Balanced });

      // 주요 광역시/도 중심 좌표 (거리 계산용)
      const provinceCoords: Record<string, { lat: number; lng: number }> = {
        seoul: { lat: 37.5665, lng: 126.9780 },
        incheon: { lat: 37.4563, lng: 126.7052 },
        gyeonggi_south: { lat: 37.2636, lng: 127.0286 }, // 수원 기준
        gyeonggi_north: { lat: 37.7381, lng: 127.0337 }, // 의정부 기준
        gangwon: { lat: 37.8228, lng: 128.1555 },
        chungbuk: { lat: 36.6350, lng: 127.4912 },
        chungnam: { lat: 36.6588, lng: 126.6728 },
        daejeon: { lat: 36.3504, lng: 127.3845 },
        sejong: { lat: 36.4800, lng: 127.2890 },
        jeonbuk: { lat: 35.7175, lng: 127.1530 },
        jeonnam: { lat: 34.8679, lng: 126.9910 },
        gwangju: { lat: 35.1595, lng: 126.8526 },
        gyeongbuk: { lat: 36.5741, lng: 128.5047 },
        gyeongnam: { lat: 35.2377, lng: 128.6924 },
        daegu: { lat: 35.8714, lng: 128.6014 },
        ulsan: { lat: 35.5384, lng: 129.3114 },
        busan: { lat: 35.1796, lng: 129.0756 },
        jeju: { lat: 33.4890, lng: 126.4983 },
      };

      let nearestProvince = "seoul";
      let minDistance = Infinity;

      Object.entries(provinceCoords).forEach(([key, coords]) => {
        const dist = Math.sqrt(
          Math.pow(coords.lat - location.coords.latitude, 2) +
          Math.pow(coords.lng - location.coords.longitude, 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestProvince = key;
        }
      });

      triggerHaptic("success");
      selectProvince(nearestProvince);

    } catch (error) {
      console.error('Location Error:', error);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-[#F2F4F6] overflow-hidden relative">
      {/* 내 위치 버튼 (TDS Style) */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleMyLocation}
        disabled={isLocating}
        className="absolute right-6 bottom-40 z-30 w-[54px] h-[54px] bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E5E8EB] flex items-center justify-center text-[#333D4B] hover:text-[#3182F6] transition-all group active:bg-[#F2F4F6]"
        aria-label="내 위치 찾기"
      >
        {isLocating ? (
          <div className="w-5 h-5 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
        ) : (
          <Compass size={24} className="group-hover:rotate-12 transition-transform" />
        )}
      </motion.button>

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
          ref={transformRef}
        >
          {({ resetTransform }) => (
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
