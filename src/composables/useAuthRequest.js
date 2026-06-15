import { ref, onUnmounted } from "vue";

const SLOW_REQUEST_MS = 3000;
const REQUEST_TIMEOUT_MS = 60000;

function getFriendlyErrorMessage(error, fallback) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
    return "O servidor está demorando para responder. Aguarde alguns segundos e tente novamente.";
  }

  if (!error.response) {
    return "Não foi possível conectar ao servidor. Ele pode estar iniciando — aguarde alguns segundos e tente novamente.";
  }

  if (error.response.status >= 500) {
    return "O servidor está indisponível no momento. Aguarde alguns segundos e tente novamente.";
  }

  return fallback;
}

export function useAuthRequest() {
  const loading = ref(false);
  const slowMessage = ref("");
  const message = ref("");
  const messageType = ref("error");

  let slowTimer = null;

  function clearSlowTimer() {
    if (slowTimer) {
      clearTimeout(slowTimer);
      slowTimer = null;
    }
  }

  function resetFeedback() {
    message.value = "";
    slowMessage.value = "";
    clearSlowTimer();
  }

  async function runAuthRequest(requestFn, { fallbackError = "Não foi possível concluir a operação." } = {}) {
    resetFeedback();
    loading.value = true;

    slowTimer = setTimeout(() => {
      slowMessage.value =
        "Estamos conectando ao servidor. Isso pode levar alguns segundos na primeira tentativa.";
    }, SLOW_REQUEST_MS);

    try {
      return await requestFn({ timeout: REQUEST_TIMEOUT_MS });
    } catch (error) {
      messageType.value = "error";
      message.value = getFriendlyErrorMessage(error, fallbackError);
      return null;
    } finally {
      loading.value = false;
      clearSlowTimer();
      slowMessage.value = "";
    }
  }

  onUnmounted(() => {
    clearSlowTimer();
  });

  return {
    loading,
    slowMessage,
    message,
    messageType,
    runAuthRequest,
    resetFeedback,
  };
}
