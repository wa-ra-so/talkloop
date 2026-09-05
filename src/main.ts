import './style.css';
import {
  getDueQueue,
  getSessionPlan,
  rate,
  previewIntervals,
  getStats,
  Rating,
  saveCustomCard,
  getAllContent,
  isNew,
  type Grade,
} from './lib/srs';
import { weeks, type CardContent } from './data/cards';
import { safeStorage } from './lib/storage';
import { speak, ttsSupported } from './lib/tts';

const app = document.querySelector<HTMLDivElement>('#app')!;

// ------------------------------------------------------------------
// キューの中身: 「学習」→「その場での復習チェック（Pimsleur式・間隔を空けて2回）」
// → 卒業して初めて「本格的な復習（FSRS・翌日以降）」に入る
// ------------------------------------------------------------------
type QueueItem =
  | { type: 'learn'; card: CardContent }
  | { type: 'recall'; card: CardContent }
  | { type: 'review'; card: CardContent };

type Screen = 'home' | 'review' | 'done';
let screen: Screen = 'home';
let queue: QueueItem[] = [];
let queueIndex = 0;
let completedCount = 0;
let showAddModal = false;

// 新規カードごとの「その場チェック残り回数」「怪しい判定の再挑戦回数」
const recallRemaining = new Map<string, number>();
const shakyRetries = new Map<string, number>();

function render(): void {
  if (showAddModal) {
    renderModalOverlay();
  }
  if (screen === 'home') return renderHome();
  if (screen === 'review') return renderReview();
  if (screen === 'done') return renderDone();
}

// ------------------------------------------------------------------
// ロゴ
// ------------------------------------------------------------------
const LOGO_SVG = `
<svg class="logo-mark" viewBox="0 0 32 32" fill="none" aria-label="Talkloop">
  <path d="M16 4C9.373 4 4 8.925 4 15c0 3.36 1.657 6.37 4.27 8.41-.14 1.53-.66 2.94-1.52 4.09a.6.6 0 0 0 .62.93c2.16-.5 4.03-1.55 5.44-2.62A15.6 15.6 0 0 0 16 26c6.627 0 12-4.925 12-11S22.627 4 16 4Z" fill="var(--color-primary)"/>
  <circle cx="11.5" cy="15" r="1.6" fill="var(--color-surface)"/>
  <circle cx="16" cy="15" r="1.6" fill="var(--color-surface)"/>
  <circle cx="20.5" cy="15" r="1.6" fill="var(--color-surface)"/>
</svg>`;

const SPEAKER_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function speakerButton(id: string): string {
  if (!ttsSupported) return '';
  return `<button id="${id}" type="button" class="icon-btn speaker-btn" aria-label="音声を再生">${SPEAKER_ICON}</button>`;
}

// ------------------------------------------------------------------
// ホーム画面
// ------------------------------------------------------------------
function renderHome() {
  const stats = getStats();
  const { reviewCards, newCards } = getSessionPlan();
  const dueCount = getDueQueue().length;
  const pct = stats.total ? Math.round((stats.learned / stats.total) * 100) : 0;

  app.innerHTML = `
    <div class="header">
      ${LOGO_SVG}
      <div>
        <div class="brand-title">Talkloop</div>
        <div class="brand-sub">生活で使える会話文法を、2ヶ月で</div>
      </div>
    </div>

    <div class="card-panel">
      <div style="font-size: var(--text-sm); color: var(--color-text-muted);">今日のレッスン</div>
      <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; color: var(--color-primary); margin: var(--space-1) 0;">${dueCount}<span style="font-size: var(--text-base); color: var(--color-text-muted); font-weight: 500;"> 枚</span></div>
      <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-3);">
        新しい学習 ${newCards.length}枚・復習 ${reviewCards.length}枚
      </div>
      <button id="start-btn" class="btn-primary" ${dueCount === 0 ? 'disabled style="opacity:.5;cursor:default;"' : ''}>
        ${dueCount === 0 ? '今日の分は終わりました 🎉' : 'レッスンを始める'}
      </button>
      <button id="add-btn" class="btn-secondary">＋ 自分のフレーズを追加</button>
    </div>

    <div class="stat-row">
      <div class="stat-box">
        <span class="stat-num">${stats.learned}</span>
        <span class="stat-label">習得中 / ${stats.total}</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">${stats.reviewedToday}</span>
        <span class="stat-label">今日やった枚数</span>
      </div>
    </div>

    <div class="card-panel">
      <div style="display:flex; justify-content:space-between; font-size: var(--text-sm);">
        <span>全体の進捗</span>
        <span style="color: var(--color-text-muted);">${pct}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>

    <ul class="week-list">
      ${weeks
        .map((w) => {
          const learnedInWeek = w.cards.filter((c) => !isNew(c.id)).length;
          return `<li class="week-item">
            <span>${w.week === 0 ? '基本' : 'Week ' + w.week}：${escapeHtml(w.label)}</span>
            <span class="badge">${learnedInWeek}/${w.cards.length}</span>
          </li>`;
        })
        .join('')}
    </ul>

    <div class="footer-note">
      ${safeStorage.isPersistent ? '進捗はこの端末に自動保存されます' : '※ このプレビューでは保存が無効です（GitHub Pages版では自動保存されます）'}
    </div>
  `;

  document.getElementById('start-btn')?.addEventListener('click', () => {
    if (dueCount === 0) return;
    startReview();
  });
  document.getElementById('add-btn')?.addEventListener('click', () => {
    showAddModal = true;
    render();
  });
}

