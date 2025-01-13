export interface Card {
  id: string;
  front: string;
  back: string;
  level: number;
  reviewCount: number;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  createdAt: string;
}

export interface ReviewProgress {
  rememberedToday: number;  // 今日已记住的卡片数量
  totalForToday: number;    // 今日总共需要复习的卡片数量
}

export interface ReviewSession {
  progress: ReviewProgress;
} 