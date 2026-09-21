const SELECTION_FROM = 'axeon-demo-selection';
const SELECTION_DETAIL_URL =
  'https://axeon-demo-selection.vercel.app/?demo=approval-inspection';
const STORAGE_KEY = 'approval-from-selection';

export function syncSelectionEntry() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') === SELECTION_FROM) {
    sessionStorage.setItem(STORAGE_KEY, '1');
  }
}

export function hasSelectionEntry() {
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function selectionReturnUrl() {
  return hasSelectionEntry() ? SELECTION_DETAIL_URL : null;
}

export function preserveFromParam(url) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') === SELECTION_FROM || hasSelectionEntry()) {
    url.searchParams.set('from', SELECTION_FROM);
  }
  return url;
}
