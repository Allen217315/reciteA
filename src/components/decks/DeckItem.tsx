'use client';

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Play, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Deck } from '@/types';

interface DeckItemProps {
  deck: Deck;
}

export default function DeckItem({ deck }: DeckItemProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/decks/${deck.id}`);
  };

  const handleDelete = () => {
    // TODO: 实现删除功能
    console.log('Delete deck:', deck.id);
  };

  const handleStudy = () => {
    router.push(`/study/${deck.id}`);
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {deck.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {deck.description}
            </p>
            <div className="mt-1 text-sm text-gray-500">
              {deck.cardCount} 张卡片 · 创建于 {deck.createdAt}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleView}
        >
          <Eye className="w-4 h-4" />
          查看
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleStudy}
        >
          <Play className="w-4 h-4" />
          开始学习
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 