import React from 'react'
import { MainScreen } from './presentation/screens/s_main_screen'
import './index.css'
import { TDSMobileProvider, PortalProvider } from '@toss/tds-mobile';

import ReactDOM from 'react-dom/client'

const originalUserAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

// Vercel, ngrok 또는 로컬 개발 환경에서 일반 브라우저로 접속 시 TDS 차단을 피하기 위해 User-Agent를 모킹합니다.
const isPreviewMode = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('ngrok') ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) && !originalUserAgent.includes('Toss');

const userAgent = isPreviewMode
  ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Toss/5.33.0'
  : originalUserAgent;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TDSMobileProvider userAgent={userAgent as any}>
      <PortalProvider>
        <MainScreen />
      </PortalProvider>
    </TDSMobileProvider>
  </React.StrictMode>
)
