import { playSteps, TIMBRES, ensureAudio, isAudioStarted, type Timbre } from '../audio/engine'
import { midi } from '../audio/midi'
import { useMidiStatus } from '../components/Piano'
import { storageStatus } from '../store/storage'
import { updateSettings, useProgress } from '../store/progress'

export function Settings() {
  const { settings } = useProgress()
  const m = useMidiStatus()
  const st = storageStatus()
  return (
    <div className="page page-narrow">
      <header className="page-head"><h1>Ajustes</h1><p>Se aplican al instante y se guardan en este navegador.</p></header>
      <div className="stack">
        <section className="card">
          <h2 className="card-title">Nombres de las notas</h2>
          <div className="cluster" role="radiogroup" aria-label="Nomenclatura">
            <button className="chip" role="radio" aria-checked={settings.naming === 'latin'} aria-pressed={settings.naming === 'latin'} onClick={() => updateSettings({ naming: 'latin' })}>Latina · Do Re Mi</button>
            <button className="chip" role="radio" aria-checked={settings.naming === 'intl'} aria-pressed={settings.naming === 'intl'} onClick={() => updateSettings({ naming: 'intl' })}>Internacional · C D E</button>
          </div>
          <p className="faint">Cambia los nombres en teclas, ejercicios y explicaciones. Los cifrados de acorde (C7, Dm7) siguen la misma elección.</p>
        </section>

        <section className="card">
          <h2 className="card-title">Apariencia</h2>
          <div className="cluster" role="radiogroup" aria-label="Tema">
            {([['dark', 'Oscuro'], ['light', 'Claro'], ['system', 'Según el sistema']] as const).map(([v, l]) => (
              <button key={v} className="chip" role="radio" aria-checked={settings.theme === v} aria-pressed={settings.theme === v} onClick={() => updateSettings({ theme: v })}>{l}</button>
            ))}
          </div>
          <label className="cluster" style={{ marginTop: 14 }}><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => updateSettings({ reducedMotion: e.target.checked })} /> Reducir animaciones <span className="faint">(también respetamos la preferencia del sistema)</span></label>
        </section>

        <section className="card">
          <h2 className="card-title">Sonido y piano</h2>
          <div className="row">
            <label className="field"><span>Timbre</span>
              <select value={settings.timbre} onChange={(e) => updateSettings({ timbre: e.target.value as Timbre })}>{TIMBRES.map((t) => <option key={t.id} value={t.id}>{t.nameEs}</option>)}</select>
            </label>
            <label className="field"><span>Volumen ({Math.round(settings.volume * 100)} %)</span>
              <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(e) => updateSettings({ volume: Number(e.target.value) })} />
            </label>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <label className="field"><span>Octavas visibles</span>
              <select value={settings.octaves} onChange={(e) => updateSettings({ octaves: Number(e.target.value), startOctave: Math.min(settings.startOctave, 7 - Number(e.target.value)) })}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select>
            </label>
            <label className="field"><span>Primera octava</span>
              <select value={settings.startOctave} onChange={(e) => updateSettings({ startOctave: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6].filter((n) => n + settings.octaves <= 7).map((n) => <option key={n} value={n}>C{n}{n === 4 ? ' (Do central)' : ''}</option>)}</select>
            </label>
          </div>
          <label className="cluster" style={{ margin: '14px 0' }}><input type="checkbox" checked={settings.showNoteNames} onChange={(e) => updateSettings({ showNoteNames: e.target.checked })} /> Mostrar el nombre de las notas en las teclas</label>
          <button className="btn" onClick={async () => { await ensureAudio(); void playSteps([{ notes: ['C4', 'E4', 'G4', 'C5'], beats: 2 }], { tempo: 80 }) }}>Probar el sonido {isAudioStarted() ? '' : '(activa el audio)'}</button>
        </section>

        <section className="card">
          <h2 className="card-title">Teclado MIDI</h2>
          {!m.supported ? (
            <p className="notice">Este navegador no admite Web MIDI (funciona en Chrome, Edge u Opera). Todo lo demás sigue disponible con el piano virtual.</p>
          ) : (
            <>
              <p className="muted">Conecta un teclado MIDI por USB, pulsa el botón y concede el permiso del navegador. Sus notas tocarán el piano virtual y responderán ejercicios.</p>
              <div className="cluster">
                <button className="btn btn-primary" onClick={() => void midi.connect()}>{m.connected ? 'Buscar dispositivos de nuevo' : 'Conectar teclado MIDI'}</button>
                {m.connected && <button className="btn" onClick={() => midi.disconnect()}>Desconectar</button>}
              </div>
              {m.connected && <p className="notice good" style={{ marginTop: 12 }}>Dispositivos: {m.devices.map((d) => d.name).join(', ')}</p>}
              {m.error && <p className="notice" style={{ marginTop: 12 }} role="status">{m.error}</p>}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Almacenamiento</h2>
          <p className={`notice ${st.persistent ? 'good' : 'err'}`}>{st.persistent ? 'El progreso se guarda en este navegador (localStorage).' : `No se puede guardar de forma permanente: ${st.error ?? 'almacenamiento no disponible'}. La app funciona, pero exporta una copia desde Progreso.`}</p>
        </section>
      </div>
    </div>
  )
}
