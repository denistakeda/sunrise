import { Value, Cell, CalculatedCell,map, isCell} from './Cell'

const emptyElement: Node = document.createTextNode('')

export function renderIf<T extends Node>(show: boolean, el: T | (() => T)): T
export function renderIf<T extends Node>(show: Cell<boolean>, el: T | (() => T)): CalculatedCell<T>
export function renderIf<T extends Node>(show: Value<boolean>, el: T | (() => T)): T | CalculatedCell<T>{
    const getElement: () => T = typeof el === 'function' ? el : () => el
    const getElementIf: (show: boolean) => T = show => show ? getElement() : emptyElement as T
    if (isCell(show)) {
        return map<boolean, T>(getElementIf, show)
    } else {
        return getElementIf(show)
    }
}
