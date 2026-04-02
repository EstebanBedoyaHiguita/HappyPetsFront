<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const authStore = useAuthStore();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const passwordSuccess = ref('');
const loading = ref(false);

async function changePassword() {
  passwordError.value = '';
  passwordSuccess.value = '';

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Las contraseñas nuevas no coinciden.';
    return;
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  loading.value = true;
  try {
    // Verify current password by attempting login
    await api.post('/auth/login', {
      email: authStore.user?.email,
      password: currentPassword.value,
    });

    await api.patch(`/users/${authStore.user?.id}`, { password: newPassword.value });

    passwordSuccess.value = 'Contraseña actualizada correctamente.';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch {
    passwordError.value = 'La contraseña actual es incorrecta o ocurrió un error.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-3xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-primary mb-8">Mi Perfil</h1>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center gap-4 mb-6 pb-6 border-b">
          <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {{ authStore.user?.name?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ authStore.user?.name }}</h2>
            <p class="text-gray-500">{{ authStore.user?.email }}</p>
            <span class="inline-block mt-1 bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-full uppercase">
              {{ authStore.user?.role }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-500">Nombre</label>
            <p class="mt-1">{{ authStore.user?.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500">Email</label>
            <p class="mt-1">{{ authStore.user?.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500">Rol</label>
            <p class="mt-1 capitalize">{{ authStore.user?.role }}</p>
          </div>
        </div>
      </div>

      <!-- Cambiar contraseña -->
      <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h3 class="text-lg font-bold mb-4">Cambiar contraseña</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Contraseña actual</label>
            <input
              v-model="currentPassword"
              type="password"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Nueva contraseña</label>
            <input
              v-model="newPassword"
              type="password"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Confirmar nueva contraseña</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</p>
          <p v-if="passwordSuccess" class="text-green-600 text-sm">{{ passwordSuccess }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {{ loading ? 'Guardando...' : 'Actualizar contraseña' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
