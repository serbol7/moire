<!-- eslint-disable vuejs-accessibility/form-control-has-label -->
<!-- eslint-disable max-len -->
<template>
  <li class="cart__item product">
    <div class="product__pic">
      <img :src="item.image" width="120" height="120" :alt="item.product.title">
    </div>
    <h3 class="product__title">
      {{ item.product.title + ' (' + item.price + ' ₽)' }}
    </h3>
    <p class="product__info product__info--color">
      Цвет:
      <span>
        <i :style="{ 'background-color': item.color.color.code }" style="border: 1px solid black;"></i>
        {{ item.color.color.title }}
      </span>
    </p>
    <span class="product__code">
      Артикул: {{ item.product.id }}
    </span>

    <div class="product__counter form__counter">
      <button type="button" aria-label="Убрать один товар"
      @click.prevent="quantity <= 1 ? 1 : quantity--">
        <svg width="10" height="10" fill="currentColor">
          <use xlink:href="#icon-minus"></use>
        </svg>
      </button>

      <input type="text" value="1" name="count" v-model.number="quantity">

      <button type="button" aria-label="Добавить один товар"
      @click.prevent="quantity++">
        <svg width="10" height="10" fill="currentColor">
          <use xlink:href="#icon-plus"></use>
        </svg>
      </button>
    </div>

    <b class="product__price">
      {{ (item.quantity * item.price) | numberFormat}} ₽
    </b>

    <button class="button product__del button-del" type="button" aria-label="Удалить товар из корзины"
    @click.prevent="deleteProduct()">
      <svg width="20" height="20" fill="currentColor">
        <use xlink:href="#icon-close"></use>
      </svg>
    </button>
  </li>
</template>

<script>
import numberFormat from '@/helpers/numberFormat';
import { mapActions } from 'vuex';

export default {
  filters: {
    numberFormat,
  },
  props: ['item'],
  computed: {
    quantity: {
      get() {
        return this.item.quantity;
      },
      set(value) {
        this.updateCartProductAmount({
          basketItemId: this.item.id,
          quantity: value,
        });
      },
    },
  },
  methods: {
    // ...mapMutations({ deleteProduct: 'deleteCartProduct' }),
    ...mapActions(['updateCartProductAmount', 'deleteCartProduct']),
    deleteProduct() {
      this.deleteCartProduct(this.item.id);
    },
  },
};
</script>
