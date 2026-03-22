# BlinkingText - iOS 拟态玻璃设计规范

## 设计概述

本文档描述如何将 BlinkingText 微信小程序改造为 **iOS 拟态玻璃风格**（Glassmorphism + Neumorphism）。

---

## 1. 设计哲学

### 1.1 风格定义
- **玻璃拟态 (Glassmorphism)**: 半透明层叠、背景模糊、鲜艳色彩
- **新拟态 (Neumorphism)**: 柔和阴影、物理质感、凸起/凹陷效果
- **iOS 设计语言**: 大圆角、简洁排版、毛玻璃效果

### 1.2 核心特征
| 特征 | 描述 |
|------|------|
| 透明度 | 背景 60-90% 透明度 |
| 模糊 | 背景模糊 20-40px |
| 边框 | 1px 半透明白色边框 |
| 阴影 | 多层柔和阴影 |
| 圆角 | 大圆角 16-24px |

---

## 2. 色彩系统

### 2.1 主色调
```css
/* 主色 - 活力绿 */
--primary: #34C759;
--primary-light: #4CD964;
--primary-dark: #30B350;

/* 背景渐变 */
--bg-gradient-start: #F2F2F7;
--bg-gradient-end: #E5E5EA;

/* 玻璃背景 */
--glass-bg: rgba(255, 255, 255, 0.72);
--glass-bg-dark: rgba(28, 28, 30, 0.72);
```

### 2.2 玻璃层级
```css
/* 玻璃卡片 - 浅色模式 */
--glass-card: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.8) 0%,
  rgba(255, 255, 255, 0.4) 100%
);

/* 玻璃卡片 - 深色模式 */
--glass-card-dark: linear-gradient(
  135deg,
  rgba(44, 44, 46, 0.8) 0%,
  rgba(28, 28, 30, 0.6) 100%
);
```

### 2.3 文字颜色
```css
--text-primary: #000000;
--text-secondary: rgba(60, 60, 67, 0.6);
--text-tertiary: rgba(60, 60, 67, 0.3);
```

---

## 3. 组件规范

### 3.1 玻璃卡片 (Glass Card)

#### 视觉效果
```css
.glass-card {
  /* 背景 */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.72) 0%,
    rgba(255, 255, 255, 0.36) 100%
  );
  
  /* 模糊 */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* 边框 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  
  /* 圆角 */
  border-radius: 24px;
  
  /* 阴影 */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
```

#### 层次结构
```
┌─────────────────────────────┐
│  玻璃背景 (半透明)            │
├─────────────────────────────┤
│  模糊层 (backdrop-filter)   │
├─────────────────────────────┤
│  边框 (半透明白色)            │
├─────────────────────────────┤
│  内容区域                     │
└─────────────────────────────┘
```

### 3.2 功能卡片 (Feature Card)

#### 新拟态凸起效果
```css
.feature-card {
  /* 凸起效果 */
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  
  /* 柔和阴影 */
  box-shadow: 
    8px 8px 16px rgba(174, 174, 192, 0.4),
    -8px -8px 16px rgba(255, 255, 255, 0.8);
  
  /* 圆角 */
  border-radius: 20px;
  
  /* 边框 */
  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* 点击态 - 凹陷效果 */
.feature-card:active {
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow: 
    inset 4px 4px 8px rgba(174, 174, 192, 0.4),
    inset -4px -4px 8px rgba(255, 255, 255, 0.8);
}
```

### 3.3 Tab 导航 (Glass Tab Bar)

#### 毛玻璃 Tab 栏
```css
.tab-bar {
  /* 玻璃效果 */
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* 底部边框 */
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  /* 顶部高光 */
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.tab-item {
  /* 未选中态 */
  color: rgba(60, 60, 67, 0.6);
}

.tab-item.active {
  /* 选中态 - 玻璃胶囊 */
  background: rgba(52, 199, 89, 0.15);
  color: var(--primary);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}
```

### 3.4 按钮 (Neumorphism Button)

#### 主按钮
```css
.btn-primary {
  /* 渐变背景 */
  background: linear-gradient(135deg, #34C759 0%, #30B350 100%);
  
  /* 新拟态阴影 */
  box-shadow: 
    6px 6px 12px rgba(48, 179, 80, 0.3),
    -6px -6px 12px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  
  border-radius: 16px;
  color: white;
  font-weight: 600;
}

/* 点击态 */
.btn-primary:active {
  box-shadow: 
    inset 3px 3px 6px rgba(48, 179, 80, 0.4),
    inset -3px -3px 6px rgba(255, 255, 255, 0.2);
}
```

### 3.5 输入框 (Glass Input)

```css
.glass-input {
  background: rgba(120, 120, 128, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(120, 120, 128, 0.2);
  
  /* 聚焦态 */
  &:focus {
    background: rgba(120, 120, 128, 0.16);
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.1);
  }
}
```

### 3.6 滑块 (iOS Style Slider)

