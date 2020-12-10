import { div, sunrise } from '../src/Dom'
import { className, onClick, text, children, classList } from '../src/Properties'
import { cell, formula, reset } from '../src/Cell'
import { counter } from './counter'
import { showHide } from './showhide'
import { todolist } from './todolist'

type Tab = 'counter' | 'showHide' | 'todolist'
const tabs: { [key in Tab]: string } = {
  counter: 'Increment',
  showHide: 'Show/Hide',
  todolist: 'Todolist',
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
              classList({ selected: formula((current) => current === tab, current) }),
              text(name),
              onClick(() => reset(tab as Tab, current)),
            ])
          )
        ),
      ]),
      formula((current) => {
        switch (current) {
          case 'counter':
            return counter()
          case 'showHide':
            return showHide()
          case 'todolist':
            return todolist()
        }
      }, current),
    ]),
  ])
}

sunrise(document.getElementById('app'), main())