// ------------------------------------------------------------------
// キューの組み立て（復習カードと新規カードを織り交ぜる）
// ------------------------------------------------------------------
function interleaveItems(a: QueueItem[], b: QueueItem[]): QueueItem[] {
  const result: QueueItem[] = [];
  let ai = 0;
  let bi = 0;
  while (ai < a.length || bi < b.length) {
    if (ai < a.length) result.push(a[ai++]);
    if (bi < b.length && ai % 3 === 0) result.push(b[bi++]);
  }
  while (bi < b.length) result.push(b[bi++]);
  return result;
}

function insertRecallAt(card: CardContent, pos: number) {
  const clamped = Math.min(Math.max(pos, queueIndex + 1), queue.length);
  queue.splice(clamped, 0, { type: 'recall', card });
}

function startReview() {
  const { reviewCards, newCards } = getSessionPlan();
  const reviewItems: QueueItem[] = reviewCards.map((card) => ({ type: 'review', card }));
  const learnItems: QueueItem[] = newCards.map((card) => ({ type: 'learn', card }));
  queue = interleaveItems(reviewItems, learnItems);
  queueIndex = 0;
  completedCount = 0;
  recallRemaining.clear();
  shakyRetries.clear();
  screen = 'review';
  render();
}

// ------------------------------------------------------------------
// レビュー画面（学習 / その場チェック / 本格復習の3種類を切り替える）
// ------------------------------------------------------------------
let revealed = false;
let currentIntervals: Record<Grade, string> | null = null;

function renderReview(): void {
  const item = queue[queueIndex];
  if (!item) {
    screen = 'done';
    return render();
  }
  if (item.type === 'learn') return renderLearn(item.card);
  if (item.type === 'recall') return renderRecallCheck(item.card);
  return renderFullReview(item.card);
}

function topBar(): string {
  const total = Math.max(queue.length, queueIndex + 1);
  const progressPct = Math.round((queueIndex / total) * 100);
  return `
    <div class="review-topbar">
      <button id="exit-btn" class="icon-btn">✕</button>
      <div class="review-progress"><div class="review-progress-fill" style="width:${progressPct}%"></div></div>
      <span style="font-size: var(--text-xs); color: var(--color-text-muted);">${queueIndex + 1}/${total}</span>
    </div>`;
}

function bindExit(): void {
  document.getElementById('exit-btn')?.addEventListener('click', () => {
    screen = 'home';
    render();
  });
}

// --- ステージ1: 学習（新しいフレーズ・パターンをまず直接教える） ---
function renderLearn(card: CardContent): void {
  app.innerHTML = `
    ${topBar()}
    <div class="review-card learn-card">
      <span class="topic-chip">${escapeHtml(card.topic)} ・ 新しい学習</span>
      <div class="prompt-text">${escapeHtml(card.prompt_ja)}</div>

      <div class="learn-answer-block">
        <div class="learn-answer-row">
          <span class="reveal-answer">${escapeHtml(card.target_en)}</span>
          ${speakerButton('learn-speak-btn')}
        </div>
        ${card.cloze ? `<div class="cloze-text">${escapeHtml(card.cloze)}</div>` : ''}
        ${card.hint_ja ? `<div class="learn-tip">💡 ${escapeHtml(card.hint_ja)}</div>` : ''}
        ${card.note_ja ? `<div class="reveal-note">${escapeHtml(card.note_ja)}</div>` : ''}
      </div>

      <div class="shadow-instruction">🔊 音声を聞いて、声に出して2〜3回まねして言ってみよう</div>

      <button id="learn-next-btn" class="btn-primary">言えるようになった → 次へ</button>
    </div>
  `;

  document.getElementById('learn-speak-btn')?.addEventListener('click', () => speak(card.target_en));
  document.getElementById('learn-next-btn')?.addEventListener('click', () => onLearnComplete(card));
  bindExit();

  // 自動で一度お手本の音声を再生する（Pimsleur式：まず耳で聞く）
  if (ttsSupported) speak(card.target_en);
}

