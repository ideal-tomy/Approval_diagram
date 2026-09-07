const screens = {
  match: { kicker:'MATCH', title:'図面と証明書を、同じ画面で照合する。', html:`<div class="product-bar"><span>案件 A-214 / 入荷ロット 24-0817</span><span class="detail-badge warn">判断待ち 2件</span></div><div class="match-workspace"><div class="evidence-panel"><div class="panel-title"><b>図面指定</b><span>S-204 / Rev.3</span></div><div class="evidence-drawing"><div class="drawing-part"></div><span class="measure m1">10.0 mm</span><span class="measure m2">φ20</span></div><div class="evidence-list"><p><span>材質</span><b>SUS304</b></p><p><span>板厚</span><b>10.0 mm</b></p><p><span>規格</span><b>JIS G4304</b></p></div></div><div class="evidence-panel"><div class="panel-title"><b>材料証明書</b><span>LOT-0817.pdf</span></div><div class="certificate-preview"><span></span><span></span><span></span><span class="short"></span></div><div class="evidence-list"><p><span>材質記号</span><b class="warn">SUSXM7 <small>要確認</small></b></p><p><span>板厚</span><b class="ok">10.0 mm</b></p><p><span>ロット番号</span><b class="missing">記載なし</b></p></div></div></div><div class="decision-strip"><b>AI照合結果</b><span class="detail-badge ok">一致 2</span><span class="detail-badge warn">要確認 1</span><span class="detail-badge missing">記載なし 1</span><button class="btn btn-primary">確認を記録 <span>→</span></button></div>` },
  hold: { kicker:'HOLD LIST', title:'人が見るべき項目だけを、保留に残す。', html:`<div class="product-bar"><span>保留一覧 / 更新 14:08</span><span class="detail-badge warn">未処理 2件</span></div><div class="hold-layout"><aside class="hold-nav"><b>受入検査</b><span class="selected">判断待ち <strong>2</strong></span><span>自動確定 <strong>2</strong></span><span>処理済み <strong>18</strong></span></aside><div class="hold-table"><div class="hold-row hold-head"><span>項目</span><span>対象</span><span>状態</span><span>担当</span></div><div class="hold-row"><span><b>材質記号</b><small>図面との差異</small></span><span>A-214 / 24-0817</span><span class="detail-badge warn">要確認</span><span>山本</span></div><div class="hold-row"><span><b>ロット番号</b><small>証明書に記載なし</small></span><span>A-214 / 24-0817</span><span class="detail-badge missing">記載なし</span><span>未割当</span></div></div></div><div class="queue-note"><span>人の判断が必要な項目だけを残しています</span><button class="btn btn-secondary">担当者を割り当てる</button></div>` },
  approval: { kicker:'APPROVAL RECORD', title:'確認した根拠を、承認記録として残す。', html:`<div class="product-bar"><span>承認記録 / A-214 / 24-0817</span><span class="detail-badge ok">承認済み</span></div><div class="approval-layout"><div class="approval-summary"><div class="summary-avatar">山</div><h3>山本 恒一</h3><p>品質保証 / 2024.08.19 14:08</p><div class="approval-stamp">✓ 承認済み</div><button class="btn btn-primary">承認履歴を出力 <span>→</span></button></div><div class="approval-timeline"><h3>確認の履歴</h3><div class="timeline-item done"><i>✓</i><div><b>自動照合が完了</b><small>一致 2 / 要確認 1 / 記載なし 1</small></div></div><div class="timeline-item done"><i>✓</i><div><b>資料を確認</b><small>図面 S-204、材料証明書を参照</small></div></div><div class="timeline-item done"><i>✓</i><div><b>コメントを追加</b><small>材質記号は仕入先へ照会</small></div></div></div><div class="approval-evidence"><h3>添付根拠</h3><span>▧ 図面 S-204 / Rev.3</span><span>▧ LOT-0817.pdf</span><span>▧ 照会メール.msg</span></div></div>` },
  standard: { kicker:'STANDARD UPDATE', title:'見つかった不足を、次回の検査基準へ戻す。', html:`<div class="product-bar"><span>検査基準改定 / SUS系材料証明書</span><span class="detail-badge ok">v2.1 承認済み</span></div><div class="standard-layout"><div class="version-card"><p class="eyebrow">BEFORE</p><h3>チェック項目 v2.0</h3><p>材質記号　　必須</p><p>板厚　　　　必須</p><p class="muted-line">ロット番号　任意</p></div><div class="version-arrow">→</div><div class="version-card updated"><p class="eyebrow">AFTER</p><h3>チェック項目 v2.1</h3><p>材質記号　　必須</p><p>板厚　　　　必須</p><p class="added-line">ロット番号　必須 <small>追加</small></p></div></div><div class="standard-footer"><div><b>改定理由</b><span>証明書へのロット番号記載なしを再発防止へ反映</span></div><div><b>適用日</b><span>2024/09/01　/　承認者：佐藤</span></div><button class="btn btn-primary">基準を確認 <span>→</span></button></div>` }
};
const detail = document.querySelector('#screen-detail');
const content = document.querySelector('#detail-content');
const tabs = [...document.querySelectorAll('[role="tab"][data-screen]')];
const screenImages = { match: '01.png', hold: '02.png', approval: '03.png', standard: '04.png' };
function renderScreen(requested, updateHistory = false) {
  if (!detail || !content) return;
  const key = Object.hasOwn(screens, requested) ? requested : 'match';
  const selectedScreen = screens[key];
  document.querySelector('#detail-kicker').textContent = selectedScreen.kicker;
  document.querySelector('#detail-title').textContent = selectedScreen.title;
  content.replaceChildren();
  const image = document.createElement("img");
  image.className = "actual-screen";
  image.src = `images/${screenImages[key]}`;
  image.alt = selectedScreen.title;
  content.append(image);
  // These existing mock controls have no actions yet.
  content.querySelectorAll('button').forEach(button => { button.disabled = true; });
  tabs.forEach(tab => {
    const active = tab.dataset.screen === key;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  if (tabs.length) detail.setAttribute('aria-labelledby', `tab-${key}`);
  const source = document.querySelector('#source-screen');
  if (source) source.href = `images/${screenImages[key]}`;
  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set('screen', key);
    history.pushState(null, '', url);
  }
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => renderScreen(tab.dataset.screen, true));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus({ preventScroll: true });
    renderScreen(tabs[next].dataset.screen, true);
  });
});
window.addEventListener('popstate', () => renderScreen(new URLSearchParams(location.search).get('screen')));
renderScreen(new URLSearchParams(location.search).get('screen'));

