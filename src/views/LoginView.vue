<template>
  <main class="page-center">
    <div class="auth-brand" aria-label="Daily Flow">
      <img src="/favicon.svg" alt="" width="40" height="40" />
      <span>Daily<span class="auth-brand__accent">Flow</span></span>
    </div>
    <div class="card auth-card">
      <div class="auth-heading">
        <span class="auth-eyebrow">SUA ROTINA, NO SEU RITMO</span>
        <h1 class="card-title">Bom ter você de volta.</h1>
        <p class="card-subtitle">Entre na sua conta e dê o próximo passo no seu dia.</p>
      </div>

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

      <button
        v-if="canRetry"
        type="button"
        class="btn btn-ghost btn-block auth-retry"
        :disabled="loading"
        @click="retryLastRequest"
      >
        <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
        {{ loading ? "Tentando..." : retryLabel }}
      </button>

      <p class="auth-footer">
        Não tem conta?
        <router-link to="/register">Criar conta</router-link>
      </p>
    </div>
    <p class="auth-caption">Mais clareza para planejar. Mais foco para realizar.</p>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import { useAuthRequest } from "../composables/useAuthRequest";

const router = useRouter();
const {
  loading,
  slowMessage,
  message,
  messageType,
  canRetry,
  retryLabel,
  runAuthRequest,
  retryLastRequest,
} = useAuthRequest();

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

.auth-retry {
  margin-top: 12px;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Login presentation: isolated from the shared application styles. */
.page-center {
  min-height: 100svh;
  flex-direction: column;
  gap: 28px;
  padding: 48px 24px;
  background: radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.14), transparent 58%), var(--bg);
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.05em;
}
.auth-brand img { flex-shrink: 0; }
.auth-brand__accent { color: var(--primary); }
.auth-card {
  max-width: 448px;
  padding: 36px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(155deg, #1a2438, #111c2e);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.035);
}
.auth-heading { margin-bottom: 32px; }
.auth-eyebrow {
  display: block;
  margin-bottom: 14px;
  color: #93c5fd;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.card-title {
  margin-bottom: 10px;
  font-size: clamp(1.5rem, 4.5vw, 1.8rem);
  line-height: 1.25;
  letter-spacing: -0.035em;
}
.card-subtitle { margin: 0; color: #a6b4c9; font-size: 0.9rem; line-height: 1.65; }
.form-group { margin-bottom: 22px; }
.form-label { margin-bottom: 9px; color: #d3deed; font-size: 0.85rem; }
.form-input {
  min-height: 52px;
  padding: 14px 16px;
  border-color: #34445e;
  border-radius: 12px;
  background: #0d1727;
  line-height: 1.4;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.form-input:hover { border-color: #526783; }
.form-input:focus {
  border-color: #60a5fa;
  background: #101d31;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}
.form-input::placeholder { color: #8393aa; }
.form-input:-webkit-autofill {
  -webkit-text-fill-color: var(--text);
  -webkit-box-shadow: 0 0 0 1000px #0d1727 inset;
  caret-color: var(--text);
}
.input-password .form-input { padding-right: 58px; }
.btn-toggle-password {
  right: 6px;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 9px;
  color: #a6b4c9;
}
.btn-toggle-password:hover { background: rgba(148, 163, 184, 0.1); }
.btn {
  min-height: 52px;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.btn-primary {
  margin-top: 4px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 22px rgba(37, 99, 235, 0.32);
  transform: translateY(-1px);
}
.btn:active:not(:disabled) { transform: translateY(0); }
.btn:disabled { opacity: 0.65; cursor: not-allowed; }
.btn:focus-visible, .btn-toggle-password:focus-visible, .auth-footer a:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 4px;
}
.message { margin-top: 20px; border-radius: 12px; font-size: 0.85rem; line-height: 1.6; overflow-wrap: anywhere; }
.auth-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  column-gap: 6px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  color: #a6b4c9;
  font-size: 0.85rem;
}
.auth-footer a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  border-radius: 4px;
  color: #93c5fd;
  font-weight: 600;
}
.auth-footer a:hover { color: #bfdbfe; text-decoration: underline; }
.auth-caption {
  max-width: 448px;
  margin: 0;
  color: #94a3b8;
  font-size: 0.75rem;
  line-height: 1.6;
  text-align: center;
  text-wrap: balance;
}
@media (max-width: 480px) {
  .page-center { padding: 32px 16px; gap: 24px; }
  .auth-card { padding: 28px 22px; border-radius: 20px; }
  .auth-heading { margin-bottom: 28px; }
  .auth-brand { font-size: 1.5rem; }
  .auth-footer { margin-top: 24px; padding-top: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; }
  .btn-spinner { animation: none; }
}
</style>
