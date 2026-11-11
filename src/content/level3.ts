import { C, N, R } from '../exercises/rich'
import { chordExample, chordSeqExample, customExample, progExample, Q, tryChord } from './helpers'
import type { Lesson } from './types'

const L = (l: Omit<Lesson, 'level' | 'passScore'> & { passScore?: number }): Lesson => ({ level: 3, passScore: 0.7, ...l })

export const LEVEL3: Lesson[] = [
  L({
    id: 'n3-01', order: 1, title: 'Análisis armónico funcional', minutes: 18, prerequisites: ['n2-09'], covers: ['N3.1'],
    objective: 'Analizar una progresión paso a paso: tonalidad, números romanos, funciones y cadencias.',
    blocks: [
      { type: 'text', title: 'Un método en cuatro pasos', body: 'Analizar no es poner etiquetas: es entender **por qué** una progresión suena como suena. Sigue siempre este orden:\n\n1. **Tonalidad**: mira la armadura y el primer y último acorde.\n2. **Cifra cada acorde** con un número romano según su grado.\n3. **Función**: agrupa en tónica, predominante y dominante, y detecta los acordes que *no* pertenecen a la escala.\n4. **Cadencias y frases**: localiza dónde descansa y dónde se queda suspendida la música.\n\nUn análisis puede admitir **más de una lectura** válida (por ejemplo, un mismo acorde como vi en una tonalidad y como ii en otra). Elige la que explique mejor el contexto.' },
      progExample('Ejemplo analizado', `En Do mayor: C – Am – Dm – G – C. Romanos: ${R('I')} – ${R('vi')} – ${R('ii')} – ${R('V')} – ${R('I')}. Funciones: T – T – PD – D – T. La cadencia final V→I es auténtica.`, ['I', 'vi', 'ii', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Un acorde fuera de la escala', `En Do mayor: C – A7 – Dm – G7 – C. El ${C('A7')} no es diatónico (tiene Do♯): es dominante de Dm. Se analiza como ${R('V7/ii')}.`, ['I', 'V7/ii', 'ii', 'V7', 'I'], { tonic: 'C', mode: 'major' }),
      { type: 'callout', kind: 'tip', title: 'Pista rápida', body: 'Si un acorde tiene una alteración que la armadura no justifica, pregúntate si es la **sensible de otro acorde** (dominante secundaria) o un **color prestado** del modo paralelo.' },
      tryChord('Toca A7, el V7/ii de Do mayor: La, Do♯, Mi, Sol.', 'A', '7'),
    ],
    practiceTip: 'Coge cuatro compases de cualquier partitura con cifrado. Escribe debajo el número romano de cada acorde y rodea con color los que cumplen función de dominante.',
    practice: [{ gen: 'progression-analysis', count: 5, difficulty: 2 }, { gen: 'degree-function', count: 4, difficulty: 2 }, { gen: 'secondary-dominant', count: 2, difficulty: 1 }],
    quiz: [
      Q('En Sol mayor, la progresión G – Em – C – D es…', ['I – vi – IV – V', 'I – iii – IV – V', 'I – vi – ii – V', 'I – IV – vi – V'], 0, 'G=I, Em=vi, C=IV, D=V.'),
      Q('Si un acorde contiene una alteración ajena a la tonalidad, lo primero que conviene considerar es…', ['Que sea una dominante secundaria o un acorde prestado', 'Que la partitura tiene un error', 'Que la tonalidad ha cambiado siempre', 'Que es un acorde disminuido'], 0, 'Las alteraciones suelen indicar dominantes secundarias o préstamo modal.'),
    ],
    mistakes: ['Analizar acorde a acorde sin ver la frase: la función depende del contexto.', 'Imponer una única lectura: en ocasiones hay dos análisis defendibles y lo importante es justificarlos.'],
  }),

  L({
    id: 'n3-02', order: 2, title: 'Conducción de voces: tipos de movimiento y notas comunes', minutes: 22, prerequisites: ['n3-01'], covers: ['N3.2', 'N3.3', 'N3.4'],
    objective: 'Encadenar acordes moviendo cada voz lo mínimo y distinguir movimiento contrario, paralelo y oblicuo.',
    blocks: [
      { type: 'text', title: 'Cada nota es una melodía', body: 'La **conducción de voces** (*voice leading*) trata cada nota de un acorde como una melodía propia que debe ser cantable. Principios generales:\n\n- **Conserva las notas comunes** entre acordes: se quedan quietas.\n- Mueve las demás por **grado conjunto** (a la nota más cercana) o salto pequeño.\n- Evita saltos grandes simultáneos en todas las voces: suenan como «bloques» que saltan.\n\n**Tipos de movimiento** entre dos voces:\n\n- **Paralelo**: suben o bajan a la vez manteniendo el mismo intervalo.\n- **Contrario**: una sube y la otra baja (da independencia).\n- **Oblicuo**: una se queda y la otra se mueve.\n\n**Estilo clásico:** se evitan las quintas y octavas paralelas entre voces. **Pop y jazz:** son habituales (acordes de potencia, bloques paralelos) y se usan como color.' },
      customExample('Mal: todo salta', 'C → F con todas las voces subiendo a la vez (movimiento paralelo y muchos saltos): Do–Mi–Sol → Fa–La–Do.', [
        { notes: ['C4', 'E4', 'G4'], beats: 2 }, { notes: ['F4', 'A4', 'C5'], beats: 2 },
      ], 76, undefined, 'C → F (todo salta)'),
      customExample('Bien: nota común', 'C → F conservando el Do: Do–Mi–Sol → Do–Fa–La. Solo dos voces se mueven, por grado conjunto.', [
        { notes: ['C4', 'E4', 'G4'], beats: 2 }, { notes: ['C4', 'F4', 'A4'], beats: 2 },
      ], 76, undefined, 'C → F/C (movimiento mínimo)'),
      customExample('Movimiento contrario', 'El bajo desciende (Do → Si) mientras el soprano asciende (Mi → Sol) en C → G/B.', [
        { notes: ['C3', 'G4', 'E5'], beats: 2 }, { notes: ['B2', 'D5', 'G5'], beats: 2 },
      ], 76, undefined, 'C → G/B'),
      customExample('Quintas paralelas', 'Do–Sol y Re–La suenan huecas y las voces pierden independencia. En un coral clásico se evitan; en el rock se buscan.', [
        { notes: ['C3', 'G3'], beats: 1.5 }, { notes: ['D3', 'A3'], beats: 1.5 },
      ], 76),
      { type: 'callout', kind: 'style', title: 'No es un dogma', body: 'Las reglas de paralelismo vienen de la armonía a cuatro voces del Barroco y el Clasicismo. En música moderna los bloques paralelos son un recurso estilístico legítimo; lo importante es saber si lo haces a propósito.' },
    ],
    practiceTip: 'Toca I–IV–V–I en Do mayor primero con las tres notas saltando a la posición fundamental cada vez, y después con la menor distancia posible. Cuenta los semitonos que se mueve cada dedo en cada versión.',
    practice: [{ gen: 'voice-leading', count: 6, difficulty: 1 }],
    quiz: [
      Q('¿Qué es una nota común entre dos acordes?', ['Una nota que pertenece a ambos acordes', 'La fundamental de cada uno', 'La nota más aguda', 'Una nota repetida en la octava'], 0, 'Las notas comunes se mantienen para dar continuidad.'),
      Q('Cuando una voz sube y otra baja, el movimiento es…', ['Contrario', 'Paralelo', 'Oblicuo', 'Directo'], 0, 'Direcciones opuestas = movimiento contrario.'),
      Q('Cuando una voz se mantiene y otra se mueve, el movimiento es…', ['Oblicuo', 'Contrario', 'Paralelo', 'Estático'], 0, 'Una se queda y la otra se mueve: oblicuo.'),
    ],
    mistakes: ['Mover todas las voces a la vez al cambiar de acorde.', 'Aplicar «prohibido las quintas paralelas» a cualquier estilo: pertenece a contextos clásicos concretos.'],
  }),

  L({
    id: 'n3-03', order: 3, title: 'Voicings: abiertos, cerrados y la relación bajo–melodía', minutes: 20, prerequisites: ['n3-02'], covers: ['N3.5', 'N3.6', 'N3.7'],
    objective: 'Elegir la distribución de un acorde (cerrada o abierta) y cuidar las voces extremas, bajo y melodía.',
    blocks: [
      { type: 'text', title: 'Distribuir un acorde', body: 'Un **voicing** es la forma concreta de repartir las notas de un acorde por el teclado.\n\n- **Posición cerrada**: las notas están lo más juntas posible dentro de una octava.\n- **Posición abierta**: se separan más de una octava; las voces respiran y el sonido es más amplio y sonoro (típico de la mano izquierda + derecha en piano).\n\nLas **voces extremas** (bajo y soprano) son lo que más se oye. El **bajo** da la sensación de base y debe ser coherente; la **melodía** (soprano) debe ser la línea más cantable. Cuida que ambas se muevan con sentido y, a ser posible, en movimiento contrario.' },
      chordExample('Do mayor cerrado', `${N('C4')} ${N('E4')} ${N('G4')}: todas las notas en una octava.`, 'C', 'maj'),
      customExample('Do mayor abierto', `${N('C3')} ${N('G3')} ${N('E4')}: fundamental y quinta en la izquierda, tercera en la derecha. Suena más rico y ancho.`, [{ notes: ['C3', 'G3', 'E4'], beats: 3 }], 80, ['C3', 'G3', 'E4'], 'C abierto'),
      customExample('Cerrado frente a abierto', 'Escucha primero el acorde cerrado en el registro medio y después el mismo acorde abierto en dos manos.', [
        { notes: ['C4', 'E4', 'G4'], beats: 2 }, { notes: ['C3', 'G3', 'E4'], beats: 2 },
      ], 76),
      progExample('Bajo y melodía en contrario', 'C – G/B – Am: el bajo desciende Do–Si–La y la melodía sube. La línea de bajo canta por sí misma.', ['I', 'V', 'vi'], { tonic: 'C', mode: 'major' }),
      { type: 'callout', kind: 'tip', title: 'Regla práctica', body: 'No pongas terceras ni intervalos pequeños muy abajo del teclado (entre Do1 y Do2 suenan turbias). Abre más cuanto más grave toques.' },
    ],
    practiceTip: 'Toca la misma progresión (I–vi–IV–V) tres veces: primero en posición cerrada, después abierta, y la tercera con el bajo en octava. Escucha qué versión resulta más «piano de balada».',
    practice: [{ gen: 'voice-leading', count: 4, difficulty: 2 }, { gen: 'inversion-id', count: 3, difficulty: 2 }],
    quiz: [
      Q('Una distribución abierta es la que…', ['Separa las voces más de una octava', 'Pone todas las notas juntas', 'Duplica la melodía', 'Elimina el bajo'], 0, 'Abierta = las notas se reparten en un registro amplio.'),
      Q('Las voces que más se perciben en un acorde son…', ['Las extremas (bajo y soprano)', 'Las centrales', 'La tercera', 'Ninguna'], 0, 'Bajo y voz superior definen la percepción de la textura.'),
    ],
    mistakes: ['Tocar tríadas cerradas en el registro grave: suena turbio, deben abrirse.', 'Descuidar la melodía superior: aunque no sea «la melodía», debe ser una línea musical.'],
  }),

  L({
    id: 'n3-04', order: 4, title: 'Dominantes y sensibles secundarias', minutes: 22, prerequisites: ['n3-01', 'n2-03'], covers: ['N3.8', 'N3.9'],
    objective: 'Construir y analizar dominantes secundarias (V7/x) y sensibles secundarias (vii°7/x).',
    blocks: [
      { type: 'text', title: 'Un acorde que ayuda a otro', body: 'Cualquier acorde mayor o menor de la tonalidad puede «recibir» su propia dominante. Una **dominante secundaria** es el acorde de séptima de dominante *del acorde al que va a resolver*: **V7/x** (leído «dominante de x»).\n\n- En Do mayor, **D7** (V7/V) resuelve en G; **A7** (V7/ii) resuelve en Dm; **E7** (V7/vi) resuelve en Am; **C7** (V7/IV) resuelve en F.\n- La **sensible secundaria** (vii°7/x) es el acorde disminuido de séptima construido sobre la sensible del acorde-objetivo: **F♯dim7** (vii°7/V) resuelve en G.\n\nLa alteración (Do♯ en A7, Fa♯ en D7…) es la **sensible** del acorde-objetivo, y es lo que da el empuje.' },
      progExample('V7/V → V → I', 'C – D7 – G – C: D7 es la dominante de Sol. Después Sol hace su trabajo normal.', ['I', 'V7/V', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('V7/ii → ii → V7 → I', 'C – A7 – Dm – G7 – C: una cadena de dominantes que sube la tensión.', ['I', 'V7/ii', 'ii', 'V7', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Sensible secundaria', 'C – F♯dim7 – G – C: F♯dim7 (vii°7/V) conduce al acorde de dominante.', ['I', 'vii°7/V', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      chordExample('Un A7 en Do mayor', `${N('A')} ${N('C#')} ${N('E')} ${N('G')}: el ${N('C#')} no pertenece a Do mayor; es la sensible de Re.`, 'A', '7'),
      tryChord('Toca D7, la dominante secundaria V7/V de Do mayor.', 'D', '7'),
      tryChord('Toca E7, la dominante de La menor (V7/vi en Do mayor).', 'E', '7'),
    ],
    practiceTip: 'Elige un acorde diatónico (ii, iii, IV, V, vi), calcula su dominante (una 5ª arriba) y toca la pareja V7/x → x. Después encadénalas: vuelve a tocar I–V7/vi–vi–V7/ii–ii–V7–I.',
    practice: [{ gen: 'secondary-dominant', count: 5, difficulty: 1 }, { gen: 'secondary-dominant', count: 3, difficulty: 2 }],
    quiz: [
      Q('En Do mayor, ¿cuál es V7/ii?', ['A7', 'E7', 'D7', 'B7'], 0, 'ii = Re menor; su dominante es La7.'),
      Q('El acorde D7 en Do mayor se analiza como…', ['V7/V', 'V7/IV', 'ii7', 'II'], 0, 'Es la dominante de Sol (V): su tercera es Fa♯.'),
      Q('La sensible secundaria de Sol es…', ['Fa♯', 'Fa', 'Sol♯', 'Mi'], 0, 'El Fa♯ es la sensible de Sol: fundamento de F♯dim7.'),
    ],
    mistakes: ['Llamar V7/IV al acorde Fa7: V7/IV es C7 (Do7), la dominante de F.', 'Resolver una dominante secundaria sin ir a su objetivo: pierde su sentido.'],
  }),

  L({
    id: 'n3-05', order: 5, title: 'Intercambio modal y acordes prestados', minutes: 20, prerequisites: ['n3-01', 'n2-07'], covers: ['N3.10', 'N3.11'],
    objective: 'Tomar acordes prestados del modo paralelo (mayor ↔ menor) y reconocer su efecto expresivo.',
    blocks: [
      { type: 'text', title: 'Pedir prestado al modo menor', body: 'Do mayor y Do menor comparten tónica: son modos **paralelos**. El **intercambio modal** consiste en tomar acordes de uno para usarlos en el otro.\n\nAcordes más prestados en Do mayor (desde Do menor natural): **iv** (Fm), **♭VI** (A♭), **♭VII** (B♭), **♭III** (E♭), **ii°**, **i** (Cm).\n\nEfecto:\n\n- **iv**: añade melancolía a un IV brillante (la famosa «cadencia plagal menor»).\n- **♭VII**: aire rockero o épico (I–♭VII–IV).\n- **♭VI**: dramatismo («cadencia de cine»).' },
      progExample('I – IV – iv – I', 'C – F – Fm – C: la tercera de Fa baja de La a La♭ y el ánimo cambia al instante.', ['I', 'IV', 'iv', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('I – ♭VII – IV – I', 'C – B♭ – F – C: sonido de rock y country-rock.', ['I', 'bVII', 'IV', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('I – ♭VI – ♭VII – I', 'C – A♭ – B♭ – C: cadencia triunfante, muy usada en cine y videojuegos.', ['I', 'bVI', 'bVII', 'I'], { tonic: 'C', mode: 'major' }),
      { type: 'callout', kind: 'note', title: 'Cómo escribirlo', body: 'Los acordes prestados se indican con alteraciones: **♭VII**, **♭VI** (acorde construido sobre el grado bajado), y **iv** en minúscula (el cuarto grado en modo menor).' },
      tryChord('Toca Fa menor (iv de Do mayor): Fa, La♭, Do.', 'F', 'min'),
      tryChord('Toca Si♭ mayor (♭VII de Do mayor).', 'Bb', 'maj'),
    ],
    practiceTip: 'Toma I–IV–V–I y sustituye el IV por iv. Después sustituye el V por ♭VII–I. Escucha cada versión con atención al cambio de color emocional.',
    practice: [{ gen: 'degree-function', count: 3, difficulty: 3 }, { gen: 'progression-analysis', count: 3, difficulty: 2 }],
    quiz: [
      Q('El acorde iv en Do mayor es…', ['Fa menor', 'Fa mayor', 'Sol menor', 'Si♭ mayor'], 0, 'iv minúscula = Fa menor (prestado de Do menor).'),
      Q('El ♭VII en Do mayor es…', ['Si♭ mayor', 'Si mayor', 'La♭ mayor', 'Si♭ menor'], 0, 'Se construye sobre Si♭, séptimo grado bajado.'),
      Q('Dos modos paralelos son…', ['Do mayor y Do menor', 'Do mayor y La menor', 'Do mayor y Sol mayor', 'Do mayor y Re menor'], 0, 'Paralelos: misma tónica, distinto modo. Relativos: misma armadura.'),
    ],
    mistakes: ['Confundir paralelo con relativo: Do mayor/La menor son relativos; Do mayor/Do menor son paralelos.', 'Escribir ♭VII como «VII♭»: el bemol va delante del número.'],
  }),

  L({
    id: 'n3-06', order: 6, title: 'Tonicalización y modulación', minutes: 20, prerequisites: ['n3-04'], covers: ['N3.12'],
    objective: 'Diferenciar tonicalizar (un acorde) de modular (cambiar de tonalidad) y construir una modulación por acorde pivote.',
    blocks: [
      { type: 'text', title: 'Dos escalas de «cambio de centro»', body: '- **Tonicalizar**: tratar un acorde como si fuera tónica solo durante un instante, con su dominante (V7/ii → ii). La tonalidad sigue siendo la misma.\n- **Modular**: cambiar de verdad de tonalidad; el oído acepta una nueva tónica y la música se «reasienta» allí.\n\nEl método más suave es el **acorde pivote** (o común): un acorde que pertenece a *ambas* tonalidades y se lee con distinto número en cada una. Ejemplo C → G: **Am** es vi en Do y ii en Sol; después de Am se toca D7 y se llega a G.\n\nOtros procedimientos: por **dominante** directa (se toca la V7 de la nueva tonalidad), **cromático** (una voz sube o baja medio tono) o **enarmónico**.' },
      chordSeqExample('Modulación Do → Sol por pivote', 'C – F – Am (pivote: vi en Do = ii en Sol) – D7 – G. Las tres primeras definen Do; la dominante D7 confirma Sol.', [['C', 'maj'], ['F', 'maj'], ['A', 'min'], ['D', '7'], ['G', 'maj']]),
      chordSeqExample('Modulación a la relativa menor', 'C – F – G7 – Am – E7 – Am: de Do mayor a La menor; el E7 es la dominante de la nueva tónica.', [['C', 'maj'], ['F', 'maj'], ['G', '7'], ['A', 'min'], ['E', '7'], ['A', 'min']]),
      { type: 'callout', kind: 'tip', title: '¿Tonicalización o modulación?', body: 'Si después del acorde-objetivo la música vuelve rápidamente a la tonalidad original y no hay **cadencia propia** en la nueva, probablemente es una tonicalización. Si se instala y se cierra allí con una cadencia, es una modulación.' },
      tryChord('Toca el acorde pivote Am (vi en Do mayor, ii en Sol mayor).', 'A', 'min'),
    ],
    practiceTip: 'Toca C – F – Am – D7 – G y pregúntate dónde «cambia el suelo». Haz lo mismo hacia Fa mayor (pivote Dm) partiendo de Do.',
    practice: [{ gen: 'secondary-dominant', count: 3, difficulty: 2 }, { gen: 'progression-analysis', count: 3, difficulty: 2 }],
    quiz: [
      Q('Un acorde pivote es…', ['Un acorde común a las dos tonalidades', 'Un acorde de séptima disminuida', 'El primero de la nueva tonalidad', 'Un acorde con cuarta aumentada'], 0, 'Pertenece a ambas tonalidades y las conecta.'),
      Q('Tonicalizar un acorde significa…', ['Tratarlo momentáneamente como tónica', 'Cambiar para siempre de tonalidad', 'Sustituirlo por I', 'Transponerlo'], 0, 'Se preparan con su dominante, pero la tonalidad no cambia.'),
    ],
    mistakes: ['Llamar modulación a cualquier dominante secundaria.', 'Modular sin preparar la nueva dominante: el cambio puede parecer arbitrario.'],
  }),

  L({
    id: 'n3-07', order: 7, title: 'Dominantes extendidas y círculo de quintas', minutes: 18, prerequisites: ['n3-04'], covers: ['N3.13', 'N3.14'],
    objective: 'Encadenar dominantes en cascada y recorrer progresiones por quintas descendentes.',
    blocks: [
      { type: 'text', title: 'Cada acorde empuja al siguiente', body: 'La resolución más fuerte de la armonía tonal es la **quinta descendente** (o cuarta ascendente): la fundamental del primer acorde es la 5ª del siguiente. Cadenas de quintas descendentes crean una sensación de movimiento imparable.\n\n**Diatónico (círculo de quintas en la tonalidad):** I – IV – vii° – iii – vi – ii – V – I. En Do: Cmaj7 – Fmaj7 – Bm7♭5 – Em7 – Am7 – Dm7 – G7 – Cmaj7.\n\n**Dominantes extendidas:** cada acorde se convierte en dominante del siguiente: III7 – VI7 – II7 – V7 – I. En Do: E7 – A7 – D7 – G7 – C. Todas, salvo la última, son dominantes secundarias.' },
      progExample('Círculo diatónico', 'Cmaj7 – Fmaj7 – Bm7♭5 – Em7 – Am7 – Dm7 – G7 – Cmaj7: cada raíz baja una quinta.', ['Imaj7', 'IVmaj7', 'viiø7', 'iii7', 'vi7', 'ii7', 'V7', 'Imaj7'], { tonic: 'C', mode: 'major' }, 1.5),
      chordSeqExample('Dominantes extendidas', 'E7 – A7 – D7 – G7 – Cmaj7: la «cadena de dominantes» típica del ragtime y del jazz.', [['E', '7'], ['A', '7'], ['D', '7'], ['G', '7'], ['C', 'maj7']], 1.5),
      { type: 'callout', kind: 'tip', title: 'Truco de memoria', body: 'Piensa en el círculo de quintas en sentido contrario a las agujas del reloj, de la tónica hacia atrás: C – F – B♭ – E♭… o, diatónicamente, Fa – Si (disminuido) – Mi – La – Re – Sol – Do.' },
      tryChord('Toca E7, el comienzo de la cadena de dominantes en Do mayor.', 'E', '7'),
    ],
    practiceTip: 'Toca la cadena E7 – A7 – D7 – G7 – C en Do y en Sol mayor. Cuida la conducción: siempre hay una nota común o un grado conjunto de un acorde al siguiente.',
    practice: [{ gen: 'complete-progression', count: 4, difficulty: 2 }, { gen: 'progression-analysis', count: 3, difficulty: 2 }],
    quiz: [
      Q('En una progresión por quintas descendentes la fundamental…', ['Baja una quinta (o sube una cuarta)', 'Sube una tercera', 'Se mantiene', 'Baja un tono'], 0, 'Do → Fa → Si♭…'),
      Q('E7 – A7 – D7 – G7 – C es…', ['Una cadena de dominantes', 'Una modulación a Mi', 'Un intercambio modal', 'Una cadencia plagal'], 0, 'Cada acorde es dominante del siguiente.'),
    ],
    mistakes: ['Pensar que todas las dominantes extendidas son diatónicas: casi todas contienen notas ajenas.', 'Tocar los acordes en estado fundamental con salto de quinta cada vez: usa inversiones para suavizar.'],
  }),

  L({
    id: 'n3-08', order: 8, title: 'Notas ajenas y relación entre melodía y armonía', minutes: 22, prerequisites: ['n3-03'], covers: ['N3.15', 'N3.16'],
    objective: 'Distinguir notas reales de notas ajenas (paso, bordadura, retardo, apoyatura) y ajustar la armonía a una melodía.',
    blocks: [
      { type: 'text', title: 'Notas reales y notas ajenas', body: 'En una melodía sobre un acorde, algunas notas pertenecen al acorde (**notas reales**) y otras no (**notas ajenas**), que crean tensión momentánea y siempre se resuelven:\n\n- **Nota de paso**: une por grado conjunto dos notas reales. (Do–**Re**–Mi sobre Do mayor).\n- **Bordadura**: sale de una nota real, va a la vecina y regresa (Mi–**Re**–Mi).\n- **Retardo**: una nota del acorde anterior se mantiene sobre el nuevo y luego resuelve (Fa sobre Do → Mi; el **4-3**).\n- **Apoyatura**: nota ajena que cae en tiempo fuerte y resuelve por grado conjunto.\n\n**Armonizar una melodía**: la nota fuerte (tiempo fuerte, nota larga) suele ser nota real del acorde; las notas ajenas deben resolverse por grado conjunto. Si cambias el acorde, comprueba qué notas pasan a ser reales o ajenas.' },
      customExample('Nota de paso', `Sobre ${C('C')}, melodía Mi–Re–Do. El ${N('D')} es de paso: no es del acorde y une dos notas reales.`, [
        { notes: ['C3', 'E4'], beats: 1 }, { notes: ['D4'], beats: 1 }, { notes: ['C4'], beats: 2 },
      ], 80, ['E4', 'D4', 'C4'], 'Nota de paso'),
      customExample('Bordadura', 'Mi–Fa–Mi sobre Do mayor: el Fa sale y vuelve a Mi.', [
        { notes: ['C3', 'E4'], beats: 1 }, { notes: ['F4'], beats: 1 }, { notes: ['E4'], beats: 2 },
      ], 80, ['E4', 'F4', 'E4'], 'Bordadura'),
      customExample('Retardo 4–3', 'Sobre G, la nota Do (4ª) se retiene y baja a Si (3ª): tensión y resolución.', [
        { notes: ['G2', 'D4', 'C5'], beats: 2 }, { notes: ['G2', 'D4', 'B4'], beats: 2 },
      ], 76, ['C5', 'B4'], 'Retardo 4–3'),
      customExample('Apoyatura', 'La melodía cae en tiempo fuerte sobre una nota ajena (Re sobre Do) y resuelve a Do.', [
        { notes: ['C3', 'D5'], beats: 1 }, { notes: ['C5'], beats: 2 },
      ], 80, ['D5', 'C5'], 'Apoyatura'),
      customExample('Una melodía, dos armonizaciones', 'Melodía Mi–Mi–Re–Do. Primera versión: C – C – G – C. Segunda: C – Am – G7 – C. El acorde de apoyo cambia el carácter sin tocar la melodía.', [
        { notes: ['C3', 'E4'], beats: 1 }, { notes: ['E4'], beats: 1 }, { notes: ['G2', 'D4'], beats: 1 }, { notes: ['C3', 'C4'], beats: 1 },
        { notes: ['C3', 'E4'], beats: 1 }, { notes: ['A2', 'E4'], beats: 1 }, { notes: ['G2', 'D4'], beats: 1 }, { notes: ['C3', 'C4'], beats: 1 },
      ], 90),
    ],
    practiceTip: 'Toma una melodía sencilla de cuatro compases. Subraya las notas de los tiempos fuertes: deberían ser notas reales de tu acorde. Si una no lo es, cambia el acorde o conviértela en nota ajena resuelta.',
    practice: [{ gen: 'chord-id', count: 3, difficulty: 2 }],
    quiz: [
      Q('Una nota que une por grado conjunto dos notas reales distintas es una nota de…', ['Paso', 'Bordadura', 'Retardo', 'Apoyatura'], 0, 'La nota de paso conecta dos notas reales.'),
      Q('Una bordadura…', ['Sale de una nota real, va a la vecina y vuelve', 'Cae en tiempo fuerte y resuelve hacia abajo', 'Se queda del acorde anterior', 'Es una nota del acorde'], 0, 'Va y vuelve a la misma nota real.'),
      Q('El retardo 4–3 sobre un acorde de Sol consiste en…', ['Mantener Do y bajar a Si', 'Subir Fa a Sol', 'Mantener Re y subir a Mi', 'Cambiar de acorde'], 0, 'La cuarta (Do) retarda la tercera (Si) y se resuelve bajando.'),
      Q('Las notas ajenas se suelen resolver…', ['Por grado conjunto', 'Con saltos grandes', 'No se resuelven', 'Siempre hacia arriba'], 0, 'Habitualmente por grado conjunto a una nota real.'),
    ],
    mistakes: ['Tratar cualquier nota que no esté en el acorde como un error: las notas ajenas dan expresión.', 'No resolver la nota ajena: si queda sin resolver suena «equivocada».'],
  }),

  L({
    id: 'n3-09', order: 9, title: 'Introducción a la reharmonización', minutes: 18, prerequisites: ['n3-08', 'n3-04'], covers: ['N3.17'],
    objective: 'Cambiar los acordes de una progresión conservando la melodía mediante sustituciones sencillas.',
    blocks: [
      { type: 'text', title: 'Misma melodía, otros acordes', body: '**Reharmonizar** es cambiar los acordes que acompañan una melodía sin cambiar la melodía. Las técnicas de partida:\n\n1. **Sustituir por función**: vi o iii por I; ii por IV; vii° por V7.\n2. **Añadir un ii** antes de cada dominante (V7 → ii7–V7).\n3. **Añadir dominantes secundarias** antes de cualquier acorde (V7/x → x).\n4. **Intercambio modal** en algún acorde (IV → iv).\n5. **Acordes de paso** que unen dos acordes con el bajo en grados conjuntos.\n\nSiempre se comprueba la melodía: si una nota fuerte deja de ser real del nuevo acorde, quizá sirva como tensión disponible; si suena mal, descarta la sustitución.' },
      progExample('Original', 'C – F – G – C.', ['I', 'IV', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Con ii–V', 'C – F – Dm7 – G7 – C: se añade un ii antes de la dominante.', ['I', 'IV', 'ii7', 'V7', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Con dominante secundaria', 'C – E7 – Am – F – G – C: se añade un E7 (V7/vi) y se sustituye el primer cambio.', ['I', 'V7/vi', 'vi', 'IV', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Con préstamo modal', 'C – F – Fm – C: se oscurece la segunda aparición del IV.', ['I', 'IV', 'iv', 'I'], { tonic: 'C', mode: 'major' }),
      { type: 'callout', kind: 'style', title: 'Hay más de una solución', body: 'No existe «la mejor reharmonización». Dos músicos competentes pueden armonizar la misma melodía de maneras muy distintas y ambas ser válidas; el criterio es el estilo, la nota de la melodía y el efecto que buscas.' },
    ],
    practiceTip: 'Escribe la melodía de una canción sencilla con su armonía original. Crea tres versiones: una con ii–V, otra con dominantes secundarias y otra con intercambio modal. Grábate y compara.',
    practice: [{ gen: 'complete-progression', count: 4, difficulty: 2 }, { gen: 'progression-analysis', count: 3, difficulty: 2 }],
    quiz: [
      Q('¿Qué conserva una reharmonización?', ['La melodía', 'Los acordes', 'El bajo', 'El ritmo del bajo'], 0, 'Cambian los acordes; la melodía permanece.'),
      Q('¿Cuál es una sustitución por función de I?', ['vi', 'V', 'IV', 'vii°'], 0, 'vi comparte dos notas con I y funciona como tónica.'),
    ],
    mistakes: ['Sustituir por gusto sin mirar la melodía: la nota larga de la melodía debe seguir funcionando.', 'Sobrecargar de acordes: un cambio por pulso puede quitar el sentido de la frase.'],
  }),

  L({
    id: 'n3-10', order: 10, title: 'Patrones de acompañamiento: pop, balada y música moderna', minutes: 22, prerequisites: ['n3-03', 'n2-10'], covers: ['N3.18'],
    objective: 'Aplicar patrones rítmicos de acompañamiento de piano habituales en pop, balada y estilos modernos.',
    blocks: [
      { type: 'text', title: 'Cómo suena un estilo', body: 'Un estilo se reconoce más por la **textura** (cómo se reparten las notas en el tiempo) que por los acordes. Tres patrones básicos con la progresión I–V–vi–IV:\n\n- **Pop (acordes en corcheas)**: la mano derecha repite el acorde en corcheas y la izquierda marca el bajo en 1 y 3.\n- **Balada (arpegios)**: la izquierda toca fundamental–quinta–octava; la derecha, el acorde a contratiempo o arpegiado; mucho pedal.\n- **Música moderna**: acordes con sus2/add9, síncopas (ataques a contratiempo) y bajos pedales.\n\nAdemás: pedal de resonancia, dinámica según la letra y un registro claro (graves con bajo, medios con acordes, agudos para la melodía).' },
      customExample('Pop: corcheas', 'C – G – Am – F en corcheas: bajo en 1 y 3, acorde en cada corchea.', (() => {
        const chords: [string, string[]][] = [['C3', ['E4', 'G4', 'C5']], ['G2', ['D4', 'G4', 'B4']], ['A2', ['E4', 'A4', 'C5']], ['F2', ['C4', 'F4', 'A4']]]
        return chords.flatMap(([b, tri]) => [
          { notes: [b, ...tri], beats: 0.5 }, { notes: tri, beats: 0.5 }, { notes: tri, beats: 0.5 }, { notes: tri, beats: 0.5 },
          { notes: [b, ...tri], beats: 0.5 }, { notes: tri, beats: 0.5 }, { notes: tri, beats: 0.5 }, { notes: tri, beats: 0.5 },
        ])
      })(), 100, undefined, 'C – G – Am – F (pop)'),
      customExample('Balada: arpegios', 'La izquierda arpegia (fundamental, quinta, octava) mientras la derecha sostiene el acorde. Suena amplia y emotiva.', (() => {
        const patt: [string, string, string, string[]][] = [['C2', 'G2', 'C3', ['E4', 'G4']], ['G2', 'D3', 'G3', ['D4', 'B4']], ['A2', 'E3', 'A3', ['C4', 'E4']], ['F2', 'C3', 'F3', ['C4', 'A4']]]
        return patt.flatMap(([a, b, c, rh]) => [
          { notes: [a, ...rh], beats: 1 }, { notes: [b], beats: 1 }, { notes: [c], beats: 1 }, { notes: [b], beats: 1 },
        ])
      })(), 72, undefined, 'C – G – Am – F (balada)'),
      customExample('Moderno: síncopa con sus2', 'Acordes con segunda en lugar de tercera y ataques a contratiempo para dar ligereza.', (() => {
        const sync: [string, string[]][] = [['C3', ['D4', 'G4', 'C5']], ['G2', ['A3', 'D4', 'G4']], ['A2', ['B3', 'E4', 'A4']], ['F2', ['G3', 'C4', 'F4']]]
        return sync.flatMap(([b, ch]) => [
          { notes: [b], beats: 1.5 }, { notes: ch, beats: 0.5 }, { notes: ch, beats: 1 }, { notes: [], beats: 1 },
        ])
      })(), 96, undefined, 'Csus2 – Gsus2 – Asus2 – Fsus2 (moderno)'),
      { type: 'callout', kind: 'tip', title: 'Un pedal limpio', body: 'Cambia el pedal en cada cambio de acorde (pisa justo después de tocar el nuevo acorde) para evitar que se mezclen armonías.' },
      tryChord('Toca el acorde de la balada en el compás 3: La menor.', 'A', 'min'),
    ],
    practiceTip: 'Escoge una progresión de cuatro acordes y toca cada patrón durante dos minutos. Cambia de patrón sin cambiar acordes. Esa es la forma más rápida de interiorizar estilos.',
    practice: [{ gen: 'transpose-progression', count: 3, difficulty: 2 }, { gen: 'degree-function', count: 3, difficulty: 2 }],
    quiz: [
      Q('Un patrón de balada típico en la izquierda es…', ['Fundamental–quinta–octava', 'Solo la fundamental en corcheas', 'Acorde completo en blancas', 'Notas sin ritmo'], 0, 'Arpegios amplios en la mano izquierda.'),
      Q('La textura se refiere a…', ['Cómo se distribuyen las notas en el tiempo y el registro', 'Solo al volumen', 'La armadura', 'El cifrado'], 0, 'Textura = disposición de las voces en el tiempo y el espacio.'),
    ],
    mistakes: ['Pisar el pedal sin cambiar con el acorde: la armonía se emborrona.', 'Tocar con la misma intensidad todo el tiempo: el acompañamiento debe acompañar, no tapar la melodía.'],
  }),
]
