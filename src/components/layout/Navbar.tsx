'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 h-12 bg-white border-b z-50">
      <div className="flex items-center justify-between h-full px-8">
        <Link href="/" className="text-xl font-bold text-gray-900">
          ReciteA
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 text-sm"
              >
                注销
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-gray-900"
              >
                登录
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 text-sm"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 