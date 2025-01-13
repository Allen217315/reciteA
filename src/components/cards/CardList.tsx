'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Edit, MoreHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { Card } from '@/types';

async function getCards(deckId: string): Promise<Card[]> {
  console.log('开始获取卡片列表, deckId:', deckId);
  const response = await fetch(`/api/decks/${deckId}/cards`);
  if (!response.ok) {
    console.error('获取卡片列表失败, status:', response.status);
    throw new Error('获取卡片列表失败');
  }
  const data = await response.json();
  console.log('获取卡片列表成功:', data);
  return data;
}

export default function CardList({ deckId }: { deckId: string }) {
  console.log('CardList 组件渲染, deckId:', deckId);
  
  const { data: cards = [], isLoading, error } = useQuery({
    queryKey: ['cards', deckId],
    queryFn: () => getCards(deckId),
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!deckId,
  });

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCards(cards.map(card => card.id));
    } else {
      setSelectedCards([]);
    }
  };

  const handleSelectCard = (cardId: string, checked: boolean) => {
    if (checked) {
      setSelectedCards([...selectedCards, cardId]);
    } else {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    }
  };

  const handleBatchDelete = async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}/cards`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardIds: selectedCards }),
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      // 重新获取卡片列表
      window.location.reload();
    } catch (error) {
      console.error('批量删除失败:', error);
    }
  };

  const handleResetLevels = async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}/reset-levels`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('重置熟练度失败');
      }

      // 重新获取卡片列表
      window.location.reload();
    } catch (error) {
      console.error('重置熟练度失败:', error);
    }
  };

  console.log('useQuery 结果:', { isLoading, error, cardsLength: cards.length });

  if (isLoading) {
    console.log('显示加载状态');
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    console.error('显示错误状态:', error);
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-red-500">
          {error instanceof Error ? error.message : '获取卡片列表失败'}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    console.log('显示空状态');
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">暂无卡片</div>
      </div>
    );
  }

  console.log('渲染卡片列表, 数量:', cards.length);
  return (
    <div className="space-y-4">
      {/* 批量操作按钮 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {selectedCards.length > 0 && (
            <div className="px-6 py-2 flex items-center justify-between bg-blue-50">
              <div className="text-sm text-gray-600">
                已选择 {selectedCards.length} 项
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  批量编辑
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  批量删除
                </Button>
              </div>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm('确定要重置所有卡片的熟练度吗？此操作将把所有卡片的熟练度设为0。')) {
              handleResetLevels();
            }
          }}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置熟练度
        </Button>
      </div>

      {/* 卡片列表 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="w-14 px-4 py-3">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedCards.length === cards.length}
                    onCheckedChange={handleSelectAll}
                    className="ml-3"
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">正面</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">背面</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">熟练度</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下次复习</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="w-14 px-4 py-4">
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedCards.includes(card.id)}
                      onCheckedChange={(checked) => handleSelectCard(card.id, checked as boolean)}
                      className="ml-3"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-pre-wrap">{card.front}</td>
                <td className="px-6 py-4 whitespace-pre-wrap">{card.back}</td>
                <td className="px-6 py-4">{card.level}</td>
                <td className="px-6 py-4">
                  {card.nextReview ? format(new Date(card.nextReview), 'yyyy-MM-dd', { locale: zhCN }) : '-'}
                </td>
                <td className="px-6 py-4">
                  {format(new Date(card.createdAt), 'yyyy-MM-dd', { locale: zhCN })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedCards.length} 张卡片吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 