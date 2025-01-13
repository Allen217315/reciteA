import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    console.log('注册请求数据:', { username }); // 不记录密码

    // 验证请求数据
    if (!username || !password) {
      console.log('验证失败: 缺少用户名或密码');
      return NextResponse.json(
        { error: '用户名和密码是必需的' },
        { status: 400 }
      );
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      console.log('验证失败: 用户名格式不正确');
      return NextResponse.json(
        { error: '用户名必须是4-20位的字母、数字或下划线' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      console.log('验证失败: 密码长度不符合要求');
      return NextResponse.json(
        { error: '密码长度必须至少6位' },
        { status: 400 }
      );
    }

    console.log('开始连接数据库...');
    // 连接数据库
    await connectDB();
    console.log('数据库连接成功');

    // 检查用户名是否已存在
    console.log('检查用户名是否存在:', username);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('用户名已存在');
      return NextResponse.json(
        { error: '用户名已被使用' },
        { status: 400 }
      );
    }

    // 创建新用户（密码加密在模型的 pre save 中处理）
    console.log('开始创建新用户...');
    const user = await User.create({
      username,
      password,
    });
    console.log('新用户创建成功:', user._id);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('注册错误详情:', error);
    if (error instanceof Error) {
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '注册过程中发生错误' },
      { status: 500 }
    );
  }
} 