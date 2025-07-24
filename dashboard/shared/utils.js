/**
 * Utilidades compartidas para la aplicación
 */

/**
 * Obtiene el ID de un nodo, ya sea como objeto o como string
 * @param {Object|string} n - Nodo u objeto con ID
 * @returns {string} - ID del nodo
 */
export function getId(n) {
  return typeof n === 'object' ? n.id : n;
}

/**
 * Crea un elemento debounce para evitar llamadas excesivas a una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} - Función con debounce
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}