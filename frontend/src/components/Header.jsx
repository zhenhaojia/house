import { Link, useLocation } from 'react-router-dom'
import { Search, Home, Building, LogOut, User, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Header() {
  const location = useLocation()
  const { isAuthenticated, user, logout, isTenant, isLandlord } = useAuth()
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">易居租房</span>
          </Link>
          
          {/* 搜索框 */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索城市、区域或小区名称..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 导航链接 */}
          <nav className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>首页</span>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* 租客功能入口 */}
                {isTenant() && (
                  <Link 
                    to="/tenant/dashboard"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/tenant/dashboard' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    <span>我的收藏</span>
                  </Link>
                )}
                
                {/* 后台管理入口 */}
                {isLandlord() && (
                  <Link 
                    to="/admin/dashboard"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/admin/dashboard' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>管理后台</span>
                  </Link>
                )}
                
                {/* 用户信息和登出 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">欢迎，{user?.username}</span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                    title="退出登录"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>退出</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/tenant/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors"
                >
                  租客登录
                </Link>
                <span className="text-gray-300">|</span>
                <Link 
                  to="/admin/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors"
                >
                  房东入口
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header