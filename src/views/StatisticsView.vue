<template>
  <div class="statistics-page">
    <AppHeader />

    <section class="stats-intro">
      <div class="stats-intro__text">
        <h1 class="stats-intro__title">Estatísticas</h1>
        <p class="stats-intro__subtitle">
          Acompanhe seu progresso, tarefas realizadas e consistência.
        </p>
      </div>

      <div class="stats-intro__actions">
        <div class="period-toggle" aria-label="Período das estatísticas">
          <button
            type="button"
            class="period-toggle__button"
            :class="{ 'period-toggle__button--active': selectedPeriod === 7 }"
            @click="changePeriod(7)"
          >
            7 dias
          </button>
          <button
            type="button"
            class="period-toggle__button"
            :class="{ 'period-toggle__button--active': selectedPeriod === 30 }"
            @click="changePeriod(30)"
          >
            30 dias
          </button>
        </div>

        <router-link to="/dashboard" class="btn btn-ghost btn-sm stats-intro__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Dashboard
        </router-link>
      </div>
    </section>

    <div v-if="loading" class="empty-state">
      <p>Carregando estatísticas...</p>
    </div>

    <div v-else-if="errorMessage" class="empty-state empty-state--error">
      <p>{{ errorMessage }}</p>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card stat-card--total">
          <div class="stat-card__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__label">Total de tarefas</span>
            <strong class="stat-card__value">{{ statistics.totalTasks }}</strong>
          </div>
        </div>

        <div class="stat-card stat-card--completed">
          <div class="stat-card__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__label">Concluídas</span>
            <strong class="stat-card__value">{{ statistics.completedTasks }}</strong>
          </div>
        </div>

        <div class="stat-card stat-card--rate">
          <div class="stat-card__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__label">Conclusão simples</span>
            <strong class="stat-card__value">{{ statistics.completionRate }}%</strong>
          </div>
        </div>

        <div class="stat-card stat-card--weighted">
          <div class="stat-card__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-4" />
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__label">Progresso ponderado</span>
            <strong class="stat-card__value">{{ statistics.weightedProgress }}%</strong>
          </div>
        </div>
      </div>

      <div v-if="!hasAnyData" class="empty-state empty-state--large">
        <p>Ainda não há dados suficientes para gerar suas estatísticas.</p>
        <p class="empty-state__hint">Conclua algumas tarefas e seu desempenho aparecerá aqui.</p>
      </div>

      <template v-else>
        <section class="summary-grid" aria-label="Resumo da semana">
          <div class="summary-card">
            <span class="summary-card__label">Melhor dia</span>
            <strong class="summary-card__value">{{ bestDayLabel }}</strong>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Média diária</span>
            <strong class="summary-card__value">{{ statistics.averageWeightedProgress }}%</strong>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Meta atingida</span>
            <strong class="summary-card__value">
              {{ statistics.goalReachedDays }} de {{ statistics.activeDays }} dias ativos
            </strong>
            <span class="summary-card__hint">{{ statistics.goalReachedRate }}% dos dias</span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Total concluído</span>
            <strong class="summary-card__value">{{ statistics.completedTasks }}</strong>
          </div>
        </section>

        <div class="charts-grid">
          <section class="chart-card chart-card--wide">
            <div class="chart-card__header">
              <h2 class="chart-card__title">Desempenho nos últimos {{ selectedPeriod }} dias</h2>
              <p class="chart-card__subtitle">Progresso ponderado comparado à meta diária</p>
            </div>

            <div class="chart-card__body">
              <apexchart
                width="100%"
                height="320"
                type="line"
                :options="performanceChartOptions"
                :series="performanceSeries"
              />
            </div>
          </section>

          <section class="chart-card chart-card--wide">
            <div class="chart-card__header">
              <h2 class="chart-card__title">Tarefas nos últimos {{ selectedPeriod }} dias</h2>
              <p class="chart-card__subtitle">Total de tarefas e tarefas concluídas por dia</p>
            </div>

            <div class="chart-card__body">
              <apexchart
                width="100%"
                height="320"
                type="bar"
                :options="tasksChartOptions"
                :series="tasksSeries"
              />
            </div>
          </section>

          <div class="priority-charts-grid">
            <section class="chart-card chart-card--priority">
              <div class="chart-card__header">
                <h2 class="chart-card__title">Tarefas por prioridade</h2>
                <p class="chart-card__subtitle">Distribuição das tarefas do período</p>
              </div>

              <div class="chart-card__body chart-card__body--priority">
                <template v-if="hasPriorityData">
                  <apexchart
                    width="100%"
                    height="280"
                    type="donut"
                    :options="priorityChartOptions"
                    :series="prioritySeries"
                  />
                </template>
                <p v-else class="chart-empty-state">Nenhuma tarefa neste período.</p>
              </div>
            </section>

            <section class="chart-card chart-card--priority">
              <div class="chart-card__header">
                <h2 class="chart-card__title">Conclusões por prioridade</h2>
                <p class="chart-card__subtitle">Total e concluídas por nível de prioridade</p>
              </div>

              <div class="chart-card__body chart-card__body--priority">
                <div v-if="hasPriorityCompletionData" class="priority-completion-chart" role="img" aria-label="Conclusões por prioridade">
                  <div
                    v-for="priority in priorityCompletionRows"
                    :key="priority.key"
                    class="priority-completion-group"
                    :title="getPriorityCompletionTooltip(priority)"
                  >
                    <span class="priority-completion-group__label" :class="`priority-completion-group__label--${priority.key}`">
                      {{ priority.label }}
                    </span>

                    <div class="priority-completion-row">
                      <span class="priority-completion-row__label">Total</span>
                      <div class="priority-completion-row__track" aria-hidden="true">
                        <span
                          class="priority-completion-row__bar priority-completion-row__bar--total"
                          :style="{ width: `${getPriorityCompletionBarWidth(priority.total)}%` }"
                        ></span>
                      </div>
                      <strong class="priority-completion-row__value">{{ priority.total }}</strong>
                    </div>

                    <div class="priority-completion-row">
                      <span class="priority-completion-row__label">Concluídas</span>
                      <div class="priority-completion-row__track" aria-hidden="true">
                        <span
                          class="priority-completion-row__bar priority-completion-row__bar--completed"
                          :style="{ width: `${getPriorityCompletionBarWidth(priority.completed)}%` }"
                        ></span>
                      </div>
                      <strong class="priority-completion-row__value">{{ priority.completed }}</strong>
                    </div>
                  </div>
                </div>
                <p v-else class="chart-empty-state">Nenhuma tarefa neste período.</p>
              </div>
            </section>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../services/api";
