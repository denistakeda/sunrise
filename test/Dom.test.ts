import { div, renderIf } from '../src/Dom'
import { cell, deref, reset } from '../src/Cell'

describe('renderIf', () => {
    it('should render an empty element if flag is falsey', () => {
        const result = renderIf(cell<boolean>(false), div([]))
        expect(deref(result)).toBeInstanceOf(Text)
    })
    it('should render and element if flag is truthy', () => {
        const result = renderIf(cell<boolean>(true), div([]))
        expect(deref(result)).toBeInstanceOf(HTMLDivElement)
    })
    it('shold change the value when flag is changed', () => {
        const flag = cell<boolean>(false)
        const result = renderIf(flag, div([]))
        expect(deref(result)).toBeInstanceOf(Text)
        reset(true, flag)
        expect(deref(result)).toBeInstanceOf(HTMLDivElement)
        reset(false, flag)
        expect(deref(result)).toBeInstanceOf(Text)
    })
})