```css
.slider {
  /* 轨道背景 */
  background: rgba(120, 120, 128, 0.2);
  border-radius: 2px;
  height: 4px;
}

.slider-thumb {
  /* 滑块 */
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.15),
    0 1px 1px rgba(0, 0, 0, 0.16);
}
```

### 3.7 颜色选择器 (Glass Color Picker)

```css
.color-block {
  /* 玻璃效果 */
  background: var(--color);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  
  /* 阴影 */
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.color-block.active {
  /* 选中态 */
  border: 3px solid white;
  box-shadow: 
    0 0 0 2px var(--primary),
    0 6px 16px rgba(0, 0, 0, 0.2);
}
```

---

## 4. 页面布局

### 4.1 首页 (Glass Home)

```
┌─────────────────────────────────────┐
│  Banner (渐变 + 模糊背景)            │
│  ┌───────────────────────────────┐  │
│  │  玻璃卡片 - 功能入口            │  │
│  │  ┌───┐ ┌───┐                  │  │
│  │  │ T │ │ G │  文字动画  GIF编辑 │  │
│  │  └───┘ └───┘                  │  │
│  │  ┌───┐ ┌───┐                  │  │
│  │  │ V │ │ ◆ │  视频转GIF 热门模板│  │
│  │  └───┘ └───┘                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  最近作品 (玻璃列表)                 │
│  ┌───────────────────────────────┐  │
│  │ [图] 文字内容          日期   │  │
│  │      玻璃卡片行               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 4.2 编辑页 (Glass Editor)

```
┌─────────────────────────────────────┐
│  Canvas 预览区 (毛玻璃背景)          │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │        动画预览               │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  玻璃 Tab 栏                       │
│  [文字] [样式] [动效] [设置]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  玻璃面板内容区                     │
│  ┌───────────────────────────────┐  │
│  │  文字输入框 (玻璃输入)          │  │
│  │  字号滑块 (iOS 风格)           │  │
│  │  颜色网格 (玻璃色块)            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 5. 动画效果

### 5.1 入场动画
```css
/* 卡片入场 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

### 5.2 交互反馈
```css
/* 按压效果 */
.press-effect {
  transition: transform 0.1s, box-shadow 0.2s;
}

.press-effect:active {
  transform: scale(0.96);
}

/* 玻璃闪烁 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 6. 代码实现示例

### 6.1 玻璃卡片组件 (WXML)
```xml
<view class="glass-card">
  <view class="glass-content">
    <text class="glass-title">{{title}}</text>
    <text class="glass-desc">{{description}}</text>
  </view>
</view>
```

### 6.2 玻璃卡片样式 (WXSS)
```css
.glass-card {
  position: relative;
  padding: 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.72) 0%,
    rgba(255, 255, 255, 0.36) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24rpx;
  z-index: -1;
}

.glass-content {
  position: relative;
  z-index: 1;
}
```

### 6.3 新拟态按钮 (WXSS)
```css
.neu-btn {
  padding: 24rpx 48rpx;
  border-radius: 20rpx;
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 
    8rpx 8rpx 16rpx rgba(174, 174, 192, 0.4),
    -8rpx -8rpx 16rpx rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.neu-btn:active {
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow: 
    inset 4rpx 4rpx 8rpx rgba(174, 174, 192, 0.4),
    inset -4rpx -4rpx 8rpx rgba(255, 255, 255, 0.8);
}
```

---

## 7. 适配说明

### 7.1 小程序适配
- `backdrop-filter` 在小程序中需要加 `-webkit-` 前缀
- 部分 Android 机型不支持背景模糊，需要降级处理
- 建议使用 `page-meta` 设置页面样式

### 7.2 降级方案
```css
/* 支持模糊的设备 */
@supports (backdrop-filter: blur(20px)) {
  .glass {
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.72);
  }
}

/* 不支持的设备 */
@supports not (backdrop-filter: blur(20px)) {
  .glass {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

---

## 8. 设计资源

### 8.1 推荐工具
- **Figma**: 设计玻璃效果插件 Glass Morphism
- **Sketch**: 新拟态设计系统
- **即时设计**: iOS 15/16 设计规范

### 8.2 参考链接
- [Apple iOS Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Glassmorphism CSS Generator](https://hype4.academy/tools/glassmorphism-generator)
- [Neumorphism CSS Generator](https://neumorphism.io/)

---

## 9. 总结

### 9.1 核心要点
1. **玻璃拟态**: 半透明 + 模糊 + 边框高光
2. **新拟态**: 柔和阴影 + 渐变 + 凹凸质感
3. **iOS 风格**: 大圆角 + 清晰排版 + 流畅动画

### 9.2 文件变更清单
- [ ] `app.wxss` - 全局玻璃变量定义
- [ ] `pages/index/index.wxss` - 首页玻璃卡片
- [ ] `pages/editor/editor.wxss` - 编辑器玻璃面板
- [ ] `pages/editor/editor.wxml` - 调整结构适配新设计
- [ ] 新增 `components/glass-card/` - 玻璃卡片组件
- [ ] 新增 `components/glass-button/` - 玻璃按钮组件

---

*文档版本: v1.0*  
*更新日期: 2026-03-01*
