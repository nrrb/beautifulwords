<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuotesStore } from '../stores/quotes';
import { useSettingsStore } from '../stores/settings';

const router = useRouter();
const quotesStore = useQuotesStore();
const settingsStore = useSettingsStore();

const quoteText = ref('');
const author = ref('');
const selectedFont = ref(settingsStore.fontFamily);

const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!quoteText.value.trim() || !author.value.trim()) return;
  
  const newQuote = quotesStore.addQuote(quoteText.value.trim(), author.value.trim());
  
  // Reset form
  quoteText.value = '';
  author.value = '';
  
  // Navigate to the new quote
  router.push(`/quote/${newQuote.slug}`);
};

// Update font when selectedFont changes
onMounted(() => {
  selectedFont.value = settingsStore.fontFamily;
});
</script>

<template>
  <div class="home">
    <form @submit="handleSubmit" class="quote-form">
      <div class="form-group">
        <select v-model="selectedFont" class="font-selector">
          <option 
            v-for="font in settingsStore.availableFonts" 
            :key="font.family" 
            :value="font.family"
            :style="{ fontFamily: font.family }"
          >
            {{ font.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <textarea
          v-model="quoteText"
          class="quote-input"
          placeholder="Enter your quote..."
          rows="4"
          :style="{ 
            fontFamily: selectedFont,
            fontSize: `${settingsStore.fontSize}px`
          }"
        ></textarea>
      </div>
      
      <div class="form-group">
        <input
          v-model="author"
          type="text"
          class="author-input"
          placeholder="Author"
          :style="{ 
            fontFamily: selectedFont,
            fontSize: `${settingsStore.fontSize * 0.8}px`
          }"
        />
      </div>
      
      <button type="submit" class="submit-button">Inscribe</button>
    </form>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.quote-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.form-group {
  width: 100%;
}

.font-selector {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat, repeat;
  background-position: right 0.7em top 50%, 0 0;
  background-size: 0.65em auto, 100%;
  padding-right: 2.5em;
}

.dark-mode .font-selector {
  background-color: #333;
  color: white;
  border-color: #555;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
}

.quote-input,
.author-input {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  text-align: center;
  transition: all 0.3s ease;
}

.quote-input {
  min-height: 150px;
  font-size: 1.5rem;
  line-height: 1.6;
}

.author-input {
  font-style: italic;
  margin-top: 0.5rem;
  text-align: right;
  padding-right: 2rem;
}

.quote-input::placeholder,
.author-input::placeholder {
  color: #aaa;
  opacity: 1;
}

.dark-mode .quote-input::placeholder,
.dark-mode .author-input::placeholder {
  color: #777;
}

.submit-button {
  background-color: rgba(139, 115, 85, 0.1);
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
  background-color: rgba(139, 115, 85, 0.2);
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
