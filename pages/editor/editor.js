const app = getApp()
const templates = require('../../utils/templates.js')
const gifHelper = require('../../utils/gifHelper.js')

Page({
  data: {
    // 当前 Tab
    activeTab: 'text', // text | style | effect | setting

    // 文字内容
    text: '你好',
    quickTexts: ['你好', '恭喜发财', '大吉大利', '新年快乐', '早上好', '晚安'],
    contentSafety: null,

    // 模板
    templates: templates.TEMPLATE_LIST,
    selectedTemplate: 'fade',
    enableEffects: true,

    // 基础样式
    fontSize: 48,
    color: '#000000',
    bgColor: 'transparent',
    isBold: false,
    strokeColor: '',
    strokeWidth: 0,
    fontFamily: 'sans-serif',
    fontFamilies: [
      { label: '默认', value: 'sans-serif' },
      { label: '宋体', value: 'serif' },
      { label: '等宽', value: 'monospace' },
      { label: '苹方', value: 'PingFang SC' },
      { label: '微软雅黑', value: 'Microsoft YaHei' }
    ],
    presetColors: ['#000000', '#ffffff', '#07c160', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    bgColors: ['transparent', '#ffffff', '#000000', '#f5f5f5', '#fee2e2', '#fef3c7', '#d1fae5', '#dbeafe'],

    // 高级设置
    speed: 1,
    textAlign: 'center',
    canvasSize: 300,
    canvasSizes: [
      { label: '小', value: 240 },
      { label: '中', value: 300 },
      { label: '大', value: 400 },
      { label: '超大', value: 500 }
    ],

    // 状态
    isGenerating: false,
    isPlaying: true,
    progress: 0,
    showColorPicker: false,
    customColor: '',
    previewColor: '#000000',
    hueValue: 0,
    lastExportPath: '',

    // Canvas
    canvasContext: null,
    animationFrame: null,
    currentFrame: 0,
    frames: []
  },

  // Tab 切换
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  onLoad(options) {
    this.initCanvas()
    this.generatePreview()
  },

  onUnload() {
    this.stopAnimation()
  },

  // 初始化 Canvas
  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#previewCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          // 设置 Canvas 尺寸
          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = this.data.canvasSize * dpr
          canvas.height = this.data.canvasSize * dpr
          ctx.scale(dpr, dpr)

          this.setData({ canvasContext: { canvas, ctx, dpr } })
          this.generatePreview()
        }
      })
  },

  // 生成预览帧
  async generatePreview() {
    const { text, selectedTemplate, enableEffects, canvasSize, fontSize, color, bgColor, speed, textAlign, isBold, strokeColor, strokeWidth, fontFamily } = this.data

    if (!text || !this.data.canvasContext) return

    const options = {
      text,
      width: canvasSize,
      height: canvasSize,
      fontSize,
      color,
      backgroundColor: bgColor,
      speed,
      textAlign,
      isBold,
      strokeColor,
      strokeWidth,
      fontFamily,
      fps: 30,
      duration: 2000
    }

    let frames = []

    if (enableEffects) {
      const template = templates.getTemplate(selectedTemplate)
      if (template) {
        frames = template.generateFrames(options)
      }
    } else {
      // 静态帧
      frames = this.generateStaticFrames(options)
    }

    this.setData({ frames })
    this.startAnimation()
  },

  // 生成静态帧
  generateStaticFrames(options) {
    const { width, height, fps, duration } = options
    const frames = []
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps))

    for (let i = 0; i < totalFrames; i++) {
      frames.push({
        data: null, // 静态帧不需要预先绘制
        delay: Math.round(1000 / fps)
      })
    }

    return frames
  },

  // 开始动画
  startAnimation() {
    this.stopAnimation()
    this.setData({ isPlaying: true })
    this.playFrame()
  },

  // 停止动画
  stopAnimation() {
    if (this.data.animationFrame) {
      clearTimeout(this.data.animationFrame)
      this.setData({ animationFrame: null, isPlaying: false })
    }
  },

  // 播放帧
  playFrame() {
    const { frames, currentFrame, canvasContext, isPlaying } = this.data

    if (!canvasContext || frames.length === 0) return

    const frame = frames[currentFrame]
    this.drawFrame(frame)

    const nextFrame = (currentFrame + 1) % frames.length
    const delay = frame.delay || 33

    if (isPlaying) {
      const timer = setTimeout(() => {
        this.setData({ currentFrame: nextFrame })
        this.playFrame()
      }, delay / this.data.speed)

      this.setData({ animationFrame: timer })
    }
  },

  // 绘制单帧
  drawFrame(frameData) {
    const { canvasContext, text, selectedTemplate, enableEffects, canvasSize, fontSize, color, bgColor, textAlign, isBold, strokeColor, strokeWidth, fontFamily } = this.data
    if (!canvasContext) return

    const { ctx } = canvasContext
    const width = canvasSize
    const height = canvasSize

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制背景
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
    }

    // 绘制文字（动画效果或静态）
    if (enableEffects && frameData.data) {
      // 使用模板预计算的帧数据
      ctx.drawImage(frameData.data, 0, 0, width, height)
    } else {
      // 实时绘制
      this.drawTextFrame(ctx, text, width, height, fontSize, color, textAlign, isBold, strokeColor, strokeWidth, fontFamily)
    }
  },

  // 绘制文字帧
  drawTextFrame(ctx, text, width, height, fontSize, color, align, isBold, strokeColor, strokeWidth, fontFamily = 'sans-serif') {
    ctx.fillStyle = color
    ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`
    ctx.textBaseline = 'middle'

    // 文字对齐
    let x = width / 2
    if (align === 'left') {
      x = 40
      ctx.textAlign = 'left'
    } else if (align === 'right') {
      x = width - 40
      ctx.textAlign = 'right'
    } else {
      ctx.textAlign = 'center'
    }

    const y = height / 2

    // 自动换行处理
    const lines = this.wrapText(ctx, text, width - 80)
    const lineHeight = fontSize * 1.2
    const totalHeight = lines.length * lineHeight
    const startY = y - totalHeight / 2 + lineHeight / 2

    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight
      
      // 绘制描边
      if (strokeColor && strokeWidth > 0) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeWidth
        ctx.strokeText(line, x, lineY)
      }
      
      // 绘制填充
      ctx.fillText(line, x, lineY)
    })
  },

  // 文字换行（支持手动换行和自动换行）
  wrapText(ctx, text, maxWidth) {
    // 先按手动换行符分割成段落
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
  },

  // 文本输入
  onTextInput(e) {
    this.setData({
      text: e.detail.value,
      contentSafety: null
    })
    this.debounceGenerate()
  },

  // 防抖生成
  debounceGenerate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.debounceTimer = setTimeout(() => {
      this.generatePreview()
    }, 300)
  },

  // 内容安全检测（已临时关闭，后续接入云开发后开启）
  async checkContentSafety() {
    // TODO: 开启云开发后取消注释
    // const { text } = this.data
    // if (!text || text.length < 2) return
    //
    // try {
    //   const result = await wx.cloud.callFunction({
    //     name: 'contentCheck',
    //     data: { content: text }
    //   })
    //
    //   this.setData({
    //     contentSafety: result.result
    //   })
    //
    //   if (result.result.suggest === 'risky') {
    //     wx.showToast({
    //       title: '内容包含敏感信息',
    //       icon: 'none'
    //     })
    //   }
    // } catch (e) {
    //   console.error('内容检测失败', e)
    // }

    // 临时：直接通过
    this.setData({
      contentSafety: { suggest: 'pass', reason: '已跳过检测' }
    })
  },

  // 快速文本
  setQuickText(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ text })
    this.generatePreview()
    this.checkContentSafety()
  },

  // 选择模板
  selectTemplate(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ selectedTemplate: id })
    this.generatePreview()
  },

  // 开关特效
  toggleEffects(e) {
    this.setData({ enableEffects: e.detail.value })
    this.generatePreview()
  },

  // 字号变化
  onFontSizeChange(e) {
    this.setData({ fontSize: e.detail.value })
    this.debounceGenerate()
  },

  // 选择颜色
  selectColor(e) {
    this.setData({ color: e.currentTarget.dataset.color })
    this.generatePreview()
  },

  // 选择背景色
  selectBgColor(e) {
    this.setData({ bgColor: e.currentTarget.dataset.color })
    this.generatePreview()
  },

  // 打开颜色选择器
  openColorPicker() {
    const color = this.data.color
    const hue = this.hexToHue(color)
    this.setData({
      showColorPicker: true,
      previewColor: color,
      hueValue: hue
    })
  },

  closeColorPicker() {
    this.setData({ showColorPicker: false })
  },

  // 色相滑块变化 (0-360)
  onHueChange(e) {
    const hue = e.detail.value
    const color = this.hueToHex(hue)
    this.setData({
      hueValue: hue,
      previewColor: color
    })
  },

  // HEX 输入框变化
  onHexInput(e) {
    let hex = e.detail.value
    // 自动添加 #
    if (hex && !hex.startsWith('#')) {
      hex = '#' + hex
    }
    this.setData({ previewColor: hex })
  },

  onHexBlur(e) {
    let hex = e.detail.value
    // 验证并修正颜色值
    if (!this.isValidHex(hex)) {
      // 如果不合法，恢复之前的值
      hex = this.data.color
    } else {
      // 标准化为大写
      hex = hex.toUpperCase()
    }
    const hue = this.hexToHue(hex)
    this.setData({
      previewColor: hex,
      hueValue: hue
    })
  },

  // 确认颜色选择
  confirmColorPicker() {
    const color = this.data.previewColor
    if (this.isValidHex(color)) {
      this.setData({
        color: color.toUpperCase(),
        showColorPicker: false
      })
      this.generatePreview()
    } else {
      wx.showToast({
        title: '颜色格式错误',
        icon: 'none'
      })
    }
  },

  // 验证 HEX 颜色格式
  isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex)
  },

  // 色相 (0-360) 转 HEX
  hueToHex(hue) {
    const s = 100 // 饱和度
    const l = 50  // 亮度
    
    const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1))
    const m = l / 100 - c / 2
    
    let r, g, b
    
    if (hue >= 0 && hue < 60) {
      r = c; g = x; b = 0
    } else if (hue >= 60 && hue < 120) {
      r = x; g = c; b = 0
    } else if (hue >= 120 && hue < 180) {
      r = 0; g = c; b = x
    } else if (hue >= 180 && hue < 240) {
      r = 0; g = x; b = c
    } else if (hue >= 240 && hue < 300) {
      r = x; g = 0; b = c
    } else {
      r = c; g = 0; b = x
    }
    
    const toHex = (n) => {
      const hex = Math.round((n + m) * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return '#' + toHex(r) + toHex(g) + toHex(b).toUpperCase()
  },

  // HEX 转色相 (0-360)
  hexToHue(hex) {
    if (!hex || typeof hex !== 'string') return 0
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return 0
    
    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let hue = 0
    
    if (diff === 0) {
      hue = 0
    } else if (max === r) {
      hue = ((g - b) / diff + 6) % 6 * 60
    } else if (max === g) {
      hue = ((b - r) / diff + 2) * 60
    } else {
      hue = ((r - g) / diff + 4) * 60
    }
    
    return Math.round(hue)
  },

  // 切换加粗
  toggleBold() {
    this.setData({ isBold: !this.data.isBold })
    this.generatePreview()
  },

  // 选择描边颜色
  selectStrokeColor(e) {
    this.setData({ strokeColor: e.currentTarget.dataset.color })
    this.generatePreview()
  },

  // 描边宽度变化
  onStrokeWidthChange(e) {
    this.setData({ strokeWidth: e.detail.value })
    this.debounceGenerate()
  },

  // 选择字体
  selectFontFamily(e) {
    this.setData({ fontFamily: e.currentTarget.dataset.value })
    this.generatePreview()
  },

  // 速度变化
  onSpeedChange(e) {
    this.setData({ speed: e.detail.value })
  },

  // 选择画布尺寸
  selectCanvasSize(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ canvasSize: value })
    this.initCanvas()
  },

  // 选择对齐方式
  selectTextAlign(e) {
    this.setData({ textAlign: e.currentTarget.dataset.align })
    this.generatePreview()
  },

  // 播放/暂停
  togglePlay() {
    if (this.data.isPlaying) {
      this.stopAnimation()
    } else {
      this.startAnimation()
    }
  },

  // 重置画布
  resetCanvas() {
    this.setData({ currentFrame: 0 })
    this.generatePreview()
  },

  // 导出 GIF
  async exportGif() {
    const { text } = this.data

    if (!text) {
      wx.showToast({ title: '请输入文字', icon: 'none' })
      return
    }

    // TODO: 开启云开发后恢复敏感内容检查
    // if (contentSafety && contentSafety.suggest === 'risky') {
    //   wx.showModal({
    //     title: '提示',
    //     content: '内容可能包含敏感信息，确定要生成吗？',
    //     success: (res) => {
    //       if (res.confirm) {
    //         this.doExportGif()
    //       }
    //     }
    //   })
    //   return
    // }

    this.doExportGif()
  },

  // 执行导出
  async doExportGif() {
    this.setData({ isGenerating: true, progress: 0 })

    try {
      // 使用本地生成 GIF
      const gifData = await gifHelper.generateGIF({
        ...this.data,
        onProgress: (p) => this.setData({ progress: p })
      })

      // 保存到历史
      this.saveToHistory(gifData.tempFilePath)
      
      this.setData({ lastExportPath: gifData.tempFilePath })

      // 显示操作菜单
      this.showExportOptions(gifData.tempFilePath)
    } catch (e) {
      console.error('导出失败', e)
      wx.showToast({
        title: '导出失败: ' + (e.message || '未知错误'),
        icon: 'none'
      })
    } finally {
      this.setData({ isGenerating: false })
    }
  },

  // 显示导出选项
  showExportOptions(filePath) {
    wx.showActionSheet({
      itemList: ['保存到相册', '转发给朋友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 保存到相册
          this.saveToAlbum(filePath)
        } else if (res.tapIndex === 1) {
          // 转发给朋友
          this.shareToFriend(filePath)
        }
      }
    })
  },

  // 保存到相册
  async saveToAlbum(filePath) {
    try {
      await wx.saveImageToPhotosAlbum({
        filePath: filePath
      })
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      })
    } catch (e) {
      console.error('保存失败', e)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 转发给朋友
  shareToFriend(filePath) {
    // 使用预览图片的方式，让用户可以选择转发
    wx.previewImage({
      urls: [filePath],
      current: filePath,
      success: () => {
        // 预览后显示提示
        wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        })
      }
    })
  },

  // 保存到历史
  saveToHistory(filePath) {
    const works = wx.getStorageSync('recentWorks') || []
    const newWork = {
      id: Date.now(),
      text: this.data.text,
      url: filePath,
      thumb: filePath,
      date: new Date().toLocaleDateString()
    }

    works.unshift(newWork)
    if (works.length > 20) works.pop()

    wx.setStorageSync('recentWorks', works)
  },

  // 分享
  onShareAppMessage() {
    const { lastExportPath, text } = this.data
    const shareObj = {
      title: `文字动画：${text}`,
      path: '/pages/editor/editor'
    }
    
    // 如果有导出的图片，附加图片
    if (lastExportPath) {
      shareObj.imageUrl = lastExportPath
    }
    
    return shareObj
  },

  // 转发给朋友（使用分享功能）
  shareToFriend(filePath) {
    // 保存最后导出的路径用于分享
    this.setData({ lastExportPath: filePath })
    
    // 显示分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    // 提示用户点击右上角转发
    wx.showModal({
      title: '转发给朋友',
      content: '请点击右上角「...」按钮，选择「转发」发送给好友',
      showCancel: false
    })
  }
})
