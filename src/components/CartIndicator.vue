<template>
  <router-link class="header__cart" aria-label="Корзина с товарами" :to="{ name: 'cart' }">
    <svg width="19" height="24">
      <use xlink:href="#icon-cart"></use>
    </svg>
    <span class="header__count" aria-label="Количество товаров" v-if="cartProductsLoading">
      ...
    </span>
    <span class="header__count" aria-label="Количество товаров" v-else>
      {{ cartProducts.length }}
    </span>
  </router-link>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters({
      cartProductsLoading: 'getCartProductsLoading',
      cartProducts: 'getCartProducts',
    }),
  },
};
</script>
