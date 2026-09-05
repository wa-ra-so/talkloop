// カードの型定義
// kind: 'phrase' = 日常フレーズ（丸ごと覚える）, 'grammar' = 文法パターン練習
export type CardKind = 'phrase' | 'grammar';

export interface CardContent {
  id: string;
  week: number; // 0 = 自己紹介・あいさつ, 1-8 = 文法週（初級レベル）
  topic: string; // 表示用トピック名
  kind: CardKind;
  prompt_ja: string; // 日本語の状況・指示
  cloze?: string; // 文法ドリル用の空所文（英語, ___ が空所）
  target_en: string; // お手本の正解（英文 or フレーズ）
  hint_ja?: string; // 使い方のちょっとしたコツ（学習画面で表示）
  note_ja?: string; // 正解後に出す簡単な文法解説
}

let n = 0;
const id = (prefix: string) => `${prefix}-${(++n).toString().padStart(3, '0')}`;

const phrase = (
  week: number,
  topic: string,
  prompt_ja: string,
  target_en: string,
  note_ja?: string,
): CardContent => ({
  id: id('ph'),
  week,
  topic,
  kind: 'phrase',
  prompt_ja,
  target_en,
  note_ja,
});

const grammar = (
  week: number,
  topic: string,
  prompt_ja: string,
  target_en: string,
  opts: { cloze?: string; hint_ja?: string; note_ja?: string } = {},
): CardContent => ({
  id: id('gr'),
  week,
  topic,
  kind: 'grammar',
  prompt_ja,
  target_en,
  ...opts,
});

// ------------------------------------------------------------------
// Level 0: 自己紹介・あいさつ（一番はじめに覚える超基本フレーズ）
// ------------------------------------------------------------------
const W0 = 'あいさつ・自己紹介';
export const week0: CardContent[] = [
  phrase(0, W0, '「こんにちは」とあいさつしたい', 'Hi, how are you?'),
  phrase(0, W0, '「元気です、ありがとう」と答えたい', "I'm good, thank you."),
  phrase(0, W0, '「はじめまして」と言いたい', 'Nice to meet you.'),
  phrase(0, W0, '自分の名前を伝えたい', "I'm Muneshiro."),
  phrase(0, W0, '出身を伝えたい', "I'm from Chiba, Japan."),
  phrase(0, W0, '相手の出身を尋ねたい', 'Where are you from?'),
  phrase(0, W0, '相手の名前を尋ねたい', "What's your name?"),
  phrase(0, W0, '「またね」と別れの挨拶をしたい', 'See you later.'),
  phrase(0, W0, '「すみません」と話しかけたい', 'Excuse me.'),
  phrase(0, W0, '「ありがとうございます」とお礼を言いたい', 'Thank you so much.'),
  phrase(0, W0, '「どういたしまして」と答えたい', "You're welcome."),
  phrase(0, W0, '「わかりません」と伝えたい', "I don't understand."),
  phrase(0, W0, 'もう一度言ってほしいと頼みたい', 'Could you say that again?'),
  phrase(0, W0, 'ゆっくり話してほしいと頼みたい', 'Could you speak slowly, please?'),
  phrase(0, W0, '「大丈夫です」と答えたい', "It's okay."),
];

