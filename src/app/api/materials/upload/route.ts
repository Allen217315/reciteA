import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import * as XLSX from 'xlsx'
import Material from '@/models/Material'
import connectDB from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取上传的文件
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { error: '请选择要上传的文件' },
        { status: 400 }
      )
    }

    // 检查文件类型
    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json(
        { error: '只支持上传 .xlsx 格式的文件' },
        { status: 400 }
      )
    }

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过 5MB' },
        { status: 400 }
      )
    }

    // 读取并解析 Excel 文件
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // 连接数据库
    await connectDB()

    // 处理每一行数据
    const materials = []
    for (const row of data as any[]) {
      const content = row['知识内容']
      const tag = row['分类标签'] || null

      if (!content) continue // 跳过空内容

      materials.push({
        content,
        tag,
        userId: session.user.id,
      })
    }

    // 批量插入数据
    if (materials.length > 0) {
      await Material.insertMany(materials)
    }

    return NextResponse.json({
      success: true,
      message: `成功导入 ${materials.length} 条数据`,
    })
  } catch (error: any) {
    console.error('文件上传处理失败:', error)
    return NextResponse.json(
      { error: '文件处理失败: ' + error.message },
      { status: 500 }
    )
  }
} 