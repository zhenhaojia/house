import jwt from 'jsonwebtoken'

// JWT认证中间件
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: '访问令牌不存在' 
    })
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret'
    )
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: '令牌无效或已过期' 
    })
  }
}

// 检查用户角色权限
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: '用户未认证' 
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: '权限不足' 
      })
    }

    next()
  }
}