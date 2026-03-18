import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/index.js'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { IssueProvider } from './contexts/IssueContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './ErrorBoundary.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id.apps.googleusercontent.com'}>
      <ThemeProvider>
      <AuthProvider>
        <IssueProvider>
          <ErrorBoundary>
            <App />
          <Toaster
            position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: 'var(--text-primary)', secondary: 'var(--bg-primary)' } },
            error: { iconTheme: { primary: 'var(--color-danger)', secondary: '#fff' } },
          }}
        />
        </ErrorBoundary>
        </IssueProvider>
      </AuthProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
