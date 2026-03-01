// 服务端 GIF 生成云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 主函数
 */
exports.main = async (event, context) => {
  const { frames, width, height, fps, text, options } = event

  try {
    // 使用服务端渲染生成 GIF
    const fileID = await generateServerSideGIF(frames, width, height, fps, text, options)
    
    return {
      code: 0,
      message: 'success',
      fileID: fileID,
      tempFilePath: fileID
    }
  } catch (err) {
    console.error('GIF 生成失败', err)
    return {
      code: -1,
      message: err.message || '生成失败'
    }
  }
}

/**
 * 服务端渲染 GIF
 */
async function generateServerSideGIF(frames, width, height, fps, text, options = {}) {
  const { createCanvas } = require('canvas')
  const GIFEncoder = require('gifencoder')
  
  const encoder = new GIFEncoder(width, height)
  
  // 创建 buffer 来存储数据
  const chunks = []
  encoder.createReadStream().on('data', chunk => chunks.push(chunk))
  
  encoder.start()
  encoder.setRepeat(0) // 循环播放
  encoder.setDelay(Math.round(1000 / (fps || 30))) // 帧延迟
  encoder.setQuality(10) // 质量

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  
  const { 
    fontSize = 48, 
    color = '#000000', 
    backgroundColor = 'transparent',
    textAlign = 'center',
    isBold = false,
    strokeColor = '',
    strokeWidth = 0,
    fontFamily = 'sans-serif'
  } = options

  // 绘制每一帧
  for (let i = 0; i < (frames || []).length; i++) {
    const frame = frames[i]
    
    // 清空画布
    ctx.clearRect(0, 0, width, height)
    
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
    
    // 填充文字
    ctx.fillText(text, x, y)
    
    // 添加帧
    encoder.addFrame(ctx)
  }

  encoder.finish()
  
  // 合并 buffer
  const buffer = Buffer.concat(chunks)
  
  // 上传到云存储
  const cloudPath = `gifs/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.gif`
  const result = await cloud.uploadFile({
    cloudPath: cloudPath,
    fileContent: buffer
  })
  
  // 获取临时链接
  const tempUrl = await cloud.getTempFileURL({
    fileList: [result.fileID]
  })
  
  return tempUrl.fileList[0].tempFileURL || result.fileID
}
