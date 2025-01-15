'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from '@/types';

interface ReviewCard extends Card {
  correctCount: number;
  incorrectCount: number;
  materialContent: string | null;
}

export default function ReviewPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [selectedDeckName, setSelectedDeckName] = useState<string>('');
  const [reviewMode, setReviewMode] = useState<'all' | 'mistakes'>('all');
  const [currentCard, setCurrentCard] = useState<ReviewCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<Array<{ id: string; name: string }>>([]);
  const [isFlipped, setIsFlipped] = useState(() => Math.random() < 0.5);

  // 在组件加载时获取卡片组列表
  useEffect(() => {
    if (session?.user) {
      fetchDecks();
    }
  }, [session]);

  // 获取用户的卡片组
  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/decks');
      if (!response.ok) throw new Error('获取卡片组失败');
      const data = await response.json();
      // 只取需要的字段
      setDecks(data.map((deck: any) => ({
        id: deck.id,
        name: deck.name
      })));
    } catch (error) {
      console.error('获取卡片组失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取要复习的卡片
  const fetchCards = async () => {
    if (!selectedDeckId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/decks/${selectedDeckId}/review?mode=${reviewMode}`);
      if (!response.ok) throw new Error('获取复习卡片失败');
      const data = await response.json();
      if (data.cards && data.cards.length > 0) {
        setCurrentCard(data.cards[0]);
        setTotalCards(data.cards.length);
        setIsFlipped(Math.random() < 0.5);
      } else {
        setCurrentCard(null);
        setTotalCards(0);
      }
    } catch (error) {
      console.error('获取复习卡片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 记录复习结果
  const handleReviewResult = async (isCorrect: boolean) => {
    if (!currentCard) return;

    try {
      const response = await fetch(`/api/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCorrect }),
      });

      if (!response.ok) throw new Error('记录复习结果失败');
      
      if (isCorrect) {
        setRememberedCount(prev => prev + 1);
      }
      setShowAnswer(false);
      await fetchCards(); // 获取下一张卡片
    } catch (error) {
      console.error('记录复习结果失败:', error);
    }
  };

  // 开始复习
  const startReview = async () => {
    if (!selectedDeckId) {
      alert('请选择要复习的卡片组');
      return;
    }
    const selectedDeck = decks.find(deck => deck.id === selectedDeckId);
    setSelectedDeckName(selectedDeck?.name || '');
    setRememberedCount(0);
    setShowAnswer(false);
    await fetchCards();
  };

  // 结束复习
  const endReview = () => {
    router.push('/decks');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">卡片复习</h1>
        <Button variant="outline" onClick={endReview}>
          结束复习
        </Button>
      </div>

      {/* 复习设置 */}
      {!currentCard && (
        <div className="space-y-6 max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <Label>选择卡片组</Label>
            <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
              <SelectTrigger>
                <SelectValue placeholder="选择要复习的卡片组" />
              </SelectTrigger>
              <SelectContent>
                {decks.map(deck => (
                  <SelectItem key={deck.id} value={deck.id}>
                    {deck.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>复习模式</Label>
            <RadioGroup value={reviewMode} onValueChange={(value: 'all' | 'mistakes') => setReviewMode(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">全面复习</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mistakes" id="mistakes" />
                <Label htmlFor="mistakes">仅复习错题本</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={startReview} className="w-full">
            开始复习
          </Button>
        </div>
      )}

      {/* 复习卡片 */}
      {currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 进度指示 */}
          <div className="text-center text-sm text-gray-600">
            已记住 {rememberedCount}/{totalCards} 张卡片
          </div>

          {/* 卡片内容 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* 卡片正面/背面 */}
            <div className="p-6 min-h-[200px]">
              <div className="text-lg mb-4">
                {isFlipped ? currentCard.back : currentCard.front}
              </div>
              
              {showAnswer && (
                <div className="text-lg mb-4 pt-4 border-t">
                  <div className="font-semibold mb-2">
                    {isFlipped ? "正面" : "背面"}:
                  </div>
                  {isFlipped ? currentCard.front : currentCard.back}
                </div>
              )}
              
              {/* 答对/答错次数 */}
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <div>答对: {currentCard.correctCount} 次</div>
                <div>答错: {currentCard.incorrectCount} 次</div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4">
                {!showAnswer && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswer(true)}
                  >
                    显示答案
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={() => handleReviewResult(true)}
                >
                  记得
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewResult(false)}
                >
                  不记得
                </Button>
              </div>
            </div>

            {/* 学习资料内容 */}
            {showAnswer && currentCard.materialContent && (
              <div className="border-t bg-gray-50 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  关联的学习资料：
                </h3>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {currentCard.materialContent}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : selectedDeckId && totalCards === 0 ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              🎉 恭喜！
            </h2>
            <p className="text-lg text-gray-700">
              今日「{selectedDeckName}」复习任务已完成
            </p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => router.push('/decks')}
            >
              返回卡片组
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
} 