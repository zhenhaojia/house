import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // 初始化时检查本地存储的登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const role = localStorage.getItem('userRole')
    
    if (token && userData && role) {
      try {
        const parsedUser = JSON.parse(userData)
        setIsAuthenticated(true)
        setUser(parsedUser)
        setUserRole(role)
      } catch (error) {
        console.error('解析用户数据失败:', error)
        // 清除无效的本地存储数据
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
      }
    }
    
    setLoading(false)
  }, [])

  // 登录函数
  const login = async (username, password, role = 'tenant') => {
    try {
      // 根据角色选择不同的登录端点
      let loginUrl = 'http://localhost:8010/api/user/login'
      if (role === 'admin') {
        loginUrl = 'http://localhost:8010/api/auth/login'
      } else if (role === 'landlord') {
        loginUrl = 'http://localhost:8010/api/user/login/landlord'
      }

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '登录失败')
      }

      const { token, user: userData } = result.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('userRole', role)
      
      setIsAuthenticated(true)
      setUser(userData)
      setUserRole(role)
      
      return result
    } catch (error) {
      throw error
    }
  }

  // 登出函数
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    setIsAuthenticated(false)
    setUser(null)
    setUserRole(null)
  }

  // 检查用户角色
  const isTenant = () => userRole === 'tenant'
  const isLandlord = () => userRole === 'admin' || userRole === 'landlord'

  const value = {
    isAuthenticated,
    user,
    userRole,
    loading,
    login,
    logout,
    isTenant,
    isLandlord
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用')
  }
  return context
}