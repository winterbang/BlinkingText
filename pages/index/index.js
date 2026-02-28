const app = getApp()

Page({
  data: {
    recentWorks: []
  },

  onLoad() {
    this.loadRecentWorks()
  },

  onShow() {
    this.loadRecentWorks()
  },

  // 加载最近作品
  loadRecentWorks() {
    try {
      const works = wx.getStorageSync('recentWorks') || []
      this.setData({ recentWorks: works })
    } catch (e) {
      console.error('加载作品失败', e)
    }
  },

  // 前往编辑器
  goToEditor(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/editor/editor?type=${type}`
    })
  },

  // 预览作品
  previewWork(e) {
    const item = e.currentTarget.dataset.item
    wx.previewImage({
      urls: [item.url],
      current: item.url
    })
  },

  // 清空历史
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      confirmColor: '#07c160',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('recentWorks')
          this.setData({ recentWorks: [] })
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 显示即将上线
  showComingSoon() {
    wx.showToast({
      title: '即将上线',
      icon: 'none'
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '文字动画生成器 - 让文字动起来',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '文字动画生成器',
      query: ''
    }
  }
})
