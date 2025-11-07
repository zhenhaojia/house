import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8010/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// API服务方法
export const listingAPI = {
  // 获取房源列表
  getListings: (params = {}) => {
    return api.get('/listings', { params })
  },
  
  // 获取房源详情
  getListing: (id) => {
    return api.get(`/listings/${id}`)
  },
  
  // 搜索房源
  searchListings: (query) => {
    return api.get('/search', { params: query })
  },
  
  // 创建房源
  createListing: (data) => {
    return api.post('/listings', data)
  },
  
  // 更新房源
  updateListing: (id, data) => {
    return api.put(`/listings/${id}`, data)
  },
  
  // 删除房源
  deleteListing: (id) => {
    return api.delete(`/listings/${id}`)
  },
  
  // 获取热门城市房源数量
  getHotCities: () => {
    return api.get('/listings/cities/hot')
  }
}

export const searchAPI = {
  // 热门搜索
  getHotSearches: () => {
    return api.get('/search/hot')
  },
  
  // 搜索建议
  getSuggestions: (query) => {
    return api.get('/search/suggestions', { params: { q: query } })
  }
}

export const authAPI = {
  // 管理员登录
  adminLogin: (credentials) => {
    return api.post('/auth/login', credentials)
  },
  
  // 检查登录状态
  checkAuth: () => {
    return api.get('/auth/check')
  }
}

export default api