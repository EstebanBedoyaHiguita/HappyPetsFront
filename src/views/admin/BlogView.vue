<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import type { Post } from '../../types';

const posts = ref<Post[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const showModal = ref(false);
const editingPost = ref<Post | null>(null);

const form = ref({
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  published: false,
});

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

function openCreate() {
  editingPost.value = null;
  form.value = { title: '', excerpt: '', content: '', coverImage: '', published: false };
  error.value = '';
  showModal.value = true;
}

function openEdit(post: Post) {
  editingPost.value = post;
  form.value = {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage || '',
    published: post.published,
  };
  error.value = '';
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingPost.value = null;
}

async function fetchPosts() {
  loading.value = true;
  try {
    const response = await api.get<Post[]>('/posts');
    posts.value = response.data;
  } catch (err) {
    console.error('Error fetching posts:', err);
  } finally {
    loading.value = false;
  }
}

async function savePost() {
  if (!form.value.title.trim() || !form.value.excerpt.trim() || !form.value.content.trim()) {
    error.value = 'Titulo, resumen y contenido son obligatorios';
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    if (editingPost.value) {
      await api.patch(`/posts/${editingPost.value._id}`, form.value);
    } else {
      await api.post('/posts', form.value);
    }
    await fetchPosts();
    closeModal();
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    error.value = axiosError.response?.data?.message || 'Error al guardar la publicacion';
  } finally {
    saving.value = false;
  }
}

async function togglePublished(post: Post) {
  try {
    await api.patch(`/posts/${post._id}`, { published: !post.published });
    post.published = !post.published;
  } catch (err) {
    console.error('Error toggling publish:', err);
  }
}

async function deletePost(post: Post) {
  if (!confirm(`¿Eliminar "${post.title}"?`)) return;
  try {
    await api.delete(`/posts/${post._id}`);
    posts.value = posts.value.filter(p => p._id !== post._id);
  } catch (err) {
    console.error('Error deleting post:', err);
  }
}

onMounted(fetchPosts);
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-primary">Blog</h1>
      <button @click="openCreate" class="btn-secondary !py-2 !px-5 !rounded-lg text-sm">
        + Nueva publicacion
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4 animate-pulse flex gap-4">
        <div class="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-100 rounded w-2/3"></div>
          <div class="h-3 bg-gray-100 rounded w-full"></div>
          <div class="h-3 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- Sin posts -->
    <div v-else-if="posts.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
      <span class="text-5xl mb-4 block">📝</span>
      <p class="text-gray-500 font-medium mb-1">No hay publicaciones</p>
      <p class="text-sm text-gray-400 mb-6">Crea tu primera publicacion del blog</p>
      <button @click="openCreate" class="btn-secondary !py-2 !px-5 !rounded-lg text-sm">
        + Nueva publicacion
      </button>
    </div>

    <!-- Lista de posts -->
    <div v-else class="space-y-3">
      <div
        v-for="post in posts"
        :key="post._id"
        class="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-start hover:shadow-md transition-shadow"
      >
        <!-- Cover -->
        <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            v-if="post.coverImage"
            :src="post.coverImage"
            :alt="post.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-2xl">🐾</div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-dark line-clamp-1">{{ post.title }}</h3>
            <span
              class="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
              :class="post.published ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'"
            >
              {{ post.published ? 'Publicado' : 'Borrador' }}
            </span>
          </div>
          <p class="text-sm text-muted line-clamp-2 mt-1">{{ post.excerpt }}</p>
          <p class="text-xs text-gray-400 mt-2">{{ formatDate(post.createdAt) }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            @click="togglePublished(post)"
            class="text-xs px-3 py-1.5 rounded-lg border transition-colors"
            :class="post.published
              ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
              : 'border-success/30 text-success hover:bg-success/5'"
          >
            {{ post.published ? 'Despublicar' : 'Publicar' }}
          </button>
          <button
            @click="openEdit(post)"
            class="p-2 rounded-lg text-muted hover:text-primary hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="deletePost(post)"
            class="p-2 rounded-lg text-muted hover:text-error hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal crear/editar ──────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 mb-8">
          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-dark">
              {{ editingPost ? 'Editar publicacion' : 'Nueva publicacion' }}
            </h2>
            <button @click="closeModal" class="p-2 rounded-lg text-muted hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="savePost" class="p-6 space-y-5">
            <div v-if="error" class="bg-error/10 text-error p-3 rounded-lg text-sm">
              {{ error }}
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Titulo *</label>
              <input v-model="form.title" type="text" required class="input-field" placeholder="Titulo de la publicacion" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Resumen *</label>
              <textarea
                v-model="form.excerpt"
                required
                class="input-field"
                rows="2"
                placeholder="Breve descripcion que aparece en las cards"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Contenido *</label>
              <textarea
                v-model="form.content"
                required
                class="input-field"
                rows="8"
                placeholder="Contenido completo de la publicacion..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">URL de imagen de portada</label>
              <input
                v-model="form.coverImage"
                type="url"
                class="input-field"
                placeholder="https://..."
              />
              <div v-if="form.coverImage" class="mt-2">
                <img :src="form.coverImage" alt="Preview" class="h-32 rounded-lg object-cover" />
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="form.published = !form.published"
                class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                :class="form.published ? 'bg-success' : 'bg-gray-200'"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                  :class="form.published ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
              <label class="text-sm font-medium text-dark">
                {{ form.published ? 'Publicado' : 'Borrador' }}
              </label>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="submit"
                :disabled="saving"
                class="btn-secondary !py-2.5 !px-6 !rounded-xl disabled:opacity-50 flex-1 sm:flex-none"
              >
                {{ saving ? 'Guardando...' : (editingPost ? 'Guardar cambios' : 'Crear publicacion') }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-2.5 rounded-xl border border-gray-200 text-muted hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
