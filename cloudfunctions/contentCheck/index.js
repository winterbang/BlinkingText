// 微信内容安全检测云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 敏感词库（可根据需要扩展）
const SENSITIVE_WORDS = [
  '暴力', '色情', '赌博', '毒品', '违法',
  // 更多敏感词...
]

/**
 * 本地敏感词检测
 * @param {string} content 待检测内容
 * @returns {object} 检测结果
 */
function localCheck(content) {
  const found = SENSITIVE_WORDS.filter(word => content.includes(word))

  if (found.length > 0) {
    return {
      suggest: 'risky',
      label: found.join(','),
      reason: '包含敏感词汇',
      words: found
    }
  }

  return null
}

/**
 * 主函数
 */
exports.main = async (event, context) => {
  const { content, openid } = event
  const { OPENID } = cloud.getWXContext()

  // 参数校验
  if (!content || typeof content !== 'string') {
    return {
      code: -1,
      message: '内容不能为空',
      suggest: 'risky'
    }
  }

  // 长度限制
  if (content.length > 500) {
    return {
      code: -1,
      message: '内容过长',
      suggest: 'risky'
    }
  }

  try {
    // 1. 本地敏感词检测
    const localResult = localCheck(content)
    if (localResult) {
      // 记录检测日志
      await logCheckResult(OPENID || openid, content, localResult, 'local')

      return {
        code: 0,
        ...localResult
      }
    }

    // 2. 调用微信内容安全接口
    const result = await cloud.openapi.security.msgSecCheck({
      openid: OPENID || openid,
      scene: 1, // 1-资料 2-评论 3-论坛 4-社交日志
      content: content,
      version: 2 // 使用增强版检测
    })

    // 解析结果
    const suggest = parseResult(result)

    // 记录检测日志
    await logCheckResult(OPENID || openid, content, suggest, 'wxapi')

    return {
      code: 0,
      ...suggest,
      rawResult: result
    }

  } catch (err) {
    console.error('内容检测失败', err)

    // 检测失败时，返回需要人工审核
    return {
      code: -1,
      message: err.message || '检测失败',
      suggest: 'review',
      reason: '系统繁忙，请稍后重试'
    }
  }
}

/**
 * 解析微信检测结果
 */
function parseResult(result) {
  const { result: suggest } = result

  // suggest: pass-通过 review-需要人工审核 risky-违规
  switch (suggest) {
    case 'pass':
      return {
        suggest: 'pass',
        label: '',
        reason: '内容正常'
      }

    case 'risky':
      // 获取违规标签
      const label = getRiskLabel(result.detail?.[0]?.label || 100)
      return {
        suggest: 'risky',
        label: label,
        reason: '内容包含违规信息',
        keywords: result.detail?.[0]?.keyword || []
      }

    case 'review':
    default:
      return {
        suggest: 'review',
        label: '',
        reason: '需要人工审核'
      }
  }
}

/**
 * 获取违规标签描述
 */
function getRiskLabel(labelCode) {
  const labels = {
    100: '正常',
    10001: '广告',
    20001: '时政',
    20002: '色情',
    20003: '辱骂',
    20006: '违法犯罪',
    20008: '欺诈',
    20012: '低俗',
    20013: '版权',
    21000: '其他'
  }

  return labels[labelCode] || '未知类型'
}

/**
 * 记录检测日志
 */
async function logCheckResult(openid, content, result, source) {
  try {
    const db = cloud.database()
    await db.collection('content_check_logs').add({
      data: {
        openid,
        content: content.substring(0, 100), // 只记录前100字符
        result,
        source,
        createTime: db.serverDate()
      }
    })
  } catch (e) {
    console.error('记录日志失败', e)
  }
}