function onLearnComplete(card: CardContent): void {
  recallRemaining.set(card.id, 2);
  insertRecallAt(card, queueIndex + 3);
  queueIndex++;
  completedCount++;
  renderReview();
}

// --- ステージ2: その場での復習チェック（間隔を空けて2回・graduated recall） ---
function renderRecallCheck(card: CardContent): void {
  app.innerHTML = `
    ${topBar()}
    <div class="review-card">
      <span class="topic-chip">${escapeHtml(card.topic)} ・ 思い出せるか確認</span>
      <div class="prompt-text">${escapeHtml(card.prompt_ja)}</div>
      ${card.cloze ? `<div class="cloze-text">${escapeHtml(card.cloze)}</div>` : ''}

      <input id="answer-input" class="answer-input" type="text" placeholder="声に出す、または入力してみよう" autocomplete="off" autocapitalize="off" spellcheck="false" />

      <div class="recall-audio-hint">
        ${speakerButton('recall-speak-btn')}
        <span style="font-size: var(--text-xs); color: var(--color-text-muted);">わからなければ音声のヒントを聞いてみよう</span>
      </div>

      <div id="reveal-area"></div>

      <button id="check-btn" class="btn-primary">こたえを見る</button>
    </div>
  `;

  const input = document.getElementById('answer-input') as HTMLInputElement;
  input.focus();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      revealRecall(card, input);
    }
  });
  document.getElementById('check-btn')?.addEventListener('click', () => revealRecall(card, input));
  document.getElementById('recall-speak-btn')?.addEventListener('click', () => speak(card.target_en));
  bindExit();

  revealed = false;
}

function revealRecall(card: CardContent, input: HTMLInputElement): void {
  if (revealed) return;
  revealed = true;
  input.disabled = true;

  const revealArea = document.getElementById('reveal-area')!;
  revealArea.innerHTML = `
    <div class="reveal-block">
      <div class="learn-answer-row">
        <span class="reveal-label">お手本</span>
        ${speakerButton('reveal-speak-btn')}
      </div>
      <span class="reveal-answer">${escapeHtml(card.target_en)}</span>
      ${card.note_ja ? `<div class="reveal-note">${escapeHtml(card.note_ja)}</div>` : ''}
    </div>
    <div class="grade-row grade-row-2">
      <button id="shaky-btn" class="grade-btn grade-again">まだ怪しい 🔁</button>
      <button id="instant-btn" class="grade-btn grade-good">すぐ言えた ✅</button>
    </div>
  `;
  document.getElementById('check-btn')?.remove();
  document.getElementById('reveal-speak-btn')?.addEventListener('click', () => speak(card.target_en));
  document.getElementById('shaky-btn')?.addEventListener('click', () => onRecallResult(card, 'shaky'));
  document.getElementById('instant-btn')?.addEventListener('click', () => onRecallResult(card, 'instant'));
}

function onRecallResult(card: CardContent, result: 'shaky' | 'instant'): void {
  if (result === 'shaky') {
    const retries = shakyRetries.get(card.id) ?? 0;
    if (retries < 2) {
      shakyRetries.set(card.id, retries + 1);
      insertRecallAt(card, queueIndex + 3);
    } else {
      // 何度も怪しい場合は無理せず一旦切り上げ、通常の復習スケジュールで再挑戦する
      rate(card.id, Rating.Hard);
      recallRemaining.delete(card.id);
      shakyRetries.delete(card.id);
    }
  } else {
    const remaining = (recallRemaining.get(card.id) ?? 1) - 1;
    if (remaining > 0) {
      recallRemaining.set(card.id, remaining);
      insertRecallAt(card, queueIndex + 5);
    } else {
      rate(card.id, Rating.Good);
      recallRemaining.delete(card.id);
      shakyRetries.delete(card.id);
    }
  }
  queueIndex++;
  completedCount++;
  renderReview();
}

// --- ステージ3: 本格的な復習（FSRSによる翌日以降の間隔反復・4段階評価） ---
function renderFullReview(card: CardContent): void {
  app.innerHTML = `
    ${topBar()}
    <div class="review-card">
      <span class="topic-chip">${escapeHtml(card.topic)}</span>
      <div class="prompt-text">${escapeHtml(card.prompt_ja)}</div>
      ${card.cloze ? `<div class="cloze-text">${escapeHtml(card.cloze)}</div>` : ''}

      <input id="answer-input" class="answer-input" type="text" placeholder="英語で入力してみよう（自己採点なので何でもOK）" autocomplete="off" autocapitalize="off" spellcheck="false" />

      <div id="reveal-area"></div>

      <button id="check-btn" class="btn-primary">こたえを見る</button>
    </div>
  `;

  const input = document.getElementById('answer-input') as HTMLInputElement;
  input.focus();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doReveal(card, input);
    }
  });
  document.getElementById('check-btn')?.addEventListener('click', () => doReveal(card, input));
  bindExit();

  revealed = false;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.!?,]/g, '').replace(/\s+/g, ' ');
}

