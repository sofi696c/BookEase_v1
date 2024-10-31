<template>
    <div class="search-container">
      <h3>Søg efter titel eller forfatter:</h3>
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Søg..."
        class="search-input"
      />
      <div class="book-list">
        <h4>Results:</h4>
        <div v-if="filteredBooks.length">
          <div v-for="book in filteredBooks" :key="book.id" class="book-item">
            <h5>{{ book.title }}</h5>
            <p>Author: {{ book.author }}</p>
          </div>
        </div>
        <div v-else>
          <p>No books found.</p>
        </div>
      </div>
    </div>
</template>
  
  <script setup>
  import { ref, defineProps, computed } from 'vue';
  
  const props = defineProps({
    books: {
      type: Array,
      required: true // Sørg for at bøger er påkrævet
    }
  });
  
  const searchTerm = ref('');
  
  // Computed property to filter books based on search term
  const filteredBooks = computed(() => {
    if (!searchTerm.value) {
      return props.books; // Return the original books list if no search term
    }
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
    return props.books.filter(book => 
      book.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      book.author.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });
  </script>
  
  <style scoped>
  .search-container {
    margin-top: 1rem; /* Margin ovenfor søgefeltet */
  }
  
  .search-input {
    width: 100%; /* Bredde på inputfeltet */
    padding: 0.5rem; /* Padding omkring inputfeltet */
    margin-top: 0.5rem; /* Margin over inputfeltet */
    border: 1px solid #ccc; /* Kant rundt om inputfeltet */
    border-radius: 4px; /* Rundede hjørner */
  }
  
  .book-list {
    margin-top: 1rem; /* Margin ovenfor boglisten */
  }
  
  .book-item {
    margin-bottom: 0.5rem; /* Margin mellem bogene */
  }
  </style>
  