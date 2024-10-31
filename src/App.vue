<template>
  <header>
    <h1 class="logo">BookEase</h1>
      <nav>
        <RouterLink to="/want-to-read">Want to read</RouterLink>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/read-books">Read books</RouterLink>
        <button v-if="user" @click="logout">Log out</button>
      </nav>
  </header>

  <RouterView />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const user = ref(null);
const auth = getAuth();

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser; // Opdaterer brugeren, når tilstanden ændres
  });
});

const logout = async () => {
  await signOut(auth); // Logger brugeren ud
  user.value = null; // Opdaterer brugerens tilstand
};

</script>

<style >
header {
  display: flex;
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  position: fixed; 
  top: 0; 
  left: 0;
  width: 100%; 
  background-color: #ccdabe; 
  height: 100px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); 
}

.logo {
  font-size: 2rem; 
  color: #a06666;
}

nav {
  font-size: 12px;
  padding: 0 0 1rem 0;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1rem; 
  border-left: 1px solid var(--color-border);
  color: #a06666; 
  background-color: #ccdabe; 
  transition: background-color 0.3s, transform 0.3s; 
}

nav a:first-of-type {
  border: 0;
}

nav a:hover {
  background-color: #a8b49c; 
  transform: scale(1.05); 
}

button {
  margin-left: 1rem; 
  background-color: #ccdabe; 
  color: #a06666; 
  border: none; 
  padding: 0.5rem 1rem; 
  cursor: pointer; 
  transition: background-color 0.3s, transform 0.3s; 
}

button:hover {
  background-color: #a8b49c; 
  transform: scale(1.05); 
}

@media (min-width: 1024px) {
  header {
    padding: 2rem; 
  }

  .logo {
    font-size: 3rem; 
  }

  nav {
    font-size: 1rem; 
  }
}

</style>
