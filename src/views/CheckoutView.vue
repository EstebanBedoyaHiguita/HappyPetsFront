<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import type { City, PSEBank, PaymentAttemptResponse } from '../types';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

// ─── Steps ────────────────────────────────────────────────────────────────────
type Step = 'shipping' | 'payment' | 'success' | 'error';
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

// ─── Payment form ──────────────────────────────────────────────────────────────
type PaymentMethod = 'CREDIT_CARD' | 'PSE' | 'BOTON_BANCOLOMBIA';
const selectedPaymentMethod = ref<PaymentMethod>('CREDIT_CARD');
const pseBanks = ref<PSEBank[]>([]);
const loadingBanks = ref(false);
const processingPayment = ref(false);
const paymentError = ref('');

const payerForm = ref({
  document_type: 'CEDULA',
  document_number: '',
});

const cardForm = ref({
  cardholder_name: '',
  card_number: '',
  expiration_month: '',
  expiration_year: '',
  cvc: '',
  installments: 1,
});

const selectedBankCode = ref('');

// ─── Transaction result ────────────────────────────────────────────────────────
const transactionResult = ref<PaymentAttemptResponse | null>(null);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatCardNumber(event: Event) {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 16);
  cardForm.value.card_number = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
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
      shipping: cartStore.shipping,
    };

    const response = await api.post('/orders', orderData);
    createdOrder.value = {
      _id: response.data._id,
      orderNumber: response.data.orderNumber,
      total: response.data.total,
    };

    // Load PSE banks in parallel while transitioning
    loadPSEBanks();
    currentStep.value = 'payment';
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    error.value = axiosError.response?.data?.message || 'Error al crear la orden';
  } finally {
    loading.value = false;
  }
}

// ─── PSE banks ─────────────────────────────────────────────────────────────────
async function loadPSEBanks() {
  loadingBanks.value = true;
  try {
    const response = await api.get<{ banks: PSEBank[] }>('/payments/pse-banks');
    pseBanks.value = response.data.banks;
  } catch (err) {
    console.error('Error loading PSE banks:', err);
  } finally {
    loadingBanks.value = false;
  }
}

// ─── Step 2: Process payment ───────────────────────────────────────────────────
async function handlePayment() {
  if (!createdOrder.value) return;
  paymentError.value = '';
  processingPayment.value = true;

  try {
    // Create payment intent
    await api.post('/payments/intent', { orderId: createdOrder.value._id });

    // Build payer
    const payer = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      document_type: payerForm.value.document_type,
      document_number: payerForm.value.document_number,
    };

    // Build payment_method
    let payment_method: Record<string, unknown>;

    if (selectedPaymentMethod.value === 'CREDIT_CARD') {
      payment_method = {
        name: 'CREDIT_CARD',
        cardholder_name: cardForm.value.cardholder_name,
        card_number: cardForm.value.card_number.replace(/\s/g, ''),
        expiration_month: parseInt(cardForm.value.expiration_month),
        expiration_year: parseInt(cardForm.value.expiration_year),
        cvc: cardForm.value.cvc,
        installments: Number(cardForm.value.installments),
      };
    } else if (selectedPaymentMethod.value === 'PSE') {
      const bank = pseBanks.value.find(b => b.bank_code === selectedBankCode.value);
      payment_method = {
        name: 'PSE',
        bank_code: parseInt(selectedBankCode.value),
        bank_name: bank?.bank_name || '',
      };
    } else {
      payment_method = { name: 'BOTON_BANCOLOMBIA' };
    }

    const response = await api.post<PaymentAttemptResponse>('/payments/attempt', {
      reference_id: createdOrder.value.orderNumber,
      payer,
      payment_method,
    });

    const data = response.data;

    if (selectedPaymentMethod.value === 'CREDIT_CARD') {
      transactionResult.value = data;
      if (data.status === 'APPROVED') {
        cartStore.clearCart();
        currentStep.value = 'success';
      } else {
        currentStep.value = 'error';
      }
    } else {
      // PSE / Botón Bancolombia → redirect to bank
      if (data.next_actions?.redirect_url) {
        window.location.href = data.next_actions.redirect_url;
      }
    }
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    paymentError.value = axiosError.response?.data?.message || 'Error al procesar el pago';
  } finally {
    processingPayment.value = false;
  }
}

function retryPayment() {
  transactionResult.value = null;
  paymentError.value = '';
  currentStep.value = 'payment';
}

