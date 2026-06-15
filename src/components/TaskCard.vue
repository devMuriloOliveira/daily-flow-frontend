<template>
  <li
    class="task-card"
    :class="[
      priorityClass,
      {
        'task-card--done': task.isCompleted,
        'task-card--expanded': expanded,
      },
    ]"
  >
    <div class="task-card__row">
      <label class="task-card__label">
        <input
          type="checkbox"
          class="task-card__checkbox"
          :checked="task.isCompleted"
          @change="$emit('toggle', task.id)"
        />
        <span class="task-card__check"></span>
        <span class="task-card__content">
          <span v-if="hasTime" class="task-card__line">{{ taskLine }}</span>
          <span v-else class="task-card__title">{{ task.title }}</span>
        </span>
      </label>
      <button
        type="button"
        class="btn btn-ghost btn-sm task-card__details-btn"
        @click="$emit('toggle-details', task.id)"
      >
        {{ expanded ? "Ocultar" : "Ver detalhes" }}
      </button>
    </div>

    <div v-if="expanded" class="task-card__details">
      <div class="task-card__meta-row">
        <span class="priority-badge" :class="`priority-badge--${task.priority || 'medium'}`">
          <span class="priority-badge__dot"></span>
          {{ priorityLabel }}
        </span>
        <span class="category-badge">{{ categoryLabel }}</span>
      </div>

      <p class="task-card__detail-label">Descrição</p>
      <p class="task-card__detail-text">{{ description }}</p>

      <p class="task-card__detail-label">Tipo</p>
      <p class="task-card__detail-text">{{ recurrenceLabel }}</p>

      <template v-if="task.recurrenceType === 'once' && onceDate">
        <p class="task-card__detail-label">Data</p>
        <p class="task-card__detail-text">{{ onceDate }}</p>
      </template>

      <template v-if="task.recurrenceType === 'week_days'">
        <p class="task-card__detail-label">Dias</p>
        <p class="task-card__detail-text">{{ weekDaysLabel }}</p>
      </template>

      <template v-if="task.recurrenceType === 'cycle'">
        <p class="task-card__detail-label">Ciclo</p>
        <p class="task-card__detail-text">{{ cycleDetail }}</p>
        <template v-if="cycleStartDate">
          <p class="task-card__detail-label">Início do ciclo</p>
          <p class="task-card__detail-text">{{ cycleStartDate }}</p>
        </template>
      </template>

      <p class="task-card__detail-label">Horário</p>
      <p class="task-card__detail-text">{{ scheduleLabel }}</p>

      <div class="task-card__actions">
        <button type="button" class="btn btn-ghost btn-sm" @click="$emit('edit', task.id)">
          ✏️ Editar
        </button>
        <button type="button" class="btn btn-danger btn-sm" @click="$emit('delete', task.id)">
          🗑️ Excluir
        </button>
      </div>
    </div>
  </li>
</template>

<script setup>
import { computed } from "vue";
import {
  hasTaskTime,
  formatTaskLine,
  formatDescription,
  formatRecurrenceType,
  formatPriorityLabel,
  formatPriorityClass,
  formatCategory,
  formatWeekDays,
  formatOnceDate,
  formatCycleDetail,
  formatCycleStartDate,
  formatSchedule,
} from "../utils/taskFormatters";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle", "toggle-details", "edit", "delete"]);

const hasTime = computed(() => hasTaskTime(props.task));
const taskLine = computed(() => formatTaskLine(props.task));
const description = computed(() => formatDescription(props.task));
const recurrenceLabel = computed(() => formatRecurrenceType(props.task));
const priorityLabel = computed(() => formatPriorityLabel(props.task.priority));
const priorityClass = computed(() => `task-card--${formatPriorityClass(props.task.priority)}`);
const categoryLabel = computed(() => formatCategory(props.task));
const weekDaysLabel = computed(() => formatWeekDays(props.task));
const onceDate = computed(() => formatOnceDate(props.task));
const cycleDetail = computed(() => formatCycleDetail(props.task));
const cycleStartDate = computed(() => formatCycleStartDate(props.task));
const scheduleLabel = computed(() => formatSchedule(props.task));
</script>

<style scoped>
.task-card {
  list-style: none;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  border-left-width: 3px;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  background: var(--card-hover);
  box-shadow: var(--shadow-sm);
}

.task-card--priority-high {
  border-left-color: var(--priority-high);
}

.task-card--priority-medium {
  border-left-color: var(--priority-medium);
}

.task-card--priority-low {
  border-left-color: var(--priority-low);
}

.task-card--done {
  opacity: 0.62;
}

.task-card--done .task-card__line,
.task-card--done .task-card__title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-card--expanded {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.15);
}

.task-card__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
}

.task-card__label {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.task-card__checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.task-card__check {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 2px solid var(--border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;
}

.task-card__checkbox:checked + .task-card__check {
  background: var(--priority-low);
  border-color: var(--priority-low);
}

.task-card__checkbox:checked + .task-card__check::after {
  content: "";
  width: 6px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -2px;
}

.task-card__content {
  flex: 1;
  min-width: 0;
}

.task-card__line,
.task-card__title {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}

.task-card__details-btn {
  flex-shrink: 0;
  font-size: 0.78rem;
  white-space: nowrap;
}

.task-card__details {
  padding: 0 16px 16px 52px;
  border-top: 1px solid var(--border);
  padding-top: 14px;
}

.task-card__meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-badge--high {
  background: rgba(239, 68, 68, 0.12);
  color: var(--priority-high);
}

.priority-badge--high .priority-badge__dot {
  background: var(--priority-high);
}

.priority-badge--medium {
  background: rgba(245, 158, 11, 0.12);
  color: var(--priority-medium);
}

.priority-badge--medium .priority-badge__dot {
  background: var(--priority-medium);
}

.priority-badge--low {
  background: rgba(34, 197, 94, 0.12);
  color: var(--priority-low);
}

.priority-badge--low .priority-badge__dot {
  background: var(--priority-low);
}

.category-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--card-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.task-card__detail-label {
  margin: 0 0 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.task-card__detail-label:not(:first-of-type) {
  margin-top: 12px;
}

.task-card__detail-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
}

.task-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
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
  transition: background 0.2s, transform 0.1s, border-color 0.2s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  background: var(--card-secondary);
  color: var(--text);
  border-color: var(--card-hover);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fff;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  .task-card__row {
    flex-wrap: wrap;
    padding: 12px;
  }

  .task-card__label {
    width: 100%;
  }

  .task-card__details-btn {
    margin-left: 36px;
  }

  .task-card__details {
    padding-left: 12px;
  }

  .task-card__actions .btn {
    flex: 1;
  }
}
</style>
