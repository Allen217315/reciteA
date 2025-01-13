import { ReviewProgress } from '@/types';

interface ReviewCardProps {
  // 现有的 props...
  progress: ReviewProgress;
}

export default function ReviewCard({ progress, ...props }: ReviewCardProps) {
  const { rememberedToday, totalForToday } = progress;
  
  return (
    <div className="review-card">
      <div className="review-progress text-sm text-gray-600 mb-4">
        已记住 {rememberedToday}/{totalForToday} 张卡片
      </div>
      
      {/* 现有的卡片内容... */}
    </div>
  );
} 