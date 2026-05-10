<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

// Bold redirige con ?bold-order-id=XXX&bold-tx-status=approved|declined|pending
const boldStatus = (route.query['bold-tx-status'] as string | undefined) ?? '';
const boldOrderId = (route.query['bold-order-id'] as string | undefined) ?? '';

onMounted(() => {
  if (boldStatus === 'approved') {
    cartStore.clearCart();
  }
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">

      <!-- Sin parámetros -->
      <div v-if="!boldStatus">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-primary mb-3">No se encontro informacion del pago</h2>
        <p class="text-gray-500 text-sm mb-6">Si realizaste un pago, contactanos para verificarlo.</p>
        <button @click="router.push('/')" class="btn-primary">Ir al inicio</button>
      </div>

      <!-- Aprobado -->
      <div v-else-if="boldStatus === 'approved'">
        <div class="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-primary mb-2">Pago aprobado</h2>
        <p v-if="boldOrderId" class="text-gray-500 text-sm mb-4">Referencia: {{ boldOrderId }}</p>
        <p class="text-gray-600 text-sm mb-6">
          Tu pago fue procesado con exito. Recibiras una confirmacion por email.
        </p>
        <button @click="router.push('/')" class="btn-secondary">
          Volver al inicio
        </button>
      </div>

      <!-- Rechazado -->
      <div v-else-if="boldStatus === 'declined'">
        <div class="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-primary mb-2">Pago rechazado</h2>
        <p v-if="boldOrderId" class="text-gray-500 text-sm mb-4">Referencia: {{ boldOrderId }}</p>
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

      <!-- Pendiente -->
      <div v-else>
        <div class="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-primary mb-2">Pago en proceso</h2>
        <p v-if="boldOrderId" class="text-gray-500 text-sm mb-4">Referencia: {{ boldOrderId }}</p>
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
