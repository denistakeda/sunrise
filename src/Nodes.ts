import { Property } from './Properties'

export interface Component<T extends HTMLElement> {
  readonly element: T
}

export function node<K extends keyof HTMLElementTagNameMap>(
  tag: K
): (attributes: Property<HTMLElementTagNameMap[K]>[]) => HTMLElementTagNameMap[K] {
  return function(attributes) {
    const element = document.createElement(tag)
    for (const attr of attributes) {
      attr(element)
    }
    return element
  }
}

export const div = node('div')
export const video = node('video')
export const select = node('select')
export const option = node('option')
export const button = node('button')
export const span = node('span')
export const input = node('input')
