<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuotesStore } from '../stores/quotes'
import { useSettingsStore } from '../stores/settings'

const router = useRouter()
const quotesStore = useQuotesStore()
const settingsStore = useSettingsStore()

const quoteText = ref('')

const handleSubmit = (e) => {
  e.preventDefault()
  
  const text = quoteText.value.trim()
  if (!text) return
  
  const lines = text.split('\n')
  const lastLine = lines[lines.length - 1].trim()
  
  let quoteTextFinal = text
  let authorName = ''
  
  // Extract author from the last line if it starts with a hyphen
  if (lastLine.startsWith('-') && lastLine.length > 2) {
    authorName = lastLine.substring(1).trim()
    // Remove the author line from the quote text
    lines.pop()
    quoteTextFinal = lines.join('\n').trim()
  }
  
  const newQuote = quotesStore.addQuote(quoteTextFinal, authorName, settingsStore.fontFamily, settingsStore.fontSize)
  
  // Reset form
  quoteText.value = ''
  
  // Navigate to the new quote
  router.push(`/quote/${newQuote.slug}`)
}
</script>

<template>
  <div class="home">
    <form @submit="handleSubmit" class="quote-form">
      <div class="form-group">
        <textarea
          v-model="quoteText"
          class="quote-input"
          placeholder="I refuse to join any club that would have me as a member.
- Groucho Marx"
          rows="4"
          :style="{
            fontFamily: settingsStore.fontFamily,
            fontSize: `${settingsStore.fontSize}px`
          }"
        ></textarea>
      </div>

      <button type="submit" class="submit-button">Inscribe</button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  width: 100%;
  max-width: 60vw;
  margin: 0 auto;

  .quote-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;

    .form-group {
      width: 100%;
    }
  }
}

.quote-input {
  width: 100%;
  min-height: 150px;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  text-align: center;
  transition: all 0.3s ease;
  font-size: 1.5rem;
  line-height: 1.6;

  &::placeholder {
    color: #aaa;
    opacity: 1;
  }

  .dark-mode &::placeholder {
    color: #777;
  }
}

.submit-button {
  background-color: black;
  color: var(--text-light);
  border: 2px solid var(--accent);
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.dark-mode .submit-button {
  color: var(--text-dark);
  background-color: black;
}

.submit-button:hover {
  background-color: var(--accent);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
