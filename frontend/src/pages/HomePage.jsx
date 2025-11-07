import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Shield, TrendingUp } from 'lucide-react'
import { searchAPI, listingAPI } from '../services/api'

function HomePage() {
  const [hotCities, setHotCities] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)

  // 获取热门城市数据
  useEffect(() => {
    const fetchHotCities = async () => {
      try {
        const response = await listingAPI.getHotCities()
        if (response.success) {
          setHotCities(response.data || [])
        } else {
          // 如果API调用失败，使用默认城市列表
          setHotCities([
            { name: '北京' },
            { name: '上海' },
            { name: '广州' },
            { name: '深圳' },
            { name: '杭州' },
            { name: '成都' }
          ])
        }
      } catch (error) {
        console.error('获取热门城市数据失败:', error)
        // 使用默认城市列表
        setHotCities([
          { name: '北京' },
          { name: '上海' },
          { name: '广州' },
          { name: '深圳' },
          { name: '杭州' },
          { name: '成都' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHotCities()
  }, [])

  // 获取搜索建议
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    
    try {
      const response = await searchAPI.getSuggestions(query)
      setSuggestions(response.data || [])
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      setSuggestions([])
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    fetchSuggestions(query)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.value)
    setShowSuggestions(false)
    window.location.href = `/listings?keyword=${encodeURIComponent(suggestion.value)}`
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/listings?keyword=${encodeURIComponent(searchQuery.trim())}`
    }
  }
  
  return (
    <div className="bg-gradient-to-br from-primary-50 to-white">
      {/* 英雄区域 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            找到您理想的<span className="text-primary-600">家</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            专业的租房信息平台，为您提供真实可靠的房源信息，让租房变得更简单
          </p>
          
          {/* 主搜索框 */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input
                type="text"
                placeholder="输入城市、区域或小区名称..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500 focus:border-transparent"
              />
              
              {/* 搜索建议下拉框 */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center">
                        <Search className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-800">{suggestion.value}</span>
                        {suggestion.type === 'location' && (
                          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">位置</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                搜索
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* 热门城市 */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">热门城市</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {hotCities.map((city) => (
                <Link
                  key={city.name}
                  to={`/listings?city=${city.name}`}
                  className="card p-6 text-center hover:shadow-md transition-shadow hover:transform hover:scale-105"
                >
                  <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <span className="text-lg font-medium text-gray-900">{city.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* 特色功能 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">为什么选择我们</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">真实房源</h3>
              <p className="text-gray-600">所有房源信息经过严格审核，确保真实可靠</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">精选推荐</h3>
              <p className="text-gray-600">根据您的需求智能推荐合适的房源</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">精准定位</h3>
              <p className="text-gray-600">详细的位置信息和周边配套介绍</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage