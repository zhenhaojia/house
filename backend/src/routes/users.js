import express from 'express'
import { body } from 'express-validator'
import {
  registerTenant,
  registerLandlord,
  loginTenant,
  loginLandlord,
  getCurrentUser,
  addFavorite,
  removeFavorite,
  getFavorites,
  submitInquiry
} from '../controllers/userController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// 租客注册
router.post('/register', [
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3 }).withMessage('用户名至少3个字符')
    .isAlphanumeric().withMessage('用户名只能包含字母和数字'),
  body('email')
    .isEmail().withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 }).withMessage('密码至少6位'),
  body('phone')
    .optional()
    .isMobilePhone('zh-CN').withMessage('请输入有效的手机号')
], registerTenant)

// 房东注册
router.post('/register/landlord', [
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3 }).withMessage('用户名至少3个字符')
    .isAlphanumeric().withMessage('用户名只能包含字母和数字'),
  body('email')
    .isEmail().withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 }).withMessage('密码至少6位'),
  body('phone')
    .optional()
    .isMobilePhone('zh-CN').withMessage('请输入有效的手机号')
], registerLandlord)

// 租客登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], loginTenant)

// 房东登录
router.post('/login/landlord', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], loginLandlord)

// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, getCurrentUser)

// 收藏相关路由（需要认证）
router.post('/favorites', authenticateToken, addFavorite)
router.delete('/favorites/:listingId', authenticateToken, removeFavorite)
router.get('/favorites', authenticateToken, getFavorites)

// 提交咨询（需要认证）
router.post('/inquiries', [
  body('listingId').isInt({ min: 1 }).withMessage('房源ID无效'),
  body('message').notEmpty().withMessage('咨询内容不能为空'),
  body('contactPhone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号'),
  body('contactWechat').optional().isLength({ min: 1 }).withMessage('微信号不能为空')
], authenticateToken, submitInquiry)

export default router