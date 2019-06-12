import {createRef, Ref, RefObject} from 'react'
import composeRefs from '~/composeRefs'

describe('composeRefs', () => {
  it('should correctly combine nulls into null', () => {
    expect(composeRefs(null, null)).toBeNull()
    expect(composeRefs(null, null, null)).toBeNull()
    expect(composeRefs(null, null, null, null, null)).toBeNull()
  })

  it('should correctly combine and cache ref objects', () => {
    const firstRefs: [Ref<unknown>, Ref<unknown>] = [
      createRef(),
      createRef(),
    ]
    const secondRefs: [Ref<unknown>, Ref<unknown>, Ref<unknown>, Ref<unknown>] = [
      createRef(),
      createRef(),
      createRef(),
      createRef(),
    ]
    const firstRef = composeRefs(...firstRefs)
    const secondRef = composeRefs(...secondRefs)
    expect(typeof firstRef).toBe('function')
    expect(typeof secondRef).toBe('function')
    const firstValue = Object.freeze({})
    const secondValue = Object.freeze({})
    {
      (firstRef as any)(firstValue)
    }
    {
      (secondRef as any)(secondValue)
    }
    for (const ref of firstRefs) {
      expect((ref as RefObject<unknown>).current).toBe(firstValue)
    }
    for (const ref of secondRefs) {
      expect((ref as RefObject<unknown>).current).toBe(secondValue)
    }

    expect(composeRefs(...firstRefs)).toBe(firstRef)
    expect(composeRefs(...secondRefs)).toBe(secondRef)
  })

  it('should correctly combine and cache ref callbacks', () => {})

  it('should update the refs in the correct order', () => {})

  it('should correctly combine anc cache combinations of ref objects, callbacks, and nulls', () => {})
})
