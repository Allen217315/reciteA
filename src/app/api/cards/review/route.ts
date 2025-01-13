import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Card } from '@/models/Card';

// 获取待复习的卡片
export async function GET() {
  try {
    console.log('开始获取待复习卡片...');
    const session = await getServerSession(authOptions);
    console.log('会话信息:', JSON.stringify(session, null, 2));

    if (!session?.user) {
      console.log('未授权访问');
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('用户 ID:', userId);

    console.log('连接数据库...');
    await connectDB();
    console.log('数据库连接成功');

    // 获取当前时间之前需要复习的卡片
    const now = new Date();
    console.log('查询待复习卡片:', userId, now);
    const cards = await Card.find({
      userId,
      nextReview: { $lte: now }
    })
      .sort({ nextReview: 1 }) // 按复习时间升序排序
      .lean();
    
    console.log('查询到待复习卡片数据:', JSON.stringify(cards, null, 2));
    return NextResponse.json(cards);
  } catch (error) {
    console.error('获取待复习卡片失败:', error);
    return NextResponse.json(
      { error: '获取待复习卡片失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
} 