import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 标签类型定义
interface UserTagItem {
  id: string
  userId: string
  type: 'tag' | 'mood' | 'weather'
  value: string
  label: string | null
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

// 获取用户的所有标签、心情和天气
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 获取用户的自定义标签
    const userTags = await prisma.UserTag.findMany({
      where: { 
        userId: user.id 
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 将标签按类型分组
    const tags = userTags.filter((tag: UserTagItem) => tag.type === 'tag')
    const moods = userTags.filter((tag: UserTagItem) => tag.type === 'mood')
    const weathers = userTags.filter((tag: UserTagItem) => tag.type === 'weather')

    return NextResponse.json({
      tags: {
        default: [], // 现在默认标签也来自数据库
        custom: tags
      },
      moods: {
        default: [], // 现在默认心情也来自数据库
        custom: moods
      },
      weathers: {
        default: [], // 现在默认天气也来自数据库
        custom: weathers
      }
    })
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 解析请求体
    const body = await request.json()
    const { type, value, label, icon } = body

    // 验证必填字段
    if (!type || !value) {
      return NextResponse.json(
        { error: '类型和值为必填项' },
        { status: 400 }
      )
    }

    // 验证类型是否有效
    if (!['tag', 'mood', 'weather'].includes(type)) {
      return NextResponse.json(
        { error: '无效的标签类型，必须是 tag, mood 或 weather' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 检查该标签是否已存在
    const existingTag = await prisma.UserTag.findFirst({
      where: {
        userId: user.id,
        type,
        value
      }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: '该标签已存在' },
        { status: 409 }
      )
    }

    // 创建新标签
    const newTag = await prisma.UserTag.create({
      data: {
        userId: user.id,
        type,
        value,
        label: label || value,
        icon
      }
    })

    return NextResponse.json(newTag, { status: 201 })
  } catch (error) {
    console.error('创建标签失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 