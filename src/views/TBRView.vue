<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../modules/firebase'; 
import { getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const tbrBooks = ref([]);

const fetchTBRBooks = async () => {
  const user = auth.currentUser;
  if (user) {
    const tbrBooksCollectionRef = collection(db, 'users', user.uid, 'TBRBooks');
    const snapshot = await getDocs(tbrBooksCollectionRef);
    tbrBooks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

onMounted(fetchTBRBooks);
</script>

<template>
  <div>
    <h1>To Be Read (TBR) bøger</h1>
    <ul>
      <li v-for="book in tbrBooks" :key="book.id" class="book-item">
        <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
        <div class="book-details">
          <h2>{{ book.title }}</h2>
          <p><strong>Forfatter:</strong> {{ book.author }}</p>
          <p><strong>Udgivelsesår:</strong> {{ book.releaseYear }}</p>
        </div>
      </li>
    </ul>
    <div v-if="!tbrBooks.length">
      <p>Ingen bøger i din TBR-liste.</p>
    </div>
  </div>
</template>




<style>
.main {
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  margin-top: 10vh;
}

/* Bøger vises i en liste */
ul {
  margin-top: 2rem;
  list-style-type: none;
  padding: 0;
}

/* Hver bog item */
.book-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Billedet af bogen */
.book-cover {
  width: 100px; /* Juster størrelsen på bogcoveret */
  height: auto;
  margin-right: 20px;
}

/* Detaljer om bogen */
.book-details {
  flex: 1; /* Gør, at detaljer fylder det resterende rum */
  text-align: left;
}

.book-meta {
  text-align: left; /* Juster teksten til venstre */
  margin-left: 20px;
}

/* Ingen bøger besked */
.no-books {
  color: #999;
  font-size: 1.2em;
}

/* Hovedoverskrift */
h1 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
}
</style>