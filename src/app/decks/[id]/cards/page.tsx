import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CardList from '@/components/cards/CardList';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '卡片列表 - ReciteA',
  description: '查看和管理卡片组中的卡片',
};

export default async function DeckCardsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/decks">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回卡片组
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">卡片列表</h1>
      </div>

      <CardList deckId={params.id} />
    </div>
  );
} 