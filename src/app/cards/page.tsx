'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/types/card';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

type SortField = 'createdAt' | 'level' | 'nextReview';
type SortOrder = 'asc' | 'desc';

export default function CardsPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (session) {
      fetchCards();
    }
  }, [session]);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/cards');
      if (!res.ok) throw new Error('获取卡片失败');
      const data = await res.json();
      setCards(data);
      
      // 提取所有唯一标签
      const tags = Array.from(new Set(data.flatMap((card: Card) => card.tags))) as string[];
      setAllTags(tags);
    } catch (error) {
      console.error('获取卡片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('确定要删除这张卡片吗？')) return;

    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCards(cards.filter(card => card._id !== cardId));
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除卡片失败:', error);
      alert('删除卡片失败');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedCards = cards
    .filter(card => {
      const matchesSearch = searchTerm === '' ||
        card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.back.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => card.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'level') {
        return (a.level - b.level) * order;
      }
      return (new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()) * order;
    });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">卡片管理</h1>
          <button
            onClick={() => window.location.href = '/cards/new'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新建卡片
          </button>
        </div>

        <div className="flex gap-4 items-start">
          <div className="flex-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索卡片..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">加载中...</p>
                </div>
              </div>
            ) : filteredAndSortedCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow">
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedTags.length > 0 ? '没有找到匹配的卡片' : '还没有卡片'}
                </p>
                {!searchTerm && selectedTags.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/cards/new'}
                    className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                    创建第一张卡片
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">正面</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">背面</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签</th>
                        <th className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('level')}>
                          <div className="flex items-center gap-1">
                            等级
                            <ArrowUpDown className={`w-4 h-4 transition-colors ${sortField === 'level' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                          </div>
                        </th>
                        <th className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('nextReview')}>
                          <div className="flex items-center gap-1">
                            下次复习
                            <ArrowUpDown className={`w-4 h-4 transition-colors ${sortField === 'nextReview' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                          </div>
                        </th>
                        <th className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                          <div className="flex items-center gap-1">
                            创建时间
                            <ArrowUpDown className={`w-4 h-4 transition-colors ${sortField === 'createdAt' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedCards.map((card) => (
                        <tr key={card._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate">{card.front}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate">{card.back}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {card.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            Level {card.level}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {format(new Date(card.nextReview), 'yyyy-MM-dd HH:mm')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {format(new Date(card.createdAt), 'yyyy-MM-dd HH:mm')}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => window.location.href = `/cards/${card._id}/edit`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(card._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="w-64 bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              标签筛选
            </div>
            <div className="space-y-2">
              {allTags.map(tag => (
                <label key={tag} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag]);
                      } else {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{tag}</span>
                </label>
              ))}
              {allTags.length === 0 && (
                <p className="text-sm text-gray-500">暂无标签</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 