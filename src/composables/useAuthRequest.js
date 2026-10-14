import { ref, onUnmounted } from "vue";

const RETRY_DELAYS_MS = [0, 2500, 5000, 9000, 14000];
const REQUEST_TIMEOUT_MS = 15000;
const MAX_TOTAL_RETRY_MS = 45000;

function wait(ms, signal) {
  if (ms === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Operação cancelada.", "AbortError"));
      },
      { once: true }
    );
  });
}

function isCanceled(error) {
  return error?.name === "AbortError" || error?.code === "ERR_CANCELED";
}

function isTemporaryConnectionError(error) {
  if (isCanceled(error)) {
    return false;
  }

  if (error.response?.status === 401 || error.response?.status === 403) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  return [502, 503, 504].includes(error.response.status);
}

function getFriendlyErrorMessage(error, fallback) {
  if (isCanceled(error)) {
    return "Operação cancelada.";
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
    return "O servidor está demorando para responder. Aguarde alguns segundos e tente novamente.";
  }

  if (!error.response) {
    return "Não foi possível conectar ao servidor. Ele pode estar iniciando. Tente novamente em instantes.";
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
  const canRetry = ref(false);
  const retryLabel = ref("Tentar novamente");

  let activeController = null;
  let lastRequest = null;

  function cancelActiveRequest() {
    if (activeController) {
      activeController.abort();
      activeController = null;
    }
  }

  function resetFeedback() {
    message.value = "";
    slowMessage.value = "";
    canRetry.value = false;
    retryLabel.value = "Tentar novamente";
  }

  async function runAuthRequest(
    requestFn,
    { fallbackError = "Não foi possível concluir a operação.", rememberRequest = true } = {}
  ) {
    if (loading.value) {
      return null;
    }

    if (rememberRequest) {
      lastRequest = () => runAuthRequest(requestFn, { fallbackError, rememberRequest: false });
    }

    resetFeedback();
    loading.value = true;
    cancelActiveRequest();

    const controller = new AbortController();
    activeController = controller;
    const startedAt = Date.now();
    let lastError = null;

    try {
      for (let attemptIndex = 0; attemptIndex < RETRY_DELAYS_MS.length; attemptIndex += 1) {
        const delay = RETRY_DELAYS_MS[attemptIndex];
        const attemptNumber = attemptIndex + 1;
        const remainingTime = MAX_TOTAL_RETRY_MS - (Date.now() - startedAt);

        if (remainingTime <= 0) {
          break;
        }

        if (delay > 0) {
          slowMessage.value = `Servidor iniciando. Nova tentativa em ${Math.ceil(delay / 1000)}s...`;
          await wait(Math.min(delay, remainingTime), controller.signal);
        }

        slowMessage.value =
          attemptNumber === 1
            ? "Conectando ao servidor..."
            : `Tentando reconectar ao servidor (${attemptNumber}/${RETRY_DELAYS_MS.length})...`;

        try {
          const response = await requestFn({
            timeout: Math.min(REQUEST_TIMEOUT_MS, Math.max(1000, remainingTime)),
            signal: controller.signal,
          });

          resetFeedback();
          return response;
        } catch (error) {
          lastError = error;

          if (!isTemporaryConnectionError(error)) {
            break;
          }
        }
      }

      messageType.value = "error";
      message.value = getFriendlyErrorMessage(lastError || {}, fallbackError);
      canRetry.value = Boolean(lastRequest) && isTemporaryConnectionError(lastError);
      return null;
    } finally {
      if (activeController === controller) {
        activeController = null;
      }

      loading.value = false;
      slowMessage.value = "";
    }
  }

  function retryLastRequest() {
    if (!lastRequest || loading.value) {
      return null;
    }

    return lastRequest();
  }

  onUnmounted(() => {
    cancelActiveRequest();
  });

  return {
    loading,
    slowMessage,
    message,
    messageType,
    canRetry,
    retryLabel,
    runAuthRequest,
    retryLastRequest,
    resetFeedback,
    cancelActiveRequest,
  };
}
