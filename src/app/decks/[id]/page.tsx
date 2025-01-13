'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CardList from '@/components/cards/CardList';
import type { Deck } from '@/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function DeckDetailPage({
  params,
}: {
  params: { id: string };
}) {
  console.log('DeckDetailPage 渲染, params:', params);
  
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        console.log('开始获取卡片组详情');
        const response = await fetch(`/api/decks/${params.id}`);
        if (!response.ok) {
          console.error('获取卡片组详情失败, status:', response.status);
          throw new Error('获取卡片组失败');
        }
        const data = await response.json();
        console.log('获取卡片组详情成功:', data);
        setDeck(data);
      } catch (error) {
        console.error('获取卡片组详情失败:', error);
        setError(error instanceof Error ? error.message : '获取卡片组失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeck();
  }, [params.id]);

  if (isLoading) {
    console.log('显示加载状态');
    return (
      <div className="px-8 py-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    console.error('显示错误状态:', error);
    return (
      <div className="px-8 py-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-red-500">{error || '卡片组不存在'}</div>
        </div>
      </div>
    );
  }

  console.log('渲染卡片组详情页面');
  return (
    <QueryClientProvider client={queryClient}>
      <div className="px-8 py-4 space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/decks">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回卡片组列表
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{deck.name}</h1>
                {deck.description && (
                  <p className="mt-2 text-gray-500">{deck.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.push(`/study/${deck.id}`)}>
                  开始学习
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div>{deck.cardCount} 张卡片</div>
              <div>创建于 {deck.createdAt}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <CardList deckId={params.id} />
        </div>
      </div>
    </QueryClientProvider>
  );
} 