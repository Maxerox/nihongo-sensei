import type { NavItem } from '../components/organisms/NavDrawer'

/** Secciones de la app (una página cada una). El orden es el del menú. */
export const SECTIONS: NavItem[] = [
  { to: '/vocabulario', ja: '単語', jaReading: 'たんご', title: 'Vocabulario', description: 'Tarjetas, quiz y lista · L1–19' },
  { to: '/gramatica', ja: '文法', jaReading: 'ぶんぽう', title: 'Gramática', description: 'Cheatsheet por lección · L1–19' },
  { to: '/contadores', ja: '数', jaReading: 'かず', title: 'Contadores y fechas', description: 'Contadores, días del mes y práctica' },
  { to: '/particulas', ja: '助詞', jaReading: 'じょし', title: 'Partículas', description: 'Usos, comparaciones y práctica' },
]
