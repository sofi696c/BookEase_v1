<script setup>
import { ref, watch, onMounted } from 'vue';
import { useBooks } from '../modules/useBooks';
import { useUser } from '../modules/useUser';
import { db, auth } from '../modules/firebase'; // Importér din Firestore-database og auth
import { collection, addDoc } from 'firebase/firestore'; // Importér nødvendige Firestore-funktioner
import GenreFilter from '../components/GenreFilter.vue';

const { books, addBook, deleteBook, newBookTitle, newBookAuthor, newBookISBN, newBookGenre, newBookReleaseYear, newBookCoverUrl } = useBooks();
const { user, role, login, logout, email, password, error: errorMessage } = useUser();

const addNewBook = () => {
  addBook({
    title: newBookTitle.value,
    author: newBookAuthor.value,
    isbn: newBookISBN.value,
    genre: newBookGenre.value.split(','),
    releaseYear: newBookReleaseYear.value,
    coverUrl: newBookCoverUrl.value,
  });
};

const removeBook = (id) => {
  deleteBook(id);
};

const selectedGenres = ref([]); // For at holde styr på valgte genrer
const filteredBooks = ref([]); // Hold de filtrerede bøger

const genres = ['Romance', 'Fantasy', 'Historical Fiction', 'Thriller', 'Science Fiction', 'Horror', 'LGBTQ+', 'Non-Fiction'];

// Watch på books for at opdatere filteredBooks, når bøgerne ændres
watch(books, (newBooks) => {
  filteredBooks.value = newBooks; // Opdater filteredBooks når books ændres
});

// Funktion til at fjerne mellemrum og konvertere til små bogstaver
const removeSpaces = (genre) => genre.trim().toLowerCase();

// Filter bøgerne, når der er valgt genrer
watch(selectedGenres, () => {
  if (selectedGenres.value.length) {
    filteredBooks.value = books.value.filter(book =>
      selectedGenres.value.some(selectedGenre => 
        book.genre.map(removeSpaces).includes(removeSpaces(selectedGenre)) // Sammenlign i små bogstaver
      )
    );
  } else {
    filteredBooks.value = books.value; // Vis alle bøger, hvis ingen genre er valgt
  }
});

// Initielt vis alle bøger
onMounted(() => {
  filteredBooks.value = books.value; // Sørg for at vise alle bøger ved indlæsning
});

// Funktion til at håndtere genre filtrering
const filterByGenre = (selected) => {
  selectedGenres.value = selected; // Opdater valgte genrer
};

// Almindelig bruger - tilføj bog til TBR
const addBookToTBR = async (book) => {
  const user = auth.currentUser; // Få den nuværende bruger
  if (user) {
    try {
      const tbrCollectionRef = collection(db, 'users', user.uid, 'tbr'); // Reference til TBR-samlingen for den aktuelle bruger
      await addDoc(tbrCollectionRef, {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        releaseYear: book.releaseYear,
        coverUrl: book.coverUrl,
      });
      console.log('Book added to TBR:', book);
    } catch (error) {
      console.error("Error adding book to TBR:", error);
    }
  }
};

// Almindelig bruger - tilføj bog til Read Books
const addBookToReadBooks = async (book) => {
  const user = auth.currentUser; // Få den nuværende bruger
  console.log('User:', user);
  if (user) {
    try {
      const readBooksCollectionRef = collection(db, 'users', user.uid, 'ReadBooks'); // Reference til read-books samlingen for den aktuelle bruger
      await addDoc(readBooksCollectionRef, {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        releaseYear: book.releaseYear,
        coverUrl: book.coverUrl,
      });
      console.log('Book added to Read Books:', book);
    } catch (error) {
      console.error("Error adding book to Read Books:", error);
    }
  } else {
    console.error("No user is currently logged in.");
  }
};
</script>



<template>
  <main>
    <div v-if="!user" class="login-section">
      <input type="email" v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Password" />
      <button @click="login(email, password)">Login</button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>

    <div v-else>
      <p>Welcome, {{ user.email }}!</p>
      <button @click="logout">Logout</button>

      <div v-if="role === 'admin'" class="add-book-section">
        <h2>Tilføj ny bog</h2>
        <input v-model="newBookTitle" placeholder="Bog titel" />
        <input v-model="newBookAuthor" placeholder="Forfatter" />
        <input v-model="newBookISBN" placeholder="ISBN" />
        <input v-model="newBookGenre" placeholder="Genre (komma-separeret)" />
        <input v-model="newBookReleaseYear" placeholder="Udgivelsesår" />
        <input v-model="newBookCoverUrl" placeholder="Bogcover URL" />
        <button @click="addNewBook">Tilføj Bog</button>
      </div>

      <h1>Gå på opdagelse blandt bøgerne</h1>
      <!-- GenreFilter komponenten tilføjet her -->
      <GenreFilter :genres="genres" :onFilter="filterByGenre" />

      <div>
        <div v-if="filteredBooks.length > 0">
          <ul>
            <li v-for="book in filteredBooks" :key="book.id" class="book-item">
              <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
              <div class="book-details">
                <h2>{{ book.title }}</h2>
                <p><strong>Forfatter:</strong> {{ book.author }}</p>
                <p><strong>Genre:</strong> {{ book.genre.join(', ') }}</p>
              </div>
              <div class="book-meta">
                <p><strong>Udgivelsesår:</strong> {{ book.releaseYear }}</p>
                <p><strong>ISBN:</strong> {{ book.isbn }}</p>
              </div>

              <div v-if="role === 'user'" class="user-buttons">
                <button @click="addBookToTBR(book)" class="tbr-button">Add to TBR</button>
                <button @click="addBookToReadBooks(book)" class="read-books-button">Add to Read Books</button>
              </div>

              <button v-if="role === 'admin'" @click="removeBook(book.id)" class="remove-button">Slet</button>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>Ingen bøger fundet.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style >
main {
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  margin-top: 10vh;
}

.add-book-section {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.add-book-section input {
  padding: 10px;
  font-size: 1rem;
  margin: 0.5rem 0;
}

.add-book-section button {
  padding: 10px;
  font-size: 1rem;
}

ul {
  margin-top: 2rem;
  list-style-type: none;
  padding: 0;
}

.book-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 100px; /* Juster størrelsen på bogcoveret */
  height: auto;
  margin-right: 20px;
}

.book-details {
  flex: 1; /* Gør, at detaljer fylder det resterende rum */
  text-align: left;
}

.book-meta {
  text-align: left; /* Juster teksten til venstre */
  margin-left: 20px;
}

.remove-button {
  margin: 0 7%; /* Skub slet-knappen helt til højre */
  padding: 5px 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.remove-button:hover {
  background-color: #c61a07;
}

.user-buttons button {
  margin-left: 7%;
  padding: 5px 10px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.tbr-button {
  background-color: #a58282;
}
.tbr-button:hover {
  background-color: #8a6969;
} 

.read-books-button {
  background-color: #a6b29b;
}
.read-books-button:hover {
  background-color: #7b8274;
}
</style>
