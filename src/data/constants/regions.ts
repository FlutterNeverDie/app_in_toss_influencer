// src/data/constants/regions.ts

export interface RegionItem {
    id: string;   // DB 저장 및 로직 처리용 ID (영문 소문자)
    name: string; // UI 표시용 이름 (한글)
    x?: number;   // 지도상 X 좌표 (0~300 기준)
    y?: number;   // 지도상 Y 좌표 (0~400 기준)
}

export interface RegionData {
    [provinceKey: string]: RegionItem[];
}

// UI 표시를 위한 광역 자치단체 한글 명칭 매핑
export const PROVINCE_DISPLAY_NAMES: Record<string, string> = {
    seoul: '서울',
    busan: '부산',
    daegu: '대구',
    incheon: '인천',
    gwangju: '광주',
    daejeon: '대전',
    ulsan: '울산',
    sejong: '세종',
    gyeonggi_south: '경기(남)',
    gyeonggi_north: '경기(북)',
    gangwon: '강원도',
    chungbuk: '충청북도',
    chungnam: '충청남도',
    jeonbuk: '전라북도',
    jeonnam: '전라남도',
    gyeongbuk: '경상북도',
    gyeongnam: '경상남도',
    jeju: '제주도',
    ulleung: '울릉군',
};

// 전국 행정구역 데이터 (2-Depth 구조) - 모든 지역 좌표 적용 완료
export const REGION_DATA: RegionData = {
    seoul: [
        { id: 'dobong', name: '도봉구', x: 170, y: 40 },
        { id: 'gangbuk', name: '강북구', x: 140, y: 70 },
        { id: 'nowon', name: '노원구', x: 210, y: 60 },
        { id: 'eunpyeong', name: '은평구', x: 90, y: 90 },
        { id: 'seongbuk', name: '성북구', x: 170, y: 110 },
        { id: 'jongno', name: '종로구', x: 150, y: 150 },
        { id: 'dongdaemun', name: '동대문구', x: 210, y: 140 },
        { id: 'jungnang', name: '중랑구', x: 250, y: 130 },
        { id: 'seodaemun', name: '서대문구', x: 100, y: 140 },
        { id: 'jung', name: '중구', x: 150, y: 190 },
        { id: 'seongdong', name: '성동구', x: 195, y: 200 },
        { id: 'gwangjin', name: '광진구', x: 240, y: 190 },
        { id: 'gangdong', name: '강동구', x: 285, y: 210 },
        { id: 'mapo', name: '마포구', x: 90, y: 180 },
        { id: 'yongsan', name: '용산구', x: 150, y: 230 },
        { id: 'gangseo', name: '강서구', x: 45, y: 160 },
        { id: 'yangcheon', name: '양천구', x: 55, y: 210 },
        { id: 'yeongdeungpo', name: '영등포구', x: 100, y: 220 },
        { id: 'dongjak', name: '동작구', x: 115, y: 260 },
        { id: 'seocho', name: '서초구', x: 155, y: 290 },
        { id: 'gangnam', name: '강남구', x: 205, y: 290 },
        { id: 'songpa', name: '송파구', x: 250, y: 260 },
        { id: 'guro', name: '구로구', x: 55, y: 260 },
        { id: 'geumcheon', name: '금천구', x: 70, y: 310 },
        { id: 'gwanak', name: '관악구', x: 110, y: 310 },
    ],
    busan: [
        { id: 'gijang', name: '기장군', x: 240, y: 80 },
        { id: 'geumjeong', name: '금정구', x: 180, y: 80 },
        { id: 'buk', name: '북구', x: 120, y: 100 },
        { id: 'dongnae', name: '동래구', x: 180, y: 125 }, // 조금 위로
        { id: 'haeundae', name: '해운대구', x: 250, y: 150 }, // 조금 오른쪽으로
        { id: 'yeonje', name: '연제구', x: 200, y: 155 }, // 오른쪽 위로 이동 (공간 확보)
        { id: 'busanjin', name: '부산진구', x: 150, y: 165 },
        { id: 'suyeong', name: '수영구', x: 235, y: 185 }, // 해운대와 간격 확보
        { id: 'sasang', name: '사상구', x: 90, y: 160 }, // 왼쪽으로
        { id: 'dong', name: '동구', x: 155, y: 205 }, // 부산진구와 간격 확보
        { id: 'nam', name: '남구', x: 215, y: 215 }, // 오른쪽 아래로
        { id: 'seo', name: '서구', x: 120, y: 225 }, // 왼쪽으로
        { id: 'jung', name: '중구', x: 160, y: 245 }, // 아래로 이동 (겹침 방지)
        { id: 'saha', name: '사하구', x: 70, y: 230 }, // 더 왼쪽으로
        { id: 'yeongdo', name: '영도구', x: 185, y: 280 }, // 아래로
        { id: 'gangseo', name: '강서구', x: 40, y: 170 },
    ],
    daegu: [
        { id: 'gunwi', name: '군위군', x: 150, y: 40 },
        { id: 'buk', name: '북구', x: 150, y: 120 },
        { id: 'dong', name: '동구', x: 210, y: 130 },
        { id: 'seo', name: '서구', x: 110, y: 160 },
        { id: 'jung', name: '중구', x: 150, y: 170 },
        { id: 'suseong', name: '수성구', x: 200, y: 190 },
        { id: 'dalseo', name: '달서구', x: 90, y: 210 },
        { id: 'nam', name: '남구', x: 150, y: 200 },
        { id: 'dalseong', name: '달성군', x: 80, y: 280 },
    ],
    incheon: [
        { id: 'ganghwa', name: '강화군', x: 80, y: 50 },
        { id: 'seo', name: '서구', x: 150, y: 120 },
        { id: 'gyeyang', name: '계양구', x: 210, y: 110 },
        { id: 'bupyeong', name: '부평구', x: 210, y: 160 },
        { id: 'dong', name: '동구', x: 140, y: 170 },
        { id: 'jung', name: '중구', x: 100, y: 200 },
        { id: 'michuhol', name: '미추홀구', x: 160, y: 210 },
        { id: 'namdong', name: '남동구', x: 220, y: 220 },
        { id: 'yeonsu', name: '연수구', x: 170, y: 260 },
        { id: 'ongjin', name: '옹진군', x: 50, y: 260 },
    ],
    gwangju: [
        { id: 'buk', name: '북구', x: 180, y: 100 },
        { id: 'gwangsan', name: '광산구', x: 80, y: 200 },
        { id: 'seo', name: '서구', x: 140, y: 200 },
        { id: 'dong', name: '동구', x: 220, y: 210 },
        { id: 'nam', name: '남구', x: 180, y: 280 },
    ],
    daejeon: [
        { id: 'daedeok', name: '대덕구', x: 200, y: 100 },
        { id: 'yuseong', name: '유성구', x: 100, y: 150 },
        { id: 'seo', name: '서구', x: 130, y: 220 },
        { id: 'jung', name: '중구', x: 190, y: 240 },
        { id: 'dong', name: '동구', x: 240, y: 230 },
    ],
    ulsan: [
        { id: 'buk', name: '북구', x: 200, y: 100 },
        { id: 'dong', name: '동구', x: 250, y: 180 },
        { id: 'jung', name: '중구', x: 170, y: 180 },
        { id: 'nam', name: '남구', x: 200, y: 240 },
        { id: 'ulju', name: '울주군', x: 80, y: 200 },
    ],
    gyeonggi_south: [
        { id: 'gwangmyeong', name: '광명시', x: 60, y: 75 }, // 왼쪽 위로 당김 (부천과 분리, 안양과 분리)
        { id: 'anyang', name: '안양시', x: 110, y: 105 }, // 오른쪽으로 이동 (광명과 분리)
        { id: 'gwacheon', name: '과천시', x: 155, y: 90 }, // 오른쪽 위로
        { id: 'uiwang', name: '의왕시', x: 145, y: 140 },
        { id: 'gunpo', name: '군포시', x: 95, y: 145 }, // 아래로 (안양과 분리)
        { id: 'siheung', name: '시흥시', x: 50, y: 135 },
        { id: 'ansan', name: '안산시', x: 65, y: 190 },
        { id: 'bucheon', name: '부천시', x: 30, y: 50 }, // 극단적 왼쪽 위
        { id: 'hwanam', name: '하남시', x: 215, y: 80 },
        { id: 'seongnam', name: '성남시', x: 190, y: 125 },
        { id: 'gwangju', name: '광주시', x: 230, y: 150 }, // 여주와 거리 유지
        { id: 'yongin', name: '용인시', x: 220, y: 220 },
        { id: 'suwon', name: '수원시', x: 145, y: 185 },
        { id: 'hwaseong', name: '화성시', x: 80, y: 250 },
        { id: 'ocheon', name: '오산시', x: 145, y: 230 },
        { id: 'pyeongtaek', name: '평택시', x: 120, y: 320 },
        { id: 'anseong', name: '안성시', x: 210, y: 310 },
        { id: 'icheon', name: '이천시', x: 270, y: 210 },
        { id: 'yeoju', name: '여주시', x: 290, y: 150 }, // 오른쪽 끝으로
        { id: 'yangpyeong', name: '양평군', x: 265, y: 80 },
    ],
    gyeonggi_north: [
        { id: 'yeoncheon', name: '연천군', x: 120, y: 50 },
        { id: 'paju', name: '파주시', x: 60, y: 100 },
        { id: 'dongducheon', name: '동두천시', x: 150, y: 100 },
        { id: 'yangju', name: '양주시', x: 130, y: 140 },
        { id: 'pocheon', name: '포천시', x: 200, y: 120 },
        { id: 'uijeongbu', name: '의정부시', x: 150, y: 180 },
        { id: 'goyang', name: '고양시', x: 80, y: 200 },
        { id: 'guri', name: '구리시', x: 190, y: 220 },
        { id: 'namyangju', name: '남양주시', x: 240, y: 220 },
        { id: 'gapyeong', name: '가평군', x: 260, y: 150 },
    ],
    gangwon: [
        { id: 'cheorwon', name: '철원군', x: 60, y: 40 },
        { id: 'hwacheon', name: '화천군', x: 110, y: 55 },
        { id: 'yanggu', name: '양구군', x: 155, y: 50 },
        { id: 'goseong', name: '고성군', x: 230, y: 30 }, // 맨 위
        { id: 'sokcho', name: '속초시', x: 240, y: 65 }, // 고성 아래
        { id: 'inje', name: '인제군', x: 190, y: 80 },
        { id: 'chuncheon', name: '춘천시', x: 90, y: 100 }, // 철원 화천 아래
        { id: 'yangyang', name: '양양군', x: 250, y: 100 }, // 속초 아래
        { id: 'hongcheon', name: '홍천군', x: 130, y: 140 },
        { id: 'gangneung', name: '강릉시', x: 240, y: 150 }, // 양양 아래
        { id: 'hoengseong', name: '횡성군', x: 110, y: 190 },
        { id: 'pyeongchang', name: '평창군', x: 180, y: 190 },
        { id: 'jeongseon', name: '정선군', x: 220, y: 230 },
        { id: 'wonju', name: '원주시', x: 80, y: 240 },
        { id: 'yeongwol', name: '영월군', x: 150, y: 260 },
        { id: 'donghae', name: '동해시', x: 270, y: 190 }, // 강릉 아래
        { id: 'taebaek', name: '태백시', x: 250, y: 270 },
        { id: 'samcheok', name: '삼척시', x: 280, y: 230 }, // 동해 아래
    ],
    chungbuk: [
        { id: 'danyang', name: '단양군', x: 240, y: 80 },
        { id: 'jecheon', name: '제천시', x: 200, y: 60 },
        { id: 'chungju', name: '충주시', x: 150, y: 80 },
        { id: 'eumseong', name: '음성군', x: 100, y: 90 },
        { id: 'jincheon', name: '진천군', x: 60, y: 110 },
        { id: 'goesan', name: '괴산군', x: 160, y: 140 },
        { id: 'jeungpyeong', name: '증평군', x: 110, y: 150 },
        { id: 'cheongju', name: '청주시', x: 80, y: 200 },
        { id: 'boeun', name: '보은군', x: 140, y: 240 },
        { id: 'okcheon', name: '옥천군', x: 100, y: 280 },
        { id: 'yeongdong', name: '영동군', x: 120, y: 340 },
    ],
    chungnam: [
        { id: 'dangjin', name: '당진시', x: 100, y: 60 },
        { id: 'asan', name: '아산시', x: 160, y: 80 },
        { id: 'cheonan', name: '천안시', x: 220, y: 70 },
        { id: 'seosan', name: '서산시', x: 50, y: 100 },
        { id: 'taean', name: '태안군', x: 30, y: 130 },
        { id: 'yeosan', name: '예산군', x: 120, y: 120 }, // 예산 오타 수정
        { id: 'hongseong', name: '홍성군', x: 90, y: 160 },
        { id: 'gongju', name: '공주시', x: 180, y: 160 },
        { id: 'cheongyang', name: '청양군', x: 120, y: 200 },
        { id: 'boryeong', name: '보령시', x: 60, y: 220 },
        { id: 'buyeo', name: '부여군', x: 100, y: 260 },
        { id: 'seocheon', name: '서천군', x: 60, y: 310 },
        { id: 'nonsan', name: '논산시', x: 160, y: 250 },
        { id: 'gyeryong', name: '계룡시', x: 200, y: 210 },
        { id: 'geumsan', name: '금산군', x: 230, y: 280 },
    ],
    jeonbuk: [
        { id: 'gunsan', name: '군산시', x: 60, y: 80 },
        { id: 'iksan', name: '익산시', x: 110, y: 80 },
        { id: 'wanju', name: '완주군', x: 160, y: 100 },
        { id: 'jeonju', name: '전주시', x: 140, y: 130 },
        { id: 'gimje', name: '김제시', x: 80, y: 130 },
        { id: 'buan', name: '부안군', x: 40, y: 180 },
        { id: 'jeongeup', name: '정읍시', x: 90, y: 220 },
        { id: 'gochang', name: '고창군', x: 50, y: 280 },
        { id: 'imsil', name: '임실군', x: 160, y: 200 },
        { id: 'jinan', name: '진안군', x: 200, y: 120 },
        { id: 'muju', name: '무주군', x: 250, y: 100 },
        { id: 'jangsu', name: '장수군', x: 240, y: 180 },
        { id: 'namwon', name: '남원시', x: 220, y: 260 },
        { id: 'sunchang', name: '순창군', x: 150, y: 280 },
    ],
    jeonnam: [
        { id: 'yeonggwang', name: '영광군', x: 50, y: 50 },
        { id: 'jangseong', name: '장성군', x: 90, y: 60 },
        { id: 'damyang', name: '담양군', x: 140, y: 60 },
        { id: 'gokseong', name: '곡성군', x: 190, y: 70 },
        { id: 'gurye', name: '구례군', x: 240, y: 80 },
        { id: 'hampyeong', name: '함평군', x: 60, y: 100 },
        { id: 'gwangyang', name: '광양시', x: 260, y: 130 },
        { id: 'suncheon', name: '순천시', x: 220, y: 140 },
        { id: 'hwasun', name: '화순군', x: 160, y: 130 },
        { id: 'naju', name: '나주시', x: 100, y: 140 },
        { id: 'muan', name: '무안군', x: 50, y: 150 },
        { id: 'mokpo', name: '목포시', x: 30, y: 180 },
        { id: 'yeongam', name: '영암군', x: 80, y: 190 },
        { id: 'boseong', name: '보성군', x: 180, y: 200 },
        { id: 'jangheung', name: '장흥군', x: 130, y: 230 },
        { id: 'gangjin', name: '강진군', x: 90, y: 240 },
        { id: 'haenam', name: '해남군', x: 50, y: 260 },
        { id: 'jindo', name: '진도군', x: 30, y: 320 },
        { id: 'wando', name: '완도군', x: 90, y: 350 },
        { id: 'goheung', name: '고흥군', x: 210, y: 260 },
        { id: 'yeosu', name: '여수시', x: 270, y: 200 },
        { id: 'sinan', name: '신안군', x: 20, y: 120 },
    ],
    gyeongbuk: [
        { id: 'yeongju', name: '영주시', x: 150, y: 40 },
        { id: 'bonghwa', name: '봉화군', x: 200, y: 40 },
        { id: 'uljin', name: '울진군', x: 260, y: 60 },
        { id: 'yecheon', name: '예천군', x: 110, y: 60 },
        { id: 'mungyeong', name: '문경시', x: 60, y: 70 },
        { id: 'andong', name: '안동시', x: 160, y: 90 },
        { id: 'yeongyang', name: '영양군', x: 220, y: 90 },
        { id: 'yeongdeok', name: '영덕군', x: 270, y: 130 },
        { id: 'sangju', name: '상주시', x: 70, y: 120 },
        { id: 'uiseong', name: '의성군', x: 150, y: 140 },
        { id: 'cheongsong', name: '청송군', x: 210, y: 150 },
        { id: 'gimcheon', name: '김천시', x: 50, y: 180 },
        { id: 'gumi', name: '구미시', x: 100, y: 180 },
        { id: 'chilgok', name: '칠곡군', x: 120, y: 220 },
        { id: 'pohang', name: '포항시', x: 260, y: 200 },
        { id: 'yeongcheon', name: '영천시', x: 200, y: 230 },
        { id: 'seongju', name: '성주군', x: 80, y: 230 },
        { id: 'goryeong', name: '고령군', x: 70, y: 270 },
        { id: 'gyeongsan', name: '경산시', x: 180, y: 270 },
        { id: 'gyeongju', name: '경주시', x: 240, y: 260 },
        { id: 'cheongdo', name: '청도군', x: 190, y: 310 },
    ],
    gyeongnam: [
        { id: 'geochang', name: '거창군', x: 60, y: 50 },
        { id: 'hapcheon', name: '합천군', x: 110, y: 80 },
        { id: 'changnyeong', name: '창녕군', x: 160, y: 90 },
        { id: 'hamyang', name: '함양군', x: 40, y: 100 },
        { id: 'sancheong', name: '산청군', x: 70, y: 140 },
        { id: 'uiryeong', name: '의령군', x: 130, y: 140 },
        { id: 'haman', name: '함안군', x: 170, y: 160 },
        { id: 'milryang', name: '밀양시', x: 210, y: 120 }, // 밀양 오타 수정
        { id: 'yangsan', name: '양산시', x: 260, y: 140 },
        { id: 'hadong', name: '하동군', x: 40, y: 180 },
        { id: 'jinju', name: '진주시', x: 90, y: 190 },
        { id: 'sacheon', name: '사천시', x: 100, y: 240 },
        { id: 'goseong', name: '고성군', x: 130, y: 230 },
        { id: 'changwon', name: '창원시', x: 190, y: 190 },
        { id: 'gimhae', name: '김해시', x: 240, y: 180 },
        { id: 'namhae', name: '남해군', x: 70, y: 280 },
        { id: 'tongyeong', name: '통영시', x: 140, y: 280 },
        { id: 'geoje', name: '거제시', x: 190, y: 280 },
    ],
    jeju: [
        { id: 'jeju', name: '제주시', x: 150, y: 120 },
        { id: 'seogwipo', name: '서귀포시', x: 150, y: 280 },
    ],
    sejong: [
        { id: 'all', name: '세종특별자치시', x: 150, y: 200 },
    ],
    ulleung: [
        { id: 'ulleungdo', name: '울릉도', x: 150, y: 150 },
        { id: 'dokdo', name: '독도', x: 220, y: 200 }
    ],
};