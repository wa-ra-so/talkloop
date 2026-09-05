// カードの型定義
// kind: 'phrase' = 日常フレーズ（丸ごと覚える）, 'grammar' = 文法パターン練習
export type CardKind = 'phrase' | 'grammar';

export interface CardContent {
  id: string;
  week: number; // 0 = コアフレーズ, 1-8 = 文法週
  topic: string; // 表示用トピック名
  kind: CardKind;
  prompt_ja: string; // 日本語の状況・指示
  cloze?: string; // 文法ドリル用の空所文（英語, ___ が空所）
  target_en: string; // お手本の正解（英文 or フレーズ）
  hint_ja?: string; // grammar系の初回学習時だけ出す「知っている形」のヒント
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
// Week 0: 生活で毎日使えるコア・フレーズ 30
// ------------------------------------------------------------------
const W0 = '会話の基本フレーズ';
export const week0: CardContent[] = [
  // 挨拶・雑談
  phrase(0, W0, '「はじめまして」と言いたい', 'Nice to meet you.'),
  phrase(0, W0, '「お元気ですか」とカジュアルに聞きたい', 'How have you been?'),
  phrase(0, W0, '相手の仕事を尋ねたい', 'What do you do?'),
  phrase(0, W0, '出身を尋ねたい', 'Where are you from?'),
  phrase(0, W0, '「最近どう？」と聞きたい', "What's new with you?"),
  // 買い物・注文
  phrase(0, W0, 'カフェでコーヒーを注文したい', 'Can I get a coffee, please?'),
  phrase(0, W0, '値段を尋ねたい', 'How much is this?'),
  phrase(0, W0, '試着したいと伝えたい', 'Can I try this on?'),
  phrase(0, W0, 'カードで払えるか確認したい', 'Do you take credit cards?'),
  phrase(0, W0, '持ち帰りにしたいと伝えたい', 'Can I get this to go?'),
  // 道案内・移動
  phrase(0, W0, '道を尋ねたい（駅への行き方）', 'Excuse me, how do I get to the station?'),
  phrase(0, W0, '「そこの角を左に曲がってください」と案内したい', 'Turn left at the corner.'),
  phrase(0, W0, 'ここまでどれくらいかかるか聞きたい', 'How long does it take from here?'),
  phrase(0, W0, 'このバスが正しいか確認したい', 'Does this bus go to downtown?'),
  phrase(0, W0, 'タクシーで行き先を伝えたい', 'Could you take me to this address?'),
  // 誘う・予定を決める
  phrase(0, W0, '今週末の予定を聞きたい', 'Are you free this weekend?'),
  phrase(0, W0, 'ランチに誘いたい', 'Do you want to grab lunch?'),
  phrase(0, W0, '別の日を提案したい', 'How about next Friday instead?'),
  phrase(0, W0, '時間と場所を確認したい', 'What time and where should we meet?'),
  phrase(0, W0, '予定が変わったことを伝えたい', 'Something came up, can we reschedule?'),
  // 意見・相槌
  phrase(0, W0, '相手に同意したい', 'I think so too.'),
  phrase(0, W0, '相手の言いたいことを確認したい', 'What do you mean?'),
  phrase(0, W0, '自分の考えを控えめに伝えたい', 'I guess it depends.'),
  phrase(0, W0, '「それは良い考えですね」と言いたい', "That's a good point."),
  phrase(0, W0, '話を整理して確認したい', 'So basically, you mean...?'),
  // 感情・トラブル対応
  phrase(0, W0, 'もう一度言ってほしいと頼みたい', 'Could you say that again?'),
  phrase(0, W0, 'ゆっくり話してほしいと頼みたい', 'Could you speak a little slower?'),
  phrase(0, W0, '感謝を伝えたい', 'I really appreciate it.'),
  phrase(0, W0, '謝りたい（軽いミス）', 'Sorry about that, my bad.'),
  phrase(0, W0, '大丈夫だと相手を安心させたい', "Don't worry, it's fine."),
];

// ------------------------------------------------------------------
// Week 1: 現在完了 vs 過去形（日常の出来事）
// ------------------------------------------------------------------
const W1 = '現在完了 vs 過去形';
export const week1: CardContent[] = [
  grammar(1, W1, '「先週その映画を見た」と、過去のいつかを伝えたい', 'I watched that movie last week.', {
    hint_ja: 'すでに知っている形: "I watched that movie."',
    note_ja: '過去形は「いつ起きたか」がはっきりしている出来事に使う。last week などの過去の目印とセット。',
  }),
  grammar(1, W1, '「その映画はもう見た」と、経験として伝えたい', "I've already watched that movie.", {
    hint_ja: '知っている形: "I watched that movie."',
    note_ja: '現在完了 (have + 過去分詞) は「今につながる経験・結果」を表す。いつ見たかは重要でない。',
  }),
  grammar(1, W1, '「日本に行ったことがある」と経験を伝えたい', "I've been to Japan.", {
    cloze: "I ___ ___ to Japan.",
    note_ja: '経験を表す現在完了の定番: have been to〜。',
  }),
  grammar(1, W1, '「まだ宿題を終えていない」と伝えたい', "I haven't finished my homework yet.", {
    cloze: "I ___ finished my homework yet.",
    note_ja: '未完了・未達成を表すときは haven\'t/hasn\'t + 過去分詞 + yet。',
  }),
  grammar(1, W1, '「たった今着いた」と伝えたい', "I've just arrived.", {
    hint_ja: '知っている形: "I arrived." (過去形)',
    note_ja: 'just, already, yet は現在完了と相性がいい合図語。',
  }),
  grammar(1, W1, '「昨日空港に着いた」と、時を明示して伝えたい', 'I arrived at the airport yesterday.', {
    hint_ja: '知っている形: "I\'ve just arrived."',
    note_ja: 'yesterday など具体的な過去の時点がある場合は過去形を使う。',
  }),
  grammar(1, W1, '「このレストランに来るのは3回目」と伝えたい', "I've been to this restaurant three times.", {
    note_ja: '回数 (three times) を伴う経験も現在完了でよく表す。',
  }),
  grammar(1, W1, '「先月、新しい仕事を始めた」と伝えたい', 'I started a new job last month.', {
    note_ja: '過去の起点がはっきりしているので過去形。',
  }),
  grammar(1, W1, '「ずっとこの会社で働いている」と、今も続く状態を伝えたい', "I've worked here for three years.", {
    cloze: 'I ___ here for three years.',
    note_ja: '現在完了 + for/since は「過去から今まで続く」ことを表す。',
  }),
  grammar(1, W1, '「彼にはまだ会ったことがない」と伝えたい', "I haven't met him yet.", {
    note_ja: '否定形 + yet で「まだ〜していない」。',
  }),
  grammar(1, W1, '「その本はもう読んだ？」と相手に聞きたい', 'Have you read that book yet?', {
    note_ja: '相手の経験・完了を尋ねるときは Have you + 過去分詞 ...yet?',
  }),
  grammar(1, W1, '「先週末、その本を読んだ」と時を明示して答えたい', 'I read that book last weekend.', {
    note_ja: '相手が「いつ」を尋ねたら答えは過去形になる。',
  }),
];

// ------------------------------------------------------------------
// Week 2: 冠詞・可算/不可算（買い物の場面）
// ------------------------------------------------------------------
const W2 = '冠詞と可算・不可算名詞';
export const week2: CardContent[] = [
  grammar(2, W2, '「りんごを1つ買った」と伝えたい', 'I bought an apple.', {
    note_ja: '母音で始まる可算名詞の単数には a ではなく an。',
  }),
  grammar(2, W2, '「パンを少し買った」と、不可算名詞で伝えたい', 'I bought some bread.', {
    hint_ja: '知っている形: "I bought an apple."',
    note_ja: 'bread は不可算名詞なので a/an は付けず some を使う。',
  }),
  grammar(2, W2, '「水を1杯もらえますか」と数えられない物を数える表現で頼みたい', 'Can I get a glass of water?', {
    note_ja: '不可算名詞は a glass of / a cup of などの単位で数える。',
  }),
  grammar(2, W2, '「その店（前に話題にした店）は閉まっていた」と特定して伝えたい', 'The store was closed.', {
    cloze: '___ store was closed.',
    note_ja: 'お互いにどの店か分かっている時は the を使う。',
  }),
  grammar(2, W2, '「（一般的に）店は9時に開く」と伝えたい', 'A store usually opens at nine.', {
    hint_ja: '知っている形: "The store was closed."',
    note_ja: '特定しない一般論では a/an、または無冠詞の複数形を使う。',
  }),
  grammar(2, W2, '「アドバイスを少しもらえますか」と、不可算名詞で頼みたい', 'Can you give me some advice?', {
    note_ja: 'advice, information, furniture などは不可算名詞の代表例。',
  }),
  grammar(2, W2, '「新しい靴を買った」と複数形で伝えたい', 'I bought some new shoes.', {
    note_ja: 'shoes, pants など対になるものは常に複数形。',
  }),
  grammar(2, W2, '「お金がほとんどない」と伝えたい', "I don't have much money.", {
    note_ja: '不可算名詞の量には much/little を使う（many/few は可算名詞用）。',
  }),
  grammar(2, W2, '「友達が数人いる」と伝えたい', 'I have a few friends here.', {
    hint_ja: '知っている形: "I don\'t have much money."',
    note_ja: '可算名詞の少なさには a few、不可算名詞には a little。',
  }),
  grammar(2, W2, '「時間があまりない」と伝えたい', "I don't have much time.", {
    note_ja: 'time は不可算名詞として扱う（「回数」の意味では可算にもなる）。',
  }),
];

// ------------------------------------------------------------------
// Week 3: 前置詞・道案内と待ち合わせ
// ------------------------------------------------------------------
const W3 = '前置詞（時間・場所）';
export const week3: CardContent[] = [
  grammar(3, W3, '「3時に会おう」と時刻を伝えたい', "Let's meet at three.", {
    note_ja: '時刻には at を使う（at three, at noon）。',
  }),
  grammar(3, W3, '「月曜日に会おう」と曜日を伝えたい', "Let's meet on Monday.", {
    hint_ja: '知っている形: "Let\'s meet at three."',
    note_ja: '曜日・日付には on を使う（on Monday, on July 1st）。',
  }),
  grammar(3, W3, '「7月に日本に行く」と月を伝えたい', "I'm going to Japan in July.", {
    note_ja: '月・年・季節には in を使う（in July, in 2026, in summer）。',
  }),
  grammar(3, W3, '「駅の前で待ってて」と場所を伝えたい', 'Wait for me in front of the station.', {
    note_ja: 'in front of 〜 は「〜の前で」。',
  }),
  grammar(3, W3, '「カフェの隣に本屋がある」と伝えたい', "There's a bookstore next to the cafe.", {
    note_ja: 'next to 〜 は「〜の隣に」。',
  }),
  grammar(3, W3, '「信号のところを右に曲がって」と伝えたい', 'Turn right at the traffic light.', {
    note_ja: '交差点や特定の地点には at を使う。',
  }),
  grammar(3, W3, '「2つ目の角を過ぎたところにある」と伝えたい', "It's past the second corner.", {
    note_ja: 'past 〜 は「〜を過ぎて」。',
  }),
  grammar(3, W3, '「郵便局とスーパーの間にある」と伝えたい', "It's between the post office and the supermarket.", {
    note_ja: 'between A and B は「AとBの間」。',
  }),
  grammar(3, W3, '「歩いて10分くらい」とかかる時間を伝えたい', "It's about ten minutes on foot.", {
    note_ja: '手段には by/on を使い分ける（by car, by train, on foot）。',
  }),
  grammar(3, W3, '「電車で来た」と手段を伝えたい', 'I came by train.', {
    hint_ja: '知っている形: "It\'s about ten minutes on foot."',
    note_ja: '乗り物には by、徒歩だけ on foot になる例外。',
  }),
];

// ------------------------------------------------------------------
// Week 4: 助動詞 would/could/might/should（誘う・断る）
// ------------------------------------------------------------------
const W4 = '助動詞（誘い・提案・断り）';
export const week4: CardContent[] = [
  grammar(4, W4, '「一緒に映画を見に行きませんか」と丁寧に誘いたい', 'Would you like to see a movie together?', {
    note_ja: 'Would you like to 〜? は丁寧な誘い方。',
  }),
  grammar(4, W4, '「手伝ってもらえますか」と丁寧に頼みたい', 'Could you help me with this?', {
    hint_ja: '知っている形: "Would you like to see a movie?"',
    note_ja: 'Could you 〜? は Can you より丁寧な依頼。',
  }),
  grammar(4, W4, '「今夜は雨が降るかもしれない」と可能性を伝えたい', 'It might rain tonight.', {
    note_ja: 'might は50%くらいの弱い可能性を表す。',
  }),
  grammar(4, W4, '「もっと早く出発した方がいいよ」と助言したい', 'You should leave earlier.', {
    note_ja: 'should は「〜すべき」というアドバイス・提案。',
  }),
  grammar(4, W4, '「せっかくだけど今回は遠慮しておく」と丁寧に断りたい', "I'd love to, but I can't make it this time.", {
    note_ja: "I'd love to, but... は好意的に断る定番表現。",
  }),
  grammar(4, W4, '「代わりに来週はどう？」と代案を出したい', 'Could we do next week instead?', {
    note_ja: '断ったあとに代案を出すときも Could we 〜? が丁寧。',
  }),
  grammar(4, W4, '「もし時間があれば行きたい」と条件付きの希望を伝えたい', 'I would go if I had time.', {
    note_ja: 'would は現実的でない仮定の帰結にも使う（次週の仮定法につながる）。',
  }),
  grammar(4, W4, '「静かにしていただけますか」とお願いしたい', 'Would you mind keeping it down?', {
    note_ja: 'Would you mind 〜ing? は非常に丁寧な依頼表現。',
  }),
  grammar(4, W4, '「多分間に合わないと思う」と弱い予測をしたい', 'I might not make it in time.', {
    note_ja: 'might not は「〜しないかもしれない」という弱い否定的予測。',
  }),
  grammar(4, W4, '「予約しておくべきだったね」と過去の後悔を伝えたい', 'We should have made a reservation.', {
    note_ja: 'should have + 過去分詞 は「〜すべきだった」という過去の後悔。',
  }),
];

// ------------------------------------------------------------------
// Week 5: 関係詞・分詞（趣味・旅行の話）
// ------------------------------------------------------------------
const W5 = '関係詞・分詞（趣味・旅行）';
export const week5: CardContent[] = [
  grammar(5, W5, '「京都で撮った写真を見せたい」と伝えたい', 'This is a photo I took in Kyoto.', {
    note_ja: '関係代名詞（that/which）は省略できることが多い口語表現。',
  }),
  grammar(5, W5, '「ラーメンが好きな友達がいる」と伝えたい', 'I have a friend who loves ramen.', {
    hint_ja: '知っている形: "This is a photo I took in Kyoto."',
    note_ja: '人を説明するときは who を使う: a friend who loves ramen.',
  }),
  grammar(5, W5, '「駅の近くに住んでいる人を知っている」と伝えたい', 'I know someone who lives near the station.', {
    note_ja: 'who + 動詞 で「〜する人」を後ろから説明する。',
  }),
  grammar(5, W5, '「電車で眠っている男の人が見えた」と伝えたい（分詞）', 'I saw a man sleeping on the train.', {
    note_ja: '現在分詞 (sleeping) は「〜している」状態を後ろから説明する。',
  }),
  grammar(5, W5, '「日本語で書かれた本を読んでいる」と伝えたい（分詞）', "I'm reading a book written in Japanese.", {
    hint_ja: '知っている形: "I saw a man sleeping on the train."',
    note_ja: '過去分詞 (written) は「〜された」という受け身の意味で名詞を説明する。',
  }),
  grammar(5, W5, '「初めて行った国はタイだった」と伝えたい', 'Thailand was the first country I visited.', {
    note_ja: '関係詞節が省略された形。日常会話ではこの省略形が自然。',
  }),
  grammar(5, W5, '「一緒に旅行した友達が結婚した」と伝えたい', 'The friend I traveled with got married.', {
    note_ja: '前置詞が最後に残るパターン（口語で自然）: the friend I traveled with.',
  }),
  grammar(5, W5, '「登山が好きな同僚がいる」と伝えたい', 'I have a coworker who loves hiking.', {
    note_ja: 'who + 趣味の動詞で人を紹介する形は自己紹介でも便利。',
  }),
  grammar(5, W5, '「カフェで働いている女性を知っている」と伝えたい（分詞）', 'I know a woman working at that cafe.', {
    note_ja: '現在分詞 working は「働いている」という進行中の状態を表す。',
  }),
  grammar(5, W5, '「日本製の時計を買った」と伝えたい（分詞）', 'I bought a watch made in Japan.', {
    note_ja: '過去分詞 made in Japan で「〜製の」を表す定番表現。',
  }),
];

// ------------------------------------------------------------------
// Week 6: 仮定法（もしも〜だったら）
// ------------------------------------------------------------------
const W6 = '仮定法（現実的でない仮定）';
export const week6: CardContent[] = [
  grammar(6, W6, '「時間があればジムに行くのに」と現在の事実に反する仮定をしたい', "If I had time, I would go to the gym.", {
    note_ja: '現在の事実に反する仮定: If + 過去形, ... would + 動詞の原形。',
  }),
  grammar(6, W6, '「宝くじが当たったら世界一周するのに」と非現実的な仮定をしたい', "If I won the lottery, I would travel the world.", {
    hint_ja: '知っている形: "If I had time, I would go to the gym."',
    note_ja: '起こりそうにない仮定にも同じ形 (If + 過去形, would +原形) を使う。',
  }),
  grammar(6, W6, '「もっと英語が話せたらいいのに」と現状への願望を伝えたい', 'I wish I could speak English better.', {
    note_ja: 'I wish + 過去形/could は「今そうでない」ことへの願望。',
  }),
  grammar(6, W6, '「あの時電車に乗り遅れなかったら、間に合っていたのに」と過去の仮定をしたい', "If I hadn't missed the train, I would have made it.", {
    note_ja: '過去の事実に反する仮定: If + had + 過去分詞, ... would have + 過去分詞。',
  }),
  grammar(6, W6, '「もっと早く伝えていればよかった」と過去への後悔を伝えたい', 'I wish I had told you earlier.', {
    note_ja: 'I wish + had + 過去分詞 は過去の後悔を表す。',
  }),
  grammar(6, W6, '「彼があなたの立場だったらどうすると思う？」と相手に尋ねたい', 'What would you do if you were in his shoes?', {
    note_ja: 'If I were you のように be動詞は仮定法で were になりやすい。',
  }),
  grammar(6, W6, '「もし雨が降ったら、家にいます」と現実的にありうる仮定をしたい', "If it rains, I'll stay home.", {
    hint_ja: '知っている形: "If I won the lottery, I would travel the world."',
    note_ja: '現実的にありうる条件は If + 現在形, will + 原形（仮定法とは形が違う）。',
  }),
  grammar(6, W6, '「もっとお金があったら新しい家に引っ越すのに」と伝えたい', "If I had more money, I would move to a new place.", {
    note_ja: '日常会話で一番使う仮定法パターンの一つ。',
  }),
  grammar(6, W6, '「彼女が来ればいいのに」と現状への願望を伝えたい', 'I wish she could come.', {
    note_ja: '相手に関する願望にも I wish + could を使える。',
  }),
  grammar(6, W6, '「もし生まれ変わったらパイロットになりたい」と伝えたい', "If I were born again, I'd want to be a pilot.", {
    note_ja: "I'd = I would の短縮形。会話ではよく縮められる。",
  }),
];

// ------------------------------------------------------------------
// Week 7: 受動態・使役・話法（ニュースを伝える）
// ------------------------------------------------------------------
const W7 = '受動態・使役・話法';
export const week7: CardContent[] = [
  grammar(7, W7, '「その店は先月閉店した」と、行為者より事実を伝えたい（受動態）', 'The store was closed down last month.', {
    note_ja: '誰がやったかより「何が起きたか」が大事な時は受動態 (be + 過去分詞)。',
  }),
  grammar(7, W7, '「このアプリは世界中で使われている」と伝えたい（受動態）', 'This app is used all over the world.', {
    hint_ja: '知っている形: "The store was closed down last month."',
    note_ja: '現在の一般的事実にも受動態はよく使う: is/are + 過去分詞。',
  }),
  grammar(7, W7, '「髪を切ってもらった」と使役の表現で伝えたい', 'I had my hair cut.', {
    note_ja: 'have + 目的語 + 過去分詞 は「〜してもらう」という使役表現。',
  }),
  grammar(7, W7, '「携帯を修理してもらう必要がある」と伝えたい（使役）', 'I need to get my phone fixed.', {
    note_ja: 'get + 目的語 + 過去分詞 も have と同じ使役の意味で使える。',
  }),
  grammar(7, W7, '「彼は明日来ると言っていた」と、人の発言を伝えたい（話法）', 'He said he would come tomorrow.', {
    note_ja: '話法では will → would のように時制が一つ過去にずれる。',
  }),
  grammar(7, W7, '「彼女は疲れていると言った」と伝えたい（話法）', 'She said she was tired.', {
    hint_ja: '知っている形: "He said he would come tomorrow."',
    note_ja: 'is/am → was のように、話法では現在形も過去形にずれる。',
  }),
  grammar(7, W7, '「彼は私にすぐ来るように言った」と伝えたい（話法・命令）', 'He told me to come right away.', {
    note_ja: '命令の伝聞は tell + 人 + to + 動詞の原形。',
  }),
  grammar(7, W7, '「そのニュースはみんなに知られている」と伝えたい（受動態）', 'The news is known to everyone.', {
    note_ja: 'be known to 〜 は「〜に知られている」という定番表現。',
  }),
  grammar(7, W7, '「その報告書は来週までに提出されなければならない」と伝えたい（受動態＋助動詞）', 'The report must be submitted by next week.', {
    note_ja: '助動詞 + be + 過去分詞 で「〜されなければならない」を表す。',
  }),
  grammar(7, W7, '「彼女は元気か聞かれた」と伝えたい（話法・疑問文）', 'She was asked if she was doing well.', {
    note_ja: '疑問文の話法は if/whether を使って平叙文の語順にする。',
  }),
];

// ------------------------------------------------------------------
// Week 8: 総復習週（日記を書くように、これまでの文法を混ぜて使う）
// ------------------------------------------------------------------
const W8 = '総復習：英語で日記を書く';
export const week8: CardContent[] = [
  grammar(8, W8, '「今日は新しいカフェに行ってきた」と日記風に伝えたい', 'I went to a new cafe today.', { note_ja: '過去形の基本の復習。' }),
  grammar(8, W8, '「そこには前から行ってみたかった」と現在完了で伝えたい', "I'd wanted to go there for a while.", { note_ja: '過去完了 (had + 過去分詞) で「その時点までの状態」を表す応用形。' }),
  grammar(8, W8, '「コーヒーは友達に勧められた」と受動態で伝えたい', 'The coffee was recommended by a friend.', { note_ja: '受動態の復習: be動詞 + 過去分詞 + by。' }),
  grammar(8, W8, '「もし混んでいたら別の店に行っていたと思う」と仮定法で伝えたい', "If it had been crowded, I would have gone somewhere else.", { note_ja: '仮定法過去完了の復習。' }),
  grammar(8, W8, '「一緒に行った友達は写真が趣味だ」と関係詞で伝えたい', 'The friend I went with loves photography.', { note_ja: '関係詞（省略形）の復習。' }),
  grammar(8, W8, '「また今度行くべきだと思う」と助動詞で伝えたい', 'I think we should go again sometime.', { note_ja: '助動詞 should の復習。' }),
  grammar(8, W8, '「店員さんは日本語を話せると言っていた」と話法で伝えたい', 'The staff said they could speak Japanese.', { note_ja: '話法（can→could）の復習。' }),
  grammar(8, W8, '「窓際に座っている人たちが楽しそうだった」と分詞で伝えたい', 'The people sitting by the window looked happy.', { note_ja: '現在分詞の後置修飾の復習。' }),
  grammar(8, W8, '「今度は友達を誘ってみようと思う」と伝えたい', "Next time, I'll invite a friend along.", { note_ja: '未来の意志 will の自然な使い方。' }),
  grammar(8, W8, '「全体的にすごく良い一日だった」とまとめたい', 'Overall, it was a really good day.', { note_ja: '日記の締めくくりによく使う一言。' }),
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