import AppHeader from "../components/AppHeader.vue";

const selectedPeriod = ref(7);
const loading = ref(false);
const errorMessage = ref("");
const statistics = ref(createEmptyStatistics());

function createEmptyStatistics() {
  return {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    weightedProgress: 0,
    dailyCompletionGoal: 70,
    goalReachedDays: 0,
    goalReachedRate: 0,
    activeDays: 0,
    averageWeightedProgress: 0,
    bestDay: null,
    priorityDistribution: {
      high: 0,
      medium: 0,
      low: 0,
    },
    priorityCompletion: {
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 },
    },
    days: [],
  };
}

const hasAnyData = computed(() => statistics.value.totalTasks > 0);

const bestDayLabel = computed(() => {
  if (!statistics.value.bestDay) return "Sem dados";
  return `${statistics.value.bestDay.label} — ${statistics.value.bestDay.weightedProgress}%`;
});

const dayLabels = computed(() => statistics.value.days.map((day) => day.label));

const performanceSeries = computed(() => [
  {
    name: "Progresso ponderado",
    data: statistics.value.days.map((day) => day.weightedProgress),
  },
  {
    name: "Meta diária",
    data: statistics.value.days.map((day) => day.dailyCompletionGoal),
  },
]);

const tasksSeries = computed(() => [
  {
    name: "Total",
    data: statistics.value.days.map((day) => day.totalTasks),
  },
  {
    name: "Concluídas",
    data: statistics.value.days.map((day) => day.completedTasks),
  },
]);

