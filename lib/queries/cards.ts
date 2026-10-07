import { demoCards, shouldUseDemoData } from '@/lib/demo';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { Card } from '@/lib/types';

type CardDatabaseRow = {
  id: string;
  name: string;
  card_number: string | null;
  rarity: string | null;
  language: string | null;
  condition: string | null;
  price: number | string;
  quantity: number;
  description: string | null;
  image_url: string | null;
  status: Card['status'];
  created_at: string;
  sets: { name: string } | null;
};

function mapCard(row: CardDatabaseRow): Card {
  return {
    id: row.id,
    name: row.name,
    set_name: row.sets?.name ?? 'Set',
    card_number: row.card_number ?? '',
    rarity: row.rarity ?? '',
    language: row.language ?? '',
    condition: row.condition ?? '',
    price: Number(row.price),
    quantity: row.quantity,
    description: row.description ?? '',
    image_url: row.image_url ?? '',
    status: row.status,
    created_at: row.created_at,
  };
}

export async function getCards(): Promise<Card[]> {
  if (!isSupabaseConfigured()) {
    if (shouldUseDemoData(false)) return demoCards;
    throw new Error('Catalogo temporaneamente non disponibile.');
  }

  const db = await createClient();
  const { data, error } = await db
    .from('cards')
    .select('*, sets(name)')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Catalogo temporaneamente non disponibile.');
  return ((data ?? []) as unknown as CardDatabaseRow[]).map(mapCard);
}

export async function getCard(id: string): Promise<Card | null> {
  if (!isSupabaseConfigured()) {
    if (shouldUseDemoData(false)) return demoCards.find((card) => card.id === id) ?? null;
    throw new Error('Carta temporaneamente non disponibile.');
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;

  const db = await createClient();
  const { data, error } = await db
    .from('cards')
    .select('*, sets(name)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error('Carta temporaneamente non disponibile.');
  return data ? mapCard(data as unknown as CardDatabaseRow) : null;
}
