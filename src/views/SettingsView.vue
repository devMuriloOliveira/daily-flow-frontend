<template>
  <div class="settings-page">
    <AppHeader />

    <section class="settings-intro">
      <h1 class="settings-intro__title">Configurações</h1>
      <p class="settings-intro__subtitle">Ajuste como o DailyFlow mede um dia satisfatório.</p>
    </section>

    <form class="card settings-card" @submit.prevent="saveSettings">
      <div class="settings-card__header">
        <h2 class="settings-card__title">Meta diária</h2>
        <p class="settings-card__description">
          Considere meu dia satisfatório quando eu concluir:
        </p>
      </div>

      <label class="goal-field" for="dailyCompletionGoal">
        <input
          id="dailyCompletionGoal"
          v-model.number="dailyCompletionGoal"
          class="goal-field__input"
          type="number"
          min="1"
          max="100"
          step="1"
          required
        />
        <span class="goal-field__suffix">%</span>
      </label>

      <p v-if="message" class="message" :class="messageType === 'success' ? 'message--success' : 'message--error'">
        {{ message }}
      </p>

      <div class="settings-card__actions">
        <router-link to="/dashboard" class="btn btn-ghost">Voltar</router-link>
        <button class="btn btn-primary" type="submit" :disabled="saving">
          {{ saving ? "Salvando..." : "Salvar" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import AppHeader from "../components/AppHeader.vue";

const router = useRouter();
const dailyCompletionGoal = ref(70);
const saving = ref(false);
const message = ref("");
const messageType = ref("success");

function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function loadUser() {
  try {
    const response = await api.get("/users/me", getAuthConfig());
    dailyCompletionGoal.value = response.data.user.dailyCompletionGoal || 70;
  } catch (error) {
    router.push("/login");
  }
}

async function saveSettings() {
  message.value = "";

  if (dailyCompletionGoal.value < 1 || dailyCompletionGoal.value > 100) {
    messageType.value = "error";
    message.value = "Informe uma meta entre 1% e 100%.";
    return;
  }

  saving.value = true;

  try {
    const response = await api.patch(
      "/users/settings",
      { dailyCompletionGoal: dailyCompletionGoal.value },
      getAuthConfig()
    );

    localStorage.setItem("user", JSON.stringify(response.data.user));
    messageType.value = "success";
    message.value = "Meta diária atualizada.";
  } catch (error) {
    messageType.value = "error";
    message.value =
      error.response?.data?.message || "Não foi possível salvar a configuração.";
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadUser();
});
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 20px 16px 40px;
  max-width: 720px;
  margin: 0 auto;
}

.settings-intro {
  margin-bottom: 24px;
}

.settings-intro__title {
  margin: 0 0 6px;
  font-size: 1.75rem;
  font-weight: 700;
}

.settings-intro__subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.settings-card__title {
  margin: 0 0 6px;
  font-size: 1.05rem;
}

.settings-card__description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.goal-field {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}

.goal-field__input {
  width: 96px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--card-secondary);
  color: var(--text);
  font-size: 1.1rem;
  font-weight: 700;
}

.goal-field__input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.65);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.goal-field__suffix {
  color: var(--text-secondary);
  font-weight: 700;
}

.settings-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
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

@media (max-width: 600px) {
  .settings-page {
    padding: 14px 12px 32px;
  }

  .settings-card__actions {
    flex-direction: column-reverse;
  }
}
</style>
