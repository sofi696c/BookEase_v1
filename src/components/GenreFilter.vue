<template>
  <div class="genre-filter"> <!-- Hold ét rod-element -->
    <h3>Sort by Genre:</h3>
    <div class="checkbox-group">
      <div class="column" v-for="(column, index) in columns" :key="index">
        <div v-for="genre in column" :key="genre" class="checkbox-item">
          <input type="checkbox" :value="genre" v-model="selectedGenres" @change="updateFilter" id="genre-{{ genre }}" />
          <label :for="'genre-' + genre">{{ genre }}</label>
        </div>
      </div>
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

// Split genres into two columns
const selectedGenres = ref([]);
const columns = ref([]);

// Update filter when genres change
const updateFilter = () => {
  if (typeof props.onFilter === 'function') {
    props.onFilter(selectedGenres.value);
  }
};

// Function to organize genres into two columns
const organizeGenres = () => {
  const half = Math.ceil(props.genres.length / 2);
  columns.value = [props.genres.slice(0, half), props.genres.slice(half)];
};

organizeGenres();
</script>

<style scoped>


h3 {
  font-size: 1.25rem; /* Lidt mindre tekststørrelse */
  text-align: start
}

.checkbox-group {
  display: flex; /* Gør checkbox-gruppen til flex container */
  justify-content: space-between; /* Fordel kolonnerne jævnt */
}

.column {
  width: 48%; /* Giv hver kolonne næsten halvdelen af bredden */
}

.checkbox-item {
  margin-bottom: 0.25rem; /* Mindre afstand mellem checkboxe */
  display: flex;
  align-items: center; /* Juster indholdet vertikalt */
}

input[type="checkbox"] {
  margin-right: 0.5rem; /* Afstand mellem checkbox og label */
  transform: scale(1.1); /* Gør checkboxe lidt mindre */
}

label {
  font-size: 0.9rem; /* Mindre tekststørrelse */
  cursor: pointer; /* Cursor ændres til pointer ved hover */
}

</style>
