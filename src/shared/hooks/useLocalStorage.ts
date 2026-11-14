import { useCallback, useState } from 'react'
import { readStorage, writeStorage, type StorageKind } from '../utils/storage'

type Updater<T> = T | ((prev: T) => T)

/** Estado de React que se guarda en localStorage, o en sessionStorage con `kind = 'session'` (si se puede). */
export function useLocalStorage<T>(key: string, initial: T, kind: StorageKind = 'local'): [T, (next: Updater<T>) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, kind))
  const update = useCallback(
    (next: Updater<T>) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        writeStorage(key, resolved, kind)
        return resolved
      })
    },
    [key, kind],
  )
  return [value, update]
}

/** Estado que se guarda en sessionStorage: sobrevive a recargar y se borra al cerrar la pestaña. */
export function useSessionStorage<T>(key: string, initial: T): [T, (next: Updater<T>) => void] {
  return useLocalStorage(key, initial, 'session')
}
