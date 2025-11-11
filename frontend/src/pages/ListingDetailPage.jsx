import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MapPin, Bed, Square, Phone, Share, Heart, MessageCircle, Mail, Star } from 'lucide-react'
import { listingAPI, userAPI } from '../services/api'
import MapView from '../components/MapView'

// 咨询模态框组件
const InquiryModal = ({ isOpen, onClose, listing, onSubmit }) => {
  const [formData, setFormData] = useState({
    message: '',
    contactPhone: '',
    contactWechat: ''
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ ...formData, listingId: listing.id })
      onClose()
      setFormData({ message: '', contactPhone: '', contactWechat: '' })
    } catch (error) {
      console.error('提交咨询失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">联系房东</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              咨询内容
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="请输入您想咨询的问题..."
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="4"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系电话（可选）
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              placeholder="138-0013-8000"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              微信号（可选）
            </label>
            <input
              type="text"
              value={formData.contactWechat}
              onChange={(e) => setFormData({...formData, contactWechat: e.target.value})}
              placeholder="wechat123"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? '提交中...' : '提交咨询'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ListingDetailPage() {
  const { id } = useParams()
  const [activeImage, setActiveImage] = useState(0)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [user, setUser] = useState(null)
  const [contactLoading, setContactLoading] = useState(false)
  
  // 检查用户登录状态
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // 这里可以添加获取用户信息的逻辑
          // 暂时使用简单的检查
          setUser({ id: 1, username: '当前用户' })
        }
      } catch (error) {
        console.error('检查用户状态失败:', error)
      }
    }
    
    checkUserStatus()
  }, [])

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
          contact_wechat: 'wechat123',
          images: [
            'https://picsum.photos/800/600?random=1',
            'https://picsum.photos/800/600?random=2',
            'https://picsum.photos/800/600?random=3'
          ],
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

  // 处理收藏功能
  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('请先登录后再收藏房源')
      return
    }
    
    try {
      if (isFavorite) {
        await userAPI.removeFavorite(listing.id)
        setIsFavorite(false)
        alert('取消收藏成功')
      } else {
        await userAPI.addFavorite(listing.id)
        setIsFavorite(true)
        alert('收藏成功')
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      alert('操作失败，请稍后重试')
    }
  }

  // 处理直接联系房东
  const handleDirectContact = async () => {
    if (!user) {
      alert('请先登录后再联系房东')
      return
    }
    
    setContactLoading(true)
    try {
      const inquiryData = {
        listingId: listing.id,
        message: `您好，我对您的房源"${listing.title}"很感兴趣，想了解更多详情。`,
        contactPhone: user.phone || '',
        contactWechat: user.wechat || ''
      }
      
      await userAPI.submitInquiry(inquiryData)
      alert('咨询提交成功，房东会尽快联系您')
    } catch (error) {
      console.error('提交咨询失败:', error)
      alert('提交咨询失败，请稍后重试')
    } finally {
      setContactLoading(false)
    }
  }

  // 处理表单提交咨询
  const handleInquirySubmit = async (inquiryData) => {
    try {
      await userAPI.submitInquiry(inquiryData)
      alert('咨询提交成功，房东会尽快联系您')
    } catch (error) {
      console.error('提交咨询失败:', error)
      throw error
    }
  }

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
            <div className="bg-gray-200 rounded-lg h-96 mb-4 flex items-center justify-center overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <img 
                  src={listing.images[activeImage]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">暂无图片</span>
              )}
            </div>
            {listing.images && listing.images.length > 0 && (
              <div className="flex space-x-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 rounded overflow-hidden ${
                      activeImage === index ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${listing.title}缩略图${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 房源基本信息 */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
              <div className="flex space-x-2">
                <button 
                  onClick={handleFavoriteToggle}
                  className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-600 transition-colors`}
                  title={isFavorite ? '取消收藏' : '收藏房源'}
                >
                  <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
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
              
              <button 
                onClick={handleDirectContact}
                disabled={contactLoading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {contactLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    提交中...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    立即联系
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setShowInquiryModal(true)}
                className="btn-secondary w-full flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                详细咨询
              </button>
              
              <button 
                onClick={handleFavoriteToggle}
                className={`w-full flex items-center justify-center py-2 px-4 rounded-md border transition-colors ${
                  isFavorite 
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className="h-4 w-4 mr-2" fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? '已收藏' : '收藏房源'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 咨询模态框 */}
      <InquiryModal 
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        listing={listing}
        onSubmit={handleInquirySubmit}
      />
    </div>
  )
}

export default ListingDetailPage