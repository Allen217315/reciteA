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

    await connectDB();

    // 重置指定卡片组中所有卡片的熟练度
    const result = await Card.updateMany(
      {
        deckId: params.id,
        userId: session.user.id,
      },
      {
        $set: {
          level: 0,
          nextReview: new Date(), // 设置为当前时间，使其可以立即复习
        }
      }
    );

    return NextResponse.json({
      message: '重置熟练度成功',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('重置熟练度失败:', error);
    return NextResponse.json(
      { error: '重置熟练度失败' },
      { status: 500 }
    );
  }
} 