/* ==============================================
   DASHBOARD APP — app.js
   ============================================== */

// ── STATE ──────────────────────────────────────
const state = {
  ideas: [],
  xpEntries: [],
  categories: [],  // { id, name, color }
  projects: [],    // { id, title, theme, desc, steps, tags, type, categoryId }
};

// ── HELPERS ────────────────────────────────────
let idCounter = 1;
const uid = () => `id_${idCounter++}_${Date.now()}`;

function $(id) { return document.getElementById(id); }

// ── NAVIGATION ─────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const section = item.dataset.section;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(`section-${section}`).classList.add('active');
  });
});

// ── THEME TOGGLE ───────────────────────────────
const themeToggle = $('themeToggle');
const themeIcon   = $('themeIcon');
const themeLabel  = $('themeLabel');

themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeIcon.textContent  = isDark ? '☾' : '☀';
  themeLabel.textContent = isDark ? 'Modo oscuro' : 'Modo claro';
});

// ── MODAL HELPERS ──────────────────────────────
function openModal(id) {
  $(id).classList.add('active');
}

function closeModal(id) {
  $(id).classList.remove('active');
}

// Close on overlay click or [data-modal] buttons
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modal));
});

// ── PRINCIPAL SECTION ──────────────────────────
function renderPrincipal() {
  const mainCards      = $('main-principal-cards');
  const secondaryCards = $('main-secondary-cards');
  const principals     = state.projects.filter(p => p.type === 'principal');
  const secondaries    = state.projects.filter(p => p.type === 'secundario').slice(0, 5);

  mainCards.innerHTML      = principals.length  ? '' : '<p class="empty-cards">Sin proyectos principales aún.</p>';
  secondaryCards.innerHTML = secondaries.length ? '' : '<p class="empty-cards">Sin proyectos secundarios aún.</p>';

  principals.forEach(p  => mainCards.appendChild(buildPrincipalCard(p)));
  secondaries.forEach(p => secondaryCards.appendChild(buildPrincipalCard(p)));
}

function buildPrincipalCard(project) {
  const cat   = state.categories.find(c => c.id === project.categoryId);
  const color = cat ? cat.color : '#7C3AED';

  const card = document.createElement('div');
  card.className = 'project-card';
  card.style.setProperty('--card-accent', color);

  const tags = (project.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

  card.innerHTML = `
    <div class="card-title">${esc(project.title)}</div>
    <div class="card-theme">${esc(project.theme)}</div>
    <div class="card-tags">${tags}</div>
    <div class="card-arrow">→ Ver proyecto</div>
  `;

  card.addEventListener('click', () => {
    // Navigate to projects section and highlight
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-section="proyectos"]').classList.add('active');
    $('section-proyectos').classList.add('active');
  });

  return card;
}

// ── GAMIFICACIÓN ───────────────────────────────
function renderXP() {
  const tbody   = $('xpTableBody');
  const empty   = $('xpEmpty');
  const totalEl = $('totalXP');

  const total = state.xpEntries.reduce((s, e) => s + e.amount, 0);
  totalEl.textContent = total.toLocaleString();

  if (state.xpEntries.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = state.xpEntries.map((entry, i) => `
    <tr>
      <td class="xp-num-col">${i + 1}</td>
      <td>${esc(entry.text)}</td>
      <td><span class="xp-amount">+${entry.amount} XP</span></td>
      <td><button class="btn-delete" data-xp="${entry.id}" title="Eliminar">✕</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-xp]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.xpEntries = state.xpEntries.filter(e => e.id !== btn.dataset.xp);
      renderXP();
    });
  });
}

$('addXpBtn').addEventListener('click', () => {
  const text   = $('xpText').value.trim();
  const amount = parseInt($('xpAmount').value) || 0;
  if (!text || amount <= 0) return;

  state.xpEntries.push({ id: uid(), text, amount });
  $('xpText').value   = '';
  $('xpAmount').value = '';
  renderXP();
});

// ── IDEAS ──────────────────────────────────────
$('addIdeaBtn').addEventListener('click', () => openModal('ideaModal'));

$('saveIdeaBtn').addEventListener('click', () => {
  const name     = $('ideaName').value.trim();
  const desc     = $('ideaDesc').value.trim();
  const category = $('ideaCategory').value.trim();
  if (!name) return;

  state.ideas.push({ id: uid(), name, desc, category });
  $('ideaName').value     = '';
  $('ideaDesc').value     = '';
  $('ideaCategory').value = '';
  closeModal('ideaModal');
  renderIdeas();
});

function renderIdeas() {
  const grid  = $('ideasGrid');
  const empty = $('ideasEmpty');

  if (state.ideas.length === 0) {
    grid.innerHTML    = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = state.ideas.map(idea => `
    <div class="idea-card" data-idea="${idea.id}">
      <div class="idea-cat">${esc(idea.category || 'Sin categoría')}</div>
      <div class="idea-name">${esc(idea.name)}</div>
      <div class="idea-desc">${esc(idea.desc)}</div>
      <div class="idea-actions">
        <button class="btn-delete" data-del-idea="${idea.id}" title="Eliminar idea">✕</button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-del-idea]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.ideas = state.ideas.filter(i => i.id !== btn.dataset.delIdea);
      renderIdeas();
    });
  });
}

