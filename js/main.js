'use strict';

// UI 상태를 모아 두고 이벤트 → 상태 변경 → render 순서로 업데이트합니다.
const config = window.PORTFOLIO_CONFIG;
const select = (selector) => document.querySelector(selector);
const state = {
  theme: 'light', menuOpen: false,
  projects: { status: 'loading', repos: [], filter: '전체', error: '' },
  form: { values: { name: '', email: '', message: '' }, errors: {}, touched: new Set(), submitted: false }
};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme = null;
try { savedTheme = localStorage.getItem('heeseo-theme'); } catch { /* 저장을 차단한 브라우저에서도 동작합니다. */ }
state.theme = ['light', 'dark'].includes(savedTheme) ? savedTheme : (themePreference.matches ? 'dark' : 'light');
let manualTheme = ['light', 'dark'].includes(savedTheme);

const renderTheme = () => {
  const dark = state.theme === 'dark';
  document.documentElement.dataset.theme = state.theme;
  select('#theme-toggle').setAttribute('aria-pressed', String(dark));
  select('#theme-toggle').setAttribute('aria-label', dark ? '라이트 모드 켜기' : '다크 모드 켜기');
  select('#theme-icon').textContent = dark ? '라이트 모드' : '다크 모드';
};
select('#theme-toggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  manualTheme = true;
  try { localStorage.setItem('heeseo-theme', state.theme); } catch { /* 현재 탭의 상태는 유지합니다. */ }
  renderTheme();
});
themePreference.addEventListener('change', ({ matches }) => {
  if (!manualTheme) { state.theme = matches ? 'dark' : 'light'; renderTheme(); }
});
renderTheme();

const renderMenu = () => {
  if (state.menuOpen) select('#nav-links').classList.toggle('active', true);
  else select('#nav-links').classList.remove('active');
  select('#menu-toggle').setAttribute('aria-expanded', String(state.menuOpen));
  select('#menu-toggle').setAttribute('aria-label', state.menuOpen ? '메뉴 닫기' : '메뉴 열기');
};
const closeMenu = () => { state.menuOpen = false; renderMenu(); };
select('#menu-toggle').addEventListener('click', () => { state.menuOpen = !state.menuOpen; renderMenu(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.menuOpen) { closeMenu(); select('#menu-toggle').focus(); }
});
document.addEventListener('click', (event) => { if (!select('#header').contains(event.target)) closeMenu(); });
window.matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    // 메뉴를 닫아도 키보드 초점이 숨겨진 링크에 남지 않도록 이동합니다.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    try { history.replaceState(null, '', link.getAttribute('href')); } catch { /* 로컬 파일 접근 지원 */ }
  });
});
const renderScroll = () => {
  select('#header').classList.toggle('scrolled', window.scrollY >= 60);
  select('#back-top').hidden = window.scrollY < 300;
};
window.addEventListener('scroll', renderScroll, { passive: true });
select('#back-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  select('.logo').focus({ preventScroll: true });
});
renderScroll();
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) { target.classList.add('visible'); observer.unobserve(target); }
    });
  }, { threshold: 0.2 });
  document.documentElement.classList.add('js-motion');
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

