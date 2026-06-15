<template>
  <div class="page-dashboard">
    <header class="dashboard-header">
      <router-link to="/dashboard" class="btn btn-ghost btn-sm back-link">
        ← Voltar
      </router-link>
      <span class="page-header-title">{{ isEditMode ? "Editar tarefa" : "Nova tarefa" }}</span>
      <span class="header-spacer"></span>
    </header>

    <div v-if="loadingTask" class="card section-card loading-state">
      <p>Carregando tarefa...</p>
    </div>

    <div v-else class="card section-card">
      <form @submit.prevent="saveTask">
        <div class="form-group">
          <label class="form-label" for="title">Título</label>
          <input
            id="title"
            v-model="title"
            class="form-input"
            type="text"
            placeholder="Ex: Academia, Inglês, Reunião..."
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="description">Descrição</label>
          <textarea
            id="description"
            v-model="description"
            class="form-textarea"
            placeholder="Detalhes opcionais..."
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="priority">Prioridade</label>
            <select id="priority" v-model="priority" class="form-input">
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="category">Categoria</label>
            <select id="category" v-model="category" class="form-input">
              <option value="">Selecione...</option>
              <option
                v-for="cat in categoryOptions"
                :key="cat.value"
                :value="cat.value"
              >
                {{ cat.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <span class="form-label">Tipo da tarefa</span>
          <div class="task-type-toggle task-type-toggle--three">
            <button
              type="button"
              class="task-type-btn"
              :class="{ 'task-type-btn--active': recurrenceType === 'once' }"
              @click="recurrenceType = 'once'"
            >
              Apenas uma vez
            </button>
            <button
              type="button"
              class="task-type-btn"
              :class="{ 'task-type-btn--active': recurrenceType === 'week_days' }"
              @click="recurrenceType = 'week_days'"
            >
              Dias da semana
            </button>
            <button
              type="button"
              class="task-type-btn"
              :class="{ 'task-type-btn--active': recurrenceType === 'cycle' }"
              @click="recurrenceType = 'cycle'"
            >
              Ciclo flexível
            </button>
          </div>
        </div>

        <!-- Apenas uma vez -->
        <template v-if="recurrenceType === 'once'">
          <div class="form-group">
            <label class="form-label" for="date">Data</label>
            <input id="date" v-model="date" class="form-input" type="date" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="time">Horário de início</label>
              <input id="time" v-model="time" class="form-input" type="time" />
            </div>
            <div class="form-group">
              <label class="form-label" for="endTime">Horário de término</label>
              <input id="endTime" v-model="endTime" class="form-input" type="time" />
            </div>
          </div>
        </template>

        <!-- Dias da semana -->
        <template v-if="recurrenceType === 'week_days'">
          <div class="form-group">
            <span class="form-label">Dias da semana</span>
            <div class="weekday-grid">
              <button
                v-for="day in weekDayOptions"
                :key="day.value"
                type="button"
                class="weekday-chip"
                :class="{ 'weekday-chip--active': selectedWeekDays.includes(day.value) }"
                @click="toggleWeekDay(day.value)"
              >
                {{ day.label }}
              </button>
            </div>
            <button type="button" class="btn-link" @click="selectAllDays">
              Selecionar todos
            </button>
          </div>

          <div v-if="selectedWeekDays.length" class="form-group">
            <span class="form-label">Horários por dia</span>
            <div class="day-times-list">
              <div
                v-for="day in sortedSelectedWeekDays"
                :key="day"
                class="day-time-row"
              >
                <span class="day-time-label">{{ weekDayLabels[day] }}</span>
                <div class="day-time-inputs">
                  <input
                    v-model="weekDayTimes[day].time"
                    class="form-input"
                    type="time"
                    :aria-label="`Início ${weekDayLabels[day]}`"
                  />
                  <span class="day-time-separator">→</span>
                  <input
                    v-model="weekDayTimes[day].endTime"
                    class="form-input"
                    type="time"
                    :aria-label="`Término ${weekDayLabels[day]}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Ciclo flexível -->
        <template v-if="recurrenceType === 'cycle'">
          <div class="form-group">
            <label class="form-label" for="cycleStartDate">Data inicial</label>
            <input
              id="cycleStartDate"
              v-model="cycleStartDate"
              class="form-input"
              type="date"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="activeDays">Dias ativos</label>
              <input
                id="activeDays"
                v-model.number="activeDays"
                class="form-input"
                type="number"
                min="1"
                placeholder="Ex: 3"
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="restDays">Dias de descanso</label>
              <input
                id="restDays"
                v-model.number="restDays"
                class="form-input"
                type="number"
                min="1"
                placeholder="Ex: 1"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="cycleTime">Horário de início</label>
              <input id="cycleTime" v-model="time" class="form-input" type="time" />
            </div>

            <div class="form-group">
              <label class="form-label" for="cycleEndTime">Horário de término</label>
              <input id="cycleEndTime" v-model="endTime" class="form-input" type="time" />
            </div>
          </div>

          <p v-if="activeDays && restDays" class="cycle-hint">
            Exemplo: {{ activeDays }} {{ activeDays === 1 ? "dia ativo" : "dias ativos" }},
            {{ restDays }} {{ restDays === 1 ? "dia de descanso" : "dias de descanso" }}
          </p>
        </template>

        <button type="submit" class="btn btn-primary btn-block" :disabled="saving">
          {{ saving ? "Salvando..." : isEditMode ? "Salvar alterações" : "Salvar tarefa" }}
        </button>
      </form>

      <p
        v-if="message"
        class="message"
        :class="messageType === 'success' ? 'message-success' : 'message-error'"
      >
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../services/api";

const router = useRouter();
const route = useRoute();

const isEditMode = computed(() => route.path.startsWith("/edit-task"));
const taskId = computed(() => route.params.id);

const title = ref("");
const description = ref("");
const priority = ref("medium");
const category = ref("");
const recurrenceType = ref("week_days");

const date = ref("");
const time = ref("");
const endTime = ref("");

const selectedWeekDays = ref([]);
const weekDayTimes = reactive({});

const cycleStartDate = ref("");
const activeDays = ref(null);
const restDays = ref(null);

const message = ref("");
const messageType = ref("error");
const saving = ref(false);
const loadingTask = ref(false);

const weekDayOptions = [
  { value: "monday", label: "Seg" },
  { value: "tuesday", label: "Ter" },
  { value: "wednesday", label: "Qua" },
  { value: "thursday", label: "Qui" },
  { value: "friday", label: "Sex" },
  { value: "saturday", label: "Sáb" },
  { value: "sunday", label: "Dom" },
];

const weekDayLabels = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

const weekDayOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const categoryOptions = [
  { value: "academia", label: "Academia" },
  { value: "estudos", label: "Estudos" },
  { value: "trabalho", label: "Trabalho" },
  { value: "casa", label: "Casa" },
  { value: "financas", label: "Finanças" },
  { value: "pessoal", label: "Pessoal" },
];

const sortedSelectedWeekDays = computed(() => {
  return [...selectedWeekDays.value].sort(
    (a, b) => weekDayOrder.indexOf(a) - weekDayOrder.indexOf(b)
  );
});

function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function toInputDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date.getFullYear() < 1971) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

function clearWeekDayTimes() {
  Object.keys(weekDayTimes).forEach((day) => {
    delete weekDayTimes[day];
  });
}

function populateForm(task) {
  title.value = task.title || "";
  description.value = task.description || "";
  priority.value = task.priority || "medium";
  category.value = task.category || "";
  recurrenceType.value = task.recurrenceType || "week_days";

  date.value = "";
  time.value = task.time || "";
  endTime.value = task.endTime || "";
  selectedWeekDays.value = [];
  clearWeekDayTimes();

  cycleStartDate.value = "";
  activeDays.value = null;
  restDays.value = null;

  if (task.recurrenceType === "once") {
    date.value = toInputDate(task.date);
    time.value = task.time || "";
    endTime.value = task.endTime || "";
  }

  if (task.recurrenceType === "week_days") {
    const days = parseJson(task.weekDays, []);
    const times = parseJson(task.weekDayTimes, {});

    selectedWeekDays.value = days;

    days.forEach((day) => {
      weekDayTimes[day] = {
        time: times[day]?.time || "",
        endTime: times[day]?.endTime || "",
      };
    });
  }

  if (task.recurrenceType === "cycle") {
    cycleStartDate.value = toInputDate(task.cycleStartDate);
    activeDays.value = task.activeDays ?? null;
    restDays.value = task.restDays ?? null;
    time.value = task.time || "";
    endTime.value = task.endTime || "";
  }
}

async function loadTask() {
  if (!isEditMode.value) return;

  loadingTask.value = true;
  message.value = "";

  try {
    const response = await api.get(`/tasks/${taskId.value}`, getAuthConfig());
    populateForm(response.data.task);
  } catch (error) {
    messageType.value = "error";
    message.value = error.response?.data?.message || "Erro ao carregar tarefa.";
    router.push("/dashboard");
  } finally {
    loadingTask.value = false;
  }
}

function ensureDayTimeEntry(day) {
  if (!weekDayTimes[day]) {
    weekDayTimes[day] = { time: "", endTime: "" };
  }
}

function toggleWeekDay(day) {
  if (selectedWeekDays.value.includes(day)) {
    selectedWeekDays.value = selectedWeekDays.value.filter((d) => d !== day);
    delete weekDayTimes[day];
  } else {
    selectedWeekDays.value = [...selectedWeekDays.value, day];
    ensureDayTimeEntry(day);
  }
}

function selectAllDays() {
  selectedWeekDays.value = weekDayOptions.map((d) => d.value);
  selectedWeekDays.value.forEach(ensureDayTimeEntry);
}

function isEndTimeValid(start, end) {
  if (!end) return true;
  if (!start) return false;
  return end > start;
}

function buildWeekDayTimesPayload() {
  const payload = {};

  for (const day of selectedWeekDays.value) {
    const dayTime = weekDayTimes[day];
    payload[day] = {
      time: dayTime?.time || null,
      endTime: dayTime?.endTime || null,
    };
  }

  return payload;
}

function validateForm() {
  if (!title.value.trim()) {
    return "Preencha o título da tarefa.";
  }

  if (recurrenceType.value === "once") {
    if (!date.value) {
      return "Informe a data da tarefa.";
    }

    if (endTime.value && !time.value) {
      return "Informe o horário de início.";
    }

    if (!isEndTimeValid(time.value, endTime.value)) {
      return "O horário de término deve ser maior que o horário de início.";
    }
  }

  if (recurrenceType.value === "week_days") {
    if (selectedWeekDays.value.length === 0) {
      return "Selecione pelo menos um dia da semana.";
    }

    for (const day of selectedWeekDays.value) {
      const dayTime = weekDayTimes[day];

      if (dayTime?.endTime && !dayTime?.time) {
        return `Informe o horário de início para ${weekDayLabels[day]}.`;
      }

      if (!isEndTimeValid(dayTime?.time, dayTime?.endTime)) {
        return `O horário de término deve ser maior que o início em ${weekDayLabels[day]}.`;
      }
    }
  }

  if (recurrenceType.value === "cycle") {
    if (!cycleStartDate.value) {
      return "Informe a data inicial do ciclo.";
    }

    if (!activeDays.value || activeDays.value < 1) {
      return "Informe os dias ativos do ciclo.";
    }

    if (!restDays.value || restDays.value < 1) {
      return "Informe os dias de descanso do ciclo.";
    }
  }

  return null;
}

function buildPayload() {
  const payload = {
    title: title.value,
    description: description.value,
    priority: priority.value,
    category: category.value || null,
    recurrenceType: recurrenceType.value,
  };

  if (recurrenceType.value === "once") {
    payload.date = date.value;
    payload.time = time.value || null;
    payload.endTime = endTime.value || null;
  }

  if (recurrenceType.value === "week_days") {
    payload.weekDays = selectedWeekDays.value;
    payload.weekDayTimes = buildWeekDayTimesPayload();
  }

  if (recurrenceType.value === "cycle") {
    payload.cycleStartDate = cycleStartDate.value;
    payload.activeDays = activeDays.value;
    payload.restDays = restDays.value;
    payload.time = time.value || null;
    payload.endTime = endTime.value || null;
  }

  return payload;
}

async function saveTask() {
  message.value = "";

  const validationError = validateForm();

  if (validationError) {
    messageType.value = "error";
    message.value = validationError;
    return;
  }

  saving.value = true;

  try {
    if (isEditMode.value) {
      await api.put(`/tasks/${taskId.value}`, buildPayload(), getAuthConfig());
      router.push({ path: "/dashboard", query: { success: "updated" } });
    } else {
      await api.post("/tasks", buildPayload(), getAuthConfig());
      router.push("/dashboard");
    }
  } catch (error) {
    messageType.value = "error";
    message.value =
      error.response?.data?.message ||
      (isEditMode.value ? "Erro ao atualizar tarefa." : "Erro ao criar tarefa.");
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (!localStorage.getItem("token")) {
    router.push("/login");
    return;
  }

  if (isEditMode.value) {
    await loadTask();
  }
});
</script>

<style scoped>
.page-dashboard {
  min-height: 100vh;
  padding: 16px;
  max-width: 960px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.page-header-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.header-spacer {
  width: 72px;
}

.back-link {
  text-decoration: none;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
}

.section-card {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #64748b;
}

.form-textarea {
  min-height: 88px;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.task-type-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.task-type-toggle--three {
  grid-template-columns: 1fr;
}

.task-type-btn {
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.task-type-btn:hover {
  border-color: var(--card-hover);
  color: var(--text);
}

.task-type-btn--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: var(--primary);
  color: var(--primary);
}

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.weekday-chip {
  padding: 10px 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.weekday-chip:hover {
  border-color: var(--card-hover);
  color: var(--text);
}

.weekday-chip--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: var(--primary);
  color: var(--primary);
}

.day-times-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-time-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.day-time-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.day-time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-time-inputs .form-input {
  flex: 1;
  min-width: 0;
}

.day-time-separator {
  color: var(--text-secondary);
  font-weight: 600;
  flex-shrink: 0;
}

.cycle-hint {
  margin: -8px 0 16px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.btn-link:hover {
  color: #60a5fa;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  background: var(--card-hover);
  color: var(--text);
}

.btn-sm {
  padding: 8px 14px;
  font-size: 0.85rem;
}

.message {
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.message-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.message-success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.loading-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 32px 16px;
}

@media (min-width: 601px) {
  .task-type-toggle--three {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .page-dashboard {
    padding: 12px;
  }

  .card {
    padding: 18px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .weekday-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .day-time-inputs {
    flex-wrap: wrap;
  }

  .day-time-separator {
    display: none;
  }

  .day-time-inputs .form-input {
    width: 100%;
    flex: none;
  }
}
</style>
