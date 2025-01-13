import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Material from '@/models/Material'
import connectDB from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 连接数据库
    await connectDB()

    // 获取用户的所有标签
    const tags = await Material.distinct('tag', { userId: session.user.id })

    return NextResponse.json({
      tags: tags.filter(tag => tag !== null).sort(),
    })
  } catch (error: any) {
    console.error('获取标签列表失败:', error)
    return NextResponse.json(
      { error: '获取标签失败: ' + error.message },
      { status: 500 }
    )
  }
} 