export default {
    // 토스 미니앱 설정
    type: 'webview',
    appName: 'influencer',
    outdir: 'dist',

    // 빌드 명령어 설정 (Vite 기반)
    web: {
        commands: {
            build: 'npm run build',
            dev: 'npm run dev',
        },
        port: 5173,
    },

    // 브랜딩 정보
    brand: {
        displayName: '인플루언서 맵',
        // primaryColor: '#3182F6', // 토스 블루 (필요시 수정)
    },
};
