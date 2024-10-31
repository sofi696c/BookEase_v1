<template>
  <div class="genre-filter"> <!-- Hold ét rod-element -->
    <h3>Filtrer efter genre:</h3>
    <div v-for="genre in genres" :key="genre">
      <input type="checkbox" :value="genre" v-model="selectedGenres" @change="updateFilter" />
      <label>{{ genre }}</label>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
  genres: {
    type: Array,
    required: true // Sørg for at genres er påkrævet
  },
  onFilter: {
    type: Function,
    required: true // Sørg for at onFilter er påkrævet
  }
});

const selectedGenres = ref([]);

// Update filter when genres change
const updateFilter = () => {
  if (typeof props.onFilter === 'function') {
    props.onFilter(selectedGenres.value);
  }
};
</script>

<style scoped>
.genre-filter {
  margin: 1rem 0;
}
</style>
