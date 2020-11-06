// -- Constants --

const SOURCE_CELL = 'source-cell'
const CALCULATED_CELL = 'calculated-cell'

// -- Deref --

export interface Dereferencable<T> {
  value: T
}

export function deref<T>(value: Dereferencable<T>) {
  return value.value
}

// -- Subscriptions --

export interface Subscribable<T> extends Dereferencable<T> {
  subs: Array<Subscription<T>>
}

export type SyncSubscription<T> = (value: T) => any
export type AsyncSubscription<T> = (value: T) => Promise<any>
export type Subscription<T> = SyncSubscription<T> | AsyncSubscription<T>

export function subscribe<T>(sub: Subscription<T>, cell: Subscribable<T>): Subscription<T> {
  cell.subs.push(sub)
  return sub
}

export function unsubscibe<T>(sub: Subscription<T>, cell: Subscribable<T>): void {
  cell.subs = cell.subs.filter(s => s !== sub)
}

function notifySubscribers<T>(cell: Subscribable<T>): void | Promise<void> {
  return doMany(cell.subs.map(fn => fn(cell.value)))
}

// -- Source Cell --

export interface SourceCell<T> extends Subscribable<T> {
  readonly kind: typeof SOURCE_CELL
}

export function cell<T>(value: T): SourceCell<T> {
  return { kind: SOURCE_CELL, value, subs: [] }
}

export function reset<T>(newVal: T, cell: SourceCell<T>): void | Promise<void> {
  cell.value = newVal
  return notifySubscribers(cell)
}

export function swap<T>(
  fn: (oldVal: T) => T | Promise<T>,
  cell: SourceCell<T>
): void | Promise<void>
export function swap<T, P1>(
  fn: (oldVal: T, p1: P1) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1
): void | Promise<void>
export function swap<T, P1, P2>(
  fn: (oldVal: T, p1: P1, p2: P2) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1,
  p2: P2
): void | Promise<void>
export function swap<T, P1, P2, P3>(
  fn: (oldVal: T, p1: P1, p2: P2, p3: P3) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1,
  p2: P2,
  p3: P3
): void | Promise<void>
export function swap<T, P1, P2, P3, P4>(
  fn: (oldVal: T, p1: P1, p2: P2, p3: P3, p4: P4) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4
): void | Promise<void>
export function swap<T, P1, P2, P3, P4, P5>(
  fn: (oldVal: T, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4,
  p5: P5
): void | Promise<void>
export function swap<T, P1, P2, P3, P4, P5, P6>(
  fn: (oldVal: T, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4,
  p5: P5,
  p6: P6
): void | Promise<void>
export function swap<T, P1, P2, P3, P4, P5, P6, P7>(
  fn: (oldVal: T, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4,
  p5: P5,
  p6: P6,
  p7: P7
): void | Promise<void>
export function swap<T, P1, P2, P3, P4, P5, P6, P7, P8>(
  fn: (oldVal: T, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4,
  p5: P5,
  p6: P6,
  p7: P7,
  p8: P8
): void | Promise<void>
export function swap<T, P1, P2, P3, P4, P5, P6, P7, P8, P9>(
  fn: (
    oldVal: T,
    p1: P1,
    p2: P2,
    p3: P3,
    p4: P4,
    p5: P5,
    p6: P6,
    p7: P7,
    p8: P8,
    p9: P9
  ) => T | Promise<T>,
  cell: SourceCell<T>,
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4,
  p5: P5,
  p6: P6,
  p7: P7,
  p8: P8,
  p9: P9
): void | Promise<void>
export function swap<T>(fn: Function, cell: SourceCell<T>, ...params: any[]): void | Promise<void> {
  const result = fn.apply(null, [deref(cell), ...params])
  if (result instanceof Promise) {
    return result.then(result => {
      cell.value = result
      return notifySubscribers(cell)
    })
  } else {
    cell.value = result
    return notifySubscribers(cell)
  }
}

// -- Utils --

function doMany(actions: (any | Promise<any>)[]): void | Promise<void> {
  if (actions.some(action => action instanceof Promise)) {
    return Promise.all(actions).then(() => {})
  }
}
// -- CalculatedCell --

export interface CalculatedCell<T> extends Subscribable<T>, Dereferencable<T> {
  kind: typeof CALCULATED_CELL
}

/*
 * The function is complex as well as it's types.
 * Unfortunately this is the only way to write such a function
 * of multiple arieties in TS while keeping the client's types
 * in order. See https://www.typescriptlang.org/docs/handbook/functions.html#overloads
 */
export function map<F1, T>(fn: (val1: F1) => T, input1: Cell<F1>): CalculatedCell<T>
export function map<F1, F2, T>(
  fn: (val1: F1, val2: F2) => T,
  input1: Cell<F1>,
  input2: Cell<F2>
): CalculatedCell<T>
export function map<F1, F2, F3, T>(
  fn: (val1: F1, val2: F2, val3: F3) => T,
  input1: Cell<F1>,
  input2: Cell<F2>,
  input3: Cell<F3>
): CalculatedCell<T>
export function map<F1, F2, F3, F4, T>(
  fn: (val1: F1, val2: F2, val3: F3, val4: F4) => T,
  input1: Cell<F1>,
  input2: Cell<F2>,
  input3: Cell<F3>,
  input4: Cell<F4>
): CalculatedCell<T>
export function map<T>(fn: Function, ...cells: Cell<any>[]): CalculatedCell<T> {
  const result: CalculatedCell<T> = {
    kind: CALCULATED_CELL,
    value: fn(...cells.map(deref)),
    subs: []
  }
  const update = (_: any) => {
    const values = cells.map(deref)
    const newValue = fn(...values)
    result.value = newValue
    for (let sub of result.subs) {
      sub(result.value)
    }
  }
  for (let c of cells) {
    subscribe(update, c)
  }

  return result
}

export function field<F, K extends keyof F>(fieldName: K, fromCell: Cell<F>): CalculatedCell<F[K]> {
  return map(fromVal => fromVal[fieldName], fromCell)
}

/**
 * Accepts a cell and creates a cell of tuple [newValue, oldValue]
 * initially oldValue is undefined
 */
export function history<T>(cell: Cell<T>): CalculatedCell<[T, T | undefined]> {
  let oldVal: T | undefined = undefined
  return map(newVal => {
    const result: [T, T | undefined] = [newVal, oldVal]
    oldVal = newVal
    return result
  }, cell)
}

export function filter<T>(
  predicate: (newVal: T, oldVal: T) => boolean,
  initialValue: T,
  cell: Cell<T>
): CalculatedCell<T> {
  const result: CalculatedCell<T> = {
    kind: CALCULATED_CELL,
    value: initialValue,
    subs: []
  }
  let oldVal = initialValue
  const update = (newVal: T) => {
    const shouldUpdate = predicate(newVal, oldVal)
    oldVal = newVal
    if (!shouldUpdate) return
    result.value = newVal
    for (let sub of result.subs) {
      sub(newVal)
    }
  }
  subscribe(update, cell)
  update(deref(cell))
  return result
}

// -- Value --

export type Cell<T> = SourceCell<T> | CalculatedCell<T>
export type Value<T> = T | Cell<T>

export function isCell<T>(val: Value<T>): val is Cell<T> {
  return (
    val instanceof Object &&
    'kind' in val &&
    (val.kind === SOURCE_CELL || val.kind === CALCULATED_CELL)
  )
}

export function doWith<T>(fn: (val: T) => void, val: Value<T>): void {
  if (isCell(val)) {
    subscribe(fn, val)
    fn(deref(val))
  } else {
    fn(val)
  }
}