const prioritySeries = computed(() => [
  toChartNumber(statistics.value.priorityDistribution.high),
  toChartNumber(statistics.value.priorityDistribution.medium),
  toChartNumber(statistics.value.priorityDistribution.low),
]);

function toChartNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getPriorityCompletionValue(priority, field) {
  const priorityCompletion = statistics.value.priorityCompletion;

  if (Array.isArray(priorityCompletion)) {
    const priorityData = priorityCompletion.find(
      (item) => item.priority === priority || item.key === priority
    );

    return toChartNumber(priorityData?.[field]);
  }

  return toChartNumber(priorityCompletion?.[priority]?.[field]);
}

const priorityCompletionRows = computed(() =>
  [
    { key: "high", label: "Alta" },
    { key: "medium", label: "Média" },
    { key: "low", label: "Baixa" },
  ].map((priority) => {
    const total = getPriorityCompletionValue(priority.key, "total");
    const completed = Math.min(
      total,
      getPriorityCompletionValue(priority.key, "completed")
    );

    return {
      ...priority,
      total,
      completed,
    };
  })
);

const hasPriorityData = computed(() => prioritySeries.value.some((value) => value > 0));

const hasPriorityCompletionData = computed(() =>
  priorityCompletionRows.value.some((priority) => priority.total > 0)
);

const maxPriorityCompletionValue = computed(() =>
  Math.max(
    1,
    ...priorityCompletionRows.value.flatMap((priority) => [
      priority.total,
      priority.completed,
    ])
  )
);

function getPriorityCompletionRate(priority) {
  if (priority.total === 0) return 0;
  return Math.round(Math.min(100, (priority.completed / priority.total) * 100));
}

function getPriorityCompletionBarWidth(value) {
  return Math.min(100, (toChartNumber(value) / maxPriorityCompletionValue.value) * 100);
}

function getPriorityCompletionTooltip(priority) {
  return `${priority.label}\nTotal: ${priority.total}\nConcluídas: ${priority.completed}\nTaxa de conclusão: ${getPriorityCompletionRate(priority)}%`;
}

const baseChartOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    background: "transparent",
    foreColor: "#94a3b8",
  },
  theme: {
    mode: "dark",
  },
  grid: {
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  legend: {
    labels: {
      colors: "#cbd5e1",
    },
  },
};

const performanceChartOptions = computed(() => ({
  ...baseChartOptions,
  colors: ["#60a5fa", "#fbbf24"],
  stroke: {
    curve: "smooth",
    width: [3, 2],
    dashArray: [0, 6],
  },
  markers: {
    size: [4, 0],
  },
  xaxis: {
    categories: dayLabels.value,
    labels: {
      rotate: selectedPeriod.value === 30 ? -45 : 0,
    },
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 5,
    labels: {
      formatter: (value) => `${Math.round(value)}%`,
    },
  },
  tooltip: {
    shared: true,
    custom: ({ dataPointIndex }) => {
      const day = statistics.value.days[dataPointIndex];
      if (!day) return "";

      return `
        <div class="stats-tooltip">
          <strong>${day.label}</strong>
          <span>${day.completedTasks} de ${day.totalTasks} tarefas concluídas</span>
          <span>Conclusão simples: ${day.completionRate}%</span>
          <span>Progresso ponderado: ${day.weightedProgress}%</span>
          <span>Meta: ${day.dailyCompletionGoal}%</span>
          <span>Meta atingida: ${day.goalReached ? "Sim" : "Não"}</span>
        </div>
      `;
    },
  },
}));

const tasksChartOptions = computed(() => ({
  ...baseChartOptions,
  colors: ["#64748b", "#22c55e"],
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: selectedPeriod.value === 30 ? "80%" : "58%",
    },
  },
  xaxis: {
    categories: dayLabels.value,
    labels: {
      rotate: selectedPeriod.value === 30 ? -45 : 0,
    },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    labels: {
      formatter: (value) => Math.round(value),
    },
  },
}));

