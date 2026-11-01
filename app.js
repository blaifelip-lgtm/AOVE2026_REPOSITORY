const SUPPORTED_LANGS = ['ca', 'en', 'nl'];
const DEFAULT_LANG = 'en';

// Detecta el idioma del dispositivo o URL
function getTargetLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam && SUPPORTED_LANGS.includes(langParam)) {
    return langParam;
  }

  const savedLang = localStorage.getItem('aove_lang');
  if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
    return savedLang;
  }

  // Detección automática del navegador/dispositivo
  const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage];
  for (let rawLang of browserLangs) {
    const code = rawLang.toLowerCase().split('-')[0];
    if (SUPPORTED_LANGS.includes(code)) {
      return code;
    }
  }

  return DEFAULT_LANG;
}

// Carga el archivo JSON y renderiza textos
async function loadTranslations(lang) {
  try {
    // Determinar ruta relativa al archivo JSON (soporta raíz o subcarpeta /pages/)
    const basePath = window.location.pathname.includes('/pages/') ? '../data/' : './data/';
    const response = await fetch(`${basePath}${lang}.json`);
    
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();

    // Actualiza textos en el DOM
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (data[key]) {
        element.textContent = data[key];
      }
    });

    if (data.meta_title) {
      document.title = data.meta_title;
    }

    // Marca selector visual activo
    const selector = document.getElementById('lang-select');
    if (selector) selector.value = lang;

    document.documentElement.lang = lang;
    localStorage.setItem('aove_lang', lang);
  } catch (err) {
    console.error('No se pudo cargar la traducción:', err);
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  const currentLang = getTargetLanguage();
  loadTranslations(currentLang);

  const selector = document.getElementById('lang-select');
  if (selector) {
    selector.addEventListener('change', (e) => {
      loadTranslations(e.target.value);
    });
  }
});