<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import api from '../services/api';
import type { Product, Category, Post } from '../types';

const featuredProducts = ref<Product[]>([]);
const bestSellers = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const latestPosts = ref<Post[]>([]);
const loading = ref(true);

// ── Parallax ───────────────────────────────────────────────────────────────────
const parallaxOffset = ref(0);

function handleScroll() {
  parallaxOffset.value = window.scrollY * 0.4;
}

// ── Scroll reveal ──────────────────────────────────────────────────────────────
let observer: IntersectionObserver | null = null;

function initReveal() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
    observer?.observe(el);
  });
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true });

  try {
    const [featuredRes, bestSellersRes, categoriesRes, postsRes] = await Promise.all([
      api.get<Product[]>('/products/featured?limit=4'),
      api.get<Product[]>('/products/best-sellers?limit=4'),
      api.get<Category[]>('/categories?active=true'),
      api.get<Post[]>('/posts?limit=2&published=true'),
    ]);
    featuredProducts.value = featuredRes.data;
    bestSellers.value = bestSellersRes.data;
    categories.value = categoriesRes.data;
    latestPosts.value = postsRes.data;
  } catch (error) {
    console.error('Error loading home data:', error);
  } finally {
    loading.value = false;
    // Init after DOM renders with data
    setTimeout(initReveal, 100);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  observer?.disconnect();
});
</script>

