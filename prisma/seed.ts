import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始数据库种子...')

  // 清理现有数据（可选）
  console.log('🧹 清理现有数据...')
  await prisma.diary.deleteMany()
  await prisma.user.deleteMany()

  // 创建示例用户
  console.log('👤 创建示例用户...')
  
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      username: 'demo_user',
      password: hashedPassword,
      avatar: null
    }
  })

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'test_user',
      password: hashedPassword,
      avatar: null
    }
  })

  console.log(`✅ 创建用户: ${demoUser.email}, ${testUser.email}`)

  // 创建示例日记数据
  console.log('📖 创建示例日记...')

  const diaryData = [
    {
      title: '美好的一天',
      content: '今天天气很好，和朋友一起去公园散步。看到了盛开的樱花，心情特别愉悦。这样的日子真的很珍贵，应该多多珍惜。',
      tags: JSON.stringify(['生活', '朋友', '自然']),
      mood: 'happy',
      weather: 'sunny',
      userId: demoUser.id,
      createdAt: new Date('2024-01-15')
    },
    {
      title: '工作思考',
      content: '最近在学习新的技术栈，感觉挑战很大但也很有趣。每天都能学到新东西，虽然有时候会感到压力，但成长的感觉很好。',
      tags: JSON.stringify(['工作', '学习', '技术']),
      mood: 'excited',
      weather: 'cloudy',
      userId: demoUser.id,
      createdAt: new Date('2024-01-16')
    },
    {
      title: '雨天随想',
      content: '下了一整天的雨，待在家里看书。读了一本关于人生哲学的书，让我思考了很多关于生活意义的问题。雨声很有节奏，很适合思考。',
      tags: JSON.stringify(['读书', '哲学', '思考']),
      mood: 'calm',
      weather: 'rainy',
      userId: demoUser.id,
      createdAt: new Date('2024-01-17')
    },
    {
      title: '运动日记',
      content: '今天去健身房锻炼了一个小时，感觉身体状态比之前好了很多。运动真的是保持健康的好方法，不仅强身健体，还能释放压力。',
      tags: JSON.stringify(['运动', '健康', '健身房']),
      mood: 'energetic',
      weather: 'sunny',
      userId: demoUser.id,
      createdAt: new Date('2024-01-18')
    },
    {
      title: '家庭聚餐',
      content: '今天全家人聚在一起吃饭，好久没有这样的机会了。妈妈做了我最爱吃的菜，大家聊天谈笑，感觉特别温馨。家人在一起的时光总是那么珍贵。',
      tags: JSON.stringify(['家庭', '美食', '温馨']),
      mood: 'grateful',
      weather: 'cloudy',
      userId: demoUser.id,
      createdAt: new Date('2024-01-19')
    },
    {
      title: '项目完成',
      content: '经过几周的努力，终于完成了这个重要的项目。虽然过程中遇到了很多困难，但团队合作得很好，最终取得了满意的结果。',
      tags: JSON.stringify(['工作', '项目', '团队合作']),
      mood: 'accomplished',
      weather: 'sunny',
      userId: demoUser.id,
      createdAt: new Date('2024-01-20')
    },
    {
      title: '音乐会体验',
      content: '晚上去听了一场古典音乐会，演奏非常精彩。音乐有种神奇的力量，能够直接触动人的心灵。这种现场的感受是任何录音都无法替代的。',
      tags: JSON.stringify(['音乐', '艺术', '文化']),
      mood: 'inspired',
      weather: 'clear',
      userId: demoUser.id,
      createdAt: new Date('2024-01-21')
    },
    {
      title: '学习新技能',
      content: '开始学习摄影，今天学了基础的构图和光线知识。发现摄影不仅仅是按快门那么简单，需要很多技巧和艺术感。准备多多练习。',
      tags: JSON.stringify(['学习', '摄影', '艺术']),
      mood: 'curious',
      weather: 'partly_cloudy',
      userId: demoUser.id,
      createdAt: new Date('2024-01-22')
    },
    {
      title: '旅行规划',
      content: '开始规划下个月的旅行，研究了很多目的地和路线。旅行总是让人充满期待，能够看到不同的风景，体验不同的文化。',
      tags: JSON.stringify(['旅行', '规划', '期待']),
      mood: 'excited',
      weather: 'sunny',
      userId: demoUser.id,
      createdAt: new Date('2024-01-23')
    },
    {
      title: '深夜思考',
      content: '今晚失眠了，在床上想了很多事情。关于未来的计划，关于人生的方向，关于梦想的实现。有时候这样的深夜思考也是很有价值的。',
      tags: JSON.stringify(['思考', '失眠', '未来']),
      mood: 'contemplative',
      weather: 'clear',
      userId: demoUser.id,
      createdAt: new Date('2024-01-24')
    }
  ]

  // 为测试用户创建一些数据
  const testDiaryData = [
    {
      title: '测试日记1',
      content: '这是第一篇测试日记，用于验证系统功能。',
      tags: JSON.stringify(['测试', 'API']),
      mood: 'neutral',
      weather: 'sunny',
      userId: testUser.id,
      createdAt: new Date('2024-01-10')
    },
    {
      title: '测试日记2',
      content: '这是第二篇测试日记，包含更多测试内容。',
      tags: JSON.stringify(['测试', '开发']),
      mood: 'focused',
      weather: 'cloudy',
      userId: testUser.id,
      createdAt: new Date('2024-01-11')//不指定时间 JavaScript 会默认设置为 00:00:00且为utc时区，这与有时间的情况不同
    },
    {
      title: '测试日记3',
      content: '这是第三篇测试日记，测试时区问题。',
      tags: JSON.stringify(['测试', '开发']),
      mood: 'focused',
      weather: 'cloudy',
      userId: testUser.id,
      createdAt: new Date('2025-05-01T06:30:00')//指定时间不指定时区，js默认解析为本地时间
    },
    {
      title: '测试日记4',
      content: '这是第四篇测试日记，还是测试时区问题。',
      tags: JSON.stringify(['测试', '开发']),
      mood: 'focused',
      weather: 'cloudy',
      userId: testUser.id,
      createdAt: new Date('2025-04-30T20:30:00Z')
    }
  ]

  // 批量创建日记
  const allDiaryData = [...diaryData, ...testDiaryData]
  
  for (const diary of allDiaryData) {
    await prisma.diary.create({
      data: diary
    })
  }

  console.log(`✅ 创建了 ${allDiaryData.length} 篇日记`)

  // 输出统计信息
  const userCount = await prisma.user.count()
  const diaryCount = await prisma.diary.count()

  console.log('\n📊 数据库种子完成!')
  console.log(`👥 总用户数: ${userCount}`)
  console.log(`📖 总日记数: ${diaryCount}`)
  
  console.log('\n🎯 演示账户信息:')
  console.log('邮箱: demo@example.com')
  console.log('密码: password123')
  console.log('\n🧪 测试账户信息:')
  console.log('邮箱: test@example.com')
  console.log('密码: password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 种子数据创建失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 