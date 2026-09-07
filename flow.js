// Two deliberate actions; each plays a complete sequence without scrolling.
const consoleRoot = document.querySelector('#demo-console');
consoleRoot.innerHTML = `
<div class="console-header"><div><b>案件 A-214</b><span>入荷ロット 24-0817</span></div><span class="console-status" role="status">人の判断待ち <strong>2件</strong></span></div>
<div class="console-grid">
<section class="console-column" data-stage="drawing" aria-labelledby="drawing-heading">
<header class="column-heading"><span>01</span><h2 id="drawing-heading">図面</h2><i aria-hidden="true">→</i></header>
<div class="console-card"><div class="document-heading"><b>図面指定</b><small>S-204 / Rev.3</small></div>
<div class="console-drawing" role="img" aria-label="図面S-204の部品図。板厚10.0mm、直径20"><div class="drawing-part"></div><span>10.0 mm</span><small>φ20</small></div>
<dl class="console-fields"><div><dt>材質</dt><dd>SUS304</dd></div><div><dt>板厚</dt><dd>10.0 mm</dd></div><div><dt>規格</dt><dd>JIS G4304</dd></div></dl><div class="column-note">照合の基準となる指定</div></div></section>
<section class="console-column" data-stage="certificate" aria-labelledby="certificate-heading">
<header class="column-heading"><span>02</span><h2 id="certificate-heading">証明書</h2><i aria-hidden="true">→</i></header>
<div class="console-card"><div class="document-heading"><b>材料証明書</b><small>LOT-0817.pdf</small></div>
<div class="console-certificate" aria-hidden="true"><span>MATERIAL CERTIFICATE</span><i></i><i></i><i></i><small>LOT-0817</small></div>
<dl class="console-fields"><div class="field-warning"><dt>材質記号</dt><dd>SUSXM7</dd></div><div><dt>板厚</dt><dd>10.0 mm</dd></div><div class="field-missing"><dt>ロット番号</dt><dd>記載なし</dd></div></dl><div class="column-note">記載内容をそのまま照合</div></div></section>
<section class="console-column" data-stage="judgment" aria-labelledby="judgment-heading">
<header class="column-heading"><span>03</span><h2 id="judgment-heading">判定</h2><i aria-hidden="true">→</i></header>
<div class="console-card judgment-card"><div class="document-heading"><b>AI照合結果</b><small>4項目を照合</small></div><div class="match-count"><strong>2<span>件</span></strong><span>人の確認が必要</span></div>
<ul class="result-list"><li><b>材質記号</b><span class="result-tag warning">要確認</span></li><li><b>ロット番号</b><span class="result-tag missing">記載なし</span></li><li><b>板厚</b><span class="result-tag matched">一致</span></li><li><b>規格</b><span class="result-tag matched">一致</span></li></ul><div class="column-note">要確認 1 ＋ 記載なし 1</div></div></section>
<section class="console-column" data-stage="human" aria-labelledby="human-heading">
<header class="column-heading"><span>04</span><h2 id="human-heading">人判断</h2><i aria-hidden="true">→</i></header>
<div class="console-card human-card"><div class="document-heading"><b>確認が必要な2件</b><small>判断待ち</small></div>
<article class="review-item"><div><b>材質記号</b><span>未確認</span></div><p>SUS304 ↔ SUSXM7</p><small>担当：山本</small></article>
<article class="review-item"><div><b>ロット番号</b><span>未確認</span></div><p>証明書に記載なし</p><small>担当：未割当</small></article>
<div class="evidence-record"><b>確認根拠</b><span>未記録</span><small>確認内容・参照資料</small></div><div class="column-note">人の判断と根拠を残す</div></div></section>
<section class="console-column" data-stage="approval" aria-labelledby="approval-heading">
<header class="column-heading"><span>05</span><h2 id="approval-heading">承認</h2></header>
<div class="console-card approval-pending"><div class="document-heading"><b>承認記録</b><small>案件 A-214</small></div>
<div class="pending-status"><span aria-hidden="true">…</span><b>確認完了待ち</b><small>確認根拠が揃ってから承認</small></div>
<dl class="console-fields"><div><dt>人の確認</dt><dd>0 / 2件</dd></div><div><dt>根拠記録</dt><dd>未記録</dd></div><div><dt>承認</dt><dd>未承認</dd></div></dl>
<div class="standard-pending"><span>次の工程</span><b>基準改定へ反映</b><small>承認後に検査基準を見直す</small></div></div></section>
</div>
<div class="console-summary"><span><i></i>材質記号とロット番号を確認待ち</span><span>一致 2件 ／ 人判断 2件 ／ 承認待ち</span></div>`;

const columns = [...consoleRoot.querySelectorAll('.console-column')];
const originalCards = columns.map(column => column.querySelector('.console-card').innerHTML);
const status = consoleRoot.querySelector('.console-status');
const summary = consoleRoot.querySelector('.console-summary');
summary.innerHTML = '<div class="flow-guidance"><strong id="flow-heading">まずは、図面と証明書を照合してみましょう</strong><span id="flow-message" role="status" aria-live="polite"></span></div><div class="playback-actions"><span id="flow-progress"></span><button class="btn btn-primary" id="flow-action" type="button" aria-describedby="flow-message">照合を開始</button></div>';
consoleRoot.querySelector('.console-header').after(summary);
const message = document.querySelector('#flow-message');
const action = document.querySelector('#flow-action');
const progress = document.querySelector('#flow-progress');
let phase = 'idle';
let run = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const delay = ms => new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 0 : ms));

