import './style.css';

// Cuadrantes con títulos limpios
const QUADRANTS = [
  {
    id: 'hacer',
    title: 'HACER',
    cssClass: 'quadrant-hacer',
    importance: 'alta',
    urgency: 'alta'
  },
  {
    id: 'programar',
    title: 'PROGRAMAR',
    cssClass: 'quadrant-programar',
    importance: 'alta',
    urgency: 'baja'
  },
  {
    id: 'delegar',
    title: 'DELEGAR',
    cssClass: 'quadrant-delegar',
    importance: 'baja',
    urgency: 'alta'
  },
  {
    id: 'eliminar',
    title: 'ELIMINAR',
    cssClass: 'quadrant-eliminar',
    importance: 'baja',
    urgency: 'baja'
  }
];

const STORAGE_KEY = 'eisenhower_tasks_modern_v1';

let tasks = [];
let currentImportance = 'alta'; // 'alta' | 'baja'
let currentUrgency = 'alta';     // 'alta' | 'baja'

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      tasks = JSON.parse(raw);
    } else {
      tasks = [
        {
          id: 't-1',
          text: 'Entrega prioritaria de informe ejecutivo',
          quadrant: 'hacer',
          completed: false
        },
        {
          id: 't-2',
          text: 'Planificar metas y estrategia del trimestre',
          quadrant: 'programar',
          completed: false
        },
        {
          id: 't-3',
          text: 'Responder correos de rutina y reservas de sala',
          quadrant: 'delegar',
          completed: false
        },
        {
          id: 't-4',
          text: 'Depurar suscripciones obsoletas',
          quadrant: 'eliminar',
          completed: false
        }
      ];
      saveTasks();
    }
  } catch (e) {
    console.error('Error al cargar tareas:', e);
    tasks = [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error al guardar tareas:', e);
  }
}

