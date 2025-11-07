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

    let listings = []
    let totalItems = 0

    if (!result.success) {
      console.log('数据库查询失败，使用模拟数据')
      // 使用模拟数据
      const mockListings = [
        {
          id: 1,
          title: '朝阳区国贸豪华公寓',
          city: '北京',
          district: '朝阳区',
          address: '国贸CBD核心区',
          price: 12000,
          area: 85,
          houseType: '2室1厅1卫',
          description: '国贸CBD核心区豪华公寓，精装修，家具家电齐全，交通便利，周边配套设施完善。',
          contactName: '张经理',
          contactPhone: '13800138001',
          contactWechat: 'zhang138001',
          status: 'published',
          createdAt: '2024-01-01 10:00:00'
        },
        {
          id: 2,
          title: '浦东新区陆家嘴江景房',
          city: '上海',
          district: '浦东新区',
          address: '陆家嘴金融中心',
          price: 15000,
          area: 95,
          houseType: '3室2厅2卫',
          description: '陆家嘴金融中心江景房，视野开阔，精装修，高端社区，安保完善。',
          contactName: '李女士',
          contactPhone: '13900139001',
          contactWechat: 'li139001',
          status: 'published',
          createdAt: '2024-01-02 11:00:00'
        },
        {
          id: 3,
          title: '长安区裕华路精装两房',
          city: '石家庄',
          district: '长安区',
          address: '裕华路与建设大街交叉口',
          price: 2800,
          area: 75,
          houseType: '2室1厅1卫',
          description: '长安区核心地段，精装修两房，家具家电齐全，交通便利，生活配套设施完善。',
          contactName: '王先生',
          contactPhone: '13700137001',
          contactWechat: 'wang137001',
          status: 'published',
          createdAt: '2024-01-03 12:00:00'
        },
        {
          id: 4,
          title: '桥西区新百广场附近公寓',
          city: '石家庄',
          district: '桥西区',
          address: '新百广场商圈',
          price: 2200,
          area: 60,
          houseType: '1室1厅1卫',
          description: '新百广场商圈单身公寓，精装修，拎包入住，周边商业配套齐全。',
          contactName: '赵女士',
          contactPhone: '13600136001',
          contactWechat: 'zhao136001',
          status: 'published',
          createdAt: '2024-01-04 13:00:00'
        },
        {
          id: 5,
          title: '南山区科技园精装三房',
          city: '深圳',
          district: '南山区',
          address: '科技园南区',
          price: 8500,
          area: 105,
          houseType: '3室2厅2卫',
          description: '科技园核心区域，精装修三房，适合家庭居住，周边科技企业集中。',
          contactName: '陈经理',
          contactPhone: '13500135001',
          contactWechat: 'chen135001',
          status: 'published',
          createdAt: '2024-01-05 14:00:00'
        },
        {
          id: 6,
          title: '天河区珠江新城豪华公寓',
          city: '广州',
          district: '天河区',
          address: '珠江新城核心区',
          price: 9800,
          area: 88,
          houseType: '2室2厅1卫',
          description: '珠江新城CBD豪华公寓，高端装修，视野开阔，生活便利。',
          contactName: '刘先生',
          contactPhone: '13400134001',
          contactWechat: 'liu134001',
          status: 'published',
          createdAt: '2024-01-06 15:00:00'
        }
      ]
      
      // 根据城市筛选模拟数据
      if (city) {
        listings = mockListings.filter(listing => 
          listing.city.includes(city)
        )
      } else {
        listings = mockListings
      }
      
      totalItems = listings.length
      
      // 应用分页
      const offset = (page - 1) * limit
      listings = listings.slice(offset, offset + parseInt(limit))
    } else {
      listings = result.data
      
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

      totalItems = totalResult.data[0].total
    }

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
      { name: '北京' },
      { name: '上海' },
      { name: '广州' },
      { name: '深圳' },
      { name: '杭州' },
      { name: '成都' }
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
      title, city, district || '', address || '', parseInt(price), houseType || '', area ? parseInt(area) : null,
      description || '', contactName || '', contactPhone, contactWechat || '', status
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
        contact_name = ?, contact_phone = ?, contact_wechat = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      title, city, district || '', address || '', parseInt(price), 
      houseType || '', area ? parseInt(area) : null, description || '', 
      contactName || '', contactPhone, contactWechat || '', status, parseInt(id)
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