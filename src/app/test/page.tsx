'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Card {
  _id: string;
  front: string;
  back: string;
  tags: string[];
  level: number;
  nextReview: string;
}

export default function TestPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editForm, setEditForm] = useState({
    front: '',
    back: '',
    tags: ''
  });

  // 获取所有卡片
  const fetchCards = async () => {
    const res = await fetch('/api/cards');
    const data = await res.json();
    setCards(data);
  };

  // 编辑卡片
  const handleEdit = async (cardId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          front: editForm.front,
          back: editForm.back,
          tags: editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('编辑成功');
        fetchCards();
        setSelectedCard(null);
      } else {
        alert(`编辑失败: ${data.error}`);
      }
    } catch (error) {
      alert('编辑失败: ' + error);
    }
  };

  // 删除卡片
  const handleDelete = async (cardId: string) => {
    if (!confirm('确定要删除这张卡片吗？')) return;
    
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert('删除成功');
        fetchCards();
      } else {
        alert(`删除失败: ${data.error}`);
      }
    } catch (error) {
      alert('删除失败: ' + error);
    }
  };

  // 复习卡片
  const handleReview = async (cardId: string, isCorrect: boolean) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCorrect }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`复习${isCorrect ? '正确' : '错误'}记录成功`);
        fetchCards();
      } else {
        alert(`复习记录失败: ${data.error}`);
      }
    } catch (error) {
      alert('复习记录失败: ' + error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCards();
    }
  }, [session]);

  useEffect(() => {
    if (selectedCard) {
      setEditForm({
        front: selectedCard.front,
        back: selectedCard.back,
        tags: selectedCard.tags.join(', ')
      });
    }
  }, [selectedCard]);

  if (!session) {
    return <div className="p-4">请先登录</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API 测试页面</h1>
      
      {selectedCard ? (
        <div className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">编辑卡片</h2>
          <div className="space-y-2">
            <input
              type="text"
              value={editForm.front}
              onChange={e => setEditForm(prev => ({ ...prev, front: e.target.value }))}
              placeholder="正面内容"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              value={editForm.back}
              onChange={e => setEditForm(prev => ({ ...prev, back: e.target.value }))}
              placeholder="背面内容"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              value={editForm.tags}
              onChange={e => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="标签（用逗号分隔）"
              className="w-full p-2 border rounded"
            />
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(selectedCard._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {cards.map(card => (
          <div key={card._id} className="p-4 border rounded">
            <div className="font-bold">正面：{card.front}</div>
            <div className="mt-2">背面：{card.back}</div>
            <div className="mt-2">标签：{card.tags.join(', ') || '无'}</div>
            <div className="mt-2">等级：{card.level}</div>
            <div className="mt-2">下次复习：{new Date(card.nextReview).toLocaleString()}</div>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => setSelectedCard(card)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(card._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                删除
              </button>
              <button
                onClick={() => handleReview(card._id, true)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                复习正确
              </button>
              <button
                onClick={() => handleReview(card._id, false)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                复习错误
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 