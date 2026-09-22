const TABS = {
  match: "照合",
  hold: "保留一覧",
  approval: "承認",
  standard: "基準改定",
};

const matchHtml = `
  <div class="ap-card">
    <div class="ap-pair">
      <section>
        <p class="ap-kicker">図面</p>
        <h3>S-204</h3>
        <div class="ap-drawing" aria-hidden="true"><span></span></div>
        <dl>
          <div><dt>材質</dt><dd>SUS304</dd></div>
          <div><dt>寸法</dt><dd>120 × 80</dd></div>
          <div><dt>板厚</dt><dd>10.0 mm</dd></div>
        </dl>
      </section>
      <section>
        <p class="ap-kicker">材料証明書</p>
        <h3>照合中</h3>
        <ul class="ap-rows">
          <li class="is-warn"><span>材質</span><b>SUSXM7</b><em>要確認</em></li>
          <li class="is-ok"><span>規格</span><b>JIS G4304</b><em>一致</em></li>
          <li class="is-ok"><span>板厚</span><b>10.0 mm</b><em>一致</em></li>
          <li class="is-miss"><span>ロット番号</span><b>—</b><em>未記載</em></li>
        </ul>
      </section>
    </div>
    <div class="ap-result">
      <p>照合結果</p>
      <ul>
        <li class="is-warn">材質記号 要確認</li>
        <li class="is-ok">規格 一致</li>
        <li class="is-ok">板厚 一致</li>
        <li class="is-miss">ロット番号 未記載</li>
      </ul>
    </div>
  </div>
`;

const holdHtml = `
  <div class="ap-card">
    <div class="ap-hold-head">
      <div>
        <p class="ap-kicker">要確認一覧</p>
        <h3>人の確認が必要な項目だけ残しています</h3>
      </div>
      <strong>判断待ち <b>2</b>件</strong>
    </div>
    <table>
      <thead><tr><th>品番</th><th>確認項目</th><th>内容</th><th>判定</th></tr></thead>
      <tbody>
        <tr>
          <td>S-204</td>
          <td>材質記号</td>
          <td>SUSXM7 と記載されています。</td>
          <td><em class="is-warn">要確認</em></td>
        </tr>
        <tr>
          <td>B-310</td>
          <td>lot number</td>
          <td>lot number が記載されていません。</td>
          <td><em class="is-miss">未記載</em></td>
        </tr>
      </tbody>
    </table>
  </div>
`;

const approvalHtml = `
  <div class="ap-card">
    <div class="ap-hold-head">
      <div>
        <p class="ap-kicker">承認記録</p>
        <h3>確認した根拠を残しています</h3>
      </div>
      <strong class="is-ok">承認済み</strong>
    </div>
    <dl class="ap-meta">
      <div><dt>承認者</dt><dd>山田 太郎</dd></div>
      <div><dt>承認日</dt><dd>2024/06/12 14:28</dd></div>
    </dl>
    <ul class="ap-checks">
      <li>材質記号を確認　別資料で確認済み</li>
      <li>lot number を別資料で特定　別資料で特定済み</li>
    </ul>
    <p class="ap-files">材料証明書_SUSXM7.pdf　Lot確認証憑_20240612.pdf</p>
  </div>
`;

const standardHtml = `
  <div class="ap-card">
    <div class="ap-hold-head">
      <div>
        <p class="ap-kicker">基準改定</p>
        <h3>見つかった不足を、次回の検査へ戻す</h3>
      </div>
      <strong class="is-ok">v2.1 承認済み</strong>
    </div>
    <div class="ap-versions">
      <section>
        <p>現行</p>
        <b>v2.0</b>
        <span>ロット番号は任意</span>
      </section>
      <span class="ap-arrow" aria-hidden="true">→</span>
      <section class="is-next">
        <p>改定</p>
        <b>v2.1</b>
        <span>ロット番号を必須化</span>
        <small>適用日 2024/09/01</small>
      </section>
    </div>
  </div>
`;

const bodies = {
  match: matchHtml,
  hold: holdHtml,
  approval: approvalHtml,
  standard: standardHtml,
};

/**
 * @param {DeviceId} id
 * @param {readonly string[]} stars
 * @param {string} body
 */
function frame(id, stars, body) {
  const active = stars.includes(id) ? "ap-active" : "ap-idle";
  return `<div class="ap-device ap-${id} ${active}">
    <div class="ap-device-bar">受入検査 AIサポート <span>${TABS[id]}</span></div>
    <div class="ap-body"><div class="ap-scale">${body}</div></div>
  </div>`;
}

/**
 * @param {{ stars: readonly string[] }} opts
 */
export function renderScreens({ stars }) {
  return [
    frame("match", stars, bodies.match),
    frame("hold", stars, bodies.hold),
    frame("approval", stars, bodies.approval),
    frame("standard", stars, bodies.standard),
  ].join("");
}