// API에서 온 이름/설명은 외부 입력이므로 HTML로 삽입하기 전에 이스케이프합니다.
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const username = config.githubUsername;
document.querySelectorAll('[data-github-link]').forEach((link) => { link.href = `https://github.com/${encodeURIComponent(username)}`; });
const projectRegion = select('#projects-region');
const projectStatus = select('#project-status');
const projectGrid = select('#project-grid');
const filterRegion = select('#project-filters');
const renderProjects = () => {
  const { status, repos, filter, error } = state.projects;
  projectRegion.setAttribute('aria-busy', String(status === 'loading'));
  projectGrid.innerHTML = '';
  filterRegion.innerHTML = '';
  select('#project-count').textContent = '';
  projectStatus.hidden = status === 'success';
  if (status === 'loading') {
    projectStatus.innerHTML = '<p>프로젝트를 불러오는 중...</p>';
    return;
  }
  if (status === 'error') {
    projectStatus.innerHTML = `<p>프로젝트를 불러올 수 없습니다.</p><p>${escapeHTML(error)}</p><button class="button primary" id="retry-projects" type="button">다시 시도</button>`;
    select('#retry-projects').addEventListener('click', loadProjects);
    return;
  }
  if (status === 'empty') { projectStatus.innerHTML = '<p>표시할 프로젝트가 없습니다.</p><p>GitHub에 공개 저장소가 생기면 이곳에 표시됩니다.</p>'; return; }
  const languages = ['전체', ...new Set(repos.map(({ language }) => language || '기타'))];
  filterRegion.innerHTML = languages.map((language) => `<button type="button" class="filter-button${filter === language ? ' active' : ''}" aria-pressed="${filter === language}">${escapeHTML(language)}</button>`).join('');
  filterRegion.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      state.projects.filter = button.textContent;
      renderProjects();
      // 필터 버튼을 다시 그린 뒤 키보드 초점을 복원합니다.
      [...filterRegion.querySelectorAll('button')].find((item) => item.textContent === state.projects.filter)?.focus({ preventScroll: true });
    });
  });
  const filtered = repos.filter(({ language }) => filter === '전체' || (language || '기타') === filter);
  select('#project-count').textContent = `${filtered.length}개 저장소 · 최근 업데이트 순 · 최대 100개 공개 저장소`;
  projectGrid.innerHTML = filtered.map(({ name, description, language, stargazers_count }) => {
    // 외부 URL을 그대로 신뢰하지 않고 계정/저장소 이름으로 GitHub URL을 만듭니다.
    const url = `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(name)}`;
    return `<article class="project-card"><h3><a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHTML(name)}</a></h3><p>${escapeHTML(description || '저장소 설명이 아직 등록되지 않았습니다.')}</p><div class="project-meta"><span>${escapeHTML(language || '기타')}</span><span>별 ${Number(stargazers_count) || 0}개</span></div></article>`;
  }).join('');
};
async function loadProjects() {
  state.projects.status = 'loading';
  state.projects.error = '';
  renderProjects();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100&type=owner`, {
      headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal
    });
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) throw new Error('GitHub API 요청 한도에 도달했거나 접근이 제한되었습니다. 잠시 후 다시 시도해 주세요.');
      if (response.status === 404) throw new Error('GitHub 계정을 찾을 수 없습니다. 계정 이름을 확인해 주세요.');
      throw new Error(`GitHub 응답 오류 (${response.status}). 잠시 후 다시 시도해 주세요.`);
    }
    const repos = await response.json();
    if (!Array.isArray(repos)) throw new Error('GitHub 데이터 형식을 확인할 수 없습니다.');
    state.projects.repos = repos;
    state.projects.filter = '전체';
    state.projects.status = repos.length ? 'success' : 'empty';
  } catch (error) {
    state.projects.status = 'error';
    state.projects.error = error.name === 'AbortError' ? '응답이 지연되고 있습니다. 네트워크를 확인하고 다시 시도해 주세요.' : (error instanceof TypeError ? '인터넷 연결을 확인하고 다시 시도해 주세요.' : error.message);
  } finally { clearTimeout(timeout); renderProjects(); }
}
loadProjects();

const form = select('#contact-form');
const fieldNames = ['name', 'email', 'message'];
const validateField = (name) => {
  const value = state.form.values[name].trim();
  const labels = { name: '이름을', email: '이메일을', message: '메시지를' };
  if (!value) return `${labels[name]} 입력해 주세요.`;
  if (name === 'email' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || select('#email').validity.typeMismatch)) return '올바른 이메일 형식을 입력해 주세요.';
  return '';
};
const renderForm = () => {
  fieldNames.forEach((name) => {
    const error = state.form.touched.has(name) ? state.form.errors[name] || '' : '';
    select(`#${name}-error`).textContent = error;
    select(`#${name}`).setAttribute('aria-invalid', String(Boolean(error)));
  });
  select('#form-status').textContent = state.form.submitted ? '입력값 확인이 완료되었습니다. 학습용 폼으로, 메시지는 전송되지 않았습니다.' : '';
};
fieldNames.forEach((name) => {
  select(`#${name}`).addEventListener('input', (event) => {
    state.form.values[name] = event.target.value;
    state.form.touched.add(name);
    state.form.errors[name] = validateField(name);
    state.form.submitted = false;
    renderForm();
  });
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  fieldNames.forEach((name) => {
    state.form.values[name] = select(`#${name}`).value;
    state.form.touched.add(name);
    state.form.errors[name] = validateField(name);
  });
  state.form.submitted = fieldNames.every((name) => !state.form.errors[name]);
  renderForm();
  const firstInvalid = fieldNames.find((name) => state.form.errors[name]);
  if (firstInvalid) select(`#${firstInvalid}`).focus();
});
select('#year').textContent = new Date().getFullYear();
