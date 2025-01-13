'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, Layers, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Deck } from '@/types';

interface GenerateCardsDialogProps {
  decks: Deck[];
}

export default function GenerateCardsDialog({ decks }: GenerateCardsDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'basic' | 'fill'>('basic');
  const [method, setMethod] = useState<'new' | 'existing'>('new');
  const [newDeckName, setNewDeckName] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setError(null);
        const response = await fetch('/api/materials/tags');
        if (!response.ok) {
          throw new Error('获取分类标签失败');
        }
        const data = await response.json();
        setTags(data.tags);
      } catch (error) {
        console.error('获取分类标签失败:', error);
        setError('获取分类标签失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/decks/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          method,
          newDeckName,
          selectedDeckId,
          tag: selectedTag,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '生成卡片失败');
      }

      toast({
        title: "成功",
        description: data.message,
        duration: 3000,
      });

      router.push(`/decks/${data.deckId}/cards`);
      setIsOpen(false);
    } catch (error) {
      console.error('生成卡片失败:', error);
      setError(error instanceof Error ? error.message : '生成卡片失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          生成复习卡片
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">生成复习卡片</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Tag className="w-4 h-4" />
              学习资料分类
            </div>
            <Select
              value={selectedTag}
              onValueChange={setSelectedTag}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "加载中..." : "请选择学习资料分类"} />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag} value={tag} className="cursor-pointer">
                    {tag || '未分类'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Layers className="w-4 h-4" />
              生成模式
            </div>
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as 'basic' | 'fill')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="basic" id="mode-basic" />
                <Label htmlFor="mode-basic" className="cursor-pointer">基础卡片模式</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="fill" id="mode-fill" />
                <Label htmlFor="mode-fill" className="cursor-pointer">填空模式</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <BookOpen className="w-4 h-4" />
              生成方式
            </div>
            <RadioGroup
              value={method}
              onValueChange={(value) => setMethod(value as 'new' | 'existing')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="new" id="method-new" />
                <Label htmlFor="method-new" className="cursor-pointer">创建新的卡片组</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="existing" id="method-existing" />
                <Label htmlFor="method-existing" className="cursor-pointer">加入已有卡片组</Label>
              </div>
            </RadioGroup>
          </div>

          {method === 'new' ? (
            <div className="space-y-3">
              <Label htmlFor="new-deck-name" className="text-sm font-medium text-gray-700">
                新卡片组名称
              </Label>
              <Input
                id="new-deck-name"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="请输入卡片组名称"
                className="w-full"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="existing-deck" className="text-sm font-medium text-gray-700">
                选择卡片组
              </Label>
              <Select
                value={selectedDeckId}
                onValueChange={setSelectedDeckId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择卡片组" />
                </SelectTrigger>
                <SelectContent>
                  {decks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id} className="cursor-pointer">
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="w-24"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                !selectedTag || 
                (method === 'new' && !newDeckName) || 
                (method === 'existing' && !selectedDeckId)
              }
              className="w-24"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中
                </>
              ) : (
                '确认生成'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 