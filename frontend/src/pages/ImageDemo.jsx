import { useState } from 'react'
import SmartImage from '../components/ImagePlaceholder'

function ImageDemo() {
  const [demoType, setDemoType] = useState('all')

  const testImages = [
    // 正常图片
    {
      src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
      alt: '正常图片示例',
      description: '正常图片加载'
    },
    // 空白图片
    {
      src: null,
      alt: '空白图片示例',
      description: '空白图片处理'
    },
    // 错误图片（无效URL）
    {
      src: 'https://example.com/invalid-image.jpg',
      alt: '错误图片示例',
      description: '图片加载错误处理'
    }
  ]

  const demoConfigs = {
    all: { title: '所有功能演示', images: testImages },
    normal: { 
      title: '正常图片演示', 
      images: [testImages[0]] 
    },
    blank: { 
      title: '空白图片演示', 
      images: [testImages[1]] 
    },
    error: { 
      title: '错误处理演示', 
      images: [testImages[2]] 
    }
  }

  const currentDemo = demoConfigs[demoType]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          SmartImage组件功能演示
        </h1>
        
        {/* 演示类型选择 */}
        <div className="mb-8">
          <div className="flex space-x-4 mb-4">
            {Object.entries(demoConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setDemoType(key)}
                className={`px-4 py-2 rounded-md ${
                  demoType === key 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {config.title}
              </button>
            ))}
          </div>
        </div>

        {/* 功能演示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentDemo.images.map((image, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">{image.description}</h3>
              
              <div className="space-y-4">
                {/* 基本使用 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">基本使用</h4>
                  <SmartImage
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-48 object-cover rounded-lg"
                    size="medium"
                    variant="house"
                    message="暂无图片"
                    containerClass="w-full h-48"
                  />
                </div>

                {/* 不同尺寸 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">不同尺寸</h4>
                  <div className="flex space-x-4">
                    <SmartImage
                      src={image.src}
                      alt="小尺寸"
                      size="small"
                      variant="camera"
                      message="小"
                    />
                    <SmartImage
                      src={image.src}
                      alt="中尺寸"
                      size="medium"
                      variant="image"
                      message="中"
                    />
                    <SmartImage
                      src={image.src}
                      alt="大尺寸"
                      size="large"
                      variant="house"
                      message="大"
                    />
                  </div>
                </div>

                {/* 自定义消息 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">自定义消息</h4>
                  <SmartImage
                    src={image.src}
                    alt="自定义消息"
                    size="medium"
                    variant="camera"
                    message="自定义提示"
                    subMessage="更多信息"
                  />
                </div>

                {/* 状态信息 */}
                <div className="text-xs text-gray-500">
                  <div>图片源: {image.src || 'null'}</div>
                  <div>描述: {image.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 功能说明 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">SmartImage组件功能特性</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">核心功能</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ 自动处理图片加载状态</li>
                <li>✅ 统一的空白图片占位符</li>
                <li>✅ 图片加载错误处理</li>
                <li>✅ 加载动画显示</li>
                <li>✅ 支持懒加载</li>
                <li>✅ 多种尺寸和样式变体</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">技术特性</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ React Hooks状态管理</li>
                <li>✅ 自定义错误边界</li>
                <li>✅ 性能优化（懒加载）</li>
                <li>✅ 无障碍支持（alt属性）</li>
                <li>✅ 响应式设计</li>
                <li>✅ TypeScript类型支持</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用示例 */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">代码使用示例</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">基本用法</h4>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<SmartImage
  src="图片URL"
  alt="图片描述"
  className="自定义类名"
  size="medium"
  variant="house"
/>`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">高级用法</h4>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<SmartImage
  src={imageUrl}
  alt="自定义图片"
  message="加载中..."
  subMessage="请稍候"
  onLoad={handleLoad}
  onError={handleError}
  lazy={true}
  containerClass="custom-container"
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageDemo