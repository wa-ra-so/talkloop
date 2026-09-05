// localStorage が使えない環境（サンドボックス化されたプレビューなど）でも
// アプリが落ちないようにする安全なストレージ・ラッパー。
// 使える場合は localStorage に保存し、使えない場合はメモリ上に保持する
// （その場合はページを再読み込みすると内容は消える）。

type Store = Record<string, string>;

function detectLocalStorage(): boolean {
  try {
    const testKey = '__eigo_srs_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = detectLocalStorage();
const memoryStore: Store = {};

export const safeStorage = {
  isPersistent: hasLocalStorage,
  getItem(key: string): string | null {
    if (hasLocalStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStore[key] ?? null;
      }
    }
    return memoryStore[key] ?? null;
  },
  setItem(key: string, value: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // fall through to memory
      }
    }
    memoryStore[key] = value;
  },
};
