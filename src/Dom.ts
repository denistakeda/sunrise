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

function replaceNode<T extends Node>(newNode: Value<T>, oldNode: Value<T>): void {
  const oldEl = deref(oldNode)
  oldEl.parentElement?.replaceChild(deref(newNode), oldEl)
  destroy(oldEl)
}

export function renderSwitch<V, N extends Node>(
  render: (source: V) => Value<N>,
  cell: Value<V>,
): FormulaCell<N> {
  let oldNode: Value<N>
  return formula(source => {
    const newNode = render(source)
    if (oldNode) replaceNode(newNode, oldNode)
    oldNode = newNode
    return deref(oldNode)
  }, cell)
}

export function renderIf<T extends Node>(
  fn: () => Value<T>,
  show: Value<boolean>,
): FormulaCell<Node> {
  return renderSwitch(
    show => show ? fn() : document.createTextNode(''),
    show
  )
}

export function renderSomething<T, N extends Node>(
  fn: (source: T) => Value<N>,
  cell: Value<T | undefined | null>,
): FormulaCell<Node> {
  return renderSwitch(
    source =>
      source !== undefined && source !== null ? fn(source) : document.createTextNode(''),
    cell
  )
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
