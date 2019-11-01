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

  it('should correctly combine and cache ref callbacks', () => {
    const firstRefs: [Ref<unknown>, Ref<unknown>] = [
      jest.fn(),
      jest.fn(),
    ]
    const secondRefs: [Ref<unknown>, Ref<unknown>, Ref<unknown>, Ref<unknown>] = [
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
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
      expect(ref).toHaveBeenCalledTimes(1)
      expect(ref).toHaveBeenCalledWith(firstValue)
    }
    for (const ref of secondRefs) {
      expect(ref).toHaveBeenCalledTimes(1)
      expect(ref).toHaveBeenCalledWith(secondValue)
    }

    expect(composeRefs(...firstRefs)).toBe(firstRef)
    expect(composeRefs(...secondRefs)).toBe(secondRef)
  })

  it('should update the refs in the correct order', () => {
    const value = Object.freeze({})
    const refs: [Ref<unknown>, Ref<unknown>, ...Array<Ref<unknown>>] = [
      jest.fn(() => {
        expect((refs[1] as RefObject<unknown>).current).toBeNull()
        expect(refs[2]).not.toHaveBeenCalled()
        expect(refs[3]).not.toHaveBeenCalled()
        expect((refs[4] as RefObject<unknown>).current).toBeNull()
      }),
      createRef(),
      jest.fn(() => {
        expect(refs[0]).toHaveBeenCalledTimes(1)
        expect(refs[0]).toHaveBeenCalledWith(value)
        expect((refs[1] as RefObject<unknown>).current).toBe(value)
        expect(refs[3]).not.toHaveBeenCalled()
        expect((refs[4] as RefObject<unknown>).current).toBeNull()
      }),
      jest.fn(() => {
        expect(refs[0]).toHaveBeenCalledTimes(1)
        expect(refs[0]).toHaveBeenCalledWith(value)
        expect((refs[1] as RefObject<unknown>).current).toBe(value)
        expect(refs[2]).toHaveBeenCalledTimes(1)
        expect(refs[2]).toHaveBeenCalledWith(value)
        expect((refs[4] as RefObject<unknown>).current).toBeNull()
      }),
      createRef(),
    ]
    const composedRef = composeRefs(...refs) as (instance: unknown) => void
    composedRef(value)
    expect((refs[4] as RefObject<unknown>).current).toBe(value)
  })

  it('should return the only non-null ref in an array of otherwise null refs', () => {
    const nonNullRef = createRef()
    expect(composeRefs(null, nonNullRef, null, null)).toBe(nonNullRef)

    const nonNullRefCallback = jest.fn()
    expect(composeRefs(null, nonNullRefCallback)).toBe(nonNullRefCallback)
    expect(composeRefs(nonNullRefCallback, null)).toBe(nonNullRefCallback)
  })

  it('should correctly combine and cache combinations of ref objects, callbacks, and nulls', () => {
    const refs: [Ref<unknown>, Ref<unknown>, ...Array<Ref<unknown>>] = [
      jest.fn(),
      null,
      createRef(),
      jest.fn(),
      null,
      null,
      jest.fn(),
    ]
    const combinedRef = composeRefs(...refs) as (instance: unknown) => void
    expect(composeRefs(...refs)).toBe(combinedRef)
    const value = Object.freeze({})
    combinedRef(value)
    const lastRef = refs[refs.length - 1]
    expect(lastRef).toHaveBeenCalledTimes(1)
    expect(lastRef).toHaveBeenCalledWith(value)
  })

  it('should micro-optimize composing only two refs', () => {
    jest.spyOn(Array.prototype, 'reduce' as any).mockImplementation(() => {
      throw new Error('This should have been micro-optimized')
    })

    composeRefs(createRef(), createRef())
    composeRefs(createRef(), jest.fn())
    composeRefs(null, jest.fn())
    composeRefs(null, null)
  })

  it('should accept undefined as refs as well an return a null', () => {
    expect(composeRefs(undefined, undefined)).toBeNull()
    expect(composeRefs(undefined, undefined, undefined)).toBeNull()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
})
