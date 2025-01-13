'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CreateCard() {
  const router = useRouter();
  const { status } = useSession();
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    tags: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('创建卡片失败');
      }

      router.push('/cards');
      router.refresh();
    } catch (error) {
      console.error('创建卡片时出错:', error);
      alert('创建卡片失败，请重试');
    }
  };

  // 如果正在检查认证状态或未登录，不显示任何内容
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">创建新卡片</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-gray-700">
            正面内容
          </label>
          <textarea
            id="front"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.front}
            onChange={(e) => setFormData({ ...formData, front: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="back" className="block text-sm font-medium text-gray-700">
            背面内容
          </label>
          <textarea
            id="back"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.back}
            onChange={(e) => setFormData({ ...formData, back: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            标签（用逗号分隔）
          </label>
          <input
            type="text"
            id="tags"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="例如: 历史, 中国, 朝代"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            创建
          </button>
        </div>
      </form>
    </div>
  );
} 