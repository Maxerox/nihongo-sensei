/** Une clases CSS ignorando valores vacíos: cx('a', cond && 'b'). */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ')
}
