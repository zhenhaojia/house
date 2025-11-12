import pool from '../config/mysql.js'

// 数据库中间件
const dbMiddleware = (req, res, next) => {
  req.db = {
    query: async (sql, params = []) => {
      try {
        const [rows] = await pool.execute(sql, params)
        return [rows]
      } catch (error) {
        console.error('数据库查询错误:', error)
        throw error
      }
    }
  }
  next()
}

export default dbMiddleware