const priorityChartOptions = computed(() => ({
  ...baseChartOptions,
  labels: ["Alta", "Média", "Baixa"],
  colors: ["#ef4444", "#f59e0b", "#22c55e"],
  dataLabels: {
    enabled: true,
  },
  legend: {
    position: "bottom",
  },
}));

function normalizeDay(day) {
  return {
    date: day?.date || "",
    label: day?.label || day?.date || "",
    totalTasks: toChartNumber(day?.totalTasks),
    completedTasks: toChartNumber(day?.completedTasks),
    completionRate: toChartNumber(day?.completionRate),
    weightedProgress: toChartNumber(day?.weightedProgress),
    totalWeight: toChartNumber(day?.totalWeight),
    completedWeight: toChartNumber(day?.completedWeight),
    dailyCompletionGoal: toChartNumber(day?.dailyCompletionGoal || 70),
    goalReached: Boolean(day?.goalReached),
  };
}

function normalizeStatistics(payload) {
  const empty = createEmptyStatistics();
  const days = Array.isArray(payload?.days) ? payload.days.map(normalizeDay) : [];

  return {
    ...empty,
    ...payload,
    totalTasks: toChartNumber(payload?.totalTasks),
    completedTasks: toChartNumber(payload?.completedTasks),
    completionRate: toChartNumber(payload?.completionRate),
    weightedProgress: toChartNumber(payload?.weightedProgress),
    dailyCompletionGoal: toChartNumber(payload?.dailyCompletionGoal || empty.dailyCompletionGoal),
    goalReachedDays: toChartNumber(payload?.goalReachedDays),
    goalReachedRate: toChartNumber(payload?.goalReachedRate),
    activeDays: toChartNumber(payload?.activeDays),
    averageWeightedProgress: toChartNumber(payload?.averageWeightedProgress),
    bestDay: payload?.bestDay || null,
    priorityDistribution: {
      high: toChartNumber(payload?.priorityDistribution?.high),
      medium: toChartNumber(payload?.priorityDistribution?.medium),
      low: toChartNumber(payload?.priorityDistribution?.low),
    },
    priorityCompletion: Array.isArray(payload?.priorityCompletion)
      ? payload.priorityCompletion
      : {
          high: {
            total: toChartNumber(payload?.priorityCompletion?.high?.total),
            completed: toChartNumber(payload?.priorityCompletion?.high?.completed),
          },
          medium: {
            total: toChartNumber(payload?.priorityCompletion?.medium?.total),
            completed: toChartNumber(payload?.priorityCompletion?.medium?.completed),
          },
          low: {
            total: toChartNumber(payload?.priorityCompletion?.low?.total),
            completed: toChartNumber(payload?.priorityCompletion?.low?.completed),
          },
        },
    days,
  };
}

function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function loadStatistics() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get(
      `/tasks/statistics?period=${selectedPeriod.value}`,
      getAuthConfig()
    );

    statistics.value = normalizeStatistics(response.data);
  } catch (error) {
    console.log(error);
    statistics.value = createEmptyStatistics();
    errorMessage.value =
      error.response?.data?.message ||
      "Não foi possível carregar as estatísticas agora.";
  } finally {
    loading.value = false;
  }
}

function changePeriod(period) {
  if (selectedPeriod.value === period) return;
  selectedPeriod.value = period;
  loadStatistics();
}

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped>
.statistics-page {
  min-height: 100vh;
  padding: 20px 16px 40px;
  max-width: 1120px;
  margin: 0 auto;
}

.stats-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.stats-intro__title {
  margin: 0 0 6px;
  font-size: 1.75rem;
  font-weight: 700;
}

.stats-intro__subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.stats-intro__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.stats-intro__back {
  text-decoration: none;
}

