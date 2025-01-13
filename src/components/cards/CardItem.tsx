'use client';

import { Card } from '@/types/card';
import { useState } from 'react';
import { format } from 'date-fns';
import { Tag, Edit2, Trash2, Clock } from 'lucide-react';

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div 
        className="cursor-pointer min-h-[100px]"
        onClick={() => setShowBack(!showBack)}
      >
        <div className="font-medium text-lg mb-2">
          {showBack ? card.back : card.front}
        </div>
        <div className="text-sm text-gray-500 italic">
          点击查看{showBack ? '正面' : '背面'}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
          >
            <Tag size={12} className="mr-1" />
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <Clock size={16} className="mr-1" />
          下次复习：{format(new Date(card.nextReview), 'yyyy-MM-dd HH:mm')}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(card)}
            className="p-1 hover:text-blue-600 transition-colors"
            title="编辑"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm('确定要删除这张卡片吗？')) {
                onDelete(card._id);
              }
            }}
            className="p-1 hover:text-red-600 transition-colors"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 