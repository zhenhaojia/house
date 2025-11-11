import { render, screen, waitFor } from '@testing-library/react';
import SmartImage from './ImagePlaceholder';

// 模拟测试环境
global.Image = class {
  constructor() {
    setTimeout(() => {
      if (this.src === 'https://example.com/test-image.jpg') {
        this.onload && this.onload();
      } else {
        this.onerror && this.onerror();
      }
    }, 10);
  }
};

// 测试组件功能
describe('SmartImage Component Functional Tests', () => {
  
  test('renders with placeholder when no src provided', () => {
    render(<SmartImage alt="测试图片" />);
    
    // 应该显示默认占位符
    expect(screen.getByText('暂无图片')).toBeInTheDocument();
    
    // 不应该有图片元素
    expect(screen.queryByAltText('测试图片')).not.toBeInTheDocument();
  });

  test('renders image when src is provided', async () => {
    render(
      <SmartImage 
        src="https://example.com/test-image.jpg" 
        alt="测试图片" 
      />
    );

    // 应该有图片元素
    const img = screen.getByAltText('测试图片');
    expect(img).toBeInTheDocument();
    
    // 图片应该正在加载
    expect(img).toHaveStyle('opacity: 0');
  });

  test('handles image loading error', async () => {
    render(
      <SmartImage 
        src="https://example.com/invalid-image.jpg" 
        alt="错误图片" 
        message="加载失败"
      />
    );

    // 等待错误处理
    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('supports different size variants', () => {
    const { container } = render(
      <SmartImage 
        src={null}
        size="small"
        variant="house"
        message="小尺寸"
      />
    );

    expect(screen.getByText('小尺寸')).toBeInTheDocument();
  });

  test('applies custom CSS classes', () => {
    render(
      <SmartImage 
        src="https://example.com/test-image.jpg"
        alt="类名测试"
        className="custom-image-class"
        containerClass="custom-container"
      />
    );

    const img = screen.getByAltText('类名测试');
    expect(img).toHaveClass('custom-image-class');
  });
});