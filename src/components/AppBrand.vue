<template>
  <div class="app-brand">
    <img
      src="/favicon.svg"
      alt=""
      class="app-brand__icon"
      width="36"
      height="36"
    />
    <span class="app-brand__text" aria-label="DailyFlow">
      <span class="app-brand__daily">Daily</span><span class="app-brand__flow">Flow</span>
    </span>
  </div>
</template>

<style scoped>
.app-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.app-brand__icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 8px;
}

.app-brand__text {
  display: inline-flex;
  align-items: baseline;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  white-space: nowrap;
}

.app-brand__daily {
  color: #ffffff;
}

.app-brand__flow {
  color: var(--primary);
}

@media (max-width: 480px) {
  .app-brand {
    gap: 8px;
  }

  .app-brand__icon {
    width: 30px;
    height: 30px;
  }

  .app-brand__text {
    font-size: 1.25rem;
  }
}
</style>
