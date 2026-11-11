# Harmonia — academia interactiva de armonía de piano

Aplicación web **local-first** para aprender armonía de piano desde cero hasta un nivel avanzado de aplicación. Se aprende **escuchando, tocando y experimentando**: cada lección tiene explicación, ejemplos que suenan, tareas sobre un piano virtual y ejercicios que se autocorrigen.

- Sin cuentas, sin suscripciones, sin API de IA, sin servicios externos. Funciona sin conexión una vez instaladas las dependencias (las fuentes también van empaquetadas).
- Idioma: español de España. Nombres de nota en notación **latina** (Do, Re, Mi) o **internacional** (C, D, E), a elegir.
- Convención de octavas: **C4 = Do central = MIDI 60**.

> Completar el curso construye una base sólida de armonía aplicada al piano; no equivale por sí solo a ser pianista profesional. La práctica instrumental sigue siendo imprescindible.

## Requisitos

- Node.js 20 o superior (probado con Node 24) y npm.
- Un navegador moderno. Chrome, Edge y Opera admiten además teclados MIDI (Web MIDI API).

## Instalación y uso

```bash
npm install        # instala las dependencias
npm run dev        # arranca en desarrollo: http://localhost:5173
npm run build      # comprueba tipos y genera dist/
npm run preview    # sirve dist/ para probar la versión compilada
npm test           # ejecuta las pruebas automáticas (Vitest)
npm run typecheck  # solo comprobación de tipos
```

La versión compilada usa rutas con `#`, por lo que `dist/` se puede servir desde cualquier servidor estático sin configuración.

## Cómo se usa

### El curso
Abre **Curso**. Hay 5 niveles y 48 lecciones. Cada lección incluye objetivo, prerrequisitos, explicación, ejemplos con partitura y teclado iluminado, botón de escuchar, tareas «Prueba en el piano», consejos de práctica, errores habituales y una serie de ejercicios. Para superarla hay que acertar al menos el 70 % (la lección final exige además un mini-proyecto de composición). Las lecciones se desbloquean en orden, pero un aviso —no un candado— te deja saltarte cualquiera.

### El piano
Está siempre disponible en la parte inferior de lecciones, laboratorio y entrenador, y en pantalla completa en **Piano**.

- **Ratón o pantalla táctil**: pulsa varias teclas a la vez o arrastra para hacer glissando.
- **Teclado del ordenador**: fila inferior `Z S X D C V G B H N J M , L . ; /` (desde el Do de la octava inicial) y fila superior `Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P` (una octava más arriba).
- Reconoce al instante lo que tocas (nota, intervalo o acorde con su inversión).
- Cambia octavas visibles, registro, volumen, timbre (piano, piano eléctrico, órgano, pad) y nombres de nota.
- «Silenciar» corta cualquier sonido pendiente. Las notas también se sueltan al cambiar de pestaña o de página.
- Si una tarea o un ejercicio te pide notas, las teclas **objetivo** salen marcadas en cobre, las que tocas en azul, las correctas en verde y las erróneas en rojo.

### Teclado MIDI
Pulsa **Conectar MIDI** (en el piano o en Ajustes) y concede el permiso del navegador. Las notas del teclado tocan el piano virtual, responden a los ejercicios y la desconexión se detecta sola. Si el navegador no admite MIDI se avisa y todo sigue funcionando con el piano virtual.

### Laboratorio
1. **Constructor de acordes**: fundamental, calidad, extensiones y alteraciones compatibles, inversión y registro.
2. **Explorador de escalas**: 18 escalas y modos, grados, intervalos y acordes diatónicos (tríadas y séptimas).
3. **Círculo de quintas**: armadura, notas y acordes de cada tonalidad.
4. **Progresiones**: añadir, quitar, mover y editar acordes (números romanos), predefinidas, tempo en vivo, bucle, inversiones, transposición y guardado local.
5. **Comparador de voicings**: cerrado, abierto, drop 2, drop 3, shell, rootless A/B y cuartal; muestra notas, registro y movimiento entre voces.

### Entrenador
25 tipos de ejercicio generados por reglas (notas, escalas, intervalos, tríadas, séptimas, inversiones, oído de intervalos/acordes/cadencias, funciones, progresiones, conducción de voces, transposición, dominantes secundarias, voicings y extensiones). La dificultad puede ser automática y sube con tus aciertos. Se puede responder con botones, escribiendo notas, tocando el piano o con MIDI. Los ejercicios de oído no muestran la respuesta antes de contestar.

La corrección distingue el tipo de pregunta: en acordes importa el conjunto de notas y no el orden; en inversiones, el bajo; en registro, la octava exacta; y al escribir notas se separa **sonido correcto** de **escritura teórica correcta** (Do♯ y Re♭ suenan igual, pero no se escriben igual). Las preguntas con varias soluciones defendibles aceptan todas ellas.

## Dónde se guardan los datos
En el `localStorage` del navegador (clave `harmonia.progress.v1`): lecciones, estadísticas, historial, progresiones guardadas y preferencias. Si el almacenamiento falla (modo privado, lleno) la app sigue funcionando en memoria y avisa. En **Progreso** puedes:

- **Exportar** un archivo JSON con todo.
- **Importar** un JSON: se valida su estructura y no se toca nada si es inválido.
- **Restablecer** (con confirmación).

## Arquitectura resumida

```
src/
  music/       Motor de teoría (notas, intervalos, escalas, acordes, romanos, voicings, progresiones). Sin React.
  audio/       Motor de audio con Tone.js (singleton) y MIDI (Web MIDI API)
  exercises/   Generadores por reglas, corrector musical y formato de texto
  content/     Los 5 niveles como datos tipados + temario y validación
  store/       Progreso/ajustes (localStorage con respaldo), estado del piano
  components/  Piano, pentagrama, teclado SVG, reproductor de ejercicios…
  pages/       Inicio, curso, lección, piano, laboratorio (lab/), entrenador, progreso, ajustes
```

- La lógica musical vive solo en `src/music` (Tonal.js + código propio); los componentes la reutilizan.
- El audio es sintético (sin samples remotos). Hay un único sintetizador por timbre; las secuencias usan `Transport` y se cancelan al parar o cambiar de página.
- Ampliar el curso = añadir una lección a `src/content/levelN.ts`. Las pruebas validan campos, prerrequisitos, cobertura del temario (83 temas) y referencias a generadores.

## Pruebas
`npm test` ejecuta 145 pruebas: motor musical con ejemplos de respuesta conocida (escalas, acordes, inversiones, transposición, ii–V–I, enarmonía), corrector, 25 generadores × 3 dificultades, contenido del curso, persistencia, importación/exportación, errores de almacenamiento y análisis de mensajes MIDI.

## Limitaciones conocidas
- El sonido es sintetizado: agradable y coherente, pero no es un piano de concierto muestreado.
- Playwright no está instalado (descarga navegadores); la interacción real se verificó en el navegador integrado y con las pruebas de Vitest. Ver `ROADMAP.md`.
- Web MIDI solo existe en navegadores basados en Chromium; no se ha podido probar con un teclado físico en este entorno (sí el análisis de mensajes y la ruta sin dispositivo).
- Los ejercicios de oído y de piano se evalúan por conjunto de notas, sin medir el ritmo de ejecución.
- Las tareas «Prueba en el piano» reconocen acordes pulsados a la vez o escalas en orden; no valoran la digitación.
- El *bundle* principal pesa ~850 kB (Tone.js); es una aplicación local, por lo que no se ha dividido en trozos.
