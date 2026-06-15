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

const recurrenceTypeLabels = {
  once: "Apenas uma vez",
  week_days: "Dias da semana",
  cycle: "Ciclo flexível",
};

const priorityLabels = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const categoryLabels = {
  academia: "Academia",
  estudos: "Estudos",
  trabalho: "Trabalho",
  casa: "Casa",
  financas: "Finanças",
  pessoal: "Pessoal",
};

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function hasTaskTime(task) {
  return Boolean(task.time && String(task.time).trim());
}

export function formatSchedule(task) {
  if (!hasTaskTime(task)) {
    return "Sem horário definido.";
  }

  if (task.endTime) {
    return `${task.time} até ${task.endTime}`;
  }

  return task.time;
}

export function formatTaskLine(task) {
  if (!hasTaskTime(task)) {
    return task.title;
  }

  const timePart = task.endTime
    ? `${task.time} até ${task.endTime}`
    : task.time;

  return `${timePart} · ${task.title}`;
}

export function formatDescription(task) {
  return task.description?.trim() || "Sem descrição.";
}

export function formatRecurrenceType(task) {
  return recurrenceTypeLabels[task.recurrenceType] || "Não definido";
}

export function formatPriorityLabel(priority) {
  return priorityLabels[priority] || priorityLabels.medium;
}

export function formatPriorityClass(priority) {
  if (priority === "high") return "priority-high";
  if (priority === "low") return "priority-low";
  return "priority-medium";
}

export function formatCategory(task) {
  if (!task.category) return "Sem categoria";
  return categoryLabels[task.category] || task.category;
}

export function formatWeekDays(task) {
  const days = parseJson(task.weekDays, []);
  const sorted = [...days].sort(
    (a, b) => weekDayOrder.indexOf(a) - weekDayOrder.indexOf(b)
  );
  const labels = sorted.map((day) => weekDayLabels[day]);

  if (labels.length === 0) return "—";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} e ${labels[1]}`;

  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

export function formatOnceDate(task) {
  if (task.recurrenceType !== "once" || !task.date) {
    return null;
  }

  const date = new Date(task.date);

  if (Number.isNaN(date.getTime()) || date.getFullYear() < 1971) {
    return null;
  }

  return date.toLocaleDateString("pt-BR");
}

export function formatCycleDetail(task) {
  if (task.recurrenceType !== "cycle") {
    return null;
  }

  const { activeDays, restDays } = task;

  if (!activeDays || !restDays) {
    return "—";
  }

  const activeLabel = activeDays === 1 ? "dia ativo" : "dias ativos";
  const restLabel = restDays === 1 ? "dia de descanso" : "dias de descanso";

  return `${activeDays} ${activeLabel}, ${restDays} ${restLabel}`;
}

export function formatCycleStartDate(task) {
  if (task.recurrenceType !== "cycle" || !task.cycleStartDate) {
    return null;
  }

  const date = new Date(task.cycleStartDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("pt-BR");
}
