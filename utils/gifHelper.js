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
    textAlign
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
  const { width, height, fps, duration } = options
  const frames = []
  const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

  // 创建离屏 Canvas
  const canvas = wx.createOffscreenCanvas({ type: '2d', width, height })
  const ctx = canvas.getContext('2d')

  // 绘制一帧并重复使用
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

  // 使用 wx.canvasToTempFilePath 将每一帧保存为图片
  const framePaths = []

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]

    // 创建临时文件路径
    const res = await canvasToTempFile(frame.data, i)
    framePaths.push(res.tempFilePath)

    if (onProgress) {
      onProgress(Math.round((i + 1) / frames.length * 50))
    }
  }

  // 使用云函数或第三方服务合成 GIF
  // 这里简化处理，返回第一帧作为预览
  // 实际项目中可以使用 gif.js 的微信小程序适配版
  // 或者调用云函数进行服务端合成

  if (onProgress) {
    onProgress(100)
  }

  return {
    tempFilePath: framePaths[0],
    framePaths,
    frames: frames.length
  }
}

/**
 * Canvas 转临时文件
 */
function canvasToTempFile(canvas, index) {
  return new Promise((resolve, reject) => {
    // 小程序中离屏 canvas 需要特殊处理
    // 这里使用 canvas.toDataURL 然后保存
    try {
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
        fail: reject
      })
    } catch (e) {
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
