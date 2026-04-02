<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import type { Transaction } from '../../types';

const transactions = ref<Transaction[]>([]);
const loading = ref(true);
const error = ref('');
const statusFilter = ref<string>('ALL');

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'APPROVED', label: 'Aprobados' },
  { value: 'REJECTED', label: 'Rechazados' },
  { value: 'PROCESSING', label: 'Procesando' },
  { value: 'PENDING', label: 'Pendientes' },
];

const methodLabels: Record<string, string> = {
  CREDIT_CARD: 'Tarjeta',
  PSE: 'PSE',
  BOTON_BANCOLOMBIA: 'Bancolombia',
};

const filtered = computed(() => {
  if (statusFilter.value === 'ALL') return transactions.value;
  return transactions.value.filter(t => t.status === statusFilter.value);
});

const counts = computed(() => ({
  total: transactions.value.length,
  approved: transactions.value.filter(t => t.status === 'APPROVED').length,
  rejected: transactions.value.filter(t => t.status === 'REJECTED').length,
  pending: transactions.value.filter(t => t.status === 'PROCESSING' || t.status === 'PENDING').length,
}));

function statusClass(status: string): string {
  switch (status) {
    case 'APPROVED': return 'bg-success/10 text-success';
    case 'REJECTED': return 'bg-error/10 text-error';
    case 'PROCESSING': return 'bg-blue-100 text-blue-700';
    case 'PENDING': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'APPROVED': return 'Aprobado';
    case 'REJECTED': return 'Rechazado';
    case 'PROCESSING': return 'Procesando';
    case 'PENDING': return 'Pendiente';
    default: return status;
  }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

async function fetchTransactions() {
  loading.value = true;
  error.value = '';
  try {
    const response = await api.get<Transaction[]>('/payments/transactions');
    transactions.value = response.data;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    error.value = 'No se pudieron cargar las transacciones.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchTransactions);
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-primary">Transacciones</h1>
      <button
        @click="fetchTransactions"
        :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <svg
          class="w-4 h-4"
          :class="loading ? 'animate-spin' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Actualizar
      </button>
    </div>

    <!-- Tarjetas resumen -->
    <div class="grid sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500 mb-1">Total</p>
        <p class="text-2xl font-bold text-primary">{{ counts.total }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500 mb-1">Aprobados</p>
        <p class="text-2xl font-bold text-success">{{ counts.approved }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500 mb-1">Rechazados</p>
        <p class="text-2xl font-bold text-error">{{ counts.rejected }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-sm text-gray-500 mb-1">Pendientes</p>
        <p class="text-2xl font-bold text-yellow-600">{{ counts.pending }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-error/10 text-error p-4 rounded-xl mb-6 text-sm">
      {{ error }}
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- Filtro -->
      <div class="p-4 border-b border-gray-100 flex gap-2 flex-wrap">
        <button
          v-for="opt in statusOptions"
          :key="opt.value"
          @click="statusFilter = opt.value"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="statusFilter === opt.value
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="divide-y divide-gray-50">
        <div v-for="i in 5" :key="i" class="p-4 animate-pulse flex gap-4">
          <div class="h-4 bg-gray-200 rounded w-32"></div>
          <div class="h-4 bg-gray-200 rounded w-24"></div>
          <div class="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
        </div>
      </div>

      <!-- Sin resultados -->
      <div
        v-else-if="filtered.length === 0"
        class="p-12 text-center text-gray-400"
      >
        <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <p class="text-sm">No hay transacciones{{ statusFilter !== 'ALL' ? ' con este estado' : '' }}</p>
      </div>

      <!-- Tabla de datos -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <tr>
              <th class="text-left px-4 py-3">Orden</th>
              <th class="text-left px-4 py-3">Transaccion</th>
              <th class="text-left px-4 py-3">Estado</th>
              <th class="text-left px-4 py-3">Metodo</th>
              <th class="text-left px-4 py-3">Pagador</th>
              <th class="text-left px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="tx in filtered"
              :key="tx.transaction_id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 font-mono font-medium text-primary">
                {{ tx.reference_id }}
              </td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">
                {{ tx.transaction_id }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="statusClass(tx.status)"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    :class="{
                      'bg-success': tx.status === 'APPROVED',
                      'bg-error': tx.status === 'REJECTED',
                      'bg-blue-500': tx.status === 'PROCESSING',
                      'bg-yellow-500': tx.status === 'PENDING',
                    }"
                  ></span>
                  {{ statusLabel(tx.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">
                {{ methodLabels[tx.payment_method] ?? tx.payment_method }}
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ tx.payer_name }}</p>
                <p class="text-xs text-gray-400">{{ tx.payer_email }}</p>
              </td>
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">
                {{ formatDate(tx.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
