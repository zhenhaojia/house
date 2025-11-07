import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 简单的构建脚本，用于生产环境
async function build() {
  console.log('🔨 开始构建后端应用...')
  
  try {
    // 确保dist目录存在
    const distDir = path.join(__dirname, 'dist')
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }
    
    // 复制必要的文件到dist目录
    const filesToCopy = [
      'package.json',
      'package-lock.json'
    ]
    
    for (const file of filesToCopy) {
      const sourcePath = path.join(__dirname, file)
      const destPath = path.join(distDir, file)
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath)
        console.log(`✅ 复制文件: ${file}`)
      }
    }
    
    // 复制src目录
    const srcDir = path.join(__dirname, 'src')
    const destSrcDir = path.join(distDir, 'src')
    
    if (fs.existsSync(srcDir)) {
      copyDir(srcDir, destSrcDir)
      console.log('✅ 复制源代码目录')
    }
    
    console.log('🎉 后端应用构建完成')
    
  } catch (error) {
    console.error('❌ 构建失败:', error)
    process.exit(1)
  }
}

function copyDir(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true })
  }
  
  const files = fs.readdirSync(source)
  
  for (const file of files) {
    const sourcePath = path.join(source, file)
    const destPath = path.join(destination, file)
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath)
    } else {
      fs.copyFileSync(sourcePath, destPath)
    }
  }
}

build().catch(console.error)