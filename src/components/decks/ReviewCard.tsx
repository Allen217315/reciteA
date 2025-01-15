import { ReviewProgress } from '@/types';
import { useState } from 'react';

interface Card {
  front: string;
  back: string;
}

interface ReviewCardProps {
  card: Card;
  progress: ReviewProgress;
  onResult: (remembered: boolean) => void;
}

export default function ReviewCard({ card, progress, onResult }: ReviewCardProps) {
  const { rememberedToday, totalForToday } = progress;
  const [isFlipped, setIsFlipped] = useState(() => Math.random() < 0.5);
  const [showAnswer, setShowAnswer] = useState(false);
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            {isFlipped ? "背面" : "正面"}:
          </h3>
          <p className="text-gray-700">
            {isFlipped ? card.back : card.front}
          </p>
        </div>

        {showAnswer && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {isFlipped ? "正面" : "背面"}:
            </h3>
            <p className="text-gray-700">
              {isFlipped ? card.front : card.back}
            </p>
          </div>
        )}

        <div className="review-progress text-sm text-gray-600 mb-4">
          已记住 {rememberedToday}/{totalForToday} 张卡片
        </div>

        <div className="flex justify-center space-x-4">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              显示答案
            </button>
          ) : (
            <>
              <button
                onClick={() => onResult(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                不记得
              </button>
              <button
                onClick={() => onResult(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                记得
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 