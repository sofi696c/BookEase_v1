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
  flex-direction: column; /* Arrangerer indholdet vertikalt */
  justify-content: center; /* Centerer indholdet horisontalt */
  align-items: center; /* Centerer alt indhold vertikalt */
  position: fixed; /* Gør headeren fast */
  top: 0; /* Sørger for at headeren altid er i toppen */
  left: 0;
  width: 100%; /* Fylder hele bredden af skærmen */
  background-color: #ccdabe; /* Baggrundsfarve */
  height: 100px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Tilføjer en skygge under headeren */
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
  padding: 0.5rem 1rem; /* Juster padding for bedre knapstørrelse */
  border-left: 1px solid var(--color-border);
  color: #a06666; /* Gør teksten hvid */
  background-color: #ccdabe; /* Sætter baggrundsfarve til knapperne */
  transition: background-color 0.3s, transform 0.3s; /* Smooth transition */
}

nav a:first-of-type {
  border: 0;
}

nav a:hover {
  background-color: #a8b49c; /* Mørkere grå ved hover */
  transform: scale(1.05); /* Lille zoom-effekt ved hover */
}

button {
  margin-left: 1rem; /* Giver lidt afstand til knappen */
  background-color: #ccdabe; /* Rød baggrundsfarve for log out knap */
  color: #a06666; /* Hvid tekst */
  border: none; /* Ingen kant */
  padding: 0.5rem 1rem; /* Juster padding */
  cursor: pointer; /* Pointer cursor ved hover */
  transition: background-color 0.3s, transform 0.3s; /* Smooth transition */
}

button:hover {
  background-color: #a8b49c; /* Mørkere rød ved hover */
  transform: scale(1.05); /* Lille zoom-effekt ved hover */
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