// ------------------------------------------------------------------
// Week 1: be動詞（am / is / are）で自分や物のことを話す
// ------------------------------------------------------------------
const W1 = 'be動詞（am / is / are）';
export const week1: CardContent[] = [
  grammar(1, W1, '「私は初心者です」と伝えたい', "I'm a beginner.", {
    note_ja: '主語が I のときは am。I\'m は I am の短縮形。',
  }),
  grammar(1, W1, '「これは私の携帯です」と伝えたい', 'This is my phone.', {
    cloze: 'This ___ my phone.',
    note_ja: 'this / that / it など単数のものには is を使う。',
  }),
  grammar(1, W1, '「彼女は私の友達です」と伝えたい', "She's my friend.", {
    note_ja: 'he / she / it には is。She\'s は She is の短縮形。',
  }),
  grammar(1, W1, '「あなたは親切ですね」と伝えたい', "You're very kind.", {
    note_ja: 'you / we / they には are。You\'re は You are の短縮形。',
  }),
  grammar(1, W1, '「私たちは同僚です」と伝えたい', "We're coworkers.", {
    hint_ja: '知っている形: "You\'re very kind."',
    note_ja: 'we にも are を使う。',
  }),
  grammar(1, W1, '「この席は空いていますか」と尋ねたい', 'Is this seat taken?', {
    note_ja: '疑問文は be動詞を主語の前に出す: Is this...?',
  }),
  grammar(1, W1, '「これは何ですか」と尋ねたい', 'What is this?', {
    note_ja: '疑問詞 + is/are + 主語 で質問を作る。',
  }),
  grammar(1, W1, '「私は今日忙しくありません」と否定したい', "I'm not busy today.", {
    note_ja: '否定は am/is/are のあとに not を置く。',
  }),
  grammar(1, W1, '「彼はここにいません」と否定したい', "He's not here.", {
    note_ja: 'He\'s not = He is not。',
  }),
  grammar(1, W1, '「確かではありません」と伝えたい', "I'm not sure.", {
    note_ja: '会話でとてもよく使う一言。',
  }),
  grammar(1, W1, '「準備はできていますか」と尋ねたい', 'Are you ready?', {
    note_ja: 'you に対する疑問文は Are you...? の形。',
  }),
  grammar(1, W1, '「私は疲れています」と伝えたい', "I'm tired.", {
    note_ja: '感情や状態は be動詞 + 形容詞で表す。',
  }),
];

// ------------------------------------------------------------------
// Week 2: 一般動詞の現在形（好き・欲しい・持っている）
// ------------------------------------------------------------------
const W2 = '一般動詞の現在形';
export const week2: CardContent[] = [
  grammar(2, W2, '「コーヒーが好きです」と伝えたい', 'I like coffee.', {
    note_ja: '一般動詞は be動詞を使わず、そのまま動詞を置く。',
  }),
  grammar(2, W2, '「納豆は好きではありません」と否定したい', "I don't like natto.", {
    hint_ja: '知っている形: "I like coffee."',
    note_ja: '一般動詞の否定は don\'t / doesn\'t + 動詞の原形。',
  }),
  grammar(2, W2, '「車を持っています」と伝えたい', 'I have a car.', {
    note_ja: '「持っている」は have。',
  }),
  grammar(2, W2, '「お寿司は好きですか」と尋ねたい', 'Do you like sushi?', {
    note_ja: '一般動詞の疑問文は Do you...? の形。',
  }),
  grammar(2, W2, '「彼は英語を話します」と伝えたい（三人称）', 'He speaks English.', {
    note_ja: '主語が he/she/it のときは動詞に s を付ける。',
  }),
  grammar(2, W2, '「彼女はコーヒーを飲みません」と否定したい（三人称）', "She doesn't drink coffee.", {
    hint_ja: '知っている形: "He speaks English."',
    note_ja: '三人称の否定は doesn\'t + 動詞の原形（s は付けない）。',
  }),
  grammar(2, W2, '「英語を勉強したいです」と伝えたい', 'I want to learn English.', {
    note_ja: 'want to + 動詞の原形 で「〜したい」。',
  }),
  grammar(2, W2, '「毎朝コーヒーを飲みます」と習慣を伝えたい', 'I drink coffee every morning.', {
    note_ja: '習慣や日課には現在形を使う。',
  }),
  grammar(2, W2, '「毎日どんなことをしますか」と尋ねたい', 'What do you do every day?', {
    note_ja: '疑問詞 + do you + 動詞 で日常について質問する。',
  }),
  grammar(2, W2, '「ラーメンが大好きです」と伝えたい', 'I really like ramen.', {
    note_ja: 'really を挟むと「とても好き」のニュアンスになる。',
  }),
  grammar(2, W2, '「彼女はいつも忙しいです」と伝えたい', "She's always busy.", {
    note_ja: 'always（頻度）は be動詞のあとに置く。',
  }),
];

