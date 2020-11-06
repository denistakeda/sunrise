import { div } from '../src/Nodes'
import { className, onClick, text, children, classList } from '../src/Properties'
import { cell, map, reset } from '../src/Cell'
import { counter } from './counter'
import { showHide } from './showhide'

type Tab = 'counter' | 'showHide'
const tabs: { [key in Tab]: string } = {
  counter: 'Increment',
  showHide: 'Show/Hide'
}

const main = () => {
  const current = cell<Tab>('counter')
  return div([
    className('main'),
    children([
      div([
        className('tabs'),
        children(
          Object.entries(tabs).map(([tab, name]) =>
            div([
              className('tab'),
              classList({ selected: map(current => current === tab, current) }),
              text(name),
              onClick(() => reset(tab as Tab, current))
            ])
          )
        )
      ]),
      map(current => {
        switch (current) {
          case 'counter':
            return counter()
          case 'showHide':
            return showHide()
        }
      }, current)
    ])
  ])
}

document.body.appendChild(main())
