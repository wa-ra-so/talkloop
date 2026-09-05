import { fsrs, generatorParameters, Rating, createEmptyCard, State } from 'ts-fsrs';
import type { Card as FsrsCard, Grade } from 'ts-fsrs';
import { safeStorage } from './storage';
import { allCards, type CardContent } from '../data/cards';

const STORAGE_KEY = 'eigo-srs-progress-v1';
const CUSTOM_CARDS_KEY = 'eigo-srs-custom-cards-v1';

const scheduler = fsrs(generatorParameters({ enable_fuzz: true, request_retention: 0.85 }));

export { Rating, State };
export type { Grade };

// FSRS の Card は Date を含むため JSON 化のためシリアライズ用の型を用意する
interface StoredFsrsCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: string;
}

type ProgressMap = Record<string, StoredFsrsCard>;

function toStored(card: FsrsCard): StoredFsrsCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : undefined,
  };
}

function fromStored(s: StoredFsrsCard): FsrsCard {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsed_days,
    scheduled_days: s.scheduled_days,
    learning_steps: s.learning_steps,
    reps: s.reps,
    lapses: s.lapses,
    state: s.state,
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  };
}

function loadProgress(): ProgressMap {
  const raw = safeStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressMap): void {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadCustomCards(): CardContent[] {
  const raw = safeStorage.getItem(CUSTOM_CARDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CardContent[];
  } catch {
    return [];
  }
}

export function saveCustomCard(card: CardContent): void {
  const cards = loadCustomCards();
  cards.push(card);
  safeStorage.setItem(CUSTOM_CARDS_KEY, JSON.stringify(cards));
}

export function getAllContent(): CardContent[] {
  return [...allCards, ...loadCustomCards()];
}

let progress: ProgressMap = loadProgress();

export function getFsrsCard(contentId: string): FsrsCard {
  const stored = progress[contentId];
  if (stored) return fromStored(stored);
  return createEmptyCard(new Date());
}

export function isNew(contentId: string): boolean {
  const stored = progress[contentId];
  return !stored || stored.state === State.New;
}

export function getDueQueue(now: Date = new Date()): CardContent[] {
  const content = getAllContent();
  const due: CardContent[] = [];
  const fresh: CardContent[] = [];
  for (const c of content) {
    const stored = progress[c.id];
    if (!stored) {
      fresh.push(c);
    } else if (new Date(stored.due).getTime() <= now.getTime()) {
      due.push(c);
    }
  }
  // 復習カードを優先しつつ、新規カードを少しずつ混ぜる（1日の新規上限の目安: 10枚）
  const shuffledDue = shuffle(due);
  const newBatch = shuffle(fresh).slice(0, 10);
  return interleave(shuffledDue, newBatch);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function interleave<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  let ai = 0;
  let bi = 0;
  while (ai < a.length || bi < b.length) {
    if (ai < a.length) result.push(a[ai++]);
    if (bi < b.length && ai % 3 === 0) result.push(b[bi++]);
  }
  while (bi < b.length) result.push(b[bi++]);
  return result;
}

export function rate(contentId: string, grade: Grade): void {
  const card = getFsrsCard(contentId);
  const result = scheduler.next(card, new Date(), grade);
  progress[contentId] = toStored(result.card);
  saveProgress(progress);
}

function formatInterval(ms: number): string {
  const minutes = ms / 1000 / 60;
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))}分後`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)}時間後`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)}日後`;
  return `${Math.round(days / 30)}ヶ月後`;
}

export function previewIntervals(contentId: string): Record<Grade, string> {
  const card = getFsrsCard(contentId);
  const now = new Date();
  const previewMap = scheduler.repeat(card, now);
  const out = {} as Record<Grade, string>;
  ([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Grade[]).forEach((g) => {
    const item = (previewMap as unknown as Record<number, { card: FsrsCard }>)[g];
    out[g] = formatInterval(item.card.due.getTime() - now.getTime());
  });
  return out;
}

export function getStats(): { dueToday: number; total: number; learned: number; reviewedToday: number } {
  const content = getAllContent();
  const now = new Date();
  let dueToday = 0;
  let learned = 0;
  let reviewedToday = 0;
  const todayStr = now.toDateString();
  for (const c of content) {
    const stored = progress[c.id];
    if (!stored) {
      dueToday++; // 新規もキューに入るため「今日やること」に含める（上限は getDueQueue 側で制御）
      continue;
    }
    if (stored.state !== State.New) learned++;
    if (new Date(stored.due).getTime() <= now.getTime()) dueToday++;
    if (stored.last_review && new Date(stored.last_review).toDateString() === todayStr) {
      reviewedToday++;
    }
  }
  return { dueToday, total: content.length, learned, reviewedToday };
}
