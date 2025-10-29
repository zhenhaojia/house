import { useState, useEffect } from 'react'
import { X, Upload, MapPin, Bed, Square, DollarSign } from 'lucide-react'
import { listingAPI } from '../services/api'

function ListingForm({ isOpen, onClose, onSuccess, editingListing }) {
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    district: '',
    address: '',
    price: '',
    houseType: '',
    area: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactWechat: '',
    status: 'published'
  })
  
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆']
  const houseTypes = ['1室0厅', '1室1厅', '2室1厅', '2室2厅', '3室1厅', '3室2厅', '4室2厅', '其他']

  // 当编辑房源时，填充表单数据
  useEffect(() => {
    if (editingListing) {
      setFormData({
        title: editingListing.title || '',
        city: editingListing.city || '',
        district: editingListing.district || '',
        address: editingListing.address || '',
        price: editingListing.price || '',
        houseType: editingListing.house_type || '',
        area: editingListing.area || '',
        description: editingListing.description || '',
        contactName: editingListing.contact_name || '',
        contactPhone: editingListing.contact_phone || '',
        contactWechat: editingListing.contact_wechat || '',
        status: editingListing.status || 'published'
      })
    } else {
      // 重置表单
      setFormData({
        title: '',
        city: '',
        district: '',
        address: '',
        price: '',
        houseType: '',
        area: '',
        description: '',
        contactName: '',
        contactPhone: '',
        contactWechat: '',
        status: 'published'
      })
      setImages([])
    }
  }, [editingListing, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 验证必填字段
      if (!formData.title || !formData.city || !formData.price || !formData.contactPhone) {
        throw new Error('请填写必填字段：标题、城市、价格、联系电话')
      }

      // 准备提交数据 - 确保字段名与后端一致
      const submitData = {
        title: formData.title,
        city: formData.city,
        district: formData.district,
        address: formData.address,
        price: parseInt(formData.price),
        houseType: formData.houseType,  // 确保字段名一致
        area: formData.area ? parseInt(formData.area) : null,
        description: formData.description,
        contactName: formData.contactName,  // 确保字段名一致
        contactPhone: formData.contactPhone,
        contactWechat: formData.contactWechat,
        status: formData.status,
        images: images.map(img => img.name)
      }
      
      // 调试日志：打印提交的数据
      console.log('提交的数据:', submitData)
      console.log('编辑房源ID:', editingListing?.id)

      let response
      
      if (editingListing) {
        // 编辑房源
        response = await listingAPI.updateListing(editingListing.id, submitData)
      } else {
        // 创建新房源
        response = await listingAPI.createListing(submitData)
      }
      
      if (response.success) {
        // 清空表单
        setFormData({
          title: '',
          city: '',
          district: '',
          address: '',
          price: '',
          houseType: '',
          area: '',
          description: '',
          contactName: '',
          contactPhone: '',
          contactWechat: '',
          status: 'published'
        })
        setImages([])
        
        // 触发成功回调
        onSuccess(response.data)
        onClose()
      } else {
        throw new Error(response.error || (editingListing ? '更新失败' : '发布失败'))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingListing ? '编辑房源' : '发布新房源'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房源标题 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：南山区高新园精装两房"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所在城市 *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">选择城市</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  区域/商圈
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：南山区"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细地址
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：高新园科技园南区"
                />
              </div>
            </div>
          </div>

          {/* 房源详情 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">房源详情</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  月租金（元） *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：6500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bed className="h-4 w-4 inline mr-1" />
                  户型
                </label>
                <select
                  name="houseType"
                  value={formData.houseType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">选择户型</option>
                  {houseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Square className="h-4 w-4 inline mr-1" />
                  面积（㎡）
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：75"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                房源描述
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="详细描述房源特色、周边配套、交通情况等..."
              />
            </div>
          </div>

          {/* 图片上传 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">房源图片</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                拖拽图片到这里，或点击选择文件
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
              >
                选择图片
              </label>
            </div>

            {/* 图片预览 */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">联系方式</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系人姓名
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：张先生"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系电话 *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：138-0013-8000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  微信
                </label>
                <input
                  type="text"
                  name="contactWechat"
                  value={formData.contactWechat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：easyrent_138"
                />
              </div>
            </div>
          </div>

          {/* 发布状态 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="status"
                checked={formData.status === 'published'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  status: e.target.checked ? 'published' : 'draft'
                }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">立即发布房源</span>
            </label>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (editingListing ? '更新中...' : '发布中...') : (editingListing ? '更新房源' : '发布房源')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ListingForm