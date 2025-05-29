import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    const nextAuthUrl = process.env.NEXTAUTH_URL
    
    return NextResponse.json({
      success: true,
      message: '环境变量测试',
      env: {
        DATABASE_URL: databaseUrl ? '已设置' : '未设置',
        NEXTAUTH_SECRET: nextAuthSecret ? '已设置' : '未设置',
        NEXTAUTH_URL: nextAuthUrl ? '已设置' : '未设置',
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_VALUE: databaseUrl, // 仅用于调试
      }
    })
  } catch (error) {
    console.error('环境变量测试错误:', error)
    return NextResponse.json(
      { 
        success: false,
        message: '环境变量测试失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 