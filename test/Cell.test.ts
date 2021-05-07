import {
  cell,
  deref,
  formula,
  destroy,
  isCell,
  reset,
  swap,
  isDestroyed,
  history,
  field,
  byIndex,
} from '../src/Cell'

// @ts-ignore
window.setImmediate = (fn: Function) => fn()

const inc = (x: number) => x + 1
const sum = (...nums: number[]) => nums.reduce((x: number, y: number) => x + y, 0)
const identity = <T>(x: T) => x
const not = (x: boolean) => !x

function mockFn<T>(fn: (...oldVals: T[]) => T) {
  let counter = 0
  const map: Map<number, () => void> = new Map()

  const result = (...oldVals: T[]) => {
    counter++
    const resolve = map.get(counter)
    if (resolve) resolve()
    map.delete(counter)
    return fn(...oldVals)
  }

  result.expectToBeCalledTimes = (times: number) => {
    if (times === counter) return Promise.resolve()
    if (counter > times) return Promise.reject(`Called ${counter} times, expected to be called ${times} times`)
    const promise = new Promise(resolve => map.set(times, resolve as () => void))
    return promise
  }

  return result
}

describe('deref', () => {
  it('should deref a souce cell', () => {
    const sc = cell<number>(1)
    expect(deref(sc)).toBe(1)
  })

  it('should deref a formula cell', () => {
    const sc = cell<number>(1)
    const fc = formula(inc, sc)
    expect(deref(fc)).toBe(2)
  })

  it('should deref any value', () => {
    const x = 1
    expect(deref(x)).toBe(x)
  })

  it('should throw an error if cell was destroyed', () => {
    const x = cell<number>(1)
    destroy(x)
    expect(() => deref(x)).toThrowError()
  })
})

describe('SourceCell', () => {
  it('should be constructabe', () => {
    const x = cell<number>(1)
    expect(isCell(x)).toBeTruthy()
  })

  it('should be resetable', () => {
    const x = cell<number>(1)
    expect(deref(x)).toBe(1)
    reset(2, x)
    expect(deref(x)).toBe(2)
  })

  it('should be swapable', async () => {
    const x = cell<number>(1)
    expect(deref(x)).toBe(1)
    const fn = mockFn(inc)
    swap(fn, x)
    await fn.expectToBeCalledTimes(1)
    expect(deref(x)).toBe(2)
  })

  // TODO: add tests for STM
})

describe('FormulaCell', () => {
  it('should be constructable', () => {
    const x = cell<number>(1)
    const y = formula(inc, x)
    expect(deref(y)).toBe(2)
  })

  it('should be updated if source value is changed', () => {
    const x = cell<number>(1)
    const y = formula(inc, x)
    reset(2, x)
    expect(deref(y)).toBe(3)
  })

  it('should be updated only when source value was changed', async () => {
    const x = cell<number>(1)
    const fn = mockFn(inc)
    const y = formula(fn, x)
    await fn.expectToBeCalledTimes(1)
    reset(1, x)
    await fn.expectToBeCalledTimes(1)
    swap(identity, x)
    await fn.expectToBeCalledTimes(1)

    reset(2, x)
    await fn.expectToBeCalledTimes(2)
    swap(inc, x)
    await fn.expectToBeCalledTimes(3)
  })

  it('multiple sources', async () => {
    const x = cell<number>(1)
    const y = cell<number>(2)
    const fn = mockFn(sum)
    const z = formula(fn, x, y)
    await fn.expectToBeCalledTimes(1)
    expect(deref(z)).toBe(3)
    swap(inc, x)
    await fn.expectToBeCalledTimes(2)
    expect(deref(z)).toBe(4)
    swap(inc, y)
    await fn.expectToBeCalledTimes(3)
    expect(deref(z)).toBe(5)
  })

  it('should generate a formula not only from cells', () => {
    const x = cell<number>(1)
    const y = formula(sum, x, 2, 3, 4, 5)
    expect(deref(y)).toBe(15)
  })

  it('should only propagate the event if value is changed', () => {
    const x = cell<number>(1)
    const isEven = jest.fn((x: number) => x % 2 === 0)
    const even = formula(isEven, x)
    const isOdd = jest.fn(not)
    const odd = formula(isOdd, even)

    expect(isEven).toBeCalledTimes(1)
    expect(isOdd).toBeCalledTimes(1)

    reset(3, x)

    expect(isEven).toBeCalledTimes(2)
    expect(isOdd).toBeCalledTimes(1)
  })
})

describe('destruction', () => {
  it('should destroy source cell', () => {
    const x = cell<number>(1)
    destroy(x)
    expect(isDestroyed(x)).toBeTruthy()
  })

  it('should destroy formula cell', () => {
    const x = cell<number>(1)
    const y = formula(inc, x)
    destroy(y)
    expect(isDestroyed(y)).toBeTruthy()
  })

  it('should destroy all dependent cells', () => {
    const x = cell<number>(1)
    const y = formula(inc, x)
    const z = formula(inc, y)
    destroy(x)
    expect(isDestroyed(x))
    expect(isDestroyed(y))
    expect(isDestroyed(z))
  })
})

it('history cell', () => {
  const x = cell(1)
  const y = history(x)
  expect(deref(y)).toStrictEqual([1, undefined])
  reset(2, x)
  expect(deref(y)).toStrictEqual([2, 1])
  reset(3, x)
  expect(deref(y)).toStrictEqual([3, 2])
  swap((x) => x + 1, x)
  expect(deref(y)).toStrictEqual([4, 3])
})

it('field cell', () => {
  const x = cell({ a: 1, b: 2 })
  const a = field('a', x)
  expect(deref(a)).toBe(1)
  swap((x) => ({ ...x, a: 2 }), x)
  expect(deref(a)).toBe(2)
})

it('byIndex cell', () => {
  const x = cell<number[]>([1, 2, 3])
  const i = byIndex<number>(0, x)
  expect(deref(i)).toBe(1)
})
