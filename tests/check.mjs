// 표준 Node.js만 사용하는 상태/이벤트 회귀 검사. 실제 브라우저 검사는 별도입니다.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

class Element {
  constructor() {
    this.textContent = ''; this.innerHTML = ''; this.value = ''; this.hidden = false;
    this.attributes = {}; this.listeners = {}; this.dataset = {}; this.validity = { typeMismatch: false };
    const classes = new Set();
    this.classList = { add: (v) => classes.add(v), remove: (v) => classes.delete(v), contains: (v) => classes.has(v), toggle: (v, on) => { const next = on ?? !classes.has(v); next ? classes.add(v) : classes.delete(v); return next; } };
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key]; }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  querySelectorAll() { return []; }
  focus() { this.focused = true; }
  contains() { return false; }
}
const source = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
function setup(reply, storedTheme = null) {
  const elements = new Map();
  const get = (key) => { if (!elements.has(key)) elements.set(key, new Element()); return elements.get(key); };
  const storage = new Map(storedTheme ? [['heeseo-theme', storedTheme]] : []);
  const window = { PORTFOLIO_CONFIG: { githubUsername: 'heeseo0616' }, scrollY: 0, matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener() {}, scrollTo() {} };
  const document = { querySelector: get, querySelectorAll: () => [], documentElement: new Element(), addEventListener() {} };
  const context = vm.createContext({ window, document, localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }, fetch: async () => { if (reply instanceof Error) throw reply; return reply; }, AbortController, setTimeout, clearTimeout, console, history: { replaceState() {} } });
  vm.runInContext(source, context);
  return { context, get, storage, window, document, read: (expression) => vm.runInContext(expression, context) };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));
const success = (data) => ({ ok: true, json: async () => data });
let checks = 0;
const check = (condition, description) => { assert.ok(condition, description); checks += 1; console.log(`PASS ${description}`); };

const app = setup(success([{ name: 'hello', description: '<img src=x onerror=alert(1)>', language: 'JavaScript', stargazers_count: 2 }]));
check(app.get('#projects-region').attributes['aria-busy'] === 'true', '요청 시작 시 loading 상태');
await flush();
check(app.read('state.projects.status') === 'success', '정상 응답 → success');
check(app.get('#project-grid').innerHTML.includes('&lt;img') && !app.get('#project-grid').innerHTML.includes('<img'), 'API 문자열 HTML 이스케이프');
check(app.get('#project-grid').innerHTML.includes('https://github.com/heeseo0616/hello'), '계정/저장소 링크');
check(app.get('#project-filters').innerHTML.includes('JavaScript'), '언어 필터 생성');
app.get('#theme-toggle').listeners.click();
check(app.document.documentElement.dataset.theme === 'dark' && app.storage.get('heeseo-theme') === 'dark', '다크 모드 전환 및 저장');
const restored = setup(success([]), app.storage.get('heeseo-theme'));
check(restored.document.documentElement.dataset.theme === 'dark', '저장된 테마 복원');
app.get('#menu-toggle').listeners.click();
check(app.get('#nav-links').classList.contains('active') && app.get('#menu-toggle').attributes['aria-expanded'] === 'true', '메뉴 열기');
app.get('#menu-toggle').listeners.click();
check(!app.get('#nav-links').classList.contains('active'), '메뉴 닫기');
app.window.scrollY = 300; app.read('renderScroll()');
check(!app.get('#back-top').hidden && app.get('#header').classList.contains('scrolled'), '스크롤 기준 300px/60px');
app.window.scrollY = 59; app.read('renderScroll()');
check(app.get('#back-top').hidden && !app.get('#header').classList.contains('scrolled'), '스크롤 기준 미만 숨김/해제');
let prevented = false;
const submit = () => app.get('#contact-form').listeners.submit({ preventDefault() { prevented = true; } });
submit();
check(prevented && app.get('#name-error').textContent.includes('입력') && app.get('#name').focused, '빈 폼 차단과 오류 초점');
app.get('#name').value = '   '; submit();
check(app.get('#name-error').textContent.includes('입력'), '공백 이름 차단');
app.get('#name').value = '테스트'; app.get('#email').value = 'invalid'; app.get('#message').value = '테스트 메시지'; submit();
check(app.get('#email-error').textContent.includes('형식'), '잘못된 이메일 차단');
app.get('#email').value = 'test@example.com'; submit();
check(app.get('#form-status').textContent.includes('완료') && app.get('#form-status').textContent.includes('전송되지'), '올바른 폼 확인과 미전송 안내');
app.get('#email').listeners.input({ target: { value: '' } });
check(app.get('#form-status').textContent === '' && app.get('#email-error').textContent.includes('입력'), '입력 수정 후 확인 상태 해제');
await flush();
check(restored.read('state.projects.status') === 'empty' && restored.get('#project-status').innerHTML.includes('표시할 프로젝트가 없습니다'), '빈 저장소 상태');
for (const status of [403, 429, 404, 500]) {
  const failed = setup({ ok: false, status }); await flush();
  check(failed.read('state.projects.status') === 'error' && failed.get('#project-status').innerHTML.includes('다시 시도'), `HTTP ${status} 오류와 재시도 버튼`);
}
const invalid = setup(success({ message: 'unexpected' })); await flush();
check(invalid.read('state.projects.status') === 'error', '예상하지 못한 API 데이터');
const timedOut = setup(Object.assign(new Error('abort'), { name: 'AbortError' })); await flush();
check(timedOut.get('#project-status').innerHTML.includes('응답이 지연'), '시간 초과 오류 안내');
console.log(`${checks} checks passed. Browser layout and live network require separate verification.`);
