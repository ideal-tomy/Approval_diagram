import {
  syncSelectionEntry,
  selectionReturnUrl,
  preserveFromParam,
} from './selectionReturn.js';

const screenMeta = {
  match: {
    kicker: 'MATCH',
    title: '図面と証明書を、同じ画面で照合する。',
    image: '01.png',
  },
  hold: {
    kicker: 'HOLD LIST',
    title: '人が見るべき項目だけを、保留に残す。',
    image: '02.png',
  },
  approval: {
    kicker: 'APPROVAL RECORD',
    title: '確認した根拠を、承認記録として残す。',
    image: '03.png',
  },
  standard: {
    kicker: 'STANDARD UPDATE',
    title: '見つかった不足を、次回の検査基準へ戻す。',
    image: '04.png',
  },
};

syncSelectionEntry();

const detail = document.querySelector('#screen-detail');
const content = document.querySelector('#detail-content');
const tabs = [...document.querySelectorAll('[role="tab"][data-screen]')];
const selectionLink = document.querySelector('#selection-return');

function renderSelectionReturn() {
  if (!selectionLink) return;
  const back = selectionReturnUrl();
  if (back) {
    selectionLink.href = back;
    selectionLink.hidden = false;
  } else {
    selectionLink.hidden = true;
  }
}

function renderScreen(requested, updateHistory = false) {
  if (!detail || !content) return;
  const key = Object.hasOwn(screenMeta, requested) ? requested : 'match';
  const selectedScreen = screenMeta[key];
  document.querySelector('#detail-kicker').textContent = selectedScreen.kicker;
  document.querySelector('#detail-title').textContent = selectedScreen.title;
  content.replaceChildren();
  const image = document.createElement('img');
  image.className = 'actual-screen';
  image.src = `images/${selectedScreen.image}`;
  image.alt = selectedScreen.title;
  content.append(image);
  tabs.forEach((tab) => {
    const active = tab.dataset.screen === key;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  if (tabs.length) detail.setAttribute('aria-labelledby', `tab-${key}`);
  const source = document.querySelector('#source-screen');
  if (source) source.href = `images/${selectedScreen.image}`;
  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set('screen', key);
    preserveFromParam(url);
    history.pushState(null, '', url);
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => renderScreen(tab.dataset.screen, true));
  tab.addEventListener('keydown', (event) => {
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

window.addEventListener('popstate', () =>
  renderScreen(new URLSearchParams(location.search).get('screen')),
);

renderSelectionReturn();
renderScreen(new URLSearchParams(location.search).get('screen'));
