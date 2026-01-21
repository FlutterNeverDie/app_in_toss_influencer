/**
 * 행정구역 그룹 타입 정보
 * A: 광역시 (구/군 상세 구분)
 * B: 8도 (시/군 통합)
 * C: 세종/제주
 */
export type TRegionGroup = 'A' | 'B' | 'C';

/**
 * 행정구역 정보 인터페이스
 */
export interface IRegion {
    id: string;
    parentId: string | null;
    name: string;
    groupType: TRegionGroup;
}

/**
 * 인플루언서 정보 인터페이스
 * (이미지 및 링크 처리 규칙 준수)
 */
export interface IInfluencer {
    id: string;
    instagramId: string; // 원본 ID (UI 출력 시 마스킹 처리 필요)
    imageUrl: string; // 인스타 CDN URL
    regionId: string;
    likeCount: number;
    isActive: boolean;
    createdAt: string;
}
