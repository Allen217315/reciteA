import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Card } from '@/models/Card';
import { connectDB } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

// 获取用户的所有卡片
export async function GET() {
  try {
    console.log('开始获取卡片...');
    const session = await getServerSession(authOptions);
    console.log('会话信息:', JSON.stringify(session, null, 2));

    if (!session?.user) {
      console.log('未授权访问');
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 从 session 中获取用户 ID
    const userId = session.user.id;
    console.log('用户 ID:', userId);

    console.log('连接数据库...');
    await connectDB();
    console.log('数据库连接成功');

    console.log('查询用户卡片:', userId);
    const cards = await Card.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    console.log('查询到卡片数据:', JSON.stringify(cards, null, 2));

    return NextResponse.json(cards);
  } catch (error) {
    console.error('获取卡片失败:', error);
    return NextResponse.json(
      { error: '获取卡片失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 创建新卡片
export async function POST(request: Request) {
  try {
    console.log('开始创建卡片...');
    const session = await getServerSession(authOptions);
    console.log('会话信息:', JSON.stringify(session, null, 2));

    if (!session?.user) {
      console.log('未授权访问');
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 从 session 中获取用户 ID
    const userId = session.user.id;
    console.log('用户 ID:', userId);

    const body = await request.json();
    console.log('请求数据:', body);
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

    console.log('创建卡片...');
    const card = await Card.create({
      userId,
      front,
      back,
      tags: tags || [],
      nextReview: new Date(),
      level: 0,
    });
    console.log('卡片创建成功:', JSON.stringify(card, null, 2));

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('创建卡片失败:', error);
    return NextResponse.json(
      { error: '创建卡片失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
} 