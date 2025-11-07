import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MapPin, Bed, Square, Phone, Share, Heart } from 'lucide-react'
import { listingAPI } from '../services/api'
import MapView from '../components/MapView'

function ListingDetailPage() {
  const { id } = useParams()
  const [activeImage, setActiveImage] = useState(0)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 从API获取房源详情
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true)
        const response = await listingAPI.getListing(id)
        setListing(response.data)
        setError(null)
      } catch (err) {
        console.error('获取房源详情失败:', err)
        setError('获取房源详情失败，请稍后重试')
        // 如果API失败，使用模拟数据作为fallback
        const mockListing = {
          id: parseInt(id),
          title: '南山区高新园精装两房',
          city: '深圳',
          district: '南山区',
          address: '高新园科技园南区',
          price: 6500,
          house_type: '2室1厅',
          area: 75,
          description: '精装修，家电齐全，近地铁站，周边配套设施完善。房间采光良好，通风透气，适合白领居住。',
          contact_phone: '138-0013-8000',
          features: ['精装修', '家电齐全', '近地铁', '拎包入住', '可短租'],
          amenities: ['WiFi', '空调', '洗衣机', '冰箱', '热水器', '电视']
        }
        setListing(mockListing)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id])

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  if (error && !listing) {
    return <div className="flex justify-center items-center h-64 text-red-600">{error}</div>
  }

  if (!listing) {
    return <div className="flex justify-center items-center h-64">房源不存在</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-gray-900">首页</a>
        <span>/</span>
        <a href="/listings" className="hover:text-gray-900">房源列表</a>
        <span>/</span>
        <span className="text-gray-900">{listing.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主要内容区域 */}
        <div className="lg:col-span-2">
          {/* 图片画廊 */}
          <div className="mb-6">
            <div className="bg-gray-200 rounded-lg h-96 mb-4 flex items-center justify-center">
              <span className="text-gray-500">房源主图</span>
            </div>
            <div className="flex space-x-2">
              {listing.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-20 h-20 bg-gray-200 rounded ${
                    activeImage === index ? 'ring-2 ring-primary-500' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 房源基本信息 */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Share className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{listing.city} {listing.district} {listing.address}</span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <Bed className="h-5 w-5 mr-2" />
                <span>{listing.house_type}</span>
              </div>
              <div className="flex items-center">
                <Square className="h-5 w-5 mr-2" />
                <span>{listing.area}㎡</span>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-primary-600 mb-6">¥{listing.price}/月</div>
            
            {/* 房源特色标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {listing.features.map((feature, index) => (
                <span key={index} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                  {feature}
                </span>
              ))}
            </div>
            
            {/* 详细描述 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">房源描述</h3>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>
          </div>

          {/* 配套设施 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">配套设施</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listing.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 侧边栏 - 联系信息 */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">联系房东</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{listing.contact_phone}</div>
                <div className="text-sm text-gray-600 mt-1">联系电话</div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-600">微</span>
                </div>
                <div className="text-xl font-semibold text-gray-900">{listing.contact_wechat}</div>
                <div className="text-sm text-gray-600 mt-1">微信号码</div>
              </div>
              
              <button className="btn-primary w-full">立即联系</button>
              <button className="btn-secondary w-full">收藏房源</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetailPage