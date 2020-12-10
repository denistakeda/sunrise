import { div, button, span } from '../src/Dom'
import { cell, swap, formula } from '../src/Cell'
import { onClick, text, children } from '../src/Properties'

export const counter = () => {
  const val = cell<number>(1)
  const inc = (n: number) => n + 1
  const dec = (n: number) => n - 1
  return div([
    children([
      button([onClick(() => swap(dec, val)), text('-')]),
      span([text(formula(String, val))]),
      button([onClick(() => swap(inc, val)), text('+')]),
    ]),
  ])
}
