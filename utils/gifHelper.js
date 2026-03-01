// GIF 生成工具 - 微信小程序本地生成版

const templates = require('./templates.js')
const { GIFEncoder } = require('./gifEncoder.js')

/**
 * 生成 GIF 动画
 * @param {Object} options 配置选项
 * @returns {Promise<{tempFilePath: string}>}
 */
async function generateGIF(options) {
  const {
    text,
    selectedTemplate,
    enableEffects,
    canvasSize,
    fontSize,
    color,
    bgColor,
    fps,
    speed,
    textAlign,
    isBold,
    strokeColor,
    strokeWidth,
    fontFamily,
    onProgress
  } = options

  // 生成帧数据
  const frameOptions = {
    text,
    width: canvasSize,
    height: canvasSize,
    fontSize,
    color,
    backgroundColor: bgColor,
    fps,
    duration: 2000,
    textAlign,
    isBold,
    strokeColor,
    strokeWidth,
    fontFamily
  }

  let frames = []
  if (onProgress) onProgress(10)

  if (enableEffects) {
    const template = templates.getTemplate(selectedTemplate)
    if (template) {
      frames = template.generateFrames(frameOptions)
    }
  } else {
    frames = generateStaticFrames(frameOptions)
  }

  if (onProgress) onProgress(30)

  // 应用速度调整
  frames = frames.map(f => ({
    ...f,
    delay: Math.round(f.delay / (speed || 1))
  }))

  if (onProgress) onProgress(50)

  // 本地生成 GIF
  const gifData = await createGIFFromFrames(frames, canvasSize, canvasSize, { 
    fps: 30 / (speed || 1),
    onProgress 
  })

  return gifData
}

/**
 * 生成静态帧
 */
function generateStaticFrames(options) {
  const { width, height, fps, duration } = options
  const frames = []
  const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

  // 创建离屏 Canvas
  const canvas = wx.createOffscreenCanvas({ type: '2d', width, height })

  // 绘制多帧（静态效果，内容相同）
  for (let i = 0; i < totalFrames; i++) {
    frames.push({
      data: null, // 延迟绘制
      delay: Math.round(1000 / fps),
      options: { ...options }
    })
  }

  return frames
}

/**
 * 从帧创建 GIF
 */
async function createGIFFromFrames(frames, width, height, options = {}) {
  const { fps = 30, onProgress } = options
  
  if (!frames || frames.length === 0) {
    throw new Error('没有可用的帧数据')
  }

  // 限制帧数以控制文件大小和生成时间
  const maxFrames = 30
  const step = Math.max(1, Math.floor(frames.length / maxFrames))
  const selectedFrames = []
  for (let i = 0; i < frames.length; i += step) {
    selectedFrames.push(frames[i])
  }

  if (onProgress) onProgress(60)

  // 创建 GIF 编码器
  const encoder = new GIFEncoder(width, height)
  encoder.start()
  encoder.setRepeat(0) // 循环播放
  encoder.setDelay(1000 / fps)
  encoder.setQuality(10)

  // 创建离屏 canvas 用于绘制
  const canvas = wx.createOffscreenCanvas({ type: '2d', width, height })
  const ctx = canvas.getContext('2d')

  // 编码每一帧
  for (let i = 0; i < selectedFrames.length; i++) {
    const frame = selectedFrames[i]
    
    // 清空画布
    ctx.clearRect(0, 0, width, height)
    
    // 如果是模板生成的帧，直接使用 canvas
    if (frame.data && frame.data.getContext) {
      // 复制模板 canvas 内容
      ctx.drawImage(frame.data, 0, 0)
    } else if (frame.options) {
      // 静态帧，需要绘制
      drawFrame(ctx, frame.options)
    }

    // 添加帧到编码器
    encoder.addFrame(canvas)
    
    if (onProgress) {
      onProgress(60 + Math.round((i + 1) / selectedFrames.length * 30))
    }
  }

  // 完成编码
  const gifBytes = encoder.finish()
  
  if (!gifBytes) {
    throw new Error('GIF 编码失败')
  }

  if (onProgress) onProgress(95)

  // 保存为临时文件
  const filePath = await saveBytesToFile(gifBytes, 'gif')
  
  if (onProgress) onProgress(100)

  return {
    tempFilePath: filePath,
    frames: selectedFrames.length,
    isGIF: true
  }
}

/**
 * 绘制单帧
 */
function drawFrame(ctx, options) {
  const { 
    width, 
    height, 
    text, 
    fontSize = 48, 
    color = '#000000', 
    backgroundColor = 'transparent',
    textAlign = 'center',
    isBold = false,
    strokeColor = '',
    strokeWidth = 0,
    fontFamily = 'sans-serif'
  } = options

  // 绘制背景
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }

  // 设置文字样式
  ctx.fillStyle = color
  const weight = isBold ? 'bold' : 'normal'
  ctx.font = `${weight} ${fontSize}px ${fontFamily}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = textAlign

  let x = width / 2
  if (textAlign === 'left') {
    x = 40
  } else if (textAlign === 'right') {
    x = width - 40
  }

  const y = height / 2

  // 描边
  if (strokeColor && strokeWidth > 0) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.strokeText(text, x, y)
  }

  // 填充
  ctx.fillText(text, x, y)
}

/**
 * 将字节数组保存为临时文件
 */
function saveBytesToFile(bytes, extension = 'bin') {
  return new Promise((resolve, reject) => {
    try {
      const fs = wx.getFileSystemManager()
      const filePath = `${wx.env.USER_DATA_PATH}/output_${Date.now()}.${extension}`
      
      // 将 Uint8Array 转为 base64
      let binary = ''
      const len = bytes.length
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = wx.arrayBufferToBase64(bytes.buffer || bytes)
      
      fs.writeFile({
        filePath,
        data: base64,
        encoding: 'base64',
        success: () => resolve(filePath),
        fail: (err) => {
          console.error('写入文件失败', err)
          reject(err)
        }
      })
    } catch (e) {
      console.error('保存文件失败', e)
      reject(e)
    }
  })
}

module.exports = {
  generateGIF
}
