<!-- eslint-disable max-len -->
<!-- eslint-disable vuejs-accessibility/label-has-for -->
<template>
  <li class="catalog__item">
    <router-link class="catalog__pic" :to="{ name: 'product', params: { id: product.id } }">
      <div class="hover-effect-btn">
        <!-- <img src="image.jpg" alt="" /> -->
        <img :src="getImage" :alt="product.title" />
        <!-- <h3 class="title">Lorem ipsum</h3> -->
        <div class="overlay"></div>
        <div class="item_button">
          <button class="button button--primery" @click.prevent="loadProduct">
            <div v-if="productAddSending">Отправляем ...</div>
            <div v-else>В КОРЗИНУ</div>
          </button>
        </div>
      </div>
    </router-link>

    <h3 class="catalog__title">
      <a href="#">
        {{ product.title }}
      </a>
    </h3>

    <span class="catalog__price">
      {{ product.price | numberFormat }} ₽
    </span>

    <ul class="colors colors--black">
      <li class="colors__item" v-for="color in product.colors" :key="colorKey(product.id, color.color.id)">
        <label class="colors__label">
          <input class="colors__radio sr-only" type="radio" :value="color.color.id" v-model="productColor">
          <span class="colors__value" :style="{ 'background-color': color.color.code }"
            style="border: 1px solid black;">
          </span>
        </label>
      </li>
    </ul>
  </li>
</template>

<script>
import numberFormat from '@/helpers/numberFormat';
import axios from 'axios';
import API_BASE_URL from '@/config';
import { mapActions } from 'vuex';

export default {
  props: ['product'],
  data() {
    return {
      productAmount: 1,
      productData: null,
      productLoading: false,
      productLoadingFailed: false,
      productAdded: false,
      productAddSending: false,
      productColor: null,
      productSize: null,
    };
  },
  filters: {
    numberFormat,
  },
  computed: {
    colorKey() {
      return (productId, colorId) => (productId * 100 + colorId);
    },
    getImage() {
      let image = null;
      if (this.productColor) {
        // eslint-disable-next-line max-len
        const { gallery } = this.product.colors.find((color) => color.color.id === this.productColor);
        image = gallery ? gallery[0].file.url : '/img/no-photo.svg';
      } else {
        image = this.product.image;
      }
      return image;
    },
  },
  methods: {
    ...mapActions(['addProductToCart']),
    loadProduct() {
      this.productLoading = true;
      this.productLoadingFailed = false;
      clearTimeout(this.loadProductTimer);
      this.loadProductTimer = setTimeout(() => {
        axios
          .get(API_BASE_URL.concat('/api/products/', this.product.id))
          .then((response) => {
            this.productData = response.data;
            this.productSize = this.productData.sizes[0].id;
            this.addToCart();
          })
          .catch(() => { this.productLoadingFailed = true; })
          .then(() => {
            this.productLoading = false;
          });
      }, 0);
    },
    addToCart() {
      this.productAdded = false;
      this.productAddSending = true;
      this.addProductToCart({
        productId: this.product.id,
        colorId: this.productColor,
        sizeId: this.productSize,
        quantity: this.productAmount,
      })
        .then(() => {
          this.productAdded = true;
          this.productAddSending = false;
        });
    },
  },
  created() {
    this.productColor = this.product.colors[0].color.id;
  },
};
</script>

<style>
.hover-effect-btn {
  position: relative;
  width: 100%;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  /* background: rgba(0, 0, 0, 0.5); */
  /* Настройка цвета и прозрачности для блока с заголовком */
  transition: background 0.5s ease;
}

.hover-effect-btn:hover .overlay {
  display: block;
  background: rgba(0, 0, 0, 0.3);
  /* background: rgba(0, 0, 0, 0.9); */
  /* Настройка цвета и прозрачности для блока с заголовком при наведении */
}

.title {
  position: absolute;
  width: 100%;
  left: 0;
  top: 25%;
  /* Отступ сверху */
  font-size: 1.900em;
  /* Размер текста заголовка */
  text-align: center;
  text-transform: uppercase;
  /* Заглавные буквы */
  color: white;
  /* Цвет заголовка */
  z-index: 1;
  transition: top .5s ease;
}

.hover-effect-btn:hover .title {
  top: 10%;
  /* Отступ сверху при наведении */
}

.item_button {
  position: absolute;
  width: 100%;
  left: 0;
  /* top: 65%; */
  top: 25%;
  /* Отступ сверху */
  text-align: center;
  opacity: 0;
  transition: opacity .35s ease;
}

.item_button a {
  padding: 15px 40px;
  /* Отступ */
  text-align: center;
  background: #614e65;
  /* background: #ff921e; */
  /* Цвет кнопки */
  color: white;
  /* Цвет текста */
  border: 1px solid white;
  /* Ширина, стиль и цвет границы */
  z-index: 1;
}

.hover-effect-btn:hover .item_button {
  opacity: 1;
}
</style>
