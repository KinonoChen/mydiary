import { prisma } from './prisma'

// 系统预设标签
export const defaultTags = ['生活', '工作', '学习', '旅行', '美食', '运动', '读书', '电影']

// 系统预设心情
export const defaultMoods = [
  { label: "开心", icon: "😊" },
  { label: "兴奋", icon: "🤩" },
  { label: "平静", icon: "😌" },
  { label: "沉思", icon: "🤔" },
  { label: "难过", icon: "😢" },
  { label: "愤怒", icon: "😠" },
]

// 系统预设天气
export const defaultWeathers = [
  { label: "晴天", icon: "☀️" },
  { label: "多云", icon: "☁️" },
  { label: "雨天", icon: "🌧️" },
  { label: "雪天", icon: "❄️" },
  { label: "大风", icon: "💨" },
]

/**
 * 为新用户创建默认标签
 * @param userId 用户ID
 * @returns Promise<void>
 */
export async function createDefaultTagsForUser(userId: string): Promise<void> {
  try {
    // 检查用户是否已有标签
    const existingTags = await prisma.userTag.findMany({
      where: { userId }
    })
    
    if (existingTags.length > 0) {
      console.log(`用户 ${userId} 已有标签，跳过创建默认标签`)
      return
    }
    
    // 创建默认标签
    const tagPromises = defaultTags.map(tag => 
      prisma.userTag.create({
        data: {
          userId,
          type: 'tag',
          value: tag,
          label: tag,
        }
      })
    )
    
    // 创建默认心情
    const moodPromises = defaultMoods.map(mood => 
      prisma.userTag.create({
        data: {
          userId,
          type: 'mood',
          value: mood.label,
          label: mood.label,
          icon: mood.icon,
        }
      })
    )
    
    // 创建默认天气
    const weatherPromises = defaultWeathers.map(weather => 
      prisma.userTag.create({
        data: {
          userId,
          type: 'weather',
          value: weather.label,
          label: weather.label,
          icon: weather.icon,
        }
      })
    )
    
    // 并行执行所有创建操作
    await Promise.all([
      ...tagPromises,
      ...moodPromises,
      ...weatherPromises
    ])
    
    console.log(`为用户 ${userId} 创建了默认标签设置`)
  } catch (error) {
    console.error('创建默认标签失败:', error)
  }
} 