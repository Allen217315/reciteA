'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'

interface SearchBarProps {
  onSearch: (keyword: string, tags: string[]) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [keyword, setKeyword] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // 获取标签列表
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/materials/tags')
        if (!response.ok) {
          throw new Error('获取标签失败')
        }
        const data = await response.json()
        setTags(data.tags)
      } catch (error) {
        console.error('获取标签失败:', error)
        toast.error('获取标签列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleSearch = () => {
    onSearch(keyword.trim(), selectedTags)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索学习资料..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-8 flex items-center">
          <span className="text-sm text-gray-500">加载标签中...</span>
        </div>
      ) : tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedTags.includes(tag)
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : (
        <div className="h-8 flex items-center">
          <span className="text-sm text-gray-500">暂无标签</span>
        </div>
      )}
    </div>
  )
} 