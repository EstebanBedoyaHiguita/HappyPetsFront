<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import type { Order } from '../../types';

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const filterStatus = ref('');
const updatingId = ref('');
const selectedOrder = ref<Order | null>(null);

const statusLabels: Record<string, string> = {
  pending:   'Pendiente',
  paid:      'Pagado',
  shipped:   'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const statusOptions: Record<string, string> = {
  pending:   'Pendiente',
  shipped:   'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  paid:      'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

const filtered = computed(() => {
  return orders.value.filter(o => {
    const matchSearch = !searchQuery.value ||
      o.orderNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (o.customer?.name || '').toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus = !filterStatus.value || o.status === filterStatus.value;
    return matchSearch && matchStatus;
  });
});

onMounted(async () => {
  try {
    const res = await api.get<Order[]>('/orders');
    orders.value = res.data;
  } catch (err) {
    error.value = 'Error al cargar los pedidos';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

async function updateStatus(order: Order, newStatus: string) {
  updatingId.value = order._id;
  error.value = '';
  try {
    await api.patch(`/orders/${order._id}`, { status: newStatus });
    order.status = newStatus as Order['status'];
    if (selectedOrder.value?._id === order._id) {
      selectedOrder.value.status = newStatus as Order['status'];
    }
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: { message?: string } } };
    error.value = `Error al actualizar: ${e.response?.status} - ${e.response?.data?.message || 'Sin respuesta del servidor'}`;
    console.error('Error actualizando estado:', err);
  } finally {
    updatingId.value = '';
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-primary">Pedidos</h1>
      <span class="text-sm text-gray-500">{{ orders.length }} pedido{{ orders.length !== 1 ? 's' : '' }} en total</span>
    </div>

    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por # orden o cliente..."
        class="input-field flex-1"
      />
      <select v-model="filterStatus" class="input-field sm:w-48">
        <option value="">Todos los estados</option>
        <option v-for="(label, key) in statusOptions" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-xl shadow-sm p-12 text-center">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-400">Cargando pedidos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">
      {{ error }}
    </div>

    <!-- Sin resultados -->
    <div v-else-if="filtered.length === 0" class="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
      No hay pedidos que coincidan con tu búsqueda.
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Orden</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600">Pagado</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600">Cambiar estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="order in filtered"
              :key="order._id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="selectedOrder = order"
            >
              <td class="px-4 py-3 font-mono font-semibold text-primary">{{ order.orderNumber }}</td>
              <td class="px-4 py-3 text-gray-700">{{ order.customer?.name || '—' }}</td>
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ formatDate(order.createdAt) }}</td>
              <td class="px-4 py-3 text-right font-semibold">{{ formatPrice(order.total) }}</td>
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="statusColors[order.status]">
                  {{ statusLabels[order.status] }}
                </span>
              </td>
              <td class="px-4 py-3 text-center" @click.stop>
                <input
                  type="checkbox"
                  :checked="order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered'"
                  :disabled="updatingId === order._id"
                  class="w-4 h-4 accent-primary cursor-pointer disabled:opacity-50"
                  @change="updateStatus(order, order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered' ? 'pending' : 'paid')"
                />
              </td>
              <td class="px-4 py-3 text-center" @click.stop>
                <select
                  :value="order.status"
                  :disabled="updatingId === order._id"
                  class="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white disabled:opacity-50"
                  @change="updateStatus(order, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="(label, key) in statusOptions" :key="key" :value="key">{{ label }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal detalle -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="selectedOrder = null"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="font-bold text-primary text-lg">Orden {{ selectedOrder.orderNumber }}</h2>
          <button @click="selectedOrder = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-5">
          <!-- Estado -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Estado actual</span>
            <span class="px-3 py-1 rounded-full text-sm font-medium" :class="statusColors[selectedOrder.status]">
              {{ statusLabels[selectedOrder.status] }}
            </span>
          </div>

          <!-- Cliente -->
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Cliente</p>
            <p class="font-medium">{{ selectedOrder.customer?.name || '—' }}</p>
            <p class="text-sm text-gray-500">{{ selectedOrder.customer?.email || '—' }}</p>
          </div>

          <!-- Dirección de envío -->
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Envío</p>
            <p class="text-sm text-gray-700">{{ (selectedOrder.shippingAddress as any)?.address }}</p>
            <p class="text-sm text-gray-500">
              {{ (selectedOrder.shippingAddress as any)?.city }}, {{ (selectedOrder.shippingAddress as any)?.department }}
            </p>
            <p class="text-sm text-gray-500">{{ (selectedOrder.shippingAddress as any)?.phone }}</p>
            <p v-if="(selectedOrder.shippingAddress as any)?.notes" class="text-sm text-gray-400 italic mt-1">
              Nota: {{ (selectedOrder.shippingAddress as any)?.notes }}
            </p>
          </div>

          <!-- Productos -->
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Productos</p>
            <div class="space-y-2">
              <div v-for="item in selectedOrder.items" :key="item.product" class="flex justify-between text-sm">
                <span class="text-gray-700">{{ item.name }} <span class="text-gray-400">× {{ item.quantity }}</span></span>
                <span class="font-medium">{{ formatPrice(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div class="border-t pt-4 space-y-1 text-sm">
            <div class="flex justify-between text-gray-500">
              <span>Subtotal</span><span>{{ formatPrice(selectedOrder.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-500">
              <span>Envío</span><span>{{ formatPrice(selectedOrder.shipping) }}</span>
            </div>
            <div class="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span><span class="text-primary">{{ formatPrice(selectedOrder.total) }}</span>
            </div>
          </div>

          <!-- Cambiar estado -->
          <div class="border-t pt-4">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-3">Cambiar estado</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(label, key) in statusLabels"
                :key="key"
                :disabled="selectedOrder.status === key || updatingId === selectedOrder._id"
                class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                :class="selectedOrder.status === key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-primary hover:text-primary'"
                @click="updateStatus(selectedOrder, key)"
              >
                {{ label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
