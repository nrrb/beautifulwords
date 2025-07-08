<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuotesStore } from '../stores/quotes';
import { useSettingsStore } from '../stores/settings';

const route = useRoute();
const router = useRouter();
const quotesStore = useQuotesStore();
const settingsStore = useSettingsStore();

const currentQuote = ref(null);
const touchStartX = ref(0);
const touchEndX = ref(0);

// Load the current quote based on the slug in the URL
const loadQuote = () => {
  const slug = route.params.slug;
  const quote = quotesStore.getQuoteBySlug(slug);
  
  if (!quote) {
    // If quote not found, redirect to home
    router.push('/');
    return;
  }
  
  currentQuote.value = quote;
};

// Navigate to the next or previous quote
const navigateToQuote = (direction) => {
  if (!currentQuote.value) return;
  
  let targetQuote = null;
  
  if (direction === 'next') {
    targetQuote = quotesStore.getNextQuote(currentQuote.value.id);
  } else if (direction === 'prev') {
    targetQuote = quotesStore.getPreviousQuote(currentQuote.value.id);
  }
  
  if (targetQuote) {
    router.push(`/quote/${targetQuote.slug}`);
  }
};

// Handle touch events for swipe navigation
const handleTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const diff = touchStartX.value - touchEndX.value;
  const swipeThreshold = 50; // Minimum distance to trigger navigation
  
  if (diff > swipeThreshold) {
    // Swipe left - go to next quote
    navigateToQuote('next');
  } else if (diff < -swipeThreshold) {
    // Swipe right - go to previous quote
    navigateToQuote('prev');
  }
};

// Handle click on left/right sides of the screen
const handleScreenClick = (e) => {
  if (!currentQuote.value) return;
  
  const screenWidth = window.innerWidth;
  const clickX = e.clientX;
  const thirdOfScreen = screenWidth / 3;
  
  if (clickX < thirdOfScreen) {
    // Clicked on left third - go to previous quote
    navigateToQuote('prev');
  } else if (clickX > screenWidth - thirdOfScreen) {
    // Clicked on right third - go to next quote
    navigateToQuote('next');
  }
};

// Handle keyboard navigation
const handleKeyDown = (e) => {
  if (e.key === 'ArrowLeft') {
    navigateToQuote('prev');
  } else if (e.key === 'ArrowRight') {
    navigateToQuote('next');
  } else if (e.key === 'Escape') {
    router.push('/');
  }
};

// Set up event listeners
onMounted(() => {
  loadQuote();
  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('click', handleScreenClick);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
});

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('click', handleScreenClick);
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchend', handleTouchEnd);
});

// Watch for route changes to update the quote
watch(() => route.params.slug, () => {
  loadQuote();
});
</script>

<template>
  <div 
    class="quote-view"
    :style="{
      fontFamily: settingsStore.fontFamily,
      fontSize: `${settingsStore.fontSize}px`
    }"
  >
    <div class="quote-container">
      <div class="quote-text" v-if="currentQuote">
        {{ currentQuote.text }}
      </div>
      <div class="quote-author" v-if="currentQuote">
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
</template>

<style scoped>
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
  font-size: 2em;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-weight: 400;
  position: relative;
  quotes: '\201C' '\201D';
}

.quote-text::before {
  content: open-quote;
  font-size: 4em;
  position: absolute;
  left: -0.5em;
  top: -0.2em;
  opacity: 0.2;
  line-height: 1;
}

.quote-author {
  font-size: 0.8em;
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

/* Clickable areas for navigation */
.quote-view::before,
.quote-view::after {
  content: '';
  position: fixed;
  top: 0;
  bottom: 0;
  width: 33.33%;
  z-index: 5;
  cursor: pointer;
}

.quote-view::before {
  left: 0;
}

.quote-view::after {
  right: 0;
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
