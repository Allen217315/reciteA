'use client';

import { Card } from '@/types/card';
import { useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';

interface ReviewCardProps {
  card: Card;
  onReview: (cardId: string, isCorrect: boolean) => Promise<void>;
  onNext: () => void;
}

export default function ReviewCard({ card, onReview, onNext }: ReviewCardProps) {
  const [showBack, setShowBack] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = async (isCorrect: boolean) => {
    if (isReviewing) return;
    
    try {
      setIsReviewing(true);
      await onReview(card._id, isCorrect);
      setShowBack(false);
      onNext();
    } catch (error) {
      console.error('复习失败:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-8">
        <div className="text-sm text-gray-500 mb-2">
          当前等级: {card.level}
        </div>
        <div 
          className="min-h-[200px] flex items-center justify-center cursor-pointer p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          onClick={() => !isReviewing && setShowBack(!showBack)}
        >
          <div className="text-xl">
            {showBack ? card.back : card.front}
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          点击卡片查看{showBack ? '正面' : '背面'}
        </div>
      </div>

      {showBack && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleReview(false)}
            disabled={isReviewing}
            className="flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <X size={20} className="mr-2" />
            不认识
          </button>
          <button
            onClick={() => handleReview(true)}
            disabled={isReviewing}
            className="flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-full hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <Check size={20} className="mr-2" />
            认识
          </button>
        </div>
      )}

      <div className="mt-8">
        <div className="text-sm text-gray-500 mb-2">标签：</div>
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 