import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/global.scss'

// Links de la versión anterior (#gramatica) → rutas nuevas (#/gramatica).
function redirectLegacyHash() {
  const legacy = window.location.hash.match(/^#(vocabulario|kanji|gramatica|particulas|contadores)$/)
  if (legacy) window.location.replace(`#/${legacy[1]}`)
}
redirectLegacyHash()
window.addEventListener('hashchange', redirectLegacyHash)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