<template>
  <div class="overflow-x-hidden">

    <!-- ── Hero con parallax ─────────────────────────────────────────────────── -->
    <section class="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-primary">
      <!-- Parallax background layer -->
      <div
        class="absolute inset-0 will-change-transform"
        :style="{ transform: `translateY(${parallaxOffset}px)` }"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-400/80"></div>
        <!-- Orbs decorativos -->
        <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/15 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <!-- Contenido -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 reveal-left">
              🐾 La alimentacion que tu peludo merece
            </div>
            <h1 class="font-heading text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 reveal-left" style="transition-delay: 100ms">
              Todo para tu
              <span class="block text-accent drop-shadow-lg">mejor amigo</span>
            </h1>
            <p class="text-white/70 text-xl mb-10 max-w-lg leading-relaxed reveal-left" style="transition-delay: 200ms">
              Productos premium seleccionados con amor para el bienestar de tu mascota.
              Envios rapidos a todo Colombia.
            </p>
            <div class="flex flex-wrap gap-4 reveal-left" style="transition-delay: 300ms">
              <RouterLink to="/tienda" class="btn-secondary text-lg px-8 py-4">
                Ver tienda
              </RouterLink>
              <RouterLink to="/nosotros" class="btn-outline text-lg px-8 py-4">
                Conocenos
              </RouterLink>
            </div>
          </div>

          <!-- Tarjeta flotante derecha -->
          <div class="hidden lg:flex justify-center items-center reveal-right">
            <div class="relative">
              <!-- Anillos decorativos -->
              <div class="absolute inset-0 rounded-full border-2 border-white/10 scale-110 animate-pulse"></div>
              <div class="absolute inset-0 rounded-full border border-white/5 scale-125"></div>

              <div class="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                <span class="text-[120px] drop-shadow-2xl select-none">🐕</span>
              </div>

              <!-- Badges flotantes con animación -->
              <div class="absolute -top-6 -right-6 bg-white rounded-2xl px-5 py-3 shadow-2xl animate-bounce" style="animation-duration: 3s">
                <p class="text-xs text-muted font-medium">Alimentacion</p>
                <p class="font-heading font-bold text-dark text-sm">100% Natural</p>
              </div>
              <div class="absolute -bottom-6 -left-6 bg-accent rounded-2xl px-5 py-3 shadow-2xl animate-bounce" style="animation-duration: 3.5s">
                <p class="text-white text-xs font-medium">Entrega rapida</p>
                <p class="font-heading font-bold text-white text-sm">24 - 72 hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span class="text-xs tracking-widest uppercase">Scroll</span>
        <div class="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse"></div>
      </div>
    </section>

    <!-- ── Trust bar ─────────────────────────────────────────────────────────── -->
    <section class="bg-cream border-y border-orange-100 py-5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap justify-center gap-8 text-sm text-muted font-medium">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Pago 100% seguro
          </span>
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Productos garantizados
          </span>
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Atencion personalizada
          </span>
        </div>
      </div>
    </section>

    <!-- ── Categorías ─────────────────────────────────────────────────────────── -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14 reveal">
          <h2 class="section-title">Explora por categoria</h2>
          <p class="section-subtitle">Encuentra exactamente lo que tu mascota necesita</p>
        </div>

        <div v-if="categories.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-5">
          <RouterLink
            v-for="(category, i) in categories"
            :key="category._id"
            :to="`/tienda?category=${category.slug}`"
            class="reveal group relative bg-gray-50 rounded-3xl p-8 text-center hover:bg-primary transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100 hover:border-primary hover:shadow-card-hover"
            :style="`transition-delay: ${i * 80}ms`"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary group-hover:to-blue-400 transition-all duration-500 rounded-3xl"></div>
            <div class="relative">
              <span v-if="category.icon" class="text-5xl mb-4 block group-hover:scale-125 transition-transform duration-500">{{ category.icon }}</span>
              <img v-else-if="category.image" :src="category.image" :alt="category.name" class="w-14 h-14 mx-auto mb-4 object-contain group-hover:scale-125 transition-transform duration-500" />
              <span v-else class="text-5xl mb-4 block group-hover:scale-125 transition-transform duration-500">🐾</span>
              <h3 class="font-heading font-semibold text-dark group-hover:text-white transition-colors duration-300 text-sm">{{ category.name }}</h3>
            </div>
          </RouterLink>
        </div>
        <div v-else-if="!loading" class="text-center py-8 text-muted">
          <p>No hay categorias disponibles</p>
        </div>
      </div>
    </section>

    <!-- ── Featured Products ──────────────────────────────────────────────────── -->
    <section class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-12">
          <div class="reveal-left">
            <h2 class="section-title">Productos destacados</h2>
            <p class="section-subtitle">Lo mejor para tu mascota</p>
          </div>
          <RouterLink
            to="/tienda?featured=true"
            class="hidden sm:flex items-center gap-1 text-accent hover:text-orange-600 font-semibold text-sm transition-colors reveal-right"
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
          <div
            v-for="(product, i) in featuredProducts"
            :key="product._id"
            class="reveal"
            :style="`transition-delay: ${i * 100}ms`"
          >
            <ProductCard :product="product" />
          </div>
        </div>

        <div v-else class="text-center py-12 text-muted">
          <p>No hay productos destacados disponibles</p>
        </div>
      </div>
    </section>

    <!-- ── Stats Banner ───────────────────────────────────────────────────────── -->
    <section class="py-20 bg-primary relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
          <!-- Stat 1 -->
          <div class="reveal text-center" style="transition-delay: 0ms">
            <p class="font-heading text-4xl font-bold text-white mb-2">1.200+</p>
            <p class="text-white/60 text-sm font-medium uppercase tracking-wider">Clientes felices</p>
          </div>
          <!-- Stat 2 -->
          <div class="reveal text-center" style="transition-delay: 100ms">
            <p class="font-heading text-4xl font-bold text-white mb-2">4.9★</p>
            <p class="text-white/60 text-sm font-medium uppercase tracking-wider">Calificacion</p>
          </div>
          <!-- Ingredientes naturales -->
          <div class="reveal col-span-2 flex items-center justify-center gap-4" style="transition-delay: 200ms">
            <div class="flex flex-col items-center gap-1">
              <span class="text-4xl">🥩</span>
              <p class="text-white/50 text-xs">Carne</p>
            </div>
            <div class="flex flex-col items-center gap-1">
              <span class="text-4xl">🥦</span>
              <p class="text-white/50 text-xs">Verduras</p>
            </div>
            <div class="flex flex-col items-center gap-1">
              <span class="text-4xl">🥕</span>
              <p class="text-white/50 text-xs">Vegetales</p>
            </div>
            <div class="flex flex-col items-center gap-1">
              <span class="text-4xl">🐟</span>
              <p class="text-white/50 text-xs">Pescado</p>
            </div>
            <div class="flex flex-col items-center gap-1">
              <span class="text-4xl">🫐</span>
              <p class="text-white/50 text-xs">Frutas</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Best Sellers ───────────────────────────────────────────────────────── -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-12">
          <div class="reveal-left">
            <h2 class="section-title">Mas vendidos</h2>
            <p class="section-subtitle">Los favoritos de nuestros clientes</p>
          </div>
          <RouterLink
            to="/tienda"
            class="hidden sm:flex items-center gap-1 text-accent hover:text-orange-600 font-semibold text-sm transition-colors reveal-right"
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
          <div
            v-for="(product, i) in bestSellers"
            :key="product._id"
            class="reveal"
            :style="`transition-delay: ${i * 100}ms`"
          >
            <ProductCard :product="product" />
          </div>
        </div>

        <div v-else class="text-center py-12 text-muted">
          <p>No hay productos disponibles</p>
        </div>
      </div>
    </section>

    <!-- ── Últimas del Blog ───────────────────────────────────────────────────── -->
    <section v-if="latestPosts.length > 0" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-12">
          <div class="reveal-left">
            <h2 class="section-title">Del blog</h2>
            <p class="section-subtitle">Tips y novedades para tu mascota</p>
          </div>
          <RouterLink
            to="/blog"
            class="hidden sm:flex items-center gap-1 text-accent hover:text-orange-600 font-semibold text-sm transition-colors reveal-right"
          >
            Ver todo el blog
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </RouterLink>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <RouterLink
            v-for="(post, i) in latestPosts"
            :key="post._id"
            :to="`/blog/${post.slug}`"
            class="reveal group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 flex flex-col"
            :style="`transition-delay: ${i * 150}ms`"
          >
            <!-- Cover image -->
            <div class="relative h-56 bg-gray-100 overflow-hidden">
              <img
                v-if="post.coverImage"
                :src="post.coverImage"
                :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-6xl">🐾</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>

            <!-- Content -->
            <div class="p-7 flex-1 flex flex-col">
              <p class="text-xs text-muted font-medium uppercase tracking-wider mb-3">
                {{ formatDate(post.createdAt) }}
              </p>
              <h3 class="font-heading font-bold text-dark text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {{ post.title }}
              </h3>
              <p class="text-muted text-sm leading-relaxed line-clamp-3 flex-1">
                {{ post.excerpt }}
              </p>
              <div class="flex items-center gap-2 mt-5 text-accent font-semibold text-sm">
                Leer articulo
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ── CTA Final ──────────────────────────────────────────────────────────── -->
    <section class="relative py-32 overflow-hidden">
      <!-- Fondo fijo tipo parallax -->
      <div class="absolute inset-0 bg-primary">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,145,73,0.3),rgba(255,255,255,0))]"></div>
        <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      <div class="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-6xl mb-8 block reveal">🐶</span>
        <h2 class="font-heading text-4xl lg:text-5xl font-bold text-white mb-6 reveal" style="transition-delay: 100ms">
          Comienza hoy a darle<br>lo mejor a tu mascota
        </h2>
        <p class="text-white/60 mb-10 text-xl leading-relaxed reveal" style="transition-delay: 200ms">
          Recibe tus productos en la puerta de tu casa con envio rapido a todo Colombia.
        </p>
        <RouterLink to="/tienda" class="btn-secondary text-base inline-block reveal" style="transition-delay: 300ms">
          Comprar ahora
        </RouterLink>
      </div>
    </section>

  </div>
</template>
