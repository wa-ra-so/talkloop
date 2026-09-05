import { defineConfig } from 'vite';

// GitHub Pages ではリポジトリ名がサブパスになるため base を指定する。
// (https://<user>.github.io/talkloop/ で公開する想定)
export default defineConfig({
  base: '/talkloop/',
});
