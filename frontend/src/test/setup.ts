import '@testing-library/jest-dom'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock File API
Object.defineProperty(window, 'File', {
  writable: true,
  value: class File {
    constructor(
      public chunks: BlobPart[],
      public name: string,
      public options?: FilePropertyBag
    ) {}
  },
})

// Mock FileReader
Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: class FileReader {
    result: string | ArrayBuffer | null = null
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null
    onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
    
    readAsText(file: Blob) {
      setTimeout(() => {
        this.result = 'mock file content'
        if (this.onload) {
          this.onload({} as ProgressEvent<FileReader>)
        }
      }, 0)
    }
    
    readAsDataURL(file: Blob) {
      setTimeout(() => {
        this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ='
        if (this.onload) {
          this.onload({} as ProgressEvent<FileReader>)
        }
      }, 0)
    }
  },
})
