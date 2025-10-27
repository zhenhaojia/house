import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, MapPin, Bed, Square } from 'lucide-react'
import { listingAPI } from '../services/api'

function ListingsPage() {
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
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
        const response = await listingAPI.getListings(filters)
        // 正确访问嵌套的数据结构
        const listingsData = response.data?.data?.listings || []
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
                  <div className={viewMode === 'grid' ? 'h-48 bg-gray-200 rounded-t-lg' : 'w-48 h-32 bg-gray-200 rounded-l-lg'} />
                  
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
                    
                    <button className="btn-primary w-full">查看详情</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingsPage