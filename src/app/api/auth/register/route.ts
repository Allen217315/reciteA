import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码都是必需的' },
        { status: 400 }
      );
    }

    await connectDB();

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 创建新用户
    const user = await User.create({
      username,
      password,
    });

    return NextResponse.json(
      { message: '注册成功', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
} 