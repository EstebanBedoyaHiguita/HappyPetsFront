<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();
const isMobileMenuOpen = ref(false);

const navLinks = [
  { name: 'Inicio', to: '/' },
  { name: 'Tienda', to: '/tienda' },
  { name: 'Nosotros', to: '/nosotros' },
  { name: 'Blog', to: '/blog' },
];
</script>

<template>
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">

        <!-- Logo -->
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span class="text-lg leading-none">🐾</span>
            </div>
            <span class="text-xl font-heading font-bold text-primary">Happy Pets</span>
          </RouterLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-4 py-2 rounded-lg text-muted hover:text-primary hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
            active-class="text-primary bg-secondary font-semibold"
          >
            {{ link.name }}
          </RouterLink>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">

          <!-- Cart button -->
          <button
            @click="cartStore.toggleCart"
            class="relative p-2 rounded-lg text-muted hover:text-primary hover:bg-gray-50 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
            >
              {{ cartStore.itemCount }}
            </span>
          </button>

          <!-- Auth buttons -->
          <div v-if="!authStore.isAuthenticated" class="hidden md:flex items-center gap-2">
            <RouterLink
              to="/login"
              class="px-4 py-2 text-sm text-muted hover:text-primary transition-colors font-medium"
            >
              Iniciar sesion
            </RouterLink>
            <RouterLink
              to="/registro"
              class="btn-primary !py-2 !px-5 !text-sm"
            >
              Registrarse
            </RouterLink>
          </div>

          <!-- User menu -->
          <div v-else class="hidden md:flex items-center gap-2">
            <RouterLink
              v-if="authStore.canManageProducts"
              to="/admin"
              class="px-4 py-2 text-sm text-muted hover:text-primary hover:bg-gray-50 rounded-lg transition-all font-medium"
            >
              Admin
            </RouterLink>
            <RouterLink
              to="/perfil"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              <div class="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="text-sm font-medium text-dark">{{ authStore.user?.name?.split(' ')[0] }}</span>
            </RouterLink>
            <button
              @click="authStore.logout"
              class="p-2 rounded-lg text-muted hover:text-error hover:bg-red-50 transition-all"
              title="Cerrar sesion"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-muted hover:text-primary hover:bg-gray-50 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white">
      <div class="px-4 py-4 space-y-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="block px-4 py-2.5 rounded-xl text-muted hover:text-primary hover:bg-gray-50 font-medium transition-all"
          active-class="text-primary bg-secondary font-semibold"
          @click="isMobileMenuOpen = false"
        >
          {{ link.name }}
        </RouterLink>

        <div v-if="!authStore.isAuthenticated" class="pt-3 border-t border-gray-100 space-y-1">
          <RouterLink
            to="/login"
            class="block px-4 py-2.5 rounded-xl text-muted hover:text-primary hover:bg-gray-50 font-medium transition-all"
            @click="isMobileMenuOpen = false"
          >
            Iniciar sesion
          </RouterLink>
          <RouterLink
            to="/registro"
            class="block px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-center transition-all hover:bg-orange-600"
            @click="isMobileMenuOpen = false"
          >
            Registrarse
          </RouterLink>
        </div>

        <div v-else class="pt-3 border-t border-gray-100 space-y-1">
          <RouterLink
            v-if="authStore.canManageProducts"
            to="/admin"
            class="block px-4 py-2.5 rounded-xl text-muted hover:text-primary hover:bg-gray-50 font-medium transition-all"
            @click="isMobileMenuOpen = false"
          >
            Panel Admin
          </RouterLink>
          <RouterLink
            to="/perfil"
            class="block px-4 py-2.5 rounded-xl text-muted hover:text-primary hover:bg-gray-50 font-medium transition-all"
            @click="isMobileMenuOpen = false"
          >
            Mi Perfil
          </RouterLink>
          <button
            @click="authStore.logout(); isMobileMenuOpen = false"
            class="block w-full text-left px-4 py-2.5 rounded-xl text-error hover:bg-red-50 font-medium transition-all"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
