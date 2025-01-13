import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Deck from '@/models/deck';
import Material from '@/models/Material';
import { Card } from '@/models/Card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { IMaterial } from '@/models/Material';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { mode, method, newDeckName, selectedDeckId, tag } = await request.json();

    // 验证请求参数
    if (!mode || !method || !tag) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (method === 'new' && !newDeckName) {
      return NextResponse.json(
        { error: '请输入卡片组名称' },
        { status: 400 }
      );
    }

    if (method === 'existing' && !selectedDeckId) {
      return NextResponse.json(
        { error: '请选择卡片组' },
        { status: 400 }
      );
    }

    await connectDB();

    // 获取指定分类标签的学习资料
    const materials = await Material.find({
      userId: session.user.id,
      tag: tag || null, // 处理未分类的情况
    });

    if (materials.length === 0) {
      return NextResponse.json(
        { error: '未找到该分类的学习资料' },
        { status: 404 }
      );
    }

    let deck;
    if (method === 'new') {
      // 创建新的卡片组
      deck = await Deck.create({
        name: newDeckName,
        description: `使用${mode === 'basic' ? '基础卡片' : '填空'}模式从${tag || '未分类'}学习资料生成的卡片组`,
        userId: session.user.id,
        cardCount: 0,
      });
    } else {
      // 使用现有卡片组
      deck = await Deck.findById(selectedDeckId);
      if (!deck) {
        return NextResponse.json({ error: '卡片组不存在' }, { status: 404 });
      }
      if (deck.userId !== session.user.id) {
        return NextResponse.json({ error: '无权访问该卡片组' }, { status: 403 });
      }
    }

    // 根据模式生成卡片
    const cards = materials.map((material: IMaterial) => {
      const content = material.content;
      let front, back;

      if (mode === 'basic') {
        // 基础卡片模式：将内容从中间分割
        const midPoint = Math.floor(content.length / 2);
        front = content.slice(0, midPoint) + '_______________';
        back = '_______________ ' + content.slice(midPoint);
      } else {
        // 填空模式：随机选择一个词语生成填空
        const words = content.split(/\s+/);
        if (words.length < 2) {
          front = content + '（填空）';
          back = content;
        } else {
          const randomIndex = Math.floor(Math.random() * words.length);
          const targetWord = words[randomIndex];
          words[randomIndex] = '_______________';
          front = words.join(' ');
          back = content;
        }
      }

      return {
        deckId: deck._id,
        userId: session.user.id,
        front,
        back,
        materialId: material._id,
        reviewCount: 0,
        level: 0,
        nextReview: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // 批量创建卡片
    await Card.insertMany(cards);

    // 更新卡片组的卡片数量
    await Deck.findByIdAndUpdate(deck._id, {
      $inc: { cardCount: cards.length },
    });

    return NextResponse.json({ 
      deckId: deck._id,
      message: `成功生成 ${cards.length} 张卡片` 
    });
  } catch (error) {
    console.error('生成卡片失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成卡片失败' },
      { status: 500 }
    );
  }
}