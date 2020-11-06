import * as Cell from '../src/Cell'

const isEven = (x: number) => x % 2 === 0
const inc = (x: number) => x + 1
const asyncInc = async (x: number) => inc(x)

describe('SourceCell', () => {
  it('should include initial value and and empty list of subscriptions', () => {
    const seed = 1
    const cell = Cell.cell(seed)
    expect(cell.value).toBe(seed)
    expect(cell.subs).toBeInstanceOf(Array)
    expect(cell.subs).toHaveLength(0)
  })

  it('shold deref to the seeded value', () => {
    const seed = 1
    const cell = Cell.cell(seed)
    expect(Cell.deref(cell)).toBe(seed)
  })

  it('subscribe should add a subscription to the list', () => {
    const cell = Cell.cell(1)
    const subscription = jest.fn()
    expect(cell.subs).toHaveLength(0)
    Cell.subscribe(subscription, cell)
    expect(cell.subs).toHaveLength(1)
    expect(subscription).not.toBeCalled()
  })

  describe('reset', () => {
    const initialValue = 1
    const newValue = 2
    let cell: Cell.SourceCell<number>
    let subscription: Cell.Subscription<number>

    describe('sync mode', () => {
      beforeEach(() => {
        cell = Cell.cell(initialValue)
        subscription = jest.fn()
        Cell.subscribe(subscription, cell)
      })

      it('should syncronously reset to a new value', () => {
        Cell.reset(newValue, cell)
        expect(Cell.deref(cell)).toBe(newValue)
      })

      it('should notify subscribers', () => {
        Cell.reset(newValue, cell)
        expect(subscription).toBeCalledWith(newValue)
      })

      it('should return nothing', () => {
        expect(Cell.reset(newValue, cell)).toBeUndefined()
      })
    })

    describe('async mode', () => {
      beforeEach(async () => {
        cell = Cell.cell(initialValue)
        subscription = jest.fn(() => Promise.resolve())
        Cell.subscribe(subscription, cell)
      })

      it('should asyncronously reset to a new value', async () => {
        await Cell.reset(newValue, cell)
        expect(Cell.deref(cell)).toBe(newValue)
      })

      it('should asyncronously notify subscribers', async () => {
        await Cell.reset(newValue, cell)
        expect(subscription).toBeCalledWith(newValue)
      })

      it('should return a promise', () => {
        expect(Cell.reset(newValue, cell)).toBeInstanceOf(Promise)
      })
    })
  })

  describe('swap', () => {
    const initialValue = 1
    let cell: Cell.SourceCell<number>
    let subscription1: Cell.Subscription<number>
    let subscription2: Cell.Subscription<number>

    describe('sync mode', () => {
      beforeEach(() => {
        cell = Cell.cell(initialValue)
        subscription1 = jest.fn()
        subscription2 = jest.fn()
        Cell.subscribe(subscription1, cell)
        Cell.subscribe(subscription2, cell)
      })

      it('should swap to a new value', () => {
        Cell.swap(inc, cell)
        expect(Cell.deref(cell)).toBe(initialValue + 1)
      })

      it('should notify subscribers', () => {
        const expectedValue = initialValue + 1
        Cell.swap(inc, cell)
        expect(subscription1).toBeCalledWith(expectedValue)
        expect(subscription2).toBeCalledWith(expectedValue)
      })

      it('should return nothing', () => {
        expect(Cell.swap(inc, cell)).toBeUndefined()
      })

      it('update function should be called with additional parameters if provided', () => {
        const update = jest.fn(inc)
        Cell.swap(update, cell, 1, 2, 3)
        expect(update).toBeCalledWith(initialValue, 1, 2, 3)
      })
    })

    describe('async mode', () => {
      beforeEach(() => {
        cell = Cell.cell(initialValue)
        subscription1 = jest.fn(() => Promise.resolve())
        subscription2 = jest.fn()
        Cell.subscribe(subscription1, cell)
        Cell.subscribe(subscription2, cell)
      })

      it('shoud swap asyncronously to a new value', async () => {
        await Cell.swap(asyncInc, cell)
        expect(Cell.deref(cell)).toBe(initialValue + 1)
      })

      it('should asyncronously notify subscribers', async () => {
        const expectedValue = initialValue + 1
        await Cell.swap(asyncInc, cell)
        expect(subscription1).toBeCalledWith(expectedValue)
        expect(subscription2).toBeCalledWith(expectedValue)
      })

      it('should return a Promise', async () => {
        expect(Cell.swap(asyncInc, cell)).toBeInstanceOf(Promise)
      })

      it('update function should be called with additional parameters if provided', async () => {
        const update = jest.fn(asyncInc)
        await Cell.swap(update, cell, 1, 2, 3)
        expect(update).toBeCalledWith(initialValue, 1, 2, 3)
      })
    })
  })
})

describe('CalculatedCell', () => {
  it('formula function should be called once initially', () => {
    const formula = jest.fn(x => x + 1)
    const sourceCell = Cell.cell(1)
    const calculatedCell = Cell.map(formula, sourceCell)
    expect(formula).toBeCalledTimes(1)
  })

  it('history cell', () => {
    const source = Cell.cell(1)
    const history = Cell.history(source)
    expect(Cell.deref(history)).toStrictEqual([1, undefined])
    Cell.reset(2, source)
    expect(Cell.deref(history)).toStrictEqual([2, 1])
    Cell.reset(3, source)
    expect(Cell.deref(history)).toStrictEqual([3, 2])
    Cell.swap(x => x + 1, source)
    expect(Cell.deref(history)).toStrictEqual([4, 3])
  })

  describe('filter cell', () => {
    it('should set the initial value if predicate failed initally', () => {
      const source = Cell.cell(1)
      const cell = Cell.filter(isEven, 0, source)
      expect(Cell.deref(cell)).toBe(0)
      Cell.reset(2, source)
      expect(Cell.deref(cell)).toBe(2)
    })

    it('should filter values', () => {
      const source = Cell.cell(2)
      const cell = Cell.filter(isEven, 1, source)
      expect(Cell.deref(cell)).toBe(2)
      Cell.reset(3, source)
      expect(Cell.deref(cell)).toBe(2)
      Cell.reset(4, source)
      expect(Cell.deref(cell)).toBe(4)
    })

    it('should trigger the subscriptions as many times as predicate is passed', () => {
      const source = Cell.cell(1)
      const cell = Cell.filter(isEven, 0, source)
      const subscription = jest.fn()
      Cell.subscribe(subscription, cell)
      expect(subscription).not.toBeCalled()
      Cell.reset(2, source)
      expect(subscription).toBeCalledTimes(1)
      Cell.reset(3, source)
      expect(subscription).toBeCalledTimes(1)
      Cell.reset(4, source)
      expect(subscription).toBeCalledTimes(2)
    })

    it('should trigger the predicate with old value', () => {
      const isEqual = jest.fn((newVal, oldVal) => newVal === oldVal)
      const source = Cell.cell(1)
      const cell = Cell.filter(isEqual, 0, source)
      expect(isEqual).toBeCalledWith(1, 0)
      Cell.reset(2, source)
      expect(isEqual).lastCalledWith(2, 1)
    })
  })
})
