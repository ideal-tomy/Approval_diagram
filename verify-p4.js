(async () => {
  const assert = (ok, text) => { if (!ok) throw new Error(text); };
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const root = document.querySelector('#demo-console');
  if (!root) {
    const results = [];
    assert(document.querySelectorAll('.screen-tabs button').length === 4, 'Four tabs loaded');
    for (const [index, tab] of [...document.querySelectorAll('.screen-tabs button')].entries()) {
      tab.click();
      const img = document.querySelector('.actual-screen');
      await img.decode();
      assert(img.src.endsWith(`0${index+1}.png`), 'Correct image per tab');
      assert(img.naturalWidth > 0, 'Image loads');
      assert(scrollY === 0, 'No tab scrolling');
      results.push(img.getAttribute('src'));
    }
    return JSON.stringify({images: results, result:'PASS'});
  }
  const button = document.querySelector('#flow-action');
  const states = [root.dataset.state];
  const observer = new MutationObserver(() => states.push(root.dataset.state));
  observer.observe(root, {attributes:true, attributeFilter:['data-state']});
  const waitFor = async state => {
    const deadline = Date.now() + 12000;
    while (root.dataset.state !== state && Date.now() < deadline) await pause(30);
    assert(root.dataset.state === state, `Reached ${state}`);
  };
  assert(root.dataset.state === 'idle', 'Starts idle');
  button.click(); button.click(); // Disabled control must ignore repeated clicks.
  await waitFor('review');
  assert(button.textContent === '確認を進める', 'Second action available');
  assert(root.querySelector('.approval-pending').textContent.includes('未承認'), 'Review remains unapproved');
  await pause(500);
  assert(root.dataset.state === 'review', 'Waits for the second action');
  button.click(); button.click();
  await waitFor('complete');
  observer.disconnect();
  for (const state of ['drawing','certificate','judgment','review','human','evidence','approved','complete']) assert(states.includes(state), `Visited ${state}`);
  assert(root.querySelector('.standard-pending').textContent.includes('v2.1'), 'Standard revised');
  assert(root.querySelector('[data-stage="certificate"]').textContent.includes('記載なし'), 'Missing source value preserved');
  assert(root.querySelector('.evidence-record').textContent.includes('記録済み'), 'Evidence recorded');
  assert(scrollY === 0, 'Playback never scrolls');
  assert(document.documentElement.scrollWidth <= innerWidth, 'No horizontal overflow');
  assert(document.documentElement.scrollHeight <= innerHeight, 'Desktop fits');
  return JSON.stringify({states, result:'PASS', pageHeight:document.documentElement.scrollHeight});
})();
