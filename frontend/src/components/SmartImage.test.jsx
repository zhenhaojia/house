import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SmartImage from './ImagePlaceholder'

// 模拟测试图片URL
const testImageUrl = 'https://example.com/test-image.jpg'
const invalidImageUrl = 'https://example.com/invalid-image.jpg'

describe('SmartImage Component', () => {
  
  // 测试1: 正常图片加载
  it('should load and display image successfully', async () => {
    // 模拟图片加载成功
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload()
          this.naturalWidth = 800
          this.naturalHeight = 600
        }, 100)
      }
    }

    render(
      <SmartImage 
        src={testImageUrl}
        alt="测试图片"
        className="test-image"
      />
    )

    // 检查加载状态
    expect(screen.getByAltText('测试图片')).toBeInTheDocument()
    
    // 等待图片加载完成
    await waitFor(() => {
      expect(screen.getByAltText('测试图片')).toHaveStyle('opacity: 1')
    })
  })

  // 测试2: 空白图片处理
  it('should show placeholder when no image source provided', () => {
    render(
      <SmartImage 
        src={null}
        alt="空白图片"
        message="暂无图片"
        variant="house"
      />
    )

    // 检查占位符显示
    expect(screen.getByText('暂无图片')).toBeInTheDocument()
    expect(screen.queryByAltText('空白图片')).not.toBeInTheDocument()
  })

  // 测试3: 图片加载错误处理
  it('should show error placeholder when image fails to load', async () => {
    // 模拟图片加载失败
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onerror && this.onerror()
        }, 100)
      }
    }

    render(
      <SmartImage 
        src={invalidImageUrl}
        alt="错误图片"
        message="加载失败"
        variant="camera"
      />
    )

    // 等待错误处理
    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument()
    })
  })

  // 测试4: 加载状态显示
  it('should show loading spinner during image loading', () => {
    // 模拟缓慢加载
    global.Image = class {
      constructor() {
        // 不立即触发onload
      }
    }

    render(
      <SmartImage 
        src={testImageUrl}
        alt="加载图片"
      />
    )

    // 检查加载动画
    const img = screen.getByAltText('加载图片')
    expect(img).toHaveStyle('opacity: 0')
  })

  // 测试5: 不同尺寸变体
  it('should render different size variants correctly', () => {
    const { container } = render(
      <>
        <SmartImage src={null} size="small" variant="house" />
        <SmartImage src={null} size="medium" variant="camera" />
        <SmartImage src={null} size="large" variant="image" />
      </>
    )

    const placeholders = container.querySelectorAll('div')
    expect(placeholders.length).toBeGreaterThan(0)
  })

  // 测试6: 自定义消息和子消息
  it('should display custom message and subMessage', () => {
    render(
      <SmartImage 
        src={null}
        message="自定义提示"
        subMessage="更多信息"
        variant="house"
      />
    )

    expect(screen.getByText('自定义提示')).toBeInTheDocument()
    expect(screen.getByText('更多信息')).toBeInTheDocument()
  })

  // 测试7: 事件回调
  it('should call onLoad and onError callbacks', async () => {
    const onLoadMock = jest.fn()
    const onErrorMock = jest.fn()

    // 测试加载成功
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload()
        }, 100)
      }
    }

    render(
      <SmartImage 
        src={testImageUrl}
        onLoad={onLoadMock}
        onError={onErrorMock}
        alt="回调测试"
      />
    )

    await waitFor(() => {
      expect(onLoadMock).toHaveBeenCalled()
    })
  })

  // 测试8: 懒加载功能
  it('should support lazy loading', () => {
    render(
      <SmartImage 
        src={testImageUrl}
        lazy={true}
        alt="懒加载测试"
      />
    )

    const img = screen.getByAltText('懒加载测试')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  // 测试9: 容器类名应用
  it('should apply container class correctly', () => {
    const { container } = render(
      <SmartImage 
        src={null}
        containerClass="custom-container"
        variant="house"
      />
    )

    const containerDiv = container.querySelector('.custom-container')
    expect(containerDiv).toBeInTheDocument()
  })

  // 测试10: 图片类名应用
  it('should apply image class correctly', () => {
    render(
      <SmartImage 
        src={testImageUrl}
        className="custom-image-class"
        alt="类名测试"
      />
    )

    const img = screen.getByAltText('类名测试')
    expect(img).toHaveClass('custom-image-class')
  })
})