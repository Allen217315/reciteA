'use client'

import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type Material = {
  _id: string
  content: string
  tag: string
  createdAt: string
  updatedAt: string
}

interface MaterialListProps {
  keyword?: string
  selectedTags?: string[]
  refreshKey?: number
}

export default function MaterialList({ keyword = '', selectedTags = [], refreshKey = 0 }: MaterialListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTag, setEditTag] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  // 获取学习资料列表
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true)
        // 构建查询参数
        const params = new URLSearchParams({
          page: currentPage.toString(),
          keyword,
        })
        selectedTags.forEach(tag => params.append('tags[]', tag))

        const response = await fetch(`/api/materials?${params}`)
        if (!response.ok) {
          throw new Error('获取数据失败')
        }

        const data = await response.json()
        setMaterials(data.materials)
        setTotalPages(data.pagination.totalPages)
      } catch (error) {
        console.error('获取学习资料列表失败:', error)
        toast.error('获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [currentPage, keyword, selectedTags, refreshKey])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(materials.map(item => item._id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelect = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleEdit = (material: Material) => {
    setEditingId(material._id)
    setEditContent(material.content)
    setEditTag(material.tag)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/materials/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
          tag: editTag.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '更新失败')
      }

      const { material } = await response.json()
      
      // 更新本地数据
      setMaterials(prev => 
        prev.map(item => 
          item._id === editingId ? material : item
        )
      )

      toast.success('更新成功')
      
      // 重置编辑状态
      setEditingId(null)
      setEditContent('')
      setEditTag('')
    } catch (error: any) {
      console.error('更新失败:', error)
      toast.error(error.message || '更新失败')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
    setEditTag('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '删除失败')
      }

      // 更新本地数据
      setMaterials(prev => prev.filter(item => item._id !== id))
      toast.success('删除成功')
    } catch (error: any) {
      console.error('删除失败:', error)
      toast.error(error.message || '删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedItems.length} 条记录吗？`)) return

    try {
      const response = await fetch('/api/materials', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedItems,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '删除失败')
      }

      const data = await response.json()
      
      // 更新本地数据
      setMaterials(prev => 
        prev.filter(item => !selectedItems.includes(item._id))
      )
      setSelectedItems([])
      
      toast.success(data.message)
    } catch (error: any) {
      console.error('批量删除失败:', error)
      toast.error(error.message || '删除失败')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (materials.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">暂无数据</p>
      </div>
    )
  }

  return (
    <div>
      {/* 批量操作工具栏 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={selectedItems.length === materials.length}
            onChange={handleSelectAll}
          />
          <span className="text-sm text-gray-500">
            全选 ({selectedItems.length}/{materials.length})
          </span>
        </div>
        {selectedItems.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
            >
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* 学习资料列表 */}
      <div className="divide-y divide-gray-200">
        {materials.map(material => (
          <div
            key={material._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4 flex-1">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selectedItems.includes(material._id)}
                onChange={() => handleSelect(material._id)}
              />
              <div className="flex-1">
                {editingId === material._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value)}
                      className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="分类标签"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-400 hover:text-gray-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {material.content}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {material.tag}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(material.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {editingId !== material._id && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(material)}
                  className="p-1 text-gray-400 hover:text-gray-500"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(material._id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              第 {currentPage} 页，共 {totalPages} 页
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 