<template>
  <header>
    <h1 class="logo">BookEase</h1>
      <nav>
        <RouterLink to="/want-to-read">Want to read</RouterLink>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/tbr">TBR</RouterLink>
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
  flex-direction: column; /* Arrangerer indholdet vertikalt */
  justify-content: center; /* Centerer indholdet horisontalt */
  align-items: center; /* Centerer alt indhold vertikalt */
  position: fixed; /* Gør headeren fast */
  top: 0; /* Sørger for at headeren altid er i toppen */
  left: 0;
  width: 100%; /* Fylder hele bredden af skærmen */
  background-color: #ccdabe; /* Baggrundsfarve */
  height: 100px;
}

.logo {
  font-size: 2rem; /* Gør logoet mere fremtrædende */
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
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

button {
  margin-left: 1rem; /* Giver lidt afstand til knappen */
  background-color: transparent;
  border: none;
  cursor: pointer;
}

@media (min-width: 1024px) {
  header {
    padding: 2rem; /* Tilføjer mere padding til større skærme */
  }

  .logo {
    font-size: 3rem; /* Øger størrelsen på logoet for større skærme */
  }

  nav {
    font-size: 1rem; /* Justerer navigationens tekststørrelse */
  }
}
</style>
