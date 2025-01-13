'use client';

import { Card } from '@/types/card';
import { useState, useEffect } from 'react';

interface CardFormProps {
  card?: Card;
  onSubmit: (data: { front: string; back: string; tags: string[] }) => Promise<void>;
  onCancel?: () => void;
}

export default function CardForm({ card, onSubmit, onCancel }: CardFormProps) {
  const [form, setForm] = useState({
    front: '',
    back: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (card) {
      setForm({
        front: card.front,
        back: card.back,
        tags: card.tags.join(', ')
      });
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        front: form.front.trim(),
        back: form.back.trim(),
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      if (!card) {
        // 如果是创建新卡片，清空表单
        setForm({ front: '', back: '', tags: '' });
      }
    } catch (error) {
      console.error('提交表单失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          正面内容
        </label>
        <textarea
          value={form.front}
          onChange={e => setForm(prev => ({ ...prev, front: e.target.value }))}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          背面内容
        </label>
        <textarea
          value={form.back}
          onChange={e => setForm(prev => ({ ...prev, back: e.target.value }))}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标签（用逗号分隔）
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="例如：语文, 诗词"
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : (card ? '保存' : '创建')}
        </button>
      </div>
    </form>
  );
} 