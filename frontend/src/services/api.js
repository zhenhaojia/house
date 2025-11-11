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
  // 租客注册
  registerTenant: (data) => {
    return api.post('/user/register', data)
  },
  
  // 房东注册
  registerLandlord: (data) => {
    return api.post('/user/register/landlord', data)
  },
  
  // 租客登录
  loginTenant: (credentials) => {
    return api.post('/user/login', credentials)
  },
  
  // 房东登录
  loginLandlord: (credentials) => {
    return api.post('/user/login/landlord', credentials)
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return api.get('/user/me')
  },
  
  // 管理员登录
  adminLogin: (credentials) => {
    return api.post('/auth/login', credentials)
  },
  
  // 检查登录状态
  checkAuth: () => {
    return api.get('/auth/check')
  }
}

// 用户相关API
export const userAPI = {
  // 添加收藏
  addFavorite: (listingId) => {
    return api.post('/user/favorites', { listingId })
  },
  
  // 移除收藏
  removeFavorite: (listingId) => {
    return api.delete(`/user/favorites/${listingId}`)
  },
  
  // 获取收藏列表
  getFavorites: () => {
    return api.get('/user/favorites')
  },
  
  // 提交咨询
  submitInquiry: (data) => {
    return api.post('/user/inquiries', data)
  }
}

// 上传API
const uploadApi = axios.create({
  baseURL: 'http://localhost:8010/api',
  timeout: 30000 // 上传需要更长时间
  // 不设置Content-Type，axios会自动为FormData设置正确的boundary
})

// 上传API的响应拦截器 - 处理文件上传的特殊错误
uploadApi.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('上传API错误:', error)
    // 如果是网络错误或者后端返回错误
    if (error.response) {
      // 后端返回了错误状态码
      return Promise.reject(new Error(error.response.data.error || '上传失败'))
    } else if (error.request) {
      // 请求已发送但无响应
      return Promise.reject(new Error('无法连接到服务器，请检查网络连接'))
    } else {
      // 其他错误
      return Promise.reject(new Error(error.message || '上传过程中发生未知错误'))
    }
  }
)

export const uploadAPI = {
  // 单文件上传
  uploadSingle: (formData) => {
    return uploadApi.post('/upload/single', formData)
  },
  
  // 多文件上传
  uploadMultiple: (formData) => {
    return uploadApi.post('/upload/multiple', formData)
  }
}

export default api