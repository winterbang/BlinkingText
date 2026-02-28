# 文字动画生成器 - 微信小程序

基于微信原生小程序开发的文字动画生成工具，支持多种动画效果、实时预览和 GIF 导出。

## 功能特性

- **丰富的动画模板**：8+ 种动画效果（淡入淡出、弹跳、缩放、旋转、打字机、闪烁、摇晃、彩虹）
- **实时预览**：Canvas 实时渲染动画效果
- **自定义样式**：字号、颜色、背景、对齐方式可调节
- **内容安全**：接入微信内容安全 API 进行文本检测
- **GIF 导出**：生成 GIF 动画保存到相册
- **历史记录**：本地存储最近作品

## 目录结构

```
weapp/
├── pages/
│   ├── index/              # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── editor/             # 编辑器页面
│       ├── editor.js
│       ├── editor.json
│       ├── editor.wxml
│       └── editor.wxss
├── cloudfunctions/         # 微信云函数
│   ├── contentCheck/       # 内容安全检测
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   └── generateGif/        # GIF 生成（服务端）
│       ├── index.js
│       ├── config.json
│       └── package.json
├── utils/
│   ├── templates.js        # 动画模板
│   └── gifHelper.js        # GIF 生成工具
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式
├── project.config.json     # 项目配置
└── sitemap.json            # 站点地图
```

## 安装使用

### 1. 克隆项目

```bash
cd weapp
```

### 2. 微信开发者工具

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择 `weapp` 目录
4. 填写自己的 AppID
5. 勾选「使用云开发」

### 3. 配置云开发

1. 在开发者工具中点击「云开发」按钮
2. 创建云开发环境
3. 右键 `cloudfunctions/contentCheck` 选择「创建并部署：云端安装依赖」
4. 右键 `cloudfunctions/generateGif` 选择「创建并部署：云端安装依赖」

### 4. 配置环境 ID

修改 `app.js` 中的云开发环境 ID：

```javascript
wx.cloud.init({
  env: 'your-env-id',  // 替换为你的云开发环境 ID
  traceUser: true
})
```

## 页面说明

### 首页 (pages/index)

- 功能入口展示
- 最近作品列表
- 快捷操作

### 编辑器 (pages/editor)

- **预览区**：Canvas 实时动画预览
- **文字输入**：支持 50 字以内，快速预设文本
- **模板选择**：横向滚动选择动画模板
- **样式设置**：字号、颜色、背景色
- **高级设置**：动画速度、画布尺寸、文字对齐
- **导出功能**：生成 GIF 保存到相册

## 动画模板

| 模板 ID | 名称 | 效果描述 |
|---------|------|----------|
| fade | 淡入淡出 | 透明度渐变循环 |
| bounce | 弹跳 | 上下弹跳动画 |
| scale | 缩放 | 大小缩放脉冲 |
| rotate | 旋转 | 360度旋转 |
| typewriter | 打字机 | 逐字显示效果 |
| blink | 闪烁 | 透明度闪烁 |
| shake | 摇晃 | 随机位置抖动 |
| rainbow | 彩虹 | 颜色渐变循环 |

## 内容安全

已接入微信内容安全 API (`security.msgSecCheck`)，支持：

- 敏感词检测（本地词库 + 微信 API）
- 广告、色情、暴恐等违规内容识别
- 检测日志记录

## 注意事项

1. **GIF 生成**：小程序端 Canvas 导出 GIF 性能有限，建议使用服务端生成方案
2. **云函数依赖**：`contentCheck` 云函数必须部署后才能使用内容安全功能
3. **存储空间**：生成的临时文件会占用用户存储空间，建议定期清理
4. **网络请求**：首次使用需要网络连接下载云函数代码

## 技术栈

- 微信小程序原生框架
- 微信云开发（云函数 + 云数据库 + 云存储）
- Canvas 2D API
- 微信内容安全 API

## 开发计划

- [ ] 更多动画模板
- [ ] 背景图片支持
- [ ] 文字阴影/描边效果
- [ ] 批量导出功能
- [ ] 分享卡片优化

## License

MIT
