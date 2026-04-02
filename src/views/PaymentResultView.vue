<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import api from '../services/api';
import type { PaymentAttemptResponse } from '../types';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const loading = ref(true);
const result = ref<PaymentAttemptResponse | null>(null);
const error = ref('');

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

onMounted(async () => {
  // Bold envía transaction_id como query param al redirigir
  const transactionId = (route.query.transaction_id || route.query.transactionId) as string | undefined;

  if (!transactionId) {
    error.value = 'No se encontro informacion de la transaccion.';
    loading.value = false;
    return;
  }

  try {
    const response = await api.get<PaymentAttemptResponse>(`/payments/attempt/${transactionId}/status`);
    result.value = response.data;

    if (response.data.status === 'APPROVED') {
      cartStore.clearCart();
    }
  } catch (err) {
    console.error('Error fetching transaction status:', err);
    error.value = 'No se pudo consultar el estado del pago. Por favor contactanos.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">

      <!-- Cargando -->
      <div v-if="loading" class="space-y-4">
        <div class="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-gray-600">Verificando tu pago...</p>
      </div>

      <!-- Error al consultar -->
      <div v-else-if="error">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-primary mb-3">No pudimos verificar tu pago</h2>
        <p class="text-gray-500 text-sm mb-6">{{ error }}</p>
        <button @click="router.push('/')" class="btn-primary">Ir al inicio</button>
      </div>

      <!-- Pago aprobado -->
      <div v-else-if="result?.status === 'APPROVED'">
        <div class="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-primary mb-2">Pago aprobado</h2>
        <p class="text-gray-500 text-sm mb-2">Transaccion: {{ result.transaction_id }}</p>
        <p v-if="result.amount" class="text-2xl font-bold text-secondary mb-6">
          {{ formatPrice(result.amount.total_amount) }}
        </p>
        <p class="text-gray-600 text-sm mb-6">
          Tu pago fue procesado con exito. Recibiras una confirmacion por email.
        </p>
        <button @click="router.push('/')" class="btn-secondary">
          Volver al inicio
        </button>
      </div>

      <!-- Pago rechazado -->
      <div v-else-if="result?.status === 'REJECTED'">
        <div class="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-primary mb-2">Pago rechazado</h2>
        <p class="text-gray-500 text-sm mb-2">Transaccion: {{ result.transaction_id }}</p>
        <p class="text-gray-600 text-sm mb-6">
          Tu pago no pudo ser procesado. Intenta con otro metodo de pago o contactanos.
        </p>
        <div class="flex gap-3 justify-center">
          <button @click="router.push('/checkout')" class="btn-secondary">
            Intentar de nuevo
          </button>
          <button @click="router.push('/')" class="btn-primary">
            Ir al inicio
          </button>
        </div>
      </div>

      <!-- Pago pendiente / procesando -->
      <div v-else>
        <div class="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-primary mb-2">Pago en proceso</h2>
        <p class="text-gray-500 text-sm mb-2">Transaccion: {{ result?.transaction_id }}</p>
        <p class="text-gray-600 text-sm mb-6">
          Tu pago esta siendo procesado. Te notificaremos cuando sea confirmado.
        </p>
        <button @click="router.push('/')" class="btn-primary">
          Volver al inicio
        </button>
      </div>

    </div>
  </div>
</template>
