import { useCallback, useState } from 'react'
import { readStorage, writeStorage } from '../utils/storage'

type Updater<T> = T | ((prev: T) => T)

/** Estado de React que se guarda en localStorage (si se puede). */
export function useLocalStorage<T>(key: string, initial: T): [T, (next: Updater<T>) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial))
  const update = useCallback(
    (next: Updater<T>) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        writeStorage(key, resolved)
        return resolved
      })
    },
    [key],
  )
  return [value, update]
}
