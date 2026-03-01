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

// 文字换行处理（支持手动换行和自动换行）
function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split('\n')
  const allLines = []

  for (const paragraph of paragraphs) {
    const chars = paragraph.split('')
    const lines = []
    let currentLine = ''

    for (let i = 0; i < chars.length; i++) {
      const testLine = currentLine + chars[i]
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = chars[i]
      } else {
        currentLine = testLine
      }
    }

    lines.push(currentLine)
    allLines.push(...lines)
  }

  return allLines
}

// 绘制多行文字（支持换行、加粗、描边）
function drawWrappedText(ctx, text, x, y, maxWidth, options = {}) {
  const {
    fontSize = 48,
    color = '#000000',
    textAlign = 'center',
    fontWeight = 'normal',
    lineHeight = 1.2,
    isBold = false,
    strokeColor = '',
    strokeWidth = 0,
    fontFamily = 'sans-serif'
  } = options

  ctx.fillStyle = color
  const weight = isBold ? 'bold' : fontWeight
  ctx.font = `${weight} ${fontSize}px ${fontFamily}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = textAlign

  const lines = wrapText(ctx, text, maxWidth)
  const lh = fontSize * lineHeight
  const totalHeight = lines.length * lh
  const startY = y - totalHeight / 2 + lh / 2

  lines.forEach((line, index) => {
    const lineY = startY + index * lh
    
    // 绘制描边
    if (strokeColor && strokeWidth > 0) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.strokeText(line, x, lineY)
    }
    
    // 绘制填充
    ctx.fillText(line, x, lineY)
  })
}

// 绘制单行文字（用于简单场景）
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
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
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

      // 文字（支持换行）
      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

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
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
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
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2 - bounce, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

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
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
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
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

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
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
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
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign })

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
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
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
      const maxTextWidth = width - 80
      drawWrappedText(ctx, currentText, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

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
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
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
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign })
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
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
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
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2 + offsetY, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

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
    const { text, width, height, fontSize, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
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
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color: colors[colorIndex], textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 由模糊到清晰模板
const blurInTemplate = {
  id: 'blurIn',
  name: '模糊到清晰',
  icon: '🔍',
  previewColor: '#e0e7ff',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const blur = Math.max(0, 10 * (1 - t))

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.filter = `blur(${blur}px)`
      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 舞蹈模板
const danceTemplate = {
  id: 'dance',
  name: '舞蹈',
  icon: '💃',
  previewColor: '#fbcfe8',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const angle = Math.sin(t * Math.PI * 4) * 15
      const scaleX = 1 + 0.1 * Math.sin(t * Math.PI * 6)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(angle * Math.PI / 180)
      ctx.scale(scaleX, 1 / scaleX)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 弹性变形模板
const elasticTemplate = {
  id: 'elastic',
  name: '弹性变形',
  icon: '↔️',
  previewColor: '#fed7aa',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const elastic = Math.sin(t * Math.PI * 3) * Math.exp(-t * 2) * 0.3

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.scale(1 + elastic, 1 - elastic)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 活力模板
const energeticTemplate = {
  id: 'energetic',
  name: '活力',
  icon: '⚡',
  previewColor: '#fef3c7',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const scale = 1 + 0.2 * Math.sin(t * Math.PI * 8)
      const alpha = 0.7 + 0.3 * Math.sin(t * Math.PI * 6)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.scale(scale, scale)
      ctx.globalAlpha = alpha

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 字母炸裂模板
const explodeTemplate = {
  id: 'explode',
  name: '字母炸裂',
  icon: '💥',
  previewColor: '#fecaca',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))
    const chars = text.split('')

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const weight = isBold ? 'bold' : 'normal'
      ctx.font = `${weight} ${fontSize}px sans-serif`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillStyle = color

      const centerX = width / 2
      const centerY = height / 2
      const totalWidth = ctx.measureText(text).width
      let currentX = centerX - totalWidth / 2

      chars.forEach((char, idx) => {
        const charWidth = ctx.measureText(char).width
        const delay = idx / chars.length * 0.3
        const localT = Math.max(0, Math.min(1, (t - delay) / (1 - delay)))
        const explode = localT < 0.5 ? localT * 2 : (1 - localT) * 2
        const offsetX = (Math.random() - 0.5) * 50 * explode
        const offsetY = (Math.random() - 0.5) * 50 * explode
        const angle = explode * Math.PI * 2

        ctx.save()
        ctx.translate(currentX + charWidth / 2 + offsetX, centerY + offsetY)
        ctx.rotate(angle * explode)
        ctx.globalAlpha = 1 - explode * 0.5

        // 描边
        if (strokeColor && strokeWidth > 0) {
          ctx.strokeStyle = strokeColor
          ctx.lineWidth = strokeWidth
          ctx.strokeText(char, 0, 0)
        }
        ctx.fillText(char, 0, 0)

        ctx.restore()
        currentX += charWidth
      })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 水平翻转模板
const flipTemplate = {
  id: 'flip',
  name: '水平翻转',
  icon: '🔃',
  previewColor: '#dbeafe',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const flipY = Math.sin(t * Math.PI)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.scale(1, Math.cos(t * Math.PI))

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 故障效果模板
const glitchTemplate = {
  id: 'glitch',
  name: '故障',
  icon: '👾',
  previewColor: '#111827',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))
    const glitchColors = ['#ff0000', '#00ff00', '#0000ff']

    for (let i = 0; i < totalFrames; i++) {
      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80

      // 绘制主文字
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      // 随机故障条纹
      if (Math.random() > 0.7) {
        ctx.save()
        const offsetX = (Math.random() - 0.5) * 10
        ctx.globalCompositeOperation = 'screen'
        glitchColors.forEach((gColor, idx) => {
          const glitchX = x + offsetX + (idx - 1) * 3
          drawWrappedText(ctx, text, glitchX, height / 2 + (Math.random() - 0.5) * 5, maxTextWidth, { fontSize, color: gColor, textAlign, isBold, strokeColor: '', strokeWidth: 0 })
        })
        ctx.restore()
      }

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 果冻摇晃模板
const jellyTemplate = {
  id: 'jelly',
  name: '果冻摇晃',
  icon: '🍮',
  previewColor: '#fde68a',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const wobble = Math.sin(t * Math.PI * 6) * Math.exp(-t * 3) * 0.2

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.transform(1, wobble, wobble * 0.5, 1, 0, 0)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 字母波浪模板
const waveTemplate = {
  id: 'wave',
  name: '字母波浪',
  icon: '〰️',
  previewColor: '#bfdbfe',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))
    const chars = text.split('')

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const weight = isBold ? 'bold' : 'normal'
      ctx.font = `${weight} ${fontSize}px sans-serif`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillStyle = color

      const centerX = width / 2
      const centerY = height / 2
      const totalWidth = ctx.measureText(text).width
      let currentX = centerX - totalWidth / 2

      chars.forEach((char, idx) => {
        const charWidth = ctx.measureText(char).width
        const waveY = Math.sin((t * Math.PI * 2) + (idx * 0.5)) * 10

        ctx.save()
        ctx.translate(currentX + charWidth / 2, centerY + waveY)

        // 描边
        if (strokeColor && strokeWidth > 0) {
          ctx.strokeStyle = strokeColor
          ctx.lineWidth = strokeWidth
          ctx.strokeText(char, 0, 0)
        }
        ctx.fillText(char, 0, 0)

        ctx.restore()
        currentX += charWidth
      })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 闪电闪光模板
const lightningTemplate = {
  id: 'lightning',
  name: '闪电闪光',
  icon: '⚡',
  previewColor: '#fef9c3',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const flash = Math.sin(t * Math.PI * 10) > 0.5 ? 1 : 0.3

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      // 闪光背景
      if (flash > 0.8 && backgroundColor === 'transparent') {
        ctx.fillStyle = 'rgba(255, 255, 200, 0.3)'
        ctx.fillRect(0, 0, width, height)
      } else if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.globalAlpha = flash

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 液态模板
const liquidTemplate = {
  id: 'liquid',
  name: '液态',
  icon: '💧',
  previewColor: '#a5f3fc',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)

      // 液态变形效果
      const wave1 = Math.sin(t * Math.PI * 4) * 0.1
      const wave2 = Math.cos(t * Math.PI * 3) * 0.1
      ctx.transform(1 + wave1, wave2, wave1, 1 + wave2, 0, 0)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 变形波浪模板
const morphWaveTemplate = {
  id: 'morphWave',
  name: '变形波浪',
  icon: '🌊',
  previewColor: '#c7d2fe',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)

      // 变形波浪
      const morph = Math.sin(t * Math.PI * 3) * 0.2
      const scaleX = 1 + morph
      const scaleY = 1 - morph * 0.5
      ctx.scale(scaleX, scaleY)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 霓虹脉冲模板
const neonPulseTemplate = {
  id: 'neonPulse',
  name: '霓虹脉冲',
  icon: '🌟',
  previewColor: '#1f2937',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))
    const neonColors = ['#ff00ff', '#00ffff', '#ff0080', '#80ff00', '#ff8000']

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 4)
      const colorIndex = Math.floor(t * neonColors.length) % neonColors.length

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      } else {
        // 深色背景增强霓虹效果
        ctx.fillStyle = '#0f0f1a'
        ctx.fillRect(0, 0, width, height)
      }

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80

      // 发光效果
      ctx.shadowColor = neonColors[colorIndex]
      ctx.shadowBlur = 20 + pulse * 15

      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color: neonColors[colorIndex], textAlign, isBold, strokeColor: '', strokeWidth: 0 })

      ctx.shadowBlur = 0

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 摆锤模板
const pendulumTemplate = {
  id: 'pendulum',
  name: '摆锤',
  icon: '🕰️',
  previewColor: '#d1d5db',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const angle = Math.sin(t * Math.PI * 2) * 0.3

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      // 从顶部中心摆动
      ctx.translate(width / 2, 0)
      ctx.rotate(angle)
      ctx.translate(0, height / 2)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 像素化模板
const pixelateTemplate = {
  id: 'pixelate',
  name: '像素化',
  icon: '👾',
  previewColor: '#86efac',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      // 像素化程度随时间变化
      const pixelSize = t < 0.5 ? Math.floor(t * 20) : Math.floor((1 - t) * 20)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80

      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      // 应用像素化效果（模拟）
      if (pixelSize > 1) {
        try {
          const imageData = ctx.getImageData(0, 0, width, height)
          ctx.clearRect(0, 0, width, height)

          for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
              const i = (y * width + x) * 4
              const r = imageData.data[i]
              const g = imageData.data[i + 1]
              const b = imageData.data[i + 2]
              const a = imageData.data[i + 3]

              if (a > 128) {
                ctx.fillStyle = `rgb(${r},${g},${b})`
                ctx.fillRect(x, y, pixelSize, pixelSize)
              }
            }
          }
        } catch (e) {
          // 像素化失败时保持原样
        }
      }

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 弹出模板
const popTemplate = {
  id: 'pop',
  name: '弹出',
  icon: '🎉',
  previewColor: '#fbcfe8',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      // 弹性弹出效果
      let scale = 0
      if (t < 0.3) {
        scale = t / 0.3 * 1.2
      } else if (t < 0.5) {
        scale = 1.2 - (t - 0.3) / 0.2 * 0.2
      } else {
        scale = 1
      }

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
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 从右滑入模板
const slideRightTemplate = {
  id: 'slideRight',
  name: '从右滑入',
  icon: '⬅️',
  previewColor: '#e9d5ff',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const easeOut = 1 - Math.pow(1 - t, 3)
      const offsetX = width * (1 - easeOut)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(offsetX, 0)

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 从左滑入模板
const slideLeftTemplate = {
  id: 'slideLeft',
  name: '从左滑入',
  icon: '➡️',
  previewColor: '#bae6fd',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const easeOut = 1 - Math.pow(1 - t, 3)
      const offsetX = -width * (1 - easeOut)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(offsetX, 0)

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 从下滑入模板
const slideUpTemplate = {
  id: 'slideUp',
  name: '从下滑入',
  icon: '⬆️',
  previewColor: '#bbf7d0',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const easeOut = 1 - Math.pow(1 - t, 3)
      const offsetY = height * (1 - easeOut)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(0, offsetY)

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 3D旋转模板
const rotate3dTemplate = {
  id: 'rotate3d',
  name: '3D旋转',
  icon: '🔄',
  previewColor: '#ddd6fe',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const rotation = t * Math.PI * 2
      const scaleX = Math.cos(rotation)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.scale(scaleX, 1)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 颜色填充模板
const colorFillTemplate = {
  id: 'colorFill',
  name: '颜色填充',
  icon: '🎨',
  previewColor: '#fde047',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', color]

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const colorIndex = Math.floor(t * colors.length)
      const currentColor = colors[Math.min(colorIndex, colors.length - 1)]

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      const x = textAlign === 'left' ? 40 : textAlign === 'right' ? width - 40 : width / 2
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, height / 2, maxTextWidth, { fontSize, color: currentColor, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 摇摆模板
const swingTemplate = {
  id: 'swing',
  name: '摇摆',
  icon: '🎭',
  previewColor: '#fed7aa',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const swing = Math.sin(t * Math.PI * 4) * 15

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(swing * Math.PI / 180)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 波浪扭曲模板
const waveDistortTemplate = {
  id: 'waveDistort',
  name: '波浪扭曲',
  icon: '〰️',
  previewColor: '#99f6e4',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)

      // 波浪扭曲变换
      const waveX = Math.sin(t * Math.PI * 2) * 0.1
      const waveY = Math.cos(t * Math.PI * 3) * 0.1
      ctx.transform(1, waveY, waveX, 1, 0, 0)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 抖动模板
const jitterTemplate = {
  id: 'jitter',
  name: '抖动',
  icon: '📳',
  previewColor: '#fca5a5',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      // 随机抖动偏移
      const jitterX = (Math.random() - 0.5) * 8
      const jitterY = (Math.random() - 0.5) * 8
      const jitterRotate = (Math.random() - 0.5) * 0.1

      ctx.save()
      ctx.translate(width / 2 + jitterX, height / 2 + jitterY)
      ctx.rotate(jitterRotate)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

      frames.push({
        data: canvas,
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  }
}

// 之字形模板
const zigzagTemplate = {
  id: 'zigzag',
  name: '之字形',
  icon: '⚡',
  previewColor: '#fde68a',
  generateFrames(options) {
    const { text, width, height, fontSize, color, backgroundColor, fps, duration, textAlign, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif' } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1 || 1)
      const zigzag = Math.abs(Math.sin(t * Math.PI * 6)) * 20

      const canvas = createCanvasContext(width, height)
      const ctx = canvas.getContext('2d')

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(width / 2, height / 2)

      // 之字形移动
      const offsetX = Math.sin(t * Math.PI * 6) * 30
      ctx.translate(offsetX, zigzag - 10)

      const x = textAlign === 'left' ? -width / 2 + 40 : textAlign === 'right' ? width / 2 - 40 : 0
      const maxTextWidth = width - 80
      drawWrappedText(ctx, text, x, 0, maxTextWidth, { fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily })

      ctx.restore()

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
  // 基础效果
  fadeTemplate,
  blinkTemplate,
  popTemplate,
  // 移动效果
  slideLeftTemplate,
  slideRightTemplate,
  slideUpTemplate,
  bounceTemplate,
  // 旋转效果
  rotateTemplate,
  rotate3dTemplate,
  flipTemplate,
  // 变形效果
  scaleTemplate,
  elasticTemplate,
  danceTemplate,
  jellyTemplate,
  liquidTemplate,
  morphWaveTemplate,
  waveDistortTemplate,
  // 字符动画
  typewriterTemplate,
  waveTemplate,
  explodeTemplate,
  // 特效
  shakeTemplate,
  jitterTemplate,
  glitchTemplate,
  lightningTemplate,
  // 颜色效果
  rainbowTemplate,
  colorFillTemplate,
  neonPulseTemplate,
  // 其他
  blurInTemplate,
  energeticTemplate,
  swingTemplate,
  pendulumTemplate,
  zigzagTemplate,
  pixelateTemplate
]

// 获取模板
function getTemplate(id) {
  return TEMPLATE_LIST.find(t => t.id === id)
}

module.exports = {
  TEMPLATE_LIST,
  getTemplate
}
