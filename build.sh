#!/bin/bash

# BlinkingText 微信小程序构建脚本

set -e

PROJECT_PATH="/home/jiliang/projects/BlinkingText"
APPID="wx7e6327759894f230"
VERSION="${1:-1.0.0}"
DESC="${2:-更新版本}"

echo "🚀 BlinkingText 微信小程序构建"
echo "================================"
echo ""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查目录
cd "$PROJECT_PATH"

# 检查必要文件
if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ 错误: 未找到 app.json${NC}"
    exit 1
fi

if [ ! -f "project.config.json" ]; then
    echo -e "${RED}❌ 错误: 未找到 project.config.json${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 项目检查通过${NC}"
echo ""

# 显示项目信息
echo "📋 项目信息:"
echo "  AppID: $APPID"
echo "  版本: $VERSION"
echo "  描述: $DESC"
echo ""

# 检查代码规范
echo "🔍 代码检查..."

# 检查文件大小
find pages -name "*.js" -o -name "*.wxml" -o -name "*.wxss" | while read file; do
    size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    if [ "$size" -gt 2097152 ]; then
        echo -e "${YELLOW}⚠️  警告: $file 超过 2MB${NC}"
    fi
done

echo -e "${GREEN}✅ 代码检查完成${NC}"
echo ""

# 使用 miniprogram-ci 上传（如果已安装）
if command -v npx &> /dev/null; then
    echo "📦 检查 miniprogram-ci..."
    
    # 检查私钥
    KEY_PATH="$HOME/.wechat/keys/${APPID}.key"
    if [ ! -f "$KEY_PATH" ]; then
        echo -e "${YELLOW}⚠️  未找到私钥文件: $KEY_PATH${NC}"
        echo ""
        echo "💡 请按以下步骤获取私钥:"
        echo "  1. 登录微信小程序后台: https://mp.weixin.qq.com"
        echo "  2. 开发 → 开发设置 → 小程序代码上传"
        echo "  3. 下载密钥文件 (private.${APPID}.key)"
        echo "  4. 将密钥保存到: $KEY_PATH"
        echo ""
        echo "或者使用微信开发者工具手动上传"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 私钥已配置${NC}"
    echo ""
    
    # 尝试使用 miniprogram-ci 上传
    echo "📤 正在上传代码..."
    
    # 创建临时上传脚本
    cat > /tmp/upload-miniprogram.js << 'EOF'
const ci = require('miniprogram-ci');
const path = require('path');

const project = new ci.Project({
  appid: process.env.APPID,
  type: 'miniProgram',
  projectPath: process.env.PROJECT_PATH,
  privateKeyPath: process.env.KEY_PATH,
  ignores: ['node_modules/**/*', 'miniprogram-ci.json', 'README.md']
});

ci.upload({
  project,
  version: process.env.VERSION,
  desc: process.env.DESC,
  setting: {
    es6: true,
    enhance: true,
    minified: true
  },
  onProgressUpdate: console.log
}).then(() => {
  console.log('上传成功!');
  process.exit(0);
}).catch(err => {
  console.error('上传失败:', err);
  process.exit(1);
});
EOF
    
    APPID="$APPID" \
    PROJECT_PATH="$PROJECT_PATH" \
    KEY_PATH="$KEY_PATH" \
    VERSION="$VERSION" \
    DESC="$DESC" \
    npx miniprogram-ci /tmp/upload-miniprogram.js 2>/dev/null || {
        echo -e "${YELLOW}⚠️  miniprogram-ci 上传失败，切换到手动模式${NC}"
        MANUAL_MODE=true
    }
else
    MANUAL_MODE=true
fi

# 手动上传指南
if [ "$MANUAL_MODE" = true ]; then
    echo ""
    echo "📱 手动上传指南"
    echo "==============="
    echo ""
    echo "1. 打开微信开发者工具"
    echo "   下载: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
    echo ""
    echo "2. 导入项目"
    echo "   项目路径: $PROJECT_PATH"
    echo "   AppID: $APPID"
    echo ""
    echo "3. 上传代码"
    echo "   点击「上传」按钮"
    echo "   版本号: $VERSION"
    echo "   项目备注: $DESC"
    echo ""
    echo "4. 登录小程序后台提交审核"
    echo "   https://mp.weixin.qq.com"
    echo ""
fi

echo ""
echo -e "${GREEN}✅ 构建完成!${NC}"
