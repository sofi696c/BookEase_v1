<template>
  <div class="genre-filter"> 
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


const selectedGenres = ref([]);
const columns = ref([]);

// Update filter når genres changes
const updateFilter = () => {
  if (typeof props.onFilter === 'function') {
    props.onFilter(selectedGenres.value);
  }
};

// Function til at organize genre til 2 columns
const organizeGenres = () => {
  const half = Math.ceil(props.genres.length / 2);
  columns.value = [props.genres.slice(0, half), props.genres.slice(half)];
};

organizeGenres();
</script>

<style scoped>


h3 {
  font-size: 1.25rem; 
  text-align: start
}

.checkbox-group {
  display: flex; 
  justify-content: space-between; 

}

.column {
  width: 48%; 
}

.checkbox-item {
  margin-bottom: 0.25rem; 
  display: flex;
  align-items: center; 
}

input[type="checkbox"] {
  margin-right: 0.5rem; 
  transform: scale(1.1); 
}

label {
  font-size: 0.9rem; 
  cursor: pointer; 
}

</style>
