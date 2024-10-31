<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../modules/firebase'; 
import { getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { doc, deleteDoc, addDoc, getDoc } from 'firebase/firestore'; 

const auth = getAuth();

const wantToReadBooks = ref([]);

const fetchWantToReadBooks = async () => {
  const user = auth.currentUser;
  if (user) {
    const wantToReadCollectionRef = collection(db, 'users', user.uid, 'WantToRead');
    const snapshot = await getDocs(wantToReadCollectionRef);
    wantToReadBooks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

const removeFromWantToRead = async (bookId) => {
  const user = auth.currentUser;
  if (user) {
    const bookDocRef = doc(db, 'users', user.uid, 'WantToRead', bookId); 
    try {
      await deleteDoc(bookDocRef);
      console.log('Book removed from Want to Read:', bookId);
    } catch (error) {
      console.error("Error removing book from Want to Read:", error);
    }
  }
};

const handleRemoveBook = async (bookId) => {
  try {
    await removeFromWantToRead(bookId);
    wantToReadBooks.value = wantToReadBooks.value.filter(book => book.id !== bookId); // Remove book locally
  } catch (error) {
    console.error("Failed to remove book:", error);
  }
};

const moveToReadBooks = async (bookId) => {
  const user = auth.currentUser;
  if (user) {
    const wantToReadBookRef = doc(db, 'users', user.uid, 'WantToRead', bookId);
    const readBooksCollectionRef = collection(db, 'users', user.uid, 'ReadBooks');
    
    try {
      const bookSnapshot = await getDoc(wantToReadBookRef);
      if (bookSnapshot.exists()) {
        await addDoc(readBooksCollectionRef, { ...bookSnapshot.data() });
        console.log('Book moved to Read Books:', bookId);
        
        await deleteDoc(wantToReadBookRef);
        wantToReadBooks.value = wantToReadBooks.value.filter(book => book.id !== bookId);
      }
    } catch (error) {
      console.error("Error moving book to Read Books:", error);
    }
  }
};

onMounted(fetchWantToReadBooks);
</script>

<template>
  <main>
    <h1>Books you want to read:</h1>
    <ul>
      <li v-for="book in wantToReadBooks" :key="book.id" class="book-item">
        <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
        <div class="book-details">
          <h2>{{ book.title }}</h2>
          <p><strong>Author:</strong> {{ book.author }}</p>
          <p><strong>Release year:</strong> {{ book.releaseYear }}</p>
          <p><strong>Genre: </strong>{{ book.genre.join(', ') }}</p>
        </div>
        
        <div class="button-container">
          <button class="move-button" @click="moveToReadBooks(book.id)">
            Move to Read Books
          </button>
          <button class="discard-button" @click="handleRemoveBook(book.id)">
            Remove from Want to Read
          </button>
        </div>
      </li>
    </ul>
    <div v-if="!wantToReadBooks.length">
      <p>Looks like you haven't added any books you want to read yet..</p>
    </div>
  </main>
</template>

<style scoped>
main {
  padding-top: 5%;
}

.book-item {
  width: 80vh;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between; /* For at placere knapperne til højre */
}

.book-cover {
  width: 100px; /* Juster størrelsen som ønsket */
  height: auto;
  margin-right: 20px;
}

.book-details {
  flex-grow: 1;
  margin-right: 20px; /* Giver lidt afstand mellem detaljer og knapper */
}

.button-container {
  display: flex;
  flex-direction: column; /* Stak knapperne vertikalt */
  align-items: flex-end; /* Juster knapperne til højre */
  padding: 0 5%;
  gap: 15px;
}

.move-button,
.discard-button {
  padding: 8px 12px; /* Mindre padding for mindre knapper */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px; /* Mindre fontstørrelse for ensartethed */
  width: 100%; /* Ensartet bredde for begge knapper */
}

.move-button {
  background-color: #a6b29b; /* Farve for Move to Read Books */
}

.move-button:hover {
  background-color: #7b8274; /* Hover-effekt for Move to Read Books */
}

.discard-button {
  background-color: #ec6060; /* Farve for Remove from Want to Read */
}

.discard-button:hover {
  background-color: #ca4949; /* Hover-effekt for Remove from Want to Read */
}
</style>
