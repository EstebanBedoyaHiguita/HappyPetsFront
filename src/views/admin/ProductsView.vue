<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import type { Product, Category } from '../../types';

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const showModal = ref(false);
const editingProduct = ref<Product | null>(null);
const uploadingImage = ref(false);

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  available: true,
  featured: false,
  category: '',
  images: [] as string[],
});

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

async function loadData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      api.get<Product[]>('/products'),
      api.get<Category[]>('/categories'),
    ]);
    products.value = productsRes.data;
    categories.value = categoriesRes.data;
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
}

function openModal(product?: Product) {
  if (product) {
    editingProduct.value = product;
    form.value = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      available: product.available,
      featured: product.featured,
      category: product.category?._id || '',
      images: [...product.images],
    };
  } else {
    editingProduct.value = null;
    form.value = { name: '', description: '', price: 0, stock: 0, available: true, featured: false, category: '', images: [] };
  }
  showModal.value = true;
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploadingImage.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    form.value.images.push(response.data.url);
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Error al subir la imagen');
  } finally {
    uploadingImage.value = false;
    input.value = '';
  }
}

function removeImage(index: number) {
  form.value.images.splice(index, 1);
}

async function saveProduct() {
  try {
    if (editingProduct.value) {
      await api.patch(`/products/${editingProduct.value._id}`, form.value);
    } else {
      await api.post('/products', form.value);
    }
    showModal.value = false;
    await loadData();
  } catch (error) {
    console.error('Error saving product:', error);
  }
}

async function deleteProduct(id: string) {
  if (confirm('Estas seguro de eliminar este producto?')) {
    try {
      await api.delete(`/products/${id}`);
      await loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }
}

onMounted(loadData);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-primary">Productos</h1>
      <button @click="openModal()" class="btn-secondary">+ Nuevo producto</button>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium">Producto</th>
            <th class="px-4 py-3 text-left text-sm font-medium">SKU</th>
            <th class="px-4 py-3 text-left text-sm font-medium">Precio</th>
            <th class="px-4 py-3 text-left text-sm font-medium">Stock</th>
            <th class="px-4 py-3 text-left text-sm font-medium">Estado</th>
            <th class="px-4 py-3 text-left text-sm font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="product in products" :key="product._id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img :src="product.images[0] || '/placeholder-product.jpg'" class="w-10 h-10 rounded object-cover" />
                <span class="font-medium">{{ product.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ product.sku }}</td>
            <td class="px-4 py-3">{{ formatPrice(product.price) }}</td>
            <td class="px-4 py-3">{{ product.stock }}</td>
            <td class="px-4 py-3">
              <span :class="product.available ? 'bg-success/10 text-success' : 'bg-error/10 text-error'" class="px-2 py-1 rounded-full text-xs">
                {{ product.available ? 'Disponible' : 'Agotado' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <button @click="openModal(product)" class="text-accent hover:underline mr-3">Editar</button>
              <button @click="deleteProduct(product._id)" class="text-error hover:underline">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 class="text-xl font-bold mb-4">{{ editingProduct ? 'Editar' : 'Nuevo' }} Producto</h2>
        <form @submit.prevent="saveProduct" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nombre</label>
            <input v-model="form.name" required class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Descripcion</label>
            <textarea v-model="form.description" required class="input-field" rows="3"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Precio</label>
              <input v-model.number="form.price" type="number" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Stock</label>
              <input v-model.number="form.stock" type="number" class="input-field" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Categoria</label>
            <select v-model="form.category" class="input-field">
              <option value="">Sin categoria</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Imágenes -->
          <div>
            <label class="block text-sm font-medium mb-2">Imágenes</label>

            <!-- Preview de imágenes actuales -->
            <div v-if="form.images.length > 0" class="flex flex-wrap gap-2 mb-3">
              <div
                v-for="(img, index) in form.images"
                :key="index"
                class="relative group"
              >
                <img :src="img" class="w-20 h-20 object-cover rounded-lg border" />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Botón de subir imagen -->
            <label class="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="uploadingImage"
                @change="handleImageUpload"
              />
              <span
                class="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-secondary hover:text-secondary transition-colors"
                :class="uploadingImage ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <span v-if="uploadingImage">Subiendo...</span>
                <span v-else>+ Agregar imagen</span>
              </span>
            </label>
            <p class="text-xs text-gray-400 mt-1">Máx 5MB por imagen. JPG, PNG, WEBP.</p>
          </div>

          <div class="flex gap-4">
            <label class="flex items-center gap-2">
              <input v-model="form.available" type="checkbox" class="w-4 h-4" />
              <span>Disponible</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="form.featured" type="checkbox" class="w-4 h-4" />
              <span>Destacado</span>
            </label>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" class="flex-1 btn-secondary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
