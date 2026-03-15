# BlinkingText 构建指南

## 🚀 快速开始

### 方式一：命令行构建（推荐）

```bash
cd ~/projects/BlinkingText
./build.sh [版本号] [描述]

# 示例
./build.sh 1.0.0 "新增彩虹动画效果"
```

### 方式二：微信开发者工具

1. **下载安装**
   ```
   https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   ```

2. **导入项目**
   - 点击「导入项目」
   - 选择目录: `~/projects/BlinkingText`
   - AppID: `wx7e6327759894f230`

3. **预览/上传**
   - 点击「预览」生成二维码
   - 点击「上传」提交体验版

---

## 📦 项目结构

```
BlinkingText/
├── pages/
│   ├── index/          # 首页
│   └── editor/         # 编辑器
├── cloudfunctions/     # 云函数
│   ├── contentCheck/   # 内容安全
│   └── generateGif/    # GIF生成
├── utils/
│   ├── templates.js    # 动画模板
│   └── gifHelper.js    # GIF工具
├── app.js              # 入口
├── app.json            # 配置
├── build.sh            # 构建脚本 ← 新增
└── miniprogram-ci.json # CI配置 ← 新增
```

---

## ⚙️ 自动上传配置（可选）

如需命令行自动上传，请配置私钥：

1. 登录 [小程序后台](https://mp.weixin.qq.com)
2. 开发 → 开发设置 → 小程序代码上传
3. 下载密钥文件
4. 保存到: `~/.wechat/keys/wx7e6327759894f230.key`

```bash
mkdir -p ~/.wechat/keys
# 将下载的密钥文件移动到此目录
mv private.wx7e6327759894f230.key ~/.wechat/keys/
```

---

## 🔧 常用操作

### 检查代码
```bash
./build.sh
```

### 上传体验版
```bash
./build.sh 1.0.0 "修复bug"
```

### 提交审核
登录小程序后台 → 版本管理 → 提交审核

---

## 📝 版本规范

- `1.0.0` - 主版本，重大更新
- `1.1.0` - 次版本，新增功能
- `1.1.1` - 修订版本，bug修复
