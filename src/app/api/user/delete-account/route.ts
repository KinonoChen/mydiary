import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
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

    // 使用事务删除所有相关数据
    await prisma.$transaction(async (tx) => {
      // 1. 删除用户的日记
      await tx.diary.deleteMany({
        where: { userId: user.id }
      })

      // 2. 删除用户的标签
      await tx.userTag.deleteMany({
        where: { userId: user.id }
      })

      // 3. 删除用户的会话
      await tx.session.deleteMany({
        where: { userId: user.id }
      })

      // 4. 删除用户的账户关联
      await tx.account.deleteMany({
        where: { userId: user.id }
      })

      // 5. 最后删除用户本身
      await tx.user.delete({
        where: { id: user.id }
      })
    })

    return NextResponse.json({ 
      message: '账号已成功注销，所有数据已清除' 
    }, { status: 200 })

  } catch (error) {
    console.error('删除账号失败:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
