---
trigger: always_on
---

📄 인플루언서 맵: 이미지 및 링크 처리 명세
본 서비스는 '비용 제로(Zero Cost)' 운영 원칙에 따라, 별도의 이미지 서버(S3 등)를 구축하지 않고 인스타그램의 원본 리소스를 직접 활용하는 전략을 취합니다.

1. 이미지 처리 전략 (No-Storage Policy)
우리는 인플루언서의 프로필 사진을 서버에 저장하지 않습니다. 대신 인스타그램 CDN(Content Delivery Network)의 주소를 DB에 문자열로 저장하고, 프론트엔드에서 이를 직접 호출합니다.

저장 방식: DB의 image_url 필드에 https://scontent-GIM.cdninstagram.com/... 형태의 긴 URL을 텍스트로 저장.

비용 절감: 스토리지 비용 0원, 이미지 전송 트래픽 비용 0원 (인스타그램 서버 자원 활용).

표시 방식 (Frontend):

TypeScript

// React 컴포넌트 예시
<img 
  src={influencer.imageUrl} 
  alt="Profile" 
  referrerPolicy="no-referrer" // 핵심: 외부 링크 차단 우회
  className="w-full h-full object-cover"
/>
2. 인스타그램 ID 및 링크 로직 (Masking & Redirect)
비즈니스 모델(전면 광고 수익)을 보호하기 위해, 사용자가 인플루언서의 ID를 보고 바로 인스타그램 앱으로 이탈하는 것을 방지합니다.

A. ID 마스킹 (Masking)
사용자에게는 인플루언서의 정확한 ID를 보여주지 않습니다.

원본: antigravity_dev

화면 표시: antigravity***

목적: 사용자가 ID를 외워서 직접 검색하는 것을 어렵게 만들어, 반드시 우리 앱의 '클릭'을 유도함.

B. 리다이렉션 흐름 (Flow)
사용자가 카드를 클릭했을 때 즉시 이동하지 않고, 광고 단계를 거칩니다.

User Action: 인플루언서 카드 클릭

System: 전면 광고(Interstitial Ad) 모달 출력

User Action: 광고 시청 완료 또는 닫기

System: 실제 인스타그램 프로필로 이동 (window.location.href)

3. 데이터 모델 명세 (TypeScript Interface)
src/data/models/m_influencer.ts에 정의될 구조입니다.

TypeScript

export interface Influencer {
  // 시스템 관리용 고유 ID (UUID)
  readonly id: string;
  
  // 실제 인스타그램 ID (DB에는 원본 저장, UI에서는 마스킹 처리하여 사용)
  readonly instagramId: string; 
  
  // 인스타그램 프로필 이미지의 원본 CDN URL
  // 예: https://scontent-ssn1-1.cdninstagram.com/v/t51.2885-19/...
  readonly imageUrl: string;
  
  // 소속 지역 ID (regions.ts의 ID와 매핑)
  // 예: 'seoul_gangnam', 'gyeonggi_seongnam'
  readonly regionId: string;
  
  // 좋아요 수 (랭킹 산정 기준)
  readonly likeCount: number;
}
4. 기술적 주의사항 (Troubleshooting)
이 방식을 사용할 때 개발자가 반드시 인지해야 할 2가지 잠재적 이슈입니다.

① CORS 및 엑박(Broken Image) 방지
인스타그램은 외부 사이트에서 자신의 이미지를 무단으로 쓰는 것을 막기 위해 이미지를 차단할 수 있습니다.

해결책: <img> 태그에 referrerPolicy="no-referrer" 속성을 반드시 추가해야 합니다. 브라우저가 "나 인플루언서 맵 사이트에서 왔어"라는 정보를 숨기고 요청하게 하여 차단을 우회합니다.

② URL 만료 (Expiration)
인스타그램의 CDN URL은 영구적이지 않고, 일정 기간이 지나면 만료되어 이미지가 안 나올 수 있습니다.

대응책: 현재는 '수동 관리' 프로세스이므로, 이미지가 깨졌다는 신고가 들어오면 운영자(개발자)가 DB의 URL을 최신 것으로 업데이트합니다. (향후 자동화 고려 대상)