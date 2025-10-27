import { useEffect, useRef } from 'react'

function MapView({ latitude, longitude, address, className = '' }) {
  const mapRef = useRef(null)
  
  useEffect(() => {
    // 模拟地图显示 - 在实际项目中可以集成百度地图、高德地图等
    const initMap = () => {
      if (!mapRef.current) return
      
      // 创建简单的地图占位符
      const mapElement = mapRef.current
      mapElement.innerHTML = `
        <div style="width: 100%; height: 100%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <div style="text-align: center; color: #666;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
            <div style="font-weight: bold; margin-bottom: 8px;">房源位置</div>
            <div style="font-size: 14px;">${address || '位置信息加载中...'}</div>
            ${latitude && longitude ? `
              <div style="font-size: 12px; margin-top: 8px;">
                坐标: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
              </div>
            ` : ''}
            <div style="font-size: 12px; margin-top: 16px; color: #999;">
              实际项目中可集成百度地图/高德地图
            </div>
          </div>
        </div>
      `
    }
    
    initMap()
  }, [latitude, longitude, address])

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">房源位置</h3>
        {address && (
          <p className="text-gray-600 mt-1">{address}</p>
        )}
      </div>
      <div 
        ref={mapRef}
        className="w-full h-64 bg-gray-100 rounded-lg"
      />
      
      {/* 地图集成说明 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">地图集成说明</h4>
        <p className="text-xs text-blue-600">
          实际项目中可集成：
          <br />• 百度地图 JavaScript API
          <br />• 高德地图 JavaScript API  
          <br />• 腾讯地图 JavaScript API
        </p>
      </div>
    </div>
  )
}

export default MapView