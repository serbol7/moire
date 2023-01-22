<!-- eslint-disable vuejs-accessibility/label-has-for -->
<!-- eslint-disable max-len -->
<template>
  <main class="content container">
    <div class="content__top">
      <ul class="breadcrumbs">
        <li class="breadcrumbs__item">
          <router-link class="breadcrumbs__link" :to="{ name: 'main' }">
            Каталог
          </router-link>
        </li>
        <li class="breadcrumbs__item">
          <router-link class="breadcrumbs__link" :to="{ name: 'cart' }">
            Корзина
          </router-link>
        </li>
        <li class="breadcrumbs__item">
          <a class="breadcrumbs__link">
            Оформление заказа
          </a>
        </li>
      </ul>

      <div class="content__row">
        <h1 class="content__title">
          Оформление заказа
        </h1>
      </div>
    </div>

    <section class="cart">
      <form class="cart__form form" action="#" method="POST" @submit.prevent="order">
        <div class="cart__field">
          <div class="cart__data">

            <BaseFormText v-model="formData.name" :error="formError.name" title="ФИО"
              placeholder="Введите ваше полное имя" />

            <BaseFormText v-model="formData.address" :error="formError.address" title="Адрес доставки"
              placeholder="Введите ваш адрес" />

            <BaseFormText v-model="formData.phone" :error="formError.phone" title="Телефон"
              placeholder="Введите ваш телефон" type="tel" />

            <BaseFormText v-model="formData.email" :error="formError.email" title="Email" placeholder="Введи ваш Email"
              type="email" />

            <BaseFormTextarea v-model="formData.comment" :error="formError.comment" title="Комментарий к заказу"
              placeholder="Ваши пожелания" />

          </div>

          <div class="cart__options">
            <h3 class="cart__title">Доставка</h3>
            <ul class="cart__options options">
              <li class="options__item" v-for="delivery in deliveries" :key="delivery.id">
                <label class="options__label">
                  <input class="options__radio sr-only" type="radio" name="delivery" :value="delivery.id"
                    v-model="formData.deliveryTypeId">
                  <span class="options__value">
                    {{ delivery.title }} <b>{{ getDeliveryPrice(delivery.price) }}</b>
                  </span>
                </label>
              </li>
            </ul>

            <h3 class="cart__title">Оплата</h3>
            <ul class="cart__options options">
              <li class="options__item" v-for="payment in payments" :key="payment.id">
                <label class="options__label">
                  <input class="options__radio sr-only" type="radio" name="pay" :value="payment.id" v-model="formData.paymentTypeId">
                  <span class="options__value">
                    {{ payment.title }}
                  </span>
                </label>
              </li>
            </ul>
          </div>
        </div>

        <div class="cart__block">
          <ul class="cart__orders">
            <OrderItem v-for="item in products" :key="item.productId" :item="item" />
          </ul>

          <div class="cart__total">
            <p>Доставка: <b>{{ getDeliveryPrice(currentDeliveryPrice) }}</b></p>
            <p>Итого: <b>{{ products.length }}</b> товара(ов) на сумму <b>
                {{ (totalPrice + Number(currentDeliveryPrice)) | numberFormat }} ₽</b></p>
          </div>

          <button class="cart__button button button--primery" type="submit">
            Оформить заказ
          </button>
        </div>

        <div class="cart__error form__error-block" v-if="orderSending">
          <h4>Заявка отправляется...</h4>
          <div class="loader" style="margin: auto;"></div>
        </div>

        <div class="cart__error form__error-block" v-if="formErrorMessage">
          <h4>Заявка не отправлена!</h4>
          <p>
            Похоже произошла ошибка. Попробуйте отправить снова или перезагрузите страницу.
            {{ formErrorMessage }}
          </p>
        </div>
      </form>
    </section>
  </main>
</template>

<script>
import BaseFormText from '@/components/BaseFormText.vue';
import BaseFormTextarea from '@/components/BaseFormTextarea.vue';
import OrderItem from '@/components/OrderItem.vue';
import { mapGetters } from 'vuex';
import numberFormat from '@/helpers/numberFormat';
import axios from 'axios';
import API_BASE_URL from '@/config';

export default {
  data() {
    return {
      formData: { deliveryTypeId: 1, paymentTypeId: 1 },
      formError: {},
      formErrorMessage: '',
      orderSending: false,
      deliveriesData: [],
      paymentsData: [],
      paymentsData1: null,
      paymentsData2: null,
    };
  },
  filters: { numberFormat },
  components: {
    BaseFormText,
    BaseFormTextarea,
    OrderItem,
  },
  computed: {
    ...mapGetters({
      products: 'getCartProducts',
      totalPrice: 'cartTotalPrice',
    }),
    deliveries() {
      return this.deliveriesData ? this.deliveriesData : [];
    },
    payments() {
      this.loadPayments(this.formData.deliveryTypeId);
      return this.paymentsData ? this.paymentsData : [];
    },
    currentDeliveryPrice() {
      const { price } = this.deliveries.find(
        (item) => item.id === this.formData.deliveryTypeId,
      );
      return price;
    },
    getDeliveryPrice() {
      return (price) => ((price === '0') ? 'бесплатно' : (price.concat(' ₽')));
    },
  },
  methods: {
    order() {
      this.formError = {};
      this.formErrorMessage = '';
      this.orderSending = true;
      clearTimeout(this.loadProductsTimer);
      this.loadProductsTimer = setTimeout(() => {
        axios
          .post(API_BASE_URL.concat('/api/orders'), {
            ...this.formData,
          }, {
            params: {
              userAccessKey: this.$store.state.userAccessKey,
            },
          })
          .then((response) => {
            this.$store.commit('resetCart');
            this.$store.commit('updateOrderInfo', response.data);
            this.orderSending = false;
            this.$router.push({ name: 'orderInfo', params: { id: response.data.id } });
          })
          .catch((error) => {
            this.orderSending = false;
            this.formError = error.response.data.error.request || {};
            this.formErrorMessage = error.response.data.error.message;
          });
      }, 0);
    },
    loadDeliveries() {
      axios
        .get(API_BASE_URL.concat('/api/deliveries'))
        .then((response) => { this.deliveriesData = response.data; });
    },
    loadPayments(value) {
      if (value === 1) {
        if (!this.paymentsData1) {
          axios
            .get(API_BASE_URL.concat('/api/payments?deliveryTypeId=', value))
            .then((response) => { this.paymentsData1 = response.data; });
        }
        this.paymentsData = this.paymentsData1;
      } else {
        if (!this.paymentsData2) {
          axios
            .get(API_BASE_URL.concat('/api/payments?deliveryTypeId=', value))
            .then((response) => { this.paymentsData2 = response.data; });
        }
        this.paymentsData = this.paymentsData2;
        this.formData.paymentTypeId = 2;
      }
    },
  },
  created() {
    this.loadDeliveries();
  },
};
</script>

<style>
.loader {
  border: 16px solid #f3f3f3;
  /* Light grey */
  border-top: 16px solid #ff4d00;
  /* Blue */
  border-bottom: 16px solid #ff4d00;
  /* Blue */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
