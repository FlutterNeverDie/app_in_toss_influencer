import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
    appName: 'influencer',
    outdir: 'dist',
    brand: {
        displayName: '인플루언서 맵',
        primaryColor: '#3182F6',
        icon: './public/logo.png',
    },
    web: {
        commands: {
            build: 'npm run build',
            dev: 'npm run dev', // --host option is already in package.json
        },
        port: 5173,
        host: '192.168.219.100',
    },
    permissions: [],
    webViewProps: {
        type: 'partner',
    },
});
