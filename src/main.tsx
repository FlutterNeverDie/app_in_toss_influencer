import React from 'react'
import { MainScreen } from './presentation/screens/s_main_screen'
import './index.css'
import { TDSMobileProvider, PortalProvider } from '@toss/tds-mobile';

import ReactDOM from 'react-dom/client'

const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TDSMobileProvider userAgent={userAgent as any}>
      <PortalProvider>
        <MainScreen />
      </PortalProvider>
    </TDSMobileProvider>
  </React.StrictMode>
)
