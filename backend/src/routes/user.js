import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// 用户收藏房源
router.post('/favorites', async (req, res) => {
  try {
    const { userId, listingId } = req.body

    // 检查房源是否存在
    const listingResult = await query(
      'SELECT id FROM listings WHERE id = ? AND status = ?',
      [parseInt(listingId), 'published']
    )

    if (!listingResult.success || listingResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在'
      })
    }

    // 检查是否已收藏
    const existingResult = await query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND listing_id = ?',
      [parseInt(userId), parseInt(listingId)]
    )

    if (existingResult.success && existingResult.data.length > 0) {
      return res.status(400).json({
        success: false,
        error: '已收藏该房源'
      })
    }

    // 添加收藏
    const insertResult = await query(
      'INSERT INTO user_favorites (user_id, listing_id, created_at) VALUES (?, ?, NOW())',
      [parseInt(userId), parseInt(listingId)]
    )

    if (!insertResult.success) {
      throw new Error('收藏失败')
    }

    res.json({
      success: true,
      data: {
        favoriteId: insertResult.data.insertId,
        message: '收藏成功'
      }
    })
  } catch (error) {
    console.error('收藏房源错误:', error)
    res.status(500).json({
      success: false,
      error: '收藏失败'
    })
  }
})

// 获取用户收藏列表
router.get('/:userId/favorites', async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    const offset = (page - 1) * limit

    // 查询收藏的房源 - 简化查询测试
    const favoritesResult = await query(
      `SELECT l.*, uf.created_at as favorited_at 
       FROM user_favorites uf 
       JOIN listings l ON uf.listing_id = l.id 
       WHERE uf.user_id = ? 
       ORDER BY uf.created_at DESC 
       LIMIT 5`,
      [parseInt(userId)]
    )

    if (!favoritesResult.success) {
      throw new Error('查询收藏列表失败')
    }

    // 查询总数
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?',
      [parseInt(userId)]
    )

    if (!totalResult.success) {
      throw new Error('查询总数失败')
    }

    const totalItems = totalResult.data[0].total

    res.json({
      success: true,
      data: {
        favorites: favoritesResult.data,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('获取收藏列表错误:', error)
    res.status(500).json({
      success: false,
      error: '获取收藏列表失败'
    })
  }
})

// 取消收藏
router.delete('/favorites/:favoriteId', async (req, res) => {
  try {
    const { favoriteId } = req.params

    const deleteResult = await query(
      'DELETE FROM user_favorites WHERE id = ?',
      [parseInt(favoriteId)]
    )

    if (!deleteResult.success) {
      throw new Error('取消收藏失败')
    }

    res.json({
      success: true,
      data: {
        message: '取消收藏成功'
      }
    })
  } catch (error) {
    console.error('取消收藏错误:', error)
    res.status(500).json({
      success: false,
      error: '取消收藏失败'
    })
  }
})

// 用户浏览历史
router.post('/history', async (req, res) => {
  try {
    const { userId, listingId } = req.body

    // 检查房源是否存在
    const listingResult = await query(
      'SELECT id FROM listings WHERE id = ? AND status = ?',
      [parseInt(listingId), 'published']
    )

    if (!listingResult.success || listingResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在'
      })
    }

    // 添加浏览历史
    const insertResult = await query(
      `INSERT INTO user_history (user_id, listing_id, viewed_at) 
       VALUES (?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE viewed_at = NOW()`,
      [parseInt(userId), parseInt(listingId)]
    )

    if (!insertResult.success) {
      throw new Error('记录浏览历史失败')
    }

    res.json({
      success: true,
      data: {
        message: '浏览历史记录成功'
      }
    })
  } catch (error) {
    console.error('记录浏览历史错误:', error)
    res.status(500).json({
      success: false,
      error: '记录浏览历史失败'
    })
  }
})

// 获取用户浏览历史
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    const offset = (page - 1) * limit

    // 查询浏览历史 - 简化查询测试
    const historyResult = await query(
      `SELECT l.*, uh.viewed_at 
       FROM user_history uh 
       JOIN listings l ON uh.listing_id = l.id 
       WHERE uh.user_id = ? 
       ORDER BY uh.viewed_at DESC 
       LIMIT 5`,
      [parseInt(userId)]
    )

    if (!historyResult.success) {
      throw new Error('查询浏览历史失败')
    }

    // 查询总数
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM user_history WHERE user_id = ?',
      [parseInt(userId)]
    )

    if (!totalResult.success) {
      throw new Error('查询总数失败')
    }

    const totalItems = totalResult.data[0].total

    res.json({
      success: true,
      data: {
        history: historyResult.data,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('获取浏览历史错误:', error)
    res.status(500).json({
      success: false,
      error: '获取浏览历史失败'
    })
  }
})

// 用户反馈
router.post('/feedback', async (req, res) => {
  try {
    const { userId, type, content, contact } = req.body

    // 验证反馈类型
    const validTypes = ['bug', 'suggestion', 'complaint', 'other']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: '无效的反馈类型'
      })
    }

    // 插入反馈
    const insertResult = await query(
      'INSERT INTO user_feedback (user_id, type, content, contact, created_at) VALUES (?, ?, ?, ?, NOW())',
      [parseInt(userId), type, content, contact]
    )

    if (!insertResult.success) {
      throw new Error('提交反馈失败')
    }

    res.json({
      success: true,
      data: {
        feedbackId: insertResult.data.insertId,
        message: '反馈提交成功'
      }
    })
  } catch (error) {
    console.error('提交反馈错误:', error)
    res.status(500).json({
      success: false,
      error: '反馈提交失败'
    })
  }
})

// 获取用户个人信息
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params

    const userResult = await query(
      'SELECT id, username, email, phone, created_at FROM users WHERE id = ?',
      [parseInt(userId)]
    )

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    const user = userResult.data[0]

    // 获取统计信息
    const favoritesCountResult = await query(
      'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?',
      [parseInt(userId)]
    )

    const historyCountResult = await query(
      'SELECT COUNT(*) as count FROM user_history WHERE user_id = ?',
      [parseInt(userId)]
    )

    res.json({
      success: true,
      data: {
        profile: user,
        statistics: {
          favoritesCount: favoritesCountResult.success ? favoritesCountResult.data[0].count : 0,
          historyCount: historyCountResult.success ? historyCountResult.data[0].count : 0
        }
      }
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    })
  }
})

export default router