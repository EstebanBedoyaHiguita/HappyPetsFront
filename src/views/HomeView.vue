<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import api from '../services/api';
import type { Product, Category } from '../types';

const featuredProducts = ref<Product[]>([]);
const bestSellers = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [featuredRes, bestSellersRes, categoriesRes] = await Promise.all([
      api.get<Product[]>('/products/featured?limit=4'),
      api.get<Product[]>('/products/best-sellers?limit=4'),
      api.get<Category[]>('/categories?active=true'),
    ]);
    featuredProducts.value = featuredRes.data;
    bestSellers.value = bestSellersRes.data;
    categories.value = categoriesRes.data;
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- ── Hero ─────────────────────────────────────────────────────────────── -->
    <section class="relative bg-primary overflow-hidden">
      <!-- Decorative blobs -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span class="inline-flex items-center gap-2 bg-accent/15 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              🐾 Tienda para mascotas #1 en Colombia
            </span>
            <h1 class="font-heading text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Todo para tu
              <span class="text-accent block">mejor amigo</span>
            </h1>
            <p class="text-white/70 text-lg mb-10 max-w-lg leading-relaxed">
              Productos premium seleccionados con amor para el bienestar de tu mascota.
              Envios a todo Colombia con la mejor garantia.
            </p>
            <div class="flex flex-wrap gap-4">
              <RouterLink to="/tienda" class="btn-primary">
                Ver tienda
              </RouterLink>
              <RouterLink
                to="/nosotros"
                class="btn-outline !border-white/30 !text-white hover:!bg-white hover:!text-primary"
              >
                Conocenos
              </RouterLink>
            </div>

            <!-- Stats -->
            <div class="flex gap-8 mt-12 pt-8 border-t border-white/10">
              <div>
                <p class="font-heading text-2xl font-bold text-white">500+</p>
                <p class="text-white/50 text-sm">Productos</p>
              </div>
              <div>
                <p class="font-heading text-2xl font-bold text-white">1.200+</p>
                <p class="text-white/50 text-sm">Clientes felices</p>
              </div>
              <div>
                <p class="font-heading text-2xl font-bold text-white">32</p>
                <p class="text-white/50 text-sm">Departamentos</p>
              </div>
            </div>
          </div>

          <!-- Hero visual -->
          <div class="hidden lg:flex justify-center items-center">
            <div class="relative">
              <!-- Background circle -->
              <div class="w-80 h-80 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <div class="w-64 h-64 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <span class="text-9xl drop-shadow-lg">🐕</span>
                </div>
              </div>
              <!-- Floating badges -->
              <div class="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl">
                <p class="text-xs text-muted font-medium">Envio gratis</p>
                <p class="font-heading font-bold text-primary text-sm">+$100.000</p>
              </div>
              <div class="absolute -bottom-4 -left-4 bg-accent rounded-2xl px-4 py-2.5 shadow-xl">
                <p class="text-white text-xs font-medium">Entrega</p>
                <p class="font-heading font-bold text-white text-sm">24-72 hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Trust bar ─────────────────────────────────────────────────────────── -->
    <section class="bg-secondary border-y border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-wrap justify-center gap-8 text-sm text-muted font-medium">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Envio a todo Colombia
          </span>
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Pago 100% seguro con Bold
          </span>
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Productos garantizados
          </span>
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Atencion personalizada
          </span>
        </div>
      </div>
    </section>

    <!-- ── Categories ─────────────────────────────────────────────────────────── -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="section-title">Explora por categoria</h2>
          <p class="section-subtitle">Encuentra exactamente lo que tu mascota necesita</p>
        </div>

        <div v-if="categories.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RouterLink
            v-for="category in categories"
            :key="category._id"
            :to="`/tienda?category=${category.slug}`"
            class="group bg-cream rounded-2xl p-6 text-center hover:bg-accent/5 hover:border-accent/20 border border-transparent transition-all duration-300 cursor-pointer"
          >
            <span v-if="category.icon" class="text-5xl mb-3 block group-hover:scale-110 transition-transform duration-300">{{ category.icon }}</span>
            <img v-else-if="category.image" :src="category.image" :alt="category.name" class="w-14 h-14 mx-auto mb-3 object-contain group-hover:scale-110 transition-transform duration-300" />
            <span v-else class="text-5xl mb-3 block group-hover:scale-110 transition-transform duration-300">🐾</span>
            <h3 class="font-heading font-semibold text-primary text-sm">{{ category.name }}</h3>
          </RouterLink>
        </div>
        <div v-else-if="!loading" class="text-center py-8 text-muted">
          <p>No hay categorias disponibles</p>
        </div>
      </div>
    </section>

    <!-- ── Featured Products ──────────────────────────────────────────────────── -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="section-title">Productos destacados</h2>
            <p class="section-subtitle">Lo mejor para tu mascota</p>
          </div>
          <RouterLink
            to="/tienda?featured=true"
            class="hidden sm:flex items-center gap-1 text-accent hover:text-orange-600 font-semibold text-sm transition-colors"
          >
            Ver todos
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white rounded-2xl animate-pulse border border-gray-100">
            <div class="aspect-square bg-gray-100 rounded-t-2xl"></div>
            <div class="p-4 space-y-3">
              <div class="h-4 bg-gray-100 rounded-full w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded-full"></div>
              <div class="h-6 bg-gray-100 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="featuredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard v-for="product in featuredProducts" :key="product._id" :product="product" />
        </div>

        <div v-else class="text-center py-12 text-muted">
          <p>No hay productos destacados disponibles</p>
        </div>
      </div>
    </section>

    <!-- ── Best Sellers ───────────────────────────────────────────────────────── -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="section-title">Mas vendidos</h2>
            <p class="section-subtitle">Los favoritos de nuestros clientes</p>
          </div>
          <RouterLink
            to="/tienda"
            class="hidden sm:flex items-center gap-1 text-accent hover:text-orange-600 font-semibold text-sm transition-colors"
          >
            Ver todos
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white rounded-2xl animate-pulse border border-gray-100">
            <div class="aspect-square bg-gray-100 rounded-t-2xl"></div>
            <div class="p-4 space-y-3">
              <div class="h-4 bg-gray-100 rounded-full w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded-full"></div>
              <div class="h-6 bg-gray-100 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="bestSellers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard v-for="product in bestSellers" :key="product._id" :product="product" />
        </div>

        <div v-else class="text-center py-12 text-muted">
          <p>No hay productos disponibles</p>
        </div>
      </div>
    </section>

    <!-- ── CTA Banner ─────────────────────────────────────────────────────────── -->
    <section class="py-20 bg-primary relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-5xl mb-6 block">🐶</span>
        <h2 class="font-heading text-4xl font-bold text-white mb-4">
          Comienza hoy a darle lo mejor
        </h2>
        <p class="text-white/60 mb-10 max-w-xl mx-auto text-lg">
          Recibe tus productos en la puerta de tu casa con envio rapido a todo Colombia.
        </p>
        <RouterLink to="/tienda" class="btn-primary text-base">
          Comprar ahora
        </RouterLink>
      </div>
    </section>
  </div>
</template>
