import { useState } from 'react'
import { Home, Camera, Image as ImageIcon } from 'lucide-react'

/**
 * 智能图片组件
 * 统一处理图片加载、错误和空白图片情况
 */
function SmartImage({ 
  src, 
  alt = '', 
  className = '', 
  size = 'medium', 
  variant = 'house',
  message = '暂无图片',
  subMessage = '',
  containerClass = '',
  lazy = true,
  onLoad,
  onError
}) {
  const [imageState, setImageState] = useState('loading') // loading, loaded, error
  const [showPlaceholder, setShowPlaceholder] = useState(!src)

  const handleImageLoad = (e) => {
    setImageState('loaded')
    setShowPlaceholder(false)
    onLoad?.(e)
  }

  const handleImageError = (e) => {
    setImageState('error')
    setShowPlaceholder(true)
    onError?.(e)
  }

  // 图片占位符组件
  const ImagePlaceholder = () => {
    const sizeClasses = {
      small: 'w-16 h-16',
      medium: 'w-20 h-20',
      large: 'w-32 h-32'
    }

    const variantConfigs = {
      house: {
        icon: <Home className="text-gray-400" />,
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-500'
      },
      camera: {
        icon: <Camera className="text-gray-400" />,
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-500'
      },
      image: {
        icon: <ImageIcon className="text-gray-400" />,
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-500'
      }
    }

    const config = variantConfigs[variant] || variantConfigs.house

    return (
      <div className={`${sizeClasses[size]} ${config.bgClass} rounded-lg flex items-center justify-center flex-col p-4`}>
        <div className="text-2xl">
          {config.icon}
        </div>
        <span className={`text-sm font-medium mt-2 ${config.textClass}`}>
          {message}
        </span>
        {subMessage && (
          <span className="text-xs text-gray-400 mt-1">
            {subMessage}
          </span>
        )}
      </div>
    )
  }

  // 加载状态指示器
  const LoadingSpinner = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )

  return (
    <div className={`relative ${containerClass}`}>
      {/* 图片 */}
      {src && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* 加载状态 */}
      {src && imageState === 'loading' && (
        <div className="absolute inset-0">
          <LoadingSpinner />
        </div>
      )}
      
      {/* 占位符 */}
      {showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImagePlaceholder />
        </div>
      )}
    </div>
  )
}

/**
 * 独立的图片占位符组件（向后兼容）
 */
function ImagePlaceholder({ 
  size = 'medium', 
  variant = 'house', 
  message = '暂无图片',
  subMessage = '' 
}) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
  }

  const variantConfigs = {
    house: {
      icon: <Home className="text-gray-400" />,
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-500'
    },
    camera: {
      icon: <Camera className="text-gray-400" />,
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-500'
    },
    image: {
      icon: <ImageIcon className="text-gray-400" />,
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-500'
    }
  }

  const config = variantConfigs[variant] || variantConfigs.house

  return (
    <div className={`${sizeClasses[size]} ${config.bgClass} rounded-lg flex items-center justify-center flex-col p-4`}>
      <div className="text-2xl">
        {config.icon}
      </div>
      <span className={`text-sm font-medium mt-2 ${config.textClass}`}>
        {message}
      </span>
      {subMessage && (
        <span className="text-xs text-gray-400 mt-1">
          {subMessage}
        </span>
      )}
    </div>
  )
}

export { SmartImage, ImagePlaceholder }
export default SmartImage