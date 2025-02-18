import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Card } from '@/models/Card';
import Material from '@/models/Material';
import { IMaterial } from '@/types';
import mongoose from 'mongoose';

// 添加一个辅助接口来匹配 MongoDB 返回的文档类型
interface MaterialDocument {
  _id: mongoose.Types.ObjectId;
  content: string;
  tag?: string;
  userId: string;
  __v: number;
}

interface ICard {
  _id: mongoose.Types.ObjectId;
  front: string;
  back: string;
  level: number;
  reviewCount?: number;
  correctCount?: number;
  incorrectCount?: number;
  materialId?: mongoose.Types.ObjectId;
}

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

    // 获取复习模式参数
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'all';

    await connectDB();

    // 构建查询条件
    const baseQuery = {
      deckId: params.id,
      userId: session.user.id,
    };

    let cards: ICard[];
    if (mode === 'mistakes') {
      // 仅复习错题本
      const rawCards = await Card.find({
        ...baseQuery,
        level: 0, // 熟练度为0的卡片
      })
      .sort({ reviewCount: -1 }) // 答错次数最多的优先
      .select('_id front back level reviewCount correctCount incorrectCount materialId')
      .lean();

      cards = (rawCards as any[]).map(card => ({
        _id: card._id,
        front: card.front,
        back: card.back,
        level: card.level,
        reviewCount: card.reviewCount,
        correctCount: card.correctCount,
        incorrectCount: card.incorrectCount,
        materialId: card.materialId
      }));
    } else {
      // 全面复习：获取今天需要复习且未完成复习的卡片
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const rawCards = await Card.find({
        ...baseQuery,
        nextReview: { 
          $gte: today,
          $lt: tomorrow
        },
        level: { $lt: 5 } // 排除已达到最高熟练度的卡片
      })
      .sort({ level: 1 }) // 熟练度低的优先
      .select('_id front back level reviewCount correctCount incorrectCount materialId')
      .lean();

      cards = (rawCards as any[]).map(card => ({
        _id: card._id,
        front: card.front,
        back: card.back,
        level: card.level,
        reviewCount: card.reviewCount,
        correctCount: card.correctCount,
        incorrectCount: card.incorrectCount,
        materialId: card.materialId
      }));
    }

    // 获取所有卡片关联的学习资料
    const materialIds = cards.map(card => card.materialId).filter(Boolean);
    const materials = await Material.find({
      _id: { $in: materialIds },
      userId: session.user.id,
    })
    .select('_id content tag userId')
    .lean()
    .then(docs => {
      return (docs as any[]).map(doc => ({
        _id: doc._id,
        content: doc.content,
        tag: doc.tag,
        userId: doc.userId
      }));
    }) as IMaterial[];

    // 创建材料ID到内容的映射
    const materialMap = new Map(
      materials.map(material => [material._id.toString(), material.content])
    );

    // 随机打乱卡片顺序
    const shuffledCards = cards.sort(() => Math.random() - 0.5);

    // 获取今日需要复习的卡片数（未复习的）
    const cardsToReview = await Card.countDocuments({
      deckId: params.id,
      userId: session.user.id,
      nextReview: { $lte: new Date() },
      lastReviewed: { 
        $lt: new Date().setHours(0, 0, 0, 0) // 今天还未复习的
      }
    });

    // 获取今日已经复习并记住的卡片数
    const rememberedCards = await Card.countDocuments({
      deckId: params.id,
      userId: session.user.id,
      lastReviewed: {
        $gte: new Date().setHours(0, 0, 0, 0)
      },
      status: 'remembered'
    });

    return NextResponse.json({
      cards: shuffledCards.map(card => ({
        id: card._id.toString(),
        front: card.front,
        back: card.back,
        level: card.level,
        reviewCount: card.reviewCount || 0,
        correctCount: card.correctCount || 0,
        incorrectCount: card.incorrectCount || 0,
        materialContent: card.materialId ? materialMap.get(card.materialId.toString()) : null,
      })),
      progress: {
        rememberedToday: rememberedCards,
        totalForToday: cardsToReview + rememberedCards // 总数 = 待复习 + 已记住
      }
    });
  } catch (error) {
    console.error('获取复习卡片失败:', error);
    return NextResponse.json(
      { error: '获取复习卡片失败' },
      { status: 500 }
    );
  }
} 