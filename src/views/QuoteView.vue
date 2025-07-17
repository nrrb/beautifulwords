<template>
  <div 
    class="quote-view"
    :style="{
      fontFamily: currentQuote?.font || settingsStore.fontFamily,
      fontSize: `${currentQuote?.size || settingsStore.fontSize}px`
    }"
  >
    <div class="quote-container">
      <div class="quote-text" v-if="currentQuote">
        {{ currentQuote.text }}
      </div>
      <div class="quote-author" v-if="currentQuote?.author">
        {{ currentQuote.author }}
      </div>
      
      <!-- Navigation indicators -->
      <div class="nav-indicators">
        <button class="nav-arrow left" @click="navigateToQuote('prev')">
          &larr;
        </button>
        <button class="nav-arrow right" @click="navigateToQuote('next')">
          &rarr;
        </button>
      </div>
    </div>
  </div>

  <HomeButton class="home-button" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuotesStore } from '../stores/quotes'
import { useSettingsStore } from '../stores/settings'
import HomeButton from '../components/HomeButton.vue'

// Accept slug as a prop to avoid extraneous non-props attributes warning
const props = defineProps({
  slug: String
})

const route = useRoute()
const router = useRouter()
const quotesStore = useQuotesStore()
const settingsStore = useSettingsStore()

const currentQuote = ref(null)
const touchStartX = ref(0)
const touchEndX = ref(0)

// Navigate to the next or previous quote
const navigateToQuote = (direction) => {
  if (!currentQuote.value) return
  
  let targetQuote = null
  
  if (direction === 'next') {
    targetQuote = quotesStore.getNextQuote(currentQuote.value.id)
  } else if (direction === 'prev') {
    targetQuote = quotesStore.getPreviousQuote(currentQuote.value.id)
  }
  
  if (targetQuote) {
    router.push(`/quote/${targetQuote.slug}`)
  }
}

// Handle touch events for swipe navigation
const handleTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const handleTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const diff = touchStartX.value - touchEndX.value
  const swipeThreshold = 50 // Minimum distance to trigger navigation
  
  if (diff > swipeThreshold) {
    // Swipe left - go to next quote
    navigateToQuote('next')
  } else if (diff < -swipeThreshold) {
    // Swipe right - go to previous quote
    navigateToQuote('prev')
  }
}

// Handle keyboard navigation
const handleKeyDown = (e) => {
  if (e.key === 'ArrowLeft') {
    navigateToQuote('prev')
  } else if (e.key === 'ArrowRight') {
    navigateToQuote('next')
  } else if (e.key === 'Escape') {
    router.push('/')
  }
}

const isLoading = computed(() => quotesStore.isLoading)

// Watch for route changes and loading state to update the quote
watch(
  [() => route.params.slug, isLoading],
  ([slug, loading]) => {
    if (loading) return // Wait until quotes are loaded
    const quote = quotesStore.getQuoteBySlug(slug)
    if (!quote) {
      router.push('/')
      return
    }
    currentQuote.value = quote
  },
  { immediate: true }
)

// Set up event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
})

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.home-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
}

.quote-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  cursor: default;
  user-select: none;
  transition: all 0.3s ease;
}

.quote-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding: 2rem;
}

.quote-text {
  font-size: 1em; /* Use the font size from settings */
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-weight: 400;
  position: relative;
}

.quote-author {
  font-size: 0.6em; /* Slightly smaller than the quote text */
  font-style: italic;
  opacity: 0.8;
  margin-top: 2rem;
  position: relative;
  display: inline-block;
  padding: 0 1rem;
}

.quote-author::before,
.quote-author::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30px;
  height: 1px;
  background-color: currentColor;
  opacity: 0.5;
}

.quote-author::before {
  left: -30px;
}

.quote-author::after {
  right: -30px;
}

/* Navigation indicators */
.nav-indicators {
  position: fixed;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 10;
}

.nav-arrow {
  background: rgba(0, 0, 0, 0.2);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
  opacity: 0.5;
}

.dark-mode .nav-arrow {
  background: rgba(255, 255, 255, 0.2);
}

.nav-arrow:hover {
  opacity: 1;
  transform: scale(1.1);
}

.nav-arrow.left {
  left: 1rem;
}

.nav-arrow.right {
  right: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .quote-text {
    font-size: 1.5em;
  }
  
  .nav-arrow {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .quote-text {
    font-size: 1.2em;
  }
  
  .quote-author {
    font-size: 0.7em;
  }
  
  .nav-arrow {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
}
</style>
