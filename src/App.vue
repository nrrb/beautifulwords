<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from './stores/settings';
import { useQuotesStore } from './stores/quotes';

const router = useRouter();
const settingsStore = useSettingsStore();
const quotesStore = useQuotesStore();

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};

const resetSettings = () => {
  settingsStore.resetSettings();
  closeMenu();
};

// Handle keyboard navigation
const handleKeyDown = (e) => {
  if (e.key === 'ArrowLeft') {
    // Navigate to previous quote
  } else if (e.key === 'ArrowRight') {
    // Navigate to next quote
  } else if (e.key === 'Escape') {
    closeMenu();
  }
};

// Add event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div :class="['app', { 'dark-mode': settingsStore.darkMode }]">
    <router-view />
    
    <!-- Menu Button -->
    <button class="menu-button" @click="toggleMenu">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </button>
    
    <!-- Menu Overlay -->
    <div v-if="showMenu" class="menu-overlay" @click.self="closeMenu">
      <div class="menu-content">
        <button class="close-button" @click="closeMenu">×</button>
        <h2>Settings</h2>
        
        <div class="setting-group">
          <label>Font Family</label>
          <select v-model="settingsStore.fontFamily">
            <option v-for="font in settingsStore.availableFonts" :key="font.family" :value="font.family" :style="{ fontFamily: font.family }">
              {{ font.name }}
            </option>
          </select>
        </div>
        
        <div class="setting-group">
          <label>Font Size</label>
          <input type="range" v-model="settingsStore.fontSize" min="12" max="48" />
          <span>{{ settingsStore.fontSize }}px</span>
        </div>
        
        <div class="setting-group">
          <label>
            <input type="checkbox" v-model="settingsStore.darkMode" />
            Dark Mode
          </label>
        </div>
        
        <button class="reset-button" @click="resetSettings">Reset to Defaults</button>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --bg-light: #f5f5dc; /* Light cream */
  --text-light: #333333; /* Dark gray */
  --bg-dark: #1a1a1a;
  --text-dark: #f0f0f0;
  --accent: #8b7355; /* Muted gold/brown */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-light);
  color: var(--text-light);
  transition: background-color 0.3s, color 0.3s;
}

.dark-mode {
  background-color: var(--bg-dark);
  color: var(--text-dark);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

/* Menu Button */
.menu-button {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
}

.dark-mode .menu-button {
  background-color: rgba(0, 0, 0, 0.2);
}

.dot {
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
}

/* Menu Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.menu-content {
  background-color: var(--bg-light);
  padding: 2rem;
  border-radius: 8px;
  max-width: 90%;
  width: 400px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dark-mode .menu-content {
  background-color: var(--bg-dark);
  border: 1px solid #444;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
}

.dark-mode .close-button {
  color: var(--text-dark);
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

select, input[type="range"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
}

.dark-mode select,
.dark-mode input[type="range"] {
  background-color: #333;
  color: #fff;
  border-color: #555;
}

.reset-button {
  background-color: var(--accent);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: opacity 0.2s;
}

.reset-button:hover {
  opacity: 0.9;
}
</style>
