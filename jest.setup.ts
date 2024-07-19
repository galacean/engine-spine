if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = jest.fn();
}
if (typeof window.URL.revokeObjectURL === 'undefined') {
  window.URL.revokeObjectURL = jest.fn();
}

class MockImage {
  onload: () => void = () => {};
  onerror: () => void = () => {};

  set src(_url: string) {
    // 在这里模拟图片加载成功
    if (this.onload) {
      setTimeout(() => this.onload(), 0); // 使用 setTimeout 确保异步执行
    }
  }
}

(window as any).Image = MockImage;