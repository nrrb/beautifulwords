import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  // Available fonts with their display names
  const availableFonts = ref([
    { family: '"Fleur De Leah"', name: 'Fleur De Leah' },
    { family: '"Kapakana"', name: 'Kapakana' },
    { family: '"Pinyon Script"', name: 'Pinyon Script' },
    { family: '"Monsieur La Doulaise"', name: 'Monsieur La Doulaise' },
    { family: '"Ballet"', name: 'Ballet' },
    { family: '"Imperial Script"', name: 'Imperial Script' },
    { family: '"Mea Culpa"', name: 'Mea Culpa' },
    { family: '"My Soul"', name: 'My Soul' },
    { family: '"Updock"', name: 'Updock' },
    { family: '"Lavishly Yours"', name: 'Lavishly Yours' },
  ]);

  // Default settings
  const defaultSettings = {
    fontFamily: '"Fleur De Leah"',
    fontSize: 48,
    darkMode: true
  };

  // Reactive state
  const fontFamily = ref(localStorage.getItem('fontFamily') || defaultSettings.fontFamily);
  const fontSize = ref(parseInt(localStorage.getItem('fontSize')) || defaultSettings.fontSize);
  const darkMode = ref(localStorage.getItem('darkMode') === 'true' || defaultSettings.darkMode);

  // Computed property for CSS variables
  const cssVariables = computed(() => ({
    '--font-family': fontFamily.value,
    '--font-size': `${fontSize.value}px`,
  }));

  // Watch for changes and save to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('fontFamily', fontFamily.value);
    localStorage.setItem('fontSize', fontSize.value);
    localStorage.setItem('darkMode', darkMode.value);
    
    // Update the document class for dark mode
    if (darkMode.value) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  // Reset to default settings
  const resetSettings = () => {
    fontFamily.value = defaultSettings.fontFamily;
    fontSize.value = defaultSettings.fontSize;
    darkMode.value = defaultSettings.darkMode;
    saveToLocalStorage();
  };

  // Initialize
  saveToLocalStorage();

  return {
    availableFonts,
    fontFamily,
    fontSize,
    darkMode,
    cssVariables,
    resetSettings,
    saveToLocalStorage,
  };
});
