import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// 获取平台统计数据
router.get('/dashboard', async (req, res) => {
  try {
    // 获取房源总数
    const totalListingsResult = await query(
      'SELECT COUNT(*) as total FROM listings WHERE status = ?',
      ['published']
    )

    // 获取今日新增房源
    const todayListingsResult = await query(
      'SELECT COUNT(*) as total FROM listings WHERE status = ? AND DATE(created_at) = CURDATE()',
      ['published']
    )

    // 获取用户总数
    const totalUsersResult = await query(
      'SELECT COUNT(*) as total FROM users',
      []
    )

    // 获取收藏总数
    const totalFavoritesResult = await query(
      'SELECT COUNT(*) as total FROM user_favorites'
    )

    // 获取热门城市
    const popularCitiesResult = await query(
      'SELECT city, COUNT(*) as count FROM listings WHERE status = ? GROUP BY city ORDER BY count DESC LIMIT 5',
      ['published']
    )

    // 获取价格分布
    const priceDistributionResult = await query(
      `SELECT 
        CASE 
          WHEN price < 2000 THEN '2000以下'
          WHEN price BETWEEN 2000 AND 4000 THEN '2000-4000'
          WHEN price BETWEEN 4000 AND 6000 THEN '4000-6000'
          WHEN price BETWEEN 6000 AND 8000 THEN '6000-8000'
          ELSE '8000以上'
        END as price_range,
        COUNT(*) as count
       FROM listings 
       WHERE status = ? 
       GROUP BY price_range 
       ORDER BY price_range`,
      ['published']
    )

    if (!totalListingsResult.success || !todayListingsResult.success || 
        !totalUsersResult.success || !totalFavoritesResult.success ||
        !popularCitiesResult.success || !priceDistributionResult.success) {
      throw new Error('获取统计数据失败')
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalListings: totalListingsResult.data[0].total,
          todayListings: todayListingsResult.data[0].total,
          totalUsers: totalUsersResult.data[0].total,
          totalFavorites: totalFavoritesResult.data[0].total
        },
        popularCities: popularCitiesResult.data,
        priceDistribution: priceDistributionResult.data
      }
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    res.status(500).json({
      success: false,
      error: '获取统计数据失败'
    })
  }
})

// 获取房源趋势数据
router.get('/trends', async (req, res) => {
  try {
    const { period = '7d' } = req.query // 7d, 30d, 90d

    let days
    switch (period) {
      case '7d':
        days = 7
        break
      case '30d':
        days = 30
        break
      case '90d':
        days = 90
        break
      default:
        days = 7
    }

    // 获取房源发布趋势
    const listingTrendsResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM listings 
       WHERE status = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      ['published', days]
    )

    // 获取用户注册趋势
    const userTrendsResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM users 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [days]
    )

    if (!listingTrendsResult.success || !userTrendsResult.success) {
      throw new Error('获取趋势数据失败')
    }

    res.json({
      success: true,
      data: {
        period,
        listingTrends: listingTrendsResult.data,
        userTrends: userTrendsResult.data
      }
    })
  } catch (error) {
    console.error('获取趋势数据错误:', error)
    res.status(500).json({
      success: false,
      error: '获取趋势数据失败'
    })
  }
})

// 获取热门搜索关键词
router.get('/hot-searches', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const hotSearchesResult = await query(
      `SELECT 
        keyword,
        COUNT(*) as search_count,
        COUNT(DISTINCT user_id) as user_count
       FROM search_history 
       WHERE searched_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY keyword 
       ORDER BY search_count DESC 
       LIMIT ?`,
      [parseInt(limit)]
    )

    if (!hotSearchesResult.success) {
      throw new Error('获取热门搜索失败')
    }

    res.json({
      success: true,
      data: {
        hotSearches: hotSearchesResult.data
      }
    })
  } catch (error) {
    console.error('获取热门搜索错误:', error)
    res.status(500).json({
      success: false,
      error: '获取热门搜索失败'
    })
  }
})

// 获取用户行为分析
router.get('/user-behavior', async (req, res) => {
  try {
    // 获取用户活跃度
    const userActivityResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        (SELECT COUNT(*) FROM user_favorites WHERE DATE(created_at) = date) as favorites,
        (SELECT COUNT(*) FROM user_history WHERE DATE(viewed_at) = date) as views
       FROM users 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      []
    )

    // 获取用户留存率
    const retentionResult = await query(
      `SELECT 
        DATE(created_at) as cohort_date,
        COUNT(*) as cohort_size,
        COUNT(CASE WHEN last_active >= DATE_ADD(created_at, INTERVAL 1 DAY) THEN 1 END) as day1_retention,
        COUNT(CASE WHEN last_active >= DATE_ADD(created_at, INTERVAL 7 DAY) THEN 1 END) as day7_retention,
        COUNT(CASE WHEN last_active >= DATE_ADD(created_at, INTERVAL 30 DAY) THEN 1 END) as day30_retention
       FROM users 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
       GROUP BY DATE(created_at)
       ORDER BY cohort_date`,
      []
    )

    if (!userActivityResult.success || !retentionResult.success) {
      throw new Error('获取用户行为数据失败')
    }

    res.json({
      success: true,
      data: {
        userActivity: userActivityResult.data,
        retention: retentionResult.data
      }
    })
  } catch (error) {
    console.error('获取用户行为数据错误:', error)
    res.status(500).json({
      success: false,
      error: '获取用户行为数据失败'
    })
  }
})

export default router