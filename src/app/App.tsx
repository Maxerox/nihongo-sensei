import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/templates/AppShell'
import { CountersPage } from '../pages/CountersPage'
import { GrammarPage } from '../pages/GrammarPage'
import { ParticlesPage } from '../pages/ParticlesPage'
import { VocabularyPage } from '../pages/VocabularyPage'
import { SECTIONS } from './sections'

/**
 * HashRouter: GitHub Pages no sabe redirigir rutas a index.html,
 * así que las rutas van después del # (…/nihongo-sensei/#/gramatica).
 */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell sections={SECTIONS} />}>
          <Route index element={<Navigate to="/vocabulario" replace />} />
          <Route path="vocabulario" element={<VocabularyPage />} />
          <Route path="gramatica" element={<GrammarPage />} />
          <Route path="contadores" element={<CountersPage />} />
          <Route path="particulas" element={<ParticlesPage />} />
          <Route path="*" element={<Navigate to="/vocabulario" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