// ── PROYECTOS ──────────────────────────────────

// ── Color picker for categories
let selectedColor = '#7C3AED';

document.querySelectorAll('.color-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedColor = opt.dataset.color;
  });
});

// ── Add category
$('addCategoryBtn').addEventListener('click', () => openModal('categoryModal'));

$('saveCategoryBtn').addEventListener('click', () => {
  const name = $('categoryName').value.trim();
  if (!name) return;

  state.categories.push({ id: uid(), name, color: selectedColor });
  $('categoryName').value = '';
  closeModal('categoryModal');
  renderProjects();
  updateProjectCategorySelect();
});

// ── Add project
$('addProjectBtn').addEventListener('click', () => {
  updateProjectCategorySelect();
  openModal('projectModal');
});

function updateProjectCategorySelect() {
  const sel = $('projectCategory');
  sel.innerHTML = '<option value="">— Selecciona una categoría —</option>';
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value       = cat.id;
    opt.textContent = cat.name;
    sel.appendChild(opt);
  });
}

// ── Add step in project modal
$('addStepBtn').addEventListener('click', () => {
  const container = $('stepsContainer');
  const count     = container.querySelectorAll('.step-row').length + 1;
  const row = document.createElement('div');
  row.className = 'step-row';
  row.innerHTML = `
    <input type="text" class="step-input" placeholder="Paso ${count}..." />
    <button class="step-remove">✕</button>
  `;
  row.querySelector('.step-remove').addEventListener('click', () => row.remove());
  container.appendChild(row);
});

// Delegate remove for initial step
$('stepsContainer').querySelector('.step-remove').addEventListener('click', function() {
  if ($('stepsContainer').querySelectorAll('.step-row').length > 1) {
    this.closest('.step-row').remove();
  }
});

$('saveProjectBtn').addEventListener('click', () => {
  const title      = $('projectTitle').value.trim();
  const theme      = $('projectTheme').value.trim();
  const categoryId = $('projectCategory').value;
  const type       = document.querySelector('input[name="projectType"]:checked').value;
  const desc       = $('projectDesc').value.trim();
  const tagsRaw    = $('projectTags').value.trim();
  const tags       = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  const steps = Array.from($('stepsContainer').querySelectorAll('.step-input'))
    .map(i => i.value.trim())
    .filter(Boolean);

  if (!title) return;

  state.projects.push({ id: uid(), title, theme, desc, steps, tags, type, categoryId });

  // Reset form
  $('projectTitle').value   = '';
  $('projectTheme').value   = '';
  $('projectDesc').value    = '';
  $('projectTags').value    = '';
  $('projectCategory').value = '';
  $('stepsContainer').innerHTML = `
    <div class="step-row">
      <input type="text" class="step-input" placeholder="Paso 1..." />
      <button class="step-remove">✕</button>
    </div>
  `;
  $('stepsContainer').querySelector('.step-remove').addEventListener('click', function() {
    if ($('stepsContainer').querySelectorAll('.step-row').length > 1) {
      this.closest('.step-row').remove();
    }
  });

  closeModal('projectModal');
  renderProjects();
  renderPrincipal();
});

function renderProjects() {
  const container = $('projectsContainer');
  const empty     = $('projectsEmpty');

  if (state.categories.length === 0) {
    container.innerHTML  = '';
    empty.style.display  = 'flex';
    return;
  }

  empty.style.display = 'none';
  container.innerHTML = '';

  state.categories.forEach(cat => {
    const catProjects = state.projects.filter(p => p.categoryId === cat.id);

    const block = document.createElement('div');
    block.className = 'category-block';

    block.innerHTML = `
      <div class="category-header">
        <div class="category-dot" style="background:${cat.color}"></div>
        <span class="category-name">${esc(cat.name)}</span>
        <span class="category-count">${catProjects.length} proyecto${catProjects.length !== 1 ? 's' : ''}</span>
        <button class="btn-delete" data-del-cat="${cat.id}" title="Eliminar categoría">✕</button>
      </div>
      <div class="project-list" id="plist-${cat.id}">
        ${catProjects.length === 0 ? '<p class="empty-cards">Sin proyectos en esta categoría.</p>' : ''}
      </div>
    `;

    // Delete category
    block.querySelector('[data-del-cat]').addEventListener('click', () => {
      if (!confirm(`¿Eliminar la categoría "${cat.name}" y todos sus proyectos?`)) return;
      state.categories = state.categories.filter(c => c.id !== cat.id);
      state.projects   = state.projects.filter(p => p.categoryId !== cat.id);
      renderProjects();
      renderPrincipal();
    });

    container.appendChild(block);

    const list = block.querySelector(`#plist-${cat.id}`);
    catProjects.forEach(project => {
      list.appendChild(buildProjectCard(project, cat.color));
    });
  });
}

