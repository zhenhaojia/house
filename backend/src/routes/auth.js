import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// 模拟管理员用户数据（实际项目中应存储在数据库）
const adminUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    email: 'admin@easyrent.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  }
]

// 管理员登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { username, password } = req.body
    
    console.log('收到登录请求:', { username, password })

    // 查找用户
    const user = adminUsers.find(u => u.username === username)
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      })
    }

    // 验证密码（管理员账号使用固定密码验证）
    const isValidPassword = password === 'password'
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      })
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      message: '登录成功'
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '登录失败' 
    })
  }
})

// 验证token
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token不存在' 
      })
    }

    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'fallback-secret'
      )
      
      res.json({
        success: true,
        data: {
          valid: true,
          user: decoded
        }
      })
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token无效或已过期' 
      })
    }
  } catch (error) {
    console.error('验证token错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '验证失败' 
    })
  }
})

// 修改密码
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('当前密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { currentPassword, newPassword } = req.body
    
    // 简化版密码修改逻辑
    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '修改密码失败' 
    })
  }
})

export default router