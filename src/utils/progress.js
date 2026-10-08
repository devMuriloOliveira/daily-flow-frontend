export const PRIORITY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1,
};

export function clampPercent(value) {
  return Math.min(100, Math.max(0, value));
}

export function roundProgress(value) {
  return Math.round(clampPercent(value));
}

export function getTaskWeight(task) {
  return PRIORITY_WEIGHTS[task?.priority] || PRIORITY_WEIGHTS.medium;
}

export function calculateSimpleCompletion(tasks) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.isCompleted).length;
  const completionRate =
    totalTasks > 0 ? roundProgress((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
  };
}

export function calculateWeightedProgress(tasks) {
  const totalWeight = tasks.reduce((sum, task) => sum + getTaskWeight(task), 0);
  const completedWeight = tasks.reduce((sum, task) => {
    return task.isCompleted ? sum + getTaskWeight(task) : sum;
  }, 0);
  const progressPercent =
    totalWeight > 0 ? roundProgress((completedWeight / totalWeight) * 100) : 0;

  return {
    totalWeight,
    completedWeight,
    progressPercent,
  };
}

export function calculateDailyProgress(tasks, dailyCompletionGoal = 70) {
  const simple = calculateSimpleCompletion(tasks);
  const weighted = calculateWeightedProgress(tasks);

  return {
    ...simple,
    ...weighted,
    dailyCompletionGoal,
    goalReached:
      simple.totalTasks > 0 && weighted.progressPercent >= dailyCompletionGoal,
  };
}

export function calculateTasksNeededForGoal(tasks, dailyCompletionGoal = 70) {
  const pendingTasks = [...tasks]
    .filter((task) => !task.isCompleted)
    .sort((a, b) => getTaskWeight(b) - getTaskWeight(a));

  const totalWeight = tasks.reduce((sum, task) => sum + getTaskWeight(task), 0);
  const completedWeight = tasks.reduce((sum, task) => {
    return task.isCompleted ? sum + getTaskWeight(task) : sum;
  }, 0);
  const targetWeight = Math.ceil((totalWeight * dailyCompletionGoal) / 100);

  if (totalWeight === 0 || completedWeight >= targetWeight) {
    return 0;
  }

  let tasksNeeded = 0;
  let simulatedWeight = completedWeight;

  for (const task of pendingTasks) {
    simulatedWeight += getTaskWeight(task);
    tasksNeeded += 1;

    if (simulatedWeight >= targetWeight) {
      return tasksNeeded;
    }
  }

  return tasksNeeded;
}
