import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/index.js'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { IssueProvider } from './contexts/IssueContext.jsx'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './ErrorBoundary.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <IssueProvider>
        <ErrorBoundary>
          <App />
          <Toaster
            position="top-right"
          toastOptions={{
            style: {
              background: '#1a2744',
              color: '#f0f4ff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        </ErrorBoundary>
      </IssueProvider>
    </AuthProvider>
  </React.StrictMode>,
)
