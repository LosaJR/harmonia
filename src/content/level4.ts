import { N, R } from '../exercises/rich'
import { voiceChord } from '../music/voicing'
import { chordExample, chordSeqExample, customExample, progExample, Q, scaleExample, tryChord, tryNotes } from './helpers'
import type { Lesson } from './types'

const L = (l: Omit<Lesson, 'level' | 'passScore'> & { passScore?: number }): Lesson => ({ level: 4, passScore: 0.7, ...l })

const vox = (root: string, q: string, style: Parameters<typeof voiceChord>[2], oct = 3) => voiceChord(root, q, style, { octave: oct }).notes

export const LEVEL4: Lesson[] = [
  L({
    id: 'n4-01', order: 1, title: 'Extensiones: novena, oncena y trecena', minutes: 20, prerequisites: ['n2-03', 'n3-01'], covers: ['N4.1', 'N4.2'],
    objective: 'Construir acordes con 9ª, 11ª y 13ª y distinguir extensiones de tensiones disponibles.',
    blocks: [
      { type: 'text', title: 'Seguir apilando terceras', body: 'Después de la séptima, seguimos apilando terceras: **9ª** (= 2ª una octava arriba), **11ª** (= 4ª), **13ª** (= 6ª). Son las **extensiones**: colores añadidos sobre un acorde de séptima.\n\n- **Cmaj9** = C E G B **D** · **C9** = C E G B♭ **D** · **Cm9** = C E♭ G B♭ **D** · **Cm11** = Cm9 + **F** · **C13** = C E (G) B♭ D **A** (suele omitirse la 5ª y la 11ª).\n\nEn el piano no se tocan todas: se **eligen** las más significativas (3ª, 7ª y 1–2 extensiones) y se omite lo que estorba (la 5ª, o incluso la fundamental si el bajo ya la toca).' },
      { type: 'text', title: 'Extensiones frente a tensiones disponibles', body: 'No toda extensión suena bien en todos los acordes. Una **tensión disponible** es una extensión que no choca (semitono) con ninguna nota real del acorde; una **nota a evitar** crea un choque de novena menor con la 3ª o la 7ª.\n\n- **maj7**: 9 y 13 disponibles; la 11 natural choca con la 3ª → usa **♯11**.\n- **7 (dominante)**: 9 y 13 disponibles (y ♭9, ♯9, ♯11, ♭13 como tensiones alteradas); la 11 natural choca con la 3ª.\n- **m7**: 9 y 11 disponibles; la 13 natural suena dórica, la ♭13 eólica.' },
      chordExample('Cmaj9', `${N('C')} ${N('E')} ${N('G')} ${N('B')} ${N('D5')}`, 'C', 'maj9', { oct: 3 }),
      chordExample('Cm9', 'Cálido, típico de baladas y neo-soul.', 'C', 'm9', { oct: 3 }),
      chordExample('C9', 'Dominante con novena: más blando que C7, muy usado en funk y blues.', 'C', '9', { oct: 3 }),
      chordExample('C13', 'Dominante con trecena: carácter de big band.', 'C', '13', { oct: 3 }),
      tryChord('Construye Re m9: Re, Fa, La, Do, Mi.', 'D', 'm9'),
    ],
    practiceTip: 'Sobre una fundamental, ve añadiendo notas una a una (3ª, 5ª, 7ª, 9ª, 13ª) y escucha qué aporta cada una. Deja la 5ª fuera cuando llegues a la novena.',
    practice: [{ gen: 'extension-build', count: 5, difficulty: 2 }, { gen: 'chord-id', count: 3, difficulty: 3 }],
    quiz: [
      Q('La novena de un acorde de Do es…', ['Re', 'Fa', 'La', 'Si'], 0, 'La novena es la segunda una octava arriba: Re.'),
      Q('En un acorde maj7, la undécima natural suele evitarse porque…', ['Choca (semitono) con la tercera mayor', 'Está muy aguda', 'Es de otra tonalidad', 'Cambia el modo'], 0, 'F choca con E (3ª) en Cmaj7; por eso se usa ♯11.'),
      Q('¿Cuántas notas hay en un acorde de 13ª completo con todas las terceras?', ['7', '5', '6', '4'], 0, 'Fundamental, 3ª, 5ª, 7ª, 9ª, 11ª y 13ª.'),
    ],
    mistakes: ['Tocar siempre las 7 notas: en el piano se omiten la 5ª, la 11ª, e incluso la fundamental.', 'Confundir 9 con add9: el 9 incluye la séptima.'],
  }),

  L({
    id: 'n4-02', order: 2, title: 'Tensiones alteradas y dominantes alteradas', minutes: 20, prerequisites: ['n4-01'], covers: ['N4.3', 'N4.4'],
    objective: 'Usar ♭9, ♯9, ♯11 y ♭13 sobre acordes dominantes y resolverlos correctamente.',
    blocks: [
      { type: 'text', title: 'Cuando la dominante quiere más tensión', body: 'Un acorde dominante puede alterar su 5ª, 9ª, 11ª y 13ª. Esas **tensiones alteradas** son: **♭9**, **♯9**, **♯11** (= ♭5), **♭13** (= ♯5). Cuantas más alteraciones, más tensión y más ganas de resolver en el acorde de tónica.\n\nUn dominante **alterado** (7alt) combina varias; la escala asociada es la **alterada** (superlocria, 7º modo de la menor melódica): tiene ♭9, ♯9, ♭5 (=♯11), ♯5 (=♭13) y la 3ª y 7ª del dominante.\n\nEjemplo: en Do mayor, **G7(♯9, ♭13)** → Cmaj7. El acorde es G B F A♯ E♭ (el A♯ suena como B♭).' },
      chordExample('G7', 'La dominante simple.', 'G', '7', { oct: 3 }),
      chordExample('G7♭9', `${N('G')} ${N('B')} ${N('D')} ${N('F')} ${N('Ab')}: oscuro y dramático. Muy habitual en modo menor.`, 'G', '7b9', { oct: 3 }),
      chordExample('G7♯9', 'El «acorde de Hendrix»: mayor y menor a la vez (B y A♯/B♭).', 'G', '7#9', { oct: 3 }),
      chordExample('G7alt', `${N('G')} ${N('B')} ${N('F')} ${N('A#')} ${N('Eb')}: G7(♯9, ♭13), una forma típica de dominante alterado.`, 'G', '7alt', { oct: 3 }),
      chordSeqExample('Resolución', 'G7alt → Cmaj7: las tensiones resuelven por grado conjunto (A♯ → B, E♭ → D, F → E).', [['G', '7alt'], ['C', 'maj7']], 3),
      scaleExample('Escala alterada sobre Sol', 'Sol–La♭–Si♭–Do♭–Re♭–Mi♭–Fa: contiene todas las tensiones alteradas.', 'G', 'altered', 3),
      tryChord('Toca G7♭9: Sol, Si, Re, Fa y La♭.', 'G', '7b9'),
    ],
    practiceTip: 'Toca ii–V–I en Do mayor (Dm7 – G7 – Cmaj7) y cambia el G7 por G7♭9, G7♯9 y G7alt. Fíjate en cómo cada tensión se resuelve por un semitono.',
    practice: [{ gen: 'extension-build', count: 4, difficulty: 3, params: { qualities: ['7b9', '7#9', '7#11', '7b13', '7alt'] } }, { gen: 'chord-id', count: 3, difficulty: 3 }],
    quiz: [
      Q('Una ♭9 sobre G7 es…', ['La♭', 'La', 'Si♭', 'Fa♯'], 0, 'La novena menor: La♭.'),
      Q('La escala alterada tiene sobre la fundamental…', ['♭9, ♯9, ♭5, ♯5, ♭7', 'Solo ♭9', 'Séptima mayor', 'Quinta justa'], 0, 'Contiene todas las tensiones alteradas del dominante.'),
      Q('Las tensiones alteradas suelen resolver…', ['Por grado conjunto, a una nota del acorde de tónica', 'Con saltos grandes', 'No se resuelven', 'Hacia otro dominante siempre'], 0, 'Típicamente ♭9→8, ♯9→3 o 9, ♭13→5, ♯11→5.'),
    ],
    mistakes: ['Usar ♯9 con 3ª menor: ♯9 y 3ª mayor conviven, lo que da su sonido característico.', 'Alterar el dominante en contextos de armonía clásica estricta sin preparación: es un recurso de jazz y música moderna.'],
  }),

  L({
    id: 'n4-03', order: 3, title: 'Sustitución tritonal y dominantes de puerta trasera', minutes: 20, prerequisites: ['n4-02', 'n3-09'], covers: ['N4.5', 'N4.14'],
    objective: 'Sustituir V7 por bII7 aprovechando el tritono compartido, y reconocer la backdoor dominant ♭VII7.',
    blocks: [
      { type: 'text', title: 'El tritono es el motor', body: 'El acorde V7 se define por el **tritono** entre su 3ª y su 7ª (en G7: Si–Fa). **Re♭7** contiene exactamente las mismas dos notas (Fa y Do♭=Si), solo con las funciones invertidas. Por eso **♭II7 puede sustituir a V7**: es la **sustitución tritonal**.\n\n- G7 → Cmaj7: el bajo desciende por quinta.\n- D♭7 → Cmaj7: el bajo desciende por **semitono**. En ii–V–I el bajo se mueve **D–D♭–C**, una línea cromática descendente.\n\nLa **dominante de puerta trasera** (*backdoor*) es el acorde **♭VII7** (Si♭7 en Do) que resuelve a I: viene de la escala de Do mixolidia/menor y suele precederse de iv (Fm7 – B♭7 – C).' },
      chordSeqExample('ii–V–I normal', 'Dm7 – G7 – Cmaj7', [['D', 'm7'], ['G', '7'], ['C', 'maj7']], 3),
      chordSeqExample('ii–♭II–I (tritonal)', 'Dm7 – D♭7 – Cmaj7: bajo cromático D–D♭–C.', [['D', 'm7'], ['Db', '7'], ['C', 'maj7']], 3),
      chordSeqExample('Backdoor', 'Fm7 – B♭7 – Cmaj7: iv7 → ♭VII7 → I.', [['F', 'm7'], ['Bb', '7'], ['C', 'maj7']], 3),
      progExample('Con romanos', `ii7 – ♭II7 – Imaj7: ${R('bII7')} es el sustituto tritonal.`, ['ii7', 'bII7', 'Imaj7'], { tonic: 'C', mode: 'major' }, 3),
      tryChord('Toca D♭7, el sustituto tritonal de G7: Re♭, Fa, La♭, Do♭.', 'Db', '7'),
    ],
    practiceTip: 'Toca ii–V–I en Do, Fa y Si♭. Repite sustituyendo V7 por ♭II7. Después incluye una backdoor al final: iv7–♭VII7–I.',
    practice: [{ gen: 'complete-progression', count: 4, difficulty: 3 }, { gen: 'seventh-build', count: 3, difficulty: 3 }],
    quiz: [
      Q('El sustituto tritonal de G7 es…', ['D♭7', 'A♭7', 'C♯m7', 'F7'], 0, 'G y D♭ están a distancia de tritono; comparten Si/Do♭ y Fa.'),
      Q('La línea de bajo en Dm7 – D♭7 – Cmaj7 es…', ['Cromática descendente', 'Por quintas', 'Ascendente por tonos', 'Constante'], 0, 'D – D♭ – C.'),
      Q('La backdoor dominant en Do es…', ['B♭7', 'D7', 'A7', 'E♭7'], 0, '♭VII7 resolviendo a I.'),
    ],
    mistakes: ['Aplicar la sustitución tritonal a cualquier acorde: debe ser un dominante con función resolutiva.', 'Confundir D♭7 con C♯7 en la escritura: en tonalidades con bemoles se escribe D♭7.'],
  }),

  L({
    id: 'n4-04', order: 4, title: 'Voicings rootless y drop 2', minutes: 24, prerequisites: ['n4-01', 'n3-03'], covers: ['N4.6', 'N4.7'],
    objective: 'Construir voicings sin fundamental (tipos A y B) y distribuciones drop 2 y encadenarlos con movimiento mínimo.',
    blocks: [
      { type: 'text', title: 'Dejar que el bajo haga la fundamental', body: 'Cuando hay bajista (o tú tocas el bajo con la izquierda), la mano derecha puede **omitir la fundamental** y centrarse en lo que define el color: 3ª, 7ª y extensiones. Son los **voicings rootless** de Bill Evans.\n\n- **Tipo A**: 3ª – 5ª – 7ª – 9ª (empieza en la 3ª).\n- **Tipo B**: 7ª – 9ª – 3ª – 5ª (empieza en la 7ª).\n\nAlternando A y B, un ii–V–I se encadena casi sin moverse. Ejemplo: Dm7 (tipo A: F–A–C–E) → G7 (tipo B: F–A–B–D) → Cmaj7.\n\n**Drop 2**: desde un acorde de cuatro notas en posición cerrada, baja la **segunda nota desde arriba** una octava. Resulta una distribución abierta y muy cómoda para dos manos o guitarra.' },
      customExample('Dm7 (rootless A)', `${N('F3')} ${N('A3')} ${N('C4')} ${N('E4')}: la 3ª, 5ª, 7ª y 9ª de Dm7.`, [{ notes: vox('D', 'm7', 'rootlessA'), beats: 3 }], 80, vox('D', 'm7', 'rootlessA'), 'Dm7 tipo A'),
      customExample('G7 (rootless B)', 'La 7ª, 9ª, 3ª y 5ª de G7. Casi idéntico al voicing anterior: sólo se mueven dos notas.', [{ notes: vox('G', '7', 'rootlessB'), beats: 3 }], 80, vox('G', '7', 'rootlessB'), 'G7 tipo B'),
      customExample('ii–V–I con rootless', 'Dm7 (A) – G7 (B) – Cmaj7 (A), con la fundamental en el bajo: movimientos mínimos.', [
        { notes: ['D2', ...vox('D', 'm7', 'rootlessA')], beats: 3 }, { notes: ['G2', ...vox('G', '7', 'rootlessB')], beats: 3 }, { notes: ['C3', ...vox('C', 'maj7', 'rootlessA')], beats: 4 },
      ], 76, undefined, 'Dm7 – G7 – Cmaj7'),
      customExample('Cmaj7 cerrado frente a drop 2', 'Primero C E G B cerrado y después drop 2 (G3–C4–E4–B4).', [{ notes: ['C4', 'E4', 'G4', 'B4'], beats: 2 }, { notes: vox('C', 'maj7', 'drop2', 4), beats: 2 }], 76, undefined, 'Cmaj7 drop 2'),
      { type: 'callout', kind: 'style', title: 'Estilo', body: 'Las voces sin fundamental son un recurso del jazz y la música moderna con bajista. En piano solo o en cualquier contexto sin bajo, mantén la fundamental en la mano izquierda.' },
      tryNotes('Toca el voicing rootless tipo A de Dm7: Fa, La, Do, Mi.', ['F', 'A', 'C', 'E'], 'set'),
    ],
    practiceTip: 'Toca ii–V–I en las doce tonalidades alternando voicings A y B. Si te sales de la zona do3–sol4, cambia el tipo de voicing para volver.',
    practice: [{ gen: 'voicing-id', count: 4, difficulty: 3 }, { gen: 'seventh-build', count: 3, difficulty: 3 }],
    quiz: [
      Q('Un voicing rootless omite…', ['La fundamental', 'La séptima', 'La tercera', 'Toda la armonía'], 0, 'Se deja la fundamental al bajo.'),
      Q('El tipo A de un acorde de séptima empieza en…', ['La tercera', 'La fundamental', 'La séptima', 'La novena'], 0, 'A: 3–5–7–9. B: 7–9–3–5.'),
      Q('En drop 2 se baja una octava la…', ['Segunda nota desde arriba', 'Nota más aguda', 'Fundamental', 'Tercera nota desde abajo'], 0, 'Por eso se llama «drop 2».'),
    ],
    mistakes: ['Usar rootless sin bajo: la armonía queda ambigua.', 'Alejarse demasiado de la octava central: elige A o B para mantenerte en la zona cómoda.'],
  }),

  L({
    id: 'n4-05', order: 5, title: 'Acordes cuartales y upper structures', minutes: 22, prerequisites: ['n4-04'], covers: ['N4.8', 'N4.9'],
    objective: 'Construir acordes por cuartas y estructuras superiores (tríadas sobre un dominante) para obtener tensiones concretas.',
    blocks: [
      { type: 'text', title: 'Cuartas en vez de terceras', body: 'Los **acordes cuartales** apilan cuartas justas (o diatónicas) en lugar de terceras. Suenan abiertos, ambiguos y modernos, sin tensión dominante clásica. Típicos de McCoy Tyner y del jazz modal. Ejemplo: **Re–Sol–Do–Fa** (tres cuartas justas) sobre Dm7.\n\nLas **upper structures** (estructuras superiores) colocan una **tríada** simple sobre un acorde de séptima en la mano izquierda (fundamental, 3ª, 7ª). La tríada superior aporta las tensiones directamente:\n\n- Sobre G7: **tríada de La mayor** (la tríada de II) → 9, ♯11, 13.\n- Sobre G7: **tríada de La♭ mayor** (♭II) → ♭9, 3, ♭13.\n- Sobre G7: **tríada de si♭ menor** (♭III menor) → ♯9, ♭5, 7.\n- Sobre G7: **tríada de Mi♭ mayor** (♭VI) → ♭13, 1, ♯9.' },
      customExample('Cuartal sobre Re', 'D–G–C–F: cuartas justas consecutivas. Sonido abierto y modal.', [{ notes: ['D3', 'G3', 'C4', 'F4'], beats: 3 }], 70, ['D3', 'G3', 'C4', 'F4'], 'Cuartal'),
      customExample('Upper structure II sobre G7', 'Izquierda: Sol–Fa–Si (fundamental, 7ª, 3ª). Derecha: tríada de La mayor (La–Do♯–Mi) → 9, ♯11, 13.', [{ notes: ['G2', 'F3', 'B3', 'A4', 'C#5', 'E5'], beats: 3 }], 70, undefined, 'G7 + A mayor'),
      customExample('Upper structure ♭II sobre G7', 'Tríada de La♭ mayor (La♭–Do–Mi♭) → ♭9, 3, ♭13: dominante alterado oscuro.', [{ notes: ['G2', 'F3', 'B3', 'Ab4', 'C5', 'Eb5'], beats: 3 }], 70, undefined, 'G7 + A♭ mayor'),
      customExample('Resolución', 'G7 con US II → Cmaj7 con tríada de Sol mayor encima (9–5–7 de Cmaj7).', [
        { notes: ['G2', 'F3', 'B3', 'A4', 'C#5', 'E5'], beats: 2 }, { notes: ['C3', 'B3', 'E4', 'G4', 'B4', 'D5'], beats: 3 },
      ], 70),
      tryChord('Toca la tríada de La♭ mayor que sirve como upper structure ♭II de G7.', 'Ab', 'maj'),
    ],
    practiceTip: 'Con la mano izquierda toca 1–7–3 de G7. Con la derecha prueba las cuatro tríadas del texto, una por una, y escribe qué sensación da cada una.',
    practice: [{ gen: 'voicing-id', count: 3, difficulty: 3 }, { gen: 'extension-build', count: 3, difficulty: 3 }],
    quiz: [
      Q('Una tríada de La mayor sobre G7 aporta…', ['9, ♯11 y 13', '♭9, 3, ♭13', 'Solo la fundamental', '♯9, ♭5 y 7'], 0, 'La es la 9ª, Do♯ la ♯11 y Mi la 13ª de Sol.'),
      Q('Los acordes cuartales se construyen…', ['Apilando cuartas', 'Apilando terceras', 'Duplicando la fundamental', 'Con quintas disminuidas'], 0, 'Cuartas justas o diatónicas.'),
    ],
    mistakes: ['Pensar que la tríada superior es «otro acorde»: es una forma de escribir tensiones del acorde inferior.', 'Elegir una upper structure con choques con la melodía: siempre comprueba la nota superior.'],
  }),

  L({
    id: 'n4-06', order: 6, title: 'Escalas y modos del jazz, relación acorde–escala', minutes: 26, prerequisites: ['n4-01', 'n1-09'], covers: ['N4.10', 'N4.11', 'N4.12'],
    objective: 'Relacionar acordes con escalas (modos, melódica, alterada, simétricas) y distinguir el uso funcional (tonal) del modal.',
    blocks: [
      { type: 'text', title: 'Cada acorde sugiere una paleta', body: 'Una **escala sobre un acorde** es el conjunto de notas del que se extraen melodía y tensiones. Relación habitual en tonalidad mayor:\n\n- **Imaj7** → jónica (mayor) o **lidia** (♯11).\n- **ii7** → **dórica**.\n- **iii7** → frigia (o frigia con ♮).\n- **IVmaj7** → lidia.\n- **V7** → **mixolidia** (diatónico) o alterada/lidia dominante según tensiones.\n- **vi7** → eólica.\n- **viiø7** → locria.\n\nOtras: **lidia dominante** (V7(♯11) no resolutivo, 4º modo de la melódica), **alterada** (V7alt), **disminuida semitono–tono** (V7♭9), **tonos enteros**, **menor melódica** (sobre m(maj7)), **frigia dominante** (V7♭9 en modo menor).' },
      { type: 'text', title: 'Tonal frente a modal', body: '- **Función tonal**: los acordes se explican por su relación con la tónica (ii–V–I). La escala se deriva del acorde y su función.\n- **Función modal**: la armonía se queda en un **centro** y el interés está en el color del modo (como en *So What*: Dm7 dórico 16 compases, luego E♭m7). Se evitan las cadencias V–I; se usan notas características del modo (la 6ª natural en dórico, la ♯4 en lidio, la ♭2 en frigio).' },
      scaleExample('Re dórico', 'D–E–F–G–A–B–C: menor con sexta mayor. Sobre Dm7 del ii–V–I.', 'D', 'dorian'),
      scaleExample('Sol mixolidio', 'G–A–B–C–D–E–F: mayor con séptima menor. Sobre G7.', 'G', 'mixolydian'),
      scaleExample('Fa lidio', 'F–G–A–B–C–D–E: mayor con cuarta aumentada. Sobre Fmaj7 (la nota B es la ♯11).', 'F', 'lydian'),
      scaleExample('Do lidio dominante', 'C–D–E–F♯–G–A–B♭: dominante con ♯11, típica de acordes de séptima no resolutivos (como el IV7 del blues).', 'C', 'lydian dominant'),
      scaleExample('Sol disminuida semitono–tono', 'Alterna semitono y tono (G A♭ B♭ C♭ D♭ …): ideal sobre V7♭9.', 'G', 'dim hw', 3),
      tryNotes('Toca Re dórico ascendente (Re, Mi, Fa, Sol, La, Si, Do).', ['D', 'E', 'F', 'G', 'A', 'B', 'C'], 'ordered'),
    ],
    practiceTip: 'Toca un acorde Dm7 en la izquierda y improvisa con la derecha en Re dórico unos minutos. Después cambia a G7 con Sol mixolidio, y luego a Cmaj7 con Do jónico y lidio. Escucha el efecto de la ♯4.',
    practice: [{ gen: 'scale-build', count: 4, difficulty: 3, params: { scales: ['dorian', 'mixolydian', 'lydian', 'phrygian'], tonics: ['D', 'G', 'C', 'F', 'A', 'E'] } }, { gen: 'scale-build', count: 2, difficulty: 3, params: { scales: ['altered', 'lydian dominant'], tonics: ['G', 'C', 'D'] } }],
    quiz: [
      Q('La escala asociada normalmente a un ii7 es…', ['Dórica', 'Frigia', 'Lidia', 'Locria'], 0, 'Dórica: menor con 6ª mayor.'),
      Q('La lidia se distingue de la mayor por…', ['Cuarta aumentada', 'Séptima menor', 'Tercera menor', 'Sexta menor'], 0, 'La 4ª aumentada (♯11).'),
      Q('En armonía modal…', ['El interés está en el color del modo, no en la resolución V–I', 'No existen acordes', 'Solo se usa mayor y menor', 'Siempre hay modulaciones'], 0, 'Se mantiene un centro y se juega con su color.'),
    ],
    mistakes: ['Pensar que una escala «obliga»: son recursos, no leyes; la melodía nace de oído y práctica.', 'Aplicar siempre la misma escala a un V7: depende de las tensiones del contexto (mixolidia, alterada, lidia dominante…).'],
  }),

  L({
    id: 'n4-07', order: 7, title: 'Reharmonización avanzada y disminuidos de paso', minutes: 22, prerequisites: ['n4-03', 'n3-09'], covers: ['N4.13', 'N4.15'],
    objective: 'Aplicar técnicas avanzadas (sustituciones, cadenas de ii–V, acordes disminuidos de paso) para enriquecer la armonía.',
    blocks: [
      { type: 'text', title: 'Herramientas', body: 'Además de las sustituciones básicas, la reharmonización avanzada usa:\n\n- **ii–V relacionados**: anteponer un ii7 a cada dominante (secundaria) → Em7(♭5)–A7–Dm7…\n- **Sustitución tritonal** en una o más dominantes.\n- **Cromatismo en el bajo**: descender o ascender por semitono entre acordes.\n- **Acordes de paso disminuidos** (*passing diminished*): un dim7 entre dos acordes cuyas fundamentales están a distancia de un tono, para dar un bajo cromático. Por ejemplo, **C – C♯dim7 – Dm7**: el bajo sube Do–Do♯–Re. El dim7 funciona como una dominante con ♭9 (A7♭9 sin fundamental).\n\nUn **criterio**: la melodía manda. Si una nota larga de la melodía choca con el nuevo acorde, cambia la sustitución.' },
      chordSeqExample('Original', 'Cmaj7 – Dm7 – Em7 – Dm7 – Cmaj7', [['C', 'maj7'], ['D', 'm7'], ['E', 'm7'], ['D', 'm7'], ['C', 'maj7']], 2),
      chordSeqExample('Con disminuido de paso', 'Cmaj7 – C♯dim7 – Dm7 – D♯dim7 – Em7: bajos Do–Do♯–Re–Re♯–Mi.', [['C', 'maj7'], ['C#', 'dim7'], ['D', 'm7'], ['D#', 'dim7'], ['E', 'm7']], 2),
      chordSeqExample('Con ii–V relacionados', 'Cmaj7 – Em7 – A7 – Dm7 – G7 – Cmaj7: cada acorde se prepara con su dominante.', [['C', 'maj7'], ['E', 'm7'], ['A', '7'], ['D', 'm7'], ['G', '7'], ['C', 'maj7']], 2),
      chordSeqExample('Con tritonales', 'Cmaj7 – Em7 – E♭7 – Dm7 – D♭7 – Cmaj7: dominantes tritonales y bajo cromático.', [['C', 'maj7'], ['E', 'm7'], ['Eb', '7'], ['D', 'm7'], ['Db', '7'], ['C', 'maj7']], 2),
      tryChord('Toca C♯dim7: Do♯, Mi, Sol, Si♭.', 'C#', 'dim7'),
    ],
    practiceTip: 'Toma una frase de cuatro compases sobre acordes diatónicos. Aplica solo una técnica por pasada: primero ii–V; luego tritonal; luego disminuidos de paso. Graba y compara.',
    practice: [{ gen: 'complete-progression', count: 4, difficulty: 3 }, { gen: 'progression-analysis', count: 3, difficulty: 3 }],
    quiz: [
      Q('Un acorde disminuido de paso conecta…', ['Dos acordes cuyas fundamentales están a distancia de tono con un bajo cromático', 'Dos dominantes', 'Dos modos', 'La tónica y la sensible'], 0, 'El bajo cromático Do–Do♯–Re se apoya en el dim7.'),
      Q('Antes de reharmonizar conviene fijarse en…', ['La melodía', 'El número de compases', 'El tempo', 'El título'], 0, 'La melodía impone qué acordes funcionan.'),
    ],
    mistakes: ['Hacer reharmonizaciones muy densas que roban el sentido de la frase.', 'No resolver el acorde de paso: debe ir al acorde siguiente un semitono por encima/por debajo.'],
  }),

  L({
    id: 'n4-08', order: 8, title: 'Napolitana, sextas aumentadas y cromatismo armónico', minutes: 24, prerequisites: ['n3-05', 'n4-07'], covers: ['N4.16', 'N4.17'],
    objective: 'Reconocer y construir el acorde napolitano y las sextas aumentadas (italiana, francesa, alemana) en contexto clásico.',
    blocks: [
      { type: 'text', title: 'Predominantes cromáticos clásicos', body: '**Sexta napolitana (N6)**: un acorde mayor sobre el ♭II, normalmente en **primera inversión** (Fa–La♭–Re♭ en Do), con función de predominante: N6 → V → I. Carácter dramático.\n\n**Sextas aumentadas**: acordes con un intervalo de **6ª aumentada** entre el ♭6 del bajo y el ♯4. Resuelven hacia V abriéndose en movimiento contrario. En Do menor:\n\n- **Italiana**: A♭–C–F♯.\n- **Francesa**: A♭–C–D–F♯.\n- **Alemana**: A♭–C–E♭–F♯ (suena como un A♭7).\n\nEl **cromatismo armónico** amplía esto: acordes que aparecen por movimiento cromático de las voces (aproximaciones por semitono) y no por escala. Todo ello es lenguaje clásico-romántico, usado también en cine y jazz.' },
      customExample('Napolitana en Do menor', `Cm – ${N('Db')}/F (N6) – G7 – Cm. Fa–La♭–Re♭ en el medio, bajo Fa → Sol.`, [
        { notes: ['C3', 'G3', 'C4', 'Eb4'], beats: 2 }, { notes: ['F3', 'Ab3', 'Db4', 'F4'], beats: 2 }, { notes: ['G2', 'F3', 'B3', 'D4'], beats: 2 }, { notes: ['C3', 'G3', 'C4', 'Eb4'], beats: 3 },
      ], 66, undefined, 'Cm – D♭/F – G7 – Cm'),
      customExample('Sexta alemana', 'A♭–C–E♭–F♯ resuelve a Sol (C/G): las voces extremas se abren (A♭ ↓ G, F♯ ↑ G).', [
        { notes: ['Ab2', 'C4', 'Eb4', 'F#4'], beats: 2 }, { notes: ['G2', 'C4', 'Eb4', 'G4'], beats: 2 }, { notes: ['G2', 'D4', 'G4', 'B4'], beats: 2 }, { notes: ['C3', 'G3', 'C4', 'Eb4'], beats: 3 },
      ], 66, undefined, 'Alemana → i6/4 → V → i'),
      customExample('Sexta francesa', 'A♭–C–D–F♯: comparte el tritono con D♭7; muy usada por Debussy.', [
        { notes: ['Ab2', 'C4', 'D4', 'F#4'], beats: 2 }, { notes: ['G2', 'B3', 'D4', 'G4'], beats: 3 },
      ], 66, undefined, 'Francesa → V'),
      customExample('Aproximación cromática', 'Do mayor → Sol mayor con una voz que sube por semitonos: Do–Do♯–Re (el Do♯ pertenece a A7).', [
        { notes: ['C3', 'E4', 'G4'], beats: 2 }, { notes: ['A2', 'E4', 'G4', 'C#5'], beats: 2 }, { notes: ['G2', 'D4', 'G4', 'B4'], beats: 3 },
      ], 76),
      tryNotes('Toca la tríada napolitana de Do menor (D♭ mayor): Re♭, Fa, La♭.', ['Db', 'F', 'Ab'], 'set'),
    ],
    practiceTip: 'En Do menor toca i – N6 – V7 – i y compáralo con i – iv – V7 – i. Después sustituye iv por una sexta alemana. Escucha la intensidad creciente.',
    practice: [{ gen: 'triad-build', count: 3, difficulty: 3, params: { qualities: ['maj', 'min'], tonics: ['Db', 'Eb', 'Ab', 'Gb', 'F'] } }, { gen: 'chord-id', count: 3, difficulty: 3 }],
    quiz: [
      Q('El acorde napolitano es el acorde mayor sobre…', ['♭II', 'II', '♭III', 'IV'], 0, 'Sexta napolitana = tríada mayor sobre el segundo grado bajado.'),
      Q('La sexta alemana en Do menor contiene…', ['A♭–C–E♭–F♯', 'A♭–C–F♯', 'A♭–C–D–F♯', 'F–A♭–D♭'], 0, 'Alemana: ♭6, 1, ♭3, ♯4.'),
      Q('Las sextas aumentadas resuelven normalmente hacia…', ['El acorde de dominante (V)', 'La subdominante', 'El relativo mayor', 'Otro acorde disminuido'], 0, 'Resuelven abriéndose hasta la octava sobre la dominante.'),
    ],
    mistakes: ['Escribir la 6ª aumentada como 7ª menor (A♭–G♯): enarmónicamente suena igual pero cambia la resolución.', 'Usar la napolitana en estado fundamental sin querer: la clásica N6 suele estar invertida.'],
  }),

  L({
    id: 'n4-09', order: 9, title: 'Modulaciones avanzadas y pedales armónicos', minutes: 22, prerequisites: ['n3-06', 'n4-08'], covers: ['N4.18', 'N4.19'],
    objective: 'Modular por acorde común y por procedimientos cromáticos y construir estructuras sobre un bajo fijo.',
    blocks: [
      { type: 'text', title: 'Modulaciones que sorprenden', body: 'Además del acorde pivote diatónico:\n\n- **Por acorde común enarmónico**: un acorde (típicamente dim7 o sexta alemana) que se reinterpreta cambiando la ortografía. Un dim7 puede resolver a cuatro tonalidades distintas.\n- **Cromática**: una voz (o el bajo) sube/baja por semitonos y la nueva dominante aparece sin preparación.\n- **Directa (por yuxtaposición)**: se cambia de tonalidad sin transición, a menudo subiendo un tono o un semitono para dar energía (modulación pop de «último estribillo»).\n- **Por terceras** (cromáticas): C → E♭ → G♭, muy usada en cine.\n\n**Pedal armónico**: una nota (bajo) se mantiene mientras las armonías encima cambian; suele ser la **tónica** (inicio) o la **dominante** (tensión previa a una cadencia). Crea estabilidad o expectación.' },
      chordSeqExample('Modulación directa (un tono arriba)', 'C – F – G7 – C, y sin más, D – G – A7 – D. Gran efecto en el estribillo final.', [['C', 'maj'], ['F', 'maj'], ['G', '7'], ['C', 'maj'], ['D', 'maj'], ['G', 'maj'], ['A', '7'], ['D', 'maj']], 1.5),
      chordSeqExample('Por dim7', 'Bdim7 puede ser vii°7 de C, E♭, G♭ o A (menores/mayores). Aquí lo usamos para ir de C a E♭: C – Bdim7 – E♭.', [['C', 'maj'], ['B', 'dim7'], ['Eb', 'maj']], 2),
      customExample('Pedal de tónica', 'El Do grave se mantiene mientras suenan C – F/C – C – G/C – C.', [
        { notes: ['C2', 'C3', 'E4', 'G4', 'C5'], beats: 2 }, { notes: ['C2', 'C3', 'F4', 'A4', 'C5'], beats: 2 }, { notes: ['C2', 'C3', 'E4', 'G4', 'C5'], beats: 2 }, { notes: ['C2', 'C3', 'D4', 'G4', 'B4'], beats: 2 }, { notes: ['C2', 'C3', 'E4', 'G4', 'C5'], beats: 3 },
      ], 72, undefined, 'Pedal de Do'),
      customExample('Pedal de dominante', 'El Sol grave aguanta mientras los acordes superiores se mueven (I – IV – I – ii…): tensión máxima antes de la resolución a C.', [
        { notes: ['G2', 'G3', 'D4', 'G4', 'B4'], beats: 2 }, { notes: ['G2', 'G3', 'C4', 'F4', 'A4'], beats: 2 }, { notes: ['G2', 'G3', 'D4', 'G4', 'B4'], beats: 2 }, { notes: ['C3', 'E4', 'G4', 'C5'], beats: 3 },
      ], 72, undefined, 'Pedal de dominante → I'),
      tryNotes('Toca el acorde pivote enarmónico Si dim7: Si, Re, Fa, La♭.', ['B', 'D', 'F', 'Ab'], 'set'),
    ],
    practiceTip: 'Toca el mismo dim7 y resuélvelo a cuatro tonalidades distintas subiendo una de sus notas por semitono. Después añade un pedal de tónica a una progresión que ya sepas.',
    practice: [{ gen: 'seventh-build', count: 3, difficulty: 3, params: { qualities: ['dim7'] } }, { gen: 'progression-analysis', count: 3, difficulty: 3 }],
    quiz: [
      Q('Un pedal armónico es…', ['Una nota mantenida en el bajo mientras los acordes cambian', 'El pedal del piano', 'Una escala', 'Un tipo de cadencia'], 0, 'La nota grave se mantiene y la armonía varía por encima.'),
      Q('Un acorde dim7 puede…', ['Resolver a varias tonalidades', 'Solo resolver a su tónica', 'Convertirse en V', 'No modular'], 0, 'Por su simetría, cada nota puede ser la sensible.'),
    ],
    mistakes: ['Pensar que el pedal armónico y el pedal del piano son lo mismo.', 'Modular directamente sin considerar la relación entre tonalidades.'],
  }),

  L({
    id: 'n4-10', order: 10, title: 'Análisis comparado: clásico, jazz, pop y cine', minutes: 22, prerequisites: ['n4-06', 'n3-05'], covers: ['N4.20'],
    objective: 'Comparar cómo resuelven la misma necesidad armónica el repertorio clásico, el jazz, el pop y la música cinematográfica.',
    blocks: [
      { type: 'text', title: 'Cuatro lenguajes con raíces comunes', body: 'Los cuatro estilos comparten fundamentos (tónica, dominante, cadencias) pero los **usan distinto**:\n\n- **Clásico**: funciones claras, conducción de voces estricta, modulaciones planificadas, cadencias con sensible.\n- **Jazz**: acordes con séptimas y extensiones, ii–V–I como unidad, sustituciones, voicings rootless, modulación frecuente por ii–V.\n- **Pop**: pocas progresiones repetidas (I–V–vi–IV), tríadas simples, acordes sus/add, préstamo modal ocasional, la melodía lleva el peso.\n- **Cine/videojuegos**: relaciones **mediantes cromáticas** (C → E♭, C → A♭), modos (lidio para asombro, frigio para tensión), pedales y pocas funciones tradicionales; importa el **color** y el efecto.\n\nLa técnica es la misma: escuchar *qué hace* el acorde, no solo cómo se llama.' },
      progExample('Clásico', 'I – IV – V7 – I: funciones claras y cadencia auténtica con sensible. En el Clasicismo es habitual anteponer al V7 un I en segunda inversión (el «6/4 cadencial»).', ['I', 'IV', 'V7', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Jazz (turnaround)', 'Imaj7 – vi7 – ii7 – V7: el turnaround clásico, en quintas descendentes (vi–ii–V).', ['Imaj7', 'vi7', 'ii7', 'V7'], { tonic: 'C', mode: 'major' }),
      progExample('Pop', 'I – V – vi – IV: la progresión más usada de las últimas décadas.', ['I', 'V', 'vi', 'IV'], { tonic: 'C', mode: 'major' }),
      chordSeqExample('Cine (mediantes cromáticas)', 'C – A♭ – E♭ – B♭ (o C – E♭ – G♭): relaciones de tercera cromática que producen asombro y épica.', [['C', 'maj'], ['Ab', 'maj'], ['Eb', 'maj'], ['Bb', 'maj']], 2),
      chordSeqExample('Cine (lidio)', 'C – D – C: el acorde mayor de II sobre tónica evoca ensoñación (modo lidio).', [['C', 'maj'], ['D', 'maj'], ['C', 'maj']], 2),
      { type: 'callout', kind: 'note', title: 'Dominio público', body: 'Los ejemplos de esta lección son esquemas armónicos propios, no obras con derechos. Al analizar música con derechos de autor, hazlo siempre sobre tus propias transcripciones.' },
    ],
    practiceTip: 'Elige una pieza de cada estilo y escribe sus primeros ocho compases en números romanos. Observa cuántos acordes distintos usa y qué relaciones se repiten.',
    practice: [{ gen: 'progression-analysis', count: 3, difficulty: 2 }, { gen: 'degree-function', count: 3, difficulty: 3 }],
    quiz: [
      Q('Una característica típica de la armonía de cine es…', ['Las relaciones mediantes cromáticas', 'Los coros luteranos', 'El uso exclusivo de dominantes', 'La falta de modos'], 0, 'C → E♭ o C → A♭ evocan asombro, épica o misterio.'),
      Q('El pop moderno se caracteriza armónicamente por…', ['Pocas progresiones repetidas con tríadas', 'Modulaciones constantes', 'Cromatismo continuo', 'Acordes de 13ª'], 0, 'I–V–vi–IV y similares dominan.'),
      Q('El jazz usa preferentemente…', ['Séptimas y extensiones con ii–V–I', 'Solo tríadas', 'Armonía modal siempre', 'Sin dominantes'], 0, 'El ii–V–I es su unidad básica.'),
    ],
    mistakes: ['Pensar que un estilo es «mejor» que otro: son lenguajes con objetivos distintos.', 'Aplicar las reglas de uno al otro sin criterio (por ejemplo, evitar las quintas paralelas en rock).'],
  }),
]
