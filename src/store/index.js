/* eslint-disable no-promise-executor-return */
/* eslint-disable max-len */
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import API_BASE_URL from '@/config';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // cartProducts: [],
    userAccessKey: null,
    cartProductsData: [],
    cartProductsLoading: false,
    cartProductsLoadingFailed: false,
    orderInfo: null,
  },
  mutations: {
    updateOrderInfo(state, orderInfo) {
      state.orderInfo = orderInfo;
    },
    resetCart(state) {
      // state.cartProducts = [];
      state.cartProductsData = [];
    },
    // updateCartProductAmount(state, { productId, quantity }) {
    //   const item = state.cartProducts.find((i) => i.productId === productId);
    //   if (item) {
    //     item.quantity = quantity;
    //   }
    // },
    // deleteCartProduct(state, productId) {
    //   state.cartProducts = state.cartProducts.filter((i) => i.productId !== productId);
    // },
    updateUserAccessKey(state, accessKey) {
      state.userAccessKey = accessKey;
    },
    updateCartProductsData(state, items) {
      state.cartProductsData = items;
    },
    // syncCartProducts(state) {
    //   state.cartProducts = state.cartProductsData.map((item) => ({
    //     productId: item.product.id,
    //     quantity: item.quantity,
    //   }));
    // },
    updateCartProductsLoading(state, value) {
      state.cartProductsLoading = value;
    },
    updateCartProductsLoadingFailed(state, value) {
      state.cartProductsLoadingFailed = value;
    },
  },
  getters: {
    // cartDetailProducts(state) {
    //   return state.cartProducts.map((item) => {
    //     /* eslint-disable */
    //     const product = state.cartProductsData.find((p) => p.product.id === item.productId).product;
    //     return {
    //       ...item,
    //       product: {
    //         ...product,
    //         // image: product.colors[0].gallery[0].file.url,
    //         image: ((product.colors[0].gallery) ? product.colors[0].gallery[0].file.url : '/img/no-photo.svg'),
    //       },
    //     };
    //   });
    // },
    cartTotalPrice(state, getters) {
      return getters.getCartProducts.reduce((acc, item) => (item.price * item.quantity)
        + acc, 0);
    },
    // getCartProducts(state) {
    //   return state.cartProductsData;
    // },
    getCartProducts(state) {
      return state.cartProductsData.map((item) => ({
        ...item,
        image: ((item.color.gallery) ? item.color.gallery[0].file.url : '/img/no-photo.svg'),
      }));
    },
    getCartProductsLoading(state) {
      return state.cartProductsLoading;
    },
    getCartProductsLoadingFailed(state) {
      return state.cartProductsLoadingFailed;
    },
  },
  actions: {
    loadOrderInfo(context, orderId) {
      return axios
        .get(API_BASE_URL.concat('/api/orders/', orderId), {
          params: {
            userAccessKey: context.state.userAccessKey,
          },
        })
        .then((response) => {
          context.commit('updateOrderInfo', response.data);
        });
    },
    async loadCart(context) {
      context.commit('updateCartProductsLoading', true);
      context.commit('updateCartProductsLoadingFailed', false);
      await (new Promise((resolve) => setTimeout(resolve, 0)));
      try {
        const response = await axios
          .get(API_BASE_URL.concat('/api/baskets'), {
            params: {
              userAccessKey: context.state.userAccessKey,
            },
          });
        if (!context.state.userAccessKey || context.state.userAccessKey !== response.data.user.accessKey) {
          localStorage.setItem('userAccessKey', response.data.user.accessKey);
          context.commit('updateUserAccessKey', response.data.user.accessKey);
        }
        context.commit('updateCartProductsData', response.data.items);
        // context.commit('syncCartProducts');
      } catch {
        context.commit('updateCartProductsLoadingFailed', true);
      }
      context.commit('updateCartProductsLoading', false);
    },
    async addProductToCart(context, {
      productId, colorId, sizeId, quantity,
    }) {
      await (new Promise((resolve) => setTimeout(resolve, 0)));
      const response = await axios
        .post(API_BASE_URL.concat('/api/baskets/products'), {
          productId,
          colorId,
          sizeId,
          quantity,
        }, {
          params: {
            userAccessKey: context.state.userAccessKey,
          },
        });
      context.commit('updateCartProductsData', response.data.items);
      // context.commit('syncCartProducts');
    },
    updateCartProductAmount(context, { basketItemId, quantity }) {
      context.commit('updateCartProductAmount', { basketItemId, quantity });
      let prom;
      if (quantity > 0) {
        prom = axios
          .put(API_BASE_URL.concat('/api/baskets/products'), {
            basketItemId,
            quantity,
          }, {
            params: {
              userAccessKey: context.state.userAccessKey,
            },
          })
          .then((response) => {
            context.commit('updateCartProductsData', response.data.items);
          })
          .catch(() => {
            // context.commit('syncCartProducts');
          });
      } else {
        prom = null;
      }
      return prom;
    },
    deleteCartProduct(context, basketItemId) {
      context.commit('deleteCartProduct', basketItemId);
      return axios
        .delete(API_BASE_URL.concat('/api/baskets/products'), {
          params: {
            userAccessKey: context.state.userAccessKey,
          },
          data: {
            basketItemId,
          },
        })
        .then((response) => {
          context.commit('updateCartProductsData', response.data.items);
        })
        .catch(() => {
          // context.commit('syncCartProducts');
        });
    },
  },
});
