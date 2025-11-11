import '@testing-library/jest-dom';

// 模拟 window.matchMedia
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  }
}

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// 模拟图片对象
const mockImage = {
  naturalWidth: 800,
  naturalHeight: 600,
  onload: null,
  onerror: null,
  src: ''
}

global.Image = class {
  constructor() {
    setTimeout(() => {
      if (this.src === 'https://example.com/test-image.jpg') {
        this.onload && this.onload()
      } else {
        this.onerror && this.onerror()
      }
    }, 100)
    
    // 添加属性
    Object.assign(this, mockImage)
  }
}

// 模拟URL.createObjectURL
URL.createObjectURL = jest.fn(() => 'blob:test-url')