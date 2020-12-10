import { div, input, renderIf } from '../src/Dom'
import { cell, swap } from '../src/Cell'
import { onClick, text, children, className, inputType, checked } from '../src/Properties'

export const showHide = () => {
  const show = cell<boolean>(true)
  const toggle = (v: boolean) => !v

  return div([
    className('main'),
    children([
      input([inputType('checkbox'), onClick(() => swap(toggle, show)), checked(show)]),
      renderIf(show, () => div([text(':-)')])),
    ]),
  ])
}