function doReveal(card: CardContent, input: HTMLInputElement) {
  if (revealed) return;
  revealed = true;
  const userAnswer = input.value;
  const isClose = normalize(userAnswer) === normalize(card.target_en) && userAnswer.length > 0;
  input.classList.add(isClose ? 'is-correct' : 'is-off');
  input.disabled = true;

  currentIntervals = previewIntervals(card.id);
  const revealArea = document.getElementById('reveal-area')!;
  revealArea.innerHTML = `
    <div class="reveal-block">
      <div class="learn-answer-row">
        <span class="reveal-label">お手本</span>
        ${speakerButton('reveal-speak-btn')}
      </div>
      <span class="reveal-answer">${escapeHtml(card.target_en)}</span>
      ${card.note_ja ? `<div class="reveal-note">${escapeHtml(card.note_ja)}</div>` : ''}
    </div>
    <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin: var(--space-3) 0 var(--space-2);">どれくらい思い出せた？</div>
    <div class="grade-row">
      <button class="grade-btn grade-again" data-grade="1">もう一度<span class="interval">${currentIntervals[Rating.Again]}</span></button>
      <button class="grade-btn grade-hard" data-grade="2">難しい<span class="interval">${currentIntervals[Rating.Hard]}</span></button>
      <button class="grade-btn grade-good" data-grade="3">できた<span class="interval">${currentIntervals[Rating.Good]}</span></button>
      <button class="grade-btn grade-easy" data-grade="4">簡単<span class="interval">${currentIntervals[Rating.Easy]}</span></button>
    </div>
  `;
  document.getElementById('check-btn')?.remove();
  document.getElementById('reveal-speak-btn')?.addEventListener('click', () => speak(card.target_en));

  revealArea.querySelectorAll<HTMLButtonElement>('[data-grade]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const grade = Number(btn.dataset.grade) as Grade;
      rate(card.id, grade);
      queueIndex++;
      completedCount++;
      renderReview();
    });
  });
}

function renderDone() {
  app.innerHTML = `
    <div class="header">${LOGO_SVG}<div><div class="brand-title">Talkloop</div></div></div>
    <div class="card-panel done-panel">
      <div class="done-emoji">🎉</div>
      <h2 style="font-size: var(--text-xl); margin-bottom: var(--space-2);">今日のレッスン完了！</h2>
      <p style="color: var(--color-text-muted); margin-bottom: var(--space-5);">${completedCount}枚おつかれさまでした。少しずつの積み重ねが2ヶ月後の会話力になります。</p>
      <button id="home-btn" class="btn-primary">ホームに戻る</button>
    </div>
  `;
  document.getElementById('home-btn')?.addEventListener('click', () => {
    screen = 'home';
    render();
  });
}

// ------------------------------------------------------------------
// 自分のフレーズを追加するモーダル
// ------------------------------------------------------------------
function renderModalOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop';
  overlay.id = 'add-modal';
  overlay.innerHTML = `
    <div class="modal-sheet">
      <h3 style="font-size: var(--text-lg);">自分のフレーズを追加</h3>
      <p style="font-size: var(--text-sm); color: var(--color-text-muted); margin: 0;">生活の中で「これ英語で言いたかった」を追加すると、レッスンに混ざります。</p>
      <label class="field-label">日本語（状況・意味）</label>
      <input id="new-ja" class="field-input" placeholder="例：友達に週末の予定を聞きたい" />
      <label class="field-label">英語（お手本の答え）</label>
      <input id="new-en" class="field-input" placeholder="例：What are you doing this weekend?" />
      <div class="modal-actions">
        <button id="modal-cancel" class="btn-secondary">キャンセル</button>
        <button id="modal-save" class="btn-primary">追加する</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-save')?.addEventListener('click', () => {
    const ja = (document.getElementById('new-ja') as HTMLInputElement).value.trim();
    const en = (document.getElementById('new-en') as HTMLInputElement).value.trim();
    if (!ja || !en) return;
    const customId = `custom-${Date.now()}`;
    saveCustomCard({
      id: customId,
      week: 0,
      topic: 'マイフレーズ',
      kind: 'phrase',
      prompt_ja: ja,
      target_en: en,
    });
    closeModal();
    render();
  });
}

function closeModal() {
  showAddModal = false;
  document.getElementById('add-modal')?.remove();
}

// 起動時に一度だけカード総数を確認（コンテンツが読み込めているかの簡易チェック）
console.info(`Talkloop: ${getAllContent().length} 枚のカードを読み込みました`);

render();
