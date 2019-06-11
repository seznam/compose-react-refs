import {MutableRefObject, Ref} from 'react'

export default function composeRefs<T>(...refs: [Ref<T>, Ref<T>, ...Array<Ref<T>>]): Ref<T> {
  if (refs.length === 2) { // micro-optimize the hot path
    return composeTwoRefs(refs[0], refs[1])
  }

  return refs.slice(1).reduce(
    (semiCombinedRef: Ref<T>, refToInclude: Ref<T>) => composeTwoRefs(semiCombinedRef, refToInclude),
    refs[0],
  )
}

type NonNullRef<T> = NonNullable<Ref<T>>
const composedRefCache = new WeakMap<NonNullRef<unknown>, WeakMap<NonNullRef<unknown>, NonNullRef<unknown>>>()

function composeTwoRefs<T>(ref1: Ref<T>, ref2: Ref<T>): Ref<T> {
  if (ref1 && ref2) {
    const ref1Cache = composedRefCache.get(ref1) || new WeakMap<NonNullRef<unknown>, NonNullRef<unknown>>()
    composedRefCache.set(ref1, ref1Cache)

    const composedRef = ref1Cache.get(ref2) || ((instance: T): void => {
      updateRef(ref1, instance)
      updateRef(ref2, instance)
    })
    ref1Cache.set(ref2, composedRef)

    return composedRef as NonNullRef<T>
  }

  if (!ref1) {
    return ref2
  } else {
    return ref1
  }
}

function updateRef<T>(ref: NonNullRef<T>, instance: null | T): void {
  if (typeof ref === 'function') {
    ref(instance)
  } else {
    (ref as MutableRefObject<T | null>).current = instance
  }
}