function setState(value, label) {
  consoleRoot.dataset.state = value;
  status.textContent = ({idle:'照合前',drawing:'図面を確認中',certificate:'証明書を確認中',judgment:'照合中',review:'人の判断待ち 2件',human:'確認内容を反映中',evidence:'根拠を記録済み',approved:'承認済み',complete:'基準 v2.1 へ反映済み'})[value] || label;
  message.textContent = label;
  document.querySelector('#flow-heading').textContent = value === 'idle' ? 'まずは、図面と証明書を照合してみましょう' : value === 'review' ? '次に、2件の確認内容を承認へつなぎます' : value === 'complete' ? '確認から基準改定まで完了しました' : '自動で進んでいます。そのままご覧ください';
}
function reveal(index) {
  const column = columns[index];
  column.querySelector('.console-card').innerHTML = originalCards[index];
  column.classList.remove('unrevealed');
  columns.forEach((item, i) => item.classList.toggle('current-stage', i === index));
}
function resetFlow() {
  run++;
  phase = 'idle';
  const pendingLabels = ['図面を表示', '証明書を表示', '照合後に差分を表示', '確認が必要な項目を表示', '確認根拠を承認に記録'];
  const pendingCopy = ['', '', '一致・要確認・記載なしに分類します', '要確認の項目だけを担当者へ渡します', '人の確認後、根拠を残して承認します'];
  columns.forEach((column, index) => {
    column.classList.add('unrevealed');
    column.classList.remove('current-stage', 'stage-complete');
    column.querySelector('.console-card').innerHTML = index < 2 ? originalCards[index] : `<div class="stage-placeholder"><b>${pendingLabels[index]}</b><small>${pendingCopy[index]}</small></div>`;
    if (index < 2) column.classList.remove('unrevealed');
  });
  setState('idle', '「照合を開始」を押すと、差分の判定と要確認2件の抽出まで自動で進みます。');
  action.textContent = '照合を開始';
  action.disabled = false;
  progress.textContent = 'まずはここから · 操作 1 / 2';
}
async function playMatch() {
  phase = 'playing';
  action.disabled = true;
  action.textContent = '照合中…';
  const currentRun = ++run;
  const steps = [
    [0, 'drawing', '図面 S-204 を表示'],
    [1, 'certificate', '材料証明書 LOT-0817 を表示'],
    [2, 'judgment', '4項目を照合。一致 2件・人の確認が必要 2件']
  ];
  for (const [index, state, label] of steps) {
    if (currentRun !== run) return;
    reveal(index);
    setState(state, label);
    await delay(index === 2 ? 1400 : 1000);
  }
  if (currentRun !== run) return;
  reveal(3);
  reveal(4);
  columns[4].classList.remove('current-stage');
  columns[3].classList.add('current-stage');
  setState('review', '要確認 2件：材質記号とロット番号を人へ');
  phase = 'review';
  action.textContent = '確認を進める';
  action.disabled = false;
  progress.textContent = '操作 2 / 2';
}
async function playReview() {
  phase = 'playing';
  action.disabled = true;
  action.textContent = '確認中…';
  const currentRun = ++run;
  setState('human', '担当者の確認内容を反映しています');
  await delay(1300);
  if (currentRun !== run) return;
  columns[3].querySelectorAll('.review-item>div>span').forEach(label => label.textContent = '確認済み');
  columns[3].querySelector('.document-heading small').textContent = '2件とも確認済み';
  columns[2].querySelector('.match-count>span').textContent = '人が確認した項目';
  columns[3].querySelectorAll('.review-item small')[1].textContent = '記載不足を確認・基準改定へ';
  columns[3].querySelector('.evidence-record').innerHTML = '<b>確認根拠</b><span>記録済み</span><small>図面 S-204・材料証明書<br>材質記号は仕入先へ照会<br>ロット番号の記載不足を記録</small>';
  columns[4].querySelectorAll('dd')[0].textContent = '2 / 2件';
  columns[4].querySelectorAll('dd')[1].textContent = '記録済み';
  setState('evidence', '人の判断と確認根拠を記録しました');
  await delay(1500);
  if (currentRun !== run) return;
  columns[3].classList.remove('current-stage');
  columns[4].classList.add('current-stage');
  columns[4].querySelector('.pending-status').innerHTML = '<span aria-hidden="true">✓</span><b>承認済み</b><small>確認者：山本 ／ 根拠を承認記録へ</small>';
  columns[4].querySelectorAll('dd')[2].textContent = '承認済み';
  setState('approved', '確認根拠を残して承認しました');
  await delay(1400);
  if (currentRun !== run) return;
  columns[4].querySelector('.standard-pending').innerHTML = '<span>基準改定 v2.1 ／ 佐藤 承認済み</span><b>ロット番号：任意 → 必須</b><small>適用日 2024/09/01</small>';
  columns.forEach(column => { column.classList.remove('current-stage'); column.classList.add('stage-complete'); });
  setState('complete', '完了：確認根拠を承認に残し、基準 v2.1 へ反映');
  phase = 'complete';
  progress.textContent = '2 / 2 完了';
  action.textContent = 'もう一度見る';
  action.disabled = false;
}
action.addEventListener('click', () => {
  if (phase === 'idle') playMatch();
  else if (phase === 'review') playReview();
  else if (phase === 'complete') { resetFlow(); playMatch(); }
});
window.addEventListener('pagehide', () => { run++; });
window.addEventListener('pageshow', event => { if (event.persisted) resetFlow(); });
resetFlow();

