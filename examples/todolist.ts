import { cell, deref, formula, FormulaCell, reset, swap } from '../src/Cell'
import { button, div, input, renderList, span } from '../src/Dom'
import {
  className,
  classList,
  children,
  inputType,
  text,
  onClick,
  checked,
  value,
  onChange,
} from '../src/Properties'

namespace TodoList {
  namespace Counter {
    let val: number = 0
    export function next(): number {
      return val++
    }
  }

  export interface TodoItem {
    id: number
    text: string
    done: boolean
  }

  const dict = cell<{ [id: number]: TodoItem }>({})

  export function list(): FormulaCell<TodoItem[]> {
    return formula((dict) => Object.values(dict), dict)
  }

  export function add(text: string): void {
    const id = Counter.next()
    swap((dict) => ({ ...dict, [id]: { id, text, done: false } }), dict)
  }

  export function toggle(id: number): void {
    swap((dict) => ({ ...dict, [id]: { ...dict[id], done: !dict[id].done } }), dict)
  }

  // -- Some initial values --
  add('Drink coffee')
  add('Implement sunrise')
}

export const todolist = () => {
  const newItem = cell<string>('')
  const addItem = () => {
    TodoList.add(deref(newItem))
    reset('', newItem)
  }
  return div([
    className('todolist'),
    children([
      div([className('list'), children(renderList(todoItem, TodoList.list()))]),
      div([
        children([
          input([inputType('text'), value(newItem), onChange((val) => reset(val, newItem))]),
          button([onClick(addItem), text('Create')]),
        ]),
      ]),
    ]),
  ])
}

const todoItem = (item: TodoList.TodoItem) =>
  div([
    className('todoitem'),
    classList({ checked: item.done }),
    onClick(() => TodoList.toggle(item.id)),
    children([input([inputType('checkbox'), checked(item.done)]), span([text(item.text)])]),
  ])
