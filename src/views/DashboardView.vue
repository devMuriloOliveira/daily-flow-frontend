<template>
  <div class="dashboard">
    <AppHeader />

    <div class="dashboard__welcome">
      <h1 v-if="user" class="dashboard__greeting">Olá, {{ user.name }}</h1>
      <p class="dashboard__date">{{ selectedDateFormatted }}</p>
    </div>

    <div class="card dashboard__progress">
      <div class="progress-stats">
        <div class="progress-stat">
          <span class="progress-stat__value">{{ totalTasks }}</span>
          <span class="progress-stat__label">Total</span>
        </div>
        <div class="progress-stat">
          <span class="progress-stat__value">{{ completedTasks }}</span>
          <span class="progress-stat__label">Concluídas</span>
        </div>
        <div class="progress-stat">
          <span class="progress-stat__value">{{ progressPercent }}%</span>
          <span class="progress-stat__label">Progresso</span>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" :style="{ width: progressPercent + '%' }"></div>
        <div
          class="progress-bar__goal"
          :style="{ left: dailyCompletionGoal + '%' }"
          :aria-label="`Meta diária: ${dailyCompletionGoal}%`"
        ></div>
      </div>
      <div class="progress-meta">
        <span>Meta diária: {{ dailyCompletionGoal }}%</span>
        <router-link to="/settings" class="progress-meta__link">Editar</router-link>
      </div>
      <p class="progress-feedback" :class="{ 'progress-feedback--success': goalReached }">
        {{ progressFeedback }}
      </p>
    </div>

    <nav class="day-nav">
      <button class="btn btn-ghost btn-sm day-nav__btn" @click="goToPreviousDay">
        ← Anterior
      </button>
      <button
        class="btn btn-sm"
        :class="isToday ? 'btn-primary' : 'btn-ghost'"
        @click="goToToday"
      >
        Hoje
      </button>
      <button class="btn btn-ghost btn-sm day-nav__btn" @click="goToNextDay">
        Próximo →
      </button>
    </nav>

    <section class="tasks-section">
      <div class="tasks-section__header">
        <h2 class="tasks-section__title">Tarefas do dia</h2>
        <router-link to="/create-task" class="btn btn-primary btn-sm tasks-section__new-btn">
          + Nova tarefa
        </router-link>
      </div>

      <div v-if="loading" class="empty-state">
        <p>Carregando tarefas...</p>
      </div>

      <div v-else-if="tasks.length === 0" class="empty-state">
        <div class="empty-state__icon">✨</div>
        <p>Nenhuma tarefa para este dia.</p>
        <p class="empty-state__hint">Adicione uma tarefa à sua rotina.</p>
      </div>

      <template v-else>
        <div v-if="tasksWithTime.length" class="task-group">
          <h3 class="task-group__title">Com horário</h3>
          <ul class="task-list">
            <TaskCard
              v-for="task in tasksWithTime"
              :key="task.id"
              :task="task"
              :expanded="expandedTaskId === task.id"
              @toggle="toggleTask"
              @toggle-details="toggleDetails"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </ul>
        </div>

        <div v-if="tasksWithoutTime.length" class="task-group">
          <h3 class="task-group__title">Sem horário</h3>
          <ul class="task-list">
            <TaskCard
              v-for="task in tasksWithoutTime"
              :key="task.id"
              :task="task"
              :expanded="expandedTaskId === task.id"
              @toggle="toggleTask"
              @toggle-details="toggleDetails"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </ul>
        </div>
      </template>

      <p
        v-if="message"
        class="message"
        :class="messageType === 'success' ? 'message--success' : 'message--error'"
      >
        {{ message }}
      </p>
    </section>

    <router-link to="/create-task" class="fab" aria-label="Criar tarefa">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../services/api";
import AppHeader from "../components/AppHeader.vue";
import TaskCard from "../components/TaskCard.vue";
import { hasTaskTime } from "../utils/taskFormatters";
import {
  calculateDailyProgress,
  calculateTasksNeededForGoal,
} from "../utils/progress";

const router = useRouter();
const route = useRoute();

const user = ref(null);
const tasks = ref([]);
const selectedDate = ref(startOfDay(new Date()));
const loading = ref(false);
const message = ref("");
const messageType = ref("error");
const expandedTaskId = ref(null);

const selectedDateString = computed(() => toDateString(selectedDate.value));

