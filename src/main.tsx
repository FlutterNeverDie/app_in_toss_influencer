import React from 'react'
import ReactDOM from 'react-dom/client'
import { MainScreen } from './presentation/screens/s_main_screen'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MainScreen />
  </React.StrictMode>,
)
