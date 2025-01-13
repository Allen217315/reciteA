import mongoose from 'mongoose';

export interface ICard {
  userId: string;
  deckId: mongoose.Types.ObjectId;
  materialId?: mongoose.Types.ObjectId;
  front: string;
  back: string;
  level: number;
  reviewCount: number;
  nextReview: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new mongoose.Schema<ICard>({
  userId: { type: String, required: true },
  deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  front: { type: String, required: true },
  back: { type: String, required: true },
  level: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  nextReview: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

cardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Card = mongoose.models.Card || mongoose.model<ICard>('Card', cardSchema);

export { Card }; 