const selectedDateFormatted = computed(() => {
  return selectedDate.value.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const isToday = computed(() => {
  return selectedDateString.value === toDateString(new Date());
});

const totalTasks = computed(() => tasks.value.length);

const completedTasks = computed(
  () => tasks.value.filter((task) => task.isCompleted).length
);

const dailyCompletionGoal = computed(() => user.value?.dailyCompletionGoal || 70);

const dailyProgress = computed(() =>
  calculateDailyProgress(tasks.value, dailyCompletionGoal.value)
);

const progressPercent = computed(() => dailyProgress.value.progressPercent);

const goalReached = computed(() => dailyProgress.value.goalReached);

const tasksNeededForGoal = computed(() =>
  calculateTasksNeededForGoal(tasks.value, dailyCompletionGoal.value)
);

const progressFeedback = computed(() => {
  if (totalTasks.value === 0) {
    return "Nenhuma tarefa cadastrada para hoje.";
  }

  if (goalReached.value) {
    return `Bom trabalho! Você concluiu ${progressPercent.value}% das tarefas de hoje. Sua meta era ${dailyCompletionGoal.value}%.`;
  }

  const missing = tasksNeededForGoal.value;
  const suffix =
    missing > 0
      ? ` Falta concluir mais ${missing} ${missing === 1 ? "tarefa" : "tarefas"} para atingir sua meta de hoje.`
      : "";

  return `Você concluiu ${progressPercent.value}% das tarefas. Sua meta diária é ${dailyCompletionGoal.value}%.${suffix}`;
});

const tasksWithTime = computed(() => {
  return tasks.value
    .filter(hasTaskTime)
    .sort((a, b) => a.time.localeCompare(b.time));
});

const tasksWithoutTime = computed(() => {
  return tasks.value.filter((task) => !hasTaskTime(task));
});

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function toggleDetails(id) {
  expandedTaskId.value = expandedTaskId.value === id ? null : id;
}

function handleEdit(taskId) {
  router.push(`/edit-task/${taskId}`);
}

async function handleDelete(taskId) {
  const task = tasks.value.find((item) => item.id === taskId);
  const taskTitle = task?.title || "esta tarefa";

  const confirmed = window.confirm(
    `Deseja excluir "${taskTitle}"? Esta ação não pode ser desfeita.`
  );

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/tasks/${taskId}`, getAuthConfig());
    expandedTaskId.value = null;
    messageType.value = "success";
    message.value = "Tarefa excluída com sucesso.";
    await loadTasks();
  } catch (error) {
    messageType.value = "error";
    message.value = error.response?.data?.message || "Erro ao excluir tarefa.";
  }
}

async function loadUser() {
  try {
    const response = await api.get("/users/me", getAuthConfig());
    user.value = response.data.user;
  } catch (error) {
    router.push("/login");
  }
}

async function loadTasks() {
  loading.value = true;
  message.value = "";

  try {
    const response = await api.get(
      `/tasks?date=${selectedDateString.value}`,
      getAuthConfig()
    );
    tasks.value = response.data.tasks;
  } catch (error) {
    messageType.value = "error";
    message.value = "Erro ao carregar tarefas.";
  } finally {
    loading.value = false;
  }
}

async function toggleTask(id) {
  try {
    await api.patch(
      `/tasks/${id}/toggle`,
      { date: selectedDateString.value },
      getAuthConfig()
    );

    await loadTasks();
  } catch (error) {
    console.log(error);
    messageType.value = "error";
    message.value =
      error.response?.data?.message || "Erro ao atualizar tarefa.";
  }
}

function goToPreviousDay() {
  const d = new Date(selectedDate.value);
  d.setDate(d.getDate() - 1);
  selectedDate.value = startOfDay(d);
  expandedTaskId.value = null;
  loadTasks();
}

function goToToday() {
  selectedDate.value = startOfDay(new Date());
  expandedTaskId.value = null;
  loadTasks();
}

function goToNextDay() {
  const d = new Date(selectedDate.value);
  d.setDate(d.getDate() + 1);
  selectedDate.value = startOfDay(d);
  expandedTaskId.value = null;
  loadTasks();
}

onMounted(() => {
  if (route.query.success === "updated") {
    messageType.value = "success";
    message.value = "Tarefa atualizada com sucesso.";
    router.replace({ path: "/dashboard" });
  }

  loadUser();
  loadTasks();
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 20px 16px 96px;
  max-width: 720px;
  margin: 0 auto;
}

.dashboard__welcome {
  margin-bottom: 24px;
}

.dashboard__greeting {
  margin: 0 0 6px;
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.dashboard__date {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: capitalize;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.dashboard__progress {
  margin-bottom: 20px;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.progress-stat {
  text-align: center;
  padding: 14px 10px;
  background: var(--card-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.progress-stat__value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.progress-stat__label {
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-top: 2px;
}

.progress-bar {
  position: relative;
  height: 6px;
  background: var(--card-secondary);
  border-radius: 99px;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #60a5fa);
  border-radius: 99px;
  transition: width 0.4s ease;
}

.progress-bar__goal {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 14px;
  border-radius: 99px;
  background: #fbbf24;
  transform: translateX(-50%);
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.16);
}

.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 0.84rem;
}

.progress-meta__link {
  font-weight: 600;
  white-space: nowrap;
}

.progress-feedback {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.24);
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.progress-feedback--success {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.35);
  color: #86efac;
}

.day-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.day-nav__btn {
  flex: 1;
  max-width: 120px;
}

.tasks-section {
  margin-bottom: 20px;
}

.tasks-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.tasks-section__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.tasks-section__new-btn {
  display: none;
  text-decoration: none;
  flex-shrink: 0;
}

.task-group {
  margin-bottom: 20px;
}

.task-group:last-child {
  margin-bottom: 0;
}

.task-group__title {
  margin: 0 0 10px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary);
}

.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: var(--text-secondary);
  background: var(--card);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
}

.empty-state__icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.empty-state__hint {
  margin-top: 6px;
  font-size: 0.85rem;
  opacity: 0.85;
}

.message {
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.message--error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.message--success {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #86efac;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(59, 130, 246, 0.4);
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  z-index: 100;
}

.fab:hover {
  background: var(--primary-hover);
  transform: scale(1.05);
  box-shadow: 0 6px 28px rgba(59, 130, 246, 0.5);
  color: #fff;
}

@media (min-width: 601px) {
  .tasks-section__new-btn {
    display: inline-flex;
  }

  .fab {
    display: none;
  }
}

@media (max-width: 600px) {
  .dashboard {
    padding: 14px 12px 88px;
  }

  .card {
    padding: 16px;
  }

  .progress-stats {
    grid-template-columns: 1fr;
  }

  .day-nav {
    flex-wrap: wrap;
  }

  .day-nav__btn {
    max-width: none;
    flex: 1;
  }

  .fab {
    right: 16px;
    bottom: 16px;
  }
}
</style>