// ------------------------------------------------------------------
// Week 3: 疑問詞で質問する（何・どこ・いつ・誰・どうやって）
// ------------------------------------------------------------------
const W3 = '疑問詞（What / Where / When / Who / How）';
export const week3: CardContent[] = [
  grammar(3, W3, '「トイレはどこですか」と尋ねたい', 'Where is the bathroom?', {
    note_ja: 'Where + is/are で場所を尋ねる。',
  }),
  grammar(3, W3, '「これは何ですか」と尋ねたい', 'What is this called in English?', {
    hint_ja: '知っている形: "Where is the bathroom?"',
    note_ja: 'What is this called...? は名前を知りたいときの便利な表現。',
  }),
  grammar(3, W3, '「何時に仕事を始めますか」と尋ねたい', 'When do you start work?', {
    note_ja: 'When + do/does + 主語 + 動詞。',
  }),
  grammar(3, W3, '「あの人は誰ですか」と尋ねたい', 'Who is that?', {
    note_ja: 'Who + is/are で人を尋ねる。',
  }),
  grammar(3, W3, '「これは英語で何と言いますか」と尋ねたい', 'How do you say this in English?', {
    note_ja: 'How do you say...? は英語学習でとても便利なフレーズ。',
  }),
  grammar(3, W3, '「駅までどうやって行きますか」と尋ねたい', 'How do I get to the station?', {
    note_ja: 'How do I get to...? で道順を尋ねる。',
  }),
  grammar(3, W3, '「なぜ遅れたのですか」と尋ねたい', 'Why are you late?', {
    note_ja: 'Why + be動詞/do で理由を尋ねる。',
  }),
  grammar(3, W3, '「どれくらいの頻度で運動しますか」と尋ねたい', 'How often do you exercise?', {
    note_ja: 'How often...? は頻度を尋ねる定番表現。',
  }),
  grammar(3, W3, '「値段はいくらですか」と尋ねたい', 'How much is this?', {
    note_ja: 'How much...? は値段を尋ねるときの基本。',
  }),
  grammar(3, W3, '「何人家族ですか」と尋ねたい', 'How many people are in your family?', {
    note_ja: 'How many + 複数名詞 で数を尋ねる。',
  }),
];

// ------------------------------------------------------------------
// Week 4: There is/are・数・前置詞の基本
// ------------------------------------------------------------------
const W4 = 'There is/are・前置詞の基本';
export const week4: CardContent[] = [
  grammar(4, W4, '「猫が一匹います」と伝えたい', "There's a cat.", {
    note_ja: 'There is/There\'s + 単数名詞 で「〜がある/いる」。',
  }),
  grammar(4, W4, '「ここにはたくさんの人がいます」と伝えたい', 'There are many people here.', {
    hint_ja: '知っている形: "There\'s a cat."',
    note_ja: '複数名詞には There are を使う。',
  }),
  grammar(4, W4, '「テーブルの上にあります」と場所を伝えたい', "It's on the table.", {
    note_ja: '接触している面の上には on。',
  }),
  grammar(4, W4, '「かばんの中にあります」と場所を伝えたい', "It's in my bag.", {
    hint_ja: '知っている形: "It\'s on the table."',
    note_ja: '空間の中には in。',
  }),
  grammar(4, W4, '「駅の近くにあります」と場所を伝えたい', "It's near the station.", {
    note_ja: 'near は「〜の近くに」。',
  }),
  grammar(4, W4, '「兄弟が2人います」と伝えたい', 'I have two brothers.', {
    note_ja: '数を数えられるものは数字 + 複数形。',
  }),
  grammar(4, W4, '「時間があまりありません」と伝えたい', "I don't have much time.", {
    note_ja: 'time のような数えられない名詞には much を使う。',
  }),
  grammar(4, W4, '「少しお金を持っています」と伝えたい', 'I have some money.', {
    note_ja: '肯定文では some（いくつかの）を使うことが多い。',
  }),
  grammar(4, W4, '「お茶はありますか」と尋ねたい', 'Do you have any tea?', {
    note_ja: '疑問文・否定文では any を使うことが多い。',
  }),
  grammar(4, W4, '「7時に会いましょう」と時間を伝えたい', "Let's meet at seven.", {
    note_ja: '時刻には at を使う。',
  }),
];

