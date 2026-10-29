import { lazy, Suspense } from 'react'
import { HashRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/templates/AppShell'
import { SECTIONS } from './sections'

// Cada página se carga recién cuando se abre (los trazos de kanji pesan bastante).
const VocabularyPage = lazy(() => import('../pages/VocabularyPage').then((m) => ({ default: m.VocabularyPage })))
const KanjiPage = lazy(() => import('../pages/KanjiPage').then((m) => ({ default: m.KanjiPage })))
const GrammarPage = lazy(() => import('../pages/GrammarPage').then((m) => ({ default: m.GrammarPage })))
const CountersPage = lazy(() => import('../pages/CountersPage').then((m) => ({ default: m.CountersPage })))
const ParticlesPage = lazy(() => import('../pages/ParticlesPage').then((m) => ({ default: m.ParticlesPage })))

/**
 * HashRouter: GitHub Pages no sabe redirigir rutas a index.html,
 * así que las rutas van después del # (…/nihongo-sensei/#/gramatica).
 * Si la app se abre embebida sin una dirección propia (por ejemplo, una vista
 * previa en about:srcdoc), no hay URL que leer y se usa un router en memoria.
 */
const Router = /^(https?|file):$/.test(window.location.protocol) ? HashRouter : MemoryRouter

const loading = <p aria-live="polite">Cargando…</p>

export function App() {
  return (
    <Router>
      <Suspense fallback={loading}>
        <Routes>
          <Route element={<AppShell sections={SECTIONS} />}>
            <Route index element={<Navigate to="/vocabulario" replace />} />
            <Route path="vocabulario" element={<VocabularyPage />} />
            <Route path="kanji" element={<KanjiPage />} />
            <Route path="gramatica" element={<GrammarPage />} />
            <Route path="contadores" element={<CountersPage />} />
            <Route path="particulas" element={<ParticlesPage />} />
            <Route path="*" element={<Navigate to="/vocabulario" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}
