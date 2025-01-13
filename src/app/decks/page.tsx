'use client';

import { Button } from "@/components/ui/button";
import DeckList from "@/components/decks/DeckList";
import GenerateCardsDialog from "@/components/decks/GenerateCardsDialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import type { Deck } from '@/types';

export default function DecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch('/api/decks');
        if (!response.ok) {
          throw new Error('获取卡片组失败');
        }
        const data = await response.json();
        setDecks(data);
      } catch (error) {
        console.error('获取卡片组失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDecks();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">卡片组管理</h1>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={() => router.push('/decks/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          创建卡片组
        </Button>

        <GenerateCardsDialog decks={decks} />
      </div>

      <DeckList />
    </div>
  );
} 