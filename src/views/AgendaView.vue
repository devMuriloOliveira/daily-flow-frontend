<template>
  <div class="agenda-page">
    <AppHeader />

    <section class="agenda-intro">
      <div class="agenda-intro__text">
        <h1 class="agenda-intro__title">Agenda</h1>
        <p class="agenda-intro__subtitle">
          Navegue pelo calendário e veja suas tarefas de cada dia.
        </p>
      </div>

      <router-link to="/dashboard" class="btn btn-ghost btn-sm agenda-intro__back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Dashboard
      </router-link>
    </section>

    <div class="agenda-layout">
      <section class="calendar-card">
        <div class="calendar-top">
          <button
            type="button"
            class="calendar-nav-btn"
            aria-label="Mês anterior"
            @click="previousMonth"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <h2 class="calendar-title">
            {{ monthName }} <span class="calendar-title__year">{{ currentYear }}</span>
          </h2>

          <button
            type="button"
            class="calendar-nav-btn"
            aria-label="Próximo mês"
            @click="nextMonth"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div class="week-days" aria-hidden="true">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        <div class="days-grid">
          <div
            v-for="blank in blankDays"
            :key="'blank-' + blank"
            class="day-card day-card--empty"
          ></div>

          <button
            v-for="day in daysInMonth"
            :key="day"
            type="button"
            class="day-card"
            :class="{
              'day-card--selected': isSelectedDay(day),
              'day-card--today': isToday(day),
            }"
            @click="selectDay(day)"
          >
            <span class="day-card__number">{{ day }}</span>
          </button>
        </div>
      </section>

      <section class="tasks-panel">
        <template v-if="selectedDateKey">
          <div class="tasks-panel__header">
            <div>
              <p class="tasks-panel__label">Tarefas do dia</p>
              <h2 class="tasks-panel__date">{{ selectedDayFormatted }}</h2>
            </div>
            <span class="tasks-panel__count" v-if="!loadingTasks && selectedTasks.length">
              {{ selectedTasks.length }}
            </span>
          </div>

          <div v-if="loadingTasks" class="empty-state">
            <div class="empty-state__spinner" aria-hidden="true"></div>
            <p>Carregando tarefas...</p>
          </div>

          <div v-else-if="selectedTasks.length === 0" class="empty-state">
            <div class="empty-state__icon" aria-hidden="true">📅</div>
            <p class="empty-state__title">Nenhuma tarefa para este dia</p>
            <p class="empty-state__hint">Selecione outro dia ou crie uma tarefa na Dashboard.</p>
          </div>

          <ul v-else class="agenda-task-list">
            <li
              v-for="task in selectedTasks"
              :key="task.id"
              class="agenda-task-card"
              :class="priorityClass(task.priority)"
            >
              <div class="agenda-task-card__time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {{ formatSchedule(task) }}
              </div>

              <h3 class="agenda-task-card__title">{{ task.title }}</h3>

              <div
                v-if="task.priority || task.category"
                class="agenda-task-card__meta"
              >
                <span
                  v-if="task.priority"
                  class="priority-badge"
                  :class="`priority-badge--${task.priority || 'medium'}`"
                >
                  <span class="priority-badge__dot"></span>
                  {{ formatPriorityLabel(task.priority) }}
                </span>

                <span v-if="task.category" class="category-badge">
                  {{ formatCategory(task) }}
                </span>
              </div>
            </li>
          </ul>
        </template>

        <div v-else class="empty-state empty-state--placeholder">
          <div class="empty-state__icon" aria-hidden="true">🗓️</div>
          <p class="empty-state__title">Selecione um dia</p>
          <p class="empty-state__hint">Clique em um dia do calendário para ver as tarefas.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "../services/api";
import AppHeader from "../components/AppHeader.vue";
import {
  formatSchedule,
  formatPriorityLabel,
  formatCategory,
} from "../utils/taskFormatters";

const currentDate = ref(new Date());
const selectedDateKey = ref(null);
const selectedTasks = ref([]);
const loadingTasks = ref(false);

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const monthName = computed(() => {
  return months[currentDate.value.getMonth()];
});

const currentYear = computed(() => {
  return currentDate.value.getFullYear();
});

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  return new Date(
    year,
    month + 1,
    0
  ).getDate();
});

const selectedDayFormatted = computed(() => {
  if (!selectedDateKey.value) return "";

  const [year, month, day] = selectedDateKey.value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
});

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
}

const blankDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  return new Date(year, month, 1).getDay();
});

function getDayDateKey(day) {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  return formatDate(year, month, day);
}

function isSelectedDay(day) {
  return selectedDateKey.value === getDayDateKey(day);
}

