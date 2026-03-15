#!/bin/bash

# BlinkingText 小程序预览二维码生成脚本

export PATH="$HOME/node-v22.14.0-linux-x64/bin:$PATH"
export NODE_PATH="$HOME/.npm-global/lib/node_modules"

set -e

PROJECT_PATH="/home/jiliang/projects/BlinkingText"
APPID="wx7e6327759894f230"
KEY_PATH="$HOME/.wechat/keys/${APPID}.key"
OUTPUT_PATH="/tmp/preview-qr.jpg"

echo "🚀 BlinkingText 预览二维码生成"
echo "================================"
echo ""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查私钥
if [ ! -f "$KEY_PATH" ]; then
    echo -e "${YELLOW}⚠️  未找到私钥文件${NC}"
    echo ""
    echo "💡 请按以下步骤获取私钥:"
    echo ""
    echo -e "${BLUE}1. 登录微信小程序后台${NC}"
    echo "   https://mp.weixin.qq.com"
    echo ""
    echo -e "${BLUE}2. 进入开发设置${NC}"
    echo "   开发 → 开发设置 → 小程序代码上传"
    echo ""
    echo -e "${BLUE}3. 下载密钥文件${NC}"
    echo "   文件名类似: private.wx7e6327759894f230.key"
    echo ""
    echo -e "${BLUE}4. 上传到服务器${NC}"
    echo "   将密钥文件保存到: $KEY_PATH"
    echo ""
    echo "或者你可以:"
    echo "• 使用微信开发者工具手动生成预览二维码"
    echo "• 将密钥文件发给我，我帮你配置"
    exit 1
fi

echo -e "${GREEN}✅ 私钥已配置${NC}"
echo ""

# 检查 miniprogram-ci
if ! command -v miniprogram-ci &> /dev/null; then
    echo -e "${YELLOW}⚠️  未找到 miniprogram-ci${NC}"
    echo "正在安装..."
    npm install -g miniprogram-ci
fi

echo -e "${GREEN}✅ miniprogram-ci 已安装${NC}"
echo ""

# 生成预览二维码
echo "📱 正在生成预览二维码..."
echo ""

cd "$PROJECT_PATH"

# 直接使用 npx 运行
cat > /tmp/gen-preview.js << 'EOF'
const ci = require('miniprogram-ci');

const project = new ci.Project({
  appid: process.env.APPID,
  type: 'miniProgram',
  projectPath: process.env.PROJECT_PATH,
  privateKeyPath: process.env.KEY_PATH,
  ignores: ['node_modules/**/*', 'miniprogram-ci.json', 'README.md', 'BUILD.md', 'build.sh']
});

(async () => {
  try {
    await ci.preview({
      project,
      desc: 'BlinkingText 预览',
      setting: {
        es6: true,
        enhance: true,
        minified: true
      },
      qrcodeFormat: 'image',
      qrcodeOutputDest: process.env.OUTPUT_PATH
    });
    
    console.log('');
    console.log('✅ 预览二维码生成成功!');
    console.log('📍 文件位置:', process.env.OUTPUT_PATH);
  } catch (err) {
    console.error('❌ 生成失败:', err.message);
    process.exit(1);
  }
})();
EOF

APPID="$APPID" \
PROJECT_PATH="$PROJECT_PATH" \
KEY_PATH="$KEY_PATH" \
OUTPUT_PATH="$OUTPUT_PATH" \
node /tmp/gen-preview.js

# 检查是否生成成功
if [ -f "$OUTPUT_PATH" ]; then
    echo ""
    echo -e "${GREEN}✅ 二维码文件大小: $(ls -lh $OUTPUT_PATH | awk '{print $5}')${NC}"
    echo ""
    echo "文件位置: $OUTPUT_PATH"
fi
