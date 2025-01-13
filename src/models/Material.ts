import mongoose from 'mongoose'

export interface IMaterial {
  _id: mongoose.Types.ObjectId
  userId: string
  content: string
  tag: string | null
  createdAt: Date
  updatedAt: Date
}

const materialSchema = new mongoose.Schema<IMaterial>({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  tag: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// 更新时自动更新 updatedAt 字段
materialSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// 创建索引以提高搜索性能
materialSchema.index({ content: 'text' })
materialSchema.index({ tag: 1 })
materialSchema.index({ userId: 1 })

const Material = mongoose.models.Material || mongoose.model<IMaterial>('Material', materialSchema)

export default Material 