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
      sortBy = 'created_at',
      status = 'published'
    } = req.query

    // 构建查询条件
    let whereConditions = []
    let queryParams = []
    
    // 处理状态参数
    if (status && status !== 'all') {
      whereConditions.push('status = ?')
      queryParams.push(status)
    } else {
      // 默认只显示已发布的房源
      whereConditions.push('status = ?')
      queryParams.push('published')
    }
    
    // 处理城市筛选
    if (city) {
      whereConditions.push('city LIKE ?')
      queryParams.push(`%${city}%`)
    }
    
    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : ''
    
    // 计算分页
    const offset = (page - 1) * limit
    
    // 使用字符串拼接处理分页参数，避免参数化LIMIT/OFFSET的问题
    const limitClause = `LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    
    // 执行查询
    console.log('查询SQL:', `SELECT * FROM listings ${whereClause} ORDER BY created_at DESC ${limitClause}`)
    console.log('查询参数:', queryParams)
    const result = await query(
      `SELECT * FROM listings ${whereClause} ORDER BY created_at DESC ${limitClause}`,
      queryParams
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    const listings = result.data

    // 查询总数
    console.log('总数查询SQL:', `SELECT COUNT(*) as total FROM listings ${whereClause}`)
    console.log('总数查询参数:', queryParams)
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
    console.error('错误详情:', error.message, error.stack)
    res.status(500).json({ 
      success: false, 
      error: '获取房源列表失败',
      details: error.message
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
        description, contact_phone, contact_wechat, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      title, city, district || '', address || '', parseInt(price), houseType || '', area ? parseInt(area) : null,
      description || '', contactPhone, contactWechat || '', status
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

// 更新房源信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
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
      status
    } = req.body

    // 检查房源是否存在
    const existingResult = await query(
      'SELECT id FROM listings WHERE id = ?',
      [parseInt(id)]
    )

    if (!existingResult.success || existingResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在'
      })
    }

    // 更新房源数据
    const result = await query(`
      UPDATE listings SET 
        title = ?, city = ?, district = ?, address = ?, price = ?, 
        house_type = ?, area = ?, description = ?, 
        contact_phone = ?, contact_wechat = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      title, city, district || '', address || '', parseInt(price), 
      houseType || '', area ? parseInt(area) : null, description || '', 
      contactPhone, contactWechat || '', status, parseInt(id)
    ])

    if (result.success) {
      res.json({
        success: true,
        data: {
          id: parseInt(id),
          title,
          city,
          status,
          updatedAt: new Date().toISOString()
        },
        message: '房源更新成功'
      })
    } else {
      throw new Error('数据库更新失败')
    }
  } catch (error) {
    console.error('更新房源错误:', error)
    res.status(500).json({
      success: false,
      error: '房源更新失败，请稍后重试'
    })
  }
})

// 删除房源
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 检查房源是否存在
    const existingResult = await query(
      'SELECT id FROM listings WHERE id = ?',
      [parseInt(id)]
    )

    if (!existingResult.success || existingResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在'
      })
    }

    // 删除房源数据
    const result = await query(
      'DELETE FROM listings WHERE id = ?',
      [parseInt(id)]
    )

    if (result.success) {
      res.json({
        success: true,
        message: '房源删除成功'
      })
    } else {
      throw new Error('数据库删除失败')
    }
  } catch (error) {
    console.error('删除房源错误:', error)
    res.status(500).json({
      success: false,
      error: '房源删除失败，请稍后重试'
    })
  }
})

export default router