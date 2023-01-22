<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable vuejs-accessibility/label-has-for -->
<!-- eslint-disable vuejs-accessibility/form-control-has-label -->
<!-- eslint-disable max-len -->
<template>
  <main class="content container" v-if="productLoading">Загрузка товара...</main>
  <main class="content container" v-else-if="productLoadingFailed">
    Не удалось загрузить товар!</main>
  <main class="content container" v-else>
    <div class="content__top">
      <ul class="breadcrumbs">
        <li class="breadcrumbs__item">
          <router-link class="breadcrumbs__link" :to="{ name: 'main' }">
            Каталог
          </router-link>
        </li>
        <li class="breadcrumbs__item">
          <router-link class="breadcrumbs__link" :to="{ name: 'main' }">
            {{ product.category.title }}
          </router-link>
        </li>
        <li class="breadcrumbs__item">
          <a class="breadcrumbs__link">
            {{ product.title }}
          </a>
        </li>
      </ul>
    </div>

    <section class="item">
      <div class="item__pics pics">
        <div class="pics__wrapper">
          <img width="570" height="570" :src="getImage" :alt="product.title">
        </div>
        <ul class="pics__list">
          <li class="pics__item" v-for="image in images" :key="image.file.url">
            <a href="" class="pics__link pics__link--current">
              <img width="98" height="98" :src="image.file.url" :alt="product.title">
            </a>
          </li>
        </ul>
      </div>

      <div class="item__info">
        <span class="item__code">Артикул: {{ product.id }}</span>
        <h2 class="item__title">
          {{ product.title }}
        </h2>
        <div class="item__form">
          <form class="form" action="#" method="POST" @submit.prevent="addToCart">
            <div class="item__row item__row--center">
              <div class="form__counter">
                <button type="button" aria-label="Убрать один товар"
                  @click.prevent="productAmount <= 1 ? 1 : productAmount--">
                  <svg width="12" height="12" fill="currentColor">
                    <use xlink:href="#icon-minus"></use>
                  </svg>
                </button>

                <input type="text" value="1" name="count" v-model.number="productAmount">

                <button type="button" aria-label="Добавить один товар" @click.prevent="productAmount++">
                  <svg width="12" height="12" fill="currentColor">
                    <use xlink:href="#icon-plus"></use>
                  </svg>
                </button>
              </div>

              <b class="item__price">
                {{ product.price | numberFormat }} ₽
              </b>
            </div>

            <div class="item__row">
              <fieldset class="form__block">
                <legend class="form__legend">Цвет</legend>
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
              </fieldset>

              <fieldset class="form__block">
                <legend class="form__legend">Размер</legend>
                <label class="form__label form__label--small form__label--select">
                  <select class="form__select" v-model="productSize">
                    <option :value="size.id" v-for="size in product.sizes" :key="size.id">{{ size.title }}</option>
                  </select>
                </label>
              </fieldset>
            </div>

            <button class="item__button button button--primery" type="submit" :disabled="productAddSending">
              <div v-if="productAddSending">Отправляем ...</div>
              <div v-else>В корзину</div>
            </button>
          </form>
        </div>
      </div>

      <div class="item__desc">
        <ul class="tabs">
          <li class="tabs__item">
            <a class="tabs__link tabs__link--current">
              Информация о товаре
            </a>
          </li>
          <li class="tabs__item">
            <a class="tabs__link" href="#">
              Доставка и возврат
            </a>
          </li>
        </ul>

        <div class="item__content">
          {{ product.content }}
          <h3>Состав:</h3>

          <p>
            60% хлопок<br>
            30% полиэстер<br>
          </p>

          <h3>Уход:</h3>

          <p>
            Машинная стирка при макс. 30ºC короткий отжим<br>
            Гладить при макс. 110ºC<br>
            Не использовать машинную сушку<br>
            Отбеливать запрещено<br>
            Не подвергать химчистке<br>
          </p>

        </div>

      </div>
    </section>
  </main>
</template>

<script>
import numberFormat from '@/helpers/numberFormat';
import axios from 'axios';
import API_BASE_URL from '@/config';
import { mapActions } from 'vuex';

export default {
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
  computed: {
    product() {
      let prod = {};
      if (this.productData) {
        prod = this.productData;
        prod.image = ((this.productData.colors[0].gallery) ? this.productData.colors[0].gallery[0].file.url : '/img/no-photo.svg');
      }
      return prod;
    },
    // category() {
    //   return this.productData.category;
    // },
    colorKey() {
      return (productId, colorId) => (productId * 100 + colorId);
    },
    images() {
      // return this.product.colors.find((col) => col.color.id === this.productColor);
      let gallery = null;
      if (this.productColor) {
        // eslint-disable-next-line max-len
        gallery = this.product.colors.find((color) => color.color.id === this.productColor).gallery;
        // image = gallery ? gallery[0].file.url : '/img/no-photo.svg';
      // } else {
      //   image = this.product.image;
      }
      if (!gallery) {
        gallery = [{ file: { url: '/img/no-photo.svg' } }];
      }
      return gallery;
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
    getGalleryImage() {
      return (image) => (image || '/img/no-photo.svg');
    },
  },
  filters: {
    numberFormat,
  },
  methods: {
    ...mapActions(['addProductToCart']),
    addToCart() {
      this.productAdded = false;
      this.productAddSending = true;
      if (this.productAmount < 1) {
        this.productAmount = 1;
        // alert('Некорректное значение количества товара. Укажите 1 и более единиц товара!');
      } else {
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
      }
    },
    loadProduct() {
      this.productLoading = true;
      this.productLoadingFailed = false;
      clearTimeout(this.loadProductTimer);
      this.loadProductTimer = setTimeout(() => {
        axios
          .get(API_BASE_URL.concat('/api/products/', this.$route.params.id))
          .then((response) => { this.productData = response.data; })
          .catch(() => { this.productLoadingFailed = true; })
          .then(() => {
            this.productLoading = false;
            this.productColor = this.product.colors[0].color.id;
            this.productSize = this.product.sizes[0].id;
          });
      }, 0);
    },
  },
  watch: {
    '$route.params.id': {
      handler() {
        this.loadProduct();
      },
      immediate: true,
    },
    // product: {
    //   handler() {
    //     this.productColor = this.product.colors[0].color.id;
    //     this.productSize = this.product.sizes[0].id;
    //   },
    //   immediate: true,
    // },
  },
};
</script>
