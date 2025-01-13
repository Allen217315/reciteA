'use client'

import { useState } from 'react'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    // 检查文件类型
    if (!file.name.endsWith('.xlsx')) {
      toast.error('请上传 Excel (.xlsx) 文件')
      return
    }

    // 检查文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过 5MB')
      return
    }

    setFile(file)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      
      // 创建 FormData
      const formData = new FormData()
      formData.append('file', file)

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // 发送请求
      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      const data = await response.json()
      toast.success(data.message)
      
      // 重置状态
      setFile(null)
      onUploadSuccess()
    } catch (error: any) {
      console.error('上传失败:', error)
      toast.error(error.message || '上传失败，请重试')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div>
      <div className="text-center">
        <input
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileInput}
          id="file-upload"
          disabled={uploading}
        />
        <label 
          htmlFor="file-upload"
          className={`
            inline-flex items-center px-6 py-4 border border-gray-300 rounded-md shadow-sm 
            text-sm font-medium text-gray-700 bg-white
            ${uploading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer'}
          `}
        >
          <CloudArrowUpIcon className="h-5 w-5 mr-2 text-gray-400" />
          选择文件
        </label>
        <p className="mt-2 text-xs text-gray-500">
          支持上传 .xlsx 格式的文件，大小不超过 5MB
        </p>
      </div>

      {file && !uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{file.name}</span>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              开始上传
            </button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  上传中...
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {uploadProgress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 