.period-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: var(--card-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.period-toggle__button {
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
  min-width: 78px;
  padding: 9px 14px;
  text-align: center;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.period-toggle__button:hover {
  color: var(--text);
  background: rgba(148, 163, 184, 0.08);
}

.period-toggle__button--active {
  background: rgba(59, 130, 246, 0.18);
  color: #bfdbfe;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.28);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card,
.summary-card,
.chart-card {
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-height: 116px;
  padding: 20px;
  border-radius: var(--radius);
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
}

.stat-card--total .stat-card__icon {
  background: rgba(59, 130, 246, 0.12);
  color: var(--primary);
}

.stat-card--completed .stat-card__icon {
  background: rgba(34, 197, 94, 0.12);
  color: var(--success);
}

.stat-card--rate .stat-card__icon {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}

.stat-card--weighted .stat-card__icon {
  background: rgba(96, 165, 250, 0.12);
  color: #60a5fa;
}

.stat-card__content {
  min-width: 0;
}

.stat-card__label,
.summary-card__label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.3;
}

.stat-card__value {
  display: block;
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.summary-card {
  min-height: 104px;
  padding: 18px;
  border-radius: var(--radius);
}

.summary-card__value {
  display: block;
  font-size: 1.15rem;
  line-height: 1.25;
}

.summary-card__hint {
  display: block;
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 24px;
}

.priority-charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.chart-card {
  padding: 24px;
  border-radius: var(--radius);
  min-width: 0;
}

.chart-card--priority {
  display: flex;
  flex-direction: column;
  min-height: 390px;
}

.chart-card--wide {
  grid-column: 1 / -1;
}

.chart-card__header {
  margin-bottom: 8px;
}

.chart-card__title {
  margin: 0 0 4px;
  font-size: 1.05rem;
  font-weight: 700;
}

.chart-card__subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.chart-card__body {
  margin-top: 12px;
  overflow: hidden;
}

.chart-card__body--priority {
  flex: 1;
  min-height: 280px;
}

.priority-completion-chart {
  display: grid;
  gap: 18px;
  width: 100%;
  min-width: 0;
  padding: 8px 0 2px;
}

.priority-completion-group {
  display: grid;
  gap: 8px;
}

.priority-completion-group__label {
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1;
}

.priority-completion-group__label--high {
  color: #f87171;
}

.priority-completion-group__label--medium {
  color: #fbbf24;
}

.priority-completion-group__label--low {
  color: #4ade80;
}

.priority-completion-row {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 10px;
}

.priority-completion-row__label {
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 700;
}

.priority-completion-row__track {
  height: 12px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;
}

.priority-completion-row__bar {
  display: block;
  height: 100%;
  min-width: 3px;
  border-radius: inherit;
}

.priority-completion-row__bar--total {
  background: #64748b;
}

.priority-completion-row__bar--completed {
  background: #22c55e;
}

.priority-completion-row__value {
  color: #e2e8f0;
  font-size: 0.78rem;
  line-height: 1;
  text-align: right;
}

.chart-empty-state {
  width: 100%;
  margin: 0;
  padding: 36px 12px;
  color: var(--text-secondary);
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: var(--text-secondary);
  background: var(--card);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
}

.empty-state--large {
  margin-top: 24px;
}

.empty-state--error {
  color: #fecaca;
  border-color: rgba(248, 113, 113, 0.45);
}

.empty-state__hint {
  margin-top: 6px;
  font-size: 0.85rem;
}

:deep(.stats-tooltip) {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  color: #e2e8f0;
  background: #0f172a;
}

@media (max-width: 960px) {
  .stats-grid,
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .priority-charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .statistics-page {
    padding: 14px 12px 32px;
  }

  .stats-intro {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin-bottom: 22px;
  }

  .stats-intro__actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
  }

  .period-toggle {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .period-toggle__button {
    width: 100%;
    min-width: 0;
    min-height: 36px;
  }

  .stats-intro__back {
    align-self: stretch;
    justify-content: center;
    min-height: 40px;
  }

  .stats-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    padding: 18px 14px;
  }
}
</style>
