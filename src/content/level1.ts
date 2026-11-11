import { N } from '../exercises/rich'
import { chordExample, customExample, intervalExample, noteExample, Q, scaleExample, tryChord, tryNotes, tryScale } from './helpers'
import type { Lesson } from './types'

const L = (l: Omit<Lesson, 'level' | 'passScore'> & { passScore?: number }): Lesson => ({ level: 1, passScore: 0.7, ...l })

export const LEVEL1: Lesson[] = [
  L({
    id: 'n1-01', order: 1, title: 'Qué es la música: melodía, armonía y ritmo', minutes: 10, prerequisites: [], covers: ['N1.1'],
    objective: 'Distinguir los tres pilares de la música —ritmo, melodía y armonía— y reconocer cada uno al oído.',
    blocks: [
      { type: 'text', title: 'Sonido organizado en el tiempo', body: 'La **música** es sonido organizado en el tiempo. Casi toda la música que conoces se apoya en tres pilares que suenan a la vez:\n\n- **Ritmo**: *cuándo* suenan las cosas y cuánto duran. Es el pulso que marcas con el pie.\n- **Melodía**: *qué notas* suenan una detrás de otra. Es lo que tarareas.\n- **Armonía**: *qué notas* suenan a la vez. Es el «color» de fondo que acompaña a la melodía.' },
      noteExample('Una melodía', 'Cuatro notas una detrás de otra forman una melodía. Escúchala: puedes tararearla.', ['C4', 'E4', 'G4', 'E4', 'C4'], 'melody', 0.75),
      chordExample('Una armonía', `Ahora las mismas notas ${N('C')}, ${N('E')} y ${N('G')} suenan juntas. Eso es un acorde: la base de la armonía.`, 'C', 'maj'),
      customExample('Un ritmo', 'Una sola nota repetida con duraciones distintas: largo, largo, corto-corto-corto-corto, largo. Aquí lo único que cambia es el *cuándo*.', [
        { notes: ['G3'], beats: 1 }, { notes: ['G3'], beats: 1 }, { notes: ['G3'], beats: 0.5 }, { notes: ['G3'], beats: 0.5 }, { notes: ['G3'], beats: 0.5 }, { notes: ['G3'], beats: 0.5 }, { notes: ['G3'], beats: 2 },
      ], 100, ['G3']),
      { type: 'callout', kind: 'note', title: 'Un sistema entre muchos', body: 'Este curso estudia la armonía occidental tonal (clásica, pop y jazz). Es muy potente, pero no es la única forma de organizar los sonidos: muchas músicas del mundo usan otras escalas, afinaciones y sin acordes.' },
      tryChord('Pulsa a la vez las tres teclas del acorde de Do mayor: Do, Mi y Sol.', 'C', 'maj'),
    ],
    practiceTip: 'Pon una canción que te guste. Marca el pulso con el pie (ritmo), tararea la melodía y fíjate en cómo cambian los acordes por debajo (armonía).',
    practice: [],
    quiz: [
      Q('Si tarareas «Cumpleaños feliz» sin acompañamiento, ¿qué pilar estás cantando?', ['Ritmo', 'Melodía', 'Armonía', 'Timbre'], 1, 'Una sucesión de notas, una tras otra, es una melodía.'),
      Q('¿Qué es la armonía?', ['Notas sonando a la vez', 'La velocidad de la pieza', 'Una sola línea de notas', 'La intensidad del sonido'], 0, 'La armonía trata de las notas que suenan simultáneamente (acordes) y de cómo se encadenan.'),
      Q('El pulso que marcas con el pie al escuchar una canción pertenece al…', ['Ritmo', 'Acorde', 'Registro', 'Intervalo'], 0, 'El ritmo organiza el tiempo: el pulso es su base.'),
      Q('Un acorde está formado por…', ['Una sola nota larga', 'Varias notas sonando a la vez', 'Cuatro compases', 'Un solo ritmo'], 1, 'Un acorde reúne tres o más notas sonando juntas.'),
    ],
    mistakes: ['Pensar que armonía y melodía son lo mismo: la melodía es horizontal (notas en el tiempo) y la armonía es vertical (notas juntas).', 'Creer que todo acompañamiento es «solo ritmo»: un acompañamiento también cambia de acordes.'],
  }),

  L({
    id: 'n1-02', order: 2, title: 'El teclado del piano: teclas blancas y negras', minutes: 12, prerequisites: ['n1-01'], covers: ['N1.2', 'N1.3'],
    objective: 'Orientarte en el teclado usando los grupos de teclas negras y localizar cualquier tecla blanca.',
    blocks: [
      { type: 'text', title: 'El patrón que se repite', body: 'El teclado repite siempre el mismo patrón de **12 teclas**: 7 blancas y 5 negras. Las negras se agrupan de **2 en 2** y de **3 en 3**, y esos grupos son tu mapa.\n\n- **Do** es la tecla blanca justo a la izquierda de cada grupo de **dos** negras.\n- **Fa** es la blanca justo a la izquierda de cada grupo de **tres** negras.\n- Entre Do y Fa quedan Re y Mi; después de Fa vienen Sol, La y Si.' },
      scaleExample('Las siete teclas blancas', 'Do–Re–Mi–Fa–Sol–La–Si: tócalas de izquierda a derecha, de Do a Do.', 'C', 'major'),
      noteExample('Los dos grupos de teclas negras', 'Las dos negras del primer grupo (entre Do–Re–Mi) y las tres del segundo (entre Fa–Sol–La–Si).', ['C#4', 'D#4', 'F#4', 'G#4', 'A#4'], 'melody', 0.5),
      { type: 'callout', kind: 'tip', title: 'Truco de orientación', body: 'Cada nota blanca tiene un «vecino negro» a su lado. Las notas **Mi–Fa** y **Si–Do** son las únicas parejas de blancas contiguas *sin* negra entre ellas.' },
      tryNotes('Toca Do, Re y Mi en orden (cualquier octava).', ['C', 'D', 'E'], 'ordered'),
    ],
    practiceTip: 'Cierra los ojos, coloca un dedo en el grupo de dos negras y busca Do con la mano izquierda; después busca Fa partiendo del grupo de tres. Repítelo en tres octavas.',
    practice: [{ gen: 'note-id', count: 6, difficulty: 1 }],
    quiz: [
      Q('¿Dónde está la nota Do?', ['A la izquierda de un grupo de dos teclas negras', 'A la izquierda de un grupo de tres teclas negras', 'Entre las dos negras de un grupo', 'A la derecha de un grupo de tres'], 0, 'Do siempre es la blanca inmediatamente anterior al grupo de dos negras.'),
      Q('¿Cuántas teclas (blancas y negras) forman el patrón que se repite?', ['7', '10', '12', '14'], 2, '7 blancas + 5 negras = 12 teclas por octava.'),
    ],
    mistakes: ['Contar las teclas negras desde el borde del piano en lugar de usar los grupos: usa siempre los grupos de 2 y 3.', 'Confundir Mi–Fa con «tono entero»: entre ellas no hay negra y solo hay un semitono.'],
  }),

  L({
    id: 'n1-03', order: 3, title: 'Nombres de las notas y octavas', minutes: 12, prerequisites: ['n1-02'], covers: ['N1.4', 'N1.5'],
    objective: 'Nombrar las notas en notación latina (Do, Re, Mi…) e internacional (C, D, E…) e identificar su octava (C4 = Do central).',
    blocks: [
      { type: 'text', title: 'Dos formas de decir lo mismo', body: 'Existen dos nomenclaturas equivalentes:\n\n- **Latina**: Do, Re, Mi, Fa, Sol, La, Si.\n- **Internacional (cifrado americano)**: C, D, E, F, G, A, B.\n\nSon la misma escala: **Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B**. En la app puedes elegir cuál ver en *Ajustes*. El cifrado de acordes (C, Dm7, G7…) usa siempre las letras.' },
      { type: 'text', title: 'Octavas y registros', body: 'La misma nota se repite cada **octava** (la octava es la distancia hasta la siguiente nota con el mismo nombre). Para distinguirlas se añade un número: el **Do central** del piano es **C4** (Do4, MIDI 60). Hacia la derecha las notas son más agudas (C5, C6…); hacia la izquierda, más graves (C3, C2…).\n\nEl **registro** es la zona del teclado: grave (bajo, mano izquierda), medio y agudo (melodía, mano derecha). El La de afinación es **A4 = 440 Hz**.' },
      noteExample('Do en cinco octavas', 'La misma nota, cada vez más aguda: C2, C3, C4, C5, C6.', ['C2', 'C3', 'C4', 'C5', 'C6'], 'melody', 0.8),
      noteExample('Do central', `${N('C4')} es el Do central, la referencia que usaremos en todo el curso.`, ['C4'], 'melody', 1.5),
      tryNotes('Toca un La. El La de afinación es A4, justo a la derecha del Do central.', ['A4'], 'set'),
    ],
    practiceTip: 'Toca un Do en cada octava de tu teclado diciendo en voz alta su nombre completo («Do tres, Do cuatro…»). Después haz lo mismo con Sol.',
    practice: [{ gen: 'note-id', count: 4, difficulty: 2 }, { gen: 'note-play', count: 2, difficulty: 1 }, { gen: 'note-play', count: 2, difficulty: 3 }],
    quiz: [
      Q('La nota «E» en notación internacional es…', ['Re', 'Mi', 'Fa', 'La'], 1, 'C D E F G A B = Do Re Mi Fa Sol La Si.'),
      Q('En este curso, ¿qué nota es C4?', ['El Do central del piano', 'El Do más grave', 'El La de afinación', 'Un Si'], 0, 'C4 = Do central = MIDI 60.'),
      Q('¿Qué ocurre al subir una octava?', ['Cambia el nombre de la nota', 'La nota se repite más aguda con el mismo nombre', 'Se añade un sostenido', 'Suena más fuerte'], 1, 'La octava conserva el nombre de la nota; solo cambia el número de registro.'),
    ],
    mistakes: ['Mezclar nomenclaturas: «La» es A, no L. En el cifrado, A es La y B es Si.', 'Olvidar que el número cambia en el Do, no en el La: B3 es el Si justo anterior a C4.'],
  }),

  L({
    id: 'n1-04', order: 4, title: 'Tonos, semitonos y alteraciones', minutes: 14, prerequisites: ['n1-03'], covers: ['N1.6'],
    objective: 'Medir distancias en semitonos y tonos y usar sostenidos y bemoles; reconocer notas enarmónicas.',
    blocks: [
      { type: 'text', title: 'La unidad mínima: el semitono', body: 'El **semitono** es la distancia más pequeña del piano: de una tecla a la **contigua** (blanca o negra). Dos semitonos forman un **tono**.\n\n- Entre **Mi–Fa** y **Si–Do** hay un semitono (no hay negra entre ellas).\n- Entre las demás blancas contiguas hay un tono (la tecla negra intermedia está a un semitono de cada una).' },
      { type: 'text', title: 'Alteraciones', body: 'Las **alteraciones** modifican la altura de una nota:\n\n- **Sostenido (♯)**: sube un semitono.\n- **Bemol (♭)**: baja un semitono.\n- **Becuadro (♮)**: cancela una alteración.\n- Doble sostenido (𝄪) y doble bemol (𝄫) alteran dos semitonos.\n\nLa tecla negra entre Do y Re es **Do♯** *o* **Re♭**: la misma tecla con dos nombres. Se llaman notas **enarmónicas**. Que suenen igual no significa que se escriban igual: en teoría se elige el nombre que respeta la escala y el acorde (lo verás en las escalas).' },
      noteExample('Do♯ y Re♭ suenan igual', 'La misma tecla negra, dos nombres. Escúchalas seguidas: son la misma altura.', ['C#4', 'Db4'], 'melody', 1),
      noteExample('Escala cromática', 'Todos los semitonos de Do a Do: 12 notas distintas.', ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'], 'melody', 0.35),
      tryNotes('Sube de semitono en semitono: toca Do, Do♯ y Re.', ['C', 'C#', 'D'], 'ordered'),
    ],
    practiceTip: 'Elige una tecla blanca y toca el semitono hacia arriba y hacia abajo. Di cada vez si la nota resultante es sostenido o bemol.',
    practice: [{ gen: 'note-id', count: 5, difficulty: 2 }, { gen: 'note-play', count: 3, difficulty: 2 }, { gen: 'staff-note', count: 2, difficulty: 3 }],
    quiz: [
      Q('¿Cuántos semitonos tiene un tono?', ['1', '2', '3', '4'], 1, 'Un tono = dos semitonos.'),
      Q('¿Qué distancia hay entre Mi y Fa?', ['Un semitono', 'Un tono', 'Dos tonos', 'Una tercera'], 0, 'Mi y Fa son blancas contiguas sin negra entre ellas: un semitono.'),
      Q('Do♯ y Re♭ son…', ['Notas enarmónicas', 'Dos teclas distintas', 'Un intervalo de tono', 'La misma nota escrita igual'], 0, 'Misma altura, distinto nombre: enarmonía.'),
      Q('El bemol (♭)…', ['Sube un semitono', 'Baja un semitono', 'Baja un tono', 'Anula la alteración'], 1, 'El bemol baja la nota un semitono.'),
    ],
    mistakes: ['Pensar que todas las teclas negras son sostenidos: pueden ser sostenido o bemol según el contexto.', 'Creer que Mi♯ no existe: Mi♯ suena como Fa y se usa en tonalidades como Fa♯ mayor.'],
  }),

  L({
    id: 'n1-05', order: 5, title: 'El pentagrama y las claves de sol y fa', minutes: 14, prerequisites: ['n1-03'], covers: ['N1.7'],
    objective: 'Leer notas sobre el pentagrama en clave de sol y de fa y localizarlas en el teclado.',
    blocks: [
      { type: 'text', title: 'Cinco líneas, cuatro espacios', body: 'El **pentagrama** son cinco líneas y cuatro espacios que se cuentan de abajo arriba. Cada línea o espacio es una nota; subir al siguiente es subir una letra. Para notas fuera del pentagrama se añaden **líneas adicionales**.\n\nLa **clave** fija qué nota es cuál:\n\n- **Clave de sol** (𝄞): rodea la **segunda línea**, que es **Sol4**. Se usa para la mano derecha y los sonidos agudos.\n- **Clave de fa** (𝄢): sus dos puntos rodean la **cuarta línea**, que es **Fa3**. Se usa para la mano izquierda y los graves.\n\nEl Do central (C4) se escribe en una línea adicional **debajo** de la clave de sol o **encima** de la de fa.' },
      noteExample('Notas en clave de sol', 'Do–Re–Mi–Fa–Sol sobre el pentagrama, de la línea adicional a la cuarta nota.', ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], 'melody', 0.5),
      noteExample('Notas en clave de fa', 'Una octava más grave: de Fa2 a Do4 en clave de fa.', ['F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3'], 'melody', 0.5),
      { type: 'callout', kind: 'tip', title: 'Reglas mnemotécnicas', body: 'Clave de sol, líneas de abajo arriba: **Mi–Sol–Si–Re–Fa**. Espacios: **Fa–La–Do–Mi**. Clave de fa, líneas: **Sol–Si–Re–Fa–La**. Espacios: **La–Do–Mi–Sol**.' },
      tryNotes('Toca las notas escritas en el espacio del pentagrama (clave de sol): Fa, La, Do, Mi (cualquier octava).', ['F', 'A', 'C', 'E'], 'ordered'),
    ],
    practiceTip: 'Escribe (o imagina) un pentagrama con una nota y toca en el piano la tecla que corresponde. Empieza con las notas de las líneas y después con los espacios.',
    practice: [{ gen: 'staff-note', count: 6, difficulty: 1 }, { gen: 'staff-note', count: 4, difficulty: 2 }],
    quiz: [
      Q('La clave de sol marca la nota Sol en la…', ['Primera línea', 'Segunda línea', 'Tercera línea', 'Cuarta línea'], 1, 'La espiral de la clave de sol rodea la segunda línea.'),
      Q('¿En qué clave se escribe normalmente la mano izquierda del piano?', ['Sol', 'Fa', 'Do', 'Ninguna'], 1, 'La clave de fa cubre los graves, mano izquierda.'),
    ],
    mistakes: ['Contar las líneas de arriba abajo: siempre se cuentan de abajo arriba.', 'Confundir las notas de la clave de fa con las de sol: las mismas posiciones representan notas distintas (dos terceras más abajo).'],
  }),

  L({
    id: 'n1-06', order: 6, title: 'Ritmo: figuras, silencios, compases y tempo', minutes: 15, prerequisites: ['n1-01'], covers: ['N1.8'],
    objective: 'Leer la duración de las figuras y silencios, interpretar un compás sencillo y entender el tempo.',
    blocks: [
      { type: 'text', title: 'Figuras: cuánto dura cada nota', body: 'Cada figura dura la mitad que la anterior. Tomando la **negra** como un pulso:\n\n- **Redonda**: 4 pulsos · **Blanca**: 2 · **Negra**: 1 · **Corchea**: ½ · **Semicorchea**: ¼.\n- Un **puntillo** añade la mitad de la duración: negra con puntillo = 1,5 pulsos.\n- Cada figura tiene su **silencio** (redonda, blanca, negra, corchea…) que dura lo mismo pero sin sonido.' },
      { type: 'text', title: 'Compás y tempo', body: 'El **compás** agrupa los pulsos. El quebrado indica cuántos pulsos hay (arriba) y de qué figura (abajo): en **4/4** hay 4 negras por compás; en **3/4**, 3 (vals); en **6/8**, 6 corcheas en dos grupos de tres. El primer pulso es el más fuerte.\n\nEl **tempo** es la velocidad del pulso, medida en pulsos por minuto (bpm): 60 bpm = un pulso por segundo. Palabras clásicas: *Largo* (muy lento), *Andante* (paso tranquilo), *Moderato*, *Allegro* (rápido), *Presto* (muy rápido).' },
      customExample('Redonda, blanca, negras y corcheas', 'Un compás de 4/4 de cada duración sobre Sol: 4 pulsos, 2+2, 1+1+1+1 y 8 corcheas.', [
        { notes: ['G4'], beats: 4 }, { notes: ['G4'], beats: 2 }, { notes: ['G4'], beats: 2 },
        { notes: ['G4'], beats: 1 }, { notes: ['G4'], beats: 1 }, { notes: ['G4'], beats: 1 }, { notes: ['G4'], beats: 1 },
        ...Array.from({ length: 8 }, () => ({ notes: ['G4'], beats: 0.5 })),
      ], 90, ['G4']),
      customExample('Compás de 3/4 (vals)', 'Un pulso fuerte y dos débiles: UNO-dos-tres, UNO-dos-tres. El bajo marca el 1 y los acordes el 2 y 3.', [
        { notes: ['C3'], beats: 1 }, { notes: ['E4', 'G4'], beats: 1 }, { notes: ['E4', 'G4'], beats: 1 },
        { notes: ['G2'], beats: 1 }, { notes: ['D4', 'G4'], beats: 1 }, { notes: ['D4', 'G4'], beats: 1 },
      ], 150),
    ],
    practiceTip: 'Con un metrónomo a 60 bpm, aplaude negras; luego corcheas (dos por pulso); luego un silencio de negra en el tercer pulso. Después tócalo con una sola nota.',
    practice: [],
    quiz: [
      Q('En 4/4, ¿cuántos pulsos dura una blanca?', ['1', '2', '3', '4'], 1, 'La blanca dura 2 negras = 2 pulsos.'),
      Q('Una negra con puntillo dura…', ['1 pulso', '1,5 pulsos', '2 pulsos', '3 pulsos'], 1, 'El puntillo añade la mitad: 1 + ½ = 1,5.'),
      Q('¿Cuántas corcheas caben en una negra?', ['1', '2', '3', '4'], 1, 'Una corchea dura la mitad de una negra.'),
      Q('120 bpm significa…', ['120 pulsos cada minuto', '120 compases cada minuto', '12 pulsos cada minuto', 'Un tempo lento'], 0, 'bpm = pulsos por minuto: 120 bpm son 2 pulsos por segundo.'),
      Q('El compás de 3/4 tiene…', ['3 pulsos de negra', '4 pulsos de negra', '3 corcheas', '3 blancas'], 0, 'Arriba el número de pulsos (3) y abajo la figura (4 = negra).'),
      Q('El silencio de blanca…', ['Dura dos pulsos sin sonido', 'Dura un pulso', 'Hace sonar dos notas', 'No cuenta en el compás'], 0, 'Cada silencio dura lo mismo que su figura.'),
    ],
    mistakes: ['Contar el silencio como «no hay nada»: ocupa tiempo y hay que contarlo.', 'Pensar que el número de abajo del compás es «cuántos compases»: indica la figura que vale un pulso.'],
  }),

  L({
    id: 'n1-07', order: 7, title: 'Intervalos: tamaño, calidad y oído', minutes: 20, prerequisites: ['n1-04', 'n1-05'], covers: ['N1.9', 'N1.10'],
    objective: 'Nombrar un intervalo por su número y su calidad (mayor, menor, justo, aumentado, disminuido), construirlo y reconocerlo al oído.',
    blocks: [
      { type: 'text', title: 'Un intervalo es una distancia', body: 'Un **intervalo** es la distancia entre dos notas. Se nombra con **dos datos**:\n\n1. **Número**: cuenta los *nombres de nota* de la primera a la segunda, incluyéndolas. Do–Mi es una **3ª** (Do-Re-Mi).\n2. **Calidad**: depende de los semitonos. 2ª, 3ª, 6ª y 7ª pueden ser **mayores (M)** o **menores (m)**; 1ª, 4ª, 5ª y 8ª son **justas (P)**.\n\nSi se amplía un semitono un intervalo mayor o justo, queda **aumentado (A)**; si se reduce un semitono uno menor o justo, **disminuido (d)**.' },
      { type: 'text', title: 'Tabla de referencia (desde Do)', body: '- 2m = 1 semitono (Do–Re♭) · 2M = 2 (Do–Re)\n- 3m = 3 (Do–Mi♭) · 3M = 4 (Do–Mi)\n- 4P = 5 (Do–Fa) · 4A / 5d = 6 (el **tritono**)\n- 5P = 7 (Do–Sol)\n- 6m = 8 (Do–La♭) · 6M = 9 (Do–La)\n- 7m = 10 (Do–Si♭) · 7M = 11 (Do–Si)\n- 8P = 12 (Do–Do)\n\nLos intervalos **compuestos** superan la octava: una 9ª es una 2ª más una octava (14 semitonos si es mayor); una 11ª es una 4ª más una octava; una 13ª es una 6ª más una octava.' },
      intervalExample('Tercera mayor y tercera menor', `${N('C4')}–${N('E4')} es una 3ª mayor (4 semitonos): suena luminosa. Si bajas Mi a Mi♭ es una 3ª menor (3 semitonos): más oscura.`, 'C4', '3M'),
      intervalExample('Tercera menor', 'Do–Mi♭ (3 semitonos).', 'C4', '3m'),
      intervalExample('Quinta justa', 'Do–Sol, 7 semitonos: el intervalo más estable después de la octava (como un «hueco» abierto).', 'C4', '5P'),
      intervalExample('Tritono (cuarta aumentada)', 'Fa–Si: 6 semitonos. El intervalo más inestable de la escala; pide resolución. Lo usará la dominante.', 'F4', '4A'),
      tryNotes('Construye una 5ª justa sobre Re: toca Re y La.', ['D', 'A'], 'set'),
    ],
    practiceTip: 'Toca Do y cada nota blanca por encima. Di el intervalo y el número de semitonos. Después hazlo partiendo de Fa, Sol y Si y comprueba cómo cambian mayores y menores.',
    practice: [
      { gen: 'interval-id', count: 4, difficulty: 1 }, { gen: 'interval-id', count: 3, difficulty: 2 },
      { gen: 'interval-build', count: 3, difficulty: 1 }, { gen: 'aural-interval', count: 3, difficulty: 1 },
    ],
    quiz: [
      Q('¿Cuántos semitonos tiene una 3ª mayor?', ['3', '4', '5', '7'], 1, '3M = 4 semitonos (Do–Mi).'),
      Q('Una quinta justa abarca…', ['5 semitonos', '6 semitonos', '7 semitonos', '8 semitonos'], 2, 'Do–Sol: 7 semitonos.'),
      Q('¿Qué calidad no admiten las cuartas, quintas y octavas?', ['Justa', 'Mayor y menor', 'Aumentada', 'Disminuida'], 1, 'Se llaman «justas» (P) y solo pueden ser justas, aumentadas o disminuidas.'),
    ],
    mistakes: ['Contar semitonos para el número: el número se saca contando letras (nombres de nota).', 'Confundir 4ª aumentada (Fa–Si) con 5ª disminuida (Si–Fa): suenan igual pero se escriben distinto.'],
  }),

  L({
    id: 'n1-08', order: 8, title: 'La escala mayor', minutes: 16, prerequisites: ['n1-04', 'n1-07'], covers: ['N1.11'],
    objective: 'Construir la escala mayor desde cualquier nota con la fórmula de tonos y semitonos y la escritura correcta.',
    blocks: [
      { type: 'text', title: 'Una fórmula, doce escalas', body: 'Una **escala** es una sucesión de notas conjuntas dentro de la octava. La **escala mayor** tiene siete notas y sigue siempre la misma fórmula de distancias:\n\n**T – T – st – T – T – T – st** (T = tono, st = semitono)\n\nAplícala desde cualquier nota y tendrás una escala mayor. Dos reglas de escritura:\n\n- Usa **cada letra una sola vez** (Re mayor: D E F♯ G A B C♯, no «D E G♭…»).\n- Las alteraciones se añaden para que la fórmula se cumpla.' },
      scaleExample('Do mayor', 'La referencia: solo teclas blancas. Los semitonos están entre Mi–Fa y Si–Do.', 'C', 'major'),
      scaleExample('Sol mayor', `Para que el último intervalo sea semitono, Fa se convierte en ${N('F#')}.`, 'G', 'major'),
      scaleExample('Re mayor', `${N('D')} ${N('E')} ${N('F#')} ${N('G')} ${N('A')} ${N('B')} ${N('C#')}: dos sostenidos.`, 'D', 'major'),
      scaleExample('Fa mayor', `Aquí el cuarto grado ya no es Si sino ${N('Bb')} (si fuese Si♮ habría un tritono con Fa).`, 'F', 'major'),
      tryScale('Toca la escala de Re mayor, ascendente, de Re a Do♯.', 'D', 'major'),
    ],
    practiceTip: 'Toca cada escala con la mano derecha lentamente, nombrando las notas. Comprueba que los semitonos caen entre los grados 3–4 y 7–8.',
    practice: [{ gen: 'scale-build', count: 5, difficulty: 1, params: { scales: ['major'] } }, { gen: 'scale-build', count: 3, difficulty: 2, params: { scales: ['major'] } }],
    quiz: [
      Q('¿Entre qué grados de la escala mayor hay un semitono?', ['1–2 y 5–6', '3–4 y 7–8', '2–3 y 6–7', '4–5 y 7–8'], 1, 'T–T–st–T–T–T–st: semitonos entre 3–4 y 7–8.'),
      Q('La escala de Sol mayor tiene…', ['Fa♯', 'Si♭', 'Do♯', 'Mi♭'], 0, 'Para cumplir la fórmula, el séptimo grado es Fa♯.'),
    ],
    mistakes: ['Escribir Sol♭ en vez de Fa♯ en Sol mayor: se repetiría una letra o se saltaría otra.', 'Memorizar teclas en lugar de la fórmula: no funcionará en tonalidades con alteraciones.'],
  }),

  L({
    id: 'n1-09', order: 9, title: 'Escalas menores: natural, armónica y melódica', minutes: 18, prerequisites: ['n1-08'], covers: ['N1.12'],
    objective: 'Construir las tres escalas menores y explicar en qué se diferencian y cuándo se usan.',
    blocks: [
      { type: 'text', title: 'Tres caras del modo menor', body: 'El modo menor se define por su **3ª menor** sobre la tónica. Existen tres versiones habituales:\n\n- **Menor natural**: T–st–T–T–st–T–T. Es la escala mayor empezada en su sexto grado (La menor = Do mayor desde La).\n- **Menor armónica**: la natural con el **7º grado subido** (sensible). Crea una 2ª aumentada entre los grados 6 y 7 y una dominante potente (V mayor).\n- **Menor melódica** (ascendente): sube **6º y 7º** para evitar esa 2ª aumentada. En la tradición clásica se baja a natural al descender; en jazz se usa igual en ambas direcciones.' },
      scaleExample('La menor natural', 'Solo teclas blancas: La–Si–Do–Re–Mi–Fa–Sol.', 'A', 'minor', 3),
      scaleExample('La menor armónica', `El Sol se sube a ${N('G#')}: aparece una 2ª aumentada Fa–Sol♯ con sabor oriental/español.`, 'A', 'harmonic minor', 3),
      scaleExample('La menor melódica', `Se suben Fa y Sol (${N('F#')}, ${N('G#')}) para suavizar el salto.`, 'A', 'melodic minor', 3),
      { type: 'callout', kind: 'style', title: 'Contexto estilístico', body: 'La menor armónica y la melódica nacen de la armonía clásica (la sensible resuelve a la tónica). En pop y rock suele usarse la **natural**, y en jazz la **melódica** como escala propia.' },
      tryScale('Toca La menor armónica ascendente de La a Sol♯.', 'A', 'harmonic minor'),
    ],
    practiceTip: 'Toca La menor natural, armónica y melódica seguidas. Escucha cómo cambia la sensación al subir el 7º y el 6º grado. Repite en Mi menor y Re menor.',
    practice: [{ gen: 'scale-build', count: 4, difficulty: 2, params: { scales: ['minor'] } }, { gen: 'scale-build', count: 4, difficulty: 3, params: { scales: ['harmonic minor', 'melodic minor'], tonics: ['A', 'E', 'D', 'G', 'C'] } }],
    quiz: [
      Q('La menor armónica se diferencia de la natural en…', ['El 7º grado está subido', 'El 3º grado es mayor', 'El 6º está bajado', 'No se diferencia'], 0, 'Eleva el 7º grado (Sol → Sol♯ en La menor).'),
      Q('La menor natural de La está formada por las notas…', ['Solo teclas blancas', 'Con Fa♯', 'Con Sol♯', 'Con Si♭'], 0, 'La menor natural comparte las notas de Do mayor: no tiene alteraciones.'),
    ],
    mistakes: ['Usar la misma armadura sin acordarse de que armónica/melódica llevan alteraciones accidentales.', 'Confundir «menor melódica» con la escala de dos mitades iguales: solo la ascendente sube 6º y 7º.'],
  }),

  L({
    id: 'n1-10', order: 10, title: 'Armaduras, círculo de quintas y grados de la escala', minutes: 18, prerequisites: ['n1-08', 'n1-09'], covers: ['N1.13', 'N1.14'],
    objective: 'Deducir la armadura de cualquier tonalidad con el círculo de quintas y nombrar los grados de una escala.',
    blocks: [
      { type: 'text', title: 'La armadura', body: 'En lugar de repetir las alteraciones, se escriben al comienzo del pentagrama en la **armadura**. Una tonalidad mayor y su **relativa menor** (que empieza en el sexto grado) comparten armadura.\n\nEl **círculo de quintas** ordena las tonalidades de quinta en quinta: al subir una quinta (Do → Sol → Re → La…) se añade un **sostenido**; al bajar una quinta (Do → Fa → Si♭ → Mi♭…) se añade un **bemol**. Orden de sostenidos: **Fa Do Sol Re La Mi Si**. Orden de bemoles: **Si Mi La Re Sol Do Fa**.\n\nTruco: en tonalidades con sostenidos, la tónica es el semitono **sobre el último sostenido**. En tonalidades con bemoles, la tónica es el **penúltimo bemol**.' },
      { type: 'text', title: 'Grados', body: 'Las notas de una escala se numeran del 1 al 7 y tienen nombre funcional: **I tónica**, **II supertónica**, **III mediante**, **IV subdominante**, **V dominante**, **VI superdominante (submediante)**, **VII sensible** (a un semitono de la tónica; en menor natural se llama *subtónica*). Estos nombres adelantan las funciones que usaremos en armonía.' },
      scaleExample('Sol mayor: un sostenido', `La armadura de Sol mayor es ${N('F#')}. Su relativa menor es Mi menor.`, 'G', 'major'),
      scaleExample('Mi♭ mayor: tres bemoles', `Mi♭ mayor tiene Si♭, Mi♭ y La♭. Su relativa menor es Do menor.`, 'Eb', 'major'),
      tryScale('Toca Si♭ mayor (dos bemoles: Si♭ y Mi♭).', 'Bb', 'major'),
    ],
    practiceTip: 'Recita el círculo de quintas en voz alta de Do hacia sostenidos y de Do hacia bemoles, diciendo cuántas alteraciones se añaden. Después elige una tonalidad al azar y escribe su armadura.',
    practice: [{ gen: 'key-signature', count: 5, difficulty: 1 }, { gen: 'key-signature', count: 3, difficulty: 2 }, { gen: 'degree-id', count: 5, difficulty: 1 }],
    quiz: [
      Q('La relativa menor de Do mayor es…', ['La menor', 'Mi menor', 'Re menor', 'Fa menor'], 0, 'Se encuentra en el sexto grado de la mayor: La.'),
      Q('¿Cuántas alteraciones tiene Re mayor?', ['1 sostenido', '2 sostenidos', '2 bemoles', '3 sostenidos'], 1, 'Re mayor lleva Fa♯ y Do♯.'),
      Q('El séptimo grado a un semitono de la tónica se llama…', ['Sensible', 'Mediante', 'Dominante', 'Subdominante'], 0, 'La sensible es el 7º grado de la escala mayor (y de la menor armónica).'),
    ],
    mistakes: ['Contar bemoles al revés: para hallar la tónica con bemoles, es el penúltimo bemol (Si♭, Mi♭, La♭ → Mi♭ mayor).', 'Olvidar que la sensible solo existe a distancia de semitono: en menor natural el 7º está a un tono.'],
  }),
]
