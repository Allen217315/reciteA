import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '@/models/User';
import connectDB from './db';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('缺少用户名或密码');
          throw new Error("请输入用户名和密码");
        }

        try {
          console.log('开始连接数据库...');
          await connectDB();
          console.log('数据库连接成功');

          console.log('查找用户:', credentials.username);
          const user = await User.findOne({ username: credentials.username });
          if (!user) {
            console.log('未找到用户');
            throw new Error("用户名或密码错误");
          }

          console.log('开始验证密码...');
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('密码验证结果:', isValid);
          
          if (!isValid) {
            console.log('密码不正确');
            throw new Error("用户名或密码错误");
          }

          console.log('登录成功');
          return {
            id: user._id.toString(),
            username: user.username,
            name: user.username,
          };
        } catch (error) {
          console.error("认证失败:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          email: token.username as string,
        };
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 