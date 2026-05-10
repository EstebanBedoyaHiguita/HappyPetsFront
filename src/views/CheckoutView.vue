<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import type { City } from '../types';

const cartStore = useCartStore();
const authStore = useAuthStore();

// ─── Steps ────────────────────────────────────────────────────────────────────
type Step = 'shipping' | 'payment';
const currentStep = ref<Step>('shipping');

// ─── Shipping form ─────────────────────────────────────────────────────────────
const departments = ref<string[]>([]);
const cities = ref<City[]>([]);
const selectedCity = ref<City | null>(null);
const loading = ref(false);
const loadingCities = ref(false);
const error = ref('');

const form = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  phone: '',
  address: '',
  cityId: '',
  department: '',
  notes: '',
});

// ─── Order (after step 1) ──────────────────────────────────────────────────────
const createdOrder = ref<{ _id: string; orderNumber: string; total: number } | null>(null);

// ─── Bold checkout ─────────────────────────────────────────────────────────────
const boldContainer = ref<HTMLElement | null>(null);
const loadingBold = ref(false);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const response = await api.get<string[]>('/cities/departments');
    departments.value = response.data;
  } catch (err) {
    console.error('Error loading departments:', err);
  }
});

watch(
  () => form.value.department,
  async (department) => {
    if (department) {
      loadingCities.value = true;
      cities.value = [];
      form.value.cityId = '';
      selectedCity.value = null;
      cartStore.clearShippingInfo();
      try {
        const response = await api.get<City[]>(`/cities/department/${encodeURIComponent(department)}`);
        cities.value = response.data;
      } catch (err) {
        console.error('Error loading cities:', err);
      } finally {
        loadingCities.value = false;
      }
    }
  }
);

watch(
  () => form.value.cityId,
  (cityId) => {
    if (cityId) {
      const city = cities.value.find(c => c._id === cityId);
      if (city) {
        selectedCity.value = city;
        cartStore.calculateShippingByCity(city);
      }
    }
  }
);

