import express from 'express'
import { query, transaction } from '../config/database.js'

const router = express.Router()

// 管理员发布新房源
router.post('/listings', async (req, res) => {
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
      images,
      contactName,
      contactPhone,
      latitude,
      longitude
    } = req.body

    // 验证必填字段
    if (!title || !city || !district || !address || !price || !houseType || !area) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段'
      })
    }

    // 验证价格和面积
    if (price <= 0 || area <= 0) {
      return res.status(400).json({
        success: false,
        error: '价格和面积必须大于0'
      })
    }

    // 使用事务确保数据一致性
    const result = await transaction(async (connection) => {
      // 插入房源信息
      const [listingResult] = await connection.execute(
        `INSERT INTO listings (
          title, city, district, address, price, house_type, area, 
          description, images, contact_name, contact_phone, 
          latitude, longitude, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          title, city, district, address, parseFloat(price), houseType, 
          parseFloat(area), description || '', 
          images ? JSON.stringify(images) : null,
          contactName || '', contactPhone || '',
          latitude || null, longitude || null, 'published'
        ]
      )

      return {
        listingId: listingResult.insertId,
        message: '房源发布成功'
      }
    })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('发布房源错误:', error)
    res.status(500).json({
      success: false,
      error: '房源发布失败'
    })
  }
})

// 管理员编辑房源
router.put('/listings/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params
    const {
      title,
      city,
      district,
      address,
      price,
      houseType,
      area,
      description,
      images,
      contactName,
      contactPhone,
      latitude,
      longitude,
      status
    } = req.body

    // 检查房源是否存在
    const existingResult = await query(
      'SELECT id FROM listings WHERE id = ?',
      [parseInt(listingId)]
    )

    if (!existingResult.success || existingResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在'
      })
    }

    // 构建更新字段和参数
    const updateFields = []
    const updateParams = []

    if (title !== undefined) {
      updateFields.push('title = ?')
      updateParams.push(title)
    }
    if (city !== undefined) {
      updateFields.push('city = ?')
      updateParams.push(city)
    }
    if (district !== undefined) {
      updateFields.push('district = ?')
      updateParams.push(district)
    }
    if (address !== undefined) {
      updateFields.push('address = ?')
      updateParams.push(address)
    }
    if (price !== undefined) {
      updateFields.push('price = ?')
      updateParams.push(parseFloat(price))
    }
    if (houseType !== undefined) {
      updateFields.push('house_type = ?')
      updateParams.push(houseType)
    }
    if (area !== undefined) {
      updateFields.push('area = ?')
      updateParams.push(parseFloat(area))
    }
    if (description !== undefined) {
      updateFields.push('description = ?')
      updateParams.push(description)
    }
    if (images !== undefined) {
      updateFields.push('images = ?')
      updateParams.push(images ? JSON.stringify(images) : null)
    }
    if (contactName !== undefined) {
      updateFields.push('contact_name = ?')
      updateParams.push(contactName)
    }
    if (contactPhone !== undefined) {
      updateFields.push('contact_phone = ?')
      updateParams.push(contactPhone)
    }
    if (latitude !== undefined) {
      updateFields.push('latitude = ?')
      updateParams.push(latitude)
    }
    if (longitude !== undefined) {
      updateFields.push('longitude = ?')
      updateParams.push(longitude)
    }
    if (status !== undefined) {
      updateFields.push('status = ?')
      updateParams.push(status)
    }

    // 添加更新时间
    updateFields.push('updated_at = NOW()')

    if (updateFields.length === 1) { // 只有updated_at字段
      return res.status(400).json({
        success: false,
        error: '没有提供要更新的字段'
      })
    }

    updateParams.push(parseInt(listingId))

    const updateResult = await query(
      `UPDATE listings SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    )

    if (!updateResult.success) {
      throw new Error('更新房源失败')
    }

    res.json({
      success: true,
      data: {
        message: '房源更新成功'
      }
    })
  } catch (error) {
    console.error('编辑房源错误:', error)
    res.status(500).json({
      success: false,
      error: '房源编辑失败'
    })
  }
})

