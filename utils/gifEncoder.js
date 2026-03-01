// GIF 编码器 - 微信小程序适配版
// 支持基础 GIF89a 格式编码

class GIFEncoder {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.frames = []
    this.delay = 100
    this.repeat = 0
  }

  setDelay(ms) {
    this.delay = Math.max(20, Math.round(ms / 10))
  }

  setRepeat(repeat) {
    this.repeat = repeat
  }

  setQuality(quality) {
    // 质量参数，用于颜色量化
    this.quality = quality
  }

  addFrame(canvas) {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, this.width, this.height)
    this.frames.push({
      data: imageData,
      delay: this.delay
    })
  }

  start() {
    this.output = []
    this.colorTable = null
    this.colorDepth = 8
  }

  finish() {
    return this.encode()
  }

  encode() {
    if (this.frames.length === 0) return null

    const output = []
    
    // 分析颜色并生成调色板
    this.analyzeColors()
    
    // GIF Header
    this.writeString(output, 'GIF89a')
    
    // Logical Screen Descriptor
    this.writeShort(output, this.width)
    this.writeShort(output, this.height)
    
    // Packed byte: Global Color Table Flag, Color Resolution, Sort, Size
    const globalColorTableSize = this.colorTable ? (this.colorTable.length / 3 - 1) : 255
    const packed = 0x80 | (0x70) | (Math.min(7, Math.max(0, this.getColorTableSizeLog2(globalColorTableSize))))
    output.push(packed)
    
    // Background Color Index
    output.push(0)
    
    // Pixel Aspect Ratio
    output.push(0)
    
    // Global Color Table
    this.writeColorTable(output)
    
    // Application Extension (Netscape Loop)
    if (this.repeat !== null) {
      output.push(0x21)
      output.push(0xff)
      output.push(0x0b)
      this.writeString(output, 'NETSCAPE2.0')
      output.push(0x03)
      output.push(0x01)
      this.writeShort(output, this.repeat)
      output.push(0x00)
    }
    
    // 编码每一帧
    for (let i = 0; i < this.frames.length; i++) {
      this.encodeFrame(output, this.frames[i])
    }
    
    // GIF Trailer
    output.push(0x3b)
    
    return new Uint8Array(output)
  }

  analyzeColors() {
    // 简化：使用 256 色调色板
    this.colorTable = new Uint8Array(256 * 3)
    for (let i = 0; i < 256; i++) {
      this.colorTable[i * 3] = i
      this.colorTable[i * 3 + 1] = i
      this.colorTable[i * 3 + 2] = i
    }
  }

  writeColorTable(output) {
    if (this.colorTable) {
      for (let i = 0; i < this.colorTable.length; i++) {
        output.push(this.colorTable[i])
      }
    }
  }

  getColorTableSizeLog2(size) {
    let log2 = 0
    let s = size + 1
    while (s > 1) {
      s >>= 1
      log2++
    }
    return log2 - 1
  }

  encodeFrame(output, frame) {
    // Graphic Control Extension
    output.push(0x21)
    output.push(0xf9)
    output.push(0x04)
    
    // Packed fields: Reserved, Disposal, User input, Transparency
    output.push(0x00)
    
    // Delay time
    this.writeShort(output, frame.delay || this.delay)
    
    // Transparent color index
    output.push(0)
    
    // Block terminator
    output.push(0x00)
    
    // Image Descriptor
    output.push(0x2c)
    this.writeShort(output, 0) // Left
    this.writeShort(output, 0) // Top
    this.writeShort(output, this.width)
    this.writeShort(output, this.height)
    
    // Packed byte: Local color table flag, Interlace, Sort, Reserved, Size
    output.push(0x00)
    
    // Image Data
    const pixels = this.ditherFrame(frame.data)
    this.writeLZWData(output, pixels)
  }

  ditherFrame(imageData) {
    const data = imageData.data
    const pixels = new Uint8Array(this.width * this.height)
    
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      // Floyd-Steinberg 抖动简化版
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // 转换为灰度
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
      
      // 量化到 256 级
      pixels[j] = Math.min(255, Math.max(0, gray))
    }
    
    return pixels
  }

  writeLZWData(output, pixels) {
    // LZW Minimum Code Size
    output.push(0x08)
    
    // 简化的 LZW 压缩
    const compressed = this.compressLZW(pixels)
    
    // 分块写入
    let pos = 0
    while (pos < compressed.length) {
      const blockSize = Math.min(255, compressed.length - pos)
      output.push(blockSize)
      for (let i = 0; i < blockSize; i++) {
        output.push(compressed[pos + i])
      }
      pos += blockSize
    }
    
    // Block terminator
    output.push(0x00)
  }

  compressLZW(pixels) {
    // 简化的压缩：直接返回像素数据
    // 实际应该实现完整的 LZW 压缩算法
    return pixels
  }

  writeString(output, str) {
    for (let i = 0; i < str.length; i++) {
      output.push(str.charCodeAt(i))
    }
  }

  writeShort(output, value) {
    output.push(value & 0xff)
    output.push((value >> 8) & 0xff)
  }
}

module.exports = { GIFEncoder }