function buildProjectCard(project, color) {
  const card = document.createElement('div');
  card.className = 'project-detail-card';
  card.style.setProperty('--card-accent', color);

  const stepsHtml = project.steps.slice(0, 3).map(s =>
    `<div class="step-item">${esc(s)}</div>`
  ).join('');

  const moreTags = project.steps.length > 3
    ? `<div class="step-item" style="color:var(--text-muted)">+${project.steps.length - 3} más...</div>`
    : '';

  const tags = (project.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');

  card.innerHTML = `
    <div class="pcard-type">${project.type === 'principal' ? '★ Principal' : '· Secundario'}</div>
    <div class="pcard-title">${esc(project.title)}</div>
    <div class="pcard-theme">${esc(project.theme)}</div>
    ${project.desc ? `<div class="pcard-desc">${esc(project.desc)}</div>` : ''}
    ${project.steps.length > 0 ? `<div class="pcard-steps">${stepsHtml}${moreTags}</div>` : ''}
    ${tags ? `<div class="card-tags" style="margin-top:10px">${tags}</div>` : ''}
    <div style="display:flex;justify-content:flex-end;margin-top:12px">
      <button class="btn-delete" data-del-proj="${project.id}" title="Eliminar proyecto">✕</button>
    </div>
  `;

  card.querySelector('[data-del-proj]').addEventListener('click', (e) => {
    e.stopPropagation();
    state.projects = state.projects.filter(p => p.id !== project.id);
    renderProjects();
    renderPrincipal();
  });

  return card;
}

// ── ESCAPE HTML ────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── SEED DATA (demo) ───────────────────────────
function seedDemo() {
  state.categories = [
    { id: 'cat1', name: 'Desarrollo', color: '#7C3AED' },
    { id: 'cat2', name: 'Diseño',     color: '#2563EB' },
  ];

  state.projects = [
    {
      id: 'p1', title: 'App de Hábitos', theme: 'Mobile / React Native',
      desc: 'Aplicación para seguimiento de hábitos diarios con gamificación integrada.',
      steps: ['Diseñar wireframes', 'Configurar proyecto RN', 'Implementar CRUD de hábitos'],
      tags: ['React Native', 'MVP', 'UX'],
      type: 'principal', categoryId: 'cat1',
    },
    {
      id: 'p2', title: 'Dashboard Analytics', theme: 'Web / Vue 3',
      desc: 'Panel de analítica de datos para clientes B2B.',
      steps: ['Definir KPIs', 'Integrar API', 'Construir componentes de gráficas'],
      tags: ['Vue', 'API', 'B2B'],
      type: 'principal', categoryId: 'cat1',
    },
    {
      id: 'p3', title: 'Rediseño Marca Personal', theme: 'Identidad visual',
      desc: 'Actualizar logo, paleta y tipografía del portfolio personal.',
      steps: ['Moodboard', 'Propuestas de logo', 'Aplicar a web'],
      tags: ['Branding', 'Figma'],
      type: 'secundario', categoryId: 'cat2',
    },
  ];

  state.xpEntries = [
    { id: 'x1', text: 'Completé el primer módulo del curso de TypeScript', amount: 150 },
    { id: 'x2', text: 'Lancé versión beta de la app',                       amount: 500 },
    { id: 'x3', text: 'Mantuve racha de 7 días de código',                  amount: 200 },
  ];

  state.ideas = [
    {
      id: 'i1', name: 'Bot de Telegram para gastos',
      desc: 'Registrar gastos diarios vía Telegram con resumen semanal automático.',
      category: 'Tecnología',
    },
    {
      id: 'i2', name: 'Newsletter técnico semanal',
      desc: 'Curación de artículos de desarrollo y diseño con comentario personal.',
      category: 'Contenido',
    },
  ];
}

// ── INIT ───────────────────────────────────────
seedDemo();
renderPrincipal();
renderXP();
renderIdeas();
renderProjects();
