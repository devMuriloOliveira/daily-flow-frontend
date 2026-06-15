<template>
  <div class="page-center">
    <div class="card auth-card">
      <h1 class="card-title">Entrar no DailyFlow</h1>
      <p class="card-subtitle">Organize seu dia com clareza</p>

      <form @submit.prevent="login">
        <div class="form-group">
          <label class="form-label" for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            class="form-input"
            type="email"
            placeholder="seu@email.com"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Senha</label>
          <div class="input-password">
            <input
              id="password"
              v-model="password"
              class="form-input"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Sua senha"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="btn-toggle-password"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
          {{ loading ? "Entrando..." : "Entrar" }}
        </button>
      </form>

      <p v-if="slowMessage" class="message message-info" role="status">
        {{ slowMessage }}
      </p>

      <p
        v-if="message"
        class="message"
        :class="messageType === 'success' ? 'message-success' : 'message-error'"
      >
        {{ message }}
      </p>

      <p class="auth-footer">
        Não tem conta?
        <router-link to="/register">Criar conta</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import { useAuthRequest } from "../composables/useAuthRequest";

const router = useRouter();
const { loading, slowMessage, message, messageType, runAuthRequest } = useAuthRequest();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

async function login() {
  const response = await runAuthRequest(
    (config) =>
      api.post(
        "/users/login",
        {
          email: email.value,
          password: password.value,
        },
        config
      ),
    { fallbackError: "Não foi possível entrar. Verifique seus dados e tente novamente." }
  );

  if (!response) {
    return;
  }

  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));

  router.push("/dashboard");
}
</script>

<style scoped>
.page-center {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 700;
}

.card-subtitle {
  margin: 0 0 24px;
  color: var(--text-secondary);
  font-size: 0.95rem;
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

.form-input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-input::placeholder {
  color: #64748b;
}

.input-password {
  position: relative;
}

.input-password .form-input {
  padding-right: 44px;
}

.btn-toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-toggle-password:hover {
  color: var(--text);
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

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.message-info {
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #93c5fd;
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

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
