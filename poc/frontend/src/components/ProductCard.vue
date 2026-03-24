<template>
  <div class="product-card">
    <router-link :to="`/produit/${product.id}`">
      <img :src="product.image_url" :alt="product.title" class="product-img" />
    </router-link>
    <div class="product-info">
      <span class="product-category">{{ product.category }}</span>
      <router-link :to="`/produit/${product.id}`">
        <h3 class="product-title">{{ product.title }}</h3>
      </router-link>
      <div class="product-footer">
        <span class="product-price">{{ parseFloat(product.price).toFixed(2) }} €</span>
        <button
          :disabled="product.stock < 1"
          class="btn-add"
          @click.prevent="$emit('add-to-cart', product.id)"
        >
          {{ product.stock < 1 ? 'Épuisé' : 'Ajouter' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ product: Object })
defineEmits(['add-to-cart'])
</script>

<style scoped>
.product-card {
  background: white; border-radius: 10px; overflow: hidden;
  border: 1px solid #DDE4ED; transition: box-shadow 0.2s;
}
.product-card:hover { box-shadow: 0 4px 16px rgba(29,53,87,0.1); }
.product-img { width: 100%; height: 200px; object-fit: cover; display: block; }
.product-info { padding: 14px; }
.product-category {
  font-size: 11px; font-weight: 600; color: #457B9D; text-transform: uppercase;
  letter-spacing: 0.8px;
}
.product-title {
  font-size: 14px; color: #1D3557; font-weight: 600; margin: 6px 0 12px;
  line-height: 1.4; text-decoration: none; display: block;
}
a { text-decoration: none; }
.product-footer { display: flex; align-items: center; justify-content: space-between; }
.product-price { font-size: 16px; font-weight: 700; color: #1D3557; }
.btn-add {
  background: #1D3557; color: white; border: none; padding: 7px 14px;
  border-radius: 6px; font-size: 13px; cursor: pointer; transition: background 0.2s;
}
.btn-add:hover:not(:disabled) { background: #457B9D; }
.btn-add:disabled { background: #DDE4ED; color: #7f8c8d; cursor: not-allowed; }
</style>
