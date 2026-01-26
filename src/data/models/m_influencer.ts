/**
 * 인플루언서 데이터 모델
 * Supabase DB의 'influencer' 테이블과 매핑됩니다.
 */
export interface Influencer {
    // 시스템 관리용 고유 ID (UUID)
    readonly id: string;

    // 실제 인스타그램 ID (DB에는 원본 저장, UI에서는 마스킹 처리하여 사용)
    readonly instagram_id: string;

    // 인스타그램 프로필 이미지의 원본 CDN URL
    // 예: https://scontent-ssn1-1.cdninstagram.com/v/t51.2885-19/...
    readonly image_url: string;

    // 소속 지역 ID (regions.ts의 ID와 매핑)
    // 예: 'seoul_gangnam', 'gyeonggi_suwon' (province_district 조합 권장)
    // 또는 'gangnam', 'suwon' 등 기초자치단체 ID만 사용할 수도 있음 (기획에 따라 다름)
    // 현재 로직상 district ID를 저장하는 것이 일반적
    readonly district_id: string;

    // 광역 자치단체 ID (쿼리 최적화용)
    readonly province_id: string;

    // 좋아요 수 (랭킹 산정 기준)
    readonly like_count: number;

    // 등록한 유저 ID
    readonly member_id?: string;

    // 삭제 여부 (비공개 처리)
    readonly is_deleted: boolean;

    // 생성일 (정렬용)
    readonly created_at?: string;
}
