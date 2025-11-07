import { useState, useRef, useEffect } from 'react'

function LazyImage({ src, alt, className = '', placeholder = null }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    // 创建 Intersection Observer 来检测图片是否进入视口
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  // 默认占位符
  const defaultPlaceholder = (
    <div className="bg-gray-200 animate-pulse flex items-center justify-center">
      <span className="text-gray-400 text-sm">图片加载中...</span>
    </div>
  )

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* 占位符 */}
      {!isLoaded && (placeholder || defaultPlaceholder)}
      
      {/* 实际图片 */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading="lazy"
        />
      )}
    </div>
  )
}

export default LazyImage