// ─── Step 1: Create order ──────────────────────────────────────────────────────
async function handleCheckout() {
  error.value = '';

  if (!selectedCity.value) {
    error.value = 'Por favor selecciona una ciudad';
    return;
  }

  loading.value = true;

  try {
    const orderData = {
      items: cartStore.items.map(item => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      shippingAddress: {
        name: form.value.name,
        phone: form.value.phone,
        email: form.value.email,
        address: form.value.address,
        city: selectedCity.value.name,
        department: form.value.department,
        notes: form.value.notes,
      },
    };

    const response = await api.post('/orders', orderData);
    createdOrder.value = {
      _id: response.data._id,
      orderNumber: response.data.orderNumber,
      total: response.data.total,
    };

    currentStep.value = 'payment';
    await nextTick();
    await loadBoldButton();
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    error.value = axiosError.response?.data?.message || 'Error al crear la orden';
  } finally {
    loading.value = false;
  }
}

// ─── Step 2: Inject Bold button ────────────────────────────────────────────────
async function loadBoldButton() {
  if (!createdOrder.value) return;
  loadingBold.value = true;

  try {
    const res = await api.get<{
      apiKey: string;
      orderId: string;
      amount: string;
      currency: string;
      integritySignature: string;
      description: string;
    }>(`/payments/checkout/${createdOrder.value._id}`);

    const params = res.data;

    await nextTick();
    if (!boldContainer.value) return;

    // Limpiar scripts previos de Bold para evitar duplicados
    boldContainer.value.innerHTML = '';
    document.getElementById('bold-lib')?.remove();

    // 1. Insertar el script de datos PRIMERO
    const dataScript = document.createElement('script');
    dataScript.setAttribute('data-bold-button', '');
    dataScript.setAttribute('data-render-mode', 'embedded');
    dataScript.setAttribute('data-api-key', params.apiKey);
    dataScript.setAttribute('data-order-id', params.orderId);
    dataScript.setAttribute('data-amount', params.amount);
    dataScript.setAttribute('data-currency', params.currency);
    dataScript.setAttribute('data-integrity-signature', params.integritySignature);
    dataScript.setAttribute('data-description', params.description);
    dataScript.setAttribute('data-redirection-url', `${window.location.origin}/pago-resultado`);
    boldContainer.value.appendChild(dataScript);

    // 2. Cargar la librería de Bold DESPUÉS: la encontrará y renderizará el botón
    await new Promise<void>((resolve, reject) => {
      const lib = document.createElement('script');
      lib.id = 'bold-lib';
      lib.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      lib.onload = () => resolve();
      lib.onerror = () => reject(new Error('No se pudo cargar Bold'));
      document.body.appendChild(lib);
    });
  } catch (err) {
    console.error('Error loading Bold checkout:', err);
    error.value = 'No se pudo cargar el botón de pago. Intenta de nuevo.';
  } finally {
    loadingBold.value = false;
  }
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-primary mb-8">Checkout</h1>

      <!-- Carrito vacío -->
      <div
        v-if="cartStore.items.length === 0 && currentStep === 'shipping'"
        class="text-center py-16 bg-white rounded-xl"
      >
        <p class="text-gray-500 mb-4">Tu carrito esta vacio</p>
        <RouterLink to="/tienda" class="btn-primary">Ir a la tienda</RouterLink>
      </div>

      <!-- ── PASO 1: Datos de envío ────────────────────────────────────────── -->
      <div v-else-if="currentStep === 'shipping'" class="grid lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-xl font-bold text-primary mb-6">Datos de envio</h2>

          <div v-if="error" class="bg-error/10 text-error p-4 rounded-lg mb-6 text-sm">
            {{ error }}
          </div>

          <form @submit.prevent="handleCheckout" class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Nombre completo *</label>
                <input v-model="form.name" type="text" required class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Telefono *</label>
                <input v-model="form.phone" type="tel" required class="input-field" placeholder="+57 300 123 4567" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Email *</label>
              <input v-model="form.email" type="email" required class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Direccion de envio *</label>
              <input v-model="form.address" type="text" required class="input-field" placeholder="Calle, numero, barrio" />
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Departamento *</label>
                <select v-model="form.department" required class="input-field">
                  <option value="">Seleccionar...</option>
                  <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Ciudad *</label>
                <select
                  v-model="form.cityId"
                  required
                  class="input-field"
                  :disabled="!form.department || loadingCities"
                >
                  <option value="">{{ loadingCities ? 'Cargando...' : 'Seleccionar...' }}</option>
                  <option v-for="city in cities" :key="city._id" :value="city._id">{{ city.name }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Notas adicionales (opcional)</label>
              <textarea
                v-model="form.notes"
                class="input-field"
                rows="2"
                placeholder="Instrucciones de entrega, referencias, etc."
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="loading || !selectedCity"
              class="w-full btn-secondary mt-6 disabled:opacity-50"
            >
              {{ loading ? 'Procesando...' : 'Continuar al pago' }}
            </button>
          </form>
        </div>

        <!-- Resumen del pedido -->
        <div class="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-24">
          <h2 class="text-xl font-bold text-primary mb-6">Resumen del pedido</h2>
          <div class="space-y-4 mb-6">
            <div v-for="item in cartStore.items" :key="item.productId" class="flex gap-4">
              <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded" />
              <div class="flex-1">
                <p class="font-medium line-clamp-1">{{ item.name }}</p>
                <p class="text-sm text-gray-500">Cantidad: {{ item.quantity }}</p>
              </div>
              <p class="font-medium">{{ formatPrice(item.price * item.quantity) }}</p>
            </div>
          </div>
          <div class="border-t pt-4 space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span>{{ formatPrice(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Envio</span>
              <span v-if="!selectedCity" class="text-sm text-gray-400">Selecciona una ciudad</span>
              <span v-else>{{ formatPrice(cartStore.shipping) }}</span>
            </div>
            <div v-if="selectedCity" class="text-xs text-gray-500">
              Envio a {{ selectedCity.name }}, {{ selectedCity.department }}
              <span class="ml-1">({{ selectedCity.zone === 'zone1' ? 'Zona 1' : 'Zona 2' }})</span>
            </div>
            <div class="flex justify-between text-xl font-bold pt-3 border-t">
              <span>Total</span>
              <span class="text-primary">{{ formatPrice(cartStore.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── PASO 2: Pago con Bold ─────────────────────────────────────────── -->
      <div v-else-if="currentStep === 'payment'" class="grid lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <!-- Orden creada -->
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-primary">Orden {{ createdOrder?.orderNumber }} creada</p>
              <p class="text-sm text-gray-500">Completa tu pago de forma segura</p>
            </div>
          </div>

          <div v-if="error" class="bg-error/10 text-error p-4 rounded-lg mb-6 text-sm">
            {{ error }}
          </div>

          <!-- Contenedor del botón Bold -->
          <div v-if="loadingBold" class="flex flex-col items-center py-10 gap-4">
            <div class="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500 text-sm">Cargando pasarela de pago...</p>
          </div>

          <div ref="boldContainer" class="min-h-[80px]"></div>
        </div>

        <!-- Mini resumen -->
        <div class="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-24">
          <h2 class="text-xl font-bold text-primary mb-4">Tu pedido</h2>
          <p class="text-sm text-gray-500 mb-4">Orden {{ createdOrder?.orderNumber }}</p>
          <div class="space-y-3 mb-4">
            <div v-for="item in cartStore.items" :key="item.productId" class="flex justify-between text-sm">
              <span class="text-gray-600 line-clamp-1 flex-1 mr-2">{{ item.name }} × {{ item.quantity }}</span>
              <span class="font-medium flex-shrink-0">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
          <div class="border-t pt-4 space-y-2 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{{ formatPrice(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Envio</span>
              <span>{{ formatPrice(cartStore.shipping) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span class="text-primary">{{ formatPrice(createdOrder?.total ?? 0) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
