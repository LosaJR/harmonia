import { useEffect } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { setTimbre, setVolume, stopPlayback } from './audio/engine'
import { PianoDock } from './components/PianoDock'
import { useMidiBridge } from './components/Piano'
import { getSaveError, useProgress } from './store/progress'
import { Home } from './pages/Home'
import { Course } from './pages/Course'
import { LessonPage } from './pages/Lesson'
import { PianoPage } from './pages/PianoPage'
import { Lab } from './pages/Lab'
import { Trainer } from './pages/Trainer'
import { Progress } from './pages/Progress'
import { Settings } from './pages/Settings'

const NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/curso', label: 'Curso' },
  { to: '/piano', label: 'Piano' },
  { to: '/laboratorio', label: 'Laboratorio' },
  { to: '/entrenador', label: 'Entrenador' },
  { to: '/progreso', label: 'Progreso' },
  { to: '/ajustes', label: 'Ajustes' },
]

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="var(--ink)" />
      <g fill="var(--bg)"><rect x="10" y="14" width="10" height="36" rx="2" /><rect x="22" y="14" width="10" height="36" rx="2" /><rect x="34" y="14" width="10" height="36" rx="2" /><rect x="46" y="14" width="8" height="36" rx="2" /></g>
      <g fill="var(--copper)"><rect x="17" y="14" width="7" height="22" rx="1.5" /><rect x="29" y="14" width="7" height="22" rx="1.5" /><rect x="41" y="14" width="7" height="22" rx="1.5" /></g>
    </svg>
  )
}

export function App() {
  const { settings } = useProgress()
  const loc = useLocation()
  useMidiBridge()

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const dark = settings.theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : settings.theme === 'dark'
      root.dataset.theme = dark ? 'dark' : 'light'
    }
    apply()
    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [settings.theme])
  useEffect(() => { document.documentElement.dataset.reduceMotion = String(settings.reducedMotion) }, [settings.reducedMotion])
  useEffect(() => { setVolume(settings.volume); setTimbre(settings.timbre) }, [settings.volume, settings.timbre])
  // Al cambiar de página se corta cualquier reproducción en curso
  useEffect(() => { stopPlayback(); window.scrollTo(0, 0) }, [loc.pathname])

  const dock = /^\/(curso\/.+|laboratorio|entrenador)/.test(loc.pathname)
  const saveError = getSaveError()

  return (
    <div className={`app${dock ? ' has-dock' : ''}`}>
      <a href="#contenido" className="skip">Saltar al contenido</a>
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Harmonia, inicio">
          <Mark /><span className="brand-name">Harmonia</span>
        </NavLink>
        <nav className="nav" aria-label="Principal">
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>)}
        </nav>
      </header>
      {saveError && <div className="notice err" role="alert" style={{ margin: '12px clamp(16px,4vw,40px) 0' }}>{saveError} Tu progreso seguirá funcionando en esta sesión, pero puede perderse al cerrar la página. Usa «Exportar» en Progreso para guardar una copia.</div>}
      <main id="contenido" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/curso" element={<Course />} />
          <Route path="/curso/:lessonId" element={<LessonPage />} />
          <Route path="/piano" element={<PianoPage />} />
          <Route path="/laboratorio" element={<Lab />} />
          <Route path="/entrenador" element={<Trainer />} />
          <Route path="/progreso" element={<Progress />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="*" element={<div className="page page-narrow"><div className="empty"><h3>Esta página no existe</h3><p>Vuelve al inicio o abre el curso.</p><NavLink to="/" className="btn btn-primary">Ir al inicio</NavLink></div></div>} />
        </Routes>
      </main>
      {!dock && <footer className="footer">Harmonia funciona sin conexión: tu progreso se guarda solo en este navegador.</footer>}
      {dock && <PianoDock />}
    </div>
  )
}
