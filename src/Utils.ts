import { Value, Cell, FormulaCell, formula, isCell } from './Cell'

const emptyElement: Node = document.createTextNode('')

export function renderIf<T extends Node>(show: boolean, el: T | (() => T)): T
export function renderIf<T extends Node>(show: Cell<boolean>, el: T | (() => T)): FormulaCell<T>
export function renderIf<T extends Node>(
  show: Value<boolean>,
  el: T | (() => T)
): T | FormulaCell<T> {
  const getElement: () => T = typeof el === 'function' ? el : () => el
  const getElementIf: (show: boolean) => T = show => (show ? getElement() : (emptyElement as T))
  if (isCell(show)) {
    return formula<boolean, T>(getElementIf, show)
  } else {
    return getElementIf(show)
  }
}
