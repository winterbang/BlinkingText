// GIF 生成工具 - 微信小程序适配

const templates = require('./templates.js')

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
  if (enableEffects) {
    const template = templates.getTemplate(selectedTemplate)
    if (template) {
      frames = template.generateFrames(frameOptions)
    }
  } else {
    frames = generateStaticFrames(frameOptions)
  }

  // 应用速度调整
  frames = frames.map(f => ({
    ...f,
    delay: Math.round(f.delay / (speed || 1))
  }))

  // 生成 GIF 数据
  const gifData = await createGIF(frames, canvasSize, canvasSize, { onProgress })

  return gifData
}

/**
 * 生成静态帧
 */
function generateStaticFrames(options) {
  const { width, height, fps, duration, text, fontSize, color, backgroundColor, textAlign, isBold, strokeColor, strokeWidth, fontFamily } = options
  const frames = []
  const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

  // 创建离屏 Canvas
  const canvas = wx.createOffscreenCanvas({ type: '2d', width, height })
  const ctx = canvas.getContext('2d')

  // 绘制背景
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }

  // 绘制文字
  ctx.fillStyle = color
  const weight = isBold ? 'bold' : 'normal'
  ctx.font = `${weight} ${fontSize}px ${fontFamily || 'sans-serif'}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = textAlign

  let x = width / 2
  if (textAlign === 'left') {
    x = 40
  } else if (textAlign === 'right') {
    x = width - 40
  }

  // 简单处理：直接绘制文字（不换行，静态效果下简化处理）
  const y = height / 2

  // 描边
  if (strokeColor && strokeWidth > 0) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.strokeText(text, x, y)
  }

  // 填充
  ctx.fillText(text, x, y)

  // 绘制多帧（静态效果）
  for (let i = 0; i < totalFrames; i++) {
    frames.push({
      data: canvas,
      delay: Math.round(1000 / fps)
    })
  }

  return frames
}

/**
 * 创建 GIF 文件
 */
async function createGIF(frames, width, height, options = {}) {
  const { onProgress } = options

  // 由于小程序无法直接生成 GIF，我们使用以下策略：
  // 1. 保存第一帧为预览图片
  // 2. 尝试调用云函数生成真正的 GIF
  // 3. 如果云函数不可用，则返回第一帧并提示用户

  const firstFrame = frames[0]
  if (!firstFrame || !firstFrame.data) {
    throw new Error('没有可用的帧数据')
  }

  try {
    // 尝试将第一帧保存为临时文件
    const tempRes = await canvasToTempFile(firstFrame.data, 0)

    if (onProgress) {
      onProgress(50)
    }

    // 尝试使用云函数生成 GIF
    try {
      const gifRes = await generateGIFWithCloud(frames, { width, height, fps: 30 })
      if (onProgress) {
        onProgress(100)
      }
      return {
        tempFilePath: gifRes.fileID || gifRes.tempFilePath || tempRes.tempFilePath,
        framePaths: [tempRes.tempFilePath],
        frames: frames.length,
        isGIF: true
      }
    } catch (cloudErr) {
      console.log('云函数生成失败，使用静态图片', cloudErr)
      // 云函数失败，返回静态图片
      if (onProgress) {
        onProgress(100)
      }
      return {
        tempFilePath: tempRes.tempFilePath,
        framePaths: [tempRes.tempFilePath],
        frames: frames.length,
        isGIF: false
      }
    }
  } catch (e) {
    console.error('创建图片失败', e)
    throw e
  }
}

/**
 * Canvas 转临时文件
 */
function canvasToTempFile(canvas, index) {
  return new Promise((resolve, reject) => {
    try {
      // 小程序离屏 canvas 使用 toDataURL
      if (canvas && canvas.toDataURL) {
        const dataURL = canvas.toDataURL('image/png')
        const fs = wx.getFileSystemManager()
        const filePath = `${wx.env.USER_DATA_PATH}/frame_${index}_${Date.now()}.png`

        // 将 base64 写入文件
        const base64 = dataURL.replace(/^data:image\/\w+;base64,/, '')
        fs.writeFile({
          filePath,
          data: base64,
          encoding: 'base64',
          success: () => resolve({ tempFilePath: filePath }),
          fail: (err) => {
            console.error('写入文件失败', err)
            reject(err)
          }
        })
      } else {
        reject(new Error('Canvas 不支持 toDataURL'))
      }
    } catch (e) {
      console.error('Canvas 转临时文件失败', e)
      reject(e)
    }
  })
}

/**
 * 使用云函数生成 GIF
 */
async function generateGIFWithCloud(frames, options) {
  // 上传帧到云存储
  // 调用云函数合成 GIF
  // 返回 GIF 文件 ID

  const { width, height, fps } = options

  const result = await wx.cloud.callFunction({
    name: 'generateGif',
    data: {
      frames: frames.map(f => ({
        delay: f.delay
      })),
      width,
      height,
      fps
    }
  })

  return result.result
}

module.exports = {
  generateGIF,
  generateGIFWithCloud
}
