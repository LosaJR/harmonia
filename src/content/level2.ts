import { C, N, R } from '../exercises/rich'
import { chordExample, customExample, noteExample, progExample, Q, tryChord } from './helpers'
import type { Lesson } from './types'

const L = (l: Omit<Lesson, 'level' | 'passScore'> & { passScore?: number }): Lesson => ({ level: 2, passScore: 0.7, ...l })

export const LEVEL2: Lesson[] = [
  L({
    id: 'n2-01', order: 1, title: 'Qué es un acorde: las cuatro tríadas', minutes: 18, prerequisites: ['n1-07', 'n1-08'], covers: ['N2.1', 'N2.2', 'N2.3'],
    objective: 'Construir tríadas mayores, menores, disminuidas y aumentadas apilando terceras.',
    blocks: [
      { type: 'text', title: 'Apilar terceras', body: 'Un **acorde** son tres o más notas que suenan a la vez. La base de la armonía occidental es la **tríada**: tres notas apiladas **por terceras**. Se nombran por su posición:\n\n- **Fundamental** (la nota que da nombre al acorde)\n- **Tercera** (a una 3ª de la fundamental)\n- **Quinta** (a una 5ª de la fundamental)\n\nEn la escritura, las terceras ocupan **letras alternas**: Do–Mi–Sol (no Do–Fa♭–Sol). Por eso el acorde de Re♭ mayor es Re♭–Fa–La♭, y nunca Re♭–Mi♯–La♭.' },
      { type: 'text', title: 'Cuatro calidades', body: 'La **calidad** depende de cómo se combinan las dos terceras:\n\n- **Mayor**: 3ª mayor + 3ª menor (5ª justa) · Do–Mi–Sol. Sonido brillante.\n- **Menor**: 3ª menor + 3ª mayor (5ª justa) · Do–Mi♭–Sol. Sonido oscuro.\n- **Disminuida**: 3ª menor + 3ª menor (5ª disminuida) · Do–Mi♭–Sol♭. Tensa e inestable.\n- **Aumentada**: 3ª mayor + 3ª mayor (5ª aumentada) · Do–Mi–Sol♯. Flotante, ambigua.' },
      chordExample('Do mayor', `${N('C')} – ${N('E')} – ${N('G')}: 3ª mayor + 3ª menor.`, 'C', 'maj'),
      chordExample('Do menor', `${N('C')} – ${N('Eb')} – ${N('G')}: baja la tercera un semitono.`, 'C', 'min'),
      chordExample('Do disminuido', `${N('C')} – ${N('Eb')} – ${N('Gb')}: también baja la quinta.`, 'C', 'dim'),
      chordExample('Do aumentado', `${N('C')} – ${N('E')} – ${N('G#')}: sube la quinta.`, 'C', 'aug'),
      tryChord('Toca La menor: La, Do y Mi.', 'A', 'min'),
    ],
    practiceTip: 'Construye las cuatro tríadas sobre Do, Fa y Sol. Para cada una: primero la mayor, luego «baja la 3ª» para la menor, «baja la 5ª» para la disminuida, «sube la 5ª» desde la mayor para la aumentada.',
    practice: [{ gen: 'triad-build', count: 4, difficulty: 1 }, { gen: 'triad-build', count: 3, difficulty: 2 }, { gen: 'chord-id', count: 3, difficulty: 1 }, { gen: 'aural-chord', count: 3, difficulty: 1 }],
    quiz: [
      Q('Una tríada menor se forma con…', ['3ª menor + 3ª mayor', '3ª mayor + 3ª menor', '3ª menor + 3ª menor', '3ª mayor + 3ª mayor'], 0, 'Menor: primero la tercera menor (que da el color) y luego la mayor.'),
      Q('¿Qué tríada tiene dos terceras menores seguidas?', ['Mayor', 'Menor', 'Disminuida', 'Aumentada'], 2, 'Disminuida = 3ª menor + 3ª menor (5ª disminuida).'),
    ],
    mistakes: ['Escribir Do–Re♯–Sol en lugar de Do–Mi♭–Sol: las notas del acorde se escriben en letras alternas.', 'Confundir disminuida con menor: la menor conserva la 5ª justa.'],
  }),

  L({
    id: 'n2-02', order: 2, title: 'Estado fundamental e inversiones', minutes: 16, prerequisites: ['n2-01'], covers: ['N2.4'],
    objective: 'Reconocer y tocar un acorde en estado fundamental y en sus inversiones, identificando la nota del bajo.',
    blocks: [
      { type: 'text', title: 'La misma tríada, distinto bajo', body: 'Un acorde está en **estado fundamental** cuando su nota más grave es la fundamental. Si colocas otra nota abajo, el acorde sigue siendo el mismo pero **invertido**:\n\n- **1ª inversión**: la 3ª en el bajo (cifra **6**). Do–Mi–Sol → **Mi**–Sol–Do.\n- **2ª inversión**: la 5ª en el bajo (cifra **6/4**). → **Sol**–Do–Mi.\n\nSe indica con el bajo tras una barra: {{c:C/E}} (Do mayor con Mi en el bajo), {{c:C/G}}.' },
      chordExample('Estado fundamental', `${C('C')} con ${N('C4')} en el bajo: máxima estabilidad.`, 'C', 'maj'),
      chordExample('Primera inversión', `${C('C/E')}: sube la fundamental una octava. Suena más ligero y fluido.`, 'C', 'maj', { inv: 1 }),
      chordExample('Segunda inversión', `${C('C/G')}: el bajo es la quinta. Suena inestable; se usa en cadencias y como nota de paso.`, 'C', 'maj', { inv: 2 }),
      tryChord('Toca Do mayor en primera inversión: el bajo debe ser Mi.', 'C', 'maj', 1),
      tryChord('Toca Sol mayor en segunda inversión: el bajo debe ser Re.', 'G', 'maj', 2),
    ],
    practiceTip: 'Toca una tríada y «rótala»: sube la nota más grave una octava, una vez, otra vez. Verás el ciclo completo de tres posiciones sin salir de la zona central del piano.',
    practice: [{ gen: 'inversion-id', count: 4, difficulty: 1 }, { gen: 'inversion-build', count: 4, difficulty: 1 }],
    quiz: [
      Q('¿Cuál es el bajo de Sol mayor en primera inversión?', ['Sol', 'Si', 'Re', 'Fa♯'], 1, 'La 1ª inversión pone la tercera en el bajo: Si.'),
      Q('La nota del bajo de la 2ª inversión es…', ['La fundamental', 'La tercera', 'La quinta', 'La séptima'], 2, 'Segunda inversión → quinta en el bajo (6/4).'),
    ],
    mistakes: ['Pensar que la inversión cambia el nombre del acorde: sigue siendo Do mayor; solo cambia el bajo.', 'Invertir cambiando solo la nota superior: hay que mover la nota más grave.'],
  }),

  L({
    id: 'n2-03', order: 3, title: 'Acordes de séptima', minutes: 22, prerequisites: ['n2-02'], covers: ['N2.5', 'N2.6'],
    objective: 'Construir y reconocer maj7, 7, m7, m7♭5 y dim7 añadiendo una cuarta nota por terceras.',
    blocks: [
      { type: 'text', title: 'Una tercera más', body: 'Si apilas otra tercera sobre una tríada obtienes un **acorde de séptima**. El nuevo intervalo con la fundamental es una 7ª, mayor o menor, y define el carácter:\n\n- **maj7** (Do–Mi–Sol–Si): tríada mayor + 7ª mayor. Suave y luminoso.\n- **7** (dominante, Sol–Si–Re–Fa): tríada mayor + 7ª menor. Tenso, pide resolver. Es el acorde del grado V.\n- **m7** (Re–Fa–La–Do): tríada menor + 7ª menor. Cálido y relajado.\n- **m7♭5** (semidisminuido, Si–Re–Fa–La): tríada disminuida + 7ª menor.\n- **dim7** (Si–Re–Fa–La♭): tríada disminuida + 7ª disminuida (tres terceras menores).\n- **m(maj7)**: tríada menor + 7ª mayor, color misterioso.' },
      chordExample('Do maj7', `${N('C')} ${N('E')} ${N('G')} ${N('B')}`, 'C', 'maj7'),
      chordExample('Sol 7 (dominante)', `${N('G')} ${N('B')} ${N('D')} ${N('F')}: contiene el tritono Si–Fa que pide resolución a Do.`, 'G', '7'),
      chordExample('Re m7', `${N('D')} ${N('F')} ${N('A')} ${N('C')}`, 'D', 'm7'),
      chordExample('Si m7♭5', `${N('B')} ${N('D')} ${N('F')} ${N('A')}: el acorde del grado VII en Do mayor.`, 'B', 'm7b5'),
      chordExample('Si dim7', `${N('B')} ${N('D')} ${N('F')} ${N('Ab')}: simétrico (todo terceras menores). La séptima disminuida suena como una 6ª mayor pero se escribe La♭.`, 'B', 'dim7'),
      tryChord('Toca Sol7: Sol, Si, Re y Fa.', 'G', '7'),
      tryChord('Toca La m7: La, Do, Mi y Sol.', 'A', 'm7'),
    ],
    practiceTip: 'Toma una tríada que domines y añade la séptima: primero «medio tono bajo la octava» (7ª mayor, maj7) y después «un tono bajo la octava» (7ª menor, 7 o m7). Escucha cuál es más «cerrado».',
    practice: [{ gen: 'seventh-build', count: 4, difficulty: 1 }, { gen: 'seventh-build', count: 3, difficulty: 2 }, { gen: 'chord-id', count: 3, difficulty: 2 }, { gen: 'aural-chord', count: 3, difficulty: 3 }],
    quiz: [
      Q('Sol7 contiene el intervalo de tritono entre…', ['Sol y Re', 'Si y Fa', 'Re y Fa', 'Sol y Fa'], 1, 'Tercera (Si) y séptima (Fa) forman un tritono: es lo que da la tensión dominante.'),
      Q('Cmaj7 está formado por…', ['C E G B', 'C E G B♭', 'C E♭ G B♭', 'C E♭ G♭ B♭'], 0, 'Tríada mayor con séptima mayor (Si).'),
      Q('El acorde que se escribe con tres terceras menores es…', ['dim7', 'm7♭5', 'maj7', 'm7'], 0, 'dim7 = m3 + m3 + m3.'),
    ],
    mistakes: ['Confundir «Do7» con «Cmaj7»: 7 es la séptima menor (Si♭); maj7 la mayor (Si).', 'Escribir la séptima del Bdim7 como Sol♯ en lugar de La♭: la séptima disminuida lleva letra de séptima (A), aunque suene como una sexta mayor.'],
  }),

  L({
    id: 'n2-04', order: 4, title: 'Suspendidos y añadidos', minutes: 14, prerequisites: ['n2-03'], covers: ['N2.7'],
    objective: 'Construir acordes sus2, sus4, add9 y con sexta añadida y entender su función dentro de la armonía.',
    blocks: [
      { type: 'text', title: 'Cambiar o sumar una nota', body: 'No todos los acordes son terceras apiladas:\n\n- **Suspendidos**: sustituyen la 3ª por otra nota. **sus2** (Do–Re–Sol) y **sus4** (Do–Fa–Sol). Al no tener 3ª no son ni mayores ni menores: suenan abiertos y «en suspenso». La sus4 suele **resolver** bajando la 4ª a 3ª (Csus4 → C).\n- **Añadidos**: se suma una nota a la tríada sin incluir la 7ª. **add9** (Do–Mi–Sol–Re) añade la novena; **6** (Do–Mi–Sol–La) añade la sexta mayor; **m6** añade la 6ª al acorde menor.' },
      chordExample('Csus4', `${N('C')} ${N('F')} ${N('G')}: la cuarta sustituye a la tercera.`, 'C', 'sus4'),
      chordExample('Csus2', `${N('C')} ${N('D')} ${N('G')}: la segunda sustituye a la tercera.`, 'C', 'sus2'),
      chordExample('Cadd9', `${N('C')} ${N('E')} ${N('G')} ${N('D')}: la novena se coloca encima de la quinta sin séptima.`, 'C', 'add9'),
      chordExample('C6', `${N('C')} ${N('E')} ${N('G')} ${N('A')}: tríada mayor con sexta. Equivale a Am7 con Do en el bajo.`, 'C', '6'),
      { type: 'callout', kind: 'tip', title: 'Resolución típica', body: 'Toca Csus4 y después C: la nota Fa baja a Mi. Esa tensión y reposo mínimo es una de las fórmulas más usadas del pop.' },
      tryChord('Toca Do sus4: Do, Fa y Sol.', 'C', 'sus4'),
    ],
    practiceTip: 'Sobre una misma fundamental, toca mayor → sus4 → mayor → sus2 → mayor. Escucha cómo desaparece y reaparece la tercera.',
    practice: [{ gen: 'triad-build', count: 4, difficulty: 1, params: { qualities: ['sus2', 'sus4', 'add9', '6', 'm6'] } }],
    quiz: [
      Q('Un acorde sus4 sustituye…', ['La 3ª por la 4ª', 'La 5ª por la 4ª', 'La fundamental', 'La 7ª por la 4ª'], 0, 'En sus4 la tercera se reemplaza por la cuarta justa.'),
      Q('¿Qué diferencia hay entre add9 y un acorde de novena (9)?', ['add9 no incluye la séptima', 'No hay diferencia', 'add9 incluye séptima menor', 'add9 es menor'], 0, 'add9 es tríada + novena. El 9 de dominante incluye la 7ª.'),
    ],
    mistakes: ['Pensar que sus4 es menor porque «no tiene tercera mayor»: no tiene tercera, así que no es mayor ni menor.', 'Confundir 6 con 13: el 6 es sexta añadida a la tríada; el 13 es una extensión de un acorde con séptima.'],
  }),

  L({
    id: 'n2-05', order: 5, title: 'Cifrado americano y números romanos', minutes: 16, prerequisites: ['n2-03'], covers: ['N2.8', 'N2.9'],
    objective: 'Leer y escribir acordes en cifrado americano y analizarlos con números romanos.',
    blocks: [
      { type: 'text', title: 'Cifrado americano', body: 'Un cifrado escribe la **fundamental** (letra), la **calidad** y el **bajo** si cambia:\n\n- Mayor: **C** · menor: **Cm** · disminuido: **Cdim** (o C°) · aumentado: **Caug** (o C+).\n- Séptimas: **Cmaj7** (CΔ), **C7**, **Cm7**, **Cm7♭5** (Cø), **Cdim7**.\n- Suspendidos y añadidos: **Csus4**, **Cadd9**, **C6**.\n- Acorde con bajo distinto (inversión): **C/E**.\n\nUna misma convención puede variar entre autores (Δ, ‑, +, °, ø). Aquí usaremos la más extendida y clara.' },
      { type: 'text', title: 'Números romanos', body: 'Los **números romanos** describen el acorde por su *grado* dentro de la tonalidad, no por sus notas. Eso permite hablar de la misma progresión en cualquier tono.\n\n- **Mayúscula** = acorde mayor (I, IV, V); **minúscula** = menor (ii, iii, vi).\n- **°** disminuido (vii°), **+** aumentado (III+), **ø** semidisminuido.\n- Las séptimas se añaden: V7, ii7, Imaj7.\n\nEjemplo: en Do mayor, {{r:ii}} es Dm y {{r:V7}} es G7; en Sol mayor, {{r:ii}} es Am y {{r:V7}} es D7.' },
      progExample('I–IV–V–I en Do mayor', 'Cifrado: C – F – G – C. En números romanos: I – IV – V – I.', ['I', 'IV', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('I–IV–V–I en Sol mayor', 'Cifrado: G – C – D – G. Mismos romanos, otro tono.', ['I', 'IV', 'V', 'I'], { tonic: 'G', mode: 'major' }),
      tryChord('Toca el acorde vi de Do mayor (La menor).', 'A', 'min'),
    ],
    practiceTip: 'Elige una canción sencilla y escribe sus acordes en dos tonalidades distintas con cifrado americano. Después escribe los números romanos: deben coincidir.',
    practice: [{ gen: 'chord-id', count: 3, difficulty: 2 }, { gen: 'degree-function', count: 5, difficulty: 1 }],
    quiz: [
      Q('En Do mayor, el acorde «V7» es…', ['G7', 'F7', 'D7', 'A7'], 0, 'V = grado 5 = Sol; con séptima de dominante: Sol7.'),
      Q('¿Qué indica la minúscula en «vi»?', ['Que el acorde es menor', 'Que es más grave', 'Que es disminuido', 'Que es aumentado'], 0, 'Las minúsculas representan acordes menores.'),
    ],
    mistakes: ['Cifrar «C7» queriendo decir «Cmaj7»: son acordes con color muy distinto.', 'Olvidar que los romanos dependen de la tonalidad: V7 no es siempre «G7».'],
  }),

  L({
    id: 'n2-06', order: 6, title: 'Armonizar la escala mayor', minutes: 18, prerequisites: ['n2-05', 'n1-10'], covers: ['N2.10'],
    objective: 'Construir los siete acordes diatónicos (tríadas y séptimas) de cualquier tonalidad mayor.',
    blocks: [
      { type: 'text', title: 'Un acorde por cada grado', body: '**Armonizar** una escala es construir un acorde sobre cada grado usando solo notas de la escala. En cualquier tonalidad mayor el resultado es siempre:\n\n**Grados: I · ii · iii · IV · V · vi · vii°**\n\n- Tríadas: **mayor** (I, IV, V), **menor** (ii, iii, vi) y **disminuida** (vii°).\n- Séptimas: **Imaj7, ii7, iii7, IVmaj7, V7, vi7, viiø7**.\n\nEn Do mayor: C – Dm – Em – F – G – Am – Bdim. Sus séptimas: Cmaj7 – Dm7 – Em7 – Fmaj7 – G7 – Am7 – Bm7♭5.' },
      progExample('Do mayor armonizada (tríadas)', 'C – Dm – Em – F – G – Am – Bdim, de grado en grado.', ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], { tonic: 'C', mode: 'major' }, 1.5),
      progExample('Sol mayor armonizada (séptimas)', 'Gmaj7 – Am7 – Bm7 – Cmaj7 – D7 – Em7 – F♯m7♭5. Mismo patrón, otro tono.', ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'], { tonic: 'G', mode: 'major' }, 1.5),
      { type: 'callout', kind: 'tip', title: 'Una sola vez, todas las tonalidades', body: 'Memoriza el patrón **M m m M M m dim** (mayor-menor-menor-mayor-mayor-menor-disminuido). Funciona en las doce tonalidades; solo cambian los nombres.' },
      tryChord('Toca el acorde IV de Re mayor: Sol mayor.', 'G', 'maj'),
      tryChord('Toca el acorde vi de Mi♭ mayor: Do menor.', 'C', 'min'),
    ],
    practiceTip: 'Armoniza una escala por semana: toca cada acorde en estado fundamental, de grado en grado, y di su número romano. Después alterna el orden (I–V–vi–IV, ii–V–I).',
    practice: [{ gen: 'degree-function', count: 5, difficulty: 1 }, { gen: 'degree-function', count: 4, difficulty: 2 }, { gen: 'triad-build', count: 3, difficulty: 2 }],
    quiz: [
      Q('Los acordes menores de una tonalidad mayor son…', ['ii, iii, vi', 'I, IV, V', 'ii, IV, vi', 'iii, V, vii°'], 0, 'ii, iii y vi son menores; I, IV y V son mayores.'),
      Q('¿Qué acorde es el vii° en Do mayor?', ['Si disminuido', 'Si menor', 'Si mayor', 'Si♭ mayor'], 0, 'Bdim (Si–Re–Fa).'),
    ],
    mistakes: ['Usar V mayor en el grado ii: en una tonalidad mayor ii es menor (Re menor en Do).', 'Olvidar que cambia la armadura al cambiar de tonalidad (Si mayor tiene cinco sostenidos).'],
  }),

  L({
    id: 'n2-07', order: 7, title: 'Armonizar las escalas menores', minutes: 18, prerequisites: ['n2-06', 'n1-09'], covers: ['N2.11'],
    objective: 'Construir los acordes diatónicos del modo menor (natural, armónico y melódico) y explicar por qué cambian.',
    blocks: [
      { type: 'text', title: 'Tres armonizaciones para un mismo modo', body: 'El modo menor no tiene una única armonización, porque su escala cambia:\n\n- **Menor natural** (La menor): Am – Bdim – C – Dm – Em – F – G → **i ii° III iv v VI VII**.\n- **Menor armónica**: sube el 7º grado → **V mayor** (E o E7) y **vii°** (G♯dim); además **III+** (Caug). Es la que da la cadencia clásica V–i.\n- **Menor melódica** (ascendente): Am – Bm – C+ – D – E – F♯dim – G♯dim → i ii III+ IV V vi° vii°.\n\nEn la práctica se mezclan: el pop usa muchas veces **v menor** y **VII mayor** (natural); la música clásica y el jazz usan **V(7) mayor** (armónica).' },
      progExample('La menor natural', 'Am – Bdim – C – Dm – Em – F – G.', ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], { tonic: 'A', mode: 'minor' }, 1.5),
      progExample('Cadencia clásica en La menor', 'i – iv – V – i con la dominante mayor (E) gracias a Sol♯.', ['i', 'iv', 'V', 'i'], { tonic: 'A', mode: 'minor' }),
      progExample('Andaluza', 'i – VII – VI – V: descenso de Am a E pasando por G y F. Típica de la música española.', ['i', 'VII', 'VI', 'V'], { tonic: 'A', mode: 'minor' }),
      { type: 'callout', kind: 'style', title: 'Contexto', body: 'Elegir entre v y V no es «correcto o incorrecto»: es una decisión de estilo. V mayor crea más tensión y una resolución más fuerte; v menor suena modal y más suave.' },
      tryChord('Toca Mi mayor (la dominante de La menor armónica): Mi, Sol♯ y Si.', 'E', 'maj'),
    ],
    practiceTip: 'Toca i–iv–V–i en La menor, Mi menor y Re menor. Después cambia V por v y escucha cuánto pierde de empuje.',
    practice: [{ gen: 'degree-function', count: 5, difficulty: 3 }, { gen: 'complete-progression', count: 3, difficulty: 2 }, { gen: 'scale-build', count: 2, difficulty: 3, params: { scales: ['harmonic minor'], tonics: ['A', 'D', 'E'] } }],
    quiz: [
      Q('En menor armónica, el acorde del quinto grado es…', ['Mayor', 'Menor', 'Disminuido', 'Aumentado'], 0, 'La sensible convierte v en V mayor.'),
      Q('El acorde III de La menor natural es…', ['Do mayor', 'Do menor', 'Do aumentado', 'Do disminuido'], 0, 'En natural: C (Do–Mi–Sol).'),
    ],
    mistakes: ['Pensar que la armadura contiene el Sol♯: es una alteración accidental que se añade cuando hace falta.', 'Usar iii en lugar de III: en menor natural el tercer grado es mayor (III).'],
  }),

  L({
    id: 'n2-08', order: 8, title: 'Funciones: tónica, predominante y dominante', minutes: 16, prerequisites: ['n2-06'], covers: ['N2.12'],
    objective: 'Agrupar los acordes por funciones armónicas y comprender el flujo de tensión y reposo.',
    blocks: [
      { type: 'text', title: 'Tres roles', body: 'Los acordes no son una lista: cumplen **funciones**.\n\n- **Tónica (T)**: reposo y estabilidad. I, y en segundo plano vi y iii.\n- **Predominante (PD)**: aleja de la tónica y prepara la dominante. IV y ii.\n- **Dominante (D)**: máxima tensión, pide volver a la tónica. V, V7 y vii°.\n\nEl recorrido típico es **T → PD → D → T**. Un acorde puede sustituir a otro de su misma función (vi por I, ii por IV, vii° por V7) sin romper la lógica.' },
      progExample('T → PD → D → T', 'I – IV – V – I: cada acorde cumple una función distinta.', ['I', 'IV', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Sustituyendo funciones', `Mismo recorrido con acordes de la misma función: I → ii → V → I (${R('ii')} reemplaza a ${R('IV')}).`, ['I', 'ii', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      { type: 'callout', kind: 'warning', title: 'Reglas que no son leyes', body: 'Las funciones describen tendencias, no reglas absolutas. V → IV (retroceso) existe en muchísimas canciones de rock y blues; simplemente tiene otro efecto expresivo.' },
      tryChord('Toca el acorde de dominante en Do mayor (G).', 'G', 'maj'),
    ],
    practiceTip: 'Toca acordes al azar de la tonalidad y di «T», «PD» o «D» antes de pulsarlos. Después encadena T–PD–D–T con acordes distintos cada vez.',
    practice: [{ gen: 'degree-function', count: 5, difficulty: 2 }, { gen: 'complete-progression', count: 4, difficulty: 1 }],
    quiz: [
      Q('¿Qué función cumple el acorde IV?', ['Tónica', 'Predominante', 'Dominante', 'Ninguna'], 1, 'IV (y ii) es predominante.'),
      Q('¿Qué dos acordes tienen función de dominante?', ['V y vii°', 'ii y IV', 'I y vi', 'iii y vi'], 0, 'V y vii° contienen la sensible y piden resolver a la tónica.'),
      Q('La función del acorde vi es…', ['Tónica (sustituta)', 'Dominante', 'Predominante', 'Ninguna'], 0, 'vi comparte dos notas con I: función de tónica.'),
    ],
    mistakes: ['Ver el análisis como obligatorio: describe, no prescribe.', 'Cambiar la función por solo el nombre del acorde: depende del contexto.'],
  }),

  L({
    id: 'n2-09', order: 9, title: 'Progresiones y cadencias', minutes: 20, prerequisites: ['n2-08'], covers: ['N2.13', 'N2.14'],
    objective: 'Reconocer las cadencias auténtica, plagal, semicadencia y rota, y tocar las progresiones más habituales.',
    blocks: [
      { type: 'text', title: 'Cadencias: puntuación musical', body: 'Una **cadencia** es la fórmula de dos acordes que cierra una frase, como un punto o una coma:\n\n- **Auténtica**: V(7) → I. Reposo total (la más fuerte si ambos están en estado fundamental y la melodía acaba en la tónica).\n- **Plagal**: IV → I. El «amén», más suave.\n- **Semicadencia**: termina en V. Queda abierta, como una coma o una pregunta.\n- **Rota (de engaño)**: V → vi. Promete la tónica pero llega a otro acorde.' },
      progExample('Auténtica', 'V → I: sensible sube a la tónica, Fa baja a Mi.', ['I', 'IV', 'V', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Plagal', 'IV → I: «amén».', ['I', 'V', 'IV', 'I'], { tonic: 'C', mode: 'major' }),
      progExample('Semicadencia', 'Termina en V: sin resolver.', ['I', 'IV', 'V'], { tonic: 'C', mode: 'major' }),
      progExample('Rota', 'V → vi: sorpresa en el último acorde.', ['I', 'IV', 'V', 'vi'], { tonic: 'C', mode: 'major' }),
      { type: 'text', title: 'Progresiones habituales', body: '- **I–IV–V–I**: base del rock, blues, himnos.\n- **ii–V–I**: eje del jazz.\n- **I–V–vi–IV**: columna vertebral del pop moderno.\n- **I–vi–IV–V**: «doo-wop» de los años 50.\n- **vi–IV–I–V**: la misma progresión de pop, empezando por la relativa menor.' },
      progExample('ii–V–I', 'Dm – G – C: predominante, dominante, tónica.', ['ii7', 'V7', 'Imaj7'], { tonic: 'C', mode: 'major' }, 3),
      progExample('I–V–vi–IV', 'C – G – Am – F.', ['I', 'V', 'vi', 'IV'], { tonic: 'C', mode: 'major' }, 2),
      tryChord('Toca Sol7, la dominante que resuelve a Do.', 'G', '7'),
    ],
    practiceTip: 'Elige tres tonalidades y toca I–IV–V–I, ii–V–I y I–V–vi–IV en cada una, con bajo en la izquierda y tríada en la derecha. Después transpón cada progresión a medio tono.',
    practice: [{ gen: 'aural-cadence', count: 4, difficulty: 2 }, { gen: 'complete-progression', count: 3, difficulty: 1 }, { gen: 'progression-analysis', count: 4, difficulty: 1 }],
    quiz: [
      Q('La cadencia rota es…', ['V → vi', 'V → I', 'IV → I', 'I → V'], 0, 'En la rota el acorde de llegada es vi, no I.'),
      Q('Una semicadencia acaba en…', ['I', 'V', 'IV', 'vi'], 1, 'Acaba en el acorde de dominante.'),
      Q('El «amén» de las iglesias es una cadencia…', ['Plagal', 'Auténtica', 'Rota', 'Semicadencia'], 0, 'IV → I.'),
    ],
    mistakes: ['Llamar «cadencia» a cualquier progresión: la cadencia son los acordes finales de una frase.', 'Pensar que V→vi es un error: es un engaño deliberado.'],
  }),

  L({
    id: 'n2-10', order: 10, title: 'Bajo invertido y acompañamiento a dos manos', minutes: 22, prerequisites: ['n2-09', 'n2-02'], covers: ['N2.15', 'N2.16'],
    objective: 'Usar acordes invertidos para suavizar la línea del bajo y construir un acompañamiento sencillo con ambas manos.',
    blocks: [
      { type: 'text', title: 'Bajo y acordes en dos manos', body: 'Un acompañamiento básico reparte el trabajo: la **mano izquierda** toca el **bajo** (la fundamental, o una octava) y la **derecha** toca el acorde en una posición cómoda. Para evitar saltos en el bajo usamos **inversiones**: por ejemplo, en vez de ir de C a G con salto de quinta, tocamos {{c:C}} – {{c:G/B}} – {{c:Am}} y el bajo desciende por grados conjuntos: **Do–Si–La**.\n\nUna línea de bajo que se mueve por grados conjuntos suena más cantábile. Esto es lo que se llama **bajo en inversión** o *bajo caminante* en su versión rítmica.' },
      customExample('Bloque: bajo y acorde', 'Mano izquierda: bajo en la fundamental. Mano derecha: tríada. Cada compás de 4 pulsos.', [
        { notes: ['C3', 'E4', 'G4', 'C5'], beats: 2 }, { notes: ['E4', 'G4', 'C5'], beats: 2 }, { notes: ['F2', 'F4', 'A4', 'C5'], beats: 2 }, { notes: ['F4', 'A4', 'C5'], beats: 2 },
        { notes: ['G2', 'D4', 'G4', 'B4'], beats: 2 }, { notes: ['D4', 'G4', 'B4'], beats: 2 }, { notes: ['C3', 'E4', 'G4', 'C5'], beats: 4 },
      ], 84, undefined, 'C – F – G – C'),
      customExample('Bajo descendente con inversiones', 'C – G/B – Am – F con el bajo bajando Do–Si–La–Fa. Compara cómo fluye frente a C – G – Am – F.', [
        { notes: ['C3', 'E4', 'G4'], beats: 2 }, { notes: ['B2', 'D4', 'G4'], beats: 2 }, { notes: ['A2', 'C4', 'E4'], beats: 2 }, { notes: ['F2', 'C4', 'F4'], beats: 2 },
      ], 80, undefined, 'C – G/B – Am – F'),
      customExample('Patrón Alberti', 'Un clásico de la mano izquierda: fundamental–quinta–tercera–quinta (Do–Sol–Mi–Sol), muy usado en el periodo clásico.', [
        ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ notes: [['C3', 'G3', 'E3', 'G3'][i % 4]], beats: 0.5 })),
        ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ notes: [['F3', 'C4', 'A3', 'C4'][i % 4]], beats: 0.5 })),
      ], 110, undefined, 'C – F (patrón Alberti)'),
      noteExample('Arpegio ascendente', 'Do–Mi–Sol–Do: acorde «desplegado». Útil en baladas.', ['C3', 'G3', 'C4', 'E4', 'G4', 'C5'], 'melody', 0.5),
      tryChord('Toca Do mayor con Mi en el bajo (1ª inversión) como si fuera la mano izquierda arrancando el acompañamiento.', 'C', 'maj', 1),
      tryChord('Ahora Sol mayor con Si en el bajo.', 'G', 'maj', 1),
    ],
    practiceTip: 'Toca I–IV–V–I en Do mayor: mano izquierda con la fundamental, mano derecha con la tríada más cercana a la anterior. Después repite sustituyendo el IV y el V por inversiones con bajo en Mi y Re.',
    practice: [{ gen: 'inversion-build', count: 3, difficulty: 2 }, { gen: 'transpose-progression', count: 3, difficulty: 1 }],
    quiz: [
      Q('¿Por qué se usan inversiones en el bajo?', ['Para que el bajo se mueva por grados conjuntos', 'Para tocar más fuerte', 'Para cambiar la tonalidad', 'Porque lo exige la armadura'], 0, 'Un bajo conjunto suena más melódico y requiere menos salto.'),
      Q('Un patrón Alberti sobre Do mayor es…', ['Do–Sol–Mi–Sol', 'Do–Mi–Sol–Si', 'Do–Fa–Sol–Do', 'Do–Re–Mi–Fa'], 0, 'Fundamental–quinta–tercera–quinta.'),
    ],
    mistakes: ['Doblar el bajo con la mano derecha: confunde la textura y enturbia el registro grave.', 'Tocar el acorde de la mano derecha demasiado grave (por debajo de Do central en triadas cerradas): suena turbio.'],
  }),
]
