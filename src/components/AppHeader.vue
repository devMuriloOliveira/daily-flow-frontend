<template>
  <header class="app-header">
    <router-link to="/dashboard" class="app-header__brand" aria-label="Ir para Dashboard">
      <AppBrand />
    </router-link>

    <nav class="app-header__nav" aria-label="Navegação principal">
      <router-link
        to="/agenda"
        class="app-header__link"
        active-class="app-header__link--active"
      >
        Agenda
      </router-link>

      <router-link
        to="/statistics"
        class="app-header__link"
        active-class="app-header__link--active"
      >
        Estatísticas
      </router-link>

      <button type="button" class="app-header__link app-header__link--logout" @click="logout">
        Sair
      </button>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import AppBrand from "./AppBrand.vue";

const router = useRouter();

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
}

.app-header__brand {
  flex-shrink: 0;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s;
}

.app-header__brand:hover {
  opacity: 0.9;
  color: inherit;
}

.app-header__nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.app-header__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--text-secondary);
  background: var(--card-secondary);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.app-header__link:hover {
  background: var(--card-hover);
  color: var(--text);
  border-color: var(--card-hover);
}

.app-header__link--active {
  background: rgba(59, 130, 246, 0.12);
  color: var(--primary);
  border-color: rgba(59, 130, 246, 0.35);
}

.app-header__link--logout {
  font-family: inherit;
}

@media (max-width: 600px) {
  .app-header {
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 22px;
  }

  .app-header__nav {
    width: 100%;
    justify-content: stretch;
  }

  .app-header__link {
    flex: 1;
    min-width: 0;
    padding: 10px 8px;
    font-size: 0.78rem;
  }
}
</style>
