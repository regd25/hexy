import { Dashboard } from './pages/Dashboard.js';

// Inicializar el dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard: Starting application...');
  
  // Start the original dashboard for now
  window.dashboard = new Dashboard();
  
  // TODO: Enable modularized version when ready
  // import('./DashboardApp.js').then(async ({ DashboardApp }) => {
  //   window.dashboardApp = new DashboardApp();
  //   await window.dashboardApp.start();
  // });
  
  console.log('Dashboard: Application started successfully');
});
