const NodeCache = require("node-cache");

// Crear una instancia de la caché sin un tiempo de expiración predeterminado
const cache = new NodeCache();

/**
 * Guarda un valor en caché con una clave específica y tiempo de duración personalizado.
 * @param {string} key - La clave para identificar el valor en caché.
 * @param {*} value - El valor a guardar en caché.
 * @param {number} ttl - Tiempo de vida del valor en la caché, en segundos.
 * @returns {boolean} - Devuelve `true` si el valor se guardó correctamente.
 */
const setCache = (key, value, ttl = 300) => {
  return cache.set(key, value, ttl);
};

/**
 * Obtiene un valor de la caché usando la clave.
 * @param {string} key - La clave para buscar el valor en caché.
 * @returns {*} - El valor almacenado en caché o `undefined` si no existe.
 */
const getCache = (key) => {
  return cache.get(key);
};

module.exports = { setCache, getCache };
