---
trigger: always_on
---

📄 인플루언서 맵: 이미지 및 좋아요 처리 명세
본 서비스는 효율적인 운영을 위해 최소화된 데이터 구조와 인스타그램 리소스를 활용합니다.

1. 이미지 처리 전략 (Supabase Storage)
별도의 이미지 서버 없이 Supabase Storage를 전용 저장소로 활용합니다.
- **저장 방식**: 모든 이미지는 최적화된 `WebP` 형식으로 변환하여 Supabase Storage의 `profiles` 버킷에 저장합니다.
- **제한 사항**: 인플루언서 1인당 최대 **1개**의 프로필 이미지만 가질 수 있습니다.
- **데이터 구조**: `image_url` 필드에는 Supabase Storage의 퍼블릭 URL을 저장합니다.
- **Fallback**: 이미지 로드 실패 시 "IMG" 텍스트 또는 기본 아이콘이 표시되도록 처리합니다.


2. 인스타그램 ID 및 링크 로직
- **ID 마스킹**: 보안 및 이탈 방지를 위해 `maskInstagramId` 함수를 통해 `anti***` 형태로 노출합니다.
- **링크 연동**: 카드 클릭 시 토스 브릿지의 `openURL` API를 사용하여 실제 인스타그램 앱/웹으로 리다이렉션합니다.

3. 좋아요 및 추천 시스템 (Auth-based)
- **로그인 권한**: 토스 로그인(`appLogin`)을 완료한 사용자만 좋아요(추천)를 누를 수 있습니다.
- **제한 로직**: 1인당 인플루언서 한 명에게 **최대 1회**의 추천만 가능합니다. (토글 방식)
- **데이터 관리**: `auth_store`의 `likedInfluencerIds` 배열을 통해 클라이언트 측에서 관리하며, `like_count`에 동적으로 반영합니다.

4. 데이터 모델 명세 (TypeScript)
`src/data/models/m_influencer.ts` 구조:

```typescript
export interface Influencer {
  readonly id: string;           // UUID
  readonly instagram_id: string; // 인스타그램 ID (원본)
  readonly image_url: string;    // CDN URL
  readonly province_id: string;  // 대분류 지역 ID
  readonly district_id: string;  // 소분류 지역 ID
  readonly like_count: number;   // 전체 좋아요 수
}
```

5. 기술적 주의사항
- **URL 만료**: 인스타그램 CDN URL은 만료될 수 있으므로, 이미지가 깨질 경우 DB URL을 수동으로 업데이트해야 합니다. 
- **방어적 브릿지 호출**: 토스 앱 외부에서도 기능이 오작동하지 않도록 `typeof API === 'function'` 체크를 필수로 수행합니다.
- **VERCEL 업로드 : vercel 업로드를 위해사용 안하는 임포트, 변수 정리해줘 