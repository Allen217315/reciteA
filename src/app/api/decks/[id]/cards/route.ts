import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Card } from '@/models/Card';
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

    const cards = await Card.find({
      deckId: params.id,
      userId: session.user.id,
    }).select('front back level reviewCount nextReview createdAt').lean();

    return NextResponse.json(
      cards.map(card => ({
        id: card._id?.toString() || '',
        front: card.front || '',
        back: card.back || '',
        level: card.level || 0,
        reviewCount: card.reviewCount || 0,
        nextReview: card.nextReview ? new Date(card.nextReview).toISOString() : null,
        createdAt: card.createdAt ? new Date(card.createdAt).toISOString() : new Date().toISOString(),
      }))
    );
  } catch (error) {
    console.error('获取卡片列表失败:', error);
    return NextResponse.json(
      { error: '获取卡片列表失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { cardIds } = await request.json();

    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json(
        { error: '无效的卡片ID列表' },
        { status: 400 }
      );
    }

    const result = await Card.deleteMany({
      _id: { $in: cardIds },
      deckId: params.id,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '未找到要删除的卡片' },
        { status: 404 }
      );
    }

    await Deck.findByIdAndUpdate(params.id, {
      $inc: { cardCount: -result.deletedCount },
    });

    return NextResponse.json({
      message: '卡片删除成功',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('删除卡片失败:', error);
    return NextResponse.json(
      { error: '删除卡片失败' },
      { status: 500 }
    );
  }
} 