function isToday(day) {
  const today = new Date();
  const cellDate = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    day
  );

  return (
    cellDate.getDate() === today.getDate() &&
    cellDate.getMonth() === today.getMonth() &&
    cellDate.getFullYear() === today.getFullYear()
  );
}

function priorityClass(priority) {
  if (priority === "high") return "agenda-task-card--high";
  if (priority === "low") return "agenda-task-card--low";
  return "agenda-task-card--medium";
}

function formatDate(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");

  return `${year}-${m}-${d}`;
}

function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function selectDay(day) {
  const date = getDayDateKey(day);
  selectedDateKey.value = date;
  loadingTasks.value = true;

  try {
    const response = await api.get(`/tasks?date=${date}`, getAuthConfig());
    selectedTasks.value = response.data.tasks;
  } catch (error) {
    console.log(error);
    selectedTasks.value = [];
  } finally {
    loadingTasks.value = false;
  }
}
</script>

<style scoped>
.agenda-page {
  min-height: 100vh;
  padding: 20px 16px 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.agenda-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.agenda-intro__title {
  margin: 0 0 6px;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.agenda-intro__subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
  max-width: 420px;
}

.agenda-intro__back {
  flex-shrink: 0;
  text-decoration: none;
}

.agenda-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
}

.calendar-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.calendar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}

.calendar-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-align: center;
  flex: 1;
}

.calendar-title__year {
  color: var(--text-secondary);
  font-weight: 600;
}

.calendar-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--card-secondary);
  border: 1px solid var(--border);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.1s;
  flex-shrink: 0;
}

.calendar-nav-btn:hover {
  background: var(--card-hover);
  border-color: rgba(59, 130, 246, 0.4);
  color: var(--primary);
}

.calendar-nav-btn:active {
  transform: scale(0.96);
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.week-days span {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  padding: 6px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-card {
  aspect-ratio: 1;
  min-height: 44px;
  border-radius: 12px;
  background: var(--card-secondary);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
}

.day-card:hover:not(.day-card--empty) {
  background: var(--card-hover);
  border-color: rgba(59, 130, 246, 0.45);
  transform: translateY(-1px);
}

.day-card--empty {
  opacity: 0;
  pointer-events: none;
  border: none;
  background: transparent;
}

.day-card--today:not(.day-card--selected) {
  border-color: rgba(59, 130, 246, 0.55);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.day-card--today .day-card__number {
  color: var(--primary);
}

.day-card--selected {
  background: rgba(59, 130, 246, 0.18);
  border-color: var(--primary);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(59, 130, 246, 0.2);
}

.day-card--selected .day-card__number {
  color: #fff;
}

.tasks-panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  min-height: 280px;
}

.tasks-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.tasks-panel__label {
  margin: 0 0 4px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary);
}

.tasks-panel__date {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-transform: capitalize;
}

.tasks-panel__count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border-radius: 99px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 36px 20px;
  color: var(--text-secondary);
}

.empty-state--placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.empty-state__icon {
  font-size: 2.25rem;
  margin-bottom: 12px;
  line-height: 1;
}

.empty-state__title {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.empty-state__hint {
  margin: 0;
  font-size: 0.85rem;
  max-width: 260px;
  line-height: 1.5;
}

.empty-state__spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 14px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.agenda-task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agenda-task-card {
  background: var(--card-secondary);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  border-left: 3px solid var(--priority-medium);
  transition: border-color 0.2s, background 0.2s;
}

.agenda-task-card--high {
  border-left-color: var(--priority-high);
}

.agenda-task-card--medium {
  border-left-color: var(--priority-medium);
}

.agenda-task-card--low {
  border-left-color: var(--priority-low);
}

.agenda-task-card__time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.agenda-task-card__title {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.agenda-task-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.priority-badge--high {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.25);
}

.priority-badge--low {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.25);
}

.priority-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

@media (min-width: 900px) {
  .agenda-layout {
    grid-template-columns: 1.05fr 0.95fr;
    gap: 24px;
  }

  .tasks-panel {
    position: sticky;
    top: 20px;
  }
}

@media (max-width: 600px) {
  .agenda-page {
    padding: 14px 12px 32px;
  }

  .agenda-intro {
    flex-direction: column;
    align-items: stretch;
  }

  .agenda-intro__back {
    align-self: flex-start;
  }

  .calendar-card,
  .tasks-panel {
    padding: 18px 14px;
    border-radius: 16px;
  }

  .calendar-nav-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .days-grid {
    gap: 5px;
  }

  .day-card {
    min-height: 38px;
    border-radius: 10px;
    font-size: 0.82rem;
  }

  .week-days span {
    font-size: 0.65rem;
  }
}
</style>
