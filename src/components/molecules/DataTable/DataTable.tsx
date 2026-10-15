import { JpText } from '../../atoms/JpText'
import { VisuallyHidden } from '../../atoms/VisuallyHidden'
import type { GrammarTable } from '../../../shared/types/content'
import styles from './DataTable.module.scss'

export interface DataTableProps {
  table: GrammarTable
  caption?: string
}

/** Tabla de conjugación. Las celdas japonesas llevan furigana. */
export function DataTable({ table, caption }: DataTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <thead>
          <tr>
            {table.head.map((h, i) => (
              <th key={i} scope="col">
                {h || <VisuallyHidden>Forma</VisuallyHidden>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row">
                    <JpText text={cell} />
                  </th>
                ) : (
                  <td key={c}>
                    <JpText text={cell} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
