import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Menu, 
  X,
  Activity,
  Building2,
  Bell,
  Settings,
  User
} from 'lucide-react'
import { ComponentWithChildren } from '../../types'

interface LayoutProps extends ComponentWithChildren {
  currentPath: string
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: BarChart3,
      current: currentPath === '/'
    },
    {
      name: 'Market Research',
      href: '/market',
      icon: TrendingUp,
      current: currentPath === '/market'
    },
    {
      name: 'Trading',
      href: '/trading',
      icon: Activity,
      current: currentPath === '/trading'
    },
    {
      name: 'Education',
      href: '/education',
      icon: BookOpen,
      current: currentPath === '/education'
    }
  ]

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-white" />
              <span className="ml-3 text-xl font-bold text-white">SmartInvestor</span>
            </div>
            <button
              className="lg:hidden text-white hover:bg-white/20 p-1 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${item.current
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${item.current 
                      ? 'text-blue-600' 
                      : 'text-gray-500 group-hover:text-gray-700'
                    }
                  `} />
                  {item.name}
                  {item.current && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </a>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              <div className="font-medium">SmartInvestor Pro</div>
              <div className="mt-1">v2.0.0 • Enterprise</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Breadcrumb or page title could go here */}
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Live Data</span>
            </div>

            {/* Notifications */}
            <button className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Settings */}
            <button className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100">
              <Settings className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">Investor</div>
                <div className="text-xs text-gray-500">Professional Plan</div>
              </div>
              <button className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                <User className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 