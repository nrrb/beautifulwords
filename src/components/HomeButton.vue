<template>
  <!-- add a button fixed in the upper left corner that says "new words" and when clicked, it opens the home view 
    make the font use the same font as the quote
  -->
  <button class="new-words-button" @click.stop="goHome">
    New Words
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  console.log('goHome')
  router.push('/')
}
</script>

<style lang="scss" scoped>
.new-words-button {
  background-color: black;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 1rem;
  font-family: var(--font-family);
}
</style>