import React, { useEffect } from 'react'
import { MainScreen } from './presentation/screens/s_main_screen'
import './index.css'
import { TDSMobileProvider, PortalProvider } from '@toss/tds-mobile';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from './presentation/stores/auth_store';

import ReactDOM from 'react-dom/client'

const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

// Define the App component that was previously rendered directly
const App = () => {
  return (
    <TDSMobileProvider userAgent={userAgent as any}>
      <PortalProvider>
        <MainScreen />
      </PortalProvider>
    </TDSMobileProvider>
  );
};

const AppContainer = () => {
  const autoLogin = useAuthStore(state => state.autoLogin);

  useEffect(() => {
    // 앱 시작 시 토스 자동 로그인 시도
    autoLogin().catch(err => console.error('Auto login failed:', err));
  }, [autoLogin]);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>
)