// 管理员删除房源
router.delete('/listings/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params

    // 检查房源是否存在
    const existingResult = await query(
      'SELECT id FROM listings WHERE id = ?',
      [parseInt(listingId)]
    )

    if (!existingResult.success || existingResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在'
      })
    }

    // 软删除房源（更新状态为deleted）
    const deleteResult = await query(
      'UPDATE listings SET status = ?, updated_at = NOW() WHERE id = ?',
      ['deleted', parseInt(listingId)]
    )

    if (!deleteResult.success) {
      throw new Error('删除房源失败')
    }

    res.json({
      success: true,
      data: {
        message: '房源删除成功'
      }
    })
  } catch (error) {
    console.error('删除房源错误:', error)
    res.status(500).json({
      success: false,
      error: '房源删除失败'
    })
  }
})

// 获取待审核房源列表
router.get('/listings/pending', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const listingsResult = await query(
      `SELECT * FROM listings 
       WHERE status = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      ['pending', parseInt(limit), parseInt(offset)]
    )

    if (!listingsResult.success) {
      throw new Error('查询待审核房源失败')
    }

    // 查询总数
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM listings WHERE status = ?',
      ['pending']
    )

    if (!totalResult.success) {
      throw new Error('查询总数失败')
    }

    const totalItems = totalResult.data[0].total

    res.json({
      success: true,
      data: {
        listings: listingsResult.data,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('获取待审核房源错误:', error)
    res.status(500).json({
      success: false,
      error: '获取待审核房源失败'
    })
  }
})

// 审核房源
router.post('/listings/:listingId/review', async (req, res) => {
  try {
    const { listingId } = req.params
    const { action, reason } = req.body // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: '无效的操作类型'
      })
    }

    // 检查房源是否存在且状态为pending
    const existingResult = await query(
      'SELECT id, status FROM listings WHERE id = ?',
      [parseInt(listingId)]
    )

    if (!existingResult.success || existingResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '房源不存在'
      })
    }

    if (existingResult.data[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: '房源状态不符合审核条件'
      })
    }

    const newStatus = action === 'approve' ? 'published' : 'rejected'
    
    const updateResult = await query(
      'UPDATE listings SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, parseInt(listingId)]
    )

    if (!updateResult.success) {
      throw new Error('审核房源失败')
    }

    // 记录审核日志
    if (action === 'reject' && reason) {
      await query(
        'INSERT INTO admin_audit_logs (listing_id, action, reason, created_at) VALUES (?, ?, ?, NOW())',
        [parseInt(listingId), 'reject', reason]
      )
    }

    res.json({
      success: true,
      data: {
        message: `房源${action === 'approve' ? '审核通过' : '审核拒绝'}成功`
      }
    })
  } catch (error) {
    console.error('审核房源错误:', error)
    res.status(500).json({
      success: false,
      error: '审核房源失败'
    })
  }
})

// 获取房源统计信息
router.get('/statistics', async (req, res) => {
  try {
    // 获取房源总数
    const totalListingsResult = await query(
      'SELECT COUNT(*) as total FROM listings'
    )

    // 获取各状态房源数量
    const statusStatsResult = await query(
      'SELECT status, COUNT(*) as count FROM listings GROUP BY status'
    )

    // 获取今日新增房源
    const todayListingsResult = await query(
      'SELECT COUNT(*) as count FROM listings WHERE DATE(created_at) = CURDATE()'
    )

    // 获取各城市房源分布
    const cityStatsResult = await query(
      'SELECT city, COUNT(*) as count FROM listings GROUP BY city ORDER BY count DESC'
    )

    if (!totalListingsResult.success || !statusStatsResult.success) {
      throw new Error('获取统计信息失败')
    }

    res.json({
      success: true,
      data: {
        totalListings: totalListingsResult.success ? totalListingsResult.data[0].total : 0,
        todayListings: todayListingsResult.success ? todayListingsResult.data[0].count : 0,
        statusStats: statusStatsResult.success ? statusStatsResult.data : [],
        cityStats: cityStatsResult.success ? cityStatsResult.data : []
      }
    })
  } catch (error) {
    console.error('获取统计信息错误:', error)
    res.status(500).json({
      success: false,
      error: '获取统计信息失败'
    })
  }
})

export default router