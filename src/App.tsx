import React from 'react'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import Trading from './pages/Trading'
import Education from './pages/Education'
import Layout from './components/layout/Layout'
import StatusIndicator from './components/ui/StatusIndicator'
import { useRouter, useNavigationHandler } from './hooks/useRouter'
import { ThemeProvider } from './contexts/ThemeContext'

const App: React.FC = () => {
  const { currentPath } = useRouter()
  useNavigationHandler()

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard />
      case '/market':
        return <Market />
      case '/trading':
        return <Trading />
      case '/education':
        return <Education />
      default:
        return <Dashboard />
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Layout currentPath={currentPath}>
          {renderPage()}
        </Layout>
        {/* Always show status indicator, never block the UI */}
        <StatusIndicator />
      </div>
    </ThemeProvider>
  )
}

export default App 