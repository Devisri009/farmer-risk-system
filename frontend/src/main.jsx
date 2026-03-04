import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './config/i18n'
import { AuthProvider } from './context/AuthContext'
import { Web3Provider } from './context/Web3Context'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Web3Provider>
        <App />
      </Web3Provider>
    </AuthProvider>
  </React.StrictMode>,
)
