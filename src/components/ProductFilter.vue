<!-- eslint-disable max-len -->
<!-- eslint-disable vuejs-accessibility/label-has-for -->
<template>
  <aside class="filter">
    <h2 class="filter__title">Фильтр</h2>
    <form class="filter__form form" action="#" method="get" @submit.prevent="submit">
      <fieldset class="form__block">
        <legend class="form__legend">Цена</legend>
        <label class="form__label form__label--price">
          <input class="form__input" type="text" name="min-price"
          v-model.number="currentPriceFrom">
          <span class="form__value">От</span>
        </label>
        <label class="form__label form__label--price">
          <input class="form__input" type="text" name="max-price"
          v-model.number="currentPriceTo">
          <span class="form__value">До</span>
        </label>
      </fieldset>

      <fieldset class="form__block">
        <legend class="form__legend">Категория</legend>
        <label class="form__label form__label--select">
          <select class="form__select" type="text" name="category"
          v-model.number="currentCategoryId">
            <option value="0">Все категории</option>
            <option :value="category.id" v-for="category in categories"
            :key="category.id">{{ category.title }}</option>
          </select>
        </label>
      </fieldset>

      <fieldset class="form__block">
        <legend class="form__legend">Цвет</legend>
        <ul class="colors">
          <li class="colors__item" v-for="color in colors" :key="color.id">
            <label class="colors__label">
              <input class="colors__check sr-only" type="checkbox" name="color"
              :value="color.id" v-model="currentColorIds">
              <span class="colors__value" :style="{ 'background-color': color.code }"
              style="border: 1px solid black;">
              </span>
            </label>
          </li>
        </ul>
      </fieldset>

      <fieldset class="form__block">
        <legend class="form__legend">Материал</legend>
        <ul class="check-list">
          <li class="check-list__item" v-for="material in materials" :key="material.id">
            <label class="check-list__label">
              <input class="check-list__check sr-only" type="checkbox" name="material"
              :value="material.id" v-model="currentMaterialIds">
              <span class="check-list__desc">
                {{ material.title }}
                <span>({{ material.productsCount }})</span>
              </span>
            </label>
          </li>
        </ul>
      </fieldset>

      <fieldset class="form__block">
        <legend class="form__legend">Коллекция</legend>
        <ul class="check-list">
          <li class="check-list__item" v-for="season in seasons" :key="season.id">
            <label class="check-list__label">
              <input class="check-list__check sr-only" type="checkbox" name="collection"
              :value="season.id" v-model="currentSeasonIds">
              <span class="check-list__desc">
                {{ season.title }}
                <span>({{ season.productsCount }})</span>
              </span>
            </label>
          </li>
        </ul>
      </fieldset>

      <button class="filter__submit button button--primery" type="submit">
        Применить
      </button>
      <button class="filter__reset button button--second" type="button"
      @click.prevent="reset" v-if="filtered">
        Сбросить
      </button>
    </form>
  </aside>
</template>

<script>
import axios from 'axios';
import API_BASE_URL from '@/config';

export default {
  data() {
    return {
      currentPriceFrom: 0,
      currentPriceTo: 0,
      currentCategoryId: 0,
      currentColorIds: [],
      currentMaterialIds: [],
      currentSeasonIds: [],
      categoriesData: null,
      colorsData: null,
      materialsData: null,
      seasonsData: null,
    };
  },
  props: ['priceFrom', 'priceTo', 'categoryId', 'colorIds', 'materialIds', 'seasonIds'],
  computed: {
    categories() {
      return this.categoriesData ? this.categoriesData.items : [];
    },
    colors() {
      return this.colorsData ? this.colorsData.items : [];
    },
    materials() {
      return this.materialsData ? this.materialsData.items : [];
    },
    seasons() {
      return this.seasonsData ? this.seasonsData.items : [];
    },
    filtered() {
      let isFiltered = true;
      if (this.priceFrom === 0
          && this.priceTo === 0
          && this.categoryId === 0
          && this.colorIds.length === 0
          && this.materialIds.length === 0
          && this.seasonIds.length === 0) {
        isFiltered = false;
      }
      return isFiltered;
    },
  },
  watch: {
    priceFrom(value) {
      this.currentPriceFrom = value;
    },
    priceTo(value) {
      this.currentPriceTo = value;
    },
    categoryId(value) {
      this.currentCategoryId = value;
    },
    colorIds(value) {
      this.currentColorIds = value;
    },
    materialIds(value) {
      this.currentMaterialIds = value;
    },
    seasonIds(value) {
      this.currentSeasonIds = value;
    },
  },
  methods: {
    submit() {
      this.$emit('update:priceFrom', this.currentPriceFrom);
      this.$emit('update:priceTo', this.currentPriceTo);
      this.$emit('update:categoryId', this.currentCategoryId);
      this.$emit('update:colorIds', this.currentColorIds);
      this.$emit('update:materialIds', this.currentMaterialIds);
      this.$emit('update:seasonIds', this.currentSeasonIds);
    },
    reset() {
      this.$emit('update:priceFrom', 0);
      this.$emit('update:priceTo', 0);
      this.$emit('update:categoryId', 0);
      this.$emit('update:colorIds', []);
      this.$emit('update:materialIds', []);
      this.$emit('update:seasonIds', []);
    },
    loadCategories() {
      axios
        .get(API_BASE_URL.concat('/api/productCategories'))
        .then((response) => { this.categoriesData = response.data; });
    },
    loadColors() {
      axios
        .get(API_BASE_URL.concat('/api/colors'))
        .then((response) => { this.colorsData = response.data; });
    },
    loadMaterials() {
      axios
        .get(API_BASE_URL.concat('/api/materials'))
        .then((response) => { this.materialsData = response.data; });
    },
    loadSeasons() {
      axios
        .get(API_BASE_URL.concat('/api/seasons'))
        .then((response) => { this.seasonsData = response.data; });
    },
  },
  created() {
    this.loadCategories();
    this.loadColors();
    this.loadMaterials();
    this.loadSeasons();
  },
};
</script>
