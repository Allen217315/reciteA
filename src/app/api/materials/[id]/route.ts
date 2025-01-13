import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Material from '@/models/Material'
import { connectDB } from '@/lib/db'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取要更新的数据
    const { content, tag } = await request.json()
    if (!content) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      )
    }

    // 连接数据库
    await connectDB()

    // 更新数据（只能更新自己的数据）
    const material = await Material.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id,
      },
      {
        content,
        tag: tag || '未分类',
      },
      { new: true }
    )

    if (!material) {
      return NextResponse.json(
        { error: '未找到要更新的数据' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      material,
    })
  } catch (error: any) {
    console.error('更新学习资料失败:', error)
    return NextResponse.json(
      { error: '更新失败: ' + error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 删除数据（只能删除自己的数据）
    const material = await Material.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!material) {
      return NextResponse.json(
        { error: '未找到要删除的数据' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error: any) {
    console.error('删除学习资料失败:', error)
    return NextResponse.json(
      { error: '删除失败: ' + error.message },
      { status: 500 }
    )
  }
} 