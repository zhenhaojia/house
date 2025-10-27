import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, BarChart3, Users, Home, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { listingAPI } from '../../services/api'
import ListingForm from '../../components/ListingForm'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState({
    totalListings: 0,
    publishedListings: 0,
    pendingListings: 0,
    todayListings: 0
  })
  const [loading, setLoading] = useState(true)
  const [showListingForm, setShowListingForm] = useState(false)
  const [editingListing, setEditingListing] = useState(null)
  const [viewingListing, setViewingListing] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 检查认证状态
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')
    
    if (!token || !user) {
      // 未登录，跳转到登录页
      navigate('/admin/login')
      return
    }
    
    setIsAuthenticated(true)
  }, [navigate])

  // 返回首页
  const handleGoHome = () => {
    navigate('/')
  }

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  // 获取房源数据
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 获取所有房源（包括待审核的）
      const response = await listingAPI.getListings({ status: 'all' })
      // 正确访问嵌套的数据结构
      const listingsData = response.data?.data?.listings || []
      setListings(listingsData)
      
      // 计算统计数据
      const total = listingsData.length || 0
      const published = listingsData.filter(l => l.status === 'published').length || 0
      const pending = listingsData.filter(l => l.status === 'pending').length || 0
      const today = listingsData.filter(l => 
        new Date(l.created_at).toDateString() === new Date().toDateString()
      ).length || 0
      
      setStats({
        totalListings: total,
        publishedListings: published,
        pendingListings: pending,
        todayListings: today
      })
    } catch (error) {
      console.error('获取数据失败:', error)
      // 使用模拟数据作为fallback
      const mockListings = [
        {
          id: 1,
          title: '南山区高新园精装两房',
          city: '深圳',
          price: 6500,
          status: 'published',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          title: '朝阳区国贸一室一厅',
          city: '北京',
          price: 8500,
          status: 'pending',
          created_at: '2024-01-14'
        },
        {
          id: 3,
          title: '待审核房源 - 朝阳区豪华公寓',
          city: '北京',
          price: 15000,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]
      setListings(mockListings)
      setStats({
        totalListings: mockListings.length,
        publishedListings: mockListings.filter(l => l.status === 'published').length,
        pendingListings: mockListings.filter(l => l.status === 'pending').length,
        todayListings: 1
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 房源发布成功后的回调
  const handleListingSuccess = (newListing) => {
    // 刷新数据
    fetchData()
  }

  // 查看房源详情
  const handleViewListing = (listing) => {
    setViewingListing(listing)
  }

  // 编辑房源
  const handleEditListing = (listing) => {
    setEditingListing(listing)
    setShowListingForm(true)
  }

  // 删除房源
  const handleDeleteListing = async (listing) => {
    if (!window.confirm(`确定要删除房源"${listing.title}"吗？此操作不可撤销。`)) {
      return
    }

    try {
      const response = await listingAPI.deleteListing(listing.id)
      if (response.success) {
        // 刷新数据
        fetchData()
      } else {
        alert('删除失败：' + (response.error || '未知错误'))
      }
    } catch (error) {
      console.error('删除房源错误:', error)
      alert('删除失败，请稍后重试')
    }
  }

  // 如果未认证，不渲染内容
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证登录状态...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoHome}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回首页
              </button>
              <h1 className="text-xl font-bold text-gray-900">房源管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎，{JSON.parse(localStorage.getItem('adminUser') || '{}').username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                退出登录
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowListingForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                发布新房源
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 数据统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Home className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总房源数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已发布</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedListings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待审核</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingListings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日新增</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayListings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'listings', name: '房源管理', icon: Home },
              { id: 'analytics', name: '数据统计', icon: BarChart3 },
              { id: 'settings', name: '系统设置', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 房源管理内容 */}
        {activeTab === 'listings' && (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">房源列表</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      房源信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      城市
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      发布时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{listing.price}/月
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          listing.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status === 'published' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleViewListing(listing)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          查看
                        </button>
                        <button 
                          onClick={() => handleEditListing(listing)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDeleteListing(listing)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 inline mr-1" />
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 数据统计内容 */}
        {activeTab === 'analytics' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">数据统计</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">房源状态分布</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>已发布</span>
                    <span className="font-medium">{stats.publishedListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>待审核</span>
                    <span className="font-medium">{stats.pendingListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>今日新增</span>
                    <span className="font-medium">{stats.todayListings}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">城市分布</h3>
                <div className="space-y-2">
                  {Array.from(new Set(listings.map(l => l.city))).slice(0, 5).map(city => (
                    <div key={city} className="flex justify-between">
                      <span>{city}</span>
                      <span className="font-medium">{listings.filter(l => l.city === city).length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 系统设置内容 */}
        {activeTab === 'settings' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">系统设置</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">基本设置</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="auto-publish" className="mr-2" />
                    <label htmlFor="auto-publish">自动发布房源（无需审核）</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="email-notification" className="mr-2" />
                    <label htmlFor="email-notification">邮件通知新房源</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 房源发布表单 */}
      <ListingForm 
        isOpen={showListingForm}
        onClose={() => {
          setShowListingForm(false)
          setEditingListing(null)
        }}
        onSuccess={handleListingSuccess}
        editingListing={editingListing}
      />

      {/* 房源详情查看模态框 */}
      {viewingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">房源详情</h2>
              <button
                onClick={() => setViewingListing(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* 详情内容 */}
            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">房源标题</label>
                    <p className="text-gray-900">{viewingListing.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">所在城市</label>
                    <p className="text-gray-900">{viewingListing.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">区域/商圈</label>
                    <p className="text-gray-900">{viewingListing.district || '未填写'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">详细地址</label>
                    <p className="text-gray-900">{viewingListing.address || '未填写'}</p>
                  </div>
                </div>
              </div>

              {/* 房源详情 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">房源详情</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">月租金</label>
                    <p className="text-gray-900">¥{viewingListing.price}/月</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">户型</label>
                    <p className="text-gray-900">{viewingListing.houseType || '未填写'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">面积</label>
                    <p className="text-gray-900">{viewingListing.area ? `${viewingListing.area}㎡` : '未填写'}</p>
                  </div>
                </div>
                {viewingListing.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">房源描述</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingListing.description}</p>
                  </div>
                )}
              </div>

              {/* 联系方式 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">联系方式</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                    <p className="text-gray-900">{viewingListing.contactName || '未填写'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                    <p className="text-gray-900">{viewingListing.contactPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">微信</label>
                    <p className="text-gray-900">{viewingListing.contactWechat || '未填写'}</p>
                  </div>
                </div>
              </div>

              {/* 状态信息 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">状态信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">发布状态</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      viewingListing.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {viewingListing.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
                    <p className="text-gray-900">{viewingListing.createdAt || '未知'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingListing(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  handleEditListing(viewingListing)
                  setViewingListing(null)
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                编辑房源
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard