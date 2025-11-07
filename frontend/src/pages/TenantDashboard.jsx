import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageSquare, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function TenantDashboard() {
  const [activeTab, setActiveTab] = useState('favorites')
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites()
    }
  }, [activeTab])

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8010/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFavorites(result.data.favorites || [])
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (listingId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8010/api/users/favorites/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFavorites(favorites.filter(fav => fav.id !== listingId))
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
    }
  }

  const tabs = [
    { id: 'favorites', name: '我的收藏', icon: Heart },
    { id: 'inquiries', name: '我的咨询', icon: MessageSquare },
    { id: 'profile', name: '个人信息', icon: User },
    { id: 'settings', name: '设置', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-bold text-primary-600">
                易租网
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">租客中心</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">欢迎，{user?.username}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                {activeTab === 'favorites' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">我的收藏</h2>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">加载中...</p>
                      </div>
                    ) : favorites.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="mt-2 text-gray-500">暂无收藏房源</p>
                        <Link
                          to="/listings"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                          去浏览房源
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((listing) => (
                          <div key={listing.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative">
                              <img
                                src={listing.main_image_url || '/api/placeholder/300/200'}
                                alt={listing.title}
                                className="w-full h-48 object-cover"
                              />
                              <button
                                onClick={() => removeFavorite(listing.id)}
                                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600"
                                title="取消收藏"
                              >
                                <Heart className="h-4 w-4 fill-current" />
                              </button>
                            </div>
                            <div className="p-4">
                              <Link
                                to={`/listings/${listing.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                              >
                                {listing.title}
                              </Link>
                              <p className="text-gray-600 text-sm mt-1">
                                {listing.city} {listing.district}
                              </p>
                              <div className="flex justify-between items-center mt-3">
                                <span className="text-lg font-bold text-primary-600">
                                  ¥{listing.price}/月
                                </span>
                                <span className="text-sm text-gray-500">
                                  {listing.house_type} · {listing.area}㎡
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'inquiries' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">我的咨询</h2>
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto" />
                      <p className="mt-2 text-gray-500">暂无咨询记录</p>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">个人信息</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">用户名</label>
                        <p className="mt-1 text-gray-900">{user?.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">邮箱</label>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">手机号</label>
                        <p className="mt-1 text-gray-900">{user?.phone || '未设置'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">注册时间</label>
                        <p className="mt-1 text-gray-900">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">设置</h2>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <p className="text-yellow-800 text-sm">
                          设置功能正在开发中，敬请期待...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenantDashboard