import { Property } from './Properties'
import { Value, Cell, deref, FormulaCell, formula, cell, SourceCell, destroy } from './Cell'

export interface Component<T extends HTMLElement> {
  readonly element: T
}

export function node<K extends keyof HTMLElementTagNameMap>(
  tag: K
): (attributes: Property<HTMLElementTagNameMap[K]>[]) => SourceCell<HTMLElementTagNameMap[K]> {
  return function (attributes) {
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
  formula((el) => to.parentElement?.replaceChild(el, to), el)
}

// -- Rendering utils --

const emptyElement: Node = document.createTextNode('')

export function renderIf<T extends Node>(
  show: Cell<boolean>,
  fn: () => Value<T>
): FormulaCell<Node> {
  let el: Value<T>
  return formula((show) => {
    if (show) {
      el = fn()
      return deref(el)
    } else {
      destroy(el)
      return emptyElement
    }
  }, show)
}

export function renderList<Item, T>(
  fn: (item: Item) => Value<T>,
  list: Value<Array<Item>>
): FormulaCell<Array<Value<T>>> {
  // TODO: we need to implement an efficient algorithm of lists comparisons here
  return formula((list) => {
    return list.map(fn)
  }, list)
}
