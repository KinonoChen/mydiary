import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 这是一个测试端点，用于验证删除账号功能的逻辑
export async function GET() {
  try {
    // 检查数据库连接和模型
    const userCount = await prisma.user.count()
    const diaryCount = await prisma.diary.count()
    const userTagCount = await prisma.userTag.count()
    const sessionCount = await prisma.session.count()
    const accountCount = await prisma.account.count()
    
    return NextResponse.json({
      success: true,
      message: '删除账号功能测试 - 数据库连接正常',
      data: {
        userCount,
        diaryCount,
        userTagCount,
        sessionCount,
        accountCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('测试删除账号功能失败:', error)
    return NextResponse.json(
      { 
        success: false,
        message: '测试失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
