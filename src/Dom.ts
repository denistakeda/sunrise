import { Property } from './Properties'
import { Value, Cell, FormulaCell, formula, cell, SourceCell } from './Cell'

export interface Component<T extends HTMLElement> {
  readonly element: T
}

export function node<K extends keyof HTMLElementTagNameMap>(
  tag: K
): (attributes: Property<HTMLElementTagNameMap[K]>[]) => SourceCell<HTMLElementTagNameMap[K]> {
  return function(attributes) {
    const element = document.createElement(tag)
    for (const attr of attributes) {
      attr(element)
    }
    return cell(element)
  }
}

export const div = node('div')
export const video = node('video')
export const select = node('select')
export const option = node('option')
export const button = node('button')
export const span = node('span')
export const input = node('input')

export function sunrise(to: HTMLElement | null, el: Value<Element>): void {
  if (!to) return
  formula(el => to.parentElement?.replaceChild(el, to), el)
}

// -- Rendering utils --

const emptyElement: Node = document.createTextNode('')

// export function renderIf<T extends Node>(show: boolean, el: Value<T> | (() => Value<T>)): T
// export function renderIf<T extends Node>(show: Cell<boolean>, el: Value<T> | (() => Value<T>)): FormulaCell<T>
// export function renderIf<T extends Node>(
//   show: Value<boolean>,
//   el: T | (() => T)
// ): T | FormulaCell<T> {
//   const getElement: () => T = typeof el === 'function' ? el : () => el
//   const getElementIf: (show: boolean) => T = show => (show ? getElement() : (emptyElement as T))
//   return formula<boolean, T>(getElementIf, show)
// }

export function renderIf<T extends Node>(show: Cell<boolean>, el: Value<T>): FormulaCell<Node> {
  return formula((show, el) => show ? el : emptyElement, show, el);
}