function finishOrder() {
  cartStore.clearCart();
  router.push('/');
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

      <!-- ── PASO 2: Método de pago ────────────────────────────────────────── -->
      <div v-else-if="currentStep === 'payment'" class="grid lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <!-- Header con orden creada -->
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-primary">Orden {{ createdOrder?.orderNumber }} creada</p>
              <p class="text-sm text-gray-500">Ahora completa tu pago</p>
            </div>
          </div>

          <h2 class="text-xl font-bold text-primary mb-6">Metodo de pago</h2>

          <div v-if="paymentError" class="bg-error/10 text-error p-4 rounded-lg mb-6 text-sm">
            {{ paymentError }}
          </div>

          <!-- Tabs de método de pago -->
          <div class="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
            <button
              @click="selectedPaymentMethod = 'CREDIT_CARD'"
              class="flex-1 py-3 text-sm font-medium transition-colors"
              :class="selectedPaymentMethod === 'CREDIT_CARD' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'"
            >
              Tarjeta
            </button>
            <button
              @click="selectedPaymentMethod = 'PSE'"
              class="flex-1 py-3 text-sm font-medium border-x border-gray-200 transition-colors"
              :class="selectedPaymentMethod === 'PSE' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'"
            >
              PSE
            </button>
            <button
              @click="selectedPaymentMethod = 'BOTON_BANCOLOMBIA'"
              class="flex-1 py-3 text-sm font-medium transition-colors"
              :class="selectedPaymentMethod === 'BOTON_BANCOLOMBIA' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'"
            >
              Bancolombia
            </button>
          </div>

          <form @submit.prevent="handlePayment" class="space-y-4">
            <!-- Datos del pagador (comunes) -->
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Tipo de documento *</label>
                <select v-model="payerForm.document_type" required class="input-field">
                  <option value="CEDULA">Cédula de ciudadanía</option>
                  <option value="CEDULA_EXTRANJERIA">Cédula de extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="TI">Tarjeta de identidad</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Numero de documento *</label>
                <input
                  v-model="payerForm.document_number"
                  type="text"
                  required
                  class="input-field"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <!-- ── Tarjeta de crédito ──────────────────────────────────────── -->
            <template v-if="selectedPaymentMethod === 'CREDIT_CARD'">
              <div>
                <label class="block text-sm font-medium mb-2">Nombre en la tarjeta *</label>
                <input
                  v-model="cardForm.cardholder_name"
                  type="text"
                  required
                  class="input-field uppercase"
                  placeholder="JUAN PEREZ"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Numero de tarjeta *</label>
                <input
                  :value="cardForm.card_number"
                  @input="formatCardNumber"
                  type="text"
                  required
                  inputmode="numeric"
                  maxlength="19"
                  class="input-field font-mono tracking-wider"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Mes exp. *</label>
                  <input
                    v-model="cardForm.expiration_month"
                    type="text"
                    required
                    inputmode="numeric"
                    maxlength="2"
                    class="input-field"
                    placeholder="MM"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Año exp. *</label>
                  <input
                    v-model="cardForm.expiration_year"
                    type="text"
                    required
                    inputmode="numeric"
                    maxlength="4"
                    class="input-field"
                    placeholder="AAAA"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">CVC *</label>
                  <input
                    v-model="cardForm.cvc"
                    type="text"
                    required
                    inputmode="numeric"
                    maxlength="4"
                    class="input-field"
                    placeholder="123"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Cuotas</label>
                <select v-model="cardForm.installments" class="input-field">
                  <option :value="1">1 cuota</option>
                  <option :value="2">2 cuotas</option>
                  <option :value="3">3 cuotas</option>
                  <option :value="6">6 cuotas</option>
                  <option :value="12">12 cuotas</option>
                  <option :value="24">24 cuotas</option>
                  <option :value="36">36 cuotas</option>
                </select>
              </div>
            </template>

            <!-- ── PSE ──────────────────────────────────────────────────────── -->
            <template v-else-if="selectedPaymentMethod === 'PSE'">
              <div>
                <label class="block text-sm font-medium mb-2">Banco *</label>
                <select
                  v-model="selectedBankCode"
                  required
                  class="input-field"
                  :disabled="loadingBanks"
                >
                  <option value="">{{ loadingBanks ? 'Cargando bancos...' : 'Selecciona tu banco' }}</option>
                  <option
                    v-for="bank in pseBanks"
                    :key="bank.bank_code"
                    :value="bank.bank_code"
                  >
                    {{ bank.bank_name }}
                  </option>
                </select>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-blue-800 text-sm">
                  Seras redirigido al portal de tu banco para completar el pago.
                </p>
              </div>
            </template>

            <!-- ── Botón Bancolombia ─────────────────────────────────────────── -->
            <template v-else>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-yellow-800 text-sm">
                  Seras redirigido al Boton Bancolombia para completar el pago de forma segura.
                </p>
              </div>
            </template>

            <button
              type="submit"
              :disabled="processingPayment"
              class="w-full btn-secondary mt-6 disabled:opacity-50"
            >
              {{ processingPayment ? 'Procesando...' : 'Pagar ' + formatPrice(createdOrder?.total ?? 0) }}
            </button>
          </form>
        </div>

        <!-- Mini resumen del pedido -->
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

      <!-- ── ÉXITO ─────────────────────────────────────────────────────────── -->
      <div v-else-if="currentStep === 'success'" class="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
        <div class="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-primary mb-2">Pago aprobado</h2>
        <p class="text-gray-600 mb-2">
          Orden <span class="font-semibold">{{ createdOrder?.orderNumber }}</span>
        </p>
        <p v-if="transactionResult" class="text-sm text-gray-400 mb-4">
          Transaccion: {{ transactionResult.transaction_id }}
        </p>
        <p class="text-2xl font-bold text-secondary mb-6">
          {{ formatPrice(createdOrder?.total ?? 0) }}
        </p>
        <button @click="finishOrder" class="btn-secondary">
          Volver al inicio
        </button>
      </div>

      <!-- ── ERROR DE PAGO ─────────────────────────────────────────────────── -->
      <div v-else-if="currentStep === 'error'" class="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
        <div class="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-primary mb-2">Pago rechazado</h2>
        <p class="text-gray-600 mb-2">
          Orden <span class="font-semibold">{{ createdOrder?.orderNumber }}</span>
        </p>
        <p v-if="transactionResult" class="text-sm text-gray-400 mb-6">
          Transaccion: {{ transactionResult.transaction_id }}
        </p>
        <p class="text-gray-500 text-sm mb-6">
          Tu pago no pudo ser procesado. Verifica los datos e intenta de nuevo.
        </p>
        <div class="flex gap-3 justify-center">
          <button @click="retryPayment" class="btn-secondary">
            Intentar de nuevo
          </button>
          <button @click="finishOrder" class="btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