// ------------------------------------------------------------------
// Week 5: can（できる）・want to / would like to（したい）
// ------------------------------------------------------------------
const W5 = 'can・want to / would like to';
export const week5: CardContent[] = [
  grammar(5, W5, '「少し英語が話せます」と伝えたい', 'I can speak a little English.', {
    note_ja: 'can + 動詞の原形 で「〜できる」。',
  }),
  grammar(5, W5, '「泳げません」と伝えたい', "I can't swim.", {
    hint_ja: '知っている形: "I can speak a little English."',
    note_ja: '否定は can\'t（cannot）+ 動詞の原形。',
  }),
  grammar(5, W5, '「手伝ってもらえますか」と頼みたい', 'Can you help me?', {
    note_ja: 'Can you...? は依頼にもよく使う。',
  }),
  grammar(5, W5, '「写真を撮ってもいいですか」と許可を求めたい', 'Can I take a picture?', {
    note_ja: 'Can I...? は「〜してもいい？」と許可を求める表現。',
  }),
  grammar(5, W5, '「ビーチに行きたいです」と伝えたい', 'I want to go to the beach.', {
    note_ja: 'want to + 動詞の原形 で「〜したい」。',
  }),
  grammar(5, W5, '「コーヒーをお願いします」と丁寧に注文したい', "I'd like a coffee, please.", {
    note_ja: "I'd like ~ (= I would like) は want より丁寧な言い方。",
  }),
  grammar(5, W5, '「一緒に映画を見に行きたいですか」と丁寧に誘いたい', 'Would you like to see a movie?', {
    hint_ja: '知っている形: "I\'d like a coffee, please."',
    note_ja: 'Would you like to...? は丁寧な誘い方。',
  }),
  grammar(5, W5, '「今週末は空いていますか」と尋ねたい', 'Are you free this weekend?', {
    note_ja: '誘う前の定番の切り出し方。',
  }),
  grammar(5, W5, '「静かにしていただけますか」と丁寧に頼みたい', 'Could you be quiet, please?', {
    note_ja: 'Could you...? は Can you より少し丁寧な依頼。',
  }),
  grammar(5, W5, '「もう一度説明してもらえますか」と頼みたい', 'Could you explain it again?', {
    note_ja: '授業やレッスンでも使える便利なフレーズ。',
  }),
];

// ------------------------------------------------------------------
// Week 6: 過去形の基本（was / were, 規則・不規則動詞）
// ------------------------------------------------------------------
const W6 = '過去形の基本';
export const week6: CardContent[] = [
  grammar(6, W6, '「昨日は忙しかったです」と伝えたい', 'I was busy yesterday.', {
    note_ja: 'am/is の過去形は was。',
  }),
  grammar(6, W6, '「先週は暑かったです」と伝えたい', 'It was hot last week.', {
    note_ja: 'it の過去形も was。',
  }),
  grammar(6, W6, '「私たちは公園にいました」と伝えたい', 'We were at the park.', {
    hint_ja: '知っている形: "It was hot last week."',
    note_ja: 'are の過去形は were。',
  }),
  grammar(6, W6, '「先週東京に行きました」と伝えたい', 'I went to Tokyo last week.', {
    note_ja: 'go の過去形は went（不規則動詞）。',
  }),
  grammar(6, W6, '「時間がありませんでした」と否定したい', "I didn't have time.", {
    note_ja: '一般動詞の過去の否定は didn\'t + 動詞の原形。',
  }),
  grammar(6, W6, '「昼食は食べましたか」と尋ねたい', 'Did you eat lunch?', {
    note_ja: '過去の疑問文は Did you + 動詞の原形。',
  }),
  grammar(6, W6, '「その映画を見ました」と伝えたい', 'I watched that movie.', {
    note_ja: '規則動詞の過去形は動詞 + ed。',
  }),
  grammar(6, W6, '「彼女に会いました」と伝えたい', 'I met her yesterday.', {
    note_ja: 'meet の過去形は met（不規則動詞）。',
  }),
  grammar(6, W6, '「新しい仕事を始めました」と伝えたい', 'I started a new job.', {
    note_ja: 'start の過去形は started。',
  }),
  grammar(6, W6, '「楽しかったです」と伝えたい', 'It was fun.', {
    note_ja: '感想を伝えるときによく使う一言。',
  }),
];

