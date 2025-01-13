import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Deck from '@/models/deck';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

interface DeckDocument {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  cardCount: number;
  createdAt: Date;
}

// GET /api/decks - 获取当前用户的所有卡片组
export async function GET() {
  try {
    // 获取当前用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 连接数据库
    await connectDB();

    // 获取当前用户的所有卡片组
    const decks = (await Deck.find({ userId: session.user.id })
      .sort({ createdAt: -1 }) // 按创建时间降序排序
      .select('name description cardCount createdAt') // 只选择需要的字段
      .lean()) as unknown as DeckDocument[]; // 转换为普通 JavaScript 对象

    // 格式化日期
    const formattedDecks = decks.map(deck => ({
      ...deck,
      id: deck._id.toString(),
      createdAt: new Date(deck.createdAt).toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
      _id: undefined
    }));

    return NextResponse.json(formattedDecks);
  } catch (error) {
    console.error('获取卡片组失败:', error);
    return NextResponse.json(
      { error: '获取卡片组失败' },
      { status: 500 }
    );
  }
}

// POST /api/decks - 创建新的卡片组
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { name, description } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: '卡片组名称不能为空' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectDB();

    // 创建新卡片组
    const deck = await Deck.create({
      name,
      description,
      userId: session.user.id,
      cardCount: 0
    });

    return NextResponse.json({
      id: deck._id.toString(),
      name: deck.name,
      description: deck.description,
      cardCount: deck.cardCount,
      createdAt: new Date(deck.createdAt).toISOString().split('T')[0]
    }, { status: 201 });
  } catch (error) {
    console.error('创建卡片组失败:', error);
    return NextResponse.json(
      { error: '创建卡片组失败' },
      { status: 500 }
    );
  }
} 