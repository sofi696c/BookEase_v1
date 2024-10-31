import { ref } from 'vue';
import { db } from '../modules/firebase'; 
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

export function useBooks() {
    const books = ref([]);
    const error = ref(null);

    // Tilføj variabler til at håndtere boginformationer
    const newBookTitle = ref('');
    const newBookAuthor = ref('');
    const newBookISBN = ref('');
    const newBookGenre = ref([]);
    const newBookReleaseYear = ref('');
    const newBookCoverUrl = ref(''); // Ny variabel til at gemme cover-URL

    const fetchBooks = () => {
        const booksCollection = collection(db, 'books'); 
        onSnapshot(booksCollection, (snapshot) => {
            books.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }, (err) => {
            console.error("Error fetching books: ", err);
            error.value = err;
        });
    };

    const addBook = async () => {
        const book = {
            title: newBookTitle.value,
            author: newBookAuthor.value,
            isbn: newBookISBN.value,
            genre: newBookGenre.value.split(','), // Del genre op i et array
            releaseYear: newBookReleaseYear.value,
            coverUrl: newBookCoverUrl.value // Inkluder cover-URL
        };
        
        try {
            const docRef = await addDoc(collection(db, 'books'), book);
            console.log("Book added with ID: ", docRef.id);
            // Nulstil inputfelterne efter tilføjelse
            newBookTitle.value = '';
            newBookAuthor.value = '';
            newBookISBN.value = '';
            newBookGenre.value = '';
            newBookReleaseYear.value = '';
            newBookCoverUrl.value = ''; // Nulstil cover-URL
        } catch (e) {
            console.error("Error adding book: ", e);
            error.value = e;
        }
    };

    const deleteBook = async (id) => {
        try {
            await deleteDoc(doc(db, 'books', id));
            console.log("Book deleted with ID: ", id);
        } catch (e) {
            console.error("Error deleting book: ", e);
            error.value = e;
        }
    };

    fetchBooks();

    return {
        books,
        error,
        addBook,
        deleteBook,
        newBookTitle,
        newBookAuthor,
        newBookISBN,
        newBookGenre,
        newBookReleaseYear,
        newBookCoverUrl // Returner cover-URL
    };
}
