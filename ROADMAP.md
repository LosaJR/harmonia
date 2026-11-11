# ROADMAP — HARMONIA

Estado real del proyecto. «Hecho» significa verificado como se indica en la última columna.

| Fase | Trabajo | Estado | Verificación |
|---|---|---|---|
| 1 | Análisis y arquitectura | Hecho | Módulos separados (`music`, `audio`, `exercises`, `content`, `store`, `components`, `pages`); `tsc` sin errores |
| 2 | Proyecto y dependencias | Hecho | `npm install`, `npm run build` correcto (dist ≈ 1,2 MB) |
| 3 | Motor de teoría musical | Hecho | Vitest: escalas, acordes, inversiones, transposición, ii–V–I, enarmonía (F♯/G♭, Bdim7, Cdim7 con B𝄫), voicings, conducción de voces |
| 4 | Motor de audio y piano | Hecho | **A mano** en el navegador integrado: audio `running` tras clic, acorde Do–Mi–Sol → 3 notas sostenidas y «Do mayor», al soltar `held = []` y 0 voces tras el release |
| 5 | Interfaz principal | Hecho | **A mano**: las 19 rutas renderizan sin errores de consola; sin desbordamiento horizontal a 375 px y 800 px |
| 6 | Contenido de los cinco niveles | Hecho | Vitest: 48 lecciones (10 + 10 + 10 + 10 + 8), campos obligatorios, prerrequisitos válidos y ordenados, **los 83 temas del programa cubiertos** |
| 7 | Lecciones interactivas | Hecho | Vitest (ejercicios generan y se autocorrigen) + **a mano**: serie completa de una lección, resultado, persistencia de intento, desbloqueo tras marcar n1-01 |
| 8 | Laboratorio de armonía | Hecho | Vitest (acordes con extensiones, reproducción) + **a mano**: reproducir/detener (Transport), transposición Dm7–G7–Cmaj7 → Em7–A7–Dmaj7, guardado, círculo de quintas |
| 9 | Entrenamiento y evaluación | Hecho | Vitest: 25 generadores × 3 dificultades, corrector por modos (conjunto, orden, bajo, octava, escritura) + **a mano**: respuesta tocando el piano con marcas ok/error/objetivo |
| 10 | MIDI y persistencia | Hecho (MIDI sin hardware) | Vitest: análisis de mensajes (note-on vel. 0 = off), importación/exportación, almacenamiento lleno/ausente/corrupto. **A mano**: ruta sin dispositivo MIDI muestra aviso y la app sigue. **No probado con un teclado MIDI físico** |
| 11 | Integración completa | Hecho | Flujo curso → ejercicios → progreso → recarga verificado a mano |
| 12 | Refinamiento visual y accesibilidad | Hecho (accesibilidad parcialmente verificada) | **Verificado a mano:** atajos del teclado físico (Z C B → Do mayor reconocido, soltar, sin repetición, ignorados dentro de un `input`), tema claro/oscuro y nomenclatura latina/internacional. **Implementado pero no probado:** foco visible, navegación completa solo con teclado, `prefers-reduced-motion`, lectores de pantalla |
| 13 | Validación y entrega | Hecho | `npm test` (145 pruebas), `npm run build` y **`npm run preview` cargado en el navegador**: 16 rutas sin errores de consola ni desbordamiento; README |

## Lo que se comprobó con pruebas automáticas y lo que a mano
- **Automático (Vitest, 145):** motor musical, corrector, generadores, contenido del curso, persistencia, import/export, MIDI parsing.
- **A mano (navegador integrado, no automatizado):** audio (contexto en marcha, voces activas y liberadas), interacción con el piano, atajos de teclado, flujo de lección, reproducción de progresiones, tema, MIDI sin dispositivo, 375 px y la versión compilada (`preview`).
- **No verificado:** cambio de tempo *durante* la reproducción (implementado: relanza con el nuevo tempo), descarga del archivo de exportación desde el botón (la serialización sí está probada), teclado MIDI físico, audición real del sonido (el entorno no permite escucharlo; solo se verifica que el contexto de audio corre y las voces se activan y se liberan).

## Decisiones
- C4 = MIDI 60. Audio 100 % sintetizado con Tone.js; fuentes empaquetadas con `@fontsource`.
- `HashRouter`: el `dist/` funciona desde cualquier servidor estático.
- Corrección musical separada de la interfaz (`src/exercises/grade.ts`): sonido (chroma) frente a escritura (spelling).
- El contenido se escribe como datos tipados y se valida con tests (no hay lecciones generadas dinámicamente).
- Playwright no se instaló (descarga navegadores); se usó el navegador integrado.

## Sobre las skills solicitadas
- `/frontend-design:frontend-design`: invocada de verdad al empezar el diseño (paleta marfil/grafito/cobre, Instrument Serif + Instrument Sans, piano en vivo como elemento memorable).
- `/modo-eficiente`: **no existe como skill instalada en este entorno**; se aplicó como práctica (lecturas mínimas, módulos reutilizables, pruebas dirigidas).
- `/loop`: es un planificador por intervalos que relanza un prompt y termina el turno; no encaja con ejecutar todo en una sola sesión continua sin intervención. **No se invocó.** El roadmap se ejecutó secuencialmente en esta sesión, marcando fases solo tras verificarlas.

## Registro de problemas
- `setPointerCapture` lanzaba con punteros sintéticos → ahora está protegido (`try/catch`). Detectado al probar con eventos simulados.
- `note-id` mostraba el nombre de la nota sobre la tecla marcada (revelaba la respuesta) → ahora los nombres solo aparecen tras contestar.
- Las marcas de acierto/error del piano se borraban justo tras corregir (efecto dependiente de `grade`) → separado en dos efectos.
- El dock del piano ocupaba demasiado en pantallas bajas → barra compacta (ajustes de sonido en un desplegable) y plegado por defecto en móvil.
- Pendiente (P1 ampliable): evaluación del ritmo de ejecución, dictado melódico, más timbres con samples locales opcionales.
