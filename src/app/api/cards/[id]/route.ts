import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Card } from '@/models/Card';
import connectDB from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 更新卡片
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('开始更新卡片...');
    const session = await getServerSession(authOptions);
    console.log('会话信息:', JSON.stringify(session, null, 2));

    if (!session?.user) {
      console.log('未授权访问');
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;
    const body = await request.json();
    const { front, back, tags } = body;

    if (!front || !back) {
      console.log('缺少必要字段');
      return NextResponse.json(
        { error: '卡片正面和背面内容都是必需的' },
        { status: 400 }
      );
    }

    console.log('连接数据库...');
    await connectDB();
    console.log('数据库连接成功');

    // 确保只能更新自己的卡片
    const card = await Card.findOneAndUpdate(
      { _id: id, userId },
      { front, back, tags: tags || [], updatedAt: new Date() },
      { new: true }
    );

    if (!card) {
      console.log('卡片不存在或无权限');
      return NextResponse.json(
        { error: '卡片不存在或无权限' },
        { status: 404 }
      );
    }

    console.log('卡片更新成功:', JSON.stringify(card, null, 2));
    return NextResponse.json(card);
  } catch (error) {
    console.error('更新卡片失败:', error);
    return NextResponse.json(
      { error: '更新卡片失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 删除卡片
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('开始删除卡片...');
    const session = await getServerSession(authOptions);
    console.log('会话信息:', JSON.stringify(session, null, 2));

    if (!session?.user) {
      console.log('未授权访问');
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    console.log('连接数据库...');
    await connectDB();
    console.log('数据库连接成功');

    // 确保只能删除自己的卡片
    const card = await Card.findOneAndDelete({ _id: id, userId });

    if (!card) {
      console.log('卡片不存在或无权限');
      return NextResponse.json(
        { error: '卡片不存在或无权限' },
        { status: 404 }
      );
    }

    console.log('卡片删除成功');
    return NextResponse.json({ message: '卡片删除成功' });
  } catch (error) {
    console.error('删除卡片失败:', error);
    return NextResponse.json(
      { error: '删除卡片失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
} 