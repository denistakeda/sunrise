import { div, input } from '../src/Nodes'
import { cell, swap } from '../src/Cell'
import { onClick, text, children, className, inputType, checked } from '../src/Properties'
import { renderIf } from '../src/Utils'

export const showHide = () => {
  const show = cell<boolean>(true)
  const toggle = (v: boolean) => !v

  return div([
    className('main'),
    children([
      input([inputType('checkbox'), onClick(() => swap(toggle, show)), checked(show)]),
      renderIf(show, () => div([text(':-)')]))
    ])
  ])
}
