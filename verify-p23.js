// Run in the browser with: agent-browser eval --stdin < verify-p23.js
(() => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const report = { page: location.pathname, viewport: [innerWidth, innerHeight] };
  if (document.querySelector('.screen-tabs')) {
    const tabs = [...document.querySelectorAll('.screen-tabs button')];
    const images = ['01.png', '02.png', '03.png', '04.png'];
    const titles = [];
    const origin = document.querySelector('#detail-content').getBoundingClientRect().top;
    report.tabs = tabs.map((tab, index) => {
      tab.click();
      assert(document.querySelectorAll('[aria-selected="true"]').length === 1, 'Only one selected tab');
      assert(tab.getAttribute('aria-selected') === 'true', 'Selected tab follows click');
      assert(new URLSearchParams(location.search).get('screen') === tab.dataset.screen, 'URL follows tab');
      assert(document.querySelector('#source-screen').href.endsWith(images[index]), 'Correct source image');
      assert(scrollY === 0, 'Tab switching must not scroll the page');
      assert(document.querySelector('#detail-content').getBoundingClientRect().top === origin, 'Panel must stay in place');
      titles.push(document.querySelector('#detail-title').textContent);
      return tab.textContent;
    });
    assert(new Set(titles).size === 4, 'Each tab renders different content');
    tabs[3].focus({preventScroll:true});
    tabs[3].dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true}));
    assert(document.activeElement === tabs[0], 'ArrowRight wraps and moves focus');
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', {key:'End', bubbles:true}));
    assert(document.activeElement === tabs[3], 'End selects the last tab');
    report.keyboard = 'pass';
  } else {
    const columns = [...document.querySelectorAll('.console-column')];
    assert(columns.length === 5, 'All five workflow columns are present');
    const rects = columns.map(el => el.getBoundingClientRect());
    if (innerWidth >= 1100) {
      assert(rects.every(r => r.top === rects[0].top), 'Desktop columns share one row');
      assert(rects.every((r, i) => i === 0 || r.left >= rects[i-1].right), 'Columns do not overlap');
      assert(rects[4].right <= innerWidth, 'Approval is visible without horizontal scrolling');
    }
    assert(document.querySelector('.approval-pending').textContent.includes('未承認'), 'Pending human review must not appear approved');
    report.columns = columns.map((el, i) => ({ stage: el.dataset.stage, x: Math.round(rects[i].x), y: Math.round(rects[i].y) }));
  }
  assert(document.documentElement.scrollWidth <= innerWidth, 'No page horizontal overflow');
  if (innerWidth === 1440 && innerHeight === 900) assert(document.documentElement.scrollHeight <= innerHeight, 'Desktop view fits the viewport');
  report.pageSize = [document.documentElement.scrollWidth, document.documentElement.scrollHeight];
  report.result = 'PASS';
  return JSON.stringify(report);
})();
