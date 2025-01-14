import mongoose from 'mongoose'
import { IMaterial } from '@/types'

const materialSchema = new mongoose.Schema<IMaterial>({
  content: {
    type: String,
    required: [true, '内容不能为空'],
  },
  tag: {
    type: String,
    default: '未分类'
  },
  userId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// 更新时自动更新 updatedAt 字段
materialSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const Material = mongoose.models.Material || mongoose.model<IMaterial>('Material', materialSchema)

export default Material 