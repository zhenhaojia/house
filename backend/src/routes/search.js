import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// 获取热门搜索
router.get('/hot', async (req, res) => {
  try {
    const hotSearches = [
      { keyword: '北京', count: 1250 },
      { keyword: '上海', count: 980 },
      { keyword: '深圳', count: 850 },
      { keyword: '广州', count: 720 },
      { keyword: '杭州', count: 650 },
      { keyword: '成都', count: 580 }
    ]
    
    res.json({ success: true, data: hotSearches })
  } catch (error) {
    console.error('获取热门搜索失败:', error)
    res.status(500).json({ success: false, error: '获取热门搜索失败' })
  }
})

// 搜索建议
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] })
    }
    
    // 从数据库中获取搜索建议
    const suggestions = await query(`
      SELECT DISTINCT city, district 
      FROM listings 
      WHERE (city LIKE ? OR district LIKE ?) 
        AND status = 'published'
      LIMIT 10
    `, [`%${q}%`, `%${q}%`])
    
    const result = suggestions.data.map(item => ({
      type: 'location',
      value: `${item.city} ${item.district}`,
      city: item.city,
      district: item.district
    }))
    
    // 添加一些通用建议
    if (q.length >= 2) {
      result.push(
        { type: 'suggestion', value: `${q} 附近租房` },
        { type: 'suggestion', value: `${q} 精装修` },
        { type: 'suggestion', value: `${q} 公寓` }
      )
    }
    
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('获取搜索建议失败:', error)
    res.json({ success: true, data: [] }) // 出错时返回空数组
  }
})

// 搜索房源接口
router.get('/', async (req, res) => {
  try {
    const { 
      keyword,
      city,
      district,
      priceMin,
      priceMax,
      houseType,
      areaMin,
      areaMax,
      sortBy = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 10
    } = req.query

    // 构建搜索条件
    let whereConditions = ['status = ?']
    let queryParams = ['published']
    
    if (keyword) {
      whereConditions.push('(title LIKE ? OR description LIKE ? OR address LIKE ?)')
      queryParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }
    
    if (city) {
      whereConditions.push('city = ?')
      queryParams.push(city)
    }
    
    if (district) {
      whereConditions.push('district = ?')
      queryParams.push(district)
    }
    
    if (priceMin) {
      whereConditions.push('price >= ?')
      queryParams.push(parseInt(priceMin))
    }
    
    if (priceMax) {
      whereConditions.push('price <= ?')
      queryParams.push(parseInt(priceMax))
    }
    
    if (houseType) {
      whereConditions.push('house_type = ?')
      queryParams.push(houseType)
    }
    
    if (areaMin) {
      whereConditions.push('area >= ?')
      queryParams.push(parseFloat(areaMin))
    }
    
    if (areaMax) {
      whereConditions.push('area <= ?')
      queryParams.push(parseFloat(areaMax))
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : ''

    // 计算分页
    const offset = (page - 1) * limit
    
    // 查询房源
    const result = await query(
      `SELECT * FROM listings ${whereClause} 
       ORDER BY ${sortBy} ${order} 
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    // 查询总数
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM listings ${whereClause}`,
      queryParams
    )

    if (!totalResult.success) {
      throw new Error(totalResult.error)
    }

    const totalItems = totalResult.data[0].total

    res.json({
      success: true,
      data: {
        listings: result.data,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        },
        filters: {
          keyword,
          city,
          district,
          priceMin,
          priceMax,
          houseType,
          areaMin,
          areaMax
        }
      }
    })
  } catch (error) {
    console.error('搜索房源错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '搜索失败' 
    })
  }
})

// 获取搜索建议
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      })
    }

    // 搜索城市和区域建议
    const cityResult = await query(
      'SELECT DISTINCT city FROM listings WHERE city LIKE ? AND status = ? LIMIT 5',
      [`%${q}%`, 'published']
    )

    const districtResult = await query(
      'SELECT DISTINCT district FROM listings WHERE district LIKE ? AND status = ? LIMIT 5',
      [`%${q}%`, 'published']
    )

    if (!cityResult.success || !districtResult.success) {
      throw new Error('查询建议失败')
    }

    const suggestions = [
      ...cityResult.data.map(item => ({
        type: 'city',
        value: item.city,
        label: `${item.city}市`
      })),
      ...districtResult.data.map(item => ({
        type: 'district',
        value: item.district,
        label: item.district
      }))
    ]

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10) // 限制返回数量
      }
    })
  } catch (error) {
    console.error('获取搜索建议错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取搜索建议失败' 
    })
  }
})

// 获取筛选选项
router.get('/filters', async (req, res) => {
  try {
    // 获取城市列表
    const citiesResult = await query(
      'SELECT DISTINCT city, COUNT(*) as count FROM listings WHERE status = ? GROUP BY city ORDER BY count DESC',
      ['published']
    )

    // 获取区域列表
    const districtsResult = await query(
      'SELECT DISTINCT district, COUNT(*) as count FROM listings WHERE status = ? GROUP BY district ORDER BY count DESC',
      ['published']
    )

    // 获取户型列表
    const houseTypesResult = await query(
      'SELECT DISTINCT house_type, COUNT(*) as count FROM listings WHERE status = ? GROUP BY house_type ORDER BY count DESC',
      ['published']
    )

    // 获取价格范围
    const priceRangeResult = await query(
      'SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM listings WHERE status = ?',
      ['published']
    )

    // 获取面积范围
    const areaRangeResult = await query(
      'SELECT MIN(area) as minArea, MAX(area) as maxArea FROM listings WHERE status = ?',
      ['published']
    )

    if (!citiesResult.success || !districtsResult.success || 
        !houseTypesResult.success || !priceRangeResult.success || 
        !areaRangeResult.success) {
      throw new Error('获取筛选选项失败')
    }

    res.json({
      success: true,
      data: {
        cities: citiesResult.data.map(item => ({
          value: item.city,
          label: item.city,
          count: item.count
        })),
        districts: districtsResult.data.map(item => ({
          value: item.district,
          label: item.district,
          count: item.count
        })),
        houseTypes: houseTypesResult.data.map(item => ({
          value: item.house_type,
          label: item.house_type,
          count: item.count
        })),
        priceRange: {
          min: priceRangeResult.data[0].minPrice || 0,
          max: priceRangeResult.data[0].maxPrice || 10000
        },
        areaRange: {
          min: areaRangeResult.data[0].minArea || 0,
          max: areaRangeResult.data[0].maxArea || 200
        }
      }
    })
  } catch (error) {
    console.error('获取筛选选项错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取筛选选项失败' 
    })
  }
})

export default router