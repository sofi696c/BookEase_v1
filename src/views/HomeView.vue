<script setup>
import { ref, watch, onMounted } from 'vue';
import { useBooks } from '../modules/useBooks';
import { useUser } from '../modules/useUser';
import { db, auth } from '../modules/firebase'; 
import { collection, addDoc } from 'firebase/firestore'; 
import GenreFilter from '../components/GenreFilter.vue';

const { books, addBook, deleteBook, newBookTitle, newBookAuthor, newBookISBN, newBookGenre, newBookReleaseYear, newBookCoverUrl } = useBooks();
const { user, role, login, email, password, error: errorMessage } = useUser();

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
const filteredBooks = ref([]); // For at holde styr på filtrerede bøger
const searchTerm = ref(''); // For at holde styr på søgetermen

const genres = ['Romance', 'Fantasy', 'Historical Fiction', 'Thriller', 'Science Fiction', 'Horror', 'LGBTQ+', 'Non-Fiction'];

// Watch på books for at opdatere filteredBooks, når bøgerne ændres
watch(books, (newBooks) => {
  filterBooks(newBooks); // Opdater filteredBooks når books ændres
});

// Funktion til at fjerne mellemrum og konvertere til små bogstaver
const removeSpaces = (genre) => genre.trim().toLowerCase();

// Filter bøgerne baseret på genre og søgeterm
const filterBooks = (newBooks) => {
  filteredBooks.value = newBooks.filter(book => {
    const matchesGenre = selectedGenres.value.length === 0 || selectedGenres.value.some(selectedGenre => 
      book.genre.map(removeSpaces).includes(removeSpaces(selectedGenre))
    );

    const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.value.toLowerCase());

    return matchesGenre && matchesSearchTerm; // Returnér bøger, der matcher både genre og søgeterm
  });
};

// Filter bøgerne, når der er valgt genrer
watch(selectedGenres, () => {
  filterBooks(books.value); // Opdater filteredBooks ud fra på valgte genrer
});

// Watch på searchTerm for at opdatere filteredBooks, når søgetermen ændres
watch(searchTerm, () => {
  filterBooks(books.value); // Opdater filteredBooks når den ændres
});

// Viser alle bøger
onMounted(() => {
  filteredBooks.value = books.value; // Sørger for at vise alle bøger ved indlæsning
});

// Funktion til at håndtere genre filtrering
const filterByGenre = (selected) => {
  selectedGenres.value = selected; // Opdater valgte genrer
};

// Alm bruger - tilføj bog til Read Books
const addBookToReadBooks = async (book) => {
  const user = auth.currentUser; // Få den nuværende bruger
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
    } catch (error) {
      console.error("Error adding book to Read Books:", error);
    }
  }
};

const addBookToWantToRead = async (book) => {
  const user = auth.currentUser; // Få den nuværende bruger
  if (user) {
    try {
      const wantToReadCollectionRef = collection(db, 'users', user.uid, 'WantToRead'); // Reference til WantToRead-samlingen for den aktuelle bruger
      await addDoc(wantToReadCollectionRef, {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        releaseYear: book.releaseYear,
        coverUrl: book.coverUrl,
      });
    } catch (error) {
      console.error("Error adding book to Want to Read:", error);
    }
  }
};

</script>

<template>
  <main>
    <div v-if="!user" class="login-section">
      <h2>Login</h2>
      <input type="email" v-model="email" placeholder="Email" class="login-input" />
      <input type="password" v-model="password" placeholder="Password" class="login-input" />
      <button @click="login(email, password)" class="login-button">Login</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <div v-else>
      <p>Welcome, {{ user.email }}!</p>

      <div v-if="role === 'admin'" class="add-book-section">
        <h2>Add a new book here:</h2>
        <input v-model="newBookTitle" placeholder="Bog titel" />
        <input v-model="newBookAuthor" placeholder="Forfatter" />
        <input v-model="newBookISBN" placeholder="ISBN" />
        <input v-model="newBookGenre" placeholder="Genre (komma-separeret)" />
        <input v-model="newBookReleaseYear" placeholder="Udgivelsesår" />
        <input v-model="newBookCoverUrl" placeholder="Bogcover URL" />
        <button class="add-new-book" @click="addNewBook">Add Book</button>
      </div>

      <h1>Explore books</h1>
      <!-- GenreFilter komponenten -->
      <GenreFilter :genres="genres" :onFilter="filterByGenre" />

      <!-- Søgefelt til søgning -->
      <div class="search-section">
        <input type="text" v-model="searchTerm" placeholder="Search by title or author" class="search-input" />
        <button @click="filterBooks(books.value)" class="search-button">Søg</button>
      </div>

      <div>
        <div v-if="filteredBooks.length > 0">
          <ul>
            <li v-for="book in filteredBooks" :key="book.id" class="book-item">
              <img :src="book.coverUrl" alt="Book Cover" class="book-cover" />
              <div class="book-details">
                <h2>{{ book.title }}</h2>
                <p><strong>Author:</strong> {{ book.author }}</p>
                <p><strong>Genre:</strong> {{ book.genre.join(', ') }}</p>
              </div>
              <div class="book-meta">
                <p><strong>Release year:</strong> {{ book.releaseYear }}</p>
                <p><strong>ISBN:</strong> {{ book.isbn }}</p>
              </div>

              <div v-if="role === 'user'" class="user-buttons">
                <button @click="addBookToWantToRead(book)" class="want-to-read-button">Want to read</button>
                <button @click="addBookToReadBooks(book)" class="read-books-button">Add to Read Books</button>
              </div>

              <button v-if="role === 'admin'" @click="removeBook(book.id)" class="remove-button">Delete book</button>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>No books found.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
main {
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  margin-top: 10vh;
}

.login-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f4f4f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 320px;
  margin: 0 auto;
}

.login-section input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  margin: 0.75rem 0; /* Øget mellemrum mellem felterne */
  border: 1px solid #ccc;
  border-radius: 5px;
}

.login-section button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background-color: #a6b29b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem; /* Mere mellemrum over knappen */
}

.login-section button:hover {
  background-color: #7b8274;
}

.login-section p {
  color: #ff5c5c;
  font-size: 0.9rem;
  margin-top: 1rem;
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

.add-new-book {
  padding: 10px;
  font-size: 1rem;
  background-color: #a6b29b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.add-new-book:hover {
  background-color: #7b8274;
}

/* Styling til søgefunktionen */
.search-section {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.search-input {
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 300px; /* Bredde på søgefeltet */
  margin-right: 10px; /* Afstand mellem søgefelt og knap */
}

.search-button {
  padding: 10px 15px;
  font-size: 1rem;
  background-color: #a6b29b; /* Grå baggrundsfarve */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #7b8274; /* Mørkere grå ved hover */
}

.book-item {
  width: 80vh;
  display: flex;
  align-items: center;
  margin: 1rem 0;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 80px;
  height: auto;
  margin-right: 15px;
}

.book-details {
  flex: 1;
  text-align: left;
}

.book-meta {
  margin-left: 15px;
  text-align: left;
}

.user-buttons {
  display: flex;
  flex-direction: column;
  margin-left: 15px;
}

.user-buttons button {
  margin-bottom: 5px;
  padding: 10px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}


.remove-button {
  background-color: #ec6060;
  margin-bottom: 5px;
  padding: 10px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.remove-button:hover {
  background-color: #ca4949;
}
.read-books-button{
  background-color: #a6b29b;
}
.read-books-button:hover{
  background-color: #7b8274;
}
.want-to-read-button{
  background-color: #c09393;
}
.want-to-read-button:hover{
  background-color: #a67f7f;
}
</style>