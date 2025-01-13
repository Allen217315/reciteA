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

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const keyword = searchParams.get('keyword') || ''
    const tags = searchParams.getAll('tags[]')
    const limit = 20

    // 构建查询条件
    const query: any = { userId: session.user.id }
    
    // 添加关键字搜索
    if (keyword) {
      query.$text = { $search: keyword }
    }

    // 添加标签筛选
    if (tags.length > 0) {
      query.tag = { $in: tags }
    }

    // 连接数据库
    await connectDB()

    // 查询总数
    const total = await Material.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // 获取当前页数据
    const materials = await Material.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('content tag createdAt updatedAt')

    return NextResponse.json({
      materials,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error: any) {
    console.error('获取学习资料列表失败:', error)
    return NextResponse.json(
      { error: '获取数据失败: ' + error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取要删除的ID列表
    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '请选择要删除的项目' },
        { status: 400 }
      )
    }

    // 连接数据库
    await connectDB()

    // 删除数据（只能删除自己的数据）
    const result = await Material.deleteMany({
      _id: { $in: ids },
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      message: `成功删除 ${result.deletedCount} 条数据`,
    })
  } catch (error: any) {
    console.error('删除学习资料失败:', error)
    return NextResponse.json(
      { error: '删除失败: ' + error.message },
      { status: 500 }
    )
  }
} 