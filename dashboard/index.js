import { Dashboard } from './pages/Dashboard.js';

// Inicializar el dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new Dashboard();
});
