import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 测试数据库连接
    const userCount = await prisma.user.count()
    const diaryCount = await prisma.diary.count()
    
    return NextResponse.json({
      success: true,
      message: '数据库连接正常',
      data: {
        userCount,
        diaryCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('数据库连接错误:', error)
    return NextResponse.json(
      { 
        success: false,
        message: '数据库连接失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 