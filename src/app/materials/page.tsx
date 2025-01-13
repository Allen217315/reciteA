'use client'

import { useState } from 'react'
import { Toaster } from 'sonner'
import FileUpload from '@/components/materials/FileUpload'
import SearchBar from '@/components/materials/SearchBar'
import MaterialList from '@/components/materials/MaterialList'

export default function MaterialsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleSearch = (newKeyword: string, newTags: string[]) => {
    setKeyword(newKeyword)
    setSelectedTags(newTags)
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">学习资料</h1>
        </div>

        {/* 文件上传区域 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">上传学习资料</h2>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              文件格式要求：
            </p>
            <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>必须包含以下字段：知识内容（必填）、分类标签（可选）</li>
              <li>示例格式：</li>
            </ul>
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm font-mono">
              | 知识内容 | 分类标签 |<br />
              |----------|----------|<br />
              | 床前明月光，疑是地上霜。| 唐诗 |<br />
              | 举头望明月，低头思故乡。| 唐诗 |
            </div>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="bg-white rounded-lg shadow p-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* 学习资料列表 */}
        <div className="bg-white rounded-lg shadow">
          <MaterialList 
            keyword={keyword}
            selectedTags={selectedTags}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </>
  )
} 