// ------------------------------------------------------------------
// Week 7: 未来の表現（will / going to）と予定
// ------------------------------------------------------------------
const W7 = '未来の表現（will / going to）';
export const week7: CardContent[] = [
  grammar(7, W7, '「あとで電話します」と伝えたい', "I'll call you later.", {
    note_ja: 'will（\'ll）+ 動詞の原形 は、その場で決めた未来のこと。',
  }),
  grammar(7, W7, '「来月旅行に行く予定です」と伝えたい', "I'm going to travel next month.", {
    hint_ja: '知っている形: "I\'ll call you later."',
    note_ja: 'be going to は前もって決めていた予定に使う。',
  }),
  grammar(7, W7, '「今週末は何をする予定ですか」と尋ねたい', 'What are you going to do this weekend?', {
    note_ja: '予定を尋ねるときの定番の質問。',
  }),
  grammar(7, W7, '「明日は雨が降るでしょう」と予測したい', "It will rain tomorrow.", {
    note_ja: 'will は予測にも使う。',
  }),
  grammar(7, W7, '「来週会いましょう」と伝えたい', "Let's meet next week.", {
    note_ja: "Let's + 動詞の原形 で「〜しましょう」と誘う。",
  }),
  grammar(7, W7, '「もうすぐ着きます」と伝えたい', "I'll be there soon.", {
    note_ja: '待ち合わせでよく使う一言。',
  }),
  grammar(7, W7, '「今夜は家にいるつもりです」と伝えたい', "I'm going to stay home tonight.", {
    note_ja: '今夜・来週などの近い未来の予定にも going to を使う。',
  }),
  grammar(7, W7, '「手伝いますよ」とその場で申し出たい', "I'll help you.", {
    note_ja: 'その場で決めた申し出には will を使う。',
  }),
  grammar(7, W7, '「来年英語を勉強し続けるつもりです」と伝えたい', "I'm going to keep studying English next year.", {
    note_ja: '長期的な計画にも going to が使える。',
  }),
  grammar(7, W7, '「絶対に間に合いません」と伝えたい', "I won't make it in time.", {
    note_ja: "won't = will not。",
  }),
];

// ------------------------------------------------------------------
// Week 8: 形容詞の比較・つなぎ言葉・総復習
// ------------------------------------------------------------------
const W8 = '比較・つなぎ言葉・総復習';
export const week8: CardContent[] = [
  grammar(8, W8, '「これはあれより大きいです」と比べたい', 'This is bigger than that.', {
    note_ja: '短い形容詞は -er + than で比べる。',
  }),
  grammar(8, W8, '「コーヒーよりお茶の方が好きです」と比べたい', 'I like tea more than coffee.', {
    note_ja: '長い形容詞・一般的な好みは more ~ than。',
  }),
  grammar(8, W8, '「これが一番好きです」と伝えたい', 'I like this one the best.', {
    note_ja: '最上級は the best（一番）。',
  }),
  grammar(8, W8, '「疲れていたので早く帰りました」と理由を伝えたい', 'I was tired, so I went home early.', {
    note_ja: 'so は「だから」と結果をつなぐ。',
  }),
  grammar(8, W8, '「ラーメンは好きですが、少し高いです」と対比を伝えたい', "I like ramen, but it's a little expensive.", {
    note_ja: 'but は「しかし」と対比をつなぐ。',
  }),
  grammar(8, W8, '「疲れていたから早く寝ました」と理由を伝えたい', 'I went to bed early because I was tired.', {
    note_ja: 'because は理由を説明するときに使う。',
  }),
  grammar(8, W8, '「新しいカフェに行って、コーヒーを飲みました」と日記風に伝えたい', 'I went to a new cafe and had a coffee.', {
    note_ja: 'and で動作を2つつなげられる。',
  }),
  grammar(8, W8, '「もっと英語を練習する必要があります」と伝えたい', 'I need to practice English more.', {
    note_ja: 'need to + 動詞の原形 で「〜する必要がある」。',
  }),
  grammar(8, W8, '「少しずつ上手になっています」と伝えたい', "I'm getting better little by little.", {
    note_ja: '2ヶ月の学習の締めくくりにぴったりの一言。',
  }),
  grammar(8, W8, '「今日は本当に良い一日でした」とまとめたい', 'Today was a really good day.', {
    note_ja: '日記の締めくくりによく使う一言。',
  }),
];

export const allCards: CardContent[] = [
  ...week0,
  ...week1,
  ...week2,
  ...week3,
  ...week4,
  ...week5,
  ...week6,
  ...week7,
  ...week8,
];

export const weeks = [
  { week: 0, label: W0, cards: week0 },
  { week: 1, label: W1, cards: week1 },
  { week: 2, label: W2, cards: week2 },
  { week: 3, label: W3, cards: week3 },
  { week: 4, label: W4, cards: week4 },
  { week: 5, label: W5, cards: week5 },
  { week: 6, label: W6, cards: week6 },
  { week: 7, label: W7, cards: week7 },
  { week: 8, label: W8, cards: week8 },
];
