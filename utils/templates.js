// 文字动画模板 - 适配微信小程序 Canvas

// 基础辅助函数
function createCanvasContext(width, height) {
  // 小程序中使用离屏 Canvas
  return wx.createOffscreenCanvas({
    type: '2d',
    width,
    height
  })
}

function drawText(ctx, text, x, y, options = {}) {
  const {
    fontSize = 48,
    color = '#000000',
    textAlign = 'center',
    fontWeight = 'normal'
  } = options

  ctx.fillStyle = color
  ctx.font = `${fontWeight} ${fontSize}px sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = textAlign
  ctx.fillText(text, x, y)
}

// 淡入淡出模板
const fadeTemplate = {
  id: 'fade',
  name: '淡入淡出',
  icon: '✨',
  previewColor: '#fef3c7',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))
    const midFrame = Math.floor(totalFrames / 2)

    for (let i = 0; i < totalFrames; i++) {
      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      // 背景
      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      // 计算透明度
      let alpha = i <= midFrame
        ? i / Math.max(1, midFrame)
        : (totalFrames - i) / Math.max(1, totalFrames - midFrame)

      alpha = Math.max(0, Math.min(1, alpha))

      ctx.globalAlpha = alpha

      // 文字
      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      drawText(ctx, text, x, height / 2, { fontSize, color, textAlign })

      ctx.globalAlpha = 1

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 弹跳模板
const bounceTemplate = {
  id: 'bounce',
  name: '弹跳',
  icon: '⬆️',
  previewColor: '#d1fae5',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const bounce = Math.abs(Math.sin(t * Math.PI * 2)) * 40 * (1 - t)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      drawText(ctx, text, x, height / 2 - bounce, { fontSize, color, textAlign })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 缩放模板
const scaleTemplate = {
  id: 'scale',
  name: '缩放',
  icon: '🔍',
  previewColor: '#dbeafe',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const scale = 0.5 + 0.5 * Math.sin(t * Math.PI)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.scale(scale, scale)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      drawText(ctx, text, x, 0, { fontSize, color, textAlign })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 旋转模板
const rotateTemplate = {
  id: 'rotate',
  name: '旋转',
  icon: '↻',
  previewColor: '#fce7f3',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const rotation = t * Math.PI * 2

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(rotation)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      drawText(ctx, text, x, 0, { fontSize, color, textAlign })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 打字机效果模板
const typewriterTemplate = {
  id: 'typewriter',
  name: '打字机',
  icon: '⌨️',
  previewColor: '#e0e7ff',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))
    const chars = text.split('')

    for (let i = 0; i < totalFrames; i++) {
      const progress = i / (totalFrames - 1 || 1)
      const visibleChars = Math.floor(progress * chars.length)
      const currentText = chars.slice(0, visibleChars).join('')

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      drawText(ctx, currentText, x, height / 2, { fontSize, color, textAlign })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 闪烁模板
const blinkTemplate = {
  id: 'blink',
  name: '闪烁',
  icon: '✨',
  previewColor: '#fef9c3',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const alpha = 0.5 + 0.5 * Math.sin(t * Math.PI * 4)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.globalAlpha = alpha
      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      drawText(ctx, text, x, height / 2, { fontSize, color, textAlign })
      ctx.globalAlpha = 1

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 摇晃模板
const shakeTemplate = {
  id: 'shake',
  name: '摇晃',
  icon: '📳',
  previewColor: '#fecaca',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const offsetX = Math.sin(t * Math.PI * 8) * 5
      const offsetY = Math.cos(t * Math.PI * 6) * 5

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const x = textAlign === 'left' ? 40 + offsetX : textAlign === 'right' ? width - 40 + offsetX : width / 2 + offsetX
      drawText(ctx, text, x, height / 2 + offsetY, { fontSize, color, textAlign })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 彩虹模板
const rainbowTemplate = {
  id: 'rainbow',
  name: '彩虹',
  icon: '🌈',
  previewColor: '#fce7f3',
  generateFrames(options) {
    const { text, width, height, fontSize, backgroundColor, fps, duration, textAlign } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const colorIndex = Math.floor(t * colors.length) % colors.length

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      drawText(ctx, text, x, height / 2, { fontSize, color: colors[colorIndex], textAlign })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 模板列表
const TEMPLATE_LIST = [
  fadeTemplate,
  bounceTemplate,
  scaleTemplate,
  rotateTemplate,
  typewriterTemplate,
  blinkTemplate,
  shakeTemplate,
  rainbowTemplate
]

// 获取模板
function getTemplate(id) {
  return TEMPLATE_LIST.find(t => t.id === id)
}

module.exports = {
  TEMPLATE_LIST,
  getTemplate
}
