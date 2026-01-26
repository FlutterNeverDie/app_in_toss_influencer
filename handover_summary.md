# 📋 Toss Login 연동 작업 현황 및 완료 보고

오늘 진행한 '인플루언서 맵' 토스 로그인 연동 및 회원 데이터 확장 작업의 결과와 내일 이어서 하실 내용을 정리했습니다.

## ✅ 완료된 작업 (Implementation Complete)

### 1. 백엔드: Supabase Edge Function (`toss-login`)
- **개인정보 복호화 로직 구현**: `AES-256-GCM` 알고리즘을 사용하여 토스에서 암호화되어 오는 사용자 정보를 복호화할 수 있도록 함수를 업데이트했습니다.
- **데이터 저장 확장**: 이름(`name`), **생년월일(`birthday`)**, **성별(`gender`)**, 그리고 **휴대폰 번호(`phone`)**까지 모두 복호화하여 저장하도록 확장했습니다.
- **자동 가입(Upsert)**: 토스 `userKey`를 식별자로 사용하여, 로그인 시 자동으로 회원가입이 되거나 정보가 업데이트됩니다.

### 2. 프론트엔드: 스토어 및 서비스 레이어
- **AuthStore 고도화**: 토스 앱 브릿지(`appLogin`) 호출 -> 인가 코드 획득 -> Edge Function 호출로 이어지는 완전한 로그인 Flow를 구현했습니다.
- **모델 확장**: `Member` 인터페이스에 `birthday`, `gender` 필드를 추가하여 타입 안정성을 확보했습니다.

### 3. UI/UX: 자동 로그인 및 프로필 관리
- **Auto-Login**: 별도의 로그인 버튼 없이, 앱이 실행될 때 `main.tsx`에서 즉시 토스 인증 정보를 확인하여 자동으로 로그인합니다.
- **DrawerMenu 개편**: 
    - 로그인 전: "확인이 필요해요" 메시지 노출 (자동 로그인 실패 시).
    - 로그인 후: 사용자 이름 표시 및 로그아웃 기능 제공.
- **불필요한 버튼 제거**: 수동 로그인 버튼(`TossLoginButton`)을 삭제하여 동선을 간소화했습니다.

---

## 📅 내일 회사에서 하실 일 (Next Steps)

### 1. 토스 개발자 센터 콘솔 설정
- **약관 등록**: 노션 등에 작성하신 서비스 약관 링크를 콘솔에 등록해 주세요.
- **동의 항목(Scope) 체크**: 반드시 아래 항목들을 **[필수]** 또는 **[선택]**으로 체크해야 합니다.
    - 이름 (`user_name`)
    - 생년월일 (`user_birthday`)
    - 성별 (`user_gender`)
    - 휴대폰 번호 (`user_phone`)
- **복호화 키 요청**: 설정 저장 후 하단의 **[이메일로 복호화 키 받기]** 버튼을 눌러주세요.

### 2. DB 및 서버 설정 업데이트
- **DB 컬럼 추가**: 아래 SQL을 Supabase SQL Editor에서 실행해서 저장 공간을 만들어 주세요.
    ```sql
    ALTER TABLE member 
    ADD COLUMN IF NOT EXISTS birthday TEXT,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT;
    ```
- **환경 변수 등록**: 이메일로 받은 키값들을 Supabase Edge Function 설정에 넣어주세요.
    - `TOSS_DECRYPT_KEY`: 메일로 온 Secret Key (AES256)
    - `TOSS_AAD`: 메일로 온 AAD 값 (보통 "TOSS")
    - `TOSS_CLIENT_ID` / `TOSS_CLIENT_SECRET`: 콘솔 상단에 있는 값

---

## 💡 샌드박스 테스트 팁
- 내일 회사 가시기 전이라도, **Granite Sandbox** 환경이 유지된다면 현재 코드 상태로 "토스로 시작하기"를 눌러보실 수 있습니다. 
- 복호화 키가 등록되기 전까지는 이름이 다시 "토스 사용자"로 나올 수 있으나, 로그인 Flow 자체는 작동할 것입니다.

고생 많으셨습니다! 내일 연동 마무리 단계에서 다시 도와드릴게요. 🌙
