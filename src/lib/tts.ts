// Web Speech API を使った音声読み上げ（Pimsleur式のリスニング＆シャドーイング用）。
// ブラウザが対応していない場合は何もしない（ボタンは表示されるが無反応になるだけ）。

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function pickVoice(): SpeechSynthesisVoice | null {
  if (!supported) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  voicesLoaded = true;
  // 自然な発音のネイティブ英語音声を優先的に選ぶ
  const preferred =
    voices.find((v) => v.lang === 'en-US' && /Google|Samantha|Natural/i.test(v.name)) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang?.startsWith('en')) ||
    voices[0];
  return preferred ?? null;
}

if (supported) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickVoice();
  };
}

export const ttsSupported = supported;

export function speak(text: string, rate = 0.85): void {
  if (!supported || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate; // 初級者向けに、少しゆっくりめ（Pimsleurのはっきりした発話を意識）
  if (!voicesLoaded) cachedVoice = pickVoice();
  if (cachedVoice) utterance.voice = cachedVoice;
  window.speechSynthesis.speak(utterance);
}
