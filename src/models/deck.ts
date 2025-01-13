import mongoose from 'mongoose';

export interface IDeck {
  userId: string;
  name: string;
  description: string;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const deckSchema = new mongoose.Schema<IDeck>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  cardCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

deckSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Deck = mongoose.models.Deck || mongoose.model<IDeck>('Deck', deckSchema);

export default Deck; 