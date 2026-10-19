import { seed, mutate, calendar } from '../lib/domain.mjs';
export const storageKey = 'litigation-hold-demo-v1';
export function loadDemo(storage) {
  const saved = storage.getItem(storageKey);
  if (!saved) return seed();
  try {
    const state = JSON.parse(saved);
    if (![state.holds, state.employees, state.history, state.requests].every(Array.isArray)) throw Error();
    return state;
  } catch { throw Error('Saved demo data could not be read. Use Reset demo to restore sample records.'); }
}
export function applyDemo(storage, action) {
  let state = structuredClone(loadDemo(storage));
  if (action.type === 'send') {
    const request = state.requests.find(r => r.id === action.id);
    const hold = state.holds.find(h => h.id === request?.holdId);
    if (!request || request.status !== 'draft' || !hold || hold.status !== 'Active' || hold.reviewDate !== request.reviewDate || hold.email !== request.email) throw Error('Prepare a current draft before simulating email.');
    request.status = 'simulated';
    state.history.unshift({id: crypto.randomUUID(), at: new Date().toISOString(), actor: 'Demo visitor', text: `Simulated review email for ${hold.id}; no email was sent`});
  } else state = mutate(state, action, 'Demo visitor');
  storage.setItem(storageKey, JSON.stringify(state));
  return state;
}
export function resetDemo(storage) {
  const state = seed();
  storage.setItem(storageKey, JSON.stringify(state));
  return state;
}
export function demoCalendar(hold, pageUrl) {
  const page = new URL(pageUrl); page.search = ''; page.hash = '';
  // Domain calendar expects a site origin; preserve the Pages project path.
  return calendar(hold, page.href.replace(/\/$/, ''));
}
