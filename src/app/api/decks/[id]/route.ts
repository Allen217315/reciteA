import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Deck from '@/models/deck';

export async function GET(
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

    const deck = await Deck.findOne({
      _id: params.id,
      userId: session.user.id,
    }).select('name description cardCount createdAt');

    if (!deck) {
      return NextResponse.json(
        { error: '卡片组不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: deck._id.toString(),
      name: deck.name,
      description: deck.description,
      cardCount: deck.cardCount,
      createdAt: new Date(deck.createdAt).toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('获取卡片组详情失败:', error);
    return NextResponse.json(
      { error: '获取卡片组详情失败' },
      { status: 500 }
    );
  }
} 