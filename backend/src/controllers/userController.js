import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'

// 租客注册
const registerTenant = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { username, email, password, phone } = req.body

    // 检查用户是否已存在
    const [existingUsers] = await req.db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: '用户名或邮箱已被注册'
      })
    }

    // 加密密码
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 创建用户
    const [result] = await req.db.query(
      'INSERT INTO users (username, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, phone, 'agent']
    )

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        username: username,
        role: 'agent' 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: result.insertId,
          username,
          email,
          phone,
          role: 'agent'
        }
      },
      message: '注册成功'
    })
  } catch (error) {
    console.error('租客注册错误:', error)
    res.status(500).json({ 
      success: false, 
      error: `注册失败: ${error.message}` 
    })
  }
}

// 房东注册
const registerLandlord = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { username, email, password, phone } = req.body

    // 检查用户是否已存在
    const [existingUsers] = await req.db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: '用户名或邮箱已被注册'
      })
    }

    // 加密密码
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 创建用户
    const [result] = await req.db.query(
      'INSERT INTO users (username, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, phone, 'landlord']
    )

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        username: username,
        role: 'landlord' 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: result.insertId,
          username,
          email,
          phone,
          role: 'landlord'
        }
      },
      message: '房东注册成功'
    })
  } catch (error) {
    console.error('房东注册错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '注册失败' 
    })
  }
}

// 租客登录
const loginTenant = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { username, password } = req.body

    // 查找用户
    const [users] = await req.db.query(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      [username, 'agent']
    )

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      })
    }

    const user = users[0]

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      })
    }

    // 更新最后登录时间
    await req.db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    )

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
          phone: user.phone,
          role: user.role
        }
      },
      message: '登录成功'
    })
  } catch (error) {
    console.error('租客登录错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '登录失败' 
    })
  }
}

// 房东登录
const loginLandlord = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { username, password } = req.body

    // 查找用户 (关键修改：role = 'landlord')
    const [users] = await req.db.query(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      [username, 'landlord']
    )

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      })
    }

    const user = users[0]

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      })
    }

    // 更新最后登录时间
    await req.db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    )

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
          phone: user.phone,
          role: user.role
        }
      },
      message: '房东登录成功'
    })
  } catch (error) {
    console.error('房东登录错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '登录失败' 
    })
  }
}

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId

    const [users] = await req.db.query(
      'SELECT id, username, email, phone, role, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取用户信息失败' 
    })
  }
}

// 添加收藏
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId
    const { listingId } = req.body

    // 检查房源是否存在
    const [listings] = await req.db.query(
      'SELECT id FROM listings WHERE id = ? AND status = ?',
      [listingId, 'published']
    )

    if (listings.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在或未发布'
      })
    }

    // 检查是否已收藏
    const [existingFavorites] = await req.db.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND listing_id = ?',
      [userId, listingId]
    )

    if (existingFavorites.length > 0) {
      return res.status(400).json({
        success: false,
        error: '已收藏该房源'
      })
    }

    // 添加收藏
    await req.db.query(
      'INSERT INTO user_favorites (user_id, listing_id) VALUES (?, ?)',
      [userId, listingId]
    )

    res.json({
      success: true,
      message: '收藏成功'
    })
  } catch (error) {
    console.error('添加收藏错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '收藏失败' 
    })
  }
}

// 移除收藏
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId
    const { listingId } = req.params

    const [result] = await req.db.query(
      'DELETE FROM user_favorites WHERE user_id = ? AND listing_id = ?',
      [userId, listingId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: '收藏记录不存在'
      })
    }

    res.json({
      success: true,
      message: '取消收藏成功'
    })
  } catch (error) {
    console.error('移除收藏错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '取消收藏失败' 
    })
  }
}

// 获取用户收藏列表
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId

    const [favorites] = await req.db.query(`
      SELECT 
        l.id, l.title, l.city, l.district, l.price, l.house_type, l.area,
        l.main_image_url, l.contact_phone, l.contact_wechat,
        f.created_at as favorite_date
      FROM user_favorites f
      JOIN listings l ON f.listing_id = l.id
      WHERE f.user_id = ? AND l.status = 'published'
      ORDER BY f.created_at DESC
    `, [userId])

    res.json({
      success: true,
      data: {
        favorites
      }
    })
  } catch (error) {
    console.error('获取收藏列表错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取收藏列表失败' 
    })
  }
}

// 提交咨询
const submitInquiry = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const userId = req.user.userId
    const { listingId, message, contactPhone, contactWechat } = req.body

    // 检查房源是否存在
    const [listings] = await req.db.query(
      'SELECT id FROM listings WHERE id = ? AND status = ?',
      [listingId, 'published']
    )

    if (listings.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在或未发布'
      })
    }

    // 提交咨询
    await req.db.query(
      'INSERT INTO user_inquiries (user_id, listing_id, message, contact_phone, contact_wechat) VALUES (?, ?, ?, ?, ?)',
      [userId, listingId, message, contactPhone, contactWechat]
    )

    // 更新房源咨询计数
    await req.db.query(
      'UPDATE listings SET inquiry_count = inquiry_count + 1 WHERE id = ?',
      [listingId]
    )

    res.status(201).json({
      success: true,
      message: '咨询提交成功，房东会尽快联系您'
    })
  } catch (error) {
    console.error('提交咨询错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '提交咨询失败' 
    })
  }
}

export {
  registerTenant,
  registerLandlord,
  loginTenant,
  loginLandlord,
  getCurrentUser,
  addFavorite,
  removeFavorite,
  getFavorites,
  submitInquiry
}