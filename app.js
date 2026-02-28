App({
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'your-env-id', // 用户需要替换为自己的云环境ID
      traceUser: true
    })

    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    this.globalData.pixelRatio = systemInfo.pixelRatio
    this.globalData.screenWidth = systemInfo.screenWidth
    this.globalData.screenHeight = systemInfo.screenHeight

    console.log('小程序启动', systemInfo)
  },

  globalData: {
    systemInfo: null,
    pixelRatio: 1,
    screenWidth: 375,
    screenHeight: 667
  }
})
