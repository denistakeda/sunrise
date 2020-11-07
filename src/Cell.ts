// -- Constants --

const SOURCE_CELL = 'source-cell'
const FORMULA_CELL = 'formula-cell'

// -- Maind Definitions --

export type Cell<T> = SourceCell<T> | FormulaCell<T>
export type Value<T> = T | Cell<T>

export function isCell<T>(val: Value<T>): val is Cell<T> {
  return (
    val instanceof Object &&
    'kind' in val &&
    (val.kind === SOURCE_CELL || val.kind === FORMULA_CELL)
  )
}

// -- Deref --

interface Dereferencable<T> {
  val: T
  destroyed?: boolean
}

export function deref<T>(x: T | Dereferencable<T>): T {
  if (x instanceof Object && x.hasOwnProperty('val')) {
    if (x.destroyed) throw new Error('Impossible to deref a destroyed cell')
    return x.val
  } else {
    return x as T
  }
}

// -- Subscriptions --

interface Subscribable<T> extends Dereferencable<T> {
  readonly subs: Set<FormulaCell<any>>
}

function subscribe<T>(sub: FormulaCell<any>, target: Subscribable<T>): void {
  target.subs.add(sub)
}

function unsubscribe<T>(sub: FormulaCell<any>, target: Subscribable<T>): void {
  target.subs.delete(sub)
}

function notify<T>(target: Subscribable<T>): void {
  target.subs.forEach(recalculate)
}

// -- Source Cell --

export interface SourceCell<T> extends Subscribable<T> {
  readonly kind: typeof SOURCE_CELL
}

export function cell<T>(val: T): SourceCell<T> {
  return { kind: SOURCE_CELL, val, subs: new Set() }
}

export function reset<T>(newVal: T, sc: SourceCell<T>): void {
  if (sc.val === newVal) return
  sc.val = newVal
  notify(sc)
}

type Arr = readonly unknown[]

export function swap<T, S extends Arr>(
  f: (...args: [T, ...S]) => T,
  sc: SourceCell<T>,
  ...args: [...S]
): void {
  reset(f(deref(sc), ...args), sc)
}

// -- Formula Cell --

export interface FormulaCell<T> extends Subscribable<T> {
  readonly kind: typeof FORMULA_CELL
  readonly sources: Cell<any>[]
  readonly formula: Function
}

function recalculate<T>(fc: FormulaCell<T>): void {
  const oldVal = fc.val
  fc.val = fc.formula(...fc.sources.map(deref))
  if (fc.val === oldVal) return
  notify(fc)
}

export function formula<F1, T>(fn: (val1: F1) => T, input1: Value<F1>): FormulaCell<T>
export function formula<F1, F2, T>(
  fn: (val1: F1, val2: F2) => T,
  input1: Value<F1>,
  input2: Value<F2>
): FormulaCell<T>
export function formula<F1, F2, F3, T>(
  fn: (val1: F1, val2: F2, val3: F3) => T,
  input1: Value<F1>,
  input2: Value<F2>,
  input3: Value<F3>
): FormulaCell<T>
export function formula<F1, F2, F3, F4, T>(
  fn: (val1: F1, val2: F2, val3: F3, val4: F4) => T,
  input1: Value<F1>,
  input2: Value<F2>,
  input3: Value<F3>,
  input4: Value<F4>
): FormulaCell<T>
export function formula<F1, F2, F3, F4, F5, T>(
  fn: (val1: F1, val2: F2, val3: F3, val4: F4, val5: F5) => T,
  input1: Value<F1>,
  input2: Value<F2>,
  input3: Value<F3>,
  input4: Value<F4>,
  input5: Value<F4>
): FormulaCell<T>
export function formula<T>(fn: Function, ...sources: Value<any>[]): FormulaCell<T> {
  const fc: FormulaCell<T> = {
    kind: FORMULA_CELL,
    sources,
    formula: fn,
    subs: new Set<FormulaCell<T>>(),
    val: fn(...sources.map(deref)),
  }
  for (let source of sources) if (isCell(source)) subscribe(fc, source)

  return fc
}

// -- Destruction --

export function destroy<T>(cell: Cell<T>): void {
  cell.subs.forEach(destroy)
  cell.subs.clear()
  if (cell.kind === FORMULA_CELL) {
    cell.sources.forEach((source) => unsubscribe(cell, source))
    cell.sources.length = 0
  }
  cell.destroyed = true
}

export function isDestroyed<T>(cell: Cell<T>): boolean {
  return !!cell.destroyed
}

// -- Some helpful formula cells --

/**
 * Accepts a cell and creates a cell of tuple [newValue, oldValue]
 * initially oldValue is undefined
 */
export function history<T>(cell: Cell<T>): FormulaCell<[T, T | undefined]> {
  let oldVal: T | undefined = undefined
  return formula((newVal) => {
    const result: [T, T | undefined] = [newVal, oldVal]
    oldVal = newVal
    return result
  }, cell)
}

/**
 * Accepts a field name and a cell a record and creates a new cell
 * that represents a single field of the source cell
 */
export function field<F, K extends keyof F>(fieldName: K, fromCell: Cell<F>): FormulaCell<F[K]> {
  return formula((fromVal) => fromVal[fieldName], fromCell)
}

export function byIndex<T>(index: number, source: Cell<T[]>): FormulaCell<T | undefined> {
  return formula((fromVal) => fromVal[index], source)
}
