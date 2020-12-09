/**
 * @fileoverview This module includes helpers to work with HTML elements.
 *
 * Example usage:
 * @example
 * div([
 *     className('hello-there'),
 *     children([
 *         div([className('just-a-div')]),
 *         span([className('just-a-span')]),
 *     ]),
 * ])
 */
import { Value, isCell, history, formula } from './Cell'

/**
 * Property is just a mutable transformation over HTMLElement
 * This property doesn't have any relationships with HTML properties,
 * it can set HTML attribute, property, attach handler or do any other
 * sort of effects
 */
export type Property<T extends HTMLElement> = (element: T) => void

// -- Property constructors --

const createBooleanProperty = (attrName: string, truthyValue: string) => (
    truthy: Value<boolean>
) => (element: HTMLElement) => {
    formula(isSelected => {
        if (isSelected) {
            element.setAttribute(attrName, truthyValue)
        } else {
            element.removeAttribute(attrName)
        }
    }, truthy)
}

const createStringAttr = (attrName: string) => (value: Value<string>) => (
    element: HTMLElement
) => formula(value => element.setAttribute(attrName, value), value)

const createProperty = <T extends HTMLElement, K extends keyof T>(propName: K) => (value: Value<T[K]>) => (
    element: T
) => formula(value => element[propName] = value, value)

// -- Some useful properties --

export const className = (name: Value<string>) => (element: HTMLElement) =>
    formula(name => (element.className = name), name)

export const classList = (classes: { [key: string]: Value<boolean> }) => (
    element: HTMLElement
) => {
    for (let [name, val] of Object.entries(classes)) {
        formula(value => {
            if (value) {
                element.classList.add(name)
            } else {
                element.classList.remove(name)
            }
        }, val)
    }
}

export const muted: (
    isMuted: Value<boolean>
) => Property<HTMLVideoElement> = isMuted => element => {
    formula(isMuted => {
        if (isMuted) {
            element.setAttribute('muted', '')
            element.muted = true
        } else {
            element.removeAttribute('muted')
            element.muted = false
        }
    }, isMuted)
}

export const autoplay: (
    shouldAutoplay: Value<boolean>
) => Property<HTMLVideoElement> = createBooleanProperty('autoplay', '')

export const playsinline: (
    truthy: Value<boolean>
) => Property<HTMLVideoElement> = createBooleanProperty('playsinline', '')

export const testId: (
    id: Value<string>
) => Property<HTMLElement> = createStringAttr('data-testid')

export const id: (
    val: Value<string>
) => Property<HTMLElement> = createStringAttr('id')

export const hide: (
    shouldBeHidden: Value<boolean>
) => Property<HTMLElement> = shouldBeHidden => element => {
    formula(shouldBeHidden => {
        if (shouldBeHidden) {
            element.classList.add('hide')
        } else {
            element.classList.remove('hide')
        }
    }, shouldBeHidden)
}

// TODO: create enumeration for possible values
export const inputType: (val: Value<string>) => Property<HTMLInputElement> =
    createProperty('type')

export const onSelect: (value: Value<((ev: Event) => any) | null>) => Property<HTMLInputElement> =
    createProperty('onselect')

export const selected: (
    isSelected: Value<boolean>
) => Property<HTMLOptionElement> = createBooleanProperty('selected', '')

export const checked: (
    isChecked: Value<boolean>
) => Property<HTMLInputElement> = createBooleanProperty('checked', '')

export const onClick: (
    fn: Value<() => void>
) => Property<HTMLElement> = fn => element =>
    formula(fn => (element.onclick = fn), fn)

export const onChange: (
    fn: Value<(evt: Event) => void>
) => Property<
    HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
> = fn => element => formula(fn => (element.onchange = fn), fn)

export function children<T extends Node>(
    chld: Value<Array<Value<T>>>
): Property<HTMLElement> {
    return element => {
        formula(chld => {
            // TODO: this property is not efficient
            while (element.lastChild) {
                element.removeChild(element.lastChild)
            }
            for (let child of chld) {
                if (isCell(child)) {
                    formula(([newChild, oldChild]: [T, T | undefined]) => {
                        if (!oldChild) {
                            formula(newChild => element.appendChild(newChild), newChild)
                        } else {
                            formula((newChild, oldChild) => element.replaceChild(newChild, oldChild), newChild, oldChild)
                        }
                    }, history(child))
                } else {
                    element.appendChild(child)
                }
            }
        }, chld)
    }
}

export const srcObject: (
    value: Value<MediaStream | undefined>
) => Property<HTMLVideoElement> = value => element => {
    formula(value => (element.srcObject = value ?? null), value)
}

export const value: (
    val: Value<string | undefined>
) => Property<
    | HTMLSelectElement
    | HTMLOptionElement
    | HTMLInputElement
    | HTMLTextAreaElement
> = val => element =>
    formula(val => {
        if (val) {
            element.value = val
        } else {
            element.value = ''
        }
    }, val)

export const text: (
    innerText: Value<string>
) => Property<HTMLElement> = innerText => element =>
    formula(innerText => (element.innerText = innerText), innerText)
