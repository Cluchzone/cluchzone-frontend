/**
 * URL base do backend (repositório separado clutchzone-backend).
 * Em produção vem de VITE_BACKEND_URL; em localhost cai em :3001, igual ao
 * legado (config.js) e ao clutchzone-app. Sem barra final.
 */
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const localFallback = isLocalhost ? 'http://localhost:3001' : ''

export const BACKEND_URL = String(import.meta.env.VITE_BACKEND_URL ?? localFallback).replace(/\/$/, '')
