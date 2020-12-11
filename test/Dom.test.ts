import { div, renderIf, renderList } from '../src/Dom'
import { cell, deref, isDestroyed, reset } from '../src/Cell'

describe('renderIf', () => {
  it('should render an empty element if flag is falsey', () => {
    const result = renderIf(cell<boolean>(false), () => div([]))
    expect(deref(result)).toBeInstanceOf(Text)
  })
  it('should render and element if flag is truthy', () => {
    const result = renderIf(cell<boolean>(true), () => div([]))
    expect(deref(result)).toBeInstanceOf(HTMLDivElement)
  })
  it('should change the value when flag is changed', () => {
    const flag = cell<boolean>(false)
    const result = renderIf(flag, () => div([]))
    expect(deref(result)).toBeInstanceOf(Text)
    reset(true, flag)
    expect(deref(result)).toBeInstanceOf(HTMLDivElement)
    reset(false, flag)
    expect(deref(result)).toBeInstanceOf(Text)
  })
  it('should clean up the unused cell', () => {
    const flag = cell<boolean>(true)
    const c = div([])
    const result = renderIf(flag, () => c)
    expect(deref(result)).toBeInstanceOf(HTMLDivElement)
    expect(isDestroyed(c)).toBeFalsy()
    reset(false, flag)
    expect(deref(result)).toBeInstanceOf(Text)
    expect(isDestroyed(c)).toBeTruthy()
  })
  it('should not call function until flag is truthy', () => {
    const flag = cell<boolean>(false)
    const fn = jest.fn(() => div([]))
    renderIf(flag, fn)
    expect(fn).not.toBeCalled()
    reset(true, flag)
    expect(fn).toBeCalled()
  })
})

describe('renderList', () => {
  it('should create a cell of list', () => {
    const list = cell<string[]>(['a', 'aa', 'aaa'])
    const fn = jest.fn(s => s.length)
    const result = renderList(fn, list)
    expect(fn).toBeCalledTimes(3)
    expect(deref(result)).toHaveLength(3)
  })
})
