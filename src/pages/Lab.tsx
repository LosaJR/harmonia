import { useSearchParams } from 'react-router-dom'
import { ChordBuilder } from './lab/ChordBuilder'
import { CircleOfFifths } from './lab/CircleOfFifths'
import { ProgressionBuilder } from './lab/ProgressionBuilder'
import { ScaleExplorer } from './lab/ScaleExplorer'
import { VoicingComparer } from './lab/VoicingComparer'

const TABS = [
  { id: 'acordes', label: 'Constructor de acordes', C: ChordBuilder },
  { id: 'escalas', label: 'Explorador de escalas', C: ScaleExplorer },
  { id: 'circulo', label: 'Círculo de quintas', C: CircleOfFifths },
  { id: 'progresiones', label: 'Progresiones', C: ProgressionBuilder },
  { id: 'voicings', label: 'Comparador de voicings', C: VoicingComparer },
] as const

export function Lab() {
  const [params, setParams] = useSearchParams()
  const id = params.get('tab') ?? 'acordes'
  const tab = TABS.find((t) => t.id === id) ?? TABS[0]
  return (
    <div className="page">
      <header className="page-head"><h1>Laboratorio de armonía</h1><p>Experimenta sin examen: construye, escucha y compara. Todo lo que ves se puede tocar en el piano de abajo.</p></header>
      <div className="tabs" role="tablist" aria-label="Herramientas del laboratorio">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={t.id === tab.id} aria-controls={`panel-${t.id}`} className="tab" onClick={() => setParams({ tab: t.id }, { replace: true })}>{t.label}</button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`}>
        <tab.C />
      </div>
    </div>
  )
}
