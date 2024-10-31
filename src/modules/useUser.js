import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from './firebase';
import { doc, collection, addDoc, deleteDoc } from 'firebase/firestore';

const auth = getAuth();

export function useUser() {
    const user = ref(null);
    const role = ref(null);
    const error = ref(null);

    // Lyt til ændringer i autentificeringstilstand
    onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            user.value = currentUser;
            // Bestem brugerens rolle
            role.value = currentUser.email.includes('@admin.com') ? 'admin' : 'user';
        } else {
            user.value = null;
            role.value = null;
        }
    });

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            user.value = userCredential.user;  // Dette vil nu blive håndteret af onAuthStateChanged
            error.value = null;
        } catch (err) {
            // Fejlbehandling
            handleAuthError(err);
        }
    };

    const logout = async () => {
        await signOut(auth);
        user.value = null;
        role.value = null;
    };

    const handleAuthError = (err) => {
        if (err.code === 'auth/invalid-email') {
            error.value = 'Den indtastede email er ikke gyldig.';
        } else if (err.code === 'auth/user-not-found') {
            error.value = 'Ingen bruger fundet med denne email.';
        } else if (err.code === 'auth/wrong-password') {
            error.value = 'Forkert adgangskode.';
        } else {
            error.value = 'Der opstod en fejl ved login: ' + err.message;
        }
        console.error("Error logging in: ", error.value);
    };

    const addToTBR = async (book) => {
        if (user.value) {
            const tbrCollectionRef = collection(db, 'users', user.value.uid, 'TBR');
            await addDoc(tbrCollectionRef, book);
        }
    };

    const addToReadBooks = async (bookId) => {
        if (user.value) {
            const readBooksCollectionRef = collection(db, 'users', user.value.uid, 'ReadBooks');
            await addDoc(readBooksCollectionRef, bookId);
        }
    };

    const removeFromReadBooks = async (bookId) => {
        const user = auth.currentUser;
        if (user) {
            
        const bookDocRef = doc(db, 'users', user.uid, 'read-books', bookId); // Opdater til read-books samlingen
            try {
                await deleteDoc(bookDocRef);
                console.log('Book removed from Read Books:', bookId);
            } catch (error) {
                console.error("Error removing book from Read Books:", error);
            }
        }
    };

    return {
        user,
        role,
        error,
        login,
        logout,
        addToTBR,
        addToReadBooks,
        removeFromReadBooks
    };
}
