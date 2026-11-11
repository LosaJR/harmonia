import { N, R } from '../exercises/rich'
import { chordSeqExample, customExample, noteExample, progExample, Q, tryChord, tryNotes } from './helpers'
import type { Lesson } from './types'

const L = (l: Omit<Lesson, 'level' | 'passScore'> & { passScore?: number }): Lesson => ({ level: 5, passScore: 0.7, ...l })

export const LEVEL5: Lesson[] = [
  L({
    id: 'n5-01', order: 1, title: 'Armonizar una melodía', minutes: 22, prerequisites: ['n3-08', 'n3-09'], covers: ['N5.1'],
    objective: 'Armonizar una melodía corta eligiendo acordes que apoyen sus notas importantes y marquen bien las frases.',
    blocks: [
      { type: 'text', title: 'Un método paso a paso', body: '1. **Encuentra la tonalidad** (armadura, última nota, notas más frecuentes).\n2. **Marca las notas estructurales**: las de los tiempos fuertes y las más largas.\n3. **Decide el ritmo armónico**: cuántas veces cambia el acorde (normalmente 1 por compás o cada dos pulsos).\n4. **Pon las cadencias**: el último compás casi siempre V→I (o IV→I); los finales de frase intermedios, semicadencia o I.\n5. **Rellena** los compases centrales con la función adecuada (T→PD→D).\n6. **Revisa** notas ajenas, el bajo (¿se mueve por grados conjuntos?) y la variedad.\n\nPara cada nota larga de la melodía suelen servir **varios** acordes: Mi sobre un compás puede armonizarse con C (3ª), Am (5ª) o E7 (fundamental, si hay modulación). Elige por función y por gusto.' },
      customExample('Melodía sin armonía', 'Una melodía propia de cuatro compases en Do mayor: Mi–Mi–Re–Do / Re–Mi–Fa–Mi / Sol–Sol–Fa–Re / Mi–Re–Do.', [
        ...['E4', 'E4', 'D4', 'C4', 'D4', 'E4', 'F4', 'E4', 'G4', 'G4', 'F4', 'D4', 'E4', 'D4'].map((n) => ({ notes: [n], beats: 1 })), { notes: ['C4'], beats: 2 },
      ], 96),
      customExample('Primera armonización', 'C – C – F – C / G – C – F – G / C – C – G – G / C – G – C: función clara y cadencia final auténtica.', [
        { notes: ['C3', 'E4'], beats: 1 }, { notes: ['E4'], beats: 1 }, { notes: ['D4'], beats: 1 }, { notes: ['C4'], beats: 1 },
        { notes: ['G2', 'D4'], beats: 1 }, { notes: ['E4'], beats: 1 }, { notes: ['F3', 'F4'], beats: 1 }, { notes: ['E4'], beats: 1 },
        { notes: ['C3', 'G4'], beats: 1 }, { notes: ['G4'], beats: 1 }, { notes: ['G2', 'F4'], beats: 1 }, { notes: ['D4'], beats: 1 },
        { notes: ['C3', 'E4'], beats: 1 }, { notes: ['G2', 'D4'], beats: 1 }, { notes: ['C3', 'C4'], beats: 2 },
      ], 96, undefined, 'Armonización 1'),
      customExample('Segunda armonización', 'Mismas notas, ahora con vi y ii: C – Am – Dm – G / Am – Em – F – G / C – Em – G – G / Am – G – C. Más color, mismos finales de frase.', [
        { notes: ['C3', 'E4'], beats: 1 }, { notes: ['E4'], beats: 1 }, { notes: ['A2', 'D4'], beats: 1 }, { notes: ['A2', 'C4'], beats: 1 },
        { notes: ['D3', 'D4'], beats: 1 }, { notes: ['E4'], beats: 1 }, { notes: ['F3', 'F4'], beats: 1 }, { notes: ['E4'], beats: 1 },
        { notes: ['C3', 'G4'], beats: 1 }, { notes: ['E3', 'G4'], beats: 1 }, { notes: ['G2', 'F4'], beats: 1 }, { notes: ['G2', 'D4'], beats: 1 },
        { notes: ['A2', 'E4'], beats: 1 }, { notes: ['G2', 'D4'], beats: 1 }, { notes: ['C3', 'C4'], beats: 2 },
      ], 96, undefined, 'Armonización 2'),
      { type: 'callout', kind: 'style', title: 'Varias soluciones válidas', body: 'Ninguna de las dos armonizaciones es «la correcta». Elige según el carácter: la primera es más sobria y directa; la segunda es más cálida y movida.' },
    ],
    practiceTip: 'Escribe una melodía de cuatro compases con las notas de Do mayor. Armonízala con acordes en cada compás y toca melodía con la derecha y acordes con la izquierda. Cambia dos acordes y escucha el resultado.',
    practice: [{ gen: 'complete-progression', count: 4, difficulty: 2 }, { gen: 'voice-leading', count: 3, difficulty: 2 }],
    quiz: [
      Q('Al armonizar, ¿qué notas de la melodía deben coincidir con el acorde con más frecuencia?', ['Las de los tiempos fuertes y las notas largas', 'Las más agudas', 'Las del primer compás', 'Las más rápidas'], 0, 'Son las que definen la armonía percibida.'),
      Q('La cadencia más habitual al final de la melodía es…', ['V → I', 'ii → iii', 'I → ii', 'vi → iii'], 0, 'Cadencia auténtica: cierre claro.'),
    ],
    mistakes: ['Cambiar de acorde con cada nota de la melodía: el ritmo armónico es más lento que el melódico.', 'Armonizar sin pensar en el bajo: una buena línea de bajo mejora cualquier armonización.'],
  }),

  L({
    id: 'n5-02', order: 2, title: 'Crear progresiones originales y componer desde una tonalidad', minutes: 24, prerequisites: ['n5-01', 'n3-05'], covers: ['N5.2', 'N5.3'],
    objective: 'Diseñar progresiones propias con intención y organizarlas en una forma musical sencilla.',
    blocks: [
      { type: 'text', title: 'Una receta para empezar', body: 'Componer desde una tonalidad no es esperar inspiración: es **tomar decisiones** con un plan.\n\n1. **Elige el tono y el modo** (por registro vocal, carácter, comodidad).\n2. **Elige un punto de partida**: casi siempre I (o vi si quieres sonido de balada).\n3. **Diseña la tensión**: dónde está el clímax (normalmente V o un acorde de color) y dónde se resuelve.\n4. **Mezcla estabilidad y sorpresa**: dos acordes previsibles, un acorde con color (V7/vi, iv, ♭VII, sus4…).\n5. **Cierra con una cadencia** clara.\n\n**Formas habituales**: *AABA* (32 compases), *estrofa–estribillo*, *blues de 12 compases*. Alternar compases de reposo y de movimiento (ritmo armónico variable) da sensación de respiración.' },
      progExample('Sección A (8 compases)', 'C – Am – F – G / C – E7 – Am – G: dominante secundaria (E7) en el compás 6 para dar impulso hacia vi.', ['I', 'vi', 'IV', 'V', 'I', 'V7/vi', 'vi', 'V'], { tonic: 'C', mode: 'major' }),
      progExample('Sección B (contraste)', 'F – Fm – C – C / Dm7 – G7 – Cmaj7: el préstamo modal (iv) da un giro emocional y vuelve a la tónica por ii–V–I.', ['IV', 'iv', 'I', 'I', 'ii7', 'V7', 'Imaj7'], { tonic: 'C', mode: 'major' }),
      chordSeqExample('Un blues de 12 compases', 'C7 – F7 – C7 – C7 / F7 – F7 – C7 – C7 / G7 – F7 – C7 – G7: la forma ternaria más popular. Aquí, resumido por acordes.', [['C', '7'], ['F', '7'], ['C', '7'], ['G', '7']], 4),
      { type: 'callout', kind: 'tip', title: 'Herramienta', body: 'Usa el **Laboratorio** (constructor de progresiones) para probar ideas: elige tonalidad, añade romanos, cambia el orden, escucha y guarda. Todo lo que guardes se conserva en tu equipo.' },
    ],
    practiceTip: 'Compón en 10 minutos una sección A de ocho compases y una B de cuatro. Impón dos restricciones: una dominante secundaria y un acorde prestado. Guárdala en el Laboratorio.',
    practice: [{ gen: 'progression-analysis', count: 4, difficulty: 3 }, { gen: 'degree-function', count: 3, difficulty: 3 }],
    quiz: [
      Q('La forma AABA contiene…', ['Dos secciones iguales, un contraste y la primera de nuevo', 'Cuatro secciones distintas', 'Solo estrofa y estribillo', 'Una sola sección'], 0, 'A se repite, B contrasta y vuelve A.'),
      Q('Un buen punto de partida para una progresión es…', ['Una tónica clara', 'Un acorde disminuido', 'Una dominante secundaria', 'Un acorde aumentado'], 0, 'Fijar la tonalidad primero ayuda al oído.'),
    ],
    mistakes: ['Empezar sin tonalidad definida: el oyente necesita un centro.', 'Abusar del color: si todos los acordes son sorprendentes, ninguno lo es.'],
  }),

  L({
    id: 'n5-03', order: 3, title: 'Improvisar sobre acordes y desarrollar motivos', minutes: 26, prerequisites: ['n4-06', 'n3-08'], covers: ['N5.4', 'N5.5'],
    objective: 'Improvisar melodías que respeten la armonía usando notas del acorde, escalas y desarrollo de motivos.',
    blocks: [
      { type: 'text', title: 'De los acordes a la melodía', body: 'Improvisar es componer en tiempo real: necesitas pocos recursos bien dominados.\n\n1. **Notas del acorde (arpegios)**: aterriza en 3ª o 7ª en el tiempo fuerte; suena clarísimo.\n2. **Notas guía (*guide tones*)**: la 3ª y la 7ª definen el acorde. En ii–V–I, la 7ª de ii (Do) baja a la 3ª de V (Si) y de ahí a la 3ª de I (Mi)… o la 3ª de ii (Fa) baja a la 7ª de V (Fa, común) y luego a la 3ª de I (Mi).\n3. **Escala del acorde** para conectar (dórica, mixolidia…).\n4. **Aproximaciones cromáticas** a las notas objetivo.\n\n**Desarrollo de motivos**: un **motivo** de 3–5 notas se vuelve melodía cuando lo **repites**, lo **secuencias** (mismo dibujo a otra altura), lo **inviertes**, lo **cambias de ritmo** o lo **acortas**. La coherencia viene de la repetición con variación.' },
      customExample('Notas guía de un ii–V–I', 'Dm7 (Fa) – G7 (Fa) – Cmaj7 (Mi): línea de terceras y séptimas que se mueve por semitono.', [
        { notes: ['D3', 'F4'], beats: 2 }, { notes: ['G2', 'F4'], beats: 2 }, { notes: ['C3', 'E4'], beats: 4 },
      ], 80, ['F4', 'F4', 'E4'], 'Dm7 – G7 – Cmaj7'),
      noteExample('Motivo original', 'Tres notas con ritmo: Mi–Sol–Fa / Mi (una pregunta musical).', ['E4', 'G4', 'F4', 'E4'], 'melody', 0.5),
      customExample('Motivo secuenciado', 'El mismo dibujo (subir una tercera y bajar un grado) repetido sobre Dm7 y luego G7.', [
        { notes: ['D3', 'F4'], beats: 0.5 }, { notes: ['A4'], beats: 0.5 }, { notes: ['G4'], beats: 0.5 }, { notes: ['F4'], beats: 1.5 },
        { notes: ['G2', 'D4'], beats: 0.5 }, { notes: ['F4'], beats: 0.5 }, { notes: ['E4'], beats: 0.5 }, { notes: ['D4'], beats: 1.5 },
      ], 90),
      { type: 'callout', kind: 'tip', title: 'Menos es más', body: 'Antes de tocar rápido, toca cuatro notas con intención. Deja silencios. La respiración hace que una improvisación suene a frase y no a ejercicio.' },
      tryChord('Toca el acorde G7 y busca la 7ª (Fa): es la nota guía del ii–V–I.', 'G', '7'),
    ],
    practiceTip: 'Con la mano izquierda tocando Dm7 – G7 – Cmaj7, improvisa con la derecha usando solo estas reglas: (1) en los tiempos fuertes, notas del acorde; (2) repite un motivo; (3) termina cada frase en una nota guía.',
    practice: [{ gen: 'chord-id', count: 3, difficulty: 3 }, { gen: 'scale-build', count: 3, difficulty: 3, params: { scales: ['dorian', 'mixolydian'], tonics: ['D', 'G', 'C', 'A', 'E'] } }],
    quiz: [
      Q('Las notas guía de un acorde son…', ['La tercera y la séptima', 'La fundamental y la quinta', 'La novena y la undécima', 'Todas las notas'], 0, 'Definen la calidad y la función del acorde.'),
      Q('Un motivo se desarrolla mediante…', ['Repetición, secuencia, inversión y variación rítmica', 'Aumentando el volumen', 'Cambiando de tonalidad', 'Tocándolo más rápido'], 0, 'La coherencia nace de repetir con variaciones.'),
    ],
    mistakes: ['Subir y bajar escalas sin dirección: sin motivo no hay frase.', 'Ignorar el acorde: si cambias de acorde, las notas objetivo también cambian.'],
  }),

  L({
    id: 'n5-04', order: 4, title: 'Acompañar en distintos estilos y arreglar para piano solo', minutes: 24, prerequisites: ['n3-10', 'n4-04'], covers: ['N5.6', 'N5.7'],
    objective: 'Adaptar un acompañamiento a un estilo y organizar melodía, armonía y bajo para piano solo.',
    blocks: [
      { type: 'text', title: 'Estilos', body: '- **Vals/jazz vals (3/4)**: bajo en 1, acordes en 2 y 3.\n- **Bossa nova (4/4)**: bajo fundamental–quinta sincopado, acordes cortos con extensiones (maj7, m7, 7, 9).\n- **Stride**: izquierda salta bajo–acorde–bajo–acorde.\n- **Gospel/balada**: acordes llenos con 9as y sus4, arpegios, pedal amplio.\n\n**Arreglo para piano solo** (tres capas): **melodía** arriba (la voz más aguda), **armonía** en medio (voicings abiertos o rootless), **bajo** debajo (fundamental o línea). La mano derecha toca melodía + 1–2 notas del acorde debajo; la izquierda, bajo + 3ª/7ª si hace falta. Mantén un registro claro y evita duplicar notas en el medio.' },
      customExample('Bossa nova', 'Bajo fundamental–quinta sincopado y acorde corto. Dm7 – G7 – Cmaj7.', (() => {
        const bar = (bass1: string, bass2: string, ch: string[]) => [
          { notes: [bass1], beats: 1.5 }, { notes: [...ch, bass2], beats: 1.5 }, { notes: ch, beats: 0.5 }, { notes: [], beats: 0.5 },
        ]
        return [...bar('D3', 'A3', ['F4', 'C5', 'E5']), ...bar('G2', 'D3', ['F4', 'B4', 'E5']), ...bar('C3', 'G3', ['E4', 'B4', 'D5'])]
      })(), 120, undefined, 'Dm7 – G7 – Cmaj7 (bossa)'),
      customExample('Stride', 'Izquierda: bajo (tiempo 1 y 3) y acorde (2 y 4); derecha: melodía.', [
        { notes: ['C2', 'E5'], beats: 1 }, { notes: ['E3', 'G3', 'C4', 'G5'], beats: 1 }, { notes: ['G2', 'E5'], beats: 1 }, { notes: ['E3', 'G3', 'C4', 'D5'], beats: 1 },
        { notes: ['F2', 'C5'], beats: 1 }, { notes: ['F3', 'A3', 'C4', 'C5'], beats: 1 }, { notes: ['G2', 'D5'], beats: 1 }, { notes: ['F3', 'B3', 'D4', 'D5'], beats: 1 },
      ], 130, undefined, 'Stride'),
      customExample('Piano solo en tres capas', 'Melodía arriba (Mi–Re–Do), acordes en el centro (Do, Sol/Si, La menor) y bajo en grados conjuntos (Do–Si–La).', [
        { notes: ['C2', 'G3', 'E4', 'E5'], beats: 2 }, { notes: ['B1', 'G3', 'D4', 'D5'], beats: 2 }, { notes: ['A1', 'E3', 'C4', 'C5'], beats: 4 },
      ], 72, undefined, 'Arreglo solista'),
      { type: 'callout', kind: 'style', title: 'Contexto', body: 'Cada estilo tiene su vocabulario rítmico y de acordes. Escucha mucho antes de imitar: lo difícil no es la nota, es el **groove**.' },
    ],
    practiceTip: 'Elige una canción de tres acordes y arréglala de tres modos distintos (vals, bossa, balada). Mantén la melodía idéntica y cambia solo la textura.',
    practice: [{ gen: 'transpose-progression', count: 3, difficulty: 2 }, { gen: 'inversion-build', count: 3, difficulty: 2 }],
    quiz: [
      Q('En piano solo, la melodía suele ir…', ['En la voz más aguda', 'En el bajo', 'En el centro', 'En ambas manos a la octava siempre'], 0, 'Se percibe mejor la voz superior.'),
      Q('El stride se caracteriza por…', ['Una izquierda que alterna bajo y acorde', 'Arpegios lentos', 'Acordes sostenidos', 'Notas pedal'], 0, 'Bajo–acorde–bajo–acorde.'),
    ],
    mistakes: ['Tocar todos los estilos con la misma pulsación: el groove cambia con la acentuación.', 'Doblar la melodía con el acorde: se pierde claridad.'],
  }),

  L({
    id: 'n5-05', order: 5, title: 'Voice leading avanzado y reharmonización creativa', minutes: 24, prerequisites: ['n4-07', 'n5-03'], covers: ['N5.8', 'N5.9'],
    objective: 'Diseñar líneas internas con sentido y reharmonizar con criterio artístico combinando varias técnicas.',
    blocks: [
      { type: 'text', title: 'Voz interior con intención', body: 'El *voice leading* avanzado va más allá del movimiento mínimo: busca **líneas interiores con sentido**.\n\n- **Línea de notas guía**: la 3ª/7ª de cada acorde forman una línea cromática o por grados.\n- **Línea cromática interior**: C – C+ – C6 – C7 (la quinta sube por semitonos).\n- **Movimiento contrario entre bajo y soprano**.\n- **Nota común disminuida**: un dim7 que conserva una nota del acorde anterior.\n\n**Reharmonización creativa**: combina técnicas con un propósito emocional. Plantea preguntas: ¿qué quiero que sienta el oyente en el compás 5? ¿más tensión? ¿más espacio? Escoge un recurso: pedal para suspender, tritonal para el bajo cromático, préstamo modal para melancolía, upper structure para brillo.' },
      chordSeqExample('Línea cromática interior', 'C – Caug – C6 – C7: la quinta sube Sol–Sol♯–La–Si♭ sobre una tónica fija.', [['C', 'maj'], ['C', 'aug'], ['C', '6'], ['C', '7']], 1.5),
      chordSeqExample('Bajo cromático descendente', 'Cmaj7 – Bm7 – B♭7 – Am7 – A♭7 – Gmaj7... línea de bajo Do–Si–Si♭–La–La♭–Sol.', [['C', 'maj7'], ['B', 'm7'], ['Bb', '7'], ['A', 'm7'], ['Ab', '7'], ['G', 'maj7']], 1.5),
      progExample('Reharmonización creativa', `${R('Imaj7')} – ${R('bVII7')} – ${R('bVImaj7')} – ${R('V7')}: una sucesión mediante y préstamo, con melodía conservada.`, ['Imaj7', 'bVII7', 'bVImaj7', 'V7'], { tonic: 'C', mode: 'major' }, 2),
      tryChord('Toca C aumentado como parte de la línea cromática: Do, Mi, Sol♯.', 'C', 'aug'),
    ],
    practiceTip: 'Toma la progresión I – vi – ii – V. Escribe sobre ella una línea de notas guía continua. Después reharmonízala con dos técnicas (tritonal en V, préstamo en vi) y compara cómo cambia la línea.',
    practice: [{ gen: 'voice-leading', count: 5, difficulty: 3 }, { gen: 'complete-progression', count: 3, difficulty: 3 }],
    quiz: [
      Q('La línea cromática interior C – C+ – C6 – C7 la hace…', ['La quinta que asciende por semitonos', 'La tercera', 'La fundamental', 'El bajo'], 0, 'Sol – Sol♯ – La – Si♭.'),
      Q('Antes de reharmonizar creativamente conviene…', ['Definir el efecto emocional que se busca', 'Cambiar todos los acordes', 'Ignorar la melodía', 'Transponer'], 0, 'La técnica sirve al propósito.'),
    ],
    mistakes: ['Cambiar el bajo constantemente: hay que respetar la lógica melódica de los extremos.', 'Aplicar técnicas «porque sí»: sin objetivo expresivo, la reharmonización suena arbitraria.'],
  }),

  L({
    id: 'n5-06', order: 6, title: 'Transposición en tiempo real y análisis de piezas originales', minutes: 22, prerequisites: ['n5-05', 'n2-10'], covers: ['N5.10', 'N5.11'],
    objective: 'Transportar progresiones y patrones con fluidez y analizar una pieza completa justificando decisiones.',
    blocks: [
      { type: 'text', title: 'Transponer sin escribir', body: 'La forma más fiable de transponer en directo es **pensar en números romanos**: aprendes la pieza como grados, y la tocas en cualquier tonalidad cambiando solo la tónica.\n\nEscalón de práctica:\n\n1. Transponer **escalas** (Do mayor → Re mayor → Mi mayor…).\n2. Transponer **tríadas** (mismo patrón a un tono/semitono).\n3. Transponer **I–IV–V–I**, ii–V–I y turnarounds por semitonos.\n4. Transponer una **pieza** corta de memoria.\n\nVerifica siempre la escritura: al transponer {{c:E}} una 2ª mayor ascendente sale {{c:F#}} (no G♭).' },
      progExample('I–V–vi–IV en Do', 'C – G – Am – F.', ['I', 'V', 'vi', 'IV'], { tonic: 'C', mode: 'major' }),
      progExample('El mismo en Re', 'D – A – Bm – G.', ['I', 'V', 'vi', 'IV'], { tonic: 'D', mode: 'major' }),
      progExample('El mismo en Mi♭', 'E♭ – B♭ – Cm – A♭.', ['I', 'V', 'vi', 'IV'], { tonic: 'Eb', mode: 'major' }),
      { type: 'text', title: 'Análisis de una pieza original (8 compases)', body: '**Pieza**: Dmaj7 · Bm7 · Em7 · A7 | Dmaj7 · F♯m7 · G · Gm | Dmaj7/F♯ · Em7 · A7 · Dmaj7.\n\n**Análisis en Re mayor**: Imaj7 – vi7 – ii7 – V7 | Imaj7 – iii7 – IV – iv (préstamo modal) | Imaj7 en 1ª inversión (bajo F♯) – ii7 – V7 – Imaj7.\n\n**Cadencia**: auténtica final (V7–I). **Recursos**: turnaround de apertura (I–vi–ii–V), intercambio modal en el compás 4 (iv, que oscurece antes de la repetición del I) y una inversión que mueve el bajo por grados (F♯–E–A–D).' },
      tryNotes('Transpón C–E–G una segunda mayor ascendente: toca D, F♯ y A.', ['D', 'F#', 'A'], 'set'),
    ],
    practiceTip: 'Toca I–V–vi–IV en las 12 tonalidades, subiendo por quintas. Sin mirar, di el nombre de cada acorde antes de tocarlo.',
    practice: [{ gen: 'transpose-notes', count: 5, difficulty: 3 }, { gen: 'transpose-progression', count: 4, difficulty: 3 }],
    quiz: [
      Q('Transponer una progresión significa…', ['Mover todos los acordes el mismo intervalo conservando sus calidades', 'Cambiar solo la armadura sin tocar los acordes', 'Cambiar las calidades', 'Invertirla'], 0, 'Se mantiene la relación entre acordes.'),
      Q('Transponer E una 2ª mayor ascendente da…', ['F♯', 'G♭', 'F', 'G'], 0, 'E + 2M = F♯ (letra siguiente + tono).'),
    ],
    mistakes: ['Transponer cambiando las calidades: Am no se vuelve A.', 'Escribir mal las alteraciones: la letra manda (E + 2M = F♯, no G♭).'],
  }),

  L({
    id: 'n5-07', order: 7, title: 'Introducciones, interludios, finales y oído aplicado', minutes: 22, prerequisites: ['n5-02', 'n2-09'], covers: ['N5.12', 'N5.13'],
    objective: 'Crear secciones de enlace y cierre y entrenar el oído para reconocer progresiones y funciones.',
    blocks: [
      { type: 'text', title: 'Enlaces y cierres', body: '- **Introducción**: se suele tomar de los últimos acordes de la pieza (el *vamp* de V–I) o presentar la tónica con un pedal. Su misión: fijar tonalidad, ritmo y carácter.\n- **Interludio**: puente entre secciones; sobre un acorde estable (pedal) o un turnaround que prepara la nueva sección.\n- **Final (coda)**: cierra de forma definitiva. Recursos: **cadencia plagal añadida** (IV–I tras V–I), **tercera de Picardía** (acabar un modo menor con tónica mayor), **ritardando** y **arpegio final**, **tag** (repetir los dos últimos compases).\n\n**Oído aplicado**: aprende a identificar tres cosas en cualquier canción: (1) la **tónica** (¿dónde reposa?), (2) el **bajo** (¿sube o baja?), (3) las **funciones** (¿tensión o reposo?). Después puedes poner nombre a los acordes.' },
      progExample('Introducción con vamp', 'Dos compases de ii7 – V7 repetidos, como entrada a la pieza.', ['ii7', 'V7', 'ii7', 'V7'], { tonic: 'C', mode: 'major' }, 2),
      progExample('Final con cadencia plagal añadida', 'I – IV – V – I – IV – I: el «amén» refuerza el cierre.', ['I', 'IV', 'V', 'I', 'IV', 'I'], { tonic: 'C', mode: 'major' }),
      chordSeqExample('Tercera de Picardía', 'Am – Dm – E – A: la pieza en La menor termina en A mayor, sonido luminoso y esperanzador (recurso barroco).', [['A', 'min'], ['D', 'min'], ['E', 'maj'], ['A', 'maj']], 2),
      { type: 'callout', kind: 'tip', title: 'Dictado armónico', body: 'Para entrenar el oído: toca una nota fundamental, escucha una progresión y escribe solo los **números de grado del bajo** (1–4–5–1). Luego añade las calidades.' },
    ],
    practiceTip: 'Toma tu pieza favorita: escribe una introducción de 4 compases usando los últimos 2 acordes y un final con tag. Tócalas y grábate.',
    practice: [{ gen: 'aural-cadence', count: 4, difficulty: 3 }, { gen: 'aural-chord', count: 3, difficulty: 3 }, { gen: 'aural-interval', count: 3, difficulty: 3 }],
    quiz: [
      Q('La tercera de Picardía consiste en…', ['Terminar una pieza menor con acorde mayor', 'Modular a la relativa', 'Usar un acorde aumentado', 'Evitar la tónica'], 0, 'La tónica final lleva tercera mayor.'),
      Q('Un vamp es…', ['Una breve secuencia repetida como entrada', 'Un acorde de paso', 'Una cadencia rota', 'Un tipo de escala'], 0, 'Un patrón armónico breve y repetible.'),
    ],
    mistakes: ['Hacer una introducción que no ayuda a fijar la tonalidad.', 'Alargar un final sin sentido: un buen cierre es claro y breve.'],
  }),

  L({
    id: 'n5-08', order: 8, title: 'Criterio musical y proyecto final', minutes: 40, prerequisites: ['n5-06', 'n5-07'], covers: ['N5.14', 'N5.15'], requiresProject: true, passScore: 0.7,
    objective: 'Demostrar el recorrido completo: teoría, oído, teclado y una pequeña composición propia, justificando tus decisiones.',
    blocks: [
      { type: 'text', title: 'Qué es el criterio', body: 'El **criterio musical** es saber elegir entre opciones correctas. No hay respuesta única, pero sí **razones**: ¿refuerza la melodía?, ¿mantiene la coherencia de la frase?, ¿aporta contraste sin romper?, ¿está al servicio del carácter?\n\nUna regla útil: **escucha primero, justifica después**. Si algo suena bien pero no sabes por qué, analiza. Si algo es teóricamente correcto pero suena mal, confía en tu oído y cámbialo.' },
      { type: 'text', title: 'Evaluación final', body: 'Esta lección combina cuatro partes:\n\n1. **Teoría**: preguntas sobre intervalos, acordes y funciones.\n2. **Oído**: reconocimiento de intervalos, calidades de acorde y cadencias.\n3. **Teclado**: construir acordes e inversiones tocando.\n4. **Composición**: una pequeña progresión original que guardas en el Laboratorio y que cumple los criterios de abajo.\n\nSupera el 70 % del test y los criterios del proyecto para completar el curso.' },
      { type: 'project', title: 'Mini-proyecto: tu progresión', brief: 'Abre el Laboratorio → Progresiones. Elige una tonalidad, compón al menos ocho acordes, guárdala con un nombre y vuelve aquí. Cada criterio se comprueba con tus progresiones guardadas.', criteria: [
        { id: 'length8', label: 'Tiene al menos 8 acordes' },
        { id: 'secondary', label: 'Incluye una dominante secundaria (por ejemplo V7/vi)' },
        { id: 'color', label: 'Incluye un acorde de color (prestado como iv o ♭VII, o con séptima/novena)' },
        { id: 'tonic-end', label: 'Termina en la tónica' },
      ] },
      { type: 'callout', kind: 'tip', title: 'Reflexión final', body: 'Escribe tres frases: qué intención tiene tu progresión, qué recurso te gusta más y qué cambiarías. Es la parte más musical del análisis, y no la corrige nadie más que tú.' },
      tryChord('Calentamiento: toca Sol7 en estado fundamental.', 'G', '7'),
      noteExample('Tu cadencia final', `${N('G')} ${N('B')} ${N('D')} ${N('F')} → ${N('C')} ${N('E')} ${N('G')}: resolución perfecta que cierra el curso.`, ['G3', 'B3', 'D4', 'F4', 'C4', 'E4', 'G4'], 'melody', 0.6),
    ],
    practiceTip: 'Prepárate tocando de memoria I–IV–V–I, ii–V–I y I–V–vi–IV en cinco tonalidades distintas, y practicando reconocimiento de intervalos y cadencias al oído.',
    practice: [
      { gen: 'interval-id', count: 3, difficulty: 3 }, { gen: 'seventh-build', count: 2, difficulty: 3 }, { gen: 'degree-function', count: 2, difficulty: 3 },
      { gen: 'aural-interval', count: 2, difficulty: 3 }, { gen: 'aural-chord', count: 2, difficulty: 3 }, { gen: 'aural-cadence', count: 2, difficulty: 3 },
      { gen: 'inversion-build', count: 2, difficulty: 2 }, { gen: 'triad-build', count: 2, difficulty: 3 }, { gen: 'complete-progression', count: 2, difficulty: 3 },
    ],
    quiz: [
      Q('Elegir entre dos soluciones armónicas válidas depende de…', ['El criterio y el efecto buscado', 'La regla única del libro', 'El azar', 'La tonalidad'], 0, 'No hay solución universal: hay razones expresivas.'),
    ],
    mistakes: ['Esperar una única respuesta correcta: en armonía suele haber varias defendibles.', 'Dejar el proyecto sin guardar: se valida con las progresiones guardadas en el Laboratorio.'],
  }),
]
