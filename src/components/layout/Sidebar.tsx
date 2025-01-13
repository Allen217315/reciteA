'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Folder, GraduationCap, BarChart } from 'lucide-react';

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '学习资料', href: '/materials', icon: BookOpen },
  { name: '卡片组', href: '/decks', icon: Folder },
  { name: '复习卡片', href: '/review', icon: GraduationCap },
  { name: '数据统计', href: '/stats', icon: BarChart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-12 left-0 w-64 h-[calc(100vh-3rem)] bg-white border-r">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 