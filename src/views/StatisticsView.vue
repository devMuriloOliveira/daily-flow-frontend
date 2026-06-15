<template>
  <div class="statistics-page">
    <AppHeader />

    <section class="stats-intro">
      <div class="stats-intro__text">
        <h1 class="stats-intro__title">Estatísticas</h1>
        <p class="stats-intro__subtitle">
          Acompanhe seu progresso e desempenho semanal.
        </p>
      </div>

      <router-link to="/dashboard" class="btn btn-ghost btn-sm stats-intro__back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Dashboard
      </router-link>
    </section>

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
          <span class="stat-card__label">Taxa de conclusão</span>
          <strong class="stat-card__value">{{ statistics.completionRate }}%</strong>
        </div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-card__header">
        <h2 class="chart-card__title">Tarefas concluídas na semana</h2>
        <p class="chart-card__subtitle">Desempenho diário dos últimos 7 dias</p>
      </div>

      <div class="chart-card__body">
        <apexchart
          width="100%"
          height="300"
          type="bar"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";
import AppHeader from "../components/AppHeader.vue";

const statistics = ref({
  totalTasks: 0,
  completedTasks: 0,
  completionRate: 0,
  currentStreak: 0,
  bestStreak: 0,
});

const chartSeries = ref([
  {
    name: "Tarefas concluídas",
    data: [],
  },
]);

const chartOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    background: "transparent",
  },
  theme: {
    mode: "dark",
  },
  xaxis: {
    categories: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  },
};

function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function loadStatistics() {
  try {
    const response = await api.get("/tasks/statistics", getAuthConfig());

    statistics.value = response.data;

    chartSeries.value = [
      {
        name: "Tarefas concluídas",
        data: response.data.weeklyCompleted.map((item) => item.completed),
      },
    ];
  } catch (error) {
    console.log(error);
  }
}

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped>
.statistics-page {
  min-height: 100vh;
  padding: 20px 16px 40px;
  max-width: 960px;
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
  letter-spacing: -0.02em;
}

.stats-intro__subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.stats-intro__back {
  flex-shrink: 0;
  text-decoration: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-radius: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s, transform 0.15s;
}

.stat-card:hover {
  border-color: rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
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

.stat-card__content {
  min-width: 0;
}

.stat-card__label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 500;
  margin-bottom: 6px;
  line-height: 1.3;
}

.stat-card__value {
  display: block;
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.chart-card {
  margin-top: 24px;
  padding: 24px;
  border-radius: 20px;
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.chart-card__header {
  margin-bottom: 8px;
}

.chart-card__title {
  margin: 0 0 4px;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.chart-card__subtitle {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.chart-card__body {
  margin-top: 12px;
  padding-top: 8px;
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card__value {
    font-size: 1.65rem;
  }
}

@media (max-width: 600px) {
  .statistics-page {
    padding: 14px 12px 32px;
  }

  .stats-intro {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-intro__back {
    align-self: flex-start;
  }

  .chart-card {
    padding: 18px 14px;
    border-radius: 16px;
  }
}
</style>
