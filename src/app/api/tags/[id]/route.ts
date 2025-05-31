import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 删除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const id = params.id

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 确认标签存在且属于当前用户
    const tag = await prisma.UserTag.findUnique({
      where: { id }
    })

    if (!tag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 })
    }

    if (tag.userId !== user.id) {
      return NextResponse.json({ error: '无权操作此标签' }, { status: 403 })
    }

    // 删除标签
    await prisma.UserTag.delete({
      where: { id }
    })

    return NextResponse.json({ message: '标签已删除' })
  } catch (error) {
    console.error('删除标签失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 