function getQuadrantByLevels(imp, urg) {
  if (imp === 'alta' && urg === 'alta') return 'hacer';
  if (imp === 'alta' && urg === 'baja') return 'programar';
  if (imp === 'baja' && urg === 'alta') return 'delegar';
  return 'eliminar';
}

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- ENCABEZADO RESALTADO / CASILLA DE ENTRADA -->
    <section class="task-creator-section">
      <div class="creator-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span>Nueva Tarea</span>
      </div>

      <!-- Recuadro resaltado con efecto glassmorphism, resplandor y sombra -->
      <div class="creator-input-box" id="draggable-creator-box" draggable="true" title="Escribe tu tarea y arrastra este recuadro hacia la cuadrícula correcta, o pulsa Asignar">
        <div class="textarea-container">
          <textarea 
            id="new-task-text" 
            class="creator-textarea" 
            placeholder="Escriba aquí la tarea a designar..."
            rows="2"
          ></textarea>
        </div>

        <div class="creator-controls">
          <div class="switches-group">
            <!-- Slider IMPORTANCIA: degrade ALTA (verde) a BAJA (turquesa) -->
            <div class="switch-row">
              <span class="switch-label-name">IMPORTANCIA:</span>
              <span class="level-text level-left ${currentImportance === 'alta' ? 'active' : ''}">ALTA</span>
              <div class="modern-slider-track slider-importance ${currentImportance === 'alta' ? 'pos-alta' : 'pos-baja'}" id="toggle-importance" role="button" tabindex="0" title="Deslizar para alternar entre ALTA y BAJA">
                <div class="slider-knob"></div>
              </div>
              <span class="level-text level-right ${currentImportance === 'baja' ? 'active' : ''}">BAJA</span>
            </div>

            <!-- Slider URGENCIA: alineado perfectamente con IMPORTANCIA -->
            <div class="switch-row">
              <span class="switch-label-name">URGENCIA:</span>
              <span class="level-text level-left ${currentUrgency === 'alta' ? 'active' : ''}">URGENTE</span>
              <div class="modern-slider-track slider-urgency ${currentUrgency === 'alta' ? 'pos-alta' : 'pos-baja'}" id="toggle-urgency" role="button" tabindex="0" title="Deslizar para alternar entre URGENTE y NO URGENTE">
                <div class="slider-knob"></div>
              </div>
              <span class="level-text level-right ${currentUrgency === 'baja' ? 'active' : ''}">NO URGENTE</span>
            </div>
          </div>

          <div class="creator-actions">
            <button class="btn-assign-modern" id="btn-add-task">
              <span>+ Asignar a <b id="target-quadrant-name">${getQuadrantByLevels(currentImportance, currentUrgency).toUpperCase()}</b></span>
            </button>
            <span class="drag-hint-pill">✋ O arrastra este bloque</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTENEDOR DE LA MATRIZ TOTALMENTE CENTRADA -->
    <div class="matrix-layout-container">
      
      <!-- Cuadrículas centrales (2x2) -->
      <div class="matrix-grid" id="matrix-grid">
        ${QUADRANTS.map(q => renderQuadrantHTML(q)).join('')}
      </div>

      <!-- MARGEN DERECHO: 2 Flechas alineadas verticalmente en cápsula -->
      <aside class="right-arrows-margin" aria-label="Eje de Importancia">
        <!-- Hacia arriba: IMPORTANTE -->
        <div class="center-arrow-box-v">
          <div class="stream-arrow-pill-vertical arrow-up-important" title="Nivel alto de importancia">
            <div class="arrow-icon-circle-v">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </div>
            <div class="vertical-text-wrap">IMPORTANTE</div>
          </div>
        </div>

        <!-- Hacia abajo: NO IMPORTANTE -->
        <div class="center-arrow-box-v">
          <div class="stream-arrow-pill-vertical arrow-down-not-important" title="Nivel bajo de importancia">
            <div class="vertical-text-wrap">NO IMPORTANTE</div>
            <div class="arrow-icon-circle-v">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </aside>

      <!-- MARGEN INFERIOR: Flechas horizontales (URGENTE / NO URGENTE) -->
      <footer class="bottom-arrows-margin" aria-label="Eje de Urgencia">
        <!-- Hacia la izquierda: URGENTE -->
        <div class="center-arrow-box-h">
          <div class="stream-arrow-pill-horizontal arrow-left-urgent" title="Nivel alto de urgencia">
            <div class="arrow-icon-circle-h">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </div>
            <span>URGENTE</span>
          </div>
        </div>

        <!-- Hacia la derecha: NO URGENTE -->
        <div class="center-arrow-box-h">
          <div class="stream-arrow-pill-horizontal arrow-right-not-urgent" title="Nivel bajo de urgencia">
            <span>NO URGENTE</span>
            <div class="arrow-icon-circle-h">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </footer>

    </div>
  `;

  bindEventListeners();
  renderTasksIntoQuadrants();
}

function renderQuadrantHTML(q) {
  return `
    <div class="quadrant-box ${q.cssClass}" data-quadrant-id="${q.id}" id="quadrant-${q.id}">
      <div class="quadrant-header">
        <span class="q-title">${q.title}</span>
        <span class="q-counter" id="count-${q.id}">0</span>
      </div>
      <div class="quadrant-body" id="body-${q.id}">
        <!-- Tareas dinámicas -->
      </div>
      <div class="quick-add-row">
        <input 
          type="text" 
          class="quick-add-input" 
          data-quadrant="${q.id}" 
          placeholder="+ Escribir en ${q.title}..."
        />
        <button class="btn-quick-add" data-quadrant="${q.id}">+</button>
      </div>
    </div>
  `;
}

function renderTasksIntoQuadrants() {
  QUADRANTS.forEach(q => {
    const body = document.getElementById(`body-${q.id}`);
    const counter = document.getElementById(`count-${q.id}`);
    if (!body) return;

    const qTasks = tasks.filter(t => t.quadrant === q.id);
    if (counter) counter.textContent = qTasks.length;

    body.innerHTML = qTasks.map(t => `
      <div class="task-card ${t.completed ? 'completed' : ''}" draggable="true" data-task-id="${t.id}">
        <input type="checkbox" class="task-checkbox" data-task-id="${t.id}" ${t.completed ? 'checked' : ''} />
        <div class="task-content">
          <div class="task-text">${escapeHTML(t.text)}</div>
        </div>
        <div class="task-actions">
          <button class="btn-card-del" data-task-id="${t.id}" title="Eliminar tarea">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  });

  setupCardDragAndDrop();
}

function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

function updateSlidersUI() {
  const toggleImp = document.getElementById('toggle-importance');
  const toggleUrg = document.getElementById('toggle-urgency');
  const targetLabel = document.getElementById('target-quadrant-name');

  if (toggleImp) {
    toggleImp.className = `modern-slider-track slider-importance ${currentImportance === 'alta' ? 'pos-alta' : 'pos-baja'}`;
    const row = toggleImp.closest('.switch-row');
    if (row) {
      const levels = row.querySelectorAll('.level-text');
      levels[0].classList.toggle('active', currentImportance === 'alta');
      levels[1].classList.toggle('active', currentImportance === 'baja');
    }
  }

  if (toggleUrg) {
    toggleUrg.className = `modern-slider-track slider-urgency ${currentUrgency === 'alta' ? 'pos-alta' : 'pos-baja'}`;
    const row = toggleUrg.closest('.switch-row');
    if (row) {
      const levels = row.querySelectorAll('.level-text');
      levels[0].classList.toggle('active', currentUrgency === 'alta');
      levels[1].classList.toggle('active', currentUrgency === 'baja');
    }
  }

  if (targetLabel) {
    targetLabel.textContent = getQuadrantByLevels(currentImportance, currentUrgency).toUpperCase();
  }
}

function bindEventListeners() {
  const toggleImp = document.getElementById('toggle-importance');
  if (toggleImp) {
    toggleImp.addEventListener('click', () => {
      currentImportance = currentImportance === 'alta' ? 'baja' : 'alta';
      updateSlidersUI();
    });
  }

  const toggleUrg = document.getElementById('toggle-urgency');
  if (toggleUrg) {
    toggleUrg.addEventListener('click', () => {
      currentUrgency = currentUrgency === 'alta' ? 'baja' : 'alta';
      updateSlidersUI();
    });
  }

  const btnAdd = document.getElementById('btn-add-task');
  const taskText = document.getElementById('new-task-text');

  if (btnAdd && taskText) {
    btnAdd.addEventListener('click', () => {
      const text = taskText.value.trim();
      if (!text) {
        taskText.focus();
        return;
      }
      const targetQuadrant = getQuadrantByLevels(currentImportance, currentUrgency);
      tasks.push({
        id: 'task_' + Date.now(),
        text,
        quadrant: targetQuadrant,
        completed: false
      });
      saveTasks();
      taskText.value = '';
      renderTasksIntoQuadrants();
    });

    taskText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        btnAdd.click();
      }
    });
  }

  const creatorBox = document.getElementById('draggable-creator-box');
  if (creatorBox && taskText) {
    creatorBox.addEventListener('dragstart', (e) => {
      const text = taskText.value.trim();
      if (!text) {
        e.preventDefault();
        taskText.focus();
        return;
      }
      creatorBox.classList.add('dragging');
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: 'new-task',
        text: text
      }));
    });

    creatorBox.addEventListener('dragend', () => {
      creatorBox.classList.remove('dragging');
    });
  }

  const matrixGrid = document.getElementById('matrix-grid');
  if (matrixGrid) {
    matrixGrid.addEventListener('click', (e) => {
      const chk = e.target.closest('.task-checkbox');
      if (chk) {
        const taskId = chk.dataset.taskId;
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = chk.checked;
          saveTasks();
          renderTasksIntoQuadrants();
        }
        return;
      }

      const delBtn = e.target.closest('.btn-card-del');
      if (delBtn) {
        const taskId = delBtn.dataset.taskId;
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasksIntoQuadrants();
        return;
      }

      const quickBtn = e.target.closest('.btn-quick-add');
      if (quickBtn) {
        const qId = quickBtn.dataset.quadrant;
        const input = quickBtn.parentElement.querySelector('.quick-add-input');
        if (input && input.value.trim()) {
          tasks.push({
            id: 'task_' + Date.now(),
            text: input.value.trim(),
            quadrant: qId,
            completed: false
          });
          input.value = '';
          saveTasks();
          renderTasksIntoQuadrants();
        }
      }
    });

    matrixGrid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('quick-add-input')) {
        const input = e.target;
        const qId = input.dataset.quadrant;
        if (input.value.trim()) {
          tasks.push({
            id: 'task_' + Date.now(),
            text: input.value.trim(),
            quadrant: qId,
            completed: false
          });
          input.value = '';
          saveTasks();
          renderTasksIntoQuadrants();
        }
      }
    });

    QUADRANTS.forEach(q => {
      const qBox = document.getElementById(`quadrant-${q.id}`);
      if (!qBox) return;

      qBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        qBox.classList.add('drag-over');
      });

      qBox.addEventListener('dragleave', (e) => {
        if (!qBox.contains(e.relatedTarget)) {
          qBox.classList.remove('drag-over');
        }
      });

      qBox.addEventListener('drop', (e) => {
        e.preventDefault();
        qBox.classList.remove('drag-over');

        try {
          const raw = e.dataTransfer.getData('application/json');
          if (!raw) return;
          const data = JSON.parse(raw);

          if (data.type === 'new-task') {
            tasks.push({
              id: 'task_' + Date.now(),
              text: data.text,
              quadrant: q.id,
              completed: false
            });
            taskText.value = '';
            saveTasks();
            renderTasksIntoQuadrants();
          } else if (data.type === 'existing-task') {
            const task = tasks.find(t => t.id === data.taskId);
            if (task) {
              task.quadrant = q.id;
              saveTasks();
              renderTasksIntoQuadrants();
            }
          }
        } catch (err) {
          console.error('Error en drop:', err);
        }
      });
    });
  }
}

function setupCardDragAndDrop() {
  const cards = document.querySelectorAll('.task-card');
  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      const taskId = card.dataset.taskId;
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: 'existing-task',
        taskId: taskId
      }));
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });
}

// Inicialización
loadTasks();
renderApp();
