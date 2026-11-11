import type { LevelInfo, Topic } from './types'

export const LEVELS: LevelInfo[] = [
  { id: 1, name: 'Fundamentos musicales', tagline: 'El lenguaje de la música y el teclado', goal: 'Comprender el lenguaje musical y empezar a relacionarlo con el teclado.', color: 'var(--lv1)' },
  { id: 2, name: 'Acordes y armonía fundamental', tagline: 'Construir, nombrar y encadenar acordes', goal: 'Comprender cómo se construyen los acordes y cómo se utilizan musicalmente.', color: 'var(--lv2)' },
  { id: 3, name: 'Armonía intermedia y aplicación', tagline: 'Movimiento armónico con intención', goal: 'Comprender el movimiento armónico y crear acompañamientos con intención.', color: 'var(--lv3)' },
  { id: 4, name: 'Armonía avanzada', tagline: 'Color, tensión y jazz', goal: 'Desarrollar recursos de armonía moderna, jazz y técnicas armónicas complejas.', color: 'var(--lv4)' },
  { id: 5, name: 'Aplicación musical profesional', tagline: 'Interpretar, improvisar y componer', goal: 'Usar la armonía con soltura para interpretar, acompañar, improvisar, analizar y componer.', color: 'var(--lv5)' },
]

const t = (level: number, names: string[]): Topic[] => names.map((name, i) => ({ id: `N${level}.${i + 1}`, name }))

/** Temario oficial del curso; cada tema debe estar cubierto por al menos una lección. */
export const TOPICS: Topic[] = [
  ...t(1, [
    'Qué es la música, la armonía, la melodía y el ritmo', 'Distribución de las notas en el piano', 'Teclas blancas y negras',
    'Nomenclatura latina e internacional', 'Octavas, alturas y registros', 'Tonos, semitonos y alteraciones', 'Pentagrama, claves de sol y fa',
    'Figuras, silencios, compases y tempo', 'Intervalos simples y compuestos', 'Intervalos mayores, menores, justos, aumentados y disminuidos',
    'Escala mayor y construcción de escalas', 'Escalas menores natural, armónica y melódica', 'Armaduras, tonalidades y círculo de quintas', 'Grados de una escala',
  ]),
  ...t(2, [
    'Qué es un acorde', 'Tríadas mayores, menores, aumentadas y disminuidas', 'Construcción por terceras', 'Estado fundamental e inversiones',
    'Acordes de séptima', 'Acordes maj7, m7, 7, m7♭5 y dim7', 'Acordes suspendidos y añadidos', 'Cifrado americano', 'Introducción al cifrado por grados romanos',
    'Armonización de la escala mayor', 'Armonización de las escalas menores', 'Funciones de tónica, predominante y dominante', 'Progresiones armónicas habituales',
    'Cadencias auténticas, plagales, semicadencias y rotas', 'Introducción a las inversiones del bajo', 'Acompañamientos sencillos con ambas manos',
  ]),
  ...t(3, [
    'Análisis armónico funcional', 'Conducción de voces', 'Movimiento contrario, paralelo y oblicuo', 'Notas comunes y movimientos mínimos',
    'Distribución de acordes o voicings', 'Acordes abiertos y cerrados', 'Bajo y melodía', 'Dominantes secundarias', 'Sensibles secundarias', 'Intercambio modal',
    'Acordes prestados', 'Tonicalización y modulación', 'Dominantes extendidas', 'Progresiones por círculo de quintas',
    'Notas de paso, bordaduras, retardos y apoyaturas', 'Relación entre melodía y armonía', 'Introducción a la reharmonización',
    'Patrones de acompañamiento de pop, balada y música moderna',
  ]),
  ...t(4, [
    'Extensiones de novena, oncena y trecena', 'Extensiones frente a tensiones disponibles', 'Tensiones alteradas', 'Dominantes alteradas', 'Sustitución tritonal',
    'Voicings rootless', 'Drop 2 y otras distribuciones', 'Acordes cuartales', 'Upper structures', 'Escalas y modos utilizados en jazz', 'Relación acorde-escala',
    'Funciones modales frente a tonales', 'Reharmonización avanzada', 'Backdoor dominants', 'Disminuidos de paso', 'Acordes napolitanos y sextas aumentadas',
    'Cromatismo armónico', 'Modulación por acordes comunes y procedimientos cromáticos', 'Pedales armónicos y estructuras sobre bajo fijo',
    'Análisis comparado de armonía clásica, jazz, pop y cine',
  ]),
  ...t(5, [
    'Armonización de melodías', 'Creación de progresiones originales', 'Composición a partir de una tonalidad', 'Improvisación basada en acordes y funciones',
    'Improvisación melódica y desarrollo de motivos', 'Acompañamiento en distintos estilos', 'Arreglos para piano solo', 'Voice leading avanzado',
    'Reharmonización creativa', 'Transposición en tiempo real', 'Análisis armónico de piezas originales', 'Introducciones, interludios y finales',
    'Entrenamiento auditivo aplicado', 'Desarrollo de criterio musical', 'Proyecto final de composición y análisis',
  ]),
]
