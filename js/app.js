/**
 * app.js
 * Main Controller for Spring AI in 30 Days
 * Zero dependencies, pure vanilla JavaScript.
 */

// State Management
const state = {
  currentTab: 'curriculum',
  completedDays: JSON.parse(localStorage.getItem('spring_ai_completed_days') || '[]'),
  activeFilter: 'all',
  searchQuery: '',
  selectedDay: null,
  activeOsTab: 'Windows',
  theme: localStorage.getItem('spring_ai_theme') || 'dark'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderStats();
  renderCurriculum();
  renderSetupGuide();
  renderProjects();
  initEventListeners();
  initConfigurator();
});

// Theme Management
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('spring_ai_theme', state.theme);
  initTheme();
  showToast(`Switched to ${state.theme} mode`);
}

// Tab Switching
function switchTab(tabId) {
  state.currentTab = tabId;

  // Update Nav links
  document.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update Views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.toggle('active', view.id === `view-${tabId}`);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Stats & Progress Calculation
function renderStats() {
  const completedCount = state.completedDays.length;
  const totalDays = curriculumData.length;
  const percent = Math.round((completedCount / totalDays) * 100);

  // Update DOM elements
  const countEl = document.getElementById('stat-completed-count');
  const percentEl = document.getElementById('stat-progress-percent');
  const barEl = document.getElementById('progress-bar-fill');
  const textPercentEl = document.getElementById('progress-text-percent');

  if (countEl) countEl.textContent = `${completedCount} / ${totalDays}`;
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (barEl) barEl.style.width = `${percent}%`;
  if (textPercentEl) textPercentEl.textContent = `${percent}% Complete`;
}

function toggleDayCompletion(dayNum, event) {
  if (event) event.stopPropagation();

  const index = state.completedDays.indexOf(dayNum);
  if (index === -1) {
    state.completedDays.push(dayNum);
    showToast(`🎉 Day ${dayNum} marked as complete!`);
  } else {
    state.completedDays.splice(index, 1);
    showToast(`Day ${dayNum} marked as uncompleted`);
  }

  localStorage.setItem('spring_ai_completed_days', JSON.stringify(state.completedDays));
  renderStats();
  renderCurriculum();
}

// Render Curriculum Grid
function renderCurriculum() {
  const grid = document.getElementById('days-grid');
  if (!grid) return;

  const filteredDays = curriculumData.filter(item => {
    const matchesFilter = state.activeFilter === 'all' || item.category.toLowerCase().includes(state.activeFilter.toLowerCase());
    const matchesSearch = state.searchQuery === '' ||
      item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.objective.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filteredDays.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍 No matching labs found</p>
        <p>Try searching for terms like "ChatClient", "RAG", "Ollama", or reset the filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredDays.map(item => {
    const isCompleted = state.completedDays.includes(item.day);
    const diffClass = `diff-${item.difficulty.toLowerCase()}`;

    return `
      <div class="day-card ${isCompleted ? 'completed' : ''}" onclick="openDayModal(${item.day})">
        <div>
          <div class="day-card-header">
            <span class="day-number-badge">Day ${item.day < 10 ? '0' + item.day : item.day}</span>
            <div class="day-meta-tags">
              <span class="badge-tag">${item.category}</span>
              <span class="badge-difficulty ${diffClass}">${item.difficulty}</span>
            </div>
          </div>
          <h3>${item.title}</h3>
          <p>${item.objective}</p>
        </div>
        <div class="day-card-footer">
          <span class="time-estimate">⏱️ ${item.duration}</span>
          <label class="check-label" onclick="event.stopPropagation()">
            <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleDayCompletion(${item.day}, event)">
            <span>${isCompleted ? 'Completed' : 'Mark Done'}</span>
          </label>
        </div>
      </div>
    `;
  }).join('');
}

// Modal View for Deep-Dive Lab
function openDayModal(dayNum) {
  const dayData = curriculumData.find(d => d.day === dayNum);
  if (!dayData) return;

  state.selectedDay = dayData;
  const isCompleted = state.completedDays.includes(dayData.day);

  const modalOverlay = document.getElementById('day-modal');
  const modalContainer = document.getElementById('modal-dynamic-content');

  modalContainer.innerHTML = `
    <div class="modal-header">
      <div class="modal-header-info">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="day-number-badge">Day ${dayData.day}</span>
          <span class="badge-tag">${dayData.category}</span>
          <span class="time-estimate">⏱️ ${dayData.duration}</span>
        </div>
        <h2 style="font-size: 1.6rem; margin-top: 0.3rem;">${dayData.title}</h2>
      </div>
      <button class="modal-close-btn" onclick="closeDayModal()">✕</button>
    </div>

    <div class="modal-body">
      <!-- Objective -->
      <div>
        <h4 class="lab-section-title">🎯 Lab Objective</h4>
        <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.6;">${dayData.objective}</p>
      </div>

      <!-- Theory & Core Concept -->
      <div>
        <h4 class="lab-section-title">💡 Core Concepts (5-Min Reading)</h4>
        <ul class="lab-theory-list">
          ${dayData.theory.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>

      <!-- Hands-on Code Files -->
      <div>
        <h4 class="lab-section-title">💻 Hands-On Code (Copy & Run)</h4>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${dayData.codeFiles.map(file => `
            <div class="code-block-container">
              <div class="code-block-header">
                <span class="code-filename">📄 ${file.filename}</span>
                <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(file.content)}\`, this)">
                  📋 Copy Code
                </button>
              </div>
              <pre><code class="language-${file.lang}">${escapeHtml(file.content)}</code></pre>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Run & Test -->
      <div>
        <h4 class="lab-section-title">🚀 How to Run & Verify</h4>
        <div class="code-block-container">
          <div class="code-block-header">
            <span class="code-filename">Terminal / cURL Command</span>
            <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(dayData.runCommand)}\`, this)">
              📋 Copy Command
            </button>
          </div>
          <pre><code>${escapeHtml(dayData.runCommand)}</code></pre>
        </div>

        <div style="margin-top: 1rem;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase;">Expected Output:</span>
          <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1rem; margin-top: 0.4rem; font-family: var(--font-mono); font-size: 0.85rem; color: #a7f3d0; white-space: pre-wrap;">
${escapeHtml(dayData.expectedOutput)}
          </div>
        </div>
      </div>

      <!-- Daily Mini Challenge -->
      <div class="challenge-box">
        <h4>⚡ Today's 10-Minute Challenge</h4>
        <p>${dayData.challenge}</p>
      </div>

      <!-- Footer Action -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
        <label class="check-label" style="font-size: 1rem; font-weight: 600;">
          <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleDayCompletion(${dayData.day}); closeDayModal();">
          <span>Mark Day ${dayData.day} as Completed</span>
        </label>
        <div style="display: flex; gap: 0.5rem;">
          ${dayData.day > 1 ? `<button class="btn-icon" style="width: auto; padding: 0.4rem 1rem;" onclick="openDayModal(${dayData.day - 1})">← Previous</button>` : ''}
          ${dayData.day < 30 ? `<button class="btn-icon" style="width: auto; padding: 0.4rem 1rem; background: var(--emerald-accent); color: #000; font-weight: 700;" onclick="openDayModal(${dayData.day + 1})">Next Day →</button>` : ''}
        </div>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDayModal() {
  const modalOverlay = document.getElementById('day-modal');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Render Setup Guide
function renderSetupGuide() {
  const container = document.getElementById('setup-guide-content');
  if (!container) return;

  const data = setupGuideData;

  container.innerHTML = `
    <div class="setup-container">
      <div class="project-hero" style="margin-bottom: 1rem;">
        <span class="project-badge" style="background: var(--cyan-accent);">Prerequisites</span>
        <h2 class="project-title">${data.title}</h2>
        <p class="project-tagline">${data.subtitle}</p>
        <div class="project-meta-pills">
          <span class="meta-pill">⚡ 100% Offline LLM</span>
          <span class="meta-pill">💰 $0 Cloud Costs</span>
          <span class="meta-pill">🔒 Zero Privacy Leaks</span>
          <span class="meta-pill">☕ Java 21 LTS + Spring Boot 3.3</span>
        </div>
      </div>

      <!-- Step 1: Ollama Installation -->
      <div class="setup-card" id="step-ollama">
        <div class="setup-card-header">
          <div class="setup-step-icon">🦙</div>
          <div>
            <h3>${data.sections[0].title}</h3>
            <p>${data.sections[0].description}</p>
          </div>
        </div>

        <!-- OS Tabs -->
        <div class="os-tabs-nav">
          ${data.sections[0].osTabs.map(tab => `
            <button class="os-tab-btn ${tab.os === state.activeOsTab ? 'active' : ''}" onclick="switchOsTab('${tab.os}')">
              ${tab.os}
            </button>
          `).join('')}
        </div>

        <div id="os-tab-content">
          ${renderOsTabContent(data.sections[0].osTabs.find(t => t.os === state.activeOsTab))}
        </div>

        <!-- Models to pull -->
        <div style="margin-top: 2rem;">
          <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem;">${data.sections[0].pullModels.title}</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${data.sections[0].pullModels.intro}</p>
          
          <div class="models-grid">
            ${data.sections[0].pullModels.models.map(m => `
              <div class="model-pill-card">
                <div>
                  <h5>${m.name}</h5>
                  <div class="model-type">${m.type} • ${m.size}</div>
                  <p class="model-rec">${m.recommendedFor}</p>
                </div>
                <div class="code-block-container">
                  <div class="code-block-header" style="padding: 0.4rem 0.8rem;">
                    <span class="code-filename" style="font-size: 0.72rem;">Command</span>
                    <button class="copy-btn" onclick="copyToClipboard('${m.cmd}', this)">Copy</button>
                  </div>
                  <pre style="padding: 0.8rem; font-size: 0.8rem;"><code>${m.cmd}</code></pre>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Verify REST API -->
        <div style="margin-top: 2rem;">
          <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem;">${data.sections[0].verifyApi.title}</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem;">${data.sections[0].verifyApi.desc}</p>
          <div class="code-block-container">
            <div class="code-block-header">
              <span class="code-filename">Test with cURL</span>
              <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(data.sections[0].verifyApi.curlCommand)}\`, this)">Copy</button>
            </div>
            <pre><code>${escapeHtml(data.sections[0].verifyApi.curlCommand)}</code></pre>
          </div>
        </div>
      </div>

      <!-- Step 2: Java 21 & Maven -->
      <div class="setup-card" id="step-java">
        <div class="setup-card-header">
          <div class="setup-step-icon">☕</div>
          <div>
            <h3>${data.sections[1].title}</h3>
            <p>${data.sections[1].description}</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${data.sections[1].details.map(d => `
            <div>
              <h5 style="color: var(--text-main); margin-bottom: 0.4rem;">${d.title}</h5>
              <div class="code-block-container">
                <div class="code-block-header">
                  <span class="code-filename">Terminal</span>
                  <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(d.code)}\`, this)">Copy</button>
                </div>
                <pre><code>${escapeHtml(d.code)}</code></pre>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Step 3: Spring Initializr -->
      <div class="setup-card" id="step-spring">
        <div class="setup-card-header">
          <div class="setup-step-icon">🌱</div>
          <div>
            <h3>${data.sections[2].title}</h3>
            <p>${data.sections[2].description}</p>
          </div>
        </div>

        <div class="code-block-container">
          <div class="code-block-header">
            <span class="code-filename">Generate via Terminal CLI</span>
            <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(data.sections[2].cliCommand)}\`, this)">Copy</button>
          </div>
          <pre><code>${escapeHtml(data.sections[2].cliCommand)}</code></pre>
        </div>

        <div style="margin-top: 1.5rem;">
          <h5 style="color: var(--text-main); margin-bottom: 0.5rem;">Recommended pom.xml Configuration:</h5>
          <div class="code-block-container">
            <div class="code-block-header">
              <span class="code-filename">pom.xml</span>
              <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(data.sections[2].pomSnippet)}\`, this)">Copy</button>
            </div>
            <pre><code class="language-xml">${escapeHtml(data.sections[2].pomSnippet)}</code></pre>
          </div>
        </div>
      </div>

      <!-- Step 4: application.yml -->
      <div class="setup-card">
        <div class="setup-card-header">
          <div class="setup-step-icon">⚙️</div>
          <div>
            <h3>${data.sections[3].title}</h3>
            <p>${data.sections[3].description}</p>
          </div>
        </div>

        <div class="code-block-container">
          <div class="code-block-header">
            <span class="code-filename">src/main/resources/application.yml</span>
            <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(data.sections[3].ymlContent)}\`, this)">Copy</button>
          </div>
          <pre><code class="language-yaml">${escapeHtml(data.sections[3].ymlContent)}</code></pre>
        </div>
      </div>

      <!-- Step 5: Smoke Test -->
      <div class="setup-card">
        <div class="setup-card-header">
          <div class="setup-step-icon">🔥</div>
          <div>
            <h3>${data.sections[4].title}</h3>
            <p>${data.sections[4].description}</p>
          </div>
        </div>

        <div class="code-block-container">
          <div class="code-block-header">
            <span class="code-filename">SetupVerificationController.java</span>
            <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(data.sections[4].javaCode)}\`, this)">Copy</button>
          </div>
          <pre><code class="language-java">${escapeHtml(data.sections[4].javaCode)}</code></pre>
        </div>

        <div style="margin-top: 1.25rem;">
          <div class="code-block-container">
            <div class="code-block-header">
              <span class="code-filename">Verify with cURL</span>
              <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(data.sections[4].testCmd)}\`, this)">Copy</button>
            </div>
            <pre><code>${escapeHtml(data.sections[4].testCmd)}</code></pre>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchOsTab(os) {
  state.activeOsTab = os;
  const osTab = setupGuideData.sections[0].osTabs.find(t => t.os === os);
  const container = document.getElementById('os-tab-content');
  if (container) {
    container.innerHTML = renderOsTabContent(osTab);
  }
  document.querySelectorAll('.os-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === os);
  });
}

function renderOsTabContent(tab) {
  if (!tab) return '';
  return `
    <div style="display: flex; flex-direction: column; gap: 0.75rem; background: rgba(0,0,0,0.25); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
      ${tab.steps.map((s, idx) => {
        if (s.includes('\n') || s.startsWith('winget') || s.startsWith('curl') || s.startsWith('ollama') || s.startsWith('brew') || s.startsWith('sudo')) {
          return `
            <div class="code-block-container" style="margin: 0.25rem 0;">
              <div class="code-block-header" style="padding: 0.4rem 0.8rem;">
                <span class="code-filename" style="font-size: 0.72rem;">Step ${idx + 1}</span>
                <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(s)}\`, this)">Copy</button>
              </div>
              <pre style="padding: 0.75rem;"><code>${escapeHtml(s)}</code></pre>
            </div>
          `;
        }
        return `<p style="font-size: 0.95rem; color: var(--text-muted);"><strong style="color: var(--emerald-accent);">${idx + 1}.</strong> ${s}</p>`;
      }).join('')}
    </div>
  `;
}

// Render Capstone Projects
function renderProjects() {
  const container = document.getElementById('projects-content');
  if (!container) return;

  container.innerHTML = projectsData.map(project => `
    <div class="project-container" id="${project.id}" style="margin-bottom: 4rem;">
      <div class="project-hero">
        <span class="project-badge">${project.badge}</span>
        <h2 class="project-title">${project.title}</h2>
        <p class="project-tagline">${project.tagline}</p>
        
        <div class="project-meta-pills" style="margin-bottom: 1.5rem;">
          <span class="meta-pill">⏱️ ${project.duration}</span>
          <span class="meta-pill">🎯 Difficulty: ${project.difficulty}</span>
          <span class="meta-pill">🧠 Ollama Local LLM</span>
        </div>

        <p style="font-size: 1rem; color: #cbd5e1; line-height: 1.6; max-width: 950px; margin-bottom: 1.5rem;">
          ${project.overview}
        </p>

        <h4 style="font-size: 1rem; color: var(--text-highlight); margin-bottom: 0.5rem;">🏗️ Architectural Stack:</h4>
        <ul class="lab-theory-list">
          ${project.architecture.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>

      <div class="project-steps">
        ${project.steps.map(step => `
          <div class="step-card">
            <div class="step-card-header">
              <span class="step-number">${step.stepNumber}</span>
              <h4>${step.title}</h4>
            </div>
            <p class="step-explanation">${step.explanation}</p>

            ${step.code ? `
              <div class="code-block-container">
                <div class="code-block-header">
                  <span class="code-filename">Implementation Snippet</span>
                  <button class="copy-btn" onclick="copyToClipboard(\`${escapeForCode(step.code)}\`, this)">📋 Copy Code</button>
                </div>
                <pre><code>${escapeHtml(step.code)}</code></pre>
              </div>
            ` : ''}

            ${step.deploymentRoadmap ? `
              <div class="cloud-deploy-box">
                <h4>☁️ 100% Step-by-Step 1-Month Free Cloud Deployment Guide</h4>
                <p>Deploy your full-stack Spring AI screener app to the public cloud with $0 bill:</p>
                <div class="cloud-options-grid">
                  ${step.deploymentRoadmap.map(opt => `
                    <div class="cloud-option-card">
                      <h5>${opt.platform}</h5>
                      <span class="cloud-spec-badge">${opt.cost}</span>
                      <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.75rem;"><strong>Specs:</strong> ${opt.specs}</p>
                      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${opt.steps.map(s => {
                          if (s.includes('\n') || s.startsWith('git') || s.startsWith('curl')) {
                            return `<pre style="padding: 0.6rem; font-size: 0.78rem; background: #000; border-radius: 6px;"><code>${escapeHtml(s)}</code></pre>`;
                          }
                          return `<p style="font-size: 0.82rem; color: #cbd5e1;">${s}</p>`;
                        }).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('<hr style="border: 0; border-top: 1px dashed var(--border-subtle); margin: 3rem 0;">');
}

// Interactive Configurator
function initConfigurator() {
  const modelSelect = document.getElementById('cfg-model');
  const tempRange = document.getElementById('cfg-temp');
  const tempVal = document.getElementById('cfg-temp-val');
  const topPRange = document.getElementById('cfg-topp');
  const topPVal = document.getElementById('cfg-topp-val');
  const portInput = document.getElementById('cfg-port');
  const systemPrompt = document.getElementById('cfg-system');

  if (!modelSelect || !tempRange) return;

  function updateOutput() {
    const model = modelSelect.value;
    const temp = tempRange.value;
    const topP = topPRange.value;
    const port = portInput.value || 11434;
    const sys = systemPrompt.value;

    tempVal.textContent = temp;
    topPVal.textContent = topP;

    const yamlOutput = `spring:
  ai:
    ollama:
      base-url: http://localhost:${port}
      chat:
        options:
          model: ${model}
          temperature: ${temp}
          top-p: ${topP}`;

    const javaOutput = `@Bean
public ChatClient customChatClient(ChatClient.Builder builder) {
    return builder
        .defaultSystem("""
            ${sys}
            """)
        .build();
}`;

    const yamlEl = document.getElementById('cfg-yaml-preview');
    const javaEl = document.getElementById('cfg-java-preview');

    if (yamlEl) yamlEl.textContent = yamlOutput;
    if (javaEl) javaEl.textContent = javaOutput;
  }

  modelSelect.addEventListener('change', updateOutput);
  tempRange.addEventListener('input', updateOutput);
  topPRange.addEventListener('input', updateOutput);
  portInput.addEventListener('input', updateOutput);
  systemPrompt.addEventListener('input', updateOutput);

  updateOutput();
}

// Event Listeners
function initEventListeners() {
  // Search input
  const searchInput = document.getElementById('curriculum-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderCurriculum();
    });
  }

  // Filter Pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFilter = pill.dataset.filter;
      renderCurriculum();
    });
  });

  // Modal ESC handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDayModal();
  });

  // Close modal when clicking on overlay background
  const modalOverlay = document.getElementById('day-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeDayModal();
    });
  }
}

// Helper Utilities
function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
    if (btnElement) {
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = '✓ Copied';
      setTimeout(() => {
        btnElement.innerHTML = originalText;
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy', err);
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeForCode(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}
