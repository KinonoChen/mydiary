import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: '测试用户创建成功',
      user
    })
  } catch (error: any) {
    console.error('创建用户错误:', error)
    return NextResponse.json(
      { 
        success: false,
        message: '创建用户失败',
        error: error.message
      },
      { status: 500 }
    )
  }
} 