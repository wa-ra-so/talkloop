import './style.css';
import {
  getDueQueue,
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

const app = document.querySelector<HTMLDivElement>('#app')!;

// ------------------------------------------------------------------
// 小さなルーター的な状態管理
// ------------------------------------------------------------------
type Screen = 'home' | 'review' | 'done';
let screen: Screen = 'home';
let queue: CardContent[] = [];
let queueIndex = 0;
let sessionTotal = 0;
let showAddModal = false;

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

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

// ------------------------------------------------------------------
// ホーム画面
// ------------------------------------------------------------------
function renderHome() {
  const stats = getStats();
  const due = getDueQueue();
  const dueCount = due.length;
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
      <div style="font-size: var(--text-sm); color: var(--color-text-muted);">今日のレビュー</div>
      <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; color: var(--color-primary); margin: var(--space-1) 0;">${dueCount}<span style="font-size: var(--text-base); color: var(--color-text-muted); font-weight: 500;"> 枚</span></div>
      <button id="start-btn" class="btn-primary" ${dueCount === 0 ? 'disabled style="opacity:.5;cursor:default;"' : ''}>
        ${dueCount === 0 ? '今日の分は終わりました 🎉' : 'レビューを始める'}
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
// レビュー画面
// ------------------------------------------------------------------
function startReview() {
  queue = getDueQueue();
  sessionTotal = queue.length;
  queueIndex = 0;
  screen = 'review';
  render();
}

let revealed = false;
let currentIntervals: Record<Grade, string> | null = null;

function renderReview(): void {
  const card = queue[queueIndex];
  if (!card) {
    screen = 'done';
    return render();
  }
  const progressPct = Math.round((queueIndex / sessionTotal) * 100);
  const firstExposure = card.kind === 'grammar' && isNew(card.id) && card.hint_ja;

  app.innerHTML = `
    <div class="review-topbar">
      <button id="exit-btn" class="icon-btn">✕</button>
      <div class="review-progress"><div class="review-progress-fill" style="width:${progressPct}%"></div></div>
      <span style="font-size: var(--text-xs); color: var(--color-text-muted);">${queueIndex + 1}/${sessionTotal}</span>
    </div>

    <div class="review-card">
      <span class="topic-chip">${escapeHtml(card.topic)}</span>
      ${firstExposure ? `<div class="hint-block">知っている形から予想してみよう：<br/><strong>${escapeHtml(card.hint_ja!)}</strong></div>` : ''}
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
  document.getElementById('exit-btn')?.addEventListener('click', () => {
    screen = 'home';
    render();
  });

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
      <span class="reveal-label">お手本</span>
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

  revealArea.querySelectorAll<HTMLButtonElement>('[data-grade]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const grade = Number(btn.dataset.grade) as Grade;
      rate(card.id, grade);
      queueIndex++;
      renderReview();
    });
  });
}

function renderDone() {
  app.innerHTML = `
    <div class="header">${LOGO_SVG}<div><div class="brand-title">Talkloop</div></div></div>
    <div class="card-panel done-panel">
      <div class="done-emoji">🎉</div>
      <h2 style="font-size: var(--text-xl); margin-bottom: var(--space-2);">今日のレビュー完了！</h2>
      <p style="color: var(--color-text-muted); margin-bottom: var(--space-5);">${sessionTotal}枚おつかれさまでした。少しずつの積み重ねが2ヶ月後の会話力になります。</p>
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
      <p style="font-size: var(--text-sm); color: var(--color-text-muted); margin: 0;">生活の中で「これ英語で言いたかった」を追加すると、レビューに混ざります。</p>
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
