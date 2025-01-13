export interface Card {
  _id: string;
  userId: string;
  front: string;
  back: string;
  tags: string[];
  level: number;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
} 