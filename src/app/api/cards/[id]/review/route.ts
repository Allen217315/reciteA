import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Card } from '@/models/Card';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { isCorrect } = await request.json();

    if (typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { error: '无效的复习结果' },
        { status: 400 }
      );
    }

    await connectDB();

    // 获取当前卡片
    const card = await Card.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!card) {
      return NextResponse.json(
        { error: '卡片不存在或无权访问' },
        { status: 404 }
      );
    }

    // 更新卡片状态
    if (isCorrect) {
      // 答对：增加熟练度（最高5级）和答对次数
      card.level = Math.min(card.level + 1, 5);
      card.correctCount = (card.correctCount || 0) + 1;
    } else {
      // 答错：重置熟练度为0（加入错题本）和增加答错次数
      card.level = 0;
      card.incorrectCount = (card.incorrectCount || 0) + 1;
    }

    // 更新复习次数
    card.reviewCount = (card.reviewCount || 0) + 1;

    // 计算下次复习时间
    const now = new Date();
    let nextReview;
    if (isCorrect) {
      if (card.level === 5) {
        // 熟练度达到5级，不再复习
        nextReview = new Date(8640000000000000); // 设置为最大日期
      } else {
        // 根据熟练度设置下次复习时间：2^level - 1天
        const days = Math.pow(2, card.level) - 1;
        nextReview = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      }
    } else {
      // 答错的卡片今天还要复习
      nextReview = now;
    }
    card.nextReview = nextReview;

    await card.save();

    return NextResponse.json({
      id: card._id.toString(),
      level: card.level,
      reviewCount: card.reviewCount,
      correctCount: card.correctCount || 0,
      incorrectCount: card.incorrectCount || 0,
      nextReview: card.nextReview,
    });
  } catch (error) {
    console.error('更新复习状态失败:', error);
    return NextResponse.json(
      { error: '更新复习状态失败' },
      { status: 500 }
    );
  }
} 