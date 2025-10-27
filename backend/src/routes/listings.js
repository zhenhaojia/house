import express from 'express'
import { body, validationResult } from 'express-validator'
import { query } from '../config/database.js'

const router = express.Router()

// 获取房源列表
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      district, 
      priceMin, 
      priceMax, 
      houseType, 
      page = 1, 
      limit = 10,
      sortBy = 'created_at' 
    } = req.query

    // 构建查询条件
    let whereConditions = ['status = ?']
    let queryParams = ['published']
    
    if (city) {
      whereConditions.push('city LIKE ?')
      queryParams.push(`%${city}%`)
    }
    
    if (district) {
      whereConditions.push('district LIKE ?')
      queryParams.push(`%${district}%`)
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
      whereConditions.push('house_type LIKE ?')
      queryParams.push(`%${houseType}%`)
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : ''

    // 计算分页
    const offset = (page - 1) * limit
    
    // 简化查询 - 先测试基本查询
    const result = await query(
      'SELECT * FROM listings WHERE status = ? ORDER BY created_at DESC LIMIT 10',
      ['published']
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    const listings = result.data

    // 查询总数
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM listings WHERE status = ?',
      ['published']
    )

    if (!totalResult.success) {
      throw new Error(totalResult.error)
    }

    const totalItems = totalResult.data[0].total

    res.json({
      success: true,
      data: {
        listings: listings || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('获取房源列表错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取房源列表失败' 
    })
  }
})

// 获取单个房源详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 查询房源详情
    const result = await query(
      'SELECT * FROM listings WHERE id = ? AND status = ?',
      [parseInt(id), 'published']
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    if (result.data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: '房源不存在' 
      })
    }

    const listing = result.data[0]

    // 模拟图片数据（实际项目中应该从数据库查询）
    const mockImages = [
      '/images/listing1-1.jpg',
      '/images/listing1-2.jpg',
      '/images/listing1-3.jpg'
    ]

    // 模拟特色和设施数据
    const mockFeatures = ['精装修', '家电齐全', '近地铁', '拎包入住', '可短租']
    const mockAmenities = ['WiFi', '空调', '洗衣机', '冰箱', '热水器', '电视']

    res.json({
      success: true,
      data: {
        ...listing,
        images: mockImages,
        features: mockFeatures,
        amenities: mockAmenities
      }
    })
  } catch (error) {
    console.error('获取房源详情错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取房源详情失败' 
    })
  }
})

// 获取热门城市
router.get('/cities/hot', async (req, res) => {
  try {
    const hotCities = [
      { name: '北京', count: 1250 },
      { name: '上海', count: 980 },
      { name: '广州', count: 760 },
      { name: '深圳', count: 890 },
      { name: '杭州', count: 540 },
      { name: '成都', count: 670 }
    ]

    res.json({
      success: true,
      data: hotCities
    })
  } catch (error) {
    console.error('获取热门城市错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '获取热门城市失败' 
    })
  }
})

// 创建新房源
router.post('/', async (req, res) => {
  try {
    const {
      title,
      city,
      district,
      address,
      price,
      houseType,
      area,
      description,
      contactName,
      contactPhone,
      contactWechat,
      status = 'published'
    } = req.body

    // 验证必填字段
    if (!title || !city || !price || !contactPhone) {
      return res.status(400).json({
        success: false,
        error: '请填写必填字段：标题、城市、价格、联系电话'
      })
    }

    // 插入房源数据
    const result = await query(`
      INSERT INTO listings (
        title, city, district, address, price, house_type, area, 
        description, contact_name, contact_phone, contact_wechat, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      title, city, district, address, price, houseType, area,
      description, contactName, contactPhone, contactWechat, status
    ])

    if (result.success) {
      res.json({
        success: true,
        data: {
          id: result.data.insertId,
          title,
          city,
          status,
          createdAt: new Date().toISOString()
        },
        message: '房源发布成功'
      })
    } else {
      throw new Error('数据库插入失败')
    }
  } catch (error) {
    console.error('创建房源错误:', error)
    res.status(500).json({
      success: false,
      error: '房源发布失败，请稍后重试'
    })
  }
})

export default router