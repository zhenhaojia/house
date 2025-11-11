import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, MapPin, Bed, Square, Eye, XCircle } from 'lucide-react'
import { listingAPI } from '../services/api'
import SmartImage from '../components/ImagePlaceholder'

function ListingsPage() {
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [viewingListing, setViewingListing] = useState(null)
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    priceMin: '',
    priceMax: '',
    houseType: '',
    sortBy: 'newest'
  })

  // 从API获取房源数据
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        // 确保首页只显示已发布的房源
        const response = await listingAPI.getListings({ ...filters, status: 'published' })
        // 正确访问嵌套的数据结构
        const listingsData = response?.data?.listings || []
        setListings(listingsData)
        setError(null)
      } catch (err) {
        console.error('获取房源列表失败:', err)
        setError('获取房源列表失败，请稍后重试')
        // 不再使用模拟数据，直接设置空数组
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [filters])

  // 查看房源详情
  const handleViewListing = (listing) => {
    // 统一处理字段名映射，确保前端使用驼峰命名
    const processedListing = {
      ...listing,
      // 如果后端返回蛇形命名，转换为驼峰命名
      contactName: listing.contact_name || listing.contactName,
      contactPhone: listing.contact_phone || listing.contactPhone,
      contactWechat: listing.contact_wechat || listing.contactWechat,
      houseType: listing.house_type || listing.houseType,
      // 保持原有的蛇形命名字段以便向后兼容
      contact_name: listing.contact_name,
      contact_phone: listing.contact_phone,
      contact_wechat: listing.contact_wechat,
      house_type: listing.house_type
    }
    
    setViewingListing(processedListing)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题和视图切换 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">房源列表</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* 筛选侧边栏 */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">筛选条件</h3>
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {/* 城市筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  placeholder="输入城市名称"
                  className="input-field"
                />
              </div>
              
              {/* 价格范围 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">价格范围</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="最低"
                    className="input-field"
                  />
                  <input
                    type="number"
                    placeholder="最高"
                    className="input-field"
                  />
                </div>
              </div>
              
              {/* 户型筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">户型</label>
                <select className="input-field">
                  <option value="">全部户型</option>
                  <option value="1室">1室</option>
                  <option value="2室">2室</option>
                  <option value="3室">3室</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 房源列表 */}
        <div className="lg:col-span-3">
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'}>
            {listings.map((listing) => (
              <div key={listing.id} className="card hover:shadow-md transition-shadow">
                <div className={viewMode === 'grid' ? '' : 'flex'}>
                  {/* 房源图片 */}
                  <div className={viewMode === 'grid' ? 'relative h-48 rounded-t-lg overflow-hidden' : 'relative w-48 h-32 rounded-l-lg overflow-hidden'}>
                    <SmartImage
                      src={listing.images && listing.images.length > 0 ? listing.images[0] : null}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                      size="medium"
                      variant="house"
                      message="暂无图片"
                      containerClass="w-full h-full"
                      lazy={true}
                    />
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                      <span className="text-xl font-bold text-primary-600">¥{listing.price}/月</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.city} {listing.district}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{listing.houseType}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span>{listing.area}㎡</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                    
                    <button 
                      className="btn-primary w-full"
                      onClick={() => handleViewListing(listing)}
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      查看详情
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

            {/* 房源图片 */}
            <div className="relative h-64">
              <SmartImage
                src={viewingListing.images && viewingListing.images.length > 0 ? viewingListing.images[0] : null}
                alt={viewingListing.title}
                className="w-full h-full object-cover"
                size="large"
                variant="house"
                message="暂无房源图片"
                containerClass="w-full h-full"
                lazy={true}
              />
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
                    <p className="text-gray-900">{viewingListing.house_type || viewingListing.houseType || '未填写'}</p>
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
                    <p className="text-gray-900">{viewingListing.contact_name || viewingListing.contactName || '未填写'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                    <p className="text-gray-900">{viewingListing.contact_phone || viewingListing.contactPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">微信</label>
                    <p className="text-gray-900">{viewingListing.contact_wechat || viewingListing.contactWechat || '未填写'}</p>
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListingsPage