import React from 'react'
import { MainScreen } from './presentation/screens/s_main_screen'
import { GlobalOverlay } from './presentation/widgets/w_global_overlay';
import './index.css'
import { TDSMobileProvider, PortalProvider } from '@toss/tds-mobile';
import { BrowserRouter } from 'react-router-dom';

import ReactDOM from 'react-dom/client'

const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

// Define the App component that was previously rendered directly
const App = () => {
  return (
    <TDSMobileProvider userAgent={userAgent as any}>
      <PortalProvider>
        <MainScreen />
        <GlobalOverlay />
      </PortalProvider>
    </TDSMobileProvider>
  );
};

const AppContainer